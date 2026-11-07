import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { CardConfigInput, SliderConfigInput } from "../../src/config";
import { migrateConfig } from "../../src/config";
import type { SlideConfirmCardEditor } from "../../src/editor";
import type { HomeAssistant } from "../../src/types/home-assistant";
import v1Readme from "../fixtures/v1-readme-config.json";
import v2Full from "../fixtures/v2-full-config.json";

beforeAll(async () => {
	await import("../../src/index");
});

// HA's form components are not available here, so <ha-form> renders as an
// unknown element. We verify what the editor feeds it (.data/.schema) and what
// it commits when the form reports a change.

interface FakeForm extends HTMLElement {
	data: Record<string, unknown>;
	schema: unknown[];
	hass?: HomeAssistant;
}

interface Mounted {
	editor: SlideConfirmCardEditor;
	changes: CardConfigInput[];
	sr: ShadowRoot;
	cardForm(): FakeForm;
	sliderForms(): FakeForm[];
	click(selector: string): Promise<void>;
	formChange(form: FakeForm, value: Record<string, unknown>): Promise<void>;
	last(): CardConfigInput;
}

const mounted: HTMLElement[] = [];

async function mount(config: unknown, hass?: HomeAssistant): Promise<Mounted> {
	const editor = document.createElement("slide-confirm-card-editor") as SlideConfirmCardEditor;
	if (hass) editor.hass = hass;
	editor.setConfig(config);
	const changes: CardConfigInput[] = [];
	editor.addEventListener("config-changed", (e) =>
		changes.push((e as CustomEvent<{ config: CardConfigInput }>).detail.config),
	);
	document.body.append(editor);
	mounted.push(editor);
	await editor.updateComplete;

	const sr = editor.shadowRoot!;
	return {
		editor,
		changes,
		sr,
		cardForm: () => sr.querySelector("ha-form.card-form") as FakeForm,
		sliderForms: () => [...sr.querySelectorAll("ha-form.slider-form")] as FakeForm[],
		click: async (selector) => {
			(sr.querySelector(selector) as HTMLElement).click();
			await editor.updateComplete;
		},
		formChange: async (form, value) => {
			form.dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true }));
			await editor.updateComplete;
		},
		last: () => changes[changes.length - 1],
	};
}

afterEach(() => {
	for (const el of mounted.splice(0)) el.remove();
});

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe("slide-confirm-card-editor: display", () => {
	it("feeds the card form the header, direction and style", async () => {
		const { cardForm, sr } = await mount(v2Full);
		expect(cardForm().data).toEqual({
			header: "Doors",
			direction: "rtl",
			style: { handle_size: "44px" },
		});
		expect(sr.querySelector("ha-alert")).toBeNull();
	});

	it("feeds each slider form its config migrated to v2 spellings, without changing the config", async () => {
		const { editor, sliderForms } = await mount(clone(v1Readme));
		const forms = sliderForms();
		expect(forms).toHaveLength(4);
		expect(forms[0].data.text_unconfirmed).toBe("Slide to Unlock");
		expect(forms[0].data).not.toHaveProperty("textUnconfirmed");
		expect((forms[0].data.confirm_action as SliderConfigInput["confirm_action"])?.action).toBe(
			"perform-action",
		);
		// The stored config is still the user's v1 config until they act.
		expect(editor.config?.sliders?.[0]).toHaveProperty("textUnconfirmed");
	});

	it("shows the upgrade banner only for v1 configs", async () => {
		const legacy = await mount(clone(v1Readme));
		expect(legacy.sr.querySelector("ha-alert.legacy")).not.toBeNull();
		const modern = await mount(v2Full);
		expect(modern.sr.querySelector("ha-alert.legacy")).toBeNull();
	});

	it("shows the validation error for an invalid config and still renders the forms", async () => {
		const { sr, cardForm } = await mount({ sliders: [{ text_unconfirmed: "x" }] });
		expect(sr.querySelector("ha-alert.error")!.textContent).toContain(
			"Slider 1.confirm_action is required",
		);
		expect(cardForm()).not.toBeNull();
		expect(sr.querySelector("ha-button.add")).not.toBeNull();
	});

	it("forwards hass to every form", async () => {
		const hass = { states: {}, callService: async () => undefined } as unknown as HomeAssistant;
		const { cardForm, sliderForms } = await mount(v2Full, hass);
		expect(cardForm().hass).toBe(hass);
		for (const f of sliderForms()) expect(f.hass).toBe(hass);
	});

	it("titles each panel by name, then text, then index", async () => {
		const { sr } = await mount({
			sliders: [
				{ name: "Front", confirm_action: { action: "toggle" } },
				{ textUnconfirmed: "Slide me", confirm_action: { action: "toggle" } },
				{ confirm_action: { action: "toggle" } },
			],
		});
		const panels = [...sr.querySelectorAll("ha-expansion-panel")] as (HTMLElement & {
			header: string;
		})[];
		expect(panels.map((p) => p.header)).toEqual(["Front", "Slide me", "Slider 3"]);
	});
});

