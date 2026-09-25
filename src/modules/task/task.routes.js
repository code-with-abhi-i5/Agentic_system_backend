import { Router } from "express";
import {
  startExtractionTask,
  listTasks,
  getTaskDetails,
  confirmSchemaAndSave,
} from "./task.controller.js";
import { optionalAuthMiddleware } from "../../middleware/optionalAuth.js";

const router = Router();

router.use(optionalAuthMiddleware);

// Guest & platform supported task routes
router.post("/create", startExtractionTask);
router.post("/:taskId/confirm-schema", confirmSchemaAndSave);
router.get("/", listTasks);
router.get("/:id", getTaskDetails);

export default router;
