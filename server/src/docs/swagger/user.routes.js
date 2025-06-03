/**
 * @swagger
 * /api/user/create-segment:
 *   post:
 *     summary: Create a new customer segment
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       201:
 *         description: Segment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Segment'
 *       400:
 *         description: Invalid input data
 * 
 * /api/user/get-segment:
 *   get:
 *     summary: Get all segments for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of segments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 segments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segment'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 * 
 * /api/user/estimate-segment:
 *   post:
 *     summary: Estimate the size of a segment based on criteria
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criteria
 *             properties:
 *               criteria:
 *                 type: object
 *                 description: Segment criteria for filtering customers
 *     responses:
 *       200:
 *         description: Segment size estimate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Estimated number of customers in segment
 * 
 * /api/user/preview-segment:
 *   post:
 *     summary: Get a preview of customers in a segment
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criteria
 *             properties:
 *               criteria:
 *                 type: object
 *                 description: Segment criteria for filtering customers
 *     responses:
 *       200:
 *         description: Preview of customers in segment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 * 
 * /api/user/create-campaign:
 *   post:
 *     summary: Create a new campaign
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Invalid input data
 * 
 * /api/user/get-campaign:
 *   get:
 *     summary: Get all campaigns for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 * 
 * /api/user/get-log:
 *   get:
 *     summary: Get communication logs for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of communication logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       campaignId:
 *                         type: string
 *                       customerId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */ 