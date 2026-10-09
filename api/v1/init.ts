import type { VercelRequest, VercelResponse } from "@vercel/node";
import { preflight, ok } from "../_lib/http";
import crypto from "node:crypto";

/**
 * POST /api/v1/init
 * Starts a client session. With our own auth there is no server-side session object yet —
 * this just returns server time + a nonce (used to detect replay / sign responses later).
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (preflight(req, res)) return;
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ success: false, message: "method not allowed" });
    return;
  }
  ok(res, {
    success: true,
    message: "Initialized",
    version: process.env.AUTH_VERSION || "1.0",
    serverTime: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  });
}
