import { createRequire } from "node:module";
import os from "node:os";
import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path, { basename, posix } from "node:path";
import EE, { EventEmitter } from "events";
import fs$1 from "fs";
import { EventEmitter as EventEmitter$1 } from "node:events";
import Stream from "node:stream";
import { StringDecoder } from "node:string_decoder";
import fs$2 from "node:fs";
import { dirname, parse } from "path";
import assert from "assert";
import { Buffer as Buffer$1 } from "buffer";
import * as realZlib$1 from "zlib";
import realZlib from "zlib";

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc$1) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc$1 = __getOwnPropDesc(from, key)) || desc$1.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region src/options.ts
const ACCESS_PUBLIC = "public";
const ACCESS_RESTRICTED = "restricted";
const STRATEGY_UPGRADE = "upgrade";
const STRATEGY_ALL = "all";

//#endregion
//#region src/errors.ts
var InvalidPackageError = class extends TypeError {
	constructor(value) {
		super(`Package must be a directory, package.json, or .tgz file, got "${String(value)}"`);
		this.name = "PackageJsonReadError";
	}
};
var PackageJsonReadError = class extends Error {
	constructor(manifestPath, originalError) {
		const message = [`Could not read package.json at ${manifestPath}`, originalError instanceof Error ? originalError.message : ""].filter(Boolean).join(os.EOL);
		super(message);
		this.name = "PackageJsonReadError";
	}
};
var PackageTarballReadError = class extends Error {
	constructor(tarballPath, originalError) {
		const message = [`Could not read package.json from ${tarballPath}`, originalError instanceof Error ? originalError.message : ""].filter(Boolean).join(os.EOL);
		super(message);
		this.name = "PackageTarballReadError";
	}
};
var PackageJsonParseError = class extends SyntaxError {
	constructor(packageSpec, originalError) {
		const message = [`Invalid JSON, could not parse package.json for ${packageSpec}`, originalError instanceof Error ? originalError.message : ""].filter(Boolean).join(os.EOL);
		super(message);
		this.name = "PackageJsonParseError";
	}
};
var InvalidPackageNameError = class extends TypeError {
	constructor(value) {
		super(`Package name is not valid, got "${String(value)}"`);
		this.name = "InvalidPackageNameError";
	}
};
var InvalidPackageVersionError = class extends TypeError {
	constructor(value) {
		super(`Package version must be a valid semantic version, got "${String(value)}"`);
		this.name = "InvalidPackageVersionError";
	}
};
var InvalidPackagePublishConfigError = class extends TypeError {
	constructor(value) {
		super(`Publish config must be an object, got "${String(value)}"`);
		this.name = "InvalidPackagePublishConfigError";
	}
};
var InvalidRegistryUrlError = class extends TypeError {
	constructor(value) {
		super(`Registry URL invalid, got "${String(value)}"`);
		this.name = "InvalidRegistryUrlError";
	}
};
var InvalidTokenError = class extends TypeError {
	constructor() {
		super("Token must be a non-empty string.");
		this.name = "InvalidTokenError";
	}
};
var InvalidTagError = class extends TypeError {
	constructor(value) {
		super(`Tag must be a non-empty string, got "${String(value)}".`);
		this.name = "InvalidTagError";
	}
};
var InvalidAccessError = class extends TypeError {
	constructor(value) {
		super(`Access must be "${ACCESS_PUBLIC}" or "${ACCESS_RESTRICTED}", got "${String(value)}".`);
		this.name = "InvalidAccessError";
	}
};
var InvalidStrategyError = class extends TypeError {
	constructor(value) {
		super(`Strategy must be "${STRATEGY_UPGRADE}" or "${STRATEGY_ALL}", got "${String(value)}".`);
		this.name = "InvalidStrategyError";
	}
};
var NpmCallError = class extends Error {
	constructor(command, exitCode, stderr) {
		super([`Call to "npm ${command}" exited with non-zero exit code ${exitCode}`, stderr].join(os.EOL));
		this.name = "NpmCallError";
	}
};

//#endregion
//#region src/results.ts
const INITIAL = "initial";
const DIFFERENT = "different";

//#endregion
//#region src/npm/call-npm-cli.ts
const VIEW = "view";
const PUBLISH = "publish";
const E404 = "E404";
const E409 = "E409";
const EPUBLISHCONFLICT = "EPUBLISHCONFLICT";
const IS_WINDOWS$1 = os.platform() === "win32";
const NPM = IS_WINDOWS$1 ? "npm.cmd" : "npm";
const JSON_MATCH_RE = /(\{[\s\S]*\})/mu;
const baseArguments = (options) => options.ignoreScripts ? ["--ignore-scripts", "--json"] : ["--json"];
/**
* Call the NPM CLI in JSON mode.
*
* @param command The command of the NPM CLI to call
* @param cliArguments Any arguments to send to the command
* @param options Customize environment variables or add an error handler.
* @returns The parsed JSON, or stdout if unparsable.
*/
async function callNpmCli(command, cliArguments, options) {
	const { stdout, stderr, exitCode } = await execNpm([
		command,
		...baseArguments(options),
		...cliArguments
	], options.environment, options.logger);
	let successData;
	let errorCode;
	let error$1;
	if (exitCode === 0) successData = parseJson(stdout);
	else {
		const errorPayload = parseJson(stdout, stderr);
		if (typeof errorPayload?.error?.code === "string") errorCode = errorPayload.error.code.toUpperCase();
		error$1 = new NpmCallError(command, exitCode, stderr);
	}
	return {
		successData,
		errorCode,
		error: error$1
	};
}
/**
* Execute the npm CLI.
*
* @param commandArguments Npm subcommand and arguments.
* @param environment Environment variables.
* @param logger Optional logger.
* @returns Stdout, stderr, and the exit code.
*/
async function execNpm(commandArguments, environment, logger$1) {
	logger$1?.debug?.(`Running command: ${NPM} ${commandArguments.join(" ")}`);
	return new Promise((resolve) => {
		let stdout = "";
		let stderr = "";
		const npm = childProcess.spawn(NPM, commandArguments, {
			env: {
				...process.env,
				...environment
			},
			shell: IS_WINDOWS$1
		});
		npm.stdout.on("data", (data) => stdout += data);
		npm.stderr.on("data", (data) => stderr += data);
		npm.on("close", (code$1) => {
			logger$1?.debug?.(`Received stdout: ${stdout}`);
			logger$1?.debug?.(`Received stderr: ${stderr}`);
			resolve({
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				exitCode: code$1 ?? 0
			});
		});
	});
}
/**
* Parse CLI outputs for JSON data.
*
* Certain versions of the npm CLI may intersperse JSON with human-readable
* output, which this function accounts for.
*
* @param values CLI outputs to check
* @returns Parsed JSON, if able to parse.
*/
function parseJson(...values) {
	for (const value of values) {
		const jsonValue = JSON_MATCH_RE.exec(value)?.[1];
		if (jsonValue) try {
			return JSON.parse(jsonValue);
		} catch {
			return;
		}
	}
}

//#endregion
//#region src/npm/use-npm-environment.ts
/**
* Create a temporary .npmrc file with the given auth token, and call a task
* with env vars set to use that .npmrc.
*
* @param manifest Pacakge metadata.
* @param options Configuration options.
* @param task A function called with the configured environment. After the
*   function resolves, the temporary .npmrc file will be removed.
* @returns The resolved value of `task`
*/
async function useNpmEnvironment(manifest, options, task) {
	const { registry, token, logger: logger$1, temporaryDirectory } = options;
	const { host, origin, pathname } = registry;
	const pathnameWithSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
	const config = [
		"; created by jsdevtools/npm-publish",
		`//${host}${pathnameWithSlash}:_authToken=\${NODE_AUTH_TOKEN}`,
		`registry=${origin}${pathnameWithSlash}`,
		""
	].join(os.EOL);
	const npmrcDirectory = await fs.mkdtemp(path.join(temporaryDirectory, "npm-publish-"));
	const npmrc = path.join(npmrcDirectory, ".npmrc");
	const environment = {
		NODE_AUTH_TOKEN: token,
		npm_config_userconfig: npmrc
	};
	await fs.writeFile(npmrc, config, "utf8");
	logger$1?.debug?.(`Temporary .npmrc created at ${npmrc}\n${config}`);
	try {
		return await task(manifest, options, environment);
	} finally {
		await fs.rm(npmrcDirectory, {
			force: true,
			recursive: true
		});
	}
}

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/debug.js
var require_debug = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/debug.js": ((exports, module) => {
	const debug$4 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
	module.exports = debug$4;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/constants.js
