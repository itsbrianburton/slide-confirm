import { CSSResult, LitElement, html, TemplateResult } from "lit";
import { state, property, query } from "lit/decorators.js";
import { slideConfirmStyles } from "./card.styles";

export interface SlideConfirmButtonConfig {
	name: string;
	label: string;
	icon: string;
	iconConfirmed: string;
	iconUnconfirmed: string;
	textConfirmed: string;
	textUnconfirmed: string;
	entity: string;
	confirm_action: {
		action: string;
		service: string;
		target?: {
			entity_id?: string | string[];
			device_id?: string | string[];
			area_id?: string | string[];
		};
		data?: Record<string, unknown>;
	};
}

export class SlideConfirmButton extends LitElement {
	@property({ attribute: false })
	config!: SlideConfirmButtonConfig;

	@state()
	private _confirmed = false;

	@query(".slide-confirm")
	private _container!: HTMLElement;

	@query(".slide-confirm-handle")
	private _handle!: HTMLElement;

	static styles: CSSResult = slideConfirmStyles;

	dragStart(e: PointerEvent) {
		if (this._confirmed) return;
		this._handle.classList.add("dragging");
		this._handle.onpointermove = this.drag.bind(this);
		this._handle.setPointerCapture(e.pointerId);
	}

	dragEnd(e: PointerEvent) {
		const x = this._calculateX(e);
		const target = e.target as HTMLElement;
		if (x + target.clientWidth === this._container.clientWidth && !this._confirmed) {
			this._confirmed = true;
			this._container.classList.add("confirmed");
			if (this.config.confirm_action) {
				const payload = {
					detail: this.config.confirm_action,
					bubbles: true,
					composed: true,
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

	private _calculateX(e: PointerEvent) {
		const bounds = this._container.getBoundingClientRect();
		const target = e.target as HTMLElement;
		let x = e.clientX - bounds.x - target.clientWidth / 2;

		// Keep the handle within the container
		if (x < 0) {
			x = 0;
		} else if (x + target.clientWidth >= this._container.clientWidth) {
			x = this._container.clientWidth - target.clientWidth;
		}

		return x;
	}

	drag(e: PointerEvent) {
		this._handle.style.transform = `translateX(${this._calculateX(e)}px)`;
	}

	render() {
		const content: TemplateResult = html`
			${this.config.icon ? html`<ha-icon icon="${this.config.icon}"></ha-icon>` : ""}
			${this.config.name ? html`<span class="slide-name">${this.config.name}</span>` : ""}
			${this.config.label ? html`<span class="slide-label">${this.config.label}</span>` : ""}
			<div class="slide-confirm">
				<div class="slide-confirm-track"></div>
				<div class="slide-confirm-text unconfirmed">${this.config.textUnconfirmed}</div>
				<div class="slide-confirm-text confirmed">${this.config.textConfirmed}</div>
				<div
					class="slide-confirm-handle"
					@pointerdown="${(e: PointerEvent) => this.dragStart(e)}"
					@pointerup="${(e: PointerEvent) => this.dragEnd(e)}"
				>
					<div class="slide-confirm-icon unconfirmed">
						<ha-icon icon="${this.config.iconUnconfirmed}"></ha-icon>
					</div>
					<div class="slide-confirm-icon confirmed">
						<ha-icon icon="${this.config.iconConfirmed}"></ha-icon>
					</div>
				</div>
			</div>
		`;

		return content;
	}
}
