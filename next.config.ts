import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'job-platform-azure.vercel.app',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      // Turbopack expects project-relative paths for aliases
      "lucide-react": "./src/shared/icons/illustrative.tsx",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Webpack requires absolute paths; include extension to avoid resolution issues
      "lucide-react": path.join(
        process.cwd(),
        "src/shared/icons/illustrative.tsx"
      ),
    };
    return config;
  },
};

export default nextConfig;
