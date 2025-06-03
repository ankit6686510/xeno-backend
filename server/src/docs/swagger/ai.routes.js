/**
 * @swagger
 * /api/ai/generate-segment:
 *   post:
 *     summary: Generate customer segment from natural language description
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Natural language description of the desired segment
 *     responses:
 *       200:
 *         description: Generated segment criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criteria:
 *                   type: object
 *                   description: Generated segment criteria
 * 
 * /api/ai/generate-messages:
 *   post:
 *     summary: Generate message suggestions for a segment
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - segmentId
 *             properties:
 *               segmentId:
 *                 type: string
 *                 description: ID of the segment to generate messages for
 *     responses:
 *       200:
 *         description: Generated message suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Suggested message content
 * 
 * /api/ai/campaign-insights/{campaignId}:
 *   get:
 *     summary: Generate insights for a campaign
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the campaign to analyze
 *     responses:
 *       200:
 *         description: Campaign insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       metrics:
 *                         type: object
 * 
 * /api/ai/generate-campaign-content:
 *   post:
 *     summary: Generate campaign content using AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - segmentId
 *               - campaignType
 *             properties:
 *               segmentId:
 *                 type: string
 *                 description: ID of the target segment
 *               campaignType:
 *                 type: string
 *                 description: Type of campaign (e.g., 'email', 'sms')
 *               tone:
 *                 type: string
 *                 description: Desired tone of the content
 *     responses:
 *       200:
 *         description: Generated campaign content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: Generated campaign content
 *                 variations:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Alternative content variations
 */ 