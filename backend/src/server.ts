import "dotenv/config";
import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/db-check", async (_req, res) => {
  const r = await pool.query("select now() as now");
  res.json({ ok: true, now: r.rows[0].now });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
