import { describe, expect, it } from "vitest";
import { ConfigError, normalizeAction, normalizeConfig } from "../../src/config";
import v1Readme from "../fixtures/v1-readme-config.json";
import v2Full from "../fixtures/v2-full-config.json";

const slider = (overrides: Record<string, unknown> = {}) => ({
	text_unconfirmed: "Slide",
	confirm_action: { action: "perform-action", perform_action: "lock.unlock" },
	...overrides,
});

const card = (sliders: unknown[] = [slider()], extra: Record<string, unknown> = {}) => ({
	type: "custom:slide-confirm-card",
	sliders,
	...extra,
});

describe("normalizeConfig: v2 input", () => {
	it("passes a complete v2 config through unchanged", () => {
		const { config, warnings, legacy } = normalizeConfig(v2Full);
		expect(config).toEqual(v2Full);
		expect(warnings).toEqual([]);
		expect(legacy).toBe(false);
	});

	it("applies defaults for omitted keys", () => {
		const { config } = normalizeConfig(card());
		expect(config.direction).toBe("ltr");
		expect(config.header).toBeUndefined();
		expect(config.style).toBeUndefined();
		expect(config.sliders[0]).toEqual({
			text_unconfirmed: "Slide",
			text_confirmed: "Confirmed",
			icon_unconfirmed: "mdi:chevron-right",
			icon_confirmed: "mdi:check",
			direction: "ltr",
			reset_delay: 1500,
			haptic: false,
			confirm_action: { action: "perform-action", perform_action: "lock.unlock" },
		});
	});

	it("falls back to the default unconfirmed text", () => {
		const { config } = normalizeConfig(
			card([{ confirm_action: { action: "toggle" }, entity: "lock.a" }]),
		);
		expect(config.sliders[0].text_unconfirmed).toBe("Slide to confirm");
	});

	it("sliders inherit the card direction unless they set their own", () => {
		const { config } = normalizeConfig(
			card([slider(), slider({ direction: "ltr" })], { direction: "rtl" }),
		);
		expect(config.sliders[0].direction).toBe("rtl");
		expect(config.sliders[0].icon_unconfirmed).toBe("mdi:chevron-left");
		expect(config.sliders[1].direction).toBe("ltr");
		expect(config.sliders[1].icon_unconfirmed).toBe("mdi:chevron-right");
	});

	it("treats null and empty strings as absent", () => {
		const { config } = normalizeConfig(card([slider({ name: null, icon: "" })], { header: "" }));
		expect(config.header).toBeUndefined();
		expect(config.sliders[0].name).toBeUndefined();
		expect(config.sliders[0].icon).toBeUndefined();
	});

	it("does not mutate or alias the input", () => {
		const input = card([slider({ style: { handle_size: 40 } })], { style: { font_size: "2em" } });
		const frozen = Object.freeze(JSON.parse(JSON.stringify(input)));
		const { config } = normalizeConfig(frozen);
		expect(frozen).toEqual(input);
		expect(config.sliders[0]).not.toBe(frozen.sliders[0]);
		expect(config.sliders[0].style).not.toBe(frozen.sliders[0].style);
		expect(config.sliders[0].confirm_action).not.toBe(frozen.sliders[0].confirm_action);
	});

	it("accepts a single string for disabled_states", () => {
		const { config } = normalizeConfig(
			card([slider({ entity: "lock.a", disabled_states: "unlocked" })]),
		);
		expect(config.sliders[0].disabled_states).toEqual(["unlocked"]);
	});

	it("drops empty style blocks", () => {
		const { config } = normalizeConfig(card([slider({ style: {} })], { style: { font_size: "" } }));
		expect(config.style).toBeUndefined();
		expect(config.sliders[0].style).toBeUndefined();
	});
});

