export interface FireEventOptions {
	bubbles?: boolean;
	composed?: boolean;
	cancelable?: boolean;
}

/**
 * Dispatch a CustomEvent the way the Home Assistant frontend does: bubbling
 * and composed by default, so it escapes shadow roots and reaches HA's
 * listeners (`hass-action`, `haptic`, `config-changed`, ...).
 */
export function fireEvent<T>(
	target: EventTarget,
	type: string,
	detail?: T,
	options: FireEventOptions = {},
): CustomEvent<T> {
	const event = new CustomEvent<T>(type, {
		detail,
		bubbles: options.bubbles ?? true,
		composed: options.composed ?? true,
		cancelable: options.cancelable ?? false,
	});
	target.dispatchEvent(event);
	return event;
}
