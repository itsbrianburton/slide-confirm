import { describe, expect, it } from "vitest";
import {
	type CardConfigInput,
	hasLegacyKeys,
	migrateAction,
	migrateConfig,
	migrateSlider,
	SERVICE_PATTERN,
} from "../../src/config";
import v1Readme from "../fixtures/v1-readme-config.json";
import v2Full from "../fixtures/v2-full-config.json";

describe("migrateAction", () => {
	it("rewrites call-service + service to perform-action + perform_action", () => {
		expect(
			migrateAction({ action: "call-service", service: "lock.unlock", target: { entity_id: "l" } }),
		).toEqual({
			action: "perform-action",
			perform_action: "lock.unlock",
			target: { entity_id: "l" },
		});
	});

	it("maps service_data to data and the Developer Tools shape", () => {
		expect(
			migrateAction({ action: "call-service", service: "a.b", service_data: { x: 1 } }),
		).toEqual({
			action: "perform-action",
			perform_action: "a.b",
			data: { x: 1 },
		});
		expect(migrateAction({ action: "switch.toggle", target: { entity_id: "s" } })).toEqual({
			action: "perform-action",
			target: { entity_id: "s" },
			perform_action: "switch.toggle",
		});
	});

	it("leaves v2 actions and unknown keys alone, preserving key order", () => {
		const v2 = { action: "perform-action", perform_action: "a.b", confirmation: { text: "?" } };
		expect(JSON.stringify(migrateAction(v2))).toBe(JSON.stringify(v2));
		expect(migrateAction({ action: "toggle" })).toEqual({ action: "toggle" });
	});

	it("does not overwrite an explicit v2 key with the legacy one", () => {
		expect(
			migrateAction({ action: "call-service", service: "old.x", perform_action: "new.y" }),
		).toEqual({ action: "perform-action", perform_action: "new.y" });
	});
});

describe("migrateSlider", () => {
	it("renames the four camelCase keys and keeps everything else", () => {
		expect(
			migrateSlider({
				name: "A",
				textUnconfirmed: "u",
				textConfirmed: "c",
				iconUnconfirmed: "iu",
				iconConfirmed: "ic",
				haptic: true,
				custom_thing: 1,
			}),
		).toEqual({
			name: "A",
			haptic: true,
			custom_thing: 1,
			text_unconfirmed: "u",
			text_confirmed: "c",
			icon_unconfirmed: "iu",
			icon_confirmed: "ic",
		});
	});

	it("prefers the v2 key when both are present and drops the legacy one", () => {
		expect(migrateSlider({ textConfirmed: "old", text_confirmed: "new" })).toEqual({
			text_confirmed: "new",
		});
	});

	it("does not add defaults", () => {
		expect(migrateSlider({ confirm_action: { action: "toggle" } })).toEqual({
			confirm_action: { action: "toggle" },
		});
	});
});

describe("migrateConfig / hasLegacyKeys", () => {
	it("migrates every README example and nothing else", () => {
		const migrated = migrateConfig(v1Readme);
		expect(hasLegacyKeys(v1Readme)).toBe(true);
		expect(hasLegacyKeys(migrated)).toBe(false);
		expect(migrated.sliders).toHaveLength(4);
		for (const s of migrated.sliders!) {
			expect(s).not.toHaveProperty("textUnconfirmed");
			expect(s.confirm_action?.action).toBe("perform-action");
			expect(s.confirm_action).not.toHaveProperty("service");
			// No defaults sprayed in.
			expect(s).not.toHaveProperty("direction");
			expect(s).not.toHaveProperty("reset_delay");
		}
	});

	it("round-trips a v2 config byte-for-byte", () => {
		expect(JSON.stringify(migrateConfig(v2Full as CardConfigInput))).toBe(JSON.stringify(v2Full));
		expect(hasLegacyKeys(v2Full)).toBe(false);
	});

	it("tolerates malformed input without throwing", () => {
		expect(migrateConfig({})).toEqual({});
		expect(migrateConfig({ sliders: "nope" as never })).toEqual({ sliders: "nope" });
		expect(migrateConfig({ sliders: [null as never, 3 as never] })).toEqual({ sliders: [null, 3] });
		expect(hasLegacyKeys(null)).toBe(false);
	});
});

describe("SERVICE_PATTERN", () => {
	it("matches domain.service only", () => {
		expect(SERVICE_PATTERN.test("lock.unlock")).toBe(true);
		expect(SERVICE_PATTERN.test("input_boolean.turn_on")).toBe(true);
		expect(SERVICE_PATTERN.test("explode")).toBe(false);
		expect(SERVICE_PATTERN.test("lock-unlock")).toBe(false);
		expect(SERVICE_PATTERN.test("lockXunlock")).toBe(false);
		expect(SERVICE_PATTERN.test("a.b.c")).toBe(false);
	});
});
