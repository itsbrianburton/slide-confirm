import { describe, expect, it } from "vitest";
import { STYLE_KEYS } from "../../src/config";
import {
	mergeStyles,
	STYLE_VARS,
	styleToCustomProperties,
	styleValue,
	styleVarName,
} from "../../src/logic";

describe("styleVarName / STYLE_VARS", () => {
	it("prefixes and kebab-cases the key", () => {
		expect(styleVarName("handle_size")).toBe("--slide-confirm-handle-size");
		expect(styleVarName("confirmed_text_color")).toBe("--slide-confirm-confirmed-text-color");
	});

	it("covers every style key exactly once", () => {
		expect(Object.keys(STYLE_VARS).sort()).toEqual([...STYLE_KEYS].sort());
		expect(new Set(Object.values(STYLE_VARS)).size).toBe(STYLE_KEYS.length);
	});
});

describe("styleValue", () => {
	it("adds px to bare numbers for length keys only", () => {
		expect(styleValue("handle_size", 44)).toBe("44px");
		expect(styleValue("border_radius", 0)).toBe("0px");
		expect(styleValue("fill_opacity", 0.3)).toBe("0.3");
	});

	it("passes strings through trimmed", () => {
		expect(styleValue("handle_size", " 2.5rem ")).toBe("2.5rem");
		expect(styleValue("confirmed_color", "var(--error-color)")).toBe("var(--error-color)");
	});
});

describe("mergeStyles", () => {
	it("later layers win and empties are skipped", () => {
		expect(
			mergeStyles({ handle_size: 50, text_color: "red" }, undefined, {
				handle_size: 40,
				font_size: "",
			}),
		).toEqual({ handle_size: 40, text_color: "red" });
	});

	it("returns undefined when nothing is set", () => {
		expect(mergeStyles(undefined, {}, { font_size: "" })).toBeUndefined();
	});
});

describe("styleToCustomProperties", () => {
	it("maps keys to custom properties with rendered values", () => {
		expect(
			styleToCustomProperties({
				handle_size: 44,
				confirmed_color: "#f00",
				fill_opacity: 0.4,
				font_size: "0.9rem",
			}),
		).toEqual({
			"--slide-confirm-handle-size": "44px",
			"--slide-confirm-confirmed-color": "#f00",
			"--slide-confirm-fill-opacity": "0.4",
			"--slide-confirm-font-size": "0.9rem",
		});
	});

	it("returns an empty object for no style and ignores unknown keys", () => {
		expect(styleToCustomProperties(undefined)).toEqual({});
		expect(styleToCustomProperties({ colour: "red" } as never)).toEqual({});
	});
});
