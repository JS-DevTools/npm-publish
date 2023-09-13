"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module2) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module2) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module2.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
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
    createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
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
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module2) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof _SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
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
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module2) {
    var SemVer = require_semver();
    var parse2 = (version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse2;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module2) {
    var parse2 = require_parse();
    var valid = (version2, options) => {
      const v = parse2(version2, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module2) {
    var parse2 = require_parse();
    var clean = (version2, options) => {
      const s = parse2(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module2) {
    var SemVer = require_semver();
    var inc = (version2, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module2) {
    var parse2 = require_parse();
    var diff = (version1, version2) => {
      const v12 = parse2(version1, null, true);
      const v2 = parse2(version2, null, true);
      const comparison = v12.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v12 : v2;
      const lowVersion = v1Higher ? v2 : v12;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v12.major !== v2.major) {
        return prefix + "major";
      }
      if (v12.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v12.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module2) {
    var parse2 = require_parse();
    var prerelease = (version2, options) => {
      const parsed = parse2(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module2) {
    var SemVer = require_semver();
    var parse2 = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(re[t.COERCE]);
      } else {
        let next;
        while ((next = re[t.COERCERTL].exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
        }
        re[t.COERCERTL].lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      return parse2(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
    };
    module2.exports = coerce;
  }
});

// node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  "node_modules/yallist/iterator.js"(exports, module2) {
    "use strict";
    module2.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "node_modules/yallist/yallist.js"(exports, module2) {
    "use strict";
    module2.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self = this;
      if (!(self instanceof Yallist)) {
        self = new Yallist();
      }
      self.tail = null;
      self.head = null;
      self.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self.push(arguments[i]);
        }
      }
      return self;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
      return next;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }
      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function insert(self, node, value) {
      var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
      if (inserted.next === null) {
        self.tail = inserted;
      }
      if (inserted.prev === null) {
        self.head = inserted;
      }
      self.length++;
      return inserted;
    }
    function push(self, item) {
      self.tail = new Node(item, self.tail, null, self);
      if (!self.head) {
        self.head = self.tail;
      }
      self.length++;
    }
    function unshift(self, item) {
      self.head = new Node(item, null, self.head, self);
      if (!self.tail) {
        self.tail = self.head;
      }
      self.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator()(Yallist);
    } catch (er) {
    }
  }
});

// node_modules/semver/node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "node_modules/semver/node_modules/lru-cache/index.js"(exports, module2) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = Symbol("max");
    var LENGTH = Symbol("length");
    var LENGTH_CALCULATOR = Symbol("lengthCalculator");
    var ALLOW_STALE = Symbol("allowStale");
    var MAX_AGE = Symbol("maxAge");
    var DISPOSE = Symbol("dispose");
    var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
    var LRU_LIST = Symbol("lruList");
    var CACHE = Symbol("cache");
    var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = { max: options };
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      // resize the cache when the max changes.
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      // resize the cache when the lengthCalculator changes.
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = /* @__PURE__ */ new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key))
          return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self, key, doUse) => {
      const node = self[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self, hit) => {
      if (!hit || !hit.maxAge && !self[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
    };
    var trim = (self) => {
      if (self[LENGTH] > self[MAX]) {
        for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self, walker);
          walker = prev;
        }
      }
    };
    var del = (self, node) => {
      if (node) {
        const hit = node.value;
        if (self[DISPOSE])
          self[DISPOSE](hit.key, hit.value);
        self[LENGTH] -= hit.length;
        self[CACHE].delete(hit.key);
        self[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self, hit)) {
        del(self, node);
        if (!self[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self);
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module2) {
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.format();
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().split(/\s+/).join(" ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.format();
      }
      format() {
        this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lru_cache();
    var cache = new LRU({ max: 1e3 });
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version2, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module2) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module2) {
    var Range = require_range();
    var satisfies = (version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    };
    module2.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module2) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module2) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module2) {
    var outside = require_outside();
    var gtr = (version2, range, options) => outside(version2, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module2) {
    var outside = require_outside();
    var ltr = (version2, range, options) => outside(version2, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module2) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module2) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module2) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER:
        for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module2) {
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse2 = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse: parse2,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/tar/lib/high-level-opt.js
var require_high_level_opt = __commonJS({
  "node_modules/tar/lib/high-level-opt.js"(exports, module2) {
    "use strict";
    var argmap = /* @__PURE__ */ new Map([
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
      ["h", "follow"]
    ]);
    module2.exports = (opt) => opt ? Object.keys(opt).map((k) => [
      argmap.has(k) ? argmap.get(k) : k,
      opt[k]
    ]).reduce((set, kv) => (set[kv[0]] = kv[1], set), /* @__PURE__ */ Object.create(null)) : {};
  }
});

// node_modules/minipass/index.js
var require_minipass = __commonJS({
  "node_modules/minipass/index.js"(exports) {
    "use strict";
    var proc = typeof process === "object" && process ? process : {
      stdout: null,
      stderr: null
    };
    var EE = require("events");
    var Stream = require("stream");
    var stringdecoder = require("string_decoder");
    var SD = stringdecoder.StringDecoder;
    var EOF = Symbol("EOF");
    var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
    var EMITTED_END = Symbol("emittedEnd");
    var EMITTING_END = Symbol("emittingEnd");
    var EMITTED_ERROR = Symbol("emittedError");
    var CLOSED = Symbol("closed");
    var READ = Symbol("read");
    var FLUSH = Symbol("flush");
    var FLUSHCHUNK = Symbol("flushChunk");
    var ENCODING = Symbol("encoding");
    var DECODER = Symbol("decoder");
    var FLOWING = Symbol("flowing");
    var PAUSED = Symbol("paused");
    var RESUME = Symbol("resume");
    var BUFFER = Symbol("buffer");
    var PIPES = Symbol("pipes");
    var BUFFERLENGTH = Symbol("bufferLength");
    var BUFFERPUSH = Symbol("bufferPush");
    var BUFFERSHIFT = Symbol("bufferShift");
    var OBJECTMODE = Symbol("objectMode");
    var DESTROYED = Symbol("destroyed");
    var ERROR = Symbol("error");
    var EMITDATA = Symbol("emitData");
    var EMITEND = Symbol("emitEnd");
    var EMITEND2 = Symbol("emitEnd2");
    var ASYNC = Symbol("async");
    var ABORT = Symbol("abort");
    var ABORTED = Symbol("aborted");
    var SIGNAL = Symbol("signal");
    var defer = (fn) => Promise.resolve().then(fn);
    var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
    var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
    var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
    var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
    var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
    var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
    var Pipe = class {
      constructor(src, dest, opts) {
        this.src = src;
        this.dest = dest;
        this.opts = opts;
        this.ondrain = () => src[RESUME]();
        dest.on("drain", this.ondrain);
      }
      unpipe() {
        this.dest.removeListener("drain", this.ondrain);
      }
      // istanbul ignore next - only here for the prototype
      proxyErrors() {
      }
      end() {
        this.unpipe();
        if (this.opts.end)
          this.dest.end();
      }
    };
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
    var Minipass = class _Minipass extends Stream {
      constructor(options) {
        super();
        this[FLOWING] = false;
        this[PAUSED] = false;
        this[PIPES] = [];
        this[BUFFER] = [];
        this[OBJECTMODE] = options && options.objectMode || false;
        if (this[OBJECTMODE])
          this[ENCODING] = null;
        else
          this[ENCODING] = options && options.encoding || null;
        if (this[ENCODING] === "buffer")
          this[ENCODING] = null;
        this[ASYNC] = options && !!options.async || false;
        this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
        this[EOF] = false;
        this[EMITTED_END] = false;
        this[EMITTING_END] = false;
        this[CLOSED] = false;
        this[EMITTED_ERROR] = null;
        this.writable = true;
        this.readable = true;
        this[BUFFERLENGTH] = 0;
        this[DESTROYED] = false;
        if (options && options.debugExposeBuffer === true) {
          Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
        }
        if (options && options.debugExposePipes === true) {
          Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
        }
        this[SIGNAL] = options && options.signal;
        this[ABORTED] = false;
        if (this[SIGNAL]) {
          this[SIGNAL].addEventListener("abort", () => this[ABORT]());
          if (this[SIGNAL].aborted) {
            this[ABORT]();
          }
        }
      }
      get bufferLength() {
        return this[BUFFERLENGTH];
      }
      get encoding() {
        return this[ENCODING];
      }
      set encoding(enc) {
        if (this[OBJECTMODE])
          throw new Error("cannot set encoding in objectMode");
        if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
          throw new Error("cannot change encoding");
        if (this[ENCODING] !== enc) {
          this[DECODER] = enc ? new SD(enc) : null;
          if (this[BUFFER].length)
            this[BUFFER] = this[BUFFER].map((chunk) => this[DECODER].write(chunk));
        }
        this[ENCODING] = enc;
      }
      setEncoding(enc) {
        this.encoding = enc;
      }
      get objectMode() {
        return this[OBJECTMODE];
      }
      set objectMode(om) {
        this[OBJECTMODE] = this[OBJECTMODE] || !!om;
      }
      get ["async"]() {
        return this[ASYNC];
      }
      set ["async"](a) {
        this[ASYNC] = this[ASYNC] || !!a;
      }
      // drop everything and get out of the flow completely
      [ABORT]() {
        this[ABORTED] = true;
        this.emit("abort", this[SIGNAL].reason);
        this.destroy(this[SIGNAL].reason);
      }
      get aborted() {
        return this[ABORTED];
      }
      set aborted(_) {
      }
      write(chunk, encoding, cb) {
        if (this[ABORTED])
          return false;
        if (this[EOF])
          throw new Error("write after end");
        if (this[DESTROYED]) {
          this.emit(
            "error",
            Object.assign(
              new Error("Cannot call write after a stream was destroyed"),
              { code: "ERR_STREAM_DESTROYED" }
            )
          );
          return true;
        }
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (!encoding)
          encoding = "utf8";
        const fn = this[ASYNC] ? defer : (f) => f();
        if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
          if (isArrayBufferView(chunk))
            chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
          else if (isArrayBuffer(chunk))
            chunk = Buffer.from(chunk);
          else if (typeof chunk !== "string")
            this.objectMode = true;
        }
        if (this[OBJECTMODE]) {
          if (this.flowing && this[BUFFERLENGTH] !== 0)
            this[FLUSH](true);
          if (this.flowing)
            this.emit("data", chunk);
          else
            this[BUFFERPUSH](chunk);
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (!chunk.length) {
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (typeof chunk === "string" && // unless it is a string already ready for us to use
        !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
          chunk = Buffer.from(chunk, encoding);
        }
        if (Buffer.isBuffer(chunk) && this[ENCODING])
          chunk = this[DECODER].write(chunk);
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      read(n) {
        if (this[DESTROYED])
          return null;
        if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
          this[MAYBE_EMIT_END]();
          return null;
        }
        if (this[OBJECTMODE])
          n = null;
        if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
          if (this.encoding)
            this[BUFFER] = [this[BUFFER].join("")];
          else
            this[BUFFER] = [Buffer.concat(this[BUFFER], this[BUFFERLENGTH])];
        }
        const ret = this[READ](n || null, this[BUFFER][0]);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [READ](n, chunk) {
        if (n === chunk.length || n === null)
          this[BUFFERSHIFT]();
        else {
          this[BUFFER][0] = chunk.slice(n);
          chunk = chunk.slice(0, n);
          this[BUFFERLENGTH] -= n;
        }
        this.emit("data", chunk);
        if (!this[BUFFER].length && !this[EOF])
          this.emit("drain");
        return chunk;
      }
      end(chunk, encoding, cb) {
        if (typeof chunk === "function")
          cb = chunk, chunk = null;
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (chunk)
          this.write(chunk, encoding);
        if (cb)
          this.once("end", cb);
        this[EOF] = true;
        this.writable = false;
        if (this.flowing || !this[PAUSED])
          this[MAYBE_EMIT_END]();
        return this;
      }
      // don't let the internal resume be overwritten
      [RESUME]() {
        if (this[DESTROYED])
          return;
        this[PAUSED] = false;
        this[FLOWING] = true;
        this.emit("resume");
        if (this[BUFFER].length)
          this[FLUSH]();
        else if (this[EOF])
          this[MAYBE_EMIT_END]();
        else
          this.emit("drain");
      }
      resume() {
        return this[RESUME]();
      }
      pause() {
        this[FLOWING] = false;
        this[PAUSED] = true;
      }
      get destroyed() {
        return this[DESTROYED];
      }
      get flowing() {
        return this[FLOWING];
      }
      get paused() {
        return this[PAUSED];
      }
      [BUFFERPUSH](chunk) {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] += 1;
        else
          this[BUFFERLENGTH] += chunk.length;
        this[BUFFER].push(chunk);
      }
      [BUFFERSHIFT]() {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] -= 1;
        else
          this[BUFFERLENGTH] -= this[BUFFER][0].length;
        return this[BUFFER].shift();
      }
      [FLUSH](noDrain) {
        do {
        } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
        if (!noDrain && !this[BUFFER].length && !this[EOF])
          this.emit("drain");
      }
      [FLUSHCHUNK](chunk) {
        this.emit("data", chunk);
        return this.flowing;
      }
      pipe(dest, opts) {
        if (this[DESTROYED])
          return;
        const ended = this[EMITTED_END];
        opts = opts || {};
        if (dest === proc.stdout || dest === proc.stderr)
          opts.end = false;
        else
          opts.end = opts.end !== false;
        opts.proxyErrors = !!opts.proxyErrors;
        if (ended) {
          if (opts.end)
            dest.end();
        } else {
          this[PIPES].push(
            !opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts)
          );
          if (this[ASYNC])
            defer(() => this[RESUME]());
          else
            this[RESUME]();
        }
        return dest;
      }
      unpipe(dest) {
        const p = this[PIPES].find((p2) => p2.dest === dest);
        if (p) {
          this[PIPES].splice(this[PIPES].indexOf(p), 1);
          p.unpipe();
        }
      }
      addListener(ev, fn) {
        return this.on(ev, fn);
      }
      on(ev, fn) {
        const ret = super.on(ev, fn);
        if (ev === "data" && !this[PIPES].length && !this.flowing)
          this[RESUME]();
        else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
          super.emit("readable");
        else if (isEndish(ev) && this[EMITTED_END]) {
          super.emit(ev);
          this.removeAllListeners(ev);
        } else if (ev === "error" && this[EMITTED_ERROR]) {
          if (this[ASYNC])
            defer(() => fn.call(this, this[EMITTED_ERROR]));
          else
            fn.call(this, this[EMITTED_ERROR]);
        }
        return ret;
      }
      get emittedEnd() {
        return this[EMITTED_END];
      }
      [MAYBE_EMIT_END]() {
        if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
          this[EMITTING_END] = true;
          this.emit("end");
          this.emit("prefinish");
          this.emit("finish");
          if (this[CLOSED])
            this.emit("close");
          this[EMITTING_END] = false;
        }
      }
      emit(ev, data, ...extra) {
        if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
          return;
        else if (ev === "data") {
          return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
        } else if (ev === "end") {
          return this[EMITEND]();
        } else if (ev === "close") {
          this[CLOSED] = true;
          if (!this[EMITTED_END] && !this[DESTROYED])
            return;
          const ret2 = super.emit("close");
          this.removeAllListeners("close");
          return ret2;
        } else if (ev === "error") {
          this[EMITTED_ERROR] = data;
          super.emit(ERROR, data);
          const ret2 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "resume") {
          const ret2 = super.emit("resume");
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "finish" || ev === "prefinish") {
          const ret2 = super.emit(ev);
          this.removeAllListeners(ev);
          return ret2;
        }
        const ret = super.emit(ev, data, ...extra);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITDATA](data) {
        for (const p of this[PIPES]) {
          if (p.dest.write(data) === false)
            this.pause();
        }
        const ret = super.emit("data", data);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITEND]() {
        if (this[EMITTED_END])
          return;
        this[EMITTED_END] = true;
        this.readable = false;
        if (this[ASYNC])
          defer(() => this[EMITEND2]());
        else
          this[EMITEND2]();
      }
      [EMITEND2]() {
        if (this[DECODER]) {
          const data = this[DECODER].end();
          if (data) {
            for (const p of this[PIPES]) {
              p.dest.write(data);
            }
            super.emit("data", data);
          }
        }
        for (const p of this[PIPES]) {
          p.end();
        }
        const ret = super.emit("end");
        this.removeAllListeners("end");
        return ret;
      }
      // const all = await stream.collect()
      collect() {
        const buf = [];
        if (!this[OBJECTMODE])
          buf.dataLength = 0;
        const p = this.promise();
        this.on("data", (c) => {
          buf.push(c);
          if (!this[OBJECTMODE])
            buf.dataLength += c.length;
        });
        return p.then(() => buf);
      }
      // const data = await stream.concat()
      concat() {
        return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then(
          (buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength)
        );
      }
      // stream.promise().then(() => done, er => emitted error)
      promise() {
        return new Promise((resolve, reject) => {
          this.on(DESTROYED, () => reject(new Error("stream destroyed")));
          this.on("error", (er) => reject(er));
          this.on("end", () => resolve());
        });
      }
      // for await (let chunk of stream)
      [ASYNCITERATOR]() {
        let stopped = false;
        const stop = () => {
          this.pause();
          stopped = true;
          return Promise.resolve({ done: true });
        };
        const next = () => {
          if (stopped)
            return stop();
          const res = this.read();
          if (res !== null)
            return Promise.resolve({ done: false, value: res });
          if (this[EOF])
            return stop();
          let resolve = null;
          let reject = null;
          const onerr = (er) => {
            this.removeListener("data", ondata);
            this.removeListener("end", onend);
            this.removeListener(DESTROYED, ondestroy);
            stop();
            reject(er);
          };
          const ondata = (value) => {
            this.removeListener("error", onerr);
            this.removeListener("end", onend);
            this.removeListener(DESTROYED, ondestroy);
            this.pause();
            resolve({ value, done: !!this[EOF] });
          };
          const onend = () => {
            this.removeListener("error", onerr);
            this.removeListener("data", ondata);
            this.removeListener(DESTROYED, ondestroy);
            stop();
            resolve({ done: true });
          };
          const ondestroy = () => onerr(new Error("stream destroyed"));
          return new Promise((res2, rej) => {
            reject = rej;
            resolve = res2;
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
          [ASYNCITERATOR]() {
            return this;
          }
        };
      }
      // for (let chunk of stream)
      [ITERATOR]() {
        let stopped = false;
        const stop = () => {
          this.pause();
          this.removeListener(ERROR, stop);
          this.removeListener(DESTROYED, stop);
          this.removeListener("end", stop);
          stopped = true;
          return { done: true };
        };
        const next = () => {
          if (stopped)
            return stop();
          const value = this.read();
          return value === null ? stop() : { value };
        };
        this.once("end", stop);
        this.once(ERROR, stop);
        this.once(DESTROYED, stop);
        return {
          next,
          throw: stop,
          return: stop,
          [ITERATOR]() {
            return this;
          }
        };
      }
      destroy(er) {
        if (this[DESTROYED]) {
          if (er)
            this.emit("error", er);
          else
            this.emit(DESTROYED);
          return this;
        }
        this[DESTROYED] = true;
        this[BUFFER].length = 0;
        this[BUFFERLENGTH] = 0;
        if (typeof this.close === "function" && !this[CLOSED])
          this.close();
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      static isStream(s) {
        return !!s && (s instanceof _Minipass || s instanceof Stream || s instanceof EE && // readable
        (typeof s.pipe === "function" || // writable
        typeof s.write === "function" && typeof s.end === "function"));
      }
    };
    exports.Minipass = Minipass;
  }
});

// node_modules/minizlib/constants.js
var require_constants2 = __commonJS({
  "node_modules/minizlib/constants.js"(exports, module2) {
    var realZlibConstants = require("zlib").constants || /* istanbul ignore next */
    { ZLIB_VERNUM: 4736 };
    module2.exports = Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), {
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
  }
});

// node_modules/minizlib/node_modules/minipass/index.js
var require_minipass2 = __commonJS({
  "node_modules/minizlib/node_modules/minipass/index.js"(exports, module2) {
    "use strict";
    var proc = typeof process === "object" && process ? process : {
      stdout: null,
      stderr: null
    };
    var EE = require("events");
    var Stream = require("stream");
    var SD = require("string_decoder").StringDecoder;
    var EOF = Symbol("EOF");
    var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
    var EMITTED_END = Symbol("emittedEnd");
    var EMITTING_END = Symbol("emittingEnd");
    var EMITTED_ERROR = Symbol("emittedError");
    var CLOSED = Symbol("closed");
    var READ = Symbol("read");
    var FLUSH = Symbol("flush");
    var FLUSHCHUNK = Symbol("flushChunk");
    var ENCODING = Symbol("encoding");
    var DECODER = Symbol("decoder");
    var FLOWING = Symbol("flowing");
    var PAUSED = Symbol("paused");
    var RESUME = Symbol("resume");
    var BUFFERLENGTH = Symbol("bufferLength");
    var BUFFERPUSH = Symbol("bufferPush");
    var BUFFERSHIFT = Symbol("bufferShift");
    var OBJECTMODE = Symbol("objectMode");
    var DESTROYED = Symbol("destroyed");
    var EMITDATA = Symbol("emitData");
    var EMITEND = Symbol("emitEnd");
    var EMITEND2 = Symbol("emitEnd2");
    var ASYNC = Symbol("async");
    var defer = (fn) => Promise.resolve().then(fn);
    var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
    var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
    var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
    var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
    var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
    var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
    var Pipe = class {
      constructor(src, dest, opts) {
        this.src = src;
        this.dest = dest;
        this.opts = opts;
        this.ondrain = () => src[RESUME]();
        dest.on("drain", this.ondrain);
      }
      unpipe() {
        this.dest.removeListener("drain", this.ondrain);
      }
      // istanbul ignore next - only here for the prototype
      proxyErrors() {
      }
      end() {
        this.unpipe();
        if (this.opts.end)
          this.dest.end();
      }
    };
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
    module2.exports = class Minipass extends Stream {
      constructor(options) {
        super();
        this[FLOWING] = false;
        this[PAUSED] = false;
        this.pipes = [];
        this.buffer = [];
        this[OBJECTMODE] = options && options.objectMode || false;
        if (this[OBJECTMODE])
          this[ENCODING] = null;
        else
          this[ENCODING] = options && options.encoding || null;
        if (this[ENCODING] === "buffer")
          this[ENCODING] = null;
        this[ASYNC] = options && !!options.async || false;
        this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
        this[EOF] = false;
        this[EMITTED_END] = false;
        this[EMITTING_END] = false;
        this[CLOSED] = false;
        this[EMITTED_ERROR] = null;
        this.writable = true;
        this.readable = true;
        this[BUFFERLENGTH] = 0;
        this[DESTROYED] = false;
      }
      get bufferLength() {
        return this[BUFFERLENGTH];
      }
      get encoding() {
        return this[ENCODING];
      }
      set encoding(enc) {
        if (this[OBJECTMODE])
          throw new Error("cannot set encoding in objectMode");
        if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
          throw new Error("cannot change encoding");
        if (this[ENCODING] !== enc) {
          this[DECODER] = enc ? new SD(enc) : null;
          if (this.buffer.length)
            this.buffer = this.buffer.map((chunk) => this[DECODER].write(chunk));
        }
        this[ENCODING] = enc;
      }
      setEncoding(enc) {
        this.encoding = enc;
      }
      get objectMode() {
        return this[OBJECTMODE];
      }
      set objectMode(om) {
        this[OBJECTMODE] = this[OBJECTMODE] || !!om;
      }
      get ["async"]() {
        return this[ASYNC];
      }
      set ["async"](a) {
        this[ASYNC] = this[ASYNC] || !!a;
      }
      write(chunk, encoding, cb) {
        if (this[EOF])
          throw new Error("write after end");
        if (this[DESTROYED]) {
          this.emit("error", Object.assign(
            new Error("Cannot call write after a stream was destroyed"),
            { code: "ERR_STREAM_DESTROYED" }
          ));
          return true;
        }
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (!encoding)
          encoding = "utf8";
        const fn = this[ASYNC] ? defer : (f) => f();
        if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
          if (isArrayBufferView(chunk))
            chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
          else if (isArrayBuffer(chunk))
            chunk = Buffer.from(chunk);
          else if (typeof chunk !== "string")
            this.objectMode = true;
        }
        if (this[OBJECTMODE]) {
          if (this.flowing && this[BUFFERLENGTH] !== 0)
            this[FLUSH](true);
          if (this.flowing)
            this.emit("data", chunk);
          else
            this[BUFFERPUSH](chunk);
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (!chunk.length) {
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (typeof chunk === "string" && // unless it is a string already ready for us to use
        !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
          chunk = Buffer.from(chunk, encoding);
        }
        if (Buffer.isBuffer(chunk) && this[ENCODING])
          chunk = this[DECODER].write(chunk);
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      read(n) {
        if (this[DESTROYED])
          return null;
        if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
          this[MAYBE_EMIT_END]();
          return null;
        }
        if (this[OBJECTMODE])
          n = null;
        if (this.buffer.length > 1 && !this[OBJECTMODE]) {
          if (this.encoding)
            this.buffer = [this.buffer.join("")];
          else
            this.buffer = [Buffer.concat(this.buffer, this[BUFFERLENGTH])];
        }
        const ret = this[READ](n || null, this.buffer[0]);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [READ](n, chunk) {
        if (n === chunk.length || n === null)
          this[BUFFERSHIFT]();
        else {
          this.buffer[0] = chunk.slice(n);
          chunk = chunk.slice(0, n);
          this[BUFFERLENGTH] -= n;
        }
        this.emit("data", chunk);
        if (!this.buffer.length && !this[EOF])
          this.emit("drain");
        return chunk;
      }
      end(chunk, encoding, cb) {
        if (typeof chunk === "function")
          cb = chunk, chunk = null;
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (chunk)
          this.write(chunk, encoding);
        if (cb)
          this.once("end", cb);
        this[EOF] = true;
        this.writable = false;
        if (this.flowing || !this[PAUSED])
          this[MAYBE_EMIT_END]();
        return this;
      }
      // don't let the internal resume be overwritten
      [RESUME]() {
        if (this[DESTROYED])
          return;
        this[PAUSED] = false;
        this[FLOWING] = true;
        this.emit("resume");
        if (this.buffer.length)
          this[FLUSH]();
        else if (this[EOF])
          this[MAYBE_EMIT_END]();
        else
          this.emit("drain");
      }
      resume() {
        return this[RESUME]();
      }
      pause() {
        this[FLOWING] = false;
        this[PAUSED] = true;
      }
      get destroyed() {
        return this[DESTROYED];
      }
      get flowing() {
        return this[FLOWING];
      }
      get paused() {
        return this[PAUSED];
      }
      [BUFFERPUSH](chunk) {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] += 1;
        else
          this[BUFFERLENGTH] += chunk.length;
        this.buffer.push(chunk);
      }
      [BUFFERSHIFT]() {
        if (this.buffer.length) {
          if (this[OBJECTMODE])
            this[BUFFERLENGTH] -= 1;
          else
            this[BUFFERLENGTH] -= this.buffer[0].length;
        }
        return this.buffer.shift();
      }
      [FLUSH](noDrain) {
        do {
        } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
        if (!noDrain && !this.buffer.length && !this[EOF])
          this.emit("drain");
      }
      [FLUSHCHUNK](chunk) {
        return chunk ? (this.emit("data", chunk), this.flowing) : false;
      }
      pipe(dest, opts) {
        if (this[DESTROYED])
          return;
        const ended = this[EMITTED_END];
        opts = opts || {};
        if (dest === proc.stdout || dest === proc.stderr)
          opts.end = false;
        else
          opts.end = opts.end !== false;
        opts.proxyErrors = !!opts.proxyErrors;
        if (ended) {
          if (opts.end)
            dest.end();
        } else {
          this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
          if (this[ASYNC])
            defer(() => this[RESUME]());
          else
            this[RESUME]();
        }
        return dest;
      }
      unpipe(dest) {
        const p = this.pipes.find((p2) => p2.dest === dest);
        if (p) {
          this.pipes.splice(this.pipes.indexOf(p), 1);
          p.unpipe();
        }
      }
      addListener(ev, fn) {
        return this.on(ev, fn);
      }
      on(ev, fn) {
        const ret = super.on(ev, fn);
        if (ev === "data" && !this.pipes.length && !this.flowing)
          this[RESUME]();
        else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
          super.emit("readable");
        else if (isEndish(ev) && this[EMITTED_END]) {
          super.emit(ev);
          this.removeAllListeners(ev);
        } else if (ev === "error" && this[EMITTED_ERROR]) {
          if (this[ASYNC])
            defer(() => fn.call(this, this[EMITTED_ERROR]));
          else
            fn.call(this, this[EMITTED_ERROR]);
        }
        return ret;
      }
      get emittedEnd() {
        return this[EMITTED_END];
      }
      [MAYBE_EMIT_END]() {
        if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
          this[EMITTING_END] = true;
          this.emit("end");
          this.emit("prefinish");
          this.emit("finish");
          if (this[CLOSED])
            this.emit("close");
          this[EMITTING_END] = false;
        }
      }
      emit(ev, data, ...extra) {
        if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
          return;
        else if (ev === "data") {
          return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
        } else if (ev === "end") {
          return this[EMITEND]();
        } else if (ev === "close") {
          this[CLOSED] = true;
          if (!this[EMITTED_END] && !this[DESTROYED])
            return;
          const ret2 = super.emit("close");
          this.removeAllListeners("close");
          return ret2;
        } else if (ev === "error") {
          this[EMITTED_ERROR] = data;
          const ret2 = super.emit("error", data);
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "resume") {
          const ret2 = super.emit("resume");
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "finish" || ev === "prefinish") {
          const ret2 = super.emit(ev);
          this.removeAllListeners(ev);
          return ret2;
        }
        const ret = super.emit(ev, data, ...extra);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITDATA](data) {
        for (const p of this.pipes) {
          if (p.dest.write(data) === false)
            this.pause();
        }
        const ret = super.emit("data", data);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITEND]() {
        if (this[EMITTED_END])
          return;
        this[EMITTED_END] = true;
        this.readable = false;
        if (this[ASYNC])
          defer(() => this[EMITEND2]());
        else
          this[EMITEND2]();
      }
      [EMITEND2]() {
        if (this[DECODER]) {
          const data = this[DECODER].end();
          if (data) {
            for (const p of this.pipes) {
              p.dest.write(data);
            }
            super.emit("data", data);
          }
        }
        for (const p of this.pipes) {
          p.end();
        }
        const ret = super.emit("end");
        this.removeAllListeners("end");
        return ret;
      }
      // const all = await stream.collect()
      collect() {
        const buf = [];
        if (!this[OBJECTMODE])
          buf.dataLength = 0;
        const p = this.promise();
        this.on("data", (c) => {
          buf.push(c);
          if (!this[OBJECTMODE])
            buf.dataLength += c.length;
        });
        return p.then(() => buf);
      }
      // const data = await stream.concat()
      concat() {
        return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
      }
      // stream.promise().then(() => done, er => emitted error)
      promise() {
        return new Promise((resolve, reject) => {
          this.on(DESTROYED, () => reject(new Error("stream destroyed")));
          this.on("error", (er) => reject(er));
          this.on("end", () => resolve());
        });
      }
      // for await (let chunk of stream)
      [ASYNCITERATOR]() {
        const next = () => {
          const res = this.read();
          if (res !== null)
            return Promise.resolve({ done: false, value: res });
          if (this[EOF])
            return Promise.resolve({ done: true });
          let resolve = null;
          let reject = null;
          const onerr = (er) => {
            this.removeListener("data", ondata);
            this.removeListener("end", onend);
            reject(er);
          };
          const ondata = (value) => {
            this.removeListener("error", onerr);
            this.removeListener("end", onend);
            this.pause();
            resolve({ value, done: !!this[EOF] });
          };
          const onend = () => {
            this.removeListener("error", onerr);
            this.removeListener("data", ondata);
            resolve({ done: true });
          };
          const ondestroy = () => onerr(new Error("stream destroyed"));
          return new Promise((res2, rej) => {
            reject = rej;
            resolve = res2;
            this.once(DESTROYED, ondestroy);
            this.once("error", onerr);
            this.once("end", onend);
            this.once("data", ondata);
          });
        };
        return { next };
      }
      // for (let chunk of stream)
      [ITERATOR]() {
        const next = () => {
          const value = this.read();
          const done = value === null;
          return { value, done };
        };
        return { next };
      }
      destroy(er) {
        if (this[DESTROYED]) {
          if (er)
            this.emit("error", er);
          else
            this.emit(DESTROYED);
          return this;
        }
        this[DESTROYED] = true;
        this.buffer.length = 0;
        this[BUFFERLENGTH] = 0;
        if (typeof this.close === "function" && !this[CLOSED])
          this.close();
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      static isStream(s) {
        return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || // readable
        typeof s.write === "function" && typeof s.end === "function"));
      }
    };
  }
});