describe("slide-confirm-card-editor: upgrade", () => {
	it("rewrites the whole config to v2 spellings without adding defaults", async () => {
		const { click, last, sr, changes } = await mount(clone(v1Readme));
		await click("ha-button.upgrade");
		expect(changes).toHaveLength(1);
		expect(last()).toEqual(migrateConfig(clone(v1Readme)));
		expect(last().sliders![0]).not.toHaveProperty("direction");
		expect(sr.querySelector("ha-alert.legacy")).toBeNull();
	});
});

describe("slide-confirm-card-editor: slider list", () => {
	it("adds a slider with a deliberately incomplete action", async () => {
		const { click, last } = await mount(v2Full);
		await click("ha-button.add");
		expect(last().sliders).toHaveLength(2);
		expect(last().sliders![1]).toEqual({
			text_unconfirmed: "Slide to confirm",
			text_confirmed: "Confirmed",
			icon_unconfirmed: "mdi:chevron-right",
			icon_confirmed: "mdi:check",
			confirm_action: { action: "perform-action" },
		});
	});

	it("removes and reorders sliders, leaving the others untouched", async () => {
		const { sr, editor, last } = await mount(clone(v1Readme));
		const names = () => (editor.config!.sliders as SliderConfigInput[]).map((s) => s.name);
		const panelButtons = (i: number, cls: string) =>
			sr
				.querySelectorAll("ha-expansion-panel")
				[i].querySelector(`ha-icon-button.${cls}`) as HTMLElement;

		panelButtons(0, "down").click();
		await editor.updateComplete;
		expect(names()).toEqual([
			"Front door fingerprint reader",
			"Front Door",
			"Back Door",
			"Garage Doors",
		]);

		panelButtons(3, "up").click();
		await editor.updateComplete;
		expect(names()).toEqual([
			"Front door fingerprint reader",
			"Front Door",
			"Garage Doors",
			"Back Door",
		]);

		// Out of range moves are ignored.
		panelButtons(0, "up").click();
		panelButtons(3, "down").click();
		await editor.updateComplete;
		expect(names()).toEqual([
			"Front door fingerprint reader",
			"Front Door",
			"Garage Doors",
			"Back Door",
		]);

		panelButtons(1, "remove").click();
		await editor.updateComplete;
		expect(names()).toEqual(["Front door fingerprint reader", "Garage Doors", "Back Door"]);
		// Untouched sliders keep their v1 spelling: reordering is not an upgrade.
		expect(last().sliders![0]).toHaveProperty("textUnconfirmed");
	});

	it("can remove the last slider and keeps `sliders` as an empty list", async () => {
		const { click, last, sr } = await mount(v2Full);
		await click("ha-icon-button.remove");
		expect(last().sliders).toEqual([]);
		expect(sr.querySelector("ha-alert.error")!.textContent).toContain("non-empty list");
	});
});

describe("slide-confirm-card-editor: form changes", () => {
	it("commits a slider edit cleaned of empties, migrating only that slider", async () => {
		const { sliderForms, formChange, last } = await mount(clone(v1Readme));
		const form = sliderForms()[0];
		await formChange(form, {
			...form.data,
			name: "Main Door",
			label: "",
			style: { handle_size: "" },
			disabled_states: [],
			direction: "",
		});
		const [first, second] = last().sliders!;
		expect(first).toEqual({
			name: "Main Door",
			icon: "mdi:door",
			text_unconfirmed: "Slide to Unlock",
			text_confirmed: "Door Unlocked!",
			icon_unconfirmed: "mdi:lock",
			icon_confirmed: "mdi:lock-open",
			confirm_action: {
				action: "perform-action",
				perform_action: "input_boolean.turn_on",
				target: { entity_id: "input_boolean.slide_confirm" },
			},
		});
		expect(second).toHaveProperty("textUnconfirmed");
	});

	it("commits card-level edits and preserves the sliders", async () => {
		const { cardForm, formChange, last } = await mount(v2Full);
		await formChange(cardForm(), { header: "", direction: "ltr", style: { handle_size: "" } });
		expect(last().header).toBeUndefined();
		expect(last().direction).toBe("ltr");
		expect(last().style).toBeUndefined();
		expect(last().sliders).toHaveLength(1);
		expect(last().sliders![0].entity).toBe("lock.front_door");
		// Empty objects such as the fixture's `data: {}` are dropped on commit.
		expect(last().sliders![0].confirm_action).not.toHaveProperty("data");
	});

	it("keeps meaningful falsy values", async () => {
		const { sliderForms, formChange, last } = await mount(v2Full);
		const form = sliderForms()[0];
		await formChange(form, { ...form.data, reset_delay: 0, haptic: false });
		expect(last().sliders![0].reset_delay).toBe(0);
		expect(last().sliders![0].haptic).toBe(false);
	});

	it("fires config-changed as a bubbling, composed event", async () => {
		const { editor, click } = await mount(v2Full);
		let seen: Event | undefined;
		const on = (e: Event) => (seen = e);
		document.addEventListener("config-changed", on);
		try {
			await click("ha-button.add");
		} finally {
			document.removeEventListener("config-changed", on);
		}
		expect(seen).toBeDefined();
		expect(seen!.composed).toBe(true);
		expect((seen as CustomEvent).detail.config).toBe(editor.config);
	});
});
