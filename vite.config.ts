import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        clearMocks: true,
        coverage: {
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
