import { html, LitElement, TemplateResult, nothing } from "lit";
import { state } from "lit/decorators.js";

import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";
import { SlideConfirmButtonConfig } from "./slide-confirm";

interface Config extends LovelaceCardConfig {
	header?: string;
	sliders: Array<SlideConfirmButtonConfig>;
}

interface ConfirmActionDetail {
	action: string;
	service: string;
	target?: {
		entity_id?: string | string[];
		device_id?: string | string[];
		area_id?: string | string[];
	};
	data?: Record<string, unknown>;
}

export class SlideConfirmCard extends LitElement {
	@state() private _header: string | typeof nothing = nothing;
	@state() private _sliders: Array<SlideConfirmButtonConfig> = [];

	private _hass?: HomeAssistant;

	setConfig(config: Config) {
		this._header = config.header === "" || config.header === undefined ? nothing : config.header;
		this._sliders = config.sliders ?? [];

		if (this._hass) {
			this.hass = this._hass;
		}
	}

	set hass(hass: HomeAssistant) {
		this._hass = hass;
	}

	private _callAction(e: CustomEvent<ConfirmActionDetail>) {
		const action = e.detail;

		if (action.action === "call-service" && this._hass) {
			const [domain, service] = action.service.split(".");

			const serviceData: Record<string, unknown> = {
				...action.data,
			};

			if (action.target?.entity_id) {
				serviceData.entity_id = action.target.entity_id;
			}

			if (action.target?.device_id) {
				serviceData.device_id = action.target.device_id;
			}

			if (action.target?.area_id) {
				serviceData.area_id = action.target.area_id;
			}

			this._hass.callService(domain, service, serviceData);
		}
	}

	render() {
		const content: TemplateResult = html`
			${this._sliders.map(
				(slider) =>
					html`<slide-confirm @call-action=${this._callAction} .config=${slider}></slide-confirm>`,
			)}
		`;

		return html`
			<ha-card header="${this._header}">
				<div class="card-content">${content}</div>
			</ha-card>
		`;
	}

	static getConfigElement() {
		return document.createElement("slide-confirm-editor");
	}

	static getStubConfig() {
		return {
			entity: "input_boolean.slide-confirm",
			header: "",
		};
	}
}
