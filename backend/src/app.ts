import express from "express";
import helmet from "helmet";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { clientRouter } from "./routes/client.js";
import { techRouter } from "./routes/tech.js";

export function createApp() {
  const app = express();
  // Railway/Reverse proxy: required for correct IP detection in rate-limit and auth endpoints.
  app.set("trust proxy", 1);
  app.use(helmet());
  // TEMP: fully open CORS (no restrictions).
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "electron-app-api" });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/client", clientRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/tech", techRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Не найдено" });
  });

  return app;
}
