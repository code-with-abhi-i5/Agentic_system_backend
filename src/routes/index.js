import { Router } from "express";

import chatRoutes
    from "../modules/chat/chat.routes.js";
import authRoutes
    from "../modules/auth/auth.routes.js";
import conversationRoutes
    from "../modules/conversation/conversation.routes.js";
import datasetRoutes
    from "../modules/dataset/dataset.routes.js";
import taskRoutes
    from "../modules/task/task.routes.js";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);
router.use("/datasets", datasetRoutes);
router.use("/tasks", taskRoutes);

export default router;