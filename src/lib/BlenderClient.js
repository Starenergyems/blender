const axios = require('axios');
const logger = require('./logger');

class BlenderClient {
  constructor(config) {
    this.baseURL = config.baseURL || '/dep-webapi';
    this.environment = config.environment || 'dev'; // 'dev', 'stg', or 'service'
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.token = config.token;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Only add Authorization header if not in dev environment
    if (this.environment !== 'dev') {
      this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Token management methods
  async getToken() {
    // Skip token acquisition in dev environment
    if (this.environment === 'dev') {
      logger.info('Development environment: Skipping token acquisition');
      return 'dev-mock-token';
    }

    try {
      const tokenEndpoint = this.getTokenEndpoint();
      const scope = this.getScope();
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('scope', scope);

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      });

      this.token = response.data.access_token;
      this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
      
      return this.token;
    } catch (error) {
      logger.error('Error getting OAuth token:', error.message);
      throw error;
    }
  }

  getTokenEndpoint() {
    const endpoints = {
      dev: 'https://service-platform-api-dev-dep.auth.ap-northeast-1.amazoncognito.com/oauth2/token',
      stg: 'https://service-platform-api-stg-dep.auth.ap-northeast-1.amazoncognito.com/oauth2/token',
      service: 'https://service-platform-api-service-dep.auth.ap-northeast-1.amazoncognito.com/oauth2/token'
    };
    return endpoints[this.environment];
  }

  getScope() {
    const scopes = {
      dev: 'service-platform-api-dev-dep-resource/api.auth',
      stg: 'service-platform-api-stg-dep-resource/api.auth',
      service: 'service-platform-api-service-dep-resource/api.auth'
    };
    return scopes[this.environment];
  }

  // Plan data methods
  async getPlanData(params) {
    try {
      // Validate required parameters
      if (!params.from || !params.to || params.intervalType === undefined) {
        throw new Error('from, to, and intervalType are required parameters');
      }

      // Validate date range
      this.validateDateRange(params.from, params.to);

      // Validate intervalType
      this.validateIntervalType(parseInt(params.intervalType));

      const response = await this.client.get('/data/plan', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching plan data:', error.message);
      throw error;
    }
  }

  // Collect data methods
  async getCollectData(params) {
    try {
      const response = await this.client.get('/data/collect', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching collect data:', error.message);
      throw error;
    }
  }

  async createCollectData(data) {
    // Validate required fields
    if (!data.cycle || !data.resources || !Array.isArray(data.resources)) {
      throw new Error('cycle and resources array are required');
    }

    // Validate cycle
    this.validateCycle(data.cycle);

    // Validate dataType1 if present at top level
    if (data.dataType1) {
      this.validateDataType1(data.dataType1);
    }

    // Validate each resource
    for (const resource of data.resources) {
      if (!resource.resourceId || !Array.isArray(resource.attributes)) {
        throw new Error('resourceId and attributes array are required for each resource');
      }

      // Validate each attribute
      for (const attr of resource.attributes) {
        this.validateAttribute(attr);

        // Get min and max dates for cycle period validation
        let minDate = null;
        let maxDate = null;

        // Validate each value
        for (const val of attr.values) {
          if (!val.datetime || val.value === undefined) {
            throw new Error('datetime and value are required for each value');
          }

          // Validate datetime format and range
          const date = new Date(val.datetime);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid datetime format. Use ISO8601 format (YYYY-MM-DDThh:mm:ss+TZ)');
          }

          // Track min and max dates
          if (!minDate || date < minDate) minDate = date;
          if (!maxDate || date > maxDate) maxDate = date;

          // Check timezone
          if (!/.*[+-]\d{2}:\d{2}$/.test(val.datetime)) {
            throw new Error('Timezone is required in format +HH:MM or -HH:MM');
          }

          // API Specification restriction:
          // - Future data can only be registered up to 4 months ahead
          // - Past data can only be registered up to 2 years ago
          const now = new Date();
          
          // Future limit: 4 months ahead (API仕様: 未来のデータ→4カ月先まで)
          const fourMonthsFromNow = new Date(now);
          fourMonthsFromNow.setMonth(now.getMonth() + 4);
          if (date > fourMonthsFromNow) {
            throw new Error('Future data can only be registered up to 4 months ahead (API specification)');
          }

          // Past limit: 2 years ago (API仕様: 過去のデータ→2年前まで)
          const twoYearsAgo = new Date(now);
          twoYearsAgo.setFullYear(now.getFullYear() - 2);
          if (date < twoYearsAgo) {
            throw new Error('Past data can only be registered up to 2 years ago (API specification)');
          }
        }

        // Validate time period for the cycle if we have values
        if (minDate && maxDate) {
          this.validateCycleTimePeriod(data.cycle, minDate, maxDate);
        }
      }
    }

    try {
      const response = await this.client.post('/data/collect', data);
      return response.data;
    } catch (error) {
      logger.error('Error creating collect data:', error.message);
      throw error;
    }
  }

  // Helper method to validate parameters
  validateDateRange(from, to) {
    if (!from || !to) {
      throw new Error('Both from and to dates are required');
    }

    // Check for timezone presence (must end with +HH:MM or -HH:MM)
    const timezoneRegex = /.*[+-]\d{2}:\d{2}$/;
    if (!timezoneRegex.test(from) || !timezoneRegex.test(to)) {
      throw new Error('Timezone is required in format +HH:MM or -HH:MM');
    }
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Check if dates are valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format. Use ISO8601 format (YYYY-MM-DDThh:mm:ss+TZ)');
    }
    
    if (fromDate > toDate) {
      throw new Error('From date must be before or equal to to date');
    }
  }

