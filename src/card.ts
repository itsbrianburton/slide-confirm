import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { type CardConfig, type CardConfigInput, normalizeConfig } from "./config";
import { styleToCustomProperties } from "./logic";
import type { SlideConfirmedDetail } from "./slider";
import { cardStyles } from "./styles/card.css";
import type { HomeAssistant } from "./types/home-assistant";
import { fireEvent } from "./util/fire-event";

/** Sections-dashboard sizing hints. See `getGridOptions()` for the units. */
export interface GridOptions {
	columns?: number | "full";
	rows?: number | "auto";
	min_columns?: number;
	max_columns?: number;
	min_rows?: number;
	max_rows?: number;
}

/** Height estimates (px) used for `getCardSize` and `getGridOptions`. */
const EST = {
	cardPadding: 32,
	cardHeader: 60,
	sliderTrack: 50,
	sliderHeader: 28,
	sliderGap: 8,
	gridRow: 56,
	gridGap: 8,
	cardSizeUnit: 50,
};

/**
 * `<slide-confirm-card>`: a list of slide-to-confirm controls inside an `ha-card`.
 *
 * Responsibilities: normalize and validate the config, pass `hass` down, and
 * turn each slider's `slide-confirmed` event into Home Assistant's own
 * `hass-action` event, which the frontend executes (perform-action, toggle,
 * more-info, navigate, ...). The card itself never calls services.
 */
export class SlideConfirmCard extends LitElement {
	static styles = cardStyles;

	@property({ attribute: false }) hass?: HomeAssistant;

	@state() private _config?: CardConfig;

	private _lastWarnings = "";

	/** The normalized config. Exposed for the editor and tests. */
	get config(): CardConfig | undefined {
		return this._config;
	}

	/** Called by Home Assistant. Throws `ConfigError`; HA shows the message in the error card. */
	setConfig(raw: unknown): void {
		const { config, warnings } = normalizeConfig(raw);
		this._config = config;

		// Warn once per distinct set of warnings, not on every live edit.
		const key = warnings.join("\n");
		if (key && key !== this._lastWarnings) {
			console.warn(
				`slide-confirm-card: config notes\n${warnings.map((w) => `  - ${w}`).join("\n")}`,
			);
		}
		this._lastWarnings = key;
	}

	/** Estimated content height in px, from the config alone. */
	private _estimatedHeight(): number {
		const c = this._config;
		if (!c) return EST.cardPadding + EST.sliderTrack;
		let h = EST.cardPadding + (c.header ? EST.cardHeader : 0);
		c.sliders.forEach((s, i) => {
			const hasHeader =
				s.name !== undefined ||
				s.icon !== undefined ||
				s.label !== undefined ||
				s.entity !== undefined;
			h += EST.sliderTrack + (hasHeader ? EST.sliderHeader : 0) + (i > 0 ? EST.sliderGap : 0);
		});
		return h;
	}

	/** Masonry-view size, in ~50px units. */
	getCardSize(): number {
		return Math.max(1, Math.ceil(this._estimatedHeight() / EST.cardSizeUnit));
	}

	/**
	 * Sections-view size. A row is 56px with an 8px gap, so n rows span 64n - 8px.
	 * Full width by default; the user may shrink it to half a section (issue #10),
	 * accepting the shorter travel distance.
	 */
	getGridOptions(): GridOptions {
		const rows = Math.max(
			1,
			Math.ceil((this._estimatedHeight() + EST.gridGap) / (EST.gridRow + EST.gridGap)),
		);
		return { columns: "full", rows, min_columns: 6, min_rows: rows };
	}

	/** Called by Home Assistant to open the visual editor (M5). */
	static getConfigElement(): HTMLElement {
		return document.createElement("slide-confirm-card-editor");
	}

	/** Example config for the card picker. Targets a helper, never a real lock. */
	static getStubConfig(): CardConfigInput {
		return {
			type: "custom:slide-confirm-card",
			sliders: [
				{
					name: "Front Door",
					icon: "mdi:door",
					text_unconfirmed: "Slide to Unlock",
					text_confirmed: "Door Unlocked!",
					icon_unconfirmed: "mdi:lock",
					icon_confirmed: "mdi:lock-open",
					confirm_action: {
						action: "perform-action",
						perform_action: "input_boolean.turn_on",
						target: { entity_id: "input_boolean.slide_confirm" },
					},
				},
			],
		};
	}

	private _onConfirmed(e: CustomEvent<SlideConfirmedDetail>): void {
		e.stopPropagation();
		const { action, config } = e.detail;
		const actionConfig: Record<string, unknown> = { tap_action: action };
		if (config.entity) actionConfig.entity = config.entity;
		// Same event the built-in cards fire; HA's action-mixin runs handleAction on it.
		fireEvent(this, "hass-action", { config: actionConfig, action: "tap" });
	}

	protected override render() {
		const c = this._config;
		if (!c) return nothing;
		return html`
			<ha-card .header=${c.header}>
				<div class="card-content" style=${styleMap(styleToCustomProperties(c.style))}>
					${c.sliders.map(
						(slider) => html`
							<slide-confirm-slider
								.config=${slider}
								.hass=${this.hass}
								@slide-confirmed=${this._onConfirmed}
							></slide-confirm-slider>
						`,
					)}
				</div>
			</ha-card>
		`;
	}
}
