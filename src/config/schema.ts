/**
 * v2 configuration types.
 *
 * `*Input` types describe what a user may write in YAML (everything optional,
 * legacy v1 keys accepted). The plain types describe the normalized shape the
 * components consume, produced by `normalizeConfig()`.
 */

export type SlideDirection = "ltr" | "rtl";

export const SLIDE_DIRECTIONS: readonly SlideDirection[] = ["ltr", "rtl"];

/** Built-in looks for `theme`. */
export const THEMES = [
	"ios",
	"minimal",
	"glow",
	"glass",
	"tonal",
	"sunrise",
	"outline",
	"soft",
	"arrows",
	"mono",
	"hazard",
	"aurora",
] as const;

export type SliderTheme = (typeof THEMES)[number];

/** Keys of the `style:` block. Each maps 1:1 to a `--slide-confirm-*` custom property. */
export interface StyleConfig {
	track_color?: string;
	handle_color?: string;
	handle_border_color?: string;
	confirmed_color?: string;
	confirmed_text_color?: string;
	text_color?: string;
	handle_size?: string | number;
	track_height?: string | number;
	border_radius?: string | number;
	font_size?: string | number;
	fill_opacity?: string | number;
}

export const STYLE_KEYS: readonly (keyof StyleConfig)[] = [
	"track_color",
	"handle_color",
	"handle_border_color",
	"confirmed_color",
	"confirmed_text_color",
	"text_color",
	"handle_size",
	"track_height",
	"border_radius",
	"font_size",
	"fill_opacity",
];

/** Service-call target, as Home Assistant accepts it. */
export interface HassTarget {
	entity_id?: string | string[];
	device_id?: string | string[];
	area_id?: string | string[];
	floor_id?: string | string[];
	label_id?: string | string[];
}

export const ACTION_KINDS = [
	"perform-action",
	"toggle",
	"more-info",
	"navigate",
	"url",
	"fire-dom-event",
	"assist",
	"none",
] as const;

export type ActionKind = (typeof ACTION_KINDS)[number];

export const isActionKind = (v: unknown): v is ActionKind =>
	typeof v === "string" && (ACTION_KINDS as readonly string[]).includes(v);

/** `domain.service`, as typed in Developer Tools. */
export const SERVICE_PATTERN = /^[a-z_]+\.[a-z0-9_]+$/;

/**
 * A Home Assistant dashboard action, the same shape HA uses for `tap_action`.
 * Kept flat (rather than a discriminated union) because HA validates the
 * per-kind fields itself and accepts extra keys.
 */
export interface ActionConfig {
	action: ActionKind;
	perform_action?: string;
	target?: HassTarget;
	data?: Record<string, unknown>;
	entity?: string;
	navigation_path?: string;
	navigation_replace?: boolean;
	url_path?: string;
	pipeline_id?: string;
	start_listening?: boolean;
	[extra: string]: unknown;
}

/**
 * What a slider shows and does in one entity state. The slider's own options are
 * the fallback for every key; a `states:` entry overrides them for its state.
 */
export interface SliderStateConfig {
	direction: SlideDirection;
	text_unconfirmed: string;
	text_confirmed: string;
	icon_unconfirmed: string;
	icon_confirmed: string;
	confirm_action: ActionConfig;
}

/** Keys a `states:` entry may set. */
export const STATE_KEYS: readonly (keyof SliderStateConfig)[] = [
	"direction",
	"text_unconfirmed",
	"text_confirmed",
	"icon_unconfirmed",
	"icon_confirmed",
	"confirm_action",
];

/** Normalized slider: defaults applied, legacy keys mapped. */
export interface SliderConfig {
	name?: string;
	icon?: string;
	label?: string;
	entity?: string;
	text_unconfirmed: string;
	text_confirmed: string;
	icon_unconfirmed: string;
	icon_confirmed: string;
	direction: SlideDirection;
	reset_delay: number;
	haptic: boolean;
	/** Built-in look; absent means the classic look. */
	theme?: SliderTheme;
	disabled_states?: string[];
	confirm_action: ActionConfig;
	/**
	 * Per-entity-state settings, fully resolved. When present, the slider is
	 * disabled in any state not listed here.
	 */
	states?: Record<string, SliderStateConfig>;
	style?: StyleConfig;
}

/** Normalized card. */
export interface CardConfig {
	type: string;
	header?: string;
	direction: SlideDirection;
	theme?: SliderTheme;
	style?: StyleConfig;
	sliders: SliderConfig[];
}

/** What a user may write for one slider, including v1 keys. */
export interface SliderConfigInput {
	name?: string | null;
	icon?: string | null;
	label?: string | null;
	entity?: string | null;
	text_unconfirmed?: string;
	text_confirmed?: string;
	icon_unconfirmed?: string;
	icon_confirmed?: string;
	direction?: SlideDirection;
	reset_delay?: number;
	haptic?: boolean;
	theme?: SliderTheme;
	disabled_states?: string[];
	confirm_action?: ActionConfigInput;
	states?: Record<string, SliderStateInput>;
	style?: StyleConfig;
	/** @deprecated v1 */ textUnconfirmed?: string;
	/** @deprecated v1 */ textConfirmed?: string;
	/** @deprecated v1 */ iconUnconfirmed?: string;
	/** @deprecated v1 */ iconConfirmed?: string;
	[extra: string]: unknown;
}

/** What a user may write for one `states:` entry. */
export interface SliderStateInput {
	direction?: SlideDirection;
	text_unconfirmed?: string;
	text_confirmed?: string;
	icon_unconfirmed?: string;
	icon_confirmed?: string;
	confirm_action?: ActionConfigInput;
	[extra: string]: unknown;
}

/** What a user may write for an action, including the v1 `call-service` shape. */
export interface ActionConfigInput {
	action?: string;
	perform_action?: string;
	/** @deprecated v1: `action: call-service` + `service: domain.name` */
	service?: string;
	/** @deprecated HA legacy alias for `data` */
	service_data?: Record<string, unknown>;
	target?: HassTarget;
	data?: Record<string, unknown>;
	[extra: string]: unknown;
}

/** What a user may write for the card. */
export interface CardConfigInput {
	type?: string;
	header?: string | null;
	direction?: SlideDirection;
	theme?: SliderTheme;
	style?: StyleConfig;
	sliders?: SliderConfigInput[];
	[extra: string]: unknown;
}

export const DEFAULTS = {
	direction: "ltr" as SlideDirection,
	reset_delay: 1500,
	haptic: false,
	text_unconfirmed: "Slide to confirm",
	text_confirmed: "Confirmed",
	icon_confirmed: "mdi:check",
	icon_unconfirmed: { ltr: "mdi:chevron-right", rtl: "mdi:chevron-left" } as Record<
		SlideDirection,
		string
	>,
} as const;