var require_constants = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/constants.js": ((exports, module) => {
	const SEMVER_SPEC_VERSION = "2.0.0";
	const MAX_LENGTH$2 = 256;
	const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || 9007199254740991;
	const MAX_SAFE_COMPONENT_LENGTH$1 = 16;
	const MAX_SAFE_BUILD_LENGTH$1 = MAX_LENGTH$2 - 6;
	const RELEASE_TYPES = [
		"major",
		"premajor",
		"minor",
		"preminor",
		"patch",
		"prepatch",
		"prerelease"
	];
	module.exports = {
		MAX_LENGTH: MAX_LENGTH$2,
		MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH$1,
		MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH$1,
		MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
		RELEASE_TYPES,
		SEMVER_SPEC_VERSION,
		FLAG_INCLUDE_PRERELEASE: 1,
		FLAG_LOOSE: 2
	};
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/re.js
var require_re = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/re.js": ((exports, module) => {
	const { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH: MAX_LENGTH$1 } = require_constants();
	const debug$3 = require_debug();
	exports = module.exports = {};
	const re$1 = exports.re = [];
	const safeRe = exports.safeRe = [];
	const src = exports.src = [];
	const safeSrc = exports.safeSrc = [];
	const t$1 = exports.t = {};
	let R = 0;
	const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
	const safeRegexReplacements = [
		["\\s", 1],
		["\\d", MAX_LENGTH$1],
		[LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
	];
	const makeSafeRegex = (value) => {
		for (const [token, max] of safeRegexReplacements) value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
		return value;
	};
	const createToken = (name$1, value, isGlobal) => {
		const safe = makeSafeRegex(value);
		const index = R++;
		debug$3(name$1, index, value);
		t$1[name$1] = index;
		src[index] = value;
		safeSrc[index] = safe;
		re$1[index] = new RegExp(value, isGlobal ? "g" : void 0);
		safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
	};
	createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
	createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
	createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
	createToken("MAINVERSION", `(${src[t$1.NUMERICIDENTIFIER]})\\.(${src[t$1.NUMERICIDENTIFIER]})\\.(${src[t$1.NUMERICIDENTIFIER]})`);
	createToken("MAINVERSIONLOOSE", `(${src[t$1.NUMERICIDENTIFIERLOOSE]})\\.(${src[t$1.NUMERICIDENTIFIERLOOSE]})\\.(${src[t$1.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASEIDENTIFIER", `(?:${src[t$1.NONNUMERICIDENTIFIER]}|${src[t$1.NUMERICIDENTIFIER]})`);
	createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t$1.NONNUMERICIDENTIFIER]}|${src[t$1.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASE", `(?:-(${src[t$1.PRERELEASEIDENTIFIER]}(?:\\.${src[t$1.PRERELEASEIDENTIFIER]})*))`);
	createToken("PRERELEASELOOSE", `(?:-?(${src[t$1.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t$1.PRERELEASEIDENTIFIERLOOSE]})*))`);
	createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
	createToken("BUILD", `(?:\\+(${src[t$1.BUILDIDENTIFIER]}(?:\\.${src[t$1.BUILDIDENTIFIER]})*))`);
	createToken("FULLPLAIN", `v?${src[t$1.MAINVERSION]}${src[t$1.PRERELEASE]}?${src[t$1.BUILD]}?`);
	createToken("FULL", `^${src[t$1.FULLPLAIN]}$`);
	createToken("LOOSEPLAIN", `[v=\\s]*${src[t$1.MAINVERSIONLOOSE]}${src[t$1.PRERELEASELOOSE]}?${src[t$1.BUILD]}?`);
	createToken("LOOSE", `^${src[t$1.LOOSEPLAIN]}$`);
	createToken("GTLT", "((?:<|>)?=?)");
	createToken("XRANGEIDENTIFIERLOOSE", `${src[t$1.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken("XRANGEIDENTIFIER", `${src[t$1.NUMERICIDENTIFIER]}|x|X|\\*`);
	createToken("XRANGEPLAIN", `[v=\\s]*(${src[t$1.XRANGEIDENTIFIER]})(?:\\.(${src[t$1.XRANGEIDENTIFIER]})(?:\\.(${src[t$1.XRANGEIDENTIFIER]})(?:${src[t$1.PRERELEASE]})?${src[t$1.BUILD]}?)?)?`);
	createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t$1.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t$1.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t$1.XRANGEIDENTIFIERLOOSE]})(?:${src[t$1.PRERELEASELOOSE]})?${src[t$1.BUILD]}?)?)?`);
	createToken("XRANGE", `^${src[t$1.GTLT]}\\s*${src[t$1.XRANGEPLAIN]}$`);
	createToken("XRANGELOOSE", `^${src[t$1.GTLT]}\\s*${src[t$1.XRANGEPLAINLOOSE]}$`);
	createToken("COERCEPLAIN", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
	createToken("COERCE", `${src[t$1.COERCEPLAIN]}(?:$|[^\\d])`);
	createToken("COERCEFULL", src[t$1.COERCEPLAIN] + `(?:${src[t$1.PRERELEASE]})?(?:${src[t$1.BUILD]})?(?:$|[^\\d])`);
	createToken("COERCERTL", src[t$1.COERCE], true);
	createToken("COERCERTLFULL", src[t$1.COERCEFULL], true);
	createToken("LONETILDE", "(?:~>?)");
	createToken("TILDETRIM", `(\\s*)${src[t$1.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = "$1~";
	createToken("TILDE", `^${src[t$1.LONETILDE]}${src[t$1.XRANGEPLAIN]}$`);
	createToken("TILDELOOSE", `^${src[t$1.LONETILDE]}${src[t$1.XRANGEPLAINLOOSE]}$`);
	createToken("LONECARET", "(?:\\^)");
	createToken("CARETTRIM", `(\\s*)${src[t$1.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = "$1^";
	createToken("CARET", `^${src[t$1.LONECARET]}${src[t$1.XRANGEPLAIN]}$`);
	createToken("CARETLOOSE", `^${src[t$1.LONECARET]}${src[t$1.XRANGEPLAINLOOSE]}$`);
	createToken("COMPARATORLOOSE", `^${src[t$1.GTLT]}\\s*(${src[t$1.LOOSEPLAIN]})$|^$`);
	createToken("COMPARATOR", `^${src[t$1.GTLT]}\\s*(${src[t$1.FULLPLAIN]})$|^$`);
	createToken("COMPARATORTRIM", `(\\s*)${src[t$1.GTLT]}\\s*(${src[t$1.LOOSEPLAIN]}|${src[t$1.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = "$1$2$3";
	createToken("HYPHENRANGE", `^\\s*(${src[t$1.XRANGEPLAIN]})\\s+-\\s+(${src[t$1.XRANGEPLAIN]})\\s*$`);
	createToken("HYPHENRANGELOOSE", `^\\s*(${src[t$1.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t$1.XRANGEPLAINLOOSE]})\\s*$`);
	createToken("STAR", "(<|>)?=?\\s*\\*");
	createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
	createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/parse-options.js
var require_parse_options = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/parse-options.js": ((exports, module) => {
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({});
	const parseOptions$1 = (options) => {
		if (!options) return emptyOpts;
		if (typeof options !== "object") return looseOption;
		return options;
	};
	module.exports = parseOptions$1;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/identifiers.js
var require_identifiers = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/internal/identifiers.js": ((exports, module) => {
	const numeric = /^[0-9]+$/;
	const compareIdentifiers$1 = (a, b) => {
		const anum = numeric.test(a);
		const bnum = numeric.test(b);
		if (anum && bnum) {
			a = +a;
			b = +b;
		}
		return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
	};
	const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
	module.exports = {
		compareIdentifiers: compareIdentifiers$1,
		rcompareIdentifiers
	};
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/classes/semver.js
var require_semver = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/classes/semver.js": ((exports, module) => {
	const debug$2 = require_debug();
	const { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
	const { safeRe: re, t } = require_re();
	const parseOptions = require_parse_options();
	const { compareIdentifiers } = require_identifiers();
	var SemVer$2 = class SemVer$2 {
		constructor(version, options) {
			options = parseOptions(options);
			if (version instanceof SemVer$2) if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
			else version = version.version;
			else if (typeof version !== "string") throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
			if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
			debug$2("SemVer", version, options);
			this.options = options;
			this.loose = !!options.loose;
			this.includePrerelease = !!options.includePrerelease;
			const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
			if (!m) throw new TypeError(`Invalid Version: ${version}`);
			this.raw = version;
			this.major = +m[1];
			this.minor = +m[2];
			this.patch = +m[3];
			if (this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
			if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
			if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
			if (!m[4]) this.prerelease = [];
			else this.prerelease = m[4].split(".").map((id) => {
				if (/^[0-9]+$/.test(id)) {
					const num = +id;
					if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
				}
				return id;
			});
			this.build = m[5] ? m[5].split(".") : [];
			this.format();
		}
		format() {
			this.version = `${this.major}.${this.minor}.${this.patch}`;
			if (this.prerelease.length) this.version += `-${this.prerelease.join(".")}`;
			return this.version;
		}
		toString() {
			return this.version;
		}
		compare(other) {
			debug$2("SemVer.compare", this.version, this.options, other);
			if (!(other instanceof SemVer$2)) {
				if (typeof other === "string" && other === this.version) return 0;
				other = new SemVer$2(other, this.options);
			}
			if (other.version === this.version) return 0;
			return this.compareMain(other) || this.comparePre(other);
		}
		compareMain(other) {
			if (!(other instanceof SemVer$2)) other = new SemVer$2(other, this.options);
			return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
		}
		comparePre(other) {
			if (!(other instanceof SemVer$2)) other = new SemVer$2(other, this.options);
			if (this.prerelease.length && !other.prerelease.length) return -1;
			else if (!this.prerelease.length && other.prerelease.length) return 1;
			else if (!this.prerelease.length && !other.prerelease.length) return 0;
			let i = 0;
			do {
				const a = this.prerelease[i];
				const b = other.prerelease[i];
				debug$2("prerelease compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		compareBuild(other) {
			if (!(other instanceof SemVer$2)) other = new SemVer$2(other, this.options);
			let i = 0;
			do {
				const a = this.build[i];
				const b = other.build[i];
				debug$2("build compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		inc(release, identifier, identifierBase) {
			if (release.startsWith("pre")) {
				if (!identifier && identifierBase === false) throw new Error("invalid increment argument: identifier is empty");
				if (identifier) {
					const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
					if (!match || match[1] !== identifier) throw new Error(`invalid identifier: ${identifier}`);
				}
			}
			switch (release) {
				case "premajor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor = 0;
					this.major++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "preminor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "prepatch":
					this.prerelease.length = 0;
					this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "prerelease":
					if (this.prerelease.length === 0) this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "release":
					if (this.prerelease.length === 0) throw new Error(`version ${this.raw} is not a prerelease`);
					this.prerelease.length = 0;
					break;
				case "major":
					if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) this.major++;
					this.minor = 0;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "minor":
					if (this.patch !== 0 || this.prerelease.length === 0) this.minor++;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "patch":
					if (this.prerelease.length === 0) this.patch++;
					this.prerelease = [];
					break;
				case "pre": {
					const base = Number(identifierBase) ? 1 : 0;
					if (this.prerelease.length === 0) this.prerelease = [base];
					else {
						let i = this.prerelease.length;
						while (--i >= 0) if (typeof this.prerelease[i] === "number") {
							this.prerelease[i]++;
							i = -2;
						}
						if (i === -1) {
							if (identifier === this.prerelease.join(".") && identifierBase === false) throw new Error("invalid increment argument: identifier already exists");
							this.prerelease.push(base);
						}
					}
					if (identifier) {
						let prerelease = [identifier, base];
						if (identifierBase === false) prerelease = [identifier];
						if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
							if (isNaN(this.prerelease[1])) this.prerelease = prerelease;
						} else this.prerelease = prerelease;
					}
					break;
				}
				default: throw new Error(`invalid increment argument: ${release}`);
			}
			this.raw = this.format();
			if (this.build.length) this.raw += `+${this.build.join(".")}`;
			return this;
		}
	};
	module.exports = SemVer$2;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/parse.js
var require_parse = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/parse.js": ((exports, module) => {
	const SemVer$1 = require_semver();
	const parse$4 = (version, options, throwErrors = false) => {
		if (version instanceof SemVer$1) return version;
		try {
			return new SemVer$1(version, options);
		} catch (er) {
			if (!throwErrors) return null;
			throw er;
		}
	};
	module.exports = parse$4;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/diff.js
var require_diff = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/diff.js": ((exports, module) => {
	const parse$3 = require_parse();
	const diff = (version1, version2) => {
		const v1 = parse$3(version1, null, true);
		const v2 = parse$3(version2, null, true);
		const comparison = v1.compare(v2);
		if (comparison === 0) return null;
		const v1Higher = comparison > 0;
		const highVersion = v1Higher ? v1 : v2;
		const lowVersion = v1Higher ? v2 : v1;
		const highHasPre = !!highVersion.prerelease.length;
		if (!!lowVersion.prerelease.length && !highHasPre) {
			if (!lowVersion.patch && !lowVersion.minor) return "major";
			if (lowVersion.compareMain(highVersion) === 0) {
				if (lowVersion.minor && !lowVersion.patch) return "minor";
				return "patch";
			}
		}
		const prefix = highHasPre ? "pre" : "";
		if (v1.major !== v2.major) return prefix + "major";
		if (v1.minor !== v2.minor) return prefix + "minor";
		if (v1.patch !== v2.patch) return prefix + "patch";
		return "prerelease";
	};
	module.exports = diff;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/compare.js
var require_compare = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/compare.js": ((exports, module) => {
	const SemVer = require_semver();
	const compare$1 = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
	module.exports = compare$1;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/gt.js
var require_gt = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/gt.js": ((exports, module) => {
	const compare = require_compare();
	const gt = (a, b, loose) => compare(a, b, loose) > 0;
	module.exports = gt;
}) });

//#endregion
//#region node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/valid.js
var require_valid = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/semver@7.7.2/node_modules/semver/functions/valid.js": ((exports, module) => {
	const parse$2 = require_parse();
	const valid = (version, options) => {
		const v = parse$2(version, options);
		return v ? v.version : null;
	};
	module.exports = valid;
}) });

//#endregion
//#region src/compare-and-publish/compare-versions.ts
var import_diff = /* @__PURE__ */ __toESM(require_diff(), 1);
var import_gt = /* @__PURE__ */ __toESM(require_gt(), 1);
var import_valid$1 = /* @__PURE__ */ __toESM(require_valid(), 1);
/**
* Compare previously published versions with the package's current version.
*
* @param currentVersion The current package version.
* @param publishedVersions The versions that have already been published.
* @param options Configuration options
* @returns The release type and previous version.
*/
function compareVersions(currentVersion, publishedVersions, options) {
	const { versions, "dist-tags": tags } = publishedVersions ?? {};
	const { strategy, tag: publishTag } = options;
	const oldVersion = (0, import_valid$1.default)(tags?.[publishTag.value]) ?? void 0;
	const isUnique = !versions?.includes(currentVersion);
	let type;
	if (isUnique) {
		if (!oldVersion) type = INITIAL;
		else if ((0, import_gt.default)(currentVersion, oldVersion)) type = (0, import_diff.default)(currentVersion, oldVersion) ?? DIFFERENT;
		else if (strategy.value === STRATEGY_ALL) type = DIFFERENT;
	}
	return {
		type,
		oldVersion
	};
}

//#endregion
//#region src/compare-and-publish/get-arguments.ts
/**
* Given a package name and publish configuration, get the NPM CLI view
* arguments.
*
* @param packageName Package name.
* @param options Publish configuration.
* @param retryWithTag Include a non-latest tag in the package spec for a rety
*   attempt.
* @returns Arguments to pass to the NPM CLI. If `retryWithTag` is true, but the
*   publish config is using the `latest` tag, will return `undefined`.
*/
function getViewArguments(packageName, options, retryWithTag = false) {
	return [
		retryWithTag ? `${packageName}@${options.tag.value}` : packageName,
		"dist-tags",
		"versions"
	];
}
/**
* Given a publish configuration, get the NPM CLI publish arguments.
*
* @param packageSpec Package specification path.
* @param options Publish configuration.
* @returns Arguments to pass to the NPM CLI.
*/
function getPublishArguments(packageSpec, options) {
	const { tag, access: access$1, dryRun, provenance } = options;
	const publishArguments = [];
	if (packageSpec.length > 0) publishArguments.push(packageSpec);
	if (!tag.isDefault) publishArguments.push("--tag", tag.value);
	if (!access$1.isDefault && access$1.value) publishArguments.push("--access", access$1.value);
	if (!provenance.isDefault && provenance.value) publishArguments.push("--provenance");
	if (!dryRun.isDefault && dryRun.value) publishArguments.push("--dry-run", "--force");
	return publishArguments;
}

//#endregion
//#region src/compare-and-publish/compare-and-publish.ts
/**
* Get the currently published versions of a package and publish if needed.
*
* @param manifest The package to potentially publish.
* @param options Configuration options.
* @param environment Environment variables for the npm cli.
* @returns Information about the publish, including if it occurred.
*/
async function compareAndPublish(manifest, options, environment) {
	const { name: name$1, version, packageSpec } = manifest;
	const cliOptions = {
		environment,
		ignoreScripts: options.ignoreScripts.value,
		logger: options.logger
	};
	const viewArguments = getViewArguments(name$1, options);
	const publishArguments = getPublishArguments(packageSpec, options);
	let viewCall = await callNpmCli(VIEW, viewArguments, cliOptions);
	if (!viewCall.successData && !viewCall.error) {
		const viewWithTagArguments = getViewArguments(name$1, options, true);
		viewCall = await callNpmCli(VIEW, viewWithTagArguments, cliOptions);
	}
	if (viewCall.error && viewCall.errorCode !== E404) throw viewCall.error;
	const isDryRun = options.dryRun.value;
	const comparison = compareVersions(version, viewCall.successData, options);
	const publishCall = comparison.type ?? isDryRun ? await callNpmCli(PUBLISH, publishArguments, cliOptions) : {
		successData: void 0,
		errorCode: void 0,
		error: void 0
	};
	if (publishCall.error && publishCall.errorCode !== EPUBLISHCONFLICT && publishCall.errorCode !== E409) throw publishCall.error;
	const { successData: publishData } = publishCall;
	return {
		id: isDryRun && !comparison.type ? void 0 : publishData?.id,
		files: publishData?.files ?? [],
		type: publishData ? comparison.type : void 0,
		oldVersion: comparison.oldVersion
	};
}

//#endregion
//#region src/format-publish-result.ts
const DRY_RUN_BANNER = "=== DRY RUN === DRY RUN === DRY RUN === DRY RUN === DRY RUN ===";
const CONTENTS_BANNER = "=== Contents ===";
/**
* Format publish results into a string.
*
* @param manifest Package manifest
* @param options Configuration options.
* @param result Results from running npm publish.
* @returns Formatted string.
*/
function formatPublishResult(manifest, options, result) {
	const lines = [];
	lines.push(result.id === void 0 ? `🙅‍♀️ ${manifest.name}@${manifest.version} already published.` : `📦 ${result.id}`);
	if (result.files.length > 0) lines.push("", CONTENTS_BANNER);
	for (const { path: path$6, size } of result.files) lines.push(`${formatSize(size)}\t${path$6}`);
	return (options.dryRun.value ? [
		DRY_RUN_BANNER,
		"",
		...lines,
		"",
		DRY_RUN_BANNER
	] : lines).join(os.EOL);
}
const formatSize = (size) => {
	if (size < 1e3) return `${size} B`;
	if (size < 1e6) return `${(size / 1e3).toFixed(1)} kB`;
	return `${(size / 1e6).toFixed(1)} MB`;
};

//#endregion
//#region src/normalize-options.ts
const REGISTRY_NPM = "https://registry.npmjs.org/";
const TAG_LATEST = "latest";
/**
* Normalizes and sanitizes options, and fills-in any default values.
*
* @param manifest Package metadata from package.json.
* @param options User-input options.
* @returns Validated auth and publish configuration.
*/
function normalizeOptions(manifest, options) {
	const defaultTag = manifest.publishConfig?.tag ?? TAG_LATEST;
	const defaultRegistry = manifest.publishConfig?.registry ?? REGISTRY_NPM;
	const defaultAccess = manifest.publishConfig?.access ?? (manifest.scope === void 0 ? ACCESS_PUBLIC : void 0);
	const defaultProvenance = manifest.publishConfig?.provenance ?? false;
	return {
		token: validateToken(options.token),
		registry: validateRegistry(options.registry ?? defaultRegistry),
		tag: setValue(options.tag, defaultTag, validateTag),
		access: setValue(options.access, defaultAccess, validateAccess),
		provenance: setValue(options.provenance, defaultProvenance, Boolean),
		ignoreScripts: setValue(options.ignoreScripts, true, Boolean),
		dryRun: setValue(options.dryRun, false, Boolean),
		strategy: setValue(options.strategy, STRATEGY_ALL, validateStrategy),
		logger: options.logger,
		temporaryDirectory: options.temporaryDirectory ?? os.tmpdir()
	};
}
const setValue = (value, defaultValue, validate$1) => ({
	value: validate$1(value ?? defaultValue),
	isDefault: value === void 0
});
const validateToken = (value) => {
	if (typeof value === "string" && value.length > 0) return value;
	throw new InvalidTokenError();
};
const validateRegistry = (value) => {
	try {
		return new URL(value);
	} catch {
		throw new InvalidRegistryUrlError(value);
	}
};
const validateTag = (value) => {
	if (typeof value === "string") {
		const trimmedValue = value.trim();
		const encodedValue = encodeURIComponent(trimmedValue);
		if (trimmedValue.length > 0 && trimmedValue === encodedValue) return value;
	}
	throw new InvalidTagError(value);
};
const validateAccess = (value) => {
	if (value === void 0 || value === ACCESS_PUBLIC || value === ACCESS_RESTRICTED) return value;
	throw new InvalidAccessError(value);
};
const validateStrategy = (value) => {
	if (value === STRATEGY_ALL || value === STRATEGY_UPGRADE) return value;
	throw new InvalidStrategyError(value);
};

//#endregion
//#region node_modules/.pnpm/minipass@7.1.2/node_modules/minipass/dist/esm/index.js
const proc = typeof process === "object" && process ? process : {
	stdout: null,
	stderr: null
};
/**
* Return true if the argument is a Minipass stream, Node stream, or something
* else that Minipass can interact with.
*/
const isStream = (s) => !!s && typeof s === "object" && (s instanceof Minipass || s instanceof Stream || isReadable(s) || isWritable(s));
/**
* Return true if the argument is a valid {@link Minipass.Readable}
*/
const isReadable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter$1 && typeof s.pipe === "function" && s.pipe !== Stream.Writable.prototype.pipe;
/**
* Return true if the argument is a valid {@link Minipass.Writable}
*/
const isWritable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter$1 && typeof s.write === "function" && typeof s.end === "function";
const EOF = Symbol("EOF");
const MAYBE_EMIT_END = Symbol("maybeEmitEnd");
const EMITTED_END = Symbol("emittedEnd");
const EMITTING_END = Symbol("emittingEnd");
const EMITTED_ERROR = Symbol("emittedError");
const CLOSED = Symbol("closed");
const READ = Symbol("read");
const FLUSH = Symbol("flush");
const FLUSHCHUNK = Symbol("flushChunk");
const ENCODING = Symbol("encoding");
const DECODER = Symbol("decoder");
const FLOWING = Symbol("flowing");
const PAUSED = Symbol("paused");
const RESUME = Symbol("resume");
const BUFFER$1 = Symbol("buffer");
const PIPES = Symbol("pipes");
const BUFFERLENGTH = Symbol("bufferLength");
const BUFFERPUSH = Symbol("bufferPush");
const BUFFERSHIFT = Symbol("bufferShift");
const OBJECTMODE = Symbol("objectMode");
const DESTROYED = Symbol("destroyed");
const ERROR = Symbol("error");
const EMITDATA = Symbol("emitData");
const EMITEND = Symbol("emitEnd");
const EMITEND2 = Symbol("emitEnd2");
const ASYNC = Symbol("async");
const ABORT = Symbol("abort");
const ABORTED$1 = Symbol("aborted");
const SIGNAL = Symbol("signal");
const DATALISTENERS = Symbol("dataListeners");
const DISCARDED = Symbol("discarded");
const defer = (fn) => Promise.resolve().then(fn);
const nodefer = (fn) => fn();
const isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
const isArrayBufferLike = (b) => b instanceof ArrayBuffer || !!b && typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
const isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
/**
* Internal class representing a pipe to a destination stream.
*
* @internal
*/
var Pipe = class {
	src;
	dest;
	opts;
	ondrain;
	constructor(src$1, dest, opts) {
		this.src = src$1;
		this.dest = dest;
		this.opts = opts;
		this.ondrain = () => src$1[RESUME]();
		this.dest.on("drain", this.ondrain);
	}
	unpipe() {
		this.dest.removeListener("drain", this.ondrain);
	}
	/* c8 ignore start */
	proxyErrors(_er) {}
	/* c8 ignore stop */
	end() {
		this.unpipe();
		if (this.opts.end) this.dest.end();
	}
};
/**
* Internal class representing a pipe to a destination stream where
* errors are proxied.
*
* @internal
*/
var PipeProxyErrors = class extends Pipe {
	unpipe() {
		this.src.removeListener("error", this.proxyErrors);
		super.unpipe();
	}
	constructor(src$1, dest, opts) {
		super(src$1, dest, opts);
		this.proxyErrors = (er) => dest.emit("error", er);
		src$1.on("error", this.proxyErrors);
	}
};
const isObjectModeOptions = (o) => !!o.objectMode;
const isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== "buffer";
/**
* Main export, the Minipass class
*
* `RType` is the type of data emitted, defaults to Buffer
*
* `WType` is the type of data to be written, if RType is buffer or string,
* then any {@link Minipass.ContiguousData} is allowed.
*
* `Events` is the set of event handler signatures that this object
* will emit, see {@link Minipass.Events}
*/
var Minipass = class extends EventEmitter$1 {
	[FLOWING] = false;
	[PAUSED] = false;
	[PIPES] = [];
	[BUFFER$1] = [];
	[OBJECTMODE];
	[ENCODING];
	[ASYNC];
	[DECODER];
	[EOF] = false;
	[EMITTED_END] = false;
	[EMITTING_END] = false;
	[CLOSED] = false;
	[EMITTED_ERROR] = null;
	[BUFFERLENGTH] = 0;
	[DESTROYED] = false;
	[SIGNAL];
	[ABORTED$1] = false;
	[DATALISTENERS] = 0;
	[DISCARDED] = false;
	/**
	* true if the stream can be written
	*/
	writable = true;
	/**
	* true if the stream can be read
	*/
	readable = true;
	/**
	* If `RType` is Buffer, then options do not need to be provided.
	* Otherwise, an options object must be provided to specify either
	* {@link Minipass.SharedOptions.objectMode} or
	* {@link Minipass.SharedOptions.encoding}, as appropriate.
	*/
	constructor(...args) {
		const options = args[0] || {};
		super();
		if (options.objectMode && typeof options.encoding === "string") throw new TypeError("Encoding and objectMode may not be used together");
		if (isObjectModeOptions(options)) {
			this[OBJECTMODE] = true;
			this[ENCODING] = null;
		} else if (isEncodingOptions(options)) {
			this[ENCODING] = options.encoding;
			this[OBJECTMODE] = false;
		} else {
			this[OBJECTMODE] = false;
			this[ENCODING] = null;
		}
		this[ASYNC] = !!options.async;
		this[DECODER] = this[ENCODING] ? new StringDecoder(this[ENCODING]) : null;
		if (options && options.debugExposeBuffer === true) Object.defineProperty(this, "buffer", { get: () => this[BUFFER$1] });
		if (options && options.debugExposePipes === true) Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
		const { signal } = options;
		if (signal) {
			this[SIGNAL] = signal;
			if (signal.aborted) this[ABORT]();
			else signal.addEventListener("abort", () => this[ABORT]());
		}
	}
	/**
	* The amount of data stored in the buffer waiting to be read.
	*
	* For Buffer strings, this will be the total byte length.
	* For string encoding streams, this will be the string character length,
	* according to JavaScript's `string.length` logic.
	* For objectMode streams, this is a count of the items waiting to be
	* emitted.
	*/
	get bufferLength() {
		return this[BUFFERLENGTH];
	}
	/**
	* The `BufferEncoding` currently in use, or `null`
	*/
	get encoding() {
		return this[ENCODING];
	}
	/**
	* @deprecated - This is a read only property
	*/
	set encoding(_enc) {
		throw new Error("Encoding must be set at instantiation time");
	}
	/**
	* @deprecated - Encoding may only be set at instantiation time
	*/
	setEncoding(_enc) {
		throw new Error("Encoding must be set at instantiation time");
	}
	/**
	* True if this is an objectMode stream
	*/
	get objectMode() {
		return this[OBJECTMODE];
	}
	/**
	* @deprecated - This is a read-only property
	*/
	set objectMode(_om) {
		throw new Error("objectMode must be set at instantiation time");
	}
	/**
	* true if this is an async stream
	*/
	get ["async"]() {
		return this[ASYNC];
	}
	/**
	* Set to true to make this stream async.
	*
	* Once set, it cannot be unset, as this would potentially cause incorrect
	* behavior.  Ie, a sync stream can be made async, but an async stream
	* cannot be safely made sync.
	*/
	set ["async"](a) {
		this[ASYNC] = this[ASYNC] || !!a;
	}
	[ABORT]() {
		this[ABORTED$1] = true;
		this.emit("abort", this[SIGNAL]?.reason);
		this.destroy(this[SIGNAL]?.reason);
	}
	/**
	* True if the stream has been aborted.
	*/
	get aborted() {
		return this[ABORTED$1];
	}
	/**
	* No-op setter. Stream aborted status is set via the AbortSignal provided
	* in the constructor options.
	*/
	set aborted(_) {}
	write(chunk, encoding, cb) {
		if (this[ABORTED$1]) return false;
		if (this[EOF]) throw new Error("write after end");
		if (this[DESTROYED]) {
			this.emit("error", Object.assign(/* @__PURE__ */ new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
			return true;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = "utf8";
		}
		if (!encoding) encoding = "utf8";
		const fn = this[ASYNC] ? defer : nodefer;
		if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
			if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
			else if (isArrayBufferLike(chunk)) chunk = Buffer.from(chunk);
			else if (typeof chunk !== "string") throw new Error("Non-contiguous data written to non-objectMode stream");
		}
		if (this[OBJECTMODE]) {
			/* c8 ignore start */
			if (this[FLOWING] && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
			/* c8 ignore stop */
			if (this[FLOWING]) this.emit("data", chunk);
			else this[BUFFERPUSH](chunk);
			if (this[BUFFERLENGTH] !== 0) this.emit("readable");
			if (cb) fn(cb);
			return this[FLOWING];
		}
		if (!chunk.length) {
			if (this[BUFFERLENGTH] !== 0) this.emit("readable");
			if (cb) fn(cb);
			return this[FLOWING];
		}
		if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) chunk = Buffer.from(chunk, encoding);
		if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);
		if (this[FLOWING] && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
		if (this[FLOWING]) this.emit("data", chunk);
		else this[BUFFERPUSH](chunk);
		if (this[BUFFERLENGTH] !== 0) this.emit("readable");
		if (cb) fn(cb);
		return this[FLOWING];
	}
	/**
	* Low-level explicit read method.
	*
	* In objectMode, the argument is ignored, and one item is returned if
	* available.
	*
	* `n` is the number of bytes (or in the case of encoding streams,
	* characters) to consume. If `n` is not provided, then the entire buffer
	* is returned, or `null` is returned if no data is available.
	*
	* If `n` is greater that the amount of data in the internal buffer,
	* then `null` is returned.
	*/
	read(n) {
		if (this[DESTROYED]) return null;
		this[DISCARDED] = false;
		if (this[BUFFERLENGTH] === 0 || n === 0 || n && n > this[BUFFERLENGTH]) {
			this[MAYBE_EMIT_END]();
			return null;
		}
		if (this[OBJECTMODE]) n = null;
		if (this[BUFFER$1].length > 1 && !this[OBJECTMODE]) this[BUFFER$1] = [this[ENCODING] ? this[BUFFER$1].join("") : Buffer.concat(this[BUFFER$1], this[BUFFERLENGTH])];
		const ret = this[READ](n || null, this[BUFFER$1][0]);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[READ](n, chunk) {
		if (this[OBJECTMODE]) this[BUFFERSHIFT]();
		else {
			const c = chunk;
			if (n === c.length || n === null) this[BUFFERSHIFT]();
			else if (typeof c === "string") {
				this[BUFFER$1][0] = c.slice(n);
				chunk = c.slice(0, n);
				this[BUFFERLENGTH] -= n;
			} else {
				this[BUFFER$1][0] = c.subarray(n);
				chunk = c.subarray(0, n);
				this[BUFFERLENGTH] -= n;
			}
		}
		this.emit("data", chunk);
		if (!this[BUFFER$1].length && !this[EOF]) this.emit("drain");
		return chunk;
	}
	end(chunk, encoding, cb) {
		if (typeof chunk === "function") {
			cb = chunk;
			chunk = void 0;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = "utf8";
		}
		if (chunk !== void 0) this.write(chunk, encoding);
		if (cb) this.once("end", cb);
		this[EOF] = true;
		this.writable = false;
		if (this[FLOWING] || !this[PAUSED]) this[MAYBE_EMIT_END]();
		return this;
	}
	[RESUME]() {
		if (this[DESTROYED]) return;
		if (!this[DATALISTENERS] && !this[PIPES].length) this[DISCARDED] = true;
		this[PAUSED] = false;
		this[FLOWING] = true;
		this.emit("resume");
		if (this[BUFFER$1].length) this[FLUSH]();
		else if (this[EOF]) this[MAYBE_EMIT_END]();
		else this.emit("drain");
	}
	/**
	* Resume the stream if it is currently in a paused state
	*
	* If called when there are no pipe destinations or `data` event listeners,
	* this will place the stream in a "discarded" state, where all data will
	* be thrown away. The discarded state is removed if a pipe destination or
	* data handler is added, if pause() is called, or if any synchronous or
	* asynchronous iteration is started.
	*/
	resume() {
		return this[RESUME]();
	}
	/**
	* Pause the stream
	*/
	pause() {
		this[FLOWING] = false;
		this[PAUSED] = true;
		this[DISCARDED] = false;
	}
	/**
	* true if the stream has been forcibly destroyed
	*/
	get destroyed() {
		return this[DESTROYED];
	}
	/**
	* true if the stream is currently in a flowing state, meaning that
	* any writes will be immediately emitted.
	*/
	get flowing() {
		return this[FLOWING];
	}
	/**
	* true if the stream is currently in a paused state
	*/
	get paused() {
		return this[PAUSED];
	}
	[BUFFERPUSH](chunk) {
		if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1;
		else this[BUFFERLENGTH] += chunk.length;
		this[BUFFER$1].push(chunk);
	}
	[BUFFERSHIFT]() {
		if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1;
		else this[BUFFERLENGTH] -= this[BUFFER$1][0].length;
		return this[BUFFER$1].shift();
	}
	[FLUSH](noDrain = false) {
		do		;
while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER$1].length);
		if (!noDrain && !this[BUFFER$1].length && !this[EOF]) this.emit("drain");
	}
	[FLUSHCHUNK](chunk) {
		this.emit("data", chunk);
		return this[FLOWING];
	}
	/**
	* Pipe all data emitted by this stream into the destination provided.
	*
	* Triggers the flow of data.
	*/
	pipe(dest, opts) {
		if (this[DESTROYED]) return dest;
		this[DISCARDED] = false;
		const ended = this[EMITTED_END];
		opts = opts || {};
		if (dest === proc.stdout || dest === proc.stderr) opts.end = false;
		else opts.end = opts.end !== false;
		opts.proxyErrors = !!opts.proxyErrors;
		if (ended) {
			if (opts.end) dest.end();
		} else {
			this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
			if (this[ASYNC]) defer(() => this[RESUME]());
			else this[RESUME]();
		}
		return dest;
	}
	/**
	* Fully unhook a piped destination stream.
	*
	* If the destination stream was the only consumer of this stream (ie,
	* there are no other piped destinations or `'data'` event listeners)
	* then the flow of data will stop until there is another consumer or
	* {@link Minipass#resume} is explicitly called.
	*/
	unpipe(dest) {
		const p = this[PIPES].find((p$1) => p$1.dest === dest);
		if (p) {
			if (this[PIPES].length === 1) {
				if (this[FLOWING] && this[DATALISTENERS] === 0) this[FLOWING] = false;
				this[PIPES] = [];
			} else this[PIPES].splice(this[PIPES].indexOf(p), 1);
			p.unpipe();
		}
	}
	/**
	* Alias for {@link Minipass#on}
	*/
	addListener(ev, handler) {
		return this.on(ev, handler);
	}
	/**
	* Mostly identical to `EventEmitter.on`, with the following
	* behavior differences to prevent data loss and unnecessary hangs:
	*
	* - Adding a 'data' event handler will trigger the flow of data
	*
	* - Adding a 'readable' event handler when there is data waiting to be read
	*   will cause 'readable' to be emitted immediately.
	*
	* - Adding an 'endish' event handler ('end', 'finish', etc.) which has
	*   already passed will cause the event to be emitted immediately and all
	*   handlers removed.
	*
	* - Adding an 'error' event handler after an error has been emitted will
	*   cause the event to be re-emitted immediately with the error previously
	*   raised.
	*/
	on(ev, handler) {
		const ret = super.on(ev, handler);
		if (ev === "data") {
			this[DISCARDED] = false;
			this[DATALISTENERS]++;
			if (!this[PIPES].length && !this[FLOWING]) this[RESUME]();
		} else if (ev === "readable" && this[BUFFERLENGTH] !== 0) super.emit("readable");
		else if (isEndish(ev) && this[EMITTED_END]) {
			super.emit(ev);
			this.removeAllListeners(ev);
		} else if (ev === "error" && this[EMITTED_ERROR]) {
			const h = handler;
			if (this[ASYNC]) defer(() => h.call(this, this[EMITTED_ERROR]));
			else h.call(this, this[EMITTED_ERROR]);
		}
		return ret;
	}
	/**
	* Alias for {@link Minipass#off}
	*/
	removeListener(ev, handler) {
		return this.off(ev, handler);
	}
	/**
	* Mostly identical to `EventEmitter.off`
	*
	* If a 'data' event handler is removed, and it was the last consumer
	* (ie, there are no pipe destinations or other 'data' event listeners),
	* then the flow of data will stop until there is another consumer or
	* {@link Minipass#resume} is explicitly called.
	*/
	off(ev, handler) {
		const ret = super.off(ev, handler);
		if (ev === "data") {
			this[DATALISTENERS] = this.listeners("data").length;
			if (this[DATALISTENERS] === 0 && !this[DISCARDED] && !this[PIPES].length) this[FLOWING] = false;
		}
		return ret;
	}
	/**
	* Mostly identical to `EventEmitter.removeAllListeners`
	*
	* If all 'data' event handlers are removed, and they were the last consumer
	* (ie, there are no pipe destinations), then the flow of data will stop
	* until there is another consumer or {@link Minipass#resume} is explicitly
	* called.
	*/
	removeAllListeners(ev) {
		const ret = super.removeAllListeners(ev);
		if (ev === "data" || ev === void 0) {
			this[DATALISTENERS] = 0;
			if (!this[DISCARDED] && !this[PIPES].length) this[FLOWING] = false;
		}
		return ret;
	}
	/**
	* true if the 'end' event has been emitted
	*/
	get emittedEnd() {
		return this[EMITTED_END];
	}
	[MAYBE_EMIT_END]() {
		if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER$1].length === 0 && this[EOF]) {
			this[EMITTING_END] = true;
			this.emit("end");
			this.emit("prefinish");
			this.emit("finish");
			if (this[CLOSED]) this.emit("close");
			this[EMITTING_END] = false;
		}
	}
	/**
	* Mostly identical to `EventEmitter.emit`, with the following
	* behavior differences to prevent data loss and unnecessary hangs:
	*
	* If the stream has been destroyed, and the event is something other
	* than 'close' or 'error', then `false` is returned and no handlers
	* are called.
	*
	* If the event is 'end', and has already been emitted, then the event
	* is ignored. If the stream is in a paused or non-flowing state, then
	* the event will be deferred until data flow resumes. If the stream is
	* async, then handlers will be called on the next tick rather than
	* immediately.
	*
	* If the event is 'close', and 'end' has not yet been emitted, then
	* the event will be deferred until after 'end' is emitted.
	*
	* If the event is 'error', and an AbortSignal was provided for the stream,
	* and there are no listeners, then the event is ignored, matching the
	* behavior of node core streams in the presense of an AbortSignal.
	*
	* If the event is 'finish' or 'prefinish', then all listeners will be
	* removed after emitting the event, to prevent double-firing.
	*/
	emit(ev, ...args) {
		const data = args[0];
		if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) return false;
		else if (ev === "data") return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? (defer(() => this[EMITDATA](data)), true) : this[EMITDATA](data);
		else if (ev === "end") return this[EMITEND]();
		else if (ev === "close") {
			this[CLOSED] = true;
			if (!this[EMITTED_END] && !this[DESTROYED]) return false;
			const ret$1 = super.emit("close");
			this.removeAllListeners("close");
			return ret$1;
		} else if (ev === "error") {
			this[EMITTED_ERROR] = data;
			super.emit(ERROR, data);
			const ret$1 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
			this[MAYBE_EMIT_END]();
			return ret$1;
		} else if (ev === "resume") {
			const ret$1 = super.emit("resume");
			this[MAYBE_EMIT_END]();
			return ret$1;
		} else if (ev === "finish" || ev === "prefinish") {
			const ret$1 = super.emit(ev);
			this.removeAllListeners(ev);
			return ret$1;
		}
		const ret = super.emit(ev, ...args);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[EMITDATA](data) {
		for (const p of this[PIPES]) if (p.dest.write(data) === false) this.pause();
		const ret = this[DISCARDED] ? false : super.emit("data", data);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[EMITEND]() {
		if (this[EMITTED_END]) return false;
		this[EMITTED_END] = true;
		this.readable = false;
		return this[ASYNC] ? (defer(() => this[EMITEND2]()), true) : this[EMITEND2]();
	}
	[EMITEND2]() {
		if (this[DECODER]) {
			const data = this[DECODER].end();
			if (data) {
				for (const p of this[PIPES]) p.dest.write(data);
				if (!this[DISCARDED]) super.emit("data", data);
			}
		}
		for (const p of this[PIPES]) p.end();
		const ret = super.emit("end");
		this.removeAllListeners("end");
		return ret;
	}
	/**
	* Return a Promise that resolves to an array of all emitted data once
	* the stream ends.
	*/
	async collect() {
		const buf = Object.assign([], { dataLength: 0 });
		if (!this[OBJECTMODE]) buf.dataLength = 0;
		const p = this.promise();
		this.on("data", (c) => {
			buf.push(c);
			if (!this[OBJECTMODE]) buf.dataLength += c.length;
		});
		await p;
		return buf;
	}
	/**
	* Return a Promise that resolves to the concatenation of all emitted data
	* once the stream ends.
	*
	* Not allowed on objectMode streams.
	*/
	async concat() {
		if (this[OBJECTMODE]) throw new Error("cannot concat in objectMode");
		const buf = await this.collect();
		return this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength);
	}
	/**
	* Return a void Promise that resolves once the stream ends.
	*/
	async promise() {
		return new Promise((resolve, reject) => {
			this.on(DESTROYED, () => reject(/* @__PURE__ */ new Error("stream destroyed")));
			this.on("error", (er) => reject(er));
			this.on("end", () => resolve());
		});
	}
	/**
	* Asynchronous `for await of` iteration.
	*
	* This will continue emitting all chunks until the stream terminates.
	*/
	[Symbol.asyncIterator]() {
		this[DISCARDED] = false;
		let stopped = false;
		const stop = async () => {
			this.pause();
			stopped = true;
			return {
				value: void 0,
				done: true
			};
		};
		const next = () => {
			if (stopped) return stop();
			const res = this.read();
			if (res !== null) return Promise.resolve({
				done: false,
				value: res
			});
			if (this[EOF]) return stop();
			let resolve;
			let reject;
			const onerr = (er) => {
				this.off("data", ondata);
				this.off("end", onend);
				this.off(DESTROYED, ondestroy);
				stop();
				reject(er);
			};
			const ondata = (value) => {
				this.off("error", onerr);
				this.off("end", onend);
				this.off(DESTROYED, ondestroy);
				this.pause();
				resolve({
					value,
					done: !!this[EOF]
				});
			};
			const onend = () => {
				this.off("error", onerr);
				this.off("data", ondata);
				this.off(DESTROYED, ondestroy);
				stop();
				resolve({
					done: true,
					value: void 0
				});
			};
			const ondestroy = () => onerr(/* @__PURE__ */ new Error("stream destroyed"));
			return new Promise((res$1, rej) => {
				reject = rej;
				resolve = res$1;
				this.once(DESTROYED, ondestroy);
				this.once("error", onerr);
				this.once("end", onend);
				this.once("data", ondata);
			});
		};
		return {
			next,
			throw: stop,
			return: stop,
			[Symbol.asyncIterator]() {
				return this;
			}
		};
	}
	/**
	* Synchronous `for of` iteration.
	*
	* The iteration will terminate when the internal buffer runs out, even
	* if the stream has not yet terminated.
	*/
	[Symbol.iterator]() {
		this[DISCARDED] = false;
		let stopped = false;
		const stop = () => {
			this.pause();
			this.off(ERROR, stop);
			this.off(DESTROYED, stop);
			this.off("end", stop);
			stopped = true;
			return {
				done: true,
				value: void 0
			};
		};
		const next = () => {
			if (stopped) return stop();
			const value = this.read();
			return value === null ? stop() : {
				done: false,
				value
			};
		};
		this.once("end", stop);
		this.once(ERROR, stop);
		this.once(DESTROYED, stop);
		return {
			next,
			throw: stop,
			return: stop,
			[Symbol.iterator]() {
				return this;
			}
		};
	}
	/**
	* Destroy a stream, preventing it from being used for any further purpose.
	*
	* If the stream has a `close()` method, then it will be called on
	* destruction.
	*
	* After destruction, any attempt to write data, read data, or emit most
	* events will be ignored.
	*
	* If an error argument is provided, then it will be emitted in an
	* 'error' event.
	*/
	destroy(er) {
		if (this[DESTROYED]) {
			if (er) this.emit("error", er);
			else this.emit(DESTROYED);
			return this;
		}
		this[DESTROYED] = true;
		this[DISCARDED] = true;
		this[BUFFER$1].length = 0;
		this[BUFFERLENGTH] = 0;
		const wc = this;
		if (typeof wc.close === "function" && !this[CLOSED]) wc.close();
		if (er) this.emit("error", er);
		else this.emit(DESTROYED);
		return this;
	}
	/**
	* Alias for {@link isStream}
	*
	* Former export location, maintained for backwards compatibility.
	*
	* @deprecated
	*/
	static get isStream() {
		return isStream;
	}
};