// node_modules/minizlib/index.js
var require_minizlib = __commonJS({
  "node_modules/minizlib/index.js"(exports) {
    "use strict";
    var assert = require("assert");
    var Buffer2 = require("buffer").Buffer;
    var realZlib = require("zlib");
    var constants = exports.constants = require_constants2();
    var Minipass = require_minipass2();
    var OriginalBufferConcat = Buffer2.concat;
    var _superWrite = Symbol("_superWrite");
    var ZlibError = class extends Error {
      constructor(err) {
        super("zlib: " + err.message);
        this.code = err.code;
        this.errno = err.errno;
        if (!this.code)
          this.code = "ZLIB_ERROR";
        this.message = "zlib: " + err.message;
        Error.captureStackTrace(this, this.constructor);
      }
      get name() {
        return "ZlibError";
      }
    };
    var _opts = Symbol("opts");
    var _flushFlag = Symbol("flushFlag");
    var _finishFlushFlag = Symbol("finishFlushFlag");
    var _fullFlushFlag = Symbol("fullFlushFlag");
    var _handle = Symbol("handle");
    var _onError = Symbol("onError");
    var _sawError = Symbol("sawError");
    var _level = Symbol("level");
    var _strategy = Symbol("strategy");
    var _ended = Symbol("ended");
    var _defaultFullFlush = Symbol("_defaultFullFlush");
    var ZlibBase = class extends Minipass {
      constructor(opts, mode) {
        if (!opts || typeof opts !== "object")
          throw new TypeError("invalid options for ZlibBase constructor");
        super(opts);
        this[_sawError] = false;
        this[_ended] = false;
        this[_opts] = opts;
        this[_flushFlag] = opts.flush;
        this[_finishFlushFlag] = opts.finishFlush;
        try {
          this[_handle] = new realZlib[mode](opts);
        } catch (er) {
          throw new ZlibError(er);
        }
        this[_onError] = (err) => {
          if (this[_sawError])
            return;
          this[_sawError] = true;
          this.close();
          this.emit("error", err);
        };
        this[_handle].on("error", (er) => this[_onError](new ZlibError(er)));
        this.once("end", () => this.close);
      }
      close() {
        if (this[_handle]) {
          this[_handle].close();
          this[_handle] = null;
          this.emit("close");
        }
      }
      reset() {
        if (!this[_sawError]) {
          assert(this[_handle], "zlib binding closed");
          return this[_handle].reset();
        }
      }
      flush(flushFlag) {
        if (this.ended)
          return;
        if (typeof flushFlag !== "number")
          flushFlag = this[_fullFlushFlag];
        this.write(Object.assign(Buffer2.alloc(0), { [_flushFlag]: flushFlag }));
      }
      end(chunk, encoding, cb) {
        if (chunk)
          this.write(chunk, encoding);
        this.flush(this[_finishFlushFlag]);
        this[_ended] = true;
        return super.end(null, null, cb);
      }
      get ended() {
        return this[_ended];
      }
      write(chunk, encoding, cb) {
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (typeof chunk === "string")
          chunk = Buffer2.from(chunk, encoding);
        if (this[_sawError])
          return;
        assert(this[_handle], "zlib binding closed");
        const nativeHandle = this[_handle]._handle;
        const originalNativeClose = nativeHandle.close;
        nativeHandle.close = () => {
        };
        const originalClose = this[_handle].close;
        this[_handle].close = () => {
        };
        Buffer2.concat = (args) => args;
        let result;
        try {
          const flushFlag = typeof chunk[_flushFlag] === "number" ? chunk[_flushFlag] : this[_flushFlag];
          result = this[_handle]._processChunk(chunk, flushFlag);
          Buffer2.concat = OriginalBufferConcat;
        } catch (err) {
          Buffer2.concat = OriginalBufferConcat;
          this[_onError](new ZlibError(err));
        } finally {
          if (this[_handle]) {
            this[_handle]._handle = nativeHandle;
            nativeHandle.close = originalNativeClose;
            this[_handle].close = originalClose;
            this[_handle].removeAllListeners("error");
          }
        }
        if (this[_handle])
          this[_handle].on("error", (er) => this[_onError](new ZlibError(er)));
        let writeReturn;
        if (result) {
          if (Array.isArray(result) && result.length > 0) {
            writeReturn = this[_superWrite](Buffer2.from(result[0]));
            for (let i = 1; i < result.length; i++) {
              writeReturn = this[_superWrite](result[i]);
            }
          } else {
            writeReturn = this[_superWrite](Buffer2.from(result));
          }
        }
        if (cb)
          cb();
        return writeReturn;
      }
      [_superWrite](data) {
        return super.write(data);
      }
    };
    var Zlib = class extends ZlibBase {
      constructor(opts, mode) {
        opts = opts || {};
        opts.flush = opts.flush || constants.Z_NO_FLUSH;
        opts.finishFlush = opts.finishFlush || constants.Z_FINISH;
        super(opts, mode);
        this[_fullFlushFlag] = constants.Z_FULL_FLUSH;
        this[_level] = opts.level;
        this[_strategy] = opts.strategy;
      }
      params(level, strategy) {
        if (this[_sawError])
          return;
        if (!this[_handle])
          throw new Error("cannot switch params when binding is closed");
        if (!this[_handle].params)
          throw new Error("not supported in this implementation");
        if (this[_level] !== level || this[_strategy] !== strategy) {
          this.flush(constants.Z_SYNC_FLUSH);
          assert(this[_handle], "zlib binding closed");
          const origFlush = this[_handle].flush;
          this[_handle].flush = (flushFlag, cb) => {
            this.flush(flushFlag);
            cb();
          };
          try {
            this[_handle].params(level, strategy);
          } finally {
            this[_handle].flush = origFlush;
          }
          if (this[_handle]) {
            this[_level] = level;
            this[_strategy] = strategy;
          }
        }
      }
    };
    var Deflate = class extends Zlib {
      constructor(opts) {
        super(opts, "Deflate");
      }
    };
    var Inflate = class extends Zlib {
      constructor(opts) {
        super(opts, "Inflate");
      }
    };
    var _portable = Symbol("_portable");
    var Gzip = class extends Zlib {
      constructor(opts) {
        super(opts, "Gzip");
        this[_portable] = opts && !!opts.portable;
      }
      [_superWrite](data) {
        if (!this[_portable])
          return super[_superWrite](data);
        this[_portable] = false;
        data[9] = 255;
        return super[_superWrite](data);
      }
    };
    var Gunzip = class extends Zlib {
      constructor(opts) {
        super(opts, "Gunzip");
      }
    };
    var DeflateRaw = class extends Zlib {
      constructor(opts) {
        super(opts, "DeflateRaw");
      }
    };
    var InflateRaw = class extends Zlib {
      constructor(opts) {
        super(opts, "InflateRaw");
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
        super(opts, mode);
        this[_fullFlushFlag] = constants.BROTLI_OPERATION_FLUSH;
      }
    };
    var BrotliCompress = class extends Brotli {
      constructor(opts) {
        super(opts, "BrotliCompress");
      }
    };
    var BrotliDecompress = class extends Brotli {
      constructor(opts) {
        super(opts, "BrotliDecompress");
      }
    };
    exports.Deflate = Deflate;
    exports.Inflate = Inflate;
    exports.Gzip = Gzip;
    exports.Gunzip = Gunzip;
    exports.DeflateRaw = DeflateRaw;
    exports.InflateRaw = InflateRaw;
    exports.Unzip = Unzip;
    if (typeof realZlib.BrotliCompress === "function") {
      exports.BrotliCompress = BrotliCompress;
      exports.BrotliDecompress = BrotliDecompress;
    } else {
      exports.BrotliCompress = exports.BrotliDecompress = class {
        constructor() {
          throw new Error("Brotli is not supported in this version of Node.js");
        }
      };
    }
  }
});

// node_modules/tar/lib/normalize-windows-path.js
var require_normalize_windows_path = __commonJS({
  "node_modules/tar/lib/normalize-windows-path.js"(exports, module2) {
    var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
    module2.exports = platform !== "win32" ? (p) => p : (p) => p && p.replace(/\\/g, "/");
  }
});

// node_modules/tar/lib/read-entry.js
var require_read_entry = __commonJS({
  "node_modules/tar/lib/read-entry.js"(exports, module2) {
    "use strict";
    var { Minipass } = require_minipass();
    var normPath = require_normalize_windows_path();
    var SLURP = Symbol("slurp");
    module2.exports = class ReadEntry extends Minipass {
      constructor(header, ex, gex) {
        super();
        this.pause();
        this.extended = ex;
        this.globalExtended = gex;
        this.header = header;
        this.startBlockSize = 512 * Math.ceil(header.size / 512);
        this.blockRemain = this.startBlockSize;
        this.remain = header.size;
        this.type = header.type;
        this.meta = false;
        this.ignore = false;
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
          case "GNUDumpDir":
            break;
          case "NextFileHasLongLinkpath":
          case "NextFileHasLongPath":
          case "OldGnuLongPath":
          case "GlobalExtendedHeader":
          case "ExtendedHeader":
          case "OldExtendedHeader":
            this.meta = true;
            break;
          default:
            this.ignore = true;
        }
        this.path = normPath(header.path);
        this.mode = header.mode;
        if (this.mode) {
          this.mode = this.mode & 4095;
        }
        this.uid = header.uid;
        this.gid = header.gid;
        this.uname = header.uname;
        this.gname = header.gname;
        this.size = header.size;
        this.mtime = header.mtime;
        this.atime = header.atime;
        this.ctime = header.ctime;
        this.linkpath = normPath(header.linkpath);
        this.uname = header.uname;
        this.gname = header.gname;
        if (ex) {
          this[SLURP](ex);
        }
        if (gex) {
          this[SLURP](gex, true);
        }
      }
      write(data) {
        const writeLen = data.length;
        if (writeLen > this.blockRemain) {
          throw new Error("writing more to entry than is appropriate");
        }
        const r = this.remain;
        const br = this.blockRemain;
        this.remain = Math.max(0, r - writeLen);
        this.blockRemain = Math.max(0, br - writeLen);
        if (this.ignore) {
          return true;
        }
        if (r >= writeLen) {
          return super.write(data);
        }
        return super.write(data.slice(0, r));
      }
      [SLURP](ex, global2) {
        for (const k in ex) {
          if (ex[k] !== null && ex[k] !== void 0 && !(global2 && k === "path")) {
            this[k] = k === "path" || k === "linkpath" ? normPath(ex[k]) : ex[k];
          }
        }
      }
    };
  }
});

// node_modules/tar/lib/types.js
var require_types = __commonJS({
  "node_modules/tar/lib/types.js"(exports) {
    "use strict";
    exports.name = /* @__PURE__ */ new Map([
      ["0", "File"],
      // same as File
      ["", "OldFile"],
      ["1", "Link"],
      ["2", "SymbolicLink"],
      // Devices and FIFOs aren't fully supported
      // they are parsed, but skipped when unpacking
      ["3", "CharacterDevice"],
      ["4", "BlockDevice"],
      ["5", "Directory"],
      ["6", "FIFO"],
      // same as File
      ["7", "ContiguousFile"],
      // pax headers
      ["g", "GlobalExtendedHeader"],
      ["x", "ExtendedHeader"],
      // vendor-specific stuff
      // skip
      ["A", "SolarisACL"],
      // like 5, but with data, which should be skipped
      ["D", "GNUDumpDir"],
      // metadata only, skip
      ["I", "Inode"],
      // data = link path of next file
      ["K", "NextFileHasLongLinkpath"],
      // data = path of next file
      ["L", "NextFileHasLongPath"],
      // skip
      ["M", "ContinuationFile"],
      // like L
      ["N", "OldGnuLongPath"],
      // skip
      ["S", "SparseFile"],
      // skip
      ["V", "TapeVolumeHeader"],
      // like x
      ["X", "OldExtendedHeader"]
    ]);
    exports.code = new Map(Array.from(exports.name).map((kv) => [kv[1], kv[0]]));
  }
});

// node_modules/tar/lib/large-numbers.js
var require_large_numbers = __commonJS({
  "node_modules/tar/lib/large-numbers.js"(exports, module2) {
    "use strict";
    var encode = (num, buf) => {
      if (!Number.isSafeInteger(num)) {
        throw Error("cannot encode number outside of javascript safe integer range");
      } else if (num < 0) {
        encodeNegative(num, buf);
      } else {
        encodePositive(num, buf);
      }
      return buf;
    };
    var encodePositive = (num, buf) => {
      buf[0] = 128;
      for (var i = buf.length; i > 1; i--) {
        buf[i - 1] = num & 255;
        num = Math.floor(num / 256);
      }
    };
    var encodeNegative = (num, buf) => {
      buf[0] = 255;
      var flipped = false;
      num = num * -1;
      for (var i = buf.length; i > 1; i--) {
        var byte = num & 255;
        num = Math.floor(num / 256);
        if (flipped) {
          buf[i - 1] = onesComp(byte);
        } else if (byte === 0) {
          buf[i - 1] = 0;
        } else {
          flipped = true;
          buf[i - 1] = twosComp(byte);
        }
      }
    };
    var parse2 = (buf) => {
      const pre = buf[0];
      const value = pre === 128 ? pos(buf.slice(1, buf.length)) : pre === 255 ? twos(buf) : null;
      if (value === null) {
        throw Error("invalid base256 encoding");
      }
      if (!Number.isSafeInteger(value)) {
        throw Error("parsed number outside of javascript safe integer range");
      }
      return value;
    };
    var twos = (buf) => {
      var len = buf.length;
      var sum = 0;
      var flipped = false;
      for (var i = len - 1; i > -1; i--) {
        var byte = buf[i];
        var f;
        if (flipped) {
          f = onesComp(byte);
        } else if (byte === 0) {
          f = byte;
        } else {
          flipped = true;
          f = twosComp(byte);
        }
        if (f !== 0) {
          sum -= f * Math.pow(256, len - i - 1);
        }
      }
      return sum;
    };
    var pos = (buf) => {
      var len = buf.length;
      var sum = 0;
      for (var i = len - 1; i > -1; i--) {
        var byte = buf[i];
        if (byte !== 0) {
          sum += byte * Math.pow(256, len - i - 1);
        }
      }
      return sum;
    };
    var onesComp = (byte) => (255 ^ byte) & 255;
    var twosComp = (byte) => (255 ^ byte) + 1 & 255;
    module2.exports = {
      encode,
      parse: parse2
    };
  }
});

// node_modules/tar/lib/header.js
var require_header = __commonJS({
  "node_modules/tar/lib/header.js"(exports, module2) {
    "use strict";
    var types = require_types();
    var pathModule = require("path").posix;
    var large = require_large_numbers();
    var SLURP = Symbol("slurp");
    var TYPE = Symbol("type");
    var Header = class {
      constructor(data, off, ex, gex) {
        this.cksumValid = false;
        this.needPax = false;
        this.nullBlock = false;
        this.block = null;
        this.path = null;
        this.mode = null;
        this.uid = null;
        this.gid = null;
        this.size = null;
        this.mtime = null;
        this.cksum = null;
        this[TYPE] = "0";
        this.linkpath = null;
        this.uname = null;
        this.gname = null;
        this.devmaj = 0;
        this.devmin = 0;
        this.atime = null;
        this.ctime = null;
        if (Buffer.isBuffer(data)) {
          this.decode(data, off || 0, ex, gex);
        } else if (data) {
          this.set(data);
        }
      }
      decode(buf, off, ex, gex) {
        if (!off) {
          off = 0;
        }
        if (!buf || !(buf.length >= off + 512)) {
          throw new Error("need 512 bytes for header");
        }
        this.path = decString(buf, off, 100);
        this.mode = decNumber(buf, off + 100, 8);
        this.uid = decNumber(buf, off + 108, 8);
        this.gid = decNumber(buf, off + 116, 8);
        this.size = decNumber(buf, off + 124, 12);
        this.mtime = decDate(buf, off + 136, 12);
        this.cksum = decNumber(buf, off + 148, 12);
        this[SLURP](ex);
        this[SLURP](gex, true);
        this[TYPE] = decString(buf, off + 156, 1);
        if (this[TYPE] === "") {
          this[TYPE] = "0";
        }
        if (this[TYPE] === "0" && this.path.slice(-1) === "/") {
          this[TYPE] = "5";
        }
        if (this[TYPE] === "5") {
          this.size = 0;
        }
        this.linkpath = decString(buf, off + 157, 100);
        if (buf.slice(off + 257, off + 265).toString() === "ustar\x0000") {
          this.uname = decString(buf, off + 265, 32);
          this.gname = decString(buf, off + 297, 32);
          this.devmaj = decNumber(buf, off + 329, 8);
          this.devmin = decNumber(buf, off + 337, 8);
          if (buf[off + 475] !== 0) {
            const prefix = decString(buf, off + 345, 155);
            this.path = prefix + "/" + this.path;
          } else {
            const prefix = decString(buf, off + 345, 130);
            if (prefix) {
              this.path = prefix + "/" + this.path;
            }
            this.atime = decDate(buf, off + 476, 12);
            this.ctime = decDate(buf, off + 488, 12);
          }
        }
        let sum = 8 * 32;
        for (let i = off; i < off + 148; i++) {
          sum += buf[i];
        }
        for (let i = off + 156; i < off + 512; i++) {
          sum += buf[i];
        }
        this.cksumValid = sum === this.cksum;
        if (this.cksum === null && sum === 8 * 32) {
          this.nullBlock = true;
        }
      }
      [SLURP](ex, global2) {
        for (const k in ex) {
          if (ex[k] !== null && ex[k] !== void 0 && !(global2 && k === "path")) {
            this[k] = ex[k];
          }
        }
      }
      encode(buf, off) {
        if (!buf) {
          buf = this.block = Buffer.alloc(512);
          off = 0;
        }
        if (!off) {
          off = 0;
        }
        if (!(buf.length >= off + 512)) {
          throw new Error("need 512 bytes for header");
        }
        const prefixSize = this.ctime || this.atime ? 130 : 155;
        const split = splitPrefix(this.path || "", prefixSize);
        const path3 = split[0];
        const prefix = split[1];
        this.needPax = split[2];
        this.needPax = encString(buf, off, 100, path3) || this.needPax;
        this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax;
        this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax;
        this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax;
        this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax;
        this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax;
        buf[off + 156] = this[TYPE].charCodeAt(0);
        this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax;
        buf.write("ustar\x0000", off + 257, 8);
        this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax;
        this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax;
        this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax;
        this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax;
        this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax;
        if (buf[off + 475] !== 0) {
          this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax;
        } else {
          this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax;
          this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax;
          this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax;
        }
        let sum = 8 * 32;
        for (let i = off; i < off + 148; i++) {
          sum += buf[i];
        }
        for (let i = off + 156; i < off + 512; i++) {
          sum += buf[i];
        }
        this.cksum = sum;
        encNumber(buf, off + 148, 8, this.cksum);
        this.cksumValid = true;
        return this.needPax;
      }
      set(data) {
        for (const i in data) {
          if (data[i] !== null && data[i] !== void 0) {
            this[i] = data[i];
          }
        }
      }
      get type() {
        return types.name.get(this[TYPE]) || this[TYPE];
      }
      get typeKey() {
        return this[TYPE];
      }
      set type(type) {
        if (types.code.has(type)) {
          this[TYPE] = types.code.get(type);
        } else {
          this[TYPE] = type;
        }
      }
    };
    var splitPrefix = (p, prefixSize) => {
      const pathSize = 100;
      let pp = p;
      let prefix = "";
      let ret;
      const root = pathModule.parse(p).root || ".";
      if (Buffer.byteLength(pp) < pathSize) {
        ret = [pp, prefix, false];
      } else {
        prefix = pathModule.dirname(pp);
        pp = pathModule.basename(pp);
        do {
          if (Buffer.byteLength(pp) <= pathSize && Buffer.byteLength(prefix) <= prefixSize) {
            ret = [pp, prefix, false];
          } else if (Buffer.byteLength(pp) > pathSize && Buffer.byteLength(prefix) <= prefixSize) {
            ret = [pp.slice(0, pathSize - 1), prefix, true];
          } else {
            pp = pathModule.join(pathModule.basename(prefix), pp);
            prefix = pathModule.dirname(prefix);
          }
        } while (prefix !== root && !ret);
        if (!ret) {
          ret = [p.slice(0, pathSize - 1), "", true];
        }
      }
      return ret;
    };
    var decString = (buf, off, size) => buf.slice(off, off + size).toString("utf8").replace(/\0.*/, "");
    var decDate = (buf, off, size) => numToDate(decNumber(buf, off, size));
    var numToDate = (num) => num === null ? null : new Date(num * 1e3);
    var decNumber = (buf, off, size) => buf[off] & 128 ? large.parse(buf.slice(off, off + size)) : decSmallNumber(buf, off, size);
    var nanNull = (value) => isNaN(value) ? null : value;
    var decSmallNumber = (buf, off, size) => nanNull(parseInt(
      buf.slice(off, off + size).toString("utf8").replace(/\0.*$/, "").trim(),
      8
    ));
    var MAXNUM = {
      12: 8589934591,
      8: 2097151
    };
    var encNumber = (buf, off, size, number) => number === null ? false : number > MAXNUM[size] || number < 0 ? (large.encode(number, buf.slice(off, off + size)), true) : (encSmallNumber(buf, off, size, number), false);
    var encSmallNumber = (buf, off, size, number) => buf.write(octalString(number, size), off, size, "ascii");
    var octalString = (number, size) => padOctal(Math.floor(number).toString(8), size);
    var padOctal = (string, size) => (string.length === size - 1 ? string : new Array(size - string.length - 1).join("0") + string + " ") + "\0";
    var encDate = (buf, off, size, date) => date === null ? false : encNumber(buf, off, size, date.getTime() / 1e3);
    var NULLS = new Array(156).join("\0");
    var encString = (buf, off, size, string) => string === null ? false : (buf.write(string + NULLS, off, size, "utf8"), string.length !== Buffer.byteLength(string) || string.length > size);
    module2.exports = Header;
  }
});

