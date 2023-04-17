#!/usr/bin/env bash
# Login into the registry and extract the auth token
# Usage: 00-login.sh

set -eo pipefail

REGISTRY_HOSTNAME="localhost:4873"

registry_url=http://${REGISTRY_HOSTNAME}
token_matcher='^\/\/'${REGISTRY_HOSTNAME}'\/:_authToken="(.+)"$'
temporary_dir=${RUNNER_TEMP:-${TMPDIR}}
npmrc=${temporary_dir}/.npmrc-e2e

{
echo -e "test"
sleep 1
echo -e "test"
sleep 1
echo -e "example@example.com"
} | NPM_CONFIG_USERCONFIG=${npmrc} npm login --registry ${registry_url} 1>/dev/null

echo "DEBUG: wrote config to temporary file: ${npmrc}" 1>&2

npmrc_contents=$(<${npmrc})
rm -f ${npmrc}

if [[ "${npmrc_contents}" =~ ${token_matcher} ]]; then
  echo "${BASH_REMATCH[1]}"
  exit 0
fi

echo "ERROR: No token found" 1>&2
exit 1
