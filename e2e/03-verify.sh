#!/usr/bin/env bash
# Verify that a package was published
# Usage: 03-verify.sh <package_directory>

set -e

REGISTRY_URL="http://localhost:4873"
PACKAGE_SPEC=$1

package_name=$(cd $1 && npm pkg get name | sed 's/"//g')
package_version=$(cd $1 && npm pkg get version | sed 's/"//g')

npm view $package_name@$package_version
