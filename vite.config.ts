import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// Builds the single bundle Home Assistant loads as a dashboard resource.
// The output name must match "filename" in hacs.json.
export default defineConfig({
	define: {
		__VERSION__: JSON.stringify(pkg.version),
	},
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
		// Vite keeps whitespace in ES library builds so /* @__PURE__ */ annotations
		// survive for downstream bundlers. This bundle is loaded by browsers directly,
		// so ask Rolldown for full minification instead.
		minify: false,
		rollupOptions: {
			output: {
				// One file only: no code splitting, no shared chunks.
				inlineDynamicImports: true,
				minify: { mangle: true, compress: true, codegen: { removeWhitespace: true } },
			},
		},
	},
});
