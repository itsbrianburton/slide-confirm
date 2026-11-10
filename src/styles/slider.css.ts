import { css } from "lit";

/**
 * Slider styles.
 *
 * Public knobs are the `--slide-confirm-*` custom properties (set from the
 * `style:` config block, a theme, or card_mod). Each falls back through the
 * Home Assistant theme tokens, newest first, then a literal, so the card
 * renders correctly on HA 2026 themes that dropped the old `--switch-*`
 * variables (PR #17).
 *
 * Internal `--_*` properties are derived once here and read everywhere else.
 * `--_x` and `--_fill` are set inline by the component while the handle is
 * away from rest.
 *
 * CSS shadow parts: slider, header, name, label, track, fill, text, handle.
 */
export const sliderStyles = css`
	:host {
		display: block;
	}

	.slider {
		--_handle-size: var(--slide-confirm-handle-size, 50px);
		--_track-height: var(--slide-confirm-track-height, var(--_handle-size));
		--_radius: var(--slide-confirm-border-radius, calc(var(--_handle-size) / 2));
		--_track-color: var(
			--slide-confirm-track-color,
			var(--slider-track-color, var(--secondary-text-color, #9e9e9e))
		);
		--_handle-color: var(
			--slide-confirm-handle-color,
			var(
				--switch-unchecked-button-color,
				var(--card-background-color, var(--ha-card-background, #fff))
			)
		);
		--_handle-border-color: var(
			--slide-confirm-handle-border-color,
			var(--divider-color, rgba(0, 0, 0, 0.12))
		);
		--_confirmed-color: var(
			--slide-confirm-confirmed-color,
			var(--switch-checked-track-color, var(--primary-color, #03a9f4))
		);
		--_confirmed-text-color: var(
			--slide-confirm-confirmed-text-color,
			var(--text-primary-color, #fff)
		);
		--_text-color: var(--slide-confirm-text-color, var(--primary-text-color, #212121));
		--_font-size: var(--slide-confirm-font-size, 1rem);
		--_fill-opacity: var(--slide-confirm-fill-opacity, 0.54);

		color: var(--_text-color);
		margin: 8px 0;
		user-select: none;
		-webkit-user-select: none;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
		min-height: 24px;
	}

	.label {
		color: var(--secondary-text-color, inherit);
		font-size: 0.875em;
	}

	.track {
		position: relative;
		height: var(--_track-height);
		min-height: var(--_handle-size);
		border-radius: var(--_radius);
	}

	/* The track colour shows through at 38% (as in v1) without dimming the children. */
	.track::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-color: var(--_track-color);
		opacity: 0.38;
	}

	/* Clips the fill to the track's rounded shape while it shrinks (its own corners
	   would otherwise poke out past the track's curve). The handle stays outside. */
	.fill-clip {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
	}

	.fill {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: var(--_fill, 0px);
		border-radius: var(--_radius);
		background-color: var(--_confirmed-color);
		opacity: var(--_fill-opacity);
		transition: width 300ms;
	}

	.rtl .fill {
		left: auto;
		right: 0;
	}

	.confirmed .fill {
		width: 100%;
	}

	.text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--_font-size);
		text-align: center;
		padding: 0 8px;
		pointer-events: none;
	}

	.handle {
		position: absolute;
		top: 50%;
		left: 0;
		width: var(--_handle-size);
		height: var(--_handle-size);
		box-sizing: border-box;
		border-radius: 50%;
		border: 1px solid var(--_handle-border-color);
		background-color: var(--_handle-color);
		box-shadow:
			rgba(0, 0, 0, 0.2) 0 3px 1px -2px,
			rgba(0, 0, 0, 0.14) 0 2px 2px 0,
			rgba(0, 0, 0, 0.12) 0 1px 5px 0;
		display: flex;
		align-items: center;
		justify-content: center;
		--mdc-icon-size: calc(var(--_handle-size) * 0.5);
		cursor: grab;
		touch-action: none;
		/* The translate property (not transform) so a design's scale never scales the offset. */
		translate: var(--_x, 0px) -50%;
		transition:
			translate 300ms,
			background-color 300ms,
			border-color 300ms;
		outline: none;
	}

	.rtl .handle {
		left: auto;
		right: 0;
	}

	.handle:focus-visible {
		box-shadow: 0 0 0 3px var(--_confirmed-color);
	}

	.dragging .handle,
	.dragging .fill {
		transition: none;
	}

	/* snap: position is driven by springs in JS; only colours transition in CSS. */
	.physics .handle {
		transition:
			background-color 300ms,
			border-color 300ms;
	}

	.physics .fill {
		transition: none;
	}

	.physics.confirmed .fill {
		transition: width 300ms;
	}

	.physics .text {
		opacity: var(--_text-opacity, 1);
	}

	.dragging .handle {
		cursor: grabbing;
	}

	.confirmed .handle {
		border-color: var(--_confirmed-color);
		background-color: var(--_confirmed-color);
		color: var(--_confirmed-text-color);
		cursor: default;
	}

	.disabled {
		opacity: 0.5;
	}

	.disabled .handle {
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.handle,
		.fill {
			transition: none;
		}
	}
`;
