import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { normalizeConfig, type SliderConfig } from "../../src/config";
import type { SlideConfirmSlider, SlideConfirmedDetail } from "../../src/slider";
import type { HomeAssistant } from "../../src/types/home-assistant";

beforeAll(async () => {
	await import("../../src/index");
});

// Deterministic layout: a 400px wide host so the 50px handle has 350px of travel.
const HOST_WIDTH = 400;

const baseConfig = (overrides: Partial<SliderConfig> = {}): SliderConfig => ({
	text_unconfirmed: "Slide to Unlock",
	text_confirmed: "Door Unlocked!",
	icon_unconfirmed: "mdi:lock",
	icon_confirmed: "mdi:lock-open",
	direction: "ltr",
	reset_delay: 60,
	haptic: false,
	confirm_action: {
		action: "perform-action",
		perform_action: "lock.unlock",
		target: { entity_id: "lock.front_door" },
	},
	...overrides,
});

const hassWith = (entityId: string, state: string, attributes: Record<string, unknown> = {}) =>
	({
		states: {
			[entityId]: {
				entity_id: entityId,
				state,
				attributes,
				last_changed: "",
				last_updated: "",
				context: { id: "", user_id: null, parent_id: null },
			},
		},
		callService: async () => undefined,
	}) as unknown as HomeAssistant;

interface Mounted {
	el: SlideConfirmSlider;
	handle: HTMLElement;
	track: HTMLElement;
	root: HTMLElement;
	events: CustomEvent<SlideConfirmedDetail>[];
	/** clientX that puts the handle's centre at `progress`. */
	xAt(progress: number): number;
	pointer(type: string, clientX: number, init?: Partial<PointerEventInit>): void;
	key(key: string): void;
	drag(from: number, to: number): Promise<void>;
	settle(): Promise<void>;
}

const mounted: HTMLElement[] = [];

async function mount(config: SliderConfig, hass?: HomeAssistant): Promise<Mounted> {
	const wrapper = document.createElement("div");
	wrapper.style.width = `${HOST_WIDTH}px`;
	document.body.append(wrapper);
	mounted.push(wrapper);

	const el = document.createElement("slide-confirm-slider") as SlideConfirmSlider;
	el.config = config;
	if (hass) el.hass = hass;
	const events: CustomEvent<SlideConfirmedDetail>[] = [];
	el.addEventListener("slide-confirmed", (e) =>
		events.push(e as CustomEvent<SlideConfirmedDetail>),
	);
	wrapper.append(el);
	await el.updateComplete;

	const root = el.shadowRoot!.querySelector(".slider") as HTMLElement;
	const handle = el.shadowRoot!.querySelector(".handle") as HTMLElement;
	const track = el.shadowRoot!.querySelector(".track") as HTMLElement;

	const xAt = (progress: number) => {
		const t = track.getBoundingClientRect();
		const h = handle.getBoundingClientRect().width;
		const travel = t.width - h;
		const fromLeft = config.direction === "rtl" ? 1 - progress : progress;
		return t.left + h / 2 + fromLeft * travel;
	};
	const pointer = (type: string, clientX: number, init: Partial<PointerEventInit> = {}) => {
		handle.dispatchEvent(
			new PointerEvent(type, {
				clientX,
				clientY: 0,
				pointerId: 1,
				pointerType: "touch",
				isPrimary: true,
				bubbles: true,
				composed: true,
				cancelable: true,
				...init,
			}),
		);
	};
	const key = (k: string) =>
		handle.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
	const settle = async () => {
		await el.updateComplete;
	};
	const drag = async (from: number, to: number) => {
		pointer("pointerdown", xAt(from));
		await settle();
		pointer("pointermove", xAt((from + to) / 2));
		pointer("pointermove", xAt(to));
		await settle();
		pointer("pointerup", xAt(to));
		await settle();
	};

	return { el, handle, track, root, events, xAt, pointer, key, drag, settle };
}

