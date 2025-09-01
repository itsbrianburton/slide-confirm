import { html, LitElement, TemplateResult, nothing } from 'lit';
import { state } from 'lit/decorators/state';

import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
import { SlideConfirmButtonConfig } from './slide-confirm';

interface Config extends LovelaceCardConfig {
	header: string;
	entity: string;
}

export class SlideConfirmCard extends LitElement {
	@state() private _header: string | typeof nothing;
	@state() private _state: HassEntity;
	@state() private _sliders: Array<SlideConfirmButtonConfig>;

	private _hass;

	setConfig(config: Config) {
		this._header = config.header === "" ? nothing : config.header;
		this._sliders = config.sliders;

		if (this._hass) {
			this.hass = this._hass;
		}
	}

	set hass(hass: HomeAssistant) {
		this._hass = hass;
	}

	private _callAction(e: CustomEvent) {
		const action = e.detail;

		if (action.action === "call-service") {
			const [domain, service] = action.service.split(".");

			const serviceData: any = {
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
		let content: TemplateResult = html`
			${this._sliders.map((slider) =>
				html`<slide-confirm @call-action=${this._callAction} config="${slider}" />`
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
			header: ""
		}
	}
}
