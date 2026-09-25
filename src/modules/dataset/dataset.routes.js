import { Router } from "express";
import {
  listDatasets,
  getDataset,
  getDatasetRecords,
  exportDatasetFile,
  chatWithDataset,
  generateReport,
  getDatasetLineage,
} from "./dataset.controller.js";
import { optionalAuthMiddleware } from "../../middleware/optionalAuth.js";

const router = Router();

router.use(optionalAuthMiddleware);

// Public / Guest supported routes for Data Intelligence Platform
router.get("/", listDatasets);
router.get("/:id", getDataset);
router.get("/:id/records", getDatasetRecords);
router.get("/:id/export", exportDatasetFile);
router.get("/:id/lineage", getDatasetLineage);

// AI-Powered Features (Priority 1)
router.post("/:id/chat", chatWithDataset);
router.post("/:id/report", generateReport);

export default router;