//#endregion
//#region node_modules/.pnpm/@isaacs+fs-minipass@4.0.1/node_modules/@isaacs/fs-minipass/dist/esm/index.js
const writev = fs$1.writev;
const _autoClose = Symbol("_autoClose");
const _close = Symbol("_close");
const _ended = Symbol("_ended");
const _fd = Symbol("_fd");
const _finished = Symbol("_finished");
const _flags = Symbol("_flags");
const _flush = Symbol("_flush");
const _handleChunk = Symbol("_handleChunk");
const _makeBuf = Symbol("_makeBuf");
const _mode = Symbol("_mode");
const _needDrain = Symbol("_needDrain");
const _onerror = Symbol("_onerror");
const _onopen = Symbol("_onopen");
const _onread = Symbol("_onread");
const _onwrite = Symbol("_onwrite");
const _open = Symbol("_open");
const _path = Symbol("_path");
const _pos = Symbol("_pos");
const _queue = Symbol("_queue");
const _read = Symbol("_read");
const _readSize = Symbol("_readSize");
const _reading = Symbol("_reading");
const _remain = Symbol("_remain");
const _size = Symbol("_size");
const _write = Symbol("_write");
const _writing = Symbol("_writing");
const _defaultFlag = Symbol("_defaultFlag");
const _errored = Symbol("_errored");
var ReadStream = class extends Minipass {
	[_errored] = false;
	[_fd];
	[_path];
	[_readSize];
	[_reading] = false;
	[_size];
	[_remain];
	[_autoClose];
	constructor(path$6, opt) {
		opt = opt || {};
		super(opt);
		this.readable = true;
		this.writable = false;
		if (typeof path$6 !== "string") throw new TypeError("path must be a string");
		this[_errored] = false;
		this[_fd] = typeof opt.fd === "number" ? opt.fd : void 0;
		this[_path] = path$6;
		this[_readSize] = opt.readSize || 16 * 1024 * 1024;
		this[_reading] = false;
		this[_size] = typeof opt.size === "number" ? opt.size : Infinity;
		this[_remain] = this[_size];
		this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
		if (typeof this[_fd] === "number") this[_read]();
		else this[_open]();
	}
	get fd() {
		return this[_fd];
	}
	get path() {
		return this[_path];
	}
	write() {
		throw new TypeError("this is a readable stream");
	}
	end() {
		throw new TypeError("this is a readable stream");
	}
	[_open]() {
		fs$1.open(this[_path], "r", (er, fd) => this[_onopen](er, fd));
	}
	[_onopen](er, fd) {
		if (er) this[_onerror](er);
		else {
			this[_fd] = fd;
			this.emit("open", fd);
			this[_read]();
		}
	}
	[_makeBuf]() {
		return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]));
	}
	[_read]() {
		if (!this[_reading]) {
			this[_reading] = true;
			const buf = this[_makeBuf]();
			/* c8 ignore start */
			if (buf.length === 0) return process.nextTick(() => this[_onread](null, 0, buf));
			/* c8 ignore stop */
			fs$1.read(this[_fd], buf, 0, buf.length, null, (er, br, b) => this[_onread](er, br, b));
		}
	}
	[_onread](er, br, buf) {
		this[_reading] = false;
		if (er) this[_onerror](er);
		else if (this[_handleChunk](br, buf)) this[_read]();
	}
	[_close]() {
		if (this[_autoClose] && typeof this[_fd] === "number") {
			const fd = this[_fd];
			this[_fd] = void 0;
			fs$1.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
		}
	}
	[_onerror](er) {
		this[_reading] = true;
		this[_close]();
		this.emit("error", er);
	}
	[_handleChunk](br, buf) {
		let ret = false;
		this[_remain] -= br;
		if (br > 0) ret = super.write(br < buf.length ? buf.subarray(0, br) : buf);
		if (br === 0 || this[_remain] <= 0) {
			ret = false;
			this[_close]();
			super.end();
		}
		return ret;
	}
	emit(ev, ...args) {
		switch (ev) {
			case "prefinish":
			case "finish": return false;
			case "drain":
				if (typeof this[_fd] === "number") this[_read]();
				return false;
			case "error":
				if (this[_errored]) return false;
				this[_errored] = true;
				return super.emit(ev, ...args);
			default: return super.emit(ev, ...args);
		}
	}
};
var ReadStreamSync = class extends ReadStream {
	[_open]() {
		let threw = true;
		try {
			this[_onopen](null, fs$1.openSync(this[_path], "r"));
			threw = false;
		} finally {
			if (threw) this[_close]();
		}
	}
	[_read]() {
		let threw = true;
		try {
			if (!this[_reading]) {
				this[_reading] = true;
				do {
					const buf = this[_makeBuf]();
					/* c8 ignore start */
					const br = buf.length === 0 ? 0 : fs$1.readSync(this[_fd], buf, 0, buf.length, null);
					/* c8 ignore stop */
					if (!this[_handleChunk](br, buf)) break;
				} while (true);
				this[_reading] = false;
			}
			threw = false;
		} finally {
			if (threw) this[_close]();
		}
	}
	[_close]() {
		if (this[_autoClose] && typeof this[_fd] === "number") {
			const fd = this[_fd];
			this[_fd] = void 0;
			fs$1.closeSync(fd);
			this.emit("close");
		}
	}
};
var WriteStream = class extends EE {
	readable = false;
	writable = true;
	[_errored] = false;
	[_writing] = false;
	[_ended] = false;
	[_queue] = [];
	[_needDrain] = false;
	[_path];
	[_mode];
	[_autoClose];
	[_fd];
	[_defaultFlag];
	[_flags];
	[_finished] = false;
	[_pos];
	constructor(path$6, opt) {
		opt = opt || {};
		super(opt);
		this[_path] = path$6;
		this[_fd] = typeof opt.fd === "number" ? opt.fd : void 0;
		this[_mode] = opt.mode === void 0 ? 438 : opt.mode;
		this[_pos] = typeof opt.start === "number" ? opt.start : void 0;
		this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
		const defaultFlag = this[_pos] !== void 0 ? "r+" : "w";
		this[_defaultFlag] = opt.flags === void 0;
		this[_flags] = opt.flags === void 0 ? defaultFlag : opt.flags;
		if (this[_fd] === void 0) this[_open]();
	}
	emit(ev, ...args) {
		if (ev === "error") {
			if (this[_errored]) return false;
			this[_errored] = true;
		}
		return super.emit(ev, ...args);
	}
	get fd() {
		return this[_fd];
	}
	get path() {
		return this[_path];
	}
	[_onerror](er) {
		this[_close]();
		this[_writing] = true;
		this.emit("error", er);
	}
	[_open]() {
		fs$1.open(this[_path], this[_flags], this[_mode], (er, fd) => this[_onopen](er, fd));
	}
	[_onopen](er, fd) {
		if (this[_defaultFlag] && this[_flags] === "r+" && er && er.code === "ENOENT") {
			this[_flags] = "w";
			this[_open]();
		} else if (er) this[_onerror](er);
		else {
			this[_fd] = fd;
			this.emit("open", fd);
			if (!this[_writing]) this[_flush]();
		}
	}
	end(buf, enc) {
		if (buf) this.write(buf, enc);
		this[_ended] = true;
		if (!this[_writing] && !this[_queue].length && typeof this[_fd] === "number") this[_onwrite](null, 0);
		return this;
	}
	write(buf, enc) {
		if (typeof buf === "string") buf = Buffer.from(buf, enc);
		if (this[_ended]) {
			this.emit("error", /* @__PURE__ */ new Error("write() after end()"));
			return false;
		}
		if (this[_fd] === void 0 || this[_writing] || this[_queue].length) {
			this[_queue].push(buf);
			this[_needDrain] = true;
			return false;
		}
		this[_writing] = true;
		this[_write](buf);
		return true;
	}
	[_write](buf) {
		fs$1.write(this[_fd], buf, 0, buf.length, this[_pos], (er, bw) => this[_onwrite](er, bw));
	}
	[_onwrite](er, bw) {
		if (er) this[_onerror](er);
		else {
			if (this[_pos] !== void 0 && typeof bw === "number") this[_pos] += bw;
			if (this[_queue].length) this[_flush]();
			else {
				this[_writing] = false;
				if (this[_ended] && !this[_finished]) {
					this[_finished] = true;
					this[_close]();
					this.emit("finish");
				} else if (this[_needDrain]) {
					this[_needDrain] = false;
					this.emit("drain");
				}
			}
		}
	}
	[_flush]() {
		if (this[_queue].length === 0) {
			if (this[_ended]) this[_onwrite](null, 0);
		} else if (this[_queue].length === 1) this[_write](this[_queue].pop());
		else {
			const iovec = this[_queue];
			this[_queue] = [];
			writev(this[_fd], iovec, this[_pos], (er, bw) => this[_onwrite](er, bw));
		}
	}
	[_close]() {
		if (this[_autoClose] && typeof this[_fd] === "number") {
			const fd = this[_fd];
			this[_fd] = void 0;
			fs$1.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
		}
	}
};
var WriteStreamSync = class extends WriteStream {
	[_open]() {
		let fd;
		if (this[_defaultFlag] && this[_flags] === "r+") try {
			fd = fs$1.openSync(this[_path], this[_flags], this[_mode]);
		} catch (er) {
			if (er?.code === "ENOENT") {
				this[_flags] = "w";
				return this[_open]();
			} else throw er;
		}
		else fd = fs$1.openSync(this[_path], this[_flags], this[_mode]);
		this[_onopen](null, fd);
	}
	[_close]() {
		if (this[_autoClose] && typeof this[_fd] === "number") {
			const fd = this[_fd];
			this[_fd] = void 0;
			fs$1.closeSync(fd);
			this.emit("close");
		}
	}
	[_write](buf) {
		let threw = true;
		try {
			this[_onwrite](null, fs$1.writeSync(this[_fd], buf, 0, buf.length, this[_pos]));
			threw = false;
		} finally {
			if (threw) try {
				this[_close]();
			} catch {}
		}
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/options.js
const argmap = new Map([
	["C", "cwd"],
	["f", "file"],
	["z", "gzip"],
	["P", "preservePaths"],
	["U", "unlink"],
	["strip-components", "strip"],
	["stripComponents", "strip"],
	["keep-newer", "newer"],
	["keepNewer", "newer"],
	["keep-newer-files", "newer"],
	["keepNewerFiles", "newer"],
	["k", "keep"],
	["keep-existing", "keep"],
	["keepExisting", "keep"],
	["m", "noMtime"],
	["no-mtime", "noMtime"],
	["p", "preserveOwner"],
	["L", "follow"],
	["h", "follow"],
	["onentry", "onReadEntry"]
]);
const isSyncFile = (o) => !!o.sync && !!o.file;
const isAsyncFile = (o) => !o.sync && !!o.file;
const isSyncNoFile = (o) => !!o.sync && !o.file;
const isAsyncNoFile = (o) => !o.sync && !o.file;
const dealiasKey = (k) => {
	const d = argmap.get(k);
	if (d) return d;
	return k;
};
const dealias = (opt = {}) => {
	if (!opt) return {};
	const result = {};
	for (const [key, v] of Object.entries(opt)) {
		const k = dealiasKey(key);
		result[k] = v;
	}
	if (result.chmod === void 0 && result.noChmod === false) result.chmod = true;
	delete result.noChmod;
	return result;
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/make-command.js
const makeCommand = (syncFile, asyncFile, syncNoFile, asyncNoFile, validate$1) => {
	return Object.assign((opt_ = [], entries, cb) => {
		if (Array.isArray(opt_)) {
			entries = opt_;
			opt_ = {};
		}
		if (typeof entries === "function") {
			cb = entries;
			entries = void 0;
		}
		if (!entries) entries = [];
		else entries = Array.from(entries);
		const opt = dealias(opt_);
		validate$1?.(opt, entries);
		if (isSyncFile(opt)) {
			if (typeof cb === "function") throw new TypeError("callback not supported for sync tar functions");
			return syncFile(opt, entries);
		} else if (isAsyncFile(opt)) {
			const p = asyncFile(opt, entries);
			const c = cb ? cb : void 0;
			return c ? p.then(() => c(), c) : p;
		} else if (isSyncNoFile(opt)) {
			if (typeof cb === "function") throw new TypeError("callback not supported for sync tar functions");
			return syncNoFile(opt, entries);
		} else if (isAsyncNoFile(opt)) {
			if (typeof cb === "function") throw new TypeError("callback only supported with file option");
			return asyncNoFile(opt, entries);
		} else throw new Error("impossible options??");
		/* c8 ignore stop */
	}, {
		syncFile,
		asyncFile,
		syncNoFile,
		asyncNoFile,
		validate: validate$1
	});
};

//#endregion
//#region node_modules/.pnpm/minizlib@3.0.2/node_modules/minizlib/dist/esm/constants.js
/* c8 ignore start */
const realZlibConstants = realZlib.constants || { ZLIB_VERNUM: 4736 };
/* c8 ignore stop */
const constants = Object.freeze(Object.assign(Object.create(null), {
	Z_NO_FLUSH: 0,
	Z_PARTIAL_FLUSH: 1,
	Z_SYNC_FLUSH: 2,
	Z_FULL_FLUSH: 3,
	Z_FINISH: 4,
	Z_BLOCK: 5,
	Z_OK: 0,
	Z_STREAM_END: 1,
	Z_NEED_DICT: 2,
	Z_ERRNO: -1,
	Z_STREAM_ERROR: -2,
	Z_DATA_ERROR: -3,
	Z_MEM_ERROR: -4,
	Z_BUF_ERROR: -5,
	Z_VERSION_ERROR: -6,
	Z_NO_COMPRESSION: 0,
	Z_BEST_SPEED: 1,
	Z_BEST_COMPRESSION: 9,
	Z_DEFAULT_COMPRESSION: -1,
	Z_FILTERED: 1,
	Z_HUFFMAN_ONLY: 2,
	Z_RLE: 3,
	Z_FIXED: 4,
	Z_DEFAULT_STRATEGY: 0,
	DEFLATE: 1,
	INFLATE: 2,
	GZIP: 3,
	GUNZIP: 4,
	DEFLATERAW: 5,
	INFLATERAW: 6,
	UNZIP: 7,
	BROTLI_DECODE: 8,
	BROTLI_ENCODE: 9,
	Z_MIN_WINDOWBITS: 8,
	Z_MAX_WINDOWBITS: 15,
	Z_DEFAULT_WINDOWBITS: 15,
	Z_MIN_CHUNK: 64,
	Z_MAX_CHUNK: Infinity,
	Z_DEFAULT_CHUNK: 16384,
	Z_MIN_MEMLEVEL: 1,
	Z_MAX_MEMLEVEL: 9,
	Z_DEFAULT_MEMLEVEL: 8,
	Z_MIN_LEVEL: -1,
	Z_MAX_LEVEL: 9,
	Z_DEFAULT_LEVEL: -1,
	BROTLI_OPERATION_PROCESS: 0,
	BROTLI_OPERATION_FLUSH: 1,
	BROTLI_OPERATION_FINISH: 2,
	BROTLI_OPERATION_EMIT_METADATA: 3,
	BROTLI_MODE_GENERIC: 0,
	BROTLI_MODE_TEXT: 1,
	BROTLI_MODE_FONT: 2,
	BROTLI_DEFAULT_MODE: 0,
	BROTLI_MIN_QUALITY: 0,
	BROTLI_MAX_QUALITY: 11,
	BROTLI_DEFAULT_QUALITY: 11,
	BROTLI_MIN_WINDOW_BITS: 10,
	BROTLI_MAX_WINDOW_BITS: 24,
	BROTLI_LARGE_MAX_WINDOW_BITS: 30,
	BROTLI_DEFAULT_WINDOW: 22,
	BROTLI_MIN_INPUT_BLOCK_BITS: 16,
	BROTLI_MAX_INPUT_BLOCK_BITS: 24,
	BROTLI_PARAM_MODE: 0,
	BROTLI_PARAM_QUALITY: 1,
	BROTLI_PARAM_LGWIN: 2,
	BROTLI_PARAM_LGBLOCK: 3,
	BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4,
	BROTLI_PARAM_SIZE_HINT: 5,
	BROTLI_PARAM_LARGE_WINDOW: 6,
	BROTLI_PARAM_NPOSTFIX: 7,
	BROTLI_PARAM_NDIRECT: 8,
	BROTLI_DECODER_RESULT_ERROR: 0,
	BROTLI_DECODER_RESULT_SUCCESS: 1,
	BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2,
	BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3,
	BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0,
	BROTLI_DECODER_PARAM_LARGE_WINDOW: 1,
	BROTLI_DECODER_NO_ERROR: 0,
	BROTLI_DECODER_SUCCESS: 1,
	BROTLI_DECODER_NEEDS_MORE_INPUT: 2,
	BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3,
	BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1,
	BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2,
	BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3,
	BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4,
	BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5,
	BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6,
	BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7,
	BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8,
	BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9,
	BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10,
	BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11,
	BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12,
	BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13,
	BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14,
	BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15,
	BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16,
	BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19,
	BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20,
	BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21,
	BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22,
	BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25,
	BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26,
	BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27,
	BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30,
	BROTLI_DECODER_ERROR_UNREACHABLE: -31
}, realZlibConstants));

//#endregion
//#region node_modules/.pnpm/minizlib@3.0.2/node_modules/minizlib/dist/esm/index.js
const OriginalBufferConcat = Buffer$1.concat;
const desc = Object.getOwnPropertyDescriptor(Buffer$1, "concat");
const noop$1 = (args) => args;
const passthroughBufferConcat = desc?.writable === true || desc?.set !== void 0 ? (makeNoOp) => {
	Buffer$1.concat = makeNoOp ? noop$1 : OriginalBufferConcat;
} : (_) => {};
const _superWrite = Symbol("_superWrite");
var ZlibError = class extends Error {
	code;
	errno;
	constructor(err) {
		super("zlib: " + err.message);
		this.code = err.code;
		this.errno = err.errno;
		/* c8 ignore next */
		if (!this.code) this.code = "ZLIB_ERROR";
		this.message = "zlib: " + err.message;
		Error.captureStackTrace(this, this.constructor);
	}
	get name() {
		return "ZlibError";
	}
};
const _flushFlag = Symbol("flushFlag");
var ZlibBase = class extends Minipass {
	#sawError = false;
	#ended = false;
	#flushFlag;
	#finishFlushFlag;
	#fullFlushFlag;
	#handle;
	#onError;
	get sawError() {
		return this.#sawError;
	}
	get handle() {
		return this.#handle;
	}
	/* c8 ignore start */
	get flushFlag() {
		return this.#flushFlag;
	}
	/* c8 ignore stop */
	constructor(opts, mode) {
		if (!opts || typeof opts !== "object") throw new TypeError("invalid options for ZlibBase constructor");
		super(opts);
		/* c8 ignore start */
		this.#flushFlag = opts.flush ?? 0;
		this.#finishFlushFlag = opts.finishFlush ?? 0;
		this.#fullFlushFlag = opts.fullFlushFlag ?? 0;
		/* c8 ignore stop */
		try {
			this.#handle = new realZlib$1[mode](opts);
		} catch (er) {
			throw new ZlibError(er);
		}
		this.#onError = (err) => {
			if (this.#sawError) return;
			this.#sawError = true;
			this.close();
			this.emit("error", err);
		};
		this.#handle?.on("error", (er) => this.#onError(new ZlibError(er)));
		this.once("end", () => this.close);
	}
	close() {
		if (this.#handle) {
			this.#handle.close();
			this.#handle = void 0;
			this.emit("close");
		}
	}
	reset() {
		if (!this.#sawError) {
			assert(this.#handle, "zlib binding closed");
			return this.#handle.reset?.();
		}
	}
	flush(flushFlag) {
		if (this.ended) return;
		if (typeof flushFlag !== "number") flushFlag = this.#fullFlushFlag;
		this.write(Object.assign(Buffer$1.alloc(0), { [_flushFlag]: flushFlag }));
	}
	end(chunk, encoding, cb) {
		/* c8 ignore start */
		if (typeof chunk === "function") {
			cb = chunk;
			encoding = void 0;
			chunk = void 0;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = void 0;
		}
		/* c8 ignore stop */
		if (chunk) if (encoding) this.write(chunk, encoding);
		else this.write(chunk);
		this.flush(this.#finishFlushFlag);
		this.#ended = true;
		return super.end(cb);
	}
	get ended() {
		return this.#ended;
	}
	[_superWrite](data) {
		return super.write(data);
	}
	write(chunk, encoding, cb) {
		if (typeof encoding === "function") cb = encoding, encoding = "utf8";
		if (typeof chunk === "string") chunk = Buffer$1.from(chunk, encoding);
		if (this.#sawError) return;
		assert(this.#handle, "zlib binding closed");
		const nativeHandle = this.#handle._handle;
		const originalNativeClose = nativeHandle.close;
		nativeHandle.close = () => {};
		const originalClose = this.#handle.close;
		this.#handle.close = () => {};
		passthroughBufferConcat(true);
		let result = void 0;
		try {
			const flushFlag = typeof chunk[_flushFlag] === "number" ? chunk[_flushFlag] : this.#flushFlag;
			result = this.#handle._processChunk(chunk, flushFlag);
			passthroughBufferConcat(false);
		} catch (err) {
			passthroughBufferConcat(false);
			this.#onError(new ZlibError(err));
		} finally {
			if (this.#handle) {
				this.#handle._handle = nativeHandle;
				nativeHandle.close = originalNativeClose;
				this.#handle.close = originalClose;
				this.#handle.removeAllListeners("error");
			}
		}
		if (this.#handle) this.#handle.on("error", (er) => this.#onError(new ZlibError(er)));
		let writeReturn;
		if (result) if (Array.isArray(result) && result.length > 0) {
			const r = result[0];
			writeReturn = this[_superWrite](Buffer$1.from(r));
			for (let i = 1; i < result.length; i++) writeReturn = this[_superWrite](result[i]);
		} else writeReturn = this[_superWrite](Buffer$1.from(result));
		if (cb) cb();
		return writeReturn;
	}
};
var Zlib = class extends ZlibBase {
	#level;
	#strategy;
	constructor(opts, mode) {
		opts = opts || {};
		opts.flush = opts.flush || constants.Z_NO_FLUSH;
		opts.finishFlush = opts.finishFlush || constants.Z_FINISH;
		opts.fullFlushFlag = constants.Z_FULL_FLUSH;
		super(opts, mode);
		this.#level = opts.level;
		this.#strategy = opts.strategy;
	}
	params(level, strategy) {
		if (this.sawError) return;
		if (!this.handle) throw new Error("cannot switch params when binding is closed");
		/* c8 ignore start */
		if (!this.handle.params) throw new Error("not supported in this implementation");
		/* c8 ignore stop */
		if (this.#level !== level || this.#strategy !== strategy) {
			this.flush(constants.Z_SYNC_FLUSH);
			assert(this.handle, "zlib binding closed");
			const origFlush = this.handle.flush;
			this.handle.flush = (flushFlag, cb) => {
				/* c8 ignore start */
				if (typeof flushFlag === "function") {
					cb = flushFlag;
					flushFlag = this.flushFlag;
				}
				/* c8 ignore stop */
				this.flush(flushFlag);
				cb?.();
			};
			try {
				this.handle.params(level, strategy);
			} finally {
				this.handle.flush = origFlush;
			}
			/* c8 ignore start */
			if (this.handle) {
				this.#level = level;
				this.#strategy = strategy;
			}
		}
	}
};
var Gzip = class extends Zlib {
	#portable;
	constructor(opts) {
		super(opts, "Gzip");
		this.#portable = opts && !!opts.portable;
	}
	[_superWrite](data) {
		if (!this.#portable) return super[_superWrite](data);
		this.#portable = false;
		data[9] = 255;
		return super[_superWrite](data);
	}
};
var Unzip = class extends Zlib {
	constructor(opts) {
		super(opts, "Unzip");
	}
};
var Brotli = class extends ZlibBase {
	constructor(opts, mode) {
		opts = opts || {};
		opts.flush = opts.flush || constants.BROTLI_OPERATION_PROCESS;
		opts.finishFlush = opts.finishFlush || constants.BROTLI_OPERATION_FINISH;
		opts.fullFlushFlag = constants.BROTLI_OPERATION_FLUSH;
		super(opts, mode);
	}
};
var BrotliDecompress = class extends Brotli {
	constructor(opts) {
		super(opts, "BrotliDecompress");
	}
};

//#endregion
//#region node_modules/.pnpm/yallist@5.0.0/node_modules/yallist/dist/esm/index.js
var Yallist = class Yallist {
	tail;
	head;
	length = 0;
	static create(list$1 = []) {
		return new Yallist(list$1);
	}
	constructor(list$1 = []) {
		for (const item of list$1) this.push(item);
	}
	*[Symbol.iterator]() {
		for (let walker = this.head; walker; walker = walker.next) yield walker.value;
	}
	removeNode(node) {
		if (node.list !== this) throw new Error("removing node which does not belong to this list");
		const next = node.next;
		const prev = node.prev;
		if (next) next.prev = prev;
		if (prev) prev.next = next;
		if (node === this.head) this.head = next;
		if (node === this.tail) this.tail = prev;
		this.length--;
		node.next = void 0;
		node.prev = void 0;
		node.list = void 0;
		return next;
	}
	unshiftNode(node) {
		if (node === this.head) return;
		if (node.list) node.list.removeNode(node);
		const head = this.head;
		node.list = this;
		node.next = head;
		if (head) head.prev = node;
		this.head = node;
		if (!this.tail) this.tail = node;
		this.length++;
	}
	pushNode(node) {
		if (node === this.tail) return;
		if (node.list) node.list.removeNode(node);
		const tail = this.tail;
		node.list = this;
		node.prev = tail;
		if (tail) tail.next = node;
		this.tail = node;
		if (!this.head) this.head = node;
		this.length++;
	}
	push(...args) {
		for (let i = 0, l = args.length; i < l; i++) push(this, args[i]);
		return this.length;
	}
	unshift(...args) {
		for (var i = 0, l = args.length; i < l; i++) unshift(this, args[i]);
		return this.length;
	}
	pop() {
		if (!this.tail) return;
		const res = this.tail.value;
		const t$2 = this.tail;
		this.tail = this.tail.prev;
		if (this.tail) this.tail.next = void 0;
		else this.head = void 0;
		t$2.list = void 0;
		this.length--;
		return res;
	}
	shift() {
		if (!this.head) return;
		const res = this.head.value;
		const h = this.head;
		this.head = this.head.next;
		if (this.head) this.head.prev = void 0;
		else this.tail = void 0;
		h.list = void 0;
		this.length--;
		return res;
	}
	forEach(fn, thisp) {
		thisp = thisp || this;
		for (let walker = this.head, i = 0; !!walker; i++) {
			fn.call(thisp, walker.value, i, this);
			walker = walker.next;
		}
	}
	forEachReverse(fn, thisp) {
		thisp = thisp || this;
		for (let walker = this.tail, i = this.length - 1; !!walker; i--) {
			fn.call(thisp, walker.value, i, this);
			walker = walker.prev;
		}
	}
	get(n) {
		let i = 0;
		let walker = this.head;
		for (; !!walker && i < n; i++) walker = walker.next;
		if (i === n && !!walker) return walker.value;
	}
	getReverse(n) {
		let i = 0;
		let walker = this.tail;
		for (; !!walker && i < n; i++) walker = walker.prev;
		if (i === n && !!walker) return walker.value;
	}
	map(fn, thisp) {
		thisp = thisp || this;
		const res = new Yallist();
		for (let walker = this.head; !!walker;) {
			res.push(fn.call(thisp, walker.value, this));
			walker = walker.next;
		}
		return res;
	}
	mapReverse(fn, thisp) {
		thisp = thisp || this;
		var res = new Yallist();
		for (let walker = this.tail; !!walker;) {
			res.push(fn.call(thisp, walker.value, this));
			walker = walker.prev;
		}
		return res;
	}
	reduce(fn, initial) {
		let acc;
		let walker = this.head;
		if (arguments.length > 1) acc = initial;
		else if (this.head) {
			walker = this.head.next;
			acc = this.head.value;
		} else throw new TypeError("Reduce of empty list with no initial value");
		for (var i = 0; !!walker; i++) {
			acc = fn(acc, walker.value, i);
			walker = walker.next;
		}
		return acc;
	}
	reduceReverse(fn, initial) {
		let acc;
		let walker = this.tail;
		if (arguments.length > 1) acc = initial;
		else if (this.tail) {
			walker = this.tail.prev;
			acc = this.tail.value;
		} else throw new TypeError("Reduce of empty list with no initial value");
		for (let i = this.length - 1; !!walker; i--) {
			acc = fn(acc, walker.value, i);
			walker = walker.prev;
		}
		return acc;
	}
	toArray() {
		const arr = new Array(this.length);
		for (let i = 0, walker = this.head; !!walker; i++) {
			arr[i] = walker.value;
			walker = walker.next;
		}
		return arr;
	}
	toArrayReverse() {
		const arr = new Array(this.length);
		for (let i = 0, walker = this.tail; !!walker; i++) {
			arr[i] = walker.value;
			walker = walker.prev;
		}
		return arr;
	}
	slice(from = 0, to = this.length) {
		if (to < 0) to += this.length;
		if (from < 0) from += this.length;
		const ret = new Yallist();
		if (to < from || to < 0) return ret;
		if (from < 0) from = 0;
		if (to > this.length) to = this.length;
		let walker = this.head;
		let i = 0;
		for (i = 0; !!walker && i < from; i++) walker = walker.next;
		for (; !!walker && i < to; i++, walker = walker.next) ret.push(walker.value);
		return ret;
	}
	sliceReverse(from = 0, to = this.length) {
		if (to < 0) to += this.length;
		if (from < 0) from += this.length;
		const ret = new Yallist();
		if (to < from || to < 0) return ret;
		if (from < 0) from = 0;
		if (to > this.length) to = this.length;
		let i = this.length;
		let walker = this.tail;
		for (; !!walker && i > to; i--) walker = walker.prev;
		for (; !!walker && i > from; i--, walker = walker.prev) ret.push(walker.value);
		return ret;
	}
	splice(start, deleteCount = 0, ...nodes) {
		if (start > this.length) start = this.length - 1;
		if (start < 0) start = this.length + start;
		let walker = this.head;
		for (let i = 0; !!walker && i < start; i++) walker = walker.next;
		const ret = [];
		for (let i = 0; !!walker && i < deleteCount; i++) {
			ret.push(walker.value);
			walker = this.removeNode(walker);
		}
		if (!walker) walker = this.tail;
		else if (walker !== this.tail) walker = walker.prev;
		for (const v of nodes) walker = insertAfter(this, walker, v);
		return ret;
	}
	reverse() {
		const head = this.head;
		const tail = this.tail;
		for (let walker = head; !!walker; walker = walker.prev) {
			const p = walker.prev;
			walker.prev = walker.next;
			walker.next = p;
		}
		this.head = tail;
		this.tail = head;
		return this;
	}
};
function insertAfter(self, node, value) {
	const prev = node;
	const next = node ? node.next : self.head;
	const inserted = new Node(value, prev, next, self);
	if (inserted.next === void 0) self.tail = inserted;
	if (inserted.prev === void 0) self.head = inserted;
	self.length++;
	return inserted;
}
function push(self, item) {
	self.tail = new Node(item, self.tail, void 0, self);
	if (!self.head) self.head = self.tail;
	self.length++;
}
function unshift(self, item) {
	self.head = new Node(item, void 0, self.head, self);
	if (!self.tail) self.tail = self.head;
	self.length++;
}
var Node = class {
	list;
	next;
	prev;
	value;
	constructor(value, prev, next, list$1) {
		this.list = list$1;
		this.value = value;
		if (prev) {
			prev.next = this;
			this.prev = prev;
		} else this.prev = void 0;
		if (next) {
			next.prev = this;
			this.next = next;
		} else this.next = void 0;
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/large-numbers.js
const encode = (num, buf) => {
	if (!Number.isSafeInteger(num)) throw Error("cannot encode number outside of javascript safe integer range");
	else if (num < 0) encodeNegative(num, buf);
	else encodePositive(num, buf);
	return buf;
};
const encodePositive = (num, buf) => {
	buf[0] = 128;
	for (var i = buf.length; i > 1; i--) {
		buf[i - 1] = num & 255;
		num = Math.floor(num / 256);
	}
};
const encodeNegative = (num, buf) => {
	buf[0] = 255;
	var flipped = false;
	num = num * -1;
	for (var i = buf.length; i > 1; i--) {
		var byte = num & 255;
		num = Math.floor(num / 256);
		if (flipped) buf[i - 1] = onesComp(byte);
		else if (byte === 0) buf[i - 1] = 0;
		else {
			flipped = true;
			buf[i - 1] = twosComp(byte);
		}
	}
};
const parse$1 = (buf) => {
	const pre = buf[0];
	const value = pre === 128 ? pos(buf.subarray(1, buf.length)) : pre === 255 ? twos(buf) : null;
	if (value === null) throw Error("invalid base256 encoding");
	if (!Number.isSafeInteger(value)) throw Error("parsed number outside of javascript safe integer range");
	return value;
};
const twos = (buf) => {
	var len = buf.length;
	var sum = 0;
	var flipped = false;
	for (var i = len - 1; i > -1; i--) {
		var byte = Number(buf[i]);
		var f;
		if (flipped) f = onesComp(byte);
		else if (byte === 0) f = byte;
		else {
			flipped = true;
			f = twosComp(byte);
		}
		if (f !== 0) sum -= f * Math.pow(256, len - i - 1);
	}
	return sum;
};
const pos = (buf) => {
	var len = buf.length;
	var sum = 0;
	for (var i = len - 1; i > -1; i--) {
		var byte = Number(buf[i]);
		if (byte !== 0) sum += byte * Math.pow(256, len - i - 1);
	}
	return sum;
};
const onesComp = (byte) => (255 ^ byte) & 255;
const twosComp = (byte) => (255 ^ byte) + 1 & 255;

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/types.js
const isCode = (c) => name.has(c);
const name = new Map([
	["0", "File"],
	["", "OldFile"],
	["1", "Link"],
	["2", "SymbolicLink"],
	["3", "CharacterDevice"],
	["4", "BlockDevice"],
	["5", "Directory"],
	["6", "FIFO"],
	["7", "ContiguousFile"],
	["g", "GlobalExtendedHeader"],
	["x", "ExtendedHeader"],
	["A", "SolarisACL"],
	["D", "GNUDumpDir"],
	["I", "Inode"],
	["K", "NextFileHasLongLinkpath"],
	["L", "NextFileHasLongPath"],
	["M", "ContinuationFile"],
	["N", "OldGnuLongPath"],
	["S", "SparseFile"],
	["V", "TapeVolumeHeader"],
	["X", "OldExtendedHeader"]
]);
const code = new Map(Array.from(name).map((kv) => [kv[1], kv[0]]));

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/header.js
var Header = class {
	cksumValid = false;
	needPax = false;
	nullBlock = false;
	block;
	path;
	mode;
	uid;
	gid;
	size;
	cksum;
	#type = "Unsupported";
	linkpath;
	uname;
	gname;
	devmaj = 0;
	devmin = 0;
	atime;
	ctime;
	mtime;
	charset;
	comment;
	constructor(data, off = 0, ex, gex) {
		if (Buffer.isBuffer(data)) this.decode(data, off || 0, ex, gex);
		else if (data) this.#slurp(data);
	}
	decode(buf, off, ex, gex) {
		if (!off) off = 0;
		if (!buf || !(buf.length >= off + 512)) throw new Error("need 512 bytes for header");
		this.path = decString(buf, off, 100);
		this.mode = decNumber(buf, off + 100, 8);
		this.uid = decNumber(buf, off + 108, 8);
		this.gid = decNumber(buf, off + 116, 8);
		this.size = decNumber(buf, off + 124, 12);
		this.mtime = decDate(buf, off + 136, 12);
		this.cksum = decNumber(buf, off + 148, 12);
		if (gex) this.#slurp(gex, true);
		if (ex) this.#slurp(ex);
		const t$2 = decString(buf, off + 156, 1);
		if (isCode(t$2)) this.#type = t$2 || "0";
		if (this.#type === "0" && this.path.slice(-1) === "/") this.#type = "5";
		if (this.#type === "5") this.size = 0;
		this.linkpath = decString(buf, off + 157, 100);
		if (buf.subarray(off + 257, off + 265).toString() === "ustar\x0000") {
			this.uname = decString(buf, off + 265, 32);
			this.gname = decString(buf, off + 297, 32);
			/* c8 ignore start */
			this.devmaj = decNumber(buf, off + 329, 8) ?? 0;
			this.devmin = decNumber(buf, off + 337, 8) ?? 0;
			/* c8 ignore stop */
			if (buf[off + 475] !== 0) this.path = decString(buf, off + 345, 155) + "/" + this.path;
			else {
				const prefix = decString(buf, off + 345, 130);
				if (prefix) this.path = prefix + "/" + this.path;
				this.atime = decDate(buf, off + 476, 12);
				this.ctime = decDate(buf, off + 488, 12);
			}
		}
		let sum = 256;
		for (let i = off; i < off + 148; i++) sum += buf[i];
		for (let i = off + 156; i < off + 512; i++) sum += buf[i];
		this.cksumValid = sum === this.cksum;
		if (this.cksum === void 0 && sum === 256) this.nullBlock = true;
	}
	#slurp(ex, gex = false) {
		Object.assign(this, Object.fromEntries(Object.entries(ex).filter(([k, v]) => {
			return !(v === null || v === void 0 || k === "path" && gex || k === "linkpath" && gex || k === "global");
		})));
	}
	encode(buf, off = 0) {
		if (!buf) buf = this.block = Buffer.alloc(512);
		if (this.#type === "Unsupported") this.#type = "0";
		if (!(buf.length >= off + 512)) throw new Error("need 512 bytes for header");
		const prefixSize = this.ctime || this.atime ? 130 : 155;
		const split = splitPrefix(this.path || "", prefixSize);
		const path$6 = split[0];
		const prefix = split[1];
		this.needPax = !!split[2];
		this.needPax = encString(buf, off, 100, path$6) || this.needPax;
		this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax;
		this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax;
		this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax;
		this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax;
		this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax;
		buf[off + 156] = this.#type.charCodeAt(0);
		this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax;
		buf.write("ustar\x0000", off + 257, 8);
		this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax;
		this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax;
		this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax;
		this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax;
		this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax;
		if (buf[off + 475] !== 0) this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax;
		else {
			this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax;
			this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax;
			this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax;
		}
		let sum = 256;
		for (let i = off; i < off + 148; i++) sum += buf[i];
		for (let i = off + 156; i < off + 512; i++) sum += buf[i];
		this.cksum = sum;
		encNumber(buf, off + 148, 8, this.cksum);
		this.cksumValid = true;
		return this.needPax;
	}
	get type() {
		return this.#type === "Unsupported" ? this.#type : name.get(this.#type);
	}
	get typeKey() {
		return this.#type;
	}
	set type(type) {
		const c = String(code.get(type));
		if (isCode(c) || c === "Unsupported") this.#type = c;
		else if (isCode(type)) this.#type = type;
		else throw new TypeError("invalid entry type: " + type);
	}
};
const splitPrefix = (p, prefixSize) => {
	const pathSize = 100;
	let pp = p;
	let prefix = "";
	let ret = void 0;
	const root = posix.parse(p).root || ".";
	if (Buffer.byteLength(pp) < pathSize) ret = [
		pp,
		prefix,
		false
	];
	else {
		prefix = posix.dirname(pp);
		pp = posix.basename(pp);
		do
			if (Buffer.byteLength(pp) <= pathSize && Buffer.byteLength(prefix) <= prefixSize) ret = [
				pp,
				prefix,
				false
			];
			else if (Buffer.byteLength(pp) > pathSize && Buffer.byteLength(prefix) <= prefixSize) ret = [
				pp.slice(0, pathSize - 1),
				prefix,
				true
			];
			else {
				pp = posix.join(posix.basename(prefix), pp);
				prefix = posix.dirname(prefix);
			}
		while (prefix !== root && ret === void 0);
		if (!ret) ret = [
			p.slice(0, pathSize - 1),
			"",
			true
		];
	}
	return ret;
};
const decString = (buf, off, size) => buf.subarray(off, off + size).toString("utf8").replace(/\0.*/, "");
const decDate = (buf, off, size) => numToDate(decNumber(buf, off, size));
const numToDate = (num) => num === void 0 ? void 0 : /* @__PURE__ */ new Date(num * 1e3);
const decNumber = (buf, off, size) => Number(buf[off]) & 128 ? parse$1(buf.subarray(off, off + size)) : decSmallNumber(buf, off, size);
const nanUndef = (value) => isNaN(value) ? void 0 : value;
const decSmallNumber = (buf, off, size) => nanUndef(parseInt(buf.subarray(off, off + size).toString("utf8").replace(/\0.*$/, "").trim(), 8));
const MAXNUM = {
	12: 8589934591,
	8: 2097151
};
const encNumber = (buf, off, size, num) => num === void 0 ? false : num > MAXNUM[size] || num < 0 ? (encode(num, buf.subarray(off, off + size)), true) : (encSmallNumber(buf, off, size, num), false);
const encSmallNumber = (buf, off, size, num) => buf.write(octalString(num, size), off, size, "ascii");
const octalString = (num, size) => padOctal(Math.floor(num).toString(8), size);
const padOctal = (str, size) => (str.length === size - 1 ? str : new Array(size - str.length - 1).join("0") + str + " ") + "\0";
const encDate = (buf, off, size, date) => date === void 0 ? false : encNumber(buf, off, size, date.getTime() / 1e3);
const NULLS = new Array(156).join("\0");
const encString = (buf, off, size, str) => str === void 0 ? false : (buf.write(str + NULLS, off, size, "utf8"), str.length !== Buffer.byteLength(str) || str.length > size);

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/pax.js
var Pax = class Pax {
	atime;
	mtime;
	ctime;
	charset;
	comment;
	gid;
	uid;
	gname;
	uname;
	linkpath;
	dev;
	ino;
	nlink;
	path;
	size;
	mode;
	global;
	constructor(obj, global = false) {
		this.atime = obj.atime;
		this.charset = obj.charset;
		this.comment = obj.comment;
		this.ctime = obj.ctime;
		this.dev = obj.dev;
		this.gid = obj.gid;
		this.global = global;
		this.gname = obj.gname;
		this.ino = obj.ino;
		this.linkpath = obj.linkpath;
		this.mtime = obj.mtime;
		this.nlink = obj.nlink;
		this.path = obj.path;
		this.size = obj.size;
		this.uid = obj.uid;
		this.uname = obj.uname;
	}
	encode() {
		const body = this.encodeBody();
		if (body === "") return Buffer.allocUnsafe(0);
		const bodyLen = Buffer.byteLength(body);
		const bufLen = 512 * Math.ceil(1 + bodyLen / 512);
		const buf = Buffer.allocUnsafe(bufLen);
		for (let i = 0; i < 512; i++) buf[i] = 0;
		new Header({
			path: ("PaxHeader/" + basename(this.path ?? "")).slice(0, 99),
			mode: this.mode || 420,
			uid: this.uid,
			gid: this.gid,
			size: bodyLen,
			mtime: this.mtime,
			type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader",
			linkpath: "",
			uname: this.uname || "",
			gname: this.gname || "",
			devmaj: 0,
			devmin: 0,
			atime: this.atime,
			ctime: this.ctime
		}).encode(buf);
		buf.write(body, 512, bodyLen, "utf8");
		for (let i = bodyLen + 512; i < buf.length; i++) buf[i] = 0;
		return buf;
	}
	encodeBody() {
		return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
	}
	encodeField(field) {
		if (this[field] === void 0) return "";
		const r = this[field];
		const v = r instanceof Date ? r.getTime() / 1e3 : r;
		const s = " " + (field === "dev" || field === "ino" || field === "nlink" ? "SCHILY." : "") + field + "=" + v + "\n";
		const byteLen = Buffer.byteLength(s);
		let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1;
		if (byteLen + digits >= Math.pow(10, digits)) digits += 1;
		return digits + byteLen + s;
	}
	static parse(str, ex, g = false) {
		return new Pax(merge(parseKV(str), ex), g);
	}
};
const merge = (a, b) => b ? Object.assign({}, b, a) : a;
const parseKV = (str) => str.replace(/\n$/, "").split("\n").reduce(parseKVLine, Object.create(null));
const parseKVLine = (set, line) => {
	const n = parseInt(line, 10);
	if (n !== Buffer.byteLength(line) + 1) return set;
	line = line.slice((n + " ").length);
	const kv = line.split("=");
	const r = kv.shift();
	if (!r) return set;
	const k = r.replace(/^SCHILY\.(dev|ino|nlink)/, "$1");
	const v = kv.join("=");
	set[k] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(k) ? /* @__PURE__ */ new Date(Number(v) * 1e3) : /^[0-9]+$/.test(v) ? +v : v;
	return set;
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/normalize-windows-path.js
const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
const normalizeWindowsPath = platform !== "win32" ? (p) => p : (p) => p && p.replace(/\\/g, "/");

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/read-entry.js
var ReadEntry = class extends Minipass {
	extended;
	globalExtended;
	header;
	startBlockSize;
	blockRemain;
	remain;
	type;
	meta = false;
	ignore = false;
	path;
	mode;
	uid;
	gid;
	uname;
	gname;
	size = 0;
	mtime;
	atime;
	ctime;
	linkpath;
	dev;
	ino;
	nlink;
	invalid = false;
	absolute;
	unsupported = false;
	constructor(header, ex, gex) {
		super({});
		this.pause();
		this.extended = ex;
		this.globalExtended = gex;
		this.header = header;
		/* c8 ignore start */
		this.remain = header.size ?? 0;
		/* c8 ignore stop */
		this.startBlockSize = 512 * Math.ceil(this.remain / 512);
		this.blockRemain = this.startBlockSize;
		this.type = header.type;
		switch (this.type) {
			case "File":
			case "OldFile":
			case "Link":
			case "SymbolicLink":
			case "CharacterDevice":
			case "BlockDevice":
			case "Directory":
			case "FIFO":
			case "ContiguousFile":
			case "GNUDumpDir": break;
			case "NextFileHasLongLinkpath":
			case "NextFileHasLongPath":
			case "OldGnuLongPath":
			case "GlobalExtendedHeader":
			case "ExtendedHeader":
			case "OldExtendedHeader":
				this.meta = true;
				break;
			default: this.ignore = true;
		}
		/* c8 ignore start */
		if (!header.path) throw new Error("no path provided for tar.ReadEntry");
		/* c8 ignore stop */
		this.path = normalizeWindowsPath(header.path);
		this.mode = header.mode;
		if (this.mode) this.mode = this.mode & 4095;
		this.uid = header.uid;
		this.gid = header.gid;
		this.uname = header.uname;
		this.gname = header.gname;
		this.size = this.remain;
		this.mtime = header.mtime;
		this.atime = header.atime;
		this.ctime = header.ctime;
		/* c8 ignore start */
		this.linkpath = header.linkpath ? normalizeWindowsPath(header.linkpath) : void 0;
		/* c8 ignore stop */
		this.uname = header.uname;
		this.gname = header.gname;
		if (ex) this.#slurp(ex);
		if (gex) this.#slurp(gex, true);
	}
	write(data) {
		const writeLen = data.length;
		if (writeLen > this.blockRemain) throw new Error("writing more to entry than is appropriate");
		const r = this.remain;
		const br = this.blockRemain;
		this.remain = Math.max(0, r - writeLen);
		this.blockRemain = Math.max(0, br - writeLen);
		if (this.ignore) return true;
		if (r >= writeLen) return super.write(data);
		return super.write(data.subarray(0, r));
	}
	#slurp(ex, gex = false) {
		if (ex.path) ex.path = normalizeWindowsPath(ex.path);
		if (ex.linkpath) ex.linkpath = normalizeWindowsPath(ex.linkpath);
		Object.assign(this, Object.fromEntries(Object.entries(ex).filter(([k, v]) => {
			return !(v === null || v === void 0 || k === "path" && gex);
		})));
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/warn-method.js
const warnMethod = (self, code$1, message, data = {}) => {
	if (self.file) data.file = self.file;
	if (self.cwd) data.cwd = self.cwd;
	data.code = message instanceof Error && message.code || code$1;
	data.tarCode = code$1;
	if (!self.strict && data.recoverable !== false) {
		if (message instanceof Error) {
			data = Object.assign(message, data);
			message = message.message;
		}
		self.emit("warn", code$1, message, data);
	} else if (message instanceof Error) self.emit("error", Object.assign(message, data));
	else self.emit("error", Object.assign(/* @__PURE__ */ new Error(`${code$1}: ${message}`), data));
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/parse.js
const maxMetaEntrySize = 1024 * 1024;
const gzipHeader = Buffer.from([31, 139]);
const STATE = Symbol("state");
const WRITEENTRY = Symbol("writeEntry");
const READENTRY = Symbol("readEntry");
const NEXTENTRY = Symbol("nextEntry");
const PROCESSENTRY = Symbol("processEntry");
const EX = Symbol("extendedHeader");
const GEX = Symbol("globalExtendedHeader");
const META = Symbol("meta");
const EMITMETA = Symbol("emitMeta");
const BUFFER = Symbol("buffer");
const QUEUE = Symbol("queue");
const ENDED = Symbol("ended");
const EMITTEDEND = Symbol("emittedEnd");
const EMIT = Symbol("emit");
const UNZIP = Symbol("unzip");
const CONSUMECHUNK = Symbol("consumeChunk");
const CONSUMECHUNKSUB = Symbol("consumeChunkSub");
const CONSUMEBODY = Symbol("consumeBody");
const CONSUMEMETA = Symbol("consumeMeta");
const CONSUMEHEADER = Symbol("consumeHeader");
const CONSUMING = Symbol("consuming");
const BUFFERCONCAT = Symbol("bufferConcat");
const MAYBEEND = Symbol("maybeEnd");
const WRITING = Symbol("writing");
const ABORTED = Symbol("aborted");
const DONE = Symbol("onDone");
const SAW_VALID_ENTRY = Symbol("sawValidEntry");
const SAW_NULL_BLOCK = Symbol("sawNullBlock");
const SAW_EOF = Symbol("sawEOF");
const CLOSESTREAM = Symbol("closeStream");
const noop = () => true;
var Parser = class extends EventEmitter {
	file;
	strict;
	maxMetaEntrySize;
	filter;
	brotli;
	writable = true;
	readable = false;
	[QUEUE] = new Yallist();
	[BUFFER];
	[READENTRY];
	[WRITEENTRY];
	[STATE] = "begin";
	[META] = "";
	[EX];
	[GEX];
	[ENDED] = false;
	[UNZIP];
	[ABORTED] = false;
	[SAW_VALID_ENTRY];
	[SAW_NULL_BLOCK] = false;
	[SAW_EOF] = false;
	[WRITING] = false;
	[CONSUMING] = false;
	[EMITTEDEND] = false;
	constructor(opt = {}) {
		super();
		this.file = opt.file || "";
		this.on(DONE, () => {
			if (this[STATE] === "begin" || this[SAW_VALID_ENTRY] === false) this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
		});
		if (opt.ondone) this.on(DONE, opt.ondone);
		else this.on(DONE, () => {
			this.emit("prefinish");
			this.emit("finish");
			this.emit("end");
		});
		this.strict = !!opt.strict;
		this.maxMetaEntrySize = opt.maxMetaEntrySize || maxMetaEntrySize;
		this.filter = typeof opt.filter === "function" ? opt.filter : noop;
		const isTBR = opt.file && (opt.file.endsWith(".tar.br") || opt.file.endsWith(".tbr"));
		this.brotli = !opt.gzip && opt.brotli !== void 0 ? opt.brotli : isTBR ? void 0 : false;
		this.on("end", () => this[CLOSESTREAM]());
		if (typeof opt.onwarn === "function") this.on("warn", opt.onwarn);
		if (typeof opt.onReadEntry === "function") this.on("entry", opt.onReadEntry);
	}
	warn(code$1, message, data = {}) {
		warnMethod(this, code$1, message, data);
	}
	[CONSUMEHEADER](chunk, position) {
		if (this[SAW_VALID_ENTRY] === void 0) this[SAW_VALID_ENTRY] = false;
		let header;
		try {
			header = new Header(chunk, position, this[EX], this[GEX]);
		} catch (er) {
			return this.warn("TAR_ENTRY_INVALID", er);
		}
		if (header.nullBlock) if (this[SAW_NULL_BLOCK]) {
			this[SAW_EOF] = true;
			if (this[STATE] === "begin") this[STATE] = "header";
			this[EMIT]("eof");
		} else {
			this[SAW_NULL_BLOCK] = true;
			this[EMIT]("nullBlock");
		}
		else {
			this[SAW_NULL_BLOCK] = false;
			if (!header.cksumValid) this.warn("TAR_ENTRY_INVALID", "checksum failure", { header });
			else if (!header.path) this.warn("TAR_ENTRY_INVALID", "path is required", { header });
			else {
				const type = header.type;
				if (/^(Symbolic)?Link$/.test(type) && !header.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath required", { header });
				else if (!/^(Symbolic)?Link$/.test(type) && !/^(Global)?ExtendedHeader$/.test(type) && header.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header });
				else {
					const entry = this[WRITEENTRY] = new ReadEntry(header, this[EX], this[GEX]);
					if (!this[SAW_VALID_ENTRY]) if (entry.remain) {
						const onend = () => {
							if (!entry.invalid) this[SAW_VALID_ENTRY] = true;
						};
						entry.on("end", onend);
					} else this[SAW_VALID_ENTRY] = true;
					if (entry.meta) {
						if (entry.size > this.maxMetaEntrySize) {
							entry.ignore = true;
							this[EMIT]("ignoredEntry", entry);
							this[STATE] = "ignore";
							entry.resume();
						} else if (entry.size > 0) {
							this[META] = "";
							entry.on("data", (c) => this[META] += c);
							this[STATE] = "meta";
						}
					} else {
						this[EX] = void 0;
						entry.ignore = entry.ignore || !this.filter(entry.path, entry);
						if (entry.ignore) {
							this[EMIT]("ignoredEntry", entry);
							this[STATE] = entry.remain ? "ignore" : "header";
							entry.resume();
						} else {
							if (entry.remain) this[STATE] = "body";
							else {
								this[STATE] = "header";
								entry.end();
							}
							if (!this[READENTRY]) {
								this[QUEUE].push(entry);
								this[NEXTENTRY]();
							} else this[QUEUE].push(entry);
						}
					}
				}
			}
		}
	}
	[CLOSESTREAM]() {
		queueMicrotask(() => this.emit("close"));
	}
	[PROCESSENTRY](entry) {
		let go = true;
		if (!entry) {
			this[READENTRY] = void 0;
			go = false;
		} else if (Array.isArray(entry)) {
			const [ev, ...args] = entry;
			this.emit(ev, ...args);
		} else {
			this[READENTRY] = entry;
			this.emit("entry", entry);
			if (!entry.emittedEnd) {
				entry.on("end", () => this[NEXTENTRY]());
				go = false;
			}
		}
		return go;
	}
	[NEXTENTRY]() {
		do		;
while (this[PROCESSENTRY](this[QUEUE].shift()));
		if (!this[QUEUE].length) {
			const re$2 = this[READENTRY];
			if (!re$2 || re$2.flowing || re$2.size === re$2.remain) {
				if (!this[WRITING]) this.emit("drain");
			} else re$2.once("drain", () => this.emit("drain"));
		}
	}
	[CONSUMEBODY](chunk, position) {
		const entry = this[WRITEENTRY];
		/* c8 ignore start */
		if (!entry) throw new Error("attempt to consume body without entry??");
		const br = entry.blockRemain ?? 0;
		/* c8 ignore stop */
		const c = br >= chunk.length && position === 0 ? chunk : chunk.subarray(position, position + br);
		entry.write(c);
		if (!entry.blockRemain) {
			this[STATE] = "header";
			this[WRITEENTRY] = void 0;
			entry.end();
		}
		return c.length;
	}
	[CONSUMEMETA](chunk, position) {
		const entry = this[WRITEENTRY];
		const ret = this[CONSUMEBODY](chunk, position);
		if (!this[WRITEENTRY] && entry) this[EMITMETA](entry);
		return ret;
	}
	[EMIT](ev, data, extra) {
		if (!this[QUEUE].length && !this[READENTRY]) this.emit(ev, data, extra);
		else this[QUEUE].push([
			ev,
			data,
			extra
		]);
	}
	[EMITMETA](entry) {
		this[EMIT]("meta", this[META]);
		switch (entry.type) {
			case "ExtendedHeader":
			case "OldExtendedHeader":
				this[EX] = Pax.parse(this[META], this[EX], false);
				break;
			case "GlobalExtendedHeader":
				this[GEX] = Pax.parse(this[META], this[GEX], true);
				break;
			case "NextFileHasLongPath":
			case "OldGnuLongPath": {
				const ex = this[EX] ?? Object.create(null);
				this[EX] = ex;
				ex.path = this[META].replace(/\0.*/, "");
				break;
			}
			case "NextFileHasLongLinkpath": {
				const ex = this[EX] || Object.create(null);
				this[EX] = ex;
				ex.linkpath = this[META].replace(/\0.*/, "");
				break;
			}
			default: throw new Error("unknown meta: " + entry.type);
		}
	}
	abort(error$1) {
		this[ABORTED] = true;
		this.emit("abort", error$1);
		this.warn("TAR_ABORT", error$1, { recoverable: false });
	}
	write(chunk, encoding, cb) {
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = void 0;
		}
		if (typeof chunk === "string") chunk = Buffer.from(
			chunk,
			/* c8 ignore next */
			typeof encoding === "string" ? encoding : "utf8"
		);
		if (this[ABORTED]) {
			/* c8 ignore next */
			cb?.();
			return false;
		}
		if ((this[UNZIP] === void 0 || this.brotli === void 0 && this[UNZIP] === false) && chunk) {
			if (this[BUFFER]) {
				chunk = Buffer.concat([this[BUFFER], chunk]);
				this[BUFFER] = void 0;
			}
			if (chunk.length < gzipHeader.length) {
				this[BUFFER] = chunk;
				/* c8 ignore next */
				cb?.();
				return true;
			}
			for (let i = 0; this[UNZIP] === void 0 && i < gzipHeader.length; i++) if (chunk[i] !== gzipHeader[i]) this[UNZIP] = false;
			const maybeBrotli = this.brotli === void 0;
			if (this[UNZIP] === false && maybeBrotli) if (chunk.length < 512) if (this[ENDED]) this.brotli = true;
			else {
				this[BUFFER] = chunk;
				/* c8 ignore next */
				cb?.();
				return true;
			}
			else try {
				new Header(chunk.subarray(0, 512));
				this.brotli = false;
			} catch (_) {
				this.brotli = true;
			}
			if (this[UNZIP] === void 0 || this[UNZIP] === false && this.brotli) {
				const ended = this[ENDED];
				this[ENDED] = false;
				this[UNZIP] = this[UNZIP] === void 0 ? new Unzip({}) : new BrotliDecompress({});
				this[UNZIP].on("data", (chunk$1) => this[CONSUMECHUNK](chunk$1));
				this[UNZIP].on("error", (er) => this.abort(er));
				this[UNZIP].on("end", () => {
					this[ENDED] = true;
					this[CONSUMECHUNK]();
				});
				this[WRITING] = true;
				const ret$1 = !!this[UNZIP][ended ? "end" : "write"](chunk);
				this[WRITING] = false;
				cb?.();
				return ret$1;
			}
		}
		this[WRITING] = true;
		if (this[UNZIP]) this[UNZIP].write(chunk);
		else this[CONSUMECHUNK](chunk);
		this[WRITING] = false;
		const ret = this[QUEUE].length ? false : this[READENTRY] ? this[READENTRY].flowing : true;
		if (!ret && !this[QUEUE].length) this[READENTRY]?.once("drain", () => this.emit("drain"));
		/* c8 ignore next */
		cb?.();
		return ret;
	}
	[BUFFERCONCAT](c) {
		if (c && !this[ABORTED]) this[BUFFER] = this[BUFFER] ? Buffer.concat([this[BUFFER], c]) : c;
	}
	[MAYBEEND]() {
		if (this[ENDED] && !this[EMITTEDEND] && !this[ABORTED] && !this[CONSUMING]) {
			this[EMITTEDEND] = true;
			const entry = this[WRITEENTRY];
			if (entry && entry.blockRemain) {
				const have = this[BUFFER] ? this[BUFFER].length : 0;
				this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${entry.blockRemain} more bytes, only ${have} available)`, { entry });
				if (this[BUFFER]) entry.write(this[BUFFER]);
				entry.end();
			}
			this[EMIT](DONE);
		}
	}
	[CONSUMECHUNK](chunk) {
		if (this[CONSUMING] && chunk) this[BUFFERCONCAT](chunk);
		else if (!chunk && !this[BUFFER]) this[MAYBEEND]();
		else if (chunk) {
			this[CONSUMING] = true;
			if (this[BUFFER]) {
				this[BUFFERCONCAT](chunk);
				const c = this[BUFFER];
				this[BUFFER] = void 0;
				this[CONSUMECHUNKSUB](c);
			} else this[CONSUMECHUNKSUB](chunk);
			while (this[BUFFER] && this[BUFFER]?.length >= 512 && !this[ABORTED] && !this[SAW_EOF]) {
				const c = this[BUFFER];
				this[BUFFER] = void 0;
				this[CONSUMECHUNKSUB](c);
			}
			this[CONSUMING] = false;
		}
		if (!this[BUFFER] || this[ENDED]) this[MAYBEEND]();
	}
	[CONSUMECHUNKSUB](chunk) {
		let position = 0;
		const length = chunk.length;
		while (position + 512 <= length && !this[ABORTED] && !this[SAW_EOF]) switch (this[STATE]) {
			case "begin":
			case "header":
				this[CONSUMEHEADER](chunk, position);
				position += 512;
				break;
			case "ignore":
			case "body":
				position += this[CONSUMEBODY](chunk, position);
				break;
			case "meta":
				position += this[CONSUMEMETA](chunk, position);
				break;
			default: throw new Error("invalid state: " + this[STATE]);
		}
		if (position < length) if (this[BUFFER]) this[BUFFER] = Buffer.concat([chunk.subarray(position), this[BUFFER]]);
		else this[BUFFER] = chunk.subarray(position);
	}
	end(chunk, encoding, cb) {
		if (typeof chunk === "function") {
			cb = chunk;
			encoding = void 0;
			chunk = void 0;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = void 0;
		}
		if (typeof chunk === "string") chunk = Buffer.from(chunk, encoding);
		if (cb) this.once("finish", cb);
		if (!this[ABORTED]) if (this[UNZIP]) {
			/* c8 ignore start */
			if (chunk) this[UNZIP].write(chunk);
			/* c8 ignore stop */
			this[UNZIP].end();
		} else {
			this[ENDED] = true;
			if (this.brotli === void 0) chunk = chunk || Buffer.alloc(0);
			if (chunk) this.write(chunk);
			this[MAYBEEND]();
		}
		return this;
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/strip-trailing-slashes.js
const stripTrailingSlashes = (str) => {
	let i = str.length - 1;
	let slashesStart = -1;
	while (i > -1 && str.charAt(i) === "/") {
		slashesStart = i;
		i--;
	}
	return slashesStart === -1 ? str : str.slice(0, slashesStart);
};

//#endregion
//#region node_modules/.pnpm/tar@7.4.3/node_modules/tar/dist/esm/list.js
const onReadEntryFunction = (opt) => {
	const onReadEntry = opt.onReadEntry;
	opt.onReadEntry = onReadEntry ? (e) => {
		onReadEntry(e);
		e.resume();
	} : (e) => e.resume();
};
const filesFilter = (opt, files) => {
	const map = new Map(files.map((f) => [stripTrailingSlashes(f), true]));
	const filter = opt.filter;
	const mapHas = (file, r = "") => {
		const root = r || parse(file).root || ".";
		let ret;
		if (file === root) ret = false;
		else {
			const m = map.get(file);
			if (m !== void 0) ret = m;
			else ret = mapHas(dirname(file), root);
		}
		map.set(file, ret);
		return ret;
	};
	opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripTrailingSlashes(file)) : (file) => mapHas(stripTrailingSlashes(file));
};
const listFileSync = (opt) => {
	const p = new Parser(opt);
	const file = opt.file;
	let fd;
	try {
		const stat = fs$2.statSync(file);
		const readSize = opt.maxReadSize || 16 * 1024 * 1024;
		if (stat.size < readSize) p.end(fs$2.readFileSync(file));
		else {
			let pos$1 = 0;
			const buf = Buffer.allocUnsafe(readSize);
			fd = fs$2.openSync(file, "r");
			while (pos$1 < stat.size) {
				const bytesRead = fs$2.readSync(fd, buf, 0, readSize, pos$1);
				pos$1 += bytesRead;
				p.write(buf.subarray(0, bytesRead));
			}
			p.end();
		}
	} finally {
		if (typeof fd === "number") try {
			fs$2.closeSync(fd);
		} catch (er) {}
	}
};
const listFile = (opt, _files) => {
	const parse$5 = new Parser(opt);
	const readSize = opt.maxReadSize || 16 * 1024 * 1024;
	const file = opt.file;
	return new Promise((resolve, reject) => {
		parse$5.on("error", reject);
		parse$5.on("end", resolve);
		fs$2.stat(file, (er, stat) => {
			if (er) reject(er);
			else {
				const stream = new ReadStream(file, {
					readSize,
					size: stat.size
				});
				stream.on("error", reject);
				stream.pipe(parse$5);
			}
		});
	});
};
const list = makeCommand(listFileSync, listFile, (opt) => new Parser(opt), (opt) => new Parser(opt), (opt, files) => {
	if (files?.length) filesFilter(opt, files);
	if (!opt.noResume) onReadEntryFunction(opt);
});

//#endregion
//#region node_modules/.pnpm/validate-npm-package-name@6.0.2/node_modules/validate-npm-package-name/lib/index.js
var require_lib$1 = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/validate-npm-package-name@6.0.2/node_modules/validate-npm-package-name/lib/index.js": ((exports, module) => {
	const { builtinModules: builtins } = __require("module");
	var scopedPackagePattern = /* @__PURE__ */ new RegExp("^(?:@([^/]+?)[/])?([^/]+?)$");
	var exclusionList = ["node_modules", "favicon.ico"];
	function validate(name$1) {
		var warnings = [];
		var errors = [];
		if (name$1 === null) {
			errors.push("name cannot be null");
			return done(warnings, errors);
		}
		if (name$1 === void 0) {
			errors.push("name cannot be undefined");
			return done(warnings, errors);
		}
		if (typeof name$1 !== "string") {
			errors.push("name must be a string");
			return done(warnings, errors);
		}
		if (!name$1.length) errors.push("name length must be greater than zero");
		if (name$1.startsWith(".")) errors.push("name cannot start with a period");
		if (name$1.match(/^_/)) errors.push("name cannot start with an underscore");
		if (name$1.trim() !== name$1) errors.push("name cannot contain leading or trailing spaces");
		exclusionList.forEach(function(excludedName) {
			if (name$1.toLowerCase() === excludedName) errors.push(excludedName + " is not a valid package name");
		});
		if (builtins.includes(name$1.toLowerCase())) warnings.push(name$1 + " is a core module name");
		if (name$1.length > 214) warnings.push("name can no longer contain more than 214 characters");
		if (name$1.toLowerCase() !== name$1) warnings.push("name can no longer contain capital letters");
		if (/[~'!()*]/.test(name$1.split("/").slice(-1)[0])) warnings.push("name can no longer contain special characters (\"~'!()*\")");
		if (encodeURIComponent(name$1) !== name$1) {
			var nameMatch = name$1.match(scopedPackagePattern);
			if (nameMatch) {
				var user = nameMatch[1];
				var pkg = nameMatch[2];
				if (pkg.startsWith(".")) errors.push("name cannot start with a period");
				if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) return done(warnings, errors);
			}
			errors.push("name can only contain URL-friendly characters");
		}
		return done(warnings, errors);
	}
	var done = function(warnings, errors) {
		var result = {
			validForNewPackages: errors.length === 0 && warnings.length === 0,
			validForOldPackages: errors.length === 0,
			warnings,
			errors
		};
		if (!result.warnings.length) delete result.warnings;
		if (!result.errors.length) delete result.errors;
		return result;
	};
	module.exports = validate;
}) });

//#endregion
//#region src/read-manifest.ts
var import_valid = /* @__PURE__ */ __toESM(require_valid(), 1);
var import_lib = /* @__PURE__ */ __toESM(require_lib$1(), 1);
const SCOPE_RE = /^(@.+)\/.+$/u;
const MANIFEST_BASENAME = "package.json";
const TARBALL_EXTNAME = ".tgz";
const isManifest = (file) => {
	return typeof file === "string" && path.basename(file) === MANIFEST_BASENAME;
};
const isDirectory$1 = (file) => {
	return typeof file === "string" && path.extname(file) === "";
};
const isTarball = (file) => {
	return typeof file === "string" && path.extname(file) === TARBALL_EXTNAME;
};
const normalizeVersion = (version) => {
	return (0, import_valid.default)(version) ?? void 0;
};
const validateName = (name$1) => {
	return (0, import_lib.default)(name$1).validForNewPackages;
};
const readPackageJson = async (...pathSegments) => {
	const file = path.resolve(...pathSegments);
	try {
		return await fs.readFile(file, "utf8");
	} catch (error$1) {
		throw new PackageJsonReadError(file, error$1);
	}
};
const readTarballPackageJson = async (file) => {
	const data = [];
	const onReadEntry = (entry) => {
		if (entry.path === "package/package.json") entry.on("data", (chunk) => data.push(chunk));
	};
	try {
		await list({
			file,
			onReadEntry
		});
		if (data.length === 0) throw new Error("package.json not found inside archive");
	} catch (error$1) {
		throw new PackageTarballReadError(file, error$1);
	}
	return Buffer.concat(data).toString();
};
/**
* Reads the package manifest (package.json) and returns its parsed contents.
*
* @param packagePath The path to the package being published.
* @returns The parsed package metadata.
*/
async function readManifest(packagePath) {
	let packageSpec;
	let manifestContents;
	if (!packagePath) {
		packageSpec = "";
		manifestContents = await readPackageJson(MANIFEST_BASENAME);
	} else if (isManifest(packagePath)) {
		packageSpec = path.resolve(path.dirname(packagePath));
		manifestContents = await readPackageJson(packagePath);
	} else if (isDirectory$1(packagePath)) {
		packageSpec = path.resolve(packagePath);
		manifestContents = await readPackageJson(packagePath, MANIFEST_BASENAME);
	} else if (isTarball(packagePath)) {
		packageSpec = path.resolve(packagePath);
		manifestContents = await readTarballPackageJson(packageSpec);
	} else throw new InvalidPackageError(packagePath);
	let manifestJson;
	let name$1;
	let version;
	let publishConfig;
	try {
		manifestJson = JSON.parse(manifestContents);
		name$1 = manifestJson.name;
		version = normalizeVersion(manifestJson.version);
		publishConfig = manifestJson.publishConfig ?? {};
	} catch (error$1) {
		throw new PackageJsonParseError(packageSpec, error$1);
	}
	if (!validateName(name$1)) throw new InvalidPackageNameError(name$1);
	if (typeof version !== "string") throw new InvalidPackageVersionError(manifestJson.version);
	if (typeof publishConfig !== "object" || Array.isArray(publishConfig) || !publishConfig) throw new InvalidPackagePublishConfigError(publishConfig);
	return {
		packageSpec,
		name: name$1,
		version,
		publishConfig,
		scope: SCOPE_RE.exec(name$1)?.[1]
	};
}

//#endregion
//#region src/npm-publish.ts
/**
* Publishes a package to NPM, if its version has changed.
*
* @param options Publish options.
* @returns Release metadata.
*/
async function npmPublish(options) {
	const manifest = await readManifest(options.package);
	const normalizedOptions = normalizeOptions(manifest, options);
	const publishResult = await useNpmEnvironment(manifest, normalizedOptions, compareAndPublish);
	normalizedOptions.logger?.info?.(formatPublishResult(manifest, normalizedOptions, publishResult));
	return {
		id: publishResult.id,
		type: publishResult.type,
		oldVersion: publishResult.oldVersion,
		name: manifest.name,
		version: manifest.version,
		registry: normalizedOptions.registry,
		tag: normalizedOptions.tag.value,
		access: normalizedOptions.access.value,
		strategy: normalizedOptions.strategy.value,
		dryRun: normalizedOptions.dryRun.value
	};
}

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/utils.js
var require_utils = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/utils.js": ((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	* Sanitizes an input into a string so it can be passed into issueCommand safely
	* @param input input to sanitize into a string
	*/
	function toCommandValue(input) {
		if (input === null || input === void 0) return "";
		else if (typeof input === "string" || input instanceof String) return input;
		return JSON.stringify(input);
	}
	exports.toCommandValue = toCommandValue;
	/**
	*
	* @param annotationProperties
	* @returns The command properties to send with the actual annotation command
	* See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
	*/
	function toCommandProperties(annotationProperties) {
		if (!Object.keys(annotationProperties).length) return {};
		return {
			title: annotationProperties.title,
			file: annotationProperties.file,
			line: annotationProperties.startLine,
			endLine: annotationProperties.endLine,
			col: annotationProperties.startColumn,
			endColumn: annotationProperties.endColumn
		};
	}
	exports.toCommandProperties = toCommandProperties;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/command.js
var require_command = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/command.js": ((exports) => {
	var __createBinding$9 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc$1 = Object.getOwnPropertyDescriptor(m, k);
		if (!desc$1 || ("get" in desc$1 ? !m.__esModule : desc$1.writable || desc$1.configurable)) desc$1 = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc$1);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$9 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$9 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$9(result, mod, k);
		}
		__setModuleDefault$9(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const os$4 = __importStar$9(__require("os"));
	const utils_1$2 = require_utils();
	/**
	* Commands
	*
	* Command Format:
	*   ::name key=value,key=value::message
	*
	* Examples:
	*   ::warning::This is the message
	*   ::set-env name=MY_VAR::some value
	*/
	function issueCommand(command, properties, message) {
		const cmd = new Command(command, properties, message);
		process.stdout.write(cmd.toString() + os$4.EOL);
	}
	exports.issueCommand = issueCommand;
	function issue(name$1, message = "") {
		issueCommand(name$1, {}, message);
	}
	exports.issue = issue;
	const CMD_STRING = "::";
	var Command = class {
		constructor(command, properties, message) {
			if (!command) command = "missing.command";
			this.command = command;
			this.properties = properties;
			this.message = message;
		}
		toString() {
			let cmdStr = CMD_STRING + this.command;
			if (this.properties && Object.keys(this.properties).length > 0) {
				cmdStr += " ";
				let first = true;
				for (const key in this.properties) if (this.properties.hasOwnProperty(key)) {
					const val = this.properties[key];
					if (val) {
						if (first) first = false;
						else cmdStr += ",";
						cmdStr += `${key}=${escapeProperty(val)}`;
					}
				}
			}
			cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
			return cmdStr;
		}
	};
	function escapeData(s) {
		return (0, utils_1$2.toCommandValue)(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
	}
	function escapeProperty(s) {
		return (0, utils_1$2.toCommandValue)(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
	}
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/file-command.js
var require_file_command = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/file-command.js": ((exports) => {
	var __createBinding$8 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc$1 = Object.getOwnPropertyDescriptor(m, k);
		if (!desc$1 || ("get" in desc$1 ? !m.__esModule : desc$1.writable || desc$1.configurable)) desc$1 = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc$1);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$8 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$8 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$8(result, mod, k);
		}
		__setModuleDefault$8(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const crypto = __importStar$8(__require("crypto"));
	const fs$4 = __importStar$8(__require("fs"));
	const os$3 = __importStar$8(__require("os"));
	const utils_1$1 = require_utils();
	function issueFileCommand(command, message) {
		const filePath = process.env[`GITHUB_${command}`];
		if (!filePath) throw new Error(`Unable to find environment variable for file command ${command}`);
		if (!fs$4.existsSync(filePath)) throw new Error(`Missing file at path: ${filePath}`);
		fs$4.appendFileSync(filePath, `${(0, utils_1$1.toCommandValue)(message)}${os$3.EOL}`, { encoding: "utf8" });
	}
	exports.issueFileCommand = issueFileCommand;
	function prepareKeyValueMessage(key, value) {
		const delimiter = `ghadelimiter_${crypto.randomUUID()}`;
		const convertedValue = (0, utils_1$1.toCommandValue)(value);
		if (key.includes(delimiter)) throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
		if (convertedValue.includes(delimiter)) throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
		return `${key}<<${delimiter}${os$3.EOL}${convertedValue}${os$3.EOL}${delimiter}`;
	}
	exports.prepareKeyValueMessage = prepareKeyValueMessage;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/proxy.js
var require_proxy = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/proxy.js": ((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function getProxyUrl$1(reqUrl) {
		const usingSsl = reqUrl.protocol === "https:";
		if (checkBypass(reqUrl)) return;
		const proxyVar = (() => {
			if (usingSsl) return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
			else return process.env["http_proxy"] || process.env["HTTP_PROXY"];
		})();
		if (proxyVar) try {
			return new URL(proxyVar);
		} catch (_a$1) {
			if (!proxyVar.startsWith("http://") && !proxyVar.startsWith("https://")) return new URL(`http://${proxyVar}`);
		}
		else return;
	}
	exports.getProxyUrl = getProxyUrl$1;
	function checkBypass(reqUrl) {
		if (!reqUrl.hostname) return false;
		const reqHost = reqUrl.hostname;
		if (isLoopbackAddress(reqHost)) return true;
		const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
		if (!noProxy) return false;
		let reqPort;
		if (reqUrl.port) reqPort = Number(reqUrl.port);
		else if (reqUrl.protocol === "http:") reqPort = 80;
		else if (reqUrl.protocol === "https:") reqPort = 443;
		const upperReqHosts = [reqUrl.hostname.toUpperCase()];
		if (typeof reqPort === "number") upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
		for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) if (upperNoProxyItem === "*" || upperReqHosts.some((x) => x === upperNoProxyItem || x.endsWith(`.${upperNoProxyItem}`) || upperNoProxyItem.startsWith(".") && x.endsWith(`${upperNoProxyItem}`))) return true;
		return false;
	}
	exports.checkBypass = checkBypass;
	function isLoopbackAddress(host) {
		const hostLower = host.toLowerCase();
		return hostLower === "localhost" || hostLower.startsWith("127.") || hostLower.startsWith("[::1]") || hostLower.startsWith("[0:0:0:0:0:0:0:1]");
	}
}) });

//#endregion
//#region node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/lib/tunnel.js
var require_tunnel$1 = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/lib/tunnel.js": ((exports) => {
	__require("net");
	var tls = __require("tls");
	var http$1 = __require("http");
	var https$1 = __require("https");
	var events$1 = __require("events");
	__require("assert");
	var util = __require("util");
	exports.httpOverHttp = httpOverHttp;
	exports.httpsOverHttp = httpsOverHttp;
	exports.httpOverHttps = httpOverHttps;
	exports.httpsOverHttps = httpsOverHttps;
	function httpOverHttp(options) {
		var agent = new TunnelingAgent(options);
		agent.request = http$1.request;
		return agent;
	}
	function httpsOverHttp(options) {
		var agent = new TunnelingAgent(options);
		agent.request = http$1.request;
		agent.createSocket = createSecureSocket;
		agent.defaultPort = 443;
		return agent;
	}
	function httpOverHttps(options) {
		var agent = new TunnelingAgent(options);
		agent.request = https$1.request;
		return agent;
	}
	function httpsOverHttps(options) {
		var agent = new TunnelingAgent(options);
		agent.request = https$1.request;
		agent.createSocket = createSecureSocket;
		agent.defaultPort = 443;
		return agent;
	}
	function TunnelingAgent(options) {
		var self = this;
		self.options = options || {};
		self.proxyOptions = self.options.proxy || {};
		self.maxSockets = self.options.maxSockets || http$1.Agent.defaultMaxSockets;
		self.requests = [];
		self.sockets = [];
		self.on("free", function onFree(socket, host, port, localAddress) {
			var options$1 = toOptions(host, port, localAddress);
			for (var i = 0, len = self.requests.length; i < len; ++i) {
				var pending = self.requests[i];
				if (pending.host === options$1.host && pending.port === options$1.port) {
					self.requests.splice(i, 1);
					pending.request.onSocket(socket);
					return;
				}
			}
			socket.destroy();
			self.removeSocket(socket);
		});
	}
	util.inherits(TunnelingAgent, events$1.EventEmitter);
	TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
		var self = this;
		var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
		if (self.sockets.length >= this.maxSockets) {
			self.requests.push(options);
			return;
		}
		self.createSocket(options, function(socket) {
			socket.on("free", onFree);
			socket.on("close", onCloseOrRemove);
			socket.on("agentRemove", onCloseOrRemove);
			req.onSocket(socket);
			function onFree() {
				self.emit("free", socket, options);
			}
			function onCloseOrRemove(err) {
				self.removeSocket(socket);
				socket.removeListener("free", onFree);
				socket.removeListener("close", onCloseOrRemove);
				socket.removeListener("agentRemove", onCloseOrRemove);
			}
		});
	};
	TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
		var self = this;
		var placeholder = {};
		self.sockets.push(placeholder);
		var connectOptions = mergeOptions({}, self.proxyOptions, {
			method: "CONNECT",
			path: options.host + ":" + options.port,
			agent: false,
			headers: { host: options.host + ":" + options.port }
		});
		if (options.localAddress) connectOptions.localAddress = options.localAddress;
		if (connectOptions.proxyAuth) {
			connectOptions.headers = connectOptions.headers || {};
			connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
		}
		debug$1("making CONNECT request");
		var connectReq = self.request(connectOptions);
		connectReq.useChunkedEncodingByDefault = false;
		connectReq.once("response", onResponse);
		connectReq.once("upgrade", onUpgrade);
		connectReq.once("connect", onConnect);
		connectReq.once("error", onError);
		connectReq.end();
		function onResponse(res) {
			res.upgrade = true;
		}
		function onUpgrade(res, socket, head) {
			process.nextTick(function() {
				onConnect(res, socket, head);
			});
		}
		function onConnect(res, socket, head) {
			connectReq.removeAllListeners();
			socket.removeAllListeners();
			if (res.statusCode !== 200) {
				debug$1("tunneling socket could not be established, statusCode=%d", res.statusCode);
				socket.destroy();
				var error$1 = /* @__PURE__ */ new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
				error$1.code = "ECONNRESET";
				options.request.emit("error", error$1);
				self.removeSocket(placeholder);
				return;
			}
			if (head.length > 0) {
				debug$1("got illegal response body from proxy");
				socket.destroy();
				var error$1 = /* @__PURE__ */ new Error("got illegal response body from proxy");
				error$1.code = "ECONNRESET";
				options.request.emit("error", error$1);
				self.removeSocket(placeholder);
				return;
			}
			debug$1("tunneling connection has established");
			self.sockets[self.sockets.indexOf(placeholder)] = socket;
			return cb(socket);
		}
		function onError(cause) {
			connectReq.removeAllListeners();
			debug$1("tunneling socket could not be established, cause=%s\n", cause.message, cause.stack);
			var error$1 = /* @__PURE__ */ new Error("tunneling socket could not be established, cause=" + cause.message);
			error$1.code = "ECONNRESET";
			options.request.emit("error", error$1);
			self.removeSocket(placeholder);
		}
	};
	TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
		var pos$1 = this.sockets.indexOf(socket);
		if (pos$1 === -1) return;
		this.sockets.splice(pos$1, 1);
		var pending = this.requests.shift();
		if (pending) this.createSocket(pending, function(socket$1) {
			pending.request.onSocket(socket$1);
		});
	};
	function createSecureSocket(options, cb) {
		var self = this;
		TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
			var hostHeader = options.request.getHeader("host");
			var tlsOptions = mergeOptions({}, self.options, {
				socket,
				servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
			});
			var secureSocket = tls.connect(0, tlsOptions);
			self.sockets[self.sockets.indexOf(socket)] = secureSocket;
			cb(secureSocket);
		});
	}
	function toOptions(host, port, localAddress) {
		if (typeof host === "string") return {
			host,
			port,
			localAddress
		};
		return host;
	}
	function mergeOptions(target) {
		for (var i = 1, len = arguments.length; i < len; ++i) {
			var overrides = arguments[i];
			if (typeof overrides === "object") {
				var keys = Object.keys(overrides);
				for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
					var k = keys[j];
					if (overrides[k] !== void 0) target[k] = overrides[k];
				}
			}
		}
		return target;
	}
	var debug$1;
	if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) debug$1 = function() {
		var args = Array.prototype.slice.call(arguments);
		if (typeof args[0] === "string") args[0] = "TUNNEL: " + args[0];
		else args.unshift("TUNNEL:");
		console.error.apply(console, args);
	};
	else debug$1 = function() {};
	exports.debug = debug$1;
}) });

