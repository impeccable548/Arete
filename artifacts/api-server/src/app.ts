import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import path from "path";

app.use("/api", router);

// --- SERVE VITE FRONTEND (STEP 2) ---
const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "artifacts/arete/dist");

// Serve the static build assets (JS, CSS, images)
app.use(express.static(frontendDistPath));

// Fallback route: Let Vite's router handle page refreshes
app.get("*", (req, res) => {
  // If an API request somehow leaks here, return a clean 404 instead of index.html
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});
// ------------------------------------

export default app;
