import { defineConfig } from "vite";

// Builds the single bundle Home Assistant loads as a dashboard resource.
// The output name must match "filename" in hacs.json.
export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"],
			fileName: () => "slide-confirm.js",
		},
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		target: "es2020",
		minify: "esbuild",
		rollupOptions: {
			output: {
				// One file only: no code splitting, no shared chunks.
				inlineDynamicImports: true,
			},
		},
	},
});
