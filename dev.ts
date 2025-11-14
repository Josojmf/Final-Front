#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

await ensureFreshManifest();
await dev(import.meta.url, "./main.ts", config);

async function ensureFreshManifest() {
  const manifestUrl = new URL("./fresh.gen.ts", import.meta.url);
  try {
    await Deno.lstat(manifestUrl);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log("[dev] fresh.gen.ts missing, generating manifest...");
      const command = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "-A",
          "--unstable",
          "https://deno.land/x/fresh@1.6.8/cli.ts",
          "build",
        ],
        stdout: "piped",
        stderr: "piped",
      });
      const { code, stdout, stderr } = await command.output();
      if (code !== 0) {
        const decoder = new TextDecoder();
        console.error("[dev] Failed to generate Fresh manifest:");
        console.error(decoder.decode(stderr) || decoder.decode(stdout));
        throw new Error(`Fresh build failed with status ${code}`);
      }
      console.log("[dev] Fresh manifest generated successfully.");
      return;
    }
    throw error;
  }
}
