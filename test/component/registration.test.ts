import { beforeAll, describe, expect, it } from "vitest";
import type { SlideConfirmCard } from "../../src/card";

// Importing the entry point must register the elements and advertise the card.

beforeAll(async () => {
	await import("../../src/index");
});

describe("element registration", () => {
	it("defines the card, slider and editor elements", () => {
		expect(customElements.get("slide-confirm-card")).toBeDefined();
		expect(customElements.get("slide-confirm-slider")).toBeDefined();
		expect(customElements.get("slide-confirm-card-editor")).toBeDefined();
	});

	it("no longer defines the v1 slider element", () => {
		expect(customElements.get("slide-confirm")).toBeUndefined();
	});

	it("getConfigElement returns the registered editor", () => {
		const ctor = customElements.get("slide-confirm-card") as typeof SlideConfirmCard;
		const el = ctor.getConfigElement();
		expect(el.tagName.toLowerCase()).toBe("slide-confirm-card-editor");
		expect(el).toBeInstanceOf(customElements.get("slide-confirm-card-editor")!);
	});

	it("advertises the card to the Home Assistant card picker with a preview", () => {
		expect(window.customCards).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "slide-confirm-card",
					preview: true,
					documentationURL: expect.stringContaining("github.com"),
				}),
			]),
		);
	});

	it("injects the package version at build time", () => {
		expect(__VERSION__).toMatch(/^\d+\.\d+\.\d+/);
	});
});
