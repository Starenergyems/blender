/**
 * @swagger
 * /api/collect:
 *   get:
 *     summary: Get collect data
 *     description: Retrieve collect data based on specified parameters
 *     tags: [Collect]
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
 *         name: cycle
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Data collection cycle
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
 *         description: Collect data retrieved successfully
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
 *   post:
 *     summary: Create collect data
 *     description: Create new collect data
 *     tags: [Collect]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollectDataRequest'
 *     responses:
 *       200:
 *         description: Collect data created successfully
 *       400:
 *         description: Invalid request body
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
    name: 'Collect',
    description: 'Collect data endpoints'
  }
}; 