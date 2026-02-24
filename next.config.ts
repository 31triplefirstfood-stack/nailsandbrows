import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Tell Turbopack/Webpack not to bundle these – use the pre-compiled node_modules version
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