// node_modules/tar/lib/pax.js
var require_pax = __commonJS({
  "node_modules/tar/lib/pax.js"(exports, module2) {
    "use strict";
    var Header = require_header();
    var path3 = require("path");
    var Pax = class {
      constructor(obj, global2) {
        this.atime = obj.atime || null;
        this.charset = obj.charset || null;
        this.comment = obj.comment || null;
        this.ctime = obj.ctime || null;
        this.gid = obj.gid || null;
        this.gname = obj.gname || null;
        this.linkpath = obj.linkpath || null;
        this.mtime = obj.mtime || null;
        this.path = obj.path || null;
        this.size = obj.size || null;
        this.uid = obj.uid || null;
        this.uname = obj.uname || null;
        this.dev = obj.dev || null;
        this.ino = obj.ino || null;
        this.nlink = obj.nlink || null;
        this.global = global2 || false;
      }
      encode() {
        const body = this.encodeBody();
        if (body === "") {
          return null;
        }
        const bodyLen = Buffer.byteLength(body);
        const bufLen = 512 * Math.ceil(1 + bodyLen / 512);
        const buf = Buffer.allocUnsafe(bufLen);
        for (let i = 0; i < 512; i++) {
          buf[i] = 0;
        }
        new Header({
          // XXX split the path
          // then the path should be PaxHeader + basename, but less than 99,
          // prepend with the dirname
          path: ("PaxHeader/" + path3.basename(this.path)).slice(0, 99),
          mode: this.mode || 420,
          uid: this.uid || null,
          gid: this.gid || null,
          size: bodyLen,
          mtime: this.mtime || null,
          type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader",
          linkpath: "",
          uname: this.uname || "",
          gname: this.gname || "",
          devmaj: 0,
          devmin: 0,
          atime: this.atime || null,
          ctime: this.ctime || null
        }).encode(buf);
        buf.write(body, 512, bodyLen, "utf8");
        for (let i = bodyLen + 512; i < buf.length; i++) {
          buf[i] = 0;
        }
        return buf;
      }
      encodeBody() {
        return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
      }
      encodeField(field) {
        if (this[field] === null || this[field] === void 0) {
          return "";
        }
        const v = this[field] instanceof Date ? this[field].getTime() / 1e3 : this[field];
        const s = " " + (field === "dev" || field === "ino" || field === "nlink" ? "SCHILY." : "") + field + "=" + v + "\n";
        const byteLen = Buffer.byteLength(s);
        let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1;
        if (byteLen + digits >= Math.pow(10, digits)) {
          digits += 1;
        }
        const len = digits + byteLen;
        return len + s;
      }
    };
    Pax.parse = (string, ex, g) => new Pax(merge(parseKV(string), ex), g);
    var merge = (a, b) => b ? Object.keys(a).reduce((s, k) => (s[k] = a[k], s), b) : a;
    var parseKV = (string) => string.replace(/\n$/, "").split("\n").reduce(parseKVLine, /* @__PURE__ */ Object.create(null));
    var parseKVLine = (set, line) => {
      const n = parseInt(line, 10);
      if (n !== Buffer.byteLength(line) + 1) {
        return set;
      }
      line = line.slice((n + " ").length);
      const kv = line.split("=");
      const k = kv.shift().replace(/^SCHILY\.(dev|ino|nlink)/, "$1");
      if (!k) {
        return set;
      }
      const v = kv.join("=");
      set[k] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(k) ? new Date(v * 1e3) : /^[0-9]+$/.test(v) ? +v : v;
      return set;
    };
    module2.exports = Pax;
  }
});

// node_modules/tar/lib/strip-trailing-slashes.js
var require_strip_trailing_slashes = __commonJS({
  "node_modules/tar/lib/strip-trailing-slashes.js"(exports, module2) {
    module2.exports = (str) => {
      let i = str.length - 1;
      let slashesStart = -1;
      while (i > -1 && str.charAt(i) === "/") {
        slashesStart = i;
        i--;
      }
      return slashesStart === -1 ? str : str.slice(0, slashesStart);
    };
  }
});

// node_modules/tar/lib/warn-mixin.js
var require_warn_mixin = __commonJS({
  "node_modules/tar/lib/warn-mixin.js"(exports, module2) {
    "use strict";
    module2.exports = (Base) => class extends Base {
      warn(code, message, data = {}) {
        if (this.file) {
          data.file = this.file;
        }
        if (this.cwd) {
          data.cwd = this.cwd;
        }
        data.code = message instanceof Error && message.code || code;
        data.tarCode = code;
        if (!this.strict && data.recoverable !== false) {
          if (message instanceof Error) {
            data = Object.assign(message, data);
            message = message.message;
          }
          this.emit("warn", data.tarCode, message, data);
        } else if (message instanceof Error) {
          this.emit("error", Object.assign(message, data));
        } else {
          this.emit("error", Object.assign(new Error(`${code}: ${message}`), data));
        }
      }
    };
  }
});

// node_modules/tar/lib/winchars.js
var require_winchars = __commonJS({
  "node_modules/tar/lib/winchars.js"(exports, module2) {
    "use strict";
    var raw = [
      "|",
      "<",
      ">",
      "?",
      ":"
    ];
    var win = raw.map((char) => String.fromCharCode(61440 + char.charCodeAt(0)));
    var toWin = new Map(raw.map((char, i) => [char, win[i]]));
    var toRaw = new Map(win.map((char, i) => [char, raw[i]]));
    module2.exports = {
      encode: (s) => raw.reduce((s2, c) => s2.split(c).join(toWin.get(c)), s),
      decode: (s) => win.reduce((s2, c) => s2.split(c).join(toRaw.get(c)), s)
    };
  }
});

// node_modules/tar/lib/strip-absolute-path.js
var require_strip_absolute_path = __commonJS({
  "node_modules/tar/lib/strip-absolute-path.js"(exports, module2) {
    var { isAbsolute, parse: parse2 } = require("path").win32;
    module2.exports = (path3) => {
      let r = "";
      let parsed = parse2(path3);
      while (isAbsolute(path3) || parsed.root) {
        const root = path3.charAt(0) === "/" && path3.slice(0, 4) !== "//?/" ? "/" : parsed.root;
        path3 = path3.slice(root.length);
        r += root;
        parsed = parse2(path3);
      }
      return [r, path3];
    };
  }
});

// node_modules/tar/lib/mode-fix.js
var require_mode_fix = __commonJS({
  "node_modules/tar/lib/mode-fix.js"(exports, module2) {
    "use strict";
    module2.exports = (mode, isDir, portable) => {
      mode &= 4095;
      if (portable) {
        mode = (mode | 384) & ~18;
      }
      if (isDir) {
        if (mode & 256) {
          mode |= 64;
        }
        if (mode & 32) {
          mode |= 8;
        }
        if (mode & 4) {
          mode |= 1;
        }
      }
      return mode;
    };
  }
});

// node_modules/tar/lib/write-entry.js
var require_write_entry = __commonJS({
  "node_modules/tar/lib/write-entry.js"(exports, module2) {
    "use strict";
    var { Minipass } = require_minipass();
    var Pax = require_pax();
    var Header = require_header();
    var fs3 = require("fs");
    var path3 = require("path");
    var normPath = require_normalize_windows_path();
    var stripSlash = require_strip_trailing_slashes();
    var prefixPath = (path4, prefix) => {
      if (!prefix) {
        return normPath(path4);
      }
      path4 = normPath(path4).replace(/^\.(\/|$)/, "");
      return stripSlash(prefix) + "/" + path4;
    };
    var maxReadSize = 16 * 1024 * 1024;
    var PROCESS = Symbol("process");
    var FILE = Symbol("file");
    var DIRECTORY = Symbol("directory");
    var SYMLINK = Symbol("symlink");
    var HARDLINK = Symbol("hardlink");
    var HEADER = Symbol("header");
    var READ = Symbol("read");
    var LSTAT = Symbol("lstat");
    var ONLSTAT = Symbol("onlstat");
    var ONREAD = Symbol("onread");
    var ONREADLINK = Symbol("onreadlink");
    var OPENFILE = Symbol("openfile");
    var ONOPENFILE = Symbol("onopenfile");
    var CLOSE = Symbol("close");
    var MODE = Symbol("mode");
    var AWAITDRAIN = Symbol("awaitDrain");
    var ONDRAIN = Symbol("ondrain");
    var PREFIX = Symbol("prefix");
    var HAD_ERROR = Symbol("hadError");
    var warner = require_warn_mixin();
    var winchars = require_winchars();
    var stripAbsolutePath = require_strip_absolute_path();
    var modeFix = require_mode_fix();
    var WriteEntry = warner(class WriteEntry extends Minipass {
      constructor(p, opt) {
        opt = opt || {};
        super(opt);
        if (typeof p !== "string") {
          throw new TypeError("path is required");
        }
        this.path = normPath(p);
        this.portable = !!opt.portable;
        this.myuid = process.getuid && process.getuid() || 0;
        this.myuser = process.env.USER || "";
        this.maxReadSize = opt.maxReadSize || maxReadSize;
        this.linkCache = opt.linkCache || /* @__PURE__ */ new Map();
        this.statCache = opt.statCache || /* @__PURE__ */ new Map();
        this.preservePaths = !!opt.preservePaths;
        this.cwd = normPath(opt.cwd || process.cwd());
        this.strict = !!opt.strict;
        this.noPax = !!opt.noPax;
        this.noMtime = !!opt.noMtime;
        this.mtime = opt.mtime || null;
        this.prefix = opt.prefix ? normPath(opt.prefix) : null;
        this.fd = null;
        this.blockLen = null;
        this.blockRemain = null;
        this.buf = null;
        this.offset = null;
        this.length = null;
        this.pos = null;
        this.remain = null;
        if (typeof opt.onwarn === "function") {
          this.on("warn", opt.onwarn);
        }
        let pathWarn = false;
        if (!this.preservePaths) {
          const [root, stripped] = stripAbsolutePath(this.path);
          if (root) {
            this.path = stripped;
            pathWarn = root;
          }
        }
        this.win32 = !!opt.win32 || process.platform === "win32";
        if (this.win32) {
          this.path = winchars.decode(this.path.replace(/\\/g, "/"));
          p = p.replace(/\\/g, "/");
        }
        this.absolute = normPath(opt.absolute || path3.resolve(this.cwd, p));
        if (this.path === "") {
          this.path = "./";
        }
        if (pathWarn) {
          this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
            entry: this,
            path: pathWarn + this.path
          });
        }
        if (this.statCache.has(this.absolute)) {
          this[ONLSTAT](this.statCache.get(this.absolute));
        } else {
          this[LSTAT]();
        }
      }
      emit(ev, ...data) {
        if (ev === "error") {
          this[HAD_ERROR] = true;
        }
        return super.emit(ev, ...data);
      }
      [LSTAT]() {
        fs3.lstat(this.absolute, (er, stat) => {
          if (er) {
            return this.emit("error", er);
          }
          this[ONLSTAT](stat);
        });
      }
      [ONLSTAT](stat) {
        this.statCache.set(this.absolute, stat);
        this.stat = stat;
        if (!stat.isFile()) {
          stat.size = 0;
        }
        this.type = getType(stat);
        this.emit("stat", stat);
        this[PROCESS]();
      }
      [PROCESS]() {
        switch (this.type) {
          case "File":
            return this[FILE]();
          case "Directory":
            return this[DIRECTORY]();
          case "SymbolicLink":
            return this[SYMLINK]();
          default:
            return this.end();
        }
      }
      [MODE](mode) {
        return modeFix(mode, this.type === "Directory", this.portable);
      }
      [PREFIX](path4) {
        return prefixPath(path4, this.prefix);
      }
      [HEADER]() {
        if (this.type === "Directory" && this.portable) {
          this.noMtime = true;
        }
        this.header = new Header({
          path: this[PREFIX](this.path),
          // only apply the prefix to hard links.
          linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
          // only the permissions and setuid/setgid/sticky bitflags
          // not the higher-order bits that specify file type
          mode: this[MODE](this.stat.mode),
          uid: this.portable ? null : this.stat.uid,
          gid: this.portable ? null : this.stat.gid,
          size: this.stat.size,
          mtime: this.noMtime ? null : this.mtime || this.stat.mtime,
          type: this.type,
          uname: this.portable ? null : this.stat.uid === this.myuid ? this.myuser : "",
          atime: this.portable ? null : this.stat.atime,
          ctime: this.portable ? null : this.stat.ctime
        });
        if (this.header.encode() && !this.noPax) {
          super.write(new Pax({
            atime: this.portable ? null : this.header.atime,
            ctime: this.portable ? null : this.header.ctime,
            gid: this.portable ? null : this.header.gid,
            mtime: this.noMtime ? null : this.mtime || this.header.mtime,
            path: this[PREFIX](this.path),
            linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
            size: this.header.size,
            uid: this.portable ? null : this.header.uid,
            uname: this.portable ? null : this.header.uname,
            dev: this.portable ? null : this.stat.dev,
            ino: this.portable ? null : this.stat.ino,
            nlink: this.portable ? null : this.stat.nlink
          }).encode());
        }
        super.write(this.header.block);
      }
      [DIRECTORY]() {
        if (this.path.slice(-1) !== "/") {
          this.path += "/";
        }
        this.stat.size = 0;
        this[HEADER]();
        this.end();
      }
      [SYMLINK]() {
        fs3.readlink(this.absolute, (er, linkpath) => {
          if (er) {
            return this.emit("error", er);
          }
          this[ONREADLINK](linkpath);
        });
      }
      [ONREADLINK](linkpath) {
        this.linkpath = normPath(linkpath);
        this[HEADER]();
        this.end();
      }
      [HARDLINK](linkpath) {
        this.type = "Link";
        this.linkpath = normPath(path3.relative(this.cwd, linkpath));
        this.stat.size = 0;
        this[HEADER]();
        this.end();
      }
      [FILE]() {
        if (this.stat.nlink > 1) {
          const linkKey = this.stat.dev + ":" + this.stat.ino;
          if (this.linkCache.has(linkKey)) {
            const linkpath = this.linkCache.get(linkKey);
            if (linkpath.indexOf(this.cwd) === 0) {
              return this[HARDLINK](linkpath);
            }
          }
          this.linkCache.set(linkKey, this.absolute);
        }
        this[HEADER]();
        if (this.stat.size === 0) {
          return this.end();
        }
        this[OPENFILE]();
      }
      [OPENFILE]() {
        fs3.open(this.absolute, "r", (er, fd) => {
          if (er) {
            return this.emit("error", er);
          }
          this[ONOPENFILE](fd);
        });
      }
      [ONOPENFILE](fd) {
        this.fd = fd;
        if (this[HAD_ERROR]) {
          return this[CLOSE]();
        }
        this.blockLen = 512 * Math.ceil(this.stat.size / 512);
        this.blockRemain = this.blockLen;
        const bufLen = Math.min(this.blockLen, this.maxReadSize);
        this.buf = Buffer.allocUnsafe(bufLen);
        this.offset = 0;
        this.pos = 0;
        this.remain = this.stat.size;
        this.length = this.buf.length;
        this[READ]();
      }
      [READ]() {
        const { fd, buf, offset, length, pos } = this;
        fs3.read(fd, buf, offset, length, pos, (er, bytesRead) => {
          if (er) {
            return this[CLOSE](() => this.emit("error", er));
          }
          this[ONREAD](bytesRead);
        });
      }
      [CLOSE](cb) {
        fs3.close(this.fd, cb);
      }
      [ONREAD](bytesRead) {
        if (bytesRead <= 0 && this.remain > 0) {
          const er = new Error("encountered unexpected EOF");
          er.path = this.absolute;
          er.syscall = "read";
          er.code = "EOF";
          return this[CLOSE](() => this.emit("error", er));
        }
        if (bytesRead > this.remain) {
          const er = new Error("did not encounter expected EOF");
          er.path = this.absolute;
          er.syscall = "read";
          er.code = "EOF";
          return this[CLOSE](() => this.emit("error", er));
        }
        if (bytesRead === this.remain) {
          for (let i = bytesRead; i < this.length && bytesRead < this.blockRemain; i++) {
            this.buf[i + this.offset] = 0;
            bytesRead++;
            this.remain++;
          }
        }
        const writeBuf = this.offset === 0 && bytesRead === this.buf.length ? this.buf : this.buf.slice(this.offset, this.offset + bytesRead);
        const flushed = this.write(writeBuf);
        if (!flushed) {
          this[AWAITDRAIN](() => this[ONDRAIN]());
        } else {
          this[ONDRAIN]();
        }
      }
      [AWAITDRAIN](cb) {
        this.once("drain", cb);
      }
      write(writeBuf) {
        if (this.blockRemain < writeBuf.length) {
          const er = new Error("writing more data than expected");
          er.path = this.absolute;
          return this.emit("error", er);
        }
        this.remain -= writeBuf.length;
        this.blockRemain -= writeBuf.length;
        this.pos += writeBuf.length;
        this.offset += writeBuf.length;
        return super.write(writeBuf);
      }
      [ONDRAIN]() {
        if (!this.remain) {
          if (this.blockRemain) {
            super.write(Buffer.alloc(this.blockRemain));
          }
          return this[CLOSE]((er) => er ? this.emit("error", er) : this.end());
        }
        if (this.offset >= this.length) {
          this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length));
          this.offset = 0;
        }
        this.length = this.buf.length - this.offset;
        this[READ]();
      }
    });
    var WriteEntrySync = class extends WriteEntry {
      [LSTAT]() {
        this[ONLSTAT](fs3.lstatSync(this.absolute));
      }
      [SYMLINK]() {
        this[ONREADLINK](fs3.readlinkSync(this.absolute));
      }
      [OPENFILE]() {
        this[ONOPENFILE](fs3.openSync(this.absolute, "r"));
      }
      [READ]() {
        let threw = true;
        try {
          const { fd, buf, offset, length, pos } = this;
          const bytesRead = fs3.readSync(fd, buf, offset, length, pos);
          this[ONREAD](bytesRead);
          threw = false;
        } finally {
          if (threw) {
            try {
              this[CLOSE](() => {
              });
            } catch (er) {
            }
          }
        }
      }
      [AWAITDRAIN](cb) {
        cb();
      }
      [CLOSE](cb) {
        fs3.closeSync(this.fd);
        cb();
      }
    };
    var WriteEntryTar = warner(class WriteEntryTar extends Minipass {
      constructor(readEntry, opt) {
        opt = opt || {};
        super(opt);
        this.preservePaths = !!opt.preservePaths;
        this.portable = !!opt.portable;
        this.strict = !!opt.strict;
        this.noPax = !!opt.noPax;
        this.noMtime = !!opt.noMtime;
        this.readEntry = readEntry;
        this.type = readEntry.type;
        if (this.type === "Directory" && this.portable) {
          this.noMtime = true;
        }
        this.prefix = opt.prefix || null;
        this.path = normPath(readEntry.path);
        this.mode = this[MODE](readEntry.mode);
        this.uid = this.portable ? null : readEntry.uid;
        this.gid = this.portable ? null : readEntry.gid;
        this.uname = this.portable ? null : readEntry.uname;
        this.gname = this.portable ? null : readEntry.gname;
        this.size = readEntry.size;
        this.mtime = this.noMtime ? null : opt.mtime || readEntry.mtime;
        this.atime = this.portable ? null : readEntry.atime;
        this.ctime = this.portable ? null : readEntry.ctime;
        this.linkpath = normPath(readEntry.linkpath);
        if (typeof opt.onwarn === "function") {
          this.on("warn", opt.onwarn);
        }
        let pathWarn = false;
        if (!this.preservePaths) {
          const [root, stripped] = stripAbsolutePath(this.path);
          if (root) {
            this.path = stripped;
            pathWarn = root;
          }
        }
        this.remain = readEntry.size;
        this.blockRemain = readEntry.startBlockSize;
        this.header = new Header({
          path: this[PREFIX](this.path),
          linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
          // only the permissions and setuid/setgid/sticky bitflags
          // not the higher-order bits that specify file type
          mode: this.mode,
          uid: this.portable ? null : this.uid,
          gid: this.portable ? null : this.gid,
          size: this.size,
          mtime: this.noMtime ? null : this.mtime,
          type: this.type,
          uname: this.portable ? null : this.uname,
          atime: this.portable ? null : this.atime,
          ctime: this.portable ? null : this.ctime
        });
        if (pathWarn) {
          this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
            entry: this,
            path: pathWarn + this.path
          });
        }
        if (this.header.encode() && !this.noPax) {
          super.write(new Pax({
            atime: this.portable ? null : this.atime,
            ctime: this.portable ? null : this.ctime,
            gid: this.portable ? null : this.gid,
            mtime: this.noMtime ? null : this.mtime,
            path: this[PREFIX](this.path),
            linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
            size: this.size,
            uid: this.portable ? null : this.uid,
            uname: this.portable ? null : this.uname,
            dev: this.portable ? null : this.readEntry.dev,
            ino: this.portable ? null : this.readEntry.ino,
            nlink: this.portable ? null : this.readEntry.nlink
          }).encode());
        }
        super.write(this.header.block);
        readEntry.pipe(this);
      }
      [PREFIX](path4) {
        return prefixPath(path4, this.prefix);
      }
      [MODE](mode) {
        return modeFix(mode, this.type === "Directory", this.portable);
      }
      write(data) {
        const writeLen = data.length;
        if (writeLen > this.blockRemain) {
          throw new Error("writing more to entry than is appropriate");
        }
        this.blockRemain -= writeLen;
        return super.write(data);
      }
      end() {
        if (this.blockRemain) {
          super.write(Buffer.alloc(this.blockRemain));
        }
        return super.end();
      }
    });
    WriteEntry.Sync = WriteEntrySync;
    WriteEntry.Tar = WriteEntryTar;
    var getType = (stat) => stat.isFile() ? "File" : stat.isDirectory() ? "Directory" : stat.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
    module2.exports = WriteEntry;
  }
});

