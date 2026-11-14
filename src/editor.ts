import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
	type CardConfigInput,
	hasLegacyKeys,
	migrateConfig,
	migrateSlider,
	normalizeConfig,
	type SliderConfigInput,
	THEMES,
} from "./config";
import { editorStyles } from "./styles/editor.css";
import type { HomeAssistant, LovelaceCardEditor } from "./types/home-assistant";
import { clean } from "./util/clean";
import { fireEvent } from "./util/fire-event";
import { loadHaComponents } from "./util/load-ha-components";

/**
 * Visual editor for `<slide-confirm-card>`, built on Home Assistant's
 * `ha-form` and selectors so every field looks and behaves like HA's own
 * card editors. The action field is HA's `ui_action` selector, which gives
 * the full action UI including target and data pickers.
 *
 * The editor edits the user's *raw* config and only ever writes back what
 * changed: a slider the user touches is migrated to v2 spellings, and the
 * "Upgrade" banner migrates the whole config at once. Defaults are never
 * written into the YAML.
 */

type HaFormSchema = Record<string, unknown>;

const DIRECTION_SELECT = {
	select: {
		mode: "dropdown",
		options: [
			{ value: "ltr", label: "Left to right" },
			{ value: "rtl", label: "Right to left" },
		],
	},
};

const THEME_SELECT = {
	select: {
		mode: "dropdown",
		options: THEMES.map((value) => ({
			value,
			label: value === "ios" ? "iOS" : value[0].toUpperCase() + value.slice(1),
		})),
	},
};

const STYLE_SCHEMA: HaFormSchema[] = [
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "handle_size", selector: { text: {} } },
			{ name: "track_height", selector: { text: {} } },
			{ name: "border_radius", selector: { text: {} } },
			{ name: "font_size", selector: { text: {} } },
		],
	},
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "track_color", selector: { text: {} } },
			{ name: "handle_color", selector: { text: {} } },
			{ name: "handle_border_color", selector: { text: {} } },
			{ name: "text_color", selector: { text: {} } },
			{ name: "confirmed_color", selector: { text: {} } },
			{ name: "confirmed_text_color", selector: { text: {} } },
		],
	},
	{ name: "fill_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
];

export const CARD_SCHEMA: HaFormSchema[] = [
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "header", selector: { text: {} } },
			{ name: "direction", selector: DIRECTION_SELECT },
		],
	},
	{ name: "theme", selector: THEME_SELECT },
	{
		type: "expandable",
		name: "style",
		title: "Style defaults for all sliders",
		schema: STYLE_SCHEMA,
	},
];

export const SLIDER_SCHEMA: HaFormSchema[] = [
	{ name: "entity", selector: { entity: {} } },
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "name", selector: { text: {} } },
			{ name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
		],
	},
	{ name: "label", selector: { text: {} } },
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "text_unconfirmed", selector: { text: {} } },
			{ name: "text_confirmed", selector: { text: {} } },
		],
	},
	{
		type: "grid",
		name: "",
		schema: [
			{ name: "icon_unconfirmed", selector: { icon: {} } },
			{ name: "icon_confirmed", selector: { icon: {} } },
		],
	},
	{
		name: "confirm_action",
		selector: {
			ui_action: {
				default_action: "perform-action",
				actions: ["perform-action", "toggle", "more-info", "navigate", "url", "assist", "none"],
			},
		},
	},
	{
		type: "expandable",
		name: "",
		flatten: true,
		title: "Behaviour",
		schema: [
			{
				type: "grid",
				name: "",
				schema: [
					{ name: "direction", selector: DIRECTION_SELECT },
					{ name: "theme", selector: THEME_SELECT },
					{
						name: "reset_delay",
						selector: { number: { min: 0, step: 100, mode: "box", unit_of_measurement: "ms" } },
					},
				],
			},
			{ name: "haptic", selector: { boolean: {} } },
			{ name: "disabled_states", selector: { text: { multiple: true } } },
		],
	},
	{ type: "expandable", name: "style", title: "Style", schema: STYLE_SCHEMA },
];