afterEach(() => {
	for (const w of mounted.splice(0)) w.remove();
	vi.useRealTimers();
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("slide-confirm-slider: rendering", () => {
	it("renders the unconfirmed text and icon with ARIA slider semantics", async () => {
		const { el, handle } = await mount(baseConfig({ name: "Front Door", icon: "mdi:door" }));
		const sr = el.shadowRoot!;
		expect(sr.querySelector(".text")!.textContent?.trim()).toBe("Slide to Unlock");
		expect(sr.querySelector(".name")!.textContent).toBe("Front Door");
		expect((sr.querySelector(".header ha-icon") as { icon?: string }).icon).toBe("mdi:door");
		expect((handle.querySelector("ha-icon") as { icon?: string }).icon).toBe("mdi:lock");

		expect(handle.getAttribute("role")).toBe("slider");
		expect(handle.getAttribute("tabindex")).toBe("0");
		expect(handle.getAttribute("aria-valuenow")).toBe("0");
		expect(handle.getAttribute("aria-valuemax")).toBe("100");
		expect(handle.getAttribute("aria-label")).toBe("Front Door: Slide to Unlock");
		expect(handle.getAttribute("aria-disabled")).toBe("false");
	});

	it("omits the header when there is no name, icon or label", async () => {
		const { el } = await mount(baseConfig());
		expect(el.shadowRoot!.querySelector(".header")).toBeNull();
	});

	it("exposes CSS shadow parts", async () => {
		const { el } = await mount(baseConfig({ name: "x", label: "y" }));
		const parts = [...el.shadowRoot!.querySelectorAll("[part]")].map((n) => n.getAttribute("part"));
		for (const p of ["slider", "header", "name", "label", "track", "fill", "text", "handle"]) {
			expect(parts).toContain(p);
		}
	});

	it("clips the fill to the track so a shrinking fill never pokes past the rounded end", async () => {
		const { el, track } = await mount(baseConfig());
		const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
		const clip = fill.parentElement as HTMLElement;
		expect(clip).not.toBe(track);
		expect(clip.parentElement).toBe(track);
		expect(getComputedStyle(clip).overflow).toBe("hidden");
		expect(getComputedStyle(clip).borderRadius).toBe(getComputedStyle(track).borderRadius);
		// The handle is not inside the clipping layer.
		expect(el.shadowRoot!.querySelector(".handle")!.parentElement).toBe(track);
	});

	it("applies the style block as --slide-confirm-* custom properties", async () => {
		const { root, handle } = await mount(
			baseConfig({ style: { handle_size: 40, confirmed_color: "rgb(255, 0, 0)" } }),
		);
		expect(root.style.getPropertyValue("--slide-confirm-handle-size")).toBe("40px");
		expect(root.style.getPropertyValue("--slide-confirm-confirmed-color")).toBe("rgb(255, 0, 0)");
		expect(handle.getBoundingClientRect().width).toBe(40);
	});

	it("falls back to the entity's friendly name and uses ha-state-icon", async () => {
		const hass = hassWith("lock.front_door", "locked", { friendly_name: "Front Door Lock" });
		const { el } = await mount(baseConfig({ entity: "lock.front_door" }), hass);
		expect(el.shadowRoot!.querySelector(".name")!.textContent).toBe("Front Door Lock");
		expect(el.shadowRoot!.querySelector(".header ha-state-icon")).not.toBeNull();
	});

	it("rtl: marks the root so CSS anchors the handle on the right", async () => {
		const { root, handle, track } = await mount(baseConfig({ direction: "rtl" }));
		expect(root.classList.contains("rtl")).toBe(true);
		const h = handle.getBoundingClientRect();
		const t = track.getBoundingClientRect();
		expect(Math.round(h.right)).toBe(Math.round(t.right));
	});
});

describe("slide-confirm-slider: dragging", () => {
	it("follows the pointer and shows the fill while dragging", async () => {
		const { el, root, handle, pointer, xAt, settle } = await mount(baseConfig());
		pointer("pointerdown", xAt(0));
		await settle();
		expect(root.classList.contains("dragging")).toBe(true);
		expect(el.shadowRoot!.activeElement).toBe(handle);

		pointer("pointermove", xAt(0.5));
		await settle();
		expect(el.progress).toBeCloseTo(0.5, 2);
		expect(root.style.getPropertyValue("--_x")).toBe("175px");
		expect(root.style.getPropertyValue("--_fill")).toBe("225px");
		expect(handle.getAttribute("aria-valuenow")).toBe("50");
		expect(
			Math.round(handle.getBoundingClientRect().left - root.getBoundingClientRect().left),
		).toBe(175);
	});

	it("springs back without confirming when released early", async () => {
		const { el, root, events, drag } = await mount(baseConfig());
		await drag(0, 0.9);
		expect(el.progress).toBe(0);
		expect(el.confirmed).toBe(false);
		expect(root.classList.contains("dragging")).toBe(false);
		expect(root.style.getPropertyValue("--_x")).toBe("");
		expect(events).toHaveLength(0);
	});

	it("confirms at the far end, fires slide-confirmed, then resets after reset_delay", async () => {
		const config = baseConfig({ reset_delay: 60 });
		const { el, root, events, drag } = await mount(config);
		await drag(0, 1);

		expect(el.confirmed).toBe(true);
		expect(el.progress).toBe(1);
		expect(root.classList.contains("confirmed")).toBe(true);
		expect(el.shadowRoot!.querySelector(".text")!.textContent?.trim()).toBe("Door Unlocked!");
		expect((el.shadowRoot!.querySelector(".handle ha-icon") as { icon?: string }).icon).toBe(
			"mdi:lock-open",
		);
		expect(root.style.getPropertyValue("--_x")).toBe("350px");

		expect(events).toHaveLength(1);
		expect(events[0].detail.action).toEqual(config.confirm_action);
		expect(events[0].detail.config).toBe(config);
		expect(events[0].bubbles).toBe(true);
		expect(events[0].composed).toBe(true);

		await sleep(90);
		await el.updateComplete;
		expect(el.confirmed).toBe(false);
		expect(el.progress).toBe(0);
		expect(el.shadowRoot!.querySelector(".text")!.textContent?.trim()).toBe("Slide to Unlock");
	});

	it("confirms within the 2px threshold of the far end", async () => {
		const { el, drag, xAt } = await mount(baseConfig());
		// 1px short of the end
		const oneShort = (xAt(1) - 1 - xAt(0)) / (xAt(1) - xAt(0));
		await drag(0, oneShort);
		expect(el.confirmed).toBe(true);
	});

	it("rtl: confirms by dragging to the left and not to the right", async () => {
		const { el, events, drag, root } = await mount(baseConfig({ direction: "rtl" }));
		await drag(0, 0.5);
		expect(events).toHaveLength(0);

		await drag(0, 1);
		expect(el.confirmed).toBe(true);
		expect(root.style.getPropertyValue("--_x")).toBe("-350px");
		expect(events).toHaveLength(1);
	});

	it("rtl: moving the pointer to the right from rest does nothing", async () => {
		const { el, pointer, xAt, settle, track } = await mount(baseConfig({ direction: "rtl" }));
		pointer("pointerdown", xAt(0));
		await settle();
		pointer("pointermove", track.getBoundingClientRect().right + 200);
		await settle();
		expect(el.progress).toBe(0);
	});

	it("ignores input while confirmed", async () => {
		const { el, events, drag } = await mount(baseConfig({ reset_delay: 1000 }));
		await drag(0, 1);
		await drag(0, 1);
		expect(events).toHaveLength(1);
		expect(el.confirmed).toBe(true);
	});

	it("pointercancel aborts the drag and springs back", async () => {
		const { el, root, pointer, xAt, settle } = await mount(baseConfig());
		pointer("pointerdown", xAt(0));
		pointer("pointermove", xAt(0.7));
		await settle();
		expect(el.progress).toBeCloseTo(0.7, 2);
		pointer("pointercancel", xAt(0.7));
		await settle();
		expect(el.progress).toBe(0);
		expect(root.classList.contains("dragging")).toBe(false);
	});

	it("ignores moves from a different pointer", async () => {
		const { el, pointer, xAt, settle } = await mount(baseConfig());
		pointer("pointerdown", xAt(0), { pointerId: 1 });
		pointer("pointermove", xAt(0.8), { pointerId: 2 });
		await settle();
		expect(el.progress).toBe(0);
	});

	it("ignores secondary mouse buttons", async () => {
		const { root, pointer, xAt, settle } = await mount(baseConfig());
		pointer("pointerdown", xAt(0), { pointerType: "mouse", button: 2 });
		await settle();
		expect(root.classList.contains("dragging")).toBe(false);
	});
});

describe("slide-confirm-slider: keyboard", () => {
	it("ltr: ten ArrowRight presses confirm; ArrowLeft retreats; Home resets", async () => {
		const { el, key, settle, handle } = await mount(baseConfig());
		key("ArrowRight");
		key("ArrowRight");
		key("ArrowLeft");
		await settle();
		expect(el.progress).toBeCloseTo(0.1);
		expect(handle.getAttribute("aria-valuenow")).toBe("10");

		key("Home");
		await settle();
		expect(el.progress).toBe(0);

		for (let i = 0; i < 10; i++) key("ArrowRight");
		await settle();
		expect(el.confirmed).toBe(true);
	});

	it("rtl: ArrowLeft advances", async () => {
		const { el, key, settle } = await mount(baseConfig({ direction: "rtl" }));
		for (let i = 0; i < 10; i++) key("ArrowLeft");
		await settle();
		expect(el.confirmed).toBe(true);
	});

	it("End and Enter do not jump to confirmed", async () => {
		const { el, key, settle } = await mount(baseConfig());
		key("End");
		key("Enter");
		key(" ");
		await settle();
		expect(el.progress).toBe(0);
		expect(el.confirmed).toBe(false);
	});
});

describe("slide-confirm-slider: haptic", () => {
	const haptics: CustomEvent[] = [];
	const listener = (e: Event) => haptics.push(e as CustomEvent);

	it("fires HA's haptic event on window only when enabled", async () => {
		window.addEventListener("haptic", listener);
		try {
			const off = await mount(baseConfig({ haptic: false }));
			await off.drag(0, 1);
			expect(haptics).toHaveLength(0);

			const on = await mount(baseConfig({ haptic: true }));
			await on.drag(0, 1);
			expect(haptics).toHaveLength(1);
			expect(haptics[0].detail).toBe("success");
		} finally {
			window.removeEventListener("haptic", listener);
		}
	});
});

describe("slide-confirm-slider: entity awareness", () => {
	it("is disabled while the entity is in a disabled_states state", async () => {
		const hass = hassWith("lock.front_door", "unlocked");
		const { el, root, handle, events, drag } = await mount(
			baseConfig({ entity: "lock.front_door", disabled_states: ["unlocked"] }),
			hass,
		);
		expect(el.isDisabled).toBe(true);
		expect(root.classList.contains("disabled")).toBe(true);
		expect(handle.getAttribute("tabindex")).toBe("-1");
		expect(handle.getAttribute("aria-disabled")).toBe("true");

		await drag(0, 1);
		expect(events).toHaveLength(0);

		el.hass = hassWith("lock.front_door", "locked");
		await el.updateComplete;
		expect(el.isDisabled).toBe(false);
		await drag(0, 1);
		expect(events).toHaveLength(1);
	});

	it("treats a missing entity as unavailable", async () => {
		const { el } = await mount(
			baseConfig({ entity: "lock.missing", disabled_states: ["unavailable"] }),
			hassWith("lock.other", "locked"),
		);
		expect(el.isDisabled).toBe(true);
	});

	it("honours the disabled property", async () => {
		const { el, events, drag } = await mount(baseConfig());
		el.disabled = true;
		await el.updateComplete;
		await drag(0, 1);
		expect(events).toHaveLength(0);
	});

	it("reset_delay: 0 holds the confirmed state until the entity changes", async () => {
		const { el, drag } = await mount(
			baseConfig({ entity: "lock.front_door", reset_delay: 0 }),
			hassWith("lock.front_door", "locked"),
		);
		await drag(0, 1);
		expect(el.confirmed).toBe(true);

		// Same state again: still confirmed.
		el.hass = hassWith("lock.front_door", "locked");
		await el.updateComplete;
		expect(el.confirmed).toBe(true);

		el.hass = hassWith("lock.front_door", "unlocked");
		await el.updateComplete;
		expect(el.confirmed).toBe(false);
		expect(el.progress).toBe(0);
	});

	it("reset_delay: 0 without an entity falls back to the default delay", async () => {
		vi.useFakeTimers();
		const { el, drag } = await mount(baseConfig({ reset_delay: 0 }));
		await drag(0, 1);
		expect(el.confirmed).toBe(true);
		vi.advanceTimersByTime(1500);
		await el.updateComplete;
		expect(el.confirmed).toBe(false);
	});
});

describe("slide-confirm-slider: config changes", () => {
	it("returns to rest when a new config is assigned", async () => {
		const { el, drag } = await mount(baseConfig({ reset_delay: 10_000 }));
		await drag(0, 1);
		expect(el.confirmed).toBe(true);
		el.config = baseConfig({ text_unconfirmed: "Slide to Lock" });
		await el.updateComplete;
		expect(el.confirmed).toBe(false);
		expect(el.progress).toBe(0);
		expect(el.shadowRoot!.querySelector(".text")!.textContent?.trim()).toBe("Slide to Lock");
	});
});

describe("slide-confirm-slider: theme", () => {
	it("adds the theme class and insets the handle inside the track", async () => {
		const { el, root, handle, track } = await mount(baseConfig({ theme: "ios" }));
		expect(root.classList.contains("theme-ios")).toBe(true);
		const t = track.getBoundingClientRect();
		const h = handle.getBoundingClientRect();
		expect(h.left - t.left).toBeCloseTo(4, 0);
		expect(el.progress).toBe(0);
	});

	it("confirms only on release at the far end of the inset track", async () => {
		const { el, root, handle, track, pointer, settle, events } = await mount(
			baseConfig({ theme: "ios" }),
		);
		const t = track.getBoundingClientRect();
		const h = handle.getBoundingClientRect();
		const start = h.left + h.width / 2;
		const end = t.right - 4 - h.width / 2;
		pointer("pointerdown", start);
		await settle();
		pointer("pointermove", end);
		await settle();
		// At the end but not released: nothing looks or acts confirmed yet (PR #20 review).
		expect(root.classList.contains("confirmed")).toBe(false);
		expect((handle.querySelector("ha-icon") as { icon?: string }).icon).toBe("mdi:lock");
		expect(t.right - handle.getBoundingClientRect().right).toBeCloseTo(4, 0);
		pointer("pointerup", end);
		await settle();
		expect(el.confirmed).toBe(true);
		expect(events).toHaveLength(1);
	});

	it("does not confirm when released short of the end", async () => {
		const { el, handle, track, pointer, settle, events } = await mount(
			baseConfig({ theme: "glow" }),
		);
		const t = track.getBoundingClientRect();
		const h = handle.getBoundingClientRect();
		const short = t.right - 4 - h.width / 2 - 20;
		pointer("pointerdown", h.left + h.width / 2);
		await settle();
		pointer("pointermove", short);
		pointer("pointerup", short);
		await settle();
		expect(el.confirmed).toBe(false);
		expect(events).toHaveLength(0);
	});
});

describe("slide-confirm-slider: states", () => {
	const OPEN = {
		action: "perform-action",
		perform_action: "cover.open_cover",
		target: { entity_id: "cover.garage" },
	};
	const CLOSE = {
		action: "perform-action",
		perform_action: "cover.close_cover",
		target: { entity_id: "cover.garage" },
	};
	const garage = (overrides: Record<string, unknown> = {}): SliderConfig =>
		normalizeConfig({
			sliders: [
				{
					entity: "cover.garage",
					reset_delay: 0,
					states: {
						closed: {
							text_unconfirmed: "Slide to open",
							text_confirmed: "Opening",
							confirm_action: OPEN,
						},
						open: {
							direction: "rtl",
							text_unconfirmed: "Slide to close",
							text_confirmed: "Closing",
							confirm_action: CLOSE,
						},
					},
					...overrides,
				},
			],
		}).config.sliders[0];

	const withState = (state: string) => {
		const hass = hassWith("cover.garage", state);
		(hass as Record<string, unknown>).formatEntityState = (s: { state: string }) =>
			s.state[0].toUpperCase() + s.state.slice(1);
		return hass;
	};

	/** clientX for the handle centre at `progress`, for a given slide direction. */
	const xFor = (track: HTMLElement, handle: HTMLElement, progress: number, rtl: boolean) => {
		const t = track.getBoundingClientRect();
		const w = handle.getBoundingClientRect().width;
		const fromLeft = rtl ? 1 - progress : progress;
		return t.left + w / 2 + fromLeft * (t.width - w);
	};

	const text = (el: SlideConfirmSlider) =>
		el.shadowRoot!.querySelector(".text")!.textContent?.trim();
	const icon = (handle: HTMLElement) => (handle.querySelector("ha-icon") as { icon?: string }).icon;

	it("closed: rests on the left and a left-to-right slide opens", async () => {
		const { el, root, handle, track, pointer, settle, events } = await mount(
			garage(),
			withState("closed"),
		);
		expect(root.classList.contains("rtl")).toBe(false);
		expect(text(el)).toBe("Slide to open");
		expect(icon(handle)).toBe("mdi:chevron-right");
		pointer("pointerdown", xFor(track, handle, 0, false));
		await settle();
		pointer("pointermove", xFor(track, handle, 1, false));
		pointer("pointerup", xFor(track, handle, 1, false));
		await settle();
		expect(events).toHaveLength(1);
		expect(events[0].detail.action).toEqual(OPEN);
		expect(text(el)).toBe("Opening");
	});

	it("open: rests on the right and only a right-to-left slide closes", async () => {
		const { el, root, handle, track, pointer, settle, events } = await mount(
			garage(),
			withState("open"),
		);
		expect(root.classList.contains("rtl")).toBe(true);
		expect(text(el)).toBe("Slide to close");
		expect(icon(handle)).toBe("mdi:chevron-left");
		expect(Math.round(handle.getBoundingClientRect().right)).toBe(
			Math.round(track.getBoundingClientRect().right),
		);

		// Pushing further right from rest does nothing.
		pointer("pointerdown", xFor(track, handle, 0, true));
		await settle();
		pointer("pointermove", xFor(track, handle, 0, true) + 100);
		pointer("pointerup", xFor(track, handle, 0, true) + 100);
		await settle();
		expect(events).toHaveLength(0);

		pointer("pointerdown", xFor(track, handle, 0, true));
		await settle();
		pointer("pointermove", xFor(track, handle, 1, true));
		pointer("pointerup", xFor(track, handle, 1, true));
		await settle();
		expect(events).toHaveLength(1);
		expect(events[0].detail.action).toEqual(CLOSE);
	});

	it("is disabled and shows the state in states the map does not list", async () => {
		const { el, root, handle, pointer, xAt, settle, events } = await mount(
			garage(),
			withState("opening"),
		);
		expect(el.isDisabled).toBe(true);
		expect(root.classList.contains("disabled")).toBe(true);
		expect(text(el)).toBe("Opening");
		expect(handle.getAttribute("aria-disabled")).toBe("true");
		pointer("pointerdown", xAt(0));
		pointer("pointermove", xAt(1));
		pointer("pointerup", xAt(1));
		await settle();
		expect(events).toHaveLength(0);
	});

	it("is disabled before hass arrives", async () => {
		const { el } = await mount(garage());
		expect(el.isDisabled).toBe(true);
		expect(text(el)).toBe("Unavailable");
	});

	it("drops a slide in progress when the entity changes state", async () => {
		const { el, handle, track, pointer, settle, events } = await mount(
			garage(),
			withState("closed"),
		);
		pointer("pointerdown", xFor(track, handle, 0, false));
		await settle();
		pointer("pointermove", xFor(track, handle, 0.6, false));
		await settle();
		expect(el.progress).toBeGreaterThan(0.5);

		el.hass = withState("open");
		await settle();
		expect(el.progress).toBe(0);

		// The rest of the gesture does nothing, in either direction.
		pointer("pointermove", xFor(track, handle, 1, false));
		pointer("pointerup", xFor(track, handle, 1, false));
		pointer("pointermove", xFor(track, handle, 1, true));
		pointer("pointerup", xFor(track, handle, 1, true));
		await settle();
		expect(events).toHaveLength(0);
		expect(el.confirmed).toBe(false);
	});

	it("reset_delay: 0 holds the confirmed view through unlisted states, then rests on the new side", async () => {
		const { el, root, handle, track, pointer, settle } = await mount(garage(), withState("closed"));
		pointer("pointerdown", xFor(track, handle, 0, false));
		await settle();
		pointer("pointermove", xFor(track, handle, 1, false));
		pointer("pointerup", xFor(track, handle, 1, false));
		await settle();
		expect(el.confirmed).toBe(true);

		el.hass = withState("opening");
		await settle();
		expect(el.confirmed).toBe(true);
		expect(text(el)).toBe("Opening");
		expect(root.classList.contains("disabled")).toBe(false);

		el.hass = withState("open");
		await settle();
		expect(el.confirmed).toBe(false);
		expect(root.classList.contains("rtl")).toBe(true);
		expect(text(el)).toBe("Slide to close");
		expect(Math.round(handle.getBoundingClientRect().right)).toBe(
			Math.round(track.getBoundingClientRect().right),
		);
	});

	it("reset_delay: 0 resets when the entity comes back to the state it started in", async () => {
		const { el, handle, track, pointer, settle } = await mount(garage(), withState("closed"));
		pointer("pointerdown", xFor(track, handle, 0, false));
		await settle();
		pointer("pointermove", xFor(track, handle, 1, false));
		pointer("pointerup", xFor(track, handle, 1, false));
		await settle();
		el.hass = withState("opening");
		await settle();
		el.hass = withState("closed");
		await settle();
		expect(el.confirmed).toBe(false);
		expect(text(el)).toBe("Slide to open");
	});

	it("keyboard follows the state's direction", async () => {
		const { el, key, settle, events } = await mount(garage(), withState("open"));
		for (let i = 0; i < 10; i++) key("ArrowLeft");
		await settle();
		expect(el.confirmed).toBe(true);
		expect(events[0].detail.action).toEqual(CLOSE);
	});
});
