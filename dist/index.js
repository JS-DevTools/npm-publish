require('./sourcemap-register.js');module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(48);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 20:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const cp = __webpack_require__(129);
const parse = __webpack_require__(568);
const enoent = __webpack_require__(881);

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse(command, args, options);

    // Spawn the child process
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

module.exports = spawn;
module.exports.spawn = spawn;
module.exports.sync = spawnSync;

module.exports._parse = parse;
module.exports._enoent = enoent;


/***/ }),

/***/ 39:
/***/ (function(module) {

"use strict";


const pathKey = (options = {}) => {
	const environment = options.env || process.env;
	const platform = options.platform || process.platform;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(environment).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
};

module.exports = pathKey;
// TODO: Remove this for the next major release
module.exports.default = pathKey;


/***/ }),

/***/ 48:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(470);
const npm_publish_1 = __webpack_require__(775);
/**
 * The main entry point of the GitHub Action
 * @internal
 */
async function main() {
    try {
        // Setup global error handlers
        process.on("uncaughtException", errorHandler);
        process.on("unhandledRejection", errorHandler);
        // Get the GitHub Actions input options
        const options = {
            token: core_1.getInput("token", { required: true }),
            registry: core_1.getInput("registry", { required: true }),
            package: core_1.getInput("package", { required: true }),
            checkVersion: core_1.getInput("check-version", { required: true }).toLowerCase() === "true",
            tag: core_1.getInput("tag"),
            access: core_1.getInput("access"),
            dryRun: core_1.getInput("dry-run").toLowerCase() === "true",
            debug: debugHandler,
        };
        // Publish to NPM
        let results = await npm_publish_1.npmPublish(options);
        if (results.type === "none") {
            console.log(`\n📦 ${results.package} v${results.version} is already published to NPM`);
        }
        else if (results.dryRun) {
            console.log(`\n📦 ${results.package} v${results.version} was NOT actually published to NPM (dry run)`);
        }
        else {
            console.log(`\n📦 Successfully published ${results.package} v${results.version} to NPM`);
        }
        // Set the GitHub Actions output variables
        core_1.setOutput("type", results.type);
        core_1.setOutput("version", results.version);
        core_1.setOutput("old-version", results.oldVersion);
        core_1.setOutput("tag", results.tag);
        core_1.setOutput("access", results.access);
        core_1.setOutput("dry-run", results.dryRun);
    }
    catch (error) {
        errorHandler(error);
    }
}
/**
 * Prints errors to the GitHub Actions console
 */
function errorHandler(error) {
    let message = error.stack || error.message || String(error);
    core_1.setFailed(message);
    process.exit();
}
/**
 * Prints debug logs to the GitHub Actions console
 */
function debugHandler(message, data) {
    if (data) {
        message += "\n" + JSON.stringify(data, undefined, 2);
    }
    core_1.debug(message);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


/***/ }),

/***/ 62:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.npm = void 0;
const ezSpawn = __webpack_require__(733);
const ono_1 = __webpack_require__(271);
const path_1 = __webpack_require__(622);
const semver_1 = __webpack_require__(513);
const npm_config_1 = __webpack_require__(566);
const npm_env_1 = __webpack_require__(850);
/**
 * Runs NPM commands.
 * @internal
 */
exports.npm = {
    /**
     * Gets the latest published version of the specified package.
     */
    async getLatestVersion(name, options) {
        // Update the NPM config with the specified registry and token
        await npm_config_1.setNpmConfig(options);
        try {
            let command = ["npm", "view"];
            if (options.tag === "latest") {
                command.push(name);
            }
            else {
                command.push(`${name}@${options.tag}`);
            }
            command.push("version");
            // Get the environment variables to pass to NPM
            let env = npm_env_1.getNpmEnvironment(options);
            // Run NPM to get the latest published version of the package
            options.debug(`Running command: npm view ${name} version`, { command, env });
            let result;
            try {
                result = await ezSpawn.async(command, { env });
            }
            catch (err) {
                // In case ezSpawn.async throws, it still has stdout and stderr properties.
                result = err;
            }
            let version = result.stdout.trim();
            let error = result.stderr.trim();
            let status = result.status || 0;
            // If the package was not previously published, return version 0.0.0.
            if ((status === 0 && !version) || error.includes("E404")) {
                options.debug(`The latest version of ${name} is at v0.0.0, as it was never published.`);
                return new semver_1.SemVer("0.0.0");
            }
            else if (result instanceof Error) {
                // NPM failed for some reason
                throw result;
            }
            // Parse/validate the version number
            let semver = new semver_1.SemVer(version);
            options.debug(`The latest version of ${name} is at v${semver}`);
            return semver;
        }
        catch (error) {
            throw ono_1.ono(error, `Unable to determine the current version of ${name} on NPM.`);
        }
    },
    /**
     * Publishes the specified package to NPM
     */
    async publish({ name, version }, options) {
        // Update the NPM config with the specified registry and token
        await npm_config_1.setNpmConfig(options);
        try {
            let command = ["npm", "publish"];
            if (options.tag !== "latest") {
                command.push("--tag", options.tag);
            }
            if (options.access) {
                command.push("--access", options.access);
            }
            if (options.dryRun) {
                command.push("--dry-run");
            }
            // Run "npm publish" in the package.json directory
            let cwd = path_1.resolve(path_1.dirname(options.package));
            // Determine whether to suppress NPM's output
            let stdio = options.quiet ? "pipe" : "inherit";
            // Get the environment variables to pass to NPM
            let env = npm_env_1.getNpmEnvironment(options);
            // Run NPM to publish the package
            options.debug("Running command: npm publish", { command, stdio, cwd, env });
            await ezSpawn.async(command, { cwd, stdio, env });
        }
        catch (error) {
            throw ono_1.ono(error, `Unable to publish ${name} v${version} to NPM.`);
        }
    },
};


/***/ }),

/***/ 82:
/***/ (function(__unusedmodule, exports) {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 102:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(747));
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 116:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyJoinStacks = exports.joinStacks = exports.isWritableStack = exports.isLazyStack = void 0;
const newline = /\r?\n/;
const onoCall = /\bono[ @]/;
/**
 * Is the property lazily computed?
 */
function isLazyStack(stackProp) {
    return Boolean(stackProp &&
        stackProp.configurable &&
        typeof stackProp.get === "function");
}
exports.isLazyStack = isLazyStack;
/**
 * Is the stack property writable?
 */
function isWritableStack(stackProp) {
    return Boolean(
    // If there is no stack property, then it's writable, since assigning it will create it
    !stackProp ||
        stackProp.writable ||
        typeof stackProp.set === "function");
}
exports.isWritableStack = isWritableStack;
/**
 * Appends the original `Error.stack` property to the new Error's stack.
 */
function joinStacks(newError, originalError) {
    let newStack = popStack(newError.stack);
    let originalStack = originalError ? originalError.stack : undefined;
    if (newStack && originalStack) {
        return newStack + "\n\n" + originalStack;
    }
    else {
        return newStack || originalStack;
    }
}
exports.joinStacks = joinStacks;
/**
 * Calls `joinStacks` lazily, when the `Error.stack` property is accessed.
 */
function lazyJoinStacks(lazyStack, newError, originalError) {
    if (originalError) {
        Object.defineProperty(newError, "stack", {
            get: () => {
                let newStack = lazyStack.get.apply(newError);
                return joinStacks({ stack: newStack }, originalError);
            },
            enumerable: false,
            configurable: true
        });
    }
    else {
        lazyPopStack(newError, lazyStack);
    }
}
exports.lazyJoinStacks = lazyJoinStacks;
/**
 * Removes Ono from the stack, so that the stack starts at the original error location
 */
function popStack(stack) {
    if (stack) {
        let lines = stack.split(newline);
        // Find the Ono call(s) in the stack, and remove them
        let onoStart;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (onoCall.test(line)) {
                if (onoStart === undefined) {
                    // We found the first Ono call in the stack trace.
                    // There may be other subsequent Ono calls as well.
                    onoStart = i;
                }
            }
            else if (onoStart !== undefined) {
                // We found the first non-Ono call after one or more Ono calls.
                // So remove the Ono call lines from the stack trace
                lines.splice(onoStart, i - onoStart);
                break;
            }
        }
        if (lines.length > 0) {
            return lines.join("\n");
        }
    }
    // If we get here, then the stack doesn't contain a call to `ono`.
    // This may be due to minification or some optimization of the JS engine.
    // So just return the stack as-is.
    return stack;
}
/**
 * Calls `popStack` lazily, when the `Error.stack` property is accessed.
 */
