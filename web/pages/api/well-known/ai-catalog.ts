// Serves /.well-known/ai-catalog.json via rewrite (see next.config.ts).
//
// Background: Next.js excludes public/.{dotfile-or-dir}/ from static
// serving by default (security: prevents .env etc. leak). The ARD
// spec mandates /.well-known/ai-catalog.json at deployment root, so we
// serve from the actual JSON file in public/.well-known/ via this API
// route + a next.config rewrite.

import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const CATALOG_PATH = join(process.cwd(), "public", ".well-known", "ai-catalog.json");

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(catalog);
  } catch (err) {
    res.status(500).json({ error: "catalog not readable", details: String(err) });
  }
}
