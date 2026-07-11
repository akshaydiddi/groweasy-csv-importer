import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { CsvParseError } from "../services/csvParser";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof CsvParseError) {
    res.status(400).json({ error: `Invalid CSV: ${err.message}` });
    return;
  }
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File exceeds the 5MB size limit." : err.message;
    res.status(400).json({ error: message });
    return;
  }
  if (err instanceof Error && err.message.includes("GEMINI_API_KEY")) {
    res.status(500).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong while processing your file." });
}
