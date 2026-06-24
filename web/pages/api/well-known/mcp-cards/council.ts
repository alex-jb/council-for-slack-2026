// Serves /.well-known/mcp-cards/council.json via rewrite (see next.config.ts).
// Same pattern as ai-catalog — Next public/.{dot}/ serving disabled
// by default, so route + rewrite is the path.

import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const CARD_PATH = join(process.cwd(), "public", ".well-known", "mcp-cards", "council.json");

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const card = JSON.parse(readFileSync(CARD_PATH, "utf-8"));
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ error: "card not readable", details: String(err) });
  }
}