function lazyPopStack(error, lazyStack) {
    Object.defineProperty(error, "stack", {
        get: () => popStack(lazyStack.get.apply(error)),
        enumerable: false,
        configurable: true
    });
}
//# sourceMappingURL=stack.js.map

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 152:
/***/ (function(module) {

"use strict";


/**
 * An instance of this class is returned by {@link sync} and {@link async} when the process exits
 * with a non-zero status code.
 */
module.exports = class ProcessError extends Error {
  constructor (process) {
    let message = `${process.toString()} exited with a status of ${process.status}.`;

    if (process.stderr.length > 0) {
      message += "\n\n" + process.stderr.toString().trim();
    }

    super(message);
    Object.assign(this, process);
    this.name = ProcessError.name;
  }
};


/***/ }),

/***/ 197:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = isexe
isexe.sync = sync

var fs = __webpack_require__(747)

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, options))
  })
}

function sync (path, options) {
  return checkStat(fs.statSync(path), options)
}

function checkStat (stat, options) {
  return stat.isFile() && checkMode(stat, options)
}

function checkMode (stat, options) {
  var mod = stat.mode
  var uid = stat.uid
  var gid = stat.gid

  var myUid = options.uid !== undefined ?
    options.uid : process.getuid && process.getuid()
  var myGid = options.gid !== undefined ?
    options.gid : process.getgid && process.getgid()

  var u = parseInt('100', 8)
  var g = parseInt('010', 8)
  var o = parseInt('001', 8)
  var ug = u | g

  var ret = (mod & o) ||
    (mod & g) && gid === myGid ||
    (mod & u) && uid === myUid ||
    (mod & ug) && myUid === 0

  return ret
}


/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ono = void 0;
/* eslint-env commonjs */
const singleton_1 = __webpack_require__(755);
Object.defineProperty(exports, "ono", { enumerable: true, get: function () { return singleton_1.ono; } });
var constructor_1 = __webpack_require__(507);
Object.defineProperty(exports, "Ono", { enumerable: true, get: function () { return constructor_1.Ono; } });
__exportStar(__webpack_require__(430), exports);
exports.default = singleton_1.ono;
// CommonJS default export hack
if ( true && typeof module.exports === "object") {
    module.exports = Object.assign(module.exports.default, module.exports);
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 292:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.readManifest = void 0;
const ono_1 = __webpack_require__(271);
const fs_1 = __webpack_require__(747);
const path_1 = __webpack_require__(622);
const semver_1 = __webpack_require__(513);
/**
 * Reads the package manifest (package.json) and returns its parsed contents
 * @internal
 */
async function readManifest(path, debug) {
    debug && debug(`Reading package manifest from ${path_1.resolve(path)}`);
    let json;
    try {
        json = await fs_1.promises.readFile(path, "utf-8");
    }
    catch (error) {
        throw ono_1.ono(error, `Unable to read ${path}`);
    }
    try {
        let { name, version } = JSON.parse(json);
        if (typeof name !== "string" || name.trim().length === 0) {
            throw new TypeError("Invalid package name");
        }
        let manifest = {
            name,
            version: new semver_1.SemVer(version),
        };
        debug && debug("MANIFEST:", manifest);
        return manifest;
    }
    catch (error) {
        throw ono_1.ono(error, `Unable to parse ${path}`);
    }
}
exports.readManifest = readManifest;


/***/ }),

/***/ 326:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.extendError = void 0;
const isomorphic_node_1 = __webpack_require__(757);
const stack_1 = __webpack_require__(116);
const to_json_1 = __webpack_require__(483);
const protectedProps = ["name", "message", "stack"];
/**
 * Extends the new error with the properties of the original error and the `props` object.
 *
 * @param newError - The error object to extend
 * @param originalError - The original error object, if any
 * @param props - Additional properties to add, if any
 */
function extendError(error, originalError, props) {
    let onoError = error;
    extendStack(onoError, originalError);
    // Copy properties from the original error
    if (originalError && typeof originalError === "object") {
        mergeErrors(onoError, originalError);
    }
    // The default `toJSON` method doesn't output props like `name`, `message`, `stack`, etc.
    // So replace it with one that outputs every property of the error.
    onoError.toJSON = to_json_1.toJSON;
    // On Node.js, add support for the `util.inspect()` method
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isomorphic_node_1.addInspectMethod) {
        isomorphic_node_1.addInspectMethod(onoError);
    }
    // Finally, copy custom properties that were specified by the user.
    // These props OVERWRITE any previous props
    if (props && typeof props === "object") {
        Object.assign(onoError, props);
    }
    return onoError;
}
exports.extendError = extendError;
/**
 * Extend the error stack to include its cause
 */
function extendStack(newError, originalError) {
    let stackProp = Object.getOwnPropertyDescriptor(newError, "stack");
    if (stack_1.isLazyStack(stackProp)) {
        stack_1.lazyJoinStacks(stackProp, newError, originalError);
    }
    else if (stack_1.isWritableStack(stackProp)) {
        newError.stack = stack_1.joinStacks(newError, originalError);
    }
}
/**
 * Merges properties of the original error with the new error.
 *
 * @param newError - The error object to extend
 * @param originalError - The original error object, if any
 */
function mergeErrors(newError, originalError) {
    // Get the original error's keys
    // NOTE: We specifically exclude properties that we have already set on the new error.
    // This is _especially_ important for the `stack` property, because this property has
    // a lazy getter in some environments
    let keys = to_json_1.getDeepKeys(originalError, protectedProps);
    // HACK: We have to cast the errors to `any` so we can use symbol indexers.
    // see https://github.com/Microsoft/TypeScript/issues/1863
    let _newError = newError;
    let _originalError = originalError;
    for (let key of keys) {
        if (_newError[key] === undefined) {
            try {
                _newError[key] = _originalError[key];
            }
            catch (e) {
                // This property is read-only, so it can't be copied
            }
        }
    }
}
//# sourceMappingURL=extend-error.js.map

/***/ }),

/***/ 328:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const normalizeArgs = __webpack_require__(874);
const normalizeResult = __webpack_require__(700);
const spawnSync = __webpack_require__(20).sync;

module.exports = sync;

/**
 * Executes the given command synchronously, and returns the buffered results.
 *
 * @param {string|string[]} command - The command to run
 * @param {string|string[]} [args] - The command arguments
 * @param {object} [options] - options
 * @returns {Process}
 *
 * @see {@link normalizeArgs} for argument details
 */
function sync () {
  // Normalize the function arguments
  let { command, args, options, error } = normalizeArgs(arguments);

  if (error) {
    // Invalid arguments
    normalizeResult({ command, args, options, error });
  }
  else {
    let result;

    try {
      // Run the program
      result = spawnSync(command, args, options);
    }
    catch (error) {
      // An error occurred while spawning or killing the process
      normalizeResult({ error, command, args, options });
    }

    // Return the results or throw an error
    return normalizeResult(Object.assign({}, result, { command, args, options }));
  }
}


/***/ }),

/***/ 389:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(747);
const shebangCommand = __webpack_require__(866);

function readShebang(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    const buffer = Buffer.alloc(size);

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) { /* Empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

module.exports = readShebang;


/***/ }),

