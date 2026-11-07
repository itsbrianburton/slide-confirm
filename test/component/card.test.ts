import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { SlideConfirmCard } from "../../src/card";
import type { SlideConfirmSlider, SlideConfirmedDetail } from "../../src/slider";
import type { HomeAssistant } from "../../src/types/home-assistant";
import v1Readme from "../fixtures/v1-readme-config.json";
import v2Full from "../fixtures/v2-full-config.json";

beforeAll(async () => {
	await import("../../src/index");
});

const mounted: HTMLElement[] = [];

async function mountCard(raw: unknown, hass?: HomeAssistant): Promise<SlideConfirmCard> {
	const wrapper = document.createElement("div");
	wrapper.style.width = "400px";
	document.body.append(wrapper);
	mounted.push(wrapper);

	const card = document.createElement("slide-confirm-card") as SlideConfirmCard;
	card.setConfig(raw);
	if (hass) card.hass = hass;
	wrapper.append(card);
	await card.updateComplete;
	return card;
}

const slidersOf = (card: SlideConfirmCard) =>
	[...card.shadowRoot!.querySelectorAll("slide-confirm-slider")] as SlideConfirmSlider[];

const fakeHass = (states: Record<string, string> = {}) =>
	({
		states: Object.fromEntries(
			Object.entries(states).map(([id, state]) => [
				id,
				{ entity_id: id, state, attributes: {}, last_changed: "", last_updated: "", context: {} },
			]),
		),
		callService: async () => undefined,
	}) as unknown as HomeAssistant;

afterEach(() => {
	for (const w of mounted.splice(0)) w.remove();
	vi.restoreAllMocks();
});

describe("slide-confirm-card: config", () => {
	it("renders one slider per entry with the normalized config", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const card = await mountCard(v1Readme);

		const sliders = slidersOf(card);
		expect(sliders).toHaveLength(4);
		expect(new Set(sliders.map((s) => s.parentElement)).size).toBe(1);
		expect(sliders[0].config.text_unconfirmed).toBe("Slide to Unlock");
		expect(sliders[0].config.confirm_action).toEqual({
			action: "perform-action",
			perform_action: "input_boolean.turn_on",
			target: { entity_id: "input_boolean.slide_confirm" },
		});
		expect(card.config?.sliders[3].confirm_action.target).toEqual({ area_id: "garage" });

		// Legacy keys are reported once, in one console.warn.
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("`textUnconfirmed` is deprecated");
	});

	it("does not warn for a clean v2 config, and warns once per distinct set of notes", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const card = await mountCard(v2Full);
		expect(warn).not.toHaveBeenCalled();

		card.setConfig(v1Readme);
		card.setConfig(v1Readme);
		expect(warn).toHaveBeenCalledTimes(1);

		card.setConfig({ ...v1Readme, sliders: v1Readme.sliders.slice(0, 1) });
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it("throws a readable error for invalid configs so HA can show it", async () => {
		const card = document.createElement("slide-confirm-card") as SlideConfirmCard;
		expect(() => card.setConfig({})).toThrow("`sliders` must be a non-empty list");
		expect(() => card.setConfig({ sliders: [{ text_unconfirmed: "x" }] })).toThrow(
			"Slider 1.confirm_action is required",
		);
	});

	it("passes the header to ha-card and omits it when absent", async () => {
		const withHeader = await mountCard(v2Full);
		expect((withHeader.shadowRoot!.querySelector("ha-card") as { header?: string }).header).toBe(
			"Doors",
		);
		const without = await mountCard({ sliders: v2Full.sliders });
		expect(
			(without.shadowRoot!.querySelector("ha-card") as { header?: string }).header,
		).toBeUndefined();
	});

	it("applies card-level style as custom properties; slider-level overrides sit inside", async () => {
		const card = await mountCard({
			style: { handle_size: 40, confirmed_color: "red" },
			sliders: [
				{ confirm_action: { action: "toggle" }, style: { confirmed_color: "blue" } },
				{ confirm_action: { action: "toggle" } },
			],
		});
		const content = card.shadowRoot!.querySelector(".card-content") as HTMLElement;
		expect(content.style.getPropertyValue("--slide-confirm-handle-size")).toBe("40px");
		expect(content.style.getPropertyValue("--slide-confirm-confirmed-color")).toBe("red");

		const [first, second] = slidersOf(card);
		const rootOf = (s: SlideConfirmSlider) => s.shadowRoot!.querySelector(".slider") as HTMLElement;
		expect(rootOf(first).style.getPropertyValue("--slide-confirm-confirmed-color")).toBe("blue");
		expect(rootOf(second).style.getPropertyValue("--slide-confirm-confirmed-color")).toBe("");
		// Both handles inherit the card-level size.
		for (const s of [first, second]) {
			expect(s.shadowRoot!.querySelector(".handle")!.getBoundingClientRect().width).toBe(40);
		}
	});

	it("provides a stub config that normalizes cleanly and targets a helper", async () => {
		const ctor = customElements.get("slide-confirm-card") as typeof SlideConfirmCard;
		const stub = ctor.getStubConfig();
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const card = await mountCard(stub);
		expect(warn).not.toHaveBeenCalled();
		expect(card.config?.sliders[0].confirm_action.perform_action).toBe("input_boolean.turn_on");
	});
});

