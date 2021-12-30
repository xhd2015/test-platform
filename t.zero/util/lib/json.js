"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluateObject = evaluateObject;
exports.executeOnJson = executeOnJson;
exports.formatPossibleJSON = formatPossibleJSON;
exports.getIndexPath = getIndexPath;
exports.getJsonPath = getJsonPath;
exports.getPossibleJSONObject = getPossibleJSONObject;
exports.parse = parse;
exports.stringify = stringify;

var jsonUtils = _interopRequireWildcard(require("@fultonjs/common/lib/json"));

var _strings = require("./strings");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function parse(json, ...options) {
  return jsonUtils.parseJSONSafeBigint(json, ...options);
}

function stringify(object, ...options) {
  return jsonUtils.stringifyJSONSafeBigint(object, ...options);
}
/**
 * if given parameter is a String, try to return its represented json object
 * otherwise return the parameter itself unchanged
 * @param text
 * @return {*}
 */


function getPossibleJSONObject(text, inputMayNotBeJsExpr) {
  if (text == null) {
    return null;
  }

  if (text.constructor === String) {
    let trimed = text.trimStart();

    if (trimed.startsWith("[") || trimed.startsWith("{") || trimed.startsWith("\"")) {
      try {
        if (inputMayNotBeJsExpr) {
          return parse(text);
        } else {
          return evaluateObject(text);
        }
      } catch (e) {// ignore
      }
    }
  }

  return text;
} // options: compress=whether compress the data
//          keys:boolean,  return keys of that object


function formatPossibleJSON(text, option) {
  let obj = getPossibleJSONObject(text);

  if (obj == null) {
    return null;
  }

  if (obj.constructor === String) {
    return obj;
  } else if (obj.constructor === Set) {
    obj = [...obj];
  }

  if (option?.keys && typeof obj === 'object' && !Array.isArray(obj)) {
    obj = Object.keys(obj);
  }

  if (option && option.compress) {
    return stringify(obj);
  }

  return stringify(obj, null, "    ");
}
/**
 * get json path, the last part uses a prefix match
 * @param json
 * @param pathArray
 * @returns {*}
 */


function getJsonPath(json, pathArray) {
  let current = json;
  let n = pathArray.length;

  for (let i = 0; i < n - 1; ++i) {
    current = getIndexPath(current, pathArray[i]);

    if (current == null) {
      return current;
    }
  }

  if (n > 0) {
    if (current == null) {
      return current;
    }

    let lastPart = pathArray[n - 1];

    if (lastPart) {
      if (current.constructor !== Object) {
        return getIndexPath(current, lastPart);
      } else {
        let filtered = {};

        for (let k in current) {
          if (k.startsWith(lastPart)) {
            filtered[k] = current[k];
          }
        }

        return filtered;
      }
    }
  }

  return current;
}

function getIndexPath(json, path) {
  if (json == null) {
    return null;
  }

  if (path.startsWith("[")) {
    if (!path.endsWith("]")) {
      throw `path:${path} is invalid`;
    }

    let inner = path.substring(1, path.length - 1);
    inner = (0, _strings.unquoteString)(inner);

    if (!inner) {
      throw `path:${path} is invalid`;
    }

    if (json.constructor === Array) {
      let n = (0, _strings.possibleNumberOf)(inner);

      if (n != null && n.constructor === Number) {
        return json[n];
      }

      return null;
    } else {
      return json[inner];
    }
  } else {
    return json[path];
  }
} // allow any javascript expression,including json whose key is numeric


function evaluateObject(s) {
  return eval('(' + s + ')');
}

function executeOnJson(json, f) {
  f.bind(json)();
}