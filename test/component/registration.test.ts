import { beforeAll, describe, expect, it } from "vitest";

// Importing the entry point must register the elements and advertise the card.

beforeAll(async () => {
	await import("../../src/index");
});

describe("element registration", () => {
	it("defines the card and slider elements", () => {
		expect(customElements.get("slide-confirm-card")).toBeDefined();
		expect(customElements.get("slide-confirm-slider")).toBeDefined();
	});

	it("no longer defines the v1 slider element", () => {
		expect(customElements.get("slide-confirm")).toBeUndefined();
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
