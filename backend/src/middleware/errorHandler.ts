import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
