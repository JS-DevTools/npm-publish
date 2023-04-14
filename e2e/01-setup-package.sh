#!/usr/bin/env bash
# Create a package
# Usage: 01-setup-package.sh <package_directory> <name> <version>

set -e

PACKAGE_SPEC=$1
PACKAGE_NAME=$2
PACKAGE_VERSION=$3

package_manifest=${PACKAGE_SPEC}/package.json

echo "{"                                     > ${package_manifest}
echo "  \"name\": \"${PACKAGE_NAME}\","      >> ${package_manifest}
echo "  \"version\": \"${PACKAGE_VERSION}\"" >> ${package_manifest}
echo "}"                                     >> ${package_manifest}

echo "DEBUG: wrote ${package_manifest}" 1>&2
echo ${PACKAGE_SPEC}
