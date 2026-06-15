import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/slack/events", destination: "/api/slack/events" },
      { source: "/slack/oauth_redirect", destination: "/api/slack/oauth_redirect" },
    ];
  },
};

export default nextConfig;