describe("slide-confirm-card: hass plumbing", () => {
	it("passes hass to every slider and propagates updates", async () => {
		const hass1 = fakeHass({ "lock.a": "locked" });
		const card = await mountCard(
			{ sliders: [{ entity: "lock.a", confirm_action: { action: "toggle" } }] },
			hass1,
		);
		const [slider] = slidersOf(card);
		expect(slider.hass).toBe(hass1);

		const hass2 = fakeHass({ "lock.a": "unlocked" });
		card.hass = hass2;
		await card.updateComplete;
		expect(slider.hass).toBe(hass2);
	});
});

describe("slide-confirm-card: actions", () => {
	it("turns slide-confirmed into HA's hass-action event and stops the inner event", async () => {
		const card = await mountCard({
			sliders: [
				{
					entity: "lock.front_door",
					confirm_action: {
						action: "perform-action",
						perform_action: "lock.unlock",
						target: { entity_id: "lock.front_door" },
					},
				},
			],
		});
		const [slider] = slidersOf(card);

		const hassActions: CustomEvent[] = [];
		const leaked: Event[] = [];
		const onHassAction = (e: Event) => hassActions.push(e as CustomEvent);
		const onLeak = (e: Event) => leaked.push(e);
		document.addEventListener("hass-action", onHassAction);
		document.addEventListener("slide-confirmed", onLeak);
		try {
			slider.dispatchEvent(
				new CustomEvent<SlideConfirmedDetail>("slide-confirmed", {
					detail: { action: slider.config.confirm_action, config: slider.config },
					bubbles: true,
					composed: true,
				}),
			);
		} finally {
			document.removeEventListener("hass-action", onHassAction);
			document.removeEventListener("slide-confirmed", onLeak);
		}

		expect(leaked).toHaveLength(0);
		expect(hassActions).toHaveLength(1);
		expect(hassActions[0].composed).toBe(true);
		expect(hassActions[0].detail).toEqual({
			action: "tap",
			config: {
				entity: "lock.front_door",
				tap_action: {
					action: "perform-action",
					perform_action: "lock.unlock",
					target: { entity_id: "lock.front_door" },
				},
			},
		});
	});

	it("omits entity from the action config when the slider has none", async () => {
		const card = await mountCard({
			sliders: [{ confirm_action: { action: "navigate", navigation_path: "/lovelace/1" } }],
		});
		const [slider] = slidersOf(card);
		const seen: CustomEvent[] = [];
		const on = (e: Event) => seen.push(e as CustomEvent);
		document.addEventListener("hass-action", on);
		try {
			slider.dispatchEvent(
				new CustomEvent("slide-confirmed", {
					detail: { action: slider.config.confirm_action, config: slider.config },
					bubbles: true,
					composed: true,
				}),
			);
		} finally {
			document.removeEventListener("hass-action", on);
		}
		expect(seen[0].detail.config).toEqual({
			tap_action: { action: "navigate", navigation_path: "/lovelace/1" },
		});
	});
});

describe("slide-confirm-card: sizing", () => {
	it("grows with the number of sliders and their headers", async () => {
		const bare = await mountCard({ sliders: [{ confirm_action: { action: "toggle" } }] });
		const two = await mountCard({
			header: "Doors",
			sliders: [
				{ name: "A", confirm_action: { action: "toggle" } },
				{ name: "B", confirm_action: { action: "toggle" } },
			],
		});
		expect(bare.getCardSize()).toBeGreaterThanOrEqual(1);
		expect(two.getCardSize()).toBeGreaterThan(bare.getCardSize());

		const g1 = bare.getGridOptions();
		const g2 = two.getGridOptions();
		expect(g1.columns).toBe("full");
		expect(g1.min_columns).toBe(6);
		expect(g1.rows).toBe(g1.min_rows);
		expect(g2.rows as number).toBeGreaterThan(g1.rows as number);
	});
});
