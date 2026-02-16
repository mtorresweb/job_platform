import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip linting during production builds to avoid blocking deploys on warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
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
      {
        protocol: 'https',
        hostname: process.env.BLOB_PUBLIC_BASE_URL ? new URL(process.env.BLOB_PUBLIC_BASE_URL).hostname : 'public.blob.vercel-storage.com',
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
