import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  generateSegment,
  generateMessageSuggestions,
  generateCampaignInsights,
  generateCampaignContent,
} from "../controllers/ai.controller.js";

const router = Router();

router.post("/generate-segment", authenticate, generateSegment);
router.post("/generate-messages", authenticate, generateMessageSuggestions);
router.get("/campaign-insights/:campaignId", authenticate, generateCampaignInsights);
router.post("/generate-campaign-content", authenticate, generateCampaignContent);

export default router;
