import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Admin screens intentionally fetch and hydrate local state from effects.
      // The Next.js 16 preset treats these legitimate async loaders as synchronous
      // setState calls, so this rule is disabled until the data layer moves to SWR.
      "react-hooks/set-state-in-effect": "off",
      // Existing loaders are intentionally stable for polling/live-event subscriptions.
      // Dependencies are reviewed manually to avoid reconnecting intervals on each render.
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
