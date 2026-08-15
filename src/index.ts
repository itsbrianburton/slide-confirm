import { SlideConfirmCard } from "./card";
import { SlideConfirmButton } from './slide-confirm';
import { SlideConfirmCardEditor } from "./editor";

declare global {
	interface Window {
		customCards: Array<Object>;
	}
}

customElements.define("slide-confirm-card", SlideConfirmCard);
customElements.define("slide-confirm", SlideConfirmButton);
customElements.define("slide-confirm-editor", SlideConfirmCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
	type: "slide-confirm-card",
	name: "Slide to Confirm Card",
	description: "Prevent accidental button presses by requiring slide to confirm."
});
