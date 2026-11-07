import js from "@eslint/js";
import tseslint from "typescript-eslint";
import lit from "eslint-plugin-lit";
import wc from "eslint-plugin-wc";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
	{
		ignores: ["dist/", "node_modules/", "img/", ".parcel-cache/"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	lit.configs["flat/recommended"],
	wc.configs["flat/recommended"],
	{
		files: ["**/*.ts"],
		languageOptions: {
			globals: { ...globals.browser },
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
	{
		files: ["*.config.{js,ts}", "eslint.config.js"],
		languageOptions: {
			globals: { ...globals.node },
		},
	},
	prettier,
);