describe("normalizeConfig: legacy v1 input", () => {
	it("maps every README example onto the v2 shape", () => {
		const { config, legacy, warnings } = normalizeConfig(v1Readme);
		expect(legacy).toBe(true);
		expect(config.sliders).toHaveLength(4);

		expect(config.sliders[0]).toEqual({
			name: "Front Door",
			icon: "mdi:door",
			text_unconfirmed: "Slide to Unlock",
			text_confirmed: "Door Unlocked!",
			icon_unconfirmed: "mdi:lock",
			icon_confirmed: "mdi:lock-open",
			direction: "ltr",
			reset_delay: 1500,
			haptic: false,
			confirm_action: {
				action: "perform-action",
				perform_action: "input_boolean.turn_on",
				target: { entity_id: "input_boolean.slide_confirm" },
			},
		});
		expect(config.sliders[1].confirm_action).toEqual({
			action: "perform-action",
			perform_action: "esphome.fingerprint_enroll",
			data: { finger_id: 1, num_scans: 5 },
		});
		expect(config.sliders[2].confirm_action.target).toEqual({ device_id: "device123" });
		expect(config.sliders[3].confirm_action.target).toEqual({ area_id: "garage" });

		// One deprecation per legacy key per slider, plus one per call-service action.
		expect(warnings.filter((w) => w.includes("deprecated"))).toHaveLength(4 * 5);
	});

	it("names the deprecated key and its replacement", () => {
		const { warnings } = normalizeConfig(
			card([
				slider({
					textConfirmed: "Done",
					confirm_action: { action: "call-service", service: "a.b" },
				}),
			]),
		);
		expect(warnings).toContain("Slider 1: `textConfirmed` is deprecated, use `text_confirmed`");
		expect(warnings.some((w) => w.includes("`action: call-service`"))).toBe(true);
	});

	it("prefers the v2 key when both spellings are present", () => {
		const { config, warnings } = normalizeConfig(
			card([slider({ textConfirmed: "old", text_confirmed: "new" })]),
		);
		expect(config.sliders[0].text_confirmed).toBe("new");
		expect(warnings).toContain(
			"Slider 1: both `textConfirmed` and `text_confirmed` set; using `text_confirmed`",
		);
	});

	it("flags unknown slider keys without failing", () => {
		const { config, warnings } = normalizeConfig(card([slider({ colour: "red" })]));
		expect(config.sliders[0]).not.toHaveProperty("colour");
		expect(warnings).toContain("Slider 1: unknown option `colour` ignored");
	});

	it("ignores unknown card-level keys silently (card_mod, grid_options, ...)", () => {
		const { warnings } = normalizeConfig(
			card([slider()], { card_mod: { style: "" }, grid_options: { rows: 2 } }),
		);
		expect(warnings).toEqual([]);
	});
});

describe("normalizeConfig: validation errors", () => {
	const fails = (input: unknown, message: string | RegExp | typeof ConfigError) =>
		expect(() => normalizeConfig(input)).toThrow(message);

	it("rejects non-object configs", () => {
		fails(null, ConfigError);
		fails("x", "Card config must be an object");
		fails([], "Card config must be an object");
	});

	it("requires a non-empty sliders list", () => {
		fails({}, "`sliders` must be a non-empty list");
		fails({ sliders: [] }, "`sliders` must be a non-empty list");
		fails({ sliders: {} }, "`sliders` must be a non-empty list");
	});

	it("validates direction at card and slider level", () => {
		fails(card([slider()], { direction: "up" }), "`direction` must be one of: ltr, rtl");
		fails(card([slider({ direction: "down" })]), "Slider 1.direction must be one of: ltr, rtl");
	});

	it("requires confirm_action on every slider and reports which one", () => {
		fails(card([slider(), { text_unconfirmed: "x" }]), "Slider 2.confirm_action is required");
	});

	it("validates reset_delay, haptic, disabled_states, header, style", () => {
		fails(card([slider({ reset_delay: -1 })]), /reset_delay must be a number/);
		fails(card([slider({ reset_delay: "fast" })]), /reset_delay must be a number/);
		fails(card([slider({ haptic: "yes" })]), "Slider 1.haptic must be true or false");
		fails(card([slider({ snap: "yes" })]), "Slider 1.snap must be true or false");
		fails(card([slider({ disabled_states: [1] })]), /disabled_states must be a list of strings/);
		fails(card([slider()], { header: 5 }), "`header` must be a string");
		fails(card([slider()], { style: "red" }), "`style` must be an object");
		fails(card([slider({ style: { handle_size: {} } })]), /style\.handle_size must be a string/);
	});

	it("applies the card theme to every slider unless a slider overrides it", () => {
		const { config } = normalizeConfig(
			card([slider(), slider({ theme: "mono" })], { theme: "ios" }),
		);
		expect(config.theme).toBe("ios");
		expect(config.sliders[0].theme).toBe("ios");
		expect(config.sliders[1].theme).toBe("mono");
		const plain = normalizeConfig(card([slider()])).config;
		expect(plain).not.toHaveProperty("theme");
		expect(plain.sliders[0]).not.toHaveProperty("theme");
		fails(card([slider({ theme: "neon" })]), /Slider 1\.theme must be one of: ios/);
		fails(card([slider()], { theme: "neon" }), /`theme` must be one of: ios/);
	});

	it("keeps snap only when set", () => {
		const plain = normalizeConfig(card([slider()])).config.sliders[0];
		expect(plain).not.toHaveProperty("snap");
		const set = normalizeConfig(card([slider({ snap: true })])).config.sliders[0];
		expect(set.snap).toBe(true);
	});

	it("warns about options that depend on entity", () => {
		const { warnings } = normalizeConfig(
			card([slider({ disabled_states: ["on"], reset_delay: 0 })]),
		);
		expect(warnings).toContain("Slider 1: `disabled_states` has no effect without `entity`");
		expect(warnings).toContain("Slider 1: `reset_delay: 0` needs `entity` to know when to reset");
	});

	it("warns about unknown style keys", () => {
		const { config, warnings } = normalizeConfig(card([slider()], { style: { colour: "red" } }));
		expect(warnings).toContain("`style`: unknown option `colour` ignored");
		expect(config.style).toBeUndefined();
	});
});

