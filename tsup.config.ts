import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    outExtension({ format }) {
      return format === "esm" ? { js: ".mjs" } : { js: ".cjs" };
    },
  },
]);