//#endregion
//#region node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/index.js
var require_tunnel = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/index.js": ((exports, module) => {
	module.exports = require_tunnel$1();
}) });

//#endregion
//#region node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/index.js
var require_lib = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/index.js": ((exports) => {
	var __createBinding$7 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$7 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$7 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding$7(result, mod, k);
		}
		__setModuleDefault$7(result, mod);
		return result;
	};
	var __awaiter$9 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const http = __importStar$7(__require("http"));
	const https = __importStar$7(__require("https"));
	const pm = __importStar$7(require_proxy());
	const tunnel = __importStar$7(require_tunnel());
	var HttpCodes;
	(function(HttpCodes$1) {
		HttpCodes$1[HttpCodes$1["OK"] = 200] = "OK";
		HttpCodes$1[HttpCodes$1["MultipleChoices"] = 300] = "MultipleChoices";
		HttpCodes$1[HttpCodes$1["MovedPermanently"] = 301] = "MovedPermanently";
		HttpCodes$1[HttpCodes$1["ResourceMoved"] = 302] = "ResourceMoved";
		HttpCodes$1[HttpCodes$1["SeeOther"] = 303] = "SeeOther";
		HttpCodes$1[HttpCodes$1["NotModified"] = 304] = "NotModified";
		HttpCodes$1[HttpCodes$1["UseProxy"] = 305] = "UseProxy";
		HttpCodes$1[HttpCodes$1["SwitchProxy"] = 306] = "SwitchProxy";
		HttpCodes$1[HttpCodes$1["TemporaryRedirect"] = 307] = "TemporaryRedirect";
		HttpCodes$1[HttpCodes$1["PermanentRedirect"] = 308] = "PermanentRedirect";
		HttpCodes$1[HttpCodes$1["BadRequest"] = 400] = "BadRequest";
		HttpCodes$1[HttpCodes$1["Unauthorized"] = 401] = "Unauthorized";
		HttpCodes$1[HttpCodes$1["PaymentRequired"] = 402] = "PaymentRequired";
		HttpCodes$1[HttpCodes$1["Forbidden"] = 403] = "Forbidden";
		HttpCodes$1[HttpCodes$1["NotFound"] = 404] = "NotFound";
		HttpCodes$1[HttpCodes$1["MethodNotAllowed"] = 405] = "MethodNotAllowed";
		HttpCodes$1[HttpCodes$1["NotAcceptable"] = 406] = "NotAcceptable";
		HttpCodes$1[HttpCodes$1["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
		HttpCodes$1[HttpCodes$1["RequestTimeout"] = 408] = "RequestTimeout";
		HttpCodes$1[HttpCodes$1["Conflict"] = 409] = "Conflict";
		HttpCodes$1[HttpCodes$1["Gone"] = 410] = "Gone";
		HttpCodes$1[HttpCodes$1["TooManyRequests"] = 429] = "TooManyRequests";
		HttpCodes$1[HttpCodes$1["InternalServerError"] = 500] = "InternalServerError";
		HttpCodes$1[HttpCodes$1["NotImplemented"] = 501] = "NotImplemented";
		HttpCodes$1[HttpCodes$1["BadGateway"] = 502] = "BadGateway";
		HttpCodes$1[HttpCodes$1["ServiceUnavailable"] = 503] = "ServiceUnavailable";
		HttpCodes$1[HttpCodes$1["GatewayTimeout"] = 504] = "GatewayTimeout";
	})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
	var Headers;
	(function(Headers$1) {
		Headers$1["Accept"] = "accept";
		Headers$1["ContentType"] = "content-type";
	})(Headers = exports.Headers || (exports.Headers = {}));
	var MediaTypes;
	(function(MediaTypes$1) {
		MediaTypes$1["ApplicationJson"] = "application/json";
	})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
	/**
	* Returns the proxy URL, depending upon the supplied url and proxy environment variables.
	* @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
	*/
	function getProxyUrl(serverUrl) {
		const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
		return proxyUrl ? proxyUrl.href : "";
	}
	exports.getProxyUrl = getProxyUrl;
	const HttpRedirectCodes = [
		HttpCodes.MovedPermanently,
		HttpCodes.ResourceMoved,
		HttpCodes.SeeOther,
		HttpCodes.TemporaryRedirect,
		HttpCodes.PermanentRedirect
	];
	const HttpResponseRetryCodes = [
		HttpCodes.BadGateway,
		HttpCodes.ServiceUnavailable,
		HttpCodes.GatewayTimeout
	];
	const RetryableHttpVerbs = [
		"OPTIONS",
		"GET",
		"DELETE",
		"HEAD"
	];
	const ExponentialBackoffCeiling = 10;
	const ExponentialBackoffTimeSlice = 5;
	var HttpClientError = class HttpClientError extends Error {
		constructor(message, statusCode) {
			super(message);
			this.name = "HttpClientError";
			this.statusCode = statusCode;
			Object.setPrototypeOf(this, HttpClientError.prototype);
		}
	};
	exports.HttpClientError = HttpClientError;
	var HttpClientResponse = class {
		constructor(message) {
			this.message = message;
		}
		readBody() {
			return __awaiter$9(this, void 0, void 0, function* () {
				return new Promise((resolve) => __awaiter$9(this, void 0, void 0, function* () {
					let output = Buffer.alloc(0);
					this.message.on("data", (chunk) => {
						output = Buffer.concat([output, chunk]);
					});
					this.message.on("end", () => {
						resolve(output.toString());
					});
				}));
			});
		}
		readBodyBuffer() {
			return __awaiter$9(this, void 0, void 0, function* () {
				return new Promise((resolve) => __awaiter$9(this, void 0, void 0, function* () {
					const chunks = [];
					this.message.on("data", (chunk) => {
						chunks.push(chunk);
					});
					this.message.on("end", () => {
						resolve(Buffer.concat(chunks));
					});
				}));
			});
		}
	};
	exports.HttpClientResponse = HttpClientResponse;
	function isHttps(requestUrl) {
		return new URL(requestUrl).protocol === "https:";
	}
	exports.isHttps = isHttps;
	var HttpClient = class {
		constructor(userAgent, handlers, requestOptions) {
			this._ignoreSslError = false;
			this._allowRedirects = true;
			this._allowRedirectDowngrade = false;
			this._maxRedirects = 50;
			this._allowRetries = false;
			this._maxRetries = 1;
			this._keepAlive = false;
			this._disposed = false;
			this.userAgent = userAgent;
			this.handlers = handlers || [];
			this.requestOptions = requestOptions;
			if (requestOptions) {
				if (requestOptions.ignoreSslError != null) this._ignoreSslError = requestOptions.ignoreSslError;
				this._socketTimeout = requestOptions.socketTimeout;
				if (requestOptions.allowRedirects != null) this._allowRedirects = requestOptions.allowRedirects;
				if (requestOptions.allowRedirectDowngrade != null) this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
				if (requestOptions.maxRedirects != null) this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
				if (requestOptions.keepAlive != null) this._keepAlive = requestOptions.keepAlive;
				if (requestOptions.allowRetries != null) this._allowRetries = requestOptions.allowRetries;
				if (requestOptions.maxRetries != null) this._maxRetries = requestOptions.maxRetries;
			}
		}
		options(requestUrl, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
			});
		}
		get(requestUrl, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("GET", requestUrl, null, additionalHeaders || {});
			});
		}
		del(requestUrl, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("DELETE", requestUrl, null, additionalHeaders || {});
			});
		}
		post(requestUrl, data, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("POST", requestUrl, data, additionalHeaders || {});
			});
		}
		patch(requestUrl, data, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("PATCH", requestUrl, data, additionalHeaders || {});
			});
		}
		put(requestUrl, data, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("PUT", requestUrl, data, additionalHeaders || {});
			});
		}
		head(requestUrl, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request("HEAD", requestUrl, null, additionalHeaders || {});
			});
		}
		sendStream(verb, requestUrl, stream, additionalHeaders) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return this.request(verb, requestUrl, stream, additionalHeaders);
			});
		}
		/**
		* Gets a typed object from an endpoint
		* Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
		*/
		getJson(requestUrl, additionalHeaders = {}) {
			return __awaiter$9(this, void 0, void 0, function* () {
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				const res = yield this.get(requestUrl, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		postJson(requestUrl, obj, additionalHeaders = {}) {
			return __awaiter$9(this, void 0, void 0, function* () {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
				const res = yield this.post(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		putJson(requestUrl, obj, additionalHeaders = {}) {
			return __awaiter$9(this, void 0, void 0, function* () {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
				const res = yield this.put(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		patchJson(requestUrl, obj, additionalHeaders = {}) {
			return __awaiter$9(this, void 0, void 0, function* () {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
				const res = yield this.patch(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		/**
		* Makes a raw http request.
		* All other methods such as get, post, patch, and request ultimately call this.
		* Prefer get, del, post and patch
		*/
		request(verb, requestUrl, data, headers) {
			return __awaiter$9(this, void 0, void 0, function* () {
				if (this._disposed) throw new Error("Client has already been disposed.");
				const parsedUrl = new URL(requestUrl);
				let info$1 = this._prepareRequest(verb, parsedUrl, headers);
				const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
				let numTries = 0;
				let response;
				do {
					response = yield this.requestRaw(info$1, data);
					if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
						let authenticationHandler;
						for (const handler of this.handlers) if (handler.canHandleAuthentication(response)) {
							authenticationHandler = handler;
							break;
						}
						if (authenticationHandler) return authenticationHandler.handleAuthentication(this, info$1, data);
						else return response;
					}
					let redirectsRemaining = this._maxRedirects;
					while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
						const redirectUrl = response.message.headers["location"];
						if (!redirectUrl) break;
						const parsedRedirectUrl = new URL(redirectUrl);
						if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
						yield response.readBody();
						if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
							for (const header in headers) if (header.toLowerCase() === "authorization") delete headers[header];
						}
						info$1 = this._prepareRequest(verb, parsedRedirectUrl, headers);
						response = yield this.requestRaw(info$1, data);
						redirectsRemaining--;
					}
					if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) return response;
					numTries += 1;
					if (numTries < maxTries) {
						yield response.readBody();
						yield this._performExponentialBackoff(numTries);
					}
				} while (numTries < maxTries);
				return response;
			});
		}
		/**
		* Needs to be called if keepAlive is set to true in request options.
		*/
		dispose() {
			if (this._agent) this._agent.destroy();
			this._disposed = true;
		}
		/**
		* Raw request.
		* @param info
		* @param data
		*/
		requestRaw(info$1, data) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return new Promise((resolve, reject) => {
					function callbackForResult(err, res) {
						if (err) reject(err);
						else if (!res) reject(/* @__PURE__ */ new Error("Unknown error"));
						else resolve(res);
					}
					this.requestRawWithCallback(info$1, data, callbackForResult);
				});
			});
		}
		/**
		* Raw request with callback.
		* @param info
		* @param data
		* @param onResult
		*/
		requestRawWithCallback(info$1, data, onResult) {
			if (typeof data === "string") {
				if (!info$1.options.headers) info$1.options.headers = {};
				info$1.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
			}
			let callbackCalled = false;
			function handleResult(err, res) {
				if (!callbackCalled) {
					callbackCalled = true;
					onResult(err, res);
				}
			}
			const req = info$1.httpModule.request(info$1.options, (msg) => {
				const res = new HttpClientResponse(msg);
				handleResult(void 0, res);
			});
			let socket;
			req.on("socket", (sock) => {
				socket = sock;
			});
			req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
				if (socket) socket.end();
				handleResult(/* @__PURE__ */ new Error(`Request timeout: ${info$1.options.path}`));
			});
			req.on("error", function(err) {
				handleResult(err);
			});
			if (data && typeof data === "string") req.write(data, "utf8");
			if (data && typeof data !== "string") {
				data.on("close", function() {
					req.end();
				});
				data.pipe(req);
			} else req.end();
		}
		/**
		* Gets an http agent. This function is useful when you need an http agent that handles
		* routing through a proxy server - depending upon the url and proxy environment variables.
		* @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
		*/
		getAgent(serverUrl) {
			const parsedUrl = new URL(serverUrl);
			return this._getAgent(parsedUrl);
		}
		_prepareRequest(method, requestUrl, headers) {
			const info$1 = {};
			info$1.parsedUrl = requestUrl;
			const usingSsl = info$1.parsedUrl.protocol === "https:";
			info$1.httpModule = usingSsl ? https : http;
			const defaultPort = usingSsl ? 443 : 80;
			info$1.options = {};
			info$1.options.host = info$1.parsedUrl.hostname;
			info$1.options.port = info$1.parsedUrl.port ? parseInt(info$1.parsedUrl.port) : defaultPort;
			info$1.options.path = (info$1.parsedUrl.pathname || "") + (info$1.parsedUrl.search || "");
			info$1.options.method = method;
			info$1.options.headers = this._mergeHeaders(headers);
			if (this.userAgent != null) info$1.options.headers["user-agent"] = this.userAgent;
			info$1.options.agent = this._getAgent(info$1.parsedUrl);
			if (this.handlers) for (const handler of this.handlers) handler.prepareRequest(info$1.options);
			return info$1;
		}
		_mergeHeaders(headers) {
			if (this.requestOptions && this.requestOptions.headers) return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
			return lowercaseKeys(headers || {});
		}
		_getExistingOrDefaultHeader(additionalHeaders, header, _default) {
			let clientHeader;
			if (this.requestOptions && this.requestOptions.headers) clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
			return additionalHeaders[header] || clientHeader || _default;
		}
		_getAgent(parsedUrl) {
			let agent;
			const proxyUrl = pm.getProxyUrl(parsedUrl);
			const useProxy = proxyUrl && proxyUrl.hostname;
			if (this._keepAlive && useProxy) agent = this._proxyAgent;
			if (this._keepAlive && !useProxy) agent = this._agent;
			if (agent) return agent;
			const usingSsl = parsedUrl.protocol === "https:";
			let maxSockets = 100;
			if (this.requestOptions) maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
			if (proxyUrl && proxyUrl.hostname) {
				const agentOptions = {
					maxSockets,
					keepAlive: this._keepAlive,
					proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && { proxyAuth: `${proxyUrl.username}:${proxyUrl.password}` }), {
						host: proxyUrl.hostname,
						port: proxyUrl.port
					})
				};
				let tunnelAgent;
				const overHttps = proxyUrl.protocol === "https:";
				if (usingSsl) tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
				else tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
				agent = tunnelAgent(agentOptions);
				this._proxyAgent = agent;
			}
			if (this._keepAlive && !agent) {
				const options = {
					keepAlive: this._keepAlive,
					maxSockets
				};
				agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
				this._agent = agent;
			}
			if (!agent) agent = usingSsl ? https.globalAgent : http.globalAgent;
			if (usingSsl && this._ignoreSslError) agent.options = Object.assign(agent.options || {}, { rejectUnauthorized: false });
			return agent;
		}
		_performExponentialBackoff(retryNumber) {
			return __awaiter$9(this, void 0, void 0, function* () {
				retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
				const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
				return new Promise((resolve) => setTimeout(() => resolve(), ms));
			});
		}
		_processResponse(res, options) {
			return __awaiter$9(this, void 0, void 0, function* () {
				return new Promise((resolve, reject) => __awaiter$9(this, void 0, void 0, function* () {
					const statusCode = res.message.statusCode || 0;
					const response = {
						statusCode,
						result: null,
						headers: {}
					};
					if (statusCode === HttpCodes.NotFound) resolve(response);
					function dateTimeDeserializer(key, value) {
						if (typeof value === "string") {
							const a = new Date(value);
							if (!isNaN(a.valueOf())) return a;
						}
						return value;
					}
					let obj;
					let contents;
					try {
						contents = yield res.readBody();
						if (contents && contents.length > 0) {
							if (options && options.deserializeDates) obj = JSON.parse(contents, dateTimeDeserializer);
							else obj = JSON.parse(contents);
							response.result = obj;
						}
						response.headers = res.message.headers;
					} catch (err) {}
					if (statusCode > 299) {
						let msg;
						if (obj && obj.message) msg = obj.message;
						else if (contents && contents.length > 0) msg = contents;
						else msg = `Failed request: (${statusCode})`;
						const err = new HttpClientError(msg, statusCode);
						err.result = response.result;
						reject(err);
					} else resolve(response);
				}));
			});
		}
	};
	exports.HttpClient = HttpClient;
	const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
}) });

