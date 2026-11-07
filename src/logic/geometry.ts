import type { SlideDirection } from "../config/schema";

/**
 * Pure slider geometry. No DOM access, so it is unit tested in Node.
 *
 * Everything is expressed as *progress*: 0 at the rest position, 1 at the far
 * end, regardless of direction. Only `progressFromPointer` and `translateX`
 * know which way is "forward"; the component anchors the handle and fill at
 * the start edge with CSS, so the rest position needs no measurement.
 */

export interface TrackGeometry {
	/** Track's left edge in the pointer's coordinate space (clientX). */
	trackLeft: number;
	trackWidth: number;
	handleWidth: number;
}

/** Default distance (px) from the far end that still counts as confirmed. */
export const DEFAULT_CONFIRM_THRESHOLD_PX = 2;

/** Default keyboard step: 10 presses to confirm. */
export const KEYBOARD_STEP = 0.1;

/** How far the handle can move, in px. 0 when the handle does not fit the track. */
export function travelDistance(g: TrackGeometry): number {
	return Math.max(0, g.trackWidth - g.handleWidth);
}

export function clampProgress(progress: number): number {
	if (!Number.isFinite(progress)) return 0;
	return Math.min(1, Math.max(0, progress));
}

/**
 * Progress for a pointer at `clientX`, with the handle centred under the pointer.
 * Returns 0 for a degenerate layout (no travel), so nothing can confirm there.
 */
export function progressFromPointer(
	clientX: number,
	g: TrackGeometry,
	direction: SlideDirection,
): number {
	const travel = travelDistance(g);
	if (travel <= 0) return 0;
	const handleLeft = clientX - g.trackLeft - g.handleWidth / 2;
	const fromLeft = handleLeft / travel;
	return clampProgress(direction === "rtl" ? 1 - fromLeft : fromLeft);
}

/** Distance (px) the handle has moved from its rest position along the drag axis. */
export function handleDistance(progress: number, g: TrackGeometry): number {
	return clampProgress(progress) * travelDistance(g);
}

/** Signed `translateX` value for the handle: positive for ltr, negative for rtl. */
export function translateX(progress: number, g: TrackGeometry, direction: SlideDirection): number {
	const d = handleDistance(progress, g);
	return direction === "rtl" ? -d : d;
}

/** Width (px) of the fill that stretches from the start edge to the handle's far side. */
export function fillWidth(progress: number, g: TrackGeometry): number {
	return handleDistance(progress, g) + g.handleWidth;
}

/** True when the handle is within `thresholdPx` of the far end. Never true without travel. */
export function isConfirmed(
	progress: number,
	g: TrackGeometry,
	thresholdPx: number = DEFAULT_CONFIRM_THRESHOLD_PX,
): boolean {
	const travel = travelDistance(g);
	if (travel <= 0) return false;
	const remaining = travel - handleDistance(progress, g);
	// Epsilon absorbs floating-point noise at the boundary (e.g. 0.992 * 250).
	return remaining <= thresholdPx + 1e-6;
}

/**
 * Keyboard handling. Arrow keys move the handle one step in the *visual*
 * direction they point, so ArrowRight advances an ltr slider and retreats an
 * rtl one. Home returns to rest. End is deliberately not handled: jumping to
 * 100% would remove the intent the control exists to require.
 *
 * Returns the new progress, or null when the key is not handled.
 */
export function applyKey(
	progress: number,
	key: string,
	direction: SlideDirection,
	step: number = KEYBOARD_STEP,
): number | null {
	const forward = direction === "rtl" ? -1 : 1;
	switch (key) {
		case "ArrowRight":
			return snapProgress(progress + forward * step);
		case "ArrowLeft":
			return snapProgress(progress - forward * step);
		case "ArrowUp":
			return snapProgress(progress + step);
		case "ArrowDown":
			return snapProgress(progress - step);
		case "Home":
			return 0;
		default:
			return null;
	}
}

/** Clamp, then snap values within float noise of the ends so ten 0.1 steps reach exactly 1. */
function snapProgress(progress: number): number {
	const p = clampProgress(progress);
	if (p > 1 - 1e-9) return 1;
	if (p < 1e-9) return 0;
	return p;
}
