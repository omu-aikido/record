import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    // 基本・インデント
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    semi: true,

    // 文字列・クォート
    singleQuote: false,
    jsxSingleQuote: true,
    quoteProps: "as-needed",

    // 構造
    trailingComma: "es5",
    bracketSpacing: true,
    bracketSameLine: true,

    // 改行・空白
    endOfLine: "lf",
    insertFinalNewline: true,
    htmlWhitespaceSensitivity: "css",
    singleAttributePerLine: false,

    // メタデータ
    insertPragma: false,
    requirePragma: false,
    sortPackageJson: {
      sortScripts: true,
    },

    // Ignore
    ignorePatterns: ["node_modules", "dist"],
  },
  lint: {
    plugins: ["import", "unicorn", "promise", "typescript", "oxc"],
    categories: {
      correctness: "error",
      suspicious: "warn",
      pedantic: "warn",
      perf: "warn",
      style: "off",
      restriction: "off",
    },
    rules: {
      "consistent-type-imports": "warn",
      "eslint/max-lines-per-function": [
        "warn",
        {
          max: 60,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
      "eslint/no-useless-return": "allow",
      "import/max-dependencies": [
        "warn",
        {
          max: 15,
        },
      ],
      "no-inline-comments": "allow",
      "sort-imports": [
        "warn",
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          memberSyntaxSortOrder: ["none", "single", "multiple", "all"],
        },
      ],
      "unicorn/no-null": "off",
      "unicorn/prefer-add-event-listener": "allow",
      "unicorn/prefer-top-level-await": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/prefer-readonly-parameter-types": "allow",
      "typescript/consistent-return": "allow",
    },
    ignorePatterns: ["*.config.ts", "**/*.test.ts", "**/*.spec.ts", ".direnv"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
});
