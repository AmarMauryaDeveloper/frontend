const hostUrl = process.env.VITE_API_URL;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "https://backend-e1r4.onrender.com",
        // target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "https://backend-e1r4.onrender.com",
        // target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://backend-e1r4.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
