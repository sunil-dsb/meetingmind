import { Router } from "express";
import { summarizeMeetingController } from "../controller/summary.controller.js";
import { validateBody } from "../middleware/validate.js";
import { summarizeBodySchema } from "../validators/schemas.js";

const summarizeRouter = Router();

summarizeRouter.post(
  "/",
  validateBody(summarizeBodySchema),
  summarizeMeetingController
);

export default summarizeRouter;
