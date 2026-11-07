import {
	type ActionConfigInput,
	type CardConfigInput,
	isActionKind,
	SERVICE_PATTERN,
	type SliderConfigInput,
} from "./schema";
import { LEGACY_SLIDER_KEYS } from "./normalize";

/**
 * Rewrites a user's config from v1 spellings to v2 *without* adding defaults
 * or validating. This is what the editor's "Upgrade" button writes back, so
 * the user's YAML changes only where it has to. Key order is preserved so a
 * config that is already v2 round-trips byte-for-byte.
 *
 * `normalizeConfig()` is the strict, defaulting counterpart used at runtime.
 */

const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === "object" && v !== null && !Array.isArray(v);

export function migrateAction(raw: ActionConfigInput): ActionConfigInput {
	const out: ActionConfigInput = { ...raw };

	if (out.service_data !== undefined) {
		if (out.data === undefined) out.data = out.service_data;
		delete out.service_data;
	}
	if (out.action === "call-service") {
		out.action = "perform-action";
	}
	if (out.service !== undefined) {
		if (out.perform_action === undefined) out.perform_action = out.service;
		delete out.service;
	}
	// Developer Tools shape: `action: switch.toggle`
	if (
		typeof out.action === "string" &&
		!isActionKind(out.action) &&
		SERVICE_PATTERN.test(out.action)
	) {
		out.perform_action = out.action;
		out.action = "perform-action";
	}
	return out;
}

export function migrateSlider(raw: SliderConfigInput): SliderConfigInput {
	const out: SliderConfigInput = { ...raw };
	for (const [oldKey, newKey] of Object.entries(LEGACY_SLIDER_KEYS)) {
		if (oldKey in out) {
			if (out[newKey] === undefined) (out as Record<string, unknown>)[newKey] = out[oldKey];
			delete out[oldKey];
		}
	}
	if (isObject(out.confirm_action)) {
		out.confirm_action = migrateAction(out.confirm_action as ActionConfigInput);
	}
	return out;
}

export function migrateConfig(raw: CardConfigInput): CardConfigInput {
	if (!Array.isArray(raw.sliders)) return { ...raw };
	return {
		...raw,
		sliders: raw.sliders.map((s) => (isObject(s) ? migrateSlider(s as SliderConfigInput) : s)),
	};
}

/** True when `migrateConfig` would change anything, i.e. the config uses v1 spellings. */
export function hasLegacyKeys(raw: unknown): boolean {
	if (!isObject(raw)) return false;
	return JSON.stringify(migrateConfig(raw as CardConfigInput)) !== JSON.stringify(raw);
}
