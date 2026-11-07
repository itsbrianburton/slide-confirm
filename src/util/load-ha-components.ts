/**
 * The editor builds on Home Assistant's own form components (`ha-form`,
 * `ha-selector`, `ha-expansion-panel`, ...). HA loads those lazily with its
 * built-in card editors, so we ask a built-in card for its editor to pull them
 * in. Same approach as PR #16 and most community cards.
 *
 * Resolves quietly when nothing can be loaded (tests, odd HA builds); the
 * editor then renders the unknown elements as empty boxes instead of failing.
 */

interface CardHelpers {
	createCardElement(config: Record<string, unknown>): HTMLElement & {
		constructor: { getConfigElement?: () => unknown };
	};
}

declare global {
	interface Window {
		loadCardHelpers?: () => Promise<CardHelpers>;
	}
}

const NEEDED = ["ha-form", "ha-expansion-panel", "ha-alert", "ha-icon-button"];

let pending: Promise<void> | undefined;

export function loadHaComponents(): Promise<void> {
	if (NEEDED.every((tag) => customElements.get(tag))) return Promise.resolve();
	pending ??= load().catch(() => undefined);
	return pending;
}

async function load(): Promise<void> {
	for (const tag of ["hui-button-card", "hui-entities-card"]) {
		const ctor = customElements.get(tag) as { getConfigElement?: () => unknown } | undefined;
		await ctor?.getConfigElement?.();
	}
	if (customElements.get("ha-form")) return;

	const helpers = await window.loadCardHelpers?.();
	if (!helpers) return;
	const button = helpers.createCardElement({ type: "button", entity: "light.none" });
	await button.constructor.getConfigElement?.();
}