  // Helper method to validate cycle
  validateCycle(cycle) {
    const validCycles = [1, 2, 3, 4, 5];
    if (!validCycles.includes(cycle)) {
      throw new Error('Invalid cycle value. Must be one of: ' + validCycles.join(', '));
    }
  }

  // Helper method to validate intervalType
  validateIntervalType(intervalType) {
    const validTypes = [0, 1, 2];
    if (!validTypes.includes(intervalType)) {
      throw new Error('Invalid intervalType. Must be one of: ' + validTypes.join(', ') + 
        ' (0: Command value, 1: 1-minute plan, 2: 30-minute plan)');
    }
  }

  // Helper method to validate dataType1
  validateDataType1(dataType1) {
    const validTypes = [5, 6, 7, 8];
    if (dataType1 && !validTypes.includes(dataType1)) {
      throw new Error('Invalid dataType1. Must be one of: ' + validTypes.join(', ') + 
        ' (5:Actual Value, 6:Received Data, 7:Processed Data, 8:Forecast)');
    }
  }

  // Helper method to validate attribute
  validateAttribute(attr) {
    // Check required fields
    if (!attr.attribute || !Array.isArray(attr.values)) {
      throw new Error('attribute and values array are required for each attribute');
    }

    // Validate attribute format (should be a 6-digit number as string)
    if (!/^\d{6}$/.test(attr.attribute)) {
      throw new Error('attribute must be a 6-digit number string');
    }

    // Validate dataType fields if present
    if (attr.dataType1) {
      this.validateDataType1(attr.dataType1);
    }

    // Validate dataType2 and dataType3 (max length 64 if present)
    if (attr.dataType2 && attr.dataType2.length > 64) {
      throw new Error('dataType2 maximum length is 64 characters');
    }
    if (attr.dataType3 && attr.dataType3.length > 64) {
      throw new Error('dataType3 maximum length is 64 characters');
    }

    // Validate values array is not empty
    if (attr.values.length === 0) {
      throw new Error('values array cannot be empty');
    }
  }

  // Helper method to validate time period based on cycle
  validateCycleTimePeriod(cycle, from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffHours = (toDate - fromDate) / (1000 * 60 * 60);

    const maxPeriods = {
      1: 2,      // 1 second cycle: 2 hours
      2: 48,     // 1 minute cycle: 2 days
      3: 48,     // 5 minutes cycle: 2 days
      4: 1440,   // 30 minutes cycle: 2 months
      5: 1440    // 12 hours cycle: 2 months
    };

    if (diffHours > maxPeriods[cycle]) {
      throw new Error(`For cycle ${cycle}, maximum time period is ${maxPeriods[cycle]} hours`);
    }
  }
}

module.exports = BlenderClient; 