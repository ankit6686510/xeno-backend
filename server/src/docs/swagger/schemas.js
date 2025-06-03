/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email address
 *         phone:
 *           type: string
 *           description: Customer's phone number
 *         address:
 *           type: string
 *           description: Customer's address
 *         company:
 *           type: string
 *           description: Customer's company name
 *         notes:
 *           type: string
 *           description: Additional notes about the customer
 *     
 *     Segment:
 *       type: object
 *       required:
 *         - name
 *         - criteria
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the segment
 *         description:
 *           type: string
 *           description: Description of the segment
 *         criteria:
 *           type: object
 *           description: Segment criteria for filtering customers
 *           properties:
 *             conditions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   operator:
 *                     type: string
 *                   value:
 *                     type: string
 *         isActive:
 *           type: boolean
 *           description: Whether the segment is active
 *     
 *     Campaign:
 *       type: object
 *       required:
 *         - name
 *         - segmentId
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the campaign
 *         segmentId:
 *           type: string
 *           description: ID of the segment to target
 *         message:
 *           type: string
 *           description: Campaign message content
 *     
 *     Order:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *       properties:
 *         customerId:
 *           type: string
 *           description: ID of the customer who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         totalAmount:
 *           type: number
 *         shippingAddress:
 *           type: string
 *         paymentMethod:
 *           type: string
 */ 