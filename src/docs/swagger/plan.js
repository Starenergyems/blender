/**
 * @swagger
 * /api/plan:
 *   get:
 *     summary: Get plan data
 *     description: Retrieve plan data based on specified parameters
 *     tags: [Plan]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date and time
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date and time
 *       - in: query
 *         name: intervalType
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2]
 *         description: Interval type for data aggregation
 *       - in: query
 *         name: resources
 *         schema:
 *           type: string
 *         description: Comma-separated list of resource IDs
 *       - in: query
 *         name: attributes
 *         schema:
 *           type: string
 *         description: Comma-separated list of attributes
 *     responses:
 *       200:
 *         description: Plan data retrieved successfully
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

module.exports = {
  tag: {
    name: 'Plan',
    description: 'Plan data endpoints'
  }
}; 