const LABELS: Record<string, string> = {
	header: "Card title",
	direction: "Slide direction",
	theme: "Theme",
	entity: "Entity",
	name: "Name",
	icon: "Icon",
	label: "Secondary text",
	text_unconfirmed: "Text before confirming",
	text_confirmed: "Text after confirming",
	icon_unconfirmed: "Handle icon",
	icon_confirmed: "Handle icon after confirming",
	confirm_action: "Action on confirm",
	reset_delay: "Reset after",
	haptic: "Haptic feedback",
	disabled_states: "Disable when entity state is",
	track_color: "Track color",
	handle_color: "Handle color",
	handle_border_color: "Handle border color",
	confirmed_color: "Confirmed color",
	confirmed_text_color: "Confirmed text color",
	text_color: "Text color",
	handle_size: "Handle size",
	track_height: "Track height",
	border_radius: "Border radius",
	font_size: "Font size",
	fill_opacity: "Fill opacity",
};

const HELPERS: Record<string, string> = {
	direction: "Leave empty to use the card default (left to right).",
	theme: "Built-in look. Leave empty for the classic look (or the card's theme).",
	entity: "Optional. Supplies the default name and icon and enables the state options below.",
	reset_delay: "Milliseconds. 0 keeps the confirmed state until the entity changes state.",
	disabled_states: "Press Enter after each state, e.g. unlocked, unavailable.",
	handle_size: "CSS length, e.g. 44px. Default 50px.",
	track_height: "CSS length. Defaults to the handle size.",
	border_radius: "CSS length. Defaults to half the handle size.",
	font_size: "CSS size, e.g. 0.9rem.",
	track_color: "Any CSS color, e.g. #9e9e9e or var(--divider-color).",
	confirmed_color: "Fill and handle color after a successful slide.",
};

const computeLabel = (schema: { name: string }) => LABELS[schema.name] ?? schema.name;
const computeHelper = (schema: { name: string }) => HELPERS[schema.name];

/** Keys kept even when empty: the card needs `sliders` to stay a list. */
const KEEP = new Set(["sliders"]);

export const newSlider = (): SliderConfigInput => ({
	text_unconfirmed: "Slide to confirm",
	text_confirmed: "Confirmed",
	icon_unconfirmed: "mdi:chevron-right",
	icon_confirmed: "mdi:check",
	// Deliberately incomplete: the preview tells the user exactly what to fill in.
	confirm_action: { action: "perform-action" },
});

const sliderTitle = (raw: SliderConfigInput, index: number): string =>
	(typeof raw.name === "string" && raw.name) ||
	(typeof raw.text_unconfirmed === "string" && raw.text_unconfirmed) ||
	(typeof raw.textUnconfirmed === "string" && raw.textUnconfirmed) ||
	`Slider ${index + 1}`;

const actionSummary = (slider: SliderConfigInput): string => {
	if (slider.states && typeof slider.states === "object") return "Actions per entity state";
	const a = slider.confirm_action;
	if (!a || typeof a !== "object") return "No action";
	if (a.action === "perform-action") return a.perform_action || "Choose an action";
	return typeof a.action === "string" ? a.action : "No action";
};

export class SlideConfirmCardEditor extends LitElement implements LovelaceCardEditor {
	static styles = editorStyles;

	@property({ attribute: false }) hass?: HomeAssistant;
	@property({ attribute: false }) lovelace?: unknown;

	@state() private _config?: CardConfigInput;
	@state() private _error?: string;
	@state() private _legacy = false;

	/** The raw config as last set or committed. */
	get config(): CardConfigInput | undefined {
		return this._config;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		void loadHaComponents().then(() => this.requestUpdate());
	}

	setConfig(config: unknown): void {
		this._config = (config && typeof config === "object" ? config : {}) as CardConfigInput;
		this._legacy = hasLegacyKeys(this._config);
		try {
			normalizeConfig(this._config);
			this._error = undefined;
		} catch (e) {
			this._error = e instanceof Error ? e.message : String(e);
		}
	}

	private _sliders(): SliderConfigInput[] {
		return Array.isArray(this._config?.sliders) ? this._config.sliders : [];
	}

	private _commit(next: CardConfigInput): void {
		const cleaned = (clean(next, KEEP) ?? {}) as CardConfigInput;
		this.setConfig(cleaned);
		fireEvent(this, "config-changed", { config: cleaned });
	}

	private _cardChanged(ev: CustomEvent<{ value: Partial<CardConfigInput> }>): void {
		ev.stopPropagation();
		if (!this._config) return;
		const { header, direction, theme, style } = ev.detail.value;
		this._commit({ ...this._config, header, direction, theme, style });
	}

