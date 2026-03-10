import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "day-calculator",
  brand: {
    displayName: "패밀리 디데이",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
});
