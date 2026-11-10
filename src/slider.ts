import { html, LitElement, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { DEFAULTS, type ActionConfig, type SliderConfig } from "./config";
import {
	applyKey,
	fillWidth,
	isConfirmed,
	progressFromPointer,
	snapTarget,
	snapZone,
	Spring,
	styleToCustomProperties,
	translateX,
	travelDistance,
	type TrackGeometry,
} from "./logic";
import { themeStyles } from "./styles/themes.css";
import { sliderStyles } from "./styles/slider.css";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";
import { fireEvent } from "./util/fire-event";

/** Springs for `snap` (response s, damping): lock-in, letting go, returning, confirming. */
const SPRING_LOCK = [0.22, 0.45] as const;
const SPRING_UNLOCK = [0.22, 0.95] as const;
const SPRING_RETURN = [0.35, 0.95] as const;
const SPRING_CONFIRM = [0.25, 0.9] as const;
/** How much speed the knob keeps when it hits the end on snapping in. */
const END_STOP_BOUNCE = 0.35;
/** Fired (bubbling, composed) when a slide completes. The card turns it into an HA action. */
export const SLIDE_CONFIRMED_EVENT = "slide-confirmed";

export interface SlideConfirmedDetail {
	action: ActionConfig;
	config: SliderConfig;
}

/**
 * With `reset_delay: 0` the slider waits for the entity to change state. If
 * the action failed and the entity never changes, this cap resets it anyway so
 * it cannot show "Door Unlocked!" forever.
 */
export const ENTITY_RESET_TIMEOUT_MS = 30_000;

/**
 * One slide-to-confirm control. Consumes a *normalized* `SliderConfig`.
 *
 * State is a single `progress` number (0 = rest, 1 = far end); see
 * `logic/geometry.ts`. Layout is only measured when the user starts
 * interacting, so rendering at rest needs no DOM reads.
 */
export class SlideConfirmSlider extends LitElement {
	static styles = [sliderStyles, themeStyles];

	@property({ attribute: false }) config!: SliderConfig;
	@property({ attribute: false }) hass?: HomeAssistant;
	/** Externally forced disabled state, in addition to `disabled_states`. */
	@property({ type: Boolean }) disabled = false;

	@state() private _progress = 0;
	@state() private _dragging = false;
	@state() private _snapped = false;
	/** With `snap`: displayed handle offset in px (may leave 0..travel by a rubber-band give). */
	@state() private _px = 0;
	private _spring?: Spring;
	private _raf?: number;
	private _lastFrame = 0;
	private _grab = 0;
	private _velocity = 0;
	private _lastMove?: { finger: number; time: number };
	/** Track width from the last measure, so render never reads the DOM. */
	private _trackWidth = 0;
	@state() private _confirmed = false;

	@query(".track") private _trackEl!: HTMLElement;
	@query(".handle") private _handleEl!: HTMLElement;

	private _geometry?: TrackGeometry;
	private _pointerId?: number;
	private _resetTimer?: ReturnType<typeof setTimeout>;
	private _stateAtConfirm?: string;

	/** Current progress, 0..1. Read-only; exposed for the card and tests. */
	get progress(): number {
		return this._progress;
	}

	get confirmed(): boolean {
		return this._confirmed;
	}

	/** Disabled by the `disabled` property or by the entity being in a `disabled_states` state. */
	get isDisabled(): boolean {
		if (this.disabled) return true;
		const states = this.config?.disabled_states;
		if (!states || !this.config.entity) return false;
		// A missing entity is treated as unavailable so `disabled_states: [unavailable]` covers it.
		const current = this._stateObj?.state ?? "unavailable";
		return states.includes(current);
	}

	private get _stateObj(): HassEntity | undefined {
		const id = this.config?.entity;
		return id ? this.hass?.states?.[id] : undefined;
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._clearResetTimer();
		this._stopSpring();
	}

	protected override willUpdate(changed: PropertyValues<this>): void {
		// A new config (editor live-edit) starts from rest.
		if (changed.has("config") && changed.get("config") !== undefined) {
			this._reset();
		}
		// reset_delay: 0 waits for the entity to leave the state it had at confirm time.
		if (
			changed.has("hass") &&
			this._confirmed &&
			this.config?.reset_delay === 0 &&
			this._stateAtConfirm !== undefined &&
			this._stateObj?.state !== this._stateAtConfirm
		) {
			this._reset();
		}
	}

	// ---- interaction -------------------------------------------------------

	private _measure(): TrackGeometry {
		const track = this._trackEl.getBoundingClientRect();
		const handle = this._handleEl.getBoundingClientRect();
		// Themes may inset the handle inside the track (`--_inset`).
		const inset = parseFloat(getComputedStyle(this._trackEl).getPropertyValue("--_inset")) || 0;
		this._trackWidth = this._trackEl.clientWidth;
		return {
			trackLeft: track.left + inset,
			trackWidth: track.width - 2 * inset,
			handleWidth: handle.width,
		};
	}

	private _onPointerDown(e: PointerEvent): void {
		if (this.isDisabled || this._confirmed || this._dragging) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		e.preventDefault();
		// preventDefault above also suppresses click-to-focus; keyboard users who click first still expect arrows to work.
		this._handleEl.focus({ preventScroll: true });

		this._geometry = this._measure();
		this._pointerId = e.pointerId;
		try {
			this._handleEl.setPointerCapture(e.pointerId);
		} catch {
			// Synthetic events have no active pointer to capture; moves then
			// have to be delivered to the handle directly.
		}
		this._dragging = true;
		if (this.config.snap) {
			// Grab the handle where it is (even mid-spring) instead of centring it on the finger.
			this._stopSpring();
			this._grab = this._fingerPx(e.clientX) - this._px;
			this._velocity = 0;
			this._lastMove = { finger: this._px, time: e.timeStamp };
			return;
		}
		this._progress = progressFromPointer(e.clientX, this._geometry, this.config.direction);
	}

	private _onPointerMove(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
		if (this.config.snap) {
			this._dragSnap(e);
			return;
		}
		this._progress = progressFromPointer(e.clientX, this._geometry, this.config.direction);
	}

	/** Finger position along the drag axis in px, unclamped, with the handle centred on it. */
	private _fingerPx(clientX: number): number {
		const g = this._geometry!;
		const fromLeft = clientX - g.trackLeft - g.handleWidth / 2;
		return this.config.direction === "rtl" ? travelDistance(g) - fromLeft : fromLeft;
	}

	/**
	 * `snap` drag: the handle tracks the finger 1:1, a magnet near the end pulls it
	 * in and locks it (tick), small pullbacks give like a rubber band, and pulling
	 * further lets go (tick). Lock and release animate with springs.
	 */
	private _dragSnap(e: PointerEvent): void {
		const g = this._geometry!;
		const travel = travelDistance(g);
		const finger = this._fingerPx(e.clientX) - this._grab;
		if (this._lastMove) {
			const dt = (e.timeStamp - this._lastMove.time) / 1000;
			if (dt > 0) {
				const v = (finger - this._lastMove.finger) / dt;
				this._velocity = this._velocity * 0.4 + v * 0.6;
			}
		}
		this._lastMove = { finger, time: e.timeStamp };

		const zone = snapZone(g.handleWidth, this.config.snap_distance);
		const { x, locked } = snapTarget(finger, travel, zone, this._snapped);
		if (locked !== this._snapped) {
			this._snapped = locked;
			// Letting go ticks right away; locking in ticks when the knob hits the end.
			if (!locked) this._haptic("light");
			this._springTo(x, locked ? SPRING_LOCK : SPRING_UNLOCK, this._velocity);
			if (locked) {
				this._addEndStop(travel);
				if (this._spring) this._spring.onWall = () => this._haptic("light");
			}
		} else if (this._spring) {
			this._spring.target = x;
			if (this._spring.wall !== undefined) this._spring.wall = Math.max(travel, x);
		} else {
			this._setPx(x);
		}
	}

	private _setPx(px: number): void {
		this._px = px;
		const travel = this._geometry ? travelDistance(this._geometry) : 0;
		this._progress = travel > 0 ? Math.min(1, Math.max(0, px / travel)) : 0;
	}

	/** Makes the running spring hit the end like a latch instead of sailing past it. */
	private _addEndStop(travel: number): void {
		if (!this._spring) return;
		this._spring.wall = travel;
		this._spring.restitution = END_STOP_BOUNCE;
	}

	private _springTo(
		target: number,
		[response, damping]: readonly [number, number],
		velocity?: number,
	): void {
		const v = velocity ?? this._spring?.velocity ?? 0;
		this._spring = new Spring(this._px, v, target, response, damping);
		if (this._raf === undefined) {
			this._lastFrame = performance.now();
			this._raf = requestAnimationFrame((t) => this._frame(t));
		}
	}

	private _frame(now: number): void {
		this._raf = undefined;
		const spring = this._spring;
		if (!spring) return;
		const dt = Math.min(0.032, Math.max(0, (now - this._lastFrame) / 1000));
		this._lastFrame = now;
		const settled = spring.step(dt);
		this._setPx(spring.position);
		if (settled) {
			this._spring = undefined;
		} else {
			this._raf = requestAnimationFrame((t) => this._frame(t));
		}
	}

	private _stopSpring(): void {
		if (this._raf !== undefined) cancelAnimationFrame(this._raf);
		this._raf = undefined;
		this._spring = undefined;
	}

	private _haptic(type: string): void {
		// HA's own haptic event: the companion app vibrates this device;
		// browsers use navigator.vibrate when the user enabled it (PR #19).
		if (this.config.haptic) fireEvent(window, "haptic", type);
	}

	private _onPointerUp(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
		if (this.config.snap) {
			const locked = this._snapped;
			this._endDrag();
			if (locked) {
				this._confirm();
			} else {
				this._springTo(0, SPRING_RETURN, this._velocity);
			}
			return;
		}
		const progress = progressFromPointer(e.clientX, this._geometry, this.config.direction);
		this._endDrag();
		if (isConfirmed(progress, this._geometry)) {
			this._confirm();
		} else {
			this._progress = 0;
		}
	}

	private _onPointerCancel(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId) return;
		this._endDrag();
		if (this.config.snap) {
			this._springTo(0, SPRING_RETURN);
		} else {
			this._progress = 0;
		}
	}

	private _endDrag(): void {
		this._dragging = false;
		this._snapped = false;
		const id = this._pointerId;
		this._pointerId = undefined;
		if (id !== undefined) {
			try {
				this._handleEl.releasePointerCapture(id);
			} catch {
				// Nothing was captured.
			}
		}
	}

	private _onKeyDown(e: KeyboardEvent): void {
		if (this.isDisabled || this._confirmed) return;
		const next = applyKey(this._progress, e.key, this.config.direction);
		if (next === null) return;
		e.preventDefault();
		this._geometry = this._measure();
		this._progress = next;
		if (this.config.snap) {
			this._stopSpring();
			this._px = next * travelDistance(this._geometry);
		}
		if (next >= 1 && isConfirmed(next, this._geometry)) {
			this._confirm();
		}
	}

	// ---- confirm / reset ----------------------------------------------------

	private _confirm(): void {
		this._progress = 1;
		this._confirmed = true;
		if (this.config.snap && this._geometry) {
			this._springTo(travelDistance(this._geometry), SPRING_CONFIRM);
			this._addEndStop(travelDistance(this._geometry));
		}
		this._stateAtConfirm = this._stateObj?.state;

		fireEvent<SlideConfirmedDetail>(this, SLIDE_CONFIRMED_EVENT, {
			action: this.config.confirm_action,
			config: this.config,
		});
		this._haptic("success");
		this._scheduleReset();
	}

	private _scheduleReset(): void {
		this._clearResetTimer();
		const delay = this.config.reset_delay;
		if (delay > 0) {
			this._resetTimer = setTimeout(() => this._reset(), delay);
		} else if (this.config.entity) {
			this._resetTimer = setTimeout(() => this._reset(), ENTITY_RESET_TIMEOUT_MS);
		} else {
			this._resetTimer = setTimeout(() => this._reset(), DEFAULTS.reset_delay);
		}
	}

	private _clearResetTimer(): void {
		if (this._resetTimer !== undefined) {
			clearTimeout(this._resetTimer);
			this._resetTimer = undefined;
		}
	}

	private _reset(): void {
		this._clearResetTimer();
		this._confirmed = false;
		this._dragging = false;
		this._snapped = false;
		this._pointerId = undefined;
		this._stateAtConfirm = undefined;
		this._progress = 0;
		if (this.config?.snap && this._px !== 0) {
			this._springTo(0, SPRING_RETURN, 0);
		}
	}

	// ---- render -------------------------------------------------------------

	protected override render() {
		const c = this.config;
		if (!c) return nothing;

		const disabled = this.isDisabled;
		const stateObj = this._stateObj;
		const name = c.name ?? (stateObj?.attributes.friendly_name as string | undefined);

		const vars: Record<string, string> = styleToCustomProperties(c.style);
		if (c.snap && this._geometry) {
			const travel = travelDistance(this._geometry);
			vars["--_x"] = `${c.direction === "rtl" ? -this._px : this._px}px`;
			vars["--_track-w"] = `${this._trackWidth}px`;
			if (!this._confirmed) {
				vars["--_fill"] = `${Math.max(0, this._px) + this._geometry.handleWidth}px`;
				// The prompt fades out as the handle covers it, like slide to unlock.
				const fade = travel > 0 ? 1 - Math.min(1, Math.max(0, this._px / travel) * 3.5) : 1;
				vars["--_text-opacity"] = `${fade}`;
				vars["--_p"] = `${travel > 0 ? Math.min(1, Math.max(0, this._px / travel)) : 0}`;
			}
		} else if (this._geometry && (this._progress > 0 || this._confirmed)) {
			vars["--_x"] = `${translateX(this._progress, this._geometry, c.direction)}px`;
			vars["--_p"] = `${this._progress}`;
			vars["--_track-w"] = `${this._trackWidth}px`;
			if (!this._confirmed) {
				vars["--_fill"] = `${fillWidth(this._progress, this._geometry)}px`;
			}
		}

		const icon = c.icon
			? html`<ha-icon part="icon" .icon=${c.icon}></ha-icon>`
			: stateObj
				? html`<ha-state-icon part="icon" .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`
				: nothing;
		const hasHeader = icon !== nothing || name !== undefined || c.label !== undefined;

		return html`
			<div
				part="slider"
				class=${classMap({
					slider: true,
					rtl: c.direction === "rtl",
					dragging: this._dragging,
					physics: !!c.snap,
					locked: this._snapped,
					[`theme-${c.theme}`]: !!c.theme,
					confirmed: this._confirmed,
					disabled,
				})}
				style=${styleMap(vars)}
			>
				${
					hasHeader
						? html`
								<div class="header" part="header">
									${icon}
									${name !== undefined ? html`<span class="name" part="name">${name}</span>` : nothing}
									${
										c.label !== undefined
											? html`<span class="label" part="label">${c.label}</span>`
											: nothing
									}
								</div>
							`
						: nothing
				}
				<div class="track" part="track">
					<div class="fill-clip"><div class="fill" part="fill"></div></div>
					<div class="text" part="text">
						${this._confirmed ? c.text_confirmed : c.text_unconfirmed}
					</div>
					<div
						class="handle"
						part="handle"
						role="slider"
						tabindex=${disabled ? -1 : 0}
						aria-label=${name !== undefined ? `${name}: ${c.text_unconfirmed}` : c.text_unconfirmed}
						aria-orientation="horizontal"
						aria-valuemin="0"
						aria-valuemax="100"
						aria-valuenow=${Math.round(this._progress * 100)}
						aria-disabled=${disabled ? "true" : "false"}
						@pointerdown=${this._onPointerDown}
						@pointermove=${this._onPointerMove}
						@pointerup=${this._onPointerUp}
						@pointercancel=${this._onPointerCancel}
						@lostpointercapture=${this._onPointerCancel}
						@keydown=${this._onKeyDown}
					>
						<ha-icon
							.icon=${
								this._confirmed || (c.theme && this._snapped)
									? c.icon_confirmed
									: c.icon_unconfirmed
							}
						></ha-icon>
					</div>
				</div>
			</div>
		`;
	}
}
