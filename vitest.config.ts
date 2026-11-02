import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/features/documents/calc/**"],
      exclude: ["**/*.test.ts", "**/types.ts"],
      thresholds: { lines: 100, functions: 100, branches: 95 },
    },
  },
});