describe("normalizeAction", () => {
	const where = "Slider 1.confirm_action";

	it("accepts every HA action kind", () => {
		for (const action of [
			"toggle",
			"more-info",
			"navigate",
			"url",
			"fire-dom-event",
			"assist",
			"none",
		]) {
			expect(normalizeAction({ action, navigation_path: "/x" }, where).config.action).toBe(action);
		}
	});

	it("keeps unknown extra keys so HA can validate them", () => {
		const { config } = normalizeAction(
			{ action: "perform-action", perform_action: "a.b", confirmation: { text: "Sure?" } },
			where,
		);
		expect(config.confirmation).toEqual({ text: "Sure?" });
	});

	it("maps call-service + service to perform-action + perform_action", () => {
		const { config, legacy } = normalizeAction(
			{ action: "call-service", service: "lock.unlock", target: { entity_id: "lock.a" } },
			where,
		);
		expect(legacy).toBe(true);
		expect(config).toEqual({
			action: "perform-action",
			perform_action: "lock.unlock",
			target: { entity_id: "lock.a" },
		});
	});

	it("maps service_data to data", () => {
		const { config, warnings } = normalizeAction(
			{ action: "call-service", service: "a.b", service_data: { x: 1 } },
			where,
		);
		expect(config.data).toEqual({ x: 1 });
		expect(warnings).toContain(`${where}: \`service_data\` is deprecated, use \`data\``);
	});

	it("accepts the Developer Tools shape from issue #6 with a note", () => {
		const { config, legacy, warnings } = normalizeAction(
			{ action: "switch.toggle", data: {}, target: { entity_id: "switch.luce_dispensa" } },
			where,
		);
		expect(legacy).toBe(false);
		expect(config).toEqual({
			action: "perform-action",
			perform_action: "switch.toggle",
			data: {},
			target: { entity_id: "switch.luce_dispensa" },
		});
		expect(warnings[0]).toContain("interpreted as `action: perform-action`");
	});

	it("rejects missing or malformed actions", () => {
		expect(() => normalizeAction(undefined, where)).toThrow(`${where} is required`);
		expect(() => normalizeAction("lock.unlock", where)).toThrow(`${where} must be an object`);
		expect(() => normalizeAction({}, where)).toThrow(`${where}.action is required`);
		expect(() => normalizeAction({ action: "explode" }, where)).toThrow(/action must be one of/);
		expect(() => normalizeAction({ action: "perform-action" }, where)).toThrow(
			`${where}.perform_action must be \`domain.service\``,
		);
		expect(() => normalizeAction({ action: "call-service" }, where)).toThrow(
			/perform_action must be/,
		);
		expect(() =>
			normalizeAction({ action: "perform-action", perform_action: "a.b", target: "lock.a" }, where),
		).toThrow(`${where}.target must be an object`);
		expect(() =>
			normalizeAction({ action: "perform-action", perform_action: "a.b", data: [] }, where),
		).toThrow(`${where}.data must be an object`);
	});
});