// node_modules/tar/lib/pack.js
var require_pack = __commonJS({
  "node_modules/tar/lib/pack.js"(exports, module2) {
    "use strict";
    var PackJob = class {
      constructor(path4, absolute) {
        this.path = path4 || "./";
        this.absolute = absolute;
        this.entry = null;
        this.stat = null;
        this.readdir = null;
        this.pending = false;
        this.ignore = false;
        this.piped = false;
      }
    };
    var { Minipass } = require_minipass();
    var zlib = require_minizlib();
    var ReadEntry = require_read_entry();
    var WriteEntry = require_write_entry();
    var WriteEntrySync = WriteEntry.Sync;
    var WriteEntryTar = WriteEntry.Tar;
    var Yallist = require_yallist();
    var EOF = Buffer.alloc(1024);
    var ONSTAT = Symbol("onStat");
    var ENDED = Symbol("ended");
    var QUEUE = Symbol("queue");
    var CURRENT = Symbol("current");
    var PROCESS = Symbol("process");
    var PROCESSING = Symbol("processing");
    var PROCESSJOB = Symbol("processJob");
    var JOBS = Symbol("jobs");
    var JOBDONE = Symbol("jobDone");
    var ADDFSENTRY = Symbol("addFSEntry");
    var ADDTARENTRY = Symbol("addTarEntry");
    var STAT = Symbol("stat");
    var READDIR = Symbol("readdir");
    var ONREADDIR = Symbol("onreaddir");
    var PIPE = Symbol("pipe");
    var ENTRY = Symbol("entry");
    var ENTRYOPT = Symbol("entryOpt");
    var WRITEENTRYCLASS = Symbol("writeEntryClass");
    var WRITE = Symbol("write");
    var ONDRAIN = Symbol("ondrain");
    var fs3 = require("fs");
    var path3 = require("path");
    var warner = require_warn_mixin();
    var normPath = require_normalize_windows_path();
    var Pack = warner(class Pack extends Minipass {
      constructor(opt) {
        super(opt);
        opt = opt || /* @__PURE__ */ Object.create(null);
        this.opt = opt;
        this.file = opt.file || "";
        this.cwd = opt.cwd || process.cwd();
        this.maxReadSize = opt.maxReadSize;
        this.preservePaths = !!opt.preservePaths;
        this.strict = !!opt.strict;
        this.noPax = !!opt.noPax;
        this.prefix = normPath(opt.prefix || "");
        this.linkCache = opt.linkCache || /* @__PURE__ */ new Map();
        this.statCache = opt.statCache || /* @__PURE__ */ new Map();
        this.readdirCache = opt.readdirCache || /* @__PURE__ */ new Map();
        this[WRITEENTRYCLASS] = WriteEntry;
        if (typeof opt.onwarn === "function") {
          this.on("warn", opt.onwarn);
        }
        this.portable = !!opt.portable;
        this.zip = null;
        if (opt.gzip) {
          if (typeof opt.gzip !== "object") {
            opt.gzip = {};
          }
          if (this.portable) {
            opt.gzip.portable = true;
          }
          this.zip = new zlib.Gzip(opt.gzip);
          this.zip.on("data", (chunk) => super.write(chunk));
          this.zip.on("end", (_) => super.end());
          this.zip.on("drain", (_) => this[ONDRAIN]());
          this.on("resume", (_) => this.zip.resume());
        } else {
          this.on("drain", this[ONDRAIN]);
        }
        this.noDirRecurse = !!opt.noDirRecurse;
        this.follow = !!opt.follow;
        this.noMtime = !!opt.noMtime;
        this.mtime = opt.mtime || null;
        this.filter = typeof opt.filter === "function" ? opt.filter : (_) => true;
        this[QUEUE] = new Yallist();
        this[JOBS] = 0;
        this.jobs = +opt.jobs || 4;
        this[PROCESSING] = false;
        this[ENDED] = false;
      }
      [WRITE](chunk) {
        return super.write(chunk);
      }
      add(path4) {
        this.write(path4);
        return this;
      }
      end(path4) {
        if (path4) {
          this.write(path4);
        }
        this[ENDED] = true;
        this[PROCESS]();
        return this;
      }
      write(path4) {
        if (this[ENDED]) {
          throw new Error("write after end");
        }
        if (path4 instanceof ReadEntry) {
          this[ADDTARENTRY](path4);
        } else {
          this[ADDFSENTRY](path4);
        }
        return this.flowing;
      }
      [ADDTARENTRY](p) {
        const absolute = normPath(path3.resolve(this.cwd, p.path));
        if (!this.filter(p.path, p)) {
          p.resume();
        } else {
          const job = new PackJob(p.path, absolute, false);
          job.entry = new WriteEntryTar(p, this[ENTRYOPT](job));
          job.entry.on("end", (_) => this[JOBDONE](job));
          this[JOBS] += 1;
          this[QUEUE].push(job);
        }
        this[PROCESS]();
      }
      [ADDFSENTRY](p) {
        const absolute = normPath(path3.resolve(this.cwd, p));
        this[QUEUE].push(new PackJob(p, absolute));
        this[PROCESS]();
      }
      [STAT](job) {
        job.pending = true;
        this[JOBS] += 1;
        const stat = this.follow ? "stat" : "lstat";
        fs3[stat](job.absolute, (er, stat2) => {
          job.pending = false;
          this[JOBS] -= 1;
          if (er) {
            this.emit("error", er);
          } else {
            this[ONSTAT](job, stat2);
          }
        });
      }
      [ONSTAT](job, stat) {
        this.statCache.set(job.absolute, stat);
        job.stat = stat;
        if (!this.filter(job.path, stat)) {
          job.ignore = true;
        }
        this[PROCESS]();
      }
      [READDIR](job) {
        job.pending = true;
        this[JOBS] += 1;
        fs3.readdir(job.absolute, (er, entries) => {
          job.pending = false;
          this[JOBS] -= 1;
          if (er) {
            return this.emit("error", er);
          }
          this[ONREADDIR](job, entries);
        });
      }
      [ONREADDIR](job, entries) {
        this.readdirCache.set(job.absolute, entries);
        job.readdir = entries;
        this[PROCESS]();
      }
      [PROCESS]() {
        if (this[PROCESSING]) {
          return;
        }
        this[PROCESSING] = true;
        for (let w = this[QUEUE].head; w !== null && this[JOBS] < this.jobs; w = w.next) {
          this[PROCESSJOB](w.value);
          if (w.value.ignore) {
            const p = w.next;
            this[QUEUE].removeNode(w);
            w.next = p;
          }
        }
        this[PROCESSING] = false;
        if (this[ENDED] && !this[QUEUE].length && this[JOBS] === 0) {
          if (this.zip) {
            this.zip.end(EOF);
          } else {
            super.write(EOF);
            super.end();
          }
        }
      }
      get [CURRENT]() {
        return this[QUEUE] && this[QUEUE].head && this[QUEUE].head.value;
      }
      [JOBDONE](job) {
        this[QUEUE].shift();
        this[JOBS] -= 1;
        this[PROCESS]();
      }
      [PROCESSJOB](job) {
        if (job.pending) {
          return;
        }
        if (job.entry) {
          if (job === this[CURRENT] && !job.piped) {
            this[PIPE](job);
          }
          return;
        }
        if (!job.stat) {
          if (this.statCache.has(job.absolute)) {
            this[ONSTAT](job, this.statCache.get(job.absolute));
          } else {
            this[STAT](job);
          }
        }
        if (!job.stat) {
          return;
        }
        if (job.ignore) {
          return;
        }
        if (!this.noDirRecurse && job.stat.isDirectory() && !job.readdir) {
          if (this.readdirCache.has(job.absolute)) {
            this[ONREADDIR](job, this.readdirCache.get(job.absolute));
          } else {
            this[READDIR](job);
          }
          if (!job.readdir) {
            return;
          }
        }
        job.entry = this[ENTRY](job);
        if (!job.entry) {
          job.ignore = true;
          return;
        }
        if (job === this[CURRENT] && !job.piped) {
          this[PIPE](job);
        }
      }
      [ENTRYOPT](job) {
        return {
          onwarn: (code, msg, data) => this.warn(code, msg, data),
          noPax: this.noPax,
          cwd: this.cwd,
          absolute: job.absolute,
          preservePaths: this.preservePaths,
          maxReadSize: this.maxReadSize,
          strict: this.strict,
          portable: this.portable,
          linkCache: this.linkCache,
          statCache: this.statCache,
          noMtime: this.noMtime,
          mtime: this.mtime,
          prefix: this.prefix
        };
      }
      [ENTRY](job) {
        this[JOBS] += 1;
        try {
          return new this[WRITEENTRYCLASS](job.path, this[ENTRYOPT](job)).on("end", () => this[JOBDONE](job)).on("error", (er) => this.emit("error", er));
        } catch (er) {
          this.emit("error", er);
        }
      }
      [ONDRAIN]() {
        if (this[CURRENT] && this[CURRENT].entry) {
          this[CURRENT].entry.resume();
        }
      }
      // like .pipe() but using super, because our write() is special
      [PIPE](job) {
        job.piped = true;
        if (job.readdir) {
          job.readdir.forEach((entry) => {
            const p = job.path;
            const base = p === "./" ? "" : p.replace(/\/*$/, "/");
            this[ADDFSENTRY](base + entry);
          });
        }
        const source = job.entry;
        const zip = this.zip;
        if (zip) {
          source.on("data", (chunk) => {
            if (!zip.write(chunk)) {
              source.pause();
            }
          });
        } else {
          source.on("data", (chunk) => {
            if (!super.write(chunk)) {
              source.pause();
            }
          });
        }
      }
      pause() {
        if (this.zip) {
          this.zip.pause();
        }
        return super.pause();
      }
    });
    var PackSync = class extends Pack {
      constructor(opt) {
        super(opt);
        this[WRITEENTRYCLASS] = WriteEntrySync;
      }
      // pause/resume are no-ops in sync streams.
      pause() {
      }
      resume() {
      }
      [STAT](job) {
        const stat = this.follow ? "statSync" : "lstatSync";
        this[ONSTAT](job, fs3[stat](job.absolute));
      }
      [READDIR](job, stat) {
        this[ONREADDIR](job, fs3.readdirSync(job.absolute));
      }
      // gotta get it all in this tick
      [PIPE](job) {
        const source = job.entry;
        const zip = this.zip;
        if (job.readdir) {
          job.readdir.forEach((entry) => {
            const p = job.path;
            const base = p === "./" ? "" : p.replace(/\/*$/, "/");
            this[ADDFSENTRY](base + entry);
          });
        }
        if (zip) {
          source.on("data", (chunk) => {
            zip.write(chunk);
          });
        } else {
          source.on("data", (chunk) => {
            super[WRITE](chunk);
          });
        }
      }
    };
    Pack.Sync = PackSync;
    module2.exports = Pack;
  }
});

// node_modules/fs-minipass/node_modules/minipass/index.js
var require_minipass3 = __commonJS({
  "node_modules/fs-minipass/node_modules/minipass/index.js"(exports, module2) {
    "use strict";
    var proc = typeof process === "object" && process ? process : {
      stdout: null,
      stderr: null
    };
    var EE = require("events");
    var Stream = require("stream");
    var SD = require("string_decoder").StringDecoder;
    var EOF = Symbol("EOF");
    var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
    var EMITTED_END = Symbol("emittedEnd");
    var EMITTING_END = Symbol("emittingEnd");
    var EMITTED_ERROR = Symbol("emittedError");
    var CLOSED = Symbol("closed");
    var READ = Symbol("read");
    var FLUSH = Symbol("flush");
    var FLUSHCHUNK = Symbol("flushChunk");
    var ENCODING = Symbol("encoding");
    var DECODER = Symbol("decoder");
    var FLOWING = Symbol("flowing");
    var PAUSED = Symbol("paused");
    var RESUME = Symbol("resume");
    var BUFFERLENGTH = Symbol("bufferLength");
    var BUFFERPUSH = Symbol("bufferPush");
    var BUFFERSHIFT = Symbol("bufferShift");
    var OBJECTMODE = Symbol("objectMode");
    var DESTROYED = Symbol("destroyed");
    var EMITDATA = Symbol("emitData");
    var EMITEND = Symbol("emitEnd");
    var EMITEND2 = Symbol("emitEnd2");
    var ASYNC = Symbol("async");
    var defer = (fn) => Promise.resolve().then(fn);
    var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
    var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
    var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
    var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
    var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
    var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
    var Pipe = class {
      constructor(src, dest, opts) {
        this.src = src;
        this.dest = dest;
        this.opts = opts;
        this.ondrain = () => src[RESUME]();
        dest.on("drain", this.ondrain);
      }
      unpipe() {
        this.dest.removeListener("drain", this.ondrain);
      }
      // istanbul ignore next - only here for the prototype
      proxyErrors() {
      }
      end() {
        this.unpipe();
        if (this.opts.end)
          this.dest.end();
      }
    };
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
    module2.exports = class Minipass extends Stream {
      constructor(options) {
        super();
        this[FLOWING] = false;
        this[PAUSED] = false;
        this.pipes = [];
        this.buffer = [];
        this[OBJECTMODE] = options && options.objectMode || false;
        if (this[OBJECTMODE])
          this[ENCODING] = null;
        else
          this[ENCODING] = options && options.encoding || null;
        if (this[ENCODING] === "buffer")
          this[ENCODING] = null;
        this[ASYNC] = options && !!options.async || false;
        this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
        this[EOF] = false;
        this[EMITTED_END] = false;
        this[EMITTING_END] = false;
        this[CLOSED] = false;
        this[EMITTED_ERROR] = null;
        this.writable = true;
        this.readable = true;
        this[BUFFERLENGTH] = 0;
        this[DESTROYED] = false;
      }
      get bufferLength() {
        return this[BUFFERLENGTH];
      }
      get encoding() {
        return this[ENCODING];
      }
      set encoding(enc) {
        if (this[OBJECTMODE])
          throw new Error("cannot set encoding in objectMode");
        if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
          throw new Error("cannot change encoding");
        if (this[ENCODING] !== enc) {
          this[DECODER] = enc ? new SD(enc) : null;
          if (this.buffer.length)
            this.buffer = this.buffer.map((chunk) => this[DECODER].write(chunk));
        }
        this[ENCODING] = enc;
      }
      setEncoding(enc) {
        this.encoding = enc;
      }
      get objectMode() {
        return this[OBJECTMODE];
      }
      set objectMode(om) {
        this[OBJECTMODE] = this[OBJECTMODE] || !!om;
      }
      get ["async"]() {
        return this[ASYNC];
      }
      set ["async"](a) {
        this[ASYNC] = this[ASYNC] || !!a;
      }
      write(chunk, encoding, cb) {
        if (this[EOF])
          throw new Error("write after end");
        if (this[DESTROYED]) {
          this.emit("error", Object.assign(
            new Error("Cannot call write after a stream was destroyed"),
            { code: "ERR_STREAM_DESTROYED" }
          ));
          return true;
        }
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (!encoding)
          encoding = "utf8";
        const fn = this[ASYNC] ? defer : (f) => f();
        if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
          if (isArrayBufferView(chunk))
            chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
          else if (isArrayBuffer(chunk))
            chunk = Buffer.from(chunk);
          else if (typeof chunk !== "string")
            this.objectMode = true;
        }
        if (this[OBJECTMODE]) {
          if (this.flowing && this[BUFFERLENGTH] !== 0)
            this[FLUSH](true);
          if (this.flowing)
            this.emit("data", chunk);
          else
            this[BUFFERPUSH](chunk);
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (!chunk.length) {
          if (this[BUFFERLENGTH] !== 0)
            this.emit("readable");
          if (cb)
            fn(cb);
          return this.flowing;
        }
        if (typeof chunk === "string" && // unless it is a string already ready for us to use
        !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
          chunk = Buffer.from(chunk, encoding);
        }
        if (Buffer.isBuffer(chunk) && this[ENCODING])
          chunk = this[DECODER].write(chunk);
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      read(n) {
        if (this[DESTROYED])
          return null;
        if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
          this[MAYBE_EMIT_END]();
          return null;
        }
        if (this[OBJECTMODE])
          n = null;
        if (this.buffer.length > 1 && !this[OBJECTMODE]) {
          if (this.encoding)
            this.buffer = [this.buffer.join("")];
          else
            this.buffer = [Buffer.concat(this.buffer, this[BUFFERLENGTH])];
        }
        const ret = this[READ](n || null, this.buffer[0]);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [READ](n, chunk) {
        if (n === chunk.length || n === null)
          this[BUFFERSHIFT]();
        else {
          this.buffer[0] = chunk.slice(n);
          chunk = chunk.slice(0, n);
          this[BUFFERLENGTH] -= n;
        }
        this.emit("data", chunk);
        if (!this.buffer.length && !this[EOF])
          this.emit("drain");
        return chunk;
      }
      end(chunk, encoding, cb) {
        if (typeof chunk === "function")
          cb = chunk, chunk = null;
        if (typeof encoding === "function")
          cb = encoding, encoding = "utf8";
        if (chunk)
          this.write(chunk, encoding);
        if (cb)
          this.once("end", cb);
        this[EOF] = true;
        this.writable = false;
        if (this.flowing || !this[PAUSED])
          this[MAYBE_EMIT_END]();
        return this;
      }
      // don't let the internal resume be overwritten
      [RESUME]() {
        if (this[DESTROYED])
          return;
        this[PAUSED] = false;
        this[FLOWING] = true;
        this.emit("resume");
        if (this.buffer.length)
          this[FLUSH]();
        else if (this[EOF])
          this[MAYBE_EMIT_END]();
        else
          this.emit("drain");
      }
      resume() {
        return this[RESUME]();
      }
      pause() {
        this[FLOWING] = false;
        this[PAUSED] = true;
      }
      get destroyed() {
        return this[DESTROYED];
      }
      get flowing() {
        return this[FLOWING];
      }
      get paused() {
        return this[PAUSED];
      }
      [BUFFERPUSH](chunk) {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] += 1;
        else
          this[BUFFERLENGTH] += chunk.length;
        this.buffer.push(chunk);
      }
      [BUFFERSHIFT]() {
        if (this.buffer.length) {
          if (this[OBJECTMODE])
            this[BUFFERLENGTH] -= 1;
          else
            this[BUFFERLENGTH] -= this.buffer[0].length;
        }
        return this.buffer.shift();
      }
      [FLUSH](noDrain) {
        do {
        } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
        if (!noDrain && !this.buffer.length && !this[EOF])
          this.emit("drain");
      }
      [FLUSHCHUNK](chunk) {
        return chunk ? (this.emit("data", chunk), this.flowing) : false;
      }
      pipe(dest, opts) {
        if (this[DESTROYED])
          return;
        const ended = this[EMITTED_END];
        opts = opts || {};
        if (dest === proc.stdout || dest === proc.stderr)
          opts.end = false;
        else
          opts.end = opts.end !== false;
        opts.proxyErrors = !!opts.proxyErrors;
        if (ended) {
          if (opts.end)
            dest.end();
        } else {
          this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
          if (this[ASYNC])
            defer(() => this[RESUME]());
          else
            this[RESUME]();
        }
        return dest;
      }
      unpipe(dest) {
        const p = this.pipes.find((p2) => p2.dest === dest);
        if (p) {
          this.pipes.splice(this.pipes.indexOf(p), 1);
          p.unpipe();
        }
      }
      addListener(ev, fn) {
        return this.on(ev, fn);
      }
      on(ev, fn) {
        const ret = super.on(ev, fn);
        if (ev === "data" && !this.pipes.length && !this.flowing)
          this[RESUME]();
        else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
          super.emit("readable");
        else if (isEndish(ev) && this[EMITTED_END]) {
          super.emit(ev);
          this.removeAllListeners(ev);
        } else if (ev === "error" && this[EMITTED_ERROR]) {
          if (this[ASYNC])
            defer(() => fn.call(this, this[EMITTED_ERROR]));
          else
            fn.call(this, this[EMITTED_ERROR]);
        }
        return ret;
      }
      get emittedEnd() {
        return this[EMITTED_END];
      }
      [MAYBE_EMIT_END]() {
        if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
          this[EMITTING_END] = true;
          this.emit("end");
          this.emit("prefinish");
          this.emit("finish");
          if (this[CLOSED])
            this.emit("close");
          this[EMITTING_END] = false;
        }
      }
      emit(ev, data, ...extra) {
        if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
          return;
        else if (ev === "data") {
          return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
        } else if (ev === "end") {
          return this[EMITEND]();
        } else if (ev === "close") {
          this[CLOSED] = true;
          if (!this[EMITTED_END] && !this[DESTROYED])
            return;
          const ret2 = super.emit("close");
          this.removeAllListeners("close");
          return ret2;
        } else if (ev === "error") {
          this[EMITTED_ERROR] = data;
          const ret2 = super.emit("error", data);
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "resume") {
          const ret2 = super.emit("resume");
          this[MAYBE_EMIT_END]();
          return ret2;
        } else if (ev === "finish" || ev === "prefinish") {
          const ret2 = super.emit(ev);
          this.removeAllListeners(ev);
          return ret2;
        }
        const ret = super.emit(ev, data, ...extra);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITDATA](data) {
        for (const p of this.pipes) {
          if (p.dest.write(data) === false)
            this.pause();
        }
        const ret = super.emit("data", data);
        this[MAYBE_EMIT_END]();
        return ret;
      }
      [EMITEND]() {
        if (this[EMITTED_END])
          return;
        this[EMITTED_END] = true;
        this.readable = false;
        if (this[ASYNC])
          defer(() => this[EMITEND2]());
        else
          this[EMITEND2]();
      }
      [EMITEND2]() {
        if (this[DECODER]) {
          const data = this[DECODER].end();
          if (data) {
            for (const p of this.pipes) {
              p.dest.write(data);
            }
            super.emit("data", data);
          }
        }
        for (const p of this.pipes) {
          p.end();
        }
        const ret = super.emit("end");
        this.removeAllListeners("end");
        return ret;
      }
      // const all = await stream.collect()
      collect() {
        const buf = [];
        if (!this[OBJECTMODE])
          buf.dataLength = 0;
        const p = this.promise();
        this.on("data", (c) => {
          buf.push(c);
          if (!this[OBJECTMODE])
            buf.dataLength += c.length;
        });
        return p.then(() => buf);
      }
      // const data = await stream.concat()
      concat() {
        return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
      }
      // stream.promise().then(() => done, er => emitted error)
      promise() {
        return new Promise((resolve, reject) => {
          this.on(DESTROYED, () => reject(new Error("stream destroyed")));
          this.on("error", (er) => reject(er));
          this.on("end", () => resolve());
        });
      }
      // for await (let chunk of stream)
      [ASYNCITERATOR]() {
        const next = () => {
          const res = this.read();
          if (res !== null)
            return Promise.resolve({ done: false, value: res });
          if (this[EOF])
            return Promise.resolve({ done: true });
          let resolve = null;
          let reject = null;
          const onerr = (er) => {
            this.removeListener("data", ondata);
            this.removeListener("end", onend);
            reject(er);
          };
          const ondata = (value) => {
            this.removeListener("error", onerr);
            this.removeListener("end", onend);
            this.pause();
            resolve({ value, done: !!this[EOF] });
          };
          const onend = () => {
            this.removeListener("error", onerr);
            this.removeListener("data", ondata);
            resolve({ done: true });
          };
          const ondestroy = () => onerr(new Error("stream destroyed"));
          return new Promise((res2, rej) => {
            reject = rej;
            resolve = res2;
            this.once(DESTROYED, ondestroy);
            this.once("error", onerr);
            this.once("end", onend);
            this.once("data", ondata);
          });
        };
        return { next };
      }
      // for (let chunk of stream)
      [ITERATOR]() {
        const next = () => {
          const value = this.read();
          const done = value === null;
          return { value, done };
        };
        return { next };
      }
      destroy(er) {
        if (this[DESTROYED]) {
          if (er)
            this.emit("error", er);
          else
            this.emit(DESTROYED);
          return this;
        }
        this[DESTROYED] = true;
        this.buffer.length = 0;
        this[BUFFERLENGTH] = 0;
        if (typeof this.close === "function" && !this[CLOSED])
          this.close();
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      static isStream(s) {
        return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || // readable
        typeof s.write === "function" && typeof s.end === "function"));
      }
    };
  }
});

// node_modules/fs-minipass/index.js
var require_fs_minipass = __commonJS({
  "node_modules/fs-minipass/index.js"(exports) {
    "use strict";
    var MiniPass = require_minipass3();
    var EE = require("events").EventEmitter;
    var fs3 = require("fs");
    var writev = fs3.writev;
    if (!writev) {
      const binding = process.binding("fs");
      const FSReqWrap = binding.FSReqWrap || binding.FSReqCallback;
      writev = (fd, iovec, pos, cb) => {
        const done = (er, bw) => cb(er, bw, iovec);
        const req = new FSReqWrap();
        req.oncomplete = done;
        binding.writeBuffers(fd, iovec, pos, req);
      };
    }
    var _autoClose = Symbol("_autoClose");
    var _close = Symbol("_close");
    var _ended = Symbol("_ended");
    var _fd = Symbol("_fd");
    var _finished = Symbol("_finished");
    var _flags = Symbol("_flags");
    var _flush = Symbol("_flush");
    var _handleChunk = Symbol("_handleChunk");
    var _makeBuf = Symbol("_makeBuf");
    var _mode = Symbol("_mode");
    var _needDrain = Symbol("_needDrain");
    var _onerror = Symbol("_onerror");
    var _onopen = Symbol("_onopen");
    var _onread = Symbol("_onread");
    var _onwrite = Symbol("_onwrite");
    var _open = Symbol("_open");
    var _path = Symbol("_path");
    var _pos = Symbol("_pos");
    var _queue = Symbol("_queue");
    var _read = Symbol("_read");
    var _readSize = Symbol("_readSize");
    var _reading = Symbol("_reading");
    var _remain = Symbol("_remain");
    var _size = Symbol("_size");
    var _write = Symbol("_write");
    var _writing = Symbol("_writing");
    var _defaultFlag = Symbol("_defaultFlag");
    var _errored = Symbol("_errored");
    var ReadStream = class extends MiniPass {
      constructor(path3, opt) {
        opt = opt || {};
        super(opt);
        this.readable = true;
        this.writable = false;
        if (typeof path3 !== "string")
          throw new TypeError("path must be a string");
        this[_errored] = false;
        this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
        this[_path] = path3;
        this[_readSize] = opt.readSize || 16 * 1024 * 1024;
        this[_reading] = false;
        this[_size] = typeof opt.size === "number" ? opt.size : Infinity;
        this[_remain] = this[_size];
        this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
        if (typeof this[_fd] === "number")
          this[_read]();
        else
          this[_open]();
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
        fs3.open(this[_path], "r", (er, fd) => this[_onopen](er, fd));
      }
      [_onopen](er, fd) {
        if (er)
          this[_onerror](er);
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
          if (buf.length === 0)
            return process.nextTick(() => this[_onread](null, 0, buf));
          fs3.read(this[_fd], buf, 0, buf.length, null, (er, br, buf2) => this[_onread](er, br, buf2));
        }
      }
      [_onread](er, br, buf) {
        this[_reading] = false;
        if (er)
          this[_onerror](er);
        else if (this[_handleChunk](br, buf))
          this[_read]();
      }
      [_close]() {
        if (this[_autoClose] && typeof this[_fd] === "number") {
          const fd = this[_fd];
          this[_fd] = null;
          fs3.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
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
        if (br > 0)
          ret = super.write(br < buf.length ? buf.slice(0, br) : buf);
        if (br === 0 || this[_remain] <= 0) {
          ret = false;
          this[_close]();
          super.end();
        }
        return ret;
      }
      emit(ev, data) {
        switch (ev) {
          case "prefinish":
          case "finish":
            break;
          case "drain":
            if (typeof this[_fd] === "number")
              this[_read]();
            break;
          case "error":
            if (this[_errored])
              return;
            this[_errored] = true;
            return super.emit(ev, data);
          default:
            return super.emit(ev, data);
        }
      }
    };
    var ReadStreamSync = class extends ReadStream {
      [_open]() {
        let threw = true;
        try {
          this[_onopen](null, fs3.openSync(this[_path], "r"));
          threw = false;
        } finally {
          if (threw)
            this[_close]();
        }
      }
      [_read]() {
        let threw = true;
        try {
          if (!this[_reading]) {
            this[_reading] = true;
            do {
              const buf = this[_makeBuf]();
              const br = buf.length === 0 ? 0 : fs3.readSync(this[_fd], buf, 0, buf.length, null);
              if (!this[_handleChunk](br, buf))
                break;
            } while (true);
            this[_reading] = false;
          }
          threw = false;
        } finally {
          if (threw)
            this[_close]();
        }
      }
      [_close]() {
        if (this[_autoClose] && typeof this[_fd] === "number") {
          const fd = this[_fd];
          this[_fd] = null;
          fs3.closeSync(fd);
          this.emit("close");
        }
      }
    };
    var WriteStream = class extends EE {
      constructor(path3, opt) {
        opt = opt || {};
        super(opt);
        this.readable = false;
        this.writable = true;
        this[_errored] = false;
        this[_writing] = false;
        this[_ended] = false;
        this[_needDrain] = false;
        this[_queue] = [];
        this[_path] = path3;
        this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
        this[_mode] = opt.mode === void 0 ? 438 : opt.mode;
        this[_pos] = typeof opt.start === "number" ? opt.start : null;
        this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
        const defaultFlag = this[_pos] !== null ? "r+" : "w";
        this[_defaultFlag] = opt.flags === void 0;
        this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags;
        if (this[_fd] === null)
          this[_open]();
      }
      emit(ev, data) {
        if (ev === "error") {
          if (this[_errored])
            return;
          this[_errored] = true;
        }
        return super.emit(ev, data);
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
        fs3.open(
          this[_path],
          this[_flags],
          this[_mode],
          (er, fd) => this[_onopen](er, fd)
        );
      }
      [_onopen](er, fd) {
        if (this[_defaultFlag] && this[_flags] === "r+" && er && er.code === "ENOENT") {
          this[_flags] = "w";
          this[_open]();
        } else if (er)
          this[_onerror](er);
        else {
          this[_fd] = fd;
          this.emit("open", fd);
          this[_flush]();
        }
      }
      end(buf, enc) {
        if (buf)
          this.write(buf, enc);
        this[_ended] = true;
        if (!this[_writing] && !this[_queue].length && typeof this[_fd] === "number")
          this[_onwrite](null, 0);
        return this;
      }
      write(buf, enc) {
        if (typeof buf === "string")
          buf = Buffer.from(buf, enc);
        if (this[_ended]) {
          this.emit("error", new Error("write() after end()"));
          return false;
        }
        if (this[_fd] === null || this[_writing] || this[_queue].length) {
          this[_queue].push(buf);
          this[_needDrain] = true;
          return false;
        }
        this[_writing] = true;
        this[_write](buf);
        return true;
      }
      [_write](buf) {
        fs3.write(this[_fd], buf, 0, buf.length, this[_pos], (er, bw) => this[_onwrite](er, bw));
      }
      [_onwrite](er, bw) {
        if (er)
          this[_onerror](er);
        else {
          if (this[_pos] !== null)
            this[_pos] += bw;
          if (this[_queue].length)
            this[_flush]();
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
          if (this[_ended])
            this[_onwrite](null, 0);
        } else if (this[_queue].length === 1)
          this[_write](this[_queue].pop());
        else {
          const iovec = this[_queue];
          this[_queue] = [];
          writev(
            this[_fd],
            iovec,
            this[_pos],
            (er, bw) => this[_onwrite](er, bw)
          );
        }
      }
      [_close]() {
        if (this[_autoClose] && typeof this[_fd] === "number") {
          const fd = this[_fd];
          this[_fd] = null;
          fs3.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
        }
      }
    };
    var WriteStreamSync = class extends WriteStream {
      [_open]() {
        let fd;
        if (this[_defaultFlag] && this[_flags] === "r+") {
          try {
            fd = fs3.openSync(this[_path], this[_flags], this[_mode]);
          } catch (er) {
            if (er.code === "ENOENT") {
              this[_flags] = "w";
              return this[_open]();
            } else
              throw er;
          }
        } else
          fd = fs3.openSync(this[_path], this[_flags], this[_mode]);
        this[_onopen](null, fd);
      }
      [_close]() {
        if (this[_autoClose] && typeof this[_fd] === "number") {
          const fd = this[_fd];
          this[_fd] = null;
          fs3.closeSync(fd);
          this.emit("close");
        }
      }
      [_write](buf) {
        let threw = true;
        try {
          this[_onwrite](
            null,
            fs3.writeSync(this[_fd], buf, 0, buf.length, this[_pos])
          );
          threw = false;
        } finally {
          if (threw)
            try {
              this[_close]();
            } catch (_) {
            }
        }
      }
    };
    exports.ReadStream = ReadStream;
    exports.ReadStreamSync = ReadStreamSync;
    exports.WriteStream = WriteStream;
    exports.WriteStreamSync = WriteStreamSync;
  }
});

// node_modules/tar/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/tar/lib/parse.js"(exports, module2) {
    "use strict";
    var warner = require_warn_mixin();
    var Header = require_header();
    var EE = require("events");
    var Yallist = require_yallist();
    var maxMetaEntrySize = 1024 * 1024;
    var Entry = require_read_entry();
    var Pax = require_pax();
    var zlib = require_minizlib();
    var { nextTick } = require("process");
    var gzipHeader = Buffer.from([31, 139]);
    var STATE = Symbol("state");
    var WRITEENTRY = Symbol("writeEntry");
    var READENTRY = Symbol("readEntry");
    var NEXTENTRY = Symbol("nextEntry");
    var PROCESSENTRY = Symbol("processEntry");
    var EX = Symbol("extendedHeader");
    var GEX = Symbol("globalExtendedHeader");
    var META = Symbol("meta");
    var EMITMETA = Symbol("emitMeta");
    var BUFFER = Symbol("buffer");
    var QUEUE = Symbol("queue");
    var ENDED = Symbol("ended");
    var EMITTEDEND = Symbol("emittedEnd");
    var EMIT = Symbol("emit");
    var UNZIP = Symbol("unzip");
    var CONSUMECHUNK = Symbol("consumeChunk");
    var CONSUMECHUNKSUB = Symbol("consumeChunkSub");
    var CONSUMEBODY = Symbol("consumeBody");
    var CONSUMEMETA = Symbol("consumeMeta");
    var CONSUMEHEADER = Symbol("consumeHeader");
    var CONSUMING = Symbol("consuming");
    var BUFFERCONCAT = Symbol("bufferConcat");
    var MAYBEEND = Symbol("maybeEnd");
    var WRITING = Symbol("writing");
    var ABORTED = Symbol("aborted");
    var DONE = Symbol("onDone");
    var SAW_VALID_ENTRY = Symbol("sawValidEntry");
    var SAW_NULL_BLOCK = Symbol("sawNullBlock");
    var SAW_EOF = Symbol("sawEOF");
    var CLOSESTREAM = Symbol("closeStream");
    var noop = (_) => true;
    module2.exports = warner(class Parser extends EE {
      constructor(opt) {
        opt = opt || {};
        super(opt);
        this.file = opt.file || "";
        this[SAW_VALID_ENTRY] = null;
        this.on(DONE, (_) => {
          if (this[STATE] === "begin" || this[SAW_VALID_ENTRY] === false) {
            this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
          }
        });
        if (opt.ondone) {
          this.on(DONE, opt.ondone);
        } else {
          this.on(DONE, (_) => {
            this.emit("prefinish");
            this.emit("finish");
            this.emit("end");
          });
        }
        this.strict = !!opt.strict;
        this.maxMetaEntrySize = opt.maxMetaEntrySize || maxMetaEntrySize;
        this.filter = typeof opt.filter === "function" ? opt.filter : noop;
        this.writable = true;
        this.readable = false;
        this[QUEUE] = new Yallist();
        this[BUFFER] = null;
        this[READENTRY] = null;
        this[WRITEENTRY] = null;
        this[STATE] = "begin";
        this[META] = "";
        this[EX] = null;
        this[GEX] = null;
        this[ENDED] = false;
        this[UNZIP] = null;
        this[ABORTED] = false;
        this[SAW_NULL_BLOCK] = false;
        this[SAW_EOF] = false;
        this.on("end", () => this[CLOSESTREAM]());
        if (typeof opt.onwarn === "function") {
          this.on("warn", opt.onwarn);
        }
        if (typeof opt.onentry === "function") {
          this.on("entry", opt.onentry);
        }
      }
      [CONSUMEHEADER](chunk, position) {
        if (this[SAW_VALID_ENTRY] === null) {
          this[SAW_VALID_ENTRY] = false;
        }
        let header;
        try {
          header = new Header(chunk, position, this[EX], this[GEX]);
        } catch (er) {
          return this.warn("TAR_ENTRY_INVALID", er);
        }
        if (header.nullBlock) {
          if (this[SAW_NULL_BLOCK]) {
            this[SAW_EOF] = true;
            if (this[STATE] === "begin") {
              this[STATE] = "header";
            }
            this[EMIT]("eof");
          } else {
            this[SAW_NULL_BLOCK] = true;
            this[EMIT]("nullBlock");
          }
        } else {
          this[SAW_NULL_BLOCK] = false;
          if (!header.cksumValid) {
            this.warn("TAR_ENTRY_INVALID", "checksum failure", { header });
          } else if (!header.path) {
            this.warn("TAR_ENTRY_INVALID", "path is required", { header });
          } else {
            const type = header.type;
            if (/^(Symbolic)?Link$/.test(type) && !header.linkpath) {
              this.warn("TAR_ENTRY_INVALID", "linkpath required", { header });
            } else if (!/^(Symbolic)?Link$/.test(type) && header.linkpath) {
              this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header });
            } else {
              const entry = this[WRITEENTRY] = new Entry(header, this[EX], this[GEX]);
              if (!this[SAW_VALID_ENTRY]) {
                if (entry.remain) {
                  const onend = () => {
                    if (!entry.invalid) {
                      this[SAW_VALID_ENTRY] = true;
                    }
                  };
                  entry.on("end", onend);
                } else {
                  this[SAW_VALID_ENTRY] = true;
                }
              }
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
                this[EX] = null;
                entry.ignore = entry.ignore || !this.filter(entry.path, entry);
                if (entry.ignore) {
                  this[EMIT]("ignoredEntry", entry);
                  this[STATE] = entry.remain ? "ignore" : "header";
                  entry.resume();
                } else {
                  if (entry.remain) {
                    this[STATE] = "body";
                  } else {
                    this[STATE] = "header";
                    entry.end();
                  }
                  if (!this[READENTRY]) {
                    this[QUEUE].push(entry);
                    this[NEXTENTRY]();
                  } else {
                    this[QUEUE].push(entry);
                  }
                }
              }
            }
          }
        }
      }
      [CLOSESTREAM]() {
        nextTick(() => this.emit("close"));
      }
      [PROCESSENTRY](entry) {
        let go = true;
        if (!entry) {
          this[READENTRY] = null;
          go = false;
        } else if (Array.isArray(entry)) {
          this.emit.apply(this, entry);
        } else {
          this[READENTRY] = entry;
          this.emit("entry", entry);
          if (!entry.emittedEnd) {
            entry.on("end", (_) => this[NEXTENTRY]());
            go = false;
          }
        }
        return go;
      }
      [NEXTENTRY]() {
        do {
        } while (this[PROCESSENTRY](this[QUEUE].shift()));
        if (!this[QUEUE].length) {
          const re = this[READENTRY];
          const drainNow = !re || re.flowing || re.size === re.remain;
          if (drainNow) {
            if (!this[WRITING]) {
              this.emit("drain");
            }
          } else {
            re.once("drain", (_) => this.emit("drain"));
          }
        }
      }
      [CONSUMEBODY](chunk, position) {
        const entry = this[WRITEENTRY];
        const br = entry.blockRemain;
        const c = br >= chunk.length && position === 0 ? chunk : chunk.slice(position, position + br);
        entry.write(c);
        if (!entry.blockRemain) {
          this[STATE] = "header";
          this[WRITEENTRY] = null;
          entry.end();
        }
        return c.length;
      }
      [CONSUMEMETA](chunk, position) {
        const entry = this[WRITEENTRY];
        const ret = this[CONSUMEBODY](chunk, position);
        if (!this[WRITEENTRY]) {
          this[EMITMETA](entry);
        }
        return ret;
      }
      [EMIT](ev, data, extra) {
        if (!this[QUEUE].length && !this[READENTRY]) {
          this.emit(ev, data, extra);
        } else {
          this[QUEUE].push([ev, data, extra]);
        }
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
          case "OldGnuLongPath":
            this[EX] = this[EX] || /* @__PURE__ */ Object.create(null);
            this[EX].path = this[META].replace(/\0.*/, "");
            break;
          case "NextFileHasLongLinkpath":
            this[EX] = this[EX] || /* @__PURE__ */ Object.create(null);
            this[EX].linkpath = this[META].replace(/\0.*/, "");
            break;
          default:
            throw new Error("unknown meta: " + entry.type);
        }
      }
      abort(error) {
        this[ABORTED] = true;
        this.emit("abort", error);
        this.warn("TAR_ABORT", error, { recoverable: false });
      }
      write(chunk) {
        if (this[ABORTED]) {
          return;
        }
        if (this[UNZIP] === null && chunk) {
          if (this[BUFFER]) {
            chunk = Buffer.concat([this[BUFFER], chunk]);
            this[BUFFER] = null;
          }
          if (chunk.length < gzipHeader.length) {
            this[BUFFER] = chunk;
            return true;
          }
          for (let i = 0; this[UNZIP] === null && i < gzipHeader.length; i++) {
            if (chunk[i] !== gzipHeader[i]) {
              this[UNZIP] = false;
            }
          }
          if (this[UNZIP] === null) {
            const ended = this[ENDED];
            this[ENDED] = false;
            this[UNZIP] = new zlib.Unzip();
            this[UNZIP].on("data", (chunk2) => this[CONSUMECHUNK](chunk2));
            this[UNZIP].on("error", (er) => this.abort(er));
            this[UNZIP].on("end", (_) => {
              this[ENDED] = true;
              this[CONSUMECHUNK]();
            });
            this[WRITING] = true;
            const ret2 = this[UNZIP][ended ? "end" : "write"](chunk);
            this[WRITING] = false;
            return ret2;
          }
        }
        this[WRITING] = true;
        if (this[UNZIP]) {
          this[UNZIP].write(chunk);
        } else {
          this[CONSUMECHUNK](chunk);
        }
        this[WRITING] = false;
        const ret = this[QUEUE].length ? false : this[READENTRY] ? this[READENTRY].flowing : true;
        if (!ret && !this[QUEUE].length) {
          this[READENTRY].once("drain", (_) => this.emit("drain"));
        }
        return ret;
      }
      [BUFFERCONCAT](c) {
        if (c && !this[ABORTED]) {
          this[BUFFER] = this[BUFFER] ? Buffer.concat([this[BUFFER], c]) : c;
        }
      }
      [MAYBEEND]() {
        if (this[ENDED] && !this[EMITTEDEND] && !this[ABORTED] && !this[CONSUMING]) {
          this[EMITTEDEND] = true;
          const entry = this[WRITEENTRY];
          if (entry && entry.blockRemain) {
            const have = this[BUFFER] ? this[BUFFER].length : 0;
            this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${entry.blockRemain} more bytes, only ${have} available)`, { entry });
            if (this[BUFFER]) {
              entry.write(this[BUFFER]);
            }
            entry.end();
          }
          this[EMIT](DONE);
        }
      }
      [CONSUMECHUNK](chunk) {
        if (this[CONSUMING]) {
          this[BUFFERCONCAT](chunk);
        } else if (!chunk && !this[BUFFER]) {
          this[MAYBEEND]();
        } else {
          this[CONSUMING] = true;
          if (this[BUFFER]) {
            this[BUFFERCONCAT](chunk);
            const c = this[BUFFER];
            this[BUFFER] = null;
            this[CONSUMECHUNKSUB](c);
          } else {
            this[CONSUMECHUNKSUB](chunk);
          }
          while (this[BUFFER] && this[BUFFER].length >= 512 && !this[ABORTED] && !this[SAW_EOF]) {
            const c = this[BUFFER];
            this[BUFFER] = null;
            this[CONSUMECHUNKSUB](c);
          }
          this[CONSUMING] = false;
        }
        if (!this[BUFFER] || this[ENDED]) {
          this[MAYBEEND]();
        }
      }
      [CONSUMECHUNKSUB](chunk) {
        let position = 0;
        const length = chunk.length;
        while (position + 512 <= length && !this[ABORTED] && !this[SAW_EOF]) {
          switch (this[STATE]) {
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
            default:
              throw new Error("invalid state: " + this[STATE]);
          }
        }
        if (position < length) {
          if (this[BUFFER]) {
            this[BUFFER] = Buffer.concat([chunk.slice(position), this[BUFFER]]);
          } else {
            this[BUFFER] = chunk.slice(position);
          }
        }
      }
      end(chunk) {
        if (!this[ABORTED]) {
          if (this[UNZIP]) {
            this[UNZIP].end(chunk);
          } else {
            this[ENDED] = true;
            this.write(chunk);
          }
        }
      }
    });
  }
});

// node_modules/tar/lib/list.js
var require_list = __commonJS({
  "node_modules/tar/lib/list.js"(exports, module2) {
    "use strict";
    var hlo = require_high_level_opt();
    var Parser = require_parse2();
    var fs3 = require("fs");
    var fsm = require_fs_minipass();
    var path3 = require("path");
    var stripSlash = require_strip_trailing_slashes();
    module2.exports = (opt_, files, cb) => {
      if (typeof opt_ === "function") {
        cb = opt_, files = null, opt_ = {};
      } else if (Array.isArray(opt_)) {
        files = opt_, opt_ = {};
      }
      if (typeof files === "function") {
        cb = files, files = null;
      }
      if (!files) {
        files = [];
      } else {
        files = Array.from(files);
      }
      const opt = hlo(opt_);
      if (opt.sync && typeof cb === "function") {
        throw new TypeError("callback not supported for sync tar functions");
      }
      if (!opt.file && typeof cb === "function") {
        throw new TypeError("callback only supported with file option");
      }
      if (files.length) {
        filesFilter(opt, files);
      }
      if (!opt.noResume) {
        onentryFunction(opt);
      }
      return opt.file && opt.sync ? listFileSync(opt) : opt.file ? listFile(opt, cb) : list(opt);
    };
    var onentryFunction = (opt) => {
      const onentry = opt.onentry;
      opt.onentry = onentry ? (e) => {
        onentry(e);
        e.resume();
      } : (e) => e.resume();
    };
    var filesFilter = (opt, files) => {
      const map = new Map(files.map((f) => [stripSlash(f), true]));
      const filter = opt.filter;
      const mapHas = (file, r) => {
        const root = r || path3.parse(file).root || ".";
        const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path3.dirname(file), root);
        map.set(file, ret);
        return ret;
      };
      opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : (file) => mapHas(stripSlash(file));
    };
    var listFileSync = (opt) => {
      const p = list(opt);
      const file = opt.file;
      let threw = true;
      let fd;
      try {
        const stat = fs3.statSync(file);
        const readSize = opt.maxReadSize || 16 * 1024 * 1024;
        if (stat.size < readSize) {
          p.end(fs3.readFileSync(file));
        } else {
          let pos = 0;
          const buf = Buffer.allocUnsafe(readSize);
          fd = fs3.openSync(file, "r");
          while (pos < stat.size) {
            const bytesRead = fs3.readSync(fd, buf, 0, readSize, pos);
            pos += bytesRead;
            p.write(buf.slice(0, bytesRead));
          }
          p.end();
        }
        threw = false;
      } finally {
        if (threw && fd) {
          try {
            fs3.closeSync(fd);
          } catch (er) {
          }
        }
      }
    };
    var listFile = (opt, cb) => {
      const parse2 = new Parser(opt);
      const readSize = opt.maxReadSize || 16 * 1024 * 1024;
      const file = opt.file;
      const p = new Promise((resolve, reject) => {
        parse2.on("error", reject);
        parse2.on("end", resolve);
        fs3.stat(file, (er, stat) => {
          if (er) {
            reject(er);
          } else {
            const stream = new fsm.ReadStream(file, {
              readSize,
              size: stat.size
            });
            stream.on("error", reject);
            stream.pipe(parse2);
          }
        });
      });
      return cb ? p.then(cb, cb) : p;
    };
    var list = (opt) => new Parser(opt);
  }
});

// node_modules/tar/lib/create.js
var require_create = __commonJS({
  "node_modules/tar/lib/create.js"(exports, module2) {
    "use strict";
    var hlo = require_high_level_opt();
    var Pack = require_pack();
    var fsm = require_fs_minipass();
    var t = require_list();
    var path3 = require("path");
    module2.exports = (opt_, files, cb) => {
      if (typeof files === "function") {
        cb = files;
      }
      if (Array.isArray(opt_)) {
        files = opt_, opt_ = {};
      }
      if (!files || !Array.isArray(files) || !files.length) {
        throw new TypeError("no files or directories specified");
      }
      files = Array.from(files);
      const opt = hlo(opt_);
      if (opt.sync && typeof cb === "function") {
        throw new TypeError("callback not supported for sync tar functions");
      }
      if (!opt.file && typeof cb === "function") {
        throw new TypeError("callback only supported with file option");
      }
      return opt.file && opt.sync ? createFileSync(opt, files) : opt.file ? createFile(opt, files, cb) : opt.sync ? createSync(opt, files) : create(opt, files);
    };
    var createFileSync = (opt, files) => {
      const p = new Pack.Sync(opt);
      const stream = new fsm.WriteStreamSync(opt.file, {
        mode: opt.mode || 438
      });
      p.pipe(stream);
      addFilesSync(p, files);
    };
    var createFile = (opt, files, cb) => {
      const p = new Pack(opt);
      const stream = new fsm.WriteStream(opt.file, {
        mode: opt.mode || 438
      });
      p.pipe(stream);
      const promise = new Promise((res, rej) => {
        stream.on("error", rej);
        stream.on("close", res);
        p.on("error", rej);
      });
      addFilesAsync(p, files);
      return cb ? promise.then(cb, cb) : promise;
    };
    var addFilesSync = (p, files) => {
      files.forEach((file) => {
        if (file.charAt(0) === "@") {
          t({
            file: path3.resolve(p.cwd, file.slice(1)),
            sync: true,
            noResume: true,
            onentry: (entry) => p.add(entry)
          });
        } else {
          p.add(file);
        }
      });
      p.end();
    };
    var addFilesAsync = (p, files) => {
      while (files.length) {
        const file = files.shift();
        if (file.charAt(0) === "@") {
          return t({
            file: path3.resolve(p.cwd, file.slice(1)),
            noResume: true,
            onentry: (entry) => p.add(entry)
          }).then((_) => addFilesAsync(p, files));
        } else {
          p.add(file);
        }
      }
      p.end();
    };
    var createSync = (opt, files) => {
      const p = new Pack.Sync(opt);
      addFilesSync(p, files);
      return p;
    };
    var create = (opt, files) => {
      const p = new Pack(opt);
      addFilesAsync(p, files);
      return p;
    };
  }
});

// node_modules/tar/lib/replace.js
var require_replace = __commonJS({
  "node_modules/tar/lib/replace.js"(exports, module2) {
    "use strict";
    var hlo = require_high_level_opt();
    var Pack = require_pack();
    var fs3 = require("fs");
    var fsm = require_fs_minipass();
    var t = require_list();
    var path3 = require("path");
    var Header = require_header();
    module2.exports = (opt_, files, cb) => {
      const opt = hlo(opt_);
      if (!opt.file) {
        throw new TypeError("file is required");
      }
      if (opt.gzip) {
        throw new TypeError("cannot append to compressed archives");
      }
      if (!files || !Array.isArray(files) || !files.length) {
        throw new TypeError("no files or directories specified");
      }
      files = Array.from(files);
      return opt.sync ? replaceSync(opt, files) : replace(opt, files, cb);
    };
    var replaceSync = (opt, files) => {
      const p = new Pack.Sync(opt);
      let threw = true;
      let fd;
      let position;
      try {
        try {
          fd = fs3.openSync(opt.file, "r+");
        } catch (er) {
          if (er.code === "ENOENT") {
            fd = fs3.openSync(opt.file, "w+");
          } else {
            throw er;
          }
        }
        const st = fs3.fstatSync(fd);
        const headBuf = Buffer.alloc(512);
        POSITION:
          for (position = 0; position < st.size; position += 512) {
            for (let bufPos = 0, bytes = 0; bufPos < 512; bufPos += bytes) {
              bytes = fs3.readSync(
                fd,
                headBuf,
                bufPos,
                headBuf.length - bufPos,
                position + bufPos
              );
              if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
                throw new Error("cannot append to compressed archives");
              }
              if (!bytes) {
                break POSITION;
              }
            }
            const h = new Header(headBuf);
            if (!h.cksumValid) {
              break;
            }
            const entryBlockSize = 512 * Math.ceil(h.size / 512);
            if (position + entryBlockSize + 512 > st.size) {
              break;
            }
            position += entryBlockSize;
            if (opt.mtimeCache) {
              opt.mtimeCache.set(h.path, h.mtime);
            }
          }
        threw = false;
        streamSync(opt, p, position, fd, files);
      } finally {
        if (threw) {
          try {
            fs3.closeSync(fd);
          } catch (er) {
          }
        }
      }
    };
    var streamSync = (opt, p, position, fd, files) => {
      const stream = new fsm.WriteStreamSync(opt.file, {
        fd,
        start: position
      });
      p.pipe(stream);
      addFilesSync(p, files);
    };
    var replace = (opt, files, cb) => {
      files = Array.from(files);
      const p = new Pack(opt);
      const getPos = (fd, size, cb_) => {
        const cb2 = (er, pos) => {
          if (er) {
            fs3.close(fd, (_) => cb_(er));
          } else {
            cb_(null, pos);
          }
        };
        let position = 0;
        if (size === 0) {
          return cb2(null, 0);
        }
        let bufPos = 0;
        const headBuf = Buffer.alloc(512);
        const onread = (er, bytes) => {
          if (er) {
            return cb2(er);
          }
          bufPos += bytes;
          if (bufPos < 512 && bytes) {
            return fs3.read(
              fd,
              headBuf,
              bufPos,
              headBuf.length - bufPos,
              position + bufPos,
              onread
            );
          }
          if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
            return cb2(new Error("cannot append to compressed archives"));
          }
          if (bufPos < 512) {
            return cb2(null, position);
          }
          const h = new Header(headBuf);
          if (!h.cksumValid) {
            return cb2(null, position);
          }
          const entryBlockSize = 512 * Math.ceil(h.size / 512);
          if (position + entryBlockSize + 512 > size) {
            return cb2(null, position);
          }
          position += entryBlockSize + 512;
          if (position >= size) {
            return cb2(null, position);
          }
          if (opt.mtimeCache) {
            opt.mtimeCache.set(h.path, h.mtime);
          }
          bufPos = 0;
          fs3.read(fd, headBuf, 0, 512, position, onread);
        };
        fs3.read(fd, headBuf, 0, 512, position, onread);
      };
      const promise = new Promise((resolve, reject) => {
        p.on("error", reject);
        let flag = "r+";
        const onopen = (er, fd) => {
          if (er && er.code === "ENOENT" && flag === "r+") {
            flag = "w+";
            return fs3.open(opt.file, flag, onopen);
          }
          if (er) {
            return reject(er);
          }
          fs3.fstat(fd, (er2, st) => {
            if (er2) {
              return fs3.close(fd, () => reject(er2));
            }
            getPos(fd, st.size, (er3, position) => {
              if (er3) {
                return reject(er3);
              }
              const stream = new fsm.WriteStream(opt.file, {
                fd,
                start: position
              });
              p.pipe(stream);
              stream.on("error", reject);
              stream.on("close", resolve);
              addFilesAsync(p, files);
            });
          });
        };
        fs3.open(opt.file, flag, onopen);
      });
      return cb ? promise.then(cb, cb) : promise;
    };
    var addFilesSync = (p, files) => {
      files.forEach((file) => {
        if (file.charAt(0) === "@") {
          t({
            file: path3.resolve(p.cwd, file.slice(1)),
            sync: true,
            noResume: true,
            onentry: (entry) => p.add(entry)
          });
        } else {
          p.add(file);
        }
      });
      p.end();
    };
    var addFilesAsync = (p, files) => {
      while (files.length) {
        const file = files.shift();
        if (file.charAt(0) === "@") {
          return t({
            file: path3.resolve(p.cwd, file.slice(1)),
            noResume: true,
            onentry: (entry) => p.add(entry)
          }).then((_) => addFilesAsync(p, files));
        } else {
          p.add(file);
        }
      }
      p.end();
    };
  }
});

// node_modules/tar/lib/update.js
var require_update = __commonJS({
  "node_modules/tar/lib/update.js"(exports, module2) {
    "use strict";
    var hlo = require_high_level_opt();
    var r = require_replace();
    module2.exports = (opt_, files, cb) => {
      const opt = hlo(opt_);
      if (!opt.file) {
        throw new TypeError("file is required");
      }
      if (opt.gzip) {
        throw new TypeError("cannot append to compressed archives");
      }
      if (!files || !Array.isArray(files) || !files.length) {
        throw new TypeError("no files or directories specified");
      }
      files = Array.from(files);
      mtimeFilter(opt);
      return r(opt, files, cb);
    };
    var mtimeFilter = (opt) => {
      const filter = opt.filter;
      if (!opt.mtimeCache) {
        opt.mtimeCache = /* @__PURE__ */ new Map();
      }
      opt.filter = filter ? (path3, stat) => filter(path3, stat) && !(opt.mtimeCache.get(path3) > stat.mtime) : (path3, stat) => !(opt.mtimeCache.get(path3) > stat.mtime);
    };
  }
});

// node_modules/mkdirp/lib/opts-arg.js
var require_opts_arg = __commonJS({
  "node_modules/mkdirp/lib/opts-arg.js"(exports, module2) {
    var { promisify } = require("util");
    var fs3 = require("fs");
    var optsArg = (opts) => {
      if (!opts)
        opts = { mode: 511, fs: fs3 };
      else if (typeof opts === "object")
        opts = { mode: 511, fs: fs3, ...opts };
      else if (typeof opts === "number")
        opts = { mode: opts, fs: fs3 };
      else if (typeof opts === "string")
        opts = { mode: parseInt(opts, 8), fs: fs3 };
      else
        throw new TypeError("invalid options argument");
      opts.mkdir = opts.mkdir || opts.fs.mkdir || fs3.mkdir;
      opts.mkdirAsync = promisify(opts.mkdir);
      opts.stat = opts.stat || opts.fs.stat || fs3.stat;
      opts.statAsync = promisify(opts.stat);
      opts.statSync = opts.statSync || opts.fs.statSync || fs3.statSync;
      opts.mkdirSync = opts.mkdirSync || opts.fs.mkdirSync || fs3.mkdirSync;
      return opts;
    };
    module2.exports = optsArg;
  }
});

// node_modules/mkdirp/lib/path-arg.js
var require_path_arg = __commonJS({
  "node_modules/mkdirp/lib/path-arg.js"(exports, module2) {
    var platform = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform;
    var { resolve, parse: parse2 } = require("path");
    var pathArg = (path3) => {
      if (/\0/.test(path3)) {
        throw Object.assign(
          new TypeError("path must be a string without null bytes"),
          {
            path: path3,
            code: "ERR_INVALID_ARG_VALUE"
          }
        );
      }
      path3 = resolve(path3);
      if (platform === "win32") {
        const badWinChars = /[*|"<>?:]/;
        const { root } = parse2(path3);
        if (badWinChars.test(path3.substr(root.length))) {
          throw Object.assign(new Error("Illegal characters in path."), {
            path: path3,
            code: "EINVAL"
          });
        }
      }
      return path3;
    };
    module2.exports = pathArg;
  }
});

// node_modules/mkdirp/lib/find-made.js
var require_find_made = __commonJS({
  "node_modules/mkdirp/lib/find-made.js"(exports, module2) {
    var { dirname } = require("path");
    var findMade = (opts, parent, path3 = void 0) => {
      if (path3 === parent)
        return Promise.resolve();
      return opts.statAsync(parent).then(
        (st) => st.isDirectory() ? path3 : void 0,
        // will fail later
        (er) => er.code === "ENOENT" ? findMade(opts, dirname(parent), parent) : void 0
      );
    };
    var findMadeSync = (opts, parent, path3 = void 0) => {
      if (path3 === parent)
        return void 0;
      try {
        return opts.statSync(parent).isDirectory() ? path3 : void 0;
      } catch (er) {
        return er.code === "ENOENT" ? findMadeSync(opts, dirname(parent), parent) : void 0;
      }
    };
    module2.exports = { findMade, findMadeSync };
  }
});

// node_modules/mkdirp/lib/mkdirp-manual.js
var require_mkdirp_manual = __commonJS({
  "node_modules/mkdirp/lib/mkdirp-manual.js"(exports, module2) {
    var { dirname } = require("path");
    var mkdirpManual = (path3, opts, made) => {
      opts.recursive = false;
      const parent = dirname(path3);
      if (parent === path3) {
        return opts.mkdirAsync(path3, opts).catch((er) => {
          if (er.code !== "EISDIR")
            throw er;
        });
      }
      return opts.mkdirAsync(path3, opts).then(() => made || path3, (er) => {
        if (er.code === "ENOENT")
          return mkdirpManual(parent, opts).then((made2) => mkdirpManual(path3, opts, made2));
        if (er.code !== "EEXIST" && er.code !== "EROFS")
          throw er;
        return opts.statAsync(path3).then((st) => {
          if (st.isDirectory())
            return made;
          else
            throw er;
        }, () => {
          throw er;
        });
      });
    };
    var mkdirpManualSync = (path3, opts, made) => {
      const parent = dirname(path3);
      opts.recursive = false;
      if (parent === path3) {
        try {
          return opts.mkdirSync(path3, opts);
        } catch (er) {
          if (er.code !== "EISDIR")
            throw er;
          else
            return;
        }
      }
      try {
        opts.mkdirSync(path3, opts);
        return made || path3;
      } catch (er) {
        if (er.code === "ENOENT")
          return mkdirpManualSync(path3, opts, mkdirpManualSync(parent, opts, made));
        if (er.code !== "EEXIST" && er.code !== "EROFS")
          throw er;
        try {
          if (!opts.statSync(path3).isDirectory())
            throw er;
        } catch (_) {
          throw er;
        }
      }
    };
    module2.exports = { mkdirpManual, mkdirpManualSync };
  }
});

// node_modules/mkdirp/lib/mkdirp-native.js
var require_mkdirp_native = __commonJS({
  "node_modules/mkdirp/lib/mkdirp-native.js"(exports, module2) {
    var { dirname } = require("path");
    var { findMade, findMadeSync } = require_find_made();
    var { mkdirpManual, mkdirpManualSync } = require_mkdirp_manual();
    var mkdirpNative = (path3, opts) => {
      opts.recursive = true;
      const parent = dirname(path3);
      if (parent === path3)
        return opts.mkdirAsync(path3, opts);
      return findMade(opts, path3).then((made) => opts.mkdirAsync(path3, opts).then(() => made).catch((er) => {
        if (er.code === "ENOENT")
          return mkdirpManual(path3, opts);
        else
          throw er;
      }));
    };
    var mkdirpNativeSync = (path3, opts) => {
      opts.recursive = true;
      const parent = dirname(path3);
      if (parent === path3)
        return opts.mkdirSync(path3, opts);
      const made = findMadeSync(opts, path3);
      try {
        opts.mkdirSync(path3, opts);
        return made;
      } catch (er) {
        if (er.code === "ENOENT")
          return mkdirpManualSync(path3, opts);
        else
          throw er;
      }
    };
    module2.exports = { mkdirpNative, mkdirpNativeSync };
  }
});

// node_modules/mkdirp/lib/use-native.js
var require_use_native = __commonJS({
  "node_modules/mkdirp/lib/use-native.js"(exports, module2) {
    var fs3 = require("fs");
    var version2 = process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version;
    var versArr = version2.replace(/^v/, "").split(".");
    var hasNative = +versArr[0] > 10 || +versArr[0] === 10 && +versArr[1] >= 12;
    var useNative = !hasNative ? () => false : (opts) => opts.mkdir === fs3.mkdir;
    var useNativeSync = !hasNative ? () => false : (opts) => opts.mkdirSync === fs3.mkdirSync;
    module2.exports = { useNative, useNativeSync };
  }
});

// node_modules/mkdirp/index.js
var require_mkdirp = __commonJS({
  "node_modules/mkdirp/index.js"(exports, module2) {
    var optsArg = require_opts_arg();
    var pathArg = require_path_arg();
    var { mkdirpNative, mkdirpNativeSync } = require_mkdirp_native();
    var { mkdirpManual, mkdirpManualSync } = require_mkdirp_manual();
    var { useNative, useNativeSync } = require_use_native();
    var mkdirp = (path3, opts) => {
      path3 = pathArg(path3);
      opts = optsArg(opts);
      return useNative(opts) ? mkdirpNative(path3, opts) : mkdirpManual(path3, opts);
    };
    var mkdirpSync = (path3, opts) => {
      path3 = pathArg(path3);
      opts = optsArg(opts);
      return useNativeSync(opts) ? mkdirpNativeSync(path3, opts) : mkdirpManualSync(path3, opts);
    };
    mkdirp.sync = mkdirpSync;
    mkdirp.native = (path3, opts) => mkdirpNative(pathArg(path3), optsArg(opts));
    mkdirp.manual = (path3, opts) => mkdirpManual(pathArg(path3), optsArg(opts));
    mkdirp.nativeSync = (path3, opts) => mkdirpNativeSync(pathArg(path3), optsArg(opts));
    mkdirp.manualSync = (path3, opts) => mkdirpManualSync(pathArg(path3), optsArg(opts));
    module2.exports = mkdirp;
  }
});

// node_modules/chownr/chownr.js
var require_chownr = __commonJS({
  "node_modules/chownr/chownr.js"(exports, module2) {
    "use strict";
    var fs3 = require("fs");
    var path3 = require("path");
    var LCHOWN = fs3.lchown ? "lchown" : "chown";
    var LCHOWNSYNC = fs3.lchownSync ? "lchownSync" : "chownSync";
    var needEISDIRHandled = fs3.lchown && !process.version.match(/v1[1-9]+\./) && !process.version.match(/v10\.[6-9]/);
    var lchownSync = (path4, uid, gid) => {
      try {
        return fs3[LCHOWNSYNC](path4, uid, gid);
      } catch (er) {
        if (er.code !== "ENOENT")
          throw er;
      }
    };
    var chownSync = (path4, uid, gid) => {
      try {
        return fs3.chownSync(path4, uid, gid);
      } catch (er) {
        if (er.code !== "ENOENT")
          throw er;
      }
    };
    var handleEISDIR = needEISDIRHandled ? (path4, uid, gid, cb) => (er) => {
      if (!er || er.code !== "EISDIR")
        cb(er);
      else
        fs3.chown(path4, uid, gid, cb);
    } : (_, __, ___, cb) => cb;
    var handleEISDirSync = needEISDIRHandled ? (path4, uid, gid) => {
      try {
        return lchownSync(path4, uid, gid);
      } catch (er) {
        if (er.code !== "EISDIR")
          throw er;
        chownSync(path4, uid, gid);
      }
    } : (path4, uid, gid) => lchownSync(path4, uid, gid);
    var nodeVersion = process.version;
    var readdir = (path4, options, cb) => fs3.readdir(path4, options, cb);
    var readdirSync = (path4, options) => fs3.readdirSync(path4, options);
    if (/^v4\./.test(nodeVersion))
      readdir = (path4, options, cb) => fs3.readdir(path4, cb);
    var chown = (cpath, uid, gid, cb) => {
      fs3[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, (er) => {
        cb(er && er.code !== "ENOENT" ? er : null);
      }));
    };
    var chownrKid = (p, child, uid, gid, cb) => {
      if (typeof child === "string")
        return fs3.lstat(path3.resolve(p, child), (er, stats) => {
          if (er)
            return cb(er.code !== "ENOENT" ? er : null);
          stats.name = child;
          chownrKid(p, stats, uid, gid, cb);
        });
      if (child.isDirectory()) {
        chownr(path3.resolve(p, child.name), uid, gid, (er) => {
          if (er)
            return cb(er);
          const cpath = path3.resolve(p, child.name);
          chown(cpath, uid, gid, cb);
        });
      } else {
        const cpath = path3.resolve(p, child.name);
        chown(cpath, uid, gid, cb);
      }
    };
    var chownr = (p, uid, gid, cb) => {
      readdir(p, { withFileTypes: true }, (er, children) => {
        if (er) {
          if (er.code === "ENOENT")
            return cb();
          else if (er.code !== "ENOTDIR" && er.code !== "ENOTSUP")
            return cb(er);
        }
        if (er || !children.length)
          return chown(p, uid, gid, cb);
        let len = children.length;
        let errState = null;
        const then = (er2) => {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--len === 0)
            return chown(p, uid, gid, cb);
        };
        children.forEach((child) => chownrKid(p, child, uid, gid, then));
      });
    };
    var chownrKidSync = (p, child, uid, gid) => {
      if (typeof child === "string") {
        try {
          const stats = fs3.lstatSync(path3.resolve(p, child));
          stats.name = child;
          child = stats;
        } catch (er) {
          if (er.code === "ENOENT")
            return;
          else
            throw er;
        }
      }
      if (child.isDirectory())
        chownrSync(path3.resolve(p, child.name), uid, gid);
      handleEISDirSync(path3.resolve(p, child.name), uid, gid);
    };
    var chownrSync = (p, uid, gid) => {
      let children;
      try {
        children = readdirSync(p, { withFileTypes: true });
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        else if (er.code === "ENOTDIR" || er.code === "ENOTSUP")
          return handleEISDirSync(p, uid, gid);
        else
          throw er;
      }
      if (children && children.length)
        children.forEach((child) => chownrKidSync(p, child, uid, gid));
      return handleEISDirSync(p, uid, gid);
    };
    module2.exports = chownr;
    chownr.sync = chownrSync;
  }
});

// node_modules/tar/lib/mkdir.js
var require_mkdir = __commonJS({
  "node_modules/tar/lib/mkdir.js"(exports, module2) {
    "use strict";
    var mkdirp = require_mkdirp();
    var fs3 = require("fs");
    var path3 = require("path");
    var chownr = require_chownr();
    var normPath = require_normalize_windows_path();
    var SymlinkError = class extends Error {
      constructor(symlink, path4) {
        super("Cannot extract through symbolic link");
        this.path = path4;
        this.symlink = symlink;
      }
      get name() {
        return "SylinkError";
      }
    };
    var CwdError = class extends Error {
      constructor(path4, code) {
        super(code + ": Cannot cd into '" + path4 + "'");
        this.path = path4;
        this.code = code;
      }
      get name() {
        return "CwdError";
      }
    };
    var cGet = (cache, key) => cache.get(normPath(key));
    var cSet = (cache, key, val) => cache.set(normPath(key), val);
    var checkCwd = (dir, cb) => {
      fs3.stat(dir, (er, st) => {
        if (er || !st.isDirectory()) {
          er = new CwdError(dir, er && er.code || "ENOTDIR");
        }
        cb(er);
      });
    };
    module2.exports = (dir, opt, cb) => {
      dir = normPath(dir);
      const umask = opt.umask;
      const mode = opt.mode | 448;
      const needChmod = (mode & umask) !== 0;
      const uid = opt.uid;
      const gid = opt.gid;
      const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
      const preserve = opt.preserve;
      const unlink = opt.unlink;
      const cache = opt.cache;
      const cwd = normPath(opt.cwd);
      const done = (er, created) => {
        if (er) {
          cb(er);
        } else {
          cSet(cache, dir, true);
          if (created && doChown) {
            chownr(created, uid, gid, (er2) => done(er2));
          } else if (needChmod) {
            fs3.chmod(dir, mode, cb);
          } else {
            cb();
          }
        }
      };
      if (cache && cGet(cache, dir) === true) {
        return done();
      }
      if (dir === cwd) {
        return checkCwd(dir, done);
      }
      if (preserve) {
        return mkdirp(dir, { mode }).then((made) => done(null, made), done);
      }
      const sub = normPath(path3.relative(cwd, dir));
      const parts = sub.split("/");
      mkdir_(cwd, parts, mode, cache, unlink, cwd, null, done);
    };
    var mkdir_ = (base, parts, mode, cache, unlink, cwd, created, cb) => {
      if (!parts.length) {
        return cb(null, created);
      }
      const p = parts.shift();
      const part = normPath(path3.resolve(base + "/" + p));
      if (cGet(cache, part)) {
        return mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
      }
      fs3.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
    };
    var onmkdir = (part, parts, mode, cache, unlink, cwd, created, cb) => (er) => {
      if (er) {
        fs3.lstat(part, (statEr, st) => {
          if (statEr) {
            statEr.path = statEr.path && normPath(statEr.path);
            cb(statEr);
          } else if (st.isDirectory()) {
            mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
          } else if (unlink) {
            fs3.unlink(part, (er2) => {
              if (er2) {
                return cb(er2);
              }
              fs3.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
            });
          } else if (st.isSymbolicLink()) {
            return cb(new SymlinkError(part, part + "/" + parts.join("/")));
          } else {
            cb(er);
          }
        });
      } else {
        created = created || part;
        mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
      }
    };
    var checkCwdSync = (dir) => {
      let ok = false;
      let code = "ENOTDIR";
      try {
        ok = fs3.statSync(dir).isDirectory();
      } catch (er) {
        code = er.code;
      } finally {
        if (!ok) {
          throw new CwdError(dir, code);
        }
      }
    };
    module2.exports.sync = (dir, opt) => {
      dir = normPath(dir);
      const umask = opt.umask;
      const mode = opt.mode | 448;
      const needChmod = (mode & umask) !== 0;
      const uid = opt.uid;
      const gid = opt.gid;
      const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
      const preserve = opt.preserve;
      const unlink = opt.unlink;
      const cache = opt.cache;
      const cwd = normPath(opt.cwd);
      const done = (created2) => {
        cSet(cache, dir, true);
        if (created2 && doChown) {
          chownr.sync(created2, uid, gid);
        }
        if (needChmod) {
          fs3.chmodSync(dir, mode);
        }
      };
      if (cache && cGet(cache, dir) === true) {
        return done();
      }
      if (dir === cwd) {
        checkCwdSync(cwd);
        return done();
      }
      if (preserve) {
        return done(mkdirp.sync(dir, mode));
      }
      const sub = normPath(path3.relative(cwd, dir));
      const parts = sub.split("/");
      let created = null;
      for (let p = parts.shift(), part = cwd; p && (part += "/" + p); p = parts.shift()) {
        part = normPath(path3.resolve(part));
        if (cGet(cache, part)) {
          continue;
        }
        try {
          fs3.mkdirSync(part, mode);
          created = created || part;
          cSet(cache, part, true);
        } catch (er) {
          const st = fs3.lstatSync(part);
          if (st.isDirectory()) {
            cSet(cache, part, true);
            continue;
          } else if (unlink) {
            fs3.unlinkSync(part);
            fs3.mkdirSync(part, mode);
            created = created || part;
            cSet(cache, part, true);
            continue;
          } else if (st.isSymbolicLink()) {
            return new SymlinkError(part, part + "/" + parts.join("/"));
          }
        }
      }
      return done(created);
    };
  }
});

// node_modules/tar/lib/normalize-unicode.js
var require_normalize_unicode = __commonJS({
  "node_modules/tar/lib/normalize-unicode.js"(exports, module2) {
    var normalizeCache = /* @__PURE__ */ Object.create(null);
    var { hasOwnProperty } = Object.prototype;
    module2.exports = (s) => {
      if (!hasOwnProperty.call(normalizeCache, s)) {
        normalizeCache[s] = s.normalize("NFD");
      }
      return normalizeCache[s];
    };
  }
});

// node_modules/tar/lib/path-reservations.js
var require_path_reservations = __commonJS({
  "node_modules/tar/lib/path-reservations.js"(exports, module2) {
    var assert = require("assert");
    var normalize = require_normalize_unicode();
    var stripSlashes = require_strip_trailing_slashes();
    var { join } = require("path");
    var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
    var isWindows = platform === "win32";
    module2.exports = () => {
      const queues = /* @__PURE__ */ new Map();
      const reservations = /* @__PURE__ */ new Map();
      const getDirs = (path3) => {
        const dirs = path3.split("/").slice(0, -1).reduce((set, path4) => {
          if (set.length) {
            path4 = join(set[set.length - 1], path4);
          }
          set.push(path4 || "/");
          return set;
        }, []);
        return dirs;
      };
      const running = /* @__PURE__ */ new Set();
      const getQueues = (fn) => {
        const res = reservations.get(fn);
        if (!res) {
          throw new Error("function does not have any path reservations");
        }
        return {
          paths: res.paths.map((path3) => queues.get(path3)),
          dirs: [...res.dirs].map((path3) => queues.get(path3))
        };
      };
      const check = (fn) => {
        const { paths, dirs } = getQueues(fn);
        return paths.every((q) => q[0] === fn) && dirs.every((q) => q[0] instanceof Set && q[0].has(fn));
      };
      const run2 = (fn) => {
        if (running.has(fn) || !check(fn)) {
          return false;
        }
        running.add(fn);
        fn(() => clear(fn));
        return true;
      };
      const clear = (fn) => {
        if (!running.has(fn)) {
          return false;
        }
        const { paths, dirs } = reservations.get(fn);
        const next = /* @__PURE__ */ new Set();
        paths.forEach((path3) => {
          const q = queues.get(path3);
          assert.equal(q[0], fn);
          if (q.length === 1) {
            queues.delete(path3);
          } else {
            q.shift();
            if (typeof q[0] === "function") {
              next.add(q[0]);
            } else {
              q[0].forEach((fn2) => next.add(fn2));
            }
          }
        });
        dirs.forEach((dir) => {
          const q = queues.get(dir);
          assert(q[0] instanceof Set);
          if (q[0].size === 1 && q.length === 1) {
            queues.delete(dir);
          } else if (q[0].size === 1) {
            q.shift();
            next.add(q[0]);
          } else {
            q[0].delete(fn);
          }
        });
        running.delete(fn);
        next.forEach((fn2) => run2(fn2));
        return true;
      };
      const reserve = (paths, fn) => {
        paths = isWindows ? ["win32 parallelization disabled"] : paths.map((p) => {
          return stripSlashes(join(normalize(p))).toLowerCase();
        });
        const dirs = new Set(
          paths.map((path3) => getDirs(path3)).reduce((a, b) => a.concat(b))
        );
        reservations.set(fn, { dirs, paths });
        paths.forEach((path3) => {
          const q = queues.get(path3);
          if (!q) {
            queues.set(path3, [fn]);
          } else {
            q.push(fn);
          }
        });
        dirs.forEach((dir) => {
          const q = queues.get(dir);
          if (!q) {
            queues.set(dir, [/* @__PURE__ */ new Set([fn])]);
          } else if (q[q.length - 1] instanceof Set) {
            q[q.length - 1].add(fn);
          } else {
            q.push(/* @__PURE__ */ new Set([fn]));
          }
        });
        return run2(fn);
      };
      return { check, reserve };
    };
  }
});

// node_modules/tar/lib/get-write-flag.js
var require_get_write_flag = __commonJS({
  "node_modules/tar/lib/get-write-flag.js"(exports, module2) {
    var platform = process.env.__FAKE_PLATFORM__ || process.platform;
    var isWindows = platform === "win32";
    var fs3 = global.__FAKE_TESTING_FS__ || require("fs");
    var { O_CREAT, O_TRUNC, O_WRONLY, UV_FS_O_FILEMAP = 0 } = fs3.constants;
    var fMapEnabled = isWindows && !!UV_FS_O_FILEMAP;
    var fMapLimit = 512 * 1024;
    var fMapFlag = UV_FS_O_FILEMAP | O_TRUNC | O_CREAT | O_WRONLY;
    module2.exports = !fMapEnabled ? () => "w" : (size) => size < fMapLimit ? fMapFlag : "w";
  }
});

// node_modules/tar/lib/unpack.js
var require_unpack = __commonJS({
  "node_modules/tar/lib/unpack.js"(exports, module2) {
    "use strict";
    var assert = require("assert");
    var Parser = require_parse2();
    var fs3 = require("fs");
    var fsm = require_fs_minipass();
    var path3 = require("path");
    var mkdir = require_mkdir();
    var wc = require_winchars();
    var pathReservations = require_path_reservations();
    var stripAbsolutePath = require_strip_absolute_path();
    var normPath = require_normalize_windows_path();
    var stripSlash = require_strip_trailing_slashes();
    var normalize = require_normalize_unicode();
    var ONENTRY = Symbol("onEntry");
    var CHECKFS = Symbol("checkFs");
    var CHECKFS2 = Symbol("checkFs2");
    var PRUNECACHE = Symbol("pruneCache");
    var ISREUSABLE = Symbol("isReusable");
    var MAKEFS = Symbol("makeFs");
    var FILE = Symbol("file");
    var DIRECTORY = Symbol("directory");
    var LINK = Symbol("link");
    var SYMLINK = Symbol("symlink");
    var HARDLINK = Symbol("hardlink");
    var UNSUPPORTED = Symbol("unsupported");
    var CHECKPATH = Symbol("checkPath");
    var MKDIR = Symbol("mkdir");
    var ONERROR = Symbol("onError");
    var PENDING = Symbol("pending");
    var PEND = Symbol("pend");
    var UNPEND = Symbol("unpend");
    var ENDED = Symbol("ended");
    var MAYBECLOSE = Symbol("maybeClose");
    var SKIP = Symbol("skip");
    var DOCHOWN = Symbol("doChown");
    var UID = Symbol("uid");
    var GID = Symbol("gid");
    var CHECKED_CWD = Symbol("checkedCwd");
    var crypto4 = require("crypto");
    var getFlag = require_get_write_flag();
    var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
    var isWindows = platform === "win32";
    var unlinkFile = (path4, cb) => {
      if (!isWindows) {
        return fs3.unlink(path4, cb);
      }
      const name = path4 + ".DELETE." + crypto4.randomBytes(16).toString("hex");
      fs3.rename(path4, name, (er) => {
        if (er) {
          return cb(er);
        }
        fs3.unlink(name, cb);
      });
    };
    var unlinkFileSync = (path4) => {
      if (!isWindows) {
        return fs3.unlinkSync(path4);
      }
      const name = path4 + ".DELETE." + crypto4.randomBytes(16).toString("hex");
      fs3.renameSync(path4, name);
      fs3.unlinkSync(name);
    };
    var uint32 = (a, b, c) => a === a >>> 0 ? a : b === b >>> 0 ? b : c;
    var cacheKeyNormalize = (path4) => stripSlash(normPath(normalize(path4))).toLowerCase();
    var pruneCache = (cache, abs) => {
      abs = cacheKeyNormalize(abs);
      for (const path4 of cache.keys()) {
        const pnorm = cacheKeyNormalize(path4);
        if (pnorm === abs || pnorm.indexOf(abs + "/") === 0) {
          cache.delete(path4);
        }
      }
    };
    var dropCache = (cache) => {
      for (const key of cache.keys()) {
        cache.delete(key);
      }
    };
    var Unpack = class extends Parser {
      constructor(opt) {
        if (!opt) {
          opt = {};
        }
        opt.ondone = (_) => {
          this[ENDED] = true;
          this[MAYBECLOSE]();
        };
        super(opt);
        this[CHECKED_CWD] = false;
        this.reservations = pathReservations();
        this.transform = typeof opt.transform === "function" ? opt.transform : null;
        this.writable = true;
        this.readable = false;
        this[PENDING] = 0;
        this[ENDED] = false;
        this.dirCache = opt.dirCache || /* @__PURE__ */ new Map();
        if (typeof opt.uid === "number" || typeof opt.gid === "number") {
          if (typeof opt.uid !== "number" || typeof opt.gid !== "number") {
            throw new TypeError("cannot set owner without number uid and gid");
          }
          if (opt.preserveOwner) {
            throw new TypeError(
              "cannot preserve owner in archive and also set owner explicitly"
            );
          }
          this.uid = opt.uid;
          this.gid = opt.gid;
          this.setOwner = true;
        } else {
          this.uid = null;
          this.gid = null;
          this.setOwner = false;
        }
        if (opt.preserveOwner === void 0 && typeof opt.uid !== "number") {
          this.preserveOwner = process.getuid && process.getuid() === 0;
        } else {
          this.preserveOwner = !!opt.preserveOwner;
        }
        this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : null;
        this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : null;
        this.forceChown = opt.forceChown === true;
        this.win32 = !!opt.win32 || isWindows;
        this.newer = !!opt.newer;
        this.keep = !!opt.keep;
        this.noMtime = !!opt.noMtime;
        this.preservePaths = !!opt.preservePaths;
        this.unlink = !!opt.unlink;
        this.cwd = normPath(path3.resolve(opt.cwd || process.cwd()));
        this.strip = +opt.strip || 0;
        this.processUmask = opt.noChmod ? 0 : process.umask();
        this.umask = typeof opt.umask === "number" ? opt.umask : this.processUmask;
        this.dmode = opt.dmode || 511 & ~this.umask;
        this.fmode = opt.fmode || 438 & ~this.umask;
        this.on("entry", (entry) => this[ONENTRY](entry));
      }
      // a bad or damaged archive is a warning for Parser, but an error
      // when extracting.  Mark those errors as unrecoverable, because
      // the Unpack contract cannot be met.
      warn(code, msg, data = {}) {
        if (code === "TAR_BAD_ARCHIVE" || code === "TAR_ABORT") {
          data.recoverable = false;
        }
        return super.warn(code, msg, data);
      }
      [MAYBECLOSE]() {
        if (this[ENDED] && this[PENDING] === 0) {
          this.emit("prefinish");
          this.emit("finish");
          this.emit("end");
        }
      }
      [CHECKPATH](entry) {
        if (this.strip) {
          const parts = normPath(entry.path).split("/");
          if (parts.length < this.strip) {
            return false;
          }
          entry.path = parts.slice(this.strip).join("/");
          if (entry.type === "Link") {
            const linkparts = normPath(entry.linkpath).split("/");
            if (linkparts.length >= this.strip) {
              entry.linkpath = linkparts.slice(this.strip).join("/");
            } else {
              return false;
            }
          }
        }
        if (!this.preservePaths) {
          const p = normPath(entry.path);
          const parts = p.split("/");
          if (parts.includes("..") || isWindows && /^[a-z]:\.\.$/i.test(parts[0])) {
            this.warn("TAR_ENTRY_ERROR", `path contains '..'`, {
              entry,
              path: p
            });
            return false;
          }
          const [root, stripped] = stripAbsolutePath(p);
          if (root) {
            entry.path = stripped;
            this.warn("TAR_ENTRY_INFO", `stripping ${root} from absolute path`, {
              entry,
              path: p
            });
          }
        }
        if (path3.isAbsolute(entry.path)) {
          entry.absolute = normPath(path3.resolve(entry.path));
        } else {
          entry.absolute = normPath(path3.resolve(this.cwd, entry.path));
        }
        if (!this.preservePaths && entry.absolute.indexOf(this.cwd + "/") !== 0 && entry.absolute !== this.cwd) {
          this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", {
            entry,
            path: normPath(entry.path),
            resolvedPath: entry.absolute,
            cwd: this.cwd
          });
          return false;
        }
        if (entry.absolute === this.cwd && entry.type !== "Directory" && entry.type !== "GNUDumpDir") {
          return false;
        }
        if (this.win32) {
          const { root: aRoot } = path3.win32.parse(entry.absolute);
          entry.absolute = aRoot + wc.encode(entry.absolute.slice(aRoot.length));
          const { root: pRoot } = path3.win32.parse(entry.path);
          entry.path = pRoot + wc.encode(entry.path.slice(pRoot.length));
        }
        return true;
      }
      [ONENTRY](entry) {
        if (!this[CHECKPATH](entry)) {
          return entry.resume();
        }
        assert.equal(typeof entry.absolute, "string");
        switch (entry.type) {
          case "Directory":
          case "GNUDumpDir":
            if (entry.mode) {
              entry.mode = entry.mode | 448;
            }
          case "File":
          case "OldFile":
          case "ContiguousFile":
          case "Link":
          case "SymbolicLink":
            return this[CHECKFS](entry);
          case "CharacterDevice":
          case "BlockDevice":
          case "FIFO":
          default:
            return this[UNSUPPORTED](entry);
        }
      }
      [ONERROR](er, entry) {
        if (er.name === "CwdError") {
          this.emit("error", er);
        } else {
          this.warn("TAR_ENTRY_ERROR", er, { entry });
          this[UNPEND]();
          entry.resume();
        }
      }
      [MKDIR](dir, mode, cb) {
        mkdir(normPath(dir), {
          uid: this.uid,
          gid: this.gid,
          processUid: this.processUid,
          processGid: this.processGid,
          umask: this.processUmask,
          preserve: this.preservePaths,
          unlink: this.unlink,
          cache: this.dirCache,
          cwd: this.cwd,
          mode,
          noChmod: this.noChmod
        }, cb);
      }
      [DOCHOWN](entry) {
        return this.forceChown || this.preserveOwner && (typeof entry.uid === "number" && entry.uid !== this.processUid || typeof entry.gid === "number" && entry.gid !== this.processGid) || (typeof this.uid === "number" && this.uid !== this.processUid || typeof this.gid === "number" && this.gid !== this.processGid);
      }
      [UID](entry) {
        return uint32(this.uid, entry.uid, this.processUid);
      }
      [GID](entry) {
        return uint32(this.gid, entry.gid, this.processGid);
      }
      [FILE](entry, fullyDone) {
        const mode = entry.mode & 4095 || this.fmode;
        const stream = new fsm.WriteStream(entry.absolute, {
          flags: getFlag(entry.size),
          mode,
          autoClose: false
        });
        stream.on("error", (er) => {
          if (stream.fd) {
            fs3.close(stream.fd, () => {
            });
          }
          stream.write = () => true;
          this[ONERROR](er, entry);
          fullyDone();
        });
        let actions = 1;
        const done = (er) => {
          if (er) {
            if (stream.fd) {
              fs3.close(stream.fd, () => {
              });
            }
            this[ONERROR](er, entry);
            fullyDone();
            return;
          }
          if (--actions === 0) {
            fs3.close(stream.fd, (er2) => {
              if (er2) {
                this[ONERROR](er2, entry);
              } else {
                this[UNPEND]();
              }
              fullyDone();
            });
          }
        };
        stream.on("finish", (_) => {
          const abs = entry.absolute;
          const fd = stream.fd;
          if (entry.mtime && !this.noMtime) {
            actions++;
            const atime = entry.atime || /* @__PURE__ */ new Date();
            const mtime = entry.mtime;
            fs3.futimes(fd, atime, mtime, (er) => er ? fs3.utimes(abs, atime, mtime, (er2) => done(er2 && er)) : done());
          }
          if (this[DOCHOWN](entry)) {
            actions++;
            const uid = this[UID](entry);
            const gid = this[GID](entry);
            fs3.fchown(fd, uid, gid, (er) => er ? fs3.chown(abs, uid, gid, (er2) => done(er2 && er)) : done());
          }
          done();
        });
        const tx = this.transform ? this.transform(entry) || entry : entry;
        if (tx !== entry) {
          tx.on("error", (er) => {
            this[ONERROR](er, entry);
            fullyDone();
          });
          entry.pipe(tx);
        }
        tx.pipe(stream);
      }
      [DIRECTORY](entry, fullyDone) {
        const mode = entry.mode & 4095 || this.dmode;
        this[MKDIR](entry.absolute, mode, (er) => {
          if (er) {
            this[ONERROR](er, entry);
            fullyDone();
            return;
          }
          let actions = 1;
          const done = (_) => {
            if (--actions === 0) {
              fullyDone();
              this[UNPEND]();
              entry.resume();
            }
          };
          if (entry.mtime && !this.noMtime) {
            actions++;
            fs3.utimes(entry.absolute, entry.atime || /* @__PURE__ */ new Date(), entry.mtime, done);
          }
          if (this[DOCHOWN](entry)) {
            actions++;
            fs3.chown(entry.absolute, this[UID](entry), this[GID](entry), done);
          }
          done();
        });
      }
      [UNSUPPORTED](entry) {
        entry.unsupported = true;
        this.warn(
          "TAR_ENTRY_UNSUPPORTED",
          `unsupported entry type: ${entry.type}`,
          { entry }
        );
        entry.resume();
      }
      [SYMLINK](entry, done) {
        this[LINK](entry, entry.linkpath, "symlink", done);
      }
      [HARDLINK](entry, done) {
        const linkpath = normPath(path3.resolve(this.cwd, entry.linkpath));
        this[LINK](entry, linkpath, "link", done);
      }
      [PEND]() {
        this[PENDING]++;
      }
      [UNPEND]() {
        this[PENDING]--;
        this[MAYBECLOSE]();
      }
      [SKIP](entry) {
        this[UNPEND]();
        entry.resume();
      }
      // Check if we can reuse an existing filesystem entry safely and
      // overwrite it, rather than unlinking and recreating
      // Windows doesn't report a useful nlink, so we just never reuse entries
      [ISREUSABLE](entry, st) {
        return entry.type === "File" && !this.unlink && st.isFile() && st.nlink <= 1 && !isWindows;
      }
      // check if a thing is there, and if so, try to clobber it
      [CHECKFS](entry) {
        this[PEND]();
        const paths = [entry.path];
        if (entry.linkpath) {
          paths.push(entry.linkpath);
        }
        this.reservations.reserve(paths, (done) => this[CHECKFS2](entry, done));
      }
      [PRUNECACHE](entry) {
        if (entry.type === "SymbolicLink") {
          dropCache(this.dirCache);
        } else if (entry.type !== "Directory") {
          pruneCache(this.dirCache, entry.absolute);
        }
      }
      [CHECKFS2](entry, fullyDone) {
        this[PRUNECACHE](entry);
        const done = (er) => {
          this[PRUNECACHE](entry);
          fullyDone(er);
        };
        const checkCwd = () => {
          this[MKDIR](this.cwd, this.dmode, (er) => {
            if (er) {
              this[ONERROR](er, entry);
              done();
              return;
            }
            this[CHECKED_CWD] = true;
            start();
          });
        };
        const start = () => {
          if (entry.absolute !== this.cwd) {
            const parent = normPath(path3.dirname(entry.absolute));
            if (parent !== this.cwd) {
              return this[MKDIR](parent, this.dmode, (er) => {
                if (er) {
                  this[ONERROR](er, entry);
                  done();
                  return;
                }
                afterMakeParent();
              });
            }
          }
          afterMakeParent();
        };
        const afterMakeParent = () => {
          fs3.lstat(entry.absolute, (lstatEr, st) => {
            if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
              this[SKIP](entry);
              done();
              return;
            }
            if (lstatEr || this[ISREUSABLE](entry, st)) {
              return this[MAKEFS](null, entry, done);
            }
            if (st.isDirectory()) {
              if (entry.type === "Directory") {
                const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
                const afterChmod = (er) => this[MAKEFS](er, entry, done);
                if (!needChmod) {
                  return afterChmod();
                }
                return fs3.chmod(entry.absolute, entry.mode, afterChmod);
              }
              if (entry.absolute !== this.cwd) {
                return fs3.rmdir(entry.absolute, (er) => this[MAKEFS](er, entry, done));
              }
            }
            if (entry.absolute === this.cwd) {
              return this[MAKEFS](null, entry, done);
            }
            unlinkFile(entry.absolute, (er) => this[MAKEFS](er, entry, done));
          });
        };
        if (this[CHECKED_CWD]) {
          start();
        } else {
          checkCwd();
        }
      }
      [MAKEFS](er, entry, done) {
        if (er) {
          this[ONERROR](er, entry);
          done();
          return;
        }
        switch (entry.type) {
          case "File":
          case "OldFile":
          case "ContiguousFile":
            return this[FILE](entry, done);
          case "Link":
            return this[HARDLINK](entry, done);
          case "SymbolicLink":
            return this[SYMLINK](entry, done);
          case "Directory":
          case "GNUDumpDir":
            return this[DIRECTORY](entry, done);
        }
      }
      [LINK](entry, linkpath, link, done) {
        fs3[link](linkpath, entry.absolute, (er) => {
          if (er) {
            this[ONERROR](er, entry);
          } else {
            this[UNPEND]();
            entry.resume();
          }
          done();
        });
      }
    };
    var callSync = (fn) => {
      try {
        return [null, fn()];
      } catch (er) {
        return [er, null];
      }
    };
    var UnpackSync = class extends Unpack {
      [MAKEFS](er, entry) {
        return super[MAKEFS](er, entry, () => {
        });
      }
      [CHECKFS](entry) {
        this[PRUNECACHE](entry);
        if (!this[CHECKED_CWD]) {
          const er2 = this[MKDIR](this.cwd, this.dmode);
          if (er2) {
            return this[ONERROR](er2, entry);
          }
          this[CHECKED_CWD] = true;
        }
        if (entry.absolute !== this.cwd) {
          const parent = normPath(path3.dirname(entry.absolute));
          if (parent !== this.cwd) {
            const mkParent = this[MKDIR](parent, this.dmode);
            if (mkParent) {
              return this[ONERROR](mkParent, entry);
            }
          }
        }
        const [lstatEr, st] = callSync(() => fs3.lstatSync(entry.absolute));
        if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
          return this[SKIP](entry);
        }
        if (lstatEr || this[ISREUSABLE](entry, st)) {
          return this[MAKEFS](null, entry);
        }
        if (st.isDirectory()) {
          if (entry.type === "Directory") {
            const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
            const [er3] = needChmod ? callSync(() => {
              fs3.chmodSync(entry.absolute, entry.mode);
            }) : [];
            return this[MAKEFS](er3, entry);
          }
          const [er2] = callSync(() => fs3.rmdirSync(entry.absolute));
          this[MAKEFS](er2, entry);
        }
        const [er] = entry.absolute === this.cwd ? [] : callSync(() => unlinkFileSync(entry.absolute));
        this[MAKEFS](er, entry);
      }
      [FILE](entry, done) {
        const mode = entry.mode & 4095 || this.fmode;
        const oner = (er) => {
          let closeError;
          try {
            fs3.closeSync(fd);
          } catch (e) {
            closeError = e;
          }
          if (er || closeError) {
            this[ONERROR](er || closeError, entry);
          }
          done();
        };
        let fd;
        try {
          fd = fs3.openSync(entry.absolute, getFlag(entry.size), mode);
        } catch (er) {
          return oner(er);
        }
        const tx = this.transform ? this.transform(entry) || entry : entry;
        if (tx !== entry) {
          tx.on("error", (er) => this[ONERROR](er, entry));
          entry.pipe(tx);
        }
        tx.on("data", (chunk) => {
          try {
            fs3.writeSync(fd, chunk, 0, chunk.length);
          } catch (er) {
            oner(er);
          }
        });
        tx.on("end", (_) => {
          let er = null;
          if (entry.mtime && !this.noMtime) {
            const atime = entry.atime || /* @__PURE__ */ new Date();
            const mtime = entry.mtime;
            try {
              fs3.futimesSync(fd, atime, mtime);
            } catch (futimeser) {
              try {
                fs3.utimesSync(entry.absolute, atime, mtime);
              } catch (utimeser) {
                er = futimeser;
              }
            }
          }
          if (this[DOCHOWN](entry)) {
            const uid = this[UID](entry);
            const gid = this[GID](entry);
            try {
              fs3.fchownSync(fd, uid, gid);
            } catch (fchowner) {
              try {
                fs3.chownSync(entry.absolute, uid, gid);
              } catch (chowner) {
                er = er || fchowner;
              }
            }
          }
          oner(er);
        });
      }
      [DIRECTORY](entry, done) {
        const mode = entry.mode & 4095 || this.dmode;
        const er = this[MKDIR](entry.absolute, mode);
        if (er) {
          this[ONERROR](er, entry);
          done();
          return;
        }
        if (entry.mtime && !this.noMtime) {
          try {
            fs3.utimesSync(entry.absolute, entry.atime || /* @__PURE__ */ new Date(), entry.mtime);
          } catch (er2) {
          }
        }
        if (this[DOCHOWN](entry)) {
          try {
            fs3.chownSync(entry.absolute, this[UID](entry), this[GID](entry));
          } catch (er2) {
          }
        }
        done();
        entry.resume();
      }
      [MKDIR](dir, mode) {
        try {
          return mkdir.sync(normPath(dir), {
            uid: this.uid,
            gid: this.gid,
            processUid: this.processUid,
            processGid: this.processGid,
            umask: this.processUmask,
            preserve: this.preservePaths,
            unlink: this.unlink,
            cache: this.dirCache,
            cwd: this.cwd,
            mode
          });
        } catch (er) {
          return er;
        }
      }
      [LINK](entry, linkpath, link, done) {
        try {
          fs3[link + "Sync"](linkpath, entry.absolute);
          done();
          entry.resume();
        } catch (er) {
          return this[ONERROR](er, entry);
        }
      }
    };
    Unpack.Sync = UnpackSync;
    module2.exports = Unpack;
  }
});

// node_modules/tar/lib/extract.js
var require_extract = __commonJS({
  "node_modules/tar/lib/extract.js"(exports, module2) {
    "use strict";
    var hlo = require_high_level_opt();
    var Unpack = require_unpack();
    var fs3 = require("fs");
    var fsm = require_fs_minipass();
    var path3 = require("path");
    var stripSlash = require_strip_trailing_slashes();
    module2.exports = (opt_, files, cb) => {
      if (typeof opt_ === "function") {
        cb = opt_, files = null, opt_ = {};
      } else if (Array.isArray(opt_)) {
        files = opt_, opt_ = {};
      }
      if (typeof files === "function") {
        cb = files, files = null;
      }
      if (!files) {
        files = [];
      } else {
        files = Array.from(files);
      }
      const opt = hlo(opt_);
      if (opt.sync && typeof cb === "function") {
        throw new TypeError("callback not supported for sync tar functions");
      }
      if (!opt.file && typeof cb === "function") {
        throw new TypeError("callback only supported with file option");
      }
      if (files.length) {
        filesFilter(opt, files);
      }
      return opt.file && opt.sync ? extractFileSync(opt) : opt.file ? extractFile(opt, cb) : opt.sync ? extractSync(opt) : extract(opt);
    };
    var filesFilter = (opt, files) => {
      const map = new Map(files.map((f) => [stripSlash(f), true]));
      const filter = opt.filter;
      const mapHas = (file, r) => {
        const root = r || path3.parse(file).root || ".";
        const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path3.dirname(file), root);
        map.set(file, ret);
        return ret;
      };
      opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : (file) => mapHas(stripSlash(file));
    };
    var extractFileSync = (opt) => {
      const u = new Unpack.Sync(opt);
      const file = opt.file;
      const stat = fs3.statSync(file);
      const readSize = opt.maxReadSize || 16 * 1024 * 1024;
      const stream = new fsm.ReadStreamSync(file, {
        readSize,
        size: stat.size
      });
      stream.pipe(u);
    };
    var extractFile = (opt, cb) => {
      const u = new Unpack(opt);
      const readSize = opt.maxReadSize || 16 * 1024 * 1024;
      const file = opt.file;
      const p = new Promise((resolve, reject) => {
        u.on("error", reject);
        u.on("close", resolve);
        fs3.stat(file, (er, stat) => {
          if (er) {
            reject(er);
          } else {
            const stream = new fsm.ReadStream(file, {
              readSize,
              size: stat.size
            });
            stream.on("error", reject);
            stream.pipe(u);
          }
        });
      });
      return cb ? p.then(cb, cb) : p;
    };
    var extractSync = (opt) => new Unpack.Sync(opt);
    var extract = (opt) => new Unpack(opt);
  }
});

// node_modules/tar/index.js
var require_tar = __commonJS({
  "node_modules/tar/index.js"(exports) {
    "use strict";
    exports.c = exports.create = require_create();
    exports.r = exports.replace = require_replace();
    exports.t = exports.list = require_list();
    exports.u = exports.update = require_update();
    exports.x = exports.extract = require_extract();
    exports.Pack = require_pack();
    exports.Unpack = require_unpack();
    exports.Parse = require_parse2();
    exports.ReadEntry = require_read_entry();
    exports.WriteEntry = require_write_entry();
    exports.Header = require_header();
    exports.Pax = require_pax();
    exports.types = require_types();
  }
});

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/@actions/core/lib/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toCommandProperties = exports.toCommandValue = void 0;
    function toCommandValue(input) {
      if (input === null || input === void 0) {
        return "";
      } else if (typeof input === "string" || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    exports.toCommandValue = toCommandValue;
    function toCommandProperties(annotationProperties) {
      if (!Object.keys(annotationProperties).length) {
        return {};
      }
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
  }
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/@actions/core/lib/command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.issue = exports.issueCommand = void 0;
    var os6 = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os6.EOL);
    }
    exports.issueCommand = issueCommand;
    function issue(name, message = "") {
      issueCommand(name, {}, message);
    }
    exports.issue = issue;
    var CMD_STRING = "::";
    var Command = class {
      constructor(command, properties, message) {
        if (!command) {
          command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ",";
                }
                cmdStr += `${key}=${escapeProperty(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    function escapeProperty(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
    }
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/rng.js"() {
    import_crypto = __toESM(require("crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/stringify.js
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_crypto2, md5_default;
var init_md5 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/md5.js"() {
    import_crypto2 = __toESM(require("crypto"));
    md5_default = md5;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/v4.js"() {
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto3.default.createHash("sha1").update(bytes).digest();
}
var import_crypto3, sha1_default;
var init_sha1 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/sha1.js"() {
    import_crypto3 = __toESM(require("crypto"));
    sha1_default = sha1;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/@actions/core/node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/@actions/core/node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  "node_modules/@actions/core/lib/file-command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
    var fs3 = __importStar(require("fs"));
    var os6 = __importStar(require("os"));
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    var utils_1 = require_utils();
    function issueFileCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs3.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs3.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os6.EOL}`, {
        encoding: "utf8"
      });
    }
    exports.issueFileCommand = issueFileCommand;
    function prepareKeyValueMessage(key, value) {
      const delimiter = `ghadelimiter_${uuid_1.v4()}`;
      const convertedValue = utils_1.toCommandValue(value);
      if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
      }
      if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
      }
      return `${key}<<${delimiter}${os6.EOL}${convertedValue}${os6.EOL}${delimiter}`;
    }
    exports.prepareKeyValueMessage = prepareKeyValueMessage;
  }
});

// node_modules/@actions/http-client/lib/proxy.js
var require_proxy = __commonJS({
  "node_modules/@actions/http-client/lib/proxy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkBypass = exports.getProxyUrl = void 0;
    function getProxyUrl(reqUrl) {
      const usingSsl = reqUrl.protocol === "https:";
      if (checkBypass(reqUrl)) {
        return void 0;
      }
      const proxyVar = (() => {
        if (usingSsl) {
          return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
        } else {
          return process.env["http_proxy"] || process.env["HTTP_PROXY"];
        }
      })();
      if (proxyVar) {
        return new URL(proxyVar);
      } else {
        return void 0;
      }
    }
    exports.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === "http:") {
        reqPort = 80;
      } else if (reqUrl.protocol === "https:") {
        reqPort = 443;
      }
      const upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === "number") {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
        if (upperReqHosts.some((x) => x === upperNoProxyItem)) {
          return true;
        }
      }
      return false;
    }
    exports.checkBypass = checkBypass;
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  "node_modules/tunnel/lib/tunnel.js"(exports) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var http = require("http");
    var https = require("https");
    var events = require("events");
    var assert = require("assert");
    var util = require("util");
    exports.httpOverHttp = httpOverHttp;
    exports.httpsOverHttp = httpsOverHttp;
    exports.httpOverHttps = httpOverHttps;
    exports.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on("free", function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      });
    }
    util.inherits(TunnelingAgent, events.EventEmitter);
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
        headers: {
          host: options.host + ":" + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
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
          debug(
            "tunneling socket could not be established, statusCode=%d",
            res.statusCode
          );
          socket.destroy();
          var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug("got illegal response body from proxy");
          socket.destroy();
          var error = new Error("got illegal response body from proxy");
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
        debug(
          "tunneling socket could not be established, cause=%s\n",
          cause.message,
          cause.stack
        );
        var error = new Error("tunneling socket could not be established, cause=" + cause.message);
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self.removeSocket(placeholder);
      }
    };
    TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function(socket2) {
          pending.request.onSocket(socket2);
        });
      }
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
      if (typeof host === "string") {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === "object") {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    var debug;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string") {
          args[0] = "TUNNEL: " + args[0];
        } else {
          args.unshift("TUNNEL:");
        }
        console.error.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports.debug = debug;
  }
});

// node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  "node_modules/tunnel/index.js"(exports, module2) {
    module2.exports = require_tunnel();
  }
});

// node_modules/@actions/http-client/lib/index.js
var require_lib = __commonJS({
  "node_modules/@actions/http-client/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
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
    exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
    var http = __importStar(require("http"));
    var https = __importStar(require("https"));
    var pm = __importStar(require_proxy());
    var tunnel = __importStar(require_tunnel2());
    var HttpCodes;
    (function(HttpCodes2) {
      HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
      HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
      HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
      HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
      HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
      HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
      HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
      HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
      HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
      HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
      HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
    })(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
    var Headers;
    (function(Headers2) {
      Headers2["Accept"] = "accept";
      Headers2["ContentType"] = "content-type";
    })(Headers = exports.Headers || (exports.Headers = {}));
    var MediaTypes;
    (function(MediaTypes2) {
      MediaTypes2["ApplicationJson"] = "application/json";
    })(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
    function getProxyUrl(serverUrl) {
      const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : "";
    }
    exports.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
    ];
    var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class _HttpClientError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.name = "HttpClientError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, _HttpClientError.prototype);
      }
    };
    exports.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
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
    };
    exports.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      const parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === "https:";
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
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
        });
      }
      get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("GET", requestUrl, null, additionalHeaders || {});
        });
      }
      del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("DELETE", requestUrl, null, additionalHeaders || {});
        });
      }
      post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("POST", requestUrl, data, additionalHeaders || {});
        });
      }
      patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PATCH", requestUrl, data, additionalHeaders || {});
        });
      }
      put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PUT", requestUrl, data, additionalHeaders || {});
        });
      }
      head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("HEAD", requestUrl, null, additionalHeaders || {});
        });
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request(verb, requestUrl, stream, additionalHeaders);
        });
      }
      /**
       * Gets a typed object from an endpoint
       * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
       */
      getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          const res = yield this.get(requestUrl, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.post(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.put(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
          if (this._disposed) {
            throw new Error("Client has already been disposed.");
          }
          const parsedUrl = new URL(requestUrl);
          let info = this._prepareRequest(verb, parsedUrl, headers);
          const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
          let numTries = 0;
          let response;
          do {
            response = yield this.requestRaw(info, data);
            if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
              let authenticationHandler;
              for (const handler of this.handlers) {
                if (handler.canHandleAuthentication(response)) {
                  authenticationHandler = handler;
                  break;
                }
              }
              if (authenticationHandler) {
                return authenticationHandler.handleAuthentication(this, info, data);
              } else {
                return response;
              }
            }
            let redirectsRemaining = this._maxRedirects;
            while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
              const redirectUrl = response.message.headers["location"];
              if (!redirectUrl) {
                break;
              }
              const parsedRedirectUrl = new URL(redirectUrl);
              if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
                throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
              }
              yield response.readBody();
              if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                for (const header in headers) {
                  if (header.toLowerCase() === "authorization") {
                    delete headers[header];
                  }
                }
              }
              info = this._prepareRequest(verb, parsedRedirectUrl, headers);
              response = yield this.requestRaw(info, data);
              redirectsRemaining--;
            }
            if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
              return response;
            }
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
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      /**
       * Raw request.
       * @param info
       * @param data
       */
      requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function callbackForResult(err, res) {
              if (err) {
                reject(err);
              } else if (!res) {
                reject(new Error("Unknown error"));
              } else {
                resolve(res);
              }
            }
            this.requestRawWithCallback(info, data, callbackForResult);
          });
        });
      }
      /**
       * Raw request with callback.
       * @param info
       * @param data
       * @param onResult
       */
      requestRawWithCallback(info, data, onResult) {
        if (typeof data === "string") {
          if (!info.options.headers) {
            info.options.headers = {};
          }
          info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
        }
        let callbackCalled = false;
        function handleResult(err, res) {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        }
        const req = info.httpModule.request(info.options, (msg) => {
          const res = new HttpClientResponse(msg);
          handleResult(void 0, res);
        });
        let socket;
        req.on("socket", (sock) => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on("error", function(err) {
          handleResult(err);
        });
        if (data && typeof data === "string") {
          req.write(data, "utf8");
        }
        if (data && typeof data !== "string") {
          data.on("close", function() {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
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
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === "https:";
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
        info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info.options.headers["user-agent"] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        if (this.handlers) {
          for (const handler of this.handlers) {
            handler.prepareRequest(info.options);
          }
        }
        return info;
      }
      _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === "https:";
        let maxSockets = 100;
        if (this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (proxyUrl && proxyUrl.hostname) {
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
              proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
            }), { host: proxyUrl.hostname, port: proxyUrl.port })
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === "https:";
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
          retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
          const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
          return new Promise((resolve) => setTimeout(() => resolve(), ms));
        });
      }
      _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const statusCode = res.message.statusCode || 0;
            const response = {
              statusCode,
              result: null,
              headers: {}
            };
            if (statusCode === HttpCodes.NotFound) {
              resolve(response);
            }
            function dateTimeDeserializer(key, value) {
              if (typeof value === "string") {
                const a = new Date(value);
                if (!isNaN(a.valueOf())) {
                  return a;
                }
              }
              return value;
            }
            let obj;
            let contents;
            try {
              contents = yield res.readBody();
              if (contents && contents.length > 0) {
                if (options && options.deserializeDates) {
                  obj = JSON.parse(contents, dateTimeDeserializer);
                } else {
                  obj = JSON.parse(contents);
                }
                response.result = obj;
              }
              response.headers = res.message.headers;
            } catch (err) {
            }
            if (statusCode > 299) {
              let msg;
              if (obj && obj.message) {
                msg = obj.message;
              } else if (contents && contents.length > 0) {
                msg = contents;
              } else {
                msg = `Failed request: (${statusCode})`;
              }
              const err = new HttpClientError(msg, statusCode);
              err.result = response.result;
              reject(err);
            } else {
              resolve(response);
            }
          }));
        });
      }
    };
    exports.HttpClient = HttpClient;
    var lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
  }
});

// node_modules/@actions/http-client/lib/auth.js
var require_auth = __commonJS({
  "node_modules/@actions/http-client/lib/auth.js"(exports) {
    "use strict";
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
    exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
    var BasicCredentialHandler = class {
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BasicCredentialHandler = BasicCredentialHandler;
    var BearerCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Bearer ${this.token}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BearerCredentialHandler = BearerCredentialHandler;
    var PersonalAccessTokenCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
  }
});

// node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = __commonJS({
  "node_modules/@actions/core/lib/oidc-utils.js"(exports) {
    "use strict";
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
    exports.OidcClient = void 0;
    var http_client_1 = require_lib();
    var auth_1 = require_auth();
    var core_1 = require_core();
    var OidcClient = class _OidcClient {
      static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
          allowRetries: allowRetry,
          maxRetries: maxRetry
        };
        return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(_OidcClient.getRequestToken())], requestOptions);
      }
      static getRequestToken() {
        const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
        if (!token) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
        }
        return token;
      }
      static getIDTokenUrl() {
        const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
        if (!runtimeUrl) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
        }
        return runtimeUrl;
      }
      static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const httpclient = _OidcClient.createHttpClient();
          const res = yield httpclient.getJson(id_token_url).catch((error) => {
            throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error.statusCode}
 
        Error Message: ${error.result.message}`);
          });
          const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
          if (!id_token) {
            throw new Error("Response json body do not have ID Token field");
          }
          return id_token;
        });
      }
      static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let id_token_url = _OidcClient.getIDTokenUrl();
            if (audience) {
              const encodedAudience = encodeURIComponent(audience);
              id_token_url = `${id_token_url}&audience=${encodedAudience}`;
            }
            core_1.debug(`ID token url is ${id_token_url}`);
            const id_token = yield _OidcClient.getCall(id_token_url);
            core_1.setSecret(id_token);
            return id_token;
          } catch (error) {
            throw new Error(`Error message: ${error.message}`);
          }
        });
      }
    };
    exports.OidcClient = OidcClient;
  }
});

