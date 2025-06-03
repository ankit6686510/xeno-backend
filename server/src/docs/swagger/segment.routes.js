/**
 * @swagger
 * /api/segment/create-segment:
 *   post:
 *     summary: Create a new customer segment
 *     tags: [Segments]
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
 * /api/segment/get-segment:
 *   get:
 *     summary: Get all segments for the authenticated user
 *     tags: [Segments]
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
 * /api/segment/get-segment/{id}:
 *   get:
 *     summary: Get a specific segment by ID
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Segment'
 *       404:
 *         description: Segment not found
 * 
 * /api/segment/update-segment/{id}:
 *   put:
 *     summary: Update a segment
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       200:
 *         description: Segment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Segment'
 *       404:
 *         description: Segment not found
 * 
 * /api/segment/delete-segment/{id}:
 *   delete:
 *     summary: Delete a segment (soft delete)
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment deleted successfully
 *       404:
 *         description: Segment not found
 */ 