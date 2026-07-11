import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { importRouter } from "./routes/import";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: ORIGIN }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", importRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GrowEasy CSV importer backend listening on http://localhost:${PORT}`);
});
