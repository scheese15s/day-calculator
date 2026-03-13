import os from "node:os";
import { defineConfig } from "@apps-in-toss/web-framework/config";

function isPrivateIpv4(address) {
  if (address.startsWith("10.") || address.startsWith("192.168.")) {
    return true;
  }

  if (!address.startsWith("172.")) {
    return false;
  }

  const [, secondOctet] = address.split(".");
  const octet = Number(secondOctet);
  return octet >= 16 && octet <= 31;
}

function getLanHost() {
  const configuredHost = process.env.AIT_HOST?.trim();
  if (configuredHost) {
    return configuredHost;
  }

  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        candidates.push(entry.address);
      }
    }
  }

  const privateAddress = candidates.find(isPrivateIpv4);
  if (privateAddress) {
    return privateAddress;
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  return "localhost";
}

function getPort() {
  const configuredPort = Number(process.env.AIT_PORT);
  if (Number.isInteger(configuredPort) && configuredPort > 0) {
    return configuredPort;
  }

  return 5173;
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
    port: getPort(),
    commands: {
      dev: "vite --host 0.0.0.0 --port 5173",
      build: "vite build",
    },
  },
  permissions: [],
});
