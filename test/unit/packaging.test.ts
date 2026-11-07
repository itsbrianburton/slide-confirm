import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards the wiring between the build output and what HACS expects to find.
// A mismatch here means HACS installs a file that does not exist.

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

describe("packaging", () => {
	const pkg = read("../../package.json");
	const hacs = read("../../hacs.json");
	const viteConfig = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

	it("hacs.json points at the file vite emits", () => {
		expect(hacs.filename).toBe("slide-confirm.js");
		expect(viteConfig).toContain(`"${hacs.filename}"`);
	});

	it("hacs.json expects the bundle in dist/, not the repo root", () => {
		expect(hacs.content_in_root).toBe(false);
	});

	it("hacs.json declares a minimum Home Assistant version", () => {
		expect(hacs.homeassistant).toMatch(/^\d{4}\.\d{1,2}\.\d+$/);
	});

	it("package version is semver", () => {
		expect(pkg.version).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
	});

	it("package is an ES module so vitest and eslint configs load", () => {
		expect(pkg.type).toBe("module");
	});
});
