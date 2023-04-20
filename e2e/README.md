# End-to-end tests

This directory contains scripts to run end-to-end tests against a locally running [Verdaccio][] registry.

These test are run automatically in CI, but can be run locally, too.

[Verdaccio]: https://verdaccio.org/

## Usage

### Launch a Verdaccio registry

We use Docker to run a default instance of the Verdaccio server.

```shell
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

### Setup

Login to the local registry and create a fixture package.

```shell
export TOKEN=$(./e2e/00-login.sh)
export PACKAGE=$(./e2e/01-setup-package.sh ./e2e/fixture/cool\ package 0.0.1)
```

### Test the CLI

1. Publish the package to the registry.
2. Verify the package was published.
3. Try to publish again, verify publish is skipped.
4. Create a new version.
5. Publish the new version.
6. Verify the new version was published.

```shell
./e2e/02-publish.sh "${PACKAGE}" ${TOKEN}
./e2e/03-verify.sh "${PACKAGE}"
./e2e/02-publish.sh "${PACKAGE}" ${TOKEN}
./e2e/01-setup-package.sh "${PACKAGE}" 0.0.2
./e2e/02-publish.sh "${PACKAGE}" ${TOKEN}
./e2e/03-verify.sh "${PACKAGE}"
```
