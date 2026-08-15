import { css, html, LitElement, nothing } from "lit";
import { property } from "lit/decorators/property";
import { state } from "lit/decorators/state";

import {
	HomeAssistant,
	LovelaceCardConfig,
	LovelaceCardEditor,
	fireEvent,
} from "custom-card-helpers";
import { SlideConfirmButtonConfig } from "./slide-confirm";

interface Config extends LovelaceCardConfig {
	sliders: Array<SlideConfirmButtonConfig>;
}

const SLIDER_SCHEMA = [
	{ name: "name", selector: { text: {} } },
	{
		type: "grid",
		name: "",
		flatten: true,
		schema: [
			{ name: "icon", selector: { icon: {} } },
			{ name: "iconUnconfirmed", selector: { icon: {} } },
			{ name: "iconConfirmed", selector: { icon: {} } },
		],
	},
	{
		type: "grid",
		name: "",
		flatten: true,
		schema: [
			{ name: "textUnconfirmed", selector: { text: {} } },
			{ name: "textConfirmed", selector: { text: {} } },
		],
	},
];

const SLIDER_LABELS: Record<string, string> = {
	name: "Name",
	icon: "Icon",
	iconUnconfirmed: "Icon unconfirmed",
	iconConfirmed: "Icon confirmed",
	textUnconfirmed: "Text unconfirmed",
	textConfirmed: "Text confirmed",
};

export class SlideConfirmCardEditor extends LitElement implements LovelaceCardEditor {
	@property({ attribute: false })
	hass?: HomeAssistant;

	@state()
	private _config?: Config;

	@state()
	private _componentsLoaded = false;

	async connectedCallback() {
		super.connectedCallback();
		await this._loadHaComponents();
		this._componentsLoaded = true;
	}

	private async _loadHaComponents() {
		if (customElements.get("ha-form") && customElements.get("ha-service-control")) {
			return;
		}
		try {
			await (customElements.get("hui-glance-card") as any)?.getConfigElement();
		} catch (err) {
			console.warn("slide-confirm editor: could not load HA components", err);
		}
	}

	setConfig(config: Config) {
		this._config = config;
	}

	private _fireConfigChanged() {
		fireEvent(this, "config-changed", { config: this._config });
	}

	private _sliderFormChanged(index: number, ev: CustomEvent) {
		ev.stopPropagation();
		if (!this._config || ev.detail.value === undefined) return;

		this._config = {
			...this._config,
			sliders: this._config.sliders.map((slider, i) =>
				i === index ? { ...slider, ...ev.detail.value } : slider
			),
		};
		this._fireConfigChanged();
	}

	private _serviceChanged(index: number, value: { action: string; data?: any; target?: any }) {
		if (!this._config) return;

		const confirm_action = {
			action: "call-service",
			service: value.action || "",
			...(value.data ? { data: value.data } : {}),
			...(value.target && Object.keys(value.target).length
				? { target: value.target }
				: {}),
		};

		this._config = {
			...this._config,
			sliders: this._config.sliders.map((slider, i) =>
				i === index ? { ...slider, confirm_action } : slider
			),
		};
		this._fireConfigChanged();
	}

	private _addSlider() {
		if (!this._config) return;
		this._config = {
			...this._config,
			sliders: [
				...this._config.sliders,
				{
					name: "New Slider",
					textUnconfirmed: "Slide to confirm",
					textConfirmed: "Confirmed!",
					iconUnconfirmed: "mdi:lock",
					iconConfirmed: "mdi:lock-open",
					confirm_action: { action: "call-service" },
				} as SlideConfirmButtonConfig,
			],
		};
		this._fireConfigChanged();
	}

	private _removeSlider(index: number) {
		if (!this._config) return;
		this._config = {
			...this._config,
			sliders: this._config.sliders.filter((_, i) => i !== index),
		};
		this._fireConfigChanged();
	}

	render() {
		if (!this.hass || !this._config || !this._componentsLoaded) {
			return nothing;
		}

		return html`
			${this._config.sliders.map(
				(slider, index) => html`
					<div class="slider">
						<div class="slider-header">
							<span>Slider ${index + 1}</span>
							<button class="remove" @click=${() => this._removeSlider(index)}>
								Remove
							</button>
						</div>
						<ha-form
							.hass=${this.hass}
							.data=${slider}
							.schema=${SLIDER_SCHEMA}
							.computeLabel=${(schema: { name: string }) =>
								SLIDER_LABELS[schema.name] ?? schema.name}
							@value-changed=${(ev) => this._sliderFormChanged(index, ev)}
						></ha-form>
						${customElements.get("ha-service-control")
							? html`
									<ha-service-control
										.hass=${this.hass}
										.value=${{
											action: slider.confirm_action?.service || "",
											data: slider.confirm_action?.data,
											target: slider.confirm_action?.target,
										}}
										narrow
										@value-changed=${(ev) => {
											ev.stopPropagation();
											this._serviceChanged(index, ev.detail.value);
										}}
									></ha-service-control>
								`
							: html`
									<input
										class="service-fallback"
										placeholder="Service (e.g. light.turn_on)"
										.value=${slider.confirm_action?.service || ""}
									@change=${(ev) =>
										this._serviceChanged(index, {
											action: (ev.target as HTMLInputElement).value,
											data: slider.confirm_action?.data,
											target: slider.confirm_action?.target,
										})}
									/>
								`}
					</div>
				`
			)}
			<button class="add" @click=${this._addSlider}>Add slider</button>
		`;
	}

	static styles = css`
		.slider {
			padding: 12px;
			margin-bottom: 12px;
			border: 1px solid var(--divider-color, #e0e0e0);
			border-radius: 8px;
		}
		.slider-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-weight: 500;
			margin-bottom: 8px;
		}
		button {
			border: none;
			border-radius: 4px;
			padding: 6px 12px;
			font: inherit;
			cursor: pointer;
			color: var(--primary-text-color);
			background: var(--secondary-background-color);
		}
		button.add {
			background: var(--primary-color);
			color: var(--text-primary-color);
		}
		button.remove:hover {
			background: var(--error-color);
			color: var(--text-primary-color);
		}
		.service-fallback {
			width: 100%;
			box-sizing: border-box;
			padding: 8px;
			margin-top: 8px;
			border: 1px solid var(--divider-color, #e0e0e0);
			border-radius: 4px;
			background: var(--card-background-color);
			color: var(--primary-text-color);
		}
	`;
}