/***/ 430:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(669);
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
const utils_1 = __webpack_require__(82);
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
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 462:
/***/ (function(module) {

"use strict";


// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');

    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes
    arg = arg.replace(/(\\*)$/, '$1$1');

    // All other backslashes occur literally

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

module.exports.command = escapeCommand;
module.exports.argument = escapeArgument;


/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const file_command_1 = __webpack_require__(102);
const utils_1 = __webpack_require__(82);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
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
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 483:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeepKeys = exports.toJSON = void 0;
const nonJsonTypes = ["function", "symbol", "undefined"];
const protectedProps = ["constructor", "prototype", "__proto__"];
const objectPrototype = Object.getPrototypeOf({});
/**
 * Custom JSON serializer for Error objects.
 * Returns all built-in error properties, as well as extended properties.
 */
function toJSON() {
    // HACK: We have to cast the objects to `any` so we can use symbol indexers.
    // see https://github.com/Microsoft/TypeScript/issues/1863
    let pojo = {};
    let error = this;
    for (let key of getDeepKeys(error)) {
        if (typeof key === "string") {
            let value = error[key];
            let type = typeof value;
            if (!nonJsonTypes.includes(type)) {
                pojo[key] = value;
            }
        }
    }
    return pojo;
}
exports.toJSON = toJSON;
/**
 * Returns own, inherited, enumerable, non-enumerable, string, and symbol keys of `obj`.
 * Does NOT return members of the base Object prototype, or the specified omitted keys.
 */
function getDeepKeys(obj, omit = []) {
    let keys = [];
    // Crawl the prototype chain, finding all the string and symbol keys
    while (obj && obj !== objectPrototype) {
        keys = keys.concat(Object.getOwnPropertyNames(obj), Object.getOwnPropertySymbols(obj));
        obj = Object.getPrototypeOf(obj);
    }
    // De-duplicate the list of keys
    let uniqueKeys = new Set(keys);
    // Remove any omitted keys
    for (let key of omit.concat(protectedProps)) {
        uniqueKeys.delete(key);
    }
    return uniqueKeys;
}
exports.getDeepKeys = getDeepKeys;
//# sourceMappingURL=to-json.js.map

/***/ }),

/***/ 489:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const path = __webpack_require__(622);
const which = __webpack_require__(814);
const getPathKey = __webpack_require__(39);

function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    // Worker threads do not have process.chdir()
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;

    // If a custom `cwd` was specified, we need to change the process cwd
    // because `which` will do stat calls but does not support a custom cwd
    if (shouldSwitchCwd) {
        try {
            process.chdir(parsed.options.cwd);
        } catch (err) {
            /* Empty */
        }
    }

    let resolved;

    try {
        resolved = which.sync(parsed.command, {
            path: env[getPathKey({ env })],
            pathExt: withoutPathExt ? path.delimiter : undefined,
        });
    } catch (e) {
        /* Empty */
    } finally {
        if (shouldSwitchCwd) {
            process.chdir(cwd);
        }
    }

    // If we successfully resolved, ensure that an absolute path is returned
    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
    if (resolved) {
        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
    }

    return resolved;
}

function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

module.exports = resolveCommand;


/***/ }),

/***/ 507:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Ono = void 0;
const extend_error_1 = __webpack_require__(326);
const normalize_1 = __webpack_require__(673);
const to_json_1 = __webpack_require__(483);
const constructor = Ono;
exports.Ono = constructor;
/**
 * Creates an `Ono` instance for a specifc error type.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function Ono(ErrorConstructor, options) {
    options = normalize_1.normalizeOptions(options);
    function ono(...args) {
        let { originalError, props, message } = normalize_1.normalizeArgs(args, options);
        // Create a new error of the specified type
        let newError = new ErrorConstructor(message);
        // Extend the error with the properties of the original error and the `props` object
        return extend_error_1.extendError(newError, originalError, props);
    }
    ono[Symbol.species] = ErrorConstructor;
    return ono;
}
/**
 * Returns an object containing all properties of the given Error object,
 * which can be used with `JSON.stringify()`.
 */
Ono.toJSON = function toJSON(error) {
    return to_json_1.toJSON.call(error);
};
/**
 * Extends the given Error object with enhanced Ono functionality, such as nested stack traces,
 * additional properties, and improved support for `JSON.stringify()`.
 */
Ono.extend = function extend(error, originalError, props) {
    if (props || originalError instanceof Error) {
        return extend_error_1.extendError(error, originalError, props);
    }
    else if (originalError) {
        return extend_error_1.extendError(error, undefined, originalError);
    }
    else {
        return extend_error_1.extendError(error);
    }
};
//# sourceMappingURL=constructor.js.map

/***/ }),

/***/ 513:
/***/ (function(module) {

module.exports = require("semver");

/***/ }),

/***/ 566:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.setNpmConfig = void 0;
const ezSpawn = __webpack_require__(733);
const ono_1 = __webpack_require__(271);
const fs_1 = __webpack_require__(747);
const os_1 = __webpack_require__(87);
const path_1 = __webpack_require__(622);
const npm_env_1 = __webpack_require__(850);
/**
 * Sets/updates the NPM config based on the options.
 * @internal
 */
async function setNpmConfig(options) {
    // Read the current NPM config
    let configPath = await getNpmConfigPath(options);
    let config = await readNpmConfig(configPath, options);
    // Update the config
    config = updateConfig(config, options);
    // Save the new config
    await writeNpmConfig(configPath, config, options);
}
exports.setNpmConfig = setNpmConfig;
/**
 * Updates the given NPM config with the specified options.
 */
function updateConfig(config, { registry, debug }) {
    let authDomain = registry.origin.slice(registry.protocol.length);
    let lines = config.split(/\r?\n/);
    // Remove any existing lines that set the registry or token
    lines = lines.filter((line) => !(line.startsWith("registry=") || line.includes("_authToken=")));
    // Append the new registry and token to the end of the file
    lines.push(`${authDomain}/:_authToken=\${INPUT_TOKEN}`);
    lines.push(`registry=${registry.href}`);
    config = lines.join(os_1.EOL).trim() + os_1.EOL;
    debug(`NEW NPM CONFIG: \n${config}`);
    return config;
}
/**
 * Gets the path of the NPM config file.
 */
async function getNpmConfigPath(options) {
    try {
        // Get the environment variables to pass to NPM
        let env = npm_env_1.getNpmEnvironment(options);
        options.debug("Running command: npm config get userconfig");
        let process = await ezSpawn.async("npm", "config", "get", "userconfig", { env });
        return process.stdout.trim();
    }
    catch (error) {
        throw ono_1.ono(error, "Unable to determine the NPM config file path.");
    }
}
/**
 * Reads the NPM config file.
 */
async function readNpmConfig(configPath, { debug }) {
    try {
        debug(`Reading NPM config from ${configPath}`);
        let config = await fs_1.promises.readFile(configPath, "utf-8");
        debug(`OLD NPM CONFIG: \n${config}`);
        return config;
    }
    catch (error) {
        if (error.code === "ENOENT") {
            debug("OLD NPM CONFIG: <none>");
            return "";
        }
        throw ono_1.ono(error, `Unable to read the NPM config file: ${configPath}`);
    }
}
/**
 * Writes the NPM config file.
 */
async function writeNpmConfig(configPath, config, { debug }) {
    try {
        debug(`Writing new NPM config to ${configPath}`);
        await fs_1.promises.mkdir(path_1.dirname(configPath), { recursive: true });
        await fs_1.promises.writeFile(configPath, config);
    }
    catch (error) {
        throw ono_1.ono(error, `Unable to update the NPM config file: ${configPath}`);
    }
}


/***/ }),

/***/ 568:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const path = __webpack_require__(622);
const resolveCommand = __webpack_require__(489);
const escape = __webpack_require__(462);
const readShebang = __webpack_require__(389);

const isWin = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);

    const shebang = parsed.file && readShebang(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;

        return resolveCommand(parsed);
    }

    return parsed.file;
}

