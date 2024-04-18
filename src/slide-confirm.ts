import { CSSResult, LitElement } from 'lit';
import { html, TemplateResult } from 'lit/development';
import { state } from 'lit/decorators/state';
import { property } from 'lit/decorators/property';
import { query } from 'lit/decorators/query';
import { slideConfirmStyles } from './card.styles';

export interface SlideConfirmButtonConfig {
	name: string,
	label: string,
	icon: string,
	iconConfirmed: string,
	iconUnconfirmed: string,
	textConfirmed: string,
	textUnconfirmed: string,
	entity: string,
	confirm_action: {
		action: string,
		service: string,
		target: {
			entity_id: string,
		}
	}
}

export class SlideConfirmButton extends LitElement {
	@property({ attribute: true })
	config: SlideConfirmButtonConfig;

	@state()
	private _confirmed = false;

	@query(".slide-confirm")
	private _container;

	@query(".slide-confirm-handle")
	private _handle;

	static styles: CSSResult = slideConfirmStyles;

	dragStart(e) {
		if (this._confirmed) return;
		this._handle.classList.add("dragging");
		this._handle.onpointermove = this.drag.bind(this);
		this._handle.setPointerCapture(e.pointerId);
	}

	dragEnd(e) {
		let x = this._calculateX(e);
		if (x + e.target.clientWidth === this._container.clientWidth && !this._confirmed) {
			this._confirmed = true;
			this._container.classList.add("confirmed");
			if (this.config.confirm_action) {
				const payload = {
					detail: this.config.confirm_action,
					bubbles: true,
					composed: true
				};
				this.dispatchEvent(new CustomEvent("call-action", payload));
			}

			setTimeout(() => {
				this._container.classList.remove("confirmed");
				this._confirmed = false;
			}, 1500);
		}

		this._handle.classList.remove("dragging");
		this._handle.onpointermove = null;
		this._handle.releasePointerCapture(e.pointerId);
		this._handle.style.transform = `translateX(0)`;
	}

	private _calculateX(e) {
		let bounds = this._container.getBoundingClientRect();
		let x = e.clientX - bounds.x - (e.target.clientWidth / 2);

		// Keep the handle within the container
		if (x < 0) {
			x = 0;
		} else if (x + e.target.clientWidth >= this._container.clientWidth) {
			x = this._container.clientWidth - e.target.clientWidth;
		}

		return x;
	}

	drag(e) {
		this._handle.style.transform = `translateX(${this._calculateX(e)}px)`;
	}

	render() {
		let content: TemplateResult;

		content = html`
			${this.config.icon ? html`<ha-icon icon="${this.config.icon}" />` : ''}
			${this.config.name ? html`<span class="slide-name">${this.config.name}</span>` : ''}
			${this.config.label ? html`<span class="slide-label">${this.config.label}</span>` : ''}
			<div class="slide-confirm">
				<div class="slide-confirm-track"></div>
				<div class="slide-confirm-text unconfirmed">${this.config.textUnconfirmed}</div>
				<div class="slide-confirm-text confirmed">${this.config.textConfirmed}</div>
				<div class="slide-confirm-handle"
				     @touchstart="${e => this.dragStart(e)}"
				     @touchend="${e => this.dragEnd(e)}"
				     @pointerdown="${e => this.dragStart(e)}"
				     @pointerup="${e => this.dragEnd(e)}" >
					<div class="slide-confirm-icon unconfirmed">
						<ha-icon icon="${this.config.iconUnconfirmed}" />
					</div>
					<div class="slide-confirm-icon confirmed">
						<ha-icon icon="${this.config.iconConfirmed}" />
					</div>
				</div>
			</div>
		`;

		return content;
	}
}
