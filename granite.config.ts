import os from "node:os";
import { defineConfig } from "@apps-in-toss/web-framework/config";

function getLanHost() {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }

  return "localhost";
}

export default defineConfig({
  appName: "day-calculator",
  brand: {
    displayName: "패밀리 디데이",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: getLanHost(),
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
});
