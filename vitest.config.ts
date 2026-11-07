import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

// Two projects:
//  - unit:      pure logic (config normalization, geometry, style mapping) in Node.
//  - component: Lit elements in a real Chromium via Playwright, because drag
//               handling depends on layout and pointer capture that jsdom lacks.
export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["test/unit/**/*.test.ts"],
				},
			},
			{
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
});
