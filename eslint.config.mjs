// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "dist/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // ──────────────────────────────────────────────
      // 타입 안전성
      // ──────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/unbound-method": "off",

      // NestJS 데코레이터 호환을 위해 unsafe 계열은 off 유지
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",

      // ──────────────────────────────────────────────
      // 코드 품질
      // ──────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-redundant-type-constituents": "error",
      "@typescript-eslint/no-duplicate-enum-values": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      // ──────────────────────────────────────────────
      // import / export 정리
      // ──────────────────────────────────────────────
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "no-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // ──────────────────────────────────────────────
      // 일관성
      // ──────────────────────────────────────────────
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/dot-notation": "off",

      // ──────────────────────────────────────────────
      // 기본 ESLint 규칙 강화
      // ──────────────────────────────────────────────
      "no-console": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-return-await": "off",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      curly: ["error", "all"],
      "no-throw-literal": "off",
      "@typescript-eslint/only-throw-error": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-duplicate-imports": "error",
      "object-shorthand": ["error", "always"],
    },
  },
  // ──────────────────────────────────────────────
  // 테스트 파일 완화 규칙
  // ──────────────────────────────────────────────
  {
    files: ["test/**/*.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-console": "off",
    },
  },
);
