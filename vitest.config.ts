import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config.ts";

// Two projects:
//  - unit:      pure logic (config normalization, geometry, style mapping) in Node.
//  - component: Lit elements in a real Chromium via Playwright, because drag
//               handling depends on layout and pointer capture that jsdom lacks.
// Shares `define` (and anything else) with the production vite config.
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			projects: [
				{
					extends: true,
					test: {
						name: "unit",
						environment: "node",
						include: ["test/unit/**/*.test.ts"],
					},
				},
				{
					extends: true,
					test: {
						name: "component",
						include: ["test/component/**/*.test.ts"],
						browser: {
							enabled: true,
							headless: true,
							provider: playwright(),
							instances: [{ browser: "chromium" }],
						},
					},
				},
			],
		},
	}),
);
