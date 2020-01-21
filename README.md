NPM Publish GitHub Action
==============================================
### Fast, easy publishing to NPM



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
By default, the only thing you need to do is set the `token` parameter to your [NPM auth token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens).

```yaml
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

|Name            |Type    |Required? |Default               |Description
|----------------|--------|----------|----------------------|------------------------------------
|`token`         |string  |yes       |                      |The NPM auth token to use for publishing
|`registry`      |string  |no        |//registry.npmjs.org/ |The NPM registry URL to use
|`package`       |string  |no        |./package.json        |The path of your package.json file
|`check-version` |boolean |no        |true                  |Only publish to NPM if the version number in `package.json` differs from the latest on NPM



Output Variables
--------------------------
npm-publish exposes some output variables, which you can use in later steps of your workflow. To access the output variables, you'll need to set an `id` for the npm-publish step.

```yaml
steps:
  - id: publish
    uses: JS-DevTools/npm-publish@v1
    with:
      token: ${{ secrets.NPM_TOKEN }}

  - if: steps.publish.type != 'none'
    run: |
      echo "Version changed: ${{ steps.publish.old-version }} => ${{ steps.publish.version }}"
```


|Variable      |Type    |Description
|--------------|--------|------------------------------------
|`type`        |string  |The type of version change that occurred ("major", "minor", "patch", etc.). If there was no version change, then type will be "none".
|`version`     |string  |The version that was published
|`old-version` |string  |The version number that was previously published to NPM




Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [File an issue](https://github.com/JS-DevTools/npm-publish/issues) on GitHub and [submit a pull request](https://github.com/JS-DevTools/npm-publish/pulls).

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



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![Travis CI](https://jstools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://jstools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)
[![Coveralls](https://jstools.dev/img/badges/coveralls.svg)](https://coveralls.io)