	private _sliderChanged(index: number, ev: CustomEvent<{ value: SliderConfigInput }>): void {
		ev.stopPropagation();
		if (!this._config) return;
		const sliders = [...this._sliders()];
		sliders[index] = ev.detail.value;
		this._commit({ ...this._config, sliders });
	}

	private _addSlider(): void {
		if (!this._config) return;
		this._commit({ ...this._config, sliders: [...this._sliders(), newSlider()] });
	}

	private _removeSlider(index: number): void {
		if (!this._config) return;
		this._commit({ ...this._config, sliders: this._sliders().filter((_, i) => i !== index) });
	}

	private _moveSlider(index: number, delta: -1 | 1): void {
		if (!this._config) return;
		const sliders = [...this._sliders()];
		const target = index + delta;
		if (target < 0 || target >= sliders.length) return;
		[sliders[index], sliders[target]] = [sliders[target], sliders[index]];
		this._commit({ ...this._config, sliders });
	}

	private _upgrade(): void {
		if (!this._config) return;
		this._commit(migrateConfig(this._config));
	}

	protected override render() {
		const c = this._config;
		if (!c) return nothing;
		const sliders = this._sliders();
		const cardData = {
			header: c.header ?? undefined,
			direction: c.direction,
			theme: c.theme,
			style: c.style,
		};

		return html`
			${
				this._legacy
					? html`
							<ha-alert alert-type="info" title="Older option names" class="legacy">
								This card still uses the v1 option names (for example
								<code>textUnconfirmed</code>). Upgrading renames them; nothing else changes.
								<ha-button slot="action" class="upgrade" @click=${this._upgrade}>Upgrade</ha-button>
							</ha-alert>
						`
					: nothing
			}
			${
				this._error
					? html`<ha-alert alert-type="warning" class="error">${this._error}</ha-alert>`
					: nothing
			}

			<ha-form
				class="card-form"
				.hass=${this.hass}
				.data=${cardData}
				.schema=${CARD_SCHEMA}
				.computeLabel=${computeLabel}
				.computeHelper=${computeHelper}
				@value-changed=${this._cardChanged}
			></ha-form>

			<h3 class="section">Sliders</h3>
			${sliders.map((raw, i) => this._renderSlider(raw, i, sliders.length))}

			<ha-button class="add" @click=${this._addSlider}>
				<ha-icon slot="icon" icon="mdi:plus"></ha-icon>
				Add slider
			</ha-button>
		`;
	}

	private _renderSlider(raw: SliderConfigInput, index: number, count: number) {
		const data = migrateSlider(raw);
		return html`
			<ha-expansion-panel
				outlined
				class="slider"
				.header=${sliderTitle(raw, index)}
				.secondary=${actionSummary(data)}
			>
				<div slot="icons" class="actions" @click=${(e: Event) => e.stopPropagation()}>
					<ha-icon-button
						class="up"
						label="Move up"
						.disabled=${index === 0}
						@click=${() => this._moveSlider(index, -1)}
					>
						<ha-icon icon="mdi:arrow-up"></ha-icon>
					</ha-icon-button>
					<ha-icon-button
						class="down"
						label="Move down"
						.disabled=${index === count - 1}
						@click=${() => this._moveSlider(index, 1)}
					>
						<ha-icon icon="mdi:arrow-down"></ha-icon>
					</ha-icon-button>
					<ha-icon-button class="remove" label="Remove" @click=${() => this._removeSlider(index)}>
						<ha-icon icon="mdi:delete"></ha-icon>
					</ha-icon-button>
				</div>
				<div class="content">
					${
						data.states && typeof data.states === "object"
							? html`
									<ha-alert alert-type="info" class="states-note">
										This slider has per-state options (<code>states:</code>). Edit them in the code
										editor; the fields below are the defaults they fall back to.
									</ha-alert>
								`
							: nothing
					}
					<ha-form
						class="slider-form"
						.hass=${this.hass}
						.data=${data}
						.schema=${SLIDER_SCHEMA}
						.computeLabel=${computeLabel}
						.computeHelper=${computeHelper}
						@value-changed=${(ev: CustomEvent<{ value: SliderConfigInput }>) =>
							this._sliderChanged(index, ev)}
					></ha-form>
				</div>
			</ha-expansion-panel>
		`;
	}
}
