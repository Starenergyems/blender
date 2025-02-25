const swaggerJsdoc = require('swagger-jsdoc');
const schemas = require('./schemas');
const health = require('./health');
const plan = require('./plan');
const collect = require('./collect');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BLEnDer-DEP API Client',
      version: '1.0.0',
      description: 'API client for BLEnDer-DEP data integration',
      contact: {
        name: 'API Support'
      },
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        variables: {
          port: {
            default: '13005'
          }
        }
      }
    ],
    tags: [
      health.tag,
      plan.tag,
      collect.tag
    ],
    components: {
      schemas: schemas
    }
  },
  apis: [
    './src/docs/swagger/health.js',
    './src/docs/swagger/plan.js',
    './src/docs/swagger/collect.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 