// node_modules/@actions/core/lib/summary.js
var require_summary = __commonJS({
  "node_modules/@actions/core/lib/summary.js"(exports) {
    "use strict";
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
    exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
    var os_1 = require("os");
    var fs_1 = require("fs");
    var { access, appendFile, writeFile } = fs_1.promises;
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
        return __awaiter(this, void 0, void 0, function* () {
          if (this._filePath) {
            return this._filePath;
          }
          const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
          if (!pathFromEnv) {
            throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
          }
          try {
            yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
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
        if (!content) {
          return `<${tag}${htmlAttrs}>`;
        }
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
        return __awaiter(this, void 0, void 0, function* () {
          const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
          const filePath = yield this.filePath();
          const writeFunc = overwrite ? writeFile : appendFile;
          yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          return this.emptyBuffer();
        });
      }
      /**
       * Clears the summary buffer and wipes the summary file
       *
       * @returns {Summary} summary instance
       */
      clear() {
        return __awaiter(this, void 0, void 0, function* () {
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
        return this.addRaw(os_1.EOL);
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
            if (typeof cell === "string") {
              return this.wrap("td", cell);
            }
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
        const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
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
        const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
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
    var _summary = new Summary();
    exports.markdownSummary = _summary;
    exports.summary = _summary;
  }
});

// node_modules/@actions/core/lib/path-utils.js
var require_path_utils = __commonJS({
  "node_modules/@actions/core/lib/path-utils.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
    var path3 = __importStar(require("path"));
    function toPosixPath(pth) {
      return pth.replace(/[\\]/g, "/");
    }
    exports.toPosixPath = toPosixPath;
    function toWin32Path(pth) {
      return pth.replace(/[/]/g, "\\");
    }
    exports.toWin32Path = toWin32Path;
    function toPlatformPath(pth) {
      return pth.replace(/[/\\]/g, path3.sep);
    }
    exports.toPlatformPath = toPlatformPath;
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/@actions/core/lib/core.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
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
    exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os6 = __importStar(require("os"));
    var path3 = __importStar(require("path"));
    var oidc_utils_1 = require_oidc_utils();
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
    function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("ENV", file_command_1.prepareKeyValueMessage(name, val));
      }
      command_1.issueCommand("set-env", { name }, convertedVal);
    }
    exports.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    exports.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueFileCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path3.delimiter}${process.env["PATH"]}`;
    }
    exports.addPath = addPath;
    function getInput2(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    exports.getInput = getInput2;
    function getMultilineInput(name, options) {
      const inputs = getInput2(name, options).split("\n").filter((x) => x !== "");
      if (options && options.trimWhitespace === false) {
        return inputs;
      }
      return inputs.map((input) => input.trim());
    }
    exports.getMultilineInput = getMultilineInput;
    function getBooleanInput2(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput2(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    exports.getBooleanInput = getBooleanInput2;
    function setOutput2(name, value) {
      const filePath = process.env["GITHUB_OUTPUT"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("OUTPUT", file_command_1.prepareKeyValueMessage(name, value));
      }
      process.stdout.write(os6.EOL);
      command_1.issueCommand("set-output", { name }, utils_1.toCommandValue(value));
    }
    exports.setOutput = setOutput2;
    function setCommandEcho(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    exports.setCommandEcho = setCommandEcho;
    function setFailed2(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports.setFailed = setFailed2;
    function isDebug() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    exports.isDebug = isDebug;
    function debug(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports.debug = debug;
    function error(message, properties = {}) {
      command_1.issueCommand("error", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.error = error;
    function warning(message, properties = {}) {
      command_1.issueCommand("warning", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.warning = warning;
    function notice(message, properties = {}) {
      command_1.issueCommand("notice", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.notice = notice;
    function info(message) {
      process.stdout.write(message + os6.EOL);
    }
    exports.info = info;
    function startGroup(name) {
      command_1.issue("group", name);
    }
    exports.startGroup = startGroup;
    function endGroup() {
      command_1.issue("endgroup");
    }
    exports.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
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
    function saveState(name, value) {
      const filePath = process.env["GITHUB_STATE"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("STATE", file_command_1.prepareKeyValueMessage(name, value));
      }
      command_1.issueCommand("save-state", { name }, utils_1.toCommandValue(value));
    }
    exports.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    exports.getState = getState;
    function getIDToken(aud) {
      return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
    }
    exports.getIDToken = getIDToken;
    var summary_1 = require_summary();
    Object.defineProperty(exports, "summary", { enumerable: true, get: function() {
      return summary_1.summary;
    } });
    var summary_2 = require_summary();
    Object.defineProperty(exports, "markdownSummary", { enumerable: true, get: function() {
      return summary_2.markdownSummary;
    } });
    var path_utils_1 = require_path_utils();
    Object.defineProperty(exports, "toPosixPath", { enumerable: true, get: function() {
      return path_utils_1.toPosixPath;
    } });
    Object.defineProperty(exports, "toWin32Path", { enumerable: true, get: function() {
      return path_utils_1.toWin32Path;
    } });
    Object.defineProperty(exports, "toPlatformPath", { enumerable: true, get: function() {
      return path_utils_1.toPlatformPath;
    } });
  }
});

// src/action/main.ts
var main_exports = {};
__export(main_exports, {
  main: () => main
});
module.exports = __toCommonJS(main_exports);

// src/options.ts
var ACCESS_PUBLIC = "public";
var ACCESS_RESTRICTED = "restricted";
var STRATEGY_UPGRADE = "upgrade";
var STRATEGY_ALL = "all";

// src/errors.ts
var import_node_os = __toESM(require("node:os"));
var InvalidPackageError = class extends TypeError {
  constructor(value) {
    super(
      `Package must be a directory, package.json, or .tgz file, got "${String(
        value
      )}"`
    );
    this.name = "PackageJsonReadError";
  }
};
var PackageJsonReadError = class extends Error {
  constructor(manifestPath, originalError) {
    const message = [
      `Could not read package.json at ${manifestPath}`,
      originalError instanceof Error ? originalError.message : ""
    ].filter(Boolean).join(import_node_os.default.EOL);
    super(message);
    this.name = "PackageJsonReadError";
  }
};
var PackageTarballReadError = class extends Error {
  constructor(tarballPath, originalError) {
    const message = [
      `Could not read package.json from ${tarballPath}`,
      originalError instanceof Error ? originalError.message : ""
    ].filter(Boolean).join(import_node_os.default.EOL);
    super(message);
    this.name = "PackageTarballReadError";
  }
};
var PackageJsonParseError = class extends SyntaxError {
  constructor(packageSpec, originalError) {
    const message = [
      `Invalid JSON, could not parse package.json for ${packageSpec}`,
      originalError instanceof Error ? originalError.message : ""
    ].filter(Boolean).join(import_node_os.default.EOL);
    super(message);
    this.name = "PackageJsonParseError";
  }
};
var InvalidPackageNameError = class extends TypeError {
  constructor(value) {
    super(`Package name must be a string, got "${String(value)}"`);
    this.name = "InvalidPackageNameError";
  }
};
var InvalidPackageVersionError = class extends TypeError {
  constructor(value) {
    super(`Package version must be a string, got "${String(value)}"`);
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
    super(
      `Access must be "${ACCESS_PUBLIC}" or "${ACCESS_RESTRICTED}", got "${String(
        value
      )}".`
    );
    this.name = "InvalidAccessError";
  }
};
var InvalidStrategyError = class extends TypeError {
  constructor(value) {
    super(
      `Strategy must be "${STRATEGY_UPGRADE}" or "${STRATEGY_ALL}", got "${String(
        value
      )}".`
    );
    this.name = "InvalidStrategyError";
  }
};
var NpmCallError = class extends Error {
  constructor(command, exitCode, stderr) {
    super(
      [
        `Call to "npm ${command}" exited with non-zero exit code ${exitCode}`,
        stderr
      ].join(import_node_os.default.EOL)
    );
    this.name = "NpmCallError";
  }
};