function parseNonShell(parsed) {
    if (!isWin) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parse(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parsed : parseNonShell(parsed);
}

module.exports = parse;


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 657:
/***/ (function(module) {

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

/* !
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
var promiseExists = typeof Promise === 'function';

/* eslint-disable no-undef */
var globalObject = typeof self === 'object' ? self : global; // eslint-disable-line id-blacklist

var symbolExists = typeof Symbol !== 'undefined';
var mapExists = typeof Map !== 'undefined';
var setExists = typeof Set !== 'undefined';
var weakMapExists = typeof WeakMap !== 'undefined';
var weakSetExists = typeof WeakSet !== 'undefined';
var dataViewExists = typeof DataView !== 'undefined';
var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';
var setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
var mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());
var toStringLeftSliceLength = 8;
var toStringRightSliceLength = -1;
/**
 * ### typeOf (obj)
 *
 * Uses `Object.prototype.toString` to determine the type of an object,
 * normalising behaviour across engine versions & well optimised.
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */
function typeDetect(obj) {
  /* ! Speed optimisation
   * Pre:
   *   string literal     x 3,039,035 ops/sec ±1.62% (78 runs sampled)
   *   boolean literal    x 1,424,138 ops/sec ±4.54% (75 runs sampled)
   *   number literal     x 1,653,153 ops/sec ±1.91% (82 runs sampled)
   *   undefined          x 9,978,660 ops/sec ±1.92% (75 runs sampled)
   *   function           x 2,556,769 ops/sec ±1.73% (77 runs sampled)
   * Post:
   *   string literal     x 38,564,796 ops/sec ±1.15% (79 runs sampled)
   *   boolean literal    x 31,148,940 ops/sec ±1.10% (79 runs sampled)
   *   number literal     x 32,679,330 ops/sec ±1.90% (78 runs sampled)
   *   undefined          x 32,363,368 ops/sec ±1.07% (82 runs sampled)
   *   function           x 31,296,870 ops/sec ±0.96% (83 runs sampled)
   */
  var typeofObj = typeof obj;
  if (typeofObj !== 'object') {
    return typeofObj;
  }

  /* ! Speed optimisation
   * Pre:
   *   null               x 28,645,765 ops/sec ±1.17% (82 runs sampled)
   * Post:
   *   null               x 36,428,962 ops/sec ±1.37% (84 runs sampled)
   */
  if (obj === null) {
    return 'null';
  }

  /* ! Spec Conformance
   * Test: `Object.prototype.toString.call(window)``
   *  - Node === "[object global]"
   *  - Chrome === "[object global]"
   *  - Firefox === "[object Window]"
   *  - PhantomJS === "[object Window]"
   *  - Safari === "[object Window]"
   *  - IE 11 === "[object Window]"
   *  - IE Edge === "[object Window]"
   * Test: `Object.prototype.toString.call(this)``
   *  - Chrome Worker === "[object global]"
   *  - Firefox Worker === "[object DedicatedWorkerGlobalScope]"
   *  - Safari Worker === "[object DedicatedWorkerGlobalScope]"
   *  - IE 11 Worker === "[object WorkerGlobalScope]"
   *  - IE Edge Worker === "[object WorkerGlobalScope]"
   */
  if (obj === globalObject) {
    return 'global';
  }

  /* ! Speed optimisation
   * Pre:
   *   array literal      x 2,888,352 ops/sec ±0.67% (82 runs sampled)
   * Post:
   *   array literal      x 22,479,650 ops/sec ±0.96% (81 runs sampled)
   */
  if (
    Array.isArray(obj) &&
    (symbolToStringTagExists === false || !(Symbol.toStringTag in obj))
  ) {
    return 'Array';
  }

  // Not caching existence of `window` and related properties due to potential
  // for `window` to be unset before tests in quasi-browser environments.
  if (typeof window === 'object' && window !== null) {
    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/browsers.html#location)
     * WhatWG HTML$7.7.3 - The `Location` interface
     * Test: `Object.prototype.toString.call(window.location)``
     *  - IE <=11 === "[object Object]"
     *  - IE Edge <=13 === "[object Object]"
     */
    if (typeof window.location === 'object' && obj === window.location) {
      return 'Location';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/#document)
     * WhatWG HTML$3.1.1 - The `Document` object
     * Note: Most browsers currently adher to the W3C DOM Level 2 spec
     *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-26809268)
     *       which suggests that browsers should use HTMLTableCellElement for
     *       both TD and TH elements. WhatWG separates these.
     *       WhatWG HTML states:
     *         > For historical reasons, Window objects must also have a
     *         > writable, configurable, non-enumerable property named
     *         > HTMLDocument whose value is the Document interface object.
     * Test: `Object.prototype.toString.call(document)``
     *  - Chrome === "[object HTMLDocument]"
     *  - Firefox === "[object HTMLDocument]"
     *  - Safari === "[object HTMLDocument]"
     *  - IE <=10 === "[object Document]"
     *  - IE 11 === "[object HTMLDocument]"
     *  - IE Edge <=13 === "[object HTMLDocument]"
     */
    if (typeof window.document === 'object' && obj === window.document) {
      return 'Document';
    }

    if (typeof window.navigator === 'object') {
      /* ! Spec Conformance
       * (https://html.spec.whatwg.org/multipage/webappapis.html#mimetypearray)
       * WhatWG HTML$8.6.1.5 - Plugins - Interface MimeTypeArray
       * Test: `Object.prototype.toString.call(navigator.mimeTypes)``
       *  - IE <=10 === "[object MSMimeTypesCollection]"
       */
      if (typeof window.navigator.mimeTypes === 'object' &&
          obj === window.navigator.mimeTypes) {
        return 'MimeTypeArray';
      }

      /* ! Spec Conformance
       * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
       * WhatWG HTML$8.6.1.5 - Plugins - Interface PluginArray
       * Test: `Object.prototype.toString.call(navigator.plugins)``
       *  - IE <=10 === "[object MSPluginsCollection]"
       */
      if (typeof window.navigator.plugins === 'object' &&
          obj === window.navigator.plugins) {
        return 'PluginArray';
      }
    }

    if ((typeof window.HTMLElement === 'function' ||
        typeof window.HTMLElement === 'object') &&
        obj instanceof window.HTMLElement) {
      /* ! Spec Conformance
      * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
      * WhatWG HTML$4.4.4 - The `blockquote` element - Interface `HTMLQuoteElement`
      * Test: `Object.prototype.toString.call(document.createElement('blockquote'))``
      *  - IE <=10 === "[object HTMLBlockElement]"
      */
      if (obj.tagName === 'BLOCKQUOTE') {
        return 'HTMLQuoteElement';
      }

      /* ! Spec Conformance
       * (https://html.spec.whatwg.org/#htmltabledatacellelement)
       * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableDataCellElement`
       * Note: Most browsers currently adher to the W3C DOM Level 2 spec
       *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
       *       which suggests that browsers should use HTMLTableCellElement for
       *       both TD and TH elements. WhatWG separates these.
       * Test: Object.prototype.toString.call(document.createElement('td'))
       *  - Chrome === "[object HTMLTableCellElement]"
       *  - Firefox === "[object HTMLTableCellElement]"
       *  - Safari === "[object HTMLTableCellElement]"
       */
      if (obj.tagName === 'TD') {
        return 'HTMLTableDataCellElement';
      }

      /* ! Spec Conformance
       * (https://html.spec.whatwg.org/#htmltableheadercellelement)
       * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableHeaderCellElement`
       * Note: Most browsers currently adher to the W3C DOM Level 2 spec
       *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
       *       which suggests that browsers should use HTMLTableCellElement for
       *       both TD and TH elements. WhatWG separates these.
       * Test: Object.prototype.toString.call(document.createElement('th'))
       *  - Chrome === "[object HTMLTableCellElement]"
       *  - Firefox === "[object HTMLTableCellElement]"
       *  - Safari === "[object HTMLTableCellElement]"
       */
      if (obj.tagName === 'TH') {
        return 'HTMLTableHeaderCellElement';
      }
    }
  }

  /* ! Speed optimisation
  * Pre:
  *   Float64Array       x 625,644 ops/sec ±1.58% (80 runs sampled)
  *   Float32Array       x 1,279,852 ops/sec ±2.91% (77 runs sampled)
  *   Uint32Array        x 1,178,185 ops/sec ±1.95% (83 runs sampled)
  *   Uint16Array        x 1,008,380 ops/sec ±2.25% (80 runs sampled)
  *   Uint8Array         x 1,128,040 ops/sec ±2.11% (81 runs sampled)
  *   Int32Array         x 1,170,119 ops/sec ±2.88% (80 runs sampled)
  *   Int16Array         x 1,176,348 ops/sec ±5.79% (86 runs sampled)
  *   Int8Array          x 1,058,707 ops/sec ±4.94% (77 runs sampled)
  *   Uint8ClampedArray  x 1,110,633 ops/sec ±4.20% (80 runs sampled)
  * Post:
  *   Float64Array       x 7,105,671 ops/sec ±13.47% (64 runs sampled)
  *   Float32Array       x 5,887,912 ops/sec ±1.46% (82 runs sampled)
  *   Uint32Array        x 6,491,661 ops/sec ±1.76% (79 runs sampled)
  *   Uint16Array        x 6,559,795 ops/sec ±1.67% (82 runs sampled)
  *   Uint8Array         x 6,463,966 ops/sec ±1.43% (85 runs sampled)
  *   Int32Array         x 5,641,841 ops/sec ±3.49% (81 runs sampled)
  *   Int16Array         x 6,583,511 ops/sec ±1.98% (80 runs sampled)
  *   Int8Array          x 6,606,078 ops/sec ±1.74% (81 runs sampled)
  *   Uint8ClampedArray  x 6,602,224 ops/sec ±1.77% (83 runs sampled)
  */
  var stringTag = (symbolToStringTagExists && obj[Symbol.toStringTag]);
  if (typeof stringTag === 'string') {
    return stringTag;
  }

  var objPrototype = Object.getPrototypeOf(obj);
  /* ! Speed optimisation
  * Pre:
  *   regex literal      x 1,772,385 ops/sec ±1.85% (77 runs sampled)
  *   regex constructor  x 2,143,634 ops/sec ±2.46% (78 runs sampled)
  * Post:
  *   regex literal      x 3,928,009 ops/sec ±0.65% (78 runs sampled)
  *   regex constructor  x 3,931,108 ops/sec ±0.58% (84 runs sampled)
  */
  if (objPrototype === RegExp.prototype) {
    return 'RegExp';
  }

  /* ! Speed optimisation
  * Pre:
  *   date               x 2,130,074 ops/sec ±4.42% (68 runs sampled)
  * Post:
  *   date               x 3,953,779 ops/sec ±1.35% (77 runs sampled)
  */
  if (objPrototype === Date.prototype) {
    return 'Date';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-promise.prototype-@@tostringtag)
   * ES6$25.4.5.4 - Promise.prototype[@@toStringTag] should be "Promise":
   * Test: `Object.prototype.toString.call(Promise.resolve())``
   *  - Chrome <=47 === "[object Object]"
   *  - Edge <=20 === "[object Object]"
   *  - Firefox 29-Latest === "[object Promise]"
   *  - Safari 7.1-Latest === "[object Promise]"
   */
  if (promiseExists && objPrototype === Promise.prototype) {
    return 'Promise';
  }

  /* ! Speed optimisation
  * Pre:
  *   set                x 2,222,186 ops/sec ±1.31% (82 runs sampled)
  * Post:
  *   set                x 4,545,879 ops/sec ±1.13% (83 runs sampled)
  */
  if (setExists && objPrototype === Set.prototype) {
    return 'Set';
  }

  /* ! Speed optimisation
  * Pre:
  *   map                x 2,396,842 ops/sec ±1.59% (81 runs sampled)
  * Post:
  *   map                x 4,183,945 ops/sec ±6.59% (82 runs sampled)
  */
  if (mapExists && objPrototype === Map.prototype) {
    return 'Map';
  }

  /* ! Speed optimisation
  * Pre:
  *   weakset            x 1,323,220 ops/sec ±2.17% (76 runs sampled)
  * Post:
  *   weakset            x 4,237,510 ops/sec ±2.01% (77 runs sampled)
  */
  if (weakSetExists && objPrototype === WeakSet.prototype) {
    return 'WeakSet';
  }

  /* ! Speed optimisation
  * Pre:
  *   weakmap            x 1,500,260 ops/sec ±2.02% (78 runs sampled)
  * Post:
  *   weakmap            x 3,881,384 ops/sec ±1.45% (82 runs sampled)
  */
  if (weakMapExists && objPrototype === WeakMap.prototype) {
    return 'WeakMap';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-dataview.prototype-@@tostringtag)
   * ES6$24.2.4.21 - DataView.prototype[@@toStringTag] should be "DataView":
   * Test: `Object.prototype.toString.call(new DataView(new ArrayBuffer(1)))``
   *  - Edge <=13 === "[object Object]"
   */
  if (dataViewExists && objPrototype === DataView.prototype) {
    return 'DataView';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%mapiteratorprototype%-@@tostringtag)
   * ES6$23.1.5.2.2 - %MapIteratorPrototype%[@@toStringTag] should be "Map Iterator":
   * Test: `Object.prototype.toString.call(new Map().entries())``
   *  - Edge <=13 === "[object Object]"
   */
  if (mapExists && objPrototype === mapIteratorPrototype) {
    return 'Map Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%setiteratorprototype%-@@tostringtag)
   * ES6$23.2.5.2.2 - %SetIteratorPrototype%[@@toStringTag] should be "Set Iterator":
   * Test: `Object.prototype.toString.call(new Set().entries())``
   *  - Edge <=13 === "[object Object]"
   */
  if (setExists && objPrototype === setIteratorPrototype) {
    return 'Set Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%arrayiteratorprototype%-@@tostringtag)
   * ES6$22.1.5.2.2 - %ArrayIteratorPrototype%[@@toStringTag] should be "Array Iterator":
   * Test: `Object.prototype.toString.call([][Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
  if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
    return 'Array Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%stringiteratorprototype%-@@tostringtag)
   * ES6$21.1.5.2.2 - %StringIteratorPrototype%[@@toStringTag] should be "String Iterator":
   * Test: `Object.prototype.toString.call(''[Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
  if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
    return 'String Iterator';
  }

  /* ! Speed optimisation
  * Pre:
  *   object from null   x 2,424,320 ops/sec ±1.67% (76 runs sampled)
  * Post:
  *   object from null   x 5,838,000 ops/sec ±0.99% (84 runs sampled)
  */
  if (objPrototype === null) {
    return 'Object';
  }

  return Object
    .prototype
    .toString
    .call(obj)
    .slice(toStringLeftSliceLength, toStringRightSliceLength);
}

return typeDetect;

})));


