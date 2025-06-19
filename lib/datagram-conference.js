import { required, object, string, optional, parse, pipe, boolean, transform } from 'valibot';
import { omit, pickBy } from 'lodash-es';

const DATAGRAM_DOMAIN_URL = "https://demo.datagram.network";

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
var _alias, _origin, _token;
const ClientSchema = required(
  object({
    alias: string(),
    origin: optional(string()),
    token: optional(string())
  }),
  ["alias"]
);
const _Client = class _Client {
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
    return new _Client(params);
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
_alias = new WeakMap();
_origin = new WeakMap();
_token = new WeakMap();
let Client = _Client;

function serialize(obj) {
  const str = [];
  for (const p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  }
  return str.join("&");
}

const conferenceMetadataSchema = object({
  title: optional(string(), "")
});
const conferenceOptionsSchema = pipe(
  object({
    skipMediaSettings: optional(boolean(), false),
    turnOnMic: optional(boolean(), false),
    turnOnCam: optional(boolean(), false),
    metadata: optional(conferenceMetadataSchema),
    authorization: optional(string(), "")
  }),
  transform((val) => {
    const excludeVal = omit(val, ["skipMediaSettings", "turnOnMic", "turnOnCam", "metadata"]);
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
var _client, _options, _waitForIframeAbortController, _selector, _createIframe, createIframe_fn, _waitForIframe, waitForIframe_fn;
class Conference {
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
    __privateGet(this, _waitForIframeAbortController)?.abort();
    const { iframe } = __privateMethod(this, _createIframe, createIframe_fn).call(this);
    __privateSet(this, _selector, selector);
    if (typeof selector === "string") {
      document.querySelector(selector)?.appendChild(iframe);
    } else {
      selector.appendChild(iframe);
    }
    return __privateMethod(this, _waitForIframe, waitForIframe_fn).call(this, iframe);
  }
  dispose() {
    __privateSet(this, _client, null);
    if (typeof __privateGet(this, _selector) === "string") {
      document.querySelector(__privateGet(this, _selector))?.removeChild(document.querySelector("iframe"));
    } else {
      __privateGet(this, _selector)?.removeChild(document.querySelector("iframe"));
    }
  }
}
_client = new WeakMap();
_options = new WeakMap();
_waitForIframeAbortController = new WeakMap();
_selector = new WeakMap();
_createIframe = new WeakSet();
createIframe_fn = function() {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.setAttribute(
    "allow",
    "camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write; speaker-selection; picture-in-picture"
  );
  iframe.setAttribute("title", __privateGet(this, _options).metadata?.title || "Datagram Conference");
  const parsedOptions = parse(conferenceOptionsSchema, __privateGet(this, _options));
  const compactedOptions = pickBy(parsedOptions, (val) => {
    if (val === 0) {
      return true;
    }
    return !!val;
  });
  const queryString = serialize(compactedOptions);
  const fullPath = `${__privateGet(this, _client)?.origin}/c/${__privateGet(this, _client)?.alias}`;
  const finalPath = queryString ? `${fullPath}?${queryString}` : fullPath;
  iframe.src = finalPath;
  return { iframe };
};
_waitForIframe = new WeakSet();
waitForIframe_fn = function(iframe) {
  __privateSet(this, _waitForIframeAbortController, new AbortController());
  const controller = __privateGet(this, _waitForIframeAbortController);
  return new Promise((resolve, reject) => {
    iframe.addEventListener("load", () => {
      const readyInterval = setInterval(() => {
        iframe.contentWindow?.postMessage("request-ready", "*");
      });
      controller.signal.addEventListener("abort", () => {
        clearInterval(readyInterval);
      });
      window.addEventListener(
        "message",
        async (event) => {
          if (event.data === "conference-ready") {
            try {
              window.clearInterval(readyInterval);
              iframe.contentWindow?.postMessage("parent-ready", "*");
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

export { Client, Conference };
