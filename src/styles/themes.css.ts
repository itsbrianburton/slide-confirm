import { css } from "lit";

/**
 * Built-in looks, selected with `theme: <name>`. Each is a `.theme-<name>` class on
 * the slider root, built on the same hooks: .dragging (finger down), .confirmed, and
 * --_p (0..1 handle position) and --_track-w (track width) set inline.
 * They still read the `--slide-confirm-*` colours (accent = confirmed colour).
 *
 * Contributed by David Buezas (PR #20). Nothing here signals "confirmed" before the
 * slide actually confirms: the accent states key off .confirmed only.
 */
export const themeStyles = css`
	/* ---------- shared by every design ---------- */
	[class*="theme-"] {
		--_accent: var(--_confirmed-color);
		--_ink: var(--primary-text-color, #e1e1e1);
		--_knob-light: #f5f5f7;
	}

	[class*="theme-"] .track::before {
		display: none;
	}

	[class*="theme-"] .track {
		height: calc(var(--_handle-size) + 2 * var(--_inset));
		border-radius: calc(var(--_handle-size) / 2 + var(--_inset));
		transition:
			background-color 220ms,
			box-shadow 220ms;
	}

	[class*="theme-"] .handle {
		left: var(--_inset);
		border: none;
		scale: 1;
		/* transform and translate animate the handle back to rest after a cancelled slide. */
		transition:
			transform 300ms,
			translate 300ms,
			background-color 220ms,
			color 220ms,
			box-shadow 220ms,
			scale 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}

	/* While dragging the handle follows the finger directly; only the looks animate. */
	[class*="theme-"].dragging .handle {
		transition:
			background-color 220ms,
			color 220ms,
			box-shadow 220ms,
			scale 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}

	[class*="theme-"].rtl .handle {
		left: auto;
		right: var(--_inset);
	}

	/* The fill sits in the groove (inset like the knob) and ends at the knob's far edge, so
	   its rounded end is exactly the knob's circle and stays hidden behind it. */
	[class*="theme-"] .fill-clip {
		inset: var(--_inset);
		border-radius: calc(var(--_handle-size) / 2);
	}

	[class*="theme-"] .fill {
		width: var(--_fill, var(--_handle-size));
		border-radius: calc(var(--_handle-size) / 2);
	}

	[class*="theme-"].confirmed .fill {
		width: 100%;
	}

	[class*="theme-"] .text {
		font-weight: 500;
		letter-spacing: 0.01em;
		padding-left: calc(var(--_handle-size) + var(--_inset));
		transition: opacity 120ms;
	}

	[class*="theme-"].rtl .text {
		padding-left: 8px;
		padding-right: calc(var(--_handle-size) + var(--_inset));
	}

	[class*="theme-"].confirmed .text {
		opacity: 1;
		padding: 0 8px;
	}

	@keyframes slide-confirm-shimmer {
		from {
			background-position: 250% 0;
		}
		to {
			background-position: 0% 0;
		}
	}

	/* ---------- ios: bright inset knob, recessed track, shimmering prompt ---------- */
	.theme-ios {
		--_inset: 4px;
	}

	.theme-ios .track {
		background: color-mix(in srgb, var(--_ink) 9%, transparent);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
	}

	.theme-ios .fill {
		display: none;
	}

	.theme-ios .handle {
		background: var(--_knob-light);
		color: var(--_accent);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.3),
			0 4px 14px rgba(0, 0, 0, 0.28);
	}

	.theme-ios.dragging .handle {
		scale: 1.05;
	}

	.theme-ios .text {
		color: transparent;
		background: linear-gradient(
				100deg,
				color-mix(in srgb, var(--_ink) 55%, transparent) 40%,
				var(--_ink) 50%,
				color-mix(in srgb, var(--_ink) 55%, transparent) 60%
			)
			0 0 / 250% 100% repeat-x;
		-webkit-background-clip: text;
		background-clip: text;
		animation: slide-confirm-shimmer 2.6s linear infinite;
	}

	.theme-ios.confirmed .track {
		background: var(--_accent);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.theme-ios.confirmed .text {
		color: #fff;
		background: none;
		animation: none;
	}

	/* ---------- minimal: quiet track, knob alone turns accent ---------- */
	.theme-minimal {
		--_inset: 3px;
	}

	.theme-minimal .track {
		background: color-mix(in srgb, var(--_ink) 7%, transparent);
	}

	.theme-minimal .fill {
		display: none;
	}

	.theme-minimal .handle {
		background: color-mix(in srgb, var(--_ink) 90%, transparent);
		color: var(--card-background-color, #1c1c1c);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
	}

	.theme-minimal .text {
		color: color-mix(in srgb, var(--_ink) 45%, transparent);
		font-weight: 400;
	}

	.theme-minimal.dragging .handle {
		scale: 1.04;
	}

	.theme-minimal.confirmed .handle {
		background: var(--_accent);
		color: #fff;
	}

	.theme-minimal.confirmed .text {
		color: var(--_ink);
	}

	/* ---------- glow: a light trail that heats up toward the end ---------- */
	.theme-glow {
		--_inset: 4px;
	}

	.theme-glow .track {
		background: color-mix(in srgb, var(--_ink) 6%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_ink) 8%, transparent);
	}

	.theme-glow .fill {
		background: linear-gradient(90deg, transparent, var(--_accent));
		opacity: calc(0.25 + 0.75 * var(--_p, 0));
	}

	.theme-glow.rtl .fill {
		background: linear-gradient(270deg, transparent, var(--_accent));
	}

	.theme-glow .handle {
		background: #fff;
		color: var(--_accent);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.4),
			0 0 calc(4px + 26px * var(--_p, 0)) calc(8px * var(--_p, 0)) var(--_accent);
	}

	.theme-glow .text {
		color: color-mix(in srgb, var(--_ink) 60%, transparent);
	}

	.theme-glow.confirmed .track {
		box-shadow:
			inset 0 0 0 1px var(--_accent),
			0 0 18px -2px var(--_accent);
	}

	.theme-glow.confirmed .fill {
		opacity: 1;
	}

	.theme-glow.confirmed .fill {
		background: var(--_accent);
	}

	.theme-glow.confirmed .text {
		color: #fff;
	}

	/* ---------- glass: frosted track, glossy knob ---------- */
	.theme-glass {
		--_inset: 4px;
	}

	.theme-glass .track {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
		-webkit-backdrop-filter: blur(14px) saturate(1.6);
		backdrop-filter: blur(14px) saturate(1.6);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.18),
			inset 0 0 0 1px rgba(255, 255, 255, 0.08),
			0 8px 24px -12px rgba(0, 0, 0, 0.6);
	}

	.theme-glass .fill {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--_accent) 55%, white),
			var(--_accent)
		);
		opacity: calc(0.15 + 0.35 * var(--_p, 0));
	}

	.theme-glass .handle {
		background: radial-gradient(
			120% 90% at 50% 0%,
			#fff 0%,
			rgba(255, 255, 255, 0.85) 45%,
			#d9dee7 100%
		);
		color: color-mix(in srgb, var(--_accent) 80%, black);
		box-shadow:
			inset 0 -2px 4px rgba(0, 0, 0, 0.12),
			0 1px 1px rgba(0, 0, 0, 0.25),
			0 6px 16px rgba(0, 0, 0, 0.35);
	}

	.theme-glass.dragging .handle {
		scale: 1.05;
	}

	.theme-glass .text {
		color: rgba(255, 255, 255, 0.75);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}

	.theme-glass.confirmed .fill {
		opacity: 0.9;
	}

	/* ---------- tonal: Material 3 tonal track, solid accent knob ---------- */
	.theme-tonal {
		--_inset: 0px;
	}

	.theme-tonal .track {
		border-radius: 16px;
		background: color-mix(in srgb, var(--_accent) 18%, transparent);
	}

	.theme-tonal .fill {
		background: color-mix(in srgb, var(--_accent) 38%, transparent);
		opacity: 1;
	}

	.theme-tonal .fill-clip,
	.theme-tonal .fill {
		border-radius: 16px;
	}

	.theme-tonal .handle {
		border-radius: 16px;
		background: var(--_accent);
		color: #fff;
		box-shadow: none;
	}

	.theme-tonal .text {
		color: color-mix(in srgb, var(--_accent) 70%, var(--_ink));
	}

	.theme-tonal.confirmed .fill {
		background: var(--_accent);
	}

	.theme-tonal.confirmed .handle {
		background: #fff;
		color: var(--_accent);
	}

	.theme-tonal.confirmed .text {
		color: #fff;
	}

	/* ---------- sunrise: gradient revealed as you slide ---------- */
	.theme-sunrise {
		--_inset: 4px;
	}

	.theme-sunrise .track {
		background: color-mix(in srgb, var(--_ink) 8%, transparent);
	}

	.theme-sunrise .fill {
		opacity: 1;
		background: linear-gradient(90deg, #ff8a3d, #ff4f7b 50%, #a855f7) 0 0 / var(--_track-w, 400px)
			100%;
		background-attachment: local;
	}

	.theme-sunrise .handle {
		background: #fff;
		color: #ff4f7b;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.3),
			0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.theme-sunrise.dragging .handle {
		scale: 1.05;
	}

	.theme-sunrise .text {
		color: color-mix(in srgb, var(--_ink) 60%, transparent);
	}

	.theme-sunrise.confirmed .track {
		box-shadow: 0 0 20px -4px #ff4f7b;
	}

	.theme-sunrise.confirmed .handle {
		color: #a855f7;
	}

	.theme-sunrise.confirmed .text {
		color: #fff;
	}

	/* ---------- outline: hairline track, accent knob ---------- */
	.theme-outline {
		--_inset: 4px;
	}

	.theme-outline .track {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--_accent) 55%, transparent);
	}

	.theme-outline .fill {
		background: color-mix(in srgb, var(--_accent) 22%, transparent);
		opacity: 1;
	}

	.theme-outline .handle {
		background: var(--_accent);
		color: #fff;
		box-shadow: 0 2px 10px color-mix(in srgb, var(--_accent) 45%, transparent);
	}

	.theme-outline .text {
		color: var(--_accent);
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.14em;
	}

	.theme-outline.dragging .handle {
		scale: 1.05;
	}

	.theme-outline.confirmed .fill {
		background: var(--_accent);
	}

	.theme-outline.confirmed .handle {
		background: #fff;
		color: var(--_accent);
	}

	.theme-outline.confirmed .text {
		color: #fff;
	}

	/* ---------- soft: neumorphic, pressed-in track and raised knob ---------- */
	.theme-soft {
		--_inset: 5px;
		--_soft-bg: var(--card-background-color, #1c1c1c);
	}

	.theme-soft .track {
		background: var(--_soft-bg);
		box-shadow:
			inset 4px 4px 10px rgba(0, 0, 0, 0.55),
			inset -4px -4px 10px rgba(255, 255, 255, 0.05);
	}

	.theme-soft .fill {
		display: none;
	}

	.theme-soft .handle {
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--_soft-bg) 80%, white),
			var(--_soft-bg)
		);
		color: color-mix(in srgb, var(--_ink) 70%, transparent);
		box-shadow:
			5px 5px 12px rgba(0, 0, 0, 0.55),
			-3px -3px 10px rgba(255, 255, 255, 0.06);
	}

	.theme-soft .text {
		color: color-mix(in srgb, var(--_ink) 40%, transparent);
	}

	.theme-soft.dragging .handle {
		scale: 0.97;
	}

	.theme-soft.confirmed .handle {
		color: var(--_accent);
		box-shadow:
			5px 5px 12px rgba(0, 0, 0, 0.55),
			-3px -3px 10px rgba(255, 255, 255, 0.06),
			0 0 16px -2px var(--_accent);
	}

	.theme-soft.confirmed .text {
		color: var(--_accent);
	}

	/* ---------- arrows: chevrons ripple toward the end ---------- */
	.theme-arrows {
		--_inset: 4px;
	}

	.theme-arrows .track {
		background: color-mix(in srgb, var(--_ink) 8%, transparent);
	}

	.theme-arrows .fill {
		background: var(--_accent);
		opacity: 0.85;
	}

	.theme-arrows .handle {
		background: #fff;
		color: var(--_accent);
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
	}

	.theme-arrows .text {
		font-size: 0;
	}

	.theme-arrows .text::after {
		content: "\\203A\\203A\\203A";
		font-size: 1.6rem;
		letter-spacing: 0.15em;
		color: transparent;
		background: linear-gradient(
				90deg,
				color-mix(in srgb, var(--_ink) 25%, transparent) 35%,
				var(--_ink) 50%,
				color-mix(in srgb, var(--_ink) 25%, transparent) 65%
			)
			0 0 / 300% 100% repeat-x;
		-webkit-background-clip: text;
		background-clip: text;
		animation: slide-confirm-shimmer 1.6s linear infinite reverse;
	}

	.theme-arrows.rtl .text::after {
		content: "\\2039\\2039\\2039";
		animation-direction: normal;
	}

	.theme-arrows.confirmed .text {
		font-size: var(--_font-size);
		color: #fff;
	}

	.theme-arrows.confirmed .text::after {
		content: none;
	}

	.theme-arrows.confirmed .fill {
		opacity: 1;
	}

	/* ---------- mono: black and white, inverts on lock ---------- */
	.theme-mono {
		--_inset: 4px;
	}

	.theme-mono .track {
		background: #f2f2f2;
	}

	.theme-mono .fill {
		display: none;
	}

	.theme-mono .handle {
		background: #111;
		color: #fff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.theme-mono .text {
		color: #111;
		font-weight: 600;
	}

	.theme-mono.dragging .handle {
		scale: 1.05;
	}

	.theme-mono.confirmed .track {
		background: #111;
		box-shadow: inset 0 0 0 1.5px #f2f2f2;
	}

	.theme-mono.confirmed .handle {
		background: #f2f2f2;
		color: #111;
	}

	.theme-mono.confirmed .text {
		color: #f2f2f2;
	}

	/* ---------- hazard: garage stripes revealed as you slide ---------- */
	.theme-hazard {
		--_inset: 4px;
	}

	.theme-hazard .track {
		background: color-mix(in srgb, var(--_ink) 8%, transparent);
	}

	.theme-hazard .fill {
		opacity: 1;
		background: repeating-linear-gradient(-45deg, #f5c400 0 14px, #1a1a1a 14px 28px);
	}

	.theme-hazard .handle {
		background: #f5c400;
		color: #1a1a1a;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
	}

	.theme-hazard .text {
		color: color-mix(in srgb, var(--_ink) 60%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.theme-hazard.dragging .handle {
		scale: 1.05;
	}

	.theme-hazard.confirmed .fill {
		background: #f5c400;
	}

	.theme-hazard.confirmed .handle {
		background: #1a1a1a;
		color: #f5c400;
	}

	.theme-hazard.confirmed .text {
		color: #1a1a1a;
	}

	/* ---------- aurora: a colour ring wakes up around the track ---------- */
	.theme-aurora {
		--_inset: 4px;
	}

	.theme-aurora .track {
		background: color-mix(in srgb, var(--_ink) 7%, transparent);
	}

	.theme-aurora .track::after {
		content: "";
		position: absolute;
		inset: -2px;
		border-radius: inherit;
		padding: 2px;
		background: linear-gradient(90deg, #22d3ee, #818cf8, #e879f9, #22d3ee) 0 0 / 300% 100%;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: calc(0.15 + 0.85 * var(--_p, 0));
		animation: slide-confirm-shimmer 3s linear infinite;
		pointer-events: none;
	}

	.theme-aurora .fill {
		background: linear-gradient(90deg, #22d3ee, #818cf8 60%, #e879f9);
		opacity: 0.35;
	}

	.theme-aurora .handle {
		background: #fff;
		color: #818cf8;
		box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
	}

	.theme-aurora.dragging .handle {
		scale: 1.05;
	}

	.theme-aurora .text {
		color: color-mix(in srgb, var(--_ink) 60%, transparent);
	}

	.theme-aurora.confirmed .track::after {
		opacity: 1;
	}

	.theme-aurora.confirmed .fill {
		opacity: 0.9;
	}

	.theme-aurora.confirmed .text {
		color: #fff;
	}

	@media (prefers-reduced-motion: reduce) {
		[class*="theme-"] .text,
		[class*="theme-"] .text::after,
		[class*="theme-"] .fill,
		[class*="theme-"] .track::after {
			animation: none;
		}

		[class*="theme-"] .handle {
			transition: none;
		}
	}
`;