//#endregion
//#region node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/auth.js
var require_auth = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+http-client@2.1.1/node_modules/@actions/http-client/lib/auth.js": ((exports) => {
	var __awaiter$8 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var BasicCredentialHandler = class {
		constructor(username, password) {
			this.username = username;
			this.password = password;
		}
		prepareRequest(options) {
			if (!options.headers) throw Error("The request has no headers");
			options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
		}
		canHandleAuthentication() {
			return false;
		}
		handleAuthentication() {
			return __awaiter$8(this, void 0, void 0, function* () {
				throw new Error("not implemented");
			});
		}
	};
	exports.BasicCredentialHandler = BasicCredentialHandler;
	var BearerCredentialHandler = class {
		constructor(token) {
			this.token = token;
		}
		prepareRequest(options) {
			if (!options.headers) throw Error("The request has no headers");
			options.headers["Authorization"] = `Bearer ${this.token}`;
		}
		canHandleAuthentication() {
			return false;
		}
		handleAuthentication() {
			return __awaiter$8(this, void 0, void 0, function* () {
				throw new Error("not implemented");
			});
		}
	};
	exports.BearerCredentialHandler = BearerCredentialHandler;
	var PersonalAccessTokenCredentialHandler = class {
		constructor(token) {
			this.token = token;
		}
		prepareRequest(options) {
			if (!options.headers) throw Error("The request has no headers");
			options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
		}
		canHandleAuthentication() {
			return false;
		}
		handleAuthentication() {
			return __awaiter$8(this, void 0, void 0, function* () {
				throw new Error("not implemented");
			});
		}
	};
	exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/oidc-utils.js": ((exports) => {
	var __awaiter$7 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const http_client_1 = require_lib();
	const auth_1 = require_auth();
	const core_1 = require_core();
	var OidcClient = class OidcClient {
		static createHttpClient(allowRetry = true, maxRetry = 10) {
			const requestOptions = {
				allowRetries: allowRetry,
				maxRetries: maxRetry
			};
			return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
		}
		static getRequestToken() {
			const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
			if (!token) throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
			return token;
		}
		static getIDTokenUrl() {
			const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
			if (!runtimeUrl) throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
			return runtimeUrl;
		}
		static getCall(id_token_url) {
			var _a$1;
			return __awaiter$7(this, void 0, void 0, function* () {
				const id_token = (_a$1 = (yield OidcClient.createHttpClient().getJson(id_token_url).catch((error$1) => {
					throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error$1.statusCode}\n 
        Error Message: ${error$1.message}`);
				})).result) === null || _a$1 === void 0 ? void 0 : _a$1.value;
				if (!id_token) throw new Error("Response json body do not have ID Token field");
				return id_token;
			});
		}
		static getIDToken(audience) {
			return __awaiter$7(this, void 0, void 0, function* () {
				try {
					let id_token_url = OidcClient.getIDTokenUrl();
					if (audience) id_token_url = `${id_token_url}&audience=${encodeURIComponent(audience)}`;
					(0, core_1.debug)(`ID token url is ${id_token_url}`);
					const id_token = yield OidcClient.getCall(id_token_url);
					(0, core_1.setSecret)(id_token);
					return id_token;
				} catch (error$1) {
					throw new Error(`Error message: ${error$1.message}`);
				}
			});
		}
	};
	exports.OidcClient = OidcClient;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/summary.js
var require_summary = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/summary.js": ((exports) => {
	var __awaiter$6 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const os_1$1 = __require("os");
	const fs_1 = __require("fs");
	const { access, appendFile, writeFile } = fs_1.promises;
	exports.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
	exports.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
	var Summary = class {
		constructor() {
			this._buffer = "";
		}
		/**
		* Finds the summary file path from the environment, rejects if env var is not found or file does not exist
		* Also checks r/w permissions.
		*
		* @returns step summary file path
		*/
		filePath() {
			return __awaiter$6(this, void 0, void 0, function* () {
				if (this._filePath) return this._filePath;
				const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
				if (!pathFromEnv) throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
				try {
					yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
				} catch (_a$1) {
					throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
				}
				this._filePath = pathFromEnv;
				return this._filePath;
			});
		}
		/**
		* Wraps content in an HTML tag, adding any HTML attributes
		*
		* @param {string} tag HTML tag to wrap
		* @param {string | null} content content within the tag
		* @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
		*
		* @returns {string} content wrapped in HTML element
		*/
		wrap(tag, content, attrs = {}) {
			const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
			if (!content) return `<${tag}${htmlAttrs}>`;
			return `<${tag}${htmlAttrs}>${content}</${tag}>`;
		}
		/**
		* Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
		*
		* @param {SummaryWriteOptions} [options] (optional) options for write operation
		*
		* @returns {Promise<Summary>} summary instance
		*/
		write(options) {
			return __awaiter$6(this, void 0, void 0, function* () {
				const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
				const filePath = yield this.filePath();
				yield (overwrite ? writeFile : appendFile)(filePath, this._buffer, { encoding: "utf8" });
				return this.emptyBuffer();
			});
		}
		/**
		* Clears the summary buffer and wipes the summary file
		*
		* @returns {Summary} summary instance
		*/
		clear() {
			return __awaiter$6(this, void 0, void 0, function* () {
				return this.emptyBuffer().write({ overwrite: true });
			});
		}
		/**
		* Returns the current summary buffer as a string
		*
		* @returns {string} string of summary buffer
		*/
		stringify() {
			return this._buffer;
		}
		/**
		* If the summary buffer is empty
		*
		* @returns {boolen} true if the buffer is empty
		*/
		isEmptyBuffer() {
			return this._buffer.length === 0;
		}
		/**
		* Resets the summary buffer without writing to summary file
		*
		* @returns {Summary} summary instance
		*/
		emptyBuffer() {
			this._buffer = "";
			return this;
		}
		/**
		* Adds raw text to the summary buffer
		*
		* @param {string} text content to add
		* @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
		*
		* @returns {Summary} summary instance
		*/
		addRaw(text, addEOL = false) {
			this._buffer += text;
			return addEOL ? this.addEOL() : this;
		}
		/**
		* Adds the operating system-specific end-of-line marker to the buffer
		*
		* @returns {Summary} summary instance
		*/
		addEOL() {
			return this.addRaw(os_1$1.EOL);
		}
		/**
		* Adds an HTML codeblock to the summary buffer
		*
		* @param {string} code content to render within fenced code block
		* @param {string} lang (optional) language to syntax highlight code
		*
		* @returns {Summary} summary instance
		*/
		addCodeBlock(code$1, lang) {
			const attrs = Object.assign({}, lang && { lang });
			const element = this.wrap("pre", this.wrap("code", code$1), attrs);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML list to the summary buffer
		*
		* @param {string[]} items list of items to render
		* @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
		*
		* @returns {Summary} summary instance
		*/
		addList(items, ordered = false) {
			const tag = ordered ? "ol" : "ul";
			const listItems = items.map((item) => this.wrap("li", item)).join("");
			const element = this.wrap(tag, listItems);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML table to the summary buffer
		*
		* @param {SummaryTableCell[]} rows table rows
		*
		* @returns {Summary} summary instance
		*/
		addTable(rows) {
			const tableBody = rows.map((row) => {
				const cells = row.map((cell) => {
					if (typeof cell === "string") return this.wrap("td", cell);
					const { header, data, colspan, rowspan } = cell;
					const tag = header ? "th" : "td";
					const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
					return this.wrap(tag, data, attrs);
				}).join("");
				return this.wrap("tr", cells);
			}).join("");
			const element = this.wrap("table", tableBody);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds a collapsable HTML details element to the summary buffer
		*
		* @param {string} label text for the closed state
		* @param {string} content collapsable content
		*
		* @returns {Summary} summary instance
		*/
		addDetails(label, content) {
			const element = this.wrap("details", this.wrap("summary", label) + content);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML image tag to the summary buffer
		*
		* @param {string} src path to the image you to embed
		* @param {string} alt text description of the image
		* @param {SummaryImageOptions} options (optional) addition image attributes
		*
		* @returns {Summary} summary instance
		*/
		addImage(src$1, alt, options) {
			const { width, height } = options || {};
			const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
			const element = this.wrap("img", null, Object.assign({
				src: src$1,
				alt
			}, attrs));
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML section heading element
		*
		* @param {string} text heading text
		* @param {number | string} [level=1] (optional) the heading level, default: 1
		*
		* @returns {Summary} summary instance
		*/
		addHeading(text, level) {
			const tag = `h${level}`;
			const allowedTag = [
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6"
			].includes(tag) ? tag : "h1";
			const element = this.wrap(allowedTag, text);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML thematic break (<hr>) to the summary buffer
		*
		* @returns {Summary} summary instance
		*/
		addSeparator() {
			const element = this.wrap("hr", null);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML line break (<br>) to the summary buffer
		*
		* @returns {Summary} summary instance
		*/
		addBreak() {
			const element = this.wrap("br", null);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML blockquote to the summary buffer
		*
		* @param {string} text quote text
		* @param {string} cite (optional) citation url
		*
		* @returns {Summary} summary instance
		*/
		addQuote(text, cite) {
			const attrs = Object.assign({}, cite && { cite });
			const element = this.wrap("blockquote", text, attrs);
			return this.addRaw(element).addEOL();
		}
		/**
		* Adds an HTML anchor tag to the summary buffer
		*
		* @param {string} text link text/content
		* @param {string} href hyperlink
		*
		* @returns {Summary} summary instance
		*/
		addLink(text, href) {
			const element = this.wrap("a", text, { href });
			return this.addRaw(element).addEOL();
		}
	};
	const _summary = new Summary();
	/**
	* @deprecated use `core.summary`
	*/
	exports.markdownSummary = _summary;
	exports.summary = _summary;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/path-utils.js
var require_path_utils = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/path-utils.js": ((exports) => {
	var __createBinding$6 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc$1 = Object.getOwnPropertyDescriptor(m, k);
		if (!desc$1 || ("get" in desc$1 ? !m.__esModule : desc$1.writable || desc$1.configurable)) desc$1 = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc$1);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$6 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$6 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$6(result, mod, k);
		}
		__setModuleDefault$6(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const path$5 = __importStar$6(__require("path"));
	/**
	* toPosixPath converts the given path to the posix form. On Windows, \\ will be
	* replaced with /.
	*
	* @param pth. Path to transform.
	* @return string Posix path.
	*/
	function toPosixPath(pth) {
		return pth.replace(/[\\]/g, "/");
	}
	exports.toPosixPath = toPosixPath;
	/**
	* toWin32Path converts the given path to the win32 form. On Linux, / will be
	* replaced with \\.
	*
	* @param pth. Path to transform.
	* @return string Win32 path.
	*/
	function toWin32Path(pth) {
		return pth.replace(/[/]/g, "\\");
	}
	exports.toWin32Path = toWin32Path;
	/**
	* toPlatformPath converts the given path to a platform-specific path. It does
	* this by replacing instances of / and \ with the platform-specific path
	* separator.
	*
	* @param pth The path to platformize.
	* @return string The platform-specific path.
	*/
	function toPlatformPath(pth) {
		return pth.replace(/[/\\]/g, path$5.sep);
	}
	exports.toPlatformPath = toPlatformPath;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+io@1.1.3/node_modules/@actions/io/lib/io-util.js
var require_io_util = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+io@1.1.3/node_modules/@actions/io/lib/io-util.js": ((exports) => {
	var __createBinding$5 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$5 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$5 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding$5(result, mod, k);
		}
		__setModuleDefault$5(result, mod);
		return result;
	};
	var __awaiter$5 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	const fs$3 = __importStar$5(__require("fs"));
	const path$4 = __importStar$5(__require("path"));
	_a = fs$3.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.open = _a.open, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rm = _a.rm, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
	exports.IS_WINDOWS = process.platform === "win32";
	exports.UV_FS_O_EXLOCK = 268435456;
	exports.READONLY = fs$3.constants.O_RDONLY;
	function exists(fsPath) {
		return __awaiter$5(this, void 0, void 0, function* () {
			try {
				yield exports.stat(fsPath);
			} catch (err) {
				if (err.code === "ENOENT") return false;
				throw err;
			}
			return true;
		});
	}
	exports.exists = exists;
	function isDirectory(fsPath, useStat = false) {
		return __awaiter$5(this, void 0, void 0, function* () {
			return (useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath)).isDirectory();
		});
	}
	exports.isDirectory = isDirectory;
	/**
	* On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
	* \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
	*/
	function isRooted(p) {
		p = normalizeSeparators(p);
		if (!p) throw new Error("isRooted() parameter \"p\" cannot be empty");
		if (exports.IS_WINDOWS) return p.startsWith("\\") || /^[A-Z]:/i.test(p);
		return p.startsWith("/");
	}
	exports.isRooted = isRooted;
	/**
	* Best effort attempt to determine whether a file exists and is executable.
	* @param filePath    file path to check
	* @param extensions  additional file extensions to try
	* @return if file exists and is executable, returns the file path. otherwise empty string.
	*/
	function tryGetExecutablePath(filePath, extensions) {
		return __awaiter$5(this, void 0, void 0, function* () {
			let stats = void 0;
			try {
				stats = yield exports.stat(filePath);
			} catch (err) {
				if (err.code !== "ENOENT") console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
			}
			if (stats && stats.isFile()) {
				if (exports.IS_WINDOWS) {
					const upperExt = path$4.extname(filePath).toUpperCase();
					if (extensions.some((validExt) => validExt.toUpperCase() === upperExt)) return filePath;
				} else if (isUnixExecutable(stats)) return filePath;
			}
			const originalFilePath = filePath;
			for (const extension of extensions) {
				filePath = originalFilePath + extension;
				stats = void 0;
				try {
					stats = yield exports.stat(filePath);
				} catch (err) {
					if (err.code !== "ENOENT") console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
				}
				if (stats && stats.isFile()) {
					if (exports.IS_WINDOWS) {
						try {
							const directory = path$4.dirname(filePath);
							const upperName = path$4.basename(filePath).toUpperCase();
							for (const actualName of yield exports.readdir(directory)) if (upperName === actualName.toUpperCase()) {
								filePath = path$4.join(directory, actualName);
								break;
							}
						} catch (err) {
							console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
						}
						return filePath;
					} else if (isUnixExecutable(stats)) return filePath;
				}
			}
			return "";
		});
	}
	exports.tryGetExecutablePath = tryGetExecutablePath;
	function normalizeSeparators(p) {
		p = p || "";
		if (exports.IS_WINDOWS) {
			p = p.replace(/\//g, "\\");
			return p.replace(/\\\\+/g, "\\");
		}
		return p.replace(/\/\/+/g, "/");
	}
	function isUnixExecutable(stats) {
		return (stats.mode & 1) > 0 || (stats.mode & 8) > 0 && stats.gid === process.getgid() || (stats.mode & 64) > 0 && stats.uid === process.getuid();
	}
	function getCmdPath() {
		var _a$1;
		return (_a$1 = process.env["COMSPEC"]) !== null && _a$1 !== void 0 ? _a$1 : `cmd.exe`;
	}
	exports.getCmdPath = getCmdPath;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+io@1.1.3/node_modules/@actions/io/lib/io.js
var require_io = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+io@1.1.3/node_modules/@actions/io/lib/io.js": ((exports) => {
	var __createBinding$4 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$4 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$4 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding$4(result, mod, k);
		}
		__setModuleDefault$4(result, mod);
		return result;
	};
	var __awaiter$4 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const assert_1 = __require("assert");
	const path$3 = __importStar$4(__require("path"));
	const ioUtil$1 = __importStar$4(require_io_util());
	/**
	* Copies a file or folder.
	* Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
	*
	* @param     source    source path
	* @param     dest      destination path
	* @param     options   optional. See CopyOptions.
	*/
	function cp(source, dest, options = {}) {
		return __awaiter$4(this, void 0, void 0, function* () {
			const { force, recursive, copySourceDirectory } = readCopyOptions(options);
			const destStat = (yield ioUtil$1.exists(dest)) ? yield ioUtil$1.stat(dest) : null;
			if (destStat && destStat.isFile() && !force) return;
			const newDest = destStat && destStat.isDirectory() && copySourceDirectory ? path$3.join(dest, path$3.basename(source)) : dest;
			if (!(yield ioUtil$1.exists(source))) throw new Error(`no such file or directory: ${source}`);
			if ((yield ioUtil$1.stat(source)).isDirectory()) if (!recursive) throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
			else yield cpDirRecursive(source, newDest, 0, force);
			else {
				if (path$3.relative(source, newDest) === "") throw new Error(`'${newDest}' and '${source}' are the same file`);
				yield copyFile(source, newDest, force);
			}
		});
	}
	exports.cp = cp;
	/**
	* Moves a path.
	*
	* @param     source    source path
	* @param     dest      destination path
	* @param     options   optional. See MoveOptions.
	*/
	function mv(source, dest, options = {}) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if (yield ioUtil$1.exists(dest)) {
				let destExists = true;
				if (yield ioUtil$1.isDirectory(dest)) {
					dest = path$3.join(dest, path$3.basename(source));
					destExists = yield ioUtil$1.exists(dest);
				}
				if (destExists) if (options.force == null || options.force) yield rmRF(dest);
				else throw new Error("Destination already exists");
			}
			yield mkdirP(path$3.dirname(dest));
			yield ioUtil$1.rename(source, dest);
		});
	}
	exports.mv = mv;
	/**
	* Remove a path recursively with force
	*
	* @param inputPath path to remove
	*/
	function rmRF(inputPath) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if (ioUtil$1.IS_WINDOWS) {
				if (/[*"<>|]/.test(inputPath)) throw new Error("File path must not contain `*`, `\"`, `<`, `>` or `|` on Windows");
			}
			try {
				yield ioUtil$1.rm(inputPath, {
					force: true,
					maxRetries: 3,
					recursive: true,
					retryDelay: 300
				});
			} catch (err) {
				throw new Error(`File was unable to be removed ${err}`);
			}
		});
	}
	exports.rmRF = rmRF;
	/**
	* Make a directory.  Creates the full path with folders in between
	* Will throw if it fails
	*
	* @param   fsPath        path to create
	* @returns Promise<void>
	*/
	function mkdirP(fsPath) {
		return __awaiter$4(this, void 0, void 0, function* () {
			assert_1.ok(fsPath, "a path argument must be provided");
			yield ioUtil$1.mkdir(fsPath, { recursive: true });
		});
	}
	exports.mkdirP = mkdirP;
	/**
	* Returns path of a tool had the tool actually been invoked.  Resolves via paths.
	* If you check and the tool does not exist, it will throw.
	*
	* @param     tool              name of the tool
	* @param     check             whether to check if tool exists
	* @returns   Promise<string>   path to tool
	*/
	function which(tool, check) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if (!tool) throw new Error("parameter 'tool' is required");
			if (check) {
				const result = yield which(tool, false);
				if (!result) if (ioUtil$1.IS_WINDOWS) throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
				else throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
				return result;
			}
			const matches = yield findInPath(tool);
			if (matches && matches.length > 0) return matches[0];
			return "";
		});
	}
	exports.which = which;
	/**
	* Returns a list of all occurrences of the given tool on the system path.
	*
	* @returns   Promise<string[]>  the paths of the tool
	*/
	function findInPath(tool) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if (!tool) throw new Error("parameter 'tool' is required");
			const extensions = [];
			if (ioUtil$1.IS_WINDOWS && process.env["PATHEXT"]) {
				for (const extension of process.env["PATHEXT"].split(path$3.delimiter)) if (extension) extensions.push(extension);
			}
			if (ioUtil$1.isRooted(tool)) {
				const filePath = yield ioUtil$1.tryGetExecutablePath(tool, extensions);
				if (filePath) return [filePath];
				return [];
			}
			if (tool.includes(path$3.sep)) return [];
			const directories = [];
			if (process.env.PATH) {
				for (const p of process.env.PATH.split(path$3.delimiter)) if (p) directories.push(p);
			}
			const matches = [];
			for (const directory of directories) {
				const filePath = yield ioUtil$1.tryGetExecutablePath(path$3.join(directory, tool), extensions);
				if (filePath) matches.push(filePath);
			}
			return matches;
		});
	}
	exports.findInPath = findInPath;
	function readCopyOptions(options) {
		const force = options.force == null ? true : options.force;
		const recursive = Boolean(options.recursive);
		const copySourceDirectory = options.copySourceDirectory == null ? true : Boolean(options.copySourceDirectory);
		return {
			force,
			recursive,
			copySourceDirectory
		};
	}
	function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if (currentDepth >= 255) return;
			currentDepth++;
			yield mkdirP(destDir);
			const files = yield ioUtil$1.readdir(sourceDir);
			for (const fileName of files) {
				const srcFile = `${sourceDir}/${fileName}`;
				const destFile = `${destDir}/${fileName}`;
				if ((yield ioUtil$1.lstat(srcFile)).isDirectory()) yield cpDirRecursive(srcFile, destFile, currentDepth, force);
				else yield copyFile(srcFile, destFile, force);
			}
			yield ioUtil$1.chmod(destDir, (yield ioUtil$1.stat(sourceDir)).mode);
		});
	}
	function copyFile(srcFile, destFile, force) {
		return __awaiter$4(this, void 0, void 0, function* () {
			if ((yield ioUtil$1.lstat(srcFile)).isSymbolicLink()) {
				try {
					yield ioUtil$1.lstat(destFile);
					yield ioUtil$1.unlink(destFile);
				} catch (e) {
					if (e.code === "EPERM") {
						yield ioUtil$1.chmod(destFile, "0666");
						yield ioUtil$1.unlink(destFile);
					}
				}
				const symlinkFull = yield ioUtil$1.readlink(srcFile);
				yield ioUtil$1.symlink(symlinkFull, destFile, ioUtil$1.IS_WINDOWS ? "junction" : null);
			} else if (!(yield ioUtil$1.exists(destFile)) || force) yield ioUtil$1.copyFile(srcFile, destFile);
		});
	}
}) });

