#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL=${API_BASE_URL:-"http://localhost:13005"}

echo -e "${BLUE}Testing BLEnDer-DEP API Client${NC}\n"

# Test health endpoint
echo -e "${GREEN}Testing Health Endpoint${NC}"
curl -s "${BASE_URL}/health" | json_pp
echo -e "\n"

# Test plan data endpoint
echo -e "${GREEN}Testing Plan Data Endpoint${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1&resources=resource1,resource2" | json_pp
echo -e "\n"

# Test collect data GET endpoint
echo -e "${GREEN}Testing Collect Data GET Endpoint${NC}"
curl -s "${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=2" | json_pp
echo -e "\n"

# Test collect data POST endpoint
echo -e "${GREEN}Testing Collect Data POST Endpoint${NC}"
curl -s -X POST "${BASE_URL}/api/collect" \
  -H "Content-Type: application/json" \
  -d '{
    "cycle": 2,
    "resources": [{
      "resourceId": "resource1",
      "attributes": [{
        "attribute": "310001",
        "values": [{
          "datetime": "2024-02-25T00:00:00+09:00",
          "value": "123.45"
        }]
      }]
    }]
  }' | json_pp
echo -e "\n"

# Test error handling (invalid date range)
echo -e "${GREEN}Testing Error Handling (Invalid Date Range)${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25T01:00:00%2B09:00&to=2024-02-25T00:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

# Test error handling (invalid cycle)
echo -e "${GREEN}Testing Error Handling (Invalid Cycle)${NC}"
curl -s "${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=99" | json_pp
echo -e "\n"

# Test error handling (invalid date format)
echo -e "${GREEN}Testing Error Handling (Invalid Date Format)${NC}"

echo -e "${BLUE}Test 1: Missing timezone${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25T00:00:00&to=2024-02-25T01:00:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 2: Invalid format${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 3: Invalid characters${NC}"
curl -s "${BASE_URL}/api/plan?from=invalid-date&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 4: Wrong separator${NC}"
curl -s "${BASE_URL}/api/plan?from=2024/02/25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 5: Invalid timezone format${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25T00:00:00%2B0900&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 6: Invalid hour format${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-02-25T24:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n"

echo -e "${BLUE}Test 7: Invalid month${NC}"
curl -s "${BASE_URL}/api/plan?from=2024-13-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1" | json_pp
echo -e "\n" 