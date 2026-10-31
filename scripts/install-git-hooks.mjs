import { execSync } from "node:child_process";

// Vercel et les installs sans dépôt git ne doivent pas faire échouer pnpm install.
try {
  execSync("git rev-parse --git-dir", { stdio: "ignore" });
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
} catch {
  process.exit(0);
}