//#endregion
//#region node_modules/.pnpm/@actions+exec@1.1.1/node_modules/@actions/exec/lib/toolrunner.js
var require_toolrunner = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+exec@1.1.1/node_modules/@actions/exec/lib/toolrunner.js": ((exports) => {
	var __createBinding$3 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$3 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$3 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding$3(result, mod, k);
		}
		__setModuleDefault$3(result, mod);
		return result;
	};
	var __awaiter$3 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const os$2 = __importStar$3(__require("os"));
	const events = __importStar$3(__require("events"));
	const child = __importStar$3(__require("child_process"));
	const path$2 = __importStar$3(__require("path"));
	const io = __importStar$3(require_io());
	const ioUtil = __importStar$3(require_io_util());
	const timers_1 = __require("timers");
	const IS_WINDOWS = process.platform === "win32";
	var ToolRunner = class extends events.EventEmitter {
		constructor(toolPath, args, options) {
			super();
			if (!toolPath) throw new Error("Parameter 'toolPath' cannot be null or empty.");
			this.toolPath = toolPath;
			this.args = args || [];
			this.options = options || {};
		}
		_debug(message) {
			if (this.options.listeners && this.options.listeners.debug) this.options.listeners.debug(message);
		}
		_getCommandString(options, noPrefix) {
			const toolPath = this._getSpawnFileName();
			const args = this._getSpawnArgs(options);
			let cmd = noPrefix ? "" : "[command]";
			if (IS_WINDOWS) if (this._isCmdFile()) {
				cmd += toolPath;
				for (const a of args) cmd += ` ${a}`;
			} else if (options.windowsVerbatimArguments) {
				cmd += `"${toolPath}"`;
				for (const a of args) cmd += ` ${a}`;
			} else {
				cmd += this._windowsQuoteCmdArg(toolPath);
				for (const a of args) cmd += ` ${this._windowsQuoteCmdArg(a)}`;
			}
			else {
				cmd += toolPath;
				for (const a of args) cmd += ` ${a}`;
			}
			return cmd;
		}
		_processLineBuffer(data, strBuffer, onLine) {
			try {
				let s = strBuffer + data.toString();
				let n = s.indexOf(os$2.EOL);
				while (n > -1) {
					const line = s.substring(0, n);
					onLine(line);
					s = s.substring(n + os$2.EOL.length);
					n = s.indexOf(os$2.EOL);
				}
				return s;
			} catch (err) {
				this._debug(`error processing line. Failed with error ${err}`);
				return "";
			}
		}
		_getSpawnFileName() {
			if (IS_WINDOWS) {
				if (this._isCmdFile()) return process.env["COMSPEC"] || "cmd.exe";
			}
			return this.toolPath;
		}
		_getSpawnArgs(options) {
			if (IS_WINDOWS) {
				if (this._isCmdFile()) {
					let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
					for (const a of this.args) {
						argline += " ";
						argline += options.windowsVerbatimArguments ? a : this._windowsQuoteCmdArg(a);
					}
					argline += "\"";
					return [argline];
				}
			}
			return this.args;
		}
		_endsWith(str, end) {
			return str.endsWith(end);
		}
		_isCmdFile() {
			const upperToolPath = this.toolPath.toUpperCase();
			return this._endsWith(upperToolPath, ".CMD") || this._endsWith(upperToolPath, ".BAT");
		}
		_windowsQuoteCmdArg(arg) {
			if (!this._isCmdFile()) return this._uvQuoteCmdArg(arg);
			if (!arg) return "\"\"";
			const cmdSpecialChars = [
				" ",
				"	",
				"&",
				"(",
				")",
				"[",
				"]",
				"{",
				"}",
				"^",
				"=",
				";",
				"!",
				"'",
				"+",
				",",
				"`",
				"~",
				"|",
				"<",
				">",
				"\""
			];
			let needsQuotes = false;
			for (const char of arg) if (cmdSpecialChars.some((x) => x === char)) {
				needsQuotes = true;
				break;
			}
			if (!needsQuotes) return arg;
			let reverse = "\"";
			let quoteHit = true;
			for (let i = arg.length; i > 0; i--) {
				reverse += arg[i - 1];
				if (quoteHit && arg[i - 1] === "\\") reverse += "\\";
				else if (arg[i - 1] === "\"") {
					quoteHit = true;
					reverse += "\"";
				} else quoteHit = false;
			}
			reverse += "\"";
			return reverse.split("").reverse().join("");
		}
		_uvQuoteCmdArg(arg) {
			if (!arg) return "\"\"";
			if (!arg.includes(" ") && !arg.includes("	") && !arg.includes("\"")) return arg;
			if (!arg.includes("\"") && !arg.includes("\\")) return `"${arg}"`;
			let reverse = "\"";
			let quoteHit = true;
			for (let i = arg.length; i > 0; i--) {
				reverse += arg[i - 1];
				if (quoteHit && arg[i - 1] === "\\") reverse += "\\";
				else if (arg[i - 1] === "\"") {
					quoteHit = true;
					reverse += "\\";
				} else quoteHit = false;
			}
			reverse += "\"";
			return reverse.split("").reverse().join("");
		}
		_cloneExecOptions(options) {
			options = options || {};
			const result = {
				cwd: options.cwd || process.cwd(),
				env: options.env || process.env,
				silent: options.silent || false,
				windowsVerbatimArguments: options.windowsVerbatimArguments || false,
				failOnStdErr: options.failOnStdErr || false,
				ignoreReturnCode: options.ignoreReturnCode || false,
				delay: options.delay || 1e4
			};
			result.outStream = options.outStream || process.stdout;
			result.errStream = options.errStream || process.stderr;
			return result;
		}
		_getSpawnOptions(options, toolPath) {
			options = options || {};
			const result = {};
			result.cwd = options.cwd;
			result.env = options.env;
			result["windowsVerbatimArguments"] = options.windowsVerbatimArguments || this._isCmdFile();
			if (options.windowsVerbatimArguments) result.argv0 = `"${toolPath}"`;
			return result;
		}
		/**
		* Exec a tool.
		* Output will be streamed to the live console.
		* Returns promise with return code
		*
		* @param     tool     path to tool to exec
		* @param     options  optional exec options.  See ExecOptions
		* @returns   number
		*/
		exec() {
			return __awaiter$3(this, void 0, void 0, function* () {
				if (!ioUtil.isRooted(this.toolPath) && (this.toolPath.includes("/") || IS_WINDOWS && this.toolPath.includes("\\"))) this.toolPath = path$2.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
				this.toolPath = yield io.which(this.toolPath, true);
				return new Promise((resolve, reject) => __awaiter$3(this, void 0, void 0, function* () {
					this._debug(`exec tool: ${this.toolPath}`);
					this._debug("arguments:");
					for (const arg of this.args) this._debug(`   ${arg}`);
					const optionsNonNull = this._cloneExecOptions(this.options);
					if (!optionsNonNull.silent && optionsNonNull.outStream) optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os$2.EOL);
					const state = new ExecState(optionsNonNull, this.toolPath);
					state.on("debug", (message) => {
						this._debug(message);
					});
					if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) return reject(/* @__PURE__ */ new Error(`The cwd: ${this.options.cwd} does not exist!`));
					const fileName = this._getSpawnFileName();
					const cp$1 = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
					let stdbuffer = "";
					if (cp$1.stdout) cp$1.stdout.on("data", (data) => {
						if (this.options.listeners && this.options.listeners.stdout) this.options.listeners.stdout(data);
						if (!optionsNonNull.silent && optionsNonNull.outStream) optionsNonNull.outStream.write(data);
						stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
							if (this.options.listeners && this.options.listeners.stdline) this.options.listeners.stdline(line);
						});
					});
					let errbuffer = "";
					if (cp$1.stderr) cp$1.stderr.on("data", (data) => {
						state.processStderr = true;
						if (this.options.listeners && this.options.listeners.stderr) this.options.listeners.stderr(data);
						if (!optionsNonNull.silent && optionsNonNull.errStream && optionsNonNull.outStream) (optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream).write(data);
						errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
							if (this.options.listeners && this.options.listeners.errline) this.options.listeners.errline(line);
						});
					});
					cp$1.on("error", (err) => {
						state.processError = err.message;
						state.processExited = true;
						state.processClosed = true;
						state.CheckComplete();
					});
					cp$1.on("exit", (code$1) => {
						state.processExitCode = code$1;
						state.processExited = true;
						this._debug(`Exit code ${code$1} received from tool '${this.toolPath}'`);
						state.CheckComplete();
					});
					cp$1.on("close", (code$1) => {
						state.processExitCode = code$1;
						state.processExited = true;
						state.processClosed = true;
						this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
						state.CheckComplete();
					});
					state.on("done", (error$1, exitCode) => {
						if (stdbuffer.length > 0) this.emit("stdline", stdbuffer);
						if (errbuffer.length > 0) this.emit("errline", errbuffer);
						cp$1.removeAllListeners();
						if (error$1) reject(error$1);
						else resolve(exitCode);
					});
					if (this.options.input) {
						if (!cp$1.stdin) throw new Error("child process missing stdin");
						cp$1.stdin.end(this.options.input);
					}
				}));
			});
		}
	};
	exports.ToolRunner = ToolRunner;
	/**
	* Convert an arg string to an array of args. Handles escaping
	*
	* @param    argString   string of arguments
	* @returns  string[]    array of arguments
	*/
	function argStringToArray(argString) {
		const args = [];
		let inQuotes = false;
		let escaped = false;
		let arg = "";
		function append(c) {
			if (escaped && c !== "\"") arg += "\\";
			arg += c;
			escaped = false;
		}
		for (let i = 0; i < argString.length; i++) {
			const c = argString.charAt(i);
			if (c === "\"") {
				if (!escaped) inQuotes = !inQuotes;
				else append(c);
				continue;
			}
			if (c === "\\" && escaped) {
				append(c);
				continue;
			}
			if (c === "\\" && inQuotes) {
				escaped = true;
				continue;
			}
			if (c === " " && !inQuotes) {
				if (arg.length > 0) {
					args.push(arg);
					arg = "";
				}
				continue;
			}
			append(c);
		}
		if (arg.length > 0) args.push(arg.trim());
		return args;
	}
	exports.argStringToArray = argStringToArray;
	var ExecState = class ExecState extends events.EventEmitter {
		constructor(options, toolPath) {
			super();
			this.processClosed = false;
			this.processError = "";
			this.processExitCode = 0;
			this.processExited = false;
			this.processStderr = false;
			this.delay = 1e4;
			this.done = false;
			this.timeout = null;
			if (!toolPath) throw new Error("toolPath must not be empty");
			this.options = options;
			this.toolPath = toolPath;
			if (options.delay) this.delay = options.delay;
		}
		CheckComplete() {
			if (this.done) return;
			if (this.processClosed) this._setResult();
			else if (this.processExited) this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
		}
		_debug(message) {
			this.emit("debug", message);
		}
		_setResult() {
			let error$1;
			if (this.processExited) {
				if (this.processError) error$1 = /* @__PURE__ */ new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
				else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) error$1 = /* @__PURE__ */ new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
				else if (this.processStderr && this.options.failOnStdErr) error$1 = /* @__PURE__ */ new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
			}
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.done = true;
			this.emit("done", error$1, this.processExitCode);
		}
		static HandleTimeout(state) {
			if (state.done) return;
			if (!state.processClosed && state.processExited) {
				const message = `The STDIO streams did not close within ${state.delay / 1e3} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
				state._debug(message);
			}
			state._setResult();
		}
	};
}) });

//#endregion
//#region node_modules/.pnpm/@actions+exec@1.1.1/node_modules/@actions/exec/lib/exec.js
var require_exec = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+exec@1.1.1/node_modules/@actions/exec/lib/exec.js": ((exports) => {
	var __createBinding$2 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$2 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$2 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding$2(result, mod, k);
		}
		__setModuleDefault$2(result, mod);
		return result;
	};
	var __awaiter$2 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const string_decoder_1 = __require("string_decoder");
	const tr = __importStar$2(require_toolrunner());
	/**
	* Exec a command.
	* Output will be streamed to the live console.
	* Returns promise with return code
	*
	* @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
	* @param     args               optional arguments for tool. Escaping is handled by the lib.
	* @param     options            optional exec options.  See ExecOptions
	* @returns   Promise<number>    exit code
	*/
	function exec$1(commandLine, args, options) {
		return __awaiter$2(this, void 0, void 0, function* () {
			const commandArgs = tr.argStringToArray(commandLine);
			if (commandArgs.length === 0) throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
			const toolPath = commandArgs[0];
			args = commandArgs.slice(1).concat(args || []);
			return new tr.ToolRunner(toolPath, args, options).exec();
		});
	}
	exports.exec = exec$1;
	/**
	* Exec a command and get the output.
	* Output will be streamed to the live console.
	* Returns promise with the exit code and collected stdout and stderr
	*
	* @param     commandLine           command to execute (can include additional args). Must be correctly escaped.
	* @param     args                  optional arguments for tool. Escaping is handled by the lib.
	* @param     options               optional exec options.  See ExecOptions
	* @returns   Promise<ExecOutput>   exit code, stdout, and stderr
	*/
	function getExecOutput(commandLine, args, options) {
		var _a$1, _b;
		return __awaiter$2(this, void 0, void 0, function* () {
			let stdout = "";
			let stderr = "";
			const stdoutDecoder = new string_decoder_1.StringDecoder("utf8");
			const stderrDecoder = new string_decoder_1.StringDecoder("utf8");
			const originalStdoutListener = (_a$1 = options === null || options === void 0 ? void 0 : options.listeners) === null || _a$1 === void 0 ? void 0 : _a$1.stdout;
			const originalStdErrListener = (_b = options === null || options === void 0 ? void 0 : options.listeners) === null || _b === void 0 ? void 0 : _b.stderr;
			const stdErrListener = (data) => {
				stderr += stderrDecoder.write(data);
				if (originalStdErrListener) originalStdErrListener(data);
			};
			const stdOutListener = (data) => {
				stdout += stdoutDecoder.write(data);
				if (originalStdoutListener) originalStdoutListener(data);
			};
			const listeners = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.listeners), {
				stdout: stdOutListener,
				stderr: stdErrListener
			});
			const exitCode = yield exec$1(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
			stdout += stdoutDecoder.end();
			stderr += stderrDecoder.end();
			return {
				exitCode,
				stdout,
				stderr
			};
		});
	}
	exports.getExecOutput = getExecOutput;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/platform.js
var require_platform = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/platform.js": ((exports) => {
	var __createBinding$1 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc$1 = Object.getOwnPropertyDescriptor(m, k);
		if (!desc$1 || ("get" in desc$1 ? !m.__esModule : desc$1.writable || desc$1.configurable)) desc$1 = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc$1);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault$1 = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar$1 = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
		}
		__setModuleDefault$1(result, mod);
		return result;
	};
	var __awaiter$1 = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const os_1 = __importDefault(__require("os"));
	const exec = __importStar$1(require_exec());
	const getWindowsInfo = () => __awaiter$1(void 0, void 0, void 0, function* () {
		const { stdout: version } = yield exec.getExecOutput("powershell -command \"(Get-CimInstance -ClassName Win32_OperatingSystem).Version\"", void 0, { silent: true });
		const { stdout: name$1 } = yield exec.getExecOutput("powershell -command \"(Get-CimInstance -ClassName Win32_OperatingSystem).Caption\"", void 0, { silent: true });
		return {
			name: name$1.trim(),
			version: version.trim()
		};
	});
	const getMacOsInfo = () => __awaiter$1(void 0, void 0, void 0, function* () {
		var _a$1, _b, _c, _d;
		const { stdout } = yield exec.getExecOutput("sw_vers", void 0, { silent: true });
		const version = (_b = (_a$1 = stdout.match(/ProductVersion:\s*(.+)/)) === null || _a$1 === void 0 ? void 0 : _a$1[1]) !== null && _b !== void 0 ? _b : "";
		return {
			name: (_d = (_c = stdout.match(/ProductName:\s*(.+)/)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : "",
			version
		};
	});
	const getLinuxInfo = () => __awaiter$1(void 0, void 0, void 0, function* () {
		const { stdout } = yield exec.getExecOutput("lsb_release", [
			"-i",
			"-r",
			"-s"
		], { silent: true });
		const [name$1, version] = stdout.trim().split("\n");
		return {
			name: name$1,
			version
		};
	});
	exports.platform = os_1.default.platform();
	exports.arch = os_1.default.arch();
	exports.isWindows = exports.platform === "win32";
	exports.isMacOS = exports.platform === "darwin";
	exports.isLinux = exports.platform === "linux";
	function getDetails() {
		return __awaiter$1(this, void 0, void 0, function* () {
			return Object.assign(Object.assign({}, yield exports.isWindows ? getWindowsInfo() : exports.isMacOS ? getMacOsInfo() : getLinuxInfo()), {
				platform: exports.platform,
				arch: exports.arch,
				isWindows: exports.isWindows,
				isMacOS: exports.isMacOS,
				isLinux: exports.isLinux
			});
		});
	}
	exports.getDetails = getDetails;
}) });

//#endregion
//#region node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/core.js
var require_core = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/core.js": ((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc$1 = Object.getOwnPropertyDescriptor(m, k);
		if (!desc$1 || ("get" in desc$1 ? !m.__esModule : desc$1.writable || desc$1.configurable)) desc$1 = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc$1);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.platform = exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = exports.markdownSummary = exports.summary = exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
	const command_1 = require_command();
	const file_command_1 = require_file_command();
	const utils_1 = require_utils();
	const os$1 = __importStar(__require("os"));
	const path$1 = __importStar(__require("path"));
	const oidc_utils_1 = require_oidc_utils();
	/**
	* The code to exit an action
	*/
	var ExitCode;
	(function(ExitCode$1) {
		/**
		* A code indicating that the action was successful
		*/
		ExitCode$1[ExitCode$1["Success"] = 0] = "Success";
		/**
		* A code indicating that the action was a failure
		*/
		ExitCode$1[ExitCode$1["Failure"] = 1] = "Failure";
	})(ExitCode || (exports.ExitCode = ExitCode = {}));
	/**
	* Sets env variable for this action and future actions in the job
	* @param name the name of the variable to set
	* @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
	*/
	function exportVariable(name$1, val) {
		const convertedVal = (0, utils_1.toCommandValue)(val);
		process.env[name$1] = convertedVal;
		if (process.env["GITHUB_ENV"] || "") return (0, file_command_1.issueFileCommand)("ENV", (0, file_command_1.prepareKeyValueMessage)(name$1, val));
		(0, command_1.issueCommand)("set-env", { name: name$1 }, convertedVal);
	}
	exports.exportVariable = exportVariable;
	/**
	* Registers a secret which will get masked from logs
	* @param secret value of the secret
	*/
	function setSecret(secret) {
		(0, command_1.issueCommand)("add-mask", {}, secret);
	}
	exports.setSecret = setSecret;
	/**
	* Prepends inputPath to the PATH (for this action and future actions)
	* @param inputPath
	*/
	function addPath(inputPath) {
		if (process.env["GITHUB_PATH"] || "") (0, file_command_1.issueFileCommand)("PATH", inputPath);
		else (0, command_1.issueCommand)("add-path", {}, inputPath);
		process.env["PATH"] = `${inputPath}${path$1.delimiter}${process.env["PATH"]}`;
	}
	exports.addPath = addPath;
	/**
	* Gets the value of an input.
	* Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
	* Returns an empty string if the value is not defined.
	*
	* @param     name     name of the input to get
	* @param     options  optional. See InputOptions.
	* @returns   string
	*/
	function getInput$1(name$1, options) {
		const val = process.env[`INPUT_${name$1.replace(/ /g, "_").toUpperCase()}`] || "";
		if (options && options.required && !val) throw new Error(`Input required and not supplied: ${name$1}`);
		if (options && options.trimWhitespace === false) return val;
		return val.trim();
	}
	exports.getInput = getInput$1;
	/**
	* Gets the values of an multiline input.  Each value is also trimmed.
	*
	* @param     name     name of the input to get
	* @param     options  optional. See InputOptions.
	* @returns   string[]
	*
	*/
	function getMultilineInput(name$1, options) {
		const inputs = getInput$1(name$1, options).split("\n").filter((x) => x !== "");
		if (options && options.trimWhitespace === false) return inputs;
		return inputs.map((input) => input.trim());
	}
	exports.getMultilineInput = getMultilineInput;
	/**
	* Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
	* Support boolean input list: `true | True | TRUE | false | False | FALSE` .
	* The return value is also in boolean type.
	* ref: https://yaml.org/spec/1.2/spec.html#id2804923
	*
	* @param     name     name of the input to get
	* @param     options  optional. See InputOptions.
	* @returns   boolean
	*/
	function getBooleanInput$1(name$1, options) {
		const trueValue = [
			"true",
			"True",
			"TRUE"
		];
		const falseValue = [
			"false",
			"False",
			"FALSE"
		];
		const val = getInput$1(name$1, options);
		if (trueValue.includes(val)) return true;
		if (falseValue.includes(val)) return false;
		throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name$1}\nSupport boolean input list: \`true | True | TRUE | false | False | FALSE\``);
	}
	exports.getBooleanInput = getBooleanInput$1;
	/**
	* Sets the value of an output.
	*
	* @param     name     name of the output to set
	* @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
	*/
	function setOutput$1(name$1, value) {
		if (process.env["GITHUB_OUTPUT"] || "") return (0, file_command_1.issueFileCommand)("OUTPUT", (0, file_command_1.prepareKeyValueMessage)(name$1, value));
		process.stdout.write(os$1.EOL);
		(0, command_1.issueCommand)("set-output", { name: name$1 }, (0, utils_1.toCommandValue)(value));
	}
	exports.setOutput = setOutput$1;
	/**
	* Enables or disables the echoing of commands into stdout for the rest of the step.
	* Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
	*
	*/
	function setCommandEcho(enabled) {
		(0, command_1.issue)("echo", enabled ? "on" : "off");
	}
	exports.setCommandEcho = setCommandEcho;
	/**
	* Sets the action status to failed.
	* When the action exits it will be with an exit code of 1
	* @param message add error issue message
	*/
	function setFailed$1(message) {
		process.exitCode = ExitCode.Failure;
		error(message);
	}
	exports.setFailed = setFailed$1;
	/**
	* Gets whether Actions Step Debug is on or not
	*/
	function isDebug() {
		return process.env["RUNNER_DEBUG"] === "1";
	}
	exports.isDebug = isDebug;
	/**
	* Writes debug message to user log
	* @param message debug message
	*/
	function debug(message) {
		(0, command_1.issueCommand)("debug", {}, message);
	}
	exports.debug = debug;
	/**
	* Adds an error issue
	* @param message error issue message. Errors will be converted to string via toString()
	* @param properties optional properties to add to the annotation.
	*/
	function error(message, properties = {}) {
		(0, command_1.issueCommand)("error", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
	}
	exports.error = error;
	/**
	* Adds a warning issue
	* @param message warning issue message. Errors will be converted to string via toString()
	* @param properties optional properties to add to the annotation.
	*/
	function warning(message, properties = {}) {
		(0, command_1.issueCommand)("warning", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
	}
	exports.warning = warning;
	/**
	* Adds a notice issue
	* @param message notice issue message. Errors will be converted to string via toString()
	* @param properties optional properties to add to the annotation.
	*/
	function notice(message, properties = {}) {
		(0, command_1.issueCommand)("notice", (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
	}
	exports.notice = notice;
	/**
	* Writes info to log with console.log.
	* @param message info message
	*/
	function info(message) {
		process.stdout.write(message + os$1.EOL);
	}
	exports.info = info;
	/**
	* Begin an output group.
	*
	* Output until the next `groupEnd` will be foldable in this group
	*
	* @param name The name of the output group
	*/
	function startGroup(name$1) {
		(0, command_1.issue)("group", name$1);
	}
	exports.startGroup = startGroup;
	/**
	* End an output group.
	*/
	function endGroup() {
		(0, command_1.issue)("endgroup");
	}
	exports.endGroup = endGroup;
	/**
	* Wrap an asynchronous function call in a group.
	*
	* Returns the same type as the function itself.
	*
	* @param name The name of the group
	* @param fn The function to wrap in the group
	*/
	function group(name$1, fn) {
		return __awaiter(this, void 0, void 0, function* () {
			startGroup(name$1);
			let result;
			try {
				result = yield fn();
			} finally {
				endGroup();
			}
			return result;
		});
	}
	exports.group = group;
	/**
	* Saves state for current action, the state can only be retrieved by this action's post job execution.
	*
	* @param     name     name of the state to store
	* @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
	*/
	function saveState(name$1, value) {
		if (process.env["GITHUB_STATE"] || "") return (0, file_command_1.issueFileCommand)("STATE", (0, file_command_1.prepareKeyValueMessage)(name$1, value));
		(0, command_1.issueCommand)("save-state", { name: name$1 }, (0, utils_1.toCommandValue)(value));
	}
	exports.saveState = saveState;
	/**
	* Gets the value of an state set by this action's main execution.
	*
	* @param     name     name of the state to get
	* @returns   string
	*/
	function getState(name$1) {
		return process.env[`STATE_${name$1}`] || "";
	}
	exports.getState = getState;
	function getIDToken(aud) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield oidc_utils_1.OidcClient.getIDToken(aud);
		});
	}
	exports.getIDToken = getIDToken;
	/**
	* Summary exports
	*/
	var summary_1 = require_summary();
	Object.defineProperty(exports, "summary", {
		enumerable: true,
		get: function() {
			return summary_1.summary;
		}
	});
	/**
	* @deprecated use core.summary
	*/
	var summary_2 = require_summary();
	Object.defineProperty(exports, "markdownSummary", {
		enumerable: true,
		get: function() {
			return summary_2.markdownSummary;
		}
	});
	/**
	* Path exports
	*/
	var path_utils_1 = require_path_utils();
	Object.defineProperty(exports, "toPosixPath", {
		enumerable: true,
		get: function() {
			return path_utils_1.toPosixPath;
		}
	});
	Object.defineProperty(exports, "toWin32Path", {
		enumerable: true,
		get: function() {
			return path_utils_1.toWin32Path;
		}
	});
	Object.defineProperty(exports, "toPlatformPath", {
		enumerable: true,
		get: function() {
			return path_utils_1.toPlatformPath;
		}
	});
	/**
	* Platform utilities exports
	*/
	exports.platform = __importStar(require_platform());
}) });

