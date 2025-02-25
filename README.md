# BLEnDer-DEP API Client

A Node.js API client for the BLEnDer-DEP data integration API.

## Features

- Plan data retrieval
- Collect data retrieval and creation
- Docker support
- Logging with Winston
- Environment-based configuration
- Interactive API documentation with Swagger UI

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- API credentials (OAuth token)

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running with Docker

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```
   The application runs on port 3000 inside the container but is exposed on port 13005 by default.

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop the container:
   ```bash
   docker-compose down
   ```

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:13005/api-docs
```

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Example requests
- Error responses
- Interactive API testing interface

## Port Configuration

The application uses a port mapping configuration:
- Internal port (inside container): Always 3000
- External port (host machine): 13005 by default, configurable via PORT environment variable

For example:
```bash
# Default configuration
PORT=13005 docker-compose up -d
# Access at http://localhost:13005
# Swagger UI at http://localhost:13005/api-docs

# Custom external port
PORT=8080 docker-compose up -d
# Access at http://localhost:8080
# Swagger UI at http://localhost:8080/api-docs
```

## Testing the API

A test script is provided to demonstrate the API functionality:

```bash
# Make the script executable if needed
chmod +x test-api.sh

# Run all tests (uses port 13005 by default)
./test-api.sh

# Test against a different base URL
API_BASE_URL=http://other-host:13005 ./test-api.sh
```

The test script includes:
- Health check endpoint test
- Plan data retrieval test
- Collect data GET and POST tests
- Error handling tests

The script uses color-coded output and formats JSON responses for readability.

## API Endpoints

### Get Plan Data
```
GET /api/plan
```
Query parameters:
- from: Start date (ISO8601)
- to: End date (ISO8601)
- intervalType: 0, 1, or 2
- resources: Comma-separated list of resource IDs
- attributes: Comma-separated list of attributes

### Get Collect Data
```
GET /api/collect
```
Query parameters:
- from: Start date (ISO8601)
- to: End date (ISO8601)
- cycle: 1-5
- resources: Comma-separated list of resource IDs
- attributes: Comma-separated list of attributes

### Create Collect Data
```
POST /api/collect
```
Request body: See API documentation for CollectPayload schema

## Environment Variables

- `API_BASE_URL`: Base URL for the API
- `API_ENVIRONMENT`: Environment (dev/stg/service)
- `API_CLIENT_ID`: OAuth client ID
- `API_CLIENT_SECRET`: OAuth client secret
- `PORT`: External port for host machine (default: 13005, container always uses 3000)
- `LOG_LEVEL`: Logging level (default: info)

## Development

Run in development mode with hot reloading:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
``` 