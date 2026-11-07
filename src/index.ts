import { SlideConfirmCard } from "./card";
import { SlideConfirmCardEditor } from "./editor";
import { SlideConfirmSlider } from "./slider";

declare global {
	interface Window {
		customCards?: Array<object>;
	}
}

const define = (tag: string, ctor: CustomElementConstructor) => {
	if (!customElements.get(tag)) customElements.define(tag, ctor);
};

define("slide-confirm-slider", SlideConfirmSlider);
define("slide-confirm-card", SlideConfirmCard);
define("slide-confirm-card-editor", SlideConfirmCardEditor);

window.customCards = window.customCards ?? [];
window.customCards.push({
	type: "slide-confirm-card",
	name: "Slide to Confirm",
	description: "Prevent accidental actions by requiring a full-width slide to confirm.",
	preview: true,
	documentationURL: "https://github.com/itsbrianburton/slide-confirm",
});

console.info(
	`%c SLIDE-CONFIRM %c ${__VERSION__} `,
	"color: #fff; background: #03a9f4; font-weight: 700; border-radius: 2px 0 0 2px;",
	"color: #03a9f4; background: #fff; font-weight: 700; border-radius: 0 2px 2px 0;",
);

export { SlideConfirmCard, SlideConfirmCardEditor, SlideConfirmSlider };
