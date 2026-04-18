import type { Request, Response, NextFunction } from "express";
import { parsePdf } from "../middleware/parserPDF.js";

export async function pdfParser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Ingen PDF er lastet opp for parsing" });
    }

    const cvText = (await parsePdf(req.file.buffer)).trim();
    return res.status(200).json({ cvText });
  } catch (e) {
    return next(e);
  }
}