// src/read-manifest.ts
var import_promises = __toESM(require("node:fs/promises"));
var import_node_path = __toESM(require("node:path"));
var import_semver = __toESM(require_semver2());
var import_tar = __toESM(require_tar());
var SCOPE_RE = /^(@.+)\/.+$/u;
var MANIFEST_BASENAME = "package.json";
var TARBALL_EXTNAME = ".tgz";
var isManifest = (file) => {
  return typeof file === "string" && import_node_path.default.basename(file) === MANIFEST_BASENAME;
};
var isDirectory = (file) => {
  return typeof file === "string" && import_node_path.default.extname(file) === "";
};
var isTarball = (file) => {
  return typeof file === "string" && import_node_path.default.extname(file) === TARBALL_EXTNAME;
};
var validateVersion = (version2) => {
  return (0, import_semver.valid)(version2) ?? void 0;
};
var readPackageJson = async (...pathSegments) => {
  const file = import_node_path.default.resolve(...pathSegments);
  try {
    return await import_promises.default.readFile(file, "utf8");
  } catch (error) {
    throw new PackageJsonReadError(file, error);
  }
};
var readTarballPackageJson = async (file) => {
  const data = [];
  const onentry = (entry) => {
    if (entry.path === "package/package.json") {
      entry.on("data", (chunk) => data.push(chunk));
    }
  };
  try {
    await (0, import_tar.list)({ file, onentry });
    if (data.length === 0) {
      throw new Error("package.json not found inside archive");
    }
  } catch (error) {
    throw new PackageTarballReadError(file, error);
  }
  return Buffer.concat(data).toString();
};
async function readManifest(packagePath) {
  var _a;
  let packageSpec;
  let manifestContents;
  if (!packagePath) {
    packageSpec = "";
    manifestContents = await readPackageJson(MANIFEST_BASENAME);
  } else if (isManifest(packagePath)) {
    packageSpec = import_node_path.default.resolve(import_node_path.default.dirname(packagePath));
    manifestContents = await readPackageJson(packagePath);
  } else if (isDirectory(packagePath)) {
    packageSpec = import_node_path.default.resolve(packagePath);
    manifestContents = await readPackageJson(packagePath, MANIFEST_BASENAME);
  } else if (isTarball(packagePath)) {
    packageSpec = import_node_path.default.resolve(packagePath);
    manifestContents = await readTarballPackageJson(packageSpec);
  } else {
    throw new InvalidPackageError(packagePath);
  }
  let manifestJson;
  let name;
  let version2;
  let publishConfig;
  try {
    manifestJson = JSON.parse(manifestContents);
    name = manifestJson["name"];
    version2 = validateVersion(manifestJson["version"]);
    publishConfig = manifestJson["publishConfig"] ?? {};
  } catch (error) {
    throw new PackageJsonParseError(packageSpec, error);
  }
  if (typeof name !== "string" || name.length === 0) {
    throw new InvalidPackageNameError(name);
  }
  if (typeof version2 !== "string") {
    throw new InvalidPackageVersionError(version2);
  }
  if (typeof publishConfig !== "object" || Array.isArray(publishConfig) || !publishConfig) {
    throw new InvalidPackagePublishConfigError(publishConfig);
  }
  return {
    packageSpec,
    name,
    version: version2,
    publishConfig,
    scope: (_a = SCOPE_RE.exec(name)) == null ? void 0 : _a[1]
  };
}

