import { SlideConfirmCard } from "./card";
import { SlideConfirmButton } from './slide-confirm';

declare global {
	interface Window {
		customCards: Array<Object>;
	}
}

customElements.define("slide-confirm-card", SlideConfirmCard);
customElements.define("slide-confirm", SlideConfirmButton);

window.customCards = window.customCards || [];
window.customCards.push({
	type: "slide-confirm-card",
	name: "Slide to Confirm Card",
	description: "Prevent accidental button presses by requiring slide to confirm."
});
