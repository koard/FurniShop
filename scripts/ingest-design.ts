#!/usr/bin/env node

/**
 * Placeholder ingest script. Will be implemented to convert UI exports into the application structure.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const [, , ...rest] = process.argv;
  const isPostinstall = rest.includes("--postinstall");

  const uiFolder = resolve(process.cwd(), "UI_FOLDER");
  if (!existsSync(uiFolder)) {
    if (!isPostinstall) {
      console.warn("[ingest] UI_FOLDER not found. Skipping ingestion.");
    }
    return;
  }

  console.info("[ingest] Placeholder script executed. Full ingestion logic pending implementation.");
}

main().catch((error) => {
  console.error("[ingest] Failed:", error);
  if (process.argv.includes("--postinstall")) {
    // Avoid breaking installs when the output has not been implemented yet.
    return;
  }
  process.exitCode = 1;
});