/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 673:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeArgs = exports.normalizeOptions = void 0;
const isomorphic_node_1 = __webpack_require__(757);
/**
 * Normalizes Ono options, accounting for defaults and optional options.
 */
function normalizeOptions(options) {
    options = options || {};
    return {
        concatMessages: options.concatMessages === undefined ? true : Boolean(options.concatMessages),
        format: options.format === undefined ? isomorphic_node_1.format
            : (typeof options.format === "function" ? options.format : false),
    };
}
exports.normalizeOptions = normalizeOptions;
/**
 * Normalizes the Ono arguments, accounting for defaults, options, and optional arguments.
 */
function normalizeArgs(args, options) {
    let originalError;
    let props;
    let formatArgs;
    let message = "";
    // Determine which arguments were actually specified
    if (typeof args[0] === "string") {
        formatArgs = args;
    }
    else if (typeof args[1] === "string") {
        if (args[0] instanceof Error) {
            originalError = args[0];
        }
        else {
            props = args[0];
        }
        formatArgs = args.slice(1);
    }
    else {
        originalError = args[0];
        props = args[1];
        formatArgs = args.slice(2);
    }
    // If there are any format arguments, then format the error message
    if (formatArgs.length > 0) {
        if (options.format) {
            message = options.format.apply(undefined, formatArgs);
        }
        else {
            message = formatArgs.join(" ");
        }
    }
    if (options.concatMessages && originalError && originalError.message) {
        // The inner-error's message will be added to the new message
        message += (message ? " \n" : "") + originalError.message;
    }
    return { originalError, props, message };
}
exports.normalizeArgs = normalizeArgs;
//# sourceMappingURL=normalize.js.map

