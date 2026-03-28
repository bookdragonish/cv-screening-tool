import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./db/pool.js";
import cors from "cors";
import { readFile } from "node:fs/promises";
import norLLM from "./services/llm/norllm/request.js";
import { run } from "node:test";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_HOSTED_LINK,
  }),
);

app.use(express.json());
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "API is running. Write /api to get info",
  });
});

app.get("/norllm", async (_req, res) => {
  try {
    const buffer = await readFile("src/services/llm/norllm/cv.pdf");
    const data = await norLLM(buffer);
    res.json({ ok: true, message: data });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error occurred while fetching NorLLM data" });
  }
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
