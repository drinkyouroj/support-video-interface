var DatagramSDK = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/datagram-sdk-wrapper.js
  var datagram_sdk_wrapper_exports = {};
  __export(datagram_sdk_wrapper_exports, {
    Client: () => Client,
    Conference: () => Conference
  });

  // node_modules/valibot/dist/index.js
  var store;
  function getGlobalConfig(config2) {
    var _a, _b, _c;
    return {
      lang: (_a = config2 == null ? void 0 : config2.lang) != null ? _a : store == null ? void 0 : store.lang,
      message: config2 == null ? void 0 : config2.message,
      abortEarly: (_b = config2 == null ? void 0 : config2.abortEarly) != null ? _b : store == null ? void 0 : store.abortEarly,
      abortPipeEarly: (_c = config2 == null ? void 0 : config2.abortPipeEarly) != null ? _c : store == null ? void 0 : store.abortPipeEarly
    };
  }
  var store2;
  function getGlobalMessage(lang) {
    return store2 == null ? void 0 : store2.get(lang);
  }
  var store3;
  function getSchemaMessage(lang) {
    return store3 == null ? void 0 : store3.get(lang);
  }
  var store4;
  function getSpecificMessage(reference, lang) {
    var _a;
    return (_a = store4 == null ? void 0 : store4.get(reference)) == null ? void 0 : _a.get(lang);
  }
  function _stringify(input) {
    var _a, _b, _c;
    const type = typeof input;
    if (type === "string") {
      return `"${input}"`;
    }
    if (type === "number" || type === "bigint" || type === "boolean") {
      return `${input}`;
    }
    if (type === "object" || type === "function") {
      return (_c = input && ((_b = (_a = Object.getPrototypeOf(input)) == null ? void 0 : _a.constructor) == null ? void 0 : _b.name)) != null ? _c : "null";
    }
    return type;
  }
  function _addIssue(context, label, dataset, config2, other) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const input = other && "input" in other ? other.input : dataset.value;
    const expected = (_b = (_a = other == null ? void 0 : other.expected) != null ? _a : context.expects) != null ? _b : null;
    const received = (_c = other == null ? void 0 : other.received) != null ? _c : _stringify(input);
    const issue = {
      kind: context.kind,
      type: context.type,
      input,
      expected,
      received,
      message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
      requirement: context.requirement,
      path: other == null ? void 0 : other.path,
      issues: other == null ? void 0 : other.issues,
      lang: config2.lang,
      abortEarly: config2.abortEarly,
      abortPipeEarly: config2.abortPipeEarly
    };
    const isSchema = context.kind === "schema";
    const message = (_h = (_g = (_f = (_e = (_d = other == null ? void 0 : other.message) != null ? _d : context.message) != null ? _e : getSpecificMessage(context.reference, issue.lang)) != null ? _f : isSchema ? getSchemaMessage(issue.lang) : null) != null ? _g : config2.message) != null ? _h : getGlobalMessage(issue.lang);
    if (message) {
      issue.message = typeof message === "function" ? (
        // @ts-expect-error
        message(issue)
      ) : message;
    }
    if (isSchema) {
      dataset.typed = false;
    }
    if (dataset.issues) {
      dataset.issues.push(issue);
    } else {
      dataset.issues = [issue];
    }
  }
  function _getStandardProps(context) {
    return {
      version: 1,
      vendor: "valibot",
      validate(value2) {
        return context["~run"]({ value: value2 }, getGlobalConfig());
      }
    };
  }
  var ValiError = class extends Error {
    /**
     * Creates a Valibot error with useful information.
     *
     * @param issues The error issues.
     */
    constructor(issues) {
      super(issues[0].message);
      /**
       * The error issues.
       */
      __publicField(this, "issues");
      this.name = "ValiError";
      this.issues = issues;
    }
  };
  function transform(operation) {
    return {
      kind: "transformation",
      type: "transform",
      reference: transform,
      async: false,
      operation,
      "~run"(dataset) {
        dataset.value = this.operation(dataset.value);
        return dataset;
      }
    };
  }
  function getDefault(schema, dataset, config2) {
    return typeof schema.default === "function" ? (
      // @ts-expect-error
      schema.default(dataset, config2)
    ) : (
      // @ts-expect-error
      schema.default
    );
  }
  function boolean(message) {
    return {
      kind: "schema",
      type: "boolean",
      reference: boolean,
      expects: "boolean",
      async: false,
      message,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "boolean") {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  function nonOptional(wrapped, message) {
    return {
      kind: "schema",
      type: "non_optional",
      reference: nonOptional,
      expects: "!undefined",
      async: false,
      wrapped,
      message,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value !== void 0) {
          dataset = this.wrapped["~run"](dataset, config2);
        }
        if (dataset.value === void 0) {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  function object(entries, message) {
    return {
      kind: "schema",
      type: "object",
      reference: object,
      expects: "Object",
      async: false,
      entries,
      message,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        var _a;
        const input = dataset.value;
        if (input && typeof input === "object") {
          dataset.typed = true;
          dataset.value = {};
          for (const key in this.entries) {
            const value2 = input[key];
            const valueDataset = this.entries[key]["~run"]({ value: value2 }, config2);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                (_a = dataset.issues) == null ? void 0 : _a.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = valueDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) {
              dataset.typed = false;
            }
            if (valueDataset.value !== void 0 || key in input) {
              dataset.value[key] = valueDataset.value;
            }
          }
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  function optional(wrapped, default_) {
    return {
      kind: "schema",
      type: "optional",
      reference: optional,
      expects: `(${wrapped.expects} | undefined)`,
      async: false,
      wrapped,
      default: default_,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value === void 0) {
          if (this.default !== void 0) {
            dataset.value = getDefault(this, dataset, config2);
          }
          if (dataset.value === void 0) {
            dataset.typed = true;
            return dataset;
          }
        }
        return this.wrapped["~run"](dataset, config2);
      }
    };
  }
  function string(message) {
    return {
      kind: "schema",
      type: "string",
      reference: string,
      expects: "string",
      async: false,
      message,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "string") {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  function parse(schema, input, config2) {
    const dataset = schema["~run"]({ value: input }, getGlobalConfig(config2));
    if (dataset.issues) {
      throw new ValiError(dataset.issues);
    }
    return dataset.value;
  }
  function pipe(...pipe2) {
    return {
      ...pipe2[0],
      pipe: pipe2,
      get "~standard"() {
        return _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        for (const item of pipe2) {
          if (item.kind !== "metadata") {
            if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
              dataset.typed = false;
              break;
            }
            if (!dataset.issues || !config2.abortEarly && !config2.abortPipeEarly) {
              dataset = item["~run"](dataset, config2);
            }
          }
        }
        return dataset;
      }
    };
  }
  function required(schema, arg2, arg3) {
    const keys2 = Array.isArray(arg2) ? arg2 : void 0;
    const message = Array.isArray(arg2) ? arg3 : arg2;
    const entries = {};
    for (const key in schema.entries) {
      entries[key] = !keys2 || keys2.includes(key) ? nonOptional(schema.entries[key], message) : schema.entries[key];
    }
    return {
      ...schema,
      entries,
      get "~standard"() {
        return _getStandardProps(this);
      }
    };
  }

  // node_modules/lodash-es/_freeGlobal.js
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeGlobal_default = freeGlobal;

  // node_modules/lodash-es/_root.js
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal_default || freeSelf || Function("return this")();
  var root_default = root;

  // node_modules/lodash-es/_Symbol.js
  var Symbol2 = root_default.Symbol;
  var Symbol_default = Symbol2;

  // node_modules/lodash-es/_getRawTag.js
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getRawTag_default = getRawTag;

  // node_modules/lodash-es/_objectToString.js
  var objectProto2 = Object.prototype;
  var nativeObjectToString2 = objectProto2.toString;
  function objectToString(value) {
    return nativeObjectToString2.call(value);
  }
  var objectToString_default = objectToString;

  // node_modules/lodash-es/_baseGetTag.js
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
  }
  var baseGetTag_default = baseGetTag;

  // node_modules/lodash-es/isObjectLike.js
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_default = isObjectLike;

  // node_modules/lodash-es/isSymbol.js
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
  }
  var isSymbol_default = isSymbol;

  // node_modules/lodash-es/_arrayMap.js
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  var arrayMap_default = arrayMap;

  // node_modules/lodash-es/isArray.js
  var isArray = Array.isArray;
  var isArray_default = isArray;

  // node_modules/lodash-es/_baseToString.js
  var INFINITY = 1 / 0;
  var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray_default(value)) {
      return arrayMap_default(value, baseToString) + "";
    }
    if (isSymbol_default(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  var baseToString_default = baseToString;

  // node_modules/lodash-es/isObject.js
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_default = isObject;

  // node_modules/lodash-es/identity.js
  function identity(value) {
    return value;
  }
  var identity_default = identity;

  // node_modules/lodash-es/isFunction.js
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject_default(value)) {
      return false;
    }
    var tag = baseGetTag_default(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  var isFunction_default = isFunction;

  // node_modules/lodash-es/_coreJsData.js
  var coreJsData = root_default["__core-js_shared__"];
  var coreJsData_default = coreJsData;

  // node_modules/lodash-es/_isMasked.js
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var isMasked_default = isMasked;

  // node_modules/lodash-es/_toSource.js
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  var toSource_default = toSource;

  // node_modules/lodash-es/_baseIsNative.js
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto2 = Function.prototype;
  var objectProto3 = Object.prototype;
  var funcToString2 = funcProto2.toString;
  var hasOwnProperty2 = objectProto3.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject_default(value) || isMasked_default(value)) {
      return false;
    }
    var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource_default(value));
  }
  var baseIsNative_default = baseIsNative;

  // node_modules/lodash-es/_getValue.js
  function getValue(object2, key) {
    return object2 == null ? void 0 : object2[key];
  }
  var getValue_default = getValue;

  // node_modules/lodash-es/_getNative.js
  function getNative(object2, key) {
    var value = getValue_default(object2, key);
    return baseIsNative_default(value) ? value : void 0;
  }
  var getNative_default = getNative;

  // node_modules/lodash-es/_WeakMap.js
  var WeakMap2 = getNative_default(root_default, "WeakMap");
  var WeakMap_default = WeakMap2;

  // node_modules/lodash-es/_baseCreate.js
  var objectCreate = Object.create;
  var baseCreate = /* @__PURE__ */ function() {
    function object2() {
    }
    return function(proto) {
      if (!isObject_default(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object2.prototype = proto;
      var result = new object2();
      object2.prototype = void 0;
      return result;
    };
  }();
  var baseCreate_default = baseCreate;

  // node_modules/lodash-es/_apply.js
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  var apply_default = apply;

  // node_modules/lodash-es/_copyArray.js
  function copyArray(source, array) {
    var index = -1, length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  var copyArray_default = copyArray;

  // node_modules/lodash-es/_shortOut.js
  var HOT_COUNT = 800;
  var HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  var shortOut_default = shortOut;

  // node_modules/lodash-es/constant.js
  function constant(value) {
    return function() {
      return value;
    };
  }
  var constant_default = constant;

  // node_modules/lodash-es/_defineProperty.js
  var defineProperty = function() {
    try {
      var func = getNative_default(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  }();
  var defineProperty_default = defineProperty;

  // node_modules/lodash-es/_baseSetToString.js
  var baseSetToString = !defineProperty_default ? identity_default : function(func, string2) {
    return defineProperty_default(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant_default(string2),
      "writable": true
    });
  };
  var baseSetToString_default = baseSetToString;

  // node_modules/lodash-es/_setToString.js
  var setToString = shortOut_default(baseSetToString_default);
  var setToString_default = setToString;

  // node_modules/lodash-es/_arrayEach.js
  function arrayEach(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }
  var arrayEach_default = arrayEach;

  // node_modules/lodash-es/_isIndex.js
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  var isIndex_default = isIndex;

  // node_modules/lodash-es/_baseAssignValue.js
  function baseAssignValue(object2, key, value) {
    if (key == "__proto__" && defineProperty_default) {
      defineProperty_default(object2, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object2[key] = value;
    }
  }
  var baseAssignValue_default = baseAssignValue;

  // node_modules/lodash-es/eq.js
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var eq_default = eq;

  // node_modules/lodash-es/_assignValue.js
  var objectProto4 = Object.prototype;
  var hasOwnProperty3 = objectProto4.hasOwnProperty;
  function assignValue(object2, key, value) {
    var objValue = object2[key];
    if (!(hasOwnProperty3.call(object2, key) && eq_default(objValue, value)) || value === void 0 && !(key in object2)) {
      baseAssignValue_default(object2, key, value);
    }
  }
  var assignValue_default = assignValue;

  // node_modules/lodash-es/_copyObject.js
  function copyObject(source, props, object2, customizer) {
    var isNew = !object2;
    object2 || (object2 = {});
    var index = -1, length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue_default(object2, key, newValue);
      } else {
        assignValue_default(object2, key, newValue);
      }
    }
    return object2;
  }
  var copyObject_default = copyObject;

  // node_modules/lodash-es/_overRest.js
  var nativeMax = Math.max;
  function overRest(func, start, transform2) {
    start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform2(array);
      return apply_default(func, this, otherArgs);
    };
  }
  var overRest_default = overRest;

  // node_modules/lodash-es/isLength.js
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
  }
  var isLength_default = isLength;

  // node_modules/lodash-es/isArrayLike.js
  function isArrayLike(value) {
    return value != null && isLength_default(value.length) && !isFunction_default(value);
  }
  var isArrayLike_default = isArrayLike;

  // node_modules/lodash-es/_isPrototype.js
  var objectProto5 = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto5;
    return value === proto;
  }
  var isPrototype_default = isPrototype;

  // node_modules/lodash-es/_baseTimes.js
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  var baseTimes_default = baseTimes;

  // node_modules/lodash-es/_baseIsArguments.js
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike_default(value) && baseGetTag_default(value) == argsTag;
  }
  var baseIsArguments_default = baseIsArguments;

  // node_modules/lodash-es/isArguments.js
  var objectProto6 = Object.prototype;
  var hasOwnProperty4 = objectProto6.hasOwnProperty;
  var propertyIsEnumerable = objectProto6.propertyIsEnumerable;
  var isArguments = baseIsArguments_default(/* @__PURE__ */ function() {
    return arguments;
  }()) ? baseIsArguments_default : function(value) {
    return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArguments_default = isArguments;

  // node_modules/lodash-es/stubFalse.js
  function stubFalse() {
    return false;
  }
  var stubFalse_default = stubFalse;

  // node_modules/lodash-es/isBuffer.js
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root_default.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer = nativeIsBuffer || stubFalse_default;
  var isBuffer_default = isBuffer;

  // node_modules/lodash-es/_baseIsTypedArray.js
  var argsTag2 = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag2 = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[baseGetTag_default(value)];
  }
  var baseIsTypedArray_default = baseIsTypedArray;

  // node_modules/lodash-es/_baseUnary.js
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  var baseUnary_default = baseUnary;

  // node_modules/lodash-es/_nodeUtil.js
  var freeExports2 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule2 = freeExports2 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
  var freeProcess = moduleExports2 && freeGlobal_default.process;
  var nodeUtil = function() {
    try {
      var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  var nodeUtil_default = nodeUtil;

  // node_modules/lodash-es/isTypedArray.js
  var nodeIsTypedArray = nodeUtil_default && nodeUtil_default.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary_default(nodeIsTypedArray) : baseIsTypedArray_default;
  var isTypedArray_default = isTypedArray;

  // node_modules/lodash-es/_arrayLikeKeys.js
  var objectProto7 = Object.prototype;
  var hasOwnProperty5 = objectProto7.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes_default(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex_default(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  var arrayLikeKeys_default = arrayLikeKeys;

  // node_modules/lodash-es/_overArg.js
  function overArg(func, transform2) {
    return function(arg) {
      return func(transform2(arg));
    };
  }
  var overArg_default = overArg;

  // node_modules/lodash-es/_nativeKeys.js
  var nativeKeys = overArg_default(Object.keys, Object);
  var nativeKeys_default = nativeKeys;

  // node_modules/lodash-es/_baseKeys.js
  var objectProto8 = Object.prototype;
  var hasOwnProperty6 = objectProto8.hasOwnProperty;
  function baseKeys(object2) {
    if (!isPrototype_default(object2)) {
      return nativeKeys_default(object2);
    }
    var result = [];
    for (var key in Object(object2)) {
      if (hasOwnProperty6.call(object2, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeys_default = baseKeys;

  // node_modules/lodash-es/keys.js
  function keys(object2) {
    return isArrayLike_default(object2) ? arrayLikeKeys_default(object2) : baseKeys_default(object2);
  }
  var keys_default = keys;

  // node_modules/lodash-es/_nativeKeysIn.js
  function nativeKeysIn(object2) {
    var result = [];
    if (object2 != null) {
      for (var key in Object(object2)) {
        result.push(key);
      }
    }
    return result;
  }
  var nativeKeysIn_default = nativeKeysIn;

  // node_modules/lodash-es/_baseKeysIn.js
  var objectProto9 = Object.prototype;
  var hasOwnProperty7 = objectProto9.hasOwnProperty;
  function baseKeysIn(object2) {
    if (!isObject_default(object2)) {
      return nativeKeysIn_default(object2);
    }
    var isProto = isPrototype_default(object2), result = [];
    for (var key in object2) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty7.call(object2, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeysIn_default = baseKeysIn;

  // node_modules/lodash-es/keysIn.js
  function keysIn(object2) {
    return isArrayLike_default(object2) ? arrayLikeKeys_default(object2, true) : baseKeysIn_default(object2);
  }
  var keysIn_default = keysIn;

  // node_modules/lodash-es/_isKey.js
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object2) {
    if (isArray_default(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object(object2);
  }
  var isKey_default = isKey;

  // node_modules/lodash-es/_nativeCreate.js
  var nativeCreate = getNative_default(Object, "create");
  var nativeCreate_default = nativeCreate;

  // node_modules/lodash-es/_hashClear.js
  function hashClear() {
    this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
    this.size = 0;
  }
  var hashClear_default = hashClear;

  // node_modules/lodash-es/_hashDelete.js
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  var hashDelete_default = hashDelete;

  // node_modules/lodash-es/_hashGet.js
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto10 = Object.prototype;
  var hasOwnProperty8 = objectProto10.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate_default) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty8.call(data, key) ? data[key] : void 0;
  }
  var hashGet_default = hashGet;

  // node_modules/lodash-es/_hashHas.js
  var objectProto11 = Object.prototype;
  var hasOwnProperty9 = objectProto11.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty9.call(data, key);
  }
  var hashHas_default = hashHas;

  // node_modules/lodash-es/_hashSet.js
  var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
    return this;
  }
  var hashSet_default = hashSet;

  // node_modules/lodash-es/_Hash.js
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear_default;
  Hash.prototype["delete"] = hashDelete_default;
  Hash.prototype.get = hashGet_default;
  Hash.prototype.has = hashHas_default;
  Hash.prototype.set = hashSet_default;
  var Hash_default = Hash;

  // node_modules/lodash-es/_listCacheClear.js
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  var listCacheClear_default = listCacheClear;

  // node_modules/lodash-es/_assocIndexOf.js
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_default(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  var assocIndexOf_default = assocIndexOf;

  // node_modules/lodash-es/_listCacheDelete.js
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  var listCacheDelete_default = listCacheDelete;

  // node_modules/lodash-es/_listCacheGet.js
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  var listCacheGet_default = listCacheGet;

  // node_modules/lodash-es/_listCacheHas.js
  function listCacheHas(key) {
    return assocIndexOf_default(this.__data__, key) > -1;
  }
  var listCacheHas_default = listCacheHas;

  // node_modules/lodash-es/_listCacheSet.js
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  var listCacheSet_default = listCacheSet;

  // node_modules/lodash-es/_ListCache.js
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear_default;
  ListCache.prototype["delete"] = listCacheDelete_default;
  ListCache.prototype.get = listCacheGet_default;
  ListCache.prototype.has = listCacheHas_default;
  ListCache.prototype.set = listCacheSet_default;
  var ListCache_default = ListCache;

  // node_modules/lodash-es/_Map.js
  var Map2 = getNative_default(root_default, "Map");
  var Map_default = Map2;

  // node_modules/lodash-es/_mapCacheClear.js
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash_default(),
      "map": new (Map_default || ListCache_default)(),
      "string": new Hash_default()
    };
  }
  var mapCacheClear_default = mapCacheClear;

  // node_modules/lodash-es/_isKeyable.js
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  var isKeyable_default = isKeyable;

  // node_modules/lodash-es/_getMapData.js
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  var getMapData_default = getMapData;

  // node_modules/lodash-es/_mapCacheDelete.js
  function mapCacheDelete(key) {
    var result = getMapData_default(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  var mapCacheDelete_default = mapCacheDelete;

  // node_modules/lodash-es/_mapCacheGet.js
  function mapCacheGet(key) {
    return getMapData_default(this, key).get(key);
  }
  var mapCacheGet_default = mapCacheGet;

  // node_modules/lodash-es/_mapCacheHas.js
  function mapCacheHas(key) {
    return getMapData_default(this, key).has(key);
  }
  var mapCacheHas_default = mapCacheHas;

  // node_modules/lodash-es/_mapCacheSet.js
  function mapCacheSet(key, value) {
    var data = getMapData_default(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  var mapCacheSet_default = mapCacheSet;

  // node_modules/lodash-es/_MapCache.js
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear_default;
  MapCache.prototype["delete"] = mapCacheDelete_default;
  MapCache.prototype.get = mapCacheGet_default;
  MapCache.prototype.has = mapCacheHas_default;
  MapCache.prototype.set = mapCacheSet_default;
  var MapCache_default = MapCache;

  // node_modules/lodash-es/memoize.js
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache_default)();
    return memoized;
  }
  memoize.Cache = MapCache_default;
  var memoize_default = memoize;

  // node_modules/lodash-es/_memoizeCapped.js
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize_default(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  var memoizeCapped_default = memoizeCapped;

  // node_modules/lodash-es/_stringToPath.js
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped_default(function(string2) {
    var result = [];
    if (string2.charCodeAt(0) === 46) {
      result.push("");
    }
    string2.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  var stringToPath_default = stringToPath;

  // node_modules/lodash-es/toString.js
  function toString(value) {
    return value == null ? "" : baseToString_default(value);
  }
  var toString_default = toString;

  // node_modules/lodash-es/_castPath.js
  function castPath(value, object2) {
    if (isArray_default(value)) {
      return value;
    }
    return isKey_default(value, object2) ? [value] : stringToPath_default(toString_default(value));
  }
  var castPath_default = castPath;

  // node_modules/lodash-es/_toKey.js
  var INFINITY2 = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol_default(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
  }
  var toKey_default = toKey;

  // node_modules/lodash-es/_baseGet.js
  function baseGet(object2, path) {
    path = castPath_default(path, object2);
    var index = 0, length = path.length;
    while (object2 != null && index < length) {
      object2 = object2[toKey_default(path[index++])];
    }
    return index && index == length ? object2 : void 0;
  }
  var baseGet_default = baseGet;

  // node_modules/lodash-es/get.js
  function get(object2, path, defaultValue) {
    var result = object2 == null ? void 0 : baseGet_default(object2, path);
    return result === void 0 ? defaultValue : result;
  }
  var get_default = get;

  // node_modules/lodash-es/_arrayPush.js
  function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  var arrayPush_default = arrayPush;

  // node_modules/lodash-es/_isFlattenable.js
  var spreadableSymbol = Symbol_default ? Symbol_default.isConcatSpreadable : void 0;
  function isFlattenable(value) {
    return isArray_default(value) || isArguments_default(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }
  var isFlattenable_default = isFlattenable;

  // node_modules/lodash-es/_baseFlatten.js
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1, length = array.length;
    predicate || (predicate = isFlattenable_default);
    result || (result = []);
    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush_default(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  var baseFlatten_default = baseFlatten;

  // node_modules/lodash-es/flatten.js
  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten_default(array, 1) : [];
  }
  var flatten_default = flatten;

  // node_modules/lodash-es/_flatRest.js
  function flatRest(func) {
    return setToString_default(overRest_default(func, void 0, flatten_default), func + "");
  }
  var flatRest_default = flatRest;

  // node_modules/lodash-es/_getPrototype.js
  var getPrototype = overArg_default(Object.getPrototypeOf, Object);
  var getPrototype_default = getPrototype;

  // node_modules/lodash-es/isPlainObject.js
  var objectTag2 = "[object Object]";
  var funcProto3 = Function.prototype;
  var objectProto12 = Object.prototype;
  var funcToString3 = funcProto3.toString;
  var hasOwnProperty10 = objectProto12.hasOwnProperty;
  var objectCtorString = funcToString3.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike_default(value) || baseGetTag_default(value) != objectTag2) {
      return false;
    }
    var proto = getPrototype_default(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty10.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString3.call(Ctor) == objectCtorString;
  }
  var isPlainObject_default = isPlainObject;

  // node_modules/lodash-es/_baseSlice.js
  function baseSlice(array, start, end) {
    var index = -1, length = array.length;
    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : end - start >>> 0;
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }
  var baseSlice_default = baseSlice;

  // node_modules/lodash-es/_stackClear.js
  function stackClear() {
    this.__data__ = new ListCache_default();
    this.size = 0;
  }
  var stackClear_default = stackClear;

  // node_modules/lodash-es/_stackDelete.js
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  var stackDelete_default = stackDelete;

  // node_modules/lodash-es/_stackGet.js
  function stackGet(key) {
    return this.__data__.get(key);
  }
  var stackGet_default = stackGet;

  // node_modules/lodash-es/_stackHas.js
  function stackHas(key) {
    return this.__data__.has(key);
  }
  var stackHas_default = stackHas;

  // node_modules/lodash-es/_stackSet.js
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache_default) {
      var pairs = data.__data__;
      if (!Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache_default(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  var stackSet_default = stackSet;

  // node_modules/lodash-es/_Stack.js
  function Stack(entries) {
    var data = this.__data__ = new ListCache_default(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear_default;
  Stack.prototype["delete"] = stackDelete_default;
  Stack.prototype.get = stackGet_default;
  Stack.prototype.has = stackHas_default;
  Stack.prototype.set = stackSet_default;
  var Stack_default = Stack;

  // node_modules/lodash-es/_baseAssign.js
  function baseAssign(object2, source) {
    return object2 && copyObject_default(source, keys_default(source), object2);
  }
  var baseAssign_default = baseAssign;

  // node_modules/lodash-es/_baseAssignIn.js
  function baseAssignIn(object2, source) {
    return object2 && copyObject_default(source, keysIn_default(source), object2);
  }
  var baseAssignIn_default = baseAssignIn;

  // node_modules/lodash-es/_cloneBuffer.js
  var freeExports3 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule3 = freeExports3 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
  var Buffer3 = moduleExports3 ? root_default.Buffer : void 0;
  var allocUnsafe = Buffer3 ? Buffer3.allocUnsafe : void 0;
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  var cloneBuffer_default = cloneBuffer;

  // node_modules/lodash-es/_arrayFilter.js
  function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  var arrayFilter_default = arrayFilter;

  // node_modules/lodash-es/stubArray.js
  function stubArray() {
    return [];
  }
  var stubArray_default = stubArray;

  // node_modules/lodash-es/_getSymbols.js
  var objectProto13 = Object.prototype;
  var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray_default : function(object2) {
    if (object2 == null) {
      return [];
    }
    object2 = Object(object2);
    return arrayFilter_default(nativeGetSymbols(object2), function(symbol) {
      return propertyIsEnumerable2.call(object2, symbol);
    });
  };
  var getSymbols_default = getSymbols;

  // node_modules/lodash-es/_copySymbols.js
  function copySymbols(source, object2) {
    return copyObject_default(source, getSymbols_default(source), object2);
  }
  var copySymbols_default = copySymbols;

  // node_modules/lodash-es/_getSymbolsIn.js
  var nativeGetSymbols2 = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols2 ? stubArray_default : function(object2) {
    var result = [];
    while (object2) {
      arrayPush_default(result, getSymbols_default(object2));
      object2 = getPrototype_default(object2);
    }
    return result;
  };
  var getSymbolsIn_default = getSymbolsIn;

  // node_modules/lodash-es/_copySymbolsIn.js
  function copySymbolsIn(source, object2) {
    return copyObject_default(source, getSymbolsIn_default(source), object2);
  }
  var copySymbolsIn_default = copySymbolsIn;

  // node_modules/lodash-es/_baseGetAllKeys.js
  function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
    var result = keysFunc(object2);
    return isArray_default(object2) ? result : arrayPush_default(result, symbolsFunc(object2));
  }
  var baseGetAllKeys_default = baseGetAllKeys;

  // node_modules/lodash-es/_getAllKeys.js
  function getAllKeys(object2) {
    return baseGetAllKeys_default(object2, keys_default, getSymbols_default);
  }
  var getAllKeys_default = getAllKeys;

  // node_modules/lodash-es/_getAllKeysIn.js
  function getAllKeysIn(object2) {
    return baseGetAllKeys_default(object2, keysIn_default, getSymbolsIn_default);
  }
  var getAllKeysIn_default = getAllKeysIn;

  // node_modules/lodash-es/_DataView.js
  var DataView = getNative_default(root_default, "DataView");
  var DataView_default = DataView;

  // node_modules/lodash-es/_Promise.js
  var Promise2 = getNative_default(root_default, "Promise");
  var Promise_default = Promise2;

  // node_modules/lodash-es/_Set.js
  var Set2 = getNative_default(root_default, "Set");
  var Set_default = Set2;

  // node_modules/lodash-es/_getTag.js
  var mapTag2 = "[object Map]";
  var objectTag3 = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag2 = "[object Set]";
  var weakMapTag2 = "[object WeakMap]";
  var dataViewTag2 = "[object DataView]";
  var dataViewCtorString = toSource_default(DataView_default);
  var mapCtorString = toSource_default(Map_default);
  var promiseCtorString = toSource_default(Promise_default);
  var setCtorString = toSource_default(Set_default);
  var weakMapCtorString = toSource_default(WeakMap_default);
  var getTag = baseGetTag_default;
  if (DataView_default && getTag(new DataView_default(new ArrayBuffer(1))) != dataViewTag2 || Map_default && getTag(new Map_default()) != mapTag2 || Promise_default && getTag(Promise_default.resolve()) != promiseTag || Set_default && getTag(new Set_default()) != setTag2 || WeakMap_default && getTag(new WeakMap_default()) != weakMapTag2) {
    getTag = function(value) {
      var result = baseGetTag_default(value), Ctor = result == objectTag3 ? value.constructor : void 0, ctorString = Ctor ? toSource_default(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag2;
          case mapCtorString:
            return mapTag2;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag2;
          case weakMapCtorString:
            return weakMapTag2;
        }
      }
      return result;
    };
  }
  var getTag_default = getTag;

  // node_modules/lodash-es/_initCloneArray.js
  var objectProto14 = Object.prototype;
  var hasOwnProperty11 = objectProto14.hasOwnProperty;
  function initCloneArray(array) {
    var length = array.length, result = new array.constructor(length);
    if (length && typeof array[0] == "string" && hasOwnProperty11.call(array, "index")) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  var initCloneArray_default = initCloneArray;

  // node_modules/lodash-es/_Uint8Array.js
  var Uint8Array2 = root_default.Uint8Array;
  var Uint8Array_default = Uint8Array2;

  // node_modules/lodash-es/_cloneArrayBuffer.js
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array_default(result).set(new Uint8Array_default(arrayBuffer));
    return result;
  }
  var cloneArrayBuffer_default = cloneArrayBuffer;

  // node_modules/lodash-es/_cloneDataView.js
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  var cloneDataView_default = cloneDataView;

  // node_modules/lodash-es/_cloneRegExp.js
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  var cloneRegExp_default = cloneRegExp;

  // node_modules/lodash-es/_cloneSymbol.js
  var symbolProto2 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : void 0;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  var cloneSymbol_default = cloneSymbol;

  // node_modules/lodash-es/_cloneTypedArray.js
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  var cloneTypedArray_default = cloneTypedArray;

  // node_modules/lodash-es/_initCloneByTag.js
  var boolTag2 = "[object Boolean]";
  var dateTag2 = "[object Date]";
  var mapTag3 = "[object Map]";
  var numberTag2 = "[object Number]";
  var regexpTag2 = "[object RegExp]";
  var setTag3 = "[object Set]";
  var stringTag2 = "[object String]";
  var symbolTag2 = "[object Symbol]";
  var arrayBufferTag2 = "[object ArrayBuffer]";
  var dataViewTag3 = "[object DataView]";
  var float32Tag2 = "[object Float32Array]";
  var float64Tag2 = "[object Float64Array]";
  var int8Tag2 = "[object Int8Array]";
  var int16Tag2 = "[object Int16Array]";
  var int32Tag2 = "[object Int32Array]";
  var uint8Tag2 = "[object Uint8Array]";
  var uint8ClampedTag2 = "[object Uint8ClampedArray]";
  var uint16Tag2 = "[object Uint16Array]";
  var uint32Tag2 = "[object Uint32Array]";
  function initCloneByTag(object2, tag, isDeep) {
    var Ctor = object2.constructor;
    switch (tag) {
      case arrayBufferTag2:
        return cloneArrayBuffer_default(object2);
      case boolTag2:
      case dateTag2:
        return new Ctor(+object2);
      case dataViewTag3:
        return cloneDataView_default(object2, isDeep);
      case float32Tag2:
      case float64Tag2:
      case int8Tag2:
      case int16Tag2:
      case int32Tag2:
      case uint8Tag2:
      case uint8ClampedTag2:
      case uint16Tag2:
      case uint32Tag2:
        return cloneTypedArray_default(object2, isDeep);
      case mapTag3:
        return new Ctor();
      case numberTag2:
      case stringTag2:
        return new Ctor(object2);
      case regexpTag2:
        return cloneRegExp_default(object2);
      case setTag3:
        return new Ctor();
      case symbolTag2:
        return cloneSymbol_default(object2);
    }
  }
  var initCloneByTag_default = initCloneByTag;

  // node_modules/lodash-es/_initCloneObject.js
  function initCloneObject(object2) {
    return typeof object2.constructor == "function" && !isPrototype_default(object2) ? baseCreate_default(getPrototype_default(object2)) : {};
  }
  var initCloneObject_default = initCloneObject;

  // node_modules/lodash-es/_baseIsMap.js
  var mapTag4 = "[object Map]";
  function baseIsMap(value) {
    return isObjectLike_default(value) && getTag_default(value) == mapTag4;
  }
  var baseIsMap_default = baseIsMap;

  // node_modules/lodash-es/isMap.js
  var nodeIsMap = nodeUtil_default && nodeUtil_default.isMap;
  var isMap = nodeIsMap ? baseUnary_default(nodeIsMap) : baseIsMap_default;
  var isMap_default = isMap;

  // node_modules/lodash-es/_baseIsSet.js
  var setTag4 = "[object Set]";
  function baseIsSet(value) {
    return isObjectLike_default(value) && getTag_default(value) == setTag4;
  }
  var baseIsSet_default = baseIsSet;

  // node_modules/lodash-es/isSet.js
  var nodeIsSet = nodeUtil_default && nodeUtil_default.isSet;
  var isSet = nodeIsSet ? baseUnary_default(nodeIsSet) : baseIsSet_default;
  var isSet_default = isSet;

  // node_modules/lodash-es/_baseClone.js
  var CLONE_DEEP_FLAG = 1;
  var CLONE_FLAT_FLAG = 2;
  var CLONE_SYMBOLS_FLAG = 4;
  var argsTag3 = "[object Arguments]";
  var arrayTag2 = "[object Array]";
  var boolTag3 = "[object Boolean]";
  var dateTag3 = "[object Date]";
  var errorTag2 = "[object Error]";
  var funcTag3 = "[object Function]";
  var genTag2 = "[object GeneratorFunction]";
  var mapTag5 = "[object Map]";
  var numberTag3 = "[object Number]";
  var objectTag4 = "[object Object]";
  var regexpTag3 = "[object RegExp]";
  var setTag5 = "[object Set]";
  var stringTag3 = "[object String]";
  var symbolTag3 = "[object Symbol]";
  var weakMapTag3 = "[object WeakMap]";
  var arrayBufferTag3 = "[object ArrayBuffer]";
  var dataViewTag4 = "[object DataView]";
  var float32Tag3 = "[object Float32Array]";
  var float64Tag3 = "[object Float64Array]";
  var int8Tag3 = "[object Int8Array]";
  var int16Tag3 = "[object Int16Array]";
  var int32Tag3 = "[object Int32Array]";
  var uint8Tag3 = "[object Uint8Array]";
  var uint8ClampedTag3 = "[object Uint8ClampedArray]";
  var uint16Tag3 = "[object Uint16Array]";
  var uint32Tag3 = "[object Uint32Array]";
  var cloneableTags = {};
  cloneableTags[argsTag3] = cloneableTags[arrayTag2] = cloneableTags[arrayBufferTag3] = cloneableTags[dataViewTag4] = cloneableTags[boolTag3] = cloneableTags[dateTag3] = cloneableTags[float32Tag3] = cloneableTags[float64Tag3] = cloneableTags[int8Tag3] = cloneableTags[int16Tag3] = cloneableTags[int32Tag3] = cloneableTags[mapTag5] = cloneableTags[numberTag3] = cloneableTags[objectTag4] = cloneableTags[regexpTag3] = cloneableTags[setTag5] = cloneableTags[stringTag3] = cloneableTags[symbolTag3] = cloneableTags[uint8Tag3] = cloneableTags[uint8ClampedTag3] = cloneableTags[uint16Tag3] = cloneableTags[uint32Tag3] = true;
  cloneableTags[errorTag2] = cloneableTags[funcTag3] = cloneableTags[weakMapTag3] = false;
  function baseClone(value, bitmask, customizer, key, object2, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object2 ? customizer(value, key, object2, stack) : customizer(value);
    }
    if (result !== void 0) {
      return result;
    }
    if (!isObject_default(value)) {
      return value;
    }
    var isArr = isArray_default(value);
    if (isArr) {
      result = initCloneArray_default(value);
      if (!isDeep) {
        return copyArray_default(value, result);
      }
    } else {
      var tag = getTag_default(value), isFunc = tag == funcTag3 || tag == genTag2;
      if (isBuffer_default(value)) {
        return cloneBuffer_default(value, isDeep);
      }
      if (tag == objectTag4 || tag == argsTag3 || isFunc && !object2) {
        result = isFlat || isFunc ? {} : initCloneObject_default(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn_default(value, baseAssignIn_default(result, value)) : copySymbols_default(value, baseAssign_default(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object2 ? value : {};
        }
        result = initCloneByTag_default(value, tag, isDeep);
      }
    }
    stack || (stack = new Stack_default());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    if (isSet_default(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap_default(value)) {
      value.forEach(function(subValue, key2) {
        result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
    }
    var keysFunc = isFull ? isFlat ? getAllKeysIn_default : getAllKeys_default : isFlat ? keysIn_default : keys_default;
    var props = isArr ? void 0 : keysFunc(value);
    arrayEach_default(props || value, function(subValue, key2) {
      if (props) {
        key2 = subValue;
        subValue = value[key2];
      }
      assignValue_default(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
    return result;
  }
  var baseClone_default = baseClone;

  // node_modules/lodash-es/_setCacheAdd.js
  var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED3);
    return this;
  }
  var setCacheAdd_default = setCacheAdd;

  // node_modules/lodash-es/_setCacheHas.js
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  var setCacheHas_default = setCacheHas;

  // node_modules/lodash-es/_SetCache.js
  function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache_default();
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd_default;
  SetCache.prototype.has = setCacheHas_default;
  var SetCache_default = SetCache;

  // node_modules/lodash-es/_arraySome.js
  function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  var arraySome_default = arraySome;

  // node_modules/lodash-es/_cacheHas.js
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  var cacheHas_default = cacheHas;

  // node_modules/lodash-es/_equalArrays.js
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache_default() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome_default(other, function(othValue2, othIndex) {
          if (!cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  var equalArrays_default = equalArrays;

  // node_modules/lodash-es/_mapToArray.js
  function mapToArray(map) {
    var index = -1, result = Array(map.size);
    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  var mapToArray_default = mapToArray;

  // node_modules/lodash-es/_setToArray.js
  function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  var setToArray_default = setToArray;

  // node_modules/lodash-es/_equalByTag.js
  var COMPARE_PARTIAL_FLAG2 = 1;
  var COMPARE_UNORDERED_FLAG2 = 2;
  var boolTag4 = "[object Boolean]";
  var dateTag4 = "[object Date]";
  var errorTag3 = "[object Error]";
  var mapTag6 = "[object Map]";
  var numberTag4 = "[object Number]";
  var regexpTag4 = "[object RegExp]";
  var setTag6 = "[object Set]";
  var stringTag4 = "[object String]";
  var symbolTag4 = "[object Symbol]";
  var arrayBufferTag4 = "[object ArrayBuffer]";
  var dataViewTag5 = "[object DataView]";
  var symbolProto3 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf2 = symbolProto3 ? symbolProto3.valueOf : void 0;
  function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag5:
        if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
          return false;
        }
        object2 = object2.buffer;
        other = other.buffer;
      case arrayBufferTag4:
        if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array_default(object2), new Uint8Array_default(other))) {
          return false;
        }
        return true;
      case boolTag4:
      case dateTag4:
      case numberTag4:
        return eq_default(+object2, +other);
      case errorTag3:
        return object2.name == other.name && object2.message == other.message;
      case regexpTag4:
      case stringTag4:
        return object2 == other + "";
      case mapTag6:
        var convert = mapToArray_default;
      case setTag6:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
        convert || (convert = setToArray_default);
        if (object2.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object2);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG2;
        stack.set(object2, other);
        var result = equalArrays_default(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object2);
        return result;
      case symbolTag4:
        if (symbolValueOf2) {
          return symbolValueOf2.call(object2) == symbolValueOf2.call(other);
        }
    }
    return false;
  }
  var equalByTag_default = equalByTag;

  // node_modules/lodash-es/_equalObjects.js
  var COMPARE_PARTIAL_FLAG3 = 1;
  var objectProto15 = Object.prototype;
  var hasOwnProperty12 = objectProto15.hasOwnProperty;
  function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = getAllKeys_default(object2), objLength = objProps.length, othProps = getAllKeys_default(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty12.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object2);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object2;
    }
    var result = true;
    stack.set(object2, other);
    stack.set(other, object2);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object2[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object2.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object2);
    stack["delete"](other);
    return result;
  }
  var equalObjects_default = equalObjects;

  // node_modules/lodash-es/_baseIsEqualDeep.js
  var COMPARE_PARTIAL_FLAG4 = 1;
  var argsTag4 = "[object Arguments]";
  var arrayTag3 = "[object Array]";
  var objectTag5 = "[object Object]";
  var objectProto16 = Object.prototype;
  var hasOwnProperty13 = objectProto16.hasOwnProperty;
  function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray_default(object2), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag3 : getTag_default(object2), othTag = othIsArr ? arrayTag3 : getTag_default(other);
    objTag = objTag == argsTag4 ? objectTag5 : objTag;
    othTag = othTag == argsTag4 ? objectTag5 : othTag;
    var objIsObj = objTag == objectTag5, othIsObj = othTag == objectTag5, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer_default(object2)) {
      if (!isBuffer_default(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack_default());
      return objIsArr || isTypedArray_default(object2) ? equalArrays_default(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag_default(object2, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
      var objIsWrapped = objIsObj && hasOwnProperty13.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty13.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack_default());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack_default());
    return equalObjects_default(object2, other, bitmask, customizer, equalFunc, stack);
  }
  var baseIsEqualDeep_default = baseIsEqualDeep;

  // node_modules/lodash-es/_baseIsEqual.js
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  var baseIsEqual_default = baseIsEqual;

  // node_modules/lodash-es/_baseIsMatch.js
  var COMPARE_PARTIAL_FLAG5 = 1;
  var COMPARE_UNORDERED_FLAG3 = 2;
  function baseIsMatch(object2, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object2 == null) {
      return !length;
    }
    object2 = Object(object2);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object2[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === void 0 && !(key in object2)) {
          return false;
        }
      } else {
        var stack = new Stack_default();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object2, source, stack);
        }
        if (!(result === void 0 ? baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  var baseIsMatch_default = baseIsMatch;

  // node_modules/lodash-es/_isStrictComparable.js
  function isStrictComparable(value) {
    return value === value && !isObject_default(value);
  }
  var isStrictComparable_default = isStrictComparable;

  // node_modules/lodash-es/_getMatchData.js
  function getMatchData(object2) {
    var result = keys_default(object2), length = result.length;
    while (length--) {
      var key = result[length], value = object2[key];
      result[length] = [key, value, isStrictComparable_default(value)];
    }
    return result;
  }
  var getMatchData_default = getMatchData;

  // node_modules/lodash-es/_matchesStrictComparable.js
  function matchesStrictComparable(key, srcValue) {
    return function(object2) {
      if (object2 == null) {
        return false;
      }
      return object2[key] === srcValue && (srcValue !== void 0 || key in Object(object2));
    };
  }
  var matchesStrictComparable_default = matchesStrictComparable;

  // node_modules/lodash-es/_baseMatches.js
  function baseMatches(source) {
    var matchData = getMatchData_default(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
    }
    return function(object2) {
      return object2 === source || baseIsMatch_default(object2, source, matchData);
    };
  }
  var baseMatches_default = baseMatches;

  // node_modules/lodash-es/_baseHasIn.js
  function baseHasIn(object2, key) {
    return object2 != null && key in Object(object2);
  }
  var baseHasIn_default = baseHasIn;

  // node_modules/lodash-es/_hasPath.js
  function hasPath(object2, path, hasFunc) {
    path = castPath_default(path, object2);
    var index = -1, length = path.length, result = false;
    while (++index < length) {
      var key = toKey_default(path[index]);
      if (!(result = object2 != null && hasFunc(object2, key))) {
        break;
      }
      object2 = object2[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object2 == null ? 0 : object2.length;
    return !!length && isLength_default(length) && isIndex_default(key, length) && (isArray_default(object2) || isArguments_default(object2));
  }
  var hasPath_default = hasPath;

  // node_modules/lodash-es/hasIn.js
  function hasIn(object2, path) {
    return object2 != null && hasPath_default(object2, path, baseHasIn_default);
  }
  var hasIn_default = hasIn;

  // node_modules/lodash-es/_baseMatchesProperty.js
  var COMPARE_PARTIAL_FLAG6 = 1;
  var COMPARE_UNORDERED_FLAG4 = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey_default(path, srcValue)) {
      return matchesStrictComparable_default(toKey_default(path), srcValue);
    }
    return function(object2) {
      var objValue = get_default(object2, path);
      return objValue === void 0 && objValue === srcValue ? hasIn_default(object2, path) : baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
    };
  }
  var baseMatchesProperty_default = baseMatchesProperty;

  // node_modules/lodash-es/_baseProperty.js
  function baseProperty(key) {
    return function(object2) {
      return object2 == null ? void 0 : object2[key];
    };
  }
  var baseProperty_default = baseProperty;

  // node_modules/lodash-es/_basePropertyDeep.js
  function basePropertyDeep(path) {
    return function(object2) {
      return baseGet_default(object2, path);
    };
  }
  var basePropertyDeep_default = basePropertyDeep;

  // node_modules/lodash-es/property.js
  function property(path) {
    return isKey_default(path) ? baseProperty_default(toKey_default(path)) : basePropertyDeep_default(path);
  }
  var property_default = property;

  // node_modules/lodash-es/_baseIteratee.js
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity_default;
    }
    if (typeof value == "object") {
      return isArray_default(value) ? baseMatchesProperty_default(value[0], value[1]) : baseMatches_default(value);
    }
    return property_default(value);
  }
  var baseIteratee_default = baseIteratee;

  // node_modules/lodash-es/last.js
  function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : void 0;
  }
  var last_default = last;

  // node_modules/lodash-es/_parent.js
  function parent(object2, path) {
    return path.length < 2 ? object2 : baseGet_default(object2, baseSlice_default(path, 0, -1));
  }
  var parent_default = parent;

  // node_modules/lodash-es/_baseUnset.js
  function baseUnset(object2, path) {
    path = castPath_default(path, object2);
    object2 = parent_default(object2, path);
    return object2 == null || delete object2[toKey_default(last_default(path))];
  }
  var baseUnset_default = baseUnset;

  // node_modules/lodash-es/_customOmitClone.js
  function customOmitClone(value) {
    return isPlainObject_default(value) ? void 0 : value;
  }
  var customOmitClone_default = customOmitClone;

  // node_modules/lodash-es/omit.js
  var CLONE_DEEP_FLAG2 = 1;
  var CLONE_FLAT_FLAG2 = 2;
  var CLONE_SYMBOLS_FLAG2 = 4;
  var omit = flatRest_default(function(object2, paths) {
    var result = {};
    if (object2 == null) {
      return result;
    }
    var isDeep = false;
    paths = arrayMap_default(paths, function(path) {
      path = castPath_default(path, object2);
      isDeep || (isDeep = path.length > 1);
      return path;
    });
    copyObject_default(object2, getAllKeysIn_default(object2), result);
    if (isDeep) {
      result = baseClone_default(result, CLONE_DEEP_FLAG2 | CLONE_FLAT_FLAG2 | CLONE_SYMBOLS_FLAG2, customOmitClone_default);
    }
    var length = paths.length;
    while (length--) {
      baseUnset_default(result, paths[length]);
    }
    return result;
  });
  var omit_default = omit;

  // node_modules/lodash-es/_baseSet.js
  function baseSet(object2, path, value, customizer) {
    if (!isObject_default(object2)) {
      return object2;
    }
    path = castPath_default(path, object2);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object2;
    while (nested != null && ++index < length) {
      var key = toKey_default(path[index]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object2;
      }
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject_default(objValue) ? objValue : isIndex_default(path[index + 1]) ? [] : {};
        }
      }
      assignValue_default(nested, key, newValue);
      nested = nested[key];
    }
    return object2;
  }
  var baseSet_default = baseSet;

  // node_modules/lodash-es/_basePickBy.js
  function basePickBy(object2, paths, predicate) {
    var index = -1, length = paths.length, result = {};
    while (++index < length) {
      var path = paths[index], value = baseGet_default(object2, path);
      if (predicate(value, path)) {
        baseSet_default(result, castPath_default(path, object2), value);
      }
    }
    return result;
  }
  var basePickBy_default = basePickBy;

  // node_modules/lodash-es/pickBy.js
  function pickBy(object2, predicate) {
    if (object2 == null) {
      return {};
    }
    var props = arrayMap_default(getAllKeysIn_default(object2), function(prop) {
      return [prop];
    });
    predicate = baseIteratee_default(predicate);
    return basePickBy_default(object2, props, function(value, path) {
      return predicate(value, path[0]);
    });
  }
  var pickBy_default = pickBy;

  // node_modules/@datagram-network/conference-sdk/dist/index.mjs
  var DATAGRAM_DOMAIN_URL = "https://demo.datagram.network";
  var __accessCheck$1 = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet$1 = (obj, member, getter) => {
    __accessCheck$1(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd$1 = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet$1 = (obj, member, value, setter) => {
    __accessCheck$1(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var _alias;
  var _origin;
  var _token;
  var ClientSchema = required(
    object({
      alias: string(),
      origin: optional(string()),
      token: optional(string())
    }),
    ["alias"]
  );
  var _Client = class _Client2 {
    constructor(params) {
      __privateAdd$1(this, _alias, void 0);
      __privateAdd$1(this, _origin, void 0);
      __privateAdd$1(this, _token, void 0);
      __privateSet$1(this, _alias, params.alias);
      __privateSet$1(this, _origin, params.origin || DATAGRAM_DOMAIN_URL);
      __privateSet$1(this, _token, params.token || "");
    }
    static create(params) {
      params = parse(ClientSchema, params);
      return new _Client2(params);
    }
    get alias() {
      return __privateGet$1(this, _alias);
    }
    get origin() {
      return __privateGet$1(this, _origin);
    }
    get token() {
      return __privateGet$1(this, _token);
    }
  };
  _alias = /* @__PURE__ */ new WeakMap();
  _origin = /* @__PURE__ */ new WeakMap();
  _token = /* @__PURE__ */ new WeakMap();
  var Client = _Client;
  function serialize(obj) {
    const str = [];
    for (const p in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
      }
    }
    return str.join("&");
  }
  var conferenceMetadataSchema = object({
    title: optional(string(), "")
  });
  var conferenceOptionsSchema = pipe(
    object({
      skipMediaSettings: optional(boolean(), false),
      turnOnMic: optional(boolean(), false),
      turnOnCam: optional(boolean(), false),
      metadata: optional(conferenceMetadataSchema),
      authorization: optional(string(), "")
    }),
    transform((val) => {
      const excludeVal = omit_default(val, ["skipMediaSettings", "turnOnMic", "turnOnCam", "metadata"]);
      return {
        s: val.skipMediaSettings ? 1 : 0,
        a: val.turnOnMic ? 1 : 0,
        v: val.turnOnCam ? 1 : 0,
        ...excludeVal
      };
    })
  );
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };
  var _client;
  var _options;
  var _waitForIframeAbortController;
  var _selector;
  var _createIframe;
  var createIframe_fn;
  var _waitForIframe;
  var waitForIframe_fn;
  var Conference = class {
    constructor(client, options = {}) {
      __privateAdd(this, _createIframe);
      __privateAdd(this, _waitForIframe);
      __privateAdd(this, _client, void 0);
      __privateAdd(this, _options, void 0);
      __privateAdd(this, _waitForIframeAbortController, null);
      __privateAdd(this, _selector, null);
      __privateSet(this, _client, client);
      __privateSet(this, _options, options);
    }
    mount(selector) {
      var _a, _b;
      (_a = __privateGet(this, _waitForIframeAbortController)) == null ? void 0 : _a.abort();
      const { iframe } = __privateMethod(this, _createIframe, createIframe_fn).call(this);
      __privateSet(this, _selector, selector);
      if (typeof selector === "string") {
        (_b = document.querySelector(selector)) == null ? void 0 : _b.appendChild(iframe);
      } else {
        selector.appendChild(iframe);
      }
      return __privateMethod(this, _waitForIframe, waitForIframe_fn).call(this, iframe);
    }
    dispose() {
      var _a, _b;
      __privateSet(this, _client, null);
      if (typeof __privateGet(this, _selector) === "string") {
        (_a = document.querySelector(__privateGet(this, _selector))) == null ? void 0 : _a.removeChild(document.querySelector("iframe"));
      } else {
        (_b = __privateGet(this, _selector)) == null ? void 0 : _b.removeChild(document.querySelector("iframe"));
      }
    }
  };
  _client = /* @__PURE__ */ new WeakMap();
  _options = /* @__PURE__ */ new WeakMap();
  _waitForIframeAbortController = /* @__PURE__ */ new WeakMap();
  _selector = /* @__PURE__ */ new WeakMap();
  _createIframe = /* @__PURE__ */ new WeakSet();
  createIframe_fn = function() {
    var _a, _b, _c;
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute(
      "allow",
      "camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write; picture-in-picture"
    );
    iframe.setAttribute("title", ((_a = __privateGet(this, _options).metadata) == null ? void 0 : _a.title) || "Datagram Conference");
    const parsedOptions = parse(conferenceOptionsSchema, __privateGet(this, _options));
    const compactedOptions = pickBy_default(parsedOptions, (val) => {
      if (val === 0) {
        return true;
      }
      return !!val;
    });
    const queryString = serialize(compactedOptions);
    const fullPath = `${(_b = __privateGet(this, _client)) == null ? void 0 : _b.origin}/c/${(_c = __privateGet(this, _client)) == null ? void 0 : _c.alias}`;
    const finalPath = queryString ? `${fullPath}?${queryString}` : fullPath;
    iframe.src = finalPath;
    return { iframe };
  };
  _waitForIframe = /* @__PURE__ */ new WeakSet();
  waitForIframe_fn = function(iframe) {
    __privateSet(this, _waitForIframeAbortController, new AbortController());
    const controller = __privateGet(this, _waitForIframeAbortController);
    return new Promise((resolve, reject) => {
      iframe.addEventListener("load", () => {
        const readyInterval = setInterval(() => {
          var _a;
          (_a = iframe.contentWindow) == null ? void 0 : _a.postMessage("request-ready", "*");
        });
        controller.signal.addEventListener("abort", () => {
          clearInterval(readyInterval);
        });
        window.addEventListener(
          "message",
          async (event) => {
            var _a;
            if (event.data === "conference-ready") {
              try {
                window.clearInterval(readyInterval);
                (_a = iframe.contentWindow) == null ? void 0 : _a.postMessage("parent-ready", "*");
                resolve();
              } catch (e) {
                reject(e);
              }
              controller.abort();
            }
            if (event.data === "call-ready") {
              resolve();
            }
          },
          { signal: controller.signal }
        );
      });
    });
  };
  return __toCommonJS(datagram_sdk_wrapper_exports);
})();
/*! Bundled license information:

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