/***/ }),

/***/ 700:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const Process = __webpack_require__(920);
const ProcessError = __webpack_require__(152);

module.exports = normalizeResult;

/**
 * @param {string} [command] - The command used to run the process
 * @param {string[]} [args] - The command-line arguments that were passed to the process
 * @param {number} [pid] - The process ID
 * @param {string|Buffer} [stdout] - The process's stdout
 * @param {string|Buffer} [stderr] - The process's stderr
 * @param {string[]|Buffer[]} [output] - The process's stdio
 * @param {number} [status] - The process's status code
 * @param {string} [signal] - The signal that was used to kill the process, if any
 * @param {object} [options] - The options used to run the process
 * @param {Error} [error] - An error, if one occurred
 * @returns {Process}
 */
function normalizeResult ({ command, args, pid, stdout, stderr, output, status, signal, options, error }) {
  let process = new Process({ command, args, pid, stdout, stderr, output, status, signal, options });

  if (error) {
    if (process.status === undefined) {
      process.status = null;
    }
    throw Object.assign(error, process);
  }
  else if (process.status) {
    throw new ProcessError(process);
  }
  else {
    return process;
  }
}


/***/ }),

/***/ 733:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


module.exports.sync = __webpack_require__(328);
module.exports.async = __webpack_require__(983);


/***/ }),

/***/ 742:
/***/ (function(module, __unusedexports, __webpack_require__) {

var fs = __webpack_require__(747)
var core
if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  core = __webpack_require__(818)
} else {
  core = __webpack_require__(197)
}

module.exports = isexe
isexe.sync = sync

function isexe (path, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe(path, options || {}, function (er, is) {
        if (er) {
          reject(er)
        } else {
          resolve(is)
        }
      })
    })
  }

  core(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null
        is = false
      }
    }
    cb(er, is)
  })
}

function sync (path, options) {
  // my kingdom for a filtered catch
  try {
    return core.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 751:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = void 0;
const url_1 = __webpack_require__(835);
/**
 * Normalizes and sanitizes options, and fills-in any default values.
 * @internal
 */
function normalizeOptions(options) {
    let registryURL = typeof options.registry === "string" ? new url_1.URL(options.registry) : options.registry;
    return {
        token: options.token || "",
        registry: registryURL || new url_1.URL("https://registry.npmjs.org/"),
        package: options.package || "package.json",
        tag: options.tag || "latest",
        access: options.access,
        dryRun: options.dryRun || false,
        checkVersion: options.checkVersion === undefined ? true : Boolean(options.checkVersion),
        quiet: options.quiet || false,
        debug: options.debug || (() => undefined),
    };
}
exports.normalizeOptions = normalizeOptions;


/***/ }),

/***/ 755:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ono = void 0;
const constructor_1 = __webpack_require__(507);
const singleton = ono;
exports.ono = singleton;
ono.error = new constructor_1.Ono(Error);
ono.eval = new constructor_1.Ono(EvalError);
ono.range = new constructor_1.Ono(RangeError);
ono.reference = new constructor_1.Ono(ReferenceError);
ono.syntax = new constructor_1.Ono(SyntaxError);
ono.type = new constructor_1.Ono(TypeError);
ono.uri = new constructor_1.Ono(URIError);
const onoMap = ono;
/**
 * Creates a new error with the specified message, properties, and/or inner error.
 * If an inner error is provided, then the new error will match its type, if possible.
 */
function ono(...args) {
    let originalError = args[0];
    // Is the first argument an Error-like object?
    if (typeof originalError === "object" && typeof originalError.name === "string") {
        // Try to find an Ono singleton method that matches this error type
        for (let typedOno of Object.values(onoMap)) {
            if (typeof typedOno === "function" && typedOno.name === "ono") {
                let species = typedOno[Symbol.species];
                if (species && species !== Error && (originalError instanceof species || originalError.name === species.name)) {
                    // Create an error of the same type
                    return typedOno.apply(undefined, args);
                }
            }
        }
    }
    // By default, create a base Error object
    return ono.error.apply(undefined, args);
}
//# sourceMappingURL=singleton.js.map

/***/ }),

/***/ 757:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.addInspectMethod = exports.format = void 0;
const util = __webpack_require__(669);
const to_json_1 = __webpack_require__(483);
// The `inspect()` method is actually a Symbol, not a string key.
// https://nodejs.org/api/util.html#util_util_inspect_custom
const inspectMethod = util.inspect.custom || Symbol.for("nodejs.util.inspect.custom");
/**
 * Ono supports Node's `util.format()` formatting for error messages.
 *
 * @see https://nodejs.org/api/util.html#util_util_format_format_args
 */
exports.format = util.format;
/**
 * Adds an `inspect()` method to support Node's `util.inspect()` function.
 *
 * @see https://nodejs.org/api/util.html#util_util_inspect_custom
 */
function addInspectMethod(newError) {
    // @ts-expect-error - TypeScript doesn't support symbol indexers
    newError[inspectMethod] = inspect;
}
exports.addInspectMethod = addInspectMethod;
/**
 * Returns a representation of the error for Node's `util.inspect()` method.
 *
 * @see https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
 */
function inspect() {
    // HACK: We have to cast the objects to `any` so we can use symbol indexers.
    // see https://github.com/Microsoft/TypeScript/issues/1863
    let pojo = {};
    let error = this;
    for (let key of to_json_1.getDeepKeys(error)) {
        let value = error[key];
        pojo[key] = value;
    }
    // Don't include the `inspect()` method on the output object,
    // otherwise it will cause `util.inspect()` to go into an infinite loop
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pojo[inspectMethod];
    return pojo;
}
//# sourceMappingURL=isomorphic.node.js.map

/***/ }),

/***/ 775:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.npmPublish = void 0;
const semver = __webpack_require__(513);
const normalize_options_1 = __webpack_require__(751);
const npm_1 = __webpack_require__(62);
const read_manifest_1 = __webpack_require__(292);
/**
 * Publishes a package to NPM, if its version has changed
 */
async function npmPublish(opts = {}) {
    let options = normalize_options_1.normalizeOptions(opts);
    // Get the old and new version numbers
    let manifest = await read_manifest_1.readManifest(options.package, options.debug);
    let publishedVersion = await npm_1.npm.getLatestVersion(manifest.name, options);
    // Determine if/how the version has changed
    let diff = semver.diff(manifest.version, publishedVersion);
    if (diff || !options.checkVersion) {
        // Publish the new version to NPM
        await npm_1.npm.publish(manifest, options);
    }
    let results = {
        package: manifest.name,
        type: diff || "none",
        version: manifest.version.raw,
        oldVersion: publishedVersion.raw,
        tag: options.tag,
        access: options.access || (manifest.name.startsWith("@") ? "restricted" : "public"),
        dryRun: options.dryRun
    };
    options.debug("OUTPUT:", results);
    return results;
}
exports.npmPublish = npmPublish;


/***/ }),

/***/ 791:
/***/ (function(module) {

"use strict";


var next = (global.process && process.nextTick) || global.setImmediate || function (f) {
  setTimeout(f, 0)
}

module.exports = function maybe (cb, promise) {
  if (cb) {
    promise
      .then(function (result) {
        next(function () { cb(null, result) })
      }, function (err) {
        next(function () { cb(err) })
      })
    return undefined
  }
  else {
    return promise
  }
}


/***/ }),

