import { defineConfig } from "vite";
import fs from "vite-plugin-fs";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fs({ rootDir: ".." })],
});