// src/normalize-options.ts
var import_node_os2 = __toESM(require("node:os"));
var REGISTRY_NPM = "https://registry.npmjs.org/";
var TAG_LATEST = "latest";
function normalizeOptions(manifest, options) {
  var _a, _b, _c, _d;
  const defaultTag = ((_a = manifest.publishConfig) == null ? void 0 : _a.tag) ?? TAG_LATEST;
  const defaultRegistry = ((_b = manifest.publishConfig) == null ? void 0 : _b.registry) ?? REGISTRY_NPM;
  const defaultAccess = ((_c = manifest.publishConfig) == null ? void 0 : _c.access) ?? (manifest.scope === void 0 ? ACCESS_PUBLIC : void 0);
  const defaultProvenance = ((_d = manifest.publishConfig) == null ? void 0 : _d.provenance) ?? false;
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
    temporaryDirectory: options.temporaryDirectory ?? import_node_os2.default.tmpdir()
  };
}
var setValue = (value, defaultValue, validate2) => ({
  value: validate2(value ?? defaultValue),
  isDefault: value === void 0
});
var validateToken = (value) => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new InvalidTokenError();
};
var validateRegistry = (value) => {
  try {
    return new URL(value);
  } catch {
    throw new InvalidRegistryUrlError(value);
  }
};
var validateTag = (value) => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new InvalidTagError(value);
};
var validateAccess = (value) => {
  if (value === void 0 || value === ACCESS_PUBLIC || value === ACCESS_RESTRICTED) {
    return value;
  }
  throw new InvalidAccessError(value);
};
var validateStrategy = (value) => {
  if (value === STRATEGY_ALL || value === STRATEGY_UPGRADE) {
    return value;
  }
  throw new InvalidStrategyError(value);
};

