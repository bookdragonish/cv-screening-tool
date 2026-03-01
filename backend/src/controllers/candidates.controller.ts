import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

/**
 * List all candidates.
 *
 * Queries the database for all candidates and returns them in descending `id` order.
 *
 * Response:
 * - 200: JSON array of candidates
 *
 * Notes:
 * - This endpoint currently returns `cv_pdf` in the response, which may be a large binary buffer.
 *   Consider returning a boolean like `has_cv` instead (or exclude `cv_pdf`) for performance.
 */
export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query(
      "select id, name, email, created_at, cv_pdf from candidates order by id desc",
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

/**
 * Gets single candidate.
 *
 * Path params: 
 *  - id: number (candidate id)
 *
 *  * Responses:
 * - 200: JSON candidate object
 * - 404: `{ error: "Not found" }` if no candidate exists with that id
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const r = await pool.query(
      "select id, name, email, created_at from candidates where id=$1",
      [id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

/**
 * Create a candidate.
 *
 * Expects JSON body:
 * - name: string (required)
 * - email: string (required)
 * - cv_pdf: (optional/depends on your client) binary or other representation
 *
 * Responses:
 * - 201: created candidate record
 * - 400: `{ error: "name and email are required" }`
 *
 * Notes:
 * - In typical Express setups, JSON bodies cannot carry a `File` directly.
 *   If you want to upload a PDF, prefer `uploadCV` (multipart/form-data) instead.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, cv_pdf } = req.body as {
      name?: string;
      email?: string;
      cv_pdf: File;
    };
    if (!name || !email)
      return res.status(400).json({ error: "name and email are required" });

    const r = await pool.query(
      "insert into candidates(name, email, cv_pdf) values($1, $2, $3) returning id, name, email, cv_pdf, created_at",
      [name, email, cv_pdf],
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

/**
 * Upload/replace a candidate's CV PDF.
 *
 * Path params:
 * - id: number (candidate id)
 *
 * Expects multipart/form-data:
 * - file field name: `cv`
 *
 * Requirements:
 * - `id` must be a valid number
 * - file must be present
 * - file must have mimetype `application/pdf`
 *
 * Responses:
 * - 200: `{ ok: true }` on success
 * - 400: `{ error: "Invalid candidate id" }` if id is missing/invalid
 * - 400: `{ error: "Missing file field 'cv'" }` if no file uploaded
 * - 415: `{ error: "Only PDF supported" }` if file isn't a PDF
 * - 404: `{ error: "Candidate not found" }` if id does not exist
 *
 * Notes:
 * - This handler assumes middleware like `multer` is configured and populates `req.file`.
 */
export async function uploadCV(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid candidate id" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Missing file field 'cv'" });
  }

  if (req.file.mimetype !== "application/pdf") {
    return res.status(415).json({ error: "Only PDF supported" });
  }

  const result = await pool.query(
    `UPDATE candidates SET cv_pdf = $1 WHERE id = $2`,
    [req.file.buffer, id],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  res.json({ ok: true });
}


/**
 * View a candidate's CV PDF.
 *
 * Path params:
 * - id: number (candidate id)
 *
 * Responses:
 * - 200: PDF bytes with headers:
 *   - Content-Type: application/pdf
 *   - Content-Disposition: inline; filename="cv.pdf"
 * - 404: "Candidate not found" if candidate id doesn't exist
 * - 404: "No CV uploaded" if candidate exists but `cv_pdf` is null
 */
export async function getCV(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    const r = await pool.query("select cv_pdf from candidates where id = $1", [
      id,
    ]);

    if (r.rowCount === 0) return res.status(404).send("Candidate not found");

    const pdf: Buffer | null = r.rows[0].cv_pdf;
    if (!pdf) return res.status(404).send("No CV uploaded");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="cv.pdf"');
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

/**
 * Removes a candidate.
 *
 * Path params:
 * - id: number (candidate id)
 * 
 *  * Responses:
 * - 200: `{ ok: true }` on success
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const r = await pool.query("delete from candidates where id=$1", [id])
    if(r.rowCount === 0) return res.status(400).json({ error: "Candidate not found" })
    res.status(200).json({ message: "Candidate was deleted" })
  } catch (e) {
    next(e);
  }
}