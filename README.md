Fast, easy publishing to NPM
==============================================

[![Cross-Platform Compatibility](https://jstools.dev/img/badges/os-badges.svg)](https://github.com/JS-DevTools/npm-publish/actions)
[![Build Status](https://github.com/JS-DevTools/npm-publish/workflows/CI-CD/badge.svg)](https://github.com/JS-DevTools/npm-publish/actions)

[![Coverage Status](https://coveralls.io/repos/github/JS-DevTools/npm-publish/badge.svg?branch=master)](https://coveralls.io/github/JS-DevTools/npm-publish)
[![Dependencies](https://david-dm.org/JS-DevTools/npm-publish/status.svg)](https://david-dm.org/JS-DevTools/npm-publish)

[![npm](https://img.shields.io/npm/v/@jsdevtools/npm-publish.svg)](https://www.npmjs.com/package/@jsdevtools/npm-publish)
[![License](https://img.shields.io/npm/l/@jsdevtools/npm-publish.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/JS-DevTools/npm-publish)



Features
--------------------------
- 🧠 **Smart**<br>
Only publishes if the version number in `package.json` differs from the latest on NPM

- 🛠 **Configurable**<br>
Customize the version-checking behavior, the registry URL, and path of your package

- 🔐 **Secure**<br>
Keeps your NPM access token secret. Doesn't write it to `~/.npmrc`

- ⚡ **Fast**<br>
100% JavaScript (which is faster than Docker) and bundled to optimize loading time

- 📤 **Outputs**<br>
Exposes the old and new version numbers, and the type of change (major, minor, patch, etc.) as variables that you can use in your workflow.



Usage
--------------------------
This package can be used three different ways:

- 🤖 A [**GitHub Action**](#github-action) as part of your CI/CD process

- 🧩 A [**function**](#javascript-function) that you call in your JavaScript code

- 🖥 A [**CLI**](#command-line-interface) that you run in your terminal



GitHub Action
-----------------------------
To use the GitHub Action, you'll need to add it as a step in your [Workflow file](https://help.github.com/en/actions/automating-your-workflow-with-github-actions). By default, the only thing you need to do is set the `token` parameter to your [NPM auth token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens).

```yaml
on: push

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: actions/setup-node@v1
        with:
          node-version: 10
      - run: npm install
      - run: npm test
      - uses: JS-DevTools/npm-publish@v1
        with:
          token: ${{ secrets.NPM_TOKEN }}
```



Input Parameters
--------------------------
You can set any or all of the following input parameters:

|Name            |Type    |Required? |Default                     |Description
|----------------|--------|----------|----------------------------|------------------------------------
|`token`         |string  |yes       |                            |The NPM auth token to use for publishing
|`registry`      |string  |no        |https://registry.npmjs.org/ |The NPM registry URL to use
|`package`       |string  |no        |./package.json              |The path of your package.json file
|`tag`           |string  |no        |"latest"                    |The tag to publish to. This allows people to install the package using `npm install <package-name>@<tag>`.
|`access`        |string  |no        |"public" for non-scoped packages. "restricted" for scoped packages.|Determines whether the published package should be publicly visible, or restricted to members of your NPM organization.
|`dry-run`       |boolean |no        |false                       |Run NPM publish with the `--dry-run` flag to prevent publication
|`check-version` |boolean |no        |true                        |Only publish to NPM if the version number in `package.json` differs from the latest on NPM



Output Variables
--------------------------
npm-publish exposes some output variables, which you can use in later steps of your workflow. To access the output variables, you'll need to set an `id` for the npm-publish step.

```yaml
steps:
  - id: publish
    uses: JS-DevTools/npm-publish@v1
    with:
      token: ${{ secrets.NPM_TOKEN }}

  - if: steps.publish.outputs.type != 'none'
    run: |
      echo "Version changed: ${{ steps.publish.outputs.old-version }} => ${{ steps.publish.outputs.version }}"
```


|Variable      |Type    |Description
|--------------|--------|------------------------------------
|`type`        |string  |The type of version change that occurred ("major", "minor", "patch", etc.). If there was no version change, then type will be "none".
|`version`     |string  |The version that was published
|`old-version` |string  |The version number that was previously published to NPM
|`tag`         |string  |The tag that the package was published to.
|`access`      |string  |Indicates whether the published package is publicly visible or restricted to members of your NPM organization.
|`dry-run`     |boolean |Indicates whether NPM was run in "dry run" mode



JavaScript Function
------------------------------
To use npm-package in your JavaScript code, you'll need to install it using [NPM](https://docs.npmjs.com/about-npm/):

```bash
npm install @jsdevtools/npm-publish
```

You can then import it and use it in your code like this:

```javascript
const npmPublish = require("@jsdevtools/npm-publish");

// Run npm-publish with all defaults
await npmPublish();

// Run npm-publish with options
await npmPublish({
  package: "./path/to/package.json",
  token: "YOUR_NPM_AUTH_TOKEN_HERE"
});
```

### Options
As shown in the example above, you can pass options to the `npmPublish()` function. Here are the available options:

|Name            |Type     |Default                     |Description
|----------------|---------|----------------------------|------------------------------------
|`token`         |string   |NPM's default credentials   |The NPM auth token to use for publishing. If not set, then NPM will
|`registry`      |string   |https://registry.npmjs.org/ |The NPM registry URL to use
|`package`       |string   |./package.json              |The path of your package.json file
|`tag`           |string   |"latest"                    |The tag to publish to. This allows people to install the package using `npm install <package-name>@<tag>`.
|`access`        |string   |"public" for non-scoped packages. "restricted" for scoped packages.|Determines whether the published package should be publicly visible, or restricted to members of your NPM organization.
|`dryRun`        |boolean  |false                       |Run NPM publish with the `--dry-run` flag to prevent publication
|`checkVersion`  |boolean  |true                        |Only publish to NPM if the version number in `package.json` differs from the latest on NPM
|`quiet`         |boolean  |false                       |Suppress console output from NPM and npm-publish
|`debug`         |function |no-op                       |A function to log debug messages. You can set this to a custom function to receive debug messages, or just set it to `console.debug` to print debug messages to the console.

### Return Value
The `npmPublish()` function asynchronously returns an object with the following properties:

|Name            |Type     |Description
|----------------|---------|------------------------------------
|`type`          |string   |The type of version change that occurred ("major", "minor", "patch", etc.)  If there was no version change, then the the type is "none".
|`package`       |string   |The name of the NPM package that was published
|`version`       |string   |The version number that was published
|`oldVersion`    |string   |The version number that was previously published to NPM
|`tag`           |string   |The tag that the package was published to.
|`access`        |string   |Indicates whether the published package is publicly visible or restricted to members of your NPM organization.
|`dryRun`        |boolean  |Indicates whether NPM was run in "dry run" mode



Command Line Interface
------------------------------
To use npm-package from as a command-line tool in your terminal, you'll need to install it globally using [NPM](https://docs.npmjs.com/about-npm/):

```bash
npm install -g @jsdevtools/npm-publish
```

You can then use it in your terminal or in Bash scripts. You can call it without any arguments, and it will publish the current directory using NPM's default credentials.

```bash
npm-publish
```

Or you can call it with arguments to explicitly set the NPM auth token, registry, package path, etc.

```bash
npm-publish --token=YOUR_NPM_AUTH_TOKEN_HERE ./path/to/package.json
```

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



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [Open an issue](https://github.com/JS-DevTools/npm-publish/issues) on GitHub and [submit a pull request](https://github.com/JS-DevTools/npm-publish/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/JS-DevTools/npm-publish.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
npm-publish is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/JS-DevTools/npm-publish) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://jstools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://jstools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://jstools.dev/img/badges/coveralls.svg)](https://coveralls.io)
[![Travis CI](https://jstools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://jstools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)
