# Fast, easy publishing to NPM

[![Build Status](https://github.com/JS-DevTools/npm-publish/workflows/CI-CD/badge.svg)](https://github.com/JS-DevTools/npm-publish/actions)
[![Coverage Status](https://coveralls.io/repos/github/JS-DevTools/npm-publish/badge.svg?branch=main)](https://coveralls.io/github/JS-DevTools/npm-publish)
[![npm](https://img.shields.io/npm/v/@jsdevtools/npm-publish.svg)](https://www.npmjs.com/package/@jsdevtools/npm-publish)
[![License](https://img.shields.io/npm/l/@jsdevtools/npm-publish.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/JS-DevTools/npm-publish)

Publish packages to npm automatically in GitHub Actions by updating the version number.

- [Change log][releases]
- [v2 to v3 migration guide](#v2-to-v3)
- [v1 to v3 migration guide](#v1-to-v3)

[releases]: https://github.com/JS-DevTools/npm-publis/releases

## Features

- 🧠 **Smart**
  Only publishes if the version number in `package.json` differs from the latest on npm.

- 🛠 **Configurable**
  Customize the version-checking behavior, the registry URL, and path of your package.

- 🔐 **Secure**
  Keeps your npm authentication token secret. Doesn't read nor write to `~/.npmrc`.

- ⚡ **Fast**
  100% JavaScript (which is faster than Docker) and bundled to optimize loading time.

- 📤 **Outputs**
  Exposes the old and new version numbers, and the type of change (major, minor, patch, etc.) as variables that you can use in your workflow.

## Usage

This package can be used three different ways:

- 🤖 A [**GitHub Action**](#github-action) as part of your CI/CD process

- 🧩 A [**function**](#javascript-api) that you call in your JavaScript code

- 🖥 A [**CLI**](#command-line-interface) that you run in your terminal

## GitHub Action

To use the GitHub Action, you'll need to add it as a step in your [workflow file][]. By default, the only thing you need to do is set the `token` parameter to your [npm authentication token][].

```yaml
on:
  push:
    branches: main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test
      - uses: JS-DevTools/npm-publish@v3
        with:
          token: ${{ secrets.NPM_TOKEN }}
```

You can also publish to third-party registries. For example, to publish to the [GitHub Package Registry][], set `token` to `secrets.GITHUB_TOKEN` and `registry` to `https://npm.pkg.github.com`:

```yaml
on:
  push:
    branches: main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write # allow GITHUB_TOKEN to publish packages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test
      - uses: JS-DevTools/npm-publish@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          registry: "https://npm.pkg.github.com"
```

[workflow file]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions
[npm authentication token]: https://docs.npmjs.com/creating-and-viewing-authentication-tokens
[GitHub Package Registry]: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

### Action usage

You can set any or all of the following input parameters using `with`:

| Name             | Type                   | Default                       | Description                                                                      |
| ---------------- | ---------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `token`          | string                 | **required**                  | Authentication token to use with the configured registry.                        |
| `registry`¹      | string                 | `https://registry.npmjs.org/` | Registry URL to use.                                                             |
| `package`        | string                 | Current working directory     | Path to a package directory, a `package.json`, or a packed `.tgz` to publish.    |
| `tag`¹           | string                 | `latest`                      | [Distribution tag][npm-tag] to publish to.                                       |
| `access`¹        | `public`, `restricted` | [npm defaults][npm-access]    | Whether the package should be publicly visible or restricted.                    |
| `provenance`¹ ²  | boolean                | `false`                       | Run `npm publish` with the `--provenance` flag to add [provenance][] statements. |
| `strategy`       | `all`, `upgrade`       | `all`                         | Use `all` to publish all unique versions, `upgrade` for only semver upgrades.    |
| `ignore-scripts` | boolean                | `true`                        | Run `npm publish` with the `--ignore-scripts` flag as a security precaution.     |
| `dry-run`        | boolean                | `false`                       | Run `npm publish` with the `--dry-run` flag to prevent publication.              |

1. May be specified using `publishConfig` in `package.json`.
2. Provenance requires npm `>=9.5.0`.

[npm-tag]: https://docs.npmjs.com/cli/v9/commands/npm-publish#tag
[npm-access]: https://docs.npmjs.com/cli/v9/commands/npm-publish#access
[provenance]: https://docs.npmjs.com/generating-provenance-statements

### Action output

npm-publish exposes several output variables, which you can use in later steps of your workflow if you provide an `id` for the npm-publish step.

```diff
  steps:
    - uses: JS-DevTools/npm-publish@v3
+     id: publish
      with:
        token: ${{ secrets.NPM_TOKEN }}

+   - if: ${{ steps.publish.outputs.type }}
+     run: echo "Version changed!"
```

| Name          | Type    | Description                                                                                                   |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `id`          | string  | Package identifier of the release: `${name}@${version}` or empty if no release.                               |
| `type`        | string  | [Semver release type][], `initial` if first release, `different` if other change, or empty if no release.     |
| `name`        | string  | Name of the package.                                                                                          |
| `version`     | string  | Version of the package.                                                                                       |
| `old-version` | string  | Previously published version on `tag` or empty if no previous version on tag.                                 |
| `tag`         | string  | [Distribution tag][npm-tag] the package was published to.                                                     |
| `access`      | string  | [Access level][npm-access] the package was published with, or `default` if scoped-package defaults were used. |
| `registry`    | string  | Registry the package was published to.                                                                        |
| `dry-run`     | boolean | Whether `npm publish` was run in "dry run" mode.                                                              |

[semver release type]: https://github.com/npm/node-semver#release_types

## JavaScript API

To use npm-package in your JavaScript code, you'll need to install it using [npm][] or other package manager of choice:

```bash
npm install --save-dev @jsdevtools/npm-publish
```

You can then import it and use it in your code like this:

```javascript
import { npmPublish } from "@jsdevtools/npm-publish";

// Run npm-publish with all defaults
await npmPublish({ token: "YOUR_NPM_AUTH_TOKEN_HERE" });
```

[npm]: https://docs.npmjs.com/about-npm/

### API usage

As shown in the example above, you should pass an options object to the `npmPublish` function. In TypeScript, the `Options` interface is available as an import.

```ts
import type { Options } from "@jsdevtools/npm-publish";
```

| Name                 | Type                   | Default                       | Description                                                                      |
| -------------------- | ---------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `token`              | string                 | **required**                  | Authentication token to use with the configured registry.                        |
| `registry`¹          | string, `URL`          | `https://registry.npmjs.org/` | Registry URL to use.                                                             |
| `package`            | string                 | Current working directory     | Path to a package directory, a `package.json`, or a packed `.tgz` to publish.    |
| `tag`¹               | string                 | `latest`                      | [Distribution tag][npm-tag] to publish to.                                       |
| `access`¹            | `public`, `restricted` | [npm defaults][npm-access]    | Whether the package should be publicly visible or restricted.                    |
| `provenance`¹ ²      | boolean                | `false`                       | Run `npm publish` with the `--provenance` flag to add [provenance][] statements. |
| `strategy`           | `all`, `upgrade`       | `all`                         | Use `all` to publish all unique versions, `upgrade` for only semver upgrades.    |
| `ignoreScripts`      | boolean                | `true`                        | Run `npm publish` with the `--ignore-scripts` flag as a security precaution.     |
| `dryRun`             | boolean                | `false`                       | Run `npm publish` with the `--dry-run` flag to prevent publication.              |
| `logger`             | object                 | `undefined`                   | Logging interface with `debug`, `info`, and `error` log methods.                 |
| `temporaryDirectory` | string                 | `os.tmpdir()`                 | Temporary directory to hold a generated `.npmrc` file                            |

1. May be specified using `publishConfig` in `package.json`.
2. Provenance requires npm `>=9.5.0`.

### API output

The `npmPublish()` function returns a promise of a `Results` object. In TypeScript, the `Results` interface is available as an import.

```ts
import type { Results } from "@jsdevtools/npm-publish";
```

| Name         | Type            | Description                                                                                                     |
| ------------ | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `id`         | Optional string | Package identifier of the release: `${name}@${version}` or `undefined` if no release.                           |
| `type`       | Optional string | [Semver release type][], `initial` if first release, `different` if other change, or `undefined` if no release. |
| `name`       | string          | Name of the package.                                                                                            |
| `version`    | string          | Version of the package.                                                                                         |
| `oldVersion` | Optional string | Previously published version on `tag` or `undefined` if no previous version.                                    |
| `tag`        | string          | [Distribution tag][npm-tag] that the package was published to.                                                  |
| `access`     | Optional string | [Access level][npm-access] the package was published with, or `undefined` if scoped-package defaults were used. |
| `registry`   | `URL`           | Registry the package was published to.                                                                          |
| `dryRun`     | boolean         | Whether `npm publish` was run in "dry run" mode.                                                                |

## Command Line Interface

You can also use `npm-publish` as a command-line tool in your terminal.

```bash
npm install --save-dev @jsdevtools/npm-publish
```

You can then use it in your terminal or in `npm run` scripts.

```bash
npx npm-publish --token YOUR_NPM_AUTH_TOKEN_HERE
```

You can customize your call with options to change the registry, package, etc.

```bash
npx npm-publish --token YOUR_NPM_AUTH_TOKEN_HERE --registry http://example.com ./path/to/package
```

### Options

Run `npm-publish --help` to see the full list of options available.

```text
Usage:

  npm-publish <options> [package]

Arguments:

  package                 The path to the package to publish.
                          May be a directory, package.json, or .tgz file.
                          Defaults to the package in the current directory.

Options:

  --token <token>         (Required) npm authentication token.

  --registry <url>        Registry to read from and write to.
                          Defaults to "https://registry.npmjs.org/".

  --tag <tag>             The distribution tag to check against and publish to.
                          Defaults to "latest".

  --access <access>       Package access, may be "public" or "restricted".
                          See npm documentation for details.

  --provenance            Publish with provenance statements.
                          See npm documentation for details.

  --strategy <strategy>   Publish strategy, may be "all" or "upgrade".
                          Defaults to "all", see documentation for details.

  --no-ignore-scripts     Allow lifecycle scripts, which are disabled by default
                          as a security precaution. Defaults to false.

  --dry-run               Do not actually publish anything.
  --quiet                 Only print errors.
  --debug                 Print debug logs.

  -v, --version           Print the version number.
  -h, --help              Show usage text.

Examples:

  $ npm-publish --token abc123 ./my-package
```

## Migration guides

Major releases of the action and libraries may contain breaking changes, documented here.
For more detailed change logs, see [releases][].

### v2 to v3

The v3 release does not require any changes to how you use `npm-publish` from `v2`. The version of Node.js used by the action was updated to v20 due to GitHub Action's [deprecation of Node.js v16][node16-deprecation]. The minimum required version of Node.js for the library and CLI remains v16.

[node16-deprecation]: https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/

### v1 to v3

The v2 release made several breaking changes to inputs, outputs, and behaviors that were present in `v1`. The examples below focus on the action, but the same changes are applicable to the library and CLI, too.

#### v2 option changes

The `check-version` and `greater-version-only` boolean options were replaced with the `strategy` option:

- `strategy: all` (default) will publish any version that does not yet exist in the registry
- `strategy: upgrade` will publish only if the version is a semver upgrade of the requested `dist-tag`

```diff
  with:
    token: ${{ secrets.NPM_TOKEN }}
-   check-version: true
-   greater-version-only: false
+   strategy: all

  with:
    token: ${{ secrets.NPM_TOKEN }}
-   check-version: true
-   greater-version-only: true
+   strategy: upgrade
```

`check-version: false` has been removed. If you only need to publish, without first checking whether the version exists in the registry, you can [use `npm` directly][publishing-nodejs-packages] instead:

```diff
  - uses: actions/setup-node@v3
    with:
      node-version: '18'
+     registry-url: https://registry.npmjs.org/

- - uses: JS-DevTools/npm-publish@v1
-   with:
-     token: ${{ secrets.NPM_TOKEN }}
-     check-version: false
+ - run: npm publish
+   env:
+     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

[publishing-nodejs-packages]: https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages

#### v2 output changes

The `type` output is now an empty string instead of `'none'` when no release occurs

```diff
  - run: echo "Version changed!"
-   if: ${{ steps.publish.outputs.type != 'none' }}
+   if: ${{ steps.publish.outputs.type }}
```

#### v2 behavior changes

The `--ignore-scripts` option is now passed to `npm publish` as a security precaution. If you define any publish lifecycle scripts - `prepublishOnly`, `prepack`, `prepare`, `postpack`, `publish`, `postpublish` - we recommend you run that logic as a separate explicit build step.

```diff
+ - run: npm run build

- - uses: JS-DevTools/npm-publish@v1
+ - uses: JS-DevTools/npm-publish@v3
    with:
      token: ${{ secrets.NPM_TOKEN }}
```

If you can't change your build, you can set the `ignore-scripts` input to `false` as a workaround. Be aware that failures during a lifecycle script can be difficult to debug, and any `stdout`/`stderr` output from your build script could interfere with how `npm-publish` interprets results from the `npm` CLI.

```diff
- - uses: JS-DevTools/npm-publish@v1
+ - uses: JS-DevTools/npm-publish@v3
    with:
      token: ${{ secrets.NPM_TOKEN }}
+     ignore-scripts: false
```

The global `.npmrc` file is no longer read nor modified. This means the `token` option is now required for the library and CLI. (It was already required for the action.) You may have workarounds in place referencing `INPUT_TOKEN`, which v1 [erroneously wrote][#15] to `.npmrc`. These workarounds should be removed.

```diff
  - uses: actions/setup-node@v3
    with:
      node-version: '18'
      registry-url: https://registry.npmjs.org/

- - uses: JS-DevTools/npm-publish@v1
+ - uses: JS-DevTools/npm-publish@v3
    with:
      token: ${{ secrets.NPM_TOKEN }}

  - name: Do some more stuff with npm
    run: npm whoami
    env:
-     INPUT_TOKEN: ${{ secrets.NPM_TOKEN }}
+     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

[#15]: https://github.com/JS-DevTools/npm-publish/issues/15

## License

npm-publish is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/JS-DevTools/npm-publish) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.

## Big Thanks To

Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://jstools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://jstools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://jstools.dev/img/badges/coveralls.svg)](https://coveralls.io)