// src/npm/call-npm-cli.ts
var import_node_child_process = __toESM(require("node:child_process"));
var import_node_os3 = __toESM(require("node:os"));
var VIEW = "view";
var PUBLISH = "publish";
var E404 = "E404";
var EPUBLISHCONFLICT = "EPUBLISHCONFLICT";
var NPM = import_node_os3.default.platform() === "win32" ? "npm.cmd" : "npm";
var JSON_MATCH_RE = /(\{[\s\S]*\})/mu;
var baseArguments = (options) => options.ignoreScripts ? ["--ignore-scripts", "--json"] : ["--json"];
async function callNpmCli(command, cliArguments, options) {
  var _a;
  const { stdout, stderr, exitCode } = await execNpm(
    [command, ...baseArguments(options), ...cliArguments],
    options.environment,
    options.logger
  );
  let successData;
  let errorCode;
  let error;
  if (exitCode === 0) {
    successData = parseJson(stdout);
  } else {
    const errorPayload = parseJson(
      stdout,
      stderr
    );
    if ((_a = errorPayload == null ? void 0 : errorPayload.error) == null ? void 0 : _a.code) {
      errorCode = String(errorPayload.error.code).toUpperCase();
    }
    error = new NpmCallError(command, exitCode, stderr);
  }
  return { successData, errorCode, error };
}
async function execNpm(commandArguments, environment, logger2) {
  var _a;
  (_a = logger2 == null ? void 0 : logger2.debug) == null ? void 0 : _a.call(logger2, `Running command: ${NPM} ${commandArguments.join(" ")}`);
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const npm = import_node_child_process.default.spawn(NPM, commandArguments, {
      env: { ...process.env, ...environment }
    });
    npm.stdout.on("data", (data) => stdout += data);
    npm.stderr.on("data", (data) => stderr += data);
    npm.on("close", (code) => {
      var _a2, _b;
      (_a2 = logger2 == null ? void 0 : logger2.debug) == null ? void 0 : _a2.call(logger2, `Received stdout: ${stdout}`);
      (_b = logger2 == null ? void 0 : logger2.debug) == null ? void 0 : _b.call(logger2, `Received stderr: ${stderr}`);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0
      });
    });
  });
}
function parseJson(...values) {
  var _a;
  for (const value of values) {
    const jsonValue = (_a = JSON_MATCH_RE.exec(value)) == null ? void 0 : _a[1];
    if (jsonValue) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        return void 0;
      }
    }
  }
  return void 0;
}

// src/npm/use-npm-environment.ts
var import_promises2 = __toESM(require("node:fs/promises"));
var import_node_os4 = __toESM(require("node:os"));
var import_node_path2 = __toESM(require("node:path"));
async function useNpmEnvironment(manifest, options, task) {
  var _a;
  const { registry, token, logger: logger2, temporaryDirectory } = options;
  const npmrcDirectory = await import_promises2.default.mkdtemp(
    import_node_path2.default.join(temporaryDirectory, "npm-publish-")
  );
  const npmrc = import_node_path2.default.join(npmrcDirectory, ".npmrc");
  const environment = {
    NODE_AUTH_TOKEN: token,
    npm_config_userconfig: npmrc
  };
  const config = [
    "; created by jsdevtools/npm-publish",
    `//${registry.host}/:_authToken=\${NODE_AUTH_TOKEN}`,
    `registry=${registry.href}`,
    ""
  ].join(import_node_os4.default.EOL);
  await import_promises2.default.writeFile(npmrc, config, "utf8");
  (_a = logger2 == null ? void 0 : logger2.debug) == null ? void 0 : _a.call(logger2, `Temporary .npmrc created at ${npmrc}
${config}`);
  try {
    return await task(manifest, options, environment);
  } finally {
    await import_promises2.default.rm(npmrcDirectory, { force: true, recursive: true });
  }
}

// src/compare-and-publish/compare-versions.ts
var import_diff = __toESM(require_diff());
var import_gt = __toESM(require_gt());
var import_valid = __toESM(require_valid());
var INITIAL = "initial";
var DIFFERENT = "different";
function compareVersions(currentVersion, publishedVersions, options) {
  const { versions, "dist-tags": tags } = publishedVersions ?? {};
  const { strategy, tag: publishTag } = options;
  const oldVersion = (0, import_valid.default)(tags == null ? void 0 : tags[publishTag.value]) ?? void 0;
  const isUnique = !(versions == null ? void 0 : versions.includes(currentVersion));
  let type;
  if (isUnique) {
    if (!oldVersion) {
      type = INITIAL;
    } else if ((0, import_gt.default)(currentVersion, oldVersion)) {
      type = (0, import_diff.default)(currentVersion, oldVersion) ?? DIFFERENT;
    } else if (strategy.value === STRATEGY_ALL) {
      type = DIFFERENT;
    }
  }
  return { type, oldVersion };
}

// src/compare-and-publish/get-arguments.ts
function getViewArguments(packageName, options, retryWithTag = false) {
  const packageSpec = retryWithTag ? `${packageName}@${options.tag.value}` : packageName;
  return [packageSpec, "dist-tags", "versions"];
}
function getPublishArguments(packageSpec, options) {
  const { tag, access, dryRun, provenance } = options;
  const publishArguments = [];
  if (packageSpec.length > 0) {
    publishArguments.push(packageSpec);
  }
  if (!tag.isDefault) {
    publishArguments.push("--tag", tag.value);
  }
  if (!access.isDefault && access.value) {
    publishArguments.push("--access", access.value);
  }
  if (!provenance.isDefault && provenance.value) {
    publishArguments.push("--provenance");
  }
  if (!dryRun.isDefault && dryRun.value) {
    publishArguments.push("--dry-run");
  }
  return publishArguments;
}

// src/compare-and-publish/compare-and-publish.ts
async function compareAndPublish(manifest, options, environment) {
  const { name, version: version2, packageSpec } = manifest;
  const cliOptions = {
    environment,
    ignoreScripts: options.ignoreScripts.value,
    logger: options.logger
  };
  const viewArguments = getViewArguments(name, options);
  const publishArguments = getPublishArguments(packageSpec, options);
  let viewCall = await callNpmCli(VIEW, viewArguments, cliOptions);
  if (!viewCall.successData && !viewCall.error) {
    const viewWithTagArguments = getViewArguments(name, options, true);
    viewCall = await callNpmCli(VIEW, viewWithTagArguments, cliOptions);
  }
  if (viewCall.error && viewCall.errorCode !== E404) {
    throw viewCall.error;
  }
  const comparison = compareVersions(version2, viewCall.successData, options);
  const publishCall = comparison.type ? await callNpmCli(PUBLISH, publishArguments, cliOptions) : { successData: void 0, errorCode: void 0, error: void 0 };
  if (publishCall.error && publishCall.errorCode !== EPUBLISHCONFLICT) {
    throw publishCall.error;
  }
  const { successData: publishData } = publishCall;
  return {
    id: publishData == null ? void 0 : publishData.id,
    files: (publishData == null ? void 0 : publishData.files) ?? [],
    type: publishData ? comparison.type : void 0,
    oldVersion: comparison.oldVersion
  };
}

// src/format-publish-result.ts
var import_node_os5 = __toESM(require("node:os"));
function formatPublishResult(manifest, options, result) {
  if (result.id === void 0) {
    return `\u{1F645}\u200D\u2640\uFE0F ${manifest.name}@${manifest.version} publish skipped.`;
  }
  return [
    `\u{1F4E6} ${result.id}${options.dryRun.value ? " (DRY RUN)" : ""}`,
    "=== Contents ===",
    ...result.files.map(({ path: path3, size }) => `${formatSize(size)}	${path3}`)
  ].join(import_node_os5.default.EOL);
}
var formatSize = (size) => {
  if (size < 1e3) {
    return `${size} B`;
  }
  if (size < 1e6) {
    return `${(size / 1e3).toFixed(1)} kB`;
  }
  return `${(size / 1e6).toFixed(1)} MB`;
};

// src/npm-publish.ts
async function npmPublish(options) {
  var _a, _b;
  const manifest = await readManifest(options.package);
  const normalizedOptions = normalizeOptions(manifest, options);
  const publishResult = await useNpmEnvironment(
    manifest,
    normalizedOptions,
    compareAndPublish
  );
  (_b = (_a = normalizedOptions.logger) == null ? void 0 : _a.info) == null ? void 0 : _b.call(
    _a,
    formatPublishResult(manifest, normalizedOptions, publishResult)
  );
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

// src/action/core.ts
var import_core = __toESM(require_core());
var logger = {
  debug: import_core.debug,
  info: import_core.info,
  error: import_core.error
};
function getInput(name) {
  const inputString = (0, import_core.getInput)(name);
  return inputString.length > 0 ? inputString : void 0;
}
function getRequiredSecretInput(name) {
  const inputString = (0, import_core.getInput)(name, { required: true });
  (0, import_core.setSecret)(inputString);
  return inputString;
}
function getBooleanInput(name) {
  const inputString = (0, import_core.getInput)(name).toLowerCase();
  if (inputString === "true")
    return true;
  if (inputString === "false")
    return false;
  return void 0;
}
function setFailed(error) {
  (0, import_core.setFailed)(error);
}
function setOutput(name, value, defaultValue) {
  (0, import_core.setOutput)(name, value ?? defaultValue);
}

// src/action/main.ts
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
    temporaryDirectory: process.env["RUNNER_TEMP"]
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
async function main() {
  try {
    await run();
  } catch (error) {
    setFailed(error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
//# sourceMappingURL=main.js.map
