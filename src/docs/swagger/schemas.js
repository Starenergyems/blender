const schemas = {
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: 'Error message'
      }
    }
  },
  HealthCheck: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'ok'
      },
      timestamp: {
        type: 'string',
        format: 'date-time'
      },
      environment: {
        type: 'string',
        example: 'production'
      },
      api_environment: {
        type: 'string',
        example: 'stg'
      }
    }
  },
  CollectDataRequest: {
    type: 'object',
    required: ['cycle', 'resources'],
    properties: {
      cycle: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: 'Data collection cycle'
      },
      resources: {
        type: 'array',
        items: {
          type: 'object',
          required: ['resourceId', 'attributes'],
          properties: {
            resourceId: {
              type: 'string',
              description: 'Resource identifier'
            },
            attributes: {
              type: 'array',
              items: {
                type: 'object',
                required: ['attribute', 'values'],
                properties: {
                  attribute: {
                    type: 'string',
                    description: 'Attribute identifier'
                  },
                  values: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['datetime', 'value'],
                      properties: {
                        datetime: {
                          type: 'string',
                          format: 'date-time',
                          description: 'date-time of the value'
                        },
                        value: {
                          type: 'string',
                          description: 'Attribute value'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = schemas; 