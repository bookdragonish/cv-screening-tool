import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query("select id, name, email, created_at from candidates order by id desc");
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const r = await pool.query("select id, name, email, created_at from candidates where id=$1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email } = req.body as { name?: string; email?: string };
    if (!name || !email) return res.status(400).json({ error: "name and email are required" });

    const r = await pool.query(
      "insert into candidates(name, email) values($1, $2) returning id, name, email, created_at",
      [name, email]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

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
