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
	styleToCustomProperties,
	translateX,
	type TrackGeometry,
} from "./logic";
import { sliderStyles } from "./styles/slider.css";
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

/**
 * One slide-to-confirm control. Consumes a *normalized* `SliderConfig`.
 *
 * State is a single `progress` number (0 = rest, 1 = far end); see
 * `logic/geometry.ts`. Layout is only measured when the user starts
 * interacting, so rendering at rest needs no DOM reads.
 */
export class SlideConfirmSlider extends LitElement {
	static styles = sliderStyles;

	@property({ attribute: false }) config!: SliderConfig;
	@property({ attribute: false }) hass?: HomeAssistant;
	/** Externally forced disabled state, in addition to `disabled_states`. */
	@property({ type: Boolean }) disabled = false;

	@state() private _progress = 0;
	@state() private _dragging = false;
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
		return { trackLeft: track.left, trackWidth: track.width, handleWidth: handle.width };
	}

	private _onPointerDown(e: PointerEvent): void {
		if (this.isDisabled || this._confirmed || this._dragging) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		e.preventDefault();

		this._geometry = this._measure();
		this._pointerId = e.pointerId;
		try {
			this._handleEl.setPointerCapture(e.pointerId);
		} catch {
			// Synthetic events have no active pointer to capture; moves then
			// have to be delivered to the handle directly.
		}
		this._dragging = true;
		this._progress = progressFromPointer(e.clientX, this._geometry, this.config.direction);
	}

	private _onPointerMove(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
		this._progress = progressFromPointer(e.clientX, this._geometry, this.config.direction);
	}

	private _onPointerUp(e: PointerEvent): void {
		if (!this._dragging || e.pointerId !== this._pointerId || !this._geometry) return;
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
		const next = applyKey(this._progress, e.key, this.config.direction);
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
		this._progress = 1;
		this._confirmed = true;
		this._stateAtConfirm = this._stateObj?.state;

		fireEvent<SlideConfirmedDetail>(this, SLIDE_CONFIRMED_EVENT, {
			action: this.config.confirm_action,
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
		this._progress = 0;
	}

	// ---- render -------------------------------------------------------------

	protected override render() {
		const c = this.config;
		if (!c) return nothing;

		const disabled = this.isDisabled;
		const stateObj = this._stateObj;
		const name = c.name ?? (stateObj?.attributes.friendly_name as string | undefined);

		const vars: Record<string, string> = styleToCustomProperties(c.style);
		if (this._geometry && (this._progress > 0 || this._confirmed)) {
			vars["--_x"] = `${translateX(this._progress, this._geometry, c.direction)}px`;
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
					<div class="fill" part="fill"></div>
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
						<ha-icon .icon=${this._confirmed ? c.icon_confirmed : c.icon_unconfirmed}></ha-icon>
					</div>
				</div>
			</div>
		`;
	}
}
