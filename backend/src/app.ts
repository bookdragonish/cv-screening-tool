import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());
app.use("/api", routes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(errorHandler);
