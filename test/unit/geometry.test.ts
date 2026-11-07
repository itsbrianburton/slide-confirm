import { describe, expect, it } from "vitest";
import {
	applyKey,
	clampProgress,
	fillWidth,
	handleDistance,
	isConfirmed,
	progressFromPointer,
	translateX,
	travelDistance,
	type TrackGeometry,
} from "../../src/logic";

// A 300px track starting at x=100 with a 50px handle: 250px of travel.
const g: TrackGeometry = { trackLeft: 100, trackWidth: 300, handleWidth: 50 };
const noTravel: TrackGeometry = { trackLeft: 0, trackWidth: 40, handleWidth: 50 };

describe("travelDistance / clampProgress", () => {
	it("is track width minus handle width, never negative", () => {
		expect(travelDistance(g)).toBe(250);
		expect(travelDistance(noTravel)).toBe(0);
	});

	it("clamps to 0..1 and treats NaN/Infinity as 0", () => {
		expect(clampProgress(-0.5)).toBe(0);
		expect(clampProgress(0.25)).toBe(0.25);
		expect(clampProgress(7)).toBe(1);
		expect(clampProgress(NaN)).toBe(0);
		expect(clampProgress(Infinity)).toBe(0);
	});
});

describe("progressFromPointer", () => {
	it("ltr: handle centred under the pointer, 0 at the left rest position", () => {
		// Handle left edge at track left when pointer is at trackLeft + handleWidth/2.
		expect(progressFromPointer(125, g, "ltr")).toBe(0);
		expect(progressFromPointer(250, g, "ltr")).toBe(0.5);
		expect(progressFromPointer(375, g, "ltr")).toBe(1);
	});

	it("ltr: clamps pointers outside the track", () => {
		expect(progressFromPointer(0, g, "ltr")).toBe(0);
		expect(progressFromPointer(10_000, g, "ltr")).toBe(1);
	});

	it("rtl: mirrors, 0 at the right rest position", () => {
		expect(progressFromPointer(375, g, "rtl")).toBe(0);
		expect(progressFromPointer(250, g, "rtl")).toBe(0.5);
		expect(progressFromPointer(125, g, "rtl")).toBe(1);
		expect(progressFromPointer(10_000, g, "rtl")).toBe(0);
		expect(progressFromPointer(-10_000, g, "rtl")).toBe(1);
	});

	it("returns 0 when the handle does not fit the track", () => {
		expect(progressFromPointer(20, noTravel, "ltr")).toBe(0);
		expect(progressFromPointer(20, noTravel, "rtl")).toBe(0);
	});
});

describe("handleDistance / translateX / fillWidth", () => {
	it("scales progress onto the travel distance", () => {
		expect(handleDistance(0, g)).toBe(0);
		expect(handleDistance(0.4, g)).toBe(100);
		expect(handleDistance(1, g)).toBe(250);
		expect(handleDistance(2, g)).toBe(250);
	});

	it("translateX is positive for ltr and negative for rtl", () => {
		expect(translateX(0.4, g, "ltr")).toBe(100);
		expect(translateX(0.4, g, "rtl")).toBe(-100);
		expect(translateX(0, g, "rtl")).toBe(-0);
	});

	it("fill covers from the start edge to the far side of the handle", () => {
		expect(fillWidth(0, g)).toBe(50);
		expect(fillWidth(0.5, g)).toBe(175);
		expect(fillWidth(1, g)).toBe(300);
	});
});

describe("isConfirmed", () => {
	it("is true within the threshold of the far end", () => {
		expect(isConfirmed(1, g)).toBe(true);
		// 2px short of 250px travel = progress 0.992
		expect(isConfirmed(0.992, g)).toBe(true);
		expect(isConfirmed(0.99, g)).toBe(false);
		expect(isConfirmed(0.5, g)).toBe(false);
	});

	it("honours a custom threshold", () => {
		expect(isConfirmed(0.9, g, 25)).toBe(true);
		expect(isConfirmed(0.9, g, 24)).toBe(false);
		expect(isConfirmed(0.99, g, 0)).toBe(false);
		expect(isConfirmed(1, g, 0)).toBe(true);
	});

	it("never confirms a degenerate layout", () => {
		expect(isConfirmed(1, noTravel)).toBe(false);
	});
});

describe("applyKey", () => {
	it("ltr: ArrowRight advances, ArrowLeft retreats, in 10% steps", () => {
		expect(applyKey(0, "ArrowRight", "ltr")).toBeCloseTo(0.1);
		expect(applyKey(0.5, "ArrowLeft", "ltr")).toBeCloseTo(0.4);
	});

	it("rtl: ArrowLeft advances, ArrowRight retreats", () => {
		expect(applyKey(0, "ArrowLeft", "rtl")).toBeCloseTo(0.1);
		expect(applyKey(0.5, "ArrowRight", "rtl")).toBeCloseTo(0.4);
	});

	it("ArrowUp/ArrowDown advance/retreat regardless of direction", () => {
		expect(applyKey(0, "ArrowUp", "rtl")).toBeCloseTo(0.1);
		expect(applyKey(0.5, "ArrowDown", "ltr")).toBeCloseTo(0.4);
	});

	it("ten presses reach 1 and stay clamped", () => {
		let p = 0;
		for (let i = 0; i < 10; i++) p = applyKey(p, "ArrowRight", "ltr")!;
		expect(p).toBe(1);
		expect(applyKey(p, "ArrowRight", "ltr")).toBe(1);
		expect(applyKey(0, "ArrowLeft", "ltr")).toBe(0);
	});

	it("Home resets, End and other keys are not handled", () => {
		expect(applyKey(0.7, "Home", "ltr")).toBe(0);
		expect(applyKey(0.7, "End", "ltr")).toBeNull();
		expect(applyKey(0.7, "Enter", "ltr")).toBeNull();
		expect(applyKey(0.7, " ", "ltr")).toBeNull();
	});

	it("accepts a custom step", () => {
		expect(applyKey(0, "ArrowRight", "ltr", 0.25)).toBe(0.25);
	});
});
