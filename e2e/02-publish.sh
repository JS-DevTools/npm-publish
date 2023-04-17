#!/usr/bin/env bash
# Publish a package to the registry using the CLI
# Usage: 02-publish.sh <package_directory> <token>

set -e

REGISTRY_URL="http://localhost:4873"
PACKAGE_SPEC=$1
TOKEN=$2

node ./bin/npm-publish --token=${TOKEN} --registry=${REGISTRY_URL} ${PACKAGE_SPEC}