/***/ 814:
/***/ (function(module, __unusedexports, __webpack_require__) {

const isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys'

const path = __webpack_require__(622)
const COLON = isWindows ? ';' : ':'
const isexe = __webpack_require__(742)

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' })

const getPathInfo = (cmd, opt) => {
  const colon = opt.colon || COLON

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? ['']
    : (
      [
        // windows always checks the cwd first
        ...(isWindows ? [process.cwd()] : []),
        ...(opt.path || process.env.PATH ||
          /* istanbul ignore next: very unusual */ '').split(colon),
      ]
    )
  const pathExtExe = isWindows
    ? opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM'
    : ''
  const pathExt = isWindows ? pathExtExe.split(colon) : ['']

  if (isWindows) {
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('')
  }

  return {
    pathEnv,
    pathExt,
    pathExtExe,
  }
}

const which = (cmd, opt, cb) => {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }
  if (!opt)
    opt = {}

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
  const found = []

  const step = i => new Promise((resolve, reject) => {
    if (i === pathEnv.length)
      return opt.all && found.length ? resolve(found)
        : reject(getNotFoundError(cmd))

    const ppRaw = pathEnv[i]
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw

    const pCmd = path.join(pathPart, cmd)
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd

    resolve(subStep(p, i, 0))
  })

  const subStep = (p, i, ii) => new Promise((resolve, reject) => {
    if (ii === pathExt.length)
      return resolve(step(i + 1))
    const ext = pathExt[ii]
    isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
      if (!er && is) {
        if (opt.all)
          found.push(p + ext)
        else
          return resolve(p + ext)
      }
      return resolve(subStep(p, i, ii + 1))
    })
  })

  return cb ? step(0).then(res => cb(null, res), cb) : step(0)
}

const whichSync = (cmd, opt) => {
  opt = opt || {}

  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
  const found = []

  for (let i = 0; i < pathEnv.length; i ++) {
    const ppRaw = pathEnv[i]
    const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw

    const pCmd = path.join(pathPart, cmd)
    const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd
      : pCmd

    for (let j = 0; j < pathExt.length; j ++) {
      const cur = p + pathExt[j]
      try {
        const is = isexe.sync(cur, { pathExt: pathExtExe })
        if (is) {
          if (opt.all)
            found.push(cur)
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
}

module.exports = which
which.sync = whichSync


/***/ }),

/***/ 816:
/***/ (function(module) {

"use strict";

module.exports = /^#!(.*)/;


/***/ }),

/***/ 818:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = isexe
isexe.sync = sync

var fs = __webpack_require__(747)

function checkPathExt (path, options) {
  var pathext = options.pathExt !== undefined ?
    options.pathExt : process.env.PATHEXT

  if (!pathext) {
    return true
  }

  pathext = pathext.split(';')
  if (pathext.indexOf('') !== -1) {
    return true
  }
  for (var i = 0; i < pathext.length; i++) {
    var p = pathext[i].toLowerCase()
    if (p && path.substr(-p.length).toLowerCase() === p) {
      return true
    }
  }
  return false
}

function checkStat (stat, path, options) {
  if (!stat.isSymbolicLink() && !stat.isFile()) {
    return false
  }
  return checkPathExt(path, options)
}

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, path, options))
  })
}

function sync (path, options) {
  return checkStat(fs.statSync(path), path, options)
}


/***/ }),

/***/ 835:
/***/ (function(module) {

module.exports = require("url");

/***/ }),

/***/ 850:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmEnvironment = void 0;
/**
 * Returns the environment variables that should be passed to NPM, based on the given options.
 */
function getNpmEnvironment(options) {
    /* eslint-disable @typescript-eslint/naming-convention */
    let env = {
        // Copy all the host's environment variables
        ...process.env,
        // Don't pass Node.js runtime variables to NPM
        NODE_ENV: "",
        NODE_OPTIONS: "",
    };
    // Determine if we need to set the NPM token
    let needsToken = Boolean(options.token && process.env.INPUT_TOKEN !== options.token);
    if (needsToken) {
        env.INPUT_TOKEN = options.token;
    }
    return env;
}
exports.getNpmEnvironment = getNpmEnvironment;


/***/ }),

/***/ 866:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const shebangRegex = __webpack_require__(816);

module.exports = (string = '') => {
	const match = string.match(shebangRegex);

	if (!match) {
		return null;
	}

	const [path, argument] = match[0].replace(/#! ?/, '').split(' ');
	const binary = path.split('/').pop();

	if (binary === 'env') {
		return argument;
	}

	return argument ? `${binary} ${argument}` : binary;
};


/***/ }),

/***/ 874:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const { parseArgsStringToArgv } = __webpack_require__(982);  // possible alternative: parse-spawn-args
const detectType = __webpack_require__(657);

module.exports = normalizeArgs;

/**
 * This function normalizes the arguments of the {@link sync} and {@link async}
 * so they can be passed to Node's {@link child_process.spawn} or
 * {@link child_process.spawn} functions.
 *
 * @param {string|string[]} command
 * The command to run (e.g. "git"), or the command and its arguments as a string
 * (e.g. "git commit -a -m fixed_stuff"), or the command and its arguments as an
 * array (e.g. ["git", "commit", "-a", "-m", "fixed stuff"]).
 *
 * @param {string|string[]} [args]
 * The command arguments as a string (e.g. "git commit -a -m fixed_stuff") or as an array
 * (e.g. ["git", "commit", "-a", "-m", "fixed stuff"]).
 *
 * @param {object} [options]
 * The same options as {@link child_process.spawn} or {@link child_process.spawnSync}.
 *
 * @param {function} [callback]
 * The callback that will receive the results, if applicable.
 *
 * @returns {object}
 */
function normalizeArgs (params) {
  let command, args, options, callback, error;

  try {
    // Shift the arguments, if necessary
    ({ command, args, options, callback } = shiftArgs(params));

    let commandArgs = [];

    if (typeof command === "string" && args === undefined) {
      // The command parameter is actually the command AND arguments,
      // so split the string into an array
      command = splitArgString(command);
    }

    if (Array.isArray(command)) {
      // Split the command from the arguments
      commandArgs = command.slice(1);
      command = command[0];
    }

    if (typeof args === "string") {
      // Convert the `args` argument from a string an array
      args = splitArgString(args);
    }

    if (Array.isArray(args)) {
      // Add these arguments to any arguments from above
      args = commandArgs.concat(args);
    }

    if (args === undefined || args === null) {
      args = commandArgs;
    }

    if (options === undefined || options === null) {
      options = {};
    }

    // Set default options
    options.encoding = options.encoding || "utf8";

    // Validate all arguments
    validateArgs(command, args, options, callback);
  }
  catch (err) {
    error = err;

    // Sanitize args that are used as output
    command = String(command || "");
    args = (Array.isArray(args) ? args : []).map((arg) => String(arg || ""));
  }

  return { command, args, options, callback, error };
}

/**
 * Detects whether any optional arguments have been omitted,
 * and shifts the other arguments as needed.
 *
 * @param {string|string[]} command
 * @param {string|string[]} [args]
 * @param {object} [options]
 * @param {function} [callback]
 * @returns {object}
 */
function shiftArgs (params) {
  params = Array.prototype.slice.call(params);
  let command, args, options, callback;

  // Check for a callback as the final parameter
  let lastParam = params[params.length - 1];
  if (typeof lastParam === "function") {
    callback = lastParam;
    params.pop();
  }

  // Check for an options object as the second-to-last parameter
  lastParam = params[params.length - 1];
  if (lastParam === null || lastParam === undefined ||
  (typeof lastParam === "object" && !Array.isArray(lastParam))) {
    options = lastParam;
    params.pop();
  }

  // The first parameter is the command
  command = params.shift();

  // All remaining parameters are the args
  if (params.length === 0) {
    args = undefined;
  }
  else if (params.length === 1 && Array.isArray(params[0])) {
    args = params[0];
  }
  else if (params.length === 1 && params[0] === "") {
    args = [];
  }
  else {
    args = params;
  }

  return { command, args, options, callback };
}

