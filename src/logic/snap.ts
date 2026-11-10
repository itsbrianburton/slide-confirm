/**
 * Physics for `snap`. Pure functions and a tiny spring, so they are unit tested in Node.
 *
 * Distances are px along the drag axis: 0 at rest, `travel` at the far end. The
 * handle tracks the finger 1:1 except near the end, where it snaps in like a latch,
 * holds against small pullbacks and lets go with a spring.
 */

/**
 * UIScrollView-style rubber band: the further you pull, the less it moves.
 * Returns the visible offset for a pull of `distance`, approaching `dimension`.
 */
export function rubberBand(distance: number, dimension: number, coefficient = 0.55): number {
	if (distance <= 0 || dimension <= 0) return 0;
	return (1 - 1 / ((distance * coefficient) / dimension + 1)) * dimension;
}

export interface SnapZone {
	/** How far before the end (px) the handle snaps in. */
	reach: number;
	/** How far back (px) the finger must pull to release a locked handle (hysteresis). */
	release: number;
	/** Max visible give (px) when pulling a locked handle back, or pushing past either end. */
	give: number;
}

/**
 * Default "latch" zone, scaled to the handle (50px handle: snaps 70px before the end,
 * lets go 28px further back, gives 10px while held). `reach` is `snap_distance`.
 */
export function snapZone(handleWidth: number, reach = handleWidth * 1.4): SnapZone {
	return { reach, release: reach + handleWidth * 0.56, give: handleWidth / 5 };
}

/**
 * Where the handle should be for a finger at `finger` px, and whether it is locked
 * at the end. `locked` is the previous state; the zone has hysteresis.
 */
export function snapTarget(
	finger: number,
	travel: number,
	zone: SnapZone,
	locked: boolean,
): { x: number; locked: boolean } {
	const gap = travel - finger; // finger's distance before the end; negative past it
	if (locked && gap < zone.release) {
		// Held at the end: give a little either way, like pressing on a latch.
		return {
			x: gap > 0 ? travel - rubberBand(gap, zone.give) : travel + rubberBand(-gap, zone.give),
			locked: true,
		};
	}
	if (!locked && gap <= zone.reach) return { x: travel, locked: true };
	if (finger < 0) return { x: -rubberBand(-finger, zone.give), locked: false };
	return { x: finger, locked: false };
}

/**
 * Damped spring in SwiftUI's terms: `response` is the period in seconds,
 * `damping` 1 is critically damped, below 1 overshoots a little.
 */
export class Spring {
	position: number;
	velocity: number;
	target: number;
	/** Optional end stop: the position bounces off it instead of passing it. */
	wall?: number;
	/** Fraction of speed kept when bouncing off the wall (0 = dead stop). */
	restitution = 0.3;
	/** Called once, the first time the position reaches the wall. */
	onWall?: () => void;
	private readonly stiffness: number;
	private readonly friction: number;

	constructor(position: number, velocity: number, target: number, response = 0.3, damping = 0.86) {
		this.position = position;
		this.velocity = velocity;
		this.target = target;
		this.stiffness = ((2 * Math.PI) / response) ** 2;
		this.friction = (4 * Math.PI * damping) / response;
	}

	/** Advances by `dt` seconds (sub-stepped for stability). Returns true once at rest. */
	step(dt: number): boolean {
		const steps = Math.max(1, Math.ceil(dt / 0.004));
		const h = dt / steps;
		for (let i = 0; i < steps; i++) {
			const accel = this.stiffness * (this.target - this.position) - this.friction * this.velocity;
			this.velocity += accel * h;
			this.position += this.velocity * h;
			if (this.wall !== undefined && this.position >= this.wall) {
				this.position = this.wall;
				const hit = this.onWall;
				this.onWall = undefined;
				hit?.();
				if (this.velocity > 0) this.velocity = -this.velocity * this.restitution;
			}
		}
		const settled = Math.abs(this.target - this.position) < 0.25 && Math.abs(this.velocity) < 8;
		if (settled) {
			this.position = this.target;
			this.velocity = 0;
		}
		return settled;
	}
}
