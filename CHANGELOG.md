Change Log
====================================================================================================
All notable changes will be documented in this file.
NPM Publish adheres to [Semantic Versioning](http://semver.org/).



[v1.4.0](https://github.com/JS-DevTools/npm-publish/tree/v1.4.0) (2020-10-02)
----------------------------------------------------------------------------------------------------

- Added support NPM's `--tag` argument, which allows packages to be published to a named tag that can then be installed using `npm install <package-name>@<tag>`

- Added support for NPM's `--access` argument, which controls whether scoped packages are publicly accessible, or restricted to members of your NPM organization

[Full Changelog](https://github.com/JS-DevTools/npm-publish/compare/v1.3.0...v1.4.0)



[v1.3.0](https://github.com/JS-DevTools/npm-publish/tree/v1.3.0) (2020-10-01)
----------------------------------------------------------------------------------------------------

- NPM-Publish can now successfully publish a brand-new package to NPM. Previously it failed because it couldn't determine the previous package version. ([PR #12](https://github.com/JS-DevTools/npm-publish/pull/12) from [@ZitRos](https://github.com/ZitRos))

[Full Changelog](https://github.com/JS-DevTools/npm-publish/compare/v1.2.0...v1.3.0)



[v1.2.0](https://github.com/JS-DevTools/npm-publish/tree/v1.2.0) (2020-07-23)
----------------------------------------------------------------------------------------------------

- Added support for running NPM in "dry run" mode, which doesn't actually publish, but reports details of what _would_ have been published.

[Full Changelog](https://github.com/JS-DevTools/npm-publish/compare/v1.1.2...v1.2.0)



[v1.1.0](https://github.com/JS-DevTools/npm-publish/tree/v1.1.0) (2020-03-29)
----------------------------------------------------------------------------------------------------

- FIX: The configured NPM registry and token are now used _all_ NPM commands, not just for publishing. This ensures that npm-publish works with private packages and custom registries

[Full Changelog](https://github.com/JS-DevTools/npm-publish/compare/v1.0.13...v1.1.0)



[v1.0.0](https://github.com/JS-DevTools/npm-publish/tree/v1.0.0) (2020-01-21)
----------------------------------------------------------------------------------------------------

Initial release 🎉
