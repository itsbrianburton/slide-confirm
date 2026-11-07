import { css } from "lit";

/**
 * Card styles. `ha-card` already pads a slotted `.card-content` (16px, less
 * under a header), so only the slider spacing is handled here: the first and
 * last slider drop their outer margins via CSS shadow parts.
 */
export const cardStyles = css`
	:host {
		display: block;
	}

	ha-card {
		height: 100%;
		box-sizing: border-box;
	}

	slide-confirm-slider:first-child::part(slider) {
		margin-top: 0;
	}

	slide-confirm-slider:last-child::part(slider) {
		margin-bottom: 0;
	}
`;
