import { createRequire } from "node:module";
import os from "node:os";
import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path, { basename, posix } from "node:path";
import EE, { EventEmitter } from "events";
import * as fs$3 from "fs";
import fs$1, { constants, promises } from "fs";
import { EventEmitter as EventEmitter$1 } from "node:events";
import Stream from "node:stream";
import { StringDecoder } from "node:string_decoder";
import fs$2 from "node:fs";
import { dirname, parse } from "path";
import assert from "assert";
import { Buffer as Buffer$1 } from "buffer";
import * as realZlib$1 from "zlib";
import realZlib from "zlib";
import * as os$2 from "os";
import os$1, { EOL } from "os";
import * as crypto from "crypto";

//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
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
const EPUBLISHCONFLICT = "EPUBLISHCONFLICT";
const IS_WINDOWS$2 = os.platform() === "win32";
const NPM = IS_WINDOWS$2 ? "npm.cmd" : "npm";
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
	let error;
	if (exitCode === 0) successData = parseJson(stdout);
	else {
		const errorPayload = parseJson(stdout, stderr);
		if (typeof errorPayload?.error?.code === "string") errorCode = errorPayload.error.code.toUpperCase();
		error = new NpmCallError(command, exitCode, stderr);
	}
	return {
		successData,
		errorCode,
		error
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
async function execNpm(commandArguments, environment, logger) {
	logger?.debug?.(`Running command: ${NPM} ${commandArguments.join(" ")}`);
	return new Promise((resolve) => {
		let stdout = "";
		let stderr = "";
		const npm = childProcess.spawn(NPM, commandArguments, {
			env: {
				...process.env,
				...environment
			},
			shell: IS_WINDOWS$2
		});
		npm.stdout.on("data", (data) => stdout += data);
		npm.stderr.on("data", (data) => stderr += data);
		npm.on("close", (code) => {
			logger?.debug?.(`Received stdout: ${stdout}`);
			logger?.debug?.(`Received stderr: ${stderr}`);
			resolve({
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				exitCode: code ?? 0
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
	const { registry, token, logger, temporaryDirectory } = options;
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
		NODE_AUTH_TOKEN: token ?? "",
		npm_config_userconfig: npmrc
	};
	await fs.writeFile(npmrc, config, "utf8");
	logger?.debug?.(`Temporary .npmrc created at ${npmrc}\n${config}`);
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
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/internal/debug.js
var require_debug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
	module.exports = debug;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/internal/constants.js
var require_constants$5 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SEMVER_SPEC_VERSION = "2.0.0";
	const MAX_LENGTH = 256;
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
	const MAX_SAFE_COMPONENT_LENGTH = 16;
	const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
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
		MAX_LENGTH,
		MAX_SAFE_COMPONENT_LENGTH,
		MAX_SAFE_BUILD_LENGTH,
		MAX_SAFE_INTEGER,
		RELEASE_TYPES,
		SEMVER_SPEC_VERSION,
		FLAG_INCLUDE_PRERELEASE: 1,
		FLAG_LOOSE: 2
	};
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/internal/re.js
var require_re = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } = require_constants$5();
	const debug = require_debug();
	exports = module.exports = {};
	const re = exports.re = [];
	const safeRe = exports.safeRe = [];
	const src = exports.src = [];
	const safeSrc = exports.safeSrc = [];
	const t = exports.t = {};
	let R = 0;
	const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
	const safeRegexReplacements = [
		["\\s", 1],
		["\\d", MAX_LENGTH],
		[LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
	];
	const makeSafeRegex = (value) => {
		for (const [token, max] of safeRegexReplacements) value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
		return value;
	};
	const createToken = (name, value, isGlobal) => {
		const safe = makeSafeRegex(value);
		const index = R++;
		debug(name, index, value);
		t[name] = index;
		src[index] = value;
		safeSrc[index] = safe;
		re[index] = new RegExp(value, isGlobal ? "g" : void 0);
		safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
	};
	createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
	createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
	createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
	createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
	createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
	createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
	createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
	createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
	createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
	createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
	createToken("FULL", `^${src[t.FULLPLAIN]}$`);
	createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
	createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
	createToken("GTLT", "((?:<|>)?=?)");
	createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
	createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
	createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COERCEPLAIN", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
	createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
	createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
	createToken("COERCERTL", src[t.COERCE], true);
	createToken("COERCERTLFULL", src[t.COERCEFULL], true);
	createToken("LONETILDE", "(?:~>?)");
	createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = "$1~";
	createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
	createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("LONECARET", "(?:\\^)");
	createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = "$1^";
	createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
	createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
	createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
	createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = "$1$2$3";
	createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
	createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
	createToken("STAR", "(<|>)?=?\\s*\\*");
	createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
	createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/internal/parse-options.js
var require_parse_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({});
	const parseOptions = (options) => {
		if (!options) return emptyOpts;
		if (typeof options !== "object") return looseOption;
		return options;
	};
	module.exports = parseOptions;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/internal/identifiers.js
var require_identifiers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const numeric = /^[0-9]+$/;
	const compareIdentifiers = (a, b) => {
		if (typeof a === "number" && typeof b === "number") return a === b ? 0 : a < b ? -1 : 1;
		const anum = numeric.test(a);
		const bnum = numeric.test(b);
		if (anum && bnum) {
			a = +a;
			b = +b;
		}
		return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
	};
	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
	module.exports = {
		compareIdentifiers,
		rcompareIdentifiers
	};
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/classes/semver.js
var require_semver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const debug = require_debug();
	const { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants$5();
	const { safeRe: re, t } = require_re();
	const parseOptions = require_parse_options();
	const { compareIdentifiers } = require_identifiers();
	var SemVer = class SemVer {
		constructor(version, options) {
			options = parseOptions(options);
			if (version instanceof SemVer) if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
			else version = version.version;
			else if (typeof version !== "string") throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
			if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
			debug("SemVer", version, options);
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
			debug("SemVer.compare", this.version, this.options, other);
			if (!(other instanceof SemVer)) {
				if (typeof other === "string" && other === this.version) return 0;
				other = new SemVer(other, this.options);
			}
			if (other.version === this.version) return 0;
			return this.compareMain(other) || this.comparePre(other);
		}
		compareMain(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.major < other.major) return -1;
			if (this.major > other.major) return 1;
			if (this.minor < other.minor) return -1;
			if (this.minor > other.minor) return 1;
			if (this.patch < other.patch) return -1;
			if (this.patch > other.patch) return 1;
			return 0;
		}
		comparePre(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.prerelease.length && !other.prerelease.length) return -1;
			else if (!this.prerelease.length && other.prerelease.length) return 1;
			else if (!this.prerelease.length && !other.prerelease.length) return 0;
			let i = 0;
			do {
				const a = this.prerelease[i];
				const b = other.prerelease[i];
				debug("prerelease compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		compareBuild(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			let i = 0;
			do {
				const a = this.build[i];
				const b = other.build[i];
				debug("build compare", i, a, b);
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
	module.exports = SemVer;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/functions/parse.js
var require_parse$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver();
	const parse = (version, options, throwErrors = false) => {
		if (version instanceof SemVer) return version;
		try {
			return new SemVer(version, options);
		} catch (er) {
			if (!throwErrors) return null;
			throw er;
		}
	};
	module.exports = parse;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/functions/diff.js
var require_diff = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse$1();
	const diff = (version1, version2) => {
		const v1 = parse(version1, null, true);
		const v2 = parse(version2, null, true);
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
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/functions/compare.js
var require_compare = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const SemVer = require_semver();
	const compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
	module.exports = compare;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/functions/gt.js
var require_gt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const compare = require_compare();
	const gt = (a, b, loose) => compare(a, b, loose) > 0;
	module.exports = gt;
}));

//#endregion
//#region node_modules/.pnpm/semver@7.7.3/node_modules/semver/functions/valid.js
var require_valid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse$1();
	const valid = (version, options) => {
		const v = parse(version, options);
		return v ? v.version : null;
	};
	module.exports = valid;
}));

//#endregion
//#region src/compare-and-publish/compare-versions.ts
var import_diff = /* @__PURE__ */ __toESM(require_diff(), 1);
var import_gt = /* @__PURE__ */ __toESM(require_gt(), 1);
var import_valid = /* @__PURE__ */ __toESM(require_valid(), 1);
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
	const oldVersion = (0, import_valid.default)(tags?.[publishTag.value]) ?? void 0;
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
	const { tag, access, dryRun, provenance } = options;
	const publishArguments = [];
	if (packageSpec.length > 0) publishArguments.push(packageSpec);
	if (!tag.isDefault) publishArguments.push("--tag", tag.value);
	if (!access.isDefault && access.value) publishArguments.push("--access", access.value);
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
	const { name, version, packageSpec } = manifest;
	const cliOptions = {
		environment,
		ignoreScripts: options.ignoreScripts.value,
		logger: options.logger
	};
	const viewArguments = getViewArguments(name, options);
	const publishArguments = getPublishArguments(packageSpec, options);
	let viewCall = await callNpmCli(VIEW, viewArguments, cliOptions);
	if (!viewCall.successData && !viewCall.error) viewCall = await callNpmCli(VIEW, getViewArguments(name, options, true), cliOptions);
	if (viewCall.error && viewCall.errorCode !== E404) throw viewCall.error;
	const isDryRun = options.dryRun.value;
	const comparison = compareVersions(version, viewCall.successData, options);
	const publishCall = comparison.type ?? isDryRun ? await callNpmCli(PUBLISH, publishArguments, cliOptions) : {
		successData: void 0,
		errorCode: void 0,
		error: void 0
	};
	if (publishCall.error && publishCall.errorCode !== EPUBLISHCONFLICT) throw publishCall.error;
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
	const lines = [result.id === void 0 ? `🙅‍♀️ ${manifest.name}@${manifest.version} already published.` : `📦 ${result.id}`];
	if (result.files.length > 0) lines.push("", CONTENTS_BANNER);
	for (const { path, size } of result.files) lines.push(`${formatSize(size)}\t${path}`);
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
		token: validateToken(options.token ?? void 0),
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
const setValue = (value, defaultValue, validate) => ({
	value: validate(value ?? defaultValue),
	isDefault: value === void 0
});
const validateToken = (value) => {
	if (typeof value !== "string" && value !== void 0 && value !== null) throw new InvalidTokenError();
	return typeof value === "string" && value.length > 0 ? value : void 0;
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
	constructor(src, dest, opts) {
		this.src = src;
		this.dest = dest;
		this.opts = opts;
		this.ondrain = () => src[RESUME]();
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
	constructor(src, dest, opts) {
		super(src, dest, opts);
		this.proxyErrors = (er) => dest.emit("error", er);
		src.on("error", this.proxyErrors);
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
		const p = this[PIPES].find((p) => p.dest === dest);
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
			const ret = super.emit("close");
			this.removeAllListeners("close");
			return ret;
		} else if (ev === "error") {
			this[EMITTED_ERROR] = data;
			super.emit(ERROR, data);
			const ret = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
			this[MAYBE_EMIT_END]();
			return ret;
		} else if (ev === "resume") {
			const ret = super.emit("resume");
			this[MAYBE_EMIT_END]();
			return ret;
		} else if (ev === "finish" || ev === "prefinish") {
			const ret = super.emit(ev);
			this.removeAllListeners(ev);
			return ret;
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
			return new Promise((res, rej) => {
				reject = rej;
				resolve = res;
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
	constructor(path, opt) {
		opt = opt || {};
		super(opt);
		this.readable = true;
		this.writable = false;
		if (typeof path !== "string") throw new TypeError("path must be a string");
		this[_errored] = false;
		this[_fd] = typeof opt.fd === "number" ? opt.fd : void 0;
		this[_path] = path;
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
	constructor(path, opt) {
		opt = opt || {};
		super(opt);
		this[_path] = path;
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/options.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/make-command.js
const makeCommand = (syncFile, asyncFile, syncNoFile, asyncNoFile, validate) => {
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
		validate?.(opt, entries);
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
		validate
	});
};

//#endregion
//#region node_modules/.pnpm/minizlib@3.1.0/node_modules/minizlib/dist/esm/constants.js
/* c8 ignore start */
const realZlibConstants = realZlib.constants || { ZLIB_VERNUM: 4736 };
/* c8 ignore stop */
const constants$1 = Object.freeze(Object.assign(Object.create(null), {
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
//#region node_modules/.pnpm/minizlib@3.1.0/node_modules/minizlib/dist/esm/index.js
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
	constructor(err, origin) {
		super("zlib: " + err.message, { cause: err });
		this.code = err.code;
		this.errno = err.errno;
		/* c8 ignore next */
		if (!this.code) this.code = "ZLIB_ERROR";
		this.message = "zlib: " + err.message;
		Error.captureStackTrace(this, origin ?? this.constructor);
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
		if (typeof realZlib$1[mode] !== "function") throw new TypeError("Compression method not supported: " + mode);
		try {
			this.#handle = new realZlib$1[mode](opts);
		} catch (er) {
			throw new ZlibError(er, this.constructor);
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
			this.#onError(new ZlibError(err, this.write));
		} finally {
			if (this.#handle) {
				this.#handle._handle = nativeHandle;
				nativeHandle.close = originalNativeClose;
				this.#handle.close = originalClose;
				this.#handle.removeAllListeners("error");
			}
		}
		if (this.#handle) this.#handle.on("error", (er) => this.#onError(new ZlibError(er, this.write)));
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
		opts.flush = opts.flush || constants$1.Z_NO_FLUSH;
		opts.finishFlush = opts.finishFlush || constants$1.Z_FINISH;
		opts.fullFlushFlag = constants$1.Z_FULL_FLUSH;
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
			this.flush(constants$1.Z_SYNC_FLUSH);
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
		opts.flush = opts.flush || constants$1.BROTLI_OPERATION_PROCESS;
		opts.finishFlush = opts.finishFlush || constants$1.BROTLI_OPERATION_FINISH;
		opts.fullFlushFlag = constants$1.BROTLI_OPERATION_FLUSH;
		super(opts, mode);
	}
};
var BrotliDecompress = class extends Brotli {
	constructor(opts) {
		super(opts, "BrotliDecompress");
	}
};
var Zstd = class extends ZlibBase {
	constructor(opts, mode) {
		opts = opts || {};
		opts.flush = opts.flush || constants$1.ZSTD_e_continue;
		opts.finishFlush = opts.finishFlush || constants$1.ZSTD_e_end;
		opts.fullFlushFlag = constants$1.ZSTD_e_flush;
		super(opts, mode);
	}
};
var ZstdDecompress = class extends Zstd {
	constructor(opts) {
		super(opts, "ZstdDecompress");
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/large-numbers.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/types.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/header.js
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
		this.path = ex?.path ?? decString(buf, off, 100);
		this.mode = ex?.mode ?? gex?.mode ?? decNumber(buf, off + 100, 8);
		this.uid = ex?.uid ?? gex?.uid ?? decNumber(buf, off + 108, 8);
		this.gid = ex?.gid ?? gex?.gid ?? decNumber(buf, off + 116, 8);
		this.size = ex?.size ?? gex?.size ?? decNumber(buf, off + 124, 12);
		this.mtime = ex?.mtime ?? gex?.mtime ?? decDate(buf, off + 136, 12);
		this.cksum = decNumber(buf, off + 148, 12);
		if (gex) this.#slurp(gex, true);
		if (ex) this.#slurp(ex);
		const t = decString(buf, off + 156, 1);
		if (isCode(t)) this.#type = t || "0";
		if (this.#type === "0" && this.path.slice(-1) === "/") this.#type = "5";
		if (this.#type === "5") this.size = 0;
		this.linkpath = decString(buf, off + 157, 100);
		if (buf.subarray(off + 257, off + 265).toString() === "ustar\x0000") {
			/* c8 ignore start */
			this.uname = ex?.uname ?? gex?.uname ?? decString(buf, off + 265, 32);
			this.gname = ex?.gname ?? gex?.gname ?? decString(buf, off + 297, 32);
			this.devmaj = ex?.devmaj ?? gex?.devmaj ?? decNumber(buf, off + 329, 8) ?? 0;
			this.devmin = ex?.devmin ?? gex?.devmin ?? decNumber(buf, off + 337, 8) ?? 0;
			/* c8 ignore stop */
			if (buf[off + 475] !== 0) this.path = decString(buf, off + 345, 155) + "/" + this.path;
			else {
				const prefix = decString(buf, off + 345, 130);
				if (prefix) this.path = prefix + "/" + this.path;
				/* c8 ignore start */
				this.atime = ex?.atime ?? gex?.atime ?? decDate(buf, off + 476, 12);
				this.ctime = ex?.ctime ?? gex?.ctime ?? decDate(buf, off + 488, 12);
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
		const path = split[0];
		const prefix = split[1];
		this.needPax = !!split[2];
		this.needPax = encString(buf, off, 100, path) || this.needPax;
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/pax.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/normalize-windows-path.js
const platform$1 = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
const normalizeWindowsPath = platform$1 !== "win32" ? (p) => p : (p) => p && p.replace(/\\/g, "/");

//#endregion
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/read-entry.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/warn-method.js
const warnMethod = (self, code, message, data = {}) => {
	if (self.file) data.file = self.file;
	if (self.cwd) data.cwd = self.cwd;
	data.code = message instanceof Error && message.code || code;
	data.tarCode = code;
	if (!self.strict && data.recoverable !== false) {
		if (message instanceof Error) {
			data = Object.assign(message, data);
			message = message.message;
		}
		self.emit("warn", code, message, data);
	} else if (message instanceof Error) self.emit("error", Object.assign(message, data));
	else self.emit("error", Object.assign(/* @__PURE__ */ new Error(`${code}: ${message}`), data));
};

//#endregion
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/parse.js
const maxMetaEntrySize = 1024 * 1024;
const gzipHeader = Buffer.from([31, 139]);
const zstdHeader = Buffer.from([
	40,
	181,
	47,
	253
]);
const ZIP_HEADER_LEN = Math.max(gzipHeader.length, zstdHeader.length);
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
	zstd;
	writable = true;
	readable = false;
	[QUEUE] = [];
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
		this.brotli = !(opt.gzip || opt.zstd) && opt.brotli !== void 0 ? opt.brotli : isTBR ? void 0 : false;
		const isTZST = opt.file && (opt.file.endsWith(".tar.zst") || opt.file.endsWith(".tzst"));
		this.zstd = !(opt.gzip || opt.brotli) && opt.zstd !== void 0 ? opt.zstd : isTZST ? true : void 0;
		this.on("end", () => this[CLOSESTREAM]());
		if (typeof opt.onwarn === "function") this.on("warn", opt.onwarn);
		if (typeof opt.onReadEntry === "function") this.on("entry", opt.onReadEntry);
	}
	warn(code, message, data = {}) {
		warnMethod(this, code, message, data);
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
			const re = this[READENTRY];
			if (!re || re.flowing || re.size === re.remain) {
				if (!this[WRITING]) this.emit("drain");
			} else re.once("drain", () => this.emit("drain"));
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
	abort(error) {
		this[ABORTED] = true;
		this.emit("abort", error);
		this.warn("TAR_ABORT", error, { recoverable: false });
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
			if (chunk.length < ZIP_HEADER_LEN) {
				this[BUFFER] = chunk;
				/* c8 ignore next */
				cb?.();
				return true;
			}
			for (let i = 0; this[UNZIP] === void 0 && i < gzipHeader.length; i++) if (chunk[i] !== gzipHeader[i]) this[UNZIP] = false;
			let isZstd = false;
			if (this[UNZIP] === false && this.zstd !== false) {
				isZstd = true;
				for (let i = 0; i < zstdHeader.length; i++) if (chunk[i] !== zstdHeader[i]) {
					isZstd = false;
					break;
				}
			}
			const maybeBrotli = this.brotli === void 0 && !isZstd;
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
			if (this[UNZIP] === void 0 || this[UNZIP] === false && (this.brotli || isZstd)) {
				const ended = this[ENDED];
				this[ENDED] = false;
				this[UNZIP] = this[UNZIP] === void 0 ? new Unzip({}) : isZstd ? new ZstdDecompress({}) : new BrotliDecompress({});
				this[UNZIP].on("data", (chunk) => this[CONSUMECHUNK](chunk));
				this[UNZIP].on("error", (er) => this.abort(er));
				this[UNZIP].on("end", () => {
					this[ENDED] = true;
					this[CONSUMECHUNK]();
				});
				this[WRITING] = true;
				const ret = !!this[UNZIP][ended ? "end" : "write"](chunk);
				this[WRITING] = false;
				cb?.();
				return ret;
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
			if (this.brotli === void 0 || this.zstd === void 0) chunk = chunk || Buffer.alloc(0);
			if (chunk) this.write(chunk);
			this[MAYBEEND]();
		}
		return this;
	}
};

//#endregion
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/strip-trailing-slashes.js
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
//#region node_modules/.pnpm/tar@7.5.7/node_modules/tar/dist/esm/list.js
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
		fd = fs$2.openSync(file, "r");
		const stat = fs$2.fstatSync(fd);
		const readSize = opt.maxReadSize || 16 * 1024 * 1024;
		if (stat.size < readSize) {
			const buf = Buffer.allocUnsafe(stat.size);
			const read = fs$2.readSync(fd, buf, 0, stat.size, 0);
			p.end(read === buf.byteLength ? buf : buf.subarray(0, read));
		} else {
			let pos = 0;
			const buf = Buffer.allocUnsafe(readSize);
			while (pos < stat.size) {
				const bytesRead = fs$2.readSync(fd, buf, 0, readSize, pos);
				if (bytesRead === 0) break;
				pos += bytesRead;
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
	const parse = new Parser(opt);
	const readSize = opt.maxReadSize || 16 * 1024 * 1024;
	const file = opt.file;
	return new Promise((resolve, reject) => {
		parse.on("error", reject);
		parse.on("end", resolve);
		fs$2.stat(file, (er, stat) => {
			if (er) reject(er);
			else {
				const stream = new ReadStream(file, {
					readSize,
					size: stat.size
				});
				stream.on("error", reject);
				stream.pipe(parse);
			}
		});
	});
};
const list = makeCommand(listFileSync, listFile, (opt) => new Parser(opt), (opt) => new Parser(opt), (opt, files) => {
	if (files?.length) filesFilter(opt, files);
	if (!opt.noResume) onReadEntryFunction(opt);
});

//#endregion
//#region node_modules/.pnpm/validate-npm-package-name@7.0.2/node_modules/validate-npm-package-name/lib/builtin-modules.json
var require_builtin_modules = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = [
		"_http_agent",
		"_http_client",
		"_http_common",
		"_http_incoming",
		"_http_outgoing",
		"_http_server",
		"_stream_duplex",
		"_stream_passthrough",
		"_stream_readable",
		"_stream_transform",
		"_stream_wrap",
		"_stream_writable",
		"_tls_common",
		"_tls_wrap",
		"assert",
		"assert/strict",
		"async_hooks",
		"buffer",
		"child_process",
		"cluster",
		"console",
		"constants",
		"crypto",
		"dgram",
		"diagnostics_channel",
		"dns",
		"dns/promises",
		"domain",
		"events",
		"fs",
		"fs/promises",
		"http",
		"http2",
		"https",
		"inspector",
		"inspector/promises",
		"module",
		"net",
		"os",
		"path",
		"path/posix",
		"path/win32",
		"perf_hooks",
		"process",
		"punycode",
		"querystring",
		"readline",
		"readline/promises",
		"repl",
		"stream",
		"stream/consumers",
		"stream/promises",
		"stream/web",
		"string_decoder",
		"sys",
		"timers",
		"timers/promises",
		"tls",
		"trace_events",
		"tty",
		"url",
		"util",
		"util/types",
		"v8",
		"vm",
		"wasi",
		"worker_threads",
		"zlib",
		"node:sea",
		"node:sqlite",
		"node:test",
		"node:test/reporters"
	];
}));

//#endregion
//#region node_modules/.pnpm/validate-npm-package-name@7.0.2/node_modules/validate-npm-package-name/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const builtins = require_builtin_modules();
	var scopedPackagePattern = /* @__PURE__ */ new RegExp("^(?:@([^/]+?)[/])?([^/]+?)$");
	var exclusionList = ["node_modules", "favicon.ico"];
	function validate(name) {
		var warnings = [];
		var errors = [];
		if (name === null) {
			errors.push("name cannot be null");
			return done(warnings, errors);
		}
		if (name === void 0) {
			errors.push("name cannot be undefined");
			return done(warnings, errors);
		}
		if (typeof name !== "string") {
			errors.push("name must be a string");
			return done(warnings, errors);
		}
		if (!name.length) errors.push("name length must be greater than zero");
		if (name.startsWith(".")) errors.push("name cannot start with a period");
		if (name.startsWith("-")) errors.push("name cannot start with a hyphen");
		if (name.match(/^_/)) errors.push("name cannot start with an underscore");
		if (name.trim() !== name) errors.push("name cannot contain leading or trailing spaces");
		exclusionList.forEach(function(excludedName) {
			if (name.toLowerCase() === excludedName) errors.push(excludedName + " is not a valid package name");
		});
		if (builtins.includes(name.toLowerCase())) warnings.push(name + " is a core module name");
		if (name.length > 214) warnings.push("name can no longer contain more than 214 characters");
		if (name.toLowerCase() !== name) warnings.push("name can no longer contain capital letters");
		if (/[~'!()*]/.test(name.split("/").slice(-1)[0])) warnings.push("name can no longer contain special characters (\"~'!()*\")");
		if (encodeURIComponent(name) !== name) {
			var nameMatch = name.match(scopedPackagePattern);
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
}));

//#endregion
//#region src/read-manifest.ts
var import_lib = /* @__PURE__ */ __toESM(require_lib(), 1);
const SCOPE_RE = /^(@.+)\/.+$/u;
const MANIFEST_BASENAME = "package.json";
const TARBALL_EXTNAME = ".tgz";
const isManifest = (file) => {
	return typeof file === "string" && path.basename(file) === MANIFEST_BASENAME;
};
const isDirectory = (file) => {
	return typeof file === "string" && path.extname(file) === "";
};
const isTarball = (file) => {
	return typeof file === "string" && path.extname(file) === TARBALL_EXTNAME;
};
const normalizeVersion = (version) => {
	return (0, import_valid.default)(version) ?? void 0;
};
const validateName = (name) => {
	return (0, import_lib.default)(name).validForNewPackages;
};
const readPackageJson = async (...pathSegments) => {
	const file = path.resolve(...pathSegments);
	try {
		return await fs.readFile(file, "utf8");
	} catch (error) {
		throw new PackageJsonReadError(file, error);
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
	} catch (error) {
		throw new PackageTarballReadError(file, error);
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
	} else if (isDirectory(packagePath)) {
		packageSpec = path.resolve(packagePath);
		manifestContents = await readPackageJson(packagePath, MANIFEST_BASENAME);
	} else if (isTarball(packagePath)) {
		packageSpec = path.resolve(packagePath);
		manifestContents = await readTarballPackageJson(packageSpec);
	} else throw new InvalidPackageError(packagePath);
	let manifestJson;
	let name;
	let version;
	let publishConfig;
	try {
		manifestJson = JSON.parse(manifestContents);
		name = manifestJson.name;
		version = normalizeVersion(manifestJson.version);
		publishConfig = manifestJson.publishConfig ?? {};
	} catch (error) {
		throw new PackageJsonParseError(packageSpec, error);
	}
	if (!validateName(name)) throw new InvalidPackageNameError(name);
	if (typeof version !== "string") throw new InvalidPackageVersionError(manifestJson.version);
	if (typeof publishConfig !== "object" || Array.isArray(publishConfig) || !publishConfig) throw new InvalidPackagePublishConfigError(publishConfig);
	return {
		packageSpec,
		name,
		version,
		publishConfig,
		scope: SCOPE_RE.exec(name)?.[1]
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
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/utils.js
/**
* Sanitizes an input into a string so it can be passed into issueCommand safely
* @param input input to sanitize into a string
*/
function toCommandValue(input) {
	if (input === null || input === void 0) return "";
	else if (typeof input === "string" || input instanceof String) return input;
	return JSON.stringify(input);
}
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

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/command.js
/**
* Issues a command to the GitHub Actions runner
*
* @param command - The command name to issue
* @param properties - Additional properties for the command (key-value pairs)
* @param message - The message to include with the command
* @remarks
* This function outputs a specially formatted string to stdout that the Actions
* runner interprets as a command. These commands can control workflow behavior,
* set outputs, create annotations, mask values, and more.
*
* Command Format:
*   ::name key=value,key=value::message
*
* @example
* ```typescript
* // Issue a warning annotation
* issueCommand('warning', {}, 'This is a warning message');
* // Output: ::warning::This is a warning message
*
* // Set an environment variable
* issueCommand('set-env', { name: 'MY_VAR' }, 'some value');
* // Output: ::set-env name=MY_VAR::some value
*
* // Add a secret mask
* issueCommand('add-mask', {}, 'secretValue123');
* // Output: ::add-mask::secretValue123
* ```
*
* @internal
* This is an internal utility function that powers the public API functions
* such as setSecret, warning, error, and exportVariable.
*/
function issueCommand(command, properties, message) {
	const cmd = new Command(command, properties, message);
	process.stdout.write(cmd.toString() + os$2.EOL);
}
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
	return toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProperty(s) {
	return toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
}

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/file-command.js
function issueFileCommand(command, message) {
	const filePath = process.env[`GITHUB_${command}`];
	if (!filePath) throw new Error(`Unable to find environment variable for file command ${command}`);
	if (!fs$3.existsSync(filePath)) throw new Error(`Missing file at path: ${filePath}`);
	fs$3.appendFileSync(filePath, `${toCommandValue(message)}${os$2.EOL}`, { encoding: "utf8" });
}
function prepareKeyValueMessage(key, value) {
	const delimiter = `ghadelimiter_${crypto.randomUUID()}`;
	const convertedValue = toCommandValue(value);
	if (key.includes(delimiter)) throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
	if (convertedValue.includes(delimiter)) throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
	return `${key}<<${delimiter}${os$2.EOL}${convertedValue}${os$2.EOL}${delimiter}`;
}

//#endregion
//#region node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/lib/tunnel.js
var require_tunnel$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	__require("net");
	var tls = __require("tls");
	var http$1 = __require("http");
	var https = __require("https");
	var events = __require("events");
	__require("assert");
	var util$2 = __require("util");
	function TunnelingAgent(options) {
		var self = this;
		self.options = options || {};
		self.proxyOptions = self.options.proxy || {};
		self.maxSockets = self.options.maxSockets || http$1.Agent.defaultMaxSockets;
		self.requests = [];
		self.sockets = [];
		self.on("free", function onFree(socket, host, port, localAddress) {
			var options = toOptions(host, port, localAddress);
			for (var i = 0, len = self.requests.length; i < len; ++i) {
				var pending = self.requests[i];
				if (pending.host === options.host && pending.port === options.port) {
					self.requests.splice(i, 1);
					pending.request.onSocket(socket);
					return;
				}
			}
			socket.destroy();
			self.removeSocket(socket);
		});
	}
	util$2.inherits(TunnelingAgent, events.EventEmitter);
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
		debug("making CONNECT request");
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
				debug("tunneling socket could not be established, statusCode=%d", res.statusCode);
				socket.destroy();
				var error = /* @__PURE__ */ new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
				error.code = "ECONNRESET";
				options.request.emit("error", error);
				self.removeSocket(placeholder);
				return;
			}
			if (head.length > 0) {
				debug("got illegal response body from proxy");
				socket.destroy();
				var error = /* @__PURE__ */ new Error("got illegal response body from proxy");
				error.code = "ECONNRESET";
				options.request.emit("error", error);
				self.removeSocket(placeholder);
				return;
			}
			debug("tunneling connection has established");
			self.sockets[self.sockets.indexOf(placeholder)] = socket;
			return cb(socket);
		}
		function onError(cause) {
			connectReq.removeAllListeners();
			debug("tunneling socket could not be established, cause=%s\n", cause.message, cause.stack);
			var error = /* @__PURE__ */ new Error("tunneling socket could not be established, cause=" + cause.message);
			error.code = "ECONNRESET";
			options.request.emit("error", error);
			self.removeSocket(placeholder);
		}
	};
	TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
		var pos = this.sockets.indexOf(socket);
		if (pos === -1) return;
		this.sockets.splice(pos, 1);
		var pending = this.requests.shift();
		if (pending) this.createSocket(pending, function(socket) {
			pending.request.onSocket(socket);
		});
	};
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
	var debug;
	if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) debug = function() {
		var args = Array.prototype.slice.call(arguments);
		if (typeof args[0] === "string") args[0] = "TUNNEL: " + args[0];
		else args.unshift("TUNNEL:");
		console.error.apply(console, args);
	};
	else debug = function() {};
}));

//#endregion
//#region node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/index.js
var require_tunnel = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_tunnel$1();
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/symbols.js
var require_symbols$4 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kClose: Symbol("close"),
		kDestroy: Symbol("destroy"),
		kDispatch: Symbol("dispatch"),
		kUrl: Symbol("url"),
		kWriting: Symbol("writing"),
		kResuming: Symbol("resuming"),
		kQueue: Symbol("queue"),
		kConnect: Symbol("connect"),
		kConnecting: Symbol("connecting"),
		kKeepAliveDefaultTimeout: Symbol("default keep alive timeout"),
		kKeepAliveMaxTimeout: Symbol("max keep alive timeout"),
		kKeepAliveTimeoutThreshold: Symbol("keep alive timeout threshold"),
		kKeepAliveTimeoutValue: Symbol("keep alive timeout"),
		kKeepAlive: Symbol("keep alive"),
		kHeadersTimeout: Symbol("headers timeout"),
		kBodyTimeout: Symbol("body timeout"),
		kServerName: Symbol("server name"),
		kLocalAddress: Symbol("local address"),
		kHost: Symbol("host"),
		kNoRef: Symbol("no ref"),
		kBodyUsed: Symbol("used"),
		kBody: Symbol("abstracted request body"),
		kRunning: Symbol("running"),
		kBlocking: Symbol("blocking"),
		kPending: Symbol("pending"),
		kSize: Symbol("size"),
		kBusy: Symbol("busy"),
		kQueued: Symbol("queued"),
		kFree: Symbol("free"),
		kConnected: Symbol("connected"),
		kClosed: Symbol("closed"),
		kNeedDrain: Symbol("need drain"),
		kReset: Symbol("reset"),
		kDestroyed: Symbol.for("nodejs.stream.destroyed"),
		kResume: Symbol("resume"),
		kOnError: Symbol("on error"),
		kMaxHeadersSize: Symbol("max headers size"),
		kRunningIdx: Symbol("running index"),
		kPendingIdx: Symbol("pending index"),
		kError: Symbol("error"),
		kClients: Symbol("clients"),
		kClient: Symbol("client"),
		kParser: Symbol("parser"),
		kOnDestroyed: Symbol("destroy callbacks"),
		kPipelining: Symbol("pipelining"),
		kSocket: Symbol("socket"),
		kHostHeader: Symbol("host header"),
		kConnector: Symbol("connector"),
		kStrictContentLength: Symbol("strict content length"),
		kMaxRedirections: Symbol("maxRedirections"),
		kMaxRequests: Symbol("maxRequestsPerClient"),
		kProxy: Symbol("proxy agent options"),
		kCounter: Symbol("socket request counter"),
		kInterceptors: Symbol("dispatch interceptors"),
		kMaxResponseSize: Symbol("max response size"),
		kHTTP2Session: Symbol("http2Session"),
		kHTTP2SessionState: Symbol("http2Session state"),
		kRetryHandlerDefaultRetry: Symbol("retry agent default retry"),
		kConstruct: Symbol("constructable"),
		kListeners: Symbol("listeners"),
		kHTTPContext: Symbol("http context"),
		kMaxConcurrentStreams: Symbol("max concurrent streams"),
		kNoProxyAgent: Symbol("no proxy agent"),
		kHttpProxyAgent: Symbol("http proxy agent"),
		kHttpsProxyAgent: Symbol("https proxy agent")
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const kUndiciError = Symbol.for("undici.error.UND_ERR");
	var UndiciError = class extends Error {
		constructor(message) {
			super(message);
			this.name = "UndiciError";
			this.code = "UND_ERR";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kUndiciError] === true;
		}
		[kUndiciError] = true;
	};
	const kConnectTimeoutError = Symbol.for("undici.error.UND_ERR_CONNECT_TIMEOUT");
	var ConnectTimeoutError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "ConnectTimeoutError";
			this.message = message || "Connect Timeout Error";
			this.code = "UND_ERR_CONNECT_TIMEOUT";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kConnectTimeoutError] === true;
		}
		[kConnectTimeoutError] = true;
	};
	const kHeadersTimeoutError = Symbol.for("undici.error.UND_ERR_HEADERS_TIMEOUT");
	var HeadersTimeoutError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "HeadersTimeoutError";
			this.message = message || "Headers Timeout Error";
			this.code = "UND_ERR_HEADERS_TIMEOUT";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kHeadersTimeoutError] === true;
		}
		[kHeadersTimeoutError] = true;
	};
	const kHeadersOverflowError = Symbol.for("undici.error.UND_ERR_HEADERS_OVERFLOW");
	var HeadersOverflowError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "HeadersOverflowError";
			this.message = message || "Headers Overflow Error";
			this.code = "UND_ERR_HEADERS_OVERFLOW";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kHeadersOverflowError] === true;
		}
		[kHeadersOverflowError] = true;
	};
	const kBodyTimeoutError = Symbol.for("undici.error.UND_ERR_BODY_TIMEOUT");
	var BodyTimeoutError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "BodyTimeoutError";
			this.message = message || "Body Timeout Error";
			this.code = "UND_ERR_BODY_TIMEOUT";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kBodyTimeoutError] === true;
		}
		[kBodyTimeoutError] = true;
	};
	const kResponseStatusCodeError = Symbol.for("undici.error.UND_ERR_RESPONSE_STATUS_CODE");
	var ResponseStatusCodeError = class extends UndiciError {
		constructor(message, statusCode, headers, body) {
			super(message);
			this.name = "ResponseStatusCodeError";
			this.message = message || "Response Status Code Error";
			this.code = "UND_ERR_RESPONSE_STATUS_CODE";
			this.body = body;
			this.status = statusCode;
			this.statusCode = statusCode;
			this.headers = headers;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kResponseStatusCodeError] === true;
		}
		[kResponseStatusCodeError] = true;
	};
	const kInvalidArgumentError = Symbol.for("undici.error.UND_ERR_INVALID_ARG");
	var InvalidArgumentError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "InvalidArgumentError";
			this.message = message || "Invalid Argument Error";
			this.code = "UND_ERR_INVALID_ARG";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kInvalidArgumentError] === true;
		}
		[kInvalidArgumentError] = true;
	};
	const kInvalidReturnValueError = Symbol.for("undici.error.UND_ERR_INVALID_RETURN_VALUE");
	var InvalidReturnValueError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "InvalidReturnValueError";
			this.message = message || "Invalid Return Value Error";
			this.code = "UND_ERR_INVALID_RETURN_VALUE";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kInvalidReturnValueError] === true;
		}
		[kInvalidReturnValueError] = true;
	};
	const kAbortError = Symbol.for("undici.error.UND_ERR_ABORT");
	var AbortError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "AbortError";
			this.message = message || "The operation was aborted";
			this.code = "UND_ERR_ABORT";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kAbortError] === true;
		}
		[kAbortError] = true;
	};
	const kRequestAbortedError = Symbol.for("undici.error.UND_ERR_ABORTED");
	var RequestAbortedError = class extends AbortError {
		constructor(message) {
			super(message);
			this.name = "AbortError";
			this.message = message || "Request aborted";
			this.code = "UND_ERR_ABORTED";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kRequestAbortedError] === true;
		}
		[kRequestAbortedError] = true;
	};
	const kInformationalError = Symbol.for("undici.error.UND_ERR_INFO");
	var InformationalError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "InformationalError";
			this.message = message || "Request information";
			this.code = "UND_ERR_INFO";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kInformationalError] === true;
		}
		[kInformationalError] = true;
	};
	const kRequestContentLengthMismatchError = Symbol.for("undici.error.UND_ERR_REQ_CONTENT_LENGTH_MISMATCH");
	var RequestContentLengthMismatchError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "RequestContentLengthMismatchError";
			this.message = message || "Request body length does not match content-length header";
			this.code = "UND_ERR_REQ_CONTENT_LENGTH_MISMATCH";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kRequestContentLengthMismatchError] === true;
		}
		[kRequestContentLengthMismatchError] = true;
	};
	const kResponseContentLengthMismatchError = Symbol.for("undici.error.UND_ERR_RES_CONTENT_LENGTH_MISMATCH");
	var ResponseContentLengthMismatchError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "ResponseContentLengthMismatchError";
			this.message = message || "Response body length does not match content-length header";
			this.code = "UND_ERR_RES_CONTENT_LENGTH_MISMATCH";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kResponseContentLengthMismatchError] === true;
		}
		[kResponseContentLengthMismatchError] = true;
	};
	const kClientDestroyedError = Symbol.for("undici.error.UND_ERR_DESTROYED");
	var ClientDestroyedError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "ClientDestroyedError";
			this.message = message || "The client is destroyed";
			this.code = "UND_ERR_DESTROYED";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kClientDestroyedError] === true;
		}
		[kClientDestroyedError] = true;
	};
	const kClientClosedError = Symbol.for("undici.error.UND_ERR_CLOSED");
	var ClientClosedError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "ClientClosedError";
			this.message = message || "The client is closed";
			this.code = "UND_ERR_CLOSED";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kClientClosedError] === true;
		}
		[kClientClosedError] = true;
	};
	const kSocketError = Symbol.for("undici.error.UND_ERR_SOCKET");
	var SocketError = class extends UndiciError {
		constructor(message, socket) {
			super(message);
			this.name = "SocketError";
			this.message = message || "Socket error";
			this.code = "UND_ERR_SOCKET";
			this.socket = socket;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kSocketError] === true;
		}
		[kSocketError] = true;
	};
	const kNotSupportedError = Symbol.for("undici.error.UND_ERR_NOT_SUPPORTED");
	var NotSupportedError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "NotSupportedError";
			this.message = message || "Not supported error";
			this.code = "UND_ERR_NOT_SUPPORTED";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kNotSupportedError] === true;
		}
		[kNotSupportedError] = true;
	};
	const kBalancedPoolMissingUpstreamError = Symbol.for("undici.error.UND_ERR_BPL_MISSING_UPSTREAM");
	var BalancedPoolMissingUpstreamError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "MissingUpstreamError";
			this.message = message || "No upstream has been added to the BalancedPool";
			this.code = "UND_ERR_BPL_MISSING_UPSTREAM";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kBalancedPoolMissingUpstreamError] === true;
		}
		[kBalancedPoolMissingUpstreamError] = true;
	};
	const kHTTPParserError = Symbol.for("undici.error.UND_ERR_HTTP_PARSER");
	var HTTPParserError = class extends Error {
		constructor(message, code, data) {
			super(message);
			this.name = "HTTPParserError";
			this.code = code ? `HPE_${code}` : void 0;
			this.data = data ? data.toString() : void 0;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kHTTPParserError] === true;
		}
		[kHTTPParserError] = true;
	};
	const kResponseExceededMaxSizeError = Symbol.for("undici.error.UND_ERR_RES_EXCEEDED_MAX_SIZE");
	var ResponseExceededMaxSizeError = class extends UndiciError {
		constructor(message) {
			super(message);
			this.name = "ResponseExceededMaxSizeError";
			this.message = message || "Response content exceeded max size";
			this.code = "UND_ERR_RES_EXCEEDED_MAX_SIZE";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kResponseExceededMaxSizeError] === true;
		}
		[kResponseExceededMaxSizeError] = true;
	};
	const kRequestRetryError = Symbol.for("undici.error.UND_ERR_REQ_RETRY");
	var RequestRetryError = class extends UndiciError {
		constructor(message, code, { headers, data }) {
			super(message);
			this.name = "RequestRetryError";
			this.message = message || "Request retry error";
			this.code = "UND_ERR_REQ_RETRY";
			this.statusCode = code;
			this.data = data;
			this.headers = headers;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kRequestRetryError] === true;
		}
		[kRequestRetryError] = true;
	};
	const kResponseError = Symbol.for("undici.error.UND_ERR_RESPONSE");
	var ResponseError = class extends UndiciError {
		constructor(message, code, { headers, data }) {
			super(message);
			this.name = "ResponseError";
			this.message = message || "Response error";
			this.code = "UND_ERR_RESPONSE";
			this.statusCode = code;
			this.data = data;
			this.headers = headers;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kResponseError] === true;
		}
		[kResponseError] = true;
	};
	const kSecureProxyConnectionError = Symbol.for("undici.error.UND_ERR_PRX_TLS");
	var SecureProxyConnectionError = class extends UndiciError {
		constructor(cause, message, options) {
			super(message, {
				cause,
				...options ?? {}
			});
			this.name = "SecureProxyConnectionError";
			this.message = message || "Secure Proxy Connection failed";
			this.code = "UND_ERR_PRX_TLS";
			this.cause = cause;
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kSecureProxyConnectionError] === true;
		}
		[kSecureProxyConnectionError] = true;
	};
	module.exports = {
		AbortError,
		HTTPParserError,
		UndiciError,
		HeadersTimeoutError,
		HeadersOverflowError,
		BodyTimeoutError,
		RequestContentLengthMismatchError,
		ConnectTimeoutError,
		ResponseStatusCodeError,
		InvalidArgumentError,
		InvalidReturnValueError,
		RequestAbortedError,
		ClientDestroyedError,
		ClientClosedError,
		InformationalError,
		SocketError,
		NotSupportedError,
		ResponseContentLengthMismatchError,
		BalancedPoolMissingUpstreamError,
		ResponseExceededMaxSizeError,
		RequestRetryError,
		ResponseError,
		SecureProxyConnectionError
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/constants.js
var require_constants$4 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** @type {Record<string, string | undefined>} */
	const headerNameLowerCasedRecord = {};
	const wellknownHeaderNames = [
		"Accept",
		"Accept-Encoding",
		"Accept-Language",
		"Accept-Ranges",
		"Access-Control-Allow-Credentials",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Methods",
		"Access-Control-Allow-Origin",
		"Access-Control-Expose-Headers",
		"Access-Control-Max-Age",
		"Access-Control-Request-Headers",
		"Access-Control-Request-Method",
		"Age",
		"Allow",
		"Alt-Svc",
		"Alt-Used",
		"Authorization",
		"Cache-Control",
		"Clear-Site-Data",
		"Connection",
		"Content-Disposition",
		"Content-Encoding",
		"Content-Language",
		"Content-Length",
		"Content-Location",
		"Content-Range",
		"Content-Security-Policy",
		"Content-Security-Policy-Report-Only",
		"Content-Type",
		"Cookie",
		"Cross-Origin-Embedder-Policy",
		"Cross-Origin-Opener-Policy",
		"Cross-Origin-Resource-Policy",
		"Date",
		"Device-Memory",
		"Downlink",
		"ECT",
		"ETag",
		"Expect",
		"Expect-CT",
		"Expires",
		"Forwarded",
		"From",
		"Host",
		"If-Match",
		"If-Modified-Since",
		"If-None-Match",
		"If-Range",
		"If-Unmodified-Since",
		"Keep-Alive",
		"Last-Modified",
		"Link",
		"Location",
		"Max-Forwards",
		"Origin",
		"Permissions-Policy",
		"Pragma",
		"Proxy-Authenticate",
		"Proxy-Authorization",
		"RTT",
		"Range",
		"Referer",
		"Referrer-Policy",
		"Refresh",
		"Retry-After",
		"Sec-WebSocket-Accept",
		"Sec-WebSocket-Extensions",
		"Sec-WebSocket-Key",
		"Sec-WebSocket-Protocol",
		"Sec-WebSocket-Version",
		"Server",
		"Server-Timing",
		"Service-Worker-Allowed",
		"Service-Worker-Navigation-Preload",
		"Set-Cookie",
		"SourceMap",
		"Strict-Transport-Security",
		"Supports-Loading-Mode",
		"TE",
		"Timing-Allow-Origin",
		"Trailer",
		"Transfer-Encoding",
		"Upgrade",
		"Upgrade-Insecure-Requests",
		"User-Agent",
		"Vary",
		"Via",
		"WWW-Authenticate",
		"X-Content-Type-Options",
		"X-DNS-Prefetch-Control",
		"X-Frame-Options",
		"X-Permitted-Cross-Domain-Policies",
		"X-Powered-By",
		"X-Requested-With",
		"X-XSS-Protection"
	];
	for (let i = 0; i < wellknownHeaderNames.length; ++i) {
		const key = wellknownHeaderNames[i];
		const lowerCasedKey = key.toLowerCase();
		headerNameLowerCasedRecord[key] = headerNameLowerCasedRecord[lowerCasedKey] = lowerCasedKey;
	}
	Object.setPrototypeOf(headerNameLowerCasedRecord, null);
	module.exports = {
		wellknownHeaderNames,
		headerNameLowerCasedRecord
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/tree.js
var require_tree = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { wellknownHeaderNames, headerNameLowerCasedRecord } = require_constants$4();
	var TstNode = class TstNode {
		/** @type {any} */
		value = null;
		/** @type {null | TstNode} */
		left = null;
		/** @type {null | TstNode} */
		middle = null;
		/** @type {null | TstNode} */
		right = null;
		/** @type {number} */
		code;
		/**
		* @param {string} key
		* @param {any} value
		* @param {number} index
		*/
		constructor(key, value, index) {
			if (index === void 0 || index >= key.length) throw new TypeError("Unreachable");
			if ((this.code = key.charCodeAt(index)) > 127) throw new TypeError("key must be ascii string");
			if (key.length !== ++index) this.middle = new TstNode(key, value, index);
			else this.value = value;
		}
		/**
		* @param {string} key
		* @param {any} value
		*/
		add(key, value) {
			const length = key.length;
			if (length === 0) throw new TypeError("Unreachable");
			let index = 0;
			let node = this;
			while (true) {
				const code = key.charCodeAt(index);
				if (code > 127) throw new TypeError("key must be ascii string");
				if (node.code === code) if (length === ++index) {
					node.value = value;
					break;
				} else if (node.middle !== null) node = node.middle;
				else {
					node.middle = new TstNode(key, value, index);
					break;
				}
				else if (node.code < code) if (node.left !== null) node = node.left;
				else {
					node.left = new TstNode(key, value, index);
					break;
				}
				else if (node.right !== null) node = node.right;
				else {
					node.right = new TstNode(key, value, index);
					break;
				}
			}
		}
		/**
		* @param {Uint8Array} key
		* @return {TstNode | null}
		*/
		search(key) {
			const keylength = key.length;
			let index = 0;
			let node = this;
			while (node !== null && index < keylength) {
				let code = key[index];
				if (code <= 90 && code >= 65) code |= 32;
				while (node !== null) {
					if (code === node.code) {
						if (keylength === ++index) return node;
						node = node.middle;
						break;
					}
					node = node.code < code ? node.left : node.right;
				}
			}
			return null;
		}
	};
	var TernarySearchTree = class {
		/** @type {TstNode | null} */
		node = null;
		/**
		* @param {string} key
		* @param {any} value
		* */
		insert(key, value) {
			if (this.node === null) this.node = new TstNode(key, value, 0);
			else this.node.add(key, value);
		}
		/**
		* @param {Uint8Array} key
		* @return {any}
		*/
		lookup(key) {
			return this.node?.search(key)?.value ?? null;
		}
	};
	const tree = new TernarySearchTree();
	for (let i = 0; i < wellknownHeaderNames.length; ++i) {
		const key = headerNameLowerCasedRecord[wellknownHeaderNames[i]];
		tree.insert(key, key);
	}
	module.exports = {
		TernarySearchTree,
		tree
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/util.js
var require_util$7 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$27 = __require("node:assert");
	const { kDestroyed, kBodyUsed, kListeners, kBody } = require_symbols$4();
	const { IncomingMessage } = __require("node:http");
	const stream = __require("node:stream");
	const net$2 = __require("node:net");
	const { Blob: Blob$3 } = __require("node:buffer");
	const nodeUtil$3 = __require("node:util");
	const { stringify } = __require("node:querystring");
	const { EventEmitter: EE$3 } = __require("node:events");
	const { InvalidArgumentError } = require_errors();
	const { headerNameLowerCasedRecord } = require_constants$4();
	const { tree } = require_tree();
	const [nodeMajor, nodeMinor] = process.versions.node.split(".").map((v) => Number(v));
	var BodyAsyncIterable = class {
		constructor(body) {
			this[kBody] = body;
			this[kBodyUsed] = false;
		}
		async *[Symbol.asyncIterator]() {
			assert$27(!this[kBodyUsed], "disturbed");
			this[kBodyUsed] = true;
			yield* this[kBody];
		}
	};
	function wrapRequestBody(body) {
		if (isStream(body)) {
			if (bodyLength(body) === 0) body.on("data", function() {
				assert$27(false);
			});
			if (typeof body.readableDidRead !== "boolean") {
				body[kBodyUsed] = false;
				EE$3.prototype.on.call(body, "data", function() {
					this[kBodyUsed] = true;
				});
			}
			return body;
		} else if (body && typeof body.pipeTo === "function") return new BodyAsyncIterable(body);
		else if (body && typeof body !== "string" && !ArrayBuffer.isView(body) && isIterable(body)) return new BodyAsyncIterable(body);
		else return body;
	}
	function nop() {}
	function isStream(obj) {
		return obj && typeof obj === "object" && typeof obj.pipe === "function" && typeof obj.on === "function";
	}
	function isBlobLike(object) {
		if (object === null) return false;
		else if (object instanceof Blob$3) return true;
		else if (typeof object !== "object") return false;
		else {
			const sTag = object[Symbol.toStringTag];
			return (sTag === "Blob" || sTag === "File") && ("stream" in object && typeof object.stream === "function" || "arrayBuffer" in object && typeof object.arrayBuffer === "function");
		}
	}
	function buildURL(url, queryParams) {
		if (url.includes("?") || url.includes("#")) throw new Error("Query params cannot be passed when url already contains \"?\" or \"#\".");
		const stringified = stringify(queryParams);
		if (stringified) url += "?" + stringified;
		return url;
	}
	function isValidPort(port) {
		const value = parseInt(port, 10);
		return value === Number(port) && value >= 0 && value <= 65535;
	}
	function isHttpOrHttpsPrefixed(value) {
		return value != null && value[0] === "h" && value[1] === "t" && value[2] === "t" && value[3] === "p" && (value[4] === ":" || value[4] === "s" && value[5] === ":");
	}
	function parseURL(url) {
		if (typeof url === "string") {
			url = new URL(url);
			if (!isHttpOrHttpsPrefixed(url.origin || url.protocol)) throw new InvalidArgumentError("Invalid URL protocol: the URL must start with `http:` or `https:`.");
			return url;
		}
		if (!url || typeof url !== "object") throw new InvalidArgumentError("Invalid URL: The URL argument must be a non-null object.");
		if (!(url instanceof URL)) {
			if (url.port != null && url.port !== "" && isValidPort(url.port) === false) throw new InvalidArgumentError("Invalid URL: port must be a valid integer or a string representation of an integer.");
			if (url.path != null && typeof url.path !== "string") throw new InvalidArgumentError("Invalid URL path: the path must be a string or null/undefined.");
			if (url.pathname != null && typeof url.pathname !== "string") throw new InvalidArgumentError("Invalid URL pathname: the pathname must be a string or null/undefined.");
			if (url.hostname != null && typeof url.hostname !== "string") throw new InvalidArgumentError("Invalid URL hostname: the hostname must be a string or null/undefined.");
			if (url.origin != null && typeof url.origin !== "string") throw new InvalidArgumentError("Invalid URL origin: the origin must be a string or null/undefined.");
			if (!isHttpOrHttpsPrefixed(url.origin || url.protocol)) throw new InvalidArgumentError("Invalid URL protocol: the URL must start with `http:` or `https:`.");
			const port = url.port != null ? url.port : url.protocol === "https:" ? 443 : 80;
			let origin = url.origin != null ? url.origin : `${url.protocol || ""}//${url.hostname || ""}:${port}`;
			let path = url.path != null ? url.path : `${url.pathname || ""}${url.search || ""}`;
			if (origin[origin.length - 1] === "/") origin = origin.slice(0, origin.length - 1);
			if (path && path[0] !== "/") path = `/${path}`;
			return new URL(`${origin}${path}`);
		}
		if (!isHttpOrHttpsPrefixed(url.origin || url.protocol)) throw new InvalidArgumentError("Invalid URL protocol: the URL must start with `http:` or `https:`.");
		return url;
	}
	function parseOrigin(url) {
		url = parseURL(url);
		if (url.pathname !== "/" || url.search || url.hash) throw new InvalidArgumentError("invalid url");
		return url;
	}
	function getHostname(host) {
		if (host[0] === "[") {
			const idx = host.indexOf("]");
			assert$27(idx !== -1);
			return host.substring(1, idx);
		}
		const idx = host.indexOf(":");
		if (idx === -1) return host;
		return host.substring(0, idx);
	}
	function getServerName(host) {
		if (!host) return null;
		assert$27(typeof host === "string");
		const servername = getHostname(host);
		if (net$2.isIP(servername)) return "";
		return servername;
	}
	function deepClone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
	function isAsyncIterable(obj) {
		return !!(obj != null && typeof obj[Symbol.asyncIterator] === "function");
	}
	function isIterable(obj) {
		return !!(obj != null && (typeof obj[Symbol.iterator] === "function" || typeof obj[Symbol.asyncIterator] === "function"));
	}
	function bodyLength(body) {
		if (body == null) return 0;
		else if (isStream(body)) {
			const state = body._readableState;
			return state && state.objectMode === false && state.ended === true && Number.isFinite(state.length) ? state.length : null;
		} else if (isBlobLike(body)) return body.size != null ? body.size : null;
		else if (isBuffer(body)) return body.byteLength;
		return null;
	}
	function isDestroyed(body) {
		return body && !!(body.destroyed || body[kDestroyed] || stream.isDestroyed?.(body));
	}
	function destroy(stream, err) {
		if (stream == null || !isStream(stream) || isDestroyed(stream)) return;
		if (typeof stream.destroy === "function") {
			if (Object.getPrototypeOf(stream).constructor === IncomingMessage) stream.socket = null;
			stream.destroy(err);
		} else if (err) queueMicrotask(() => {
			stream.emit("error", err);
		});
		if (stream.destroyed !== true) stream[kDestroyed] = true;
	}
	const KEEPALIVE_TIMEOUT_EXPR = /timeout=(\d+)/;
	function parseKeepAliveTimeout(val) {
		const m = val.toString().match(KEEPALIVE_TIMEOUT_EXPR);
		return m ? parseInt(m[1], 10) * 1e3 : null;
	}
	/**
	* Retrieves a header name and returns its lowercase value.
	* @param {string | Buffer} value Header name
	* @returns {string}
	*/
	function headerNameToString(value) {
		return typeof value === "string" ? headerNameLowerCasedRecord[value] ?? value.toLowerCase() : tree.lookup(value) ?? value.toString("latin1").toLowerCase();
	}
	/**
	* Receive the buffer as a string and return its lowercase value.
	* @param {Buffer} value Header name
	* @returns {string}
	*/
	function bufferToLowerCasedHeaderName(value) {
		return tree.lookup(value) ?? value.toString("latin1").toLowerCase();
	}
	/**
	* @param {Record<string, string | string[]> | (Buffer | string | (Buffer | string)[])[]} headers
	* @param {Record<string, string | string[]>} [obj]
	* @returns {Record<string, string | string[]>}
	*/
	function parseHeaders(headers, obj) {
		if (obj === void 0) obj = {};
		for (let i = 0; i < headers.length; i += 2) {
			const key = headerNameToString(headers[i]);
			let val = obj[key];
			if (val) {
				if (typeof val === "string") {
					val = [val];
					obj[key] = val;
				}
				val.push(headers[i + 1].toString("utf8"));
			} else {
				const headersValue = headers[i + 1];
				if (typeof headersValue === "string") obj[key] = headersValue;
				else obj[key] = Array.isArray(headersValue) ? headersValue.map((x) => x.toString("utf8")) : headersValue.toString("utf8");
			}
		}
		if ("content-length" in obj && "content-disposition" in obj) obj["content-disposition"] = Buffer.from(obj["content-disposition"]).toString("latin1");
		return obj;
	}
	function parseRawHeaders(headers) {
		const len = headers.length;
		const ret = new Array(len);
		let hasContentLength = false;
		let contentDispositionIdx = -1;
		let key;
		let val;
		let kLen = 0;
		for (let n = 0; n < headers.length; n += 2) {
			key = headers[n];
			val = headers[n + 1];
			typeof key !== "string" && (key = key.toString());
			typeof val !== "string" && (val = val.toString("utf8"));
			kLen = key.length;
			if (kLen === 14 && key[7] === "-" && (key === "content-length" || key.toLowerCase() === "content-length")) hasContentLength = true;
			else if (kLen === 19 && key[7] === "-" && (key === "content-disposition" || key.toLowerCase() === "content-disposition")) contentDispositionIdx = n + 1;
			ret[n] = key;
			ret[n + 1] = val;
		}
		if (hasContentLength && contentDispositionIdx !== -1) ret[contentDispositionIdx] = Buffer.from(ret[contentDispositionIdx]).toString("latin1");
		return ret;
	}
	function isBuffer(buffer) {
		return buffer instanceof Uint8Array || Buffer.isBuffer(buffer);
	}
	function validateHandler(handler, method, upgrade) {
		if (!handler || typeof handler !== "object") throw new InvalidArgumentError("handler must be an object");
		if (typeof handler.onConnect !== "function") throw new InvalidArgumentError("invalid onConnect method");
		if (typeof handler.onError !== "function") throw new InvalidArgumentError("invalid onError method");
		if (typeof handler.onBodySent !== "function" && handler.onBodySent !== void 0) throw new InvalidArgumentError("invalid onBodySent method");
		if (upgrade || method === "CONNECT") {
			if (typeof handler.onUpgrade !== "function") throw new InvalidArgumentError("invalid onUpgrade method");
		} else {
			if (typeof handler.onHeaders !== "function") throw new InvalidArgumentError("invalid onHeaders method");
			if (typeof handler.onData !== "function") throw new InvalidArgumentError("invalid onData method");
			if (typeof handler.onComplete !== "function") throw new InvalidArgumentError("invalid onComplete method");
		}
	}
	function isDisturbed(body) {
		return !!(body && (stream.isDisturbed(body) || body[kBodyUsed]));
	}
	function isErrored(body) {
		return !!(body && stream.isErrored(body));
	}
	function isReadable(body) {
		return !!(body && stream.isReadable(body));
	}
	function getSocketInfo(socket) {
		return {
			localAddress: socket.localAddress,
			localPort: socket.localPort,
			remoteAddress: socket.remoteAddress,
			remotePort: socket.remotePort,
			remoteFamily: socket.remoteFamily,
			timeout: socket.timeout,
			bytesWritten: socket.bytesWritten,
			bytesRead: socket.bytesRead
		};
	}
	/** @type {globalThis['ReadableStream']} */
	function ReadableStreamFrom(iterable) {
		let iterator;
		return new ReadableStream({
			async start() {
				iterator = iterable[Symbol.asyncIterator]();
			},
			async pull(controller) {
				const { done, value } = await iterator.next();
				if (done) queueMicrotask(() => {
					controller.close();
					controller.byobRequest?.respond(0);
				});
				else {
					const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
					if (buf.byteLength) controller.enqueue(new Uint8Array(buf));
				}
				return controller.desiredSize > 0;
			},
			async cancel(reason) {
				await iterator.return();
			},
			type: "bytes"
		});
	}
	function isFormDataLike(object) {
		return object && typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && object[Symbol.toStringTag] === "FormData";
	}
	function addAbortListener(signal, listener) {
		if ("addEventListener" in signal) {
			signal.addEventListener("abort", listener, { once: true });
			return () => signal.removeEventListener("abort", listener);
		}
		signal.addListener("abort", listener);
		return () => signal.removeListener("abort", listener);
	}
	const hasToWellFormed = typeof String.prototype.toWellFormed === "function";
	const hasIsWellFormed = typeof String.prototype.isWellFormed === "function";
	/**
	* @param {string} val
	*/
	function toUSVString(val) {
		return hasToWellFormed ? `${val}`.toWellFormed() : nodeUtil$3.toUSVString(val);
	}
	/**
	* @param {string} val
	*/
	function isUSVString(val) {
		return hasIsWellFormed ? `${val}`.isWellFormed() : toUSVString(val) === `${val}`;
	}
	/**
	* @see https://tools.ietf.org/html/rfc7230#section-3.2.6
	* @param {number} c
	*/
	function isTokenCharCode(c) {
		switch (c) {
			case 34:
			case 40:
			case 41:
			case 44:
			case 47:
			case 58:
			case 59:
			case 60:
			case 61:
			case 62:
			case 63:
			case 64:
			case 91:
			case 92:
			case 93:
			case 123:
			case 125: return false;
			default: return c >= 33 && c <= 126;
		}
	}
	/**
	* @param {string} characters
	*/
	function isValidHTTPToken(characters) {
		if (characters.length === 0) return false;
		for (let i = 0; i < characters.length; ++i) if (!isTokenCharCode(characters.charCodeAt(i))) return false;
		return true;
	}
	/**
	* Matches if val contains an invalid field-vchar
	*  field-value    = *( field-content / obs-fold )
	*  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
	*  field-vchar    = VCHAR / obs-text
	*/
	const headerCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
	/**
	* @param {string} characters
	*/
	function isValidHeaderValue(characters) {
		return !headerCharRegex.test(characters);
	}
	function parseRangeHeader(range) {
		if (range == null || range === "") return {
			start: 0,
			end: null,
			size: null
		};
		const m = range ? range.match(/^bytes (\d+)-(\d+)\/(\d+)?$/) : null;
		return m ? {
			start: parseInt(m[1]),
			end: m[2] ? parseInt(m[2]) : null,
			size: m[3] ? parseInt(m[3]) : null
		} : null;
	}
	function addListener(obj, name, listener) {
		(obj[kListeners] ??= []).push([name, listener]);
		obj.on(name, listener);
		return obj;
	}
	function removeAllListeners(obj) {
		for (const [name, listener] of obj[kListeners] ?? []) obj.removeListener(name, listener);
		obj[kListeners] = null;
	}
	function errorRequest(client, request, err) {
		try {
			request.onError(err);
			assert$27(request.aborted);
		} catch (err) {
			client.emit("error", err);
		}
	}
	const kEnumerableProperty = Object.create(null);
	kEnumerableProperty.enumerable = true;
	const normalizedMethodRecordsBase = {
		delete: "DELETE",
		DELETE: "DELETE",
		get: "GET",
		GET: "GET",
		head: "HEAD",
		HEAD: "HEAD",
		options: "OPTIONS",
		OPTIONS: "OPTIONS",
		post: "POST",
		POST: "POST",
		put: "PUT",
		PUT: "PUT"
	};
	const normalizedMethodRecords = {
		...normalizedMethodRecordsBase,
		patch: "patch",
		PATCH: "PATCH"
	};
	Object.setPrototypeOf(normalizedMethodRecordsBase, null);
	Object.setPrototypeOf(normalizedMethodRecords, null);
	module.exports = {
		kEnumerableProperty,
		nop,
		isDisturbed,
		isErrored,
		isReadable,
		toUSVString,
		isUSVString,
		isBlobLike,
		parseOrigin,
		parseURL,
		getServerName,
		isStream,
		isIterable,
		isAsyncIterable,
		isDestroyed,
		headerNameToString,
		bufferToLowerCasedHeaderName,
		addListener,
		removeAllListeners,
		errorRequest,
		parseRawHeaders,
		parseHeaders,
		parseKeepAliveTimeout,
		destroy,
		bodyLength,
		deepClone,
		ReadableStreamFrom,
		isBuffer,
		validateHandler,
		getSocketInfo,
		isFormDataLike,
		buildURL,
		addAbortListener,
		isValidHTTPToken,
		isValidHeaderValue,
		isTokenCharCode,
		parseRangeHeader,
		normalizedMethodRecordsBase,
		normalizedMethodRecords,
		isValidPort,
		isHttpOrHttpsPrefixed,
		nodeMajor,
		nodeMinor,
		safeHTTPMethods: [
			"GET",
			"HEAD",
			"OPTIONS",
			"TRACE"
		],
		wrapRequestBody
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/diagnostics.js
var require_diagnostics = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const diagnosticsChannel = __require("node:diagnostics_channel");
	const util$1 = __require("node:util");
	const undiciDebugLog = util$1.debuglog("undici");
	const fetchDebuglog = util$1.debuglog("fetch");
	const websocketDebuglog = util$1.debuglog("websocket");
	let isClientSet = false;
	const channels = {
		beforeConnect: diagnosticsChannel.channel("undici:client:beforeConnect"),
		connected: diagnosticsChannel.channel("undici:client:connected"),
		connectError: diagnosticsChannel.channel("undici:client:connectError"),
		sendHeaders: diagnosticsChannel.channel("undici:client:sendHeaders"),
		create: diagnosticsChannel.channel("undici:request:create"),
		bodySent: diagnosticsChannel.channel("undici:request:bodySent"),
		headers: diagnosticsChannel.channel("undici:request:headers"),
		trailers: diagnosticsChannel.channel("undici:request:trailers"),
		error: diagnosticsChannel.channel("undici:request:error"),
		open: diagnosticsChannel.channel("undici:websocket:open"),
		close: diagnosticsChannel.channel("undici:websocket:close"),
		socketError: diagnosticsChannel.channel("undici:websocket:socket_error"),
		ping: diagnosticsChannel.channel("undici:websocket:ping"),
		pong: diagnosticsChannel.channel("undici:websocket:pong")
	};
	if (undiciDebugLog.enabled || fetchDebuglog.enabled) {
		const debuglog = fetchDebuglog.enabled ? fetchDebuglog : undiciDebugLog;
		diagnosticsChannel.channel("undici:client:beforeConnect").subscribe((evt) => {
			const { connectParams: { version, protocol, port, host } } = evt;
			debuglog("connecting to %s using %s%s", `${host}${port ? `:${port}` : ""}`, protocol, version);
		});
		diagnosticsChannel.channel("undici:client:connected").subscribe((evt) => {
			const { connectParams: { version, protocol, port, host } } = evt;
			debuglog("connected to %s using %s%s", `${host}${port ? `:${port}` : ""}`, protocol, version);
		});
		diagnosticsChannel.channel("undici:client:connectError").subscribe((evt) => {
			const { connectParams: { version, protocol, port, host }, error } = evt;
			debuglog("connection to %s using %s%s errored - %s", `${host}${port ? `:${port}` : ""}`, protocol, version, error.message);
		});
		diagnosticsChannel.channel("undici:client:sendHeaders").subscribe((evt) => {
			const { request: { method, path, origin } } = evt;
			debuglog("sending request to %s %s/%s", method, origin, path);
		});
		diagnosticsChannel.channel("undici:request:headers").subscribe((evt) => {
			const { request: { method, path, origin }, response: { statusCode } } = evt;
			debuglog("received response to %s %s/%s - HTTP %d", method, origin, path, statusCode);
		});
		diagnosticsChannel.channel("undici:request:trailers").subscribe((evt) => {
			const { request: { method, path, origin } } = evt;
			debuglog("trailers received from %s %s/%s", method, origin, path);
		});
		diagnosticsChannel.channel("undici:request:error").subscribe((evt) => {
			const { request: { method, path, origin }, error } = evt;
			debuglog("request to %s %s/%s errored - %s", method, origin, path, error.message);
		});
		isClientSet = true;
	}
	if (websocketDebuglog.enabled) {
		if (!isClientSet) {
			const debuglog = undiciDebugLog.enabled ? undiciDebugLog : websocketDebuglog;
			diagnosticsChannel.channel("undici:client:beforeConnect").subscribe((evt) => {
				const { connectParams: { version, protocol, port, host } } = evt;
				debuglog("connecting to %s%s using %s%s", host, port ? `:${port}` : "", protocol, version);
			});
			diagnosticsChannel.channel("undici:client:connected").subscribe((evt) => {
				const { connectParams: { version, protocol, port, host } } = evt;
				debuglog("connected to %s%s using %s%s", host, port ? `:${port}` : "", protocol, version);
			});
			diagnosticsChannel.channel("undici:client:connectError").subscribe((evt) => {
				const { connectParams: { version, protocol, port, host }, error } = evt;
				debuglog("connection to %s%s using %s%s errored - %s", host, port ? `:${port}` : "", protocol, version, error.message);
			});
			diagnosticsChannel.channel("undici:client:sendHeaders").subscribe((evt) => {
				const { request: { method, path, origin } } = evt;
				debuglog("sending request to %s %s/%s", method, origin, path);
			});
		}
		diagnosticsChannel.channel("undici:websocket:open").subscribe((evt) => {
			const { address: { address, port } } = evt;
			websocketDebuglog("connection opened %s%s", address, port ? `:${port}` : "");
		});
		diagnosticsChannel.channel("undici:websocket:close").subscribe((evt) => {
			const { websocket, code, reason } = evt;
			websocketDebuglog("closed connection to %s - %s %s", websocket.url, code, reason);
		});
		diagnosticsChannel.channel("undici:websocket:socket_error").subscribe((err) => {
			websocketDebuglog("connection errored - %s", err.message);
		});
		diagnosticsChannel.channel("undici:websocket:ping").subscribe((evt) => {
			websocketDebuglog("ping received");
		});
		diagnosticsChannel.channel("undici:websocket:pong").subscribe((evt) => {
			websocketDebuglog("pong received");
		});
	}
	module.exports = { channels };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/request.js
var require_request$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { InvalidArgumentError, NotSupportedError } = require_errors();
	const assert$26 = __require("node:assert");
	const { isValidHTTPToken, isValidHeaderValue, isStream, destroy, isBuffer, isFormDataLike, isIterable, isBlobLike, buildURL, validateHandler, getServerName, normalizedMethodRecords } = require_util$7();
	const { channels } = require_diagnostics();
	const { headerNameLowerCasedRecord } = require_constants$4();
	const invalidPathRegex = /[^\u0021-\u00ff]/;
	const kHandler = Symbol("handler");
	var Request = class {
		constructor(origin, { path, method, body, headers, query, idempotent, blocking, upgrade, headersTimeout, bodyTimeout, reset, throwOnError, expectContinue, servername }, handler) {
			if (typeof path !== "string") throw new InvalidArgumentError("path must be a string");
			else if (path[0] !== "/" && !(path.startsWith("http://") || path.startsWith("https://")) && method !== "CONNECT") throw new InvalidArgumentError("path must be an absolute URL or start with a slash");
			else if (invalidPathRegex.test(path)) throw new InvalidArgumentError("invalid request path");
			if (typeof method !== "string") throw new InvalidArgumentError("method must be a string");
			else if (normalizedMethodRecords[method] === void 0 && !isValidHTTPToken(method)) throw new InvalidArgumentError("invalid request method");
			if (upgrade && typeof upgrade !== "string") throw new InvalidArgumentError("upgrade must be a string");
			if (headersTimeout != null && (!Number.isFinite(headersTimeout) || headersTimeout < 0)) throw new InvalidArgumentError("invalid headersTimeout");
			if (bodyTimeout != null && (!Number.isFinite(bodyTimeout) || bodyTimeout < 0)) throw new InvalidArgumentError("invalid bodyTimeout");
			if (reset != null && typeof reset !== "boolean") throw new InvalidArgumentError("invalid reset");
			if (expectContinue != null && typeof expectContinue !== "boolean") throw new InvalidArgumentError("invalid expectContinue");
			this.headersTimeout = headersTimeout;
			this.bodyTimeout = bodyTimeout;
			this.throwOnError = throwOnError === true;
			this.method = method;
			this.abort = null;
			if (body == null) this.body = null;
			else if (isStream(body)) {
				this.body = body;
				const rState = this.body._readableState;
				if (!rState || !rState.autoDestroy) {
					this.endHandler = function autoDestroy() {
						destroy(this);
					};
					this.body.on("end", this.endHandler);
				}
				this.errorHandler = (err) => {
					if (this.abort) this.abort(err);
					else this.error = err;
				};
				this.body.on("error", this.errorHandler);
			} else if (isBuffer(body)) this.body = body.byteLength ? body : null;
			else if (ArrayBuffer.isView(body)) this.body = body.buffer.byteLength ? Buffer.from(body.buffer, body.byteOffset, body.byteLength) : null;
			else if (body instanceof ArrayBuffer) this.body = body.byteLength ? Buffer.from(body) : null;
			else if (typeof body === "string") this.body = body.length ? Buffer.from(body) : null;
			else if (isFormDataLike(body) || isIterable(body) || isBlobLike(body)) this.body = body;
			else throw new InvalidArgumentError("body must be a string, a Buffer, a Readable stream, an iterable, or an async iterable");
			this.completed = false;
			this.aborted = false;
			this.upgrade = upgrade || null;
			this.path = query ? buildURL(path, query) : path;
			this.origin = origin;
			this.idempotent = idempotent == null ? method === "HEAD" || method === "GET" : idempotent;
			this.blocking = blocking == null ? false : blocking;
			this.reset = reset == null ? null : reset;
			this.host = null;
			this.contentLength = null;
			this.contentType = null;
			this.headers = [];
			this.expectContinue = expectContinue != null ? expectContinue : false;
			if (Array.isArray(headers)) {
				if (headers.length % 2 !== 0) throw new InvalidArgumentError("headers array must be even");
				for (let i = 0; i < headers.length; i += 2) processHeader(this, headers[i], headers[i + 1]);
			} else if (headers && typeof headers === "object") if (headers[Symbol.iterator]) for (const header of headers) {
				if (!Array.isArray(header) || header.length !== 2) throw new InvalidArgumentError("headers must be in key-value pair format");
				processHeader(this, header[0], header[1]);
			}
			else {
				const keys = Object.keys(headers);
				for (let i = 0; i < keys.length; ++i) processHeader(this, keys[i], headers[keys[i]]);
			}
			else if (headers != null) throw new InvalidArgumentError("headers must be an object or an array");
			validateHandler(handler, method, upgrade);
			this.servername = servername || getServerName(this.host);
			this[kHandler] = handler;
			if (channels.create.hasSubscribers) channels.create.publish({ request: this });
		}
		onBodySent(chunk) {
			if (this[kHandler].onBodySent) try {
				return this[kHandler].onBodySent(chunk);
			} catch (err) {
				this.abort(err);
			}
		}
		onRequestSent() {
			if (channels.bodySent.hasSubscribers) channels.bodySent.publish({ request: this });
			if (this[kHandler].onRequestSent) try {
				return this[kHandler].onRequestSent();
			} catch (err) {
				this.abort(err);
			}
		}
		onConnect(abort) {
			assert$26(!this.aborted);
			assert$26(!this.completed);
			if (this.error) abort(this.error);
			else {
				this.abort = abort;
				return this[kHandler].onConnect(abort);
			}
		}
		onResponseStarted() {
			return this[kHandler].onResponseStarted?.();
		}
		onHeaders(statusCode, headers, resume, statusText) {
			assert$26(!this.aborted);
			assert$26(!this.completed);
			if (channels.headers.hasSubscribers) channels.headers.publish({
				request: this,
				response: {
					statusCode,
					headers,
					statusText
				}
			});
			try {
				return this[kHandler].onHeaders(statusCode, headers, resume, statusText);
			} catch (err) {
				this.abort(err);
			}
		}
		onData(chunk) {
			assert$26(!this.aborted);
			assert$26(!this.completed);
			try {
				return this[kHandler].onData(chunk);
			} catch (err) {
				this.abort(err);
				return false;
			}
		}
		onUpgrade(statusCode, headers, socket) {
			assert$26(!this.aborted);
			assert$26(!this.completed);
			return this[kHandler].onUpgrade(statusCode, headers, socket);
		}
		onComplete(trailers) {
			this.onFinally();
			assert$26(!this.aborted);
			this.completed = true;
			if (channels.trailers.hasSubscribers) channels.trailers.publish({
				request: this,
				trailers
			});
			try {
				return this[kHandler].onComplete(trailers);
			} catch (err) {
				this.onError(err);
			}
		}
		onError(error) {
			this.onFinally();
			if (channels.error.hasSubscribers) channels.error.publish({
				request: this,
				error
			});
			if (this.aborted) return;
			this.aborted = true;
			return this[kHandler].onError(error);
		}
		onFinally() {
			if (this.errorHandler) {
				this.body.off("error", this.errorHandler);
				this.errorHandler = null;
			}
			if (this.endHandler) {
				this.body.off("end", this.endHandler);
				this.endHandler = null;
			}
		}
		addHeader(key, value) {
			processHeader(this, key, value);
			return this;
		}
	};
	function processHeader(request, key, val) {
		if (val && typeof val === "object" && !Array.isArray(val)) throw new InvalidArgumentError(`invalid ${key} header`);
		else if (val === void 0) return;
		let headerName = headerNameLowerCasedRecord[key];
		if (headerName === void 0) {
			headerName = key.toLowerCase();
			if (headerNameLowerCasedRecord[headerName] === void 0 && !isValidHTTPToken(headerName)) throw new InvalidArgumentError("invalid header key");
		}
		if (Array.isArray(val)) {
			const arr = [];
			for (let i = 0; i < val.length; i++) if (typeof val[i] === "string") {
				if (!isValidHeaderValue(val[i])) throw new InvalidArgumentError(`invalid ${key} header`);
				arr.push(val[i]);
			} else if (val[i] === null) arr.push("");
			else if (typeof val[i] === "object") throw new InvalidArgumentError(`invalid ${key} header`);
			else arr.push(`${val[i]}`);
			val = arr;
		} else if (typeof val === "string") {
			if (!isValidHeaderValue(val)) throw new InvalidArgumentError(`invalid ${key} header`);
		} else if (val === null) val = "";
		else val = `${val}`;
		if (request.host === null && headerName === "host") {
			if (typeof val !== "string") throw new InvalidArgumentError("invalid host header");
			request.host = val;
		} else if (request.contentLength === null && headerName === "content-length") {
			request.contentLength = parseInt(val, 10);
			if (!Number.isFinite(request.contentLength)) throw new InvalidArgumentError("invalid content-length header");
		} else if (request.contentType === null && headerName === "content-type") {
			request.contentType = val;
			request.headers.push(key, val);
		} else if (headerName === "transfer-encoding" || headerName === "keep-alive" || headerName === "upgrade") throw new InvalidArgumentError(`invalid ${headerName} header`);
		else if (headerName === "connection") {
			const value = typeof val === "string" ? val.toLowerCase() : null;
			if (value !== "close" && value !== "keep-alive") throw new InvalidArgumentError("invalid connection header");
			if (value === "close") request.reset = true;
		} else if (headerName === "expect") throw new NotSupportedError("expect header not supported");
		else request.headers.push(key, val);
	}
	module.exports = Request;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/dispatcher.js
var require_dispatcher = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const EventEmitter$2 = __require("node:events");
	var Dispatcher = class extends EventEmitter$2 {
		dispatch() {
			throw new Error("not implemented");
		}
		close() {
			throw new Error("not implemented");
		}
		destroy() {
			throw new Error("not implemented");
		}
		compose(...args) {
			const interceptors = Array.isArray(args[0]) ? args[0] : args;
			let dispatch = this.dispatch.bind(this);
			for (const interceptor of interceptors) {
				if (interceptor == null) continue;
				if (typeof interceptor !== "function") throw new TypeError(`invalid interceptor, expected function received ${typeof interceptor}`);
				dispatch = interceptor(dispatch);
				if (dispatch == null || typeof dispatch !== "function" || dispatch.length !== 2) throw new TypeError("invalid interceptor");
			}
			return new ComposedDispatcher(this, dispatch);
		}
	};
	var ComposedDispatcher = class extends Dispatcher {
		#dispatcher = null;
		#dispatch = null;
		constructor(dispatcher, dispatch) {
			super();
			this.#dispatcher = dispatcher;
			this.#dispatch = dispatch;
		}
		dispatch(...args) {
			this.#dispatch(...args);
		}
		close(...args) {
			return this.#dispatcher.close(...args);
		}
		destroy(...args) {
			return this.#dispatcher.destroy(...args);
		}
	};
	module.exports = Dispatcher;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/dispatcher-base.js
var require_dispatcher_base = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Dispatcher = require_dispatcher();
	const { ClientDestroyedError, ClientClosedError, InvalidArgumentError } = require_errors();
	const { kDestroy, kClose, kClosed, kDestroyed, kDispatch, kInterceptors } = require_symbols$4();
	const kOnDestroyed = Symbol("onDestroyed");
	const kOnClosed = Symbol("onClosed");
	const kInterceptedDispatch = Symbol("Intercepted Dispatch");
	var DispatcherBase = class extends Dispatcher {
		constructor() {
			super();
			this[kDestroyed] = false;
			this[kOnDestroyed] = null;
			this[kClosed] = false;
			this[kOnClosed] = [];
		}
		get destroyed() {
			return this[kDestroyed];
		}
		get closed() {
			return this[kClosed];
		}
		get interceptors() {
			return this[kInterceptors];
		}
		set interceptors(newInterceptors) {
			if (newInterceptors) {
				for (let i = newInterceptors.length - 1; i >= 0; i--) if (typeof this[kInterceptors][i] !== "function") throw new InvalidArgumentError("interceptor must be an function");
			}
			this[kInterceptors] = newInterceptors;
		}
		close(callback) {
			if (callback === void 0) return new Promise((resolve, reject) => {
				this.close((err, data) => {
					return err ? reject(err) : resolve(data);
				});
			});
			if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
			if (this[kDestroyed]) {
				queueMicrotask(() => callback(new ClientDestroyedError(), null));
				return;
			}
			if (this[kClosed]) {
				if (this[kOnClosed]) this[kOnClosed].push(callback);
				else queueMicrotask(() => callback(null, null));
				return;
			}
			this[kClosed] = true;
			this[kOnClosed].push(callback);
			const onClosed = () => {
				const callbacks = this[kOnClosed];
				this[kOnClosed] = null;
				for (let i = 0; i < callbacks.length; i++) callbacks[i](null, null);
			};
			this[kClose]().then(() => this.destroy()).then(() => {
				queueMicrotask(onClosed);
			});
		}
		destroy(err, callback) {
			if (typeof err === "function") {
				callback = err;
				err = null;
			}
			if (callback === void 0) return new Promise((resolve, reject) => {
				this.destroy(err, (err, data) => {
					return err ? reject(err) : resolve(data);
				});
			});
			if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
			if (this[kDestroyed]) {
				if (this[kOnDestroyed]) this[kOnDestroyed].push(callback);
				else queueMicrotask(() => callback(null, null));
				return;
			}
			if (!err) err = new ClientDestroyedError();
			this[kDestroyed] = true;
			this[kOnDestroyed] = this[kOnDestroyed] || [];
			this[kOnDestroyed].push(callback);
			const onDestroyed = () => {
				const callbacks = this[kOnDestroyed];
				this[kOnDestroyed] = null;
				for (let i = 0; i < callbacks.length; i++) callbacks[i](null, null);
			};
			this[kDestroy](err).then(() => {
				queueMicrotask(onDestroyed);
			});
		}
		[kInterceptedDispatch](opts, handler) {
			if (!this[kInterceptors] || this[kInterceptors].length === 0) {
				this[kInterceptedDispatch] = this[kDispatch];
				return this[kDispatch](opts, handler);
			}
			let dispatch = this[kDispatch].bind(this);
			for (let i = this[kInterceptors].length - 1; i >= 0; i--) dispatch = this[kInterceptors][i](dispatch);
			this[kInterceptedDispatch] = dispatch;
			return dispatch(opts, handler);
		}
		dispatch(opts, handler) {
			if (!handler || typeof handler !== "object") throw new InvalidArgumentError("handler must be an object");
			try {
				if (!opts || typeof opts !== "object") throw new InvalidArgumentError("opts must be an object.");
				if (this[kDestroyed] || this[kOnDestroyed]) throw new ClientDestroyedError();
				if (this[kClosed]) throw new ClientClosedError();
				return this[kInterceptedDispatch](opts, handler);
			} catch (err) {
				if (typeof handler.onError !== "function") throw new InvalidArgumentError("invalid onError method");
				handler.onError(err);
				return false;
			}
		}
	};
	module.exports = DispatcherBase;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/util/timers.js
var require_timers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This module offers an optimized timer implementation designed for scenarios
	* where high precision is not critical.
	*
	* The timer achieves faster performance by using a low-resolution approach,
	* with an accuracy target of within 500ms. This makes it particularly useful
	* for timers with delays of 1 second or more, where exact timing is less
	* crucial.
	*
	* It's important to note that Node.js timers are inherently imprecise, as
	* delays can occur due to the event loop being blocked by other operations.
	* Consequently, timers may trigger later than their scheduled time.
	*/
	/**
	* The fastNow variable contains the internal fast timer clock value.
	*
	* @type {number}
	*/
	let fastNow = 0;
	/**
	* RESOLUTION_MS represents the target resolution time in milliseconds.
	*
	* @type {number}
	* @default 1000
	*/
	const RESOLUTION_MS = 1e3;
	/**
	* TICK_MS defines the desired interval in milliseconds between each tick.
	* The target value is set to half the resolution time, minus 1 ms, to account
	* for potential event loop overhead.
	*
	* @type {number}
	* @default 499
	*/
	const TICK_MS = (RESOLUTION_MS >> 1) - 1;
	/**
	* fastNowTimeout is a Node.js timer used to manage and process
	* the FastTimers stored in the `fastTimers` array.
	*
	* @type {NodeJS.Timeout}
	*/
	let fastNowTimeout;
	/**
	* The kFastTimer symbol is used to identify FastTimer instances.
	*
	* @type {Symbol}
	*/
	const kFastTimer = Symbol("kFastTimer");
	/**
	* The fastTimers array contains all active FastTimers.
	*
	* @type {FastTimer[]}
	*/
	const fastTimers = [];
	/**
	* These constants represent the various states of a FastTimer.
	*/
	/**
	* The `NOT_IN_LIST` constant indicates that the FastTimer is not included
	* in the `fastTimers` array. Timers with this status will not be processed
	* during the next tick by the `onTick` function.
	*
	* A FastTimer can be re-added to the `fastTimers` array by invoking the
	* `refresh` method on the FastTimer instance.
	*
	* @type {-2}
	*/
	const NOT_IN_LIST = -2;
	/**
	* The `TO_BE_CLEARED` constant indicates that the FastTimer is scheduled
	* for removal from the `fastTimers` array. A FastTimer in this state will
	* be removed in the next tick by the `onTick` function and will no longer
	* be processed.
	*
	* This status is also set when the `clear` method is called on the FastTimer instance.
	*
	* @type {-1}
	*/
	const TO_BE_CLEARED = -1;
	/**
	* The `PENDING` constant signifies that the FastTimer is awaiting processing
	* in the next tick by the `onTick` function. Timers with this status will have
	* their `_idleStart` value set and their status updated to `ACTIVE` in the next tick.
	*
	* @type {0}
	*/
	const PENDING = 0;
	/**
	* The `ACTIVE` constant indicates that the FastTimer is active and waiting
	* for its timer to expire. During the next tick, the `onTick` function will
	* check if the timer has expired, and if so, it will execute the associated callback.
	*
	* @type {1}
	*/
	const ACTIVE = 1;
	/**
	* The onTick function processes the fastTimers array.
	*
	* @returns {void}
	*/
	function onTick() {
		/**
		* Increment the fastNow value by the TICK_MS value, despite the actual time
		* that has passed since the last tick. This approach ensures independence
		* from the system clock and delays caused by a blocked event loop.
		*
		* @type {number}
		*/
		fastNow += TICK_MS;
		/**
		* The `idx` variable is used to iterate over the `fastTimers` array.
		* Expired timers are removed by replacing them with the last element in the array.
		* Consequently, `idx` is only incremented when the current element is not removed.
		*
		* @type {number}
		*/
		let idx = 0;
		/**
		* The len variable will contain the length of the fastTimers array
		* and will be decremented when a FastTimer should be removed from the
		* fastTimers array.
		*
		* @type {number}
		*/
		let len = fastTimers.length;
		while (idx < len) {
			/**
			* @type {FastTimer}
			*/
			const timer = fastTimers[idx];
			if (timer._state === PENDING) {
				timer._idleStart = fastNow - TICK_MS;
				timer._state = ACTIVE;
			} else if (timer._state === ACTIVE && fastNow >= timer._idleStart + timer._idleTimeout) {
				timer._state = TO_BE_CLEARED;
				timer._idleStart = -1;
				timer._onTimeout(timer._timerArg);
			}
			if (timer._state === TO_BE_CLEARED) {
				timer._state = NOT_IN_LIST;
				if (--len !== 0) fastTimers[idx] = fastTimers[len];
			} else ++idx;
		}
		fastTimers.length = len;
		if (fastTimers.length !== 0) refreshTimeout();
	}
	function refreshTimeout() {
		if (fastNowTimeout) fastNowTimeout.refresh();
		else {
			clearTimeout(fastNowTimeout);
			fastNowTimeout = setTimeout(onTick, TICK_MS);
			if (fastNowTimeout.unref) fastNowTimeout.unref();
		}
	}
	/**
	* The `FastTimer` class is a data structure designed to store and manage
	* timer information.
	*/
	var FastTimer = class {
		[kFastTimer] = true;
		/**
		* The state of the timer, which can be one of the following:
		* - NOT_IN_LIST (-2)
		* - TO_BE_CLEARED (-1)
		* - PENDING (0)
		* - ACTIVE (1)
		*
		* @type {-2|-1|0|1}
		* @private
		*/
		_state = NOT_IN_LIST;
		/**
		* The number of milliseconds to wait before calling the callback.
		*
		* @type {number}
		* @private
		*/
		_idleTimeout = -1;
		/**
		* The time in milliseconds when the timer was started. This value is used to
		* calculate when the timer should expire.
		*
		* @type {number}
		* @default -1
		* @private
		*/
		_idleStart = -1;
		/**
		* The function to be executed when the timer expires.
		* @type {Function}
		* @private
		*/
		_onTimeout;
		/**
		* The argument to be passed to the callback when the timer expires.
		*
		* @type {*}
		* @private
		*/
		_timerArg;
		/**
		* @constructor
		* @param {Function} callback A function to be executed after the timer
		* expires.
		* @param {number} delay The time, in milliseconds that the timer should wait
		* before the specified function or code is executed.
		* @param {*} arg
		*/
		constructor(callback, delay, arg) {
			this._onTimeout = callback;
			this._idleTimeout = delay;
			this._timerArg = arg;
			this.refresh();
		}
		/**
		* Sets the timer's start time to the current time, and reschedules the timer
		* to call its callback at the previously specified duration adjusted to the
		* current time.
		* Using this on a timer that has already called its callback will reactivate
		* the timer.
		*
		* @returns {void}
		*/
		refresh() {
			if (this._state === NOT_IN_LIST) fastTimers.push(this);
			if (!fastNowTimeout || fastTimers.length === 1) refreshTimeout();
			this._state = PENDING;
		}
		/**
		* The `clear` method cancels the timer, preventing it from executing.
		*
		* @returns {void}
		* @private
		*/
		clear() {
			this._state = TO_BE_CLEARED;
			this._idleStart = -1;
		}
	};
	/**
	* This module exports a setTimeout and clearTimeout function that can be
	* used as a drop-in replacement for the native functions.
	*/
	module.exports = {
		setTimeout(callback, delay, arg) {
			return delay <= RESOLUTION_MS ? setTimeout(callback, delay, arg) : new FastTimer(callback, delay, arg);
		},
		clearTimeout(timeout) {
			if (timeout[kFastTimer])
 /**
			* @type {FastTimer}
			*/
			timeout.clear();
			else clearTimeout(timeout);
		},
		setFastTimeout(callback, delay, arg) {
			return new FastTimer(callback, delay, arg);
		},
		clearFastTimeout(timeout) {
			timeout.clear();
		},
		now() {
			return fastNow;
		},
		tick(delay = 0) {
			fastNow += delay - RESOLUTION_MS + 1;
			onTick();
			onTick();
		},
		reset() {
			fastNow = 0;
			fastTimers.length = 0;
			clearTimeout(fastNowTimeout);
			fastNowTimeout = null;
		},
		kFastTimer
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/core/connect.js
var require_connect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const net$1 = __require("node:net");
	const assert$25 = __require("node:assert");
	const util = require_util$7();
	const { InvalidArgumentError, ConnectTimeoutError } = require_errors();
	const timers = require_timers();
	function noop() {}
	let tls;
	let SessionCache;
	if (global.FinalizationRegistry && !(process.env.NODE_V8_COVERAGE || process.env.UNDICI_NO_FG)) SessionCache = class WeakSessionCache {
		constructor(maxCachedSessions) {
			this._maxCachedSessions = maxCachedSessions;
			this._sessionCache = /* @__PURE__ */ new Map();
			this._sessionRegistry = new global.FinalizationRegistry((key) => {
				if (this._sessionCache.size < this._maxCachedSessions) return;
				const ref = this._sessionCache.get(key);
				if (ref !== void 0 && ref.deref() === void 0) this._sessionCache.delete(key);
			});
		}
		get(sessionKey) {
			const ref = this._sessionCache.get(sessionKey);
			return ref ? ref.deref() : null;
		}
		set(sessionKey, session) {
			if (this._maxCachedSessions === 0) return;
			this._sessionCache.set(sessionKey, new WeakRef(session));
			this._sessionRegistry.register(session, sessionKey);
		}
	};
	else SessionCache = class SimpleSessionCache {
		constructor(maxCachedSessions) {
			this._maxCachedSessions = maxCachedSessions;
			this._sessionCache = /* @__PURE__ */ new Map();
		}
		get(sessionKey) {
			return this._sessionCache.get(sessionKey);
		}
		set(sessionKey, session) {
			if (this._maxCachedSessions === 0) return;
			if (this._sessionCache.size >= this._maxCachedSessions) {
				const { value: oldestKey } = this._sessionCache.keys().next();
				this._sessionCache.delete(oldestKey);
			}
			this._sessionCache.set(sessionKey, session);
		}
	};
	function buildConnector({ allowH2, maxCachedSessions, socketPath, timeout, session: customSession, ...opts }) {
		if (maxCachedSessions != null && (!Number.isInteger(maxCachedSessions) || maxCachedSessions < 0)) throw new InvalidArgumentError("maxCachedSessions must be a positive integer or zero");
		const options = {
			path: socketPath,
			...opts
		};
		const sessionCache = new SessionCache(maxCachedSessions == null ? 100 : maxCachedSessions);
		timeout = timeout == null ? 1e4 : timeout;
		allowH2 = allowH2 != null ? allowH2 : false;
		return function connect({ hostname, host, protocol, port, servername, localAddress, httpSocket }, callback) {
			let socket;
			if (protocol === "https:") {
				if (!tls) tls = __require("node:tls");
				servername = servername || options.servername || util.getServerName(host) || null;
				const sessionKey = servername || hostname;
				assert$25(sessionKey);
				const session = customSession || sessionCache.get(sessionKey) || null;
				port = port || 443;
				socket = tls.connect({
					highWaterMark: 16384,
					...options,
					servername,
					session,
					localAddress,
					ALPNProtocols: allowH2 ? ["http/1.1", "h2"] : ["http/1.1"],
					socket: httpSocket,
					port,
					host: hostname
				});
				socket.on("session", function(session) {
					sessionCache.set(sessionKey, session);
				});
			} else {
				assert$25(!httpSocket, "httpSocket can only be sent on TLS update");
				port = port || 80;
				socket = net$1.connect({
					highWaterMark: 64 * 1024,
					...options,
					localAddress,
					port,
					host: hostname
				});
			}
			if (options.keepAlive == null || options.keepAlive) {
				const keepAliveInitialDelay = options.keepAliveInitialDelay === void 0 ? 6e4 : options.keepAliveInitialDelay;
				socket.setKeepAlive(true, keepAliveInitialDelay);
			}
			const clearConnectTimeout = setupConnectTimeout(new WeakRef(socket), {
				timeout,
				hostname,
				port
			});
			socket.setNoDelay(true).once(protocol === "https:" ? "secureConnect" : "connect", function() {
				queueMicrotask(clearConnectTimeout);
				if (callback) {
					const cb = callback;
					callback = null;
					cb(null, this);
				}
			}).on("error", function(err) {
				queueMicrotask(clearConnectTimeout);
				if (callback) {
					const cb = callback;
					callback = null;
					cb(err);
				}
			});
			return socket;
		};
	}
	/**
	* @param {WeakRef<net.Socket>} socketWeakRef
	* @param {object} opts
	* @param {number} opts.timeout
	* @param {string} opts.hostname
	* @param {number} opts.port
	* @returns {() => void}
	*/
	const setupConnectTimeout = process.platform === "win32" ? (socketWeakRef, opts) => {
		if (!opts.timeout) return noop;
		let s1 = null;
		let s2 = null;
		const fastTimer = timers.setFastTimeout(() => {
			s1 = setImmediate(() => {
				s2 = setImmediate(() => onConnectTimeout(socketWeakRef.deref(), opts));
			});
		}, opts.timeout);
		return () => {
			timers.clearFastTimeout(fastTimer);
			clearImmediate(s1);
			clearImmediate(s2);
		};
	} : (socketWeakRef, opts) => {
		if (!opts.timeout) return noop;
		let s1 = null;
		const fastTimer = timers.setFastTimeout(() => {
			s1 = setImmediate(() => {
				onConnectTimeout(socketWeakRef.deref(), opts);
			});
		}, opts.timeout);
		return () => {
			timers.clearFastTimeout(fastTimer);
			clearImmediate(s1);
		};
	};
	/**
	* @param {net.Socket} socket
	* @param {object} opts
	* @param {number} opts.timeout
	* @param {string} opts.hostname
	* @param {number} opts.port
	*/
	function onConnectTimeout(socket, opts) {
		if (socket == null) return;
		let message = "Connect Timeout Error";
		if (Array.isArray(socket.autoSelectFamilyAttemptedAddresses)) message += ` (attempted addresses: ${socket.autoSelectFamilyAttemptedAddresses.join(", ")},`;
		else message += ` (attempted address: ${opts.hostname}:${opts.port},`;
		message += ` timeout: ${opts.timeout}ms)`;
		util.destroy(socket, new ConnectTimeoutError(message));
	}
	module.exports = buildConnector;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/llhttp/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.enumToMap = void 0;
	function enumToMap(obj) {
		const res = {};
		Object.keys(obj).forEach((key) => {
			const value = obj[key];
			if (typeof value === "number") res[key] = value;
		});
		return res;
	}
	exports.enumToMap = enumToMap;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/llhttp/constants.js
var require_constants$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SPECIAL_HEADERS = exports.HEADER_STATE = exports.MINOR = exports.MAJOR = exports.CONNECTION_TOKEN_CHARS = exports.HEADER_CHARS = exports.TOKEN = exports.STRICT_TOKEN = exports.HEX = exports.URL_CHAR = exports.STRICT_URL_CHAR = exports.USERINFO_CHARS = exports.MARK = exports.ALPHANUM = exports.NUM = exports.HEX_MAP = exports.NUM_MAP = exports.ALPHA = exports.FINISH = exports.H_METHOD_MAP = exports.METHOD_MAP = exports.METHODS_RTSP = exports.METHODS_ICE = exports.METHODS_HTTP = exports.METHODS = exports.LENIENT_FLAGS = exports.FLAGS = exports.TYPE = exports.ERROR = void 0;
	const utils_1 = require_utils();
	(function(ERROR) {
		ERROR[ERROR["OK"] = 0] = "OK";
		ERROR[ERROR["INTERNAL"] = 1] = "INTERNAL";
		ERROR[ERROR["STRICT"] = 2] = "STRICT";
		ERROR[ERROR["LF_EXPECTED"] = 3] = "LF_EXPECTED";
		ERROR[ERROR["UNEXPECTED_CONTENT_LENGTH"] = 4] = "UNEXPECTED_CONTENT_LENGTH";
		ERROR[ERROR["CLOSED_CONNECTION"] = 5] = "CLOSED_CONNECTION";
		ERROR[ERROR["INVALID_METHOD"] = 6] = "INVALID_METHOD";
		ERROR[ERROR["INVALID_URL"] = 7] = "INVALID_URL";
		ERROR[ERROR["INVALID_CONSTANT"] = 8] = "INVALID_CONSTANT";
		ERROR[ERROR["INVALID_VERSION"] = 9] = "INVALID_VERSION";
		ERROR[ERROR["INVALID_HEADER_TOKEN"] = 10] = "INVALID_HEADER_TOKEN";
		ERROR[ERROR["INVALID_CONTENT_LENGTH"] = 11] = "INVALID_CONTENT_LENGTH";
		ERROR[ERROR["INVALID_CHUNK_SIZE"] = 12] = "INVALID_CHUNK_SIZE";
		ERROR[ERROR["INVALID_STATUS"] = 13] = "INVALID_STATUS";
		ERROR[ERROR["INVALID_EOF_STATE"] = 14] = "INVALID_EOF_STATE";
		ERROR[ERROR["INVALID_TRANSFER_ENCODING"] = 15] = "INVALID_TRANSFER_ENCODING";
		ERROR[ERROR["CB_MESSAGE_BEGIN"] = 16] = "CB_MESSAGE_BEGIN";
		ERROR[ERROR["CB_HEADERS_COMPLETE"] = 17] = "CB_HEADERS_COMPLETE";
		ERROR[ERROR["CB_MESSAGE_COMPLETE"] = 18] = "CB_MESSAGE_COMPLETE";
		ERROR[ERROR["CB_CHUNK_HEADER"] = 19] = "CB_CHUNK_HEADER";
		ERROR[ERROR["CB_CHUNK_COMPLETE"] = 20] = "CB_CHUNK_COMPLETE";
		ERROR[ERROR["PAUSED"] = 21] = "PAUSED";
		ERROR[ERROR["PAUSED_UPGRADE"] = 22] = "PAUSED_UPGRADE";
		ERROR[ERROR["PAUSED_H2_UPGRADE"] = 23] = "PAUSED_H2_UPGRADE";
		ERROR[ERROR["USER"] = 24] = "USER";
	})(exports.ERROR || (exports.ERROR = {}));
	(function(TYPE) {
		TYPE[TYPE["BOTH"] = 0] = "BOTH";
		TYPE[TYPE["REQUEST"] = 1] = "REQUEST";
		TYPE[TYPE["RESPONSE"] = 2] = "RESPONSE";
	})(exports.TYPE || (exports.TYPE = {}));
	(function(FLAGS) {
		FLAGS[FLAGS["CONNECTION_KEEP_ALIVE"] = 1] = "CONNECTION_KEEP_ALIVE";
		FLAGS[FLAGS["CONNECTION_CLOSE"] = 2] = "CONNECTION_CLOSE";
		FLAGS[FLAGS["CONNECTION_UPGRADE"] = 4] = "CONNECTION_UPGRADE";
		FLAGS[FLAGS["CHUNKED"] = 8] = "CHUNKED";
		FLAGS[FLAGS["UPGRADE"] = 16] = "UPGRADE";
		FLAGS[FLAGS["CONTENT_LENGTH"] = 32] = "CONTENT_LENGTH";
		FLAGS[FLAGS["SKIPBODY"] = 64] = "SKIPBODY";
		FLAGS[FLAGS["TRAILING"] = 128] = "TRAILING";
		FLAGS[FLAGS["TRANSFER_ENCODING"] = 512] = "TRANSFER_ENCODING";
	})(exports.FLAGS || (exports.FLAGS = {}));
	(function(LENIENT_FLAGS) {
		LENIENT_FLAGS[LENIENT_FLAGS["HEADERS"] = 1] = "HEADERS";
		LENIENT_FLAGS[LENIENT_FLAGS["CHUNKED_LENGTH"] = 2] = "CHUNKED_LENGTH";
		LENIENT_FLAGS[LENIENT_FLAGS["KEEP_ALIVE"] = 4] = "KEEP_ALIVE";
	})(exports.LENIENT_FLAGS || (exports.LENIENT_FLAGS = {}));
	var METHODS;
	(function(METHODS) {
		METHODS[METHODS["DELETE"] = 0] = "DELETE";
		METHODS[METHODS["GET"] = 1] = "GET";
		METHODS[METHODS["HEAD"] = 2] = "HEAD";
		METHODS[METHODS["POST"] = 3] = "POST";
		METHODS[METHODS["PUT"] = 4] = "PUT";
		METHODS[METHODS["CONNECT"] = 5] = "CONNECT";
		METHODS[METHODS["OPTIONS"] = 6] = "OPTIONS";
		METHODS[METHODS["TRACE"] = 7] = "TRACE";
		METHODS[METHODS["COPY"] = 8] = "COPY";
		METHODS[METHODS["LOCK"] = 9] = "LOCK";
		METHODS[METHODS["MKCOL"] = 10] = "MKCOL";
		METHODS[METHODS["MOVE"] = 11] = "MOVE";
		METHODS[METHODS["PROPFIND"] = 12] = "PROPFIND";
		METHODS[METHODS["PROPPATCH"] = 13] = "PROPPATCH";
		METHODS[METHODS["SEARCH"] = 14] = "SEARCH";
		METHODS[METHODS["UNLOCK"] = 15] = "UNLOCK";
		METHODS[METHODS["BIND"] = 16] = "BIND";
		METHODS[METHODS["REBIND"] = 17] = "REBIND";
		METHODS[METHODS["UNBIND"] = 18] = "UNBIND";
		METHODS[METHODS["ACL"] = 19] = "ACL";
		METHODS[METHODS["REPORT"] = 20] = "REPORT";
		METHODS[METHODS["MKACTIVITY"] = 21] = "MKACTIVITY";
		METHODS[METHODS["CHECKOUT"] = 22] = "CHECKOUT";
		METHODS[METHODS["MERGE"] = 23] = "MERGE";
		METHODS[METHODS["M-SEARCH"] = 24] = "M-SEARCH";
		METHODS[METHODS["NOTIFY"] = 25] = "NOTIFY";
		METHODS[METHODS["SUBSCRIBE"] = 26] = "SUBSCRIBE";
		METHODS[METHODS["UNSUBSCRIBE"] = 27] = "UNSUBSCRIBE";
		METHODS[METHODS["PATCH"] = 28] = "PATCH";
		METHODS[METHODS["PURGE"] = 29] = "PURGE";
		METHODS[METHODS["MKCALENDAR"] = 30] = "MKCALENDAR";
		METHODS[METHODS["LINK"] = 31] = "LINK";
		METHODS[METHODS["UNLINK"] = 32] = "UNLINK";
		METHODS[METHODS["SOURCE"] = 33] = "SOURCE";
		METHODS[METHODS["PRI"] = 34] = "PRI";
		METHODS[METHODS["DESCRIBE"] = 35] = "DESCRIBE";
		METHODS[METHODS["ANNOUNCE"] = 36] = "ANNOUNCE";
		METHODS[METHODS["SETUP"] = 37] = "SETUP";
		METHODS[METHODS["PLAY"] = 38] = "PLAY";
		METHODS[METHODS["PAUSE"] = 39] = "PAUSE";
		METHODS[METHODS["TEARDOWN"] = 40] = "TEARDOWN";
		METHODS[METHODS["GET_PARAMETER"] = 41] = "GET_PARAMETER";
		METHODS[METHODS["SET_PARAMETER"] = 42] = "SET_PARAMETER";
		METHODS[METHODS["REDIRECT"] = 43] = "REDIRECT";
		METHODS[METHODS["RECORD"] = 44] = "RECORD";
		METHODS[METHODS["FLUSH"] = 45] = "FLUSH";
	})(METHODS = exports.METHODS || (exports.METHODS = {}));
	exports.METHODS_HTTP = [
		METHODS.DELETE,
		METHODS.GET,
		METHODS.HEAD,
		METHODS.POST,
		METHODS.PUT,
		METHODS.CONNECT,
		METHODS.OPTIONS,
		METHODS.TRACE,
		METHODS.COPY,
		METHODS.LOCK,
		METHODS.MKCOL,
		METHODS.MOVE,
		METHODS.PROPFIND,
		METHODS.PROPPATCH,
		METHODS.SEARCH,
		METHODS.UNLOCK,
		METHODS.BIND,
		METHODS.REBIND,
		METHODS.UNBIND,
		METHODS.ACL,
		METHODS.REPORT,
		METHODS.MKACTIVITY,
		METHODS.CHECKOUT,
		METHODS.MERGE,
		METHODS["M-SEARCH"],
		METHODS.NOTIFY,
		METHODS.SUBSCRIBE,
		METHODS.UNSUBSCRIBE,
		METHODS.PATCH,
		METHODS.PURGE,
		METHODS.MKCALENDAR,
		METHODS.LINK,
		METHODS.UNLINK,
		METHODS.PRI,
		METHODS.SOURCE
	];
	exports.METHODS_ICE = [METHODS.SOURCE];
	exports.METHODS_RTSP = [
		METHODS.OPTIONS,
		METHODS.DESCRIBE,
		METHODS.ANNOUNCE,
		METHODS.SETUP,
		METHODS.PLAY,
		METHODS.PAUSE,
		METHODS.TEARDOWN,
		METHODS.GET_PARAMETER,
		METHODS.SET_PARAMETER,
		METHODS.REDIRECT,
		METHODS.RECORD,
		METHODS.FLUSH,
		METHODS.GET,
		METHODS.POST
	];
	exports.METHOD_MAP = utils_1.enumToMap(METHODS);
	exports.H_METHOD_MAP = {};
	Object.keys(exports.METHOD_MAP).forEach((key) => {
		if (/^H/.test(key)) exports.H_METHOD_MAP[key] = exports.METHOD_MAP[key];
	});
	(function(FINISH) {
		FINISH[FINISH["SAFE"] = 0] = "SAFE";
		FINISH[FINISH["SAFE_WITH_CB"] = 1] = "SAFE_WITH_CB";
		FINISH[FINISH["UNSAFE"] = 2] = "UNSAFE";
	})(exports.FINISH || (exports.FINISH = {}));
	exports.ALPHA = [];
	for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
		exports.ALPHA.push(String.fromCharCode(i));
		exports.ALPHA.push(String.fromCharCode(i + 32));
	}
	exports.NUM_MAP = {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
		9: 9
	};
	exports.HEX_MAP = {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
		9: 9,
		A: 10,
		B: 11,
		C: 12,
		D: 13,
		E: 14,
		F: 15,
		a: 10,
		b: 11,
		c: 12,
		d: 13,
		e: 14,
		f: 15
	};
	exports.NUM = [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9"
	];
	exports.ALPHANUM = exports.ALPHA.concat(exports.NUM);
	exports.MARK = [
		"-",
		"_",
		".",
		"!",
		"~",
		"*",
		"'",
		"(",
		")"
	];
	exports.USERINFO_CHARS = exports.ALPHANUM.concat(exports.MARK).concat([
		"%",
		";",
		":",
		"&",
		"=",
		"+",
		"$",
		","
	]);
	exports.STRICT_URL_CHAR = [
		"!",
		"\"",
		"$",
		"%",
		"&",
		"'",
		"(",
		")",
		"*",
		"+",
		",",
		"-",
		".",
		"/",
		":",
		";",
		"<",
		"=",
		">",
		"@",
		"[",
		"\\",
		"]",
		"^",
		"_",
		"`",
		"{",
		"|",
		"}",
		"~"
	].concat(exports.ALPHANUM);
	exports.URL_CHAR = exports.STRICT_URL_CHAR.concat(["	", "\f"]);
	for (let i = 128; i <= 255; i++) exports.URL_CHAR.push(i);
	exports.HEX = exports.NUM.concat([
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F"
	]);
	exports.STRICT_TOKEN = [
		"!",
		"#",
		"$",
		"%",
		"&",
		"'",
		"*",
		"+",
		"-",
		".",
		"^",
		"_",
		"`",
		"|",
		"~"
	].concat(exports.ALPHANUM);
	exports.TOKEN = exports.STRICT_TOKEN.concat([" "]);
	exports.HEADER_CHARS = ["	"];
	for (let i = 32; i <= 255; i++) if (i !== 127) exports.HEADER_CHARS.push(i);
	exports.CONNECTION_TOKEN_CHARS = exports.HEADER_CHARS.filter((c) => c !== 44);
	exports.MAJOR = exports.NUM_MAP;
	exports.MINOR = exports.MAJOR;
	var HEADER_STATE;
	(function(HEADER_STATE) {
		HEADER_STATE[HEADER_STATE["GENERAL"] = 0] = "GENERAL";
		HEADER_STATE[HEADER_STATE["CONNECTION"] = 1] = "CONNECTION";
		HEADER_STATE[HEADER_STATE["CONTENT_LENGTH"] = 2] = "CONTENT_LENGTH";
		HEADER_STATE[HEADER_STATE["TRANSFER_ENCODING"] = 3] = "TRANSFER_ENCODING";
		HEADER_STATE[HEADER_STATE["UPGRADE"] = 4] = "UPGRADE";
		HEADER_STATE[HEADER_STATE["CONNECTION_KEEP_ALIVE"] = 5] = "CONNECTION_KEEP_ALIVE";
		HEADER_STATE[HEADER_STATE["CONNECTION_CLOSE"] = 6] = "CONNECTION_CLOSE";
		HEADER_STATE[HEADER_STATE["CONNECTION_UPGRADE"] = 7] = "CONNECTION_UPGRADE";
		HEADER_STATE[HEADER_STATE["TRANSFER_ENCODING_CHUNKED"] = 8] = "TRANSFER_ENCODING_CHUNKED";
	})(HEADER_STATE = exports.HEADER_STATE || (exports.HEADER_STATE = {}));
	exports.SPECIAL_HEADERS = {
		"connection": HEADER_STATE.CONNECTION,
		"content-length": HEADER_STATE.CONTENT_LENGTH,
		"proxy-connection": HEADER_STATE.CONNECTION,
		"transfer-encoding": HEADER_STATE.TRANSFER_ENCODING,
		"upgrade": HEADER_STATE.UPGRADE
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/llhttp/llhttp-wasm.js
var require_llhttp_wasm = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Buffer: Buffer$3 } = __require("node:buffer");
	module.exports = Buffer$3.from("AGFzbQEAAAABJwdgAX8Bf2ADf39/AX9gAX8AYAJ/fwBgBH9/f38Bf2AAAGADf39/AALLAQgDZW52GHdhc21fb25faGVhZGVyc19jb21wbGV0ZQAEA2VudhV3YXNtX29uX21lc3NhZ2VfYmVnaW4AAANlbnYLd2FzbV9vbl91cmwAAQNlbnYOd2FzbV9vbl9zdGF0dXMAAQNlbnYUd2FzbV9vbl9oZWFkZXJfZmllbGQAAQNlbnYUd2FzbV9vbl9oZWFkZXJfdmFsdWUAAQNlbnYMd2FzbV9vbl9ib2R5AAEDZW52GHdhc21fb25fbWVzc2FnZV9jb21wbGV0ZQAAAy0sBQYAAAIAAAAAAAACAQIAAgICAAADAAAAAAMDAwMBAQEBAQEBAQEAAAIAAAAEBQFwARISBQMBAAIGCAF/AUGA1AQLB9EFIgZtZW1vcnkCAAtfaW5pdGlhbGl6ZQAIGV9faW5kaXJlY3RfZnVuY3Rpb25fdGFibGUBAAtsbGh0dHBfaW5pdAAJGGxsaHR0cF9zaG91bGRfa2VlcF9hbGl2ZQAvDGxsaHR0cF9hbGxvYwALBm1hbGxvYwAxC2xsaHR0cF9mcmVlAAwEZnJlZQAMD2xsaHR0cF9nZXRfdHlwZQANFWxsaHR0cF9nZXRfaHR0cF9tYWpvcgAOFWxsaHR0cF9nZXRfaHR0cF9taW5vcgAPEWxsaHR0cF9nZXRfbWV0aG9kABAWbGxodHRwX2dldF9zdGF0dXNfY29kZQAREmxsaHR0cF9nZXRfdXBncmFkZQASDGxsaHR0cF9yZXNldAATDmxsaHR0cF9leGVjdXRlABQUbGxodHRwX3NldHRpbmdzX2luaXQAFQ1sbGh0dHBfZmluaXNoABYMbGxodHRwX3BhdXNlABcNbGxodHRwX3Jlc3VtZQAYG2xsaHR0cF9yZXN1bWVfYWZ0ZXJfdXBncmFkZQAZEGxsaHR0cF9nZXRfZXJybm8AGhdsbGh0dHBfZ2V0X2Vycm9yX3JlYXNvbgAbF2xsaHR0cF9zZXRfZXJyb3JfcmVhc29uABwUbGxodHRwX2dldF9lcnJvcl9wb3MAHRFsbGh0dHBfZXJybm9fbmFtZQAeEmxsaHR0cF9tZXRob2RfbmFtZQAfEmxsaHR0cF9zdGF0dXNfbmFtZQAgGmxsaHR0cF9zZXRfbGVu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PgtBhwEMPQtBiAEMPAtBiQEMOwtBigEMOgtBiwEMOQtBjAEMOAtBjQEMNwtBjgEMNgtBjwEMNQtBkAEMNAtBkQEMMwtBkgEMMgtBkwEMMQtBlAEMMAtBlQEMLwtBlgEMLgtBlwEMLQtBmAEMLAtBmQEMKwtBmgEMKgtBmwEMKQtBnAEMKAtBnQEMJwtBngEMJgtBnwEMJQtBoAEMJAtBoQEMIwtBogEMIgtBowEMIQtBpAEMIAtBpQEMHwtBpgEMHgtBpwEMHQtBqAEMHAtBqQEMGwtBqgEMGgtBqwEMGQtBrAEMGAtBrQEMFwtBrgEMFgtBAQwVC0GvAQwUC0GwAQwTC0GxAQwSC0GzAQwRC0GyAQwQC0G0AQwPC0G1AQwOC0G2AQwNC0G3AQwMC0G4AQwLC0G5AQwKC0G6AQwJC0G7AQwIC0HGAQwHC0G8AQwGC0G9AQwFC0G+AQwEC0G/AQwDC0HAAQwCC0HCAQwBC0HBAQshAwNAAkACQAJAAkACQAJAAkACQAJAIAICfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJ/AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAgJ/AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACfwJAAkACfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC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iQEhAwykAgtBASABLQAAQd8ARw1nGiABQQFqIQEMXgtBigEhAyABIARGDaICIAIoAgAiACAEIAFraiEFIAEgAGtBAWohBgNAIAEtAAAgAEGMzwBqLQAARw1kIABBAUYN+gEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMogILQYsBIQMgASAERg2hAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEGOzwBqLQAARw1kIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyiAgsgAkEANgIAIAZBAWohAUECDGULQYwBIQMgASAERg2gAiACKAIAIgAgBCABa2ohBSABIABrQQFqIQYCQANAIAEtAAAgAEHwzwBqLQAARw1jIABBAUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyhAgsgAkEANgIAIAZBAWohAUEfDGQLQY0BIQMgASAERg2fAiACKAIAIgAgBCABa2ohBSABIABrQQFqIQYCQANAIAEtAAAgAEHyzwBqLQAARw1iIABBAUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAygAgsgAkEANgIAIAZBAWohAUEJDGMLIAEgBEYEQEGOASEDDJ8CCwJAAkAgAS0AAEHJAGsOBwBiYmJiYgFiCyABQQFqIQFB+AAhAwyGAgsgAUEBaiEBQfkAIQMMhQILQY8BIQMgASAERg2dAiACKAIAIgAgBCABa2ohBSABIABrQQVqIQYCQANAIAEtAAAgAEGRzwBqLQAARw1gIABBBUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyeAgsgAkEANgIAIAZBAWohAUEYDGELQZABIQMgASAERg2cAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEGXzwBqLQAARw1fIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAydAgsgAkEANgIAIAZBAWohAUEXDGALQZEBIQMgASAERg2bAiACKAIAIgAgBCABa2ohBSABIABrQQZqIQYCQANAIAEtAAAgAEGazwBqLQAARw1eIABBBkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAycAgsgAkEANgIAIAZBAWohAUEVDF8LQZIBIQMgASAERg2aAiACKAIAIgAgBCABa2ohBSABIABrQQVqIQYCQANAIAEtAAAgAEGhzwBqLQAARw1dIABBBUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAybAgsgAkEANgIAIAZBAWohAUEeDF4LIAEgBEYEQEGTASEDDJoCCyABLQAAQcwARw1bIAFBAWohAUEKDF0LIAEgBEYEQEGUASEDDJkCCwJAAkAgAS0AAEHBAGsODwBcXFxcXFxcXFxcXFxcAVwLIAFBAWohAUH+ACEDDIACCyABQQFqIQFB/wAhAwz/AQsgASAERgRAQZUBIQMMmAILAkACQCABLQAAQcEAaw4DAFsBWwsgAUEBaiEBQf0AIQMM/wELIAFBAWohAUGAASEDDP4BC0GWASEDIAEgBEYNlgIgAigCACIAIAQgAWtqIQUgASAAa0EBaiEGAkADQCABLQAAIABBp88Aai0AAEcNWSAAQQFGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMlwILIAJBADYCACAGQQFqIQFBCwxaCyABIARGBEBBlwEhAwyWAgsCQAJAAkACQCABLQAAQS1rDiMAW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1sBW1tbW1sCW1tbA1sLIAFBAWohAUH7ACEDDP8BCyABQQFqIQFB/AAhAwz+AQsgAUEBaiEBQYEBIQMM/QELIAFBAWohAUGCASEDDPwBC0GYASEDIAEgBEYNlAIgAigCACIAIAQgAWtqIQUgASAAa0EEaiEGAkADQCABLQAAIABBqc8Aai0AAEcNVyAAQQRGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMlQILIAJBADYCACAGQQFqIQFBGQxYC0GZASEDIAEgBEYNkwIgAigCACIAIAQgAWtqIQUgASAAa0EFaiEGAkADQCABLQAAIABBrs8Aai0AAEcNViAAQQVGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMlAILIAJBADYCACAGQQFqIQFBBgxXC0GaASEDIAEgBEYNkgIgAigCACIAIAQgAWtqIQUgASAAa0EBaiEGAkADQCABLQAAIABBtM8Aai0AAEcNVSAAQQFGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMkwILIAJBADYCACAGQQFqIQFBHAxWC0GbASEDIAEgBEYNkQIgAigCACIAIAQgAWtqIQUgASAAa0EBaiEGAkADQCABLQAAIABBts8Aai0AAEcNVCAAQQFGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMkgILIAJBADYCACAGQQFqIQFBJwxVCyABIARGBEBBnAEhAwyRAgsCQAJAIAEtAABB1ABrDgIAAVQLIAFBAWohAUGGASEDDPgBCyABQQFqIQFBhwEhAwz3AQtBnQEhAyABIARGDY8CIAIoAgAiACAEIAFraiEFIAEgAGtBAWohBgJAA0AgAS0AACAAQbjPAGotAABHDVIgAEEBRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADJACCyACQQA2AgAgBkEBaiEBQSYMUwtBngEhAyABIARGDY4CIAIoAgAiACAEIAFraiEFIAEgAGtBAWohBgJAA0AgAS0AACAAQbrPAGotAABHDVEgAEEBRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADI8CCyACQQA2AgAgBkEBaiEBQQMMUgtBnwEhAyABIARGDY0CIAIoAgAiACAEIAFraiEFIAEgAGtBAmohBgJAA0AgAS0AACAAQe3PAGotAABHDVAgAEECRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADI4CCyACQQA2AgAgBkEBaiEBQQwMUQtBoAEhAyABIARGDYwCIAIoAgAiACAEIAFraiEFIAEgAGtBA2ohBgJAA0AgAS0AACAAQbzPAGotAABHDU8gAEEDRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADI0CCyACQQA2AgAgBkEBaiEBQQ0MUAsgASAERgRAQaEBIQMMjAILAkACQCABLQAAQcYAaw4LAE9PT09PT09PTwFPCyABQQFqIQFBiwEhAwzzAQsgAUEBaiEBQYwBIQMM8gELIAEgBEYEQEGiASEDDIsCCyABLQAAQdAARw1MIAFBAWohAQxGCyABIARGBEBBowEhAwyKAgsCQAJAIAEtAABByQBrDgcBTU1NTU0ATQsgAUEBaiEBQY4BIQMM8QELIAFBAWohAUEiDE0LQaQBIQMgASAERg2IAiACKAIAIgAgBCABa2ohBSABIABrQQFqIQYCQANAIAEtAAAgAEHAzwBqLQAARw1LIABBAUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyJAgsgAkEANgIAIAZBAWohAUEdDEwLIAEgBEYEQEGlASEDDIgCCwJAAkAgAS0AAEHSAGsOAwBLAUsLIAFBAWohAUGQASEDDO8BCyABQQFqIQFBBAxLCyABIARGBEBBpgEhAwyHAgsCQAJAAkACQAJAIAEtAABBwQBrDhUATU1NTU1NTU1NTQFNTQJNTQNNTQRNCyABQQFqIQFBiAEhAwzxAQsgAUEBaiEBQYkBIQMM8AELIAFBAWohAUGKASEDDO8BCyABQQFqIQFBjwEhAwzuAQsgAUEBaiEBQZEBIQMM7QELQacBIQMgASAERg2FAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEHtzwBqLQAARw1IIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyGAgsgAkEANgIAIAZBAWohAUERDEkLQagBIQMgASAERg2EAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEHCzwBqLQAARw1HIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyFAgsgAkEANgIAIAZBAWohAUEsDEgLQakBIQMgASAERg2DAiACKAIAIgAgBCABa2ohBSABIABrQQRqIQYCQANAIAEtAAAgAEHFzwBqLQAARw1GIABBBEYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyEAgsgAkEANgIAIAZBAWohAUErDEcLQaoBIQMgASAERg2CAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEHKzwBqLQAARw1FIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyDAgsgAkEANgIAIAZBAWohAUEUDEYLIAEgBEYEQEGrASEDDIICCwJAAkACQAJAIAEtAABBwgBrDg8AAQJHR0dHR0dHR0dHRwNHCyABQQFqIQFBkwEhAwzrAQsgAUEBaiEBQZQBIQMM6gELIAFBAWohAUGVASEDDOkBCyABQQFqIQFBlgEhAwzoAQsgASAERgRAQawBIQMMgQILIAEtAABBxQBHDUIgAUEBaiEBDD0LQa0BIQMgASAERg3/ASACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEHNzwBqLQAARw1CIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyAAgsgAkEANgIAIAZBAWohAUEODEMLIAEgBEYEQEGuASEDDP8BCyABLQAAQdAARw1AIAFBAWohAUElDEILQa8BIQMgASAERg39ASACKAIAIgAgBCABa2ohBSABIABrQQhqIQYCQANAIAEtAAAgAEHQzwBqLQAARw1AIABBCEYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAz+AQsgAkEANgIAIAZBAWohAUEqDEELIAEgBEYEQEGwASEDDP0BCwJAAkAgAS0AAEHVAGsOCwBAQEBAQEBAQEABQAsgAUEBaiEBQZoBIQMM5AELIAFBAWohAUGbASEDDOMBCyABIARGBEBBsQEhAwz8AQsCQAJAIAEtAABBwQBrDhQAPz8/Pz8/Pz8/Pz8/Pz8/Pz8/AT8LIAFBAWohAUGZASEDDOMBCyABQQFqIQFBnAEhAwziAQtBsgEhAyABIARGDfoBIAIoAgAiACAEIAFraiEFIAEgAGtBA2ohBgJAA0AgAS0AACAAQdnPAGotAABHDT0gAEEDRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADPsBCyACQQA2AgAgBkEBaiEBQSEMPgtBswEhAyABIARGDfkBIAIoAgAiACAEIAFraiEFIAEgAGtBBmohBgJAA0AgAS0AACAAQd3PAGotAABHDTwgAEEGRg0BIABBAWohACAEIAFBAWoiAUcNAAsgAiAFNgIADPoBCyACQQA2AgAgBkEBaiEBQRoMPQsgASAERgRAQbQBIQMM+QELAkACQAJAIAEtAABBxQBrDhEAPT09PT09PT09AT09PT09Aj0LIAFBAWohAUGdASEDDOEBCyABQQFqIQFBngEhAwzgAQsgAUEBaiEBQZ8BIQMM3wELQbUBIQMgASAERg33ASACKAIAIgAgBCABa2ohBSABIABrQQVqIQYCQANAIAEtAAAgAEHkzwBqLQAARw06IABBBUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAz4AQsgAkEANgIAIAZBAWohAUEoDDsLQbYBIQMgASAERg32ASACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEHqzwBqLQAARw05IABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAz3AQsgAkEANgIAIAZBAWohAUEHDDoLIAEgBEYEQEG3ASEDDPYBCwJAAkAgAS0AAEHFAGsODgA5OTk5OTk5OTk5OTkBOQsgAUEBaiEBQaEBIQMM3QELIAFBAWohAUGiASEDDNwBC0G4ASEDIAEgBEYN9AEgAigCACIAIAQgAWtqIQUgASAAa0ECaiEGAkADQCABLQAAIABB7c8Aai0AAEcNNyAAQQJGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAM9QELIAJBADYCACAGQQFqIQFBEgw4C0G5ASEDIAEgBEYN8wEgAigCACIAIAQgAWtqIQUgASAAa0EBaiEGAkADQCABLQAAIABB8M8Aai0AAEcNNiAAQQFGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAM9AELIAJBADYCACAGQQFqIQFBIAw3C0G6ASEDIAEgBEYN8gEgAigCACIAIAQgAWtqIQUgASAAa0EBaiEGAkADQCABLQAAIABB8s8Aai0AAEcNNSAAQQFGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAM8wELIAJBADYCACAGQQFqIQFBDww2CyABIARGBEBBuwEhAwzyAQsCQAJAIAEtAABByQBrDgcANTU1NTUBNQsgAUEBaiEBQaUBIQMM2QELIAFBAWohAUGmASEDDNgBC0G8ASEDIAEgBEYN8AEgAigCACIAIAQgAWtqIQUgASAAa0EHaiEGAkADQCABLQAAIABB9M8Aai0AAEcNMyAAQQdGDQEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAM8QELIAJBADYCACAGQQFqIQFBGww0CyABIARGBEBBvQEhAwzwAQsCQAJAAkAgAS0AAEHCAGsOEgA0NDQ0NDQ0NDQBNDQ0NDQ0AjQLIAFBAWohAUGkASEDDNgBCyABQQFqIQFBpwEhAwzXAQsgAUEBaiEBQagBIQMM1gELIAEgBEYEQEG+ASEDDO8BCyABLQAAQc4ARw0wIAFBAWohAQwsCyABIARGBEBBvwEhAwzuAQsCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCABLQAAQcEAaw4VAAECAz8EBQY/Pz8HCAkKCz8MDQ4PPwsgAUEBaiEBQegAIQMM4wELIAFBAWohAUHpACEDDOIBCyABQQFqIQFB7gAhAwzhAQsgAUEBaiEBQfIAIQMM4AELIAFBAWohAUHzACEDDN8BCyABQQFqIQFB9gAhAwzeAQsgAUEBaiEBQfcAIQMM3QELIAFBAWohAUH6ACEDDNwBCyABQQFqIQFBgwEhAwzbAQsgAUEBaiEBQYQBIQMM2gELIAFBAWohAUGFASEDDNkBCyABQQFqIQFBkgEhAwzYAQsgAUEBaiEBQZgBIQMM1wELIAFBAWohAUGgASEDDNYBCyABQQFqIQFBowEhAwzVAQsgAUEBaiEBQaoBIQMM1AELIAEgBEcEQCACQRA2AgggAiABNgIEQasBIQMM1AELQcABIQMM7AELQQAhAAJAIAIoAjgiA0UNACADKAI0IgNFDQAgAiADEQAAIQALIABFDV4gAEEVRw0HIAJB0QA2AhwgAiABNgIUIAJBsBc2AhAgAkEVNgIMQQAhAwzrAQsgAUEBaiABIARHDQgaQcIBIQMM6gELA0ACQCABLQAAQQprDgQIAAALAAsgBCABQQFqIgFHDQALQcMBIQMM6QELIAEgBEcEQCACQRE2AgggAiABNgIEQQEhAwzQAQtBxAEhAwzoAQsgASAERgRAQcUBIQMM6AELAkACQCABLQAAQQprDgQBKCgAKAsgAUEBagwJCyABQQFqDAULIAEgBEYEQEHGASEDDOcBCwJAAkAgAS0AAEEKaw4XAQsLAQsLCwsLCwsLCwsLCwsLCwsLCwALCyABQQFqIQELQbABIQMMzQELIAEgBEYEQEHIASEDDOYBCyABLQAAQSBHDQkgAkEAOwEyIAFBAWohAUGzASEDDMwBCwNAIAEhAAJAIAEgBEcEQCABLQAAQTBrQf8BcSIDQQpJDQEMJwtBxwEhAwzmAQsCQCACLwEyIgFBmTNLDQAgAiABQQpsIgU7ATIgBUH+/wNxIANB//8Dc0sNACAAQQFqIQEgAiADIAVqIgM7ATIgA0H//wNxQegHSQ0BCwtBACEDIAJBADYCHCACQcEJNgIQIAJBDTYCDCACIABBAWo2AhQM5AELIAJBADYCHCACIAE2AhQgAkHwDDYCECACQRs2AgxBACEDDOMBCyACKAIEIQAgAkEANgIEIAIgACABECYiAA0BIAFBAWoLIQFBrQEhAwzIAQsgAkHBATYCHCACIAA2AgwgAiABQQFqNgIUQQAhAwzgAQsgAigCBCEAIAJBADYCBCACIAAgARAmIgANASABQQFqCyEBQa4BIQMMxQELIAJBwgE2AhwgAiAANgIMIAIgAUEBajYCFEEAIQMM3QELIAJBADYCHCACIAE2AhQgAkGXCzYCECACQQ02AgxBACEDDNwBCyACQQA2AhwgAiABNgIUIAJB4xA2AhAgAkEJNgIMQQAhAwzbAQsgAkECOgAoDKwBC0EAIQMgAkEANgIcIAJBrws2AhAgAkECNgIMIAIgAUEBajYCFAzZAQtBAiEDDL8BC0ENIQMMvgELQSYhAwy9AQtBFSEDDLwBC0EWIQMMuwELQRghAwy6AQtBHCEDDLkBC0EdIQMMuAELQSAhAwy3AQtBISEDDLYBC0EjIQMMtQELQcYAIQMMtAELQS4hAwyzAQtBPSEDDLIBC0HLACEDDLEBC0HOACEDDLABC0HYACEDDK8BC0HZACEDDK4BC0HbACEDDK0BC0HxACEDDKwBC0H0ACEDDKsBC0GNASEDDKoBC0GXASEDDKkBC0GpASEDDKgBC0GvASEDDKcBC0GxASEDDKYBCyACQQA2AgALQQAhAyACQQA2AhwgAiABNgIUIAJB8Rs2AhAgAkEGNgIMDL0BCyACQQA2AgAgBkEBaiEBQSQLOgApIAIoAgQhACACQQA2AgQgAiAAIAEQJyIARQRAQeUAIQMMowELIAJB+QA2AhwgAiABNgIUIAIgADYCDEEAIQMMuwELIABBFUcEQCACQQA2AhwgAiABNgIUIAJBzA42AhAgAkEgNgIMQQAhAwy7AQsgAkH4ADYCHCACIAE2AhQgAkHKGDYCECACQRU2AgxBACEDDLoBCyACQQA2AhwgAiABNgIUIAJBjhs2AhAgAkEGNgIMQQAhAwy5AQsgAkEANgIcIAIgATYCFCACQf4RNgIQIAJBBzYCDEEAIQMMuAELIAJBADYCHCACIAE2AhQgAkGMHDYCECACQQc2AgxBACEDDLcBCyACQQA2AhwgAiABNgIUIAJBww82AhAgAkEHNgIMQQAhAwy2AQsgAkEANgIcIAIgATYCFCACQcMPNgIQIAJBBzYCDEEAIQMMtQELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0RIAJB5QA2AhwgAiABNgIUIAIgADYCDEEAIQMMtAELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0gIAJB0wA2AhwgAiABNgIUIAIgADYCDEEAIQMMswELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0iIAJB0gA2AhwgAiABNgIUIAIgADYCDEEAIQMMsgELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0OIAJB5QA2AhwgAiABNgIUIAIgADYCDEEAIQMMsQELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0dIAJB0wA2AhwgAiABNgIUIAIgADYCDEEAIQMMsAELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0fIAJB0gA2AhwgAiABNgIUIAIgADYCDEEAIQMMrwELIABBP0cNASABQQFqCyEBQQUhAwyUAQtBACEDIAJBADYCHCACIAE2AhQgAkH9EjYCECACQQc2AgwMrAELIAJBADYCHCACIAE2AhQgAkHcCDYCECACQQc2AgxBACEDDKsBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNByACQeUANgIcIAIgATYCFCACIAA2AgxBACEDDKoBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNFiACQdMANgIcIAIgATYCFCACIAA2AgxBACEDDKkBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNGCACQdIANgIcIAIgATYCFCACIAA2AgxBACEDDKgBCyACQQA2AhwgAiABNgIUIAJBxgo2AhAgAkEHNgIMQQAhAwynAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDQMgAkHlADYCHCACIAE2AhQgAiAANgIMQQAhAwymAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDRIgAkHTADYCHCACIAE2AhQgAiAANgIMQQAhAwylAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDRQgAkHSADYCHCACIAE2AhQgAiAANgIMQQAhAwykAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDQAgAkHlADYCHCACIAE2AhQgAiAANgIMQQAhAwyjAQtB1QAhAwyJAQsgAEEVRwRAIAJBADYCHCACIAE2AhQgAkG5DTYCECACQRo2AgxB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AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIABB5ABrDvQDY2IAAWFhYWFhYQIDBAVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhBgcICQoLDA0OD2FhYWFhEGFhYWFhYWFhYWFhEWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYRITFBUWFxgZGhthYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2YTc4OTphYWFhYWFhYTthYWE8YWFhYT0+P2FhYWFhYWFhQGFhQWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYUJDREVGR0hJSktMTU5PUFFSU2FhYWFhYWFhVFVWV1hZWlthXF1hYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFeYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhX2BhC0HhJw8LQaQhDwtByywPC0H+MQ8LQcAkDwtBqyQPC0GNKA8LQeImDwtBgDAPC0G5Lw8LQdckDwtB7x8PC0HhHw8LQfofDwtB8iAPC0GoLw8LQa4yDwtBiDAPC0HsJw8LQYIiDwtBjh0PC0HQLg8LQcojDwtBxTIPC0HfHA8LQdIcDwtBxCAPC0HXIA8LQaIfDwtB7S4PC0GrMA8LQdQlDwtBzC4PC0H6Lg8LQfwrDwtB0jAPC0HxHQ8LQbsgDwtB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CABB3AgLii1JbnZhbGlkIGNoYXIgaW4gdXJsIHF1ZXJ5AFNwYW4gY2FsbGJhY2sgZXJyb3IgaW4gb25fYm9keQBDb250ZW50LUxlbmd0aCBvdmVyZmxvdwBDaHVuayBzaXplIG92ZXJmbG93AFJlc3BvbnNlIG92ZXJmbG93AEludmFsaWQgbWV0aG9kIGZvciBIVFRQL3gueCByZXF1ZXN0AEludmFsaWQgbWV0aG9kIGZvciBSVFNQL3gueCByZXF1ZXN0AEV4cGVjdGVkIFNPVVJDRSBtZXRob2QgZm9yIElDRS94LnggcmVxdWVzdABJbnZhbGlkIGNoYXIgaW4gdXJsIGZyYWdtZW50IHN0YXJ0AEV4cGVjdGVkIGRvdABTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX3N0YXR1cwBJbnZhbGlkIHJlc3BvbnNlIHN0YXR1cwBJbnZhbGlkIGNoYXJhY3RlciBpbiBjaHVuayBleHRlbnNpb25zAFVzZXIgY2FsbGJhY2sgZXJyb3IAYG9uX3Jlc2V0YCBjYWxsYmFjayBlcnJvcgBgb25fY2h1bmtfaGVhZGVyYCBjYWxsYmFjayBlcnJvcgBgb25fbWVzc2FnZV9iZWdpbmAgY2FsbGJhY2sgZXJyb3IAYG9uX2NodW5rX2V4dGVuc2lvbl92YWx1ZWAgY2FsbGJhY2sgZXJyb3IAYG9uX3N0YXR1c19jb21wbGV0ZWAgY2FsbGJhY2sgZXJyb3IAYG9uX3ZlcnNpb25fY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl91cmxfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9jaHVua19jb21wbGV0ZWAgY2FsbGJhY2sgZXJyb3IAYG9uX2hlYWRlcl92YWx1ZV9jb21wbGV0ZWAgY2FsbGJhY2sgZXJyb3IAYG9uX21lc3NhZ2VfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9tZXRob2RfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9oZWFkZXJfZmllbGRfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9jaHVua19leHRlbnNpb25fbmFtZWAgY2FsbGJhY2sgZXJyb3IAVW5leHBlY3RlZCBjaGFyIGluIHVybCBzZXJ2ZXIASW52YWxpZCBoZWFkZXIgdmFsdWUgY2hhcgBJbnZhbGlkIGhlYWRlciBmaWVsZCBjaGFyAFNwYW4gY2FsbGJhY2sgZXJyb3IgaW4gb25fdmVyc2lvbgBJbnZhbGlkIG1pbm9yIHZlcnNpb24ASW52YWxpZCBtYWpvciB2ZXJzaW9uAEV4cGVjdGVkIHNwYWNlIGFmdGVyIHZlcnNpb24ARXhwZWN0ZWQgQ1JMRiBhZnRlciB2ZXJzaW9uAEludmFsaWQgSFRUUCB2ZXJzaW9uAEludmFsaWQgaGVhZGVyIHRva2VuAFNwYW4gY2FsbGJhY2sgZXJyb3IgaW4gb25fdXJsAEludmFsaWQgY2hhcmFjdGVycyBpbiB1cmwAVW5leHBlY3RlZCBzdGFydCBjaGFyIGluIHVybABEb3VibGUgQCBpbiB1cmwARW1wdHkgQ29udGVudC1MZW5ndGgASW52YWxpZCBjaGFyYWN0ZXIgaW4gQ29udGVudC1MZW5ndGgARHVwbGljYXRlIENvbnRlbnQtTGVuZ3RoAEludmFsaWQgY2hhciBpbiB1cmwgcGF0aABDb250ZW50LUxlbmd0aCBjYW4ndCBiZSBwcmVzZW50IHdpdGggVHJhbnNmZXItRW5jb2RpbmcASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgc2l6ZQBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX2hlYWRlcl92YWx1ZQBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX2NodW5rX2V4dGVuc2lvbl92YWx1ZQBJbnZhbGlkIGNoYXJhY3RlciBpbiBjaHVuayBleHRlbnNpb25zIHZhbHVlAE1pc3NpbmcgZXhwZWN0ZWQgTEYgYWZ0ZXIgaGVhZGVyIHZhbHVlAEludmFsaWQgYFRyYW5zZmVyLUVuY29kaW5nYCBoZWFkZXIgdmFsdWUASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgZXh0ZW5zaW9ucyBxdW90ZSB2YWx1ZQBJbnZhbGlkIGNoYXJhY3RlciBpbiBjaHVuayBleHRlbnNpb25zIHF1b3RlZCB2YWx1ZQBQYXVzZWQgYnkgb25faGVhZGVyc19jb21wbGV0ZQBJbnZhbGlkIEVPRiBzdGF0ZQBvbl9yZXNldCBwYXVzZQBvbl9jaHVua19oZWFkZXIgcGF1c2UAb25fbWVzc2FnZV9iZWdpbiBwYXVzZQBvbl9jaHVua19leHRlbnNpb25fdmFsdWUgcGF1c2UAb25fc3RhdHVzX2NvbXBsZXRlIHBhdXNlAG9uX3ZlcnNpb25fY29tcGxldGUgcGF1c2UAb25fdXJsX2NvbXBsZXRlIHBhdXNlAG9uX2NodW5rX2NvbXBsZXRlIHBhdXNlAG9uX2hlYWRlcl92YWx1ZV9jb21wbGV0ZSBwYXVzZQBvbl9tZXNzYWdlX2NvbXBsZXRlIHBhdXNlAG9uX21ldGhvZF9jb21wbGV0ZSBwYXVzZQBvbl9oZWFkZXJfZmllbGRfY29tcGxldGUgcGF1c2UAb25fY2h1bmtfZXh0ZW5zaW9uX25hbWUgcGF1c2UAVW5leHBlY3RlZCBzcGFjZSBhZnRlciBzdGFydCBsaW5lAFNwYW4gY2FsbGJhY2sgZXJyb3IgaW4gb25fY2h1bmtfZXh0ZW5zaW9uX25hbWUASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgZXh0ZW5zaW9ucyBuYW1lAFBhdXNlIG9uIENPTk5FQ1QvVXBncmFkZQBQYXVzZSBvbiBQUkkvVXBncmFkZQBFeHBlY3RlZCBIVFRQLzIgQ29ubmVjdGlvbiBQcmVmYWNlAFNwYW4gY2FsbGJhY2sgZXJyb3IgaW4gb25fbWV0aG9kAEV4cGVjdGVkIHNwYWNlIGFmdGVyIG1ldGhvZABTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX2hlYWRlcl9maWVsZABQYXVzZWQASW52YWxpZCB3b3JkIGVuY291bnRlcmVkAEludmFsaWQgbWV0aG9kIGVuY291bnRlcmVkAFVuZXhwZWN0ZWQgY2hhciBpbiB1cmwgc2NoZW1hAFJlcXVlc3QgaGFzIGludmFsaWQgYFRyYW5zZmVyLUVuY29kaW5nYABTV0lUQ0hfUFJPWFkAVVNFX1BST1hZAE1LQUNUSVZJVFkAVU5QUk9DRVNTQUJMRV9FTlRJVFkAQ09QWQBNT1ZFRF9QRVJNQU5FTlRMWQBUT09fRUFSTFkATk9USUZZAEZBSUxFRF9ERVBFTkRFTkNZAEJBRF9HQVRFV0FZAFBMQVkAUFVUAENIRUNLT1VUAEdBVEVXQVlfVElNRU9VVABSRVFVRVNUX1RJTUVPVVQATkVUV09SS19DT05ORUNUX1RJTUVPVVQAQ09OTkVDVElPTl9USU1FT1VUAExPR0lOX1RJTUVPVVQATkVUV09SS19SRUFEX1RJTUVPVVQAUE9TVABNSVNESVJFQ1RFRF9SRVFVRVNUAENMSUVOVF9DTE9TRURfUkVRVUVTVABDTElFTlRfQ0xPU0VEX0xPQURfQkFMQU5DRURfUkVRVUVTVABCQURfUkVRVUVTVABIVFRQX1JFUVVFU1RfU0VOVF9UT19IVFRQU19QT1JUAFJFUE9SVABJTV9BX1RFQVBPVABSRVNFVF9DT05URU5UAE5PX0NPTlRFTlQAUEFSVElBTF9DT05URU5UAEhQRV9JTlZBTElEX0NPTlNUQU5UAEhQRV9DQl9SRVNFVABHRVQASFBFX1NUUklDVABDT05GTElDVABURU1QT1JBUllfUkVESVJFQ1QAUEVSTUFORU5UX1JFRElSRUNUAENPTk5FQ1QATVVMVElfU1RBVFVTAEhQRV9JTlZBTElEX1NUQVRVUwBUT09fTUFOWV9SRVFVRVNUUwBFQVJMWV9ISU5UUwBVTkFWQUlMQUJMRV9GT1JfTEVHQUxfUkVBU09OUwBPUFRJT05TAFNXSVRDSElOR19QUk9UT0NPTFMAVkFSSUFOVF9BTFNPX05FR09USUFURVMATVVMVElQTEVfQ0hPSUNFUwBJTlRFUk5BTF9TRVJWRVJfRVJST1IAV0VCX1NFUlZFUl9VTktOT1dOX0VSUk9SAFJBSUxHVU5fRVJST1IASURFTlRJVFlfUFJPVklERVJfQVVUSEVOVElDQVRJT05fRVJST1IAU1NMX0NFUlRJRklDQVRFX0VSUk9SAElOVkFMSURfWF9GT1JXQVJERURfRk9SAFNFVF9QQVJBTUVURVIAR0VUX1BBUkFNRVRFUgBIUEVfVVNFUgBTRUVfT1RIRVIASFBFX0NCX0NIVU5LX0hFQURFUgBNS0NBTEVOREFSAFNFVFVQAFdFQl9TRVJWRVJfSVNfRE9XTgBURUFSRE9XTgBIUEVfQ0xPU0VEX0NPTk5FQ1RJT04ASEVVUklTVElDX0VYUElSQVRJT04ARElTQ09OTkVDVEVEX09QRVJBVElPTgBOT05fQVVUSE9SSVRBVElWRV9JTkZPUk1BVElPTgBIUEVfSU5WQUxJRF9WRVJTSU9OAEhQRV9DQl9NRVNTQUdFX0JFR0lOAFNJVEVfSVNfRlJPWkVOAEhQRV9JTlZBTElEX0hFQURFUl9UT0tFTgBJTlZBTElEX1RPS0VOAEZPUkJJRERFTgBFTkhBTkNFX1lPVVJfQ0FMTQBIUEVfSU5WQUxJRF9VUkwAQkxPQ0tFRF9CWV9QQVJFTlRBTF9DT05UUk9MAE1LQ09MAEFDTABIUEVfSU5URVJOQUwAUkVRVUVTVF9IRUFERVJfRklFTERTX1RPT19MQVJHRV9VTk9GRklDSUFMAEhQRV9PSwBVTkxJTksAVU5MT0NLAFBSSQBSRVRSWV9XSVRIAEhQRV9JTlZBTElEX0NPTlRFTlRfTEVOR1RIAEhQRV9VTkVYUEVDVEVEX0NPTlRFTlRfTEVOR1RIAEZMVVNIAFBST1BQQVRDSABNLVNFQVJDSABVUklfVE9PX0xPTkcAUFJPQ0VTU0lORwBNSVNDRUxMQU5FT1VTX1BFUlNJU1RFTlRfV0FSTklORwBNSVNDRUxMQU5FT1VTX1dBUk5JTkcASFBFX0lOVkFMSURfVFJBTlNGRVJfRU5DT0RJTkcARXhwZWN0ZWQgQ1JMRgBIUEVfSU5WQUxJRF9DSFVOS19TSVpFAE1PVkUAQ09OVElOVUUASFBFX0NCX1NUQVRVU19DT01QTEVURQBIUEVfQ0JfSEVBREVSU19DT01QTEVURQBIUEVfQ0JfVkVSU0lPTl9DT01QTEVURQBIUEVfQ0JfVVJMX0NPTVBMRVRFAEhQRV9DQl9DSFVOS19DT01QTEVURQBIUEVfQ0JfSEVBREVSX1ZBTFVFX0NPTVBMRVRFAEhQRV9DQl9DSFVOS19FWFRFTlNJT05fVkFMVUVfQ09NUExFVEUASFBFX0NCX0NIVU5LX0VYVEVOU0lPTl9OQU1FX0NPTVBMRVRFAEhQRV9DQl9NRVNTQUdFX0NPTVBMRVRFAEhQRV9DQl9NRVRIT0RfQ09NUExFVEUASFBFX0NCX0hFQURFUl9GSUVMRF9DT01QTEVURQBERUxFVEUASFBFX0lOVkFMSURfRU9GX1NUQVRFAElOVkFMSURfU1NMX0NFUlRJRklDQVRFAFBBVVNFAE5PX1JFU1BPTlNFAFVOU1VQUE9SVEVEX01FRElBX1RZUEUAR09ORQBOT1RfQUNDRVBUQUJMRQBTRVJWSUNFX1VOQVZBSUxBQkxFAFJBTkdFX05PVF9TQVRJU0ZJQUJMRQBPUklHSU5fSVNfVU5SRUFDSEFCTEUAUkVTUE9OU0VfSVNfU1RBTEUAUFVSR0UATUVSR0UAUkVRVUVTVF9IRUFERVJfRklFTERTX1RPT19MQVJHRQBSRVFVRVNUX0hFQURFUl9UT09fTEFSR0UAUEFZTE9BRF9UT09fTEFSR0UASU5TVUZGSUNJRU5UX1NUT1JBR0UASFBFX1BBVVNFRF9VUEdSQURFAEhQRV9QQVVTRURfSDJfVVBHUkFERQBTT1VSQ0UAQU5OT1VOQ0UAVFJBQ0UASFBFX1VORVhQRUNURURfU1BBQ0UAREVTQ1JJQkUAVU5TVUJTQ1JJQkUAUkVDT1JEAEhQRV9JTlZBTElEX01FVEhPRABOT1RfRk9VTkQAUFJPUEZJTkQAVU5CSU5EAFJFQklORABVTkFVVEhPUklaRUQATUVUSE9EX05PVF9BTExPV0VEAEhUVFBfVkVSU0lPTl9OT1RfU1VQUE9SVEVEAEFMUkVBRFlfUkVQT1JURUQAQUNDRVBURUQATk9UX0lNUExFTUVOVEVEAExPT1BfREVURUNURUQASFBFX0NSX0VYUEVDVEVEAEhQRV9MRl9FWFBFQ1RFRABDUkVBVEVEAElNX1VTRUQASFBFX1BBVVNFRABUSU1FT1VUX09DQ1VSRUQAUEFZTUVOVF9SRVFVSVJFRABQUkVDT05ESVRJT05fUkVRVUlSRUQAUFJPWFlfQVVUSEVOVElDQVRJT05fUkVRVUlSRUQATkVUV09SS19BVVRIRU5USUNBVElPTl9SRVFVSVJFRABMRU5HVEhfUkVRVUlSRUQAU1NMX0NFUlRJRklDQVRFX1JFUVVJUkVEAFVQR1JBREVfUkVRVUlSRUQAUEFHRV9FWFBJUkVEAFBSRUNPTkRJVElPTl9GQUlMRUQARVhQRUNUQVRJT05fRkFJTEVEAFJFVkFMSURBVElPTl9GQUlMRUQAU1NMX0hBTkRTSEFLRV9GQUlMRUQATE9DS0VEAFRSQU5TRk9STUFUSU9OX0FQUExJRUQATk9UX01PRElGSUVEAE5PVF9FWFRFTkRFRABCQU5EV0lEVEhfTElNSVRfRVhDRUVERUQAU0lURV9JU19PVkVSTE9BREVEAEhFQUQARXhwZWN0ZWQgSFRUUC8AAF4TAAAmEwAAMBAAAPAXAACdEwAAFRIAADkXAADwEgAAChAAAHUSAACtEgAAghMAAE8UAAB/EAAAoBUAACMUAACJEgAAixQAAE0VAADUEQAAzxQAABAYAADJFgAA3BYAAMERAADgFwAAuxQAAHQUAAB8FQAA5RQAAAgXAAAfEAAAZRUAAKMUAAAoFQAAAhUAAJkVAAAsEAAAixkAAE8PAADUDgAAahAAAM4QAAACFwAAiQ4AAG4TAAAcEwAAZhQAAFYXAADBEwAAzRMAAGwTAABoFwAAZhcAAF8XAAAiEwAAzg8AAGkOAADYDgAAYxYAAMsTAACqDgAAKBcAACYXAADFEwAAXRYAAOgRAABnEwAAZRMAAPIWAABzEwAAHRcAAPkWAADzEQAAzw4AAM4VAAAMEgAAsxEAAKURAABhEAAAMhcAALsTAEH5NQsBAQBBkDYL4AEBAQIBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQBB/TcLAQEAQZE4C14CAwICAgICAAACAgACAgACAgICAgICAgICAAQAAAAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAAAAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAAgACAEH9OQsBAQBBkToLXgIAAgICAgIAAAICAAICAAICAgICAgICAgIAAwAEAAAAAgICAgICAgICAgICAgICAgICAgICAgICAgIAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgACAAIAQfA7Cw1sb3NlZWVwLWFsaXZlAEGJPAsBAQBBoDwL4AEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQBBiT4LAQEAQaA+C+cBAQEBAQEBAQEBAQEBAgEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQFjaHVua2VkAEGwwAALXwEBAAEBAQEBAAABAQABAQABAQEBAQEBAQEBAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQABAEGQwgALIWVjdGlvbmVudC1sZW5ndGhvbnJveHktY29ubmVjdGlvbgBBwMIACy1yYW5zZmVyLWVuY29kaW5ncGdyYWRlDQoNCg0KU00NCg0KVFRQL0NFL1RTUC8AQfnCAAsFAQIAAQMAQZDDAAvgAQQBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAEH5xAALBQECAAEDAEGQxQAL4AEEAQEFAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQBB+cYACwQBAAABAEGRxwAL3wEBAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAEH6yAALBAEAAAIAQZDJAAtfAwQAAAQEBAQEBAQEBAQEBQQEBAQEBAQEBAQEBAAEAAYHBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQABAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAQAQfrKAAsEAQAAAQBBkMsACwEBAEGqywALQQIAAAAAAAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwAAAAAAAAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAEH6zAALBAEAAAEAQZDNAAsBAQBBms0ACwYCAAAAAAIAQbHNAAs6AwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAAAAAAAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBB8M4AC5YBTk9VTkNFRUNLT1VUTkVDVEVURUNSSUJFTFVTSEVURUFEU0VBUkNIUkdFQ1RJVklUWUxFTkRBUlZFT1RJRllQVElPTlNDSFNFQVlTVEFUQ0hHRU9SRElSRUNUT1JUUkNIUEFSQU1FVEVSVVJDRUJTQ1JJQkVBUkRPV05BQ0VJTkROS0NLVUJTQ1JJQkVIVFRQL0FEVFAv", "base64");
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/llhttp/llhttp_simd-wasm.js
var require_llhttp_simd_wasm = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Buffer: Buffer$2 } = __require("node:buffer");
	module.exports = Buffer$2.from("AGFzbQEAAAABJwdgAX8Bf2ADf39/AX9gAX8AYAJ/fwBgBH9/f38Bf2AAAGADf39/AALLAQgDZW52GHdhc21fb25faGVhZGVyc19jb21wbGV0ZQAEA2VudhV3YXNtX29uX21lc3NhZ2VfYmVnaW4AAANlbnYLd2FzbV9vbl91cmwAAQNlbnYOd2FzbV9vbl9zdGF0dXMAAQNlbnYUd2FzbV9vbl9oZWFkZXJfZmllbGQAAQNlbnYUd2FzbV9vbl9oZWFkZXJfdmFsdWUAAQNlbnYMd2FzbV9vbl9ib2R5AAEDZW52GHdhc21fb25fbWVzc2FnZV9jb21wbGV0ZQAAAy0sBQYAAAIAAAAAAAACAQIAAgICAAADAAAAAAMDAwMBAQEBAQEBAQEAAAIAAAAEBQFwARISBQMBAAIGCAF/AUGA1AQLB9EFIgZtZW1vcnkCAAtfaW5pdGlhbGl6ZQAIGV9faW5kaXJlY3RfZnVuY3Rpb25fdGFibGUBAAtsbGh0dHBfaW5pdAAJGGxsaHR0cF9zaG91bGRfa2VlcF9hbGl2ZQAvDGxsaHR0cF9hbGxvYwALBm1hbGxvYwAxC2xsaHR0cF9mcmVlAAwEZnJlZQAMD2xsaHR0cF9nZXRfdHlwZQANFWxsaHR0cF9nZXRfaHR0cF9tYWpvcgAOFWxsaHR0cF9nZXRfaHR0cF9taW5vcgAPEWxsaHR0cF9nZXRfbWV0aG9kABAWbGxodHRwX2dldF9zdGF0dXNfY29kZQAREmxsaHR0cF9nZXRfdXBncmFkZQASDGxsaHR0cF9yZXNldAATDmxsaHR0cF9leGVjdXRlABQUbGxodHRwX3NldHRpbmdzX2luaXQAFQ1sbGh0dHBfZmluaXNoABYMbGxodHRwX3BhdXNlABcNbGxodHRwX3Jlc3VtZQAYG2xsaHR0cF9yZXN1bWVfYWZ0ZXJfdXBncmFkZQAZEGxsaHR0cF9nZXRfZXJybm8AGhdsbGh0dHBfZ2V0X2Vycm9yX3JlYXNvbgAbF2xsaHR0cF9zZXRfZXJyb3JfcmVhc29uABwUbGxodHRwX2dldF9lcnJvcl9wb3MAHRFsbGh0dHBfZXJybm9fbmFtZQAeEmxsaHR0cF9tZXRob2RfbmFtZQAfEmxsaHR0cF9zdGF0dXNfbmFtZQAgGmxsaHR0cF9zZXRfbGVu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PgtBhwEMPQtBiAEMPAtBiQEMOwtBigEMOgtBiwEMOQtBjAEMOAtBjQEMNwtBjgEMNgtBjwEMNQtBkAEMNAtBkQEMMwtBkgEMMgtBkwEMMQtBlAEMMAtBlQEMLwtBlgEMLgtBlwEMLQtBmAEMLAtBmQEMKwtBmgEMKgtBmwEMKQtBnAEMKAtBnQEMJwtBngEMJgtBnwEMJQtBoAEMJAtBoQEMIwtBogEMIgtBowEMIQtBpAEMIAtBpQEMHwtBpgEMHgtBpwEMHQtBqAEMHAtBqQEMGwtBqgEMGgtBqwEMGQtBrAEMGAtBrQEMFwtBrgEMFgtBAQwVC0GvAQwUC0GwAQwTC0GxAQwSC0GzAQwRC0GyAQwQC0G0AQwPC0G1AQwOC0G2AQwNC0G3AQwMC0G4AQwLC0G5AQwKC0G6AQwJC0G7AQwIC0HGAQwHC0G8AQwGC0G9AQwFC0G+AQwEC0G/AQwDC0HAAQwCC0HCAQwBC0HBAQshAwNAAkACQAJAAkACQAJAAkACQAJAIAICfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJ/AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAgJ/AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACfwJAAkACfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC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iQEhAwykAgtBASABLQAAQd8ARw1nGiABQQFqIQEMXgtBigEhAyABIARGDaICIAIoAgAiACAEIAFraiEFIAEgAGtBAWohBgNAIAEtAAAgAEGMzwBqLQAARw1kIABBAUYN+gEgAEEBaiEAIAQgAUEBaiIBRw0ACyACIAU2AgAMogILQYsBIQMgASAERg2hAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEGOzwBqLQAARw1kIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyiAgsgAkEANgIAIAZBAWohAUECDGULQYwBIQMgASAERg2gAiACKAIAIgAgBCABa2ohBSABIABrQQFqIQYCQANAIAEtAAAgAEHwzwBqLQAARw1jIABBAUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyhAgsgAkEANgIAIAZBAWohAUEfDGQLQY0BIQMgASAERg2fAiACKAIAIgAgBCABa2ohBSABIABrQQFqIQYCQANAIAEtAAAgAEHyzwBqLQAARw1iIABBAUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAygAgsgAkEANgIAIAZBAWohAUEJDGMLIAEgBEYEQEGOASEDDJ8CCwJAAkAgAS0AAEHJAGsOBwBiYmJiYgFiCyABQQFqIQFB+AAhAwyGAgsgAUEBaiEBQfkAIQMMhQILQY8BIQMgASAERg2dAiACKAIAIgAgBCABa2ohBSABIABrQQVqIQYCQANAIAEtAAAgAEGRzwBqLQAARw1gIABBBUYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAyeAgsgAkEANgIAIAZBAWohAUEYDGELQZABIQMgASAERg2cAiACKAIAIgAgBCABa2ohBSABIABrQQJqIQYCQANAIAEtAAAgAEGXzwBqLQAARw1fIABBAkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAydAgsgAkEANgIAIAZBAWohAUEXDGALQZEBIQMgASAERg2bAiACKAIAIgAgBCABa2ohBSABIABrQQZqIQYCQANAIAEtAAAgAEGazwBqLQAARw1eIABBBkYNASAAQQFqIQAgBCABQQFqIgFHDQALIAIgBTYCAAycAgsgAkEANgIAIAZBAWohAUEV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JSIARQ0RIAJB5QA2AhwgAiABNgIUIAIgADYCDEEAIQMMtAELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0gIAJB0wA2AhwgAiABNgIUIAIgADYCDEEAIQMMswELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0iIAJB0gA2AhwgAiABNgIUIAIgADYCDEEAIQMMsgELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0OIAJB5QA2AhwgAiABNgIUIAIgADYCDEEAIQMMsQELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0dIAJB0wA2AhwgAiABNgIUIAIgADYCDEEAIQMMsAELIAIoAgQhACACQQA2AgQgAiAAIAEQJSIARQ0fIAJB0gA2AhwgAiABNgIUIAIgADYCDEEAIQMMrwELIABBP0cNASABQQFqCyEBQQUhAwyUAQtBACEDIAJBADYCHCACIAE2AhQgAkH9EjYCECACQQc2AgwMrAELIAJBADYCHCACIAE2AhQgAkHcCDYCECACQQc2AgxBACEDDKsBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNByACQeUANgIcIAIgATYCFCACIAA2AgxBACEDDKoBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNFiACQdMANgIcIAIgATYCFCACIAA2AgxBACEDDKkBCyACKAIEIQAgAkEANgIEIAIgACABECUiAEUNGCACQdIANgIcIAIgATYCFCACIAA2AgxBACEDDKgBCyACQQA2AhwgAiABNgIUIAJBxgo2AhAgAkEHNgIMQQAhAwynAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDQMgAkHlADYCHCACIAE2AhQgAiAANgIMQQAhAwymAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDRIgAkHTADYCHCACIAE2AhQgAiAANgIMQQAhAwylAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDRQgAkHSADYCHCACIAE2AhQgAiAANgIMQQAhAwykAQsgAigCBCEAIAJBADYCBCACIAAgARAlIgBFDQAgAkHlADYCHCACIAE2AhQgAiAANgIMQQAhAwyjAQtB1QAhAwyJAQsgAEEVRwRAIAJBADYCHCACIAE2AhQgAkG5DTYCECACQRo2AgxB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AkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIABB5ABrDvQDY2IAAWFhYWFhYQIDBAVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhBgcICQoLDA0OD2FhYWFhEGFhYWFhYWFhYWFhEWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYRITFBUWFxgZGhthYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2YTc4OTphYWFhYWFhYTthYWE8YWFhYT0+P2FhYWFhYWFhQGFhQWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYUJDREVGR0hJSktMTU5PUFFSU2FhYWFhYWFhVFVWV1hZWlthXF1hYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFeYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhX2BhC0HhJw8LQaQhDwtByywPC0H+MQ8LQcAkDwtBqyQPC0GNKA8LQeImDwtBgDAPC0G5Lw8LQdckDwtB7x8PC0HhHw8LQfofDwtB8iAPC0GoLw8LQa4yDwtBiDAPC0HsJw8LQYIiDwtBjh0PC0HQLg8LQcojDwtBxTIPC0HfHA8LQdIcDwtBxCAPC0HXIA8LQaIfDwtB7S4PC0GrMA8LQdQlDwtBzC4PC0H6Lg8LQfwrDwtB0jAPC0HxHQ8LQbsgDwtB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AAADAEGUCAsFBAAAAAUAQaQICwkGAAAABwAAAAgAQdwIC4otSW52YWxpZCBjaGFyIGluIHVybCBxdWVyeQBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX2JvZHkAQ29udGVudC1MZW5ndGggb3ZlcmZsb3cAQ2h1bmsgc2l6ZSBvdmVyZmxvdwBSZXNwb25zZSBvdmVyZmxvdwBJbnZhbGlkIG1ldGhvZCBmb3IgSFRUUC94LnggcmVxdWVzdABJbnZhbGlkIG1ldGhvZCBmb3IgUlRTUC94LnggcmVxdWVzdABFeHBlY3RlZCBTT1VSQ0UgbWV0aG9kIGZvciBJQ0UveC54IHJlcXVlc3QASW52YWxpZCBjaGFyIGluIHVybCBmcmFnbWVudCBzdGFydABFeHBlY3RlZCBkb3QAU3BhbiBjYWxsYmFjayBlcnJvciBpbiBvbl9zdGF0dXMASW52YWxpZCByZXNwb25zZSBzdGF0dXMASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgZXh0ZW5zaW9ucwBVc2VyIGNhbGxiYWNrIGVycm9yAGBvbl9yZXNldGAgY2FsbGJhY2sgZXJyb3IAYG9uX2NodW5rX2hlYWRlcmAgY2FsbGJhY2sgZXJyb3IAYG9uX21lc3NhZ2VfYmVnaW5gIGNhbGxiYWNrIGVycm9yAGBvbl9jaHVua19leHRlbnNpb25fdmFsdWVgIGNhbGxiYWNrIGVycm9yAGBvbl9zdGF0dXNfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl92ZXJzaW9uX2NvbXBsZXRlYCBjYWxsYmFjayBlcnJvcgBgb25fdXJsX2NvbXBsZXRlYCBjYWxsYmFjayBlcnJvcgBgb25fY2h1bmtfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9oZWFkZXJfdmFsdWVfY29tcGxldGVgIGNhbGxiYWNrIGVycm9yAGBvbl9tZXNzYWdlX2NvbXBsZXRlYCBjYWxsYmFjayBlcnJvcgBgb25fbWV0aG9kX2NvbXBsZXRlYCBjYWxsYmFjayBlcnJvcgBgb25faGVhZGVyX2ZpZWxkX2NvbXBsZXRlYCBjYWxsYmFjayBlcnJvcgBgb25fY2h1bmtfZXh0ZW5zaW9uX25hbWVgIGNhbGxiYWNrIGVycm9yAFVuZXhwZWN0ZWQgY2hhciBpbiB1cmwgc2VydmVyAEludmFsaWQgaGVhZGVyIHZhbHVlIGNoYXIASW52YWxpZCBoZWFkZXIgZmllbGQgY2hhcgBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX3ZlcnNpb24ASW52YWxpZCBtaW5vciB2ZXJzaW9uAEludmFsaWQgbWFqb3IgdmVyc2lvbgBFeHBlY3RlZCBzcGFjZSBhZnRlciB2ZXJzaW9uAEV4cGVjdGVkIENSTEYgYWZ0ZXIgdmVyc2lvbgBJbnZhbGlkIEhUVFAgdmVyc2lvbgBJbnZhbGlkIGhlYWRlciB0b2tlbgBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX3VybABJbnZhbGlkIGNoYXJhY3RlcnMgaW4gdXJsAFVuZXhwZWN0ZWQgc3RhcnQgY2hhciBpbiB1cmwARG91YmxlIEAgaW4gdXJsAEVtcHR5IENvbnRlbnQtTGVuZ3RoAEludmFsaWQgY2hhcmFjdGVyIGluIENvbnRlbnQtTGVuZ3RoAER1cGxpY2F0ZSBDb250ZW50LUxlbmd0aABJbnZhbGlkIGNoYXIgaW4gdXJsIHBhdGgAQ29udGVudC1MZW5ndGggY2FuJ3QgYmUgcHJlc2VudCB3aXRoIFRyYW5zZmVyLUVuY29kaW5nAEludmFsaWQgY2hhcmFjdGVyIGluIGNodW5rIHNpemUAU3BhbiBjYWxsYmFjayBlcnJvciBpbiBvbl9oZWFkZXJfdmFsdWUAU3BhbiBjYWxsYmFjayBlcnJvciBpbiBvbl9jaHVua19leHRlbnNpb25fdmFsdWUASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgZXh0ZW5zaW9ucyB2YWx1ZQBNaXNzaW5nIGV4cGVjdGVkIExGIGFmdGVyIGhlYWRlciB2YWx1ZQBJbnZhbGlkIGBUcmFuc2Zlci1FbmNvZGluZ2AgaGVhZGVyIHZhbHVlAEludmFsaWQgY2hhcmFjdGVyIGluIGNodW5rIGV4dGVuc2lvbnMgcXVvdGUgdmFsdWUASW52YWxpZCBjaGFyYWN0ZXIgaW4gY2h1bmsgZXh0ZW5zaW9ucyBxdW90ZWQgdmFsdWUAUGF1c2VkIGJ5IG9uX2hlYWRlcnNfY29tcGxldGUASW52YWxpZCBFT0Ygc3RhdGUAb25fcmVzZXQgcGF1c2UAb25fY2h1bmtfaGVhZGVyIHBhdXNlAG9uX21lc3NhZ2VfYmVnaW4gcGF1c2UAb25fY2h1bmtfZXh0ZW5zaW9uX3ZhbHVlIHBhdXNlAG9uX3N0YXR1c19jb21wbGV0ZSBwYXVzZQBvbl92ZXJzaW9uX2NvbXBsZXRlIHBhdXNlAG9uX3VybF9jb21wbGV0ZSBwYXVzZQBvbl9jaHVua19jb21wbGV0ZSBwYXVzZQBvbl9oZWFkZXJfdmFsdWVfY29tcGxldGUgcGF1c2UAb25fbWVzc2FnZV9jb21wbGV0ZSBwYXVzZQBvbl9tZXRob2RfY29tcGxldGUgcGF1c2UAb25faGVhZGVyX2ZpZWxkX2NvbXBsZXRlIHBhdXNlAG9uX2NodW5rX2V4dGVuc2lvbl9uYW1lIHBhdXNlAFVuZXhwZWN0ZWQgc3BhY2UgYWZ0ZXIgc3RhcnQgbGluZQBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX2NodW5rX2V4dGVuc2lvbl9uYW1lAEludmFsaWQgY2hhcmFjdGVyIGluIGNodW5rIGV4dGVuc2lvbnMgbmFtZQBQYXVzZSBvbiBDT05ORUNUL1VwZ3JhZGUAUGF1c2Ugb24gUFJJL1VwZ3JhZGUARXhwZWN0ZWQgSFRUUC8yIENvbm5lY3Rpb24gUHJlZmFjZQBTcGFuIGNhbGxiYWNrIGVycm9yIGluIG9uX21ldGhvZABFeHBlY3RlZCBzcGFjZSBhZnRlciBtZXRob2QAU3BhbiBjYWxsYmFjayBlcnJvciBpbiBvbl9oZWFkZXJfZmllbGQAUGF1c2VkAEludmFsaWQgd29yZCBlbmNvdW50ZXJlZABJbnZhbGlkIG1ldGhvZCBlbmNvdW50ZXJlZABVbmV4cGVjdGVkIGNoYXIgaW4gdXJsIHNjaGVtYQBSZXF1ZXN0IGhhcyBpbnZhbGlkIGBUcmFuc2Zlci1FbmNvZGluZ2AAU1dJVENIX1BST1hZAFVTRV9QUk9YWQBNS0FDVElWSVRZAFVOUFJPQ0VTU0FCTEVfRU5USVRZAENPUFkATU9WRURfUEVSTUFORU5UTFkAVE9PX0VBUkxZAE5PVElGWQBGQUlMRURfREVQRU5ERU5DWQBCQURfR0FURVdBWQBQTEFZAFBVVABDSEVDS09VVABHQVRFV0FZX1RJTUVPVVQAUkVRVUVTVF9USU1FT1VUAE5FVFdPUktfQ09OTkVDVF9USU1FT1VUAENPTk5FQ1RJT05fVElNRU9VVABMT0dJTl9USU1FT1VUAE5FVFdPUktfUkVBRF9USU1FT1VUAFBPU1QATUlTRElSRUNURURfUkVRVUVTVABDTElFTlRfQ0xPU0VEX1JFUVVFU1QAQ0xJRU5UX0NMT1NFRF9MT0FEX0JBTEFOQ0VEX1JFUVVFU1QAQkFEX1JFUVVFU1QASFRUUF9SRVFVRVNUX1NFTlRfVE9fSFRUUFNfUE9SVABSRVBPUlQASU1fQV9URUFQT1QAUkVTRVRfQ09OVEVOVABOT19DT05URU5UAFBBUlRJQUxfQ09OVEVOVABIUEVfSU5WQUxJRF9DT05TVEFOVABIUEVfQ0JfUkVTRVQAR0VUAEhQRV9TVFJJQ1QAQ09ORkxJQ1QAVEVNUE9SQVJZX1JFRElSRUNUAFBFUk1BTkVOVF9SRURJUkVDVABDT05ORUNUAE1VTFRJX1NUQVRVUwBIUEVfSU5WQUxJRF9TVEFUVVMAVE9PX01BTllfUkVRVUVTVFMARUFSTFlfSElOVFMAVU5BVkFJTEFCTEVfRk9SX0xFR0FMX1JFQVNPTlMAT1BUSU9OUwBTV0lUQ0hJTkdfUFJPVE9DT0xTAFZBUklBTlRfQUxTT19ORUdPVElBVEVTAE1VTFRJUExFX0NIT0lDRVMASU5URVJOQUxfU0VSVkVSX0VSUk9SAFdFQl9TRVJWRVJfVU5LTk9XTl9FUlJPUgBSQUlMR1VOX0VSUk9SAElERU5USVRZX1BST1ZJREVSX0FVVEhFTlRJQ0FUSU9OX0VSUk9SAFNTTF9DRVJUSUZJQ0FURV9FUlJPUgBJTlZBTElEX1hfRk9SV0FSREVEX0ZPUgBTRVRfUEFSQU1FVEVSAEdFVF9QQVJBTUVURVIASFBFX1VTRVIAU0VFX09USEVSAEhQRV9DQl9DSFVOS19IRUFERVIATUtDQUxFTkRBUgBTRVRVUABXRUJfU0VSVkVSX0lTX0RPV04AVEVBUkRPV04ASFBFX0NMT1NFRF9DT05ORUNUSU9OAEhFVVJJU1RJQ19FWFBJUkFUSU9OAERJU0NPTk5FQ1RFRF9PUEVSQVRJT04ATk9OX0FVVEhPUklUQVRJVkVfSU5GT1JNQVRJT04ASFBFX0lOVkFMSURfVkVSU0lPTgBIUEVfQ0JfTUVTU0FHRV9CRUdJTgBTSVRFX0lTX0ZST1pFTgBIUEVfSU5WQUxJRF9IRUFERVJfVE9LRU4ASU5WQUxJRF9UT0tFTgBGT1JCSURERU4ARU5IQU5DRV9ZT1VSX0NBTE0ASFBFX0lOVkFMSURfVVJMAEJMT0NLRURfQllfUEFSRU5UQUxfQ09OVFJPTABNS0NPTABBQ0wASFBFX0lOVEVSTkFMAFJFUVVFU1RfSEVBREVSX0ZJRUxEU19UT09fTEFSR0VfVU5PRkZJQ0lBTABIUEVfT0sAVU5MSU5LAFVOTE9DSwBQUkkAUkVUUllfV0lUSABIUEVfSU5WQUxJRF9DT05URU5UX0xFTkdUSABIUEVfVU5FWFBFQ1RFRF9DT05URU5UX0xFTkdUSABGTFVTSABQUk9QUEFUQ0gATS1TRUFSQ0gAVVJJX1RPT19MT05HAFBST0NFU1NJTkcATUlTQ0VMTEFORU9VU19QRVJTSVNURU5UX1dBUk5JTkcATUlTQ0VMTEFORU9VU19XQVJOSU5HAEhQRV9JTlZBTElEX1RSQU5TRkVSX0VOQ09ESU5HAEV4cGVjdGVkIENSTEYASFBFX0lOVkFMSURfQ0hVTktfU0laRQBNT1ZFAENPTlRJTlVFAEhQRV9DQl9TVEFUVVNfQ09NUExFVEUASFBFX0NCX0hFQURFUlNfQ09NUExFVEUASFBFX0NCX1ZFUlNJT05fQ09NUExFVEUASFBFX0NCX1VSTF9DT01QTEVURQBIUEVfQ0JfQ0hVTktfQ09NUExFVEUASFBFX0NCX0hFQURFUl9WQUxVRV9DT01QTEVURQBIUEVfQ0JfQ0hVTktfRVhURU5TSU9OX1ZBTFVFX0NPTVBMRVRFAEhQRV9DQl9DSFVOS19FWFRFTlNJT05fTkFNRV9DT01QTEVURQBIUEVfQ0JfTUVTU0FHRV9DT01QTEVURQBIUEVfQ0JfTUVUSE9EX0NPTVBMRVRFAEhQRV9DQl9IRUFERVJfRklFTERfQ09NUExFVEUAREVMRVRFAEhQRV9JTlZBTElEX0VPRl9TVEFURQBJTlZBTElEX1NTTF9DRVJUSUZJQ0FURQBQQVVTRQBOT19SRVNQT05TRQBVTlNVUFBPUlRFRF9NRURJQV9UWVBFAEdPTkUATk9UX0FDQ0VQVEFCTEUAU0VSVklDRV9VTkFWQUlMQUJMRQBSQU5HRV9OT1RfU0FUSVNGSUFCTEUAT1JJR0lOX0lTX1VOUkVBQ0hBQkxFAFJFU1BPTlNFX0lTX1NUQUxFAFBVUkdFAE1FUkdFAFJFUVVFU1RfSEVBREVSX0ZJRUxEU19UT09fTEFSR0UAUkVRVUVTVF9IRUFERVJfVE9PX0xBUkdFAFBBWUxPQURfVE9PX0xBUkdFAElOU1VGRklDSUVOVF9TVE9SQUdFAEhQRV9QQVVTRURfVVBHUkFERQBIUEVfUEFVU0VEX0gyX1VQR1JBREUAU09VUkNFAEFOTk9VTkNFAFRSQUNFAEhQRV9VTkVYUEVDVEVEX1NQQUNFAERFU0NSSUJFAFVOU1VCU0NSSUJFAFJFQ09SRABIUEVfSU5WQUxJRF9NRVRIT0QATk9UX0ZPVU5EAFBST1BGSU5EAFVOQklORABSRUJJTkQAVU5BVVRIT1JJWkVEAE1FVEhPRF9OT1RfQUxMT1dFRABIVFRQX1ZFUlNJT05fTk9UX1NVUFBPUlRFRABBTFJFQURZX1JFUE9SVEVEAEFDQ0VQVEVEAE5PVF9JTVBMRU1FTlRFRABMT09QX0RFVEVDVEVEAEhQRV9DUl9FWFBFQ1RFRABIUEVfTEZfRVhQRUNURUQAQ1JFQVRFRABJTV9VU0VEAEhQRV9QQVVTRUQAVElNRU9VVF9PQ0NVUkVEAFBBWU1FTlRfUkVRVUlSRUQAUFJFQ09ORElUSU9OX1JFUVVJUkVEAFBST1hZX0FVVEhFTlRJQ0FUSU9OX1JFUVVJUkVEAE5FVFdPUktfQVVUSEVOVElDQVRJT05fUkVRVUlSRUQATEVOR1RIX1JFUVVJUkVEAFNTTF9DRVJUSUZJQ0FURV9SRVFVSVJFRABVUEdSQURFX1JFUVVJUkVEAFBBR0VfRVhQSVJFRABQUkVDT05ESVRJT05fRkFJTEVEAEVYUEVDVEFUSU9OX0ZBSUxFRABSRVZBTElEQVRJT05fRkFJTEVEAFNTTF9IQU5EU0hBS0VfRkFJTEVEAExPQ0tFRABUUkFOU0ZPUk1BVElPTl9BUFBMSUVEAE5PVF9NT0RJRklFRABOT1RfRVhURU5ERUQAQkFORFdJRFRIX0xJTUlUX0VYQ0VFREVEAFNJVEVfSVNfT1ZFUkxPQURFRABIRUFEAEV4cGVjdGVkIEhUVFAvAABeEwAAJhMAADAQAADwFwAAnRMAABUSAAA5FwAA8BIAAAoQAAB1EgAArRIAAIITAABPFAAAfxAAAKAVAAAjFAAAiRIAAIsUAABNFQAA1BEAAM8UAAAQGAAAyRYAANwWAADBEQAA4BcAALsUAAB0FAAAfBUAAOUUAAAIFwAAHxAAAGUVAACjFAAAKBUAAAIVAACZFQAALBAAAIsZAABPDwAA1A4AAGoQAADOEAAAAhcAAIkOAABuEwAAHBMAAGYUAABWFwAAwRMAAM0TAABsEwAAaBcAAGYXAABfFwAAIhMAAM4PAABpDgAA2A4AAGMWAADLEwAAqg4AACgXAAAmFwAAxRMAAF0WAADoEQAAZxMAAGUTAADyFgAAcxMAAB0XAAD5FgAA8xEAAM8OAADOFQAADBIAALMRAAClEQAAYRAAADIXAAC7EwBB+TULAQEAQZA2C+ABAQECAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAQf03CwEBAEGROAteAgMCAgICAgAAAgIAAgIAAgICAgICAgICAgAEAAAAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAAIAAgBB/TkLAQEAQZE6C14CAAICAgICAAACAgACAgACAgICAgICAgICAAMABAAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAAAAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAAgACAEHwOwsNbG9zZWVlcC1hbGl2ZQBBiTwLAQEAQaA8C+ABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAQYk+CwEBAEGgPgvnAQEBAQEBAQEBAQEBAQIBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBY2h1bmtlZABBsMAAC18BAQABAQEBAQAAAQEAAQEAAQEBAQEBAQEBAQAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEAAQBBkMIACyFlY3Rpb25lbnQtbGVuZ3Rob25yb3h5LWNvbm5lY3Rpb24AQcDCAAstcmFuc2Zlci1lbmNvZGluZ3BncmFkZQ0KDQoNClNNDQoNClRUUC9DRS9UU1AvAEH5wgALBQECAAEDAEGQwwAL4AEEAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQBB+cQACwUBAgABAwBBkMUAC+ABBAEBBQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAQfnGAAsEAQAAAQBBkccAC98BAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQBB+sgACwQBAAACAEGQyQALXwMEAAAEBAQEBAQEBAQEBAUEBAQEBAQEBAQEBAQABAAGBwQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEAAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAEAEH6ygALBAEAAAEAQZDLAAsBAQBBqssAC0ECAAAAAAAAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAAAAAAAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBB+swACwQBAAABAEGQzQALAQEAQZrNAAsGAgAAAAACAEGxzQALOgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAAAAAAAAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAQfDOAAuWAU5PVU5DRUVDS09VVE5FQ1RFVEVDUklCRUxVU0hFVEVBRFNFQVJDSFJHRUNUSVZJVFlMRU5EQVJWRU9USUZZUFRJT05TQ0hTRUFZU1RBVENIR0VPUkRJUkVDVE9SVFJDSFBBUkFNRVRFUlVSQ0VCU0NSSUJFQVJET1dOQUNFSU5ETktDS1VCU0NSSUJFSFRUUC9BRFRQLw==", "base64");
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/constants.js
var require_constants$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const corsSafeListedMethods = [
		"GET",
		"HEAD",
		"POST"
	];
	const corsSafeListedMethodsSet = new Set(corsSafeListedMethods);
	const nullBodyStatus = [
		101,
		204,
		205,
		304
	];
	const redirectStatus = [
		301,
		302,
		303,
		307,
		308
	];
	const redirectStatusSet = new Set(redirectStatus);
	/**
	* @see https://fetch.spec.whatwg.org/#block-bad-port
	*/
	const badPorts = [
		"1",
		"7",
		"9",
		"11",
		"13",
		"15",
		"17",
		"19",
		"20",
		"21",
		"22",
		"23",
		"25",
		"37",
		"42",
		"43",
		"53",
		"69",
		"77",
		"79",
		"87",
		"95",
		"101",
		"102",
		"103",
		"104",
		"109",
		"110",
		"111",
		"113",
		"115",
		"117",
		"119",
		"123",
		"135",
		"137",
		"139",
		"143",
		"161",
		"179",
		"389",
		"427",
		"465",
		"512",
		"513",
		"514",
		"515",
		"526",
		"530",
		"531",
		"532",
		"540",
		"548",
		"554",
		"556",
		"563",
		"587",
		"601",
		"636",
		"989",
		"990",
		"993",
		"995",
		"1719",
		"1720",
		"1723",
		"2049",
		"3659",
		"4045",
		"4190",
		"5060",
		"5061",
		"6000",
		"6566",
		"6665",
		"6666",
		"6667",
		"6668",
		"6669",
		"6679",
		"6697",
		"10080"
	];
	const badPortsSet = new Set(badPorts);
	/**
	* @see https://w3c.github.io/webappsec-referrer-policy/#referrer-policies
	*/
	const referrerPolicy = [
		"",
		"no-referrer",
		"no-referrer-when-downgrade",
		"same-origin",
		"origin",
		"strict-origin",
		"origin-when-cross-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url"
	];
	const referrerPolicySet = new Set(referrerPolicy);
	const requestRedirect = [
		"follow",
		"manual",
		"error"
	];
	const safeMethods = [
		"GET",
		"HEAD",
		"OPTIONS",
		"TRACE"
	];
	const safeMethodsSet = new Set(safeMethods);
	const requestMode = [
		"navigate",
		"same-origin",
		"no-cors",
		"cors"
	];
	const requestCredentials = [
		"omit",
		"same-origin",
		"include"
	];
	const requestCache = [
		"default",
		"no-store",
		"reload",
		"no-cache",
		"force-cache",
		"only-if-cached"
	];
	/**
	* @see https://fetch.spec.whatwg.org/#request-body-header-name
	*/
	const requestBodyHeader = [
		"content-encoding",
		"content-language",
		"content-location",
		"content-type",
		"content-length"
	];
	/**
	* @see https://fetch.spec.whatwg.org/#enumdef-requestduplex
	*/
	const requestDuplex = ["half"];
	/**
	* @see http://fetch.spec.whatwg.org/#forbidden-method
	*/
	const forbiddenMethods = [
		"CONNECT",
		"TRACE",
		"TRACK"
	];
	const forbiddenMethodsSet = new Set(forbiddenMethods);
	const subresource = [
		"audio",
		"audioworklet",
		"font",
		"image",
		"manifest",
		"paintworklet",
		"script",
		"style",
		"track",
		"video",
		"xslt",
		""
	];
	const subresourceSet = new Set(subresource);
	module.exports = {
		subresource,
		forbiddenMethods,
		requestBodyHeader,
		referrerPolicy,
		requestRedirect,
		requestMode,
		requestCredentials,
		requestCache,
		redirectStatus,
		corsSafeListedMethods,
		nullBodyStatus,
		safeMethods,
		badPorts,
		requestDuplex,
		subresourceSet,
		badPortsSet,
		redirectStatusSet,
		corsSafeListedMethodsSet,
		safeMethodsSet,
		forbiddenMethodsSet,
		referrerPolicySet
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/global.js
var require_global$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const globalOrigin = Symbol.for("undici.globalOrigin.1");
	function getGlobalOrigin() {
		return globalThis[globalOrigin];
	}
	function setGlobalOrigin(newOrigin) {
		if (newOrigin === void 0) {
			Object.defineProperty(globalThis, globalOrigin, {
				value: void 0,
				writable: true,
				enumerable: false,
				configurable: false
			});
			return;
		}
		const parsedURL = new URL(newOrigin);
		if (parsedURL.protocol !== "http:" && parsedURL.protocol !== "https:") throw new TypeError(`Only http & https urls are allowed, received ${parsedURL.protocol}`);
		Object.defineProperty(globalThis, globalOrigin, {
			value: parsedURL,
			writable: true,
			enumerable: false,
			configurable: false
		});
	}
	module.exports = {
		getGlobalOrigin,
		setGlobalOrigin
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/data-url.js
var require_data_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$24 = __require("node:assert");
	const encoder = new TextEncoder();
	/**
	* @see https://mimesniff.spec.whatwg.org/#http-token-code-point
	*/
	const HTTP_TOKEN_CODEPOINTS = /^[!#$%&'*+\-.^_|~A-Za-z0-9]+$/;
	const HTTP_WHITESPACE_REGEX = /[\u000A\u000D\u0009\u0020]/;
	const ASCII_WHITESPACE_REPLACE_REGEX = /[\u0009\u000A\u000C\u000D\u0020]/g;
	/**
	* @see https://mimesniff.spec.whatwg.org/#http-quoted-string-token-code-point
	*/
	const HTTP_QUOTED_STRING_TOKENS = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
	/** @param {URL} dataURL */
	function dataURLProcessor(dataURL) {
		assert$24(dataURL.protocol === "data:");
		let input = URLSerializer(dataURL, true);
		input = input.slice(5);
		const position = { position: 0 };
		let mimeType = collectASequenceOfCodePointsFast(",", input, position);
		const mimeTypeLength = mimeType.length;
		mimeType = removeASCIIWhitespace(mimeType, true, true);
		if (position.position >= input.length) return "failure";
		position.position++;
		let body = stringPercentDecode(input.slice(mimeTypeLength + 1));
		if (/;(\u0020){0,}base64$/i.test(mimeType)) {
			body = forgivingBase64(isomorphicDecode(body));
			if (body === "failure") return "failure";
			mimeType = mimeType.slice(0, -6);
			mimeType = mimeType.replace(/(\u0020)+$/, "");
			mimeType = mimeType.slice(0, -1);
		}
		if (mimeType.startsWith(";")) mimeType = "text/plain" + mimeType;
		let mimeTypeRecord = parseMIMEType(mimeType);
		if (mimeTypeRecord === "failure") mimeTypeRecord = parseMIMEType("text/plain;charset=US-ASCII");
		return {
			mimeType: mimeTypeRecord,
			body
		};
	}
	/**
	* @param {URL} url
	* @param {boolean} excludeFragment
	*/
	function URLSerializer(url, excludeFragment = false) {
		if (!excludeFragment) return url.href;
		const href = url.href;
		const hashLength = url.hash.length;
		const serialized = hashLength === 0 ? href : href.substring(0, href.length - hashLength);
		if (!hashLength && href.endsWith("#")) return serialized.slice(0, -1);
		return serialized;
	}
	/**
	* @param {(char: string) => boolean} condition
	* @param {string} input
	* @param {{ position: number }} position
	*/
	function collectASequenceOfCodePoints(condition, input, position) {
		let result = "";
		while (position.position < input.length && condition(input[position.position])) {
			result += input[position.position];
			position.position++;
		}
		return result;
	}
	/**
	* A faster collectASequenceOfCodePoints that only works when comparing a single character.
	* @param {string} char
	* @param {string} input
	* @param {{ position: number }} position
	*/
	function collectASequenceOfCodePointsFast(char, input, position) {
		const idx = input.indexOf(char, position.position);
		const start = position.position;
		if (idx === -1) {
			position.position = input.length;
			return input.slice(start);
		}
		position.position = idx;
		return input.slice(start, position.position);
	}
	/** @param {string} input */
	function stringPercentDecode(input) {
		return percentDecode(encoder.encode(input));
	}
	/**
	* @param {number} byte
	*/
	function isHexCharByte(byte) {
		return byte >= 48 && byte <= 57 || byte >= 65 && byte <= 70 || byte >= 97 && byte <= 102;
	}
	/**
	* @param {number} byte
	*/
	function hexByteToNumber(byte) {
		return byte >= 48 && byte <= 57 ? byte - 48 : (byte & 223) - 55;
	}
	/** @param {Uint8Array} input */
	function percentDecode(input) {
		const length = input.length;
		/** @type {Uint8Array} */
		const output = new Uint8Array(length);
		let j = 0;
		for (let i = 0; i < length; ++i) {
			const byte = input[i];
			if (byte !== 37) output[j++] = byte;
			else if (byte === 37 && !(isHexCharByte(input[i + 1]) && isHexCharByte(input[i + 2]))) output[j++] = 37;
			else {
				output[j++] = hexByteToNumber(input[i + 1]) << 4 | hexByteToNumber(input[i + 2]);
				i += 2;
			}
		}
		return length === j ? output : output.subarray(0, j);
	}
	/** @param {string} input */
	function parseMIMEType(input) {
		input = removeHTTPWhitespace(input, true, true);
		const position = { position: 0 };
		const type = collectASequenceOfCodePointsFast("/", input, position);
		if (type.length === 0 || !HTTP_TOKEN_CODEPOINTS.test(type)) return "failure";
		if (position.position > input.length) return "failure";
		position.position++;
		let subtype = collectASequenceOfCodePointsFast(";", input, position);
		subtype = removeHTTPWhitespace(subtype, false, true);
		if (subtype.length === 0 || !HTTP_TOKEN_CODEPOINTS.test(subtype)) return "failure";
		const typeLowercase = type.toLowerCase();
		const subtypeLowercase = subtype.toLowerCase();
		const mimeType = {
			type: typeLowercase,
			subtype: subtypeLowercase,
			parameters: /* @__PURE__ */ new Map(),
			essence: `${typeLowercase}/${subtypeLowercase}`
		};
		while (position.position < input.length) {
			position.position++;
			collectASequenceOfCodePoints((char) => HTTP_WHITESPACE_REGEX.test(char), input, position);
			let parameterName = collectASequenceOfCodePoints((char) => char !== ";" && char !== "=", input, position);
			parameterName = parameterName.toLowerCase();
			if (position.position < input.length) {
				if (input[position.position] === ";") continue;
				position.position++;
			}
			if (position.position > input.length) break;
			let parameterValue = null;
			if (input[position.position] === "\"") {
				parameterValue = collectAnHTTPQuotedString(input, position, true);
				collectASequenceOfCodePointsFast(";", input, position);
			} else {
				parameterValue = collectASequenceOfCodePointsFast(";", input, position);
				parameterValue = removeHTTPWhitespace(parameterValue, false, true);
				if (parameterValue.length === 0) continue;
			}
			if (parameterName.length !== 0 && HTTP_TOKEN_CODEPOINTS.test(parameterName) && (parameterValue.length === 0 || HTTP_QUOTED_STRING_TOKENS.test(parameterValue)) && !mimeType.parameters.has(parameterName)) mimeType.parameters.set(parameterName, parameterValue);
		}
		return mimeType;
	}
	/** @param {string} data */
	function forgivingBase64(data) {
		data = data.replace(ASCII_WHITESPACE_REPLACE_REGEX, "");
		let dataLength = data.length;
		if (dataLength % 4 === 0) {
			if (data.charCodeAt(dataLength - 1) === 61) {
				--dataLength;
				if (data.charCodeAt(dataLength - 1) === 61) --dataLength;
			}
		}
		if (dataLength % 4 === 1) return "failure";
		if (/[^+/0-9A-Za-z]/.test(data.length === dataLength ? data : data.substring(0, dataLength))) return "failure";
		const buffer = Buffer.from(data, "base64");
		return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	}
	/**
	* @param {string} input
	* @param {{ position: number }} position
	* @param {boolean?} extractValue
	*/
	function collectAnHTTPQuotedString(input, position, extractValue) {
		const positionStart = position.position;
		let value = "";
		assert$24(input[position.position] === "\"");
		position.position++;
		while (true) {
			value += collectASequenceOfCodePoints((char) => char !== "\"" && char !== "\\", input, position);
			if (position.position >= input.length) break;
			const quoteOrBackslash = input[position.position];
			position.position++;
			if (quoteOrBackslash === "\\") {
				if (position.position >= input.length) {
					value += "\\";
					break;
				}
				value += input[position.position];
				position.position++;
			} else {
				assert$24(quoteOrBackslash === "\"");
				break;
			}
		}
		if (extractValue) return value;
		return input.slice(positionStart, position.position);
	}
	/**
	* @see https://mimesniff.spec.whatwg.org/#serialize-a-mime-type
	*/
	function serializeAMimeType(mimeType) {
		assert$24(mimeType !== "failure");
		const { parameters, essence } = mimeType;
		let serialization = essence;
		for (let [name, value] of parameters.entries()) {
			serialization += ";";
			serialization += name;
			serialization += "=";
			if (!HTTP_TOKEN_CODEPOINTS.test(value)) {
				value = value.replace(/(\\|")/g, "\\$1");
				value = "\"" + value;
				value += "\"";
			}
			serialization += value;
		}
		return serialization;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#http-whitespace
	* @param {number} char
	*/
	function isHTTPWhiteSpace(char) {
		return char === 13 || char === 10 || char === 9 || char === 32;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#http-whitespace
	* @param {string} str
	* @param {boolean} [leading=true]
	* @param {boolean} [trailing=true]
	*/
	function removeHTTPWhitespace(str, leading = true, trailing = true) {
		return removeChars(str, leading, trailing, isHTTPWhiteSpace);
	}
	/**
	* @see https://infra.spec.whatwg.org/#ascii-whitespace
	* @param {number} char
	*/
	function isASCIIWhitespace(char) {
		return char === 13 || char === 10 || char === 9 || char === 12 || char === 32;
	}
	/**
	* @see https://infra.spec.whatwg.org/#strip-leading-and-trailing-ascii-whitespace
	* @param {string} str
	* @param {boolean} [leading=true]
	* @param {boolean} [trailing=true]
	*/
	function removeASCIIWhitespace(str, leading = true, trailing = true) {
		return removeChars(str, leading, trailing, isASCIIWhitespace);
	}
	/**
	* @param {string} str
	* @param {boolean} leading
	* @param {boolean} trailing
	* @param {(charCode: number) => boolean} predicate
	* @returns
	*/
	function removeChars(str, leading, trailing, predicate) {
		let lead = 0;
		let trail = str.length - 1;
		if (leading) while (lead < str.length && predicate(str.charCodeAt(lead))) lead++;
		if (trailing) while (trail > 0 && predicate(str.charCodeAt(trail))) trail--;
		return lead === 0 && trail === str.length - 1 ? str : str.slice(lead, trail + 1);
	}
	/**
	* @see https://infra.spec.whatwg.org/#isomorphic-decode
	* @param {Uint8Array} input
	* @returns {string}
	*/
	function isomorphicDecode(input) {
		const length = input.length;
		if (65535 > length) return String.fromCharCode.apply(null, input);
		let result = "";
		let i = 0;
		let addition = 65535;
		while (i < length) {
			if (i + addition > length) addition = length - i;
			result += String.fromCharCode.apply(null, input.subarray(i, i += addition));
		}
		return result;
	}
	/**
	* @see https://mimesniff.spec.whatwg.org/#minimize-a-supported-mime-type
	* @param {Exclude<ReturnType<typeof parseMIMEType>, 'failure'>} mimeType
	*/
	function minimizeSupportedMimeType(mimeType) {
		switch (mimeType.essence) {
			case "application/ecmascript":
			case "application/javascript":
			case "application/x-ecmascript":
			case "application/x-javascript":
			case "text/ecmascript":
			case "text/javascript":
			case "text/javascript1.0":
			case "text/javascript1.1":
			case "text/javascript1.2":
			case "text/javascript1.3":
			case "text/javascript1.4":
			case "text/javascript1.5":
			case "text/jscript":
			case "text/livescript":
			case "text/x-ecmascript":
			case "text/x-javascript": return "text/javascript";
			case "application/json":
			case "text/json": return "application/json";
			case "image/svg+xml": return "image/svg+xml";
			case "text/xml":
			case "application/xml": return "application/xml";
		}
		if (mimeType.subtype.endsWith("+json")) return "application/json";
		if (mimeType.subtype.endsWith("+xml")) return "application/xml";
		return "";
	}
	module.exports = {
		dataURLProcessor,
		URLSerializer,
		collectASequenceOfCodePoints,
		collectASequenceOfCodePointsFast,
		stringPercentDecode,
		parseMIMEType,
		collectAnHTTPQuotedString,
		serializeAMimeType,
		removeChars,
		removeHTTPWhitespace,
		minimizeSupportedMimeType,
		HTTP_TOKEN_CODEPOINTS,
		isomorphicDecode
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/webidl.js
var require_webidl = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { types: types$3, inspect } = __require("node:util");
	const { markAsUncloneable } = __require("node:worker_threads");
	const { toUSVString } = require_util$7();
	/** @type {import('../../../types/webidl').Webidl} */
	const webidl = {};
	webidl.converters = {};
	webidl.util = {};
	webidl.errors = {};
	webidl.errors.exception = function(message) {
		return /* @__PURE__ */ new TypeError(`${message.header}: ${message.message}`);
	};
	webidl.errors.conversionFailed = function(context) {
		const plural = context.types.length === 1 ? "" : " one of";
		const message = `${context.argument} could not be converted to${plural}: ${context.types.join(", ")}.`;
		return webidl.errors.exception({
			header: context.prefix,
			message
		});
	};
	webidl.errors.invalidArgument = function(context) {
		return webidl.errors.exception({
			header: context.prefix,
			message: `"${context.value}" is an invalid ${context.type}.`
		});
	};
	webidl.brandCheck = function(V, I, opts) {
		if (opts?.strict !== false) {
			if (!(V instanceof I)) {
				const err = /* @__PURE__ */ new TypeError("Illegal invocation");
				err.code = "ERR_INVALID_THIS";
				throw err;
			}
		} else if (V?.[Symbol.toStringTag] !== I.prototype[Symbol.toStringTag]) {
			const err = /* @__PURE__ */ new TypeError("Illegal invocation");
			err.code = "ERR_INVALID_THIS";
			throw err;
		}
	};
	webidl.argumentLengthCheck = function({ length }, min, ctx) {
		if (length < min) throw webidl.errors.exception({
			message: `${min} argument${min !== 1 ? "s" : ""} required, but${length ? " only" : ""} ${length} found.`,
			header: ctx
		});
	};
	webidl.illegalConstructor = function() {
		throw webidl.errors.exception({
			header: "TypeError",
			message: "Illegal constructor"
		});
	};
	webidl.util.Type = function(V) {
		switch (typeof V) {
			case "undefined": return "Undefined";
			case "boolean": return "Boolean";
			case "string": return "String";
			case "symbol": return "Symbol";
			case "number": return "Number";
			case "bigint": return "BigInt";
			case "function":
			case "object":
				if (V === null) return "Null";
				return "Object";
		}
	};
	webidl.util.markAsUncloneable = markAsUncloneable || (() => {});
	webidl.util.ConvertToInt = function(V, bitLength, signedness, opts) {
		let upperBound;
		let lowerBound;
		if (bitLength === 64) {
			upperBound = Math.pow(2, 53) - 1;
			if (signedness === "unsigned") lowerBound = 0;
			else lowerBound = Math.pow(-2, 53) + 1;
		} else if (signedness === "unsigned") {
			lowerBound = 0;
			upperBound = Math.pow(2, bitLength) - 1;
		} else {
			lowerBound = Math.pow(-2, bitLength) - 1;
			upperBound = Math.pow(2, bitLength - 1) - 1;
		}
		let x = Number(V);
		if (x === 0) x = 0;
		if (opts?.enforceRange === true) {
			if (Number.isNaN(x) || x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY) throw webidl.errors.exception({
				header: "Integer conversion",
				message: `Could not convert ${webidl.util.Stringify(V)} to an integer.`
			});
			x = webidl.util.IntegerPart(x);
			if (x < lowerBound || x > upperBound) throw webidl.errors.exception({
				header: "Integer conversion",
				message: `Value must be between ${lowerBound}-${upperBound}, got ${x}.`
			});
			return x;
		}
		if (!Number.isNaN(x) && opts?.clamp === true) {
			x = Math.min(Math.max(x, lowerBound), upperBound);
			if (Math.floor(x) % 2 === 0) x = Math.floor(x);
			else x = Math.ceil(x);
			return x;
		}
		if (Number.isNaN(x) || x === 0 && Object.is(0, x) || x === Number.POSITIVE_INFINITY || x === Number.NEGATIVE_INFINITY) return 0;
		x = webidl.util.IntegerPart(x);
		x = x % Math.pow(2, bitLength);
		if (signedness === "signed" && x >= Math.pow(2, bitLength) - 1) return x - Math.pow(2, bitLength);
		return x;
	};
	webidl.util.IntegerPart = function(n) {
		const r = Math.floor(Math.abs(n));
		if (n < 0) return -1 * r;
		return r;
	};
	webidl.util.Stringify = function(V) {
		switch (webidl.util.Type(V)) {
			case "Symbol": return `Symbol(${V.description})`;
			case "Object": return inspect(V);
			case "String": return `"${V}"`;
			default: return `${V}`;
		}
	};
	webidl.sequenceConverter = function(converter) {
		return (V, prefix, argument, Iterable) => {
			if (webidl.util.Type(V) !== "Object") throw webidl.errors.exception({
				header: prefix,
				message: `${argument} (${webidl.util.Stringify(V)}) is not iterable.`
			});
			/** @type {Generator} */
			const method = typeof Iterable === "function" ? Iterable() : V?.[Symbol.iterator]?.();
			const seq = [];
			let index = 0;
			if (method === void 0 || typeof method.next !== "function") throw webidl.errors.exception({
				header: prefix,
				message: `${argument} is not iterable.`
			});
			while (true) {
				const { done, value } = method.next();
				if (done) break;
				seq.push(converter(value, prefix, `${argument}[${index++}]`));
			}
			return seq;
		};
	};
	webidl.recordConverter = function(keyConverter, valueConverter) {
		return (O, prefix, argument) => {
			if (webidl.util.Type(O) !== "Object") throw webidl.errors.exception({
				header: prefix,
				message: `${argument} ("${webidl.util.Type(O)}") is not an Object.`
			});
			const result = {};
			if (!types$3.isProxy(O)) {
				const keys = [...Object.getOwnPropertyNames(O), ...Object.getOwnPropertySymbols(O)];
				for (const key of keys) {
					const typedKey = keyConverter(key, prefix, argument);
					result[typedKey] = valueConverter(O[key], prefix, argument);
				}
				return result;
			}
			const keys = Reflect.ownKeys(O);
			for (const key of keys) if (Reflect.getOwnPropertyDescriptor(O, key)?.enumerable) {
				const typedKey = keyConverter(key, prefix, argument);
				result[typedKey] = valueConverter(O[key], prefix, argument);
			}
			return result;
		};
	};
	webidl.interfaceConverter = function(i) {
		return (V, prefix, argument, opts) => {
			if (opts?.strict !== false && !(V instanceof i)) throw webidl.errors.exception({
				header: prefix,
				message: `Expected ${argument} ("${webidl.util.Stringify(V)}") to be an instance of ${i.name}.`
			});
			return V;
		};
	};
	webidl.dictionaryConverter = function(converters) {
		return (dictionary, prefix, argument) => {
			const type = webidl.util.Type(dictionary);
			const dict = {};
			if (type === "Null" || type === "Undefined") return dict;
			else if (type !== "Object") throw webidl.errors.exception({
				header: prefix,
				message: `Expected ${dictionary} to be one of: Null, Undefined, Object.`
			});
			for (const options of converters) {
				const { key, defaultValue, required, converter } = options;
				if (required === true) {
					if (!Object.hasOwn(dictionary, key)) throw webidl.errors.exception({
						header: prefix,
						message: `Missing required key "${key}".`
					});
				}
				let value = dictionary[key];
				const hasDefault = Object.hasOwn(options, "defaultValue");
				if (hasDefault && value !== null) value ??= defaultValue();
				if (required || hasDefault || value !== void 0) {
					value = converter(value, prefix, `${argument}.${key}`);
					if (options.allowedValues && !options.allowedValues.includes(value)) throw webidl.errors.exception({
						header: prefix,
						message: `${value} is not an accepted type. Expected one of ${options.allowedValues.join(", ")}.`
					});
					dict[key] = value;
				}
			}
			return dict;
		};
	};
	webidl.nullableConverter = function(converter) {
		return (V, prefix, argument) => {
			if (V === null) return V;
			return converter(V, prefix, argument);
		};
	};
	webidl.converters.DOMString = function(V, prefix, argument, opts) {
		if (V === null && opts?.legacyNullToEmptyString) return "";
		if (typeof V === "symbol") throw webidl.errors.exception({
			header: prefix,
			message: `${argument} is a symbol, which cannot be converted to a DOMString.`
		});
		return String(V);
	};
	webidl.converters.ByteString = function(V, prefix, argument) {
		const x = webidl.converters.DOMString(V, prefix, argument);
		for (let index = 0; index < x.length; index++) if (x.charCodeAt(index) > 255) throw new TypeError(`Cannot convert argument to a ByteString because the character at index ${index} has a value of ${x.charCodeAt(index)} which is greater than 255.`);
		return x;
	};
	webidl.converters.USVString = toUSVString;
	webidl.converters.boolean = function(V) {
		return Boolean(V);
	};
	webidl.converters.any = function(V) {
		return V;
	};
	webidl.converters["long long"] = function(V, prefix, argument) {
		return webidl.util.ConvertToInt(V, 64, "signed", void 0, prefix, argument);
	};
	webidl.converters["unsigned long long"] = function(V, prefix, argument) {
		return webidl.util.ConvertToInt(V, 64, "unsigned", void 0, prefix, argument);
	};
	webidl.converters["unsigned long"] = function(V, prefix, argument) {
		return webidl.util.ConvertToInt(V, 32, "unsigned", void 0, prefix, argument);
	};
	webidl.converters["unsigned short"] = function(V, prefix, argument, opts) {
		return webidl.util.ConvertToInt(V, 16, "unsigned", opts, prefix, argument);
	};
	webidl.converters.ArrayBuffer = function(V, prefix, argument, opts) {
		if (webidl.util.Type(V) !== "Object" || !types$3.isAnyArrayBuffer(V)) throw webidl.errors.conversionFailed({
			prefix,
			argument: `${argument} ("${webidl.util.Stringify(V)}")`,
			types: ["ArrayBuffer"]
		});
		if (opts?.allowShared === false && types$3.isSharedArrayBuffer(V)) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "SharedArrayBuffer is not allowed."
		});
		if (V.resizable || V.growable) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "Received a resizable ArrayBuffer."
		});
		return V;
	};
	webidl.converters.TypedArray = function(V, T, prefix, name, opts) {
		if (webidl.util.Type(V) !== "Object" || !types$3.isTypedArray(V) || V.constructor.name !== T.name) throw webidl.errors.conversionFailed({
			prefix,
			argument: `${name} ("${webidl.util.Stringify(V)}")`,
			types: [T.name]
		});
		if (opts?.allowShared === false && types$3.isSharedArrayBuffer(V.buffer)) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "SharedArrayBuffer is not allowed."
		});
		if (V.buffer.resizable || V.buffer.growable) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "Received a resizable ArrayBuffer."
		});
		return V;
	};
	webidl.converters.DataView = function(V, prefix, name, opts) {
		if (webidl.util.Type(V) !== "Object" || !types$3.isDataView(V)) throw webidl.errors.exception({
			header: prefix,
			message: `${name} is not a DataView.`
		});
		if (opts?.allowShared === false && types$3.isSharedArrayBuffer(V.buffer)) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "SharedArrayBuffer is not allowed."
		});
		if (V.buffer.resizable || V.buffer.growable) throw webidl.errors.exception({
			header: "ArrayBuffer",
			message: "Received a resizable ArrayBuffer."
		});
		return V;
	};
	webidl.converters.BufferSource = function(V, prefix, name, opts) {
		if (types$3.isAnyArrayBuffer(V)) return webidl.converters.ArrayBuffer(V, prefix, name, {
			...opts,
			allowShared: false
		});
		if (types$3.isTypedArray(V)) return webidl.converters.TypedArray(V, V.constructor, prefix, name, {
			...opts,
			allowShared: false
		});
		if (types$3.isDataView(V)) return webidl.converters.DataView(V, prefix, name, {
			...opts,
			allowShared: false
		});
		throw webidl.errors.conversionFailed({
			prefix,
			argument: `${name} ("${webidl.util.Stringify(V)}")`,
			types: ["BufferSource"]
		});
	};
	webidl.converters["sequence<ByteString>"] = webidl.sequenceConverter(webidl.converters.ByteString);
	webidl.converters["sequence<sequence<ByteString>>"] = webidl.sequenceConverter(webidl.converters["sequence<ByteString>"]);
	webidl.converters["record<ByteString, ByteString>"] = webidl.recordConverter(webidl.converters.ByteString, webidl.converters.ByteString);
	module.exports = { webidl };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/util.js
var require_util$6 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Transform: Transform$2 } = __require("node:stream");
	const zlib$1 = __require("node:zlib");
	const { redirectStatusSet, referrerPolicySet: referrerPolicyTokens, badPortsSet } = require_constants$2();
	const { getGlobalOrigin } = require_global$1();
	const { collectASequenceOfCodePoints, collectAnHTTPQuotedString, removeChars, parseMIMEType } = require_data_url();
	const { performance: performance$1 } = __require("node:perf_hooks");
	const { isBlobLike, ReadableStreamFrom, isValidHTTPToken, normalizedMethodRecordsBase } = require_util$7();
	const assert$23 = __require("node:assert");
	const { isUint8Array } = __require("node:util/types");
	const { webidl } = require_webidl();
	let supportedHashes = [];
	/** @type {import('crypto')} */
	let crypto;
	try {
		crypto = __require("node:crypto");
		const possibleRelevantHashes = [
			"sha256",
			"sha384",
			"sha512"
		];
		supportedHashes = crypto.getHashes().filter((hash) => possibleRelevantHashes.includes(hash));
	} catch {}
	function responseURL(response) {
		const urlList = response.urlList;
		const length = urlList.length;
		return length === 0 ? null : urlList[length - 1].toString();
	}
	function responseLocationURL(response, requestFragment) {
		if (!redirectStatusSet.has(response.status)) return null;
		let location = response.headersList.get("location", true);
		if (location !== null && isValidHeaderValue(location)) {
			if (!isValidEncodedURL(location)) location = normalizeBinaryStringToUtf8(location);
			location = new URL(location, responseURL(response));
		}
		if (location && !location.hash) location.hash = requestFragment;
		return location;
	}
	/**
	* @see https://www.rfc-editor.org/rfc/rfc1738#section-2.2
	* @param {string} url
	* @returns {boolean}
	*/
	function isValidEncodedURL(url) {
		for (let i = 0; i < url.length; ++i) {
			const code = url.charCodeAt(i);
			if (code > 126 || code < 32) return false;
		}
		return true;
	}
	/**
	* If string contains non-ASCII characters, assumes it's UTF-8 encoded and decodes it.
	* Since UTF-8 is a superset of ASCII, this will work for ASCII strings as well.
	* @param {string} value
	* @returns {string}
	*/
	function normalizeBinaryStringToUtf8(value) {
		return Buffer.from(value, "binary").toString("utf8");
	}
	/** @returns {URL} */
	function requestCurrentURL(request) {
		return request.urlList[request.urlList.length - 1];
	}
	function requestBadPort(request) {
		const url = requestCurrentURL(request);
		if (urlIsHttpHttpsScheme(url) && badPortsSet.has(url.port)) return "blocked";
		return "allowed";
	}
	function isErrorLike(object) {
		return object instanceof Error || object?.constructor?.name === "Error" || object?.constructor?.name === "DOMException";
	}
	function isValidReasonPhrase(statusText) {
		for (let i = 0; i < statusText.length; ++i) {
			const c = statusText.charCodeAt(i);
			if (!(c === 9 || c >= 32 && c <= 126 || c >= 128 && c <= 255)) return false;
		}
		return true;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#header-name
	* @param {string} potentialValue
	*/
	const isValidHeaderName = isValidHTTPToken;
	/**
	* @see https://fetch.spec.whatwg.org/#header-value
	* @param {string} potentialValue
	*/
	function isValidHeaderValue(potentialValue) {
		return (potentialValue[0] === "	" || potentialValue[0] === " " || potentialValue[potentialValue.length - 1] === "	" || potentialValue[potentialValue.length - 1] === " " || potentialValue.includes("\n") || potentialValue.includes("\r") || potentialValue.includes("\0")) === false;
	}
	function setRequestReferrerPolicyOnRedirect(request, actualResponse) {
		const { headersList } = actualResponse;
		const policyHeader = (headersList.get("referrer-policy", true) ?? "").split(",");
		let policy = "";
		if (policyHeader.length > 0) for (let i = policyHeader.length; i !== 0; i--) {
			const token = policyHeader[i - 1].trim();
			if (referrerPolicyTokens.has(token)) {
				policy = token;
				break;
			}
		}
		if (policy !== "") request.referrerPolicy = policy;
	}
	function crossOriginResourcePolicyCheck() {
		return "allowed";
	}
	function corsCheck() {
		return "success";
	}
	function TAOCheck() {
		return "success";
	}
	function appendFetchMetadata(httpRequest) {
		let header = null;
		header = httpRequest.mode;
		httpRequest.headersList.set("sec-fetch-mode", header, true);
	}
	function appendRequestOriginHeader(request) {
		let serializedOrigin = request.origin;
		if (serializedOrigin === "client" || serializedOrigin === void 0) return;
		if (request.responseTainting === "cors" || request.mode === "websocket") request.headersList.append("origin", serializedOrigin, true);
		else if (request.method !== "GET" && request.method !== "HEAD") {
			switch (request.referrerPolicy) {
				case "no-referrer":
					serializedOrigin = null;
					break;
				case "no-referrer-when-downgrade":
				case "strict-origin":
				case "strict-origin-when-cross-origin":
					if (request.origin && urlHasHttpsScheme(request.origin) && !urlHasHttpsScheme(requestCurrentURL(request))) serializedOrigin = null;
					break;
				case "same-origin":
					if (!sameOrigin(request, requestCurrentURL(request))) serializedOrigin = null;
					break;
				default:
			}
			request.headersList.append("origin", serializedOrigin, true);
		}
	}
	function coarsenTime(timestamp, crossOriginIsolatedCapability) {
		return timestamp;
	}
	function clampAndCoarsenConnectionTimingInfo(connectionTimingInfo, defaultStartTime, crossOriginIsolatedCapability) {
		if (!connectionTimingInfo?.startTime || connectionTimingInfo.startTime < defaultStartTime) return {
			domainLookupStartTime: defaultStartTime,
			domainLookupEndTime: defaultStartTime,
			connectionStartTime: defaultStartTime,
			connectionEndTime: defaultStartTime,
			secureConnectionStartTime: defaultStartTime,
			ALPNNegotiatedProtocol: connectionTimingInfo?.ALPNNegotiatedProtocol
		};
		return {
			domainLookupStartTime: coarsenTime(connectionTimingInfo.domainLookupStartTime, crossOriginIsolatedCapability),
			domainLookupEndTime: coarsenTime(connectionTimingInfo.domainLookupEndTime, crossOriginIsolatedCapability),
			connectionStartTime: coarsenTime(connectionTimingInfo.connectionStartTime, crossOriginIsolatedCapability),
			connectionEndTime: coarsenTime(connectionTimingInfo.connectionEndTime, crossOriginIsolatedCapability),
			secureConnectionStartTime: coarsenTime(connectionTimingInfo.secureConnectionStartTime, crossOriginIsolatedCapability),
			ALPNNegotiatedProtocol: connectionTimingInfo.ALPNNegotiatedProtocol
		};
	}
	function coarsenedSharedCurrentTime(crossOriginIsolatedCapability) {
		return coarsenTime(performance$1.now(), crossOriginIsolatedCapability);
	}
	function createOpaqueTimingInfo(timingInfo) {
		return {
			startTime: timingInfo.startTime ?? 0,
			redirectStartTime: 0,
			redirectEndTime: 0,
			postRedirectStartTime: timingInfo.startTime ?? 0,
			finalServiceWorkerStartTime: 0,
			finalNetworkResponseStartTime: 0,
			finalNetworkRequestStartTime: 0,
			endTime: 0,
			encodedBodySize: 0,
			decodedBodySize: 0,
			finalConnectionTimingInfo: null
		};
	}
	function makePolicyContainer() {
		return { referrerPolicy: "strict-origin-when-cross-origin" };
	}
	function clonePolicyContainer(policyContainer) {
		return { referrerPolicy: policyContainer.referrerPolicy };
	}
	function determineRequestsReferrer(request) {
		const policy = request.referrerPolicy;
		assert$23(policy);
		let referrerSource = null;
		if (request.referrer === "client") {
			const globalOrigin = getGlobalOrigin();
			if (!globalOrigin || globalOrigin.origin === "null") return "no-referrer";
			referrerSource = new URL(globalOrigin);
		} else if (request.referrer instanceof URL) referrerSource = request.referrer;
		let referrerURL = stripURLForReferrer(referrerSource);
		const referrerOrigin = stripURLForReferrer(referrerSource, true);
		if (referrerURL.toString().length > 4096) referrerURL = referrerOrigin;
		const areSameOrigin = sameOrigin(request, referrerURL);
		const isNonPotentiallyTrustWorthy = isURLPotentiallyTrustworthy(referrerURL) && !isURLPotentiallyTrustworthy(request.url);
		switch (policy) {
			case "origin": return referrerOrigin != null ? referrerOrigin : stripURLForReferrer(referrerSource, true);
			case "unsafe-url": return referrerURL;
			case "same-origin": return areSameOrigin ? referrerOrigin : "no-referrer";
			case "origin-when-cross-origin": return areSameOrigin ? referrerURL : referrerOrigin;
			case "strict-origin-when-cross-origin": {
				const currentURL = requestCurrentURL(request);
				if (sameOrigin(referrerURL, currentURL)) return referrerURL;
				if (isURLPotentiallyTrustworthy(referrerURL) && !isURLPotentiallyTrustworthy(currentURL)) return "no-referrer";
				return referrerOrigin;
			}
			default: return isNonPotentiallyTrustWorthy ? "no-referrer" : referrerOrigin;
		}
	}
	/**
	* @see https://w3c.github.io/webappsec-referrer-policy/#strip-url
	* @param {URL} url
	* @param {boolean|undefined} originOnly
	*/
	function stripURLForReferrer(url, originOnly) {
		assert$23(url instanceof URL);
		url = new URL(url);
		if (url.protocol === "file:" || url.protocol === "about:" || url.protocol === "blank:") return "no-referrer";
		url.username = "";
		url.password = "";
		url.hash = "";
		if (originOnly) {
			url.pathname = "";
			url.search = "";
		}
		return url;
	}
	function isURLPotentiallyTrustworthy(url) {
		if (!(url instanceof URL)) return false;
		if (url.href === "about:blank" || url.href === "about:srcdoc") return true;
		if (url.protocol === "data:") return true;
		if (url.protocol === "file:") return true;
		return isOriginPotentiallyTrustworthy(url.origin);
		function isOriginPotentiallyTrustworthy(origin) {
			if (origin == null || origin === "null") return false;
			const originAsURL = new URL(origin);
			if (originAsURL.protocol === "https:" || originAsURL.protocol === "wss:") return true;
			if (/^127(?:\.[0-9]+){0,2}\.[0-9]+$|^\[(?:0*:)*?:?0*1\]$/.test(originAsURL.hostname) || originAsURL.hostname === "localhost" || originAsURL.hostname.includes("localhost.") || originAsURL.hostname.endsWith(".localhost")) return true;
			return false;
		}
	}
	/**
	* @see https://w3c.github.io/webappsec-subresource-integrity/#does-response-match-metadatalist
	* @param {Uint8Array} bytes
	* @param {string} metadataList
	*/
	function bytesMatch(bytes, metadataList) {
		/* istanbul ignore if: only if node is built with --without-ssl */
		if (crypto === void 0) return true;
		const parsedMetadata = parseMetadata(metadataList);
		if (parsedMetadata === "no metadata") return true;
		if (parsedMetadata.length === 0) return true;
		const metadata = filterMetadataListByAlgorithm(parsedMetadata, getStrongestMetadata(parsedMetadata));
		for (const item of metadata) {
			const algorithm = item.algo;
			const expectedValue = item.hash;
			let actualValue = crypto.createHash(algorithm).update(bytes).digest("base64");
			if (actualValue[actualValue.length - 1] === "=") if (actualValue[actualValue.length - 2] === "=") actualValue = actualValue.slice(0, -2);
			else actualValue = actualValue.slice(0, -1);
			if (compareBase64Mixed(actualValue, expectedValue)) return true;
		}
		return false;
	}
	const parseHashWithOptions = /(?<algo>sha256|sha384|sha512)-((?<hash>[A-Za-z0-9+/]+|[A-Za-z0-9_-]+)={0,2}(?:\s|$)( +[!-~]*)?)?/i;
	/**
	* @see https://w3c.github.io/webappsec-subresource-integrity/#parse-metadata
	* @param {string} metadata
	*/
	function parseMetadata(metadata) {
		/** @type {{ algo: string, hash: string }[]} */
		const result = [];
		let empty = true;
		for (const token of metadata.split(" ")) {
			empty = false;
			const parsedToken = parseHashWithOptions.exec(token);
			if (parsedToken === null || parsedToken.groups === void 0 || parsedToken.groups.algo === void 0) continue;
			const algorithm = parsedToken.groups.algo.toLowerCase();
			if (supportedHashes.includes(algorithm)) result.push(parsedToken.groups);
		}
		if (empty === true) return "no metadata";
		return result;
	}
	/**
	* @param {{ algo: 'sha256' | 'sha384' | 'sha512' }[]} metadataList
	*/
	function getStrongestMetadata(metadataList) {
		let algorithm = metadataList[0].algo;
		if (algorithm[3] === "5") return algorithm;
		for (let i = 1; i < metadataList.length; ++i) {
			const metadata = metadataList[i];
			if (metadata.algo[3] === "5") {
				algorithm = "sha512";
				break;
			} else if (algorithm[3] === "3") continue;
			else if (metadata.algo[3] === "3") algorithm = "sha384";
		}
		return algorithm;
	}
	function filterMetadataListByAlgorithm(metadataList, algorithm) {
		if (metadataList.length === 1) return metadataList;
		let pos = 0;
		for (let i = 0; i < metadataList.length; ++i) if (metadataList[i].algo === algorithm) metadataList[pos++] = metadataList[i];
		metadataList.length = pos;
		return metadataList;
	}
	/**
	* Compares two base64 strings, allowing for base64url
	* in the second string.
	*
	* @param {string} actualValue always base64
	* @param {string} expectedValue base64 or base64url
	* @returns {boolean}
	*/
	function compareBase64Mixed(actualValue, expectedValue) {
		if (actualValue.length !== expectedValue.length) return false;
		for (let i = 0; i < actualValue.length; ++i) if (actualValue[i] !== expectedValue[i]) {
			if (actualValue[i] === "+" && expectedValue[i] === "-" || actualValue[i] === "/" && expectedValue[i] === "_") continue;
			return false;
		}
		return true;
	}
	function tryUpgradeRequestToAPotentiallyTrustworthyURL(request) {}
	/**
	* @link {https://html.spec.whatwg.org/multipage/origin.html#same-origin}
	* @param {URL} A
	* @param {URL} B
	*/
	function sameOrigin(A, B) {
		if (A.origin === B.origin && A.origin === "null") return true;
		if (A.protocol === B.protocol && A.hostname === B.hostname && A.port === B.port) return true;
		return false;
	}
	function createDeferredPromise() {
		let res;
		let rej;
		return {
			promise: new Promise((resolve, reject) => {
				res = resolve;
				rej = reject;
			}),
			resolve: res,
			reject: rej
		};
	}
	function isAborted(fetchParams) {
		return fetchParams.controller.state === "aborted";
	}
	function isCancelled(fetchParams) {
		return fetchParams.controller.state === "aborted" || fetchParams.controller.state === "terminated";
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-method-normalize
	* @param {string} method
	*/
	function normalizeMethod(method) {
		return normalizedMethodRecordsBase[method.toLowerCase()] ?? method;
	}
	function serializeJavascriptValueToJSONString(value) {
		const result = JSON.stringify(value);
		if (result === void 0) throw new TypeError("Value is not JSON serializable");
		assert$23(typeof result === "string");
		return result;
	}
	const esIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
	/**
	* @see https://webidl.spec.whatwg.org/#dfn-iterator-prototype-object
	* @param {string} name name of the instance
	* @param {symbol} kInternalIterator
	* @param {string | number} [keyIndex]
	* @param {string | number} [valueIndex]
	*/
	function createIterator(name, kInternalIterator, keyIndex = 0, valueIndex = 1) {
		class FastIterableIterator {
			/** @type {any} */
			#target;
			/** @type {'key' | 'value' | 'key+value'} */
			#kind;
			/** @type {number} */
			#index;
			/**
			* @see https://webidl.spec.whatwg.org/#dfn-default-iterator-object
			* @param {unknown} target
			* @param {'key' | 'value' | 'key+value'} kind
			*/
			constructor(target, kind) {
				this.#target = target;
				this.#kind = kind;
				this.#index = 0;
			}
			next() {
				if (typeof this !== "object" || this === null || !(#target in this)) throw new TypeError(`'next' called on an object that does not implement interface ${name} Iterator.`);
				const index = this.#index;
				const values = this.#target[kInternalIterator];
				if (index >= values.length) return {
					value: void 0,
					done: true
				};
				const { [keyIndex]: key, [valueIndex]: value } = values[index];
				this.#index = index + 1;
				let result;
				switch (this.#kind) {
					case "key":
						result = key;
						break;
					case "value":
						result = value;
						break;
					case "key+value":
						result = [key, value];
						break;
				}
				return {
					value: result,
					done: false
				};
			}
		}
		delete FastIterableIterator.prototype.constructor;
		Object.setPrototypeOf(FastIterableIterator.prototype, esIteratorPrototype);
		Object.defineProperties(FastIterableIterator.prototype, {
			[Symbol.toStringTag]: {
				writable: false,
				enumerable: false,
				configurable: true,
				value: `${name} Iterator`
			},
			next: {
				writable: true,
				enumerable: true,
				configurable: true
			}
		});
		/**
		* @param {unknown} target
		* @param {'key' | 'value' | 'key+value'} kind
		* @returns {IterableIterator<any>}
		*/
		return function(target, kind) {
			return new FastIterableIterator(target, kind);
		};
	}
	/**
	* @see https://webidl.spec.whatwg.org/#dfn-iterator-prototype-object
	* @param {string} name name of the instance
	* @param {any} object class
	* @param {symbol} kInternalIterator
	* @param {string | number} [keyIndex]
	* @param {string | number} [valueIndex]
	*/
	function iteratorMixin(name, object, kInternalIterator, keyIndex = 0, valueIndex = 1) {
		const makeIterator = createIterator(name, kInternalIterator, keyIndex, valueIndex);
		const properties = {
			keys: {
				writable: true,
				enumerable: true,
				configurable: true,
				value: function keys() {
					webidl.brandCheck(this, object);
					return makeIterator(this, "key");
				}
			},
			values: {
				writable: true,
				enumerable: true,
				configurable: true,
				value: function values() {
					webidl.brandCheck(this, object);
					return makeIterator(this, "value");
				}
			},
			entries: {
				writable: true,
				enumerable: true,
				configurable: true,
				value: function entries() {
					webidl.brandCheck(this, object);
					return makeIterator(this, "key+value");
				}
			},
			forEach: {
				writable: true,
				enumerable: true,
				configurable: true,
				value: function forEach(callbackfn, thisArg = globalThis) {
					webidl.brandCheck(this, object);
					webidl.argumentLengthCheck(arguments, 1, `${name}.forEach`);
					if (typeof callbackfn !== "function") throw new TypeError(`Failed to execute 'forEach' on '${name}': parameter 1 is not of type 'Function'.`);
					for (const { 0: key, 1: value } of makeIterator(this, "key+value")) callbackfn.call(thisArg, value, key, this);
				}
			}
		};
		return Object.defineProperties(object.prototype, {
			...properties,
			[Symbol.iterator]: {
				writable: true,
				enumerable: false,
				configurable: true,
				value: properties.entries.value
			}
		});
	}
	/**
	* @see https://fetch.spec.whatwg.org/#body-fully-read
	*/
	async function fullyReadBody(body, processBody, processBodyError) {
		const successSteps = processBody;
		const errorSteps = processBodyError;
		let reader;
		try {
			reader = body.stream.getReader();
		} catch (e) {
			errorSteps(e);
			return;
		}
		try {
			successSteps(await readAllBytes(reader));
		} catch (e) {
			errorSteps(e);
		}
	}
	function isReadableStreamLike(stream) {
		return stream instanceof ReadableStream || stream[Symbol.toStringTag] === "ReadableStream" && typeof stream.tee === "function";
	}
	/**
	* @param {ReadableStreamController<Uint8Array>} controller
	*/
	function readableStreamClose(controller) {
		try {
			controller.close();
			controller.byobRequest?.respond(0);
		} catch (err) {
			if (!err.message.includes("Controller is already closed") && !err.message.includes("ReadableStream is already closed")) throw err;
		}
	}
	const invalidIsomorphicEncodeValueRegex = /[^\x00-\xFF]/;
	/**
	* @see https://infra.spec.whatwg.org/#isomorphic-encode
	* @param {string} input
	*/
	function isomorphicEncode(input) {
		assert$23(!invalidIsomorphicEncodeValueRegex.test(input));
		return input;
	}
	/**
	* @see https://streams.spec.whatwg.org/#readablestreamdefaultreader-read-all-bytes
	* @see https://streams.spec.whatwg.org/#read-loop
	* @param {ReadableStreamDefaultReader} reader
	*/
	async function readAllBytes(reader) {
		const bytes = [];
		let byteLength = 0;
		while (true) {
			const { done, value: chunk } = await reader.read();
			if (done) return Buffer.concat(bytes, byteLength);
			if (!isUint8Array(chunk)) throw new TypeError("Received non-Uint8Array chunk");
			bytes.push(chunk);
			byteLength += chunk.length;
		}
	}
	/**
	* @see https://fetch.spec.whatwg.org/#is-local
	* @param {URL} url
	*/
	function urlIsLocal(url) {
		assert$23("protocol" in url);
		const protocol = url.protocol;
		return protocol === "about:" || protocol === "blob:" || protocol === "data:";
	}
	/**
	* @param {string|URL} url
	* @returns {boolean}
	*/
	function urlHasHttpsScheme(url) {
		return typeof url === "string" && url[5] === ":" && url[0] === "h" && url[1] === "t" && url[2] === "t" && url[3] === "p" && url[4] === "s" || url.protocol === "https:";
	}
	/**
	* @see https://fetch.spec.whatwg.org/#http-scheme
	* @param {URL} url
	*/
	function urlIsHttpHttpsScheme(url) {
		assert$23("protocol" in url);
		const protocol = url.protocol;
		return protocol === "http:" || protocol === "https:";
	}
	/**
	* @see https://fetch.spec.whatwg.org/#simple-range-header-value
	* @param {string} value
	* @param {boolean} allowWhitespace
	*/
	function simpleRangeHeaderValue(value, allowWhitespace) {
		const data = value;
		if (!data.startsWith("bytes")) return "failure";
		const position = { position: 5 };
		if (allowWhitespace) collectASequenceOfCodePoints((char) => char === "	" || char === " ", data, position);
		if (data.charCodeAt(position.position) !== 61) return "failure";
		position.position++;
		if (allowWhitespace) collectASequenceOfCodePoints((char) => char === "	" || char === " ", data, position);
		const rangeStart = collectASequenceOfCodePoints((char) => {
			const code = char.charCodeAt(0);
			return code >= 48 && code <= 57;
		}, data, position);
		const rangeStartValue = rangeStart.length ? Number(rangeStart) : null;
		if (allowWhitespace) collectASequenceOfCodePoints((char) => char === "	" || char === " ", data, position);
		if (data.charCodeAt(position.position) !== 45) return "failure";
		position.position++;
		if (allowWhitespace) collectASequenceOfCodePoints((char) => char === "	" || char === " ", data, position);
		const rangeEnd = collectASequenceOfCodePoints((char) => {
			const code = char.charCodeAt(0);
			return code >= 48 && code <= 57;
		}, data, position);
		const rangeEndValue = rangeEnd.length ? Number(rangeEnd) : null;
		if (position.position < data.length) return "failure";
		if (rangeEndValue === null && rangeStartValue === null) return "failure";
		if (rangeStartValue > rangeEndValue) return "failure";
		return {
			rangeStartValue,
			rangeEndValue
		};
	}
	/**
	* @see https://fetch.spec.whatwg.org/#build-a-content-range
	* @param {number} rangeStart
	* @param {number} rangeEnd
	* @param {number} fullLength
	*/
	function buildContentRange(rangeStart, rangeEnd, fullLength) {
		let contentRange = "bytes ";
		contentRange += isomorphicEncode(`${rangeStart}`);
		contentRange += "-";
		contentRange += isomorphicEncode(`${rangeEnd}`);
		contentRange += "/";
		contentRange += isomorphicEncode(`${fullLength}`);
		return contentRange;
	}
	var InflateStream = class extends Transform$2 {
		#zlibOptions;
		/** @param {zlib.ZlibOptions} [zlibOptions] */
		constructor(zlibOptions) {
			super();
			this.#zlibOptions = zlibOptions;
		}
		_transform(chunk, encoding, callback) {
			if (!this._inflateStream) {
				if (chunk.length === 0) {
					callback();
					return;
				}
				this._inflateStream = (chunk[0] & 15) === 8 ? zlib$1.createInflate(this.#zlibOptions) : zlib$1.createInflateRaw(this.#zlibOptions);
				this._inflateStream.on("data", this.push.bind(this));
				this._inflateStream.on("end", () => this.push(null));
				this._inflateStream.on("error", (err) => this.destroy(err));
			}
			this._inflateStream.write(chunk, encoding, callback);
		}
		_final(callback) {
			if (this._inflateStream) {
				this._inflateStream.end();
				this._inflateStream = null;
			}
			callback();
		}
	};
	/**
	* @param {zlib.ZlibOptions} [zlibOptions]
	* @returns {InflateStream}
	*/
	function createInflate(zlibOptions) {
		return new InflateStream(zlibOptions);
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-header-extract-mime-type
	* @param {import('./headers').HeadersList} headers
	*/
	function extractMimeType(headers) {
		let charset = null;
		let essence = null;
		let mimeType = null;
		const values = getDecodeSplit("content-type", headers);
		if (values === null) return "failure";
		for (const value of values) {
			const temporaryMimeType = parseMIMEType(value);
			if (temporaryMimeType === "failure" || temporaryMimeType.essence === "*/*") continue;
			mimeType = temporaryMimeType;
			if (mimeType.essence !== essence) {
				charset = null;
				if (mimeType.parameters.has("charset")) charset = mimeType.parameters.get("charset");
				essence = mimeType.essence;
			} else if (!mimeType.parameters.has("charset") && charset !== null) mimeType.parameters.set("charset", charset);
		}
		if (mimeType == null) return "failure";
		return mimeType;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#header-value-get-decode-and-split
	* @param {string|null} value
	*/
	function gettingDecodingSplitting(value) {
		const input = value;
		const position = { position: 0 };
		const values = [];
		let temporaryValue = "";
		while (position.position < input.length) {
			temporaryValue += collectASequenceOfCodePoints((char) => char !== "\"" && char !== ",", input, position);
			if (position.position < input.length) if (input.charCodeAt(position.position) === 34) {
				temporaryValue += collectAnHTTPQuotedString(input, position);
				if (position.position < input.length) continue;
			} else {
				assert$23(input.charCodeAt(position.position) === 44);
				position.position++;
			}
			temporaryValue = removeChars(temporaryValue, true, true, (char) => char === 9 || char === 32);
			values.push(temporaryValue);
			temporaryValue = "";
		}
		return values;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-header-list-get-decode-split
	* @param {string} name lowercase header name
	* @param {import('./headers').HeadersList} list
	*/
	function getDecodeSplit(name, list) {
		const value = list.get(name, true);
		if (value === null) return null;
		return gettingDecodingSplitting(value);
	}
	const textDecoder = new TextDecoder();
	/**
	* @see https://encoding.spec.whatwg.org/#utf-8-decode
	* @param {Buffer} buffer
	*/
	function utf8DecodeBytes(buffer) {
		if (buffer.length === 0) return "";
		if (buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) buffer = buffer.subarray(3);
		return textDecoder.decode(buffer);
	}
	var EnvironmentSettingsObjectBase = class {
		get baseUrl() {
			return getGlobalOrigin();
		}
		get origin() {
			return this.baseUrl?.origin;
		}
		policyContainer = makePolicyContainer();
	};
	var EnvironmentSettingsObject = class {
		settingsObject = new EnvironmentSettingsObjectBase();
	};
	const environmentSettingsObject = new EnvironmentSettingsObject();
	module.exports = {
		isAborted,
		isCancelled,
		isValidEncodedURL,
		createDeferredPromise,
		ReadableStreamFrom,
		tryUpgradeRequestToAPotentiallyTrustworthyURL,
		clampAndCoarsenConnectionTimingInfo,
		coarsenedSharedCurrentTime,
		determineRequestsReferrer,
		makePolicyContainer,
		clonePolicyContainer,
		appendFetchMetadata,
		appendRequestOriginHeader,
		TAOCheck,
		corsCheck,
		crossOriginResourcePolicyCheck,
		createOpaqueTimingInfo,
		setRequestReferrerPolicyOnRedirect,
		isValidHTTPToken,
		requestBadPort,
		requestCurrentURL,
		responseURL,
		responseLocationURL,
		isBlobLike,
		isURLPotentiallyTrustworthy,
		isValidReasonPhrase,
		sameOrigin,
		normalizeMethod,
		serializeJavascriptValueToJSONString,
		iteratorMixin,
		createIterator,
		isValidHeaderName,
		isValidHeaderValue,
		isErrorLike,
		fullyReadBody,
		bytesMatch,
		isReadableStreamLike,
		readableStreamClose,
		isomorphicEncode,
		urlIsLocal,
		urlHasHttpsScheme,
		urlIsHttpHttpsScheme,
		readAllBytes,
		simpleRangeHeaderValue,
		buildContentRange,
		parseMetadata,
		createInflate,
		extractMimeType,
		getDecodeSplit,
		utf8DecodeBytes,
		environmentSettingsObject
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/symbols.js
var require_symbols$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kUrl: Symbol("url"),
		kHeaders: Symbol("headers"),
		kSignal: Symbol("signal"),
		kState: Symbol("state"),
		kDispatcher: Symbol("dispatcher")
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/file.js
var require_file = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Blob: Blob$2, File } = __require("node:buffer");
	const { kState } = require_symbols$3();
	const { webidl } = require_webidl();
	var FileLike = class FileLike {
		constructor(blobLike, fileName, options = {}) {
			this[kState] = {
				blobLike,
				name: fileName,
				type: options.type,
				lastModified: options.lastModified ?? Date.now()
			};
		}
		stream(...args) {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.stream(...args);
		}
		arrayBuffer(...args) {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.arrayBuffer(...args);
		}
		slice(...args) {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.slice(...args);
		}
		text(...args) {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.text(...args);
		}
		get size() {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.size;
		}
		get type() {
			webidl.brandCheck(this, FileLike);
			return this[kState].blobLike.type;
		}
		get name() {
			webidl.brandCheck(this, FileLike);
			return this[kState].name;
		}
		get lastModified() {
			webidl.brandCheck(this, FileLike);
			return this[kState].lastModified;
		}
		get [Symbol.toStringTag]() {
			return "File";
		}
	};
	webidl.converters.Blob = webidl.interfaceConverter(Blob$2);
	function isFileLike(object) {
		return object instanceof File || object && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && object[Symbol.toStringTag] === "File";
	}
	module.exports = {
		FileLike,
		isFileLike
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/formdata.js
var require_formdata = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { isBlobLike, iteratorMixin } = require_util$6();
	const { kState } = require_symbols$3();
	const { kEnumerableProperty } = require_util$7();
	const { FileLike, isFileLike } = require_file();
	const { webidl } = require_webidl();
	const { File: NativeFile } = __require("node:buffer");
	const nodeUtil$2 = __require("node:util");
	/** @type {globalThis['File']} */
	const File = globalThis.File ?? NativeFile;
	var FormData = class FormData {
		constructor(form) {
			webidl.util.markAsUncloneable(this);
			if (form !== void 0) throw webidl.errors.conversionFailed({
				prefix: "FormData constructor",
				argument: "Argument 1",
				types: ["undefined"]
			});
			this[kState] = [];
		}
		append(name, value, filename = void 0) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.append";
			webidl.argumentLengthCheck(arguments, 2, prefix);
			if (arguments.length === 3 && !isBlobLike(value)) throw new TypeError("Failed to execute 'append' on 'FormData': parameter 2 is not of type 'Blob'");
			name = webidl.converters.USVString(name, prefix, "name");
			value = isBlobLike(value) ? webidl.converters.Blob(value, prefix, "value", { strict: false }) : webidl.converters.USVString(value, prefix, "value");
			filename = arguments.length === 3 ? webidl.converters.USVString(filename, prefix, "filename") : void 0;
			const entry = makeEntry(name, value, filename);
			this[kState].push(entry);
		}
		delete(name) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.delete";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			name = webidl.converters.USVString(name, prefix, "name");
			this[kState] = this[kState].filter((entry) => entry.name !== name);
		}
		get(name) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.get";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			name = webidl.converters.USVString(name, prefix, "name");
			const idx = this[kState].findIndex((entry) => entry.name === name);
			if (idx === -1) return null;
			return this[kState][idx].value;
		}
		getAll(name) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.getAll";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			name = webidl.converters.USVString(name, prefix, "name");
			return this[kState].filter((entry) => entry.name === name).map((entry) => entry.value);
		}
		has(name) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.has";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			name = webidl.converters.USVString(name, prefix, "name");
			return this[kState].findIndex((entry) => entry.name === name) !== -1;
		}
		set(name, value, filename = void 0) {
			webidl.brandCheck(this, FormData);
			const prefix = "FormData.set";
			webidl.argumentLengthCheck(arguments, 2, prefix);
			if (arguments.length === 3 && !isBlobLike(value)) throw new TypeError("Failed to execute 'set' on 'FormData': parameter 2 is not of type 'Blob'");
			name = webidl.converters.USVString(name, prefix, "name");
			value = isBlobLike(value) ? webidl.converters.Blob(value, prefix, "name", { strict: false }) : webidl.converters.USVString(value, prefix, "name");
			filename = arguments.length === 3 ? webidl.converters.USVString(filename, prefix, "name") : void 0;
			const entry = makeEntry(name, value, filename);
			const idx = this[kState].findIndex((entry) => entry.name === name);
			if (idx !== -1) this[kState] = [
				...this[kState].slice(0, idx),
				entry,
				...this[kState].slice(idx + 1).filter((entry) => entry.name !== name)
			];
			else this[kState].push(entry);
		}
		[nodeUtil$2.inspect.custom](depth, options) {
			const state = this[kState].reduce((a, b) => {
				if (a[b.name]) if (Array.isArray(a[b.name])) a[b.name].push(b.value);
				else a[b.name] = [a[b.name], b.value];
				else a[b.name] = b.value;
				return a;
			}, { __proto__: null });
			options.depth ??= depth;
			options.colors ??= true;
			const output = nodeUtil$2.formatWithOptions(options, state);
			return `FormData ${output.slice(output.indexOf("]") + 2)}`;
		}
	};
	iteratorMixin("FormData", FormData, kState, "name", "value");
	Object.defineProperties(FormData.prototype, {
		append: kEnumerableProperty,
		delete: kEnumerableProperty,
		get: kEnumerableProperty,
		getAll: kEnumerableProperty,
		has: kEnumerableProperty,
		set: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "FormData",
			configurable: true
		}
	});
	/**
	* @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#create-an-entry
	* @param {string} name
	* @param {string|Blob} value
	* @param {?string} filename
	* @returns
	*/
	function makeEntry(name, value, filename) {
		if (typeof value === "string") {} else {
			if (!isFileLike(value)) value = value instanceof Blob ? new File([value], "blob", { type: value.type }) : new FileLike(value, "blob", { type: value.type });
			if (filename !== void 0) {
				/** @type {FilePropertyBag} */
				const options = {
					type: value.type,
					lastModified: value.lastModified
				};
				value = value instanceof NativeFile ? new File([value], filename, options) : new FileLike(value, filename, options);
			}
		}
		return {
			name,
			value
		};
	}
	module.exports = {
		FormData,
		makeEntry
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/formdata-parser.js
var require_formdata_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { isUSVString, bufferToLowerCasedHeaderName } = require_util$7();
	const { utf8DecodeBytes } = require_util$6();
	const { HTTP_TOKEN_CODEPOINTS, isomorphicDecode } = require_data_url();
	const { isFileLike } = require_file();
	const { makeEntry } = require_formdata();
	const assert$22 = __require("node:assert");
	const { File: NodeFile } = __require("node:buffer");
	const File = globalThis.File ?? NodeFile;
	const formDataNameBuffer = Buffer.from("form-data; name=\"");
	const filenameBuffer = Buffer.from("; filename");
	const dd = Buffer.from("--");
	const ddcrlf = Buffer.from("--\r\n");
	/**
	* @param {string} chars
	*/
	function isAsciiString(chars) {
		for (let i = 0; i < chars.length; ++i) if ((chars.charCodeAt(i) & -128) !== 0) return false;
		return true;
	}
	/**
	* @see https://andreubotella.github.io/multipart-form-data/#multipart-form-data-boundary
	* @param {string} boundary
	*/
	function validateBoundary(boundary) {
		const length = boundary.length;
		if (length < 27 || length > 70) return false;
		for (let i = 0; i < length; ++i) {
			const cp = boundary.charCodeAt(i);
			if (!(cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 39 || cp === 45 || cp === 95)) return false;
		}
		return true;
	}
	/**
	* @see https://andreubotella.github.io/multipart-form-data/#multipart-form-data-parser
	* @param {Buffer} input
	* @param {ReturnType<import('./data-url')['parseMIMEType']>} mimeType
	*/
	function multipartFormDataParser(input, mimeType) {
		assert$22(mimeType !== "failure" && mimeType.essence === "multipart/form-data");
		const boundaryString = mimeType.parameters.get("boundary");
		if (boundaryString === void 0) return "failure";
		const boundary = Buffer.from(`--${boundaryString}`, "utf8");
		const entryList = [];
		const position = { position: 0 };
		while (input[position.position] === 13 && input[position.position + 1] === 10) position.position += 2;
		let trailing = input.length;
		while (input[trailing - 1] === 10 && input[trailing - 2] === 13) trailing -= 2;
		if (trailing !== input.length) input = input.subarray(0, trailing);
		while (true) {
			if (input.subarray(position.position, position.position + boundary.length).equals(boundary)) position.position += boundary.length;
			else return "failure";
			if (position.position === input.length - 2 && bufferStartsWith(input, dd, position) || position.position === input.length - 4 && bufferStartsWith(input, ddcrlf, position)) return entryList;
			if (input[position.position] !== 13 || input[position.position + 1] !== 10) return "failure";
			position.position += 2;
			const result = parseMultipartFormDataHeaders(input, position);
			if (result === "failure") return "failure";
			let { name, filename, contentType, encoding } = result;
			position.position += 2;
			let body;
			{
				const boundaryIndex = input.indexOf(boundary.subarray(2), position.position);
				if (boundaryIndex === -1) return "failure";
				body = input.subarray(position.position, boundaryIndex - 4);
				position.position += body.length;
				if (encoding === "base64") body = Buffer.from(body.toString(), "base64");
			}
			if (input[position.position] !== 13 || input[position.position + 1] !== 10) return "failure";
			else position.position += 2;
			let value;
			if (filename !== null) {
				contentType ??= "text/plain";
				if (!isAsciiString(contentType)) contentType = "";
				value = new File([body], filename, { type: contentType });
			} else value = utf8DecodeBytes(Buffer.from(body));
			assert$22(isUSVString(name));
			assert$22(typeof value === "string" && isUSVString(value) || isFileLike(value));
			entryList.push(makeEntry(name, value, filename));
		}
	}
	/**
	* @see https://andreubotella.github.io/multipart-form-data/#parse-multipart-form-data-headers
	* @param {Buffer} input
	* @param {{ position: number }} position
	*/
	function parseMultipartFormDataHeaders(input, position) {
		let name = null;
		let filename = null;
		let contentType = null;
		let encoding = null;
		while (true) {
			if (input[position.position] === 13 && input[position.position + 1] === 10) {
				if (name === null) return "failure";
				return {
					name,
					filename,
					contentType,
					encoding
				};
			}
			let headerName = collectASequenceOfBytes((char) => char !== 10 && char !== 13 && char !== 58, input, position);
			headerName = removeChars(headerName, true, true, (char) => char === 9 || char === 32);
			if (!HTTP_TOKEN_CODEPOINTS.test(headerName.toString())) return "failure";
			if (input[position.position] !== 58) return "failure";
			position.position++;
			collectASequenceOfBytes((char) => char === 32 || char === 9, input, position);
			switch (bufferToLowerCasedHeaderName(headerName)) {
				case "content-disposition":
					name = filename = null;
					if (!bufferStartsWith(input, formDataNameBuffer, position)) return "failure";
					position.position += 17;
					name = parseMultipartFormDataName(input, position);
					if (name === null) return "failure";
					if (bufferStartsWith(input, filenameBuffer, position)) {
						let check = position.position + filenameBuffer.length;
						if (input[check] === 42) {
							position.position += 1;
							check += 1;
						}
						if (input[check] !== 61 || input[check + 1] !== 34) return "failure";
						position.position += 12;
						filename = parseMultipartFormDataName(input, position);
						if (filename === null) return "failure";
					}
					break;
				case "content-type": {
					let headerValue = collectASequenceOfBytes((char) => char !== 10 && char !== 13, input, position);
					headerValue = removeChars(headerValue, false, true, (char) => char === 9 || char === 32);
					contentType = isomorphicDecode(headerValue);
					break;
				}
				case "content-transfer-encoding": {
					let headerValue = collectASequenceOfBytes((char) => char !== 10 && char !== 13, input, position);
					headerValue = removeChars(headerValue, false, true, (char) => char === 9 || char === 32);
					encoding = isomorphicDecode(headerValue);
					break;
				}
				default: collectASequenceOfBytes((char) => char !== 10 && char !== 13, input, position);
			}
			if (input[position.position] !== 13 && input[position.position + 1] !== 10) return "failure";
			else position.position += 2;
		}
	}
	/**
	* @see https://andreubotella.github.io/multipart-form-data/#parse-a-multipart-form-data-name
	* @param {Buffer} input
	* @param {{ position: number }} position
	*/
	function parseMultipartFormDataName(input, position) {
		assert$22(input[position.position - 1] === 34);
		/** @type {string | Buffer} */
		let name = collectASequenceOfBytes((char) => char !== 10 && char !== 13 && char !== 34, input, position);
		if (input[position.position] !== 34) return null;
		else position.position++;
		name = new TextDecoder().decode(name).replace(/%0A/gi, "\n").replace(/%0D/gi, "\r").replace(/%22/g, "\"");
		return name;
	}
	/**
	* @param {(char: number) => boolean} condition
	* @param {Buffer} input
	* @param {{ position: number }} position
	*/
	function collectASequenceOfBytes(condition, input, position) {
		let start = position.position;
		while (start < input.length && condition(input[start])) ++start;
		return input.subarray(position.position, position.position = start);
	}
	/**
	* @param {Buffer} buf
	* @param {boolean} leading
	* @param {boolean} trailing
	* @param {(charCode: number) => boolean} predicate
	* @returns {Buffer}
	*/
	function removeChars(buf, leading, trailing, predicate) {
		let lead = 0;
		let trail = buf.length - 1;
		if (leading) while (lead < buf.length && predicate(buf[lead])) lead++;
		if (trailing) while (trail > 0 && predicate(buf[trail])) trail--;
		return lead === 0 && trail === buf.length - 1 ? buf : buf.subarray(lead, trail + 1);
	}
	/**
	* Checks if {@param buffer} starts with {@param start}
	* @param {Buffer} buffer
	* @param {Buffer} start
	* @param {{ position: number }} position
	*/
	function bufferStartsWith(buffer, start, position) {
		if (buffer.length < start.length) return false;
		for (let i = 0; i < start.length; i++) if (start[i] !== buffer[position.position + i]) return false;
		return true;
	}
	module.exports = {
		multipartFormDataParser,
		validateBoundary
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/body.js
var require_body = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const util = require_util$7();
	const { ReadableStreamFrom, isBlobLike, isReadableStreamLike, readableStreamClose, createDeferredPromise, fullyReadBody, extractMimeType, utf8DecodeBytes } = require_util$6();
	const { FormData } = require_formdata();
	const { kState } = require_symbols$3();
	const { webidl } = require_webidl();
	const { Blob: Blob$1 } = __require("node:buffer");
	const assert$21 = __require("node:assert");
	const { isErrored, isDisturbed } = __require("node:stream");
	const { isArrayBuffer } = __require("node:util/types");
	const { serializeAMimeType } = require_data_url();
	const { multipartFormDataParser } = require_formdata_parser();
	let random;
	try {
		const crypto = __require("node:crypto");
		random = (max) => crypto.randomInt(0, max);
	} catch {
		random = (max) => Math.floor(Math.random(max));
	}
	const textEncoder = new TextEncoder();
	function noop() {}
	const hasFinalizationRegistry = globalThis.FinalizationRegistry && process.version.indexOf("v18") !== 0;
	let streamRegistry;
	if (hasFinalizationRegistry) streamRegistry = new FinalizationRegistry((weakRef) => {
		const stream = weakRef.deref();
		if (stream && !stream.locked && !isDisturbed(stream) && !isErrored(stream)) stream.cancel("Response object has been garbage collected").catch(noop);
	});
	function extractBody(object, keepalive = false) {
		let stream = null;
		if (object instanceof ReadableStream) stream = object;
		else if (isBlobLike(object)) stream = object.stream();
		else stream = new ReadableStream({
			async pull(controller) {
				const buffer = typeof source === "string" ? textEncoder.encode(source) : source;
				if (buffer.byteLength) controller.enqueue(buffer);
				queueMicrotask(() => readableStreamClose(controller));
			},
			start() {},
			type: "bytes"
		});
		assert$21(isReadableStreamLike(stream));
		let action = null;
		let source = null;
		let length = null;
		let type = null;
		if (typeof object === "string") {
			source = object;
			type = "text/plain;charset=UTF-8";
		} else if (object instanceof URLSearchParams) {
			source = object.toString();
			type = "application/x-www-form-urlencoded;charset=UTF-8";
		} else if (isArrayBuffer(object)) source = new Uint8Array(object.slice());
		else if (ArrayBuffer.isView(object)) source = new Uint8Array(object.buffer.slice(object.byteOffset, object.byteOffset + object.byteLength));
		else if (util.isFormDataLike(object)) {
			const boundary = `----formdata-undici-0${`${random(1e11)}`.padStart(11, "0")}`;
			const prefix = `--${boundary}\r\nContent-Disposition: form-data`;
			/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
			const escape = (str) => str.replace(/\n/g, "%0A").replace(/\r/g, "%0D").replace(/"/g, "%22");
			const normalizeLinefeeds = (value) => value.replace(/\r?\n|\r/g, "\r\n");
			const blobParts = [];
			const rn = new Uint8Array([13, 10]);
			length = 0;
			let hasUnknownSizeValue = false;
			for (const [name, value] of object) if (typeof value === "string") {
				const chunk = textEncoder.encode(prefix + `; name="${escape(normalizeLinefeeds(name))}"\r\n\r\n${normalizeLinefeeds(value)}\r\n`);
				blobParts.push(chunk);
				length += chunk.byteLength;
			} else {
				const chunk = textEncoder.encode(`${prefix}; name="${escape(normalizeLinefeeds(name))}"` + (value.name ? `; filename="${escape(value.name)}"` : "") + `\r
Content-Type: ${value.type || "application/octet-stream"}\r\n\r\n`);
				blobParts.push(chunk, value, rn);
				if (typeof value.size === "number") length += chunk.byteLength + value.size + rn.byteLength;
				else hasUnknownSizeValue = true;
			}
			const chunk = textEncoder.encode(`--${boundary}--\r\n`);
			blobParts.push(chunk);
			length += chunk.byteLength;
			if (hasUnknownSizeValue) length = null;
			source = object;
			action = async function* () {
				for (const part of blobParts) if (part.stream) yield* part.stream();
				else yield part;
			};
			type = `multipart/form-data; boundary=${boundary}`;
		} else if (isBlobLike(object)) {
			source = object;
			length = object.size;
			if (object.type) type = object.type;
		} else if (typeof object[Symbol.asyncIterator] === "function") {
			if (keepalive) throw new TypeError("keepalive");
			if (util.isDisturbed(object) || object.locked) throw new TypeError("Response body object should not be disturbed or locked");
			stream = object instanceof ReadableStream ? object : ReadableStreamFrom(object);
		}
		if (typeof source === "string" || util.isBuffer(source)) length = Buffer.byteLength(source);
		if (action != null) {
			let iterator;
			stream = new ReadableStream({
				async start() {
					iterator = action(object)[Symbol.asyncIterator]();
				},
				async pull(controller) {
					const { value, done } = await iterator.next();
					if (done) queueMicrotask(() => {
						controller.close();
						controller.byobRequest?.respond(0);
					});
					else if (!isErrored(stream)) {
						const buffer = new Uint8Array(value);
						if (buffer.byteLength) controller.enqueue(buffer);
					}
					return controller.desiredSize > 0;
				},
				async cancel(reason) {
					await iterator.return();
				},
				type: "bytes"
			});
		}
		return [{
			stream,
			source,
			length
		}, type];
	}
	function safelyExtractBody(object, keepalive = false) {
		if (object instanceof ReadableStream) {
			// istanbul ignore next
			assert$21(!util.isDisturbed(object), "The body has already been consumed.");
			// istanbul ignore next
			assert$21(!object.locked, "The stream is locked.");
		}
		return extractBody(object, keepalive);
	}
	function cloneBody(instance, body) {
		const [out1, out2] = body.stream.tee();
		body.stream = out1;
		return {
			stream: out2,
			length: body.length,
			source: body.source
		};
	}
	function throwIfAborted(state) {
		if (state.aborted) throw new DOMException("The operation was aborted.", "AbortError");
	}
	function bodyMixinMethods(instance) {
		return {
			blob() {
				return consumeBody(this, (bytes) => {
					let mimeType = bodyMimeType(this);
					if (mimeType === null) mimeType = "";
					else if (mimeType) mimeType = serializeAMimeType(mimeType);
					return new Blob$1([bytes], { type: mimeType });
				}, instance);
			},
			arrayBuffer() {
				return consumeBody(this, (bytes) => {
					return new Uint8Array(bytes).buffer;
				}, instance);
			},
			text() {
				return consumeBody(this, utf8DecodeBytes, instance);
			},
			json() {
				return consumeBody(this, parseJSONFromBytes, instance);
			},
			formData() {
				return consumeBody(this, (value) => {
					const mimeType = bodyMimeType(this);
					if (mimeType !== null) switch (mimeType.essence) {
						case "multipart/form-data": {
							const parsed = multipartFormDataParser(value, mimeType);
							if (parsed === "failure") throw new TypeError("Failed to parse body as FormData.");
							const fd = new FormData();
							fd[kState] = parsed;
							return fd;
						}
						case "application/x-www-form-urlencoded": {
							const entries = new URLSearchParams(value.toString());
							const fd = new FormData();
							for (const [name, value] of entries) fd.append(name, value);
							return fd;
						}
					}
					throw new TypeError("Content-Type was not one of \"multipart/form-data\" or \"application/x-www-form-urlencoded\".");
				}, instance);
			},
			bytes() {
				return consumeBody(this, (bytes) => {
					return new Uint8Array(bytes);
				}, instance);
			}
		};
	}
	function mixinBody(prototype) {
		Object.assign(prototype.prototype, bodyMixinMethods(prototype));
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-body-consume-body
	* @param {Response|Request} object
	* @param {(value: unknown) => unknown} convertBytesToJSValue
	* @param {Response|Request} instance
	*/
	async function consumeBody(object, convertBytesToJSValue, instance) {
		webidl.brandCheck(object, instance);
		if (bodyUnusable(object)) throw new TypeError("Body is unusable: Body has already been read");
		throwIfAborted(object[kState]);
		const promise = createDeferredPromise();
		const errorSteps = (error) => promise.reject(error);
		const successSteps = (data) => {
			try {
				promise.resolve(convertBytesToJSValue(data));
			} catch (e) {
				errorSteps(e);
			}
		};
		if (object[kState].body == null) {
			successSteps(Buffer.allocUnsafe(0));
			return promise.promise;
		}
		await fullyReadBody(object[kState].body, successSteps, errorSteps);
		return promise.promise;
	}
	function bodyUnusable(object) {
		const body = object[kState].body;
		return body != null && (body.stream.locked || util.isDisturbed(body.stream));
	}
	/**
	* @see https://infra.spec.whatwg.org/#parse-json-bytes-to-a-javascript-value
	* @param {Uint8Array} bytes
	*/
	function parseJSONFromBytes(bytes) {
		return JSON.parse(utf8DecodeBytes(bytes));
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-body-mime-type
	* @param {import('./response').Response|import('./request').Request} requestOrResponse
	*/
	function bodyMimeType(requestOrResponse) {
		/** @type {import('./headers').HeadersList} */
		const headers = requestOrResponse[kState].headersList;
		const mimeType = extractMimeType(headers);
		if (mimeType === "failure") return null;
		return mimeType;
	}
	module.exports = {
		extractBody,
		safelyExtractBody,
		cloneBody,
		mixinBody,
		streamRegistry,
		hasFinalizationRegistry,
		bodyUnusable
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/client-h1.js
var require_client_h1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$20 = __require("node:assert");
	const util = require_util$7();
	const { channels } = require_diagnostics();
	const timers = require_timers();
	const { RequestContentLengthMismatchError, ResponseContentLengthMismatchError, RequestAbortedError, HeadersTimeoutError, HeadersOverflowError, SocketError, InformationalError, BodyTimeoutError, HTTPParserError, ResponseExceededMaxSizeError } = require_errors();
	const { kUrl, kReset, kClient, kParser, kBlocking, kRunning, kPending, kSize, kWriting, kQueue, kNoRef, kKeepAliveDefaultTimeout, kHostHeader, kPendingIdx, kRunningIdx, kError, kPipelining, kSocket, kKeepAliveTimeoutValue, kMaxHeadersSize, kKeepAliveMaxTimeout, kKeepAliveTimeoutThreshold, kHeadersTimeout, kBodyTimeout, kStrictContentLength, kMaxRequests, kCounter, kMaxResponseSize, kOnError, kResume, kHTTPContext } = require_symbols$4();
	const constants = require_constants$3();
	const EMPTY_BUF = Buffer.alloc(0);
	const FastBuffer = Buffer[Symbol.species];
	const addListener = util.addListener;
	const removeAllListeners = util.removeAllListeners;
	let extractBody;
	async function lazyllhttp() {
		const llhttpWasmData = process.env.JEST_WORKER_ID ? require_llhttp_wasm() : void 0;
		let mod;
		try {
			mod = await WebAssembly.compile(require_llhttp_simd_wasm());
		} catch (e) {
			/* istanbul ignore next */
			mod = await WebAssembly.compile(llhttpWasmData || require_llhttp_wasm());
		}
		return await WebAssembly.instantiate(mod, { env: {
			wasm_on_url: (p, at, len) => {
				/* istanbul ignore next */
				return 0;
			},
			wasm_on_status: (p, at, len) => {
				assert$20(currentParser.ptr === p);
				const start = at - currentBufferPtr + currentBufferRef.byteOffset;
				return currentParser.onStatus(new FastBuffer(currentBufferRef.buffer, start, len)) || 0;
			},
			wasm_on_message_begin: (p) => {
				assert$20(currentParser.ptr === p);
				return currentParser.onMessageBegin() || 0;
			},
			wasm_on_header_field: (p, at, len) => {
				assert$20(currentParser.ptr === p);
				const start = at - currentBufferPtr + currentBufferRef.byteOffset;
				return currentParser.onHeaderField(new FastBuffer(currentBufferRef.buffer, start, len)) || 0;
			},
			wasm_on_header_value: (p, at, len) => {
				assert$20(currentParser.ptr === p);
				const start = at - currentBufferPtr + currentBufferRef.byteOffset;
				return currentParser.onHeaderValue(new FastBuffer(currentBufferRef.buffer, start, len)) || 0;
			},
			wasm_on_headers_complete: (p, statusCode, upgrade, shouldKeepAlive) => {
				assert$20(currentParser.ptr === p);
				return currentParser.onHeadersComplete(statusCode, Boolean(upgrade), Boolean(shouldKeepAlive)) || 0;
			},
			wasm_on_body: (p, at, len) => {
				assert$20(currentParser.ptr === p);
				const start = at - currentBufferPtr + currentBufferRef.byteOffset;
				return currentParser.onBody(new FastBuffer(currentBufferRef.buffer, start, len)) || 0;
			},
			wasm_on_message_complete: (p) => {
				assert$20(currentParser.ptr === p);
				return currentParser.onMessageComplete() || 0;
			}
		} });
	}
	let llhttpInstance = null;
	let llhttpPromise = lazyllhttp();
	llhttpPromise.catch();
	let currentParser = null;
	let currentBufferRef = null;
	let currentBufferSize = 0;
	let currentBufferPtr = null;
	const USE_NATIVE_TIMER = 0;
	const USE_FAST_TIMER = 1;
	const TIMEOUT_HEADERS = 2 | USE_FAST_TIMER;
	const TIMEOUT_BODY = 4 | USE_FAST_TIMER;
	const TIMEOUT_KEEP_ALIVE = 8 | USE_NATIVE_TIMER;
	var Parser = class {
		constructor(client, socket, { exports: exports$1 }) {
			assert$20(Number.isFinite(client[kMaxHeadersSize]) && client[kMaxHeadersSize] > 0);
			this.llhttp = exports$1;
			this.ptr = this.llhttp.llhttp_alloc(constants.TYPE.RESPONSE);
			this.client = client;
			this.socket = socket;
			this.timeout = null;
			this.timeoutValue = null;
			this.timeoutType = null;
			this.statusCode = null;
			this.statusText = "";
			this.upgrade = false;
			this.headers = [];
			this.headersSize = 0;
			this.headersMaxSize = client[kMaxHeadersSize];
			this.shouldKeepAlive = false;
			this.paused = false;
			this.resume = this.resume.bind(this);
			this.bytesRead = 0;
			this.keepAlive = "";
			this.contentLength = "";
			this.connection = "";
			this.maxResponseSize = client[kMaxResponseSize];
		}
		setTimeout(delay, type) {
			if (delay !== this.timeoutValue || type & USE_FAST_TIMER ^ this.timeoutType & USE_FAST_TIMER) {
				if (this.timeout) {
					timers.clearTimeout(this.timeout);
					this.timeout = null;
				}
				if (delay) if (type & USE_FAST_TIMER) this.timeout = timers.setFastTimeout(onParserTimeout, delay, new WeakRef(this));
				else {
					this.timeout = setTimeout(onParserTimeout, delay, new WeakRef(this));
					this.timeout.unref();
				}
				this.timeoutValue = delay;
			} else if (this.timeout) {
				// istanbul ignore else: only for jest
				if (this.timeout.refresh) this.timeout.refresh();
			}
			this.timeoutType = type;
		}
		resume() {
			if (this.socket.destroyed || !this.paused) return;
			assert$20(this.ptr != null);
			assert$20(currentParser == null);
			this.llhttp.llhttp_resume(this.ptr);
			assert$20(this.timeoutType === TIMEOUT_BODY);
			if (this.timeout) {
				// istanbul ignore else: only for jest
				if (this.timeout.refresh) this.timeout.refresh();
			}
			this.paused = false;
			this.execute(this.socket.read() || EMPTY_BUF);
			this.readMore();
		}
		readMore() {
			while (!this.paused && this.ptr) {
				const chunk = this.socket.read();
				if (chunk === null) break;
				this.execute(chunk);
			}
		}
		execute(data) {
			assert$20(this.ptr != null);
			assert$20(currentParser == null);
			assert$20(!this.paused);
			const { socket, llhttp } = this;
			if (data.length > currentBufferSize) {
				if (currentBufferPtr) llhttp.free(currentBufferPtr);
				currentBufferSize = Math.ceil(data.length / 4096) * 4096;
				currentBufferPtr = llhttp.malloc(currentBufferSize);
			}
			new Uint8Array(llhttp.memory.buffer, currentBufferPtr, currentBufferSize).set(data);
			try {
				let ret;
				try {
					currentBufferRef = data;
					currentParser = this;
					ret = llhttp.llhttp_execute(this.ptr, currentBufferPtr, data.length);
				} catch (err) {
					/* istanbul ignore next: difficult to make a test case for */
					throw err;
				} finally {
					currentParser = null;
					currentBufferRef = null;
				}
				const offset = llhttp.llhttp_get_error_pos(this.ptr) - currentBufferPtr;
				if (ret === constants.ERROR.PAUSED_UPGRADE) this.onUpgrade(data.slice(offset));
				else if (ret === constants.ERROR.PAUSED) {
					this.paused = true;
					socket.unshift(data.slice(offset));
				} else if (ret !== constants.ERROR.OK) {
					const ptr = llhttp.llhttp_get_error_reason(this.ptr);
					let message = "";
					/* istanbul ignore else: difficult to make a test case for */
					if (ptr) {
						const len = new Uint8Array(llhttp.memory.buffer, ptr).indexOf(0);
						message = "Response does not match the HTTP/1.1 protocol (" + Buffer.from(llhttp.memory.buffer, ptr, len).toString() + ")";
					}
					throw new HTTPParserError(message, constants.ERROR[ret], data.slice(offset));
				}
			} catch (err) {
				util.destroy(socket, err);
			}
		}
		destroy() {
			assert$20(this.ptr != null);
			assert$20(currentParser == null);
			this.llhttp.llhttp_free(this.ptr);
			this.ptr = null;
			this.timeout && timers.clearTimeout(this.timeout);
			this.timeout = null;
			this.timeoutValue = null;
			this.timeoutType = null;
			this.paused = false;
		}
		onStatus(buf) {
			this.statusText = buf.toString();
		}
		onMessageBegin() {
			const { socket, client } = this;
			/* istanbul ignore next: difficult to make a test case for */
			if (socket.destroyed) return -1;
			const request = client[kQueue][client[kRunningIdx]];
			if (!request) return -1;
			request.onResponseStarted();
		}
		onHeaderField(buf) {
			const len = this.headers.length;
			if ((len & 1) === 0) this.headers.push(buf);
			else this.headers[len - 1] = Buffer.concat([this.headers[len - 1], buf]);
			this.trackHeader(buf.length);
		}
		onHeaderValue(buf) {
			let len = this.headers.length;
			if ((len & 1) === 1) {
				this.headers.push(buf);
				len += 1;
			} else this.headers[len - 1] = Buffer.concat([this.headers[len - 1], buf]);
			const key = this.headers[len - 2];
			if (key.length === 10) {
				const headerName = util.bufferToLowerCasedHeaderName(key);
				if (headerName === "keep-alive") this.keepAlive += buf.toString();
				else if (headerName === "connection") this.connection += buf.toString();
			} else if (key.length === 14 && util.bufferToLowerCasedHeaderName(key) === "content-length") this.contentLength += buf.toString();
			this.trackHeader(buf.length);
		}
		trackHeader(len) {
			this.headersSize += len;
			if (this.headersSize >= this.headersMaxSize) util.destroy(this.socket, new HeadersOverflowError());
		}
		onUpgrade(head) {
			const { upgrade, client, socket, headers, statusCode } = this;
			assert$20(upgrade);
			assert$20(client[kSocket] === socket);
			assert$20(!socket.destroyed);
			assert$20(!this.paused);
			assert$20((headers.length & 1) === 0);
			const request = client[kQueue][client[kRunningIdx]];
			assert$20(request);
			assert$20(request.upgrade || request.method === "CONNECT");
			this.statusCode = null;
			this.statusText = "";
			this.shouldKeepAlive = null;
			this.headers = [];
			this.headersSize = 0;
			socket.unshift(head);
			socket[kParser].destroy();
			socket[kParser] = null;
			socket[kClient] = null;
			socket[kError] = null;
			removeAllListeners(socket);
			client[kSocket] = null;
			client[kHTTPContext] = null;
			client[kQueue][client[kRunningIdx]++] = null;
			client.emit("disconnect", client[kUrl], [client], new InformationalError("upgrade"));
			try {
				request.onUpgrade(statusCode, headers, socket);
			} catch (err) {
				util.destroy(socket, err);
			}
			client[kResume]();
		}
		onHeadersComplete(statusCode, upgrade, shouldKeepAlive) {
			const { client, socket, headers, statusText } = this;
			/* istanbul ignore next: difficult to make a test case for */
			if (socket.destroyed) return -1;
			const request = client[kQueue][client[kRunningIdx]];
			/* istanbul ignore next: difficult to make a test case for */
			if (!request) return -1;
			assert$20(!this.upgrade);
			assert$20(this.statusCode < 200);
			if (statusCode === 100) {
				util.destroy(socket, new SocketError("bad response", util.getSocketInfo(socket)));
				return -1;
			}
			if (upgrade && !request.upgrade) {
				util.destroy(socket, new SocketError("bad upgrade", util.getSocketInfo(socket)));
				return -1;
			}
			assert$20(this.timeoutType === TIMEOUT_HEADERS);
			this.statusCode = statusCode;
			this.shouldKeepAlive = shouldKeepAlive || request.method === "HEAD" && !socket[kReset] && this.connection.toLowerCase() === "keep-alive";
			if (this.statusCode >= 200) {
				const bodyTimeout = request.bodyTimeout != null ? request.bodyTimeout : client[kBodyTimeout];
				this.setTimeout(bodyTimeout, TIMEOUT_BODY);
			} else if (this.timeout) {
				// istanbul ignore else: only for jest
				if (this.timeout.refresh) this.timeout.refresh();
			}
			if (request.method === "CONNECT") {
				assert$20(client[kRunning] === 1);
				this.upgrade = true;
				return 2;
			}
			if (upgrade) {
				assert$20(client[kRunning] === 1);
				this.upgrade = true;
				return 2;
			}
			assert$20((this.headers.length & 1) === 0);
			this.headers = [];
			this.headersSize = 0;
			if (this.shouldKeepAlive && client[kPipelining]) {
				const keepAliveTimeout = this.keepAlive ? util.parseKeepAliveTimeout(this.keepAlive) : null;
				if (keepAliveTimeout != null) {
					const timeout = Math.min(keepAliveTimeout - client[kKeepAliveTimeoutThreshold], client[kKeepAliveMaxTimeout]);
					if (timeout <= 0) socket[kReset] = true;
					else client[kKeepAliveTimeoutValue] = timeout;
				} else client[kKeepAliveTimeoutValue] = client[kKeepAliveDefaultTimeout];
			} else socket[kReset] = true;
			const pause = request.onHeaders(statusCode, headers, this.resume, statusText) === false;
			if (request.aborted) return -1;
			if (request.method === "HEAD") return 1;
			if (statusCode < 200) return 1;
			if (socket[kBlocking]) {
				socket[kBlocking] = false;
				client[kResume]();
			}
			return pause ? constants.ERROR.PAUSED : 0;
		}
		onBody(buf) {
			const { client, socket, statusCode, maxResponseSize } = this;
			if (socket.destroyed) return -1;
			const request = client[kQueue][client[kRunningIdx]];
			assert$20(request);
			assert$20(this.timeoutType === TIMEOUT_BODY);
			if (this.timeout) {
				// istanbul ignore else: only for jest
				if (this.timeout.refresh) this.timeout.refresh();
			}
			assert$20(statusCode >= 200);
			if (maxResponseSize > -1 && this.bytesRead + buf.length > maxResponseSize) {
				util.destroy(socket, new ResponseExceededMaxSizeError());
				return -1;
			}
			this.bytesRead += buf.length;
			if (request.onData(buf) === false) return constants.ERROR.PAUSED;
		}
		onMessageComplete() {
			const { client, socket, statusCode, upgrade, headers, contentLength, bytesRead, shouldKeepAlive } = this;
			if (socket.destroyed && (!statusCode || shouldKeepAlive)) return -1;
			if (upgrade) return;
			assert$20(statusCode >= 100);
			assert$20((this.headers.length & 1) === 0);
			const request = client[kQueue][client[kRunningIdx]];
			assert$20(request);
			this.statusCode = null;
			this.statusText = "";
			this.bytesRead = 0;
			this.contentLength = "";
			this.keepAlive = "";
			this.connection = "";
			this.headers = [];
			this.headersSize = 0;
			if (statusCode < 200) return;
			/* istanbul ignore next: should be handled by llhttp? */
			if (request.method !== "HEAD" && contentLength && bytesRead !== parseInt(contentLength, 10)) {
				util.destroy(socket, new ResponseContentLengthMismatchError());
				return -1;
			}
			request.onComplete(headers);
			client[kQueue][client[kRunningIdx]++] = null;
			if (socket[kWriting]) {
				assert$20(client[kRunning] === 0);
				util.destroy(socket, new InformationalError("reset"));
				return constants.ERROR.PAUSED;
			} else if (!shouldKeepAlive) {
				util.destroy(socket, new InformationalError("reset"));
				return constants.ERROR.PAUSED;
			} else if (socket[kReset] && client[kRunning] === 0) {
				util.destroy(socket, new InformationalError("reset"));
				return constants.ERROR.PAUSED;
			} else if (client[kPipelining] == null || client[kPipelining] === 1) setImmediate(() => client[kResume]());
			else client[kResume]();
		}
	};
	function onParserTimeout(parser) {
		const { socket, timeoutType, client, paused } = parser.deref();
		/* istanbul ignore else */
		if (timeoutType === TIMEOUT_HEADERS) {
			if (!socket[kWriting] || socket.writableNeedDrain || client[kRunning] > 1) {
				assert$20(!paused, "cannot be paused while waiting for headers");
				util.destroy(socket, new HeadersTimeoutError());
			}
		} else if (timeoutType === TIMEOUT_BODY) {
			if (!paused) util.destroy(socket, new BodyTimeoutError());
		} else if (timeoutType === TIMEOUT_KEEP_ALIVE) {
			assert$20(client[kRunning] === 0 && client[kKeepAliveTimeoutValue]);
			util.destroy(socket, new InformationalError("socket idle timeout"));
		}
	}
	async function connectH1(client, socket) {
		client[kSocket] = socket;
		if (!llhttpInstance) {
			llhttpInstance = await llhttpPromise;
			llhttpPromise = null;
		}
		socket[kNoRef] = false;
		socket[kWriting] = false;
		socket[kReset] = false;
		socket[kBlocking] = false;
		socket[kParser] = new Parser(client, socket, llhttpInstance);
		addListener(socket, "error", function(err) {
			assert$20(err.code !== "ERR_TLS_CERT_ALTNAME_INVALID");
			const parser = this[kParser];
			if (err.code === "ECONNRESET" && parser.statusCode && !parser.shouldKeepAlive) {
				parser.onMessageComplete();
				return;
			}
			this[kError] = err;
			this[kClient][kOnError](err);
		});
		addListener(socket, "readable", function() {
			const parser = this[kParser];
			if (parser) parser.readMore();
		});
		addListener(socket, "end", function() {
			const parser = this[kParser];
			if (parser.statusCode && !parser.shouldKeepAlive) {
				parser.onMessageComplete();
				return;
			}
			util.destroy(this, new SocketError("other side closed", util.getSocketInfo(this)));
		});
		addListener(socket, "close", function() {
			const client = this[kClient];
			const parser = this[kParser];
			if (parser) {
				if (!this[kError] && parser.statusCode && !parser.shouldKeepAlive) parser.onMessageComplete();
				this[kParser].destroy();
				this[kParser] = null;
			}
			const err = this[kError] || new SocketError("closed", util.getSocketInfo(this));
			client[kSocket] = null;
			client[kHTTPContext] = null;
			if (client.destroyed) {
				assert$20(client[kPending] === 0);
				const requests = client[kQueue].splice(client[kRunningIdx]);
				for (let i = 0; i < requests.length; i++) {
					const request = requests[i];
					util.errorRequest(client, request, err);
				}
			} else if (client[kRunning] > 0 && err.code !== "UND_ERR_INFO") {
				const request = client[kQueue][client[kRunningIdx]];
				client[kQueue][client[kRunningIdx]++] = null;
				util.errorRequest(client, request, err);
			}
			client[kPendingIdx] = client[kRunningIdx];
			assert$20(client[kRunning] === 0);
			client.emit("disconnect", client[kUrl], [client], err);
			client[kResume]();
		});
		let closed = false;
		socket.on("close", () => {
			closed = true;
		});
		return {
			version: "h1",
			defaultPipelining: 1,
			write(...args) {
				return writeH1(client, ...args);
			},
			resume() {
				resumeH1(client);
			},
			destroy(err, callback) {
				if (closed) queueMicrotask(callback);
				else socket.destroy(err).on("close", callback);
			},
			get destroyed() {
				return socket.destroyed;
			},
			busy(request) {
				if (socket[kWriting] || socket[kReset] || socket[kBlocking]) return true;
				if (request) {
					if (client[kRunning] > 0 && !request.idempotent) return true;
					if (client[kRunning] > 0 && (request.upgrade || request.method === "CONNECT")) return true;
					if (client[kRunning] > 0 && util.bodyLength(request.body) !== 0 && (util.isStream(request.body) || util.isAsyncIterable(request.body) || util.isFormDataLike(request.body))) return true;
				}
				return false;
			}
		};
	}
	function resumeH1(client) {
		const socket = client[kSocket];
		if (socket && !socket.destroyed) {
			if (client[kSize] === 0) {
				if (!socket[kNoRef] && socket.unref) {
					socket.unref();
					socket[kNoRef] = true;
				}
			} else if (socket[kNoRef] && socket.ref) {
				socket.ref();
				socket[kNoRef] = false;
			}
			if (client[kSize] === 0) {
				if (socket[kParser].timeoutType !== TIMEOUT_KEEP_ALIVE) socket[kParser].setTimeout(client[kKeepAliveTimeoutValue], TIMEOUT_KEEP_ALIVE);
			} else if (client[kRunning] > 0 && socket[kParser].statusCode < 200) {
				if (socket[kParser].timeoutType !== TIMEOUT_HEADERS) {
					const request = client[kQueue][client[kRunningIdx]];
					const headersTimeout = request.headersTimeout != null ? request.headersTimeout : client[kHeadersTimeout];
					socket[kParser].setTimeout(headersTimeout, TIMEOUT_HEADERS);
				}
			}
		}
	}
	function shouldSendContentLength(method) {
		return method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && method !== "TRACE" && method !== "CONNECT";
	}
	function writeH1(client, request) {
		const { method, path, host, upgrade, blocking, reset } = request;
		let { body, headers, contentLength } = request;
		const expectsPayload = method === "PUT" || method === "POST" || method === "PATCH" || method === "QUERY" || method === "PROPFIND" || method === "PROPPATCH";
		if (util.isFormDataLike(body)) {
			if (!extractBody) extractBody = require_body().extractBody;
			const [bodyStream, contentType] = extractBody(body);
			if (request.contentType == null) headers.push("content-type", contentType);
			body = bodyStream.stream;
			contentLength = bodyStream.length;
		} else if (util.isBlobLike(body) && request.contentType == null && body.type) headers.push("content-type", body.type);
		if (body && typeof body.read === "function") body.read(0);
		const bodyLength = util.bodyLength(body);
		contentLength = bodyLength ?? contentLength;
		if (contentLength === null) contentLength = request.contentLength;
		if (contentLength === 0 && !expectsPayload) contentLength = null;
		if (shouldSendContentLength(method) && contentLength > 0 && request.contentLength !== null && request.contentLength !== contentLength) {
			if (client[kStrictContentLength]) {
				util.errorRequest(client, request, new RequestContentLengthMismatchError());
				return false;
			}
			process.emitWarning(new RequestContentLengthMismatchError());
		}
		const socket = client[kSocket];
		const abort = (err) => {
			if (request.aborted || request.completed) return;
			util.errorRequest(client, request, err || new RequestAbortedError());
			util.destroy(body);
			util.destroy(socket, new InformationalError("aborted"));
		};
		try {
			request.onConnect(abort);
		} catch (err) {
			util.errorRequest(client, request, err);
		}
		if (request.aborted) return false;
		if (method === "HEAD") socket[kReset] = true;
		if (upgrade || method === "CONNECT") socket[kReset] = true;
		if (reset != null) socket[kReset] = reset;
		if (client[kMaxRequests] && socket[kCounter]++ >= client[kMaxRequests]) socket[kReset] = true;
		if (blocking) socket[kBlocking] = true;
		let header = `${method} ${path} HTTP/1.1\r\n`;
		if (typeof host === "string") header += `host: ${host}\r\n`;
		else header += client[kHostHeader];
		if (upgrade) header += `connection: upgrade\r\nupgrade: ${upgrade}\r\n`;
		else if (client[kPipelining] && !socket[kReset]) header += "connection: keep-alive\r\n";
		else header += "connection: close\r\n";
		if (Array.isArray(headers)) for (let n = 0; n < headers.length; n += 2) {
			const key = headers[n + 0];
			const val = headers[n + 1];
			if (Array.isArray(val)) for (let i = 0; i < val.length; i++) header += `${key}: ${val[i]}\r\n`;
			else header += `${key}: ${val}\r\n`;
		}
		if (channels.sendHeaders.hasSubscribers) channels.sendHeaders.publish({
			request,
			headers: header,
			socket
		});
		/* istanbul ignore else: assertion */
		if (!body || bodyLength === 0) writeBuffer(abort, null, client, request, socket, contentLength, header, expectsPayload);
		else if (util.isBuffer(body)) writeBuffer(abort, body, client, request, socket, contentLength, header, expectsPayload);
		else if (util.isBlobLike(body)) if (typeof body.stream === "function") writeIterable(abort, body.stream(), client, request, socket, contentLength, header, expectsPayload);
		else writeBlob(abort, body, client, request, socket, contentLength, header, expectsPayload);
		else if (util.isStream(body)) writeStream(abort, body, client, request, socket, contentLength, header, expectsPayload);
		else if (util.isIterable(body)) writeIterable(abort, body, client, request, socket, contentLength, header, expectsPayload);
		else assert$20(false);
		return true;
	}
	function writeStream(abort, body, client, request, socket, contentLength, header, expectsPayload) {
		assert$20(contentLength !== 0 || client[kRunning] === 0, "stream body cannot be pipelined");
		let finished = false;
		const writer = new AsyncWriter({
			abort,
			socket,
			request,
			contentLength,
			client,
			expectsPayload,
			header
		});
		const onData = function(chunk) {
			if (finished) return;
			try {
				if (!writer.write(chunk) && this.pause) this.pause();
			} catch (err) {
				util.destroy(this, err);
			}
		};
		const onDrain = function() {
			if (finished) return;
			if (body.resume) body.resume();
		};
		const onClose = function() {
			queueMicrotask(() => {
				body.removeListener("error", onFinished);
			});
			if (!finished) {
				const err = new RequestAbortedError();
				queueMicrotask(() => onFinished(err));
			}
		};
		const onFinished = function(err) {
			if (finished) return;
			finished = true;
			assert$20(socket.destroyed || socket[kWriting] && client[kRunning] <= 1);
			socket.off("drain", onDrain).off("error", onFinished);
			body.removeListener("data", onData).removeListener("end", onFinished).removeListener("close", onClose);
			if (!err) try {
				writer.end();
			} catch (er) {
				err = er;
			}
			writer.destroy(err);
			if (err && (err.code !== "UND_ERR_INFO" || err.message !== "reset")) util.destroy(body, err);
			else util.destroy(body);
		};
		body.on("data", onData).on("end", onFinished).on("error", onFinished).on("close", onClose);
		if (body.resume) body.resume();
		socket.on("drain", onDrain).on("error", onFinished);
		if (body.errorEmitted ?? body.errored) setImmediate(() => onFinished(body.errored));
		else if (body.endEmitted ?? body.readableEnded) setImmediate(() => onFinished(null));
		if (body.closeEmitted ?? body.closed) setImmediate(onClose);
	}
	function writeBuffer(abort, body, client, request, socket, contentLength, header, expectsPayload) {
		try {
			if (!body) if (contentLength === 0) socket.write(`${header}content-length: 0\r\n\r\n`, "latin1");
			else {
				assert$20(contentLength === null, "no body must not have content length");
				socket.write(`${header}\r\n`, "latin1");
			}
			else if (util.isBuffer(body)) {
				assert$20(contentLength === body.byteLength, "buffer body must have content length");
				socket.cork();
				socket.write(`${header}content-length: ${contentLength}\r\n\r\n`, "latin1");
				socket.write(body);
				socket.uncork();
				request.onBodySent(body);
				if (!expectsPayload && request.reset !== false) socket[kReset] = true;
			}
			request.onRequestSent();
			client[kResume]();
		} catch (err) {
			abort(err);
		}
	}
	async function writeBlob(abort, body, client, request, socket, contentLength, header, expectsPayload) {
		assert$20(contentLength === body.size, "blob body must have content length");
		try {
			if (contentLength != null && contentLength !== body.size) throw new RequestContentLengthMismatchError();
			const buffer = Buffer.from(await body.arrayBuffer());
			socket.cork();
			socket.write(`${header}content-length: ${contentLength}\r\n\r\n`, "latin1");
			socket.write(buffer);
			socket.uncork();
			request.onBodySent(buffer);
			request.onRequestSent();
			if (!expectsPayload && request.reset !== false) socket[kReset] = true;
			client[kResume]();
		} catch (err) {
			abort(err);
		}
	}
	async function writeIterable(abort, body, client, request, socket, contentLength, header, expectsPayload) {
		assert$20(contentLength !== 0 || client[kRunning] === 0, "iterator body cannot be pipelined");
		let callback = null;
		function onDrain() {
			if (callback) {
				const cb = callback;
				callback = null;
				cb();
			}
		}
		const waitForDrain = () => new Promise((resolve, reject) => {
			assert$20(callback === null);
			if (socket[kError]) reject(socket[kError]);
			else callback = resolve;
		});
		socket.on("close", onDrain).on("drain", onDrain);
		const writer = new AsyncWriter({
			abort,
			socket,
			request,
			contentLength,
			client,
			expectsPayload,
			header
		});
		try {
			for await (const chunk of body) {
				if (socket[kError]) throw socket[kError];
				if (!writer.write(chunk)) await waitForDrain();
			}
			writer.end();
		} catch (err) {
			writer.destroy(err);
		} finally {
			socket.off("close", onDrain).off("drain", onDrain);
		}
	}
	var AsyncWriter = class {
		constructor({ abort, socket, request, contentLength, client, expectsPayload, header }) {
			this.socket = socket;
			this.request = request;
			this.contentLength = contentLength;
			this.client = client;
			this.bytesWritten = 0;
			this.expectsPayload = expectsPayload;
			this.header = header;
			this.abort = abort;
			socket[kWriting] = true;
		}
		write(chunk) {
			const { socket, request, contentLength, client, bytesWritten, expectsPayload, header } = this;
			if (socket[kError]) throw socket[kError];
			if (socket.destroyed) return false;
			const len = Buffer.byteLength(chunk);
			if (!len) return true;
			if (contentLength !== null && bytesWritten + len > contentLength) {
				if (client[kStrictContentLength]) throw new RequestContentLengthMismatchError();
				process.emitWarning(new RequestContentLengthMismatchError());
			}
			socket.cork();
			if (bytesWritten === 0) {
				if (!expectsPayload && request.reset !== false) socket[kReset] = true;
				if (contentLength === null) socket.write(`${header}transfer-encoding: chunked\r\n`, "latin1");
				else socket.write(`${header}content-length: ${contentLength}\r\n\r\n`, "latin1");
			}
			if (contentLength === null) socket.write(`\r\n${len.toString(16)}\r\n`, "latin1");
			this.bytesWritten += len;
			const ret = socket.write(chunk);
			socket.uncork();
			request.onBodySent(chunk);
			if (!ret) {
				if (socket[kParser].timeout && socket[kParser].timeoutType === TIMEOUT_HEADERS) {
					// istanbul ignore else: only for jest
					if (socket[kParser].timeout.refresh) socket[kParser].timeout.refresh();
				}
			}
			return ret;
		}
		end() {
			const { socket, contentLength, client, bytesWritten, expectsPayload, header, request } = this;
			request.onRequestSent();
			socket[kWriting] = false;
			if (socket[kError]) throw socket[kError];
			if (socket.destroyed) return;
			if (bytesWritten === 0) if (expectsPayload) socket.write(`${header}content-length: 0\r\n\r\n`, "latin1");
			else socket.write(`${header}\r\n`, "latin1");
			else if (contentLength === null) socket.write("\r\n0\r\n\r\n", "latin1");
			if (contentLength !== null && bytesWritten !== contentLength) if (client[kStrictContentLength]) throw new RequestContentLengthMismatchError();
			else process.emitWarning(new RequestContentLengthMismatchError());
			if (socket[kParser].timeout && socket[kParser].timeoutType === TIMEOUT_HEADERS) {
				// istanbul ignore else: only for jest
				if (socket[kParser].timeout.refresh) socket[kParser].timeout.refresh();
			}
			client[kResume]();
		}
		destroy(err) {
			const { socket, client, abort } = this;
			socket[kWriting] = false;
			if (err) {
				assert$20(client[kRunning] <= 1, "pipeline should only contain this request");
				abort(err);
			}
		}
	};
	module.exports = connectH1;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/client-h2.js
var require_client_h2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$19 = __require("node:assert");
	const { pipeline: pipeline$2 } = __require("node:stream");
	const util = require_util$7();
	const { RequestContentLengthMismatchError, RequestAbortedError, SocketError, InformationalError } = require_errors();
	const { kUrl, kReset, kClient, kRunning, kPending, kQueue, kPendingIdx, kRunningIdx, kError, kSocket, kStrictContentLength, kOnError, kMaxConcurrentStreams, kHTTP2Session, kResume, kSize, kHTTPContext } = require_symbols$4();
	const kOpenStreams = Symbol("open streams");
	let extractBody;
	let h2ExperimentalWarned = false;
	/** @type {import('http2')} */
	let http2;
	try {
		http2 = __require("node:http2");
	} catch {
		http2 = { constants: {} };
	}
	const { constants: { HTTP2_HEADER_AUTHORITY, HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH, HTTP2_HEADER_SCHEME, HTTP2_HEADER_CONTENT_LENGTH, HTTP2_HEADER_EXPECT, HTTP2_HEADER_STATUS } } = http2;
	function parseH2Headers(headers) {
		const result = [];
		for (const [name, value] of Object.entries(headers)) if (Array.isArray(value)) for (const subvalue of value) result.push(Buffer.from(name), Buffer.from(subvalue));
		else result.push(Buffer.from(name), Buffer.from(value));
		return result;
	}
	async function connectH2(client, socket) {
		client[kSocket] = socket;
		if (!h2ExperimentalWarned) {
			h2ExperimentalWarned = true;
			process.emitWarning("H2 support is experimental, expect them to change at any time.", { code: "UNDICI-H2" });
		}
		const session = http2.connect(client[kUrl], {
			createConnection: () => socket,
			peerMaxConcurrentStreams: client[kMaxConcurrentStreams]
		});
		session[kOpenStreams] = 0;
		session[kClient] = client;
		session[kSocket] = socket;
		util.addListener(session, "error", onHttp2SessionError);
		util.addListener(session, "frameError", onHttp2FrameError);
		util.addListener(session, "end", onHttp2SessionEnd);
		util.addListener(session, "goaway", onHTTP2GoAway);
		util.addListener(session, "close", function() {
			const { [kClient]: client } = this;
			const { [kSocket]: socket } = client;
			const err = this[kSocket][kError] || this[kError] || new SocketError("closed", util.getSocketInfo(socket));
			client[kHTTP2Session] = null;
			if (client.destroyed) {
				assert$19(client[kPending] === 0);
				const requests = client[kQueue].splice(client[kRunningIdx]);
				for (let i = 0; i < requests.length; i++) {
					const request = requests[i];
					util.errorRequest(client, request, err);
				}
			}
		});
		session.unref();
		client[kHTTP2Session] = session;
		socket[kHTTP2Session] = session;
		util.addListener(socket, "error", function(err) {
			assert$19(err.code !== "ERR_TLS_CERT_ALTNAME_INVALID");
			this[kError] = err;
			this[kClient][kOnError](err);
		});
		util.addListener(socket, "end", function() {
			util.destroy(this, new SocketError("other side closed", util.getSocketInfo(this)));
		});
		util.addListener(socket, "close", function() {
			const err = this[kError] || new SocketError("closed", util.getSocketInfo(this));
			client[kSocket] = null;
			if (this[kHTTP2Session] != null) this[kHTTP2Session].destroy(err);
			client[kPendingIdx] = client[kRunningIdx];
			assert$19(client[kRunning] === 0);
			client.emit("disconnect", client[kUrl], [client], err);
			client[kResume]();
		});
		let closed = false;
		socket.on("close", () => {
			closed = true;
		});
		return {
			version: "h2",
			defaultPipelining: Infinity,
			write(...args) {
				return writeH2(client, ...args);
			},
			resume() {
				resumeH2(client);
			},
			destroy(err, callback) {
				if (closed) queueMicrotask(callback);
				else socket.destroy(err).on("close", callback);
			},
			get destroyed() {
				return socket.destroyed;
			},
			busy() {
				return false;
			}
		};
	}
	function resumeH2(client) {
		const socket = client[kSocket];
		if (socket?.destroyed === false) if (client[kSize] === 0 && client[kMaxConcurrentStreams] === 0) {
			socket.unref();
			client[kHTTP2Session].unref();
		} else {
			socket.ref();
			client[kHTTP2Session].ref();
		}
	}
	function onHttp2SessionError(err) {
		assert$19(err.code !== "ERR_TLS_CERT_ALTNAME_INVALID");
		this[kSocket][kError] = err;
		this[kClient][kOnError](err);
	}
	function onHttp2FrameError(type, code, id) {
		if (id === 0) {
			const err = new InformationalError(`HTTP/2: "frameError" received - type ${type}, code ${code}`);
			this[kSocket][kError] = err;
			this[kClient][kOnError](err);
		}
	}
	function onHttp2SessionEnd() {
		const err = new SocketError("other side closed", util.getSocketInfo(this[kSocket]));
		this.destroy(err);
		util.destroy(this[kSocket], err);
	}
	/**
	* This is the root cause of #3011
	* We need to handle GOAWAY frames properly, and trigger the session close
	* along with the socket right away
	*/
	function onHTTP2GoAway(code) {
		const err = this[kError] || new SocketError(`HTTP/2: "GOAWAY" frame received with code ${code}`, util.getSocketInfo(this));
		const client = this[kClient];
		client[kSocket] = null;
		client[kHTTPContext] = null;
		if (this[kHTTP2Session] != null) {
			this[kHTTP2Session].destroy(err);
			this[kHTTP2Session] = null;
		}
		util.destroy(this[kSocket], err);
		if (client[kRunningIdx] < client[kQueue].length) {
			const request = client[kQueue][client[kRunningIdx]];
			client[kQueue][client[kRunningIdx]++] = null;
			util.errorRequest(client, request, err);
			client[kPendingIdx] = client[kRunningIdx];
		}
		assert$19(client[kRunning] === 0);
		client.emit("disconnect", client[kUrl], [client], err);
		client[kResume]();
	}
	function shouldSendContentLength(method) {
		return method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && method !== "TRACE" && method !== "CONNECT";
	}
	function writeH2(client, request) {
		const session = client[kHTTP2Session];
		const { method, path, host, upgrade, expectContinue, signal, headers: reqHeaders } = request;
		let { body } = request;
		if (upgrade) {
			util.errorRequest(client, request, /* @__PURE__ */ new Error("Upgrade not supported for H2"));
			return false;
		}
		const headers = {};
		for (let n = 0; n < reqHeaders.length; n += 2) {
			const key = reqHeaders[n + 0];
			const val = reqHeaders[n + 1];
			if (Array.isArray(val)) for (let i = 0; i < val.length; i++) if (headers[key]) headers[key] += `,${val[i]}`;
			else headers[key] = val[i];
			else headers[key] = val;
		}
		/** @type {import('node:http2').ClientHttp2Stream} */
		let stream;
		const { hostname, port } = client[kUrl];
		headers[HTTP2_HEADER_AUTHORITY] = host || `${hostname}${port ? `:${port}` : ""}`;
		headers[HTTP2_HEADER_METHOD] = method;
		const abort = (err) => {
			if (request.aborted || request.completed) return;
			err = err || new RequestAbortedError();
			util.errorRequest(client, request, err);
			if (stream != null) util.destroy(stream, err);
			util.destroy(body, err);
			client[kQueue][client[kRunningIdx]++] = null;
			client[kResume]();
		};
		try {
			request.onConnect(abort);
		} catch (err) {
			util.errorRequest(client, request, err);
		}
		if (request.aborted) return false;
		if (method === "CONNECT") {
			session.ref();
			stream = session.request(headers, {
				endStream: false,
				signal
			});
			if (stream.id && !stream.pending) {
				request.onUpgrade(null, null, stream);
				++session[kOpenStreams];
				client[kQueue][client[kRunningIdx]++] = null;
			} else stream.once("ready", () => {
				request.onUpgrade(null, null, stream);
				++session[kOpenStreams];
				client[kQueue][client[kRunningIdx]++] = null;
			});
			stream.once("close", () => {
				session[kOpenStreams] -= 1;
				if (session[kOpenStreams] === 0) session.unref();
			});
			return true;
		}
		headers[HTTP2_HEADER_PATH] = path;
		headers[HTTP2_HEADER_SCHEME] = "https";
		const expectsPayload = method === "PUT" || method === "POST" || method === "PATCH";
		if (body && typeof body.read === "function") body.read(0);
		let contentLength = util.bodyLength(body);
		if (util.isFormDataLike(body)) {
			extractBody ??= require_body().extractBody;
			const [bodyStream, contentType] = extractBody(body);
			headers["content-type"] = contentType;
			body = bodyStream.stream;
			contentLength = bodyStream.length;
		}
		if (contentLength == null) contentLength = request.contentLength;
		if (contentLength === 0 || !expectsPayload) contentLength = null;
		if (shouldSendContentLength(method) && contentLength > 0 && request.contentLength != null && request.contentLength !== contentLength) {
			if (client[kStrictContentLength]) {
				util.errorRequest(client, request, new RequestContentLengthMismatchError());
				return false;
			}
			process.emitWarning(new RequestContentLengthMismatchError());
		}
		if (contentLength != null) {
			assert$19(body, "no body must not have content length");
			headers[HTTP2_HEADER_CONTENT_LENGTH] = `${contentLength}`;
		}
		session.ref();
		const shouldEndStream = method === "GET" || method === "HEAD" || body === null;
		if (expectContinue) {
			headers[HTTP2_HEADER_EXPECT] = "100-continue";
			stream = session.request(headers, {
				endStream: shouldEndStream,
				signal
			});
			stream.once("continue", writeBodyH2);
		} else {
			stream = session.request(headers, {
				endStream: shouldEndStream,
				signal
			});
			writeBodyH2();
		}
		++session[kOpenStreams];
		stream.once("response", (headers) => {
			const { [HTTP2_HEADER_STATUS]: statusCode, ...realHeaders } = headers;
			request.onResponseStarted();
			if (request.aborted) {
				const err = new RequestAbortedError();
				util.errorRequest(client, request, err);
				util.destroy(stream, err);
				return;
			}
			if (request.onHeaders(Number(statusCode), parseH2Headers(realHeaders), stream.resume.bind(stream), "") === false) stream.pause();
			stream.on("data", (chunk) => {
				if (request.onData(chunk) === false) stream.pause();
			});
		});
		stream.once("end", () => {
			if (stream.state?.state == null || stream.state.state < 6) request.onComplete([]);
			if (session[kOpenStreams] === 0) session.unref();
			abort(new InformationalError("HTTP/2: stream half-closed (remote)"));
			client[kQueue][client[kRunningIdx]++] = null;
			client[kPendingIdx] = client[kRunningIdx];
			client[kResume]();
		});
		stream.once("close", () => {
			session[kOpenStreams] -= 1;
			if (session[kOpenStreams] === 0) session.unref();
		});
		stream.once("error", function(err) {
			abort(err);
		});
		stream.once("frameError", (type, code) => {
			abort(new InformationalError(`HTTP/2: "frameError" received - type ${type}, code ${code}`));
		});
		return true;
		function writeBodyH2() {
			/* istanbul ignore else: assertion */
			if (!body || contentLength === 0) writeBuffer(abort, stream, null, client, request, client[kSocket], contentLength, expectsPayload);
			else if (util.isBuffer(body)) writeBuffer(abort, stream, body, client, request, client[kSocket], contentLength, expectsPayload);
			else if (util.isBlobLike(body)) if (typeof body.stream === "function") writeIterable(abort, stream, body.stream(), client, request, client[kSocket], contentLength, expectsPayload);
			else writeBlob(abort, stream, body, client, request, client[kSocket], contentLength, expectsPayload);
			else if (util.isStream(body)) writeStream(abort, client[kSocket], expectsPayload, stream, body, client, request, contentLength);
			else if (util.isIterable(body)) writeIterable(abort, stream, body, client, request, client[kSocket], contentLength, expectsPayload);
			else assert$19(false);
		}
	}
	function writeBuffer(abort, h2stream, body, client, request, socket, contentLength, expectsPayload) {
		try {
			if (body != null && util.isBuffer(body)) {
				assert$19(contentLength === body.byteLength, "buffer body must have content length");
				h2stream.cork();
				h2stream.write(body);
				h2stream.uncork();
				h2stream.end();
				request.onBodySent(body);
			}
			if (!expectsPayload) socket[kReset] = true;
			request.onRequestSent();
			client[kResume]();
		} catch (error) {
			abort(error);
		}
	}
	function writeStream(abort, socket, expectsPayload, h2stream, body, client, request, contentLength) {
		assert$19(contentLength !== 0 || client[kRunning] === 0, "stream body cannot be pipelined");
		const pipe = pipeline$2(body, h2stream, (err) => {
			if (err) {
				util.destroy(pipe, err);
				abort(err);
			} else {
				util.removeAllListeners(pipe);
				request.onRequestSent();
				if (!expectsPayload) socket[kReset] = true;
				client[kResume]();
			}
		});
		util.addListener(pipe, "data", onPipeData);
		function onPipeData(chunk) {
			request.onBodySent(chunk);
		}
	}
	async function writeBlob(abort, h2stream, body, client, request, socket, contentLength, expectsPayload) {
		assert$19(contentLength === body.size, "blob body must have content length");
		try {
			if (contentLength != null && contentLength !== body.size) throw new RequestContentLengthMismatchError();
			const buffer = Buffer.from(await body.arrayBuffer());
			h2stream.cork();
			h2stream.write(buffer);
			h2stream.uncork();
			h2stream.end();
			request.onBodySent(buffer);
			request.onRequestSent();
			if (!expectsPayload) socket[kReset] = true;
			client[kResume]();
		} catch (err) {
			abort(err);
		}
	}
	async function writeIterable(abort, h2stream, body, client, request, socket, contentLength, expectsPayload) {
		assert$19(contentLength !== 0 || client[kRunning] === 0, "iterator body cannot be pipelined");
		let callback = null;
		function onDrain() {
			if (callback) {
				const cb = callback;
				callback = null;
				cb();
			}
		}
		const waitForDrain = () => new Promise((resolve, reject) => {
			assert$19(callback === null);
			if (socket[kError]) reject(socket[kError]);
			else callback = resolve;
		});
		h2stream.on("close", onDrain).on("drain", onDrain);
		try {
			for await (const chunk of body) {
				if (socket[kError]) throw socket[kError];
				const res = h2stream.write(chunk);
				request.onBodySent(chunk);
				if (!res) await waitForDrain();
			}
			h2stream.end();
			request.onRequestSent();
			if (!expectsPayload) socket[kReset] = true;
			client[kResume]();
		} catch (err) {
			abort(err);
		} finally {
			h2stream.off("close", onDrain).off("drain", onDrain);
		}
	}
	module.exports = connectH2;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/handler/redirect-handler.js
var require_redirect_handler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const util = require_util$7();
	const { kBodyUsed } = require_symbols$4();
	const assert$18 = __require("node:assert");
	const { InvalidArgumentError } = require_errors();
	const EE$2 = __require("node:events");
	const redirectableStatusCodes = [
		300,
		301,
		302,
		303,
		307,
		308
	];
	const kBody = Symbol("body");
	var BodyAsyncIterable = class {
		constructor(body) {
			this[kBody] = body;
			this[kBodyUsed] = false;
		}
		async *[Symbol.asyncIterator]() {
			assert$18(!this[kBodyUsed], "disturbed");
			this[kBodyUsed] = true;
			yield* this[kBody];
		}
	};
	var RedirectHandler = class {
		constructor(dispatch, maxRedirections, opts, handler) {
			if (maxRedirections != null && (!Number.isInteger(maxRedirections) || maxRedirections < 0)) throw new InvalidArgumentError("maxRedirections must be a positive number");
			util.validateHandler(handler, opts.method, opts.upgrade);
			this.dispatch = dispatch;
			this.location = null;
			this.abort = null;
			this.opts = {
				...opts,
				maxRedirections: 0
			};
			this.maxRedirections = maxRedirections;
			this.handler = handler;
			this.history = [];
			this.redirectionLimitReached = false;
			if (util.isStream(this.opts.body)) {
				if (util.bodyLength(this.opts.body) === 0) this.opts.body.on("data", function() {
					assert$18(false);
				});
				if (typeof this.opts.body.readableDidRead !== "boolean") {
					this.opts.body[kBodyUsed] = false;
					EE$2.prototype.on.call(this.opts.body, "data", function() {
						this[kBodyUsed] = true;
					});
				}
			} else if (this.opts.body && typeof this.opts.body.pipeTo === "function") this.opts.body = new BodyAsyncIterable(this.opts.body);
			else if (this.opts.body && typeof this.opts.body !== "string" && !ArrayBuffer.isView(this.opts.body) && util.isIterable(this.opts.body)) this.opts.body = new BodyAsyncIterable(this.opts.body);
		}
		onConnect(abort) {
			this.abort = abort;
			this.handler.onConnect(abort, { history: this.history });
		}
		onUpgrade(statusCode, headers, socket) {
			this.handler.onUpgrade(statusCode, headers, socket);
		}
		onError(error) {
			this.handler.onError(error);
		}
		onHeaders(statusCode, headers, resume, statusText) {
			this.location = this.history.length >= this.maxRedirections || util.isDisturbed(this.opts.body) ? null : parseLocation(statusCode, headers);
			if (this.opts.throwOnMaxRedirect && this.history.length >= this.maxRedirections) {
				if (this.request) this.request.abort(/* @__PURE__ */ new Error("max redirects"));
				this.redirectionLimitReached = true;
				this.abort(/* @__PURE__ */ new Error("max redirects"));
				return;
			}
			if (this.opts.origin) this.history.push(new URL(this.opts.path, this.opts.origin));
			if (!this.location) return this.handler.onHeaders(statusCode, headers, resume, statusText);
			const { origin, pathname, search } = util.parseURL(new URL(this.location, this.opts.origin && new URL(this.opts.path, this.opts.origin)));
			const path = search ? `${pathname}${search}` : pathname;
			this.opts.headers = cleanRequestHeaders(this.opts.headers, statusCode === 303, this.opts.origin !== origin);
			this.opts.path = path;
			this.opts.origin = origin;
			this.opts.maxRedirections = 0;
			this.opts.query = null;
			if (statusCode === 303 && this.opts.method !== "HEAD") {
				this.opts.method = "GET";
				this.opts.body = null;
			}
		}
		onData(chunk) {
			if (this.location) {} else return this.handler.onData(chunk);
		}
		onComplete(trailers) {
			if (this.location) {
				this.location = null;
				this.abort = null;
				this.dispatch(this.opts, this);
			} else this.handler.onComplete(trailers);
		}
		onBodySent(chunk) {
			if (this.handler.onBodySent) this.handler.onBodySent(chunk);
		}
	};
	function parseLocation(statusCode, headers) {
		if (redirectableStatusCodes.indexOf(statusCode) === -1) return null;
		for (let i = 0; i < headers.length; i += 2) if (headers[i].length === 8 && util.headerNameToString(headers[i]) === "location") return headers[i + 1];
	}
	function shouldRemoveHeader(header, removeContent, unknownOrigin) {
		if (header.length === 4) return util.headerNameToString(header) === "host";
		if (removeContent && util.headerNameToString(header).startsWith("content-")) return true;
		if (unknownOrigin && (header.length === 13 || header.length === 6 || header.length === 19)) {
			const name = util.headerNameToString(header);
			return name === "authorization" || name === "cookie" || name === "proxy-authorization";
		}
		return false;
	}
	function cleanRequestHeaders(headers, removeContent, unknownOrigin) {
		const ret = [];
		if (Array.isArray(headers)) {
			for (let i = 0; i < headers.length; i += 2) if (!shouldRemoveHeader(headers[i], removeContent, unknownOrigin)) ret.push(headers[i], headers[i + 1]);
		} else if (headers && typeof headers === "object") {
			for (const key of Object.keys(headers)) if (!shouldRemoveHeader(key, removeContent, unknownOrigin)) ret.push(key, headers[key]);
		} else assert$18(headers == null, "headers must be an object or an array");
		return ret;
	}
	module.exports = RedirectHandler;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/interceptor/redirect-interceptor.js
var require_redirect_interceptor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const RedirectHandler = require_redirect_handler();
	function createRedirectInterceptor({ maxRedirections: defaultMaxRedirections }) {
		return (dispatch) => {
			return function Intercept(opts, handler) {
				const { maxRedirections = defaultMaxRedirections } = opts;
				if (!maxRedirections) return dispatch(opts, handler);
				const redirectHandler = new RedirectHandler(dispatch, maxRedirections, opts, handler);
				opts = {
					...opts,
					maxRedirections: 0
				};
				return dispatch(opts, redirectHandler);
			};
		};
	}
	module.exports = createRedirectInterceptor;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$17 = __require("node:assert");
	const net = __require("node:net");
	const http = __require("node:http");
	const util = require_util$7();
	const { channels } = require_diagnostics();
	const Request = require_request$1();
	const DispatcherBase = require_dispatcher_base();
	const { InvalidArgumentError, InformationalError, ClientDestroyedError } = require_errors();
	const buildConnector = require_connect();
	const { kUrl, kServerName, kClient, kBusy, kConnect, kResuming, kRunning, kPending, kSize, kQueue, kConnected, kConnecting, kNeedDrain, kKeepAliveDefaultTimeout, kHostHeader, kPendingIdx, kRunningIdx, kError, kPipelining, kKeepAliveTimeoutValue, kMaxHeadersSize, kKeepAliveMaxTimeout, kKeepAliveTimeoutThreshold, kHeadersTimeout, kBodyTimeout, kStrictContentLength, kConnector, kMaxRedirections, kMaxRequests, kCounter, kClose, kDestroy, kDispatch, kInterceptors, kLocalAddress, kMaxResponseSize, kOnError, kHTTPContext, kMaxConcurrentStreams, kResume } = require_symbols$4();
	const connectH1 = require_client_h1();
	const connectH2 = require_client_h2();
	let deprecatedInterceptorWarned = false;
	const kClosedResolve = Symbol("kClosedResolve");
	const noop = () => {};
	function getPipelining(client) {
		return client[kPipelining] ?? client[kHTTPContext]?.defaultPipelining ?? 1;
	}
	/**
	* @type {import('../../types/client.js').default}
	*/
	var Client = class extends DispatcherBase {
		/**
		*
		* @param {string|URL} url
		* @param {import('../../types/client.js').Client.Options} options
		*/
		constructor(url, { interceptors, maxHeaderSize, headersTimeout, socketTimeout, requestTimeout, connectTimeout, bodyTimeout, idleTimeout, keepAlive, keepAliveTimeout, maxKeepAliveTimeout, keepAliveMaxTimeout, keepAliveTimeoutThreshold, socketPath, pipelining, tls, strictContentLength, maxCachedSessions, maxRedirections, connect, maxRequestsPerClient, localAddress, maxResponseSize, autoSelectFamily, autoSelectFamilyAttemptTimeout, maxConcurrentStreams, allowH2 } = {}) {
			super();
			if (keepAlive !== void 0) throw new InvalidArgumentError("unsupported keepAlive, use pipelining=0 instead");
			if (socketTimeout !== void 0) throw new InvalidArgumentError("unsupported socketTimeout, use headersTimeout & bodyTimeout instead");
			if (requestTimeout !== void 0) throw new InvalidArgumentError("unsupported requestTimeout, use headersTimeout & bodyTimeout instead");
			if (idleTimeout !== void 0) throw new InvalidArgumentError("unsupported idleTimeout, use keepAliveTimeout instead");
			if (maxKeepAliveTimeout !== void 0) throw new InvalidArgumentError("unsupported maxKeepAliveTimeout, use keepAliveMaxTimeout instead");
			if (maxHeaderSize != null && !Number.isFinite(maxHeaderSize)) throw new InvalidArgumentError("invalid maxHeaderSize");
			if (socketPath != null && typeof socketPath !== "string") throw new InvalidArgumentError("invalid socketPath");
			if (connectTimeout != null && (!Number.isFinite(connectTimeout) || connectTimeout < 0)) throw new InvalidArgumentError("invalid connectTimeout");
			if (keepAliveTimeout != null && (!Number.isFinite(keepAliveTimeout) || keepAliveTimeout <= 0)) throw new InvalidArgumentError("invalid keepAliveTimeout");
			if (keepAliveMaxTimeout != null && (!Number.isFinite(keepAliveMaxTimeout) || keepAliveMaxTimeout <= 0)) throw new InvalidArgumentError("invalid keepAliveMaxTimeout");
			if (keepAliveTimeoutThreshold != null && !Number.isFinite(keepAliveTimeoutThreshold)) throw new InvalidArgumentError("invalid keepAliveTimeoutThreshold");
			if (headersTimeout != null && (!Number.isInteger(headersTimeout) || headersTimeout < 0)) throw new InvalidArgumentError("headersTimeout must be a positive integer or zero");
			if (bodyTimeout != null && (!Number.isInteger(bodyTimeout) || bodyTimeout < 0)) throw new InvalidArgumentError("bodyTimeout must be a positive integer or zero");
			if (connect != null && typeof connect !== "function" && typeof connect !== "object") throw new InvalidArgumentError("connect must be a function or an object");
			if (maxRedirections != null && (!Number.isInteger(maxRedirections) || maxRedirections < 0)) throw new InvalidArgumentError("maxRedirections must be a positive number");
			if (maxRequestsPerClient != null && (!Number.isInteger(maxRequestsPerClient) || maxRequestsPerClient < 0)) throw new InvalidArgumentError("maxRequestsPerClient must be a positive number");
			if (localAddress != null && (typeof localAddress !== "string" || net.isIP(localAddress) === 0)) throw new InvalidArgumentError("localAddress must be valid string IP address");
			if (maxResponseSize != null && (!Number.isInteger(maxResponseSize) || maxResponseSize < -1)) throw new InvalidArgumentError("maxResponseSize must be a positive number");
			if (autoSelectFamilyAttemptTimeout != null && (!Number.isInteger(autoSelectFamilyAttemptTimeout) || autoSelectFamilyAttemptTimeout < -1)) throw new InvalidArgumentError("autoSelectFamilyAttemptTimeout must be a positive number");
			if (allowH2 != null && typeof allowH2 !== "boolean") throw new InvalidArgumentError("allowH2 must be a valid boolean value");
			if (maxConcurrentStreams != null && (typeof maxConcurrentStreams !== "number" || maxConcurrentStreams < 1)) throw new InvalidArgumentError("maxConcurrentStreams must be a positive integer, greater than 0");
			if (typeof connect !== "function") connect = buildConnector({
				...tls,
				maxCachedSessions,
				allowH2,
				socketPath,
				timeout: connectTimeout,
				...autoSelectFamily ? {
					autoSelectFamily,
					autoSelectFamilyAttemptTimeout
				} : void 0,
				...connect
			});
			if (interceptors?.Client && Array.isArray(interceptors.Client)) {
				this[kInterceptors] = interceptors.Client;
				if (!deprecatedInterceptorWarned) {
					deprecatedInterceptorWarned = true;
					process.emitWarning("Client.Options#interceptor is deprecated. Use Dispatcher#compose instead.", { code: "UNDICI-CLIENT-INTERCEPTOR-DEPRECATED" });
				}
			} else this[kInterceptors] = [createRedirectInterceptor({ maxRedirections })];
			this[kUrl] = util.parseOrigin(url);
			this[kConnector] = connect;
			this[kPipelining] = pipelining != null ? pipelining : 1;
			this[kMaxHeadersSize] = maxHeaderSize || http.maxHeaderSize;
			this[kKeepAliveDefaultTimeout] = keepAliveTimeout == null ? 4e3 : keepAliveTimeout;
			this[kKeepAliveMaxTimeout] = keepAliveMaxTimeout == null ? 6e5 : keepAliveMaxTimeout;
			this[kKeepAliveTimeoutThreshold] = keepAliveTimeoutThreshold == null ? 2e3 : keepAliveTimeoutThreshold;
			this[kKeepAliveTimeoutValue] = this[kKeepAliveDefaultTimeout];
			this[kServerName] = null;
			this[kLocalAddress] = localAddress != null ? localAddress : null;
			this[kResuming] = 0;
			this[kNeedDrain] = 0;
			this[kHostHeader] = `host: ${this[kUrl].hostname}${this[kUrl].port ? `:${this[kUrl].port}` : ""}\r\n`;
			this[kBodyTimeout] = bodyTimeout != null ? bodyTimeout : 3e5;
			this[kHeadersTimeout] = headersTimeout != null ? headersTimeout : 3e5;
			this[kStrictContentLength] = strictContentLength == null ? true : strictContentLength;
			this[kMaxRedirections] = maxRedirections;
			this[kMaxRequests] = maxRequestsPerClient;
			this[kClosedResolve] = null;
			this[kMaxResponseSize] = maxResponseSize > -1 ? maxResponseSize : -1;
			this[kMaxConcurrentStreams] = maxConcurrentStreams != null ? maxConcurrentStreams : 100;
			this[kHTTPContext] = null;
			this[kQueue] = [];
			this[kRunningIdx] = 0;
			this[kPendingIdx] = 0;
			this[kResume] = (sync) => resume(this, sync);
			this[kOnError] = (err) => onError(this, err);
		}
		get pipelining() {
			return this[kPipelining];
		}
		set pipelining(value) {
			this[kPipelining] = value;
			this[kResume](true);
		}
		get [kPending]() {
			return this[kQueue].length - this[kPendingIdx];
		}
		get [kRunning]() {
			return this[kPendingIdx] - this[kRunningIdx];
		}
		get [kSize]() {
			return this[kQueue].length - this[kRunningIdx];
		}
		get [kConnected]() {
			return !!this[kHTTPContext] && !this[kConnecting] && !this[kHTTPContext].destroyed;
		}
		get [kBusy]() {
			return Boolean(this[kHTTPContext]?.busy(null) || this[kSize] >= (getPipelining(this) || 1) || this[kPending] > 0);
		}
		/* istanbul ignore: only used for test */
		[kConnect](cb) {
			connect(this);
			this.once("connect", cb);
		}
		[kDispatch](opts, handler) {
			const request = new Request(opts.origin || this[kUrl].origin, opts, handler);
			this[kQueue].push(request);
			if (this[kResuming]) {} else if (util.bodyLength(request.body) == null && util.isIterable(request.body)) {
				this[kResuming] = 1;
				queueMicrotask(() => resume(this));
			} else this[kResume](true);
			if (this[kResuming] && this[kNeedDrain] !== 2 && this[kBusy]) this[kNeedDrain] = 2;
			return this[kNeedDrain] < 2;
		}
		async [kClose]() {
			return new Promise((resolve) => {
				if (this[kSize]) this[kClosedResolve] = resolve;
				else resolve(null);
			});
		}
		async [kDestroy](err) {
			return new Promise((resolve) => {
				const requests = this[kQueue].splice(this[kPendingIdx]);
				for (let i = 0; i < requests.length; i++) {
					const request = requests[i];
					util.errorRequest(this, request, err);
				}
				const callback = () => {
					if (this[kClosedResolve]) {
						this[kClosedResolve]();
						this[kClosedResolve] = null;
					}
					resolve(null);
				};
				if (this[kHTTPContext]) {
					this[kHTTPContext].destroy(err, callback);
					this[kHTTPContext] = null;
				} else queueMicrotask(callback);
				this[kResume]();
			});
		}
	};
	const createRedirectInterceptor = require_redirect_interceptor();
	function onError(client, err) {
		if (client[kRunning] === 0 && err.code !== "UND_ERR_INFO" && err.code !== "UND_ERR_SOCKET") {
			assert$17(client[kPendingIdx] === client[kRunningIdx]);
			const requests = client[kQueue].splice(client[kRunningIdx]);
			for (let i = 0; i < requests.length; i++) {
				const request = requests[i];
				util.errorRequest(client, request, err);
			}
			assert$17(client[kSize] === 0);
		}
	}
	/**
	* @param {Client} client
	* @returns
	*/
	async function connect(client) {
		assert$17(!client[kConnecting]);
		assert$17(!client[kHTTPContext]);
		let { host, hostname, protocol, port } = client[kUrl];
		if (hostname[0] === "[") {
			const idx = hostname.indexOf("]");
			assert$17(idx !== -1);
			const ip = hostname.substring(1, idx);
			assert$17(net.isIP(ip));
			hostname = ip;
		}
		client[kConnecting] = true;
		if (channels.beforeConnect.hasSubscribers) channels.beforeConnect.publish({
			connectParams: {
				host,
				hostname,
				protocol,
				port,
				version: client[kHTTPContext]?.version,
				servername: client[kServerName],
				localAddress: client[kLocalAddress]
			},
			connector: client[kConnector]
		});
		try {
			const socket = await new Promise((resolve, reject) => {
				client[kConnector]({
					host,
					hostname,
					protocol,
					port,
					servername: client[kServerName],
					localAddress: client[kLocalAddress]
				}, (err, socket) => {
					if (err) reject(err);
					else resolve(socket);
				});
			});
			if (client.destroyed) {
				util.destroy(socket.on("error", noop), new ClientDestroyedError());
				return;
			}
			assert$17(socket);
			try {
				client[kHTTPContext] = socket.alpnProtocol === "h2" ? await connectH2(client, socket) : await connectH1(client, socket);
			} catch (err) {
				socket.destroy().on("error", noop);
				throw err;
			}
			client[kConnecting] = false;
			socket[kCounter] = 0;
			socket[kMaxRequests] = client[kMaxRequests];
			socket[kClient] = client;
			socket[kError] = null;
			if (channels.connected.hasSubscribers) channels.connected.publish({
				connectParams: {
					host,
					hostname,
					protocol,
					port,
					version: client[kHTTPContext]?.version,
					servername: client[kServerName],
					localAddress: client[kLocalAddress]
				},
				connector: client[kConnector],
				socket
			});
			client.emit("connect", client[kUrl], [client]);
		} catch (err) {
			if (client.destroyed) return;
			client[kConnecting] = false;
			if (channels.connectError.hasSubscribers) channels.connectError.publish({
				connectParams: {
					host,
					hostname,
					protocol,
					port,
					version: client[kHTTPContext]?.version,
					servername: client[kServerName],
					localAddress: client[kLocalAddress]
				},
				connector: client[kConnector],
				error: err
			});
			if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
				assert$17(client[kRunning] === 0);
				while (client[kPending] > 0 && client[kQueue][client[kPendingIdx]].servername === client[kServerName]) {
					const request = client[kQueue][client[kPendingIdx]++];
					util.errorRequest(client, request, err);
				}
			} else onError(client, err);
			client.emit("connectionError", client[kUrl], [client], err);
		}
		client[kResume]();
	}
	function emitDrain(client) {
		client[kNeedDrain] = 0;
		client.emit("drain", client[kUrl], [client]);
	}
	function resume(client, sync) {
		if (client[kResuming] === 2) return;
		client[kResuming] = 2;
		_resume(client, sync);
		client[kResuming] = 0;
		if (client[kRunningIdx] > 256) {
			client[kQueue].splice(0, client[kRunningIdx]);
			client[kPendingIdx] -= client[kRunningIdx];
			client[kRunningIdx] = 0;
		}
	}
	function _resume(client, sync) {
		while (true) {
			if (client.destroyed) {
				assert$17(client[kPending] === 0);
				return;
			}
			if (client[kClosedResolve] && !client[kSize]) {
				client[kClosedResolve]();
				client[kClosedResolve] = null;
				return;
			}
			if (client[kHTTPContext]) client[kHTTPContext].resume();
			if (client[kBusy]) client[kNeedDrain] = 2;
			else if (client[kNeedDrain] === 2) {
				if (sync) {
					client[kNeedDrain] = 1;
					queueMicrotask(() => emitDrain(client));
				} else emitDrain(client);
				continue;
			}
			if (client[kPending] === 0) return;
			if (client[kRunning] >= (getPipelining(client) || 1)) return;
			const request = client[kQueue][client[kPendingIdx]];
			if (client[kUrl].protocol === "https:" && client[kServerName] !== request.servername) {
				if (client[kRunning] > 0) return;
				client[kServerName] = request.servername;
				client[kHTTPContext]?.destroy(new InformationalError("servername changed"), () => {
					client[kHTTPContext] = null;
					resume(client);
				});
			}
			if (client[kConnecting]) return;
			if (!client[kHTTPContext]) {
				connect(client);
				return;
			}
			if (client[kHTTPContext].destroyed) return;
			if (client[kHTTPContext].busy(request)) return;
			if (!request.aborted && client[kHTTPContext].write(request)) client[kPendingIdx]++;
			else client[kQueue].splice(client[kPendingIdx], 1);
		}
	}
	module.exports = Client;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/fixed-queue.js
var require_fixed_queue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const kSize = 2048;
	const kMask = kSize - 1;
	var FixedCircularBuffer = class {
		constructor() {
			this.bottom = 0;
			this.top = 0;
			this.list = new Array(kSize);
			this.next = null;
		}
		isEmpty() {
			return this.top === this.bottom;
		}
		isFull() {
			return (this.top + 1 & kMask) === this.bottom;
		}
		push(data) {
			this.list[this.top] = data;
			this.top = this.top + 1 & kMask;
		}
		shift() {
			const nextItem = this.list[this.bottom];
			if (nextItem === void 0) return null;
			this.list[this.bottom] = void 0;
			this.bottom = this.bottom + 1 & kMask;
			return nextItem;
		}
	};
	module.exports = class FixedQueue {
		constructor() {
			this.head = this.tail = new FixedCircularBuffer();
		}
		isEmpty() {
			return this.head.isEmpty();
		}
		push(data) {
			if (this.head.isFull()) this.head = this.head.next = new FixedCircularBuffer();
			this.head.push(data);
		}
		shift() {
			const tail = this.tail;
			const next = tail.shift();
			if (tail.isEmpty() && tail.next !== null) this.tail = tail.next;
			return next;
		}
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/pool-stats.js
var require_pool_stats = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kFree, kConnected, kPending, kQueued, kRunning, kSize } = require_symbols$4();
	const kPool = Symbol("pool");
	var PoolStats = class {
		constructor(pool) {
			this[kPool] = pool;
		}
		get connected() {
			return this[kPool][kConnected];
		}
		get free() {
			return this[kPool][kFree];
		}
		get pending() {
			return this[kPool][kPending];
		}
		get queued() {
			return this[kPool][kQueued];
		}
		get running() {
			return this[kPool][kRunning];
		}
		get size() {
			return this[kPool][kSize];
		}
	};
	module.exports = PoolStats;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/pool-base.js
var require_pool_base = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const DispatcherBase = require_dispatcher_base();
	const FixedQueue = require_fixed_queue();
	const { kConnected, kSize, kRunning, kPending, kQueued, kBusy, kFree, kUrl, kClose, kDestroy, kDispatch } = require_symbols$4();
	const PoolStats = require_pool_stats();
	const kClients = Symbol("clients");
	const kNeedDrain = Symbol("needDrain");
	const kQueue = Symbol("queue");
	const kClosedResolve = Symbol("closed resolve");
	const kOnDrain = Symbol("onDrain");
	const kOnConnect = Symbol("onConnect");
	const kOnDisconnect = Symbol("onDisconnect");
	const kOnConnectionError = Symbol("onConnectionError");
	const kGetDispatcher = Symbol("get dispatcher");
	const kAddClient = Symbol("add client");
	const kRemoveClient = Symbol("remove client");
	const kStats = Symbol("stats");
	var PoolBase = class extends DispatcherBase {
		constructor() {
			super();
			this[kQueue] = new FixedQueue();
			this[kClients] = [];
			this[kQueued] = 0;
			const pool = this;
			this[kOnDrain] = function onDrain(origin, targets) {
				const queue = pool[kQueue];
				let needDrain = false;
				while (!needDrain) {
					const item = queue.shift();
					if (!item) break;
					pool[kQueued]--;
					needDrain = !this.dispatch(item.opts, item.handler);
				}
				this[kNeedDrain] = needDrain;
				if (!this[kNeedDrain] && pool[kNeedDrain]) {
					pool[kNeedDrain] = false;
					pool.emit("drain", origin, [pool, ...targets]);
				}
				if (pool[kClosedResolve] && queue.isEmpty()) Promise.all(pool[kClients].map((c) => c.close())).then(pool[kClosedResolve]);
			};
			this[kOnConnect] = (origin, targets) => {
				pool.emit("connect", origin, [pool, ...targets]);
			};
			this[kOnDisconnect] = (origin, targets, err) => {
				pool.emit("disconnect", origin, [pool, ...targets], err);
			};
			this[kOnConnectionError] = (origin, targets, err) => {
				pool.emit("connectionError", origin, [pool, ...targets], err);
			};
			this[kStats] = new PoolStats(this);
		}
		get [kBusy]() {
			return this[kNeedDrain];
		}
		get [kConnected]() {
			return this[kClients].filter((client) => client[kConnected]).length;
		}
		get [kFree]() {
			return this[kClients].filter((client) => client[kConnected] && !client[kNeedDrain]).length;
		}
		get [kPending]() {
			let ret = this[kQueued];
			for (const { [kPending]: pending } of this[kClients]) ret += pending;
			return ret;
		}
		get [kRunning]() {
			let ret = 0;
			for (const { [kRunning]: running } of this[kClients]) ret += running;
			return ret;
		}
		get [kSize]() {
			let ret = this[kQueued];
			for (const { [kSize]: size } of this[kClients]) ret += size;
			return ret;
		}
		get stats() {
			return this[kStats];
		}
		async [kClose]() {
			if (this[kQueue].isEmpty()) await Promise.all(this[kClients].map((c) => c.close()));
			else await new Promise((resolve) => {
				this[kClosedResolve] = resolve;
			});
		}
		async [kDestroy](err) {
			while (true) {
				const item = this[kQueue].shift();
				if (!item) break;
				item.handler.onError(err);
			}
			await Promise.all(this[kClients].map((c) => c.destroy(err)));
		}
		[kDispatch](opts, handler) {
			const dispatcher = this[kGetDispatcher]();
			if (!dispatcher) {
				this[kNeedDrain] = true;
				this[kQueue].push({
					opts,
					handler
				});
				this[kQueued]++;
			} else if (!dispatcher.dispatch(opts, handler)) {
				dispatcher[kNeedDrain] = true;
				this[kNeedDrain] = !this[kGetDispatcher]();
			}
			return !this[kNeedDrain];
		}
		[kAddClient](client) {
			client.on("drain", this[kOnDrain]).on("connect", this[kOnConnect]).on("disconnect", this[kOnDisconnect]).on("connectionError", this[kOnConnectionError]);
			this[kClients].push(client);
			if (this[kNeedDrain]) queueMicrotask(() => {
				if (this[kNeedDrain]) this[kOnDrain](client[kUrl], [this, client]);
			});
			return this;
		}
		[kRemoveClient](client) {
			client.close(() => {
				const idx = this[kClients].indexOf(client);
				if (idx !== -1) this[kClients].splice(idx, 1);
			});
			this[kNeedDrain] = this[kClients].some((dispatcher) => !dispatcher[kNeedDrain] && dispatcher.closed !== true && dispatcher.destroyed !== true);
		}
	};
	module.exports = {
		PoolBase,
		kClients,
		kNeedDrain,
		kAddClient,
		kRemoveClient,
		kGetDispatcher
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/pool.js
var require_pool = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { PoolBase, kClients, kNeedDrain, kAddClient, kGetDispatcher } = require_pool_base();
	const Client = require_client();
	const { InvalidArgumentError } = require_errors();
	const util = require_util$7();
	const { kUrl, kInterceptors } = require_symbols$4();
	const buildConnector = require_connect();
	const kOptions = Symbol("options");
	const kConnections = Symbol("connections");
	const kFactory = Symbol("factory");
	function defaultFactory(origin, opts) {
		return new Client(origin, opts);
	}
	var Pool = class extends PoolBase {
		constructor(origin, { connections, factory = defaultFactory, connect, connectTimeout, tls, maxCachedSessions, socketPath, autoSelectFamily, autoSelectFamilyAttemptTimeout, allowH2, ...options } = {}) {
			super();
			if (connections != null && (!Number.isFinite(connections) || connections < 0)) throw new InvalidArgumentError("invalid connections");
			if (typeof factory !== "function") throw new InvalidArgumentError("factory must be a function.");
			if (connect != null && typeof connect !== "function" && typeof connect !== "object") throw new InvalidArgumentError("connect must be a function or an object");
			if (typeof connect !== "function") connect = buildConnector({
				...tls,
				maxCachedSessions,
				allowH2,
				socketPath,
				timeout: connectTimeout,
				...autoSelectFamily ? {
					autoSelectFamily,
					autoSelectFamilyAttemptTimeout
				} : void 0,
				...connect
			});
			this[kInterceptors] = options.interceptors?.Pool && Array.isArray(options.interceptors.Pool) ? options.interceptors.Pool : [];
			this[kConnections] = connections || null;
			this[kUrl] = util.parseOrigin(origin);
			this[kOptions] = {
				...util.deepClone(options),
				connect,
				allowH2
			};
			this[kOptions].interceptors = options.interceptors ? { ...options.interceptors } : void 0;
			this[kFactory] = factory;
			this.on("connectionError", (origin, targets, error) => {
				for (const target of targets) {
					const idx = this[kClients].indexOf(target);
					if (idx !== -1) this[kClients].splice(idx, 1);
				}
			});
		}
		[kGetDispatcher]() {
			for (const client of this[kClients]) if (!client[kNeedDrain]) return client;
			if (!this[kConnections] || this[kClients].length < this[kConnections]) {
				const dispatcher = this[kFactory](this[kUrl], this[kOptions]);
				this[kAddClient](dispatcher);
				return dispatcher;
			}
		}
	};
	module.exports = Pool;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/balanced-pool.js
var require_balanced_pool = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { BalancedPoolMissingUpstreamError, InvalidArgumentError } = require_errors();
	const { PoolBase, kClients, kNeedDrain, kAddClient, kRemoveClient, kGetDispatcher } = require_pool_base();
	const Pool = require_pool();
	const { kUrl, kInterceptors } = require_symbols$4();
	const { parseOrigin } = require_util$7();
	const kFactory = Symbol("factory");
	const kOptions = Symbol("options");
	const kGreatestCommonDivisor = Symbol("kGreatestCommonDivisor");
	const kCurrentWeight = Symbol("kCurrentWeight");
	const kIndex = Symbol("kIndex");
	const kWeight = Symbol("kWeight");
	const kMaxWeightPerServer = Symbol("kMaxWeightPerServer");
	const kErrorPenalty = Symbol("kErrorPenalty");
	/**
	* Calculate the greatest common divisor of two numbers by
	* using the Euclidean algorithm.
	*
	* @param {number} a
	* @param {number} b
	* @returns {number}
	*/
	function getGreatestCommonDivisor(a, b) {
		if (a === 0) return b;
		while (b !== 0) {
			const t = b;
			b = a % b;
			a = t;
		}
		return a;
	}
	function defaultFactory(origin, opts) {
		return new Pool(origin, opts);
	}
	var BalancedPool = class extends PoolBase {
		constructor(upstreams = [], { factory = defaultFactory, ...opts } = {}) {
			super();
			this[kOptions] = opts;
			this[kIndex] = -1;
			this[kCurrentWeight] = 0;
			this[kMaxWeightPerServer] = this[kOptions].maxWeightPerServer || 100;
			this[kErrorPenalty] = this[kOptions].errorPenalty || 15;
			if (!Array.isArray(upstreams)) upstreams = [upstreams];
			if (typeof factory !== "function") throw new InvalidArgumentError("factory must be a function.");
			this[kInterceptors] = opts.interceptors?.BalancedPool && Array.isArray(opts.interceptors.BalancedPool) ? opts.interceptors.BalancedPool : [];
			this[kFactory] = factory;
			for (const upstream of upstreams) this.addUpstream(upstream);
			this._updateBalancedPoolStats();
		}
		addUpstream(upstream) {
			const upstreamOrigin = parseOrigin(upstream).origin;
			if (this[kClients].find((pool) => pool[kUrl].origin === upstreamOrigin && pool.closed !== true && pool.destroyed !== true)) return this;
			const pool = this[kFactory](upstreamOrigin, Object.assign({}, this[kOptions]));
			this[kAddClient](pool);
			pool.on("connect", () => {
				pool[kWeight] = Math.min(this[kMaxWeightPerServer], pool[kWeight] + this[kErrorPenalty]);
			});
			pool.on("connectionError", () => {
				pool[kWeight] = Math.max(1, pool[kWeight] - this[kErrorPenalty]);
				this._updateBalancedPoolStats();
			});
			pool.on("disconnect", (...args) => {
				const err = args[2];
				if (err && err.code === "UND_ERR_SOCKET") {
					pool[kWeight] = Math.max(1, pool[kWeight] - this[kErrorPenalty]);
					this._updateBalancedPoolStats();
				}
			});
			for (const client of this[kClients]) client[kWeight] = this[kMaxWeightPerServer];
			this._updateBalancedPoolStats();
			return this;
		}
		_updateBalancedPoolStats() {
			let result = 0;
			for (let i = 0; i < this[kClients].length; i++) result = getGreatestCommonDivisor(this[kClients][i][kWeight], result);
			this[kGreatestCommonDivisor] = result;
		}
		removeUpstream(upstream) {
			const upstreamOrigin = parseOrigin(upstream).origin;
			const pool = this[kClients].find((pool) => pool[kUrl].origin === upstreamOrigin && pool.closed !== true && pool.destroyed !== true);
			if (pool) this[kRemoveClient](pool);
			return this;
		}
		get upstreams() {
			return this[kClients].filter((dispatcher) => dispatcher.closed !== true && dispatcher.destroyed !== true).map((p) => p[kUrl].origin);
		}
		[kGetDispatcher]() {
			if (this[kClients].length === 0) throw new BalancedPoolMissingUpstreamError();
			if (!this[kClients].find((dispatcher) => !dispatcher[kNeedDrain] && dispatcher.closed !== true && dispatcher.destroyed !== true)) return;
			if (this[kClients].map((pool) => pool[kNeedDrain]).reduce((a, b) => a && b, true)) return;
			let counter = 0;
			let maxWeightIndex = this[kClients].findIndex((pool) => !pool[kNeedDrain]);
			while (counter++ < this[kClients].length) {
				this[kIndex] = (this[kIndex] + 1) % this[kClients].length;
				const pool = this[kClients][this[kIndex]];
				if (pool[kWeight] > this[kClients][maxWeightIndex][kWeight] && !pool[kNeedDrain]) maxWeightIndex = this[kIndex];
				if (this[kIndex] === 0) {
					this[kCurrentWeight] = this[kCurrentWeight] - this[kGreatestCommonDivisor];
					if (this[kCurrentWeight] <= 0) this[kCurrentWeight] = this[kMaxWeightPerServer];
				}
				if (pool[kWeight] >= this[kCurrentWeight] && !pool[kNeedDrain]) return pool;
			}
			this[kCurrentWeight] = this[kClients][maxWeightIndex][kWeight];
			this[kIndex] = maxWeightIndex;
			return this[kClients][maxWeightIndex];
		}
	};
	module.exports = BalancedPool;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/agent.js
var require_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { InvalidArgumentError } = require_errors();
	const { kClients, kRunning, kClose, kDestroy, kDispatch, kInterceptors } = require_symbols$4();
	const DispatcherBase = require_dispatcher_base();
	const Pool = require_pool();
	const Client = require_client();
	const util = require_util$7();
	const createRedirectInterceptor = require_redirect_interceptor();
	const kOnConnect = Symbol("onConnect");
	const kOnDisconnect = Symbol("onDisconnect");
	const kOnConnectionError = Symbol("onConnectionError");
	const kMaxRedirections = Symbol("maxRedirections");
	const kOnDrain = Symbol("onDrain");
	const kFactory = Symbol("factory");
	const kOptions = Symbol("options");
	function defaultFactory(origin, opts) {
		return opts && opts.connections === 1 ? new Client(origin, opts) : new Pool(origin, opts);
	}
	var Agent = class extends DispatcherBase {
		constructor({ factory = defaultFactory, maxRedirections = 0, connect, ...options } = {}) {
			super();
			if (typeof factory !== "function") throw new InvalidArgumentError("factory must be a function.");
			if (connect != null && typeof connect !== "function" && typeof connect !== "object") throw new InvalidArgumentError("connect must be a function or an object");
			if (!Number.isInteger(maxRedirections) || maxRedirections < 0) throw new InvalidArgumentError("maxRedirections must be a positive number");
			if (connect && typeof connect !== "function") connect = { ...connect };
			this[kInterceptors] = options.interceptors?.Agent && Array.isArray(options.interceptors.Agent) ? options.interceptors.Agent : [createRedirectInterceptor({ maxRedirections })];
			this[kOptions] = {
				...util.deepClone(options),
				connect
			};
			this[kOptions].interceptors = options.interceptors ? { ...options.interceptors } : void 0;
			this[kMaxRedirections] = maxRedirections;
			this[kFactory] = factory;
			this[kClients] = /* @__PURE__ */ new Map();
			this[kOnDrain] = (origin, targets) => {
				this.emit("drain", origin, [this, ...targets]);
			};
			this[kOnConnect] = (origin, targets) => {
				this.emit("connect", origin, [this, ...targets]);
			};
			this[kOnDisconnect] = (origin, targets, err) => {
				this.emit("disconnect", origin, [this, ...targets], err);
			};
			this[kOnConnectionError] = (origin, targets, err) => {
				this.emit("connectionError", origin, [this, ...targets], err);
			};
		}
		get [kRunning]() {
			let ret = 0;
			for (const client of this[kClients].values()) ret += client[kRunning];
			return ret;
		}
		[kDispatch](opts, handler) {
			let key;
			if (opts.origin && (typeof opts.origin === "string" || opts.origin instanceof URL)) key = String(opts.origin);
			else throw new InvalidArgumentError("opts.origin must be a non-empty string or URL.");
			let dispatcher = this[kClients].get(key);
			if (!dispatcher) {
				dispatcher = this[kFactory](opts.origin, this[kOptions]).on("drain", this[kOnDrain]).on("connect", this[kOnConnect]).on("disconnect", this[kOnDisconnect]).on("connectionError", this[kOnConnectionError]);
				this[kClients].set(key, dispatcher);
			}
			return dispatcher.dispatch(opts, handler);
		}
		async [kClose]() {
			const closePromises = [];
			for (const client of this[kClients].values()) closePromises.push(client.close());
			this[kClients].clear();
			await Promise.all(closePromises);
		}
		async [kDestroy](err) {
			const destroyPromises = [];
			for (const client of this[kClients].values()) destroyPromises.push(client.destroy(err));
			this[kClients].clear();
			await Promise.all(destroyPromises);
		}
	};
	module.exports = Agent;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/proxy-agent.js
var require_proxy_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kProxy, kClose, kDestroy, kDispatch, kInterceptors } = require_symbols$4();
	const { URL: URL$1 } = __require("node:url");
	const Agent = require_agent();
	const Pool = require_pool();
	const DispatcherBase = require_dispatcher_base();
	const { InvalidArgumentError, RequestAbortedError, SecureProxyConnectionError } = require_errors();
	const buildConnector = require_connect();
	const Client = require_client();
	const kAgent = Symbol("proxy agent");
	const kClient = Symbol("proxy client");
	const kProxyHeaders = Symbol("proxy headers");
	const kRequestTls = Symbol("request tls settings");
	const kProxyTls = Symbol("proxy tls settings");
	const kConnectEndpoint = Symbol("connect endpoint function");
	const kTunnelProxy = Symbol("tunnel proxy");
	function defaultProtocolPort(protocol) {
		return protocol === "https:" ? 443 : 80;
	}
	function defaultFactory(origin, opts) {
		return new Pool(origin, opts);
	}
	const noop = () => {};
	function defaultAgentFactory(origin, opts) {
		if (opts.connections === 1) return new Client(origin, opts);
		return new Pool(origin, opts);
	}
	var Http1ProxyWrapper = class extends DispatcherBase {
		#client;
		constructor(proxyUrl, { headers = {}, connect, factory }) {
			super();
			if (!proxyUrl) throw new InvalidArgumentError("Proxy URL is mandatory");
			this[kProxyHeaders] = headers;
			if (factory) this.#client = factory(proxyUrl, { connect });
			else this.#client = new Client(proxyUrl, { connect });
		}
		[kDispatch](opts, handler) {
			const onHeaders = handler.onHeaders;
			handler.onHeaders = function(statusCode, data, resume) {
				if (statusCode === 407) {
					if (typeof handler.onError === "function") handler.onError(new InvalidArgumentError("Proxy Authentication Required (407)"));
					return;
				}
				if (onHeaders) onHeaders.call(this, statusCode, data, resume);
			};
			const { origin, path = "/", headers = {} } = opts;
			opts.path = origin + path;
			if (!("host" in headers) && !("Host" in headers)) {
				const { host } = new URL$1(origin);
				headers.host = host;
			}
			opts.headers = {
				...this[kProxyHeaders],
				...headers
			};
			return this.#client[kDispatch](opts, handler);
		}
		async [kClose]() {
			return this.#client.close();
		}
		async [kDestroy](err) {
			return this.#client.destroy(err);
		}
	};
	var ProxyAgent = class extends DispatcherBase {
		constructor(opts) {
			super();
			if (!opts || typeof opts === "object" && !(opts instanceof URL$1) && !opts.uri) throw new InvalidArgumentError("Proxy uri is mandatory");
			const { clientFactory = defaultFactory } = opts;
			if (typeof clientFactory !== "function") throw new InvalidArgumentError("Proxy opts.clientFactory must be a function.");
			const { proxyTunnel = true } = opts;
			const url = this.#getUrl(opts);
			const { href, origin, port, protocol, username, password, hostname: proxyHostname } = url;
			this[kProxy] = {
				uri: href,
				protocol
			};
			this[kInterceptors] = opts.interceptors?.ProxyAgent && Array.isArray(opts.interceptors.ProxyAgent) ? opts.interceptors.ProxyAgent : [];
			this[kRequestTls] = opts.requestTls;
			this[kProxyTls] = opts.proxyTls;
			this[kProxyHeaders] = opts.headers || {};
			this[kTunnelProxy] = proxyTunnel;
			if (opts.auth && opts.token) throw new InvalidArgumentError("opts.auth cannot be used in combination with opts.token");
			else if (opts.auth) this[kProxyHeaders]["proxy-authorization"] = `Basic ${opts.auth}`;
			else if (opts.token) this[kProxyHeaders]["proxy-authorization"] = opts.token;
			else if (username && password) this[kProxyHeaders]["proxy-authorization"] = `Basic ${Buffer.from(`${decodeURIComponent(username)}:${decodeURIComponent(password)}`).toString("base64")}`;
			const connect = buildConnector({ ...opts.proxyTls });
			this[kConnectEndpoint] = buildConnector({ ...opts.requestTls });
			const agentFactory = opts.factory || defaultAgentFactory;
			const factory = (origin, options) => {
				const { protocol } = new URL$1(origin);
				if (!this[kTunnelProxy] && protocol === "http:" && this[kProxy].protocol === "http:") return new Http1ProxyWrapper(this[kProxy].uri, {
					headers: this[kProxyHeaders],
					connect,
					factory: agentFactory
				});
				return agentFactory(origin, options);
			};
			this[kClient] = clientFactory(url, { connect });
			this[kAgent] = new Agent({
				...opts,
				factory,
				connect: async (opts, callback) => {
					let requestedPath = opts.host;
					if (!opts.port) requestedPath += `:${defaultProtocolPort(opts.protocol)}`;
					try {
						const { socket, statusCode } = await this[kClient].connect({
							origin,
							port,
							path: requestedPath,
							signal: opts.signal,
							headers: {
								...this[kProxyHeaders],
								host: opts.host
							},
							servername: this[kProxyTls]?.servername || proxyHostname
						});
						if (statusCode !== 200) {
							socket.on("error", noop).destroy();
							callback(new RequestAbortedError(`Proxy response (${statusCode}) !== 200 when HTTP Tunneling`));
						}
						if (opts.protocol !== "https:") {
							callback(null, socket);
							return;
						}
						let servername;
						if (this[kRequestTls]) servername = this[kRequestTls].servername;
						else servername = opts.servername;
						this[kConnectEndpoint]({
							...opts,
							servername,
							httpSocket: socket
						}, callback);
					} catch (err) {
						if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") callback(new SecureProxyConnectionError(err));
						else callback(err);
					}
				}
			});
		}
		dispatch(opts, handler) {
			const headers = buildHeaders(opts.headers);
			throwIfProxyAuthIsSent(headers);
			if (headers && !("host" in headers) && !("Host" in headers)) {
				const { host } = new URL$1(opts.origin);
				headers.host = host;
			}
			return this[kAgent].dispatch({
				...opts,
				headers
			}, handler);
		}
		/**
		* @param {import('../types/proxy-agent').ProxyAgent.Options | string | URL} opts
		* @returns {URL}
		*/
		#getUrl(opts) {
			if (typeof opts === "string") return new URL$1(opts);
			else if (opts instanceof URL$1) return opts;
			else return new URL$1(opts.uri);
		}
		async [kClose]() {
			await this[kAgent].close();
			await this[kClient].close();
		}
		async [kDestroy]() {
			await this[kAgent].destroy();
			await this[kClient].destroy();
		}
	};
	/**
	* @param {string[] | Record<string, string>} headers
	* @returns {Record<string, string>}
	*/
	function buildHeaders(headers) {
		if (Array.isArray(headers)) {
			/** @type {Record<string, string>} */
			const headersPair = {};
			for (let i = 0; i < headers.length; i += 2) headersPair[headers[i]] = headers[i + 1];
			return headersPair;
		}
		return headers;
	}
	/**
	* @param {Record<string, string>} headers
	*
	* Previous versions of ProxyAgent suggests the Proxy-Authorization in request headers
	* Nevertheless, it was changed and to avoid a security vulnerability by end users
	* this check was created.
	* It should be removed in the next major version for performance reasons
	*/
	function throwIfProxyAuthIsSent(headers) {
		if (headers && Object.keys(headers).find((key) => key.toLowerCase() === "proxy-authorization")) throw new InvalidArgumentError("Proxy-Authorization should be sent in ProxyAgent constructor");
	}
	module.exports = ProxyAgent;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/env-http-proxy-agent.js
var require_env_http_proxy_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const DispatcherBase = require_dispatcher_base();
	const { kClose, kDestroy, kClosed, kDestroyed, kDispatch, kNoProxyAgent, kHttpProxyAgent, kHttpsProxyAgent } = require_symbols$4();
	const ProxyAgent = require_proxy_agent();
	const Agent = require_agent();
	const DEFAULT_PORTS = {
		"http:": 80,
		"https:": 443
	};
	let experimentalWarned = false;
	var EnvHttpProxyAgent = class extends DispatcherBase {
		#noProxyValue = null;
		#noProxyEntries = null;
		#opts = null;
		constructor(opts = {}) {
			super();
			this.#opts = opts;
			if (!experimentalWarned) {
				experimentalWarned = true;
				process.emitWarning("EnvHttpProxyAgent is experimental, expect them to change at any time.", { code: "UNDICI-EHPA" });
			}
			const { httpProxy, httpsProxy, noProxy, ...agentOpts } = opts;
			this[kNoProxyAgent] = new Agent(agentOpts);
			const HTTP_PROXY = httpProxy ?? process.env.http_proxy ?? process.env.HTTP_PROXY;
			if (HTTP_PROXY) this[kHttpProxyAgent] = new ProxyAgent({
				...agentOpts,
				uri: HTTP_PROXY
			});
			else this[kHttpProxyAgent] = this[kNoProxyAgent];
			const HTTPS_PROXY = httpsProxy ?? process.env.https_proxy ?? process.env.HTTPS_PROXY;
			if (HTTPS_PROXY) this[kHttpsProxyAgent] = new ProxyAgent({
				...agentOpts,
				uri: HTTPS_PROXY
			});
			else this[kHttpsProxyAgent] = this[kHttpProxyAgent];
			this.#parseNoProxy();
		}
		[kDispatch](opts, handler) {
			const url = new URL(opts.origin);
			return this.#getProxyAgentForUrl(url).dispatch(opts, handler);
		}
		async [kClose]() {
			await this[kNoProxyAgent].close();
			if (!this[kHttpProxyAgent][kClosed]) await this[kHttpProxyAgent].close();
			if (!this[kHttpsProxyAgent][kClosed]) await this[kHttpsProxyAgent].close();
		}
		async [kDestroy](err) {
			await this[kNoProxyAgent].destroy(err);
			if (!this[kHttpProxyAgent][kDestroyed]) await this[kHttpProxyAgent].destroy(err);
			if (!this[kHttpsProxyAgent][kDestroyed]) await this[kHttpsProxyAgent].destroy(err);
		}
		#getProxyAgentForUrl(url) {
			let { protocol, host: hostname, port } = url;
			hostname = hostname.replace(/:\d*$/, "").toLowerCase();
			port = Number.parseInt(port, 10) || DEFAULT_PORTS[protocol] || 0;
			if (!this.#shouldProxy(hostname, port)) return this[kNoProxyAgent];
			if (protocol === "https:") return this[kHttpsProxyAgent];
			return this[kHttpProxyAgent];
		}
		#shouldProxy(hostname, port) {
			if (this.#noProxyChanged) this.#parseNoProxy();
			if (this.#noProxyEntries.length === 0) return true;
			if (this.#noProxyValue === "*") return false;
			for (let i = 0; i < this.#noProxyEntries.length; i++) {
				const entry = this.#noProxyEntries[i];
				if (entry.port && entry.port !== port) continue;
				if (!/^[.*]/.test(entry.hostname)) {
					if (hostname === entry.hostname) return false;
				} else if (hostname.endsWith(entry.hostname.replace(/^\*/, ""))) return false;
			}
			return true;
		}
		#parseNoProxy() {
			const noProxyValue = this.#opts.noProxy ?? this.#noProxyEnv;
			const noProxySplit = noProxyValue.split(/[,\s]/);
			const noProxyEntries = [];
			for (let i = 0; i < noProxySplit.length; i++) {
				const entry = noProxySplit[i];
				if (!entry) continue;
				const parsed = entry.match(/^(.+):(\d+)$/);
				noProxyEntries.push({
					hostname: (parsed ? parsed[1] : entry).toLowerCase(),
					port: parsed ? Number.parseInt(parsed[2], 10) : 0
				});
			}
			this.#noProxyValue = noProxyValue;
			this.#noProxyEntries = noProxyEntries;
		}
		get #noProxyChanged() {
			if (this.#opts.noProxy !== void 0) return false;
			return this.#noProxyValue !== this.#noProxyEnv;
		}
		get #noProxyEnv() {
			return process.env.no_proxy ?? process.env.NO_PROXY ?? "";
		}
	};
	module.exports = EnvHttpProxyAgent;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/handler/retry-handler.js
var require_retry_handler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$16 = __require("node:assert");
	const { kRetryHandlerDefaultRetry } = require_symbols$4();
	const { RequestRetryError } = require_errors();
	const { isDisturbed, parseHeaders, parseRangeHeader, wrapRequestBody } = require_util$7();
	function calculateRetryAfterHeader(retryAfter) {
		const current = Date.now();
		return new Date(retryAfter).getTime() - current;
	}
	var RetryHandler = class RetryHandler {
		constructor(opts, handlers) {
			const { retryOptions, ...dispatchOpts } = opts;
			const { retry: retryFn, maxRetries, maxTimeout, minTimeout, timeoutFactor, methods, errorCodes, retryAfter, statusCodes } = retryOptions ?? {};
			this.dispatch = handlers.dispatch;
			this.handler = handlers.handler;
			this.opts = {
				...dispatchOpts,
				body: wrapRequestBody(opts.body)
			};
			this.abort = null;
			this.aborted = false;
			this.retryOpts = {
				retry: retryFn ?? RetryHandler[kRetryHandlerDefaultRetry],
				retryAfter: retryAfter ?? true,
				maxTimeout: maxTimeout ?? 30 * 1e3,
				minTimeout: minTimeout ?? 500,
				timeoutFactor: timeoutFactor ?? 2,
				maxRetries: maxRetries ?? 5,
				methods: methods ?? [
					"GET",
					"HEAD",
					"OPTIONS",
					"PUT",
					"DELETE",
					"TRACE"
				],
				statusCodes: statusCodes ?? [
					500,
					502,
					503,
					504,
					429
				],
				errorCodes: errorCodes ?? [
					"ECONNRESET",
					"ECONNREFUSED",
					"ENOTFOUND",
					"ENETDOWN",
					"ENETUNREACH",
					"EHOSTDOWN",
					"EHOSTUNREACH",
					"EPIPE",
					"UND_ERR_SOCKET"
				]
			};
			this.retryCount = 0;
			this.retryCountCheckpoint = 0;
			this.start = 0;
			this.end = null;
			this.etag = null;
			this.resume = null;
			this.handler.onConnect((reason) => {
				this.aborted = true;
				if (this.abort) this.abort(reason);
				else this.reason = reason;
			});
		}
		onRequestSent() {
			if (this.handler.onRequestSent) this.handler.onRequestSent();
		}
		onUpgrade(statusCode, headers, socket) {
			if (this.handler.onUpgrade) this.handler.onUpgrade(statusCode, headers, socket);
		}
		onConnect(abort) {
			if (this.aborted) abort(this.reason);
			else this.abort = abort;
		}
		onBodySent(chunk) {
			if (this.handler.onBodySent) return this.handler.onBodySent(chunk);
		}
		static [kRetryHandlerDefaultRetry](err, { state, opts }, cb) {
			const { statusCode, code, headers } = err;
			const { method, retryOptions } = opts;
			const { maxRetries, minTimeout, maxTimeout, timeoutFactor, statusCodes, errorCodes, methods } = retryOptions;
			const { counter } = state;
			if (code && code !== "UND_ERR_REQ_RETRY" && !errorCodes.includes(code)) {
				cb(err);
				return;
			}
			if (Array.isArray(methods) && !methods.includes(method)) {
				cb(err);
				return;
			}
			if (statusCode != null && Array.isArray(statusCodes) && !statusCodes.includes(statusCode)) {
				cb(err);
				return;
			}
			if (counter > maxRetries) {
				cb(err);
				return;
			}
			let retryAfterHeader = headers?.["retry-after"];
			if (retryAfterHeader) {
				retryAfterHeader = Number(retryAfterHeader);
				retryAfterHeader = Number.isNaN(retryAfterHeader) ? calculateRetryAfterHeader(retryAfterHeader) : retryAfterHeader * 1e3;
			}
			const retryTimeout = retryAfterHeader > 0 ? Math.min(retryAfterHeader, maxTimeout) : Math.min(minTimeout * timeoutFactor ** (counter - 1), maxTimeout);
			setTimeout(() => cb(null), retryTimeout);
		}
		onHeaders(statusCode, rawHeaders, resume, statusMessage) {
			const headers = parseHeaders(rawHeaders);
			this.retryCount += 1;
			if (statusCode >= 300) if (this.retryOpts.statusCodes.includes(statusCode) === false) return this.handler.onHeaders(statusCode, rawHeaders, resume, statusMessage);
			else {
				this.abort(new RequestRetryError("Request failed", statusCode, {
					headers,
					data: { count: this.retryCount }
				}));
				return false;
			}
			if (this.resume != null) {
				this.resume = null;
				if (statusCode !== 206 && (this.start > 0 || statusCode !== 200)) {
					this.abort(new RequestRetryError("server does not support the range header and the payload was partially consumed", statusCode, {
						headers,
						data: { count: this.retryCount }
					}));
					return false;
				}
				const contentRange = parseRangeHeader(headers["content-range"]);
				if (!contentRange) {
					this.abort(new RequestRetryError("Content-Range mismatch", statusCode, {
						headers,
						data: { count: this.retryCount }
					}));
					return false;
				}
				if (this.etag != null && this.etag !== headers.etag) {
					this.abort(new RequestRetryError("ETag mismatch", statusCode, {
						headers,
						data: { count: this.retryCount }
					}));
					return false;
				}
				const { start, size, end = size - 1 } = contentRange;
				assert$16(this.start === start, "content-range mismatch");
				assert$16(this.end == null || this.end === end, "content-range mismatch");
				this.resume = resume;
				return true;
			}
			if (this.end == null) {
				if (statusCode === 206) {
					const range = parseRangeHeader(headers["content-range"]);
					if (range == null) return this.handler.onHeaders(statusCode, rawHeaders, resume, statusMessage);
					const { start, size, end = size - 1 } = range;
					assert$16(start != null && Number.isFinite(start), "content-range mismatch");
					assert$16(end != null && Number.isFinite(end), "invalid content-length");
					this.start = start;
					this.end = end;
				}
				if (this.end == null) {
					const contentLength = headers["content-length"];
					this.end = contentLength != null ? Number(contentLength) - 1 : null;
				}
				assert$16(Number.isFinite(this.start));
				assert$16(this.end == null || Number.isFinite(this.end), "invalid content-length");
				this.resume = resume;
				this.etag = headers.etag != null ? headers.etag : null;
				if (this.etag != null && this.etag.startsWith("W/")) this.etag = null;
				return this.handler.onHeaders(statusCode, rawHeaders, resume, statusMessage);
			}
			const err = new RequestRetryError("Request failed", statusCode, {
				headers,
				data: { count: this.retryCount }
			});
			this.abort(err);
			return false;
		}
		onData(chunk) {
			this.start += chunk.length;
			return this.handler.onData(chunk);
		}
		onComplete(rawTrailers) {
			this.retryCount = 0;
			return this.handler.onComplete(rawTrailers);
		}
		onError(err) {
			if (this.aborted || isDisturbed(this.opts.body)) return this.handler.onError(err);
			if (this.retryCount - this.retryCountCheckpoint > 0) this.retryCount = this.retryCountCheckpoint + (this.retryCount - this.retryCountCheckpoint);
			else this.retryCount += 1;
			this.retryOpts.retry(err, {
				state: { counter: this.retryCount },
				opts: {
					retryOptions: this.retryOpts,
					...this.opts
				}
			}, onRetry.bind(this));
			function onRetry(err) {
				if (err != null || this.aborted || isDisturbed(this.opts.body)) return this.handler.onError(err);
				if (this.start !== 0) {
					const headers = { range: `bytes=${this.start}-${this.end ?? ""}` };
					if (this.etag != null) headers["if-match"] = this.etag;
					this.opts = {
						...this.opts,
						headers: {
							...this.opts.headers,
							...headers
						}
					};
				}
				try {
					this.retryCountCheckpoint = this.retryCount;
					this.dispatch(this.opts, this);
				} catch (err) {
					this.handler.onError(err);
				}
			}
		}
	};
	module.exports = RetryHandler;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/dispatcher/retry-agent.js
var require_retry_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Dispatcher = require_dispatcher();
	const RetryHandler = require_retry_handler();
	var RetryAgent = class extends Dispatcher {
		#agent = null;
		#options = null;
		constructor(agent, options = {}) {
			super(options);
			this.#agent = agent;
			this.#options = options;
		}
		dispatch(opts, handler) {
			const retry = new RetryHandler({
				...opts,
				retryOptions: this.#options
			}, {
				dispatch: this.#agent.dispatch.bind(this.#agent),
				handler
			});
			return this.#agent.dispatch(opts, retry);
		}
		close() {
			return this.#agent.close();
		}
		destroy() {
			return this.#agent.destroy();
		}
	};
	module.exports = RetryAgent;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/readable.js
var require_readable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$15 = __require("node:assert");
	const { Readable: Readable$2 } = __require("node:stream");
	const { RequestAbortedError, NotSupportedError, InvalidArgumentError, AbortError } = require_errors();
	const util = require_util$7();
	const { ReadableStreamFrom } = require_util$7();
	const kConsume = Symbol("kConsume");
	const kReading = Symbol("kReading");
	const kBody = Symbol("kBody");
	const kAbort = Symbol("kAbort");
	const kContentType = Symbol("kContentType");
	const kContentLength = Symbol("kContentLength");
	const noop = () => {};
	var BodyReadable = class extends Readable$2 {
		constructor({ resume, abort, contentType = "", contentLength, highWaterMark = 64 * 1024 }) {
			super({
				autoDestroy: true,
				read: resume,
				highWaterMark
			});
			this._readableState.dataEmitted = false;
			this[kAbort] = abort;
			this[kConsume] = null;
			this[kBody] = null;
			this[kContentType] = contentType;
			this[kContentLength] = contentLength;
			this[kReading] = false;
		}
		destroy(err) {
			if (!err && !this._readableState.endEmitted) err = new RequestAbortedError();
			if (err) this[kAbort]();
			return super.destroy(err);
		}
		_destroy(err, callback) {
			if (!this[kReading]) setImmediate(() => {
				callback(err);
			});
			else callback(err);
		}
		on(ev, ...args) {
			if (ev === "data" || ev === "readable") this[kReading] = true;
			return super.on(ev, ...args);
		}
		addListener(ev, ...args) {
			return this.on(ev, ...args);
		}
		off(ev, ...args) {
			const ret = super.off(ev, ...args);
			if (ev === "data" || ev === "readable") this[kReading] = this.listenerCount("data") > 0 || this.listenerCount("readable") > 0;
			return ret;
		}
		removeListener(ev, ...args) {
			return this.off(ev, ...args);
		}
		push(chunk) {
			if (this[kConsume] && chunk !== null) {
				consumePush(this[kConsume], chunk);
				return this[kReading] ? super.push(chunk) : true;
			}
			return super.push(chunk);
		}
		async text() {
			return consume(this, "text");
		}
		async json() {
			return consume(this, "json");
		}
		async blob() {
			return consume(this, "blob");
		}
		async bytes() {
			return consume(this, "bytes");
		}
		async arrayBuffer() {
			return consume(this, "arrayBuffer");
		}
		async formData() {
			throw new NotSupportedError();
		}
		get bodyUsed() {
			return util.isDisturbed(this);
		}
		get body() {
			if (!this[kBody]) {
				this[kBody] = ReadableStreamFrom(this);
				if (this[kConsume]) {
					this[kBody].getReader();
					assert$15(this[kBody].locked);
				}
			}
			return this[kBody];
		}
		async dump(opts) {
			let limit = Number.isFinite(opts?.limit) ? opts.limit : 128 * 1024;
			const signal = opts?.signal;
			if (signal != null && (typeof signal !== "object" || !("aborted" in signal))) throw new InvalidArgumentError("signal must be an AbortSignal");
			signal?.throwIfAborted();
			if (this._readableState.closeEmitted) return null;
			return await new Promise((resolve, reject) => {
				if (this[kContentLength] > limit) this.destroy(new AbortError());
				const onAbort = () => {
					this.destroy(signal.reason ?? new AbortError());
				};
				signal?.addEventListener("abort", onAbort);
				this.on("close", function() {
					signal?.removeEventListener("abort", onAbort);
					if (signal?.aborted) reject(signal.reason ?? new AbortError());
					else resolve(null);
				}).on("error", noop).on("data", function(chunk) {
					limit -= chunk.length;
					if (limit <= 0) this.destroy();
				}).resume();
			});
		}
	};
	function isLocked(self) {
		return self[kBody] && self[kBody].locked === true || self[kConsume];
	}
	function isUnusable(self) {
		return util.isDisturbed(self) || isLocked(self);
	}
	async function consume(stream, type) {
		assert$15(!stream[kConsume]);
		return new Promise((resolve, reject) => {
			if (isUnusable(stream)) {
				const rState = stream._readableState;
				if (rState.destroyed && rState.closeEmitted === false) stream.on("error", (err) => {
					reject(err);
				}).on("close", () => {
					reject(/* @__PURE__ */ new TypeError("unusable"));
				});
				else reject(rState.errored ?? /* @__PURE__ */ new TypeError("unusable"));
			} else queueMicrotask(() => {
				stream[kConsume] = {
					type,
					stream,
					resolve,
					reject,
					length: 0,
					body: []
				};
				stream.on("error", function(err) {
					consumeFinish(this[kConsume], err);
				}).on("close", function() {
					if (this[kConsume].body !== null) consumeFinish(this[kConsume], new RequestAbortedError());
				});
				consumeStart(stream[kConsume]);
			});
		});
	}
	function consumeStart(consume) {
		if (consume.body === null) return;
		const { _readableState: state } = consume.stream;
		if (state.bufferIndex) {
			const start = state.bufferIndex;
			const end = state.buffer.length;
			for (let n = start; n < end; n++) consumePush(consume, state.buffer[n]);
		} else for (const chunk of state.buffer) consumePush(consume, chunk);
		if (state.endEmitted) consumeEnd(this[kConsume]);
		else consume.stream.on("end", function() {
			consumeEnd(this[kConsume]);
		});
		consume.stream.resume();
		while (consume.stream.read() != null);
	}
	/**
	* @param {Buffer[]} chunks
	* @param {number} length
	*/
	function chunksDecode(chunks, length) {
		if (chunks.length === 0 || length === 0) return "";
		const buffer = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks, length);
		const bufferLength = buffer.length;
		const start = bufferLength > 2 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191 ? 3 : 0;
		return buffer.utf8Slice(start, bufferLength);
	}
	/**
	* @param {Buffer[]} chunks
	* @param {number} length
	* @returns {Uint8Array}
	*/
	function chunksConcat(chunks, length) {
		if (chunks.length === 0 || length === 0) return new Uint8Array(0);
		if (chunks.length === 1) return new Uint8Array(chunks[0]);
		const buffer = new Uint8Array(Buffer.allocUnsafeSlow(length).buffer);
		let offset = 0;
		for (let i = 0; i < chunks.length; ++i) {
			const chunk = chunks[i];
			buffer.set(chunk, offset);
			offset += chunk.length;
		}
		return buffer;
	}
	function consumeEnd(consume) {
		const { type, body, resolve, stream, length } = consume;
		try {
			if (type === "text") resolve(chunksDecode(body, length));
			else if (type === "json") resolve(JSON.parse(chunksDecode(body, length)));
			else if (type === "arrayBuffer") resolve(chunksConcat(body, length).buffer);
			else if (type === "blob") resolve(new Blob(body, { type: stream[kContentType] }));
			else if (type === "bytes") resolve(chunksConcat(body, length));
			consumeFinish(consume);
		} catch (err) {
			stream.destroy(err);
		}
	}
	function consumePush(consume, chunk) {
		consume.length += chunk.length;
		consume.body.push(chunk);
	}
	function consumeFinish(consume, err) {
		if (consume.body === null) return;
		if (err) consume.reject(err);
		else consume.resolve();
		consume.type = null;
		consume.stream = null;
		consume.resolve = null;
		consume.reject = null;
		consume.length = 0;
		consume.body = null;
	}
	module.exports = {
		Readable: BodyReadable,
		chunksDecode
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/util.js
var require_util$5 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$14 = __require("node:assert");
	const { ResponseStatusCodeError } = require_errors();
	const { chunksDecode } = require_readable();
	const CHUNK_LIMIT = 128 * 1024;
	async function getResolveErrorBodyCallback({ callback, body, contentType, statusCode, statusMessage, headers }) {
		assert$14(body);
		let chunks = [];
		let length = 0;
		try {
			for await (const chunk of body) {
				chunks.push(chunk);
				length += chunk.length;
				if (length > CHUNK_LIMIT) {
					chunks = [];
					length = 0;
					break;
				}
			}
		} catch {
			chunks = [];
			length = 0;
		}
		const message = `Response status code ${statusCode}${statusMessage ? `: ${statusMessage}` : ""}`;
		if (statusCode === 204 || !contentType || !length) {
			queueMicrotask(() => callback(new ResponseStatusCodeError(message, statusCode, headers)));
			return;
		}
		const stackTraceLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = 0;
		let payload;
		try {
			if (isContentTypeApplicationJson(contentType)) payload = JSON.parse(chunksDecode(chunks, length));
			else if (isContentTypeText(contentType)) payload = chunksDecode(chunks, length);
		} catch {} finally {
			Error.stackTraceLimit = stackTraceLimit;
		}
		queueMicrotask(() => callback(new ResponseStatusCodeError(message, statusCode, headers, payload)));
	}
	const isContentTypeApplicationJson = (contentType) => {
		return contentType.length > 15 && contentType[11] === "/" && contentType[0] === "a" && contentType[1] === "p" && contentType[2] === "p" && contentType[3] === "l" && contentType[4] === "i" && contentType[5] === "c" && contentType[6] === "a" && contentType[7] === "t" && contentType[8] === "i" && contentType[9] === "o" && contentType[10] === "n" && contentType[12] === "j" && contentType[13] === "s" && contentType[14] === "o" && contentType[15] === "n";
	};
	const isContentTypeText = (contentType) => {
		return contentType.length > 4 && contentType[4] === "/" && contentType[0] === "t" && contentType[1] === "e" && contentType[2] === "x" && contentType[3] === "t";
	};
	module.exports = {
		getResolveErrorBodyCallback,
		isContentTypeApplicationJson,
		isContentTypeText
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/api-request.js
var require_api_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$13 = __require("node:assert");
	const { Readable } = require_readable();
	const { InvalidArgumentError, RequestAbortedError } = require_errors();
	const util = require_util$7();
	const { getResolveErrorBodyCallback } = require_util$5();
	const { AsyncResource: AsyncResource$4 } = __require("node:async_hooks");
	var RequestHandler = class extends AsyncResource$4 {
		constructor(opts, callback) {
			if (!opts || typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			const { signal, method, opaque, body, onInfo, responseHeaders, throwOnError, highWaterMark } = opts;
			try {
				if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
				if (highWaterMark && (typeof highWaterMark !== "number" || highWaterMark < 0)) throw new InvalidArgumentError("invalid highWaterMark");
				if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
				if (method === "CONNECT") throw new InvalidArgumentError("invalid method");
				if (onInfo && typeof onInfo !== "function") throw new InvalidArgumentError("invalid onInfo callback");
				super("UNDICI_REQUEST");
			} catch (err) {
				if (util.isStream(body)) util.destroy(body.on("error", util.nop), err);
				throw err;
			}
			this.method = method;
			this.responseHeaders = responseHeaders || null;
			this.opaque = opaque || null;
			this.callback = callback;
			this.res = null;
			this.abort = null;
			this.body = body;
			this.trailers = {};
			this.context = null;
			this.onInfo = onInfo || null;
			this.throwOnError = throwOnError;
			this.highWaterMark = highWaterMark;
			this.signal = signal;
			this.reason = null;
			this.removeAbortListener = null;
			if (util.isStream(body)) body.on("error", (err) => {
				this.onError(err);
			});
			if (this.signal) if (this.signal.aborted) this.reason = this.signal.reason ?? new RequestAbortedError();
			else this.removeAbortListener = util.addAbortListener(this.signal, () => {
				this.reason = this.signal.reason ?? new RequestAbortedError();
				if (this.res) util.destroy(this.res.on("error", util.nop), this.reason);
				else if (this.abort) this.abort(this.reason);
				if (this.removeAbortListener) {
					this.res?.off("close", this.removeAbortListener);
					this.removeAbortListener();
					this.removeAbortListener = null;
				}
			});
		}
		onConnect(abort, context) {
			if (this.reason) {
				abort(this.reason);
				return;
			}
			assert$13(this.callback);
			this.abort = abort;
			this.context = context;
		}
		onHeaders(statusCode, rawHeaders, resume, statusMessage) {
			const { callback, opaque, abort, context, responseHeaders, highWaterMark } = this;
			const headers = responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
			if (statusCode < 200) {
				if (this.onInfo) this.onInfo({
					statusCode,
					headers
				});
				return;
			}
			const parsedHeaders = responseHeaders === "raw" ? util.parseHeaders(rawHeaders) : headers;
			const contentType = parsedHeaders["content-type"];
			const contentLength = parsedHeaders["content-length"];
			const res = new Readable({
				resume,
				abort,
				contentType,
				contentLength: this.method !== "HEAD" && contentLength ? Number(contentLength) : null,
				highWaterMark
			});
			if (this.removeAbortListener) res.on("close", this.removeAbortListener);
			this.callback = null;
			this.res = res;
			if (callback !== null) if (this.throwOnError && statusCode >= 400) this.runInAsyncScope(getResolveErrorBodyCallback, null, {
				callback,
				body: res,
				contentType,
				statusCode,
				statusMessage,
				headers
			});
			else this.runInAsyncScope(callback, null, null, {
				statusCode,
				headers,
				trailers: this.trailers,
				opaque,
				body: res,
				context
			});
		}
		onData(chunk) {
			return this.res.push(chunk);
		}
		onComplete(trailers) {
			util.parseHeaders(trailers, this.trailers);
			this.res.push(null);
		}
		onError(err) {
			const { res, callback, body, opaque } = this;
			if (callback) {
				this.callback = null;
				queueMicrotask(() => {
					this.runInAsyncScope(callback, null, err, { opaque });
				});
			}
			if (res) {
				this.res = null;
				queueMicrotask(() => {
					util.destroy(res, err);
				});
			}
			if (body) {
				this.body = null;
				util.destroy(body, err);
			}
			if (this.removeAbortListener) {
				res?.off("close", this.removeAbortListener);
				this.removeAbortListener();
				this.removeAbortListener = null;
			}
		}
	};
	function request(opts, callback) {
		if (callback === void 0) return new Promise((resolve, reject) => {
			request.call(this, opts, (err, data) => {
				return err ? reject(err) : resolve(data);
			});
		});
		try {
			this.dispatch(opts, new RequestHandler(opts, callback));
		} catch (err) {
			if (typeof callback !== "function") throw err;
			const opaque = opts?.opaque;
			queueMicrotask(() => callback(err, { opaque }));
		}
	}
	module.exports = request;
	module.exports.RequestHandler = RequestHandler;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/abort-signal.js
var require_abort_signal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { addAbortListener } = require_util$7();
	const { RequestAbortedError } = require_errors();
	const kListener = Symbol("kListener");
	const kSignal = Symbol("kSignal");
	function abort(self) {
		if (self.abort) self.abort(self[kSignal]?.reason);
		else self.reason = self[kSignal]?.reason ?? new RequestAbortedError();
		removeSignal(self);
	}
	function addSignal(self, signal) {
		self.reason = null;
		self[kSignal] = null;
		self[kListener] = null;
		if (!signal) return;
		if (signal.aborted) {
			abort(self);
			return;
		}
		self[kSignal] = signal;
		self[kListener] = () => {
			abort(self);
		};
		addAbortListener(self[kSignal], self[kListener]);
	}
	function removeSignal(self) {
		if (!self[kSignal]) return;
		if ("removeEventListener" in self[kSignal]) self[kSignal].removeEventListener("abort", self[kListener]);
		else self[kSignal].removeListener("abort", self[kListener]);
		self[kSignal] = null;
		self[kListener] = null;
	}
	module.exports = {
		addSignal,
		removeSignal
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/api-stream.js
var require_api_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$12 = __require("node:assert");
	const { finished: finished$1, PassThrough: PassThrough$1 } = __require("node:stream");
	const { InvalidArgumentError, InvalidReturnValueError } = require_errors();
	const util = require_util$7();
	const { getResolveErrorBodyCallback } = require_util$5();
	const { AsyncResource: AsyncResource$3 } = __require("node:async_hooks");
	const { addSignal, removeSignal } = require_abort_signal();
	var StreamHandler = class extends AsyncResource$3 {
		constructor(opts, factory, callback) {
			if (!opts || typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			const { signal, method, opaque, body, onInfo, responseHeaders, throwOnError } = opts;
			try {
				if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
				if (typeof factory !== "function") throw new InvalidArgumentError("invalid factory");
				if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
				if (method === "CONNECT") throw new InvalidArgumentError("invalid method");
				if (onInfo && typeof onInfo !== "function") throw new InvalidArgumentError("invalid onInfo callback");
				super("UNDICI_STREAM");
			} catch (err) {
				if (util.isStream(body)) util.destroy(body.on("error", util.nop), err);
				throw err;
			}
			this.responseHeaders = responseHeaders || null;
			this.opaque = opaque || null;
			this.factory = factory;
			this.callback = callback;
			this.res = null;
			this.abort = null;
			this.context = null;
			this.trailers = null;
			this.body = body;
			this.onInfo = onInfo || null;
			this.throwOnError = throwOnError || false;
			if (util.isStream(body)) body.on("error", (err) => {
				this.onError(err);
			});
			addSignal(this, signal);
		}
		onConnect(abort, context) {
			if (this.reason) {
				abort(this.reason);
				return;
			}
			assert$12(this.callback);
			this.abort = abort;
			this.context = context;
		}
		onHeaders(statusCode, rawHeaders, resume, statusMessage) {
			const { factory, opaque, context, callback, responseHeaders } = this;
			const headers = responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
			if (statusCode < 200) {
				if (this.onInfo) this.onInfo({
					statusCode,
					headers
				});
				return;
			}
			this.factory = null;
			let res;
			if (this.throwOnError && statusCode >= 400) {
				const contentType = (responseHeaders === "raw" ? util.parseHeaders(rawHeaders) : headers)["content-type"];
				res = new PassThrough$1();
				this.callback = null;
				this.runInAsyncScope(getResolveErrorBodyCallback, null, {
					callback,
					body: res,
					contentType,
					statusCode,
					statusMessage,
					headers
				});
			} else {
				if (factory === null) return;
				res = this.runInAsyncScope(factory, null, {
					statusCode,
					headers,
					opaque,
					context
				});
				if (!res || typeof res.write !== "function" || typeof res.end !== "function" || typeof res.on !== "function") throw new InvalidReturnValueError("expected Writable");
				finished$1(res, { readable: false }, (err) => {
					const { callback, res, opaque, trailers, abort } = this;
					this.res = null;
					if (err || !res.readable) util.destroy(res, err);
					this.callback = null;
					this.runInAsyncScope(callback, null, err || null, {
						opaque,
						trailers
					});
					if (err) abort();
				});
			}
			res.on("drain", resume);
			this.res = res;
			return (res.writableNeedDrain !== void 0 ? res.writableNeedDrain : res._writableState?.needDrain) !== true;
		}
		onData(chunk) {
			const { res } = this;
			return res ? res.write(chunk) : true;
		}
		onComplete(trailers) {
			const { res } = this;
			removeSignal(this);
			if (!res) return;
			this.trailers = util.parseHeaders(trailers);
			res.end();
		}
		onError(err) {
			const { res, callback, opaque, body } = this;
			removeSignal(this);
			this.factory = null;
			if (res) {
				this.res = null;
				util.destroy(res, err);
			} else if (callback) {
				this.callback = null;
				queueMicrotask(() => {
					this.runInAsyncScope(callback, null, err, { opaque });
				});
			}
			if (body) {
				this.body = null;
				util.destroy(body, err);
			}
		}
	};
	function stream(opts, factory, callback) {
		if (callback === void 0) return new Promise((resolve, reject) => {
			stream.call(this, opts, factory, (err, data) => {
				return err ? reject(err) : resolve(data);
			});
		});
		try {
			this.dispatch(opts, new StreamHandler(opts, factory, callback));
		} catch (err) {
			if (typeof callback !== "function") throw err;
			const opaque = opts?.opaque;
			queueMicrotask(() => callback(err, { opaque }));
		}
	}
	module.exports = stream;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/api-pipeline.js
var require_api_pipeline = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Readable: Readable$1, Duplex, PassThrough } = __require("node:stream");
	const { InvalidArgumentError, InvalidReturnValueError, RequestAbortedError } = require_errors();
	const util = require_util$7();
	const { AsyncResource: AsyncResource$2 } = __require("node:async_hooks");
	const { addSignal, removeSignal } = require_abort_signal();
	const assert$11 = __require("node:assert");
	const kResume = Symbol("resume");
	var PipelineRequest = class extends Readable$1 {
		constructor() {
			super({ autoDestroy: true });
			this[kResume] = null;
		}
		_read() {
			const { [kResume]: resume } = this;
			if (resume) {
				this[kResume] = null;
				resume();
			}
		}
		_destroy(err, callback) {
			this._read();
			callback(err);
		}
	};
	var PipelineResponse = class extends Readable$1 {
		constructor(resume) {
			super({ autoDestroy: true });
			this[kResume] = resume;
		}
		_read() {
			this[kResume]();
		}
		_destroy(err, callback) {
			if (!err && !this._readableState.endEmitted) err = new RequestAbortedError();
			callback(err);
		}
	};
	var PipelineHandler = class extends AsyncResource$2 {
		constructor(opts, handler) {
			if (!opts || typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			if (typeof handler !== "function") throw new InvalidArgumentError("invalid handler");
			const { signal, method, opaque, onInfo, responseHeaders } = opts;
			if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
			if (method === "CONNECT") throw new InvalidArgumentError("invalid method");
			if (onInfo && typeof onInfo !== "function") throw new InvalidArgumentError("invalid onInfo callback");
			super("UNDICI_PIPELINE");
			this.opaque = opaque || null;
			this.responseHeaders = responseHeaders || null;
			this.handler = handler;
			this.abort = null;
			this.context = null;
			this.onInfo = onInfo || null;
			this.req = new PipelineRequest().on("error", util.nop);
			this.ret = new Duplex({
				readableObjectMode: opts.objectMode,
				autoDestroy: true,
				read: () => {
					const { body } = this;
					if (body?.resume) body.resume();
				},
				write: (chunk, encoding, callback) => {
					const { req } = this;
					if (req.push(chunk, encoding) || req._readableState.destroyed) callback();
					else req[kResume] = callback;
				},
				destroy: (err, callback) => {
					const { body, req, res, ret, abort } = this;
					if (!err && !ret._readableState.endEmitted) err = new RequestAbortedError();
					if (abort && err) abort();
					util.destroy(body, err);
					util.destroy(req, err);
					util.destroy(res, err);
					removeSignal(this);
					callback(err);
				}
			}).on("prefinish", () => {
				const { req } = this;
				req.push(null);
			});
			this.res = null;
			addSignal(this, signal);
		}
		onConnect(abort, context) {
			const { ret, res } = this;
			if (this.reason) {
				abort(this.reason);
				return;
			}
			assert$11(!res, "pipeline cannot be retried");
			assert$11(!ret.destroyed);
			this.abort = abort;
			this.context = context;
		}
		onHeaders(statusCode, rawHeaders, resume) {
			const { opaque, handler, context } = this;
			if (statusCode < 200) {
				if (this.onInfo) {
					const headers = this.responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
					this.onInfo({
						statusCode,
						headers
					});
				}
				return;
			}
			this.res = new PipelineResponse(resume);
			let body;
			try {
				this.handler = null;
				const headers = this.responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
				body = this.runInAsyncScope(handler, null, {
					statusCode,
					headers,
					opaque,
					body: this.res,
					context
				});
			} catch (err) {
				this.res.on("error", util.nop);
				throw err;
			}
			if (!body || typeof body.on !== "function") throw new InvalidReturnValueError("expected Readable");
			body.on("data", (chunk) => {
				const { ret, body } = this;
				if (!ret.push(chunk) && body.pause) body.pause();
			}).on("error", (err) => {
				const { ret } = this;
				util.destroy(ret, err);
			}).on("end", () => {
				const { ret } = this;
				ret.push(null);
			}).on("close", () => {
				const { ret } = this;
				if (!ret._readableState.ended) util.destroy(ret, new RequestAbortedError());
			});
			this.body = body;
		}
		onData(chunk) {
			const { res } = this;
			return res.push(chunk);
		}
		onComplete(trailers) {
			const { res } = this;
			res.push(null);
		}
		onError(err) {
			const { ret } = this;
			this.handler = null;
			util.destroy(ret, err);
		}
	};
	function pipeline(opts, handler) {
		try {
			const pipelineHandler = new PipelineHandler(opts, handler);
			this.dispatch({
				...opts,
				body: pipelineHandler.req
			}, pipelineHandler);
			return pipelineHandler.ret;
		} catch (err) {
			return new PassThrough().destroy(err);
		}
	}
	module.exports = pipeline;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/api-upgrade.js
var require_api_upgrade = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { InvalidArgumentError, SocketError } = require_errors();
	const { AsyncResource: AsyncResource$1 } = __require("node:async_hooks");
	const util = require_util$7();
	const { addSignal, removeSignal } = require_abort_signal();
	const assert$10 = __require("node:assert");
	var UpgradeHandler = class extends AsyncResource$1 {
		constructor(opts, callback) {
			if (!opts || typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
			const { signal, opaque, responseHeaders } = opts;
			if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
			super("UNDICI_UPGRADE");
			this.responseHeaders = responseHeaders || null;
			this.opaque = opaque || null;
			this.callback = callback;
			this.abort = null;
			this.context = null;
			addSignal(this, signal);
		}
		onConnect(abort, context) {
			if (this.reason) {
				abort(this.reason);
				return;
			}
			assert$10(this.callback);
			this.abort = abort;
			this.context = null;
		}
		onHeaders() {
			throw new SocketError("bad upgrade", null);
		}
		onUpgrade(statusCode, rawHeaders, socket) {
			assert$10(statusCode === 101);
			const { callback, opaque, context } = this;
			removeSignal(this);
			this.callback = null;
			const headers = this.responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
			this.runInAsyncScope(callback, null, null, {
				headers,
				socket,
				opaque,
				context
			});
		}
		onError(err) {
			const { callback, opaque } = this;
			removeSignal(this);
			if (callback) {
				this.callback = null;
				queueMicrotask(() => {
					this.runInAsyncScope(callback, null, err, { opaque });
				});
			}
		}
	};
	function upgrade(opts, callback) {
		if (callback === void 0) return new Promise((resolve, reject) => {
			upgrade.call(this, opts, (err, data) => {
				return err ? reject(err) : resolve(data);
			});
		});
		try {
			const upgradeHandler = new UpgradeHandler(opts, callback);
			this.dispatch({
				...opts,
				method: opts.method || "GET",
				upgrade: opts.protocol || "Websocket"
			}, upgradeHandler);
		} catch (err) {
			if (typeof callback !== "function") throw err;
			const opaque = opts?.opaque;
			queueMicrotask(() => callback(err, { opaque }));
		}
	}
	module.exports = upgrade;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/api-connect.js
var require_api_connect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$9 = __require("node:assert");
	const { AsyncResource } = __require("node:async_hooks");
	const { InvalidArgumentError, SocketError } = require_errors();
	const util = require_util$7();
	const { addSignal, removeSignal } = require_abort_signal();
	var ConnectHandler = class extends AsyncResource {
		constructor(opts, callback) {
			if (!opts || typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			if (typeof callback !== "function") throw new InvalidArgumentError("invalid callback");
			const { signal, opaque, responseHeaders } = opts;
			if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
			super("UNDICI_CONNECT");
			this.opaque = opaque || null;
			this.responseHeaders = responseHeaders || null;
			this.callback = callback;
			this.abort = null;
			addSignal(this, signal);
		}
		onConnect(abort, context) {
			if (this.reason) {
				abort(this.reason);
				return;
			}
			assert$9(this.callback);
			this.abort = abort;
			this.context = context;
		}
		onHeaders() {
			throw new SocketError("bad connect", null);
		}
		onUpgrade(statusCode, rawHeaders, socket) {
			const { callback, opaque, context } = this;
			removeSignal(this);
			this.callback = null;
			let headers = rawHeaders;
			if (headers != null) headers = this.responseHeaders === "raw" ? util.parseRawHeaders(rawHeaders) : util.parseHeaders(rawHeaders);
			this.runInAsyncScope(callback, null, null, {
				statusCode,
				headers,
				socket,
				opaque,
				context
			});
		}
		onError(err) {
			const { callback, opaque } = this;
			removeSignal(this);
			if (callback) {
				this.callback = null;
				queueMicrotask(() => {
					this.runInAsyncScope(callback, null, err, { opaque });
				});
			}
		}
	};
	function connect(opts, callback) {
		if (callback === void 0) return new Promise((resolve, reject) => {
			connect.call(this, opts, (err, data) => {
				return err ? reject(err) : resolve(data);
			});
		});
		try {
			const connectHandler = new ConnectHandler(opts, callback);
			this.dispatch({
				...opts,
				method: "CONNECT"
			}, connectHandler);
		} catch (err) {
			if (typeof callback !== "function") throw err;
			const opaque = opts?.opaque;
			queueMicrotask(() => callback(err, { opaque }));
		}
	}
	module.exports = connect;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/api/index.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports.request = require_api_request();
	module.exports.stream = require_api_stream();
	module.exports.pipeline = require_api_pipeline();
	module.exports.upgrade = require_api_upgrade();
	module.exports.connect = require_api_connect();
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-errors.js
var require_mock_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { UndiciError } = require_errors();
	const kMockNotMatchedError = Symbol.for("undici.error.UND_MOCK_ERR_MOCK_NOT_MATCHED");
	/**
	* The request does not match any registered mock dispatches.
	*/
	var MockNotMatchedError = class MockNotMatchedError extends UndiciError {
		constructor(message) {
			super(message);
			Error.captureStackTrace(this, MockNotMatchedError);
			this.name = "MockNotMatchedError";
			this.message = message || "The request does not match any registered mock dispatches";
			this.code = "UND_MOCK_ERR_MOCK_NOT_MATCHED";
		}
		static [Symbol.hasInstance](instance) {
			return instance && instance[kMockNotMatchedError] === true;
		}
		[kMockNotMatchedError] = true;
	};
	module.exports = { MockNotMatchedError };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-symbols.js
var require_mock_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kAgent: Symbol("agent"),
		kOptions: Symbol("options"),
		kFactory: Symbol("factory"),
		kDispatches: Symbol("dispatches"),
		kDispatchKey: Symbol("dispatch key"),
		kDefaultHeaders: Symbol("default headers"),
		kDefaultTrailers: Symbol("default trailers"),
		kContentLength: Symbol("content length"),
		kMockAgent: Symbol("mock agent"),
		kMockAgentSet: Symbol("mock agent set"),
		kMockAgentGet: Symbol("mock agent get"),
		kMockDispatch: Symbol("mock dispatch"),
		kClose: Symbol("close"),
		kOriginalClose: Symbol("original agent close"),
		kOrigin: Symbol("origin"),
		kIsMockActive: Symbol("is mock active"),
		kNetConnect: Symbol("net connect"),
		kGetNetConnect: Symbol("get net connect"),
		kConnected: Symbol("connected")
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-utils.js
var require_mock_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { MockNotMatchedError } = require_mock_errors();
	const { kDispatches, kMockAgent, kOriginalDispatch, kOrigin, kGetNetConnect } = require_mock_symbols();
	const { buildURL } = require_util$7();
	const { STATUS_CODES: STATUS_CODES$1 } = __require("node:http");
	const { types: { isPromise } } = __require("node:util");
	function matchValue(match, value) {
		if (typeof match === "string") return match === value;
		if (match instanceof RegExp) return match.test(value);
		if (typeof match === "function") return match(value) === true;
		return false;
	}
	function lowerCaseEntries(headers) {
		return Object.fromEntries(Object.entries(headers).map(([headerName, headerValue]) => {
			return [headerName.toLocaleLowerCase(), headerValue];
		}));
	}
	/**
	* @param {import('../../index').Headers|string[]|Record<string, string>} headers
	* @param {string} key
	*/
	function getHeaderByName(headers, key) {
		if (Array.isArray(headers)) {
			for (let i = 0; i < headers.length; i += 2) if (headers[i].toLocaleLowerCase() === key.toLocaleLowerCase()) return headers[i + 1];
			return;
		} else if (typeof headers.get === "function") return headers.get(key);
		else return lowerCaseEntries(headers)[key.toLocaleLowerCase()];
	}
	/** @param {string[]} headers */
	function buildHeadersFromArray(headers) {
		const clone = headers.slice();
		const entries = [];
		for (let index = 0; index < clone.length; index += 2) entries.push([clone[index], clone[index + 1]]);
		return Object.fromEntries(entries);
	}
	function matchHeaders(mockDispatch, headers) {
		if (typeof mockDispatch.headers === "function") {
			if (Array.isArray(headers)) headers = buildHeadersFromArray(headers);
			return mockDispatch.headers(headers ? lowerCaseEntries(headers) : {});
		}
		if (typeof mockDispatch.headers === "undefined") return true;
		if (typeof headers !== "object" || typeof mockDispatch.headers !== "object") return false;
		for (const [matchHeaderName, matchHeaderValue] of Object.entries(mockDispatch.headers)) if (!matchValue(matchHeaderValue, getHeaderByName(headers, matchHeaderName))) return false;
		return true;
	}
	function safeUrl(path) {
		if (typeof path !== "string") return path;
		const pathSegments = path.split("?");
		if (pathSegments.length !== 2) return path;
		const qp = new URLSearchParams(pathSegments.pop());
		qp.sort();
		return [...pathSegments, qp.toString()].join("?");
	}
	function matchKey(mockDispatch, { path, method, body, headers }) {
		const pathMatch = matchValue(mockDispatch.path, path);
		const methodMatch = matchValue(mockDispatch.method, method);
		const bodyMatch = typeof mockDispatch.body !== "undefined" ? matchValue(mockDispatch.body, body) : true;
		const headersMatch = matchHeaders(mockDispatch, headers);
		return pathMatch && methodMatch && bodyMatch && headersMatch;
	}
	function getResponseData(data) {
		if (Buffer.isBuffer(data)) return data;
		else if (data instanceof Uint8Array) return data;
		else if (data instanceof ArrayBuffer) return data;
		else if (typeof data === "object") return JSON.stringify(data);
		else return data.toString();
	}
	function getMockDispatch(mockDispatches, key) {
		const basePath = key.query ? buildURL(key.path, key.query) : key.path;
		const resolvedPath = typeof basePath === "string" ? safeUrl(basePath) : basePath;
		let matchedMockDispatches = mockDispatches.filter(({ consumed }) => !consumed).filter(({ path }) => matchValue(safeUrl(path), resolvedPath));
		if (matchedMockDispatches.length === 0) throw new MockNotMatchedError(`Mock dispatch not matched for path '${resolvedPath}'`);
		matchedMockDispatches = matchedMockDispatches.filter(({ method }) => matchValue(method, key.method));
		if (matchedMockDispatches.length === 0) throw new MockNotMatchedError(`Mock dispatch not matched for method '${key.method}' on path '${resolvedPath}'`);
		matchedMockDispatches = matchedMockDispatches.filter(({ body }) => typeof body !== "undefined" ? matchValue(body, key.body) : true);
		if (matchedMockDispatches.length === 0) throw new MockNotMatchedError(`Mock dispatch not matched for body '${key.body}' on path '${resolvedPath}'`);
		matchedMockDispatches = matchedMockDispatches.filter((mockDispatch) => matchHeaders(mockDispatch, key.headers));
		if (matchedMockDispatches.length === 0) throw new MockNotMatchedError(`Mock dispatch not matched for headers '${typeof key.headers === "object" ? JSON.stringify(key.headers) : key.headers}' on path '${resolvedPath}'`);
		return matchedMockDispatches[0];
	}
	function addMockDispatch(mockDispatches, key, data) {
		const baseData = {
			timesInvoked: 0,
			times: 1,
			persist: false,
			consumed: false
		};
		const replyData = typeof data === "function" ? { callback: data } : { ...data };
		const newMockDispatch = {
			...baseData,
			...key,
			pending: true,
			data: {
				error: null,
				...replyData
			}
		};
		mockDispatches.push(newMockDispatch);
		return newMockDispatch;
	}
	function deleteMockDispatch(mockDispatches, key) {
		const index = mockDispatches.findIndex((dispatch) => {
			if (!dispatch.consumed) return false;
			return matchKey(dispatch, key);
		});
		if (index !== -1) mockDispatches.splice(index, 1);
	}
	function buildKey(opts) {
		const { path, method, body, headers, query } = opts;
		return {
			path,
			method,
			body,
			headers,
			query
		};
	}
	function generateKeyValues(data) {
		const keys = Object.keys(data);
		const result = [];
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const value = data[key];
			const name = Buffer.from(`${key}`);
			if (Array.isArray(value)) for (let j = 0; j < value.length; ++j) result.push(name, Buffer.from(`${value[j]}`));
			else result.push(name, Buffer.from(`${value}`));
		}
		return result;
	}
	/**
	* @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
	* @param {number} statusCode
	*/
	function getStatusText(statusCode) {
		return STATUS_CODES$1[statusCode] || "unknown";
	}
	async function getResponse(body) {
		const buffers = [];
		for await (const data of body) buffers.push(data);
		return Buffer.concat(buffers).toString("utf8");
	}
	/**
	* Mock dispatch function used to simulate undici dispatches
	*/
	function mockDispatch(opts, handler) {
		const key = buildKey(opts);
		const mockDispatch = getMockDispatch(this[kDispatches], key);
		mockDispatch.timesInvoked++;
		if (mockDispatch.data.callback) mockDispatch.data = {
			...mockDispatch.data,
			...mockDispatch.data.callback(opts)
		};
		const { data: { statusCode, data, headers, trailers, error }, delay, persist } = mockDispatch;
		const { timesInvoked, times } = mockDispatch;
		mockDispatch.consumed = !persist && timesInvoked >= times;
		mockDispatch.pending = timesInvoked < times;
		if (error !== null) {
			deleteMockDispatch(this[kDispatches], key);
			handler.onError(error);
			return true;
		}
		if (typeof delay === "number" && delay > 0) setTimeout(() => {
			handleReply(this[kDispatches]);
		}, delay);
		else handleReply(this[kDispatches]);
		function handleReply(mockDispatches, _data = data) {
			const optsHeaders = Array.isArray(opts.headers) ? buildHeadersFromArray(opts.headers) : opts.headers;
			const body = typeof _data === "function" ? _data({
				...opts,
				headers: optsHeaders
			}) : _data;
			if (isPromise(body)) {
				body.then((newData) => handleReply(mockDispatches, newData));
				return;
			}
			const responseData = getResponseData(body);
			const responseHeaders = generateKeyValues(headers);
			const responseTrailers = generateKeyValues(trailers);
			handler.onConnect?.((err) => handler.onError(err), null);
			handler.onHeaders?.(statusCode, responseHeaders, resume, getStatusText(statusCode));
			handler.onData?.(Buffer.from(responseData));
			handler.onComplete?.(responseTrailers);
			deleteMockDispatch(mockDispatches, key);
		}
		function resume() {}
		return true;
	}
	function buildMockDispatch() {
		const agent = this[kMockAgent];
		const origin = this[kOrigin];
		const originalDispatch = this[kOriginalDispatch];
		return function dispatch(opts, handler) {
			if (agent.isMockActive) try {
				mockDispatch.call(this, opts, handler);
			} catch (error) {
				if (error instanceof MockNotMatchedError) {
					const netConnect = agent[kGetNetConnect]();
					if (netConnect === false) throw new MockNotMatchedError(`${error.message}: subsequent request to origin ${origin} was not allowed (net.connect disabled)`);
					if (checkNetConnect(netConnect, origin)) originalDispatch.call(this, opts, handler);
					else throw new MockNotMatchedError(`${error.message}: subsequent request to origin ${origin} was not allowed (net.connect is not enabled for this origin)`);
				} else throw error;
			}
			else originalDispatch.call(this, opts, handler);
		};
	}
	function checkNetConnect(netConnect, origin) {
		const url = new URL(origin);
		if (netConnect === true) return true;
		else if (Array.isArray(netConnect) && netConnect.some((matcher) => matchValue(matcher, url.host))) return true;
		return false;
	}
	function buildMockOptions(opts) {
		if (opts) {
			const { agent, ...mockOptions } = opts;
			return mockOptions;
		}
	}
	module.exports = {
		getResponseData,
		getMockDispatch,
		addMockDispatch,
		deleteMockDispatch,
		buildKey,
		generateKeyValues,
		matchValue,
		getResponse,
		getStatusText,
		mockDispatch,
		buildMockDispatch,
		checkNetConnect,
		buildMockOptions,
		getHeaderByName,
		buildHeadersFromArray
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-interceptor.js
var require_mock_interceptor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { getResponseData, buildKey, addMockDispatch } = require_mock_utils();
	const { kDispatches, kDispatchKey, kDefaultHeaders, kDefaultTrailers, kContentLength, kMockDispatch } = require_mock_symbols();
	const { InvalidArgumentError } = require_errors();
	const { buildURL } = require_util$7();
	/**
	* Defines the scope API for an interceptor reply
	*/
	var MockScope = class {
		constructor(mockDispatch) {
			this[kMockDispatch] = mockDispatch;
		}
		/**
		* Delay a reply by a set amount in ms.
		*/
		delay(waitInMs) {
			if (typeof waitInMs !== "number" || !Number.isInteger(waitInMs) || waitInMs <= 0) throw new InvalidArgumentError("waitInMs must be a valid integer > 0");
			this[kMockDispatch].delay = waitInMs;
			return this;
		}
		/**
		* For a defined reply, never mark as consumed.
		*/
		persist() {
			this[kMockDispatch].persist = true;
			return this;
		}
		/**
		* Allow one to define a reply for a set amount of matching requests.
		*/
		times(repeatTimes) {
			if (typeof repeatTimes !== "number" || !Number.isInteger(repeatTimes) || repeatTimes <= 0) throw new InvalidArgumentError("repeatTimes must be a valid integer > 0");
			this[kMockDispatch].times = repeatTimes;
			return this;
		}
	};
	/**
	* Defines an interceptor for a Mock
	*/
	var MockInterceptor = class {
		constructor(opts, mockDispatches) {
			if (typeof opts !== "object") throw new InvalidArgumentError("opts must be an object");
			if (typeof opts.path === "undefined") throw new InvalidArgumentError("opts.path must be defined");
			if (typeof opts.method === "undefined") opts.method = "GET";
			if (typeof opts.path === "string") if (opts.query) opts.path = buildURL(opts.path, opts.query);
			else {
				const parsedURL = new URL(opts.path, "data://");
				opts.path = parsedURL.pathname + parsedURL.search;
			}
			if (typeof opts.method === "string") opts.method = opts.method.toUpperCase();
			this[kDispatchKey] = buildKey(opts);
			this[kDispatches] = mockDispatches;
			this[kDefaultHeaders] = {};
			this[kDefaultTrailers] = {};
			this[kContentLength] = false;
		}
		createMockScopeDispatchData({ statusCode, data, responseOptions }) {
			const responseData = getResponseData(data);
			const contentLength = this[kContentLength] ? { "content-length": responseData.length } : {};
			return {
				statusCode,
				data,
				headers: {
					...this[kDefaultHeaders],
					...contentLength,
					...responseOptions.headers
				},
				trailers: {
					...this[kDefaultTrailers],
					...responseOptions.trailers
				}
			};
		}
		validateReplyParameters(replyParameters) {
			if (typeof replyParameters.statusCode === "undefined") throw new InvalidArgumentError("statusCode must be defined");
			if (typeof replyParameters.responseOptions !== "object" || replyParameters.responseOptions === null) throw new InvalidArgumentError("responseOptions must be an object");
		}
		/**
		* Mock an undici request with a defined reply.
		*/
		reply(replyOptionsCallbackOrStatusCode) {
			if (typeof replyOptionsCallbackOrStatusCode === "function") {
				const wrappedDefaultsCallback = (opts) => {
					const resolvedData = replyOptionsCallbackOrStatusCode(opts);
					if (typeof resolvedData !== "object" || resolvedData === null) throw new InvalidArgumentError("reply options callback must return an object");
					const replyParameters = {
						data: "",
						responseOptions: {},
						...resolvedData
					};
					this.validateReplyParameters(replyParameters);
					return { ...this.createMockScopeDispatchData(replyParameters) };
				};
				return new MockScope(addMockDispatch(this[kDispatches], this[kDispatchKey], wrappedDefaultsCallback));
			}
			const replyParameters = {
				statusCode: replyOptionsCallbackOrStatusCode,
				data: arguments[1] === void 0 ? "" : arguments[1],
				responseOptions: arguments[2] === void 0 ? {} : arguments[2]
			};
			this.validateReplyParameters(replyParameters);
			const dispatchData = this.createMockScopeDispatchData(replyParameters);
			return new MockScope(addMockDispatch(this[kDispatches], this[kDispatchKey], dispatchData));
		}
		/**
		* Mock an undici request with a defined error.
		*/
		replyWithError(error) {
			if (typeof error === "undefined") throw new InvalidArgumentError("error must be defined");
			return new MockScope(addMockDispatch(this[kDispatches], this[kDispatchKey], { error }));
		}
		/**
		* Set default reply headers on the interceptor for subsequent replies
		*/
		defaultReplyHeaders(headers) {
			if (typeof headers === "undefined") throw new InvalidArgumentError("headers must be defined");
			this[kDefaultHeaders] = headers;
			return this;
		}
		/**
		* Set default reply trailers on the interceptor for subsequent replies
		*/
		defaultReplyTrailers(trailers) {
			if (typeof trailers === "undefined") throw new InvalidArgumentError("trailers must be defined");
			this[kDefaultTrailers] = trailers;
			return this;
		}
		/**
		* Set reply content length header for replies on the interceptor
		*/
		replyContentLength() {
			this[kContentLength] = true;
			return this;
		}
	};
	module.exports.MockInterceptor = MockInterceptor;
	module.exports.MockScope = MockScope;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-client.js
var require_mock_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { promisify: promisify$1 } = __require("node:util");
	const Client = require_client();
	const { buildMockDispatch } = require_mock_utils();
	const { kDispatches, kMockAgent, kClose, kOriginalClose, kOrigin, kOriginalDispatch, kConnected } = require_mock_symbols();
	const { MockInterceptor } = require_mock_interceptor();
	const Symbols = require_symbols$4();
	const { InvalidArgumentError } = require_errors();
	/**
	* MockClient provides an API that extends the Client to influence the mockDispatches.
	*/
	var MockClient = class extends Client {
		constructor(origin, opts) {
			super(origin, opts);
			if (!opts || !opts.agent || typeof opts.agent.dispatch !== "function") throw new InvalidArgumentError("Argument opts.agent must implement Agent");
			this[kMockAgent] = opts.agent;
			this[kOrigin] = origin;
			this[kDispatches] = [];
			this[kConnected] = 1;
			this[kOriginalDispatch] = this.dispatch;
			this[kOriginalClose] = this.close.bind(this);
			this.dispatch = buildMockDispatch.call(this);
			this.close = this[kClose];
		}
		get [Symbols.kConnected]() {
			return this[kConnected];
		}
		/**
		* Sets up the base interceptor for mocking replies from undici.
		*/
		intercept(opts) {
			return new MockInterceptor(opts, this[kDispatches]);
		}
		async [kClose]() {
			await promisify$1(this[kOriginalClose])();
			this[kConnected] = 0;
			this[kMockAgent][Symbols.kClients].delete(this[kOrigin]);
		}
	};
	module.exports = MockClient;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-pool.js
var require_mock_pool = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { promisify } = __require("node:util");
	const Pool = require_pool();
	const { buildMockDispatch } = require_mock_utils();
	const { kDispatches, kMockAgent, kClose, kOriginalClose, kOrigin, kOriginalDispatch, kConnected } = require_mock_symbols();
	const { MockInterceptor } = require_mock_interceptor();
	const Symbols = require_symbols$4();
	const { InvalidArgumentError } = require_errors();
	/**
	* MockPool provides an API that extends the Pool to influence the mockDispatches.
	*/
	var MockPool = class extends Pool {
		constructor(origin, opts) {
			super(origin, opts);
			if (!opts || !opts.agent || typeof opts.agent.dispatch !== "function") throw new InvalidArgumentError("Argument opts.agent must implement Agent");
			this[kMockAgent] = opts.agent;
			this[kOrigin] = origin;
			this[kDispatches] = [];
			this[kConnected] = 1;
			this[kOriginalDispatch] = this.dispatch;
			this[kOriginalClose] = this.close.bind(this);
			this.dispatch = buildMockDispatch.call(this);
			this.close = this[kClose];
		}
		get [Symbols.kConnected]() {
			return this[kConnected];
		}
		/**
		* Sets up the base interceptor for mocking replies from undici.
		*/
		intercept(opts) {
			return new MockInterceptor(opts, this[kDispatches]);
		}
		async [kClose]() {
			await promisify(this[kOriginalClose])();
			this[kConnected] = 0;
			this[kMockAgent][Symbols.kClients].delete(this[kOrigin]);
		}
	};
	module.exports = MockPool;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/pluralizer.js
var require_pluralizer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const singulars = {
		pronoun: "it",
		is: "is",
		was: "was",
		this: "this"
	};
	const plurals = {
		pronoun: "they",
		is: "are",
		was: "were",
		this: "these"
	};
	module.exports = class Pluralizer {
		constructor(singular, plural) {
			this.singular = singular;
			this.plural = plural;
		}
		pluralize(count) {
			const one = count === 1;
			const keys = one ? singulars : plurals;
			const noun = one ? this.singular : this.plural;
			return {
				...keys,
				count,
				noun
			};
		}
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/pending-interceptors-formatter.js
var require_pending_interceptors_formatter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Transform: Transform$1 } = __require("node:stream");
	const { Console } = __require("node:console");
	const PERSISTENT = process.versions.icu ? "✅" : "Y ";
	const NOT_PERSISTENT = process.versions.icu ? "❌" : "N ";
	/**
	* Gets the output of `console.table(…)` as a string.
	*/
	module.exports = class PendingInterceptorsFormatter {
		constructor({ disableColors } = {}) {
			this.transform = new Transform$1({ transform(chunk, _enc, cb) {
				cb(null, chunk);
			} });
			this.logger = new Console({
				stdout: this.transform,
				inspectOptions: { colors: !disableColors && !process.env.CI }
			});
		}
		format(pendingInterceptors) {
			const withPrettyHeaders = pendingInterceptors.map(({ method, path, data: { statusCode }, persist, times, timesInvoked, origin }) => ({
				Method: method,
				Origin: origin,
				Path: path,
				"Status code": statusCode,
				Persistent: persist ? PERSISTENT : NOT_PERSISTENT,
				Invocations: timesInvoked,
				Remaining: persist ? Infinity : times - timesInvoked
			}));
			this.logger.table(withPrettyHeaders);
			return this.transform.read().toString();
		}
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/mock/mock-agent.js
var require_mock_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kClients } = require_symbols$4();
	const Agent = require_agent();
	const { kAgent, kMockAgentSet, kMockAgentGet, kDispatches, kIsMockActive, kNetConnect, kGetNetConnect, kOptions, kFactory } = require_mock_symbols();
	const MockClient = require_mock_client();
	const MockPool = require_mock_pool();
	const { matchValue, buildMockOptions } = require_mock_utils();
	const { InvalidArgumentError, UndiciError } = require_errors();
	const Dispatcher = require_dispatcher();
	const Pluralizer = require_pluralizer();
	const PendingInterceptorsFormatter = require_pending_interceptors_formatter();
	var MockAgent = class extends Dispatcher {
		constructor(opts) {
			super(opts);
			this[kNetConnect] = true;
			this[kIsMockActive] = true;
			if (opts?.agent && typeof opts.agent.dispatch !== "function") throw new InvalidArgumentError("Argument opts.agent must implement Agent");
			const agent = opts?.agent ? opts.agent : new Agent(opts);
			this[kAgent] = agent;
			this[kClients] = agent[kClients];
			this[kOptions] = buildMockOptions(opts);
		}
		get(origin) {
			let dispatcher = this[kMockAgentGet](origin);
			if (!dispatcher) {
				dispatcher = this[kFactory](origin);
				this[kMockAgentSet](origin, dispatcher);
			}
			return dispatcher;
		}
		dispatch(opts, handler) {
			this.get(opts.origin);
			return this[kAgent].dispatch(opts, handler);
		}
		async close() {
			await this[kAgent].close();
			this[kClients].clear();
		}
		deactivate() {
			this[kIsMockActive] = false;
		}
		activate() {
			this[kIsMockActive] = true;
		}
		enableNetConnect(matcher) {
			if (typeof matcher === "string" || typeof matcher === "function" || matcher instanceof RegExp) if (Array.isArray(this[kNetConnect])) this[kNetConnect].push(matcher);
			else this[kNetConnect] = [matcher];
			else if (typeof matcher === "undefined") this[kNetConnect] = true;
			else throw new InvalidArgumentError("Unsupported matcher. Must be one of String|Function|RegExp.");
		}
		disableNetConnect() {
			this[kNetConnect] = false;
		}
		get isMockActive() {
			return this[kIsMockActive];
		}
		[kMockAgentSet](origin, dispatcher) {
			this[kClients].set(origin, dispatcher);
		}
		[kFactory](origin) {
			const mockOptions = Object.assign({ agent: this }, this[kOptions]);
			return this[kOptions] && this[kOptions].connections === 1 ? new MockClient(origin, mockOptions) : new MockPool(origin, mockOptions);
		}
		[kMockAgentGet](origin) {
			const client = this[kClients].get(origin);
			if (client) return client;
			if (typeof origin !== "string") {
				const dispatcher = this[kFactory]("http://localhost:9999");
				this[kMockAgentSet](origin, dispatcher);
				return dispatcher;
			}
			for (const [keyMatcher, nonExplicitDispatcher] of Array.from(this[kClients])) if (nonExplicitDispatcher && typeof keyMatcher !== "string" && matchValue(keyMatcher, origin)) {
				const dispatcher = this[kFactory](origin);
				this[kMockAgentSet](origin, dispatcher);
				dispatcher[kDispatches] = nonExplicitDispatcher[kDispatches];
				return dispatcher;
			}
		}
		[kGetNetConnect]() {
			return this[kNetConnect];
		}
		pendingInterceptors() {
			const mockAgentClients = this[kClients];
			return Array.from(mockAgentClients.entries()).flatMap(([origin, scope]) => scope[kDispatches].map((dispatch) => ({
				...dispatch,
				origin
			}))).filter(({ pending }) => pending);
		}
		assertNoPendingInterceptors({ pendingInterceptorsFormatter = new PendingInterceptorsFormatter() } = {}) {
			const pending = this.pendingInterceptors();
			if (pending.length === 0) return;
			const pluralizer = new Pluralizer("interceptor", "interceptors").pluralize(pending.length);
			throw new UndiciError(`
${pluralizer.count} ${pluralizer.noun} ${pluralizer.is} pending:

${pendingInterceptorsFormatter.format(pending)}
`.trim());
		}
	};
	module.exports = MockAgent;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/global.js
var require_global = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const globalDispatcher = Symbol.for("undici.globalDispatcher.1");
	const { InvalidArgumentError } = require_errors();
	const Agent = require_agent();
	if (getGlobalDispatcher() === void 0) setGlobalDispatcher(new Agent());
	function setGlobalDispatcher(agent) {
		if (!agent || typeof agent.dispatch !== "function") throw new InvalidArgumentError("Argument agent must implement Agent");
		Object.defineProperty(globalThis, globalDispatcher, {
			value: agent,
			writable: true,
			enumerable: false,
			configurable: false
		});
	}
	function getGlobalDispatcher() {
		return globalThis[globalDispatcher];
	}
	module.exports = {
		setGlobalDispatcher,
		getGlobalDispatcher
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/handler/decorator-handler.js
var require_decorator_handler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = class DecoratorHandler {
		#handler;
		constructor(handler) {
			if (typeof handler !== "object" || handler === null) throw new TypeError("handler must be an object");
			this.#handler = handler;
		}
		onConnect(...args) {
			return this.#handler.onConnect?.(...args);
		}
		onError(...args) {
			return this.#handler.onError?.(...args);
		}
		onUpgrade(...args) {
			return this.#handler.onUpgrade?.(...args);
		}
		onResponseStarted(...args) {
			return this.#handler.onResponseStarted?.(...args);
		}
		onHeaders(...args) {
			return this.#handler.onHeaders?.(...args);
		}
		onData(...args) {
			return this.#handler.onData?.(...args);
		}
		onComplete(...args) {
			return this.#handler.onComplete?.(...args);
		}
		onBodySent(...args) {
			return this.#handler.onBodySent?.(...args);
		}
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/interceptor/redirect.js
var require_redirect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const RedirectHandler = require_redirect_handler();
	module.exports = (opts) => {
		const globalMaxRedirections = opts?.maxRedirections;
		return (dispatch) => {
			return function redirectInterceptor(opts, handler) {
				const { maxRedirections = globalMaxRedirections, ...baseOpts } = opts;
				if (!maxRedirections) return dispatch(opts, handler);
				return dispatch(baseOpts, new RedirectHandler(dispatch, maxRedirections, opts, handler));
			};
		};
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/interceptor/retry.js
var require_retry = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const RetryHandler = require_retry_handler();
	module.exports = (globalOpts) => {
		return (dispatch) => {
			return function retryInterceptor(opts, handler) {
				return dispatch(opts, new RetryHandler({
					...opts,
					retryOptions: {
						...globalOpts,
						...opts.retryOptions
					}
				}, {
					handler,
					dispatch
				}));
			};
		};
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/interceptor/dump.js
var require_dump = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const util = require_util$7();
	const { InvalidArgumentError, RequestAbortedError } = require_errors();
	const DecoratorHandler = require_decorator_handler();
	var DumpHandler = class extends DecoratorHandler {
		#maxSize = 1024 * 1024;
		#abort = null;
		#dumped = false;
		#aborted = false;
		#size = 0;
		#reason = null;
		#handler = null;
		constructor({ maxSize }, handler) {
			super(handler);
			if (maxSize != null && (!Number.isFinite(maxSize) || maxSize < 1)) throw new InvalidArgumentError("maxSize must be a number greater than 0");
			this.#maxSize = maxSize ?? this.#maxSize;
			this.#handler = handler;
		}
		onConnect(abort) {
			this.#abort = abort;
			this.#handler.onConnect(this.#customAbort.bind(this));
		}
		#customAbort(reason) {
			this.#aborted = true;
			this.#reason = reason;
		}
		onHeaders(statusCode, rawHeaders, resume, statusMessage) {
			const contentLength = util.parseHeaders(rawHeaders)["content-length"];
			if (contentLength != null && contentLength > this.#maxSize) throw new RequestAbortedError(`Response size (${contentLength}) larger than maxSize (${this.#maxSize})`);
			if (this.#aborted) return true;
			return this.#handler.onHeaders(statusCode, rawHeaders, resume, statusMessage);
		}
		onError(err) {
			if (this.#dumped) return;
			err = this.#reason ?? err;
			this.#handler.onError(err);
		}
		onData(chunk) {
			this.#size = this.#size + chunk.length;
			if (this.#size >= this.#maxSize) {
				this.#dumped = true;
				if (this.#aborted) this.#handler.onError(this.#reason);
				else this.#handler.onComplete([]);
			}
			return true;
		}
		onComplete(trailers) {
			if (this.#dumped) return;
			if (this.#aborted) {
				this.#handler.onError(this.reason);
				return;
			}
			this.#handler.onComplete(trailers);
		}
	};
	function createDumpInterceptor({ maxSize: defaultMaxSize } = { maxSize: 1024 * 1024 }) {
		return (dispatch) => {
			return function Intercept(opts, handler) {
				const { dumpMaxSize = defaultMaxSize } = opts;
				return dispatch(opts, new DumpHandler({ maxSize: dumpMaxSize }, handler));
			};
		};
	}
	module.exports = createDumpInterceptor;
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/interceptor/dns.js
var require_dns = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { isIP } = __require("node:net");
	const { lookup } = __require("node:dns");
	const DecoratorHandler = require_decorator_handler();
	const { InvalidArgumentError, InformationalError } = require_errors();
	const maxInt = Math.pow(2, 31) - 1;
	var DNSInstance = class {
		#maxTTL = 0;
		#maxItems = 0;
		#records = /* @__PURE__ */ new Map();
		dualStack = true;
		affinity = null;
		lookup = null;
		pick = null;
		constructor(opts) {
			this.#maxTTL = opts.maxTTL;
			this.#maxItems = opts.maxItems;
			this.dualStack = opts.dualStack;
			this.affinity = opts.affinity;
			this.lookup = opts.lookup ?? this.#defaultLookup;
			this.pick = opts.pick ?? this.#defaultPick;
		}
		get full() {
			return this.#records.size === this.#maxItems;
		}
		runLookup(origin, opts, cb) {
			const ips = this.#records.get(origin.hostname);
			if (ips == null && this.full) {
				cb(null, origin.origin);
				return;
			}
			const newOpts = {
				affinity: this.affinity,
				dualStack: this.dualStack,
				lookup: this.lookup,
				pick: this.pick,
				...opts.dns,
				maxTTL: this.#maxTTL,
				maxItems: this.#maxItems
			};
			if (ips == null) this.lookup(origin, newOpts, (err, addresses) => {
				if (err || addresses == null || addresses.length === 0) {
					cb(err ?? new InformationalError("No DNS entries found"));
					return;
				}
				this.setRecords(origin, addresses);
				const records = this.#records.get(origin.hostname);
				const ip = this.pick(origin, records, newOpts.affinity);
				let port;
				if (typeof ip.port === "number") port = `:${ip.port}`;
				else if (origin.port !== "") port = `:${origin.port}`;
				else port = "";
				cb(null, `${origin.protocol}//${ip.family === 6 ? `[${ip.address}]` : ip.address}${port}`);
			});
			else {
				const ip = this.pick(origin, ips, newOpts.affinity);
				if (ip == null) {
					this.#records.delete(origin.hostname);
					this.runLookup(origin, opts, cb);
					return;
				}
				let port;
				if (typeof ip.port === "number") port = `:${ip.port}`;
				else if (origin.port !== "") port = `:${origin.port}`;
				else port = "";
				cb(null, `${origin.protocol}//${ip.family === 6 ? `[${ip.address}]` : ip.address}${port}`);
			}
		}
		#defaultLookup(origin, opts, cb) {
			lookup(origin.hostname, {
				all: true,
				family: this.dualStack === false ? this.affinity : 0,
				order: "ipv4first"
			}, (err, addresses) => {
				if (err) return cb(err);
				const results = /* @__PURE__ */ new Map();
				for (const addr of addresses) results.set(`${addr.address}:${addr.family}`, addr);
				cb(null, results.values());
			});
		}
		#defaultPick(origin, hostnameRecords, affinity) {
			let ip = null;
			const { records, offset } = hostnameRecords;
			let family;
			if (this.dualStack) {
				if (affinity == null) if (offset == null || offset === maxInt) {
					hostnameRecords.offset = 0;
					affinity = 4;
				} else {
					hostnameRecords.offset++;
					affinity = (hostnameRecords.offset & 1) === 1 ? 6 : 4;
				}
				if (records[affinity] != null && records[affinity].ips.length > 0) family = records[affinity];
				else family = records[affinity === 4 ? 6 : 4];
			} else family = records[affinity];
			if (family == null || family.ips.length === 0) return ip;
			if (family.offset == null || family.offset === maxInt) family.offset = 0;
			else family.offset++;
			const position = family.offset % family.ips.length;
			ip = family.ips[position] ?? null;
			if (ip == null) return ip;
			if (Date.now() - ip.timestamp > ip.ttl) {
				family.ips.splice(position, 1);
				return this.pick(origin, hostnameRecords, affinity);
			}
			return ip;
		}
		setRecords(origin, addresses) {
			const timestamp = Date.now();
			const records = { records: {
				4: null,
				6: null
			} };
			for (const record of addresses) {
				record.timestamp = timestamp;
				if (typeof record.ttl === "number") record.ttl = Math.min(record.ttl, this.#maxTTL);
				else record.ttl = this.#maxTTL;
				const familyRecords = records.records[record.family] ?? { ips: [] };
				familyRecords.ips.push(record);
				records.records[record.family] = familyRecords;
			}
			this.#records.set(origin.hostname, records);
		}
		getHandler(meta, opts) {
			return new DNSDispatchHandler(this, meta, opts);
		}
	};
	var DNSDispatchHandler = class extends DecoratorHandler {
		#state = null;
		#opts = null;
		#dispatch = null;
		#handler = null;
		#origin = null;
		constructor(state, { origin, handler, dispatch }, opts) {
			super(handler);
			this.#origin = origin;
			this.#handler = handler;
			this.#opts = { ...opts };
			this.#state = state;
			this.#dispatch = dispatch;
		}
		onError(err) {
			switch (err.code) {
				case "ETIMEDOUT":
				case "ECONNREFUSED":
					if (this.#state.dualStack) {
						this.#state.runLookup(this.#origin, this.#opts, (err, newOrigin) => {
							if (err) return this.#handler.onError(err);
							const dispatchOpts = {
								...this.#opts,
								origin: newOrigin
							};
							this.#dispatch(dispatchOpts, this);
						});
						return;
					}
					this.#handler.onError(err);
					return;
				case "ENOTFOUND": this.#state.deleteRecord(this.#origin);
				default:
					this.#handler.onError(err);
					break;
			}
		}
	};
	module.exports = (interceptorOpts) => {
		if (interceptorOpts?.maxTTL != null && (typeof interceptorOpts?.maxTTL !== "number" || interceptorOpts?.maxTTL < 0)) throw new InvalidArgumentError("Invalid maxTTL. Must be a positive number");
		if (interceptorOpts?.maxItems != null && (typeof interceptorOpts?.maxItems !== "number" || interceptorOpts?.maxItems < 1)) throw new InvalidArgumentError("Invalid maxItems. Must be a positive number and greater than zero");
		if (interceptorOpts?.affinity != null && interceptorOpts?.affinity !== 4 && interceptorOpts?.affinity !== 6) throw new InvalidArgumentError("Invalid affinity. Must be either 4 or 6");
		if (interceptorOpts?.dualStack != null && typeof interceptorOpts?.dualStack !== "boolean") throw new InvalidArgumentError("Invalid dualStack. Must be a boolean");
		if (interceptorOpts?.lookup != null && typeof interceptorOpts?.lookup !== "function") throw new InvalidArgumentError("Invalid lookup. Must be a function");
		if (interceptorOpts?.pick != null && typeof interceptorOpts?.pick !== "function") throw new InvalidArgumentError("Invalid pick. Must be a function");
		const dualStack = interceptorOpts?.dualStack ?? true;
		let affinity;
		if (dualStack) affinity = interceptorOpts?.affinity ?? null;
		else affinity = interceptorOpts?.affinity ?? 4;
		const instance = new DNSInstance({
			maxTTL: interceptorOpts?.maxTTL ?? 1e4,
			lookup: interceptorOpts?.lookup ?? null,
			pick: interceptorOpts?.pick ?? null,
			dualStack,
			affinity,
			maxItems: interceptorOpts?.maxItems ?? Infinity
		});
		return (dispatch) => {
			return function dnsInterceptor(origDispatchOpts, handler) {
				const origin = origDispatchOpts.origin.constructor === URL ? origDispatchOpts.origin : new URL(origDispatchOpts.origin);
				if (isIP(origin.hostname) !== 0) return dispatch(origDispatchOpts, handler);
				instance.runLookup(origin, origDispatchOpts, (err, newOrigin) => {
					if (err) return handler.onError(err);
					let dispatchOpts = null;
					dispatchOpts = {
						...origDispatchOpts,
						servername: origin.hostname,
						origin: newOrigin,
						headers: {
							host: origin.hostname,
							...origDispatchOpts.headers
						}
					};
					dispatch(dispatchOpts, instance.getHandler({
						origin,
						dispatch,
						handler
					}, origDispatchOpts));
				});
				return true;
			};
		};
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/headers.js
var require_headers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kConstruct } = require_symbols$4();
	const { kEnumerableProperty } = require_util$7();
	const { iteratorMixin, isValidHeaderName, isValidHeaderValue } = require_util$6();
	const { webidl } = require_webidl();
	const assert$8 = __require("node:assert");
	const util = __require("node:util");
	const kHeadersMap = Symbol("headers map");
	const kHeadersSortedMap = Symbol("headers map sorted");
	/**
	* @param {number} code
	*/
	function isHTTPWhiteSpaceCharCode(code) {
		return code === 10 || code === 13 || code === 9 || code === 32;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-header-value-normalize
	* @param {string} potentialValue
	*/
	function headerValueNormalize(potentialValue) {
		let i = 0;
		let j = potentialValue.length;
		while (j > i && isHTTPWhiteSpaceCharCode(potentialValue.charCodeAt(j - 1))) --j;
		while (j > i && isHTTPWhiteSpaceCharCode(potentialValue.charCodeAt(i))) ++i;
		return i === 0 && j === potentialValue.length ? potentialValue : potentialValue.substring(i, j);
	}
	function fill(headers, object) {
		if (Array.isArray(object)) for (let i = 0; i < object.length; ++i) {
			const header = object[i];
			if (header.length !== 2) throw webidl.errors.exception({
				header: "Headers constructor",
				message: `expected name/value pair to be length 2, found ${header.length}.`
			});
			appendHeader(headers, header[0], header[1]);
		}
		else if (typeof object === "object" && object !== null) {
			const keys = Object.keys(object);
			for (let i = 0; i < keys.length; ++i) appendHeader(headers, keys[i], object[keys[i]]);
		} else throw webidl.errors.conversionFailed({
			prefix: "Headers constructor",
			argument: "Argument 1",
			types: ["sequence<sequence<ByteString>>", "record<ByteString, ByteString>"]
		});
	}
	/**
	* @see https://fetch.spec.whatwg.org/#concept-headers-append
	*/
	function appendHeader(headers, name, value) {
		value = headerValueNormalize(value);
		if (!isValidHeaderName(name)) throw webidl.errors.invalidArgument({
			prefix: "Headers.append",
			value: name,
			type: "header name"
		});
		else if (!isValidHeaderValue(value)) throw webidl.errors.invalidArgument({
			prefix: "Headers.append",
			value,
			type: "header value"
		});
		if (getHeadersGuard(headers) === "immutable") throw new TypeError("immutable");
		return getHeadersList(headers).append(name, value, false);
	}
	function compareHeaderName(a, b) {
		return a[0] < b[0] ? -1 : 1;
	}
	var HeadersList = class HeadersList {
		/** @type {[string, string][]|null} */
		cookies = null;
		constructor(init) {
			if (init instanceof HeadersList) {
				this[kHeadersMap] = new Map(init[kHeadersMap]);
				this[kHeadersSortedMap] = init[kHeadersSortedMap];
				this.cookies = init.cookies === null ? null : [...init.cookies];
			} else {
				this[kHeadersMap] = new Map(init);
				this[kHeadersSortedMap] = null;
			}
		}
		/**
		* @see https://fetch.spec.whatwg.org/#header-list-contains
		* @param {string} name
		* @param {boolean} isLowerCase
		*/
		contains(name, isLowerCase) {
			return this[kHeadersMap].has(isLowerCase ? name : name.toLowerCase());
		}
		clear() {
			this[kHeadersMap].clear();
			this[kHeadersSortedMap] = null;
			this.cookies = null;
		}
		/**
		* @see https://fetch.spec.whatwg.org/#concept-header-list-append
		* @param {string} name
		* @param {string} value
		* @param {boolean} isLowerCase
		*/
		append(name, value, isLowerCase) {
			this[kHeadersSortedMap] = null;
			const lowercaseName = isLowerCase ? name : name.toLowerCase();
			const exists = this[kHeadersMap].get(lowercaseName);
			if (exists) {
				const delimiter = lowercaseName === "cookie" ? "; " : ", ";
				this[kHeadersMap].set(lowercaseName, {
					name: exists.name,
					value: `${exists.value}${delimiter}${value}`
				});
			} else this[kHeadersMap].set(lowercaseName, {
				name,
				value
			});
			if (lowercaseName === "set-cookie") (this.cookies ??= []).push(value);
		}
		/**
		* @see https://fetch.spec.whatwg.org/#concept-header-list-set
		* @param {string} name
		* @param {string} value
		* @param {boolean} isLowerCase
		*/
		set(name, value, isLowerCase) {
			this[kHeadersSortedMap] = null;
			const lowercaseName = isLowerCase ? name : name.toLowerCase();
			if (lowercaseName === "set-cookie") this.cookies = [value];
			this[kHeadersMap].set(lowercaseName, {
				name,
				value
			});
		}
		/**
		* @see https://fetch.spec.whatwg.org/#concept-header-list-delete
		* @param {string} name
		* @param {boolean} isLowerCase
		*/
		delete(name, isLowerCase) {
			this[kHeadersSortedMap] = null;
			if (!isLowerCase) name = name.toLowerCase();
			if (name === "set-cookie") this.cookies = null;
			this[kHeadersMap].delete(name);
		}
		/**
		* @see https://fetch.spec.whatwg.org/#concept-header-list-get
		* @param {string} name
		* @param {boolean} isLowerCase
		* @returns {string | null}
		*/
		get(name, isLowerCase) {
			return this[kHeadersMap].get(isLowerCase ? name : name.toLowerCase())?.value ?? null;
		}
		*[Symbol.iterator]() {
			for (const { 0: name, 1: { value } } of this[kHeadersMap]) yield [name, value];
		}
		get entries() {
			const headers = {};
			if (this[kHeadersMap].size !== 0) for (const { name, value } of this[kHeadersMap].values()) headers[name] = value;
			return headers;
		}
		rawValues() {
			return this[kHeadersMap].values();
		}
		get entriesList() {
			const headers = [];
			if (this[kHeadersMap].size !== 0) for (const { 0: lowerName, 1: { name, value } } of this[kHeadersMap]) if (lowerName === "set-cookie") for (const cookie of this.cookies) headers.push([name, cookie]);
			else headers.push([name, value]);
			return headers;
		}
		toSortedArray() {
			const size = this[kHeadersMap].size;
			const array = new Array(size);
			if (size <= 32) {
				if (size === 0) return array;
				const iterator = this[kHeadersMap][Symbol.iterator]();
				const firstValue = iterator.next().value;
				array[0] = [firstValue[0], firstValue[1].value];
				assert$8(firstValue[1].value !== null);
				for (let i = 1, j = 0, right = 0, left = 0, pivot = 0, x, value; i < size; ++i) {
					value = iterator.next().value;
					x = array[i] = [value[0], value[1].value];
					assert$8(x[1] !== null);
					left = 0;
					right = i;
					while (left < right) {
						pivot = left + (right - left >> 1);
						if (array[pivot][0] <= x[0]) left = pivot + 1;
						else right = pivot;
					}
					if (i !== pivot) {
						j = i;
						while (j > left) array[j] = array[--j];
						array[left] = x;
					}
				}
				/* c8 ignore next 4 */
				if (!iterator.next().done) throw new TypeError("Unreachable");
				return array;
			} else {
				let i = 0;
				for (const { 0: name, 1: { value } } of this[kHeadersMap]) {
					array[i++] = [name, value];
					assert$8(value !== null);
				}
				return array.sort(compareHeaderName);
			}
		}
	};
	var Headers = class Headers {
		#guard;
		#headersList;
		constructor(init = void 0) {
			webidl.util.markAsUncloneable(this);
			if (init === kConstruct) return;
			this.#headersList = new HeadersList();
			this.#guard = "none";
			if (init !== void 0) {
				init = webidl.converters.HeadersInit(init, "Headers contructor", "init");
				fill(this, init);
			}
		}
		append(name, value) {
			webidl.brandCheck(this, Headers);
			webidl.argumentLengthCheck(arguments, 2, "Headers.append");
			const prefix = "Headers.append";
			name = webidl.converters.ByteString(name, prefix, "name");
			value = webidl.converters.ByteString(value, prefix, "value");
			return appendHeader(this, name, value);
		}
		delete(name) {
			webidl.brandCheck(this, Headers);
			webidl.argumentLengthCheck(arguments, 1, "Headers.delete");
			name = webidl.converters.ByteString(name, "Headers.delete", "name");
			if (!isValidHeaderName(name)) throw webidl.errors.invalidArgument({
				prefix: "Headers.delete",
				value: name,
				type: "header name"
			});
			if (this.#guard === "immutable") throw new TypeError("immutable");
			if (!this.#headersList.contains(name, false)) return;
			this.#headersList.delete(name, false);
		}
		get(name) {
			webidl.brandCheck(this, Headers);
			webidl.argumentLengthCheck(arguments, 1, "Headers.get");
			const prefix = "Headers.get";
			name = webidl.converters.ByteString(name, prefix, "name");
			if (!isValidHeaderName(name)) throw webidl.errors.invalidArgument({
				prefix,
				value: name,
				type: "header name"
			});
			return this.#headersList.get(name, false);
		}
		has(name) {
			webidl.brandCheck(this, Headers);
			webidl.argumentLengthCheck(arguments, 1, "Headers.has");
			const prefix = "Headers.has";
			name = webidl.converters.ByteString(name, prefix, "name");
			if (!isValidHeaderName(name)) throw webidl.errors.invalidArgument({
				prefix,
				value: name,
				type: "header name"
			});
			return this.#headersList.contains(name, false);
		}
		set(name, value) {
			webidl.brandCheck(this, Headers);
			webidl.argumentLengthCheck(arguments, 2, "Headers.set");
			const prefix = "Headers.set";
			name = webidl.converters.ByteString(name, prefix, "name");
			value = webidl.converters.ByteString(value, prefix, "value");
			value = headerValueNormalize(value);
			if (!isValidHeaderName(name)) throw webidl.errors.invalidArgument({
				prefix,
				value: name,
				type: "header name"
			});
			else if (!isValidHeaderValue(value)) throw webidl.errors.invalidArgument({
				prefix,
				value,
				type: "header value"
			});
			if (this.#guard === "immutable") throw new TypeError("immutable");
			this.#headersList.set(name, value, false);
		}
		getSetCookie() {
			webidl.brandCheck(this, Headers);
			const list = this.#headersList.cookies;
			if (list) return [...list];
			return [];
		}
		get [kHeadersSortedMap]() {
			if (this.#headersList[kHeadersSortedMap]) return this.#headersList[kHeadersSortedMap];
			const headers = [];
			const names = this.#headersList.toSortedArray();
			const cookies = this.#headersList.cookies;
			if (cookies === null || cookies.length === 1) return this.#headersList[kHeadersSortedMap] = names;
			for (let i = 0; i < names.length; ++i) {
				const { 0: name, 1: value } = names[i];
				if (name === "set-cookie") for (let j = 0; j < cookies.length; ++j) headers.push([name, cookies[j]]);
				else headers.push([name, value]);
			}
			return this.#headersList[kHeadersSortedMap] = headers;
		}
		[util.inspect.custom](depth, options) {
			options.depth ??= depth;
			return `Headers ${util.formatWithOptions(options, this.#headersList.entries)}`;
		}
		static getHeadersGuard(o) {
			return o.#guard;
		}
		static setHeadersGuard(o, guard) {
			o.#guard = guard;
		}
		static getHeadersList(o) {
			return o.#headersList;
		}
		static setHeadersList(o, list) {
			o.#headersList = list;
		}
	};
	const { getHeadersGuard, setHeadersGuard, getHeadersList, setHeadersList } = Headers;
	Reflect.deleteProperty(Headers, "getHeadersGuard");
	Reflect.deleteProperty(Headers, "setHeadersGuard");
	Reflect.deleteProperty(Headers, "getHeadersList");
	Reflect.deleteProperty(Headers, "setHeadersList");
	iteratorMixin("Headers", Headers, kHeadersSortedMap, 0, 1);
	Object.defineProperties(Headers.prototype, {
		append: kEnumerableProperty,
		delete: kEnumerableProperty,
		get: kEnumerableProperty,
		has: kEnumerableProperty,
		set: kEnumerableProperty,
		getSetCookie: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "Headers",
			configurable: true
		},
		[util.inspect.custom]: { enumerable: false }
	});
	webidl.converters.HeadersInit = function(V, prefix, argument) {
		if (webidl.util.Type(V) === "Object") {
			const iterator = Reflect.get(V, Symbol.iterator);
			if (!util.types.isProxy(V) && iterator === Headers.prototype.entries) try {
				return getHeadersList(V).entriesList;
			} catch {}
			if (typeof iterator === "function") return webidl.converters["sequence<sequence<ByteString>>"](V, prefix, argument, iterator.bind(V));
			return webidl.converters["record<ByteString, ByteString>"](V, prefix, argument);
		}
		throw webidl.errors.conversionFailed({
			prefix: "Headers constructor",
			argument: "Argument 1",
			types: ["sequence<sequence<ByteString>>", "record<ByteString, ByteString>"]
		});
	};
	module.exports = {
		fill,
		compareHeaderName,
		Headers,
		HeadersList,
		getHeadersGuard,
		setHeadersGuard,
		setHeadersList,
		getHeadersList
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/response.js
var require_response = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Headers, HeadersList, fill, getHeadersGuard, setHeadersGuard, setHeadersList } = require_headers();
	const { extractBody, cloneBody, mixinBody, hasFinalizationRegistry, streamRegistry, bodyUnusable } = require_body();
	const util = require_util$7();
	const nodeUtil$1 = __require("node:util");
	const { kEnumerableProperty } = util;
	const { isValidReasonPhrase, isCancelled, isAborted, isBlobLike, serializeJavascriptValueToJSONString, isErrorLike, isomorphicEncode, environmentSettingsObject: relevantRealm } = require_util$6();
	const { redirectStatusSet, nullBodyStatus } = require_constants$2();
	const { kState, kHeaders } = require_symbols$3();
	const { webidl } = require_webidl();
	const { FormData } = require_formdata();
	const { URLSerializer } = require_data_url();
	const { kConstruct } = require_symbols$4();
	const assert$7 = __require("node:assert");
	const { types: types$2 } = __require("node:util");
	const textEncoder = new TextEncoder("utf-8");
	var Response = class Response {
		static error() {
			return fromInnerResponse(makeNetworkError(), "immutable");
		}
		static json(data, init = {}) {
			webidl.argumentLengthCheck(arguments, 1, "Response.json");
			if (init !== null) init = webidl.converters.ResponseInit(init);
			const body = extractBody(textEncoder.encode(serializeJavascriptValueToJSONString(data)));
			const responseObject = fromInnerResponse(makeResponse({}), "response");
			initializeResponse(responseObject, init, {
				body: body[0],
				type: "application/json"
			});
			return responseObject;
		}
		static redirect(url, status = 302) {
			webidl.argumentLengthCheck(arguments, 1, "Response.redirect");
			url = webidl.converters.USVString(url);
			status = webidl.converters["unsigned short"](status);
			let parsedURL;
			try {
				parsedURL = new URL(url, relevantRealm.settingsObject.baseUrl);
			} catch (err) {
				throw new TypeError(`Failed to parse URL from ${url}`, { cause: err });
			}
			if (!redirectStatusSet.has(status)) throw new RangeError(`Invalid status code ${status}`);
			const responseObject = fromInnerResponse(makeResponse({}), "immutable");
			responseObject[kState].status = status;
			const value = isomorphicEncode(URLSerializer(parsedURL));
			responseObject[kState].headersList.append("location", value, true);
			return responseObject;
		}
		constructor(body = null, init = {}) {
			webidl.util.markAsUncloneable(this);
			if (body === kConstruct) return;
			if (body !== null) body = webidl.converters.BodyInit(body);
			init = webidl.converters.ResponseInit(init);
			this[kState] = makeResponse({});
			this[kHeaders] = new Headers(kConstruct);
			setHeadersGuard(this[kHeaders], "response");
			setHeadersList(this[kHeaders], this[kState].headersList);
			let bodyWithType = null;
			if (body != null) {
				const [extractedBody, type] = extractBody(body);
				bodyWithType = {
					body: extractedBody,
					type
				};
			}
			initializeResponse(this, init, bodyWithType);
		}
		get type() {
			webidl.brandCheck(this, Response);
			return this[kState].type;
		}
		get url() {
			webidl.brandCheck(this, Response);
			const urlList = this[kState].urlList;
			const url = urlList[urlList.length - 1] ?? null;
			if (url === null) return "";
			return URLSerializer(url, true);
		}
		get redirected() {
			webidl.brandCheck(this, Response);
			return this[kState].urlList.length > 1;
		}
		get status() {
			webidl.brandCheck(this, Response);
			return this[kState].status;
		}
		get ok() {
			webidl.brandCheck(this, Response);
			return this[kState].status >= 200 && this[kState].status <= 299;
		}
		get statusText() {
			webidl.brandCheck(this, Response);
			return this[kState].statusText;
		}
		get headers() {
			webidl.brandCheck(this, Response);
			return this[kHeaders];
		}
		get body() {
			webidl.brandCheck(this, Response);
			return this[kState].body ? this[kState].body.stream : null;
		}
		get bodyUsed() {
			webidl.brandCheck(this, Response);
			return !!this[kState].body && util.isDisturbed(this[kState].body.stream);
		}
		clone() {
			webidl.brandCheck(this, Response);
			if (bodyUnusable(this)) throw webidl.errors.exception({
				header: "Response.clone",
				message: "Body has already been consumed."
			});
			const clonedResponse = cloneResponse(this[kState]);
			if (hasFinalizationRegistry && this[kState].body?.stream) streamRegistry.register(this, new WeakRef(this[kState].body.stream));
			return fromInnerResponse(clonedResponse, getHeadersGuard(this[kHeaders]));
		}
		[nodeUtil$1.inspect.custom](depth, options) {
			if (options.depth === null) options.depth = 2;
			options.colors ??= true;
			const properties = {
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
				body: this.body,
				bodyUsed: this.bodyUsed,
				ok: this.ok,
				redirected: this.redirected,
				type: this.type,
				url: this.url
			};
			return `Response ${nodeUtil$1.formatWithOptions(options, properties)}`;
		}
	};
	mixinBody(Response);
	Object.defineProperties(Response.prototype, {
		type: kEnumerableProperty,
		url: kEnumerableProperty,
		status: kEnumerableProperty,
		ok: kEnumerableProperty,
		redirected: kEnumerableProperty,
		statusText: kEnumerableProperty,
		headers: kEnumerableProperty,
		clone: kEnumerableProperty,
		body: kEnumerableProperty,
		bodyUsed: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "Response",
			configurable: true
		}
	});
	Object.defineProperties(Response, {
		json: kEnumerableProperty,
		redirect: kEnumerableProperty,
		error: kEnumerableProperty
	});
	function cloneResponse(response) {
		if (response.internalResponse) return filterResponse(cloneResponse(response.internalResponse), response.type);
		const newResponse = makeResponse({
			...response,
			body: null
		});
		if (response.body != null) newResponse.body = cloneBody(newResponse, response.body);
		return newResponse;
	}
	function makeResponse(init) {
		return {
			aborted: false,
			rangeRequested: false,
			timingAllowPassed: false,
			requestIncludesCredentials: false,
			type: "default",
			status: 200,
			timingInfo: null,
			cacheState: "",
			statusText: "",
			...init,
			headersList: init?.headersList ? new HeadersList(init?.headersList) : new HeadersList(),
			urlList: init?.urlList ? [...init.urlList] : []
		};
	}
	function makeNetworkError(reason) {
		return makeResponse({
			type: "error",
			status: 0,
			error: isErrorLike(reason) ? reason : new Error(reason ? String(reason) : reason),
			aborted: reason && reason.name === "AbortError"
		});
	}
	function isNetworkError(response) {
		return response.type === "error" && response.status === 0;
	}
	function makeFilteredResponse(response, state) {
		state = {
			internalResponse: response,
			...state
		};
		return new Proxy(response, {
			get(target, p) {
				return p in state ? state[p] : target[p];
			},
			set(target, p, value) {
				assert$7(!(p in state));
				target[p] = value;
				return true;
			}
		});
	}
	function filterResponse(response, type) {
		if (type === "basic") return makeFilteredResponse(response, {
			type: "basic",
			headersList: response.headersList
		});
		else if (type === "cors") return makeFilteredResponse(response, {
			type: "cors",
			headersList: response.headersList
		});
		else if (type === "opaque") return makeFilteredResponse(response, {
			type: "opaque",
			urlList: Object.freeze([]),
			status: 0,
			statusText: "",
			body: null
		});
		else if (type === "opaqueredirect") return makeFilteredResponse(response, {
			type: "opaqueredirect",
			status: 0,
			statusText: "",
			headersList: [],
			body: null
		});
		else assert$7(false);
	}
	function makeAppropriateNetworkError(fetchParams, err = null) {
		assert$7(isCancelled(fetchParams));
		return isAborted(fetchParams) ? makeNetworkError(Object.assign(new DOMException("The operation was aborted.", "AbortError"), { cause: err })) : makeNetworkError(Object.assign(new DOMException("Request was cancelled."), { cause: err }));
	}
	function initializeResponse(response, init, body) {
		if (init.status !== null && (init.status < 200 || init.status > 599)) throw new RangeError("init[\"status\"] must be in the range of 200 to 599, inclusive.");
		if ("statusText" in init && init.statusText != null) {
			if (!isValidReasonPhrase(String(init.statusText))) throw new TypeError("Invalid statusText");
		}
		if ("status" in init && init.status != null) response[kState].status = init.status;
		if ("statusText" in init && init.statusText != null) response[kState].statusText = init.statusText;
		if ("headers" in init && init.headers != null) fill(response[kHeaders], init.headers);
		if (body) {
			if (nullBodyStatus.includes(response.status)) throw webidl.errors.exception({
				header: "Response constructor",
				message: `Invalid response status code ${response.status}`
			});
			response[kState].body = body.body;
			if (body.type != null && !response[kState].headersList.contains("content-type", true)) response[kState].headersList.append("content-type", body.type, true);
		}
	}
	/**
	* @see https://fetch.spec.whatwg.org/#response-create
	* @param {any} innerResponse
	* @param {'request' | 'immutable' | 'request-no-cors' | 'response' | 'none'} guard
	* @returns {Response}
	*/
	function fromInnerResponse(innerResponse, guard) {
		const response = new Response(kConstruct);
		response[kState] = innerResponse;
		response[kHeaders] = new Headers(kConstruct);
		setHeadersList(response[kHeaders], innerResponse.headersList);
		setHeadersGuard(response[kHeaders], guard);
		if (hasFinalizationRegistry && innerResponse.body?.stream) streamRegistry.register(response, new WeakRef(innerResponse.body.stream));
		return response;
	}
	webidl.converters.ReadableStream = webidl.interfaceConverter(ReadableStream);
	webidl.converters.FormData = webidl.interfaceConverter(FormData);
	webidl.converters.URLSearchParams = webidl.interfaceConverter(URLSearchParams);
	webidl.converters.XMLHttpRequestBodyInit = function(V, prefix, name) {
		if (typeof V === "string") return webidl.converters.USVString(V, prefix, name);
		if (isBlobLike(V)) return webidl.converters.Blob(V, prefix, name, { strict: false });
		if (ArrayBuffer.isView(V) || types$2.isArrayBuffer(V)) return webidl.converters.BufferSource(V, prefix, name);
		if (util.isFormDataLike(V)) return webidl.converters.FormData(V, prefix, name, { strict: false });
		if (V instanceof URLSearchParams) return webidl.converters.URLSearchParams(V, prefix, name);
		return webidl.converters.DOMString(V, prefix, name);
	};
	webidl.converters.BodyInit = function(V, prefix, argument) {
		if (V instanceof ReadableStream) return webidl.converters.ReadableStream(V, prefix, argument);
		if (V?.[Symbol.asyncIterator]) return V;
		return webidl.converters.XMLHttpRequestBodyInit(V, prefix, argument);
	};
	webidl.converters.ResponseInit = webidl.dictionaryConverter([
		{
			key: "status",
			converter: webidl.converters["unsigned short"],
			defaultValue: () => 200
		},
		{
			key: "statusText",
			converter: webidl.converters.ByteString,
			defaultValue: () => ""
		},
		{
			key: "headers",
			converter: webidl.converters.HeadersInit
		}
	]);
	module.exports = {
		isNetworkError,
		makeNetworkError,
		makeResponse,
		makeAppropriateNetworkError,
		filterResponse,
		Response,
		cloneResponse,
		fromInnerResponse
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/dispatcher-weakref.js
var require_dispatcher_weakref = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kConnected, kSize } = require_symbols$4();
	var CompatWeakRef = class {
		constructor(value) {
			this.value = value;
		}
		deref() {
			return this.value[kConnected] === 0 && this.value[kSize] === 0 ? void 0 : this.value;
		}
	};
	var CompatFinalizer = class {
		constructor(finalizer) {
			this.finalizer = finalizer;
		}
		register(dispatcher, key) {
			if (dispatcher.on) dispatcher.on("disconnect", () => {
				if (dispatcher[kConnected] === 0 && dispatcher[kSize] === 0) this.finalizer(key);
			});
		}
		unregister(key) {}
	};
	module.exports = function() {
		if (process.env.NODE_V8_COVERAGE && process.version.startsWith("v18")) {
			process._rawDebug("Using compatibility WeakRef and FinalizationRegistry");
			return {
				WeakRef: CompatWeakRef,
				FinalizationRegistry: CompatFinalizer
			};
		}
		return {
			WeakRef,
			FinalizationRegistry
		};
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { extractBody, mixinBody, cloneBody, bodyUnusable } = require_body();
	const { Headers, fill: fillHeaders, HeadersList, setHeadersGuard, getHeadersGuard, setHeadersList, getHeadersList } = require_headers();
	const { FinalizationRegistry } = require_dispatcher_weakref()();
	const util = require_util$7();
	const nodeUtil = __require("node:util");
	const { isValidHTTPToken, sameOrigin, environmentSettingsObject } = require_util$6();
	const { forbiddenMethodsSet, corsSafeListedMethodsSet, referrerPolicy, requestRedirect, requestMode, requestCredentials, requestCache, requestDuplex } = require_constants$2();
	const { kEnumerableProperty, normalizedMethodRecordsBase, normalizedMethodRecords } = util;
	const { kHeaders, kSignal, kState, kDispatcher } = require_symbols$3();
	const { webidl } = require_webidl();
	const { URLSerializer } = require_data_url();
	const { kConstruct } = require_symbols$4();
	const assert$6 = __require("node:assert");
	const { getMaxListeners, setMaxListeners, getEventListeners, defaultMaxListeners } = __require("node:events");
	const kAbortController = Symbol("abortController");
	const requestFinalizer = new FinalizationRegistry(({ signal, abort }) => {
		signal.removeEventListener("abort", abort);
	});
	const dependentControllerMap = /* @__PURE__ */ new WeakMap();
	function buildAbort(acRef) {
		return abort;
		function abort() {
			const ac = acRef.deref();
			if (ac !== void 0) {
				requestFinalizer.unregister(abort);
				this.removeEventListener("abort", abort);
				ac.abort(this.reason);
				const controllerList = dependentControllerMap.get(ac.signal);
				if (controllerList !== void 0) {
					if (controllerList.size !== 0) {
						for (const ref of controllerList) {
							const ctrl = ref.deref();
							if (ctrl !== void 0) ctrl.abort(this.reason);
						}
						controllerList.clear();
					}
					dependentControllerMap.delete(ac.signal);
				}
			}
		}
	}
	let patchMethodWarning = false;
	var Request = class Request {
		constructor(input, init = {}) {
			webidl.util.markAsUncloneable(this);
			if (input === kConstruct) return;
			const prefix = "Request constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			input = webidl.converters.RequestInfo(input, prefix, "input");
			init = webidl.converters.RequestInit(init, prefix, "init");
			let request = null;
			let fallbackMode = null;
			const baseUrl = environmentSettingsObject.settingsObject.baseUrl;
			let signal = null;
			if (typeof input === "string") {
				this[kDispatcher] = init.dispatcher;
				let parsedURL;
				try {
					parsedURL = new URL(input, baseUrl);
				} catch (err) {
					throw new TypeError("Failed to parse URL from " + input, { cause: err });
				}
				if (parsedURL.username || parsedURL.password) throw new TypeError("Request cannot be constructed from a URL that includes credentials: " + input);
				request = makeRequest({ urlList: [parsedURL] });
				fallbackMode = "cors";
			} else {
				this[kDispatcher] = init.dispatcher || input[kDispatcher];
				assert$6(input instanceof Request);
				request = input[kState];
				signal = input[kSignal];
			}
			const origin = environmentSettingsObject.settingsObject.origin;
			let window = "client";
			if (request.window?.constructor?.name === "EnvironmentSettingsObject" && sameOrigin(request.window, origin)) window = request.window;
			if (init.window != null) throw new TypeError(`'window' option '${window}' must be null`);
			if ("window" in init) window = "no-window";
			request = makeRequest({
				method: request.method,
				headersList: request.headersList,
				unsafeRequest: request.unsafeRequest,
				client: environmentSettingsObject.settingsObject,
				window,
				priority: request.priority,
				origin: request.origin,
				referrer: request.referrer,
				referrerPolicy: request.referrerPolicy,
				mode: request.mode,
				credentials: request.credentials,
				cache: request.cache,
				redirect: request.redirect,
				integrity: request.integrity,
				keepalive: request.keepalive,
				reloadNavigation: request.reloadNavigation,
				historyNavigation: request.historyNavigation,
				urlList: [...request.urlList]
			});
			const initHasKey = Object.keys(init).length !== 0;
			if (initHasKey) {
				if (request.mode === "navigate") request.mode = "same-origin";
				request.reloadNavigation = false;
				request.historyNavigation = false;
				request.origin = "client";
				request.referrer = "client";
				request.referrerPolicy = "";
				request.url = request.urlList[request.urlList.length - 1];
				request.urlList = [request.url];
			}
			if (init.referrer !== void 0) {
				const referrer = init.referrer;
				if (referrer === "") request.referrer = "no-referrer";
				else {
					let parsedReferrer;
					try {
						parsedReferrer = new URL(referrer, baseUrl);
					} catch (err) {
						throw new TypeError(`Referrer "${referrer}" is not a valid URL.`, { cause: err });
					}
					if (parsedReferrer.protocol === "about:" && parsedReferrer.hostname === "client" || origin && !sameOrigin(parsedReferrer, environmentSettingsObject.settingsObject.baseUrl)) request.referrer = "client";
					else request.referrer = parsedReferrer;
				}
			}
			if (init.referrerPolicy !== void 0) request.referrerPolicy = init.referrerPolicy;
			let mode;
			if (init.mode !== void 0) mode = init.mode;
			else mode = fallbackMode;
			if (mode === "navigate") throw webidl.errors.exception({
				header: "Request constructor",
				message: "invalid request mode navigate."
			});
			if (mode != null) request.mode = mode;
			if (init.credentials !== void 0) request.credentials = init.credentials;
			if (init.cache !== void 0) request.cache = init.cache;
			if (request.cache === "only-if-cached" && request.mode !== "same-origin") throw new TypeError("'only-if-cached' can be set only with 'same-origin' mode");
			if (init.redirect !== void 0) request.redirect = init.redirect;
			if (init.integrity != null) request.integrity = String(init.integrity);
			if (init.keepalive !== void 0) request.keepalive = Boolean(init.keepalive);
			if (init.method !== void 0) {
				let method = init.method;
				const mayBeNormalized = normalizedMethodRecords[method];
				if (mayBeNormalized !== void 0) request.method = mayBeNormalized;
				else {
					if (!isValidHTTPToken(method)) throw new TypeError(`'${method}' is not a valid HTTP method.`);
					const upperCase = method.toUpperCase();
					if (forbiddenMethodsSet.has(upperCase)) throw new TypeError(`'${method}' HTTP method is unsupported.`);
					method = normalizedMethodRecordsBase[upperCase] ?? method;
					request.method = method;
				}
				if (!patchMethodWarning && request.method === "patch") {
					process.emitWarning("Using `patch` is highly likely to result in a `405 Method Not Allowed`. `PATCH` is much more likely to succeed.", { code: "UNDICI-FETCH-patch" });
					patchMethodWarning = true;
				}
			}
			if (init.signal !== void 0) signal = init.signal;
			this[kState] = request;
			const ac = new AbortController();
			this[kSignal] = ac.signal;
			if (signal != null) {
				if (!signal || typeof signal.aborted !== "boolean" || typeof signal.addEventListener !== "function") throw new TypeError("Failed to construct 'Request': member signal is not of type AbortSignal.");
				if (signal.aborted) ac.abort(signal.reason);
				else {
					this[kAbortController] = ac;
					const abort = buildAbort(new WeakRef(ac));
					try {
						if (typeof getMaxListeners === "function" && getMaxListeners(signal) === defaultMaxListeners) setMaxListeners(1500, signal);
						else if (getEventListeners(signal, "abort").length >= defaultMaxListeners) setMaxListeners(1500, signal);
					} catch {}
					util.addAbortListener(signal, abort);
					requestFinalizer.register(ac, {
						signal,
						abort
					}, abort);
				}
			}
			this[kHeaders] = new Headers(kConstruct);
			setHeadersList(this[kHeaders], request.headersList);
			setHeadersGuard(this[kHeaders], "request");
			if (mode === "no-cors") {
				if (!corsSafeListedMethodsSet.has(request.method)) throw new TypeError(`'${request.method} is unsupported in no-cors mode.`);
				setHeadersGuard(this[kHeaders], "request-no-cors");
			}
			if (initHasKey) {
				/** @type {HeadersList} */
				const headersList = getHeadersList(this[kHeaders]);
				const headers = init.headers !== void 0 ? init.headers : new HeadersList(headersList);
				headersList.clear();
				if (headers instanceof HeadersList) {
					for (const { name, value } of headers.rawValues()) headersList.append(name, value, false);
					headersList.cookies = headers.cookies;
				} else fillHeaders(this[kHeaders], headers);
			}
			const inputBody = input instanceof Request ? input[kState].body : null;
			if ((init.body != null || inputBody != null) && (request.method === "GET" || request.method === "HEAD")) throw new TypeError("Request with GET/HEAD method cannot have body.");
			let initBody = null;
			if (init.body != null) {
				const [extractedBody, contentType] = extractBody(init.body, request.keepalive);
				initBody = extractedBody;
				if (contentType && !getHeadersList(this[kHeaders]).contains("content-type", true)) this[kHeaders].append("content-type", contentType);
			}
			const inputOrInitBody = initBody ?? inputBody;
			if (inputOrInitBody != null && inputOrInitBody.source == null) {
				if (initBody != null && init.duplex == null) throw new TypeError("RequestInit: duplex option is required when sending a body.");
				if (request.mode !== "same-origin" && request.mode !== "cors") throw new TypeError("If request is made from ReadableStream, mode should be \"same-origin\" or \"cors\"");
				request.useCORSPreflightFlag = true;
			}
			let finalBody = inputOrInitBody;
			if (initBody == null && inputBody != null) {
				if (bodyUnusable(input)) throw new TypeError("Cannot construct a Request with a Request object that has already been used.");
				const identityTransform = new TransformStream();
				inputBody.stream.pipeThrough(identityTransform);
				finalBody = {
					source: inputBody.source,
					length: inputBody.length,
					stream: identityTransform.readable
				};
			}
			this[kState].body = finalBody;
		}
		get method() {
			webidl.brandCheck(this, Request);
			return this[kState].method;
		}
		get url() {
			webidl.brandCheck(this, Request);
			return URLSerializer(this[kState].url);
		}
		get headers() {
			webidl.brandCheck(this, Request);
			return this[kHeaders];
		}
		get destination() {
			webidl.brandCheck(this, Request);
			return this[kState].destination;
		}
		get referrer() {
			webidl.brandCheck(this, Request);
			if (this[kState].referrer === "no-referrer") return "";
			if (this[kState].referrer === "client") return "about:client";
			return this[kState].referrer.toString();
		}
		get referrerPolicy() {
			webidl.brandCheck(this, Request);
			return this[kState].referrerPolicy;
		}
		get mode() {
			webidl.brandCheck(this, Request);
			return this[kState].mode;
		}
		get credentials() {
			return this[kState].credentials;
		}
		get cache() {
			webidl.brandCheck(this, Request);
			return this[kState].cache;
		}
		get redirect() {
			webidl.brandCheck(this, Request);
			return this[kState].redirect;
		}
		get integrity() {
			webidl.brandCheck(this, Request);
			return this[kState].integrity;
		}
		get keepalive() {
			webidl.brandCheck(this, Request);
			return this[kState].keepalive;
		}
		get isReloadNavigation() {
			webidl.brandCheck(this, Request);
			return this[kState].reloadNavigation;
		}
		get isHistoryNavigation() {
			webidl.brandCheck(this, Request);
			return this[kState].historyNavigation;
		}
		get signal() {
			webidl.brandCheck(this, Request);
			return this[kSignal];
		}
		get body() {
			webidl.brandCheck(this, Request);
			return this[kState].body ? this[kState].body.stream : null;
		}
		get bodyUsed() {
			webidl.brandCheck(this, Request);
			return !!this[kState].body && util.isDisturbed(this[kState].body.stream);
		}
		get duplex() {
			webidl.brandCheck(this, Request);
			return "half";
		}
		clone() {
			webidl.brandCheck(this, Request);
			if (bodyUnusable(this)) throw new TypeError("unusable");
			const clonedRequest = cloneRequest(this[kState]);
			const ac = new AbortController();
			if (this.signal.aborted) ac.abort(this.signal.reason);
			else {
				let list = dependentControllerMap.get(this.signal);
				if (list === void 0) {
					list = /* @__PURE__ */ new Set();
					dependentControllerMap.set(this.signal, list);
				}
				const acRef = new WeakRef(ac);
				list.add(acRef);
				util.addAbortListener(ac.signal, buildAbort(acRef));
			}
			return fromInnerRequest(clonedRequest, ac.signal, getHeadersGuard(this[kHeaders]));
		}
		[nodeUtil.inspect.custom](depth, options) {
			if (options.depth === null) options.depth = 2;
			options.colors ??= true;
			const properties = {
				method: this.method,
				url: this.url,
				headers: this.headers,
				destination: this.destination,
				referrer: this.referrer,
				referrerPolicy: this.referrerPolicy,
				mode: this.mode,
				credentials: this.credentials,
				cache: this.cache,
				redirect: this.redirect,
				integrity: this.integrity,
				keepalive: this.keepalive,
				isReloadNavigation: this.isReloadNavigation,
				isHistoryNavigation: this.isHistoryNavigation,
				signal: this.signal
			};
			return `Request ${nodeUtil.formatWithOptions(options, properties)}`;
		}
	};
	mixinBody(Request);
	function makeRequest(init) {
		return {
			method: init.method ?? "GET",
			localURLsOnly: init.localURLsOnly ?? false,
			unsafeRequest: init.unsafeRequest ?? false,
			body: init.body ?? null,
			client: init.client ?? null,
			reservedClient: init.reservedClient ?? null,
			replacesClientId: init.replacesClientId ?? "",
			window: init.window ?? "client",
			keepalive: init.keepalive ?? false,
			serviceWorkers: init.serviceWorkers ?? "all",
			initiator: init.initiator ?? "",
			destination: init.destination ?? "",
			priority: init.priority ?? null,
			origin: init.origin ?? "client",
			policyContainer: init.policyContainer ?? "client",
			referrer: init.referrer ?? "client",
			referrerPolicy: init.referrerPolicy ?? "",
			mode: init.mode ?? "no-cors",
			useCORSPreflightFlag: init.useCORSPreflightFlag ?? false,
			credentials: init.credentials ?? "same-origin",
			useCredentials: init.useCredentials ?? false,
			cache: init.cache ?? "default",
			redirect: init.redirect ?? "follow",
			integrity: init.integrity ?? "",
			cryptoGraphicsNonceMetadata: init.cryptoGraphicsNonceMetadata ?? "",
			parserMetadata: init.parserMetadata ?? "",
			reloadNavigation: init.reloadNavigation ?? false,
			historyNavigation: init.historyNavigation ?? false,
			userActivation: init.userActivation ?? false,
			taintedOrigin: init.taintedOrigin ?? false,
			redirectCount: init.redirectCount ?? 0,
			responseTainting: init.responseTainting ?? "basic",
			preventNoCacheCacheControlHeaderModification: init.preventNoCacheCacheControlHeaderModification ?? false,
			done: init.done ?? false,
			timingAllowFailed: init.timingAllowFailed ?? false,
			urlList: init.urlList,
			url: init.urlList[0],
			headersList: init.headersList ? new HeadersList(init.headersList) : new HeadersList()
		};
	}
	function cloneRequest(request) {
		const newRequest = makeRequest({
			...request,
			body: null
		});
		if (request.body != null) newRequest.body = cloneBody(newRequest, request.body);
		return newRequest;
	}
	/**
	* @see https://fetch.spec.whatwg.org/#request-create
	* @param {any} innerRequest
	* @param {AbortSignal} signal
	* @param {'request' | 'immutable' | 'request-no-cors' | 'response' | 'none'} guard
	* @returns {Request}
	*/
	function fromInnerRequest(innerRequest, signal, guard) {
		const request = new Request(kConstruct);
		request[kState] = innerRequest;
		request[kSignal] = signal;
		request[kHeaders] = new Headers(kConstruct);
		setHeadersList(request[kHeaders], innerRequest.headersList);
		setHeadersGuard(request[kHeaders], guard);
		return request;
	}
	Object.defineProperties(Request.prototype, {
		method: kEnumerableProperty,
		url: kEnumerableProperty,
		headers: kEnumerableProperty,
		redirect: kEnumerableProperty,
		clone: kEnumerableProperty,
		signal: kEnumerableProperty,
		duplex: kEnumerableProperty,
		destination: kEnumerableProperty,
		body: kEnumerableProperty,
		bodyUsed: kEnumerableProperty,
		isHistoryNavigation: kEnumerableProperty,
		isReloadNavigation: kEnumerableProperty,
		keepalive: kEnumerableProperty,
		integrity: kEnumerableProperty,
		cache: kEnumerableProperty,
		credentials: kEnumerableProperty,
		attribute: kEnumerableProperty,
		referrerPolicy: kEnumerableProperty,
		referrer: kEnumerableProperty,
		mode: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "Request",
			configurable: true
		}
	});
	webidl.converters.Request = webidl.interfaceConverter(Request);
	webidl.converters.RequestInfo = function(V, prefix, argument) {
		if (typeof V === "string") return webidl.converters.USVString(V, prefix, argument);
		if (V instanceof Request) return webidl.converters.Request(V, prefix, argument);
		return webidl.converters.USVString(V, prefix, argument);
	};
	webidl.converters.AbortSignal = webidl.interfaceConverter(AbortSignal);
	webidl.converters.RequestInit = webidl.dictionaryConverter([
		{
			key: "method",
			converter: webidl.converters.ByteString
		},
		{
			key: "headers",
			converter: webidl.converters.HeadersInit
		},
		{
			key: "body",
			converter: webidl.nullableConverter(webidl.converters.BodyInit)
		},
		{
			key: "referrer",
			converter: webidl.converters.USVString
		},
		{
			key: "referrerPolicy",
			converter: webidl.converters.DOMString,
			allowedValues: referrerPolicy
		},
		{
			key: "mode",
			converter: webidl.converters.DOMString,
			allowedValues: requestMode
		},
		{
			key: "credentials",
			converter: webidl.converters.DOMString,
			allowedValues: requestCredentials
		},
		{
			key: "cache",
			converter: webidl.converters.DOMString,
			allowedValues: requestCache
		},
		{
			key: "redirect",
			converter: webidl.converters.DOMString,
			allowedValues: requestRedirect
		},
		{
			key: "integrity",
			converter: webidl.converters.DOMString
		},
		{
			key: "keepalive",
			converter: webidl.converters.boolean
		},
		{
			key: "signal",
			converter: webidl.nullableConverter((signal) => webidl.converters.AbortSignal(signal, "RequestInit", "signal", { strict: false }))
		},
		{
			key: "window",
			converter: webidl.converters.any
		},
		{
			key: "duplex",
			converter: webidl.converters.DOMString,
			allowedValues: requestDuplex
		},
		{
			key: "dispatcher",
			converter: webidl.converters.any
		}
	]);
	module.exports = {
		Request,
		makeRequest,
		fromInnerRequest,
		cloneRequest
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fetch/index.js
var require_fetch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { makeNetworkError, makeAppropriateNetworkError, filterResponse, makeResponse, fromInnerResponse } = require_response();
	const { HeadersList } = require_headers();
	const { Request, cloneRequest } = require_request();
	const zlib = __require("node:zlib");
	const { bytesMatch, makePolicyContainer, clonePolicyContainer, requestBadPort, TAOCheck, appendRequestOriginHeader, responseLocationURL, requestCurrentURL, setRequestReferrerPolicyOnRedirect, tryUpgradeRequestToAPotentiallyTrustworthyURL, createOpaqueTimingInfo, appendFetchMetadata, corsCheck, crossOriginResourcePolicyCheck, determineRequestsReferrer, coarsenedSharedCurrentTime, createDeferredPromise, isBlobLike, sameOrigin, isCancelled, isAborted, isErrorLike, fullyReadBody, readableStreamClose, isomorphicEncode, urlIsLocal, urlIsHttpHttpsScheme, urlHasHttpsScheme, clampAndCoarsenConnectionTimingInfo, simpleRangeHeaderValue, buildContentRange, createInflate, extractMimeType } = require_util$6();
	const { kState, kDispatcher } = require_symbols$3();
	const assert$5 = __require("node:assert");
	const { safelyExtractBody, extractBody } = require_body();
	const { redirectStatusSet, nullBodyStatus, safeMethodsSet, requestBodyHeader, subresourceSet } = require_constants$2();
	const EE$1 = __require("node:events");
	const { Readable, pipeline: pipeline$1, finished } = __require("node:stream");
	const { addAbortListener, isErrored, isReadable, bufferToLowerCasedHeaderName } = require_util$7();
	const { dataURLProcessor, serializeAMimeType, minimizeSupportedMimeType } = require_data_url();
	const { getGlobalDispatcher } = require_global();
	const { webidl } = require_webidl();
	const { STATUS_CODES } = __require("node:http");
	const GET_OR_HEAD = ["GET", "HEAD"];
	const defaultUserAgent = typeof __UNDICI_IS_NODE__ !== "undefined" || typeof esbuildDetection !== "undefined" ? "node" : "undici";
	/** @type {import('buffer').resolveObjectURL} */
	let resolveObjectURL;
	var Fetch = class extends EE$1 {
		constructor(dispatcher) {
			super();
			this.dispatcher = dispatcher;
			this.connection = null;
			this.dump = false;
			this.state = "ongoing";
		}
		terminate(reason) {
			if (this.state !== "ongoing") return;
			this.state = "terminated";
			this.connection?.destroy(reason);
			this.emit("terminated", reason);
		}
		abort(error) {
			if (this.state !== "ongoing") return;
			this.state = "aborted";
			if (!error) error = new DOMException("The operation was aborted.", "AbortError");
			this.serializedAbortReason = error;
			this.connection?.destroy(error);
			this.emit("terminated", error);
		}
	};
	function handleFetchDone(response) {
		finalizeAndReportTiming(response, "fetch");
	}
	function fetch(input, init = void 0) {
		webidl.argumentLengthCheck(arguments, 1, "globalThis.fetch");
		let p = createDeferredPromise();
		let requestObject;
		try {
			requestObject = new Request(input, init);
		} catch (e) {
			p.reject(e);
			return p.promise;
		}
		const request = requestObject[kState];
		if (requestObject.signal.aborted) {
			abortFetch(p, request, null, requestObject.signal.reason);
			return p.promise;
		}
		if (request.client.globalObject?.constructor?.name === "ServiceWorkerGlobalScope") request.serviceWorkers = "none";
		let responseObject = null;
		let locallyAborted = false;
		let controller = null;
		addAbortListener(requestObject.signal, () => {
			locallyAborted = true;
			assert$5(controller != null);
			controller.abort(requestObject.signal.reason);
			const realResponse = responseObject?.deref();
			abortFetch(p, request, realResponse, requestObject.signal.reason);
		});
		const processResponse = (response) => {
			if (locallyAborted) return;
			if (response.aborted) {
				abortFetch(p, request, responseObject, controller.serializedAbortReason);
				return;
			}
			if (response.type === "error") {
				p.reject(new TypeError("fetch failed", { cause: response.error }));
				return;
			}
			responseObject = new WeakRef(fromInnerResponse(response, "immutable"));
			p.resolve(responseObject.deref());
			p = null;
		};
		controller = fetching({
			request,
			processResponseEndOfBody: handleFetchDone,
			processResponse,
			dispatcher: requestObject[kDispatcher]
		});
		return p.promise;
	}
	function finalizeAndReportTiming(response, initiatorType = "other") {
		if (response.type === "error" && response.aborted) return;
		if (!response.urlList?.length) return;
		const originalURL = response.urlList[0];
		let timingInfo = response.timingInfo;
		let cacheState = response.cacheState;
		if (!urlIsHttpHttpsScheme(originalURL)) return;
		if (timingInfo === null) return;
		if (!response.timingAllowPassed) {
			timingInfo = createOpaqueTimingInfo({ startTime: timingInfo.startTime });
			cacheState = "";
		}
		timingInfo.endTime = coarsenedSharedCurrentTime();
		response.timingInfo = timingInfo;
		markResourceTiming(timingInfo, originalURL.href, initiatorType, globalThis, cacheState);
	}
	const markResourceTiming = performance.markResourceTiming;
	function abortFetch(p, request, responseObject, error) {
		if (p) p.reject(error);
		if (request.body != null && isReadable(request.body?.stream)) request.body.stream.cancel(error).catch((err) => {
			if (err.code === "ERR_INVALID_STATE") return;
			throw err;
		});
		if (responseObject == null) return;
		const response = responseObject[kState];
		if (response.body != null && isReadable(response.body?.stream)) response.body.stream.cancel(error).catch((err) => {
			if (err.code === "ERR_INVALID_STATE") return;
			throw err;
		});
	}
	function fetching({ request, processRequestBodyChunkLength, processRequestEndOfBody, processResponse, processResponseEndOfBody, processResponseConsumeBody, useParallelQueue = false, dispatcher = getGlobalDispatcher() }) {
		assert$5(dispatcher);
		let taskDestination = null;
		let crossOriginIsolatedCapability = false;
		if (request.client != null) {
			taskDestination = request.client.globalObject;
			crossOriginIsolatedCapability = request.client.crossOriginIsolatedCapability;
		}
		const timingInfo = createOpaqueTimingInfo({ startTime: coarsenedSharedCurrentTime(crossOriginIsolatedCapability) });
		const fetchParams = {
			controller: new Fetch(dispatcher),
			request,
			timingInfo,
			processRequestBodyChunkLength,
			processRequestEndOfBody,
			processResponse,
			processResponseConsumeBody,
			processResponseEndOfBody,
			taskDestination,
			crossOriginIsolatedCapability
		};
		assert$5(!request.body || request.body.stream);
		if (request.window === "client") request.window = request.client?.globalObject?.constructor?.name === "Window" ? request.client : "no-window";
		if (request.origin === "client") request.origin = request.client.origin;
		if (request.policyContainer === "client") if (request.client != null) request.policyContainer = clonePolicyContainer(request.client.policyContainer);
		else request.policyContainer = makePolicyContainer();
		if (!request.headersList.contains("accept", true)) request.headersList.append("accept", "*/*", true);
		if (!request.headersList.contains("accept-language", true)) request.headersList.append("accept-language", "*", true);
		if (request.priority === null) {}
		if (subresourceSet.has(request.destination)) {}
		mainFetch(fetchParams).catch((err) => {
			fetchParams.controller.terminate(err);
		});
		return fetchParams.controller;
	}
	async function mainFetch(fetchParams, recursive = false) {
		const request = fetchParams.request;
		let response = null;
		if (request.localURLsOnly && !urlIsLocal(requestCurrentURL(request))) response = makeNetworkError("local URLs only");
		tryUpgradeRequestToAPotentiallyTrustworthyURL(request);
		if (requestBadPort(request) === "blocked") response = makeNetworkError("bad port");
		if (request.referrerPolicy === "") request.referrerPolicy = request.policyContainer.referrerPolicy;
		if (request.referrer !== "no-referrer") request.referrer = determineRequestsReferrer(request);
		if (response === null) response = await (async () => {
			const currentURL = requestCurrentURL(request);
			if (sameOrigin(currentURL, request.url) && request.responseTainting === "basic" || currentURL.protocol === "data:" || request.mode === "navigate" || request.mode === "websocket") {
				request.responseTainting = "basic";
				return await schemeFetch(fetchParams);
			}
			if (request.mode === "same-origin") return makeNetworkError("request mode cannot be \"same-origin\"");
			if (request.mode === "no-cors") {
				if (request.redirect !== "follow") return makeNetworkError("redirect mode cannot be \"follow\" for \"no-cors\" request");
				request.responseTainting = "opaque";
				return await schemeFetch(fetchParams);
			}
			if (!urlIsHttpHttpsScheme(requestCurrentURL(request))) return makeNetworkError("URL scheme must be a HTTP(S) scheme");
			request.responseTainting = "cors";
			return await httpFetch(fetchParams);
		})();
		if (recursive) return response;
		if (response.status !== 0 && !response.internalResponse) {
			if (request.responseTainting === "cors") {}
			if (request.responseTainting === "basic") response = filterResponse(response, "basic");
			else if (request.responseTainting === "cors") response = filterResponse(response, "cors");
			else if (request.responseTainting === "opaque") response = filterResponse(response, "opaque");
			else assert$5(false);
		}
		let internalResponse = response.status === 0 ? response : response.internalResponse;
		if (internalResponse.urlList.length === 0) internalResponse.urlList.push(...request.urlList);
		if (!request.timingAllowFailed) response.timingAllowPassed = true;
		if (response.type === "opaque" && internalResponse.status === 206 && internalResponse.rangeRequested && !request.headers.contains("range", true)) response = internalResponse = makeNetworkError();
		if (response.status !== 0 && (request.method === "HEAD" || request.method === "CONNECT" || nullBodyStatus.includes(internalResponse.status))) {
			internalResponse.body = null;
			fetchParams.controller.dump = true;
		}
		if (request.integrity) {
			const processBodyError = (reason) => fetchFinale(fetchParams, makeNetworkError(reason));
			if (request.responseTainting === "opaque" || response.body == null) {
				processBodyError(response.error);
				return;
			}
			const processBody = (bytes) => {
				if (!bytesMatch(bytes, request.integrity)) {
					processBodyError("integrity mismatch");
					return;
				}
				response.body = safelyExtractBody(bytes)[0];
				fetchFinale(fetchParams, response);
			};
			await fullyReadBody(response.body, processBody, processBodyError);
		} else fetchFinale(fetchParams, response);
	}
	function schemeFetch(fetchParams) {
		if (isCancelled(fetchParams) && fetchParams.request.redirectCount === 0) return Promise.resolve(makeAppropriateNetworkError(fetchParams));
		const { request } = fetchParams;
		const { protocol: scheme } = requestCurrentURL(request);
		switch (scheme) {
			case "about:": return Promise.resolve(makeNetworkError("about scheme is not supported"));
			case "blob:": {
				if (!resolveObjectURL) resolveObjectURL = __require("node:buffer").resolveObjectURL;
				const blobURLEntry = requestCurrentURL(request);
				if (blobURLEntry.search.length !== 0) return Promise.resolve(makeNetworkError("NetworkError when attempting to fetch resource."));
				const blob = resolveObjectURL(blobURLEntry.toString());
				if (request.method !== "GET" || !isBlobLike(blob)) return Promise.resolve(makeNetworkError("invalid method"));
				const response = makeResponse();
				const fullLength = blob.size;
				const serializedFullLength = isomorphicEncode(`${fullLength}`);
				const type = blob.type;
				if (!request.headersList.contains("range", true)) {
					const bodyWithType = extractBody(blob);
					response.statusText = "OK";
					response.body = bodyWithType[0];
					response.headersList.set("content-length", serializedFullLength, true);
					response.headersList.set("content-type", type, true);
				} else {
					response.rangeRequested = true;
					const rangeValue = simpleRangeHeaderValue(request.headersList.get("range", true), true);
					if (rangeValue === "failure") return Promise.resolve(makeNetworkError("failed to fetch the data URL"));
					let { rangeStartValue: rangeStart, rangeEndValue: rangeEnd } = rangeValue;
					if (rangeStart === null) {
						rangeStart = fullLength - rangeEnd;
						rangeEnd = rangeStart + rangeEnd - 1;
					} else {
						if (rangeStart >= fullLength) return Promise.resolve(makeNetworkError("Range start is greater than the blob's size."));
						if (rangeEnd === null || rangeEnd >= fullLength) rangeEnd = fullLength - 1;
					}
					const slicedBlob = blob.slice(rangeStart, rangeEnd, type);
					response.body = extractBody(slicedBlob)[0];
					const serializedSlicedLength = isomorphicEncode(`${slicedBlob.size}`);
					const contentRange = buildContentRange(rangeStart, rangeEnd, fullLength);
					response.status = 206;
					response.statusText = "Partial Content";
					response.headersList.set("content-length", serializedSlicedLength, true);
					response.headersList.set("content-type", type, true);
					response.headersList.set("content-range", contentRange, true);
				}
				return Promise.resolve(response);
			}
			case "data:": {
				const dataURLStruct = dataURLProcessor(requestCurrentURL(request));
				if (dataURLStruct === "failure") return Promise.resolve(makeNetworkError("failed to fetch the data URL"));
				const mimeType = serializeAMimeType(dataURLStruct.mimeType);
				return Promise.resolve(makeResponse({
					statusText: "OK",
					headersList: [["content-type", {
						name: "Content-Type",
						value: mimeType
					}]],
					body: safelyExtractBody(dataURLStruct.body)[0]
				}));
			}
			case "file:": return Promise.resolve(makeNetworkError("not implemented... yet..."));
			case "http:":
			case "https:": return httpFetch(fetchParams).catch((err) => makeNetworkError(err));
			default: return Promise.resolve(makeNetworkError("unknown scheme"));
		}
	}
	function finalizeResponse(fetchParams, response) {
		fetchParams.request.done = true;
		if (fetchParams.processResponseDone != null) queueMicrotask(() => fetchParams.processResponseDone(response));
	}
	function fetchFinale(fetchParams, response) {
		let timingInfo = fetchParams.timingInfo;
		const processResponseEndOfBody = () => {
			const unsafeEndTime = Date.now();
			if (fetchParams.request.destination === "document") fetchParams.controller.fullTimingInfo = timingInfo;
			fetchParams.controller.reportTimingSteps = () => {
				if (fetchParams.request.url.protocol !== "https:") return;
				timingInfo.endTime = unsafeEndTime;
				let cacheState = response.cacheState;
				const bodyInfo = response.bodyInfo;
				if (!response.timingAllowPassed) {
					timingInfo = createOpaqueTimingInfo(timingInfo);
					cacheState = "";
				}
				let responseStatus = 0;
				if (fetchParams.request.mode !== "navigator" || !response.hasCrossOriginRedirects) {
					responseStatus = response.status;
					const mimeType = extractMimeType(response.headersList);
					if (mimeType !== "failure") bodyInfo.contentType = minimizeSupportedMimeType(mimeType);
				}
				if (fetchParams.request.initiatorType != null) markResourceTiming(timingInfo, fetchParams.request.url.href, fetchParams.request.initiatorType, globalThis, cacheState, bodyInfo, responseStatus);
			};
			const processResponseEndOfBodyTask = () => {
				fetchParams.request.done = true;
				if (fetchParams.processResponseEndOfBody != null) queueMicrotask(() => fetchParams.processResponseEndOfBody(response));
				if (fetchParams.request.initiatorType != null) fetchParams.controller.reportTimingSteps();
			};
			queueMicrotask(() => processResponseEndOfBodyTask());
		};
		if (fetchParams.processResponse != null) queueMicrotask(() => {
			fetchParams.processResponse(response);
			fetchParams.processResponse = null;
		});
		const internalResponse = response.type === "error" ? response : response.internalResponse ?? response;
		if (internalResponse.body == null) processResponseEndOfBody();
		else finished(internalResponse.body.stream, () => {
			processResponseEndOfBody();
		});
	}
	async function httpFetch(fetchParams) {
		const request = fetchParams.request;
		let response = null;
		let actualResponse = null;
		const timingInfo = fetchParams.timingInfo;
		if (request.serviceWorkers === "all") {}
		if (response === null) {
			if (request.redirect === "follow") request.serviceWorkers = "none";
			actualResponse = response = await httpNetworkOrCacheFetch(fetchParams);
			if (request.responseTainting === "cors" && corsCheck(request, response) === "failure") return makeNetworkError("cors failure");
			if (TAOCheck(request, response) === "failure") request.timingAllowFailed = true;
		}
		if ((request.responseTainting === "opaque" || response.type === "opaque") && crossOriginResourcePolicyCheck(request.origin, request.client, request.destination, actualResponse) === "blocked") return makeNetworkError("blocked");
		if (redirectStatusSet.has(actualResponse.status)) {
			if (request.redirect !== "manual") fetchParams.controller.connection.destroy(void 0, false);
			if (request.redirect === "error") response = makeNetworkError("unexpected redirect");
			else if (request.redirect === "manual") response = actualResponse;
			else if (request.redirect === "follow") response = await httpRedirectFetch(fetchParams, response);
			else assert$5(false);
		}
		response.timingInfo = timingInfo;
		return response;
	}
	function httpRedirectFetch(fetchParams, response) {
		const request = fetchParams.request;
		const actualResponse = response.internalResponse ? response.internalResponse : response;
		let locationURL;
		try {
			locationURL = responseLocationURL(actualResponse, requestCurrentURL(request).hash);
			if (locationURL == null) return response;
		} catch (err) {
			return Promise.resolve(makeNetworkError(err));
		}
		if (!urlIsHttpHttpsScheme(locationURL)) return Promise.resolve(makeNetworkError("URL scheme must be a HTTP(S) scheme"));
		if (request.redirectCount === 20) return Promise.resolve(makeNetworkError("redirect count exceeded"));
		request.redirectCount += 1;
		if (request.mode === "cors" && (locationURL.username || locationURL.password) && !sameOrigin(request, locationURL)) return Promise.resolve(makeNetworkError("cross origin not allowed for request mode \"cors\""));
		if (request.responseTainting === "cors" && (locationURL.username || locationURL.password)) return Promise.resolve(makeNetworkError("URL cannot contain credentials for request mode \"cors\""));
		if (actualResponse.status !== 303 && request.body != null && request.body.source == null) return Promise.resolve(makeNetworkError());
		if ([301, 302].includes(actualResponse.status) && request.method === "POST" || actualResponse.status === 303 && !GET_OR_HEAD.includes(request.method)) {
			request.method = "GET";
			request.body = null;
			for (const headerName of requestBodyHeader) request.headersList.delete(headerName);
		}
		if (!sameOrigin(requestCurrentURL(request), locationURL)) {
			request.headersList.delete("authorization", true);
			request.headersList.delete("proxy-authorization", true);
			request.headersList.delete("cookie", true);
			request.headersList.delete("host", true);
		}
		if (request.body != null) {
			assert$5(request.body.source != null);
			request.body = safelyExtractBody(request.body.source)[0];
		}
		const timingInfo = fetchParams.timingInfo;
		timingInfo.redirectEndTime = timingInfo.postRedirectStartTime = coarsenedSharedCurrentTime(fetchParams.crossOriginIsolatedCapability);
		if (timingInfo.redirectStartTime === 0) timingInfo.redirectStartTime = timingInfo.startTime;
		request.urlList.push(locationURL);
		setRequestReferrerPolicyOnRedirect(request, actualResponse);
		return mainFetch(fetchParams, true);
	}
	async function httpNetworkOrCacheFetch(fetchParams, isAuthenticationFetch = false, isNewConnectionFetch = false) {
		const request = fetchParams.request;
		let httpFetchParams = null;
		let httpRequest = null;
		let response = null;
		const httpCache = null;
		if (request.window === "no-window" && request.redirect === "error") {
			httpFetchParams = fetchParams;
			httpRequest = request;
		} else {
			httpRequest = cloneRequest(request);
			httpFetchParams = { ...fetchParams };
			httpFetchParams.request = httpRequest;
		}
		const includeCredentials = request.credentials === "include" || request.credentials === "same-origin" && request.responseTainting === "basic";
		const contentLength = httpRequest.body ? httpRequest.body.length : null;
		let contentLengthHeaderValue = null;
		if (httpRequest.body == null && ["POST", "PUT"].includes(httpRequest.method)) contentLengthHeaderValue = "0";
		if (contentLength != null) contentLengthHeaderValue = isomorphicEncode(`${contentLength}`);
		if (contentLengthHeaderValue != null) httpRequest.headersList.append("content-length", contentLengthHeaderValue, true);
		if (contentLength != null && httpRequest.keepalive) {}
		if (httpRequest.referrer instanceof URL) httpRequest.headersList.append("referer", isomorphicEncode(httpRequest.referrer.href), true);
		appendRequestOriginHeader(httpRequest);
		appendFetchMetadata(httpRequest);
		if (!httpRequest.headersList.contains("user-agent", true)) httpRequest.headersList.append("user-agent", defaultUserAgent);
		if (httpRequest.cache === "default" && (httpRequest.headersList.contains("if-modified-since", true) || httpRequest.headersList.contains("if-none-match", true) || httpRequest.headersList.contains("if-unmodified-since", true) || httpRequest.headersList.contains("if-match", true) || httpRequest.headersList.contains("if-range", true))) httpRequest.cache = "no-store";
		if (httpRequest.cache === "no-cache" && !httpRequest.preventNoCacheCacheControlHeaderModification && !httpRequest.headersList.contains("cache-control", true)) httpRequest.headersList.append("cache-control", "max-age=0", true);
		if (httpRequest.cache === "no-store" || httpRequest.cache === "reload") {
			if (!httpRequest.headersList.contains("pragma", true)) httpRequest.headersList.append("pragma", "no-cache", true);
			if (!httpRequest.headersList.contains("cache-control", true)) httpRequest.headersList.append("cache-control", "no-cache", true);
		}
		if (httpRequest.headersList.contains("range", true)) httpRequest.headersList.append("accept-encoding", "identity", true);
		if (!httpRequest.headersList.contains("accept-encoding", true)) if (urlHasHttpsScheme(requestCurrentURL(httpRequest))) httpRequest.headersList.append("accept-encoding", "br, gzip, deflate", true);
		else httpRequest.headersList.append("accept-encoding", "gzip, deflate", true);
		httpRequest.headersList.delete("host", true);
		if (includeCredentials) {}
		if (httpCache == null) httpRequest.cache = "no-store";
		if (httpRequest.cache !== "no-store" && httpRequest.cache !== "reload") {}
		if (response == null) {
			if (httpRequest.cache === "only-if-cached") return makeNetworkError("only if cached");
			const forwardResponse = await httpNetworkFetch(httpFetchParams, includeCredentials, isNewConnectionFetch);
			if (!safeMethodsSet.has(httpRequest.method) && forwardResponse.status >= 200 && forwardResponse.status <= 399) {}
			if (response == null) response = forwardResponse;
		}
		response.urlList = [...httpRequest.urlList];
		if (httpRequest.headersList.contains("range", true)) response.rangeRequested = true;
		response.requestIncludesCredentials = includeCredentials;
		if (response.status === 407) {
			if (request.window === "no-window") return makeNetworkError();
			if (isCancelled(fetchParams)) return makeAppropriateNetworkError(fetchParams);
			return makeNetworkError("proxy authentication required");
		}
		if (response.status === 421 && !isNewConnectionFetch && (request.body == null || request.body.source != null)) {
			if (isCancelled(fetchParams)) return makeAppropriateNetworkError(fetchParams);
			fetchParams.controller.connection.destroy();
			response = await httpNetworkOrCacheFetch(fetchParams, isAuthenticationFetch, true);
		}
		if (isAuthenticationFetch) {}
		return response;
	}
	async function httpNetworkFetch(fetchParams, includeCredentials = false, forceNewConnection = false) {
		assert$5(!fetchParams.controller.connection || fetchParams.controller.connection.destroyed);
		fetchParams.controller.connection = {
			abort: null,
			destroyed: false,
			destroy(err, abort = true) {
				if (!this.destroyed) {
					this.destroyed = true;
					if (abort) this.abort?.(err ?? new DOMException("The operation was aborted.", "AbortError"));
				}
			}
		};
		const request = fetchParams.request;
		let response = null;
		const timingInfo = fetchParams.timingInfo;
		request.cache = "no-store";
		if (request.mode === "websocket") {}
		let requestBody = null;
		if (request.body == null && fetchParams.processRequestEndOfBody) queueMicrotask(() => fetchParams.processRequestEndOfBody());
		else if (request.body != null) {
			const processBodyChunk = async function* (bytes) {
				if (isCancelled(fetchParams)) return;
				yield bytes;
				fetchParams.processRequestBodyChunkLength?.(bytes.byteLength);
			};
			const processEndOfBody = () => {
				if (isCancelled(fetchParams)) return;
				if (fetchParams.processRequestEndOfBody) fetchParams.processRequestEndOfBody();
			};
			const processBodyError = (e) => {
				if (isCancelled(fetchParams)) return;
				if (e.name === "AbortError") fetchParams.controller.abort();
				else fetchParams.controller.terminate(e);
			};
			requestBody = (async function* () {
				try {
					for await (const bytes of request.body.stream) yield* processBodyChunk(bytes);
					processEndOfBody();
				} catch (err) {
					processBodyError(err);
				}
			})();
		}
		try {
			const { body, status, statusText, headersList, socket } = await dispatch({ body: requestBody });
			if (socket) response = makeResponse({
				status,
				statusText,
				headersList,
				socket
			});
			else {
				const iterator = body[Symbol.asyncIterator]();
				fetchParams.controller.next = () => iterator.next();
				response = makeResponse({
					status,
					statusText,
					headersList
				});
			}
		} catch (err) {
			if (err.name === "AbortError") {
				fetchParams.controller.connection.destroy();
				return makeAppropriateNetworkError(fetchParams, err);
			}
			return makeNetworkError(err);
		}
		const pullAlgorithm = async () => {
			await fetchParams.controller.resume();
		};
		const cancelAlgorithm = (reason) => {
			if (!isCancelled(fetchParams)) fetchParams.controller.abort(reason);
		};
		const stream = new ReadableStream({
			async start(controller) {
				fetchParams.controller.controller = controller;
			},
			async pull(controller) {
				await pullAlgorithm(controller);
			},
			async cancel(reason) {
				await cancelAlgorithm(reason);
			},
			type: "bytes"
		});
		response.body = {
			stream,
			source: null,
			length: null
		};
		fetchParams.controller.onAborted = onAborted;
		fetchParams.controller.on("terminated", onAborted);
		fetchParams.controller.resume = async () => {
			while (true) {
				let bytes;
				let isFailure;
				try {
					const { done, value } = await fetchParams.controller.next();
					if (isAborted(fetchParams)) break;
					bytes = done ? void 0 : value;
				} catch (err) {
					if (fetchParams.controller.ended && !timingInfo.encodedBodySize) bytes = void 0;
					else {
						bytes = err;
						isFailure = true;
					}
				}
				if (bytes === void 0) {
					readableStreamClose(fetchParams.controller.controller);
					finalizeResponse(fetchParams, response);
					return;
				}
				timingInfo.decodedBodySize += bytes?.byteLength ?? 0;
				if (isFailure) {
					fetchParams.controller.terminate(bytes);
					return;
				}
				const buffer = new Uint8Array(bytes);
				if (buffer.byteLength) fetchParams.controller.controller.enqueue(buffer);
				if (isErrored(stream)) {
					fetchParams.controller.terminate();
					return;
				}
				if (fetchParams.controller.controller.desiredSize <= 0) return;
			}
		};
		function onAborted(reason) {
			if (isAborted(fetchParams)) {
				response.aborted = true;
				if (isReadable(stream)) fetchParams.controller.controller.error(fetchParams.controller.serializedAbortReason);
			} else if (isReadable(stream)) fetchParams.controller.controller.error(new TypeError("terminated", { cause: isErrorLike(reason) ? reason : void 0 }));
			fetchParams.controller.connection.destroy();
		}
		return response;
		function dispatch({ body }) {
			const url = requestCurrentURL(request);
			/** @type {import('../..').Agent} */
			const agent = fetchParams.controller.dispatcher;
			return new Promise((resolve, reject) => agent.dispatch({
				path: url.pathname + url.search,
				origin: url.origin,
				method: request.method,
				body: agent.isMockActive ? request.body && (request.body.source || request.body.stream) : body,
				headers: request.headersList.entries,
				maxRedirections: 0,
				upgrade: request.mode === "websocket" ? "websocket" : void 0
			}, {
				body: null,
				abort: null,
				onConnect(abort) {
					const { connection } = fetchParams.controller;
					timingInfo.finalConnectionTimingInfo = clampAndCoarsenConnectionTimingInfo(void 0, timingInfo.postRedirectStartTime, fetchParams.crossOriginIsolatedCapability);
					if (connection.destroyed) abort(new DOMException("The operation was aborted.", "AbortError"));
					else {
						fetchParams.controller.on("terminated", abort);
						this.abort = connection.abort = abort;
					}
					timingInfo.finalNetworkRequestStartTime = coarsenedSharedCurrentTime(fetchParams.crossOriginIsolatedCapability);
				},
				onResponseStarted() {
					timingInfo.finalNetworkResponseStartTime = coarsenedSharedCurrentTime(fetchParams.crossOriginIsolatedCapability);
				},
				onHeaders(status, rawHeaders, resume, statusText) {
					if (status < 200) return;
					let location = "";
					const headersList = new HeadersList();
					for (let i = 0; i < rawHeaders.length; i += 2) headersList.append(bufferToLowerCasedHeaderName(rawHeaders[i]), rawHeaders[i + 1].toString("latin1"), true);
					location = headersList.get("location", true);
					this.body = new Readable({ read: resume });
					const decoders = [];
					const willFollow = location && request.redirect === "follow" && redirectStatusSet.has(status);
					if (request.method !== "HEAD" && request.method !== "CONNECT" && !nullBodyStatus.includes(status) && !willFollow) {
						const contentEncoding = headersList.get("content-encoding", true);
						/** @type {string[]} */
						const codings = contentEncoding ? contentEncoding.toLowerCase().split(",") : [];
						const maxContentEncodings = 5;
						if (codings.length > maxContentEncodings) {
							reject(/* @__PURE__ */ new Error(`too many content-encodings in response: ${codings.length}, maximum allowed is ${maxContentEncodings}`));
							return true;
						}
						for (let i = codings.length - 1; i >= 0; --i) {
							const coding = codings[i].trim();
							if (coding === "x-gzip" || coding === "gzip") decoders.push(zlib.createGunzip({
								flush: zlib.constants.Z_SYNC_FLUSH,
								finishFlush: zlib.constants.Z_SYNC_FLUSH
							}));
							else if (coding === "deflate") decoders.push(createInflate({
								flush: zlib.constants.Z_SYNC_FLUSH,
								finishFlush: zlib.constants.Z_SYNC_FLUSH
							}));
							else if (coding === "br") decoders.push(zlib.createBrotliDecompress({
								flush: zlib.constants.BROTLI_OPERATION_FLUSH,
								finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
							}));
							else {
								decoders.length = 0;
								break;
							}
						}
					}
					const onError = this.onError.bind(this);
					resolve({
						status,
						statusText,
						headersList,
						body: decoders.length ? pipeline$1(this.body, ...decoders, (err) => {
							if (err) this.onError(err);
						}).on("error", onError) : this.body.on("error", onError)
					});
					return true;
				},
				onData(chunk) {
					if (fetchParams.controller.dump) return;
					const bytes = chunk;
					timingInfo.encodedBodySize += bytes.byteLength;
					return this.body.push(bytes);
				},
				onComplete() {
					if (this.abort) fetchParams.controller.off("terminated", this.abort);
					if (fetchParams.controller.onAborted) fetchParams.controller.off("terminated", fetchParams.controller.onAborted);
					fetchParams.controller.ended = true;
					this.body.push(null);
				},
				onError(error) {
					if (this.abort) fetchParams.controller.off("terminated", this.abort);
					this.body?.destroy(error);
					fetchParams.controller.terminate(error);
					reject(error);
				},
				onUpgrade(status, rawHeaders, socket) {
					if (status !== 101) return;
					const headersList = new HeadersList();
					for (let i = 0; i < rawHeaders.length; i += 2) headersList.append(bufferToLowerCasedHeaderName(rawHeaders[i]), rawHeaders[i + 1].toString("latin1"), true);
					resolve({
						status,
						statusText: STATUS_CODES[status],
						headersList,
						socket
					});
					return true;
				}
			}));
		}
	}
	module.exports = {
		fetch,
		Fetch,
		fetching,
		finalizeAndReportTiming
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fileapi/symbols.js
var require_symbols$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kState: Symbol("FileReader state"),
		kResult: Symbol("FileReader result"),
		kError: Symbol("FileReader error"),
		kLastProgressEventFired: Symbol("FileReader last progress event fired timestamp"),
		kEvents: Symbol("FileReader events"),
		kAborted: Symbol("FileReader aborted")
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fileapi/progressevent.js
var require_progressevent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { webidl } = require_webidl();
	const kState = Symbol("ProgressEvent state");
	/**
	* @see https://xhr.spec.whatwg.org/#progressevent
	*/
	var ProgressEvent = class ProgressEvent extends Event {
		constructor(type, eventInitDict = {}) {
			type = webidl.converters.DOMString(type, "ProgressEvent constructor", "type");
			eventInitDict = webidl.converters.ProgressEventInit(eventInitDict ?? {});
			super(type, eventInitDict);
			this[kState] = {
				lengthComputable: eventInitDict.lengthComputable,
				loaded: eventInitDict.loaded,
				total: eventInitDict.total
			};
		}
		get lengthComputable() {
			webidl.brandCheck(this, ProgressEvent);
			return this[kState].lengthComputable;
		}
		get loaded() {
			webidl.brandCheck(this, ProgressEvent);
			return this[kState].loaded;
		}
		get total() {
			webidl.brandCheck(this, ProgressEvent);
			return this[kState].total;
		}
	};
	webidl.converters.ProgressEventInit = webidl.dictionaryConverter([
		{
			key: "lengthComputable",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "loaded",
			converter: webidl.converters["unsigned long long"],
			defaultValue: () => 0
		},
		{
			key: "total",
			converter: webidl.converters["unsigned long long"],
			defaultValue: () => 0
		},
		{
			key: "bubbles",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "cancelable",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "composed",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		}
	]);
	module.exports = { ProgressEvent };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fileapi/encoding.js
var require_encoding = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @see https://encoding.spec.whatwg.org/#concept-encoding-get
	* @param {string|undefined} label
	*/
	function getEncoding(label) {
		if (!label) return "failure";
		switch (label.trim().toLowerCase()) {
			case "unicode-1-1-utf-8":
			case "unicode11utf8":
			case "unicode20utf8":
			case "utf-8":
			case "utf8":
			case "x-unicode20utf8": return "UTF-8";
			case "866":
			case "cp866":
			case "csibm866":
			case "ibm866": return "IBM866";
			case "csisolatin2":
			case "iso-8859-2":
			case "iso-ir-101":
			case "iso8859-2":
			case "iso88592":
			case "iso_8859-2":
			case "iso_8859-2:1987":
			case "l2":
			case "latin2": return "ISO-8859-2";
			case "csisolatin3":
			case "iso-8859-3":
			case "iso-ir-109":
			case "iso8859-3":
			case "iso88593":
			case "iso_8859-3":
			case "iso_8859-3:1988":
			case "l3":
			case "latin3": return "ISO-8859-3";
			case "csisolatin4":
			case "iso-8859-4":
			case "iso-ir-110":
			case "iso8859-4":
			case "iso88594":
			case "iso_8859-4":
			case "iso_8859-4:1988":
			case "l4":
			case "latin4": return "ISO-8859-4";
			case "csisolatincyrillic":
			case "cyrillic":
			case "iso-8859-5":
			case "iso-ir-144":
			case "iso8859-5":
			case "iso88595":
			case "iso_8859-5":
			case "iso_8859-5:1988": return "ISO-8859-5";
			case "arabic":
			case "asmo-708":
			case "csiso88596e":
			case "csiso88596i":
			case "csisolatinarabic":
			case "ecma-114":
			case "iso-8859-6":
			case "iso-8859-6-e":
			case "iso-8859-6-i":
			case "iso-ir-127":
			case "iso8859-6":
			case "iso88596":
			case "iso_8859-6":
			case "iso_8859-6:1987": return "ISO-8859-6";
			case "csisolatingreek":
			case "ecma-118":
			case "elot_928":
			case "greek":
			case "greek8":
			case "iso-8859-7":
			case "iso-ir-126":
			case "iso8859-7":
			case "iso88597":
			case "iso_8859-7":
			case "iso_8859-7:1987":
			case "sun_eu_greek": return "ISO-8859-7";
			case "csiso88598e":
			case "csisolatinhebrew":
			case "hebrew":
			case "iso-8859-8":
			case "iso-8859-8-e":
			case "iso-ir-138":
			case "iso8859-8":
			case "iso88598":
			case "iso_8859-8":
			case "iso_8859-8:1988":
			case "visual": return "ISO-8859-8";
			case "csiso88598i":
			case "iso-8859-8-i":
			case "logical": return "ISO-8859-8-I";
			case "csisolatin6":
			case "iso-8859-10":
			case "iso-ir-157":
			case "iso8859-10":
			case "iso885910":
			case "l6":
			case "latin6": return "ISO-8859-10";
			case "iso-8859-13":
			case "iso8859-13":
			case "iso885913": return "ISO-8859-13";
			case "iso-8859-14":
			case "iso8859-14":
			case "iso885914": return "ISO-8859-14";
			case "csisolatin9":
			case "iso-8859-15":
			case "iso8859-15":
			case "iso885915":
			case "iso_8859-15":
			case "l9": return "ISO-8859-15";
			case "iso-8859-16": return "ISO-8859-16";
			case "cskoi8r":
			case "koi":
			case "koi8":
			case "koi8-r":
			case "koi8_r": return "KOI8-R";
			case "koi8-ru":
			case "koi8-u": return "KOI8-U";
			case "csmacintosh":
			case "mac":
			case "macintosh":
			case "x-mac-roman": return "macintosh";
			case "iso-8859-11":
			case "iso8859-11":
			case "iso885911":
			case "tis-620":
			case "windows-874": return "windows-874";
			case "cp1250":
			case "windows-1250":
			case "x-cp1250": return "windows-1250";
			case "cp1251":
			case "windows-1251":
			case "x-cp1251": return "windows-1251";
			case "ansi_x3.4-1968":
			case "ascii":
			case "cp1252":
			case "cp819":
			case "csisolatin1":
			case "ibm819":
			case "iso-8859-1":
			case "iso-ir-100":
			case "iso8859-1":
			case "iso88591":
			case "iso_8859-1":
			case "iso_8859-1:1987":
			case "l1":
			case "latin1":
			case "us-ascii":
			case "windows-1252":
			case "x-cp1252": return "windows-1252";
			case "cp1253":
			case "windows-1253":
			case "x-cp1253": return "windows-1253";
			case "cp1254":
			case "csisolatin5":
			case "iso-8859-9":
			case "iso-ir-148":
			case "iso8859-9":
			case "iso88599":
			case "iso_8859-9":
			case "iso_8859-9:1989":
			case "l5":
			case "latin5":
			case "windows-1254":
			case "x-cp1254": return "windows-1254";
			case "cp1255":
			case "windows-1255":
			case "x-cp1255": return "windows-1255";
			case "cp1256":
			case "windows-1256":
			case "x-cp1256": return "windows-1256";
			case "cp1257":
			case "windows-1257":
			case "x-cp1257": return "windows-1257";
			case "cp1258":
			case "windows-1258":
			case "x-cp1258": return "windows-1258";
			case "x-mac-cyrillic":
			case "x-mac-ukrainian": return "x-mac-cyrillic";
			case "chinese":
			case "csgb2312":
			case "csiso58gb231280":
			case "gb2312":
			case "gb_2312":
			case "gb_2312-80":
			case "gbk":
			case "iso-ir-58":
			case "x-gbk": return "GBK";
			case "gb18030": return "gb18030";
			case "big5":
			case "big5-hkscs":
			case "cn-big5":
			case "csbig5":
			case "x-x-big5": return "Big5";
			case "cseucpkdfmtjapanese":
			case "euc-jp":
			case "x-euc-jp": return "EUC-JP";
			case "csiso2022jp":
			case "iso-2022-jp": return "ISO-2022-JP";
			case "csshiftjis":
			case "ms932":
			case "ms_kanji":
			case "shift-jis":
			case "shift_jis":
			case "sjis":
			case "windows-31j":
			case "x-sjis": return "Shift_JIS";
			case "cseuckr":
			case "csksc56011987":
			case "euc-kr":
			case "iso-ir-149":
			case "korean":
			case "ks_c_5601-1987":
			case "ks_c_5601-1989":
			case "ksc5601":
			case "ksc_5601":
			case "windows-949": return "EUC-KR";
			case "csiso2022kr":
			case "hz-gb-2312":
			case "iso-2022-cn":
			case "iso-2022-cn-ext":
			case "iso-2022-kr":
			case "replacement": return "replacement";
			case "unicodefffe":
			case "utf-16be": return "UTF-16BE";
			case "csunicode":
			case "iso-10646-ucs-2":
			case "ucs-2":
			case "unicode":
			case "unicodefeff":
			case "utf-16":
			case "utf-16le": return "UTF-16LE";
			case "x-user-defined": return "x-user-defined";
			default: return "failure";
		}
	}
	module.exports = { getEncoding };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fileapi/util.js
var require_util$4 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kState, kError, kResult, kAborted, kLastProgressEventFired } = require_symbols$2();
	const { ProgressEvent } = require_progressevent();
	const { getEncoding } = require_encoding();
	const { serializeAMimeType, parseMIMEType } = require_data_url();
	const { types: types$1 } = __require("node:util");
	const { StringDecoder: StringDecoder$1 } = __require("string_decoder");
	const { btoa } = __require("node:buffer");
	/** @type {PropertyDescriptor} */
	const staticPropertyDescriptors = {
		enumerable: true,
		writable: false,
		configurable: false
	};
	/**
	* @see https://w3c.github.io/FileAPI/#readOperation
	* @param {import('./filereader').FileReader} fr
	* @param {import('buffer').Blob} blob
	* @param {string} type
	* @param {string?} encodingName
	*/
	function readOperation(fr, blob, type, encodingName) {
		if (fr[kState] === "loading") throw new DOMException("Invalid state", "InvalidStateError");
		fr[kState] = "loading";
		fr[kResult] = null;
		fr[kError] = null;
		const reader = blob.stream().getReader();
		/** @type {Uint8Array[]} */
		const bytes = [];
		let chunkPromise = reader.read();
		let isFirstChunk = true;
		(async () => {
			while (!fr[kAborted]) try {
				const { done, value } = await chunkPromise;
				if (isFirstChunk && !fr[kAborted]) queueMicrotask(() => {
					fireAProgressEvent("loadstart", fr);
				});
				isFirstChunk = false;
				if (!done && types$1.isUint8Array(value)) {
					bytes.push(value);
					if ((fr[kLastProgressEventFired] === void 0 || Date.now() - fr[kLastProgressEventFired] >= 50) && !fr[kAborted]) {
						fr[kLastProgressEventFired] = Date.now();
						queueMicrotask(() => {
							fireAProgressEvent("progress", fr);
						});
					}
					chunkPromise = reader.read();
				} else if (done) {
					queueMicrotask(() => {
						fr[kState] = "done";
						try {
							const result = packageData(bytes, type, blob.type, encodingName);
							if (fr[kAborted]) return;
							fr[kResult] = result;
							fireAProgressEvent("load", fr);
						} catch (error) {
							fr[kError] = error;
							fireAProgressEvent("error", fr);
						}
						if (fr[kState] !== "loading") fireAProgressEvent("loadend", fr);
					});
					break;
				}
			} catch (error) {
				if (fr[kAborted]) return;
				queueMicrotask(() => {
					fr[kState] = "done";
					fr[kError] = error;
					fireAProgressEvent("error", fr);
					if (fr[kState] !== "loading") fireAProgressEvent("loadend", fr);
				});
				break;
			}
		})();
	}
	/**
	* @see https://w3c.github.io/FileAPI/#fire-a-progress-event
	* @see https://dom.spec.whatwg.org/#concept-event-fire
	* @param {string} e The name of the event
	* @param {import('./filereader').FileReader} reader
	*/
	function fireAProgressEvent(e, reader) {
		const event = new ProgressEvent(e, {
			bubbles: false,
			cancelable: false
		});
		reader.dispatchEvent(event);
	}
	/**
	* @see https://w3c.github.io/FileAPI/#blob-package-data
	* @param {Uint8Array[]} bytes
	* @param {string} type
	* @param {string?} mimeType
	* @param {string?} encodingName
	*/
	function packageData(bytes, type, mimeType, encodingName) {
		switch (type) {
			case "DataURL": {
				let dataURL = "data:";
				const parsed = parseMIMEType(mimeType || "application/octet-stream");
				if (parsed !== "failure") dataURL += serializeAMimeType(parsed);
				dataURL += ";base64,";
				const decoder = new StringDecoder$1("latin1");
				for (const chunk of bytes) dataURL += btoa(decoder.write(chunk));
				dataURL += btoa(decoder.end());
				return dataURL;
			}
			case "Text": {
				let encoding = "failure";
				if (encodingName) encoding = getEncoding(encodingName);
				if (encoding === "failure" && mimeType) {
					const type = parseMIMEType(mimeType);
					if (type !== "failure") encoding = getEncoding(type.parameters.get("charset"));
				}
				if (encoding === "failure") encoding = "UTF-8";
				return decode(bytes, encoding);
			}
			case "ArrayBuffer": return combineByteSequences(bytes).buffer;
			case "BinaryString": {
				let binaryString = "";
				const decoder = new StringDecoder$1("latin1");
				for (const chunk of bytes) binaryString += decoder.write(chunk);
				binaryString += decoder.end();
				return binaryString;
			}
		}
	}
	/**
	* @see https://encoding.spec.whatwg.org/#decode
	* @param {Uint8Array[]} ioQueue
	* @param {string} encoding
	*/
	function decode(ioQueue, encoding) {
		const bytes = combineByteSequences(ioQueue);
		const BOMEncoding = BOMSniffing(bytes);
		let slice = 0;
		if (BOMEncoding !== null) {
			encoding = BOMEncoding;
			slice = BOMEncoding === "UTF-8" ? 3 : 2;
		}
		const sliced = bytes.slice(slice);
		return new TextDecoder(encoding).decode(sliced);
	}
	/**
	* @see https://encoding.spec.whatwg.org/#bom-sniff
	* @param {Uint8Array} ioQueue
	*/
	function BOMSniffing(ioQueue) {
		const [a, b, c] = ioQueue;
		if (a === 239 && b === 187 && c === 191) return "UTF-8";
		else if (a === 254 && b === 255) return "UTF-16BE";
		else if (a === 255 && b === 254) return "UTF-16LE";
		return null;
	}
	/**
	* @param {Uint8Array[]} sequences
	*/
	function combineByteSequences(sequences) {
		const size = sequences.reduce((a, b) => {
			return a + b.byteLength;
		}, 0);
		let offset = 0;
		return sequences.reduce((a, b) => {
			a.set(b, offset);
			offset += b.byteLength;
			return a;
		}, new Uint8Array(size));
	}
	module.exports = {
		staticPropertyDescriptors,
		readOperation,
		fireAProgressEvent
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/fileapi/filereader.js
var require_filereader = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { staticPropertyDescriptors, readOperation, fireAProgressEvent } = require_util$4();
	const { kState, kError, kResult, kEvents, kAborted } = require_symbols$2();
	const { webidl } = require_webidl();
	const { kEnumerableProperty } = require_util$7();
	var FileReader = class FileReader extends EventTarget {
		constructor() {
			super();
			this[kState] = "empty";
			this[kResult] = null;
			this[kError] = null;
			this[kEvents] = {
				loadend: null,
				error: null,
				abort: null,
				load: null,
				progress: null,
				loadstart: null
			};
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dfn-readAsArrayBuffer
		* @param {import('buffer').Blob} blob
		*/
		readAsArrayBuffer(blob) {
			webidl.brandCheck(this, FileReader);
			webidl.argumentLengthCheck(arguments, 1, "FileReader.readAsArrayBuffer");
			blob = webidl.converters.Blob(blob, { strict: false });
			readOperation(this, blob, "ArrayBuffer");
		}
		/**
		* @see https://w3c.github.io/FileAPI/#readAsBinaryString
		* @param {import('buffer').Blob} blob
		*/
		readAsBinaryString(blob) {
			webidl.brandCheck(this, FileReader);
			webidl.argumentLengthCheck(arguments, 1, "FileReader.readAsBinaryString");
			blob = webidl.converters.Blob(blob, { strict: false });
			readOperation(this, blob, "BinaryString");
		}
		/**
		* @see https://w3c.github.io/FileAPI/#readAsDataText
		* @param {import('buffer').Blob} blob
		* @param {string?} encoding
		*/
		readAsText(blob, encoding = void 0) {
			webidl.brandCheck(this, FileReader);
			webidl.argumentLengthCheck(arguments, 1, "FileReader.readAsText");
			blob = webidl.converters.Blob(blob, { strict: false });
			if (encoding !== void 0) encoding = webidl.converters.DOMString(encoding, "FileReader.readAsText", "encoding");
			readOperation(this, blob, "Text", encoding);
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dfn-readAsDataURL
		* @param {import('buffer').Blob} blob
		*/
		readAsDataURL(blob) {
			webidl.brandCheck(this, FileReader);
			webidl.argumentLengthCheck(arguments, 1, "FileReader.readAsDataURL");
			blob = webidl.converters.Blob(blob, { strict: false });
			readOperation(this, blob, "DataURL");
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dfn-abort
		*/
		abort() {
			if (this[kState] === "empty" || this[kState] === "done") {
				this[kResult] = null;
				return;
			}
			if (this[kState] === "loading") {
				this[kState] = "done";
				this[kResult] = null;
			}
			this[kAborted] = true;
			fireAProgressEvent("abort", this);
			if (this[kState] !== "loading") fireAProgressEvent("loadend", this);
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dom-filereader-readystate
		*/
		get readyState() {
			webidl.brandCheck(this, FileReader);
			switch (this[kState]) {
				case "empty": return this.EMPTY;
				case "loading": return this.LOADING;
				case "done": return this.DONE;
			}
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dom-filereader-result
		*/
		get result() {
			webidl.brandCheck(this, FileReader);
			return this[kResult];
		}
		/**
		* @see https://w3c.github.io/FileAPI/#dom-filereader-error
		*/
		get error() {
			webidl.brandCheck(this, FileReader);
			return this[kError];
		}
		get onloadend() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].loadend;
		}
		set onloadend(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].loadend) this.removeEventListener("loadend", this[kEvents].loadend);
			if (typeof fn === "function") {
				this[kEvents].loadend = fn;
				this.addEventListener("loadend", fn);
			} else this[kEvents].loadend = null;
		}
		get onerror() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].error;
		}
		set onerror(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].error) this.removeEventListener("error", this[kEvents].error);
			if (typeof fn === "function") {
				this[kEvents].error = fn;
				this.addEventListener("error", fn);
			} else this[kEvents].error = null;
		}
		get onloadstart() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].loadstart;
		}
		set onloadstart(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].loadstart) this.removeEventListener("loadstart", this[kEvents].loadstart);
			if (typeof fn === "function") {
				this[kEvents].loadstart = fn;
				this.addEventListener("loadstart", fn);
			} else this[kEvents].loadstart = null;
		}
		get onprogress() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].progress;
		}
		set onprogress(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].progress) this.removeEventListener("progress", this[kEvents].progress);
			if (typeof fn === "function") {
				this[kEvents].progress = fn;
				this.addEventListener("progress", fn);
			} else this[kEvents].progress = null;
		}
		get onload() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].load;
		}
		set onload(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].load) this.removeEventListener("load", this[kEvents].load);
			if (typeof fn === "function") {
				this[kEvents].load = fn;
				this.addEventListener("load", fn);
			} else this[kEvents].load = null;
		}
		get onabort() {
			webidl.brandCheck(this, FileReader);
			return this[kEvents].abort;
		}
		set onabort(fn) {
			webidl.brandCheck(this, FileReader);
			if (this[kEvents].abort) this.removeEventListener("abort", this[kEvents].abort);
			if (typeof fn === "function") {
				this[kEvents].abort = fn;
				this.addEventListener("abort", fn);
			} else this[kEvents].abort = null;
		}
	};
	FileReader.EMPTY = FileReader.prototype.EMPTY = 0;
	FileReader.LOADING = FileReader.prototype.LOADING = 1;
	FileReader.DONE = FileReader.prototype.DONE = 2;
	Object.defineProperties(FileReader.prototype, {
		EMPTY: staticPropertyDescriptors,
		LOADING: staticPropertyDescriptors,
		DONE: staticPropertyDescriptors,
		readAsArrayBuffer: kEnumerableProperty,
		readAsBinaryString: kEnumerableProperty,
		readAsText: kEnumerableProperty,
		readAsDataURL: kEnumerableProperty,
		abort: kEnumerableProperty,
		readyState: kEnumerableProperty,
		result: kEnumerableProperty,
		error: kEnumerableProperty,
		onloadstart: kEnumerableProperty,
		onprogress: kEnumerableProperty,
		onload: kEnumerableProperty,
		onabort: kEnumerableProperty,
		onerror: kEnumerableProperty,
		onloadend: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "FileReader",
			writable: false,
			enumerable: false,
			configurable: true
		}
	});
	Object.defineProperties(FileReader, {
		EMPTY: staticPropertyDescriptors,
		LOADING: staticPropertyDescriptors,
		DONE: staticPropertyDescriptors
	});
	module.exports = { FileReader };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cache/symbols.js
var require_symbols$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { kConstruct: require_symbols$4().kConstruct };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cache/util.js
var require_util$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$4 = __require("node:assert");
	const { URLSerializer } = require_data_url();
	const { isValidHeaderName } = require_util$6();
	/**
	* @see https://url.spec.whatwg.org/#concept-url-equals
	* @param {URL} A
	* @param {URL} B
	* @param {boolean | undefined} excludeFragment
	* @returns {boolean}
	*/
	function urlEquals(A, B, excludeFragment = false) {
		return URLSerializer(A, excludeFragment) === URLSerializer(B, excludeFragment);
	}
	/**
	* @see https://github.com/chromium/chromium/blob/694d20d134cb553d8d89e5500b9148012b1ba299/content/browser/cache_storage/cache_storage_cache.cc#L260-L262
	* @param {string} header
	*/
	function getFieldValues(header) {
		assert$4(header !== null);
		const values = [];
		for (let value of header.split(",")) {
			value = value.trim();
			if (isValidHeaderName(value)) values.push(value);
		}
		return values;
	}
	module.exports = {
		urlEquals,
		getFieldValues
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cache/cache.js
var require_cache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kConstruct } = require_symbols$1();
	const { urlEquals, getFieldValues } = require_util$3();
	const { kEnumerableProperty, isDisturbed } = require_util$7();
	const { webidl } = require_webidl();
	const { Response, cloneResponse, fromInnerResponse } = require_response();
	const { Request, fromInnerRequest } = require_request();
	const { kState } = require_symbols$3();
	const { fetching } = require_fetch();
	const { urlIsHttpHttpsScheme, createDeferredPromise, readAllBytes } = require_util$6();
	const assert$3 = __require("node:assert");
	/**
	* @see https://w3c.github.io/ServiceWorker/#dfn-cache-batch-operation
	* @typedef {Object} CacheBatchOperation
	* @property {'delete' | 'put'} type
	* @property {any} request
	* @property {any} response
	* @property {import('../../types/cache').CacheQueryOptions} options
	*/
	/**
	* @see https://w3c.github.io/ServiceWorker/#dfn-request-response-list
	* @typedef {[any, any][]} requestResponseList
	*/
	var Cache = class Cache {
		/**
		* @see https://w3c.github.io/ServiceWorker/#dfn-relevant-request-response-list
		* @type {requestResponseList}
		*/
		#relevantRequestResponseList;
		constructor() {
			if (arguments[0] !== kConstruct) webidl.illegalConstructor();
			webidl.util.markAsUncloneable(this);
			this.#relevantRequestResponseList = arguments[1];
		}
		async match(request, options = {}) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.match";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			request = webidl.converters.RequestInfo(request, prefix, "request");
			options = webidl.converters.CacheQueryOptions(options, prefix, "options");
			const p = this.#internalMatchAll(request, options, 1);
			if (p.length === 0) return;
			return p[0];
		}
		async matchAll(request = void 0, options = {}) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.matchAll";
			if (request !== void 0) request = webidl.converters.RequestInfo(request, prefix, "request");
			options = webidl.converters.CacheQueryOptions(options, prefix, "options");
			return this.#internalMatchAll(request, options);
		}
		async add(request) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.add";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			request = webidl.converters.RequestInfo(request, prefix, "request");
			const requests = [request];
			return await this.addAll(requests);
		}
		async addAll(requests) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.addAll";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			const responsePromises = [];
			const requestList = [];
			for (let request of requests) {
				if (request === void 0) throw webidl.errors.conversionFailed({
					prefix,
					argument: "Argument 1",
					types: ["undefined is not allowed"]
				});
				request = webidl.converters.RequestInfo(request);
				if (typeof request === "string") continue;
				const r = request[kState];
				if (!urlIsHttpHttpsScheme(r.url) || r.method !== "GET") throw webidl.errors.exception({
					header: prefix,
					message: "Expected http/s scheme when method is not GET."
				});
			}
			/** @type {ReturnType<typeof fetching>[]} */
			const fetchControllers = [];
			for (const request of requests) {
				const r = new Request(request)[kState];
				if (!urlIsHttpHttpsScheme(r.url)) throw webidl.errors.exception({
					header: prefix,
					message: "Expected http/s scheme."
				});
				r.initiator = "fetch";
				r.destination = "subresource";
				requestList.push(r);
				const responsePromise = createDeferredPromise();
				fetchControllers.push(fetching({
					request: r,
					processResponse(response) {
						if (response.type === "error" || response.status === 206 || response.status < 200 || response.status > 299) responsePromise.reject(webidl.errors.exception({
							header: "Cache.addAll",
							message: "Received an invalid status code or the request failed."
						}));
						else if (response.headersList.contains("vary")) {
							const fieldValues = getFieldValues(response.headersList.get("vary"));
							for (const fieldValue of fieldValues) if (fieldValue === "*") {
								responsePromise.reject(webidl.errors.exception({
									header: "Cache.addAll",
									message: "invalid vary field value"
								}));
								for (const controller of fetchControllers) controller.abort();
								return;
							}
						}
					},
					processResponseEndOfBody(response) {
						if (response.aborted) {
							responsePromise.reject(new DOMException("aborted", "AbortError"));
							return;
						}
						responsePromise.resolve(response);
					}
				}));
				responsePromises.push(responsePromise.promise);
			}
			const responses = await Promise.all(responsePromises);
			const operations = [];
			let index = 0;
			for (const response of responses) {
				/** @type {CacheBatchOperation} */
				const operation = {
					type: "put",
					request: requestList[index],
					response
				};
				operations.push(operation);
				index++;
			}
			const cacheJobPromise = createDeferredPromise();
			let errorData = null;
			try {
				this.#batchCacheOperations(operations);
			} catch (e) {
				errorData = e;
			}
			queueMicrotask(() => {
				if (errorData === null) cacheJobPromise.resolve(void 0);
				else cacheJobPromise.reject(errorData);
			});
			return cacheJobPromise.promise;
		}
		async put(request, response) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.put";
			webidl.argumentLengthCheck(arguments, 2, prefix);
			request = webidl.converters.RequestInfo(request, prefix, "request");
			response = webidl.converters.Response(response, prefix, "response");
			let innerRequest = null;
			if (request instanceof Request) innerRequest = request[kState];
			else innerRequest = new Request(request)[kState];
			if (!urlIsHttpHttpsScheme(innerRequest.url) || innerRequest.method !== "GET") throw webidl.errors.exception({
				header: prefix,
				message: "Expected an http/s scheme when method is not GET"
			});
			const innerResponse = response[kState];
			if (innerResponse.status === 206) throw webidl.errors.exception({
				header: prefix,
				message: "Got 206 status"
			});
			if (innerResponse.headersList.contains("vary")) {
				const fieldValues = getFieldValues(innerResponse.headersList.get("vary"));
				for (const fieldValue of fieldValues) if (fieldValue === "*") throw webidl.errors.exception({
					header: prefix,
					message: "Got * vary field value"
				});
			}
			if (innerResponse.body && (isDisturbed(innerResponse.body.stream) || innerResponse.body.stream.locked)) throw webidl.errors.exception({
				header: prefix,
				message: "Response body is locked or disturbed"
			});
			const clonedResponse = cloneResponse(innerResponse);
			const bodyReadPromise = createDeferredPromise();
			if (innerResponse.body != null) readAllBytes(innerResponse.body.stream.getReader()).then(bodyReadPromise.resolve, bodyReadPromise.reject);
			else bodyReadPromise.resolve(void 0);
			/** @type {CacheBatchOperation[]} */
			const operations = [];
			/** @type {CacheBatchOperation} */
			const operation = {
				type: "put",
				request: innerRequest,
				response: clonedResponse
			};
			operations.push(operation);
			const bytes = await bodyReadPromise.promise;
			if (clonedResponse.body != null) clonedResponse.body.source = bytes;
			const cacheJobPromise = createDeferredPromise();
			let errorData = null;
			try {
				this.#batchCacheOperations(operations);
			} catch (e) {
				errorData = e;
			}
			queueMicrotask(() => {
				if (errorData === null) cacheJobPromise.resolve();
				else cacheJobPromise.reject(errorData);
			});
			return cacheJobPromise.promise;
		}
		async delete(request, options = {}) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.delete";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			request = webidl.converters.RequestInfo(request, prefix, "request");
			options = webidl.converters.CacheQueryOptions(options, prefix, "options");
			/**
			* @type {Request}
			*/
			let r = null;
			if (request instanceof Request) {
				r = request[kState];
				if (r.method !== "GET" && !options.ignoreMethod) return false;
			} else {
				assert$3(typeof request === "string");
				r = new Request(request)[kState];
			}
			/** @type {CacheBatchOperation[]} */
			const operations = [];
			/** @type {CacheBatchOperation} */
			const operation = {
				type: "delete",
				request: r,
				options
			};
			operations.push(operation);
			const cacheJobPromise = createDeferredPromise();
			let errorData = null;
			let requestResponses;
			try {
				requestResponses = this.#batchCacheOperations(operations);
			} catch (e) {
				errorData = e;
			}
			queueMicrotask(() => {
				if (errorData === null) cacheJobPromise.resolve(!!requestResponses?.length);
				else cacheJobPromise.reject(errorData);
			});
			return cacheJobPromise.promise;
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#dom-cache-keys
		* @param {any} request
		* @param {import('../../types/cache').CacheQueryOptions} options
		* @returns {Promise<readonly Request[]>}
		*/
		async keys(request = void 0, options = {}) {
			webidl.brandCheck(this, Cache);
			const prefix = "Cache.keys";
			if (request !== void 0) request = webidl.converters.RequestInfo(request, prefix, "request");
			options = webidl.converters.CacheQueryOptions(options, prefix, "options");
			let r = null;
			if (request !== void 0) {
				if (request instanceof Request) {
					r = request[kState];
					if (r.method !== "GET" && !options.ignoreMethod) return [];
				} else if (typeof request === "string") r = new Request(request)[kState];
			}
			const promise = createDeferredPromise();
			const requests = [];
			if (request === void 0) for (const requestResponse of this.#relevantRequestResponseList) requests.push(requestResponse[0]);
			else {
				const requestResponses = this.#queryCache(r, options);
				for (const requestResponse of requestResponses) requests.push(requestResponse[0]);
			}
			queueMicrotask(() => {
				const requestList = [];
				for (const request of requests) {
					const requestObject = fromInnerRequest(request, new AbortController().signal, "immutable");
					requestList.push(requestObject);
				}
				promise.resolve(Object.freeze(requestList));
			});
			return promise.promise;
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#batch-cache-operations-algorithm
		* @param {CacheBatchOperation[]} operations
		* @returns {requestResponseList}
		*/
		#batchCacheOperations(operations) {
			const cache = this.#relevantRequestResponseList;
			const backupCache = [...cache];
			const addedItems = [];
			const resultList = [];
			try {
				for (const operation of operations) {
					if (operation.type !== "delete" && operation.type !== "put") throw webidl.errors.exception({
						header: "Cache.#batchCacheOperations",
						message: "operation type does not match \"delete\" or \"put\""
					});
					if (operation.type === "delete" && operation.response != null) throw webidl.errors.exception({
						header: "Cache.#batchCacheOperations",
						message: "delete operation should not have an associated response"
					});
					if (this.#queryCache(operation.request, operation.options, addedItems).length) throw new DOMException("???", "InvalidStateError");
					let requestResponses;
					if (operation.type === "delete") {
						requestResponses = this.#queryCache(operation.request, operation.options);
						if (requestResponses.length === 0) return [];
						for (const requestResponse of requestResponses) {
							const idx = cache.indexOf(requestResponse);
							assert$3(idx !== -1);
							cache.splice(idx, 1);
						}
					} else if (operation.type === "put") {
						if (operation.response == null) throw webidl.errors.exception({
							header: "Cache.#batchCacheOperations",
							message: "put operation should have an associated response"
						});
						const r = operation.request;
						if (!urlIsHttpHttpsScheme(r.url)) throw webidl.errors.exception({
							header: "Cache.#batchCacheOperations",
							message: "expected http or https scheme"
						});
						if (r.method !== "GET") throw webidl.errors.exception({
							header: "Cache.#batchCacheOperations",
							message: "not get method"
						});
						if (operation.options != null) throw webidl.errors.exception({
							header: "Cache.#batchCacheOperations",
							message: "options must not be defined"
						});
						requestResponses = this.#queryCache(operation.request);
						for (const requestResponse of requestResponses) {
							const idx = cache.indexOf(requestResponse);
							assert$3(idx !== -1);
							cache.splice(idx, 1);
						}
						cache.push([operation.request, operation.response]);
						addedItems.push([operation.request, operation.response]);
					}
					resultList.push([operation.request, operation.response]);
				}
				return resultList;
			} catch (e) {
				this.#relevantRequestResponseList.length = 0;
				this.#relevantRequestResponseList = backupCache;
				throw e;
			}
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#query-cache
		* @param {any} requestQuery
		* @param {import('../../types/cache').CacheQueryOptions} options
		* @param {requestResponseList} targetStorage
		* @returns {requestResponseList}
		*/
		#queryCache(requestQuery, options, targetStorage) {
			/** @type {requestResponseList} */
			const resultList = [];
			const storage = targetStorage ?? this.#relevantRequestResponseList;
			for (const requestResponse of storage) {
				const [cachedRequest, cachedResponse] = requestResponse;
				if (this.#requestMatchesCachedItem(requestQuery, cachedRequest, cachedResponse, options)) resultList.push(requestResponse);
			}
			return resultList;
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#request-matches-cached-item-algorithm
		* @param {any} requestQuery
		* @param {any} request
		* @param {any | null} response
		* @param {import('../../types/cache').CacheQueryOptions | undefined} options
		* @returns {boolean}
		*/
		#requestMatchesCachedItem(requestQuery, request, response = null, options) {
			const queryURL = new URL(requestQuery.url);
			const cachedURL = new URL(request.url);
			if (options?.ignoreSearch) {
				cachedURL.search = "";
				queryURL.search = "";
			}
			if (!urlEquals(queryURL, cachedURL, true)) return false;
			if (response == null || options?.ignoreVary || !response.headersList.contains("vary")) return true;
			const fieldValues = getFieldValues(response.headersList.get("vary"));
			for (const fieldValue of fieldValues) {
				if (fieldValue === "*") return false;
				if (request.headersList.get(fieldValue) !== requestQuery.headersList.get(fieldValue)) return false;
			}
			return true;
		}
		#internalMatchAll(request, options, maxResponses = Infinity) {
			let r = null;
			if (request !== void 0) {
				if (request instanceof Request) {
					r = request[kState];
					if (r.method !== "GET" && !options.ignoreMethod) return [];
				} else if (typeof request === "string") r = new Request(request)[kState];
			}
			const responses = [];
			if (request === void 0) for (const requestResponse of this.#relevantRequestResponseList) responses.push(requestResponse[1]);
			else {
				const requestResponses = this.#queryCache(r, options);
				for (const requestResponse of requestResponses) responses.push(requestResponse[1]);
			}
			const responseList = [];
			for (const response of responses) {
				const responseObject = fromInnerResponse(response, "immutable");
				responseList.push(responseObject.clone());
				if (responseList.length >= maxResponses) break;
			}
			return Object.freeze(responseList);
		}
	};
	Object.defineProperties(Cache.prototype, {
		[Symbol.toStringTag]: {
			value: "Cache",
			configurable: true
		},
		match: kEnumerableProperty,
		matchAll: kEnumerableProperty,
		add: kEnumerableProperty,
		addAll: kEnumerableProperty,
		put: kEnumerableProperty,
		delete: kEnumerableProperty,
		keys: kEnumerableProperty
	});
	const cacheQueryOptionConverters = [
		{
			key: "ignoreSearch",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "ignoreMethod",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "ignoreVary",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		}
	];
	webidl.converters.CacheQueryOptions = webidl.dictionaryConverter(cacheQueryOptionConverters);
	webidl.converters.MultiCacheQueryOptions = webidl.dictionaryConverter([...cacheQueryOptionConverters, {
		key: "cacheName",
		converter: webidl.converters.DOMString
	}]);
	webidl.converters.Response = webidl.interfaceConverter(Response);
	webidl.converters["sequence<RequestInfo>"] = webidl.sequenceConverter(webidl.converters.RequestInfo);
	module.exports = { Cache };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cache/cachestorage.js
var require_cachestorage = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kConstruct } = require_symbols$1();
	const { Cache } = require_cache();
	const { webidl } = require_webidl();
	const { kEnumerableProperty } = require_util$7();
	var CacheStorage = class CacheStorage {
		/**
		* @see https://w3c.github.io/ServiceWorker/#dfn-relevant-name-to-cache-map
		* @type {Map<string, import('./cache').requestResponseList}
		*/
		#caches = /* @__PURE__ */ new Map();
		constructor() {
			if (arguments[0] !== kConstruct) webidl.illegalConstructor();
			webidl.util.markAsUncloneable(this);
		}
		async match(request, options = {}) {
			webidl.brandCheck(this, CacheStorage);
			webidl.argumentLengthCheck(arguments, 1, "CacheStorage.match");
			request = webidl.converters.RequestInfo(request);
			options = webidl.converters.MultiCacheQueryOptions(options);
			if (options.cacheName != null) {
				if (this.#caches.has(options.cacheName)) return await new Cache(kConstruct, this.#caches.get(options.cacheName)).match(request, options);
			} else for (const cacheList of this.#caches.values()) {
				const response = await new Cache(kConstruct, cacheList).match(request, options);
				if (response !== void 0) return response;
			}
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#cache-storage-has
		* @param {string} cacheName
		* @returns {Promise<boolean>}
		*/
		async has(cacheName) {
			webidl.brandCheck(this, CacheStorage);
			const prefix = "CacheStorage.has";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			cacheName = webidl.converters.DOMString(cacheName, prefix, "cacheName");
			return this.#caches.has(cacheName);
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#dom-cachestorage-open
		* @param {string} cacheName
		* @returns {Promise<Cache>}
		*/
		async open(cacheName) {
			webidl.brandCheck(this, CacheStorage);
			const prefix = "CacheStorage.open";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			cacheName = webidl.converters.DOMString(cacheName, prefix, "cacheName");
			if (this.#caches.has(cacheName)) return new Cache(kConstruct, this.#caches.get(cacheName));
			const cache = [];
			this.#caches.set(cacheName, cache);
			return new Cache(kConstruct, cache);
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#cache-storage-delete
		* @param {string} cacheName
		* @returns {Promise<boolean>}
		*/
		async delete(cacheName) {
			webidl.brandCheck(this, CacheStorage);
			const prefix = "CacheStorage.delete";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			cacheName = webidl.converters.DOMString(cacheName, prefix, "cacheName");
			return this.#caches.delete(cacheName);
		}
		/**
		* @see https://w3c.github.io/ServiceWorker/#cache-storage-keys
		* @returns {Promise<string[]>}
		*/
		async keys() {
			webidl.brandCheck(this, CacheStorage);
			return [...this.#caches.keys()];
		}
	};
	Object.defineProperties(CacheStorage.prototype, {
		[Symbol.toStringTag]: {
			value: "CacheStorage",
			configurable: true
		},
		match: kEnumerableProperty,
		has: kEnumerableProperty,
		open: kEnumerableProperty,
		delete: kEnumerableProperty,
		keys: kEnumerableProperty
	});
	module.exports = { CacheStorage };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cookies/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const maxAttributeValueSize = 1024;
	const maxNameValuePairSize = 4096;
	module.exports = {
		maxAttributeValueSize,
		maxNameValuePairSize
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cookies/util.js
var require_util$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @param {string} value
	* @returns {boolean}
	*/
	function isCTLExcludingHtab(value) {
		for (let i = 0; i < value.length; ++i) {
			const code = value.charCodeAt(i);
			if (code >= 0 && code <= 8 || code >= 10 && code <= 31 || code === 127) return true;
		}
		return false;
	}
	/**
	CHAR           = <any US-ASCII character (octets 0 - 127)>
	token          = 1*<any CHAR except CTLs or separators>
	separators     = "(" | ")" | "<" | ">" | "@"
	| "," | ";" | ":" | "\" | <">
	| "/" | "[" | "]" | "?" | "="
	| "{" | "}" | SP | HT
	* @param {string} name
	*/
	function validateCookieName(name) {
		for (let i = 0; i < name.length; ++i) {
			const code = name.charCodeAt(i);
			if (code < 33 || code > 126 || code === 34 || code === 40 || code === 41 || code === 60 || code === 62 || code === 64 || code === 44 || code === 59 || code === 58 || code === 92 || code === 47 || code === 91 || code === 93 || code === 63 || code === 61 || code === 123 || code === 125) throw new Error("Invalid cookie name");
		}
	}
	/**
	cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
	cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
	; US-ASCII characters excluding CTLs,
	; whitespace DQUOTE, comma, semicolon,
	; and backslash
	* @param {string} value
	*/
	function validateCookieValue(value) {
		let len = value.length;
		let i = 0;
		if (value[0] === "\"") {
			if (len === 1 || value[len - 1] !== "\"") throw new Error("Invalid cookie value");
			--len;
			++i;
		}
		while (i < len) {
			const code = value.charCodeAt(i++);
			if (code < 33 || code > 126 || code === 34 || code === 44 || code === 59 || code === 92) throw new Error("Invalid cookie value");
		}
	}
	/**
	* path-value        = <any CHAR except CTLs or ";">
	* @param {string} path
	*/
	function validateCookiePath(path) {
		for (let i = 0; i < path.length; ++i) {
			const code = path.charCodeAt(i);
			if (code < 32 || code === 127 || code === 59) throw new Error("Invalid cookie path");
		}
	}
	/**
	* I have no idea why these values aren't allowed to be honest,
	* but Deno tests these. - Khafra
	* @param {string} domain
	*/
	function validateCookieDomain(domain) {
		if (domain.startsWith("-") || domain.endsWith(".") || domain.endsWith("-")) throw new Error("Invalid cookie domain");
	}
	const IMFDays = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	];
	const IMFMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const IMFPaddedNumbers = Array(61).fill(0).map((_, i) => i.toString().padStart(2, "0"));
	/**
	* @see https://www.rfc-editor.org/rfc/rfc7231#section-7.1.1.1
	* @param {number|Date} date
	IMF-fixdate  = day-name "," SP date1 SP time-of-day SP GMT
	; fixed length/zone/capitalization subset of the format
	; see Section 3.3 of [RFC5322]
	
	day-name     = %x4D.6F.6E ; "Mon", case-sensitive
	/ %x54.75.65 ; "Tue", case-sensitive
	/ %x57.65.64 ; "Wed", case-sensitive
	/ %x54.68.75 ; "Thu", case-sensitive
	/ %x46.72.69 ; "Fri", case-sensitive
	/ %x53.61.74 ; "Sat", case-sensitive
	/ %x53.75.6E ; "Sun", case-sensitive
	date1        = day SP month SP year
	; e.g., 02 Jun 1982
	
	day          = 2DIGIT
	month        = %x4A.61.6E ; "Jan", case-sensitive
	/ %x46.65.62 ; "Feb", case-sensitive
	/ %x4D.61.72 ; "Mar", case-sensitive
	/ %x41.70.72 ; "Apr", case-sensitive
	/ %x4D.61.79 ; "May", case-sensitive
	/ %x4A.75.6E ; "Jun", case-sensitive
	/ %x4A.75.6C ; "Jul", case-sensitive
	/ %x41.75.67 ; "Aug", case-sensitive
	/ %x53.65.70 ; "Sep", case-sensitive
	/ %x4F.63.74 ; "Oct", case-sensitive
	/ %x4E.6F.76 ; "Nov", case-sensitive
	/ %x44.65.63 ; "Dec", case-sensitive
	year         = 4DIGIT
	
	GMT          = %x47.4D.54 ; "GMT", case-sensitive
	
	time-of-day  = hour ":" minute ":" second
	; 00:00:00 - 23:59:60 (leap second)
	
	hour         = 2DIGIT
	minute       = 2DIGIT
	second       = 2DIGIT
	*/
	function toIMFDate(date) {
		if (typeof date === "number") date = new Date(date);
		return `${IMFDays[date.getUTCDay()]}, ${IMFPaddedNumbers[date.getUTCDate()]} ${IMFMonths[date.getUTCMonth()]} ${date.getUTCFullYear()} ${IMFPaddedNumbers[date.getUTCHours()]}:${IMFPaddedNumbers[date.getUTCMinutes()]}:${IMFPaddedNumbers[date.getUTCSeconds()]} GMT`;
	}
	/**
	max-age-av        = "Max-Age=" non-zero-digit *DIGIT
	; In practice, both expires-av and max-age-av
	; are limited to dates representable by the
	; user agent.
	* @param {number} maxAge
	*/
	function validateCookieMaxAge(maxAge) {
		if (maxAge < 0) throw new Error("Invalid cookie max-age");
	}
	/**
	* @see https://www.rfc-editor.org/rfc/rfc6265#section-4.1.1
	* @param {import('./index').Cookie} cookie
	*/
	function stringify(cookie) {
		if (cookie.name.length === 0) return null;
		validateCookieName(cookie.name);
		validateCookieValue(cookie.value);
		const out = [`${cookie.name}=${cookie.value}`];
		if (cookie.name.startsWith("__Secure-")) cookie.secure = true;
		if (cookie.name.startsWith("__Host-")) {
			cookie.secure = true;
			cookie.domain = null;
			cookie.path = "/";
		}
		if (cookie.secure) out.push("Secure");
		if (cookie.httpOnly) out.push("HttpOnly");
		if (typeof cookie.maxAge === "number") {
			validateCookieMaxAge(cookie.maxAge);
			out.push(`Max-Age=${cookie.maxAge}`);
		}
		if (cookie.domain) {
			validateCookieDomain(cookie.domain);
			out.push(`Domain=${cookie.domain}`);
		}
		if (cookie.path) {
			validateCookiePath(cookie.path);
			out.push(`Path=${cookie.path}`);
		}
		if (cookie.expires && cookie.expires.toString() !== "Invalid Date") out.push(`Expires=${toIMFDate(cookie.expires)}`);
		if (cookie.sameSite) out.push(`SameSite=${cookie.sameSite}`);
		for (const part of cookie.unparsed) {
			if (!part.includes("=")) throw new Error("Invalid unparsed");
			const [key, ...value] = part.split("=");
			out.push(`${key.trim()}=${value.join("=")}`);
		}
		return out.join("; ");
	}
	module.exports = {
		isCTLExcludingHtab,
		validateCookieName,
		validateCookiePath,
		validateCookieValue,
		toIMFDate,
		stringify
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cookies/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { maxNameValuePairSize, maxAttributeValueSize } = require_constants$1();
	const { isCTLExcludingHtab } = require_util$2();
	const { collectASequenceOfCodePointsFast } = require_data_url();
	const assert$2 = __require("node:assert");
	/**
	* @description Parses the field-value attributes of a set-cookie header string.
	* @see https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis#section-5.4
	* @param {string} header
	* @returns if the header is invalid, null will be returned
	*/
	function parseSetCookie(header) {
		if (isCTLExcludingHtab(header)) return null;
		let nameValuePair = "";
		let unparsedAttributes = "";
		let name = "";
		let value = "";
		if (header.includes(";")) {
			const position = { position: 0 };
			nameValuePair = collectASequenceOfCodePointsFast(";", header, position);
			unparsedAttributes = header.slice(position.position);
		} else nameValuePair = header;
		if (!nameValuePair.includes("=")) value = nameValuePair;
		else {
			const position = { position: 0 };
			name = collectASequenceOfCodePointsFast("=", nameValuePair, position);
			value = nameValuePair.slice(position.position + 1);
		}
		name = name.trim();
		value = value.trim();
		if (name.length + value.length > maxNameValuePairSize) return null;
		return {
			name,
			value,
			...parseUnparsedAttributes(unparsedAttributes)
		};
	}
	/**
	* Parses the remaining attributes of a set-cookie header
	* @see https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis#section-5.4
	* @param {string} unparsedAttributes
	* @param {[Object.<string, unknown>]={}} cookieAttributeList
	*/
	function parseUnparsedAttributes(unparsedAttributes, cookieAttributeList = {}) {
		if (unparsedAttributes.length === 0) return cookieAttributeList;
		assert$2(unparsedAttributes[0] === ";");
		unparsedAttributes = unparsedAttributes.slice(1);
		let cookieAv = "";
		if (unparsedAttributes.includes(";")) {
			cookieAv = collectASequenceOfCodePointsFast(";", unparsedAttributes, { position: 0 });
			unparsedAttributes = unparsedAttributes.slice(cookieAv.length);
		} else {
			cookieAv = unparsedAttributes;
			unparsedAttributes = "";
		}
		let attributeName = "";
		let attributeValue = "";
		if (cookieAv.includes("=")) {
			const position = { position: 0 };
			attributeName = collectASequenceOfCodePointsFast("=", cookieAv, position);
			attributeValue = cookieAv.slice(position.position + 1);
		} else attributeName = cookieAv;
		attributeName = attributeName.trim();
		attributeValue = attributeValue.trim();
		if (attributeValue.length > maxAttributeValueSize) return parseUnparsedAttributes(unparsedAttributes, cookieAttributeList);
		const attributeNameLowercase = attributeName.toLowerCase();
		if (attributeNameLowercase === "expires") cookieAttributeList.expires = new Date(attributeValue);
		else if (attributeNameLowercase === "max-age") {
			const charCode = attributeValue.charCodeAt(0);
			if ((charCode < 48 || charCode > 57) && attributeValue[0] !== "-") return parseUnparsedAttributes(unparsedAttributes, cookieAttributeList);
			if (!/^\d+$/.test(attributeValue)) return parseUnparsedAttributes(unparsedAttributes, cookieAttributeList);
			cookieAttributeList.maxAge = Number(attributeValue);
		} else if (attributeNameLowercase === "domain") {
			let cookieDomain = attributeValue;
			if (cookieDomain[0] === ".") cookieDomain = cookieDomain.slice(1);
			cookieDomain = cookieDomain.toLowerCase();
			cookieAttributeList.domain = cookieDomain;
		} else if (attributeNameLowercase === "path") {
			let cookiePath = "";
			if (attributeValue.length === 0 || attributeValue[0] !== "/") cookiePath = "/";
			else cookiePath = attributeValue;
			cookieAttributeList.path = cookiePath;
		} else if (attributeNameLowercase === "secure") cookieAttributeList.secure = true;
		else if (attributeNameLowercase === "httponly") cookieAttributeList.httpOnly = true;
		else if (attributeNameLowercase === "samesite") {
			let enforcement = "Default";
			const attributeValueLowercase = attributeValue.toLowerCase();
			if (attributeValueLowercase.includes("none")) enforcement = "None";
			if (attributeValueLowercase.includes("strict")) enforcement = "Strict";
			if (attributeValueLowercase.includes("lax")) enforcement = "Lax";
			cookieAttributeList.sameSite = enforcement;
		} else {
			cookieAttributeList.unparsed ??= [];
			cookieAttributeList.unparsed.push(`${attributeName}=${attributeValue}`);
		}
		return parseUnparsedAttributes(unparsedAttributes, cookieAttributeList);
	}
	module.exports = {
		parseSetCookie,
		parseUnparsedAttributes
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/cookies/index.js
var require_cookies = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { parseSetCookie } = require_parse();
	const { stringify } = require_util$2();
	const { webidl } = require_webidl();
	const { Headers } = require_headers();
	/**
	* @typedef {Object} Cookie
	* @property {string} name
	* @property {string} value
	* @property {Date|number|undefined} expires
	* @property {number|undefined} maxAge
	* @property {string|undefined} domain
	* @property {string|undefined} path
	* @property {boolean|undefined} secure
	* @property {boolean|undefined} httpOnly
	* @property {'Strict'|'Lax'|'None'} sameSite
	* @property {string[]} unparsed
	*/
	/**
	* @param {Headers} headers
	* @returns {Record<string, string>}
	*/
	function getCookies(headers) {
		webidl.argumentLengthCheck(arguments, 1, "getCookies");
		webidl.brandCheck(headers, Headers, { strict: false });
		const cookie = headers.get("cookie");
		const out = {};
		if (!cookie) return out;
		for (const piece of cookie.split(";")) {
			const [name, ...value] = piece.split("=");
			out[name.trim()] = value.join("=");
		}
		return out;
	}
	/**
	* @param {Headers} headers
	* @param {string} name
	* @param {{ path?: string, domain?: string }|undefined} attributes
	* @returns {void}
	*/
	function deleteCookie(headers, name, attributes) {
		webidl.brandCheck(headers, Headers, { strict: false });
		const prefix = "deleteCookie";
		webidl.argumentLengthCheck(arguments, 2, prefix);
		name = webidl.converters.DOMString(name, prefix, "name");
		attributes = webidl.converters.DeleteCookieAttributes(attributes);
		setCookie(headers, {
			name,
			value: "",
			expires: /* @__PURE__ */ new Date(0),
			...attributes
		});
	}
	/**
	* @param {Headers} headers
	* @returns {Cookie[]}
	*/
	function getSetCookies(headers) {
		webidl.argumentLengthCheck(arguments, 1, "getSetCookies");
		webidl.brandCheck(headers, Headers, { strict: false });
		const cookies = headers.getSetCookie();
		if (!cookies) return [];
		return cookies.map((pair) => parseSetCookie(pair));
	}
	/**
	* @param {Headers} headers
	* @param {Cookie} cookie
	* @returns {void}
	*/
	function setCookie(headers, cookie) {
		webidl.argumentLengthCheck(arguments, 2, "setCookie");
		webidl.brandCheck(headers, Headers, { strict: false });
		cookie = webidl.converters.Cookie(cookie);
		const str = stringify(cookie);
		if (str) headers.append("Set-Cookie", str);
	}
	webidl.converters.DeleteCookieAttributes = webidl.dictionaryConverter([{
		converter: webidl.nullableConverter(webidl.converters.DOMString),
		key: "path",
		defaultValue: () => null
	}, {
		converter: webidl.nullableConverter(webidl.converters.DOMString),
		key: "domain",
		defaultValue: () => null
	}]);
	webidl.converters.Cookie = webidl.dictionaryConverter([
		{
			converter: webidl.converters.DOMString,
			key: "name"
		},
		{
			converter: webidl.converters.DOMString,
			key: "value"
		},
		{
			converter: webidl.nullableConverter((value) => {
				if (typeof value === "number") return webidl.converters["unsigned long long"](value);
				return new Date(value);
			}),
			key: "expires",
			defaultValue: () => null
		},
		{
			converter: webidl.nullableConverter(webidl.converters["long long"]),
			key: "maxAge",
			defaultValue: () => null
		},
		{
			converter: webidl.nullableConverter(webidl.converters.DOMString),
			key: "domain",
			defaultValue: () => null
		},
		{
			converter: webidl.nullableConverter(webidl.converters.DOMString),
			key: "path",
			defaultValue: () => null
		},
		{
			converter: webidl.nullableConverter(webidl.converters.boolean),
			key: "secure",
			defaultValue: () => null
		},
		{
			converter: webidl.nullableConverter(webidl.converters.boolean),
			key: "httpOnly",
			defaultValue: () => null
		},
		{
			converter: webidl.converters.USVString,
			key: "sameSite",
			allowedValues: [
				"Strict",
				"Lax",
				"None"
			]
		},
		{
			converter: webidl.sequenceConverter(webidl.converters.DOMString),
			key: "unparsed",
			defaultValue: () => new Array(0)
		}
	]);
	module.exports = {
		getCookies,
		deleteCookie,
		getSetCookies,
		setCookie
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/events.js
var require_events = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { webidl } = require_webidl();
	const { kEnumerableProperty } = require_util$7();
	const { kConstruct } = require_symbols$4();
	const { MessagePort } = __require("node:worker_threads");
	/**
	* @see https://html.spec.whatwg.org/multipage/comms.html#messageevent
	*/
	var MessageEvent = class MessageEvent extends Event {
		#eventInit;
		constructor(type, eventInitDict = {}) {
			if (type === kConstruct) {
				super(arguments[1], arguments[2]);
				webidl.util.markAsUncloneable(this);
				return;
			}
			const prefix = "MessageEvent constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			type = webidl.converters.DOMString(type, prefix, "type");
			eventInitDict = webidl.converters.MessageEventInit(eventInitDict, prefix, "eventInitDict");
			super(type, eventInitDict);
			this.#eventInit = eventInitDict;
			webidl.util.markAsUncloneable(this);
		}
		get data() {
			webidl.brandCheck(this, MessageEvent);
			return this.#eventInit.data;
		}
		get origin() {
			webidl.brandCheck(this, MessageEvent);
			return this.#eventInit.origin;
		}
		get lastEventId() {
			webidl.brandCheck(this, MessageEvent);
			return this.#eventInit.lastEventId;
		}
		get source() {
			webidl.brandCheck(this, MessageEvent);
			return this.#eventInit.source;
		}
		get ports() {
			webidl.brandCheck(this, MessageEvent);
			if (!Object.isFrozen(this.#eventInit.ports)) Object.freeze(this.#eventInit.ports);
			return this.#eventInit.ports;
		}
		initMessageEvent(type, bubbles = false, cancelable = false, data = null, origin = "", lastEventId = "", source = null, ports = []) {
			webidl.brandCheck(this, MessageEvent);
			webidl.argumentLengthCheck(arguments, 1, "MessageEvent.initMessageEvent");
			return new MessageEvent(type, {
				bubbles,
				cancelable,
				data,
				origin,
				lastEventId,
				source,
				ports
			});
		}
		static createFastMessageEvent(type, init) {
			const messageEvent = new MessageEvent(kConstruct, type, init);
			messageEvent.#eventInit = init;
			messageEvent.#eventInit.data ??= null;
			messageEvent.#eventInit.origin ??= "";
			messageEvent.#eventInit.lastEventId ??= "";
			messageEvent.#eventInit.source ??= null;
			messageEvent.#eventInit.ports ??= [];
			return messageEvent;
		}
	};
	const { createFastMessageEvent } = MessageEvent;
	delete MessageEvent.createFastMessageEvent;
	/**
	* @see https://websockets.spec.whatwg.org/#the-closeevent-interface
	*/
	var CloseEvent = class CloseEvent extends Event {
		#eventInit;
		constructor(type, eventInitDict = {}) {
			const prefix = "CloseEvent constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			type = webidl.converters.DOMString(type, prefix, "type");
			eventInitDict = webidl.converters.CloseEventInit(eventInitDict);
			super(type, eventInitDict);
			this.#eventInit = eventInitDict;
			webidl.util.markAsUncloneable(this);
		}
		get wasClean() {
			webidl.brandCheck(this, CloseEvent);
			return this.#eventInit.wasClean;
		}
		get code() {
			webidl.brandCheck(this, CloseEvent);
			return this.#eventInit.code;
		}
		get reason() {
			webidl.brandCheck(this, CloseEvent);
			return this.#eventInit.reason;
		}
	};
	var ErrorEvent = class ErrorEvent extends Event {
		#eventInit;
		constructor(type, eventInitDict) {
			const prefix = "ErrorEvent constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			super(type, eventInitDict);
			webidl.util.markAsUncloneable(this);
			type = webidl.converters.DOMString(type, prefix, "type");
			eventInitDict = webidl.converters.ErrorEventInit(eventInitDict ?? {});
			this.#eventInit = eventInitDict;
		}
		get message() {
			webidl.brandCheck(this, ErrorEvent);
			return this.#eventInit.message;
		}
		get filename() {
			webidl.brandCheck(this, ErrorEvent);
			return this.#eventInit.filename;
		}
		get lineno() {
			webidl.brandCheck(this, ErrorEvent);
			return this.#eventInit.lineno;
		}
		get colno() {
			webidl.brandCheck(this, ErrorEvent);
			return this.#eventInit.colno;
		}
		get error() {
			webidl.brandCheck(this, ErrorEvent);
			return this.#eventInit.error;
		}
	};
	Object.defineProperties(MessageEvent.prototype, {
		[Symbol.toStringTag]: {
			value: "MessageEvent",
			configurable: true
		},
		data: kEnumerableProperty,
		origin: kEnumerableProperty,
		lastEventId: kEnumerableProperty,
		source: kEnumerableProperty,
		ports: kEnumerableProperty,
		initMessageEvent: kEnumerableProperty
	});
	Object.defineProperties(CloseEvent.prototype, {
		[Symbol.toStringTag]: {
			value: "CloseEvent",
			configurable: true
		},
		reason: kEnumerableProperty,
		code: kEnumerableProperty,
		wasClean: kEnumerableProperty
	});
	Object.defineProperties(ErrorEvent.prototype, {
		[Symbol.toStringTag]: {
			value: "ErrorEvent",
			configurable: true
		},
		message: kEnumerableProperty,
		filename: kEnumerableProperty,
		lineno: kEnumerableProperty,
		colno: kEnumerableProperty,
		error: kEnumerableProperty
	});
	webidl.converters.MessagePort = webidl.interfaceConverter(MessagePort);
	webidl.converters["sequence<MessagePort>"] = webidl.sequenceConverter(webidl.converters.MessagePort);
	const eventInit = [
		{
			key: "bubbles",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "cancelable",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "composed",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		}
	];
	webidl.converters.MessageEventInit = webidl.dictionaryConverter([
		...eventInit,
		{
			key: "data",
			converter: webidl.converters.any,
			defaultValue: () => null
		},
		{
			key: "origin",
			converter: webidl.converters.USVString,
			defaultValue: () => ""
		},
		{
			key: "lastEventId",
			converter: webidl.converters.DOMString,
			defaultValue: () => ""
		},
		{
			key: "source",
			converter: webidl.nullableConverter(webidl.converters.MessagePort),
			defaultValue: () => null
		},
		{
			key: "ports",
			converter: webidl.converters["sequence<MessagePort>"],
			defaultValue: () => new Array(0)
		}
	]);
	webidl.converters.CloseEventInit = webidl.dictionaryConverter([
		...eventInit,
		{
			key: "wasClean",
			converter: webidl.converters.boolean,
			defaultValue: () => false
		},
		{
			key: "code",
			converter: webidl.converters["unsigned short"],
			defaultValue: () => 0
		},
		{
			key: "reason",
			converter: webidl.converters.USVString,
			defaultValue: () => ""
		}
	]);
	webidl.converters.ErrorEventInit = webidl.dictionaryConverter([
		...eventInit,
		{
			key: "message",
			converter: webidl.converters.DOMString,
			defaultValue: () => ""
		},
		{
			key: "filename",
			converter: webidl.converters.USVString,
			defaultValue: () => ""
		},
		{
			key: "lineno",
			converter: webidl.converters["unsigned long"],
			defaultValue: () => 0
		},
		{
			key: "colno",
			converter: webidl.converters["unsigned long"],
			defaultValue: () => 0
		},
		{
			key: "error",
			converter: webidl.converters.any
		}
	]);
	module.exports = {
		MessageEvent,
		CloseEvent,
		ErrorEvent,
		createFastMessageEvent
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const uid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	/** @type {PropertyDescriptor} */
	const staticPropertyDescriptors = {
		enumerable: true,
		writable: false,
		configurable: false
	};
	const states = {
		CONNECTING: 0,
		OPEN: 1,
		CLOSING: 2,
		CLOSED: 3
	};
	const sentCloseFrameState = {
		NOT_SENT: 0,
		PROCESSING: 1,
		SENT: 2
	};
	const opcodes = {
		CONTINUATION: 0,
		TEXT: 1,
		BINARY: 2,
		CLOSE: 8,
		PING: 9,
		PONG: 10
	};
	const maxUnsigned16Bit = 2 ** 16 - 1;
	const parserStates = {
		INFO: 0,
		PAYLOADLENGTH_16: 2,
		PAYLOADLENGTH_64: 3,
		READ_DATA: 4
	};
	const emptyBuffer = Buffer.allocUnsafe(0);
	const sendHints = {
		string: 1,
		typedArray: 2,
		arrayBuffer: 3,
		blob: 4
	};
	module.exports = {
		uid,
		sentCloseFrameState,
		staticPropertyDescriptors,
		states,
		opcodes,
		maxUnsigned16Bit,
		parserStates,
		emptyBuffer,
		sendHints
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kWebSocketURL: Symbol("url"),
		kReadyState: Symbol("ready state"),
		kController: Symbol("controller"),
		kResponse: Symbol("response"),
		kBinaryType: Symbol("binary type"),
		kSentClose: Symbol("sent close"),
		kReceivedClose: Symbol("received close"),
		kByteParser: Symbol("byte parser")
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/util.js
var require_util$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kReadyState, kController, kResponse, kBinaryType, kWebSocketURL } = require_symbols();
	const { states, opcodes } = require_constants();
	const { ErrorEvent, createFastMessageEvent } = require_events();
	const { isUtf8 } = __require("node:buffer");
	const { collectASequenceOfCodePointsFast, removeHTTPWhitespace } = require_data_url();
	/**
	* @param {import('./websocket').WebSocket} ws
	* @returns {boolean}
	*/
	function isConnecting(ws) {
		return ws[kReadyState] === states.CONNECTING;
	}
	/**
	* @param {import('./websocket').WebSocket} ws
	* @returns {boolean}
	*/
	function isEstablished(ws) {
		return ws[kReadyState] === states.OPEN;
	}
	/**
	* @param {import('./websocket').WebSocket} ws
	* @returns {boolean}
	*/
	function isClosing(ws) {
		return ws[kReadyState] === states.CLOSING;
	}
	/**
	* @param {import('./websocket').WebSocket} ws
	* @returns {boolean}
	*/
	function isClosed(ws) {
		return ws[kReadyState] === states.CLOSED;
	}
	/**
	* @see https://dom.spec.whatwg.org/#concept-event-fire
	* @param {string} e
	* @param {EventTarget} target
	* @param {(...args: ConstructorParameters<typeof Event>) => Event} eventFactory
	* @param {EventInit | undefined} eventInitDict
	*/
	function fireEvent(e, target, eventFactory = (type, init) => new Event(type, init), eventInitDict = {}) {
		const event = eventFactory(e, eventInitDict);
		target.dispatchEvent(event);
	}
	/**
	* @see https://websockets.spec.whatwg.org/#feedback-from-the-protocol
	* @param {import('./websocket').WebSocket} ws
	* @param {number} type Opcode
	* @param {Buffer} data application data
	*/
	function websocketMessageReceived(ws, type, data) {
		if (ws[kReadyState] !== states.OPEN) return;
		let dataForEvent;
		if (type === opcodes.TEXT) try {
			dataForEvent = utf8Decode(data);
		} catch {
			failWebsocketConnection(ws, "Received invalid UTF-8 in text frame.");
			return;
		}
		else if (type === opcodes.BINARY) if (ws[kBinaryType] === "blob") dataForEvent = new Blob([data]);
		else dataForEvent = toArrayBuffer(data);
		fireEvent("message", ws, createFastMessageEvent, {
			origin: ws[kWebSocketURL].origin,
			data: dataForEvent
		});
	}
	function toArrayBuffer(buffer) {
		if (buffer.byteLength === buffer.buffer.byteLength) return buffer.buffer;
		return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
	}
	/**
	* @see https://datatracker.ietf.org/doc/html/rfc6455
	* @see https://datatracker.ietf.org/doc/html/rfc2616
	* @see https://bugs.chromium.org/p/chromium/issues/detail?id=398407
	* @param {string} protocol
	*/
	function isValidSubprotocol(protocol) {
		if (protocol.length === 0) return false;
		for (let i = 0; i < protocol.length; ++i) {
			const code = protocol.charCodeAt(i);
			if (code < 33 || code > 126 || code === 34 || code === 40 || code === 41 || code === 44 || code === 47 || code === 58 || code === 59 || code === 60 || code === 61 || code === 62 || code === 63 || code === 64 || code === 91 || code === 92 || code === 93 || code === 123 || code === 125) return false;
		}
		return true;
	}
	/**
	* @see https://datatracker.ietf.org/doc/html/rfc6455#section-7-4
	* @param {number} code
	*/
	function isValidStatusCode(code) {
		if (code >= 1e3 && code < 1015) return code !== 1004 && code !== 1005 && code !== 1006;
		return code >= 3e3 && code <= 4999;
	}
	/**
	* @param {import('./websocket').WebSocket} ws
	* @param {string|undefined} reason
	*/
	function failWebsocketConnection(ws, reason) {
		const { [kController]: controller, [kResponse]: response } = ws;
		controller.abort();
		if (response?.socket && !response.socket.destroyed) response.socket.destroy();
		if (reason) fireEvent("error", ws, (type, init) => new ErrorEvent(type, init), {
			error: new Error(reason),
			message: reason
		});
	}
	/**
	* @see https://datatracker.ietf.org/doc/html/rfc6455#section-5.5
	* @param {number} opcode
	*/
	function isControlFrame(opcode) {
		return opcode === opcodes.CLOSE || opcode === opcodes.PING || opcode === opcodes.PONG;
	}
	function isContinuationFrame(opcode) {
		return opcode === opcodes.CONTINUATION;
	}
	function isTextBinaryFrame(opcode) {
		return opcode === opcodes.TEXT || opcode === opcodes.BINARY;
	}
	function isValidOpcode(opcode) {
		return isTextBinaryFrame(opcode) || isContinuationFrame(opcode) || isControlFrame(opcode);
	}
	/**
	* Parses a Sec-WebSocket-Extensions header value.
	* @param {string} extensions
	* @returns {Map<string, string>}
	*/
	function parseExtensions(extensions) {
		const position = { position: 0 };
		const extensionList = /* @__PURE__ */ new Map();
		while (position.position < extensions.length) {
			const [name, value = ""] = collectASequenceOfCodePointsFast(";", extensions, position).split("=");
			extensionList.set(removeHTTPWhitespace(name, true, false), removeHTTPWhitespace(value, false, true));
			position.position++;
		}
		return extensionList;
	}
	/**
	* @see https://www.rfc-editor.org/rfc/rfc7692#section-7.1.2.2
	* @description "client-max-window-bits = 1*DIGIT"
	* @param {string} value
	*/
	function isValidClientWindowBits(value) {
		for (let i = 0; i < value.length; i++) {
			const byte = value.charCodeAt(i);
			if (byte < 48 || byte > 57) return false;
		}
		return true;
	}
	const hasIntl = typeof process.versions.icu === "string";
	const fatalDecoder = hasIntl ? new TextDecoder("utf-8", { fatal: true }) : void 0;
	/**
	* Converts a Buffer to utf-8, even on platforms without icu.
	* @param {Buffer} buffer
	*/
	const utf8Decode = hasIntl ? fatalDecoder.decode.bind(fatalDecoder) : function(buffer) {
		if (isUtf8(buffer)) return buffer.toString("utf-8");
		throw new TypeError("Invalid utf-8 received.");
	};
	module.exports = {
		isConnecting,
		isEstablished,
		isClosing,
		isClosed,
		fireEvent,
		isValidSubprotocol,
		isValidStatusCode,
		failWebsocketConnection,
		websocketMessageReceived,
		utf8Decode,
		isControlFrame,
		isContinuationFrame,
		isTextBinaryFrame,
		isValidOpcode,
		parseExtensions,
		isValidClientWindowBits
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/frame.js
var require_frame = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { maxUnsigned16Bit } = require_constants();
	const BUFFER_SIZE = 16386;
	/** @type {import('crypto')} */
	let crypto;
	let buffer = null;
	let bufIdx = BUFFER_SIZE;
	try {
		crypto = __require("node:crypto");
	} catch {
		crypto = { randomFillSync: function randomFillSync(buffer, _offset, _size) {
			for (let i = 0; i < buffer.length; ++i) buffer[i] = Math.random() * 255 | 0;
			return buffer;
		} };
	}
	function generateMask() {
		if (bufIdx === BUFFER_SIZE) {
			bufIdx = 0;
			crypto.randomFillSync(buffer ??= Buffer.allocUnsafe(BUFFER_SIZE), 0, BUFFER_SIZE);
		}
		return [
			buffer[bufIdx++],
			buffer[bufIdx++],
			buffer[bufIdx++],
			buffer[bufIdx++]
		];
	}
	var WebsocketFrameSend = class {
		/**
		* @param {Buffer|undefined} data
		*/
		constructor(data) {
			this.frameData = data;
		}
		createFrame(opcode) {
			const frameData = this.frameData;
			const maskKey = generateMask();
			const bodyLength = frameData?.byteLength ?? 0;
			/** @type {number} */
			let payloadLength = bodyLength;
			let offset = 6;
			if (bodyLength > maxUnsigned16Bit) {
				offset += 8;
				payloadLength = 127;
			} else if (bodyLength > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const buffer = Buffer.allocUnsafe(bodyLength + offset);
			buffer[0] = buffer[1] = 0;
			buffer[0] |= 128;
			buffer[0] = (buffer[0] & 240) + opcode;
			/*! ws. MIT License. Einar Otto Stangvik <einaros@gmail.com> */
			buffer[offset - 4] = maskKey[0];
			buffer[offset - 3] = maskKey[1];
			buffer[offset - 2] = maskKey[2];
			buffer[offset - 1] = maskKey[3];
			buffer[1] = payloadLength;
			if (payloadLength === 126) buffer.writeUInt16BE(bodyLength, 2);
			else if (payloadLength === 127) {
				buffer[2] = buffer[3] = 0;
				buffer.writeUIntBE(bodyLength, 4, 6);
			}
			buffer[1] |= 128;
			for (let i = 0; i < bodyLength; ++i) buffer[offset + i] = frameData[i] ^ maskKey[i & 3];
			return buffer;
		}
	};
	module.exports = { WebsocketFrameSend };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/connection.js
var require_connection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { uid, states, sentCloseFrameState, emptyBuffer, opcodes } = require_constants();
	const { kReadyState, kSentClose, kByteParser, kReceivedClose, kResponse } = require_symbols();
	const { fireEvent, failWebsocketConnection, isClosing, isClosed, isEstablished, parseExtensions } = require_util$1();
	const { channels } = require_diagnostics();
	const { CloseEvent } = require_events();
	const { makeRequest } = require_request();
	const { fetching } = require_fetch();
	const { Headers, getHeadersList } = require_headers();
	const { getDecodeSplit } = require_util$6();
	const { WebsocketFrameSend } = require_frame();
	/** @type {import('crypto')} */
	let crypto;
	try {
		crypto = __require("node:crypto");
	} catch {}
	/**
	* @see https://websockets.spec.whatwg.org/#concept-websocket-establish
	* @param {URL} url
	* @param {string|string[]} protocols
	* @param {import('./websocket').WebSocket} ws
	* @param {(response: any, extensions: string[] | undefined) => void} onEstablish
	* @param {Partial<import('../../types/websocket').WebSocketInit>} options
	*/
	function establishWebSocketConnection(url, protocols, client, ws, onEstablish, options) {
		const requestURL = url;
		requestURL.protocol = url.protocol === "ws:" ? "http:" : "https:";
		const request = makeRequest({
			urlList: [requestURL],
			client,
			serviceWorkers: "none",
			referrer: "no-referrer",
			mode: "websocket",
			credentials: "include",
			cache: "no-store",
			redirect: "error"
		});
		if (options.headers) request.headersList = getHeadersList(new Headers(options.headers));
		const keyValue = crypto.randomBytes(16).toString("base64");
		request.headersList.append("sec-websocket-key", keyValue);
		request.headersList.append("sec-websocket-version", "13");
		for (const protocol of protocols) request.headersList.append("sec-websocket-protocol", protocol);
		request.headersList.append("sec-websocket-extensions", "permessage-deflate; client_max_window_bits");
		return fetching({
			request,
			useParallelQueue: true,
			dispatcher: options.dispatcher,
			processResponse(response) {
				if (response.type === "error" || response.status !== 101) {
					failWebsocketConnection(ws, "Received network error or non-101 status code.");
					return;
				}
				if (protocols.length !== 0 && !response.headersList.get("Sec-WebSocket-Protocol")) {
					failWebsocketConnection(ws, "Server did not respond with sent protocols.");
					return;
				}
				if (response.headersList.get("Upgrade")?.toLowerCase() !== "websocket") {
					failWebsocketConnection(ws, "Server did not set Upgrade header to \"websocket\".");
					return;
				}
				if (response.headersList.get("Connection")?.toLowerCase() !== "upgrade") {
					failWebsocketConnection(ws, "Server did not set Connection header to \"upgrade\".");
					return;
				}
				if (response.headersList.get("Sec-WebSocket-Accept") !== crypto.createHash("sha1").update(keyValue + uid).digest("base64")) {
					failWebsocketConnection(ws, "Incorrect hash received in Sec-WebSocket-Accept header.");
					return;
				}
				const secExtension = response.headersList.get("Sec-WebSocket-Extensions");
				let extensions;
				if (secExtension !== null) {
					extensions = parseExtensions(secExtension);
					if (!extensions.has("permessage-deflate")) {
						failWebsocketConnection(ws, "Sec-WebSocket-Extensions header does not match.");
						return;
					}
				}
				const secProtocol = response.headersList.get("Sec-WebSocket-Protocol");
				if (secProtocol !== null) {
					if (!getDecodeSplit("sec-websocket-protocol", request.headersList).includes(secProtocol)) {
						failWebsocketConnection(ws, "Protocol was not set in the opening handshake.");
						return;
					}
				}
				response.socket.on("data", onSocketData);
				response.socket.on("close", onSocketClose);
				response.socket.on("error", onSocketError);
				if (channels.open.hasSubscribers) channels.open.publish({
					address: response.socket.address(),
					protocol: secProtocol,
					extensions: secExtension
				});
				onEstablish(response, extensions);
			}
		});
	}
	function closeWebSocketConnection(ws, code, reason, reasonByteLength) {
		if (isClosing(ws) || isClosed(ws)) {} else if (!isEstablished(ws)) {
			failWebsocketConnection(ws, "Connection was closed before it was established.");
			ws[kReadyState] = states.CLOSING;
		} else if (ws[kSentClose] === sentCloseFrameState.NOT_SENT) {
			ws[kSentClose] = sentCloseFrameState.PROCESSING;
			const frame = new WebsocketFrameSend();
			if (code !== void 0 && reason === void 0) {
				frame.frameData = Buffer.allocUnsafe(2);
				frame.frameData.writeUInt16BE(code, 0);
			} else if (code !== void 0 && reason !== void 0) {
				frame.frameData = Buffer.allocUnsafe(2 + reasonByteLength);
				frame.frameData.writeUInt16BE(code, 0);
				frame.frameData.write(reason, 2, "utf-8");
			} else frame.frameData = emptyBuffer;
			ws[kResponse].socket.write(frame.createFrame(opcodes.CLOSE));
			ws[kSentClose] = sentCloseFrameState.SENT;
			ws[kReadyState] = states.CLOSING;
		} else ws[kReadyState] = states.CLOSING;
	}
	/**
	* @param {Buffer} chunk
	*/
	function onSocketData(chunk) {
		if (!this.ws[kByteParser].write(chunk)) this.pause();
	}
	/**
	* @see https://websockets.spec.whatwg.org/#feedback-from-the-protocol
	* @see https://datatracker.ietf.org/doc/html/rfc6455#section-7.1.4
	*/
	function onSocketClose() {
		const { ws } = this;
		const { [kResponse]: response } = ws;
		response.socket.off("data", onSocketData);
		response.socket.off("close", onSocketClose);
		response.socket.off("error", onSocketError);
		const wasClean = ws[kSentClose] === sentCloseFrameState.SENT && ws[kReceivedClose];
		let code = 1005;
		let reason = "";
		const result = ws[kByteParser].closingInfo;
		if (result && !result.error) {
			code = result.code ?? 1005;
			reason = result.reason;
		} else if (!ws[kReceivedClose]) code = 1006;
		ws[kReadyState] = states.CLOSED;
		fireEvent("close", ws, (type, init) => new CloseEvent(type, init), {
			wasClean,
			code,
			reason
		});
		if (channels.close.hasSubscribers) channels.close.publish({
			websocket: ws,
			code,
			reason
		});
	}
	function onSocketError(error) {
		const { ws } = this;
		ws[kReadyState] = states.CLOSING;
		if (channels.socketError.hasSubscribers) channels.socketError.publish(error);
		this.destroy();
	}
	module.exports = {
		establishWebSocketConnection,
		closeWebSocketConnection
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/permessage-deflate.js
var require_permessage_deflate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { createInflateRaw, Z_DEFAULT_WINDOWBITS } = __require("node:zlib");
	const { isValidClientWindowBits } = require_util$1();
	const tail = Buffer.from([
		0,
		0,
		255,
		255
	]);
	const kBuffer = Symbol("kBuffer");
	const kLength = Symbol("kLength");
	var PerMessageDeflate = class {
		/** @type {import('node:zlib').InflateRaw} */
		#inflate;
		#options = {};
		constructor(extensions) {
			this.#options.serverNoContextTakeover = extensions.has("server_no_context_takeover");
			this.#options.serverMaxWindowBits = extensions.get("server_max_window_bits");
		}
		decompress(chunk, fin, callback) {
			if (!this.#inflate) {
				let windowBits = Z_DEFAULT_WINDOWBITS;
				if (this.#options.serverMaxWindowBits) {
					if (!isValidClientWindowBits(this.#options.serverMaxWindowBits)) {
						callback(/* @__PURE__ */ new Error("Invalid server_max_window_bits"));
						return;
					}
					windowBits = Number.parseInt(this.#options.serverMaxWindowBits);
				}
				this.#inflate = createInflateRaw({ windowBits });
				this.#inflate[kBuffer] = [];
				this.#inflate[kLength] = 0;
				this.#inflate.on("data", (data) => {
					this.#inflate[kBuffer].push(data);
					this.#inflate[kLength] += data.length;
				});
				this.#inflate.on("error", (err) => {
					this.#inflate = null;
					callback(err);
				});
			}
			this.#inflate.write(chunk);
			if (fin) this.#inflate.write(tail);
			this.#inflate.flush(() => {
				const full = Buffer.concat(this.#inflate[kBuffer], this.#inflate[kLength]);
				this.#inflate[kBuffer].length = 0;
				this.#inflate[kLength] = 0;
				callback(null, full);
			});
		}
	};
	module.exports = { PerMessageDeflate };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/receiver.js
var require_receiver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Writable } = __require("node:stream");
	const assert$1 = __require("node:assert");
	const { parserStates, opcodes, states, emptyBuffer, sentCloseFrameState } = require_constants();
	const { kReadyState, kSentClose, kResponse, kReceivedClose } = require_symbols();
	const { channels } = require_diagnostics();
	const { isValidStatusCode, isValidOpcode, failWebsocketConnection, websocketMessageReceived, utf8Decode, isControlFrame, isTextBinaryFrame, isContinuationFrame } = require_util$1();
	const { WebsocketFrameSend } = require_frame();
	const { closeWebSocketConnection } = require_connection();
	const { PerMessageDeflate } = require_permessage_deflate();
	var ByteParser = class extends Writable {
		#buffers = [];
		#byteOffset = 0;
		#loop = false;
		#state = parserStates.INFO;
		#info = {};
		#fragments = [];
		/** @type {Map<string, PerMessageDeflate>} */
		#extensions;
		constructor(ws, extensions) {
			super();
			this.ws = ws;
			this.#extensions = extensions == null ? /* @__PURE__ */ new Map() : extensions;
			if (this.#extensions.has("permessage-deflate")) this.#extensions.set("permessage-deflate", new PerMessageDeflate(extensions));
		}
		/**
		* @param {Buffer} chunk
		* @param {() => void} callback
		*/
		_write(chunk, _, callback) {
			this.#buffers.push(chunk);
			this.#byteOffset += chunk.length;
			this.#loop = true;
			this.run(callback);
		}
		/**
		* Runs whenever a new chunk is received.
		* Callback is called whenever there are no more chunks buffering,
		* or not enough bytes are buffered to parse.
		*/
		run(callback) {
			while (this.#loop) if (this.#state === parserStates.INFO) {
				if (this.#byteOffset < 2) return callback();
				const buffer = this.consume(2);
				const fin = (buffer[0] & 128) !== 0;
				const opcode = buffer[0] & 15;
				const masked = (buffer[1] & 128) === 128;
				const fragmented = !fin && opcode !== opcodes.CONTINUATION;
				const payloadLength = buffer[1] & 127;
				const rsv1 = buffer[0] & 64;
				const rsv2 = buffer[0] & 32;
				const rsv3 = buffer[0] & 16;
				if (!isValidOpcode(opcode)) {
					failWebsocketConnection(this.ws, "Invalid opcode received");
					return callback();
				}
				if (masked) {
					failWebsocketConnection(this.ws, "Frame cannot be masked");
					return callback();
				}
				if (rsv1 !== 0 && !this.#extensions.has("permessage-deflate")) {
					failWebsocketConnection(this.ws, "Expected RSV1 to be clear.");
					return;
				}
				if (rsv2 !== 0 || rsv3 !== 0) {
					failWebsocketConnection(this.ws, "RSV1, RSV2, RSV3 must be clear");
					return;
				}
				if (fragmented && !isTextBinaryFrame(opcode)) {
					failWebsocketConnection(this.ws, "Invalid frame type was fragmented.");
					return;
				}
				if (isTextBinaryFrame(opcode) && this.#fragments.length > 0) {
					failWebsocketConnection(this.ws, "Expected continuation frame");
					return;
				}
				if (this.#info.fragmented && fragmented) {
					failWebsocketConnection(this.ws, "Fragmented frame exceeded 125 bytes.");
					return;
				}
				if ((payloadLength > 125 || fragmented) && isControlFrame(opcode)) {
					failWebsocketConnection(this.ws, "Control frame either too large or fragmented");
					return;
				}
				if (isContinuationFrame(opcode) && this.#fragments.length === 0 && !this.#info.compressed) {
					failWebsocketConnection(this.ws, "Unexpected continuation frame");
					return;
				}
				if (payloadLength <= 125) {
					this.#info.payloadLength = payloadLength;
					this.#state = parserStates.READ_DATA;
				} else if (payloadLength === 126) this.#state = parserStates.PAYLOADLENGTH_16;
				else if (payloadLength === 127) this.#state = parserStates.PAYLOADLENGTH_64;
				if (isTextBinaryFrame(opcode)) {
					this.#info.binaryType = opcode;
					this.#info.compressed = rsv1 !== 0;
				}
				this.#info.opcode = opcode;
				this.#info.masked = masked;
				this.#info.fin = fin;
				this.#info.fragmented = fragmented;
			} else if (this.#state === parserStates.PAYLOADLENGTH_16) {
				if (this.#byteOffset < 2) return callback();
				const buffer = this.consume(2);
				this.#info.payloadLength = buffer.readUInt16BE(0);
				this.#state = parserStates.READ_DATA;
			} else if (this.#state === parserStates.PAYLOADLENGTH_64) {
				if (this.#byteOffset < 8) return callback();
				const buffer = this.consume(8);
				const upper = buffer.readUInt32BE(0);
				if (upper > 2 ** 31 - 1) {
					failWebsocketConnection(this.ws, "Received payload length > 2^31 bytes.");
					return;
				}
				const lower = buffer.readUInt32BE(4);
				this.#info.payloadLength = (upper << 8) + lower;
				this.#state = parserStates.READ_DATA;
			} else if (this.#state === parserStates.READ_DATA) {
				if (this.#byteOffset < this.#info.payloadLength) return callback();
				const body = this.consume(this.#info.payloadLength);
				if (isControlFrame(this.#info.opcode)) {
					this.#loop = this.parseControlFrame(body);
					this.#state = parserStates.INFO;
				} else if (!this.#info.compressed) {
					this.#fragments.push(body);
					if (!this.#info.fragmented && this.#info.fin) {
						const fullMessage = Buffer.concat(this.#fragments);
						websocketMessageReceived(this.ws, this.#info.binaryType, fullMessage);
						this.#fragments.length = 0;
					}
					this.#state = parserStates.INFO;
				} else {
					this.#extensions.get("permessage-deflate").decompress(body, this.#info.fin, (error, data) => {
						if (error) {
							closeWebSocketConnection(this.ws, 1007, error.message, error.message.length);
							return;
						}
						this.#fragments.push(data);
						if (!this.#info.fin) {
							this.#state = parserStates.INFO;
							this.#loop = true;
							this.run(callback);
							return;
						}
						websocketMessageReceived(this.ws, this.#info.binaryType, Buffer.concat(this.#fragments));
						this.#loop = true;
						this.#state = parserStates.INFO;
						this.#fragments.length = 0;
						this.run(callback);
					});
					this.#loop = false;
					break;
				}
			}
		}
		/**
		* Take n bytes from the buffered Buffers
		* @param {number} n
		* @returns {Buffer}
		*/
		consume(n) {
			if (n > this.#byteOffset) throw new Error("Called consume() before buffers satiated.");
			else if (n === 0) return emptyBuffer;
			if (this.#buffers[0].length === n) {
				this.#byteOffset -= this.#buffers[0].length;
				return this.#buffers.shift();
			}
			const buffer = Buffer.allocUnsafe(n);
			let offset = 0;
			while (offset !== n) {
				const next = this.#buffers[0];
				const { length } = next;
				if (length + offset === n) {
					buffer.set(this.#buffers.shift(), offset);
					break;
				} else if (length + offset > n) {
					buffer.set(next.subarray(0, n - offset), offset);
					this.#buffers[0] = next.subarray(n - offset);
					break;
				} else {
					buffer.set(this.#buffers.shift(), offset);
					offset += next.length;
				}
			}
			this.#byteOffset -= n;
			return buffer;
		}
		parseCloseBody(data) {
			assert$1(data.length !== 1);
			/** @type {number|undefined} */
			let code;
			if (data.length >= 2) code = data.readUInt16BE(0);
			if (code !== void 0 && !isValidStatusCode(code)) return {
				code: 1002,
				reason: "Invalid status code",
				error: true
			};
			/** @type {Buffer} */
			let reason = data.subarray(2);
			if (reason[0] === 239 && reason[1] === 187 && reason[2] === 191) reason = reason.subarray(3);
			try {
				reason = utf8Decode(reason);
			} catch {
				return {
					code: 1007,
					reason: "Invalid UTF-8",
					error: true
				};
			}
			return {
				code,
				reason,
				error: false
			};
		}
		/**
		* Parses control frames.
		* @param {Buffer} body
		*/
		parseControlFrame(body) {
			const { opcode, payloadLength } = this.#info;
			if (opcode === opcodes.CLOSE) {
				if (payloadLength === 1) {
					failWebsocketConnection(this.ws, "Received close frame with a 1-byte body.");
					return false;
				}
				this.#info.closeInfo = this.parseCloseBody(body);
				if (this.#info.closeInfo.error) {
					const { code, reason } = this.#info.closeInfo;
					closeWebSocketConnection(this.ws, code, reason, reason.length);
					failWebsocketConnection(this.ws, reason);
					return false;
				}
				if (this.ws[kSentClose] !== sentCloseFrameState.SENT) {
					let body = emptyBuffer;
					if (this.#info.closeInfo.code) {
						body = Buffer.allocUnsafe(2);
						body.writeUInt16BE(this.#info.closeInfo.code, 0);
					}
					const closeFrame = new WebsocketFrameSend(body);
					this.ws[kResponse].socket.write(closeFrame.createFrame(opcodes.CLOSE), (err) => {
						if (!err) this.ws[kSentClose] = sentCloseFrameState.SENT;
					});
				}
				this.ws[kReadyState] = states.CLOSING;
				this.ws[kReceivedClose] = true;
				return false;
			} else if (opcode === opcodes.PING) {
				if (!this.ws[kReceivedClose]) {
					const frame = new WebsocketFrameSend(body);
					this.ws[kResponse].socket.write(frame.createFrame(opcodes.PONG));
					if (channels.ping.hasSubscribers) channels.ping.publish({ payload: body });
				}
			} else if (opcode === opcodes.PONG) {
				if (channels.pong.hasSubscribers) channels.pong.publish({ payload: body });
			}
			return true;
		}
		get closingInfo() {
			return this.#info.closeInfo;
		}
	};
	module.exports = { ByteParser };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/sender.js
var require_sender = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { WebsocketFrameSend } = require_frame();
	const { opcodes, sendHints } = require_constants();
	const FixedQueue = require_fixed_queue();
	/** @type {typeof Uint8Array} */
	const FastBuffer = Buffer[Symbol.species];
	/**
	* @typedef {object} SendQueueNode
	* @property {Promise<void> | null} promise
	* @property {((...args: any[]) => any)} callback
	* @property {Buffer | null} frame
	*/
	var SendQueue = class {
		/**
		* @type {FixedQueue}
		*/
		#queue = new FixedQueue();
		/**
		* @type {boolean}
		*/
		#running = false;
		/** @type {import('node:net').Socket} */
		#socket;
		constructor(socket) {
			this.#socket = socket;
		}
		add(item, cb, hint) {
			if (hint !== sendHints.blob) {
				const frame = createFrame(item, hint);
				if (!this.#running) this.#socket.write(frame, cb);
				else {
					/** @type {SendQueueNode} */
					const node = {
						promise: null,
						callback: cb,
						frame
					};
					this.#queue.push(node);
				}
				return;
			}
			/** @type {SendQueueNode} */
			const node = {
				promise: item.arrayBuffer().then((ab) => {
					node.promise = null;
					node.frame = createFrame(ab, hint);
				}),
				callback: cb,
				frame: null
			};
			this.#queue.push(node);
			if (!this.#running) this.#run();
		}
		async #run() {
			this.#running = true;
			const queue = this.#queue;
			while (!queue.isEmpty()) {
				const node = queue.shift();
				if (node.promise !== null) await node.promise;
				this.#socket.write(node.frame, node.callback);
				node.callback = node.frame = null;
			}
			this.#running = false;
		}
	};
	function createFrame(data, hint) {
		return new WebsocketFrameSend(toBuffer(data, hint)).createFrame(hint === sendHints.string ? opcodes.TEXT : opcodes.BINARY);
	}
	function toBuffer(data, hint) {
		switch (hint) {
			case sendHints.string: return Buffer.from(data);
			case sendHints.arrayBuffer:
			case sendHints.blob: return new FastBuffer(data);
			case sendHints.typedArray: return new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
		}
	}
	module.exports = { SendQueue };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/websocket/websocket.js
var require_websocket = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { webidl } = require_webidl();
	const { URLSerializer } = require_data_url();
	const { environmentSettingsObject } = require_util$6();
	const { staticPropertyDescriptors, states, sentCloseFrameState, sendHints } = require_constants();
	const { kWebSocketURL, kReadyState, kController, kBinaryType, kResponse, kSentClose, kByteParser } = require_symbols();
	const { isConnecting, isEstablished, isClosing, isValidSubprotocol, fireEvent } = require_util$1();
	const { establishWebSocketConnection, closeWebSocketConnection } = require_connection();
	const { ByteParser } = require_receiver();
	const { kEnumerableProperty, isBlobLike } = require_util$7();
	const { getGlobalDispatcher } = require_global();
	const { types } = __require("node:util");
	const { ErrorEvent, CloseEvent } = require_events();
	const { SendQueue } = require_sender();
	var WebSocket = class WebSocket extends EventTarget {
		#events = {
			open: null,
			error: null,
			close: null,
			message: null
		};
		#bufferedAmount = 0;
		#protocol = "";
		#extensions = "";
		/** @type {SendQueue} */
		#sendQueue;
		/**
		* @param {string} url
		* @param {string|string[]} protocols
		*/
		constructor(url, protocols = []) {
			super();
			webidl.util.markAsUncloneable(this);
			const prefix = "WebSocket constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			const options = webidl.converters["DOMString or sequence<DOMString> or WebSocketInit"](protocols, prefix, "options");
			url = webidl.converters.USVString(url, prefix, "url");
			protocols = options.protocols;
			const baseURL = environmentSettingsObject.settingsObject.baseUrl;
			let urlRecord;
			try {
				urlRecord = new URL(url, baseURL);
			} catch (e) {
				throw new DOMException(e, "SyntaxError");
			}
			if (urlRecord.protocol === "http:") urlRecord.protocol = "ws:";
			else if (urlRecord.protocol === "https:") urlRecord.protocol = "wss:";
			if (urlRecord.protocol !== "ws:" && urlRecord.protocol !== "wss:") throw new DOMException(`Expected a ws: or wss: protocol, got ${urlRecord.protocol}`, "SyntaxError");
			if (urlRecord.hash || urlRecord.href.endsWith("#")) throw new DOMException("Got fragment", "SyntaxError");
			if (typeof protocols === "string") protocols = [protocols];
			if (protocols.length !== new Set(protocols.map((p) => p.toLowerCase())).size) throw new DOMException("Invalid Sec-WebSocket-Protocol value", "SyntaxError");
			if (protocols.length > 0 && !protocols.every((p) => isValidSubprotocol(p))) throw new DOMException("Invalid Sec-WebSocket-Protocol value", "SyntaxError");
			this[kWebSocketURL] = new URL(urlRecord.href);
			const client = environmentSettingsObject.settingsObject;
			this[kController] = establishWebSocketConnection(urlRecord, protocols, client, this, (response, extensions) => this.#onConnectionEstablished(response, extensions), options);
			this[kReadyState] = WebSocket.CONNECTING;
			this[kSentClose] = sentCloseFrameState.NOT_SENT;
			this[kBinaryType] = "blob";
		}
		/**
		* @see https://websockets.spec.whatwg.org/#dom-websocket-close
		* @param {number|undefined} code
		* @param {string|undefined} reason
		*/
		close(code = void 0, reason = void 0) {
			webidl.brandCheck(this, WebSocket);
			const prefix = "WebSocket.close";
			if (code !== void 0) code = webidl.converters["unsigned short"](code, prefix, "code", { clamp: true });
			if (reason !== void 0) reason = webidl.converters.USVString(reason, prefix, "reason");
			if (code !== void 0) {
				if (code !== 1e3 && (code < 3e3 || code > 4999)) throw new DOMException("invalid code", "InvalidAccessError");
			}
			let reasonByteLength = 0;
			if (reason !== void 0) {
				reasonByteLength = Buffer.byteLength(reason);
				if (reasonByteLength > 123) throw new DOMException(`Reason must be less than 123 bytes; received ${reasonByteLength}`, "SyntaxError");
			}
			closeWebSocketConnection(this, code, reason, reasonByteLength);
		}
		/**
		* @see https://websockets.spec.whatwg.org/#dom-websocket-send
		* @param {NodeJS.TypedArray|ArrayBuffer|Blob|string} data
		*/
		send(data) {
			webidl.brandCheck(this, WebSocket);
			const prefix = "WebSocket.send";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			data = webidl.converters.WebSocketSendData(data, prefix, "data");
			if (isConnecting(this)) throw new DOMException("Sent before connected.", "InvalidStateError");
			if (!isEstablished(this) || isClosing(this)) return;
			if (typeof data === "string") {
				const length = Buffer.byteLength(data);
				this.#bufferedAmount += length;
				this.#sendQueue.add(data, () => {
					this.#bufferedAmount -= length;
				}, sendHints.string);
			} else if (types.isArrayBuffer(data)) {
				this.#bufferedAmount += data.byteLength;
				this.#sendQueue.add(data, () => {
					this.#bufferedAmount -= data.byteLength;
				}, sendHints.arrayBuffer);
			} else if (ArrayBuffer.isView(data)) {
				this.#bufferedAmount += data.byteLength;
				this.#sendQueue.add(data, () => {
					this.#bufferedAmount -= data.byteLength;
				}, sendHints.typedArray);
			} else if (isBlobLike(data)) {
				this.#bufferedAmount += data.size;
				this.#sendQueue.add(data, () => {
					this.#bufferedAmount -= data.size;
				}, sendHints.blob);
			}
		}
		get readyState() {
			webidl.brandCheck(this, WebSocket);
			return this[kReadyState];
		}
		get bufferedAmount() {
			webidl.brandCheck(this, WebSocket);
			return this.#bufferedAmount;
		}
		get url() {
			webidl.brandCheck(this, WebSocket);
			return URLSerializer(this[kWebSocketURL]);
		}
		get extensions() {
			webidl.brandCheck(this, WebSocket);
			return this.#extensions;
		}
		get protocol() {
			webidl.brandCheck(this, WebSocket);
			return this.#protocol;
		}
		get onopen() {
			webidl.brandCheck(this, WebSocket);
			return this.#events.open;
		}
		set onopen(fn) {
			webidl.brandCheck(this, WebSocket);
			if (this.#events.open) this.removeEventListener("open", this.#events.open);
			if (typeof fn === "function") {
				this.#events.open = fn;
				this.addEventListener("open", fn);
			} else this.#events.open = null;
		}
		get onerror() {
			webidl.brandCheck(this, WebSocket);
			return this.#events.error;
		}
		set onerror(fn) {
			webidl.brandCheck(this, WebSocket);
			if (this.#events.error) this.removeEventListener("error", this.#events.error);
			if (typeof fn === "function") {
				this.#events.error = fn;
				this.addEventListener("error", fn);
			} else this.#events.error = null;
		}
		get onclose() {
			webidl.brandCheck(this, WebSocket);
			return this.#events.close;
		}
		set onclose(fn) {
			webidl.brandCheck(this, WebSocket);
			if (this.#events.close) this.removeEventListener("close", this.#events.close);
			if (typeof fn === "function") {
				this.#events.close = fn;
				this.addEventListener("close", fn);
			} else this.#events.close = null;
		}
		get onmessage() {
			webidl.brandCheck(this, WebSocket);
			return this.#events.message;
		}
		set onmessage(fn) {
			webidl.brandCheck(this, WebSocket);
			if (this.#events.message) this.removeEventListener("message", this.#events.message);
			if (typeof fn === "function") {
				this.#events.message = fn;
				this.addEventListener("message", fn);
			} else this.#events.message = null;
		}
		get binaryType() {
			webidl.brandCheck(this, WebSocket);
			return this[kBinaryType];
		}
		set binaryType(type) {
			webidl.brandCheck(this, WebSocket);
			if (type !== "blob" && type !== "arraybuffer") this[kBinaryType] = "blob";
			else this[kBinaryType] = type;
		}
		/**
		* @see https://websockets.spec.whatwg.org/#feedback-from-the-protocol
		*/
		#onConnectionEstablished(response, parsedExtensions) {
			this[kResponse] = response;
			const parser = new ByteParser(this, parsedExtensions);
			parser.on("drain", onParserDrain);
			parser.on("error", onParserError.bind(this));
			response.socket.ws = this;
			this[kByteParser] = parser;
			this.#sendQueue = new SendQueue(response.socket);
			this[kReadyState] = states.OPEN;
			const extensions = response.headersList.get("sec-websocket-extensions");
			if (extensions !== null) this.#extensions = extensions;
			const protocol = response.headersList.get("sec-websocket-protocol");
			if (protocol !== null) this.#protocol = protocol;
			fireEvent("open", this);
		}
	};
	WebSocket.CONNECTING = WebSocket.prototype.CONNECTING = states.CONNECTING;
	WebSocket.OPEN = WebSocket.prototype.OPEN = states.OPEN;
	WebSocket.CLOSING = WebSocket.prototype.CLOSING = states.CLOSING;
	WebSocket.CLOSED = WebSocket.prototype.CLOSED = states.CLOSED;
	Object.defineProperties(WebSocket.prototype, {
		CONNECTING: staticPropertyDescriptors,
		OPEN: staticPropertyDescriptors,
		CLOSING: staticPropertyDescriptors,
		CLOSED: staticPropertyDescriptors,
		url: kEnumerableProperty,
		readyState: kEnumerableProperty,
		bufferedAmount: kEnumerableProperty,
		onopen: kEnumerableProperty,
		onerror: kEnumerableProperty,
		onclose: kEnumerableProperty,
		close: kEnumerableProperty,
		onmessage: kEnumerableProperty,
		binaryType: kEnumerableProperty,
		send: kEnumerableProperty,
		extensions: kEnumerableProperty,
		protocol: kEnumerableProperty,
		[Symbol.toStringTag]: {
			value: "WebSocket",
			writable: false,
			enumerable: false,
			configurable: true
		}
	});
	Object.defineProperties(WebSocket, {
		CONNECTING: staticPropertyDescriptors,
		OPEN: staticPropertyDescriptors,
		CLOSING: staticPropertyDescriptors,
		CLOSED: staticPropertyDescriptors
	});
	webidl.converters["sequence<DOMString>"] = webidl.sequenceConverter(webidl.converters.DOMString);
	webidl.converters["DOMString or sequence<DOMString>"] = function(V, prefix, argument) {
		if (webidl.util.Type(V) === "Object" && Symbol.iterator in V) return webidl.converters["sequence<DOMString>"](V);
		return webidl.converters.DOMString(V, prefix, argument);
	};
	webidl.converters.WebSocketInit = webidl.dictionaryConverter([
		{
			key: "protocols",
			converter: webidl.converters["DOMString or sequence<DOMString>"],
			defaultValue: () => new Array(0)
		},
		{
			key: "dispatcher",
			converter: webidl.converters.any,
			defaultValue: () => getGlobalDispatcher()
		},
		{
			key: "headers",
			converter: webidl.nullableConverter(webidl.converters.HeadersInit)
		}
	]);
	webidl.converters["DOMString or sequence<DOMString> or WebSocketInit"] = function(V) {
		if (webidl.util.Type(V) === "Object" && !(Symbol.iterator in V)) return webidl.converters.WebSocketInit(V);
		return { protocols: webidl.converters["DOMString or sequence<DOMString>"](V) };
	};
	webidl.converters.WebSocketSendData = function(V) {
		if (webidl.util.Type(V) === "Object") {
			if (isBlobLike(V)) return webidl.converters.Blob(V, { strict: false });
			if (ArrayBuffer.isView(V) || types.isArrayBuffer(V)) return webidl.converters.BufferSource(V);
		}
		return webidl.converters.USVString(V);
	};
	function onParserDrain() {
		this.ws[kResponse].socket.resume();
	}
	function onParserError(err) {
		let message;
		let code;
		if (err instanceof CloseEvent) {
			message = err.reason;
			code = err.code;
		} else message = err.message;
		fireEvent("error", this, () => new ErrorEvent("error", {
			error: err,
			message
		}));
		closeWebSocketConnection(this, code);
	}
	module.exports = { WebSocket };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/eventsource/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if the given value is a valid LastEventId.
	* @param {string} value
	* @returns {boolean}
	*/
	function isValidLastEventId(value) {
		return value.indexOf("\0") === -1;
	}
	/**
	* Checks if the given value is a base 10 digit.
	* @param {string} value
	* @returns {boolean}
	*/
	function isASCIINumber(value) {
		if (value.length === 0) return false;
		for (let i = 0; i < value.length; i++) if (value.charCodeAt(i) < 48 || value.charCodeAt(i) > 57) return false;
		return true;
	}
	function delay(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms).unref();
		});
	}
	module.exports = {
		isValidLastEventId,
		isASCIINumber,
		delay
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/eventsource/eventsource-stream.js
var require_eventsource_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Transform } = __require("node:stream");
	const { isASCIINumber, isValidLastEventId } = require_util();
	/**
	* @type {number[]} BOM
	*/
	const BOM = [
		239,
		187,
		191
	];
	/**
	* @type {10} LF
	*/
	const LF = 10;
	/**
	* @type {13} CR
	*/
	const CR = 13;
	/**
	* @type {58} COLON
	*/
	const COLON = 58;
	/**
	* @type {32} SPACE
	*/
	const SPACE = 32;
	/**
	* @typedef {object} EventSourceStreamEvent
	* @type {object}
	* @property {string} [event] The event type.
	* @property {string} [data] The data of the message.
	* @property {string} [id] A unique ID for the event.
	* @property {string} [retry] The reconnection time, in milliseconds.
	*/
	/**
	* @typedef eventSourceSettings
	* @type {object}
	* @property {string} lastEventId The last event ID received from the server.
	* @property {string} origin The origin of the event source.
	* @property {number} reconnectionTime The reconnection time, in milliseconds.
	*/
	var EventSourceStream = class extends Transform {
		/**
		* @type {eventSourceSettings}
		*/
		state = null;
		/**
		* Leading byte-order-mark check.
		* @type {boolean}
		*/
		checkBOM = true;
		/**
		* @type {boolean}
		*/
		crlfCheck = false;
		/**
		* @type {boolean}
		*/
		eventEndCheck = false;
		/**
		* @type {Buffer}
		*/
		buffer = null;
		pos = 0;
		event = {
			data: void 0,
			event: void 0,
			id: void 0,
			retry: void 0
		};
		/**
		* @param {object} options
		* @param {eventSourceSettings} options.eventSourceSettings
		* @param {Function} [options.push]
		*/
		constructor(options = {}) {
			options.readableObjectMode = true;
			super(options);
			this.state = options.eventSourceSettings || {};
			if (options.push) this.push = options.push;
		}
		/**
		* @param {Buffer} chunk
		* @param {string} _encoding
		* @param {Function} callback
		* @returns {void}
		*/
		_transform(chunk, _encoding, callback) {
			if (chunk.length === 0) {
				callback();
				return;
			}
			if (this.buffer) this.buffer = Buffer.concat([this.buffer, chunk]);
			else this.buffer = chunk;
			if (this.checkBOM) switch (this.buffer.length) {
				case 1:
					if (this.buffer[0] === BOM[0]) {
						callback();
						return;
					}
					this.checkBOM = false;
					callback();
					return;
				case 2:
					if (this.buffer[0] === BOM[0] && this.buffer[1] === BOM[1]) {
						callback();
						return;
					}
					this.checkBOM = false;
					break;
				case 3:
					if (this.buffer[0] === BOM[0] && this.buffer[1] === BOM[1] && this.buffer[2] === BOM[2]) {
						this.buffer = Buffer.alloc(0);
						this.checkBOM = false;
						callback();
						return;
					}
					this.checkBOM = false;
					break;
				default:
					if (this.buffer[0] === BOM[0] && this.buffer[1] === BOM[1] && this.buffer[2] === BOM[2]) this.buffer = this.buffer.subarray(3);
					this.checkBOM = false;
					break;
			}
			while (this.pos < this.buffer.length) {
				if (this.eventEndCheck) {
					if (this.crlfCheck) {
						if (this.buffer[this.pos] === LF) {
							this.buffer = this.buffer.subarray(this.pos + 1);
							this.pos = 0;
							this.crlfCheck = false;
							continue;
						}
						this.crlfCheck = false;
					}
					if (this.buffer[this.pos] === LF || this.buffer[this.pos] === CR) {
						if (this.buffer[this.pos] === CR) this.crlfCheck = true;
						this.buffer = this.buffer.subarray(this.pos + 1);
						this.pos = 0;
						if (this.event.data !== void 0 || this.event.event || this.event.id || this.event.retry) this.processEvent(this.event);
						this.clearEvent();
						continue;
					}
					this.eventEndCheck = false;
					continue;
				}
				if (this.buffer[this.pos] === LF || this.buffer[this.pos] === CR) {
					if (this.buffer[this.pos] === CR) this.crlfCheck = true;
					this.parseLine(this.buffer.subarray(0, this.pos), this.event);
					this.buffer = this.buffer.subarray(this.pos + 1);
					this.pos = 0;
					this.eventEndCheck = true;
					continue;
				}
				this.pos++;
			}
			callback();
		}
		/**
		* @param {Buffer} line
		* @param {EventStreamEvent} event
		*/
		parseLine(line, event) {
			if (line.length === 0) return;
			const colonPosition = line.indexOf(COLON);
			if (colonPosition === 0) return;
			let field = "";
			let value = "";
			if (colonPosition !== -1) {
				field = line.subarray(0, colonPosition).toString("utf8");
				let valueStart = colonPosition + 1;
				if (line[valueStart] === SPACE) ++valueStart;
				value = line.subarray(valueStart).toString("utf8");
			} else {
				field = line.toString("utf8");
				value = "";
			}
			switch (field) {
				case "data":
					if (event[field] === void 0) event[field] = value;
					else event[field] += `\n${value}`;
					break;
				case "retry":
					if (isASCIINumber(value)) event[field] = value;
					break;
				case "id":
					if (isValidLastEventId(value)) event[field] = value;
					break;
				case "event":
					if (value.length > 0) event[field] = value;
					break;
			}
		}
		/**
		* @param {EventSourceStreamEvent} event
		*/
		processEvent(event) {
			if (event.retry && isASCIINumber(event.retry)) this.state.reconnectionTime = parseInt(event.retry, 10);
			if (event.id && isValidLastEventId(event.id)) this.state.lastEventId = event.id;
			if (event.data !== void 0) this.push({
				type: event.event || "message",
				options: {
					data: event.data,
					lastEventId: this.state.lastEventId,
					origin: this.state.origin
				}
			});
		}
		clearEvent() {
			this.event = {
				data: void 0,
				event: void 0,
				id: void 0,
				retry: void 0
			};
		}
	};
	module.exports = { EventSourceStream };
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/lib/web/eventsource/eventsource.js
var require_eventsource = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { pipeline } = __require("node:stream");
	const { fetching } = require_fetch();
	const { makeRequest } = require_request();
	const { webidl } = require_webidl();
	const { EventSourceStream } = require_eventsource_stream();
	const { parseMIMEType } = require_data_url();
	const { createFastMessageEvent } = require_events();
	const { isNetworkError } = require_response();
	const { delay } = require_util();
	const { kEnumerableProperty } = require_util$7();
	const { environmentSettingsObject } = require_util$6();
	let experimentalWarned = false;
	/**
	* A reconnection time, in milliseconds. This must initially be an implementation-defined value,
	* probably in the region of a few seconds.
	*
	* In Comparison:
	* - Chrome uses 3000ms.
	* - Deno uses 5000ms.
	*
	* @type {3000}
	*/
	const defaultReconnectionTime = 3e3;
	/**
	* The readyState attribute represents the state of the connection.
	* @enum
	* @readonly
	* @see https://html.spec.whatwg.org/multipage/server-sent-events.html#dom-eventsource-readystate-dev
	*/
	/**
	* The connection has not yet been established, or it was closed and the user
	* agent is reconnecting.
	* @type {0}
	*/
	const CONNECTING = 0;
	/**
	* The user agent has an open connection and is dispatching events as it
	* receives them.
	* @type {1}
	*/
	const OPEN = 1;
	/**
	* The connection is not open, and the user agent is not trying to reconnect.
	* @type {2}
	*/
	const CLOSED = 2;
	/**
	* Requests for the element will have their mode set to "cors" and their credentials mode set to "same-origin".
	* @type {'anonymous'}
	*/
	const ANONYMOUS = "anonymous";
	/**
	* Requests for the element will have their mode set to "cors" and their credentials mode set to "include".
	* @type {'use-credentials'}
	*/
	const USE_CREDENTIALS = "use-credentials";
	/**
	* The EventSource interface is used to receive server-sent events. It
	* connects to a server over HTTP and receives events in text/event-stream
	* format without closing the connection.
	* @extends {EventTarget}
	* @see https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events
	* @api public
	*/
	var EventSource = class EventSource extends EventTarget {
		#events = {
			open: null,
			error: null,
			message: null
		};
		#url = null;
		#withCredentials = false;
		#readyState = CONNECTING;
		#request = null;
		#controller = null;
		#dispatcher;
		/**
		* @type {import('./eventsource-stream').eventSourceSettings}
		*/
		#state;
		/**
		* Creates a new EventSource object.
		* @param {string} url
		* @param {EventSourceInit} [eventSourceInitDict]
		* @see https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
		*/
		constructor(url, eventSourceInitDict = {}) {
			super();
			webidl.util.markAsUncloneable(this);
			const prefix = "EventSource constructor";
			webidl.argumentLengthCheck(arguments, 1, prefix);
			if (!experimentalWarned) {
				experimentalWarned = true;
				process.emitWarning("EventSource is experimental, expect them to change at any time.", { code: "UNDICI-ES" });
			}
			url = webidl.converters.USVString(url, prefix, "url");
			eventSourceInitDict = webidl.converters.EventSourceInitDict(eventSourceInitDict, prefix, "eventSourceInitDict");
			this.#dispatcher = eventSourceInitDict.dispatcher;
			this.#state = {
				lastEventId: "",
				reconnectionTime: defaultReconnectionTime
			};
			const settings = environmentSettingsObject;
			let urlRecord;
			try {
				urlRecord = new URL(url, settings.settingsObject.baseUrl);
				this.#state.origin = urlRecord.origin;
			} catch (e) {
				throw new DOMException(e, "SyntaxError");
			}
			this.#url = urlRecord.href;
			let corsAttributeState = ANONYMOUS;
			if (eventSourceInitDict.withCredentials) {
				corsAttributeState = USE_CREDENTIALS;
				this.#withCredentials = true;
			}
			const initRequest = {
				redirect: "follow",
				keepalive: true,
				mode: "cors",
				credentials: corsAttributeState === "anonymous" ? "same-origin" : "omit",
				referrer: "no-referrer"
			};
			initRequest.client = environmentSettingsObject.settingsObject;
			initRequest.headersList = [["accept", {
				name: "accept",
				value: "text/event-stream"
			}]];
			initRequest.cache = "no-store";
			initRequest.initiator = "other";
			initRequest.urlList = [new URL(this.#url)];
			this.#request = makeRequest(initRequest);
			this.#connect();
		}
		/**
		* Returns the state of this EventSource object's connection. It can have the
		* values described below.
		* @returns {0|1|2}
		* @readonly
		*/
		get readyState() {
			return this.#readyState;
		}
		/**
		* Returns the URL providing the event stream.
		* @readonly
		* @returns {string}
		*/
		get url() {
			return this.#url;
		}
		/**
		* Returns a boolean indicating whether the EventSource object was
		* instantiated with CORS credentials set (true), or not (false, the default).
		*/
		get withCredentials() {
			return this.#withCredentials;
		}
		#connect() {
			if (this.#readyState === CLOSED) return;
			this.#readyState = CONNECTING;
			const fetchParams = {
				request: this.#request,
				dispatcher: this.#dispatcher
			};
			const processEventSourceEndOfBody = (response) => {
				if (isNetworkError(response)) {
					this.dispatchEvent(new Event("error"));
					this.close();
				}
				this.#reconnect();
			};
			fetchParams.processResponseEndOfBody = processEventSourceEndOfBody;
			fetchParams.processResponse = (response) => {
				if (isNetworkError(response)) if (response.aborted) {
					this.close();
					this.dispatchEvent(new Event("error"));
					return;
				} else {
					this.#reconnect();
					return;
				}
				const contentType = response.headersList.get("content-type", true);
				const mimeType = contentType !== null ? parseMIMEType(contentType) : "failure";
				const contentTypeValid = mimeType !== "failure" && mimeType.essence === "text/event-stream";
				if (response.status !== 200 || contentTypeValid === false) {
					this.close();
					this.dispatchEvent(new Event("error"));
					return;
				}
				this.#readyState = OPEN;
				this.dispatchEvent(new Event("open"));
				this.#state.origin = response.urlList[response.urlList.length - 1].origin;
				const eventSourceStream = new EventSourceStream({
					eventSourceSettings: this.#state,
					push: (event) => {
						this.dispatchEvent(createFastMessageEvent(event.type, event.options));
					}
				});
				pipeline(response.body.stream, eventSourceStream, (error) => {
					if (error?.aborted === false) {
						this.close();
						this.dispatchEvent(new Event("error"));
					}
				});
			};
			this.#controller = fetching(fetchParams);
		}
		/**
		* @see https://html.spec.whatwg.org/multipage/server-sent-events.html#sse-processing-model
		* @returns {Promise<void>}
		*/
		async #reconnect() {
			if (this.#readyState === CLOSED) return;
			this.#readyState = CONNECTING;
			this.dispatchEvent(new Event("error"));
			await delay(this.#state.reconnectionTime);
			if (this.#readyState !== CONNECTING) return;
			if (this.#state.lastEventId.length) this.#request.headersList.set("last-event-id", this.#state.lastEventId, true);
			this.#connect();
		}
		/**
		* Closes the connection, if any, and sets the readyState attribute to
		* CLOSED.
		*/
		close() {
			webidl.brandCheck(this, EventSource);
			if (this.#readyState === CLOSED) return;
			this.#readyState = CLOSED;
			this.#controller.abort();
			this.#request = null;
		}
		get onopen() {
			return this.#events.open;
		}
		set onopen(fn) {
			if (this.#events.open) this.removeEventListener("open", this.#events.open);
			if (typeof fn === "function") {
				this.#events.open = fn;
				this.addEventListener("open", fn);
			} else this.#events.open = null;
		}
		get onmessage() {
			return this.#events.message;
		}
		set onmessage(fn) {
			if (this.#events.message) this.removeEventListener("message", this.#events.message);
			if (typeof fn === "function") {
				this.#events.message = fn;
				this.addEventListener("message", fn);
			} else this.#events.message = null;
		}
		get onerror() {
			return this.#events.error;
		}
		set onerror(fn) {
			if (this.#events.error) this.removeEventListener("error", this.#events.error);
			if (typeof fn === "function") {
				this.#events.error = fn;
				this.addEventListener("error", fn);
			} else this.#events.error = null;
		}
	};
	const constantsPropertyDescriptors = {
		CONNECTING: {
			__proto__: null,
			configurable: false,
			enumerable: true,
			value: CONNECTING,
			writable: false
		},
		OPEN: {
			__proto__: null,
			configurable: false,
			enumerable: true,
			value: OPEN,
			writable: false
		},
		CLOSED: {
			__proto__: null,
			configurable: false,
			enumerable: true,
			value: CLOSED,
			writable: false
		}
	};
	Object.defineProperties(EventSource, constantsPropertyDescriptors);
	Object.defineProperties(EventSource.prototype, constantsPropertyDescriptors);
	Object.defineProperties(EventSource.prototype, {
		close: kEnumerableProperty,
		onerror: kEnumerableProperty,
		onmessage: kEnumerableProperty,
		onopen: kEnumerableProperty,
		readyState: kEnumerableProperty,
		url: kEnumerableProperty,
		withCredentials: kEnumerableProperty
	});
	webidl.converters.EventSourceInitDict = webidl.dictionaryConverter([{
		key: "withCredentials",
		converter: webidl.converters.boolean,
		defaultValue: () => false
	}, {
		key: "dispatcher",
		converter: webidl.converters.any
	}]);
	module.exports = {
		EventSource,
		defaultReconnectionTime
	};
}));

//#endregion
//#region node_modules/.pnpm/undici@6.23.0/node_modules/undici/index.js
var require_undici = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Client = require_client();
	const Dispatcher = require_dispatcher();
	const Pool = require_pool();
	const BalancedPool = require_balanced_pool();
	const Agent = require_agent();
	const ProxyAgent = require_proxy_agent();
	const EnvHttpProxyAgent = require_env_http_proxy_agent();
	const RetryAgent = require_retry_agent();
	const errors = require_errors();
	const util = require_util$7();
	const { InvalidArgumentError } = errors;
	const api = require_api();
	const buildConnector = require_connect();
	const MockClient = require_mock_client();
	const MockAgent = require_mock_agent();
	const MockPool = require_mock_pool();
	const mockErrors = require_mock_errors();
	const RetryHandler = require_retry_handler();
	const { getGlobalDispatcher, setGlobalDispatcher } = require_global();
	const DecoratorHandler = require_decorator_handler();
	const RedirectHandler = require_redirect_handler();
	const createRedirectInterceptor = require_redirect_interceptor();
	Object.assign(Dispatcher.prototype, api);
	module.exports.Dispatcher = Dispatcher;
	module.exports.Client = Client;
	module.exports.Pool = Pool;
	module.exports.BalancedPool = BalancedPool;
	module.exports.Agent = Agent;
	module.exports.ProxyAgent = ProxyAgent;
	module.exports.EnvHttpProxyAgent = EnvHttpProxyAgent;
	module.exports.RetryAgent = RetryAgent;
	module.exports.RetryHandler = RetryHandler;
	module.exports.DecoratorHandler = DecoratorHandler;
	module.exports.RedirectHandler = RedirectHandler;
	module.exports.createRedirectInterceptor = createRedirectInterceptor;
	module.exports.interceptors = {
		redirect: require_redirect(),
		retry: require_retry(),
		dump: require_dump(),
		dns: require_dns()
	};
	module.exports.buildConnector = buildConnector;
	module.exports.errors = errors;
	module.exports.util = {
		parseHeaders: util.parseHeaders,
		headerNameToString: util.headerNameToString
	};
	function makeDispatcher(fn) {
		return (url, opts, handler) => {
			if (typeof opts === "function") {
				handler = opts;
				opts = null;
			}
			if (!url || typeof url !== "string" && typeof url !== "object" && !(url instanceof URL)) throw new InvalidArgumentError("invalid url");
			if (opts != null && typeof opts !== "object") throw new InvalidArgumentError("invalid opts");
			if (opts && opts.path != null) {
				if (typeof opts.path !== "string") throw new InvalidArgumentError("invalid opts.path");
				let path = opts.path;
				if (!opts.path.startsWith("/")) path = `/${path}`;
				url = new URL(util.parseOrigin(url).origin + path);
			} else {
				if (!opts) opts = typeof url === "object" ? url : {};
				url = util.parseURL(url);
			}
			const { agent, dispatcher = getGlobalDispatcher() } = opts;
			if (agent) throw new InvalidArgumentError("unsupported opts.agent. Did you mean opts.client?");
			return fn.call(dispatcher, {
				...opts,
				origin: url.origin,
				path: url.search ? `${url.pathname}${url.search}` : url.pathname,
				method: opts.method || (opts.body ? "PUT" : "GET")
			}, handler);
		};
	}
	module.exports.setGlobalDispatcher = setGlobalDispatcher;
	module.exports.getGlobalDispatcher = getGlobalDispatcher;
	const fetchImpl = require_fetch().fetch;
	module.exports.fetch = async function fetch(init, options = void 0) {
		try {
			return await fetchImpl(init, options);
		} catch (err) {
			if (err && typeof err === "object") Error.captureStackTrace(err);
			throw err;
		}
	};
	module.exports.Headers = require_headers().Headers;
	module.exports.Response = require_response().Response;
	module.exports.Request = require_request().Request;
	module.exports.FormData = require_formdata().FormData;
	module.exports.File = globalThis.File ?? __require("node:buffer").File;
	module.exports.FileReader = require_filereader().FileReader;
	const { setGlobalOrigin, getGlobalOrigin } = require_global$1();
	module.exports.setGlobalOrigin = setGlobalOrigin;
	module.exports.getGlobalOrigin = getGlobalOrigin;
	const { CacheStorage } = require_cachestorage();
	const { kConstruct } = require_symbols$1();
	module.exports.caches = new CacheStorage(kConstruct);
	const { deleteCookie, getCookies, getSetCookies, setCookie } = require_cookies();
	module.exports.deleteCookie = deleteCookie;
	module.exports.getCookies = getCookies;
	module.exports.getSetCookies = getSetCookies;
	module.exports.setCookie = setCookie;
	const { parseMIMEType, serializeAMimeType } = require_data_url();
	module.exports.parseMIMEType = parseMIMEType;
	module.exports.serializeAMimeType = serializeAMimeType;
	const { CloseEvent, ErrorEvent, MessageEvent } = require_events();
	module.exports.WebSocket = require_websocket().WebSocket;
	module.exports.CloseEvent = CloseEvent;
	module.exports.ErrorEvent = ErrorEvent;
	module.exports.MessageEvent = MessageEvent;
	module.exports.request = makeDispatcher(api.request);
	module.exports.stream = makeDispatcher(api.stream);
	module.exports.pipeline = makeDispatcher(api.pipeline);
	module.exports.connect = makeDispatcher(api.connect);
	module.exports.upgrade = makeDispatcher(api.upgrade);
	module.exports.MockClient = MockClient;
	module.exports.MockPool = MockPool;
	module.exports.MockAgent = MockAgent;
	module.exports.mockErrors = mockErrors;
	const { EventSource } = require_eventsource();
	module.exports.EventSource = EventSource;
}));

//#endregion
//#region node_modules/.pnpm/@actions+http-client@4.0.0/node_modules/@actions/http-client/lib/index.js
var import_tunnel = /* @__PURE__ */ __toESM(require_tunnel(), 1);
var import_undici = require_undici();
var __awaiter$9 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
var HttpCodes;
(function(HttpCodes) {
	HttpCodes[HttpCodes["OK"] = 200] = "OK";
	HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
	HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
	HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
	HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
	HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
	HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
	HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
	HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
	HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
	HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
	HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
	HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
	HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
	HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
	HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
	HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
	HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
	HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
	HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
	HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
	HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
	HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
	HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
	HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
	HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
	HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes || (HttpCodes = {}));
var Headers;
(function(Headers) {
	Headers["Accept"] = "accept";
	Headers["ContentType"] = "content-type";
})(Headers || (Headers = {}));
var MediaTypes;
(function(MediaTypes) {
	MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes || (MediaTypes = {}));
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

//#endregion
//#region node_modules/.pnpm/@actions+http-client@4.0.0/node_modules/@actions/http-client/lib/auth.js
var __awaiter$8 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/oidc-utils.js
var __awaiter$7 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/summary.js
var __awaiter$6 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
const { access, appendFile, writeFile } = promises;
const SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
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
			const pathFromEnv = process.env[SUMMARY_ENV_VAR];
			if (!pathFromEnv) throw new Error(`Unable to find environment variable for $${SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
			try {
				yield access(pathFromEnv, constants.R_OK | constants.W_OK);
			} catch (_a) {
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
		return this.addRaw(EOL);
	}
	/**
	* Adds an HTML codeblock to the summary buffer
	*
	* @param {string} code content to render within fenced code block
	* @param {string} lang (optional) language to syntax highlight code
	*
	* @returns {Summary} summary instance
	*/
	addCodeBlock(code, lang) {
		const attrs = Object.assign({}, lang && { lang });
		const element = this.wrap("pre", this.wrap("code", code), attrs);
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
	addImage(src, alt, options) {
		const { width, height } = options || {};
		const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
		const element = this.wrap("img", null, Object.assign({
			src,
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

//#endregion
//#region node_modules/.pnpm/@actions+io@3.0.2/node_modules/@actions/io/lib/io-util.js
var __awaiter$5 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
const { chmod, copyFile, lstat, mkdir, open, readdir, rename, rm, rmdir, stat, symlink, unlink } = fs$3.promises;
const IS_WINDOWS$1 = process.platform === "win32";
const READONLY = fs$3.constants.O_RDONLY;

//#endregion
//#region node_modules/.pnpm/@actions+io@3.0.2/node_modules/@actions/io/lib/io.js
var __awaiter$4 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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

//#endregion
//#region node_modules/.pnpm/@actions+exec@3.0.0/node_modules/@actions/exec/lib/toolrunner.js
var __awaiter$3 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
const IS_WINDOWS = process.platform === "win32";

//#endregion
//#region node_modules/.pnpm/@actions+exec@3.0.0/node_modules/@actions/exec/lib/exec.js
var __awaiter$2 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/platform.js
var __awaiter$1 = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
const platform = os$1.platform();
const arch = os$1.arch();

//#endregion
//#region node_modules/.pnpm/@actions+core@3.0.0/node_modules/@actions/core/lib/core.js
var __awaiter = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
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
/**
* The code to exit an action
*/
var ExitCode;
(function(ExitCode) {
	/**
	* A code indicating that the action was successful
	*/
	ExitCode[ExitCode["Success"] = 0] = "Success";
	/**
	* A code indicating that the action was a failure
	*/
	ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode || (ExitCode = {}));
/**
* Registers a secret which will get masked from logs
*
* @param secret - Value of the secret to be masked
* @remarks
* This function instructs the Actions runner to mask the specified value in any
* logs produced during the workflow run. Once registered, the secret value will
* be replaced with asterisks (***) whenever it appears in console output, logs,
* or error messages.
*
* This is useful for protecting sensitive information such as:
* - API keys
* - Access tokens
* - Authentication credentials
* - URL parameters containing signatures (SAS tokens)
*
* Note that masking only affects future logs; any previous appearances of the
* secret in logs before calling this function will remain unmasked.
*
* @example
* ```typescript
* // Register an API token as a secret
* const apiToken = "abc123xyz456";
* setSecret(apiToken);
*
* // Now any logs containing this value will show *** instead
* console.log(`Using token: ${apiToken}`); // Outputs: "Using token: ***"
* ```
*/
function setSecret(secret) {
	issueCommand("add-mask", {}, secret);
}
/**
* Gets the value of an input.
* Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
* Returns an empty string if the value is not defined.
*
* @param     name     name of the input to get
* @param     options  optional. See InputOptions.
* @returns   string
*/
function getInput$1(name, options) {
	const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
	if (options && options.required && !val) throw new Error(`Input required and not supplied: ${name}`);
	if (options && options.trimWhitespace === false) return val;
	return val.trim();
}
/**
* Sets the value of an output.
*
* @param     name     name of the output to set
* @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
*/
function setOutput$1(name, value) {
	if (process.env["GITHUB_OUTPUT"] || "") return issueFileCommand("OUTPUT", prepareKeyValueMessage(name, value));
	process.stdout.write(os$2.EOL);
	issueCommand("set-output", { name }, toCommandValue(value));
}
/**
* Sets the action status to failed.
* When the action exits it will be with an exit code of 1
* @param message add error issue message
*/
function setFailed$1(message) {
	process.exitCode = ExitCode.Failure;
	error(message);
}
/**
* Writes debug message to user log
* @param message debug message
*/
function debug(message) {
	issueCommand("debug", {}, message);
}
/**
* Adds an error issue
* @param message error issue message. Errors will be converted to string via toString()
* @param properties optional properties to add to the annotation.
*/
function error(message, properties = {}) {
	issueCommand("error", toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
/**
* Writes info to log with console.log.
* @param message info message
*/
function info(message) {
	process.stdout.write(message + os$2.EOL);
}

//#endregion
//#region src/action/core.ts
/** Wrapper module for `@actions/core` */
/** Logger using the methods from `@actions/core`. */
const logger = {
	debug,
	info,
	error
};
/**
* Get input by name.
*
* @param name Input name
* @returns The input string value, or undefined if not set
*/
function getInput(name) {
	const inputString = getInput$1(name);
	return inputString.length > 0 ? inputString : void 0;
}
/**
* Get a required secret input by name.
*
* @param name Input name
* @returns The input secret value.
*/
function getSecretInput(name) {
	const inputString = getInput(name);
	if (inputString) setSecret(inputString);
	return inputString;
}
/**
* Get a boolean input by name.
*
* @param name Input name
* @returns True if value is "true", false if "false", undefined if unset
*/
function getBooleanInput(name) {
	const inputString = getInput$1(name).toLowerCase();
	if (inputString === "true") return true;
	if (inputString === "false") return false;
}
/**
* Set the action as failed due to an error.
*
* @param error An value from a `catch`
*/
function setFailed(error) {
	setFailed$1(error);
}
function setOutput(name, value, defaultValue) {
	setOutput$1(name, value ?? defaultValue);
}

//#endregion
//#region src/action/main.ts
/** Action entry point */
/** Run the action. */
async function run() {
	const results = await npmPublish({
		token: getSecretInput("token"),
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
	} catch (error) {
		setFailed(error);
	}
}

//#endregion
export { main };
//# sourceMappingURL=main.js.map