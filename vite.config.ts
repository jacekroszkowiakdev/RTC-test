import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        clearMocks: true,
        coverage: {
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 55,
                statements: 80,
            },
            reporter: ["text", "lcov"],
            exclude: [
                "node_modules/",
                "test/",
                "src/**/*.test.ts",
                "src/**/*Test.ts",
                "src/types/types.ts",
                "src/index.ts",
            ],
        },
    },
});
