import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Next's guard against importing server code into the browser; a no-op in tests.
      "server-only": fileURLToPath(new URL("./tests/unit/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // Slot maths must not depend on the machine's time zone.
    env: { TZ: "UTC" },
  },
});
