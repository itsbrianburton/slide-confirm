import type { Connection, HassEntities, HassEntity } from "home-assistant-js-websocket";
import type { HassTarget } from "../config/schema";

/**
 * The slice of the Home Assistant frontend's `hass` object this card uses.
 * Kept local instead of depending on custom-card-helpers, which predates
 * `perform-action` and has not been updated since 2021.
 */
export interface HomeAssistant {
	states: HassEntities;
	connection?: Connection;
	language?: string;
	callService(
		domain: string,
		service: string,
		serviceData?: Record<string, unknown>,
		target?: HassTarget,
	): Promise<unknown>;
	[key: string]: unknown;
}

export type { HassEntity };

/** The contract Home Assistant expects from `getConfigElement()`. */
export interface LovelaceCardEditor extends HTMLElement {
	hass?: HomeAssistant;
	lovelace?: unknown;
	setConfig(config: unknown): void;
}