//#endregion
//#region src/action/core.ts
var import_core = /* @__PURE__ */ __toESM(require_core(), 1);
/** Logger using the methods from @actions/core. */
const logger = {
	debug: import_core.debug,
	info: import_core.info,
	error: import_core.error
};
/**
* Get input by name.
*
* @param name Input name
* @returns The input string value, or undefined if not set
*/
function getInput(name$1) {
	const inputString = (0, import_core.getInput)(name$1);
	return inputString.length > 0 ? inputString : void 0;
}
/**
* Get a required secret input by name.
*
* @param name Input name
* @returns The input secret value.
*/
function getRequiredSecretInput(name$1) {
	const inputString = (0, import_core.getInput)(name$1, { required: true });
	(0, import_core.setSecret)(inputString);
	return inputString;
}
/**
* Get a boolean input by name.
*
* @param name Input name
* @returns True if value is "true", false if "false", undefined if unset
*/
function getBooleanInput(name$1) {
	const inputString = (0, import_core.getInput)(name$1).toLowerCase();
	if (inputString === "true") return true;
	if (inputString === "false") return false;
}
/**
* Set the action as failed due to an error.
*
* @param error An value from a `catch`
*/
function setFailed(error$1) {
	(0, import_core.setFailed)(error$1);
}
function setOutput(name$1, value, defaultValue) {
	(0, import_core.setOutput)(name$1, value ?? defaultValue);
}

//#endregion
//#region src/action/main.ts
/** Run the action. */
async function run() {
	const results = await npmPublish({
		token: getRequiredSecretInput("token"),
		registry: getInput("registry"),
		package: getInput("package"),
		tag: getInput("tag"),
		access: getInput("access"),
		provenance: getBooleanInput("provenance"),
		strategy: getInput("strategy"),
		ignoreScripts: getBooleanInput("ignore-scripts"),
		dryRun: getBooleanInput("dry-run"),
		logger,
		temporaryDirectory: process.env.RUNNER_TEMP
	});
	setOutput("id", results.id, "");
	setOutput("name", results.name);
	setOutput("version", results.version);
	setOutput("type", results.type, "");
	setOutput("old-version", results.oldVersion, "");
	setOutput("registry", results.registry.href);
	setOutput("tag", results.tag);
	setOutput("access", results.access, "default");
	setOutput("strategy", results.strategy);
	setOutput("dry-run", results.dryRun);
}
/** Main action entry point. */
async function main() {
	try {
		await run();
	} catch (error$1) {
		setFailed(error$1);
	}
}

//#endregion
export { main };
//# sourceMappingURL=main.js.map