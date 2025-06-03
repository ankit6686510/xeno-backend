import { Router } from "express";
import {
  createCampaign,
  createSegment,
  estimateSegment,
  getCommuniactionLog,
  getUserCampaigns,
  getUserSegments,
  getSegmentPreview,
  updateDeliveryStatus
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-segment").post(authenticate, createSegment);
router.route("/get-segment").get(authenticate, getUserSegments);
router.route("/estimate-segment").post(authenticate, estimateSegment);
router.route("/preview-segment").post(authenticate, getSegmentPreview);

router.route("/create-campaign").post(authenticate, createCampaign);
router.route("/get-campaign").get(authenticate, getUserCampaigns);

router.route("/get-log").get(authenticate, getCommuniactionLog);

router.route("/delivery-receipt").post(updateDeliveryStatus);

export default router;
