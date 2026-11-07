import {
	ACTION_KINDS,
	type ActionConfig,
	type ActionConfigInput,
	type ActionKind,
	type CardConfig,
	type CardConfigInput,
	DEFAULTS,
	SLIDE_DIRECTIONS,
	type SlideDirection,
	type SliderConfig,
	type SliderConfigInput,
	STYLE_KEYS,
	type StyleConfig,
} from "./schema";

/**
 * Thrown for configs the card cannot render. Home Assistant shows the message
 * in the red error card, so it should say exactly what to change.
 */
export class ConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConfigError";
	}
}

export interface NormalizeResult {
	config: CardConfig;
	/** Human readable notes: deprecated keys, ignored keys, lenient interpretations. */
	warnings: string[];
	/** True when any v1-only key or action shape was found. Drives the editor's upgrade banner. */
	legacy: boolean;
}

/** v1 camelCase key -> v2 snake_case key. */
export const LEGACY_SLIDER_KEYS: Readonly<Record<string, keyof SliderConfig>> = {
	textUnconfirmed: "text_unconfirmed",
	textConfirmed: "text_confirmed",
	iconUnconfirmed: "icon_unconfirmed",
	iconConfirmed: "icon_confirmed",
};

const KNOWN_SLIDER_KEYS: ReadonlySet<string> = new Set([
	"name",
	"icon",
	"label",
	"entity",
	"text_unconfirmed",
	"text_confirmed",
	"icon_unconfirmed",
	"icon_confirmed",
	"direction",
	"reset_delay",
	"haptic",
	"disabled_states",
	"confirm_action",
	"style",
	...Object.keys(LEGACY_SLIDER_KEYS),
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === "object" && v !== null && !Array.isArray(v);

const isDirection = (v: unknown): v is SlideDirection =>
	typeof v === "string" && (SLIDE_DIRECTIONS as readonly string[]).includes(v);

const isActionKind = (v: unknown): v is ActionKind =>
	typeof v === "string" && (ACTION_KINDS as readonly string[]).includes(v);

/** Accepts a string; treats null/undefined/"" as absent. Rejects other types. */
function optionalString(value: unknown, where: string): string | undefined {
	if (value === undefined || value === null || value === "") return undefined;
	if (typeof value !== "string") throw new ConfigError(`${where} must be a string`);
	return value;
}

/**
 * Normalize whatever the user wrote into a fully-defaulted v2 `CardConfig`.
 * Never mutates its input (HA may hand us frozen objects).
 */
export function normalizeConfig(raw: unknown): NormalizeResult {
	if (!isObject(raw)) throw new ConfigError("Card config must be an object");
	const input = raw as CardConfigInput;
	const warnings: string[] = [];
	let legacy = false;

	if (!Array.isArray(input.sliders) || input.sliders.length === 0) {
		throw new ConfigError("`sliders` must be a non-empty list");
	}

	const cardDirection = normalizeDirection(input.direction, "`direction`") ?? DEFAULTS.direction;
	const cardStyle = normalizeStyle(input.style, "`style`", warnings);

	const sliders = input.sliders.map((slider, index) => {
		const result = normalizeSlider(slider, index, cardDirection);
		warnings.push(...result.warnings);
		legacy ||= result.legacy;
		return result.config;
	});

	const config: CardConfig = {
		type: typeof input.type === "string" ? input.type : "custom:slide-confirm-card",
		direction: cardDirection,
		sliders,
	};
	const header = optionalString(input.header, "`header`");
	if (header !== undefined) config.header = header;
	if (cardStyle) config.style = cardStyle;

	return { config, warnings, legacy };
}

function normalizeDirection(value: unknown, where: string): SlideDirection | undefined {
	if (value === undefined || value === null) return undefined;
	if (!isDirection(value)) {
		throw new ConfigError(`${where} must be one of: ${SLIDE_DIRECTIONS.join(", ")}`);
	}
	return value;
}

function normalizeStyle(
	value: unknown,
	where: string,
	warnings: string[],
): StyleConfig | undefined {
	if (value === undefined || value === null) return undefined;
	if (!isObject(value)) throw new ConfigError(`${where} must be an object`);

	const style: StyleConfig = {};
	for (const [key, v] of Object.entries(value)) {
		if (!(STYLE_KEYS as readonly string[]).includes(key)) {
			warnings.push(`${where}: unknown option \`${key}\` ignored`);
			continue;
		}
		if (v === undefined || v === null || v === "") continue;
		if (typeof v !== "string" && typeof v !== "number") {
			throw new ConfigError(`${where}.${key} must be a string or number`);
		}
		(style as Record<string, string | number>)[key] = v;
	}
	return Object.keys(style).length ? style : undefined;
}

interface SliderResult {
	config: SliderConfig;
	warnings: string[];
	legacy: boolean;
}

function normalizeSlider(raw: unknown, index: number, cardDirection: SlideDirection): SliderResult {
	const where = `Slider ${index + 1}`;
	if (!isObject(raw)) throw new ConfigError(`${where} must be an object`);
	const input = raw as SliderConfigInput;
	const warnings: string[] = [];
	let legacy = false;

	// Resolve v1 camelCase keys. The v2 key wins when both are present.
	const text: Partial<Record<keyof SliderConfig, string>> = {};
	for (const [oldKey, newKey] of Object.entries(LEGACY_SLIDER_KEYS)) {
		const oldValue = input[oldKey];
		const newValue = input[newKey];
		if (oldValue !== undefined) {
			legacy = true;
			if (newValue !== undefined) {
				warnings.push(`${where}: both \`${oldKey}\` and \`${newKey}\` set; using \`${newKey}\``);
			} else {
				warnings.push(`${where}: \`${oldKey}\` is deprecated, use \`${newKey}\``);
			}
		}
		const chosen = newValue !== undefined ? newValue : oldValue;
		const str = optionalString(chosen, `${where}.${newKey}`);
		if (str !== undefined) text[newKey] = str;
	}

	for (const key of Object.keys(input)) {
		if (!KNOWN_SLIDER_KEYS.has(key)) warnings.push(`${where}: unknown option \`${key}\` ignored`);
	}

	const direction = normalizeDirection(input.direction, `${where}.direction`) ?? cardDirection;

	const action = normalizeAction(input.confirm_action, `${where}.confirm_action`);
	warnings.push(...action.warnings);
	legacy ||= action.legacy;

	const config: SliderConfig = {
		text_unconfirmed: text.text_unconfirmed ?? DEFAULTS.text_unconfirmed,
		text_confirmed: text.text_confirmed ?? DEFAULTS.text_confirmed,
		icon_unconfirmed: text.icon_unconfirmed ?? DEFAULTS.icon_unconfirmed[direction],
		icon_confirmed: text.icon_confirmed ?? DEFAULTS.icon_confirmed,
		direction,
		reset_delay: normalizeResetDelay(input.reset_delay, where),
		haptic: normalizeBoolean(input.haptic, `${where}.haptic`) ?? DEFAULTS.haptic,
		confirm_action: action.config,
	};

	const name = optionalString(input.name, `${where}.name`);
	const icon = optionalString(input.icon, `${where}.icon`);
	const label = optionalString(input.label, `${where}.label`);
	const entity = optionalString(input.entity, `${where}.entity`);
	if (name !== undefined) config.name = name;
	if (icon !== undefined) config.icon = icon;
	if (label !== undefined) config.label = label;
	if (entity !== undefined) config.entity = entity;

	const disabledStates = normalizeStringList(input.disabled_states, `${where}.disabled_states`);
	if (disabledStates) {
		config.disabled_states = disabledStates;
		if (!entity) warnings.push(`${where}: \`disabled_states\` has no effect without \`entity\``);
	}
	if (config.reset_delay === 0 && !entity) {
		warnings.push(`${where}: \`reset_delay: 0\` needs \`entity\` to know when to reset`);
	}

	const style = normalizeStyle(input.style, `${where}.style`, warnings);
	if (style) config.style = style;

	return { config, warnings, legacy };
}

function normalizeResetDelay(value: unknown, where: string): number {
	if (value === undefined || value === null) return DEFAULTS.reset_delay;
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
		throw new ConfigError(`${where}.reset_delay must be a number of milliseconds >= 0`);
	}
	return value;
}

function normalizeBoolean(value: unknown, where: string): boolean | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value !== "boolean") throw new ConfigError(`${where} must be true or false`);
	return value;
}

