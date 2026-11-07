import { beforeAll, describe, expect, it } from "vitest";

// Smoke test for the browser project: importing the entry point must register
// the custom elements and the card must render into a real shadow DOM.

beforeAll(async () => {
	await import("../../src/index");
});

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe("element registration", () => {
	it("defines the card and slider elements", () => {
		expect(customElements.get("slide-confirm-card")).toBeDefined();
		expect(customElements.get("slide-confirm")).toBeDefined();
	});

	it("advertises the card to the Home Assistant card picker", () => {
		expect(window.customCards).toEqual(
			expect.arrayContaining([expect.objectContaining({ type: "slide-confirm-card" })]),
		);
	});

	it("renders one slider element per configured slider", async () => {
		const card = document.createElement("slide-confirm-card") as HTMLElement & {
			setConfig(config: unknown): void;
		};
		card.setConfig({
			type: "custom:slide-confirm-card",
			sliders: [
				{
					name: "Front Door",
					textUnconfirmed: "Slide to Unlock",
					textConfirmed: "Door Unlocked!",
					iconUnconfirmed: "mdi:lock",
					iconConfirmed: "mdi:lock-open",
					confirm_action: { action: "call-service", service: "lock.unlock" },
				},
				{
					name: "Back Door",
					textUnconfirmed: "Slide to Unlock",
					textConfirmed: "Door Unlocked!",
					iconUnconfirmed: "mdi:lock",
					iconConfirmed: "mdi:lock-open",
					confirm_action: { action: "call-service", service: "lock.unlock" },
				},
			],
		});
		document.body.append(card);
		await nextFrame();
		await nextFrame();

		const sliders = card.shadowRoot!.querySelectorAll("slide-confirm");
		expect(sliders).toHaveLength(2);

		// Sliders must be siblings, not nested inside each other.
		expect(sliders[1].parentElement).toBe(sliders[0].parentElement);

		const handle = sliders[0].shadowRoot!.querySelector(".slide-confirm-handle");
		expect(handle).not.toBeNull();
		expect(sliders[0].shadowRoot!.textContent).toContain("Slide to Unlock");

		card.remove();
	});
});
