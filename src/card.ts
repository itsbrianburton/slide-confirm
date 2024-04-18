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
			this._hass.callService(
				action.service.split('.')[0],
				action.service.split('.')[1], {
					entity_id: action.target.entity_id
				});
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