function normalizeStringList(value: unknown, where: string): string[] | undefined {
	if (value === undefined || value === null) return undefined;
	const list = Array.isArray(value) ? value : [value];
	if (!list.every((v) => typeof v === "string")) {
		throw new ConfigError(`${where} must be a list of strings`);
	}
	return list.length ? (list as string[]) : undefined;
}

interface ActionResult {
	config: ActionConfig;
	warnings: string[];
	legacy: boolean;
}

/**
 * Accepts, in order of preference:
 *  1. a v2/HA action: `{ action: perform-action, perform_action: domain.service, ... }`
 *  2. the v1 shape: `{ action: call-service, service: domain.service, ... }`
 *  3. the Developer Tools shape people paste by mistake (issue #6):
 *     `{ action: domain.service, target, data }`
 */
export function normalizeAction(raw: unknown, where: string): ActionResult {
	if (raw === undefined || raw === null) throw new ConfigError(`${where} is required`);
	if (!isObject(raw)) throw new ConfigError(`${where} must be an object`);
	const input = raw as ActionConfigInput;
	const warnings: string[] = [];
	let legacy = false;

	// Copy everything through, then fix up the keys we understand.
	const { action, service, service_data, ...rest } = input;
	const out: Record<string, unknown> = { ...rest };

	if (service_data !== undefined) {
		legacy = true;
		if (out.data === undefined) out.data = service_data;
		warnings.push(`${where}: \`service_data\` is deprecated, use \`data\``);
	}

	if (typeof action !== "string" || action === "") {
		throw new ConfigError(`${where}.action is required`);
	}

	let kind: ActionKind;
	if (action === "call-service") {
		legacy = true;
		kind = "perform-action";
		if (out.perform_action === undefined) out.perform_action = service;
		warnings.push(
			`${where}: \`action: call-service\` + \`service\` is deprecated, use \`action: perform-action\` + \`perform_action\``,
		);
	} else if (isActionKind(action)) {
		kind = action;
		if (service !== undefined && out.perform_action === undefined) {
			legacy = true;
			out.perform_action = service;
			warnings.push(`${where}: \`service\` is deprecated, use \`perform_action\``);
		}
	} else if (/^[a-z_]+\.[a-z0-9_]+$/.test(action)) {
		kind = "perform-action";
		out.perform_action = action;
		warnings.push(
			`${where}: \`action: ${action}\` interpreted as \`action: perform-action\` + \`perform_action: ${action}\``,
		);
	} else {
		throw new ConfigError(`${where}.action must be one of: ${ACTION_KINDS.join(", ")}`);
	}

	if (kind === "perform-action") {
		if (typeof out.perform_action !== "string" || !out.perform_action.includes(".")) {
			throw new ConfigError(`${where}.perform_action must be \`domain.service\``);
		}
		if (out.target !== undefined && !isObject(out.target)) {
			throw new ConfigError(`${where}.target must be an object`);
		}
		if (out.data !== undefined && !isObject(out.data)) {
			throw new ConfigError(`${where}.data must be an object`);
		}
	}

	return { config: { ...out, action: kind } as ActionConfig, warnings, legacy };
}
