require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const BlenderClient = require('./lib/BlenderClient');
const logger = require('./lib/logger');
const swaggerSpecs = require('./docs/swagger');

const app = express();
const port = process.env.PORT || 3000;

// Initialize the BlenderClient
const client = new BlenderClient({
  baseURL: process.env.API_BASE_URL,
  environment: process.env.API_ENVIRONMENT || 'dev',
  clientId: process.env.API_CLIENT_ID,
  clientSecret: process.env.API_CLIENT_SECRET
});

// Initialize token (skip in dev environment)
(async () => {
  try {
    if (process.env.API_ENVIRONMENT !== 'dev') {
      await client.getToken();
      logger.info('Successfully obtained OAuth token');
    } else {
      logger.info('Development environment: Skipping initial token acquisition');
    }
  } catch (error) {
    logger.error('Failed to obtain initial OAuth token:', error.message);
    process.exit(1);
  }
})();

app.use(express.json());

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    api_environment: process.env.API_ENVIRONMENT || 'dev'
  });
});

// Middleware to refresh token on 401 errors (skip in dev environment)
app.use(async (err, req, res, next) => {
  if (process.env.API_ENVIRONMENT === 'dev') {
    return next(err);
  }

  if (err.response && err.response.status === 401) {
    try {
      await client.getToken();
      return next();
    } catch (error) {
      logger.error('Error refreshing token:', error.message);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
  next(err);
});

// Plan data endpoint
app.get('/api/plan', async (req, res) => {
  try {
    const params = {
      from: req.query.from,
      to: req.query.to,
      intervalType: parseInt(req.query.intervalType),
      resourceTypes: req.query.resourceTypes ? req.query.resourceTypes.split(',') : undefined,
      resources: req.query.resources ? req.query.resources.split(',') : undefined,
      attributes: req.query.attributes ? req.query.attributes.split(',') : undefined,
      tenantIds: req.query.tenantIds ? req.query.tenantIds.split(',') : undefined
    };

    client.validateDateRange(params.from, params.to);
    const data = await client.getPlanData(params);
    res.json(data);
  } catch (error) {
    logger.error('Error in /api/plan:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Collect data endpoints
app.get('/api/collect', async (req, res) => {
  try {
    const params = {
      from: req.query.from,
      to: req.query.to,
      cycle: parseInt(req.query.cycle),
      resourceTypes: req.query.resourceTypes ? req.query.resourceTypes.split(',') : undefined,
      resources: req.query.resources ? req.query.resources.split(',') : undefined,
      attributes: req.query.attributes ? req.query.attributes.split(',') : undefined,
      tenantIds: req.query.tenantIds ? req.query.tenantIds.split(',') : undefined,
      dataType1: req.query.dataType1 ? parseInt(req.query.dataType1) : undefined
    };

    client.validateDateRange(params.from, params.to);
    client.validateCycle(params.cycle);
    client.validateDataType1(params.dataType1);
    client.validateCycleTimePeriod(params.cycle, params.from, params.to);
    
    const data = await client.getCollectData(params);
    res.json(data);
  } catch (error) {
    logger.error('Error in /api/collect:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/collect', async (req, res) => {
  try {
    const data = await client.createCollectData(req.body);
    res.json(data);
  } catch (error) {
    logger.error('Error in POST /api/collect:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Swagger documentation available at http://localhost:${port}/api-docs`);
  logger.info(`Running in ${process.env.API_ENVIRONMENT || 'dev'} environment`);
}); 