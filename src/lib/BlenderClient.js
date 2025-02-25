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
}

module.exports = BlenderClient; 