import { html, LitElement, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { DEFAULTS, type ActionConfig, type SliderConfig, type SliderStateConfig } from "./config";
import {
	applyKey,
	fillWidth,
	isConfirmed,
	progressFromPointer,
	styleToCustomProperties,
	translateX,
	type TrackGeometry,
} from "./logic";
import { sliderStyles } from "./styles/slider.css";
import { themeStyles } from "./styles/themes.css";
import type { HassEntity, HomeAssistant } from "./types/home-assistant";
import { fireEvent } from "./util/fire-event";

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

/** What the slider shows and does right now: its own options, or a `states:` entry. */
interface SliderView extends SliderStateConfig {
	/** Which `states:` entry applies; undefined without `states` or in an unlisted state. */
	stateKey?: string;
	/** True with `states` when the entity is in a state the map does not list. */
	unlisted: boolean;
}

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
	@state() private _confirmed = false;
	/** Set for one frame when the handle's rest side flips, so it jumps instead of sliding. */
	@state() private _instant = false;

	@query(".track") private _trackEl!: HTMLElement;
	@query(".handle") private _handleEl!: HTMLElement;

	private _geometry?: TrackGeometry;
	private _pointerId?: number;
	private _resetTimer?: ReturnType<typeof setTimeout>;
	private _stateAtConfirm?: string;
	/** With `reset_delay: 0`: whether the entity has left the state it had at confirm time. */
	private _leftConfirmState = false;
	/** Track width from the last measure, for themes that size gradients to the track. */
	private _trackWidth = 0;
	/** The view the user last saw; a change mid-slide cancels the slide. */
	private _lastView?: SliderView;
	/** The view that was confirmed, shown until reset even as the entity moves on. */
	private _confirmedView?: SliderView;

	/** Current progress, 0..1. Read-only; exposed for the card and tests. */
	get progress(): number {
		return this._progress;
	}

	get confirmed(): boolean {
		return this._confirmed;
	}

	/**
	 * Disabled by the `disabled` property, by the entity being in a `disabled_states`
	 * state, or, with `states`, by the entity being in a state the map does not list.
	 */
	get isDisabled(): boolean {
		if (this.disabled) return true;
		if (this.config && this._view().unlisted) return true;
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

	/** The entry of `states` for the entity's current state, or the slider's own options. */
	private _view(): SliderView {
		if (this._confirmed && this._confirmedView) return this._confirmedView;
		const c = this.config;
		if (!c.states) return { ...c, unlisted: false };
		const current = this._stateObj?.state;
		const entry = current !== undefined ? c.states[current] : undefined;
		return entry ? { ...entry, stateKey: current, unlisted: false } : { ...c, unlisted: true };
	}

	/** The entity's state as Home Assistant displays it, e.g. "Opening". */
	private _stateText(): string {
		const stateObj = this._stateObj;
		if (!stateObj) return "Unavailable";
		const format = this.hass?.formatEntityState as ((stateObj: HassEntity) => string) | undefined;
		return typeof format === "function" ? format(stateObj) : stateObj.state;
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._clearResetTimer();
	}

	protected override willUpdate(changed: PropertyValues<this>): void {
		// A new config (editor live-edit) starts from rest.
		if (changed.has("config") && changed.get("config") !== undefined) {
			this._reset();
		}
		if (!this.config) return;

		// reset_delay: 0 waits for the entity to leave the state it had at confirm time.
		// With `states` it also waits for a listed state, so a garage door holds the
		// confirmed look through "opening" and lets go at "open".
		if (
			changed.has("hass") &&
			this._confirmed &&
			this.config.reset_delay === 0 &&
			this._stateAtConfirm !== undefined
		) {
			const current = this._stateObj?.state;
			if (current !== this._stateAtConfirm) this._leftConfirmState = true;
			const states = this.config.states;
			const settled = !states || (current !== undefined && current in states);
			if (this._leftConfirmState && settled) this._reset();
		}

		const view = this._view();
		const last = this._lastView;
		this._lastView = view;
		if (!last) return;
		if (
			!this._confirmed &&
			(view.stateKey !== last.stateKey || view.unlisted !== last.unlisted) &&
			(this._dragging || this._progress > 0)
		) {
			// The entity changed state under the user's finger: what they were about to
			// confirm is no longer what the slider would do, so drop the slide.
			this._endDrag();
			this._progress = 0;
		}
		if (view.direction !== last.direction) {
			// The rest side flips. Jump there rather than sliding across from the old side.
			this._instant = true;
		}
	}

	protected override updated(): void {
		if (this._instant) {
			// Make the browser apply the new rest position now, while .instant still turns
			// transitions off. The animation frame below runs before the browser's own style
			// pass, so without this the class would be gone by then and the handle would
			// slide in from outside the track.
			void this._handleEl.offsetWidth;
			requestAnimationFrame(() => {
				this._instant = false;
			});
		}
	}

	// ---- interaction -------------------------------------------------------

	private _measure(): TrackGeometry {
		const track = this._trackEl.getBoundingClientRect();
		const handle = this._handleEl.getBoundingClientRect();
		// Themes inset the handle inside the track (`--_inset`).
		const inset = parseFloat(getComputedStyle(this._trackEl).getPropertyValue("--_inset")) || 0;
		this._trackWidth = track.width;
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
		this._progress = progressFromPointer(e.clientX, this._geometry, this._view().direction);
	}

	private _onPointerMove(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
		this._progress = progressFromPointer(e.clientX, this._geometry, this._view().direction);
	}

	private _onPointerUp(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
		const progress = progressFromPointer(e.clientX, this._geometry, this._view().direction);
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
		this._progress = 0;
	}

	private _endDrag(): void {
		this._dragging = false;
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
		const next = applyKey(this._progress, e.key, this._view().direction);
		if (next === null) return;
		e.preventDefault();
		this._geometry = this._measure();
		this._progress = next;
		if (next >= 1 && isConfirmed(next, this._geometry)) {
			this._confirm();
		}
	}

	// ---- confirm / reset ----------------------------------------------------

	private _confirm(): void {
		// The view the user slid, captured before anything re-renders.
		const view = this._view();
		this._confirmedView = view;
		this._progress = 1;
		this._confirmed = true;
		this._stateAtConfirm = this._stateObj?.state;
		this._leftConfirmState = false;

		fireEvent<SlideConfirmedDetail>(this, SLIDE_CONFIRMED_EVENT, {
			action: view.confirm_action,
			config: this.config,
		});
		if (this.config.haptic) {
			// HA's own haptic event: the companion app vibrates this device;
			// browsers use navigator.vibrate when the user enabled it (PR #19).
			fireEvent(window, "haptic", "success");
		}
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
		this._pointerId = undefined;
		this._stateAtConfirm = undefined;
		this._leftConfirmState = false;
		this._confirmedView = undefined;
		this._progress = 0;
	}

	// ---- render -------------------------------------------------------------

	protected override render() {
		const c = this.config;
		if (!c) return nothing;

		const view = this._view();
		const disabled = this.isDisabled;
		const stateObj = this._stateObj;
		const name = c.name ?? (stateObj?.attributes.friendly_name as string | undefined);
		const prompt = view.unlisted ? this._stateText() : view.text_unconfirmed;

		const vars: Record<string, string> = styleToCustomProperties(c.style);
		if (this._trackWidth > 0) vars["--_track-w"] = `${this._trackWidth}px`;
		if (this._geometry && (this._progress > 0 || this._confirmed)) {
			vars["--_x"] = `${translateX(this._progress, this._geometry, view.direction)}px`;
			vars["--_p"] = `${this._progress}`;
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
					rtl: view.direction === "rtl",
					[`theme-${c.theme}`]: !!c.theme,
					instant: this._instant,
					dragging: this._dragging,
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
					<div class="text" part="text">${this._confirmed ? view.text_confirmed : prompt}</div>
					<div
						class="handle"
						part="handle"
						role="slider"
						tabindex=${disabled ? -1 : 0}
						aria-label=${name !== undefined ? `${name}: ${prompt}` : prompt}
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
							.icon=${this._confirmed ? view.icon_confirmed : view.icon_unconfirmed}
						></ha-icon>
					</div>
				</div>
			</div>
		`;
	}
}
