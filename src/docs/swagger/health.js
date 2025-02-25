/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API health status
 *     description: Returns the health status of the API and current environment settings
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health check passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

module.exports = {
  tag: {
    name: 'Health',
    description: 'Health check endpoints'
  }
}; 