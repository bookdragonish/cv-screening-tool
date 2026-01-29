import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./db/pool.js";

export const app = express();

app.use(express.json());
app.use("/api", routes);

app.get("/api", (_req, res) => {
  res.json({ ok: true, message: "API is running. Write /candidates to get info" });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/db-check", async (_req, res, next) => {
  try {
    const r = await pool.query("select now() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);
