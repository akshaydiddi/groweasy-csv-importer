import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import { ApiError } from "../middleware/errorHandler";
import { parseCsv } from "../services/csvParser";
import { extractCrmRecords } from "../services/aiExtractor";
import { ImportResult } from "../types/crm";

export const importRouter = Router();

importRouter.post("/import", csvUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No CSV file was uploaded (expected field name 'file').");
    }

    const csvText = req.file.buffer.toString("utf-8");
    const { rows } = parseCsv(csvText);

    const { records, skipped, batchSummary } = await extractCrmRecords(rows);

    const payload: ImportResult = {
      records,
      skipped,
      totalImported: records.length,
      totalSkipped: skipped.length,
      totalRows: rows.length,
      batches: batchSummary,
    };

    res.json(payload);
  } catch (err) {
    next(err);
  }
});
