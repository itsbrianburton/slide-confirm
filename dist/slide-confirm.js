/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var $ebd43e508017a710$var$extendStatics = function(d, b) {
    $ebd43e508017a710$var$extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return $ebd43e508017a710$var$extendStatics(d, b);
};
function $ebd43e508017a710$export$a8ba968b8961cb8a(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    $ebd43e508017a710$var$extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var $ebd43e508017a710$export$18ce0697a983be9b = function() {
    $ebd43e508017a710$export$18ce0697a983be9b = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return $ebd43e508017a710$export$18ce0697a983be9b.apply(this, arguments);
};
function $ebd43e508017a710$export$3c9a16f847548506(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function $ebd43e508017a710$export$29e00dfd3077644b(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function $ebd43e508017a710$export$d5ad3fd78186038f(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function $ebd43e508017a710$export$3a84e1ae4e97e9b0(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function $ebd43e508017a710$export$d831c04e792af3d(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++)value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    return useValue ? value : void 0;
}
function $ebd43e508017a710$export$6a2a36740a146cb8(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
function $ebd43e508017a710$export$d1a06452d3489bc7(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
function $ebd43e508017a710$export$f1db080c865becb9(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function $ebd43e508017a710$export$1050f835b63b671e(thisArg, _arguments, P, generator) {
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
}
function $ebd43e508017a710$export$67ebef60e6f28a6(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var $ebd43e508017a710$export$45d3717a4c69092e = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function $ebd43e508017a710$export$f33643c0debef087(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) $ebd43e508017a710$export$45d3717a4c69092e(o, m, p);
}
function $ebd43e508017a710$export$19a8beecd37a4c45(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function $ebd43e508017a710$export$8d051b38c9118094(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function $ebd43e508017a710$export$afc72e2116322959() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat($ebd43e508017a710$export$8d051b38c9118094(arguments[i]));
    return ar;
}
function $ebd43e508017a710$export$6388937ca91ccae8() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function $ebd43e508017a710$export$1216008129fb82ed(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function $ebd43e508017a710$export$10c90e4f7922046c(v) {
    return this instanceof $ebd43e508017a710$export$10c90e4f7922046c ? (this.v = v, this) : new $ebd43e508017a710$export$10c90e4f7922046c(v);
}
function $ebd43e508017a710$export$e427f37a30a4de9b(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof $ebd43e508017a710$export$10c90e4f7922046c ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function $ebd43e508017a710$export$bbd80228419bb833(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: $ebd43e508017a710$export$10c90e4f7922046c(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function $ebd43e508017a710$export$e3b29a3d6162315f(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof $ebd43e508017a710$export$19a8beecd37a4c45 === "function" ? $ebd43e508017a710$export$19a8beecd37a4c45(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function $ebd43e508017a710$export$4fb47efe1390b86f(cooked, raw) {
    if (Object.defineProperty) Object.defineProperty(cooked, "raw", {
        value: raw
    });
    else cooked.raw = raw;
    return cooked;
}
var $ebd43e508017a710$var$__setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var $ebd43e508017a710$var$ownKeys = function(o) {
    $ebd43e508017a710$var$ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return $ebd43e508017a710$var$ownKeys(o);
};
function $ebd43e508017a710$export$c21735bcef00d192(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = $ebd43e508017a710$var$ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") $ebd43e508017a710$export$45d3717a4c69092e(result, mod, k[i]);
    }
    $ebd43e508017a710$var$__setModuleDefault(result, mod);
    return result;
}
function $ebd43e508017a710$export$da59b14a69baef04(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function $ebd43e508017a710$export$d5dcaf168c640c35(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function $ebd43e508017a710$export$d40a35129aaff81f(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function $ebd43e508017a710$export$81fdc39f203e4e04(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function $ebd43e508017a710$export$88ac25d8e944e405(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) env.stack.push({
        async: true
    });
    return value;
}
var $ebd43e508017a710$var$_SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function $ebd43e508017a710$export$8f076105dc360e92(env) {
    function fail(e) {
        env.error = env.hasError ? new $ebd43e508017a710$var$_SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop())try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } else s |= 1;
        } catch (e) {
            fail(e);
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function $ebd43e508017a710$export$889dfb5d17574b0b(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
        return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
    return path;
}
var $ebd43e508017a710$export$2e2bcd8739ae039 = {
    __extends: $ebd43e508017a710$export$a8ba968b8961cb8a,
    __assign: $ebd43e508017a710$export$18ce0697a983be9b,
    __rest: $ebd43e508017a710$export$3c9a16f847548506,
    __decorate: $ebd43e508017a710$export$29e00dfd3077644b,
    __param: $ebd43e508017a710$export$d5ad3fd78186038f,
    __esDecorate: $ebd43e508017a710$export$3a84e1ae4e97e9b0,
    __runInitializers: $ebd43e508017a710$export$d831c04e792af3d,
    __propKey: $ebd43e508017a710$export$6a2a36740a146cb8,
    __setFunctionName: $ebd43e508017a710$export$d1a06452d3489bc7,
    __metadata: $ebd43e508017a710$export$f1db080c865becb9,
    __awaiter: $ebd43e508017a710$export$1050f835b63b671e,
    __generator: $ebd43e508017a710$export$67ebef60e6f28a6,
    __createBinding: $ebd43e508017a710$export$45d3717a4c69092e,
    __exportStar: $ebd43e508017a710$export$f33643c0debef087,
    __values: $ebd43e508017a710$export$19a8beecd37a4c45,
    __read: $ebd43e508017a710$export$8d051b38c9118094,
    __spread: $ebd43e508017a710$export$afc72e2116322959,
    __spreadArrays: $ebd43e508017a710$export$6388937ca91ccae8,
    __spreadArray: $ebd43e508017a710$export$1216008129fb82ed,
    __await: $ebd43e508017a710$export$10c90e4f7922046c,
    __asyncGenerator: $ebd43e508017a710$export$e427f37a30a4de9b,
    __asyncDelegator: $ebd43e508017a710$export$bbd80228419bb833,
    __asyncValues: $ebd43e508017a710$export$e3b29a3d6162315f,
    __makeTemplateObject: $ebd43e508017a710$export$4fb47efe1390b86f,
    __importStar: $ebd43e508017a710$export$c21735bcef00d192,
    __importDefault: $ebd43e508017a710$export$da59b14a69baef04,
    __classPrivateFieldGet: $ebd43e508017a710$export$d5dcaf168c640c35,
    __classPrivateFieldSet: $ebd43e508017a710$export$d40a35129aaff81f,
    __classPrivateFieldIn: $ebd43e508017a710$export$81fdc39f203e4e04,
    __addDisposableResource: $ebd43e508017a710$export$88ac25d8e944e405,
    __disposeResources: $ebd43e508017a710$export$8f076105dc360e92,
    __rewriteRelativeImportExtension: $ebd43e508017a710$export$889dfb5d17574b0b
};


/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $53e576283d0b4ca1$var$t = window, $53e576283d0b4ca1$export$b4d10f6001c083c2 = $53e576283d0b4ca1$var$t.ShadowRoot && (void 0 === $53e576283d0b4ca1$var$t.ShadyCSS || $53e576283d0b4ca1$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $53e576283d0b4ca1$var$s = Symbol(), $53e576283d0b4ca1$var$n = new WeakMap;
class $53e576283d0b4ca1$export$505d1e8739bad805 {
    constructor(t, e, n){
        if (this._$cssResult$ = !0, n !== $53e576283d0b4ca1$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($53e576283d0b4ca1$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $53e576283d0b4ca1$var$n.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $53e576283d0b4ca1$var$n.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $53e576283d0b4ca1$export$8d80f9cac07cdb3 = (t)=>new $53e576283d0b4ca1$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $53e576283d0b4ca1$var$s), $53e576283d0b4ca1$export$dbf350e5966cf602 = (t, ...e)=>{
    const n = 1 === t.length ? t[0] : e.reduce((e, s, n)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[n + 1], t[0]);
    return new $53e576283d0b4ca1$export$505d1e8739bad805(n, t, $53e576283d0b4ca1$var$s);
}, $53e576283d0b4ca1$export$2ca4a66ec4cecb90 = (s, n)=>{
    $53e576283d0b4ca1$export$b4d10f6001c083c2 ? s.adoptedStyleSheets = n.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet) : n.forEach((e)=>{
        const n = document.createElement("style"), o = $53e576283d0b4ca1$var$t.litNonce;
        void 0 !== o && n.setAttribute("nonce", o), n.textContent = e.cssText, s.appendChild(n);
    });
}, $53e576283d0b4ca1$export$ee69dfd951e24778 = $53e576283d0b4ca1$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $53e576283d0b4ca1$export$8d80f9cac07cdb3(e);
    })(t) : t;


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $b22ad1691173679b$var$s;
const $b22ad1691173679b$var$e = window, $b22ad1691173679b$var$r = $b22ad1691173679b$var$e.trustedTypes, $b22ad1691173679b$var$h = $b22ad1691173679b$var$r ? $b22ad1691173679b$var$r.emptyScript : "", $b22ad1691173679b$var$o = $b22ad1691173679b$var$e.reactiveElementPolyfillSupport, $b22ad1691173679b$export$7312b35fbf521afb = {
    toAttribute (t, i) {
        switch(i){
            case Boolean:
                t = t ? $b22ad1691173679b$var$h : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, i) {
        let s = t;
        switch(i){
            case Boolean:
                s = null !== t;
                break;
            case Number:
                s = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    s = JSON.parse(t);
                } catch (t) {
                    s = null;
                }
        }
        return s;
    }
}, $b22ad1691173679b$export$53a6892c50694894 = (t, i)=>i !== t && (i == i || t == t), $b22ad1691173679b$var$l = {
    attribute: !0,
    type: String,
    converter: $b22ad1691173679b$export$7312b35fbf521afb,
    reflect: !1,
    hasChanged: $b22ad1691173679b$export$53a6892c50694894
}, $b22ad1691173679b$var$d = "finalized";
class $b22ad1691173679b$export$c7c07a37856565d extends HTMLElement {
    constructor(){
        super(), this._$Ei = new Map, this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
    }
    static addInitializer(t) {
        var i;
        this.finalize(), (null !== (i = this.h) && void 0 !== i ? i : this.h = []).push(t);
    }
    static get observedAttributes() {
        this.finalize();
        const t = [];
        return this.elementProperties.forEach((i, s)=>{
            const e = this._$Ep(s, i);
            void 0 !== e && (this._$Ev.set(e, s), t.push(e));
        }), t;
    }
    static createProperty(t, i = $b22ad1691173679b$var$l) {
        if (i.state && (i.attribute = !1), this.finalize(), this.elementProperties.set(t, i), !i.noAccessor && !this.prototype.hasOwnProperty(t)) {
            const s = "symbol" == typeof t ? Symbol() : "__" + t, e = this.getPropertyDescriptor(t, s, i);
            void 0 !== e && Object.defineProperty(this.prototype, t, e);
        }
    }
    static getPropertyDescriptor(t, i, s) {
        return {
            get () {
                return this[i];
            },
            set (e) {
                const r = this[t];
                this[i] = e, this.requestUpdate(t, r, s);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) || $b22ad1691173679b$var$l;
    }
    static finalize() {
        if (this.hasOwnProperty($b22ad1691173679b$var$d)) return !1;
        this[$b22ad1691173679b$var$d] = !0;
        const t = Object.getPrototypeOf(this);
        if (t.finalize(), void 0 !== t.h && (this.h = [
            ...t.h
        ]), this.elementProperties = new Map(t.elementProperties), this._$Ev = new Map, this.hasOwnProperty("properties")) {
            const t = this.properties, i = [
                ...Object.getOwnPropertyNames(t),
                ...Object.getOwnPropertySymbols(t)
            ];
            for (const s of i)this.createProperty(s, t[s]);
        }
        return this.elementStyles = this.finalizeStyles(this.styles), !0;
    }
    static finalizeStyles(i) {
        const s = [];
        if (Array.isArray(i)) {
            const e = new Set(i.flat(1 / 0).reverse());
            for (const i of e)s.unshift((0, $53e576283d0b4ca1$export$ee69dfd951e24778)(i));
        } else void 0 !== i && s.push((0, $53e576283d0b4ca1$export$ee69dfd951e24778)(i));
        return s;
    }
    static _$Ep(t, i) {
        const s = i.attribute;
        return !1 === s ? void 0 : "string" == typeof s ? s : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    _$Eu() {
        var t;
        this._$E_ = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$Eg(), this.requestUpdate(), null === (t = this.constructor.h) || void 0 === t || t.forEach((t)=>t(this));
    }
    addController(t) {
        var i, s;
        (null !== (i = this._$ES) && void 0 !== i ? i : this._$ES = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (s = t.hostConnected) || void 0 === s || s.call(t));
    }
    removeController(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.splice(this._$ES.indexOf(t) >>> 0, 1);
    }
    _$Eg() {
        this.constructor.elementProperties.forEach((t, i)=>{
            this.hasOwnProperty(i) && (this._$Ei.set(i, this[i]), delete this[i]);
        });
    }
    createRenderRoot() {
        var t;
        const s = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $53e576283d0b4ca1$export$2ca4a66ec4cecb90)(s, this.constructor.elementStyles), s;
    }
    connectedCallback() {
        var t;
        void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostConnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        var t;
        null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostDisconnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    attributeChangedCallback(t, i, s) {
        this._$AK(t, s);
    }
    _$EO(t, i, s = $b22ad1691173679b$var$l) {
        var e;
        const r = this.constructor._$Ep(t, s);
        if (void 0 !== r && !0 === s.reflect) {
            const h = (void 0 !== (null === (e = s.converter) || void 0 === e ? void 0 : e.toAttribute) ? s.converter : $b22ad1691173679b$export$7312b35fbf521afb).toAttribute(i, s.type);
            this._$El = t, null == h ? this.removeAttribute(r) : this.setAttribute(r, h), this._$El = null;
        }
    }
    _$AK(t, i) {
        var s;
        const e = this.constructor, r = e._$Ev.get(t);
        if (void 0 !== r && this._$El !== r) {
            const t = e.getPropertyOptions(r), h = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== (null === (s = t.converter) || void 0 === s ? void 0 : s.fromAttribute) ? t.converter : $b22ad1691173679b$export$7312b35fbf521afb;
            this._$El = r, this[r] = h.fromAttribute(i, t.type), this._$El = null;
        }
    }
    requestUpdate(t, i, s) {
        let e = !0;
        void 0 !== t && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || $b22ad1691173679b$export$53a6892c50694894)(this[t], i) ? (this._$AL.has(t) || this._$AL.set(t, i), !0 === s.reflect && this._$El !== t && (void 0 === this._$EC && (this._$EC = new Map), this._$EC.set(t, s))) : e = !1), !this.isUpdatePending && e && (this._$E_ = this._$Ej());
    }
    async _$Ej() {
        this.isUpdatePending = !0;
        try {
            await this._$E_;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        var t;
        if (!this.isUpdatePending) return;
        this.hasUpdated, this._$Ei && (this._$Ei.forEach((t, i)=>this[i] = t), this._$Ei = void 0);
        let i = !1;
        const s = this._$AL;
        try {
            i = this.shouldUpdate(s), i ? (this.willUpdate(s), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
                var i;
                return null === (i = t.hostUpdate) || void 0 === i ? void 0 : i.call(t);
            }), this.update(s)) : this._$Ek();
        } catch (t) {
            throw i = !1, this._$Ek(), t;
        }
        i && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.forEach((t)=>{
            var i;
            return null === (i = t.hostUpdated) || void 0 === i ? void 0 : i.call(t);
        }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$Ek() {
        this._$AL = new Map, this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$E_;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        void 0 !== this._$EC && (this._$EC.forEach((t, i)=>this._$EO(i, this[i], t)), this._$EC = void 0), this._$Ek();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$b22ad1691173679b$export$c7c07a37856565d[$b22ad1691173679b$var$d] = !0, $b22ad1691173679b$export$c7c07a37856565d.elementProperties = new Map, $b22ad1691173679b$export$c7c07a37856565d.elementStyles = [], $b22ad1691173679b$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, null == $b22ad1691173679b$var$o || $b22ad1691173679b$var$o({
    ReactiveElement: $b22ad1691173679b$export$c7c07a37856565d
}), (null !== ($b22ad1691173679b$var$s = $b22ad1691173679b$var$e.reactiveElementVersions) && void 0 !== $b22ad1691173679b$var$s ? $b22ad1691173679b$var$s : $b22ad1691173679b$var$e.reactiveElementVersions = []).push("1.6.3");


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $1cb21db0eb1a0be5$var$t;
const $1cb21db0eb1a0be5$var$i = window, $1cb21db0eb1a0be5$var$s = $1cb21db0eb1a0be5$var$i.trustedTypes, $1cb21db0eb1a0be5$var$e = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $1cb21db0eb1a0be5$var$o = "$lit$", $1cb21db0eb1a0be5$var$n = `lit$${(Math.random() + "").slice(9)}$`, $1cb21db0eb1a0be5$var$l = "?" + $1cb21db0eb1a0be5$var$n, $1cb21db0eb1a0be5$var$h = `<${$1cb21db0eb1a0be5$var$l}>`, $1cb21db0eb1a0be5$var$r = document, $1cb21db0eb1a0be5$var$u = ()=>$1cb21db0eb1a0be5$var$r.createComment(""), $1cb21db0eb1a0be5$var$d = (t)=>null === t || "object" != typeof t && "function" != typeof t, $1cb21db0eb1a0be5$var$c = Array.isArray, $1cb21db0eb1a0be5$var$v = (t)=>$1cb21db0eb1a0be5$var$c(t) || "function" == typeof (null == t ? void 0 : t[Symbol.iterator]), $1cb21db0eb1a0be5$var$a = "[ \t\n\f\r]", $1cb21db0eb1a0be5$var$f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $1cb21db0eb1a0be5$var$_ = /-->/g, $1cb21db0eb1a0be5$var$m = />/g, $1cb21db0eb1a0be5$var$p = RegExp(`>|${$1cb21db0eb1a0be5$var$a}(?:([^\\s"'>=/]+)(${$1cb21db0eb1a0be5$var$a}*=${$1cb21db0eb1a0be5$var$a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $1cb21db0eb1a0be5$var$g = /'/g, $1cb21db0eb1a0be5$var$$ = /"/g, $1cb21db0eb1a0be5$var$y = /^(?:script|style|textarea|title)$/i, $1cb21db0eb1a0be5$var$w = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $1cb21db0eb1a0be5$export$c0bb0b647f701bb5 = $1cb21db0eb1a0be5$var$w(1), $1cb21db0eb1a0be5$export$7ed1367e7fa1ad68 = $1cb21db0eb1a0be5$var$w(2), $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $1cb21db0eb1a0be5$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $1cb21db0eb1a0be5$var$E = new WeakMap, $1cb21db0eb1a0be5$var$C = $1cb21db0eb1a0be5$var$r.createTreeWalker($1cb21db0eb1a0be5$var$r, 129, null, !1);
function $1cb21db0eb1a0be5$var$P(t, i) {
    if (!Array.isArray(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $1cb21db0eb1a0be5$var$e ? $1cb21db0eb1a0be5$var$e.createHTML(i) : i;
}
const $1cb21db0eb1a0be5$var$V = (t, i)=>{
    const s = t.length - 1, e = [];
    let l, r = 2 === i ? "<svg>" : "", u = $1cb21db0eb1a0be5$var$f;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let d, c, v = -1, a = 0;
        for(; a < s.length && (u.lastIndex = a, c = u.exec(s), null !== c);)a = u.lastIndex, u === $1cb21db0eb1a0be5$var$f ? "!--" === c[1] ? u = $1cb21db0eb1a0be5$var$_ : void 0 !== c[1] ? u = $1cb21db0eb1a0be5$var$m : void 0 !== c[2] ? ($1cb21db0eb1a0be5$var$y.test(c[2]) && (l = RegExp("</" + c[2], "g")), u = $1cb21db0eb1a0be5$var$p) : void 0 !== c[3] && (u = $1cb21db0eb1a0be5$var$p) : u === $1cb21db0eb1a0be5$var$p ? ">" === c[0] ? (u = null != l ? l : $1cb21db0eb1a0be5$var$f, v = -1) : void 0 === c[1] ? v = -2 : (v = u.lastIndex - c[2].length, d = c[1], u = void 0 === c[3] ? $1cb21db0eb1a0be5$var$p : '"' === c[3] ? $1cb21db0eb1a0be5$var$$ : $1cb21db0eb1a0be5$var$g) : u === $1cb21db0eb1a0be5$var$$ || u === $1cb21db0eb1a0be5$var$g ? u = $1cb21db0eb1a0be5$var$p : u === $1cb21db0eb1a0be5$var$_ || u === $1cb21db0eb1a0be5$var$m ? u = $1cb21db0eb1a0be5$var$f : (u = $1cb21db0eb1a0be5$var$p, l = void 0);
        const w = u === $1cb21db0eb1a0be5$var$p && t[i + 1].startsWith("/>") ? " " : "";
        r += u === $1cb21db0eb1a0be5$var$f ? s + $1cb21db0eb1a0be5$var$h : v >= 0 ? (e.push(d), s.slice(0, v) + $1cb21db0eb1a0be5$var$o + s.slice(v) + $1cb21db0eb1a0be5$var$n + w) : s + $1cb21db0eb1a0be5$var$n + (-2 === v ? (e.push(void 0), i) : w);
    }
    return [
        $1cb21db0eb1a0be5$var$P(t, r + (t[s] || "<?>") + (2 === i ? "</svg>" : "")),
        e
    ];
};
class $1cb21db0eb1a0be5$var$N {
    constructor({ strings: t, _$litType$: i }, e){
        let h;
        this.parts = [];
        let r = 0, d = 0;
        const c = t.length - 1, v = this.parts, [a, f] = $1cb21db0eb1a0be5$var$V(t, i);
        if (this.el = $1cb21db0eb1a0be5$var$N.createElement(a, e), $1cb21db0eb1a0be5$var$C.currentNode = this.el.content, 2 === i) {
            const t = this.el.content, i = t.firstChild;
            i.remove(), t.append(...i.childNodes);
        }
        for(; null !== (h = $1cb21db0eb1a0be5$var$C.nextNode()) && v.length < c;){
            if (1 === h.nodeType) {
                if (h.hasAttributes()) {
                    const t = [];
                    for (const i of h.getAttributeNames())if (i.endsWith($1cb21db0eb1a0be5$var$o) || i.startsWith($1cb21db0eb1a0be5$var$n)) {
                        const s = f[d++];
                        if (t.push(i), void 0 !== s) {
                            const t = h.getAttribute(s.toLowerCase() + $1cb21db0eb1a0be5$var$o).split($1cb21db0eb1a0be5$var$n), i = /([.?@])?(.*)/.exec(s);
                            v.push({
                                type: 1,
                                index: r,
                                name: i[2],
                                strings: t,
                                ctor: "." === i[1] ? $1cb21db0eb1a0be5$var$H : "?" === i[1] ? $1cb21db0eb1a0be5$var$L : "@" === i[1] ? $1cb21db0eb1a0be5$var$z : $1cb21db0eb1a0be5$var$k
                            });
                        } else v.push({
                            type: 6,
                            index: r
                        });
                    }
                    for (const i of t)h.removeAttribute(i);
                }
                if ($1cb21db0eb1a0be5$var$y.test(h.tagName)) {
                    const t = h.textContent.split($1cb21db0eb1a0be5$var$n), i = t.length - 1;
                    if (i > 0) {
                        h.textContent = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.emptyScript : "";
                        for(let s = 0; s < i; s++)h.append(t[s], $1cb21db0eb1a0be5$var$u()), $1cb21db0eb1a0be5$var$C.nextNode(), v.push({
                            type: 2,
                            index: ++r
                        });
                        h.append(t[i], $1cb21db0eb1a0be5$var$u());
                    }
                }
            } else if (8 === h.nodeType) {
                if (h.data === $1cb21db0eb1a0be5$var$l) v.push({
                    type: 2,
                    index: r
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = h.data.indexOf($1cb21db0eb1a0be5$var$n, t + 1));)v.push({
                        type: 7,
                        index: r
                    }), t += $1cb21db0eb1a0be5$var$n.length - 1;
                }
            }
            r++;
        }
    }
    static createElement(t, i) {
        const s = $1cb21db0eb1a0be5$var$r.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $1cb21db0eb1a0be5$var$S(t, i, s = t, e) {
    var o, n, l, h;
    if (i === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8) return i;
    let r = void 0 !== e ? null === (o = s._$Co) || void 0 === o ? void 0 : o[e] : s._$Cl;
    const u = $1cb21db0eb1a0be5$var$d(i) ? void 0 : i._$litDirective$;
    return (null == r ? void 0 : r.constructor) !== u && (null === (n = null == r ? void 0 : r._$AO) || void 0 === n || n.call(r, !1), void 0 === u ? r = void 0 : (r = new u(t), r._$AT(t, s, e)), void 0 !== e ? (null !== (l = (h = s)._$Co) && void 0 !== l ? l : h._$Co = [])[e] = r : s._$Cl = r), void 0 !== r && (i = $1cb21db0eb1a0be5$var$S(t, r._$AS(t, i.values), r, e)), i;
}
class $1cb21db0eb1a0be5$var$M {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        var i;
        const { el: { content: s }, parts: e } = this._$AD, o = (null !== (i = null == t ? void 0 : t.creationScope) && void 0 !== i ? i : $1cb21db0eb1a0be5$var$r).importNode(s, !0);
        $1cb21db0eb1a0be5$var$C.currentNode = o;
        let n = $1cb21db0eb1a0be5$var$C.nextNode(), l = 0, h = 0, u = e[0];
        for(; void 0 !== u;){
            if (l === u.index) {
                let i;
                2 === u.type ? i = new $1cb21db0eb1a0be5$var$R(n, n.nextSibling, this, t) : 1 === u.type ? i = new u.ctor(n, u.name, u.strings, this, t) : 6 === u.type && (i = new $1cb21db0eb1a0be5$var$Z(n, this, t)), this._$AV.push(i), u = e[++h];
            }
            l !== (null == u ? void 0 : u.index) && (n = $1cb21db0eb1a0be5$var$C.nextNode(), l++);
        }
        return $1cb21db0eb1a0be5$var$C.currentNode = $1cb21db0eb1a0be5$var$r, o;
    }
    v(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $1cb21db0eb1a0be5$var$R {
    constructor(t, i, s, e){
        var o;
        this.type = 2, this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cp = null === (o = null == e ? void 0 : e.isConnected) || void 0 === o || o;
    }
    get _$AU() {
        var t, i;
        return null !== (i = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== i ? i : this._$Cp;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === (null == t ? void 0 : t.nodeType) && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $1cb21db0eb1a0be5$var$S(this, t, i), $1cb21db0eb1a0be5$var$d(t) ? t === $1cb21db0eb1a0be5$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && this._$AR(), this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee) : t !== this._$AH && t !== $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.g(t) : void 0 !== t.nodeType ? this.$(t) : $1cb21db0eb1a0be5$var$v(t) ? this.T(t) : this._(t);
    }
    k(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    $(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
    }
    _(t) {
        this._$AH !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && $1cb21db0eb1a0be5$var$d(this._$AH) ? this._$AA.nextSibling.data = t : this.$($1cb21db0eb1a0be5$var$r.createTextNode(t)), this._$AH = t;
    }
    g(t) {
        var i;
        const { values: s, _$litType$: e } = t, o = "number" == typeof e ? this._$AC(t) : (void 0 === e.el && (e.el = $1cb21db0eb1a0be5$var$N.createElement($1cb21db0eb1a0be5$var$P(e.h, e.h[0]), this.options)), e);
        if ((null === (i = this._$AH) || void 0 === i ? void 0 : i._$AD) === o) this._$AH.v(s);
        else {
            const t = new $1cb21db0eb1a0be5$var$M(o, this), i = t.u(this.options);
            t.v(s), this.$(i), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $1cb21db0eb1a0be5$var$E.get(t.strings);
        return void 0 === i && $1cb21db0eb1a0be5$var$E.set(t.strings, i = new $1cb21db0eb1a0be5$var$N(t)), i;
    }
    T(t) {
        $1cb21db0eb1a0be5$var$c(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const o of t)e === i.length ? i.push(s = new $1cb21db0eb1a0be5$var$R(this.k($1cb21db0eb1a0be5$var$u()), this.k($1cb21db0eb1a0be5$var$u()), this, this.options)) : s = i[e], s._$AI(o), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        var s;
        for(null === (s = this._$AP) || void 0 === s || s.call(this, !1, !0, i); t && t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        var i;
        void 0 === this._$AM && (this._$Cp = t, null === (i = this._$AP) || void 0 === i || i.call(this, t));
    }
}
class $1cb21db0eb1a0be5$var$k {
    constructor(t, i, s, e, o){
        this.type = 1, this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = o, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee;
    }
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t, i = this, s, e) {
        const o = this.strings;
        let n = !1;
        if (void 0 === o) t = $1cb21db0eb1a0be5$var$S(this, t, i, 0), n = !$1cb21db0eb1a0be5$var$d(t) || t !== this._$AH && t !== $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8, n && (this._$AH = t);
        else {
            const e = t;
            let l, h;
            for(t = o[0], l = 0; l < o.length - 1; l++)h = $1cb21db0eb1a0be5$var$S(this, e[s + l], i, l), h === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 && (h = this._$AH[l]), n || (n = !$1cb21db0eb1a0be5$var$d(h) || h !== this._$AH[l]), h === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? t = $1cb21db0eb1a0be5$export$45b790e32b2810ee : t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && (t += (null != h ? h : "") + o[l + 1]), this._$AH[l] = h;
        }
        n && !e && this.j(t);
    }
    j(t) {
        t === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "");
    }
}
class $1cb21db0eb1a0be5$var$H extends $1cb21db0eb1a0be5$var$k {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? void 0 : t;
    }
}
const $1cb21db0eb1a0be5$var$I = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.emptyScript : "";
class $1cb21db0eb1a0be5$var$L extends $1cb21db0eb1a0be5$var$k {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        t && t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee ? this.element.setAttribute(this.name, $1cb21db0eb1a0be5$var$I) : this.element.removeAttribute(this.name);
    }
}
class $1cb21db0eb1a0be5$var$z extends $1cb21db0eb1a0be5$var$k {
    constructor(t, i, s, e, o){
        super(t, i, s, e, o), this.type = 5;
    }
    _$AI(t, i = this) {
        var s;
        if ((t = null !== (s = $1cb21db0eb1a0be5$var$S(this, t, i, 0)) && void 0 !== s ? s : $1cb21db0eb1a0be5$export$45b790e32b2810ee) === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8) return;
        const e = this._$AH, o = t === $1cb21db0eb1a0be5$export$45b790e32b2810ee && e !== $1cb21db0eb1a0be5$export$45b790e32b2810ee || t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive, n = t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && (e === $1cb21db0eb1a0be5$export$45b790e32b2810ee || o);
        o && this.element.removeEventListener(this.name, this, e), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        var i, s;
        "function" == typeof this._$AH ? this._$AH.call(null !== (s = null === (i = this.options) || void 0 === i ? void 0 : i.host) && void 0 !== s ? s : this.element, t) : this._$AH.handleEvent(t);
    }
}
class $1cb21db0eb1a0be5$var$Z {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $1cb21db0eb1a0be5$var$S(this, t);
    }
}
const $1cb21db0eb1a0be5$export$8613d1ca9052b22e = {
    O: $1cb21db0eb1a0be5$var$o,
    P: $1cb21db0eb1a0be5$var$n,
    A: $1cb21db0eb1a0be5$var$l,
    C: 1,
    M: $1cb21db0eb1a0be5$var$V,
    L: $1cb21db0eb1a0be5$var$M,
    R: $1cb21db0eb1a0be5$var$v,
    D: $1cb21db0eb1a0be5$var$S,
    I: $1cb21db0eb1a0be5$var$R,
    V: $1cb21db0eb1a0be5$var$k,
    H: $1cb21db0eb1a0be5$var$L,
    N: $1cb21db0eb1a0be5$var$z,
    U: $1cb21db0eb1a0be5$var$H,
    F: $1cb21db0eb1a0be5$var$Z
}, $1cb21db0eb1a0be5$var$B = $1cb21db0eb1a0be5$var$i.litHtmlPolyfillSupport;
null == $1cb21db0eb1a0be5$var$B || $1cb21db0eb1a0be5$var$B($1cb21db0eb1a0be5$var$N, $1cb21db0eb1a0be5$var$R), (null !== ($1cb21db0eb1a0be5$var$t = $1cb21db0eb1a0be5$var$i.litHtmlVersions) && void 0 !== $1cb21db0eb1a0be5$var$t ? $1cb21db0eb1a0be5$var$t : $1cb21db0eb1a0be5$var$i.litHtmlVersions = []).push("2.8.0");
const $1cb21db0eb1a0be5$export$b3890eb0ae9dca99 = (t, i, s)=>{
    var e, o;
    const n = null !== (e = null == s ? void 0 : s.renderBefore) && void 0 !== e ? e : i;
    let l = n._$litPart$;
    if (void 0 === l) {
        const t = null !== (o = null == s ? void 0 : s.renderBefore) && void 0 !== o ? o : null;
        n._$litPart$ = l = new $1cb21db0eb1a0be5$var$R(i.insertBefore($1cb21db0eb1a0be5$var$u(), t), t, void 0, null != s ? s : {});
    }
    return l._$AI(t), l;
};




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $2c5bcddb34c9a397$var$l, $2c5bcddb34c9a397$var$o;
const $2c5bcddb34c9a397$export$8bf27daf9e8907c9 = (0, $b22ad1691173679b$export$c7c07a37856565d);
class $2c5bcddb34c9a397$export$3f2f9f5909897157 extends (0, $b22ad1691173679b$export$c7c07a37856565d) {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this._$Do = void 0;
    }
    createRenderRoot() {
        var t, e;
        const i = super.createRenderRoot();
        return null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t || (e.renderBefore = i.firstChild), i;
    }
    update(t) {
        const i = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, $1cb21db0eb1a0be5$export$b3890eb0ae9dca99)(i, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        var t;
        super.connectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!0);
    }
    disconnectedCallback() {
        var t;
        super.disconnectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!1);
    }
    render() {
        return 0, $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8;
    }
}
$2c5bcddb34c9a397$export$3f2f9f5909897157.finalized = !0, $2c5bcddb34c9a397$export$3f2f9f5909897157._$litElement$ = !0, null === ($2c5bcddb34c9a397$var$l = globalThis.litElementHydrateSupport) || void 0 === $2c5bcddb34c9a397$var$l || $2c5bcddb34c9a397$var$l.call(globalThis, {
    LitElement: $2c5bcddb34c9a397$export$3f2f9f5909897157
});
const $2c5bcddb34c9a397$var$n = globalThis.litElementPolyfillSupport;
null == $2c5bcddb34c9a397$var$n || $2c5bcddb34c9a397$var$n({
    LitElement: $2c5bcddb34c9a397$export$3f2f9f5909897157
});
const $2c5bcddb34c9a397$export$f5c524615a7708d6 = {
    _$AK: (t, e, i)=>{
        t._$AK(e, i);
    },
    _$AL: (t)=>t._$AL
};
(null !== ($2c5bcddb34c9a397$var$o = globalThis.litElementVersions) && void 0 !== $2c5bcddb34c9a397$var$o ? $2c5bcddb34c9a397$var$o : globalThis.litElementVersions = []).push("3.3.3");


/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $7d73aec7fd8dd996$export$6acf61af03e62db = !1;




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $8fbcd235ba38df66$var$i = (i, e)=>"method" === e.kind && e.descriptor && !("value" in e.descriptor) ? {
        ...e,
        finisher (n) {
            n.createProperty(e.key, i);
        }
    } : {
        kind: "field",
        key: Symbol(),
        placement: "own",
        descriptor: {},
        originalKey: e.key,
        initializer () {
            "function" == typeof e.initializer && (this[e.key] = e.initializer.call(this));
        },
        finisher (n) {
            n.createProperty(e.key, i);
        }
    }, $8fbcd235ba38df66$var$e = (i, e, n)=>{
    e.constructor.createProperty(n, i);
};
function $8fbcd235ba38df66$export$d541bacb2bda4494(n) {
    return (t, o)=>void 0 !== o ? $8fbcd235ba38df66$var$e(n, t, o) : $8fbcd235ba38df66$var$i(n, t);
}


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $d728c145a8b96d94$export$ca000e230c0caa3e(t) {
    return (0, $8fbcd235ba38df66$export$d541bacb2bda4494)({
        ...t,
        state: !0
    });
}




class $a399cc6bbb0eb26a$export$da0658243c468832 extends (0, $2c5bcddb34c9a397$export$3f2f9f5909897157) {
    setConfig(config) {
        this._header = config.header === "" ? (0, $1cb21db0eb1a0be5$export$45b790e32b2810ee) : config.header;
        this._sliders = config.sliders;
        if (this._hass) this.hass = this._hass;
    }
    set hass(hass) {
        this._hass = hass;
    }
    _callAction(e) {
        const action = e.detail;
        if (action.action === "call-service") {
            const [domain, service] = action.service.split(".");
            const serviceData = {
                ...action.data
            };
            if (action.target?.entity_id) serviceData.entity_id = action.target.entity_id;
            if (action.target?.device_id) serviceData.device_id = action.target.device_id;
            if (action.target?.area_id) serviceData.area_id = action.target.area_id;
            this._hass.callService(domain, service, serviceData);
        }
    }
    render() {
        let content = (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`
			${this._sliders.map((slider)=>(0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`<slide-confirm @call-action=${this._callAction} config="${slider}" />`)}
		`;
        return (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`
			<ha-card header="${this._header}">
				<div class="card-content">${content}</div>
			</ha-card>
		`;
    }
    static getConfigElement() {
        return document.createElement("slide-confirm-editor");
    }
    static getStubConfig() {
        return {
            entity: "input_boolean.slide-confirm",
            header: ""
        };
    }
}
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $a399cc6bbb0eb26a$export$da0658243c468832.prototype, "_header", void 0);
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $a399cc6bbb0eb26a$export$da0658243c468832.prototype, "_state", void 0);
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $a399cc6bbb0eb26a$export$da0658243c468832.prototype, "_sliders", void 0);




/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ // Although these are re-exported from lit-element.js, we add
// them here to effectively pre-fetch them and avoid the extra
// waterfall when loading the lit package unbundled










/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $1b379d642bebdcd8$export$29fd0ed4087278b5 = (e, t, o)=>{
    Object.defineProperty(t, o, e);
}, $1b379d642bebdcd8$export$18eb0154d0069a01 = (e, t)=>({
        kind: "method",
        placement: "prototype",
        key: t.key,
        descriptor: e
    }), $1b379d642bebdcd8$export$757d561a932dc1cb = ({ finisher: e, descriptor: t })=>(o, n)=>{
        var r;
        if (void 0 === n) {
            const n = null !== (r = o.originalKey) && void 0 !== r ? r : o.key, i = null != t ? {
                kind: "method",
                placement: "prototype",
                key: n,
                descriptor: t(o.key)
            } : {
                ...o,
                key: n
            };
            return null != e && (i.finisher = function(t) {
                e(t, n);
            }), i;
        }
        {
            const r = o.constructor;
            void 0 !== t && Object.defineProperty(o, n, t(n)), null == e || e(r, n);
        }
    };


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $5b7c5dc48a1578e2$export$2fa187e846a241c4(i, n) {
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (o)=>{
            const t = {
                get () {
                    var o, n;
                    return null !== (n = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== n ? n : null;
                },
                enumerable: !0,
                configurable: !0
            };
            if (n) {
                const n = "symbol" == typeof o ? Symbol() : "__" + o;
                t.get = function() {
                    var o, t;
                    return void 0 === this[n] && (this[n] = null !== (t = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== t ? t : null), this[n];
                };
            }
            return t;
        }
    });
}





const $120c5a859c012378$export$1601f807332f51bf = (0, $53e576283d0b4ca1$export$dbf350e5966cf602)`
  .slide-confirm{
    color: var(--text-color);
    border-radius:30px;
    padding:0;
    font-size:.75em;
    position:relative;
    user-select:none;
    -moz-user-select:none;
    -webkit-user-select:none;
    margin: 8px 0;
  }
  
  .slide-confirm-track {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: var(--slider-track-color);
    transition: background-color 500ms;
    opacity: 0.38;
    border-radius: 30px;
  }

  .slide-confirm-text{
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    top: 50%;
    text-align: center;
    transform: translateY(-50%);
    font-size: 1rem;
  }
  .slide-confirm-handle{
    position:relative;
    top:0;
    left:0;
    width:50px;
    height:50px;
    border-radius:25px;
    border: 1px solid var(--switch-unchecked-button-color);
    background-color: var(--switch-unchecked-button-color);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
    box-sizing:border-box;
    text-align:center;
    font-size:20px;
    line-height: 1;
    font-family:serif;
    color: var(--text-color);
    user-select: none;
    touch-action: none;
    transition: transform 300ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .slide-confirm-handle.dragging {
    transition: none;
  }
  
  .slide-confirm-handle:hover {
    cursor:-webkit-grab;
    cursor:grab
  }
  .slide-confirm-handle:active {
    cursor:-webkit-grabbing;
    cursor:grabbing
  }

  .slide-confirm.confirmed {
    color: var(--text-color);
  }
  
  .slide-confirm.confirmed .slide-confirm-track {
    background-color: var(--switch-checked-track-color);
    opacity: 0.54;
  }
  
  .slide-confirm.confirmed .slide-confirm-handle {
    border: 1px solid var(--switch-checked-button-color);
    background-color: var(--switch-checked-button-color);
    color: var(--app-header-text-color);
  }
  
  .slide-confirm .unconfirmed {
    display: block;
  }
  
  .slide-confirm .confirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .unconfirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .confirmed {
    display: block;
  }
`;


class $3fffcf1c09fcf223$export$eb0022d780a83cd2 extends (0, $2c5bcddb34c9a397$export$3f2f9f5909897157) {
    static{
        this.styles = (0, $120c5a859c012378$export$1601f807332f51bf);
    }
    dragStart(e) {
        if (this._confirmed) return;
        this._handle.classList.add("dragging");
        this._handle.onpointermove = this.drag.bind(this);
        this._handle.setPointerCapture(e.pointerId);
    }
    dragEnd(e) {
        let x = this._calculateX(e);
        if (x + e.target.clientWidth === this._container.clientWidth && !this._confirmed) {
            this._confirmed = true;
            this._container.classList.add("confirmed");
            if (this.config.confirm_action) {
                const payload = {
                    detail: this.config.confirm_action,
                    bubbles: true,
                    composed: true
                };
                this.dispatchEvent(new CustomEvent("call-action", payload));
            }
            setTimeout(()=>{
                this._container.classList.remove("confirmed");
                this._confirmed = false;
            }, 1500);
        }
        this._handle.classList.remove("dragging");
        this._handle.onpointermove = null;
        this._handle.releasePointerCapture(e.pointerId);
        this._handle.style.transform = `translateX(0)`;
    }
    _calculateX(e) {
        let bounds = this._container.getBoundingClientRect();
        let x = e.clientX - bounds.x - e.target.clientWidth / 2;
        // Keep the handle within the container
        if (x < 0) x = 0;
        else if (x + e.target.clientWidth >= this._container.clientWidth) x = this._container.clientWidth - e.target.clientWidth;
        return x;
    }
    drag(e) {
        this._handle.style.transform = `translateX(${this._calculateX(e)}px)`;
    }
    render() {
        let content;
        content = (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`
			${this.config.icon ? (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`<ha-icon icon="${this.config.icon}" />` : ''}
			${this.config.name ? (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`<span class="slide-name">${this.config.name}</span>` : ''}
			${this.config.label ? (0, $1cb21db0eb1a0be5$export$c0bb0b647f701bb5)`<span class="slide-label">${this.config.label}</span>` : ''}
			<div class="slide-confirm">
				<div class="slide-confirm-track"></div>
				<div class="slide-confirm-text unconfirmed">${this.config.textUnconfirmed}</div>
				<div class="slide-confirm-text confirmed">${this.config.textConfirmed}</div>
				<div class="slide-confirm-handle"
				     @touchstart="${(e)=>this.dragStart(e)}"
				     @touchend="${(e)=>this.dragEnd(e)}"
				     @pointerdown="${(e)=>this.dragStart(e)}"
				     @pointerup="${(e)=>this.dragEnd(e)}" >
					<div class="slide-confirm-icon unconfirmed">
						<ha-icon icon="${this.config.iconUnconfirmed}" />
					</div>
					<div class="slide-confirm-icon confirmed">
						<ha-icon icon="${this.config.iconConfirmed}" />
					</div>
				</div>
			</div>
		`;
        return content;
    }
    constructor(...args){
        super(...args), this._confirmed = false;
    }
}
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $8fbcd235ba38df66$export$d541bacb2bda4494)({
        attribute: true
    })
], $3fffcf1c09fcf223$export$eb0022d780a83cd2.prototype, "config", void 0);
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $3fffcf1c09fcf223$export$eb0022d780a83cd2.prototype, "_confirmed", void 0);
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $5b7c5dc48a1578e2$export$2fa187e846a241c4)(".slide-confirm")
], $3fffcf1c09fcf223$export$eb0022d780a83cd2.prototype, "_container", void 0);
(0, $ebd43e508017a710$export$29e00dfd3077644b)([
    (0, $5b7c5dc48a1578e2$export$2fa187e846a241c4)(".slide-confirm-handle")
], $3fffcf1c09fcf223$export$eb0022d780a83cd2.prototype, "_handle", void 0);


customElements.define("slide-confirm-card", (0, $a399cc6bbb0eb26a$export$da0658243c468832));
customElements.define("slide-confirm", (0, $3fffcf1c09fcf223$export$eb0022d780a83cd2));
window.customCards = window.customCards || [];
window.customCards.push({
    type: "slide-confirm-card",
    name: "Slide to Confirm Card",
    description: "Prevent accidental button presses by requiring slide to confirm."
});


//# sourceMappingURL=slide-confirm.js.map