/**
 * Validates all arguments, and throws an error if any are invalid.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {object} options
 * @param {function} [callback]
 */
function validateArgs (command, args, options, callback) {
  if (command === undefined || command === null) {
    throw new Error("The command to execute is missing.");
  }

  if (typeof command !== "string") {
    throw new Error("The command to execute should be a string, not " + friendlyType(command));
  }

  if (!Array.isArray(args)) {
    throw new Error(
      "The command arguments should be a string or an array, not " +
      friendlyType(args)
    );
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];

    if (typeof arg !== "string") {
      throw new Error(
        `The command arguments should be strings, but argument #${i + 1} is ` +
        friendlyType(arg)
      );
    }
  }

  if (typeof options !== "object") {
    throw new Error(
      "The options should be an object, not " +
      friendlyType(options)
    );
  }

  if (callback !== undefined && callback !== null) {
    if (typeof callback !== "function") {
      throw new Error("The callback should be a function, not " + friendlyType(callback));
    }
  }
}

/**
 * Splits an argument string (e.g. git commit -a -m "fixed stuff")
 * into an array (e.g. ["git", "commit", "-a", "-m", "fixed stuff"]).
 *
 * @param {string} argString
 * @returns {string[]}
 */
function splitArgString (argString) {
  try {
    return parseArgsStringToArgv(argString);
  }
  catch (error) {
    throw new Error(`Could not parse the string: ${argString}\n${error.message}`);
  }
}

/**
 * Returns the friendly type name of the given value, for use in error messages.
 *
 * @param {*} val
 * @returns {string}
 */
function friendlyType (val) {
  let type = detectType(val);
  let firstChar = String(type)[0].toLowerCase();

  if (["a", "e", "i", "o", "u"].indexOf(firstChar) === -1) {
    return `a ${type}.`;
  }
  else {
    return `an ${type}.`;
  }
}


/***/ }),

/***/ 881:
/***/ (function(module) {

"use strict";


const isWin = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args,
    });
}

function hookChildProcess(cp, parsed) {
    if (!isWin) {
        return;
    }

    const originalEmit = cp.emit;

    cp.emit = function (name, arg1) {
        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            const err = verifyENOENT(arg1, parsed, 'spawn');

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
    };
}

function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    return null;
}

module.exports = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError,
};


/***/ }),

/***/ 920:
/***/ (function(module) {

"use strict";


/**
 * An instance of this class is returned by {@link sync} and {@link async}.
 * It contains information about how the process was spawned, how it exited, and its output.
 */
module.exports = class Process {
  /**
   * @param {object} props - Initial property values
   */
  constructor ({ command, args, pid, stdout, stderr, output, status, signal, options }) {
    options = options || {};
    stdout = stdout || (options.encoding === "buffer" ? Buffer.from([]) : "");
    stderr = stderr || (options.encoding === "buffer" ? Buffer.from([]) : "");
    output = output || [options.input || null, stdout, stderr];

    /**
     * The command that was used to spawn the process
     *
     * @type {string}
     */
    this.command = command || "";

    /**
     * The command-line arguments that were passed to the process.
     *
     * @type {string[]}
     */
    this.args = args || [];

    /**
     * The numeric process ID assigned by the operating system
     *
     * @type {number}
     */
    this.pid = pid || 0;

    /**
     * The process's standard output
     *
     * @type {Buffer|string}
     */

    this.stdout = output[1];

    /**
     * The process's error output
     *
     * @type {Buffer|string}
     */
    this.stderr = output[2];

    /**
     * The process's stdio [stdin, stdout, stderr]
     *
     * @type {Buffer[]|string[]}
     */
    this.output = output;

    /**
     * The process's status code
     *
     * @type {number}
     */
    this.status = status;

    /**
     * The signal used to kill the process, if applicable
     *
     * @type {string}
     */
    this.signal = signal || null;
  }

  /**
   * Returns the full command and arguments used to spawn the process
   *
   * @type {string}
   */
  toString () {
    let string = this.command;

    for (let arg of this.args) {
      // Escape quotes
      arg = arg.replace(/"/g, '\\"');

      if (arg.indexOf(" ") >= 0) {
        // Add quotes if the arg contains whitespace
        string += ` "${arg}"`;
      }
      else {
        string += ` ${arg}`;
      }
    }

    return string;
  }
};


/***/ }),

/***/ 982:
/***/ (function(__unusedmodule, exports) {

"use strict";

exports.__esModule = true;
function parseArgsStringToArgv(value, env, file) {
    // ([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*) Matches nested quotes until the first space outside of quotes
    // [^\s'"]+ or Match if not a space ' or "
    // (['"])([^\5]*?)\5 or Match "quoted text" without quotes
    // `\3` and `\5` are a backreference to the quote style (' or ") captured
    var myRegexp = /([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])([^\5]*?)\5/gi;
    var myString = value;
    var myArray = [];
    if (env) {
        myArray.push(env);
    }
    if (file) {
        myArray.push(file);
    }
    var match;
    do {
        // Each call to exec returns the next regex match as an array
        match = myRegexp.exec(myString);
        if (match !== null) {
            // Index 1 in the array is the captured group if it exists
            // Index 0 is the matched text, which we use if no captured group exists
            myArray.push(firstString(match[1], match[6], match[0]));
        }
    } while (match !== null);
    return myArray;
}
exports["default"] = parseArgsStringToArgv;
exports.parseArgsStringToArgv = parseArgsStringToArgv;
// Accepts any number of arguments, and returns the first one that is a string
// (even an empty string)
function firstString() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg === "string") {
            return arg;
        }
    }
}


/***/ }),

/***/ 983:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const normalizeArgs = __webpack_require__(874);
const normalizeResult = __webpack_require__(700);
const maybe = __webpack_require__(791);
const spawn = __webpack_require__(20);

module.exports = async;

/**
 * Executes the given command asynchronously, and returns the buffered
 * results via a callback or Promise.
 *
 * @param {string|string[]} command - The command to run
 * @param {string|string[]} [args] - The command arguments
 * @param {object} [options] - options
 * @param {function} [callback] - callback that will receive the results
 *
 * @returns {Promise<Process>|undefined}
 * Returns a Promise if no callback is given. The promise resolves with
 * a {@link Process} object.
 *
 * @see {@link normalizeArgs} for argument details
 */
function async () {
  // Normalize the function arguments
  let { command, args, options, callback, error } = normalizeArgs(arguments);

  return maybe(callback, new Promise((resolve, reject) => {
    if (error) {
      // Invalid arguments
      normalizeResult({ command, args, options, error });
    }
    else {
      let spawnedProcess;

      try {
        // Spawn the program
        spawnedProcess = spawn(command, args, options);
      }
      catch (error) {
        // An error occurred while spawning the process
        normalizeResult({ error, command, args, options });
      }

      let pid = spawnedProcess.pid;
      let stdout = options.encoding === "buffer" ? Buffer.from([]) : "";
      let stderr = options.encoding === "buffer" ? Buffer.from([]) : "";

      spawnedProcess.stdout && spawnedProcess.stdout.on("data", (data) => {
        if (typeof stdout === "string") {
          stdout += data.toString();
        }
        else {
          stdout = Buffer.concat([stdout, data]);
        }
      });

      spawnedProcess.stderr && spawnedProcess.stderr.on("data", (data) => {
        if (typeof stderr === "string") {
          stderr += data.toString();
        }
        else {
          stderr = Buffer.concat([stderr, data]);
        }
      });

      spawnedProcess.on("error", (error) => {
        try {
          normalizeResult({ error, command, args, options, pid, stdout, stderr });
        }
        catch (error) {
          reject(error);
        }
      });

      spawnedProcess.on("exit", (status, signal) => {
        try {
          resolve(normalizeResult({ command, args, options, pid, stdout, stderr, status, signal }));
        }
        catch (error) {
          reject(error);
        }
      });
    }
  }));
}


/***/ })

/******/ });
//# sourceMappingURL=index.js.map