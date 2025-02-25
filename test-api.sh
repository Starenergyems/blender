#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL=${API_BASE_URL:-"http://localhost:13005"}

echo -e "${BLUE}Testing BLEnDer-DEP API Client${NC}\n"

# Function to print section header
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# Function to run test and check response
run_test() {
    local description=$1
    local command=$2
    echo -e "${BLUE}Test: $description${NC}"
    eval $command
    echo -e "\n"
}

# Health Check Tests
print_header "Health Check Tests"

run_test "Get health status" \
    "curl -s '${BASE_URL}/health' | json_pp"

# Plan Data Tests
print_header "Plan Data Tests"

# Valid cases
run_test "Get plan data (valid request)" \
    "curl -s '${BASE_URL}/api/plan?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1&resources=resource1,resource2' | json_pp"

run_test "Get plan data with all parameters" \
    "curl -s '${BASE_URL}/api/plan?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1&resources=resource1,resource2&attributes=attr1,attr2&tenantIds=tenant1' | json_pp"

# Invalid cases
run_test "Plan data with invalid date range (to before from)" \
    "curl -s '${BASE_URL}/api/plan?from=2024-02-25T01:00:00%2B09:00&to=2024-02-25T00:00:00%2B09:00&intervalType=1' | json_pp"

run_test "Plan data with invalid intervalType" \
    "curl -s '${BASE_URL}/api/plan?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&intervalType=3' | json_pp"

run_test "Plan data with missing timezone" \
    "curl -s '${BASE_URL}/api/plan?from=2024-02-25T00:00:00&to=2024-02-25T01:00:00%2B09:00&intervalType=1' | json_pp"

# Collect Data Tests (GET)
print_header "Collect Data GET Tests"

# Valid cases
run_test "Get collect data (valid request)" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=2' | json_pp"

run_test "Get collect data with dataType1" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=2&dataType1=5' | json_pp"

run_test "Get collect data with all parameters" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=2&resources=resource1&attributes=attr1&dataType1=5' | json_pp"

# Invalid cases
run_test "Collect data with invalid cycle" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=99' | json_pp"

run_test "Collect data with invalid dataType1" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T01:00:00%2B09:00&cycle=2&dataType1=99' | json_pp"

run_test "Collect data exceeding time period (cycle 1: >2 hours)" \
    "curl -s '${BASE_URL}/api/collect?from=2024-02-25T00:00:00%2B09:00&to=2024-02-25T03:00:00%2B09:00&cycle=1' | json_pp"

# Collect Data Tests (POST)
print_header "Collect Data POST Tests"

# Valid cases
run_test "Create collect data (OpenAPI example)" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"resources\": [{
            \"resourceId\": \"0050001\",
            \"attributes\": [{
                \"attribute\": \"310001\",
                \"dataType1\": \"6\",
                \"dataType2\": \"5\",
                \"dataType3\": \"5\",
                \"values\": [{
                    \"datetime\": \"2023-09-01T00:01:00+09:00\",
                    \"value\": \"2.30760\"
                }]
            }]
        }]
    }' | json_pp"

run_test "Create collect data (valid request)" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"resources\": [{
            \"resourceId\": \"resource1\",
            \"attributes\": [{
                \"attribute\": \"310001\",
                \"values\": [{
                    \"datetime\": \"2024-02-25T00:00:00+09:00\",
                    \"value\": \"123.45\"
                }]
            }]
        }]
    }' | json_pp"

run_test "Create collect data with multiple values" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"dataType1\": 5,
        \"resources\": [{
            \"resourceId\": \"resource1\",
            \"attributes\": [{
                \"attribute\": \"310001\",
                \"values\": [{
                    \"datetime\": \"2024-02-25T00:00:00+09:00\",
                    \"value\": \"123.45\"
                }, {
                    \"datetime\": \"2024-02-25T00:30:00+09:00\",
                    \"value\": \"234.56\"
                }]
            }]
        }]
    }' | json_pp"

# Invalid cases
run_test "Create collect data with missing required fields" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"resources\": [{
            \"resourceId\": \"resource1\",
            \"attributes\": [{
                \"values\": [{
                    \"datetime\": \"2024-02-25T00:00:00+09:00\"
                }]
            }]
        }]
    }' | json_pp"

run_test "Create collect data with future date beyond limit" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"resources\": [{
            \"resourceId\": \"resource1\",
            \"attributes\": [{
                \"attribute\": \"310001\",
                \"values\": [{
                    \"datetime\": \"2025-02-25T00:00:00+09:00\",
                    \"value\": \"123.45\"
                }]
            }]
        }]
    }' | json_pp"

run_test "Create collect data with past date beyond limit" \
    "curl -s -X POST '${BASE_URL}/api/collect' \
    -H 'Content-Type: application/json' \
    -d '{
        \"cycle\": 2,
        \"resources\": [{
            \"resourceId\": \"resource1\",
            \"attributes\": [{
                \"attribute\": \"310001\",
                \"values\": [{
                    \"datetime\": \"2020-02-25T00:00:00+09:00\",
                    \"value\": \"123.45\"
                }]
            }]
        }]
    }' | json_pp"

echo -e "\n${GREEN}All tests completed${NC}\n" 