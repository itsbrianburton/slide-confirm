import { describe, expect, it } from "vitest";
import { rubberBand, snapTarget, snapZone, Spring } from "../../src/logic";

describe("rubberBand", () => {
	it("gives less the further it is pulled and never exceeds the dimension", () => {
		expect(rubberBand(0, 12)).toBe(0);
		expect(rubberBand(-5, 12)).toBe(0);
		const a = rubberBand(10, 12);
		const b = rubberBand(20, 12);
		expect(a).toBeGreaterThan(0);
		expect(b - a).toBeLessThan(a);
		expect(rubberBand(1e6, 12)).toBeLessThan(12);
	});
});

describe("snapTarget", () => {
	const travel = 350;
	const zone = snapZone(50); // latch: snaps at 70, releases at 98, gives 10

	it("tracks the finger 1:1 until the snap point", () => {
		expect(snapTarget(100, travel, zone, false)).toEqual({ x: 100, locked: false });
		expect(snapTarget(travel - 71, travel, zone, false)).toEqual({ x: travel - 71, locked: false });
	});

	it("snaps to the end inside the snap distance", () => {
		expect(snapTarget(travel - 69, travel, zone, false)).toEqual({ x: travel, locked: true });
	});

	it("holds a locked handle with a little give until pulled past the release distance", () => {
		const held = snapTarget(travel - 90, travel, zone, true);
		expect(held.locked).toBe(true);
		expect(held.x).toBeGreaterThan(travel - 10);
		expect(snapTarget(travel - 100, travel, zone, true)).toEqual({
			x: travel - 100,
			locked: false,
		});
	});

	it("rubber-bands past either end", () => {
		const past = snapTarget(travel + 30, travel, zone, true);
		expect(past.x).toBeGreaterThan(travel);
		expect(past.x).toBeLessThan(travel + 10);
		const before = snapTarget(-30, travel, zone, false);
		expect(before.x).toBeLessThan(0);
		expect(before.x).toBeGreaterThan(-10);
	});
});

describe("Spring", () => {
	it("settles on the target", () => {
		const s = new Spring(0, 0, 100);
		let settled = false;
		for (let i = 0; i < 200 && !settled; i++) settled = s.step(1 / 60);
		expect(settled).toBe(true);
		expect(s.position).toBe(100);
	});

	it("overshoots slightly when underdamped and carries initial velocity", () => {
		const s = new Spring(0, 2000, 100, 0.3, 0.7);
		let max = 0;
		for (let i = 0; i < 120; i++) {
			s.step(1 / 60);
			max = Math.max(max, s.position);
		}
		expect(max).toBeGreaterThan(100);
		expect(max).toBeLessThan(160);
	});
});

describe("Spring end stop", () => {
	it("bounces off the wall instead of passing it", () => {
		const s = new Spring(0, 3000, 100, 0.2, 0.7);
		s.wall = 100;
		let max = 0;
		for (let i = 0; i < 120; i++) {
			s.step(1 / 60);
			max = Math.max(max, s.position);
		}
		expect(max).toBe(100);
		expect(s.position).toBe(100);
	});
});
