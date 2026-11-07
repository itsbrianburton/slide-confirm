import { STYLE_KEYS, type StyleConfig } from "../config/schema";

/**
 * Maps the `style:` config block onto `--slide-confirm-*` custom properties.
 * Pure, so it is unit tested in Node; the component feeds the result to Lit's
 * `styleMap`.
 */

export const STYLE_VAR_PREFIX = "--slide-confirm-";

/** `handle_size` -> `--slide-confirm-handle-size` */
export function styleVarName(key: keyof StyleConfig): string {
	return STYLE_VAR_PREFIX + key.replace(/_/g, "-");
}

/** Every style key with its custom property name, for docs and the editor. */
export const STYLE_VARS: Readonly<Record<keyof StyleConfig, string>> = Object.fromEntries(
	STYLE_KEYS.map((key) => [key, styleVarName(key)]),
) as Record<keyof StyleConfig, string>;

/** Keys whose bare numbers mean pixels. */
const LENGTH_KEYS: ReadonlySet<keyof StyleConfig> = new Set<keyof StyleConfig>([
	"handle_size",
	"track_height",
	"border_radius",
	"font_size",
]);

/** Later layers win. Undefined layers and keys are skipped. */
export function mergeStyles(...layers: Array<StyleConfig | undefined>): StyleConfig | undefined {
	const merged: Record<string, string | number> = {};
	for (const layer of layers) {
		if (!layer) continue;
		for (const [key, value] of Object.entries(layer)) {
			if (value !== undefined && value !== null && value !== "") merged[key] = value;
		}
	}
	return Object.keys(merged).length ? (merged as StyleConfig) : undefined;
}

/** Render one value as CSS text. Bare numbers get `px` for length keys. */
export function styleValue(key: keyof StyleConfig, value: string | number): string {
	if (typeof value === "number") {
		return LENGTH_KEYS.has(key) ? `${value}px` : String(value);
	}
	return value.trim();
}

/**
 * `{ handle_size: 44 }` -> `{ "--slide-confirm-handle-size": "44px" }`.
 * Unknown keys are dropped (the normalizer has already warned about them).
 */
export function styleToCustomProperties(style?: StyleConfig): Record<string, string> {
	const out: Record<string, string> = {};
	if (!style) return out;
	for (const key of STYLE_KEYS) {
		const value = style[key];
		if (value === undefined || value === null || value === "") continue;
		out[STYLE_VARS[key]] = styleValue(key, value);
	}
	return out;
}
