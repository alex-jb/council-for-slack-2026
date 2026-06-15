import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    service: "council-for-slack",
    version: "0.0.1",
    ts: new Date().toISOString(),
  });
}
