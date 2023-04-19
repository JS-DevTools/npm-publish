#!/usr/bin/env bash
# Create a test fixture package
# Usage: 01-setup-package.sh <package_directory> <version>

set -euo pipefail

PACKAGE_SPEC="$1"
PACKAGE_VERSION="$2"

package_manifest="${PACKAGE_SPEC}/package.json"

mkdir -p "${PACKAGE_SPEC}"

echo "{"                                      > "${package_manifest}"
echo "  \"name\": \"@jsdevtools/fixture\","  >> "${package_manifest}"
echo "  \"version\": \"${PACKAGE_VERSION}\"" >> "${package_manifest}"
echo "}"                                     >> "${package_manifest}"

echo "DEBUG: wrote ${package_manifest}" 1>&2
echo "${PACKAGE_SPEC}"
