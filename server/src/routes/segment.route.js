import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createSegment,
  deleteSegment,
  getSegmentById,
  getSegments,
  updateSegment,
} from "../controllers/segment.controller.js";

const router = Router();

router.route("/create-segment").post(authenticate, createSegment);

router.route("/get-segment").get(authenticate, getSegments);

router.route("/get-segment/:id").get(authenticate, getSegmentById);

router.route("/update-segment/:id").put(authenticate, updateSegment);

router.route("/delete-segment/:id").delete(authenticate, deleteSegment);

export default router;
