import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Keep development assets separate from production build output. This
  // prevents a running local server from serving stale or missing chunks
  // when a production build is created at the same time.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
