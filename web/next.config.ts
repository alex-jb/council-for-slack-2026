import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/slack/events", destination: "/api/slack/events" },
      { source: "/slack/oauth_redirect", destination: "/api/slack/oauth_redirect" },
      // ARD v0.9 conformance — Next excludes public/.{dotfile}/ from static
      // serving by default, so route /.well-known/* through API handlers.
      { source: "/.well-known/ai-catalog.json", destination: "/api/well-known/ai-catalog" },
      { source: "/.well-known/mcp-cards/council.json", destination: "/api/well-known/mcp-cards/council" },
    ];
  },
};

export default nextConfig;
