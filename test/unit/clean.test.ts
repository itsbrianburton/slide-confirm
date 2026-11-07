import { describe, expect, it } from "vitest";
import { clean } from "../../src/util/clean";

describe("clean", () => {
	it("removes undefined, null and empty strings", () => {
		expect(clean({ a: 1, b: undefined, c: null, d: "", e: "x" })).toEqual({ a: 1, e: "x" });
	});

	it("removes empty objects and arrays, recursively", () => {
		expect(
			clean({
				style: {},
				confirm_action: { action: "toggle", target: {}, data: { x: "" } },
				disabled_states: [],
				list: [null, "a", ""],
			}),
		).toEqual({ confirm_action: { action: "toggle" }, list: ["a"] });
	});

	it("keeps listed keys as empty arrays", () => {
		expect(clean({ sliders: [], header: "" }, new Set(["sliders"]))).toEqual({ sliders: [] });
		expect(clean({ sliders: [{ name: "" }] }, new Set(["sliders"]))).toEqual({ sliders: [] });
	});

	it("keeps falsy-but-meaningful values", () => {
		expect(clean({ reset_delay: 0, haptic: false })).toEqual({ reset_delay: 0, haptic: false });
	});

	it("returns an empty object/array at the root rather than undefined", () => {
		expect(clean({ a: "" })).toEqual({});
		expect(clean([""])).toEqual([]);
		expect(clean("")).toBeUndefined();
	});
});
