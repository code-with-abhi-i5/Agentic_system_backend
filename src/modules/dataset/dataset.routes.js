import { Router } from "express";
import {
  listDatasets,
  getDataset,
  getDatasetRecords,
  exportDatasetFile,
  chatWithDataset,
  generateReport,
  getDatasetLineage,
  getDatasetSuggestions,
  getDatasetDiff,
  getDatasetVersions,
  configureDatasetSchedule,
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
router.get("/:id/suggestions", getDatasetSuggestions);
router.get("/:id/diff", getDatasetDiff);
router.get("/:id/versions", getDatasetVersions);

// AI-Powered Features & Automation
router.post("/:id/chat", chatWithDataset);
router.post("/:id/report", generateReport);
router.post("/:id/schedule", configureDatasetSchedule);

export default router;
