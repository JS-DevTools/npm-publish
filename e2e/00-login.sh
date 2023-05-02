#!/usr/bin/env bash
# Login into the registry and extract the auth token
# Usage: 00-login.sh

set -euo pipefail

REGISTRY_URL="http://localhost:4873"

token_matcher='"token": ?"(.+)"'
retry_count=3
create_user_response=""

until [[ ${create_user_response} || ${retry_count} -le 0 ]]; do
  sleep 1
  create_user_response=$(curl -v -s -X PUT -H 'content-type: application/json' -d '{"name": "test", "password": "test"}' ${REGISTRY_URL}/-/user/org.couchdb.user:test || true)
  retry_count=$((retry_count - 1))
done

echo "DEBUG: Create user response - ${create_user_response}" 1>&2

if [[ ${create_user_response} =~ ${token_matcher} ]]; then
  echo "${BASH_REMATCH[1]}"
  exit 0
fi

echo "ERROR: No token found" 1>&2
exit 1
