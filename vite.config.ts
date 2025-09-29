import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // hỗ trợ import alias như "@/types"
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"], // tốt nếu lucide-react gây lỗi phân giải
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
