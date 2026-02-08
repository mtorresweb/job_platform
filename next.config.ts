import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "w0.peakpx.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
