# Fast, easy publishing to NPM

[![Cross-Platform Compatibility](https://jstools.dev/img/badges/os-badges.svg)](https://github.com/JS-DevTools/npm-publish/actions)
[![Build Status](https://github.com/JS-DevTools/npm-publish/workflows/CI-CD/badge.svg)](https://github.com/JS-DevTools/npm-publish/actions)

[![Coverage Status](https://coveralls.io/repos/github/JS-DevTools/npm-publish/badge.svg?branch=main)](https://coveralls.io/github/JS-DevTools/npm-publish)

[![npm](https://img.shields.io/npm/v/@jsdevtools/npm-publish.svg)](https://www.npmjs.com/package/@jsdevtools/npm-publish)
[![License](https://img.shields.io/npm/l/@jsdevtools/npm-publish.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/JS-DevTools/npm-publish)

## Features

- 🧠 **Smart**<br>
  Only publishes if the version number in `package.json` differs from the latest on NPM.

- 🛠 **Configurable**<br>
  Customize the version-checking behavior, the registry URL, and path of your package.

- 🔐 **Secure**<br>
  Keeps your NPM access token secret. Doesn't write it to `~/.npmrc`.

- ⚡ **Fast**<br>
  100% JavaScript (which is faster than Docker) and bundled to optimize loading time.

- 📤 **Outputs**<br>
  Exposes the old and new version numbers, and the type of change (major, minor, patch, etc.) as variables that you can use in your workflow.

## Usage

This package can be used three different ways:

- 🤖 A [**GitHub Action**](#github-action) as part of your CI/CD process

- 🧩 A [**function**](#javascript-function) that you call in your JavaScript code

- 🖥 A [**CLI**](#command-line-interface) that you run in your terminal

## GitHub Action

To use the GitHub Action, you'll need to add it as a step in your [Workflow file](https://help.github.com/en/actions/automating-your-workflow-with-github-actions). By default, the only thing you need to do is set the `token` parameter to your [NPM auth token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens).

```yaml
on: push

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - uses: JS-DevTools/npm-publish@v1
        with:
          token: ${{ secrets.NPM_TOKEN }}
```

For security and safety, the `JS-DevTools/npm-publish` action uses a different, isolated configuration than calling `npm` directly. Auth settings for `npm` will not affect `npm-publish`, nor vice-versa.

### Usage

You can set any or all of the following input parameters using `with`:

| Name       | Type                   | Default                        | Description                                                                   |
| ---------- | ---------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `token`    | string                 | **required**                   | The authentication token to use with npm.                                     |
| `registry` | string                 | `https://registry.npmjs.org/`  | The registry URL to read and write to.                                        |
| `package`  | string                 | Current working directory      | The path to the package or its package.json file.                             |
| `tag`      | string                 | `latest`                       | The [distribution tag][npm-tag] to publish to.                                |
| `access`   | `public`, `restricted` | [Use npm defaults][npm-access] | Whether the package should be publicly visible or restricted.                 |
| `strategy` | `all`, `upgrade`       | `all`                          | Use `all` to publish all unique versions, `upgrade` for only semver upgrades. |
| `dry-run`  | boolean                | `false`                        | Run `npm publish` with the `--dry-run` flag to prevent publication.           |

[npm-tag]: https://docs.npmjs.com/cli/v9/commands/npm-publish#tag
[npm-access]: https://docs.npmjs.com/cli/v9/commands/npm-publish#access

### Output

npm-publish exposes some output variables, which you can use in later steps of your workflow. To access the output variables, you'll need to set an `id` for the npm-publish step.

```yaml
steps:
  - id: publish
    uses: JS-DevTools/npm-publish@v1
    with:
      token: ${{ secrets.NPM_TOKEN }}

  - if: ${{ steps.publish.outputs.type }}
    run: |
      echo "Version changed: ${{ steps.publish.outputs.old-version }} => ${{ steps.publish.outputs.version }}"
```

| Name          | Type    | Description                                                                                                              |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `id`          | string  | Package identifier of the release: `${name}@${version}` or empty if no release.                                          |
| `type`        | string  | Semver upgrade (`major`, `minor`, ...), `initial` if first release, `different` if other change, or empty if no release. |
| `name`        | string  | The name of the package.                                                                                                 |
| `version`     | string  | The version of the package.                                                                                              |
| `old-version` | string  | The previously published version on `tag` or empty if no previous version on tag.                                        |
| `tag`         | string  | The [distribution tag][npm-tag] that the package was published to.                                                       |
| `access`      | string  | The [access level][npm-access] the package was published with, or `default` if scoped-package defaults were used.        |
| `dry-run`     | boolean | Indicates whether `npm publish` was run in "dry run" mode.                                                               |

## JavaScript Function

To use npm-package in your JavaScript code, you'll need to install it using [npm](https://docs.npmjs.com/about-npm/) or other package manager of choice:

```bash
npm install --save-dev @jsdevtools/npm-publish
```

You can then import it and use it in your code like this:

```javascript
import { npmPublish } from "@jsdevtools/npm-publish";

// Run npm-publish with all defaults
await npmPublish({ token: "YOUR_NPM_AUTH_TOKEN_HERE" });
```

For security and safety, the `npmPublish` function uses a different, isolated configuration than calling `npm` directly. Auth settings for `npm` will not affect `npmPublish`, nor vice-versa.

### Usage

As shown in the example above, you should pass an options object to the `npmPublish` function. In TypeScript, the `Options` interface is available as an import.

```ts
import type { Options } from "@jsdevtools/npm-publish";
```

| Name       | Type                   | Default                        | Description                                                                   |
| ---------- | ---------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `token`    | string                 | **required**                   | The authentication token to use with npm.                                     |
| `registry` | string, `URL`          | `https://registry.npmjs.org/`  | The registry URL to read and write to.                                        |
| `package`  | string                 | Current working directory      | The path to the package or its package.json file.                             |
| `tag`      | string                 | `latest`                       | The [distribution tag][npm-tag] to publish to.                                |
| `access`   | `public`, `restricted` | [Use npm defaults][npm-access] | Whether the package should be publicly visible or restricted.                 |
| `strategy` | `all`, `upgrade`       | `all`                          | Use `all` to publish all unique versions, `upgrade` for only semver upgrades. |
| `dryRun`   | boolean                | `false`                        | Run `npm publish` with the `--dry-run` flag to prevent publication.           |

### Output

The `npmPublish()` function returns a promise of a `Results` object. In TypeScript, the `Results` interface is available as an import.

```ts
import type { Results } from "@jsdevtools/npm-publish";
```

| Name         | Type            | Description                                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`         | Optional string | Package identifier of the release: `${name}@${version}` or `undefined` if no release.                                          |
| `type`       | Optional string | Semver upgrade (`major`, `minor`, ...), `initial` if first release, `different` if other change, or `undefined` if no release. |
| `name`       | string          | The name of the package.                                                                                                       |
| `version`    | string          | The version of the package.                                                                                                    |
| `oldVersion` | Optional string | The previously published version on `tag` or `undefined` if no previous version.                                               |
| `tag`        | string          | The [distribution tag][npm-tag] that the package was published to.                                                             |
| `access`     | Optional string | The [access level][npm-access] the package was published with, or `undefined` if scoped-package defaults were used.            |
| `dryRun`     | boolean         | Indicates whether `npm publish` was run in "dry run" mode.                                                                     |

## Command Line Interface

You can also use `npm-publish` as a command-line tool in your terminal.

```bash
npm install --save-dev @jsdevtools/npm-publish
```

You can then use it in your terminal or in `npm run` scripts.

```bash
npx npm-publish --token YOUR_NPM_AUTH_TOKEN_HERE
```

Or you can call it with arguments to explicitly set the NPM auth token, registry, package path, etc.

```bash
npm-publish --token YOUR_NPM_AUTH_TOKEN_HERE --package ./path/to/package
```

For security and safety, the `npm-publish` CLI uses a different, isolated configuration than calling `npm` directly. Auth settings for `npm` will not affect `npm-publish`, nor vice-versa.

### Options

Run `npm-publish --help` to see the full list of options available.

```
> npm-publish --help

Usage: npm-publish [options] [package_path]

options:
  --token <token>     The NPM access token to use when publishing

  --registry <url>    The NPM registry URL to use

  --tag <tag>         The tag to publish to. Allows the package to be installed
                      using "npm install <package-name>@<tag>"

  --access <access>   "public" = The package will be publicly visible.
                      "restricted" = The package will only be visible to members
                      of your NPM organization.

  --dry-run           Don't actually publish to NPM, but report what would have
                      been published

  --debug, -d         Enable debug mode, with increased logging

  --quiet, -q         Suppress unnecessary output

  --version, -v       Print the version number

  --help, -h          Show help

package_path          The absolute or relative path of the NPM package to publish.
                      Can be a directory path, or the path of a package.json file.
                      Defaults to the current directory.
```

## License

npm-publish is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/JS-DevTools/npm-publish) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.

## Big Thanks To

Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://jstools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://jstools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://jstools.dev/img/badges/coveralls.svg)](https://coveralls.io)
[![Travis CI](https://jstools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://jstools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)
