/**
 * Strip the empties `ha-form` produces when a field is cleared, so they never
 * reach the user's YAML: `undefined`, `null`, `""`, empty arrays and objects
 * that become empty after cleaning. Arrays keep their order; keys listed in
 * `keep` survive even when empty (the card needs `sliders` to stay a list).
 */
export function clean<T>(value: T, keep: ReadonlySet<string> = new Set()): T | undefined {
	return cleanValue(value, keep, true) as T | undefined;
}

function cleanValue(value: unknown, keep: ReadonlySet<string>, root: boolean): unknown {
	if (value === undefined || value === null || value === "") return undefined;

	if (Array.isArray(value)) {
		const items = value.map((v) => cleanValue(v, keep, false)).filter((v) => v !== undefined);
		return items.length || root ? items : undefined;
	}

	if (typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const cleaned = cleanValue(v, keep, false);
			if (cleaned !== undefined) {
				out[k] = cleaned;
			} else if (keep.has(k) && Array.isArray(v)) {
				out[k] = [];
			}
		}
		return Object.keys(out).length || root ? out : undefined;
	}

	return value;
}
