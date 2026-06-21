import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow network IP access (e.g. from another device on the same WiFi)
  allowedDevOrigins: ["192.168.1.9"],
};

export default nextConfig;
