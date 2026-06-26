import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api is forwarded to the Express backend
      "/api": "http://localhost:5001",
    },
  },
});
