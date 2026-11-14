import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// Builds demo/index.html into a static site for GitHub Pages (see .github/workflows/pages.yml).
// `npm run demo` serves the same page from source; this is only for publishing it.
export default defineConfig({
	define: {
		__VERSION__: JSON.stringify(pkg.version),
	},
	// Relative asset URLs, so the site works under /slide-confirm/ on github.io.
	base: "./",
	build: {
		outDir: "dist-demo",
		emptyOutDir: true,
		target: "es2020",
		rollupOptions: {
			input: "demo/index.html",
		},
	},
});
