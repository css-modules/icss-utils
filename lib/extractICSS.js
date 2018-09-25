"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const importPattern = /^:import\(("[^"]*"|'[^']*')(?:\s(.+))?\)$/;

const getDeclsObject = rule => {
  const object = {};
  rule.walkDecls(decl => {
    object[decl.raws.before.trim() + decl.prop] = decl.value;
  });
  return object;
};

const extractICSS = (css, removeRules = true) => {
  const icssImports = {};
  const icssExports = {};
  css.each(node => {
    if (node.type === "rule") {
      if (node.selector.slice(0, 7) === ":import") {
        const matches = importPattern.exec(node.selector);

        if (matches) {
          const path = matches[1].replace(/'|"/g, "");
          const extra = matches[2] ? matches[2] : "";
          const dep = `"${path}"${extra ? ` ${extra}` : ""}`;
          icssImports[dep] = Object.assign(icssImports[dep] || {}, _objectSpread({
            path
          }, extra ? {
            extra
          } : {}, {
            tokens: Object.assign(icssImports[dep] ? icssImports[dep].tokens : {}, getDeclsObject(node))
          }));

          if (removeRules) {
            node.remove();
          }
        }
      }

      if (node.selector === ":export") {
        Object.assign(icssExports, getDeclsObject(node));

        if (removeRules) {
          node.remove();
        }
      }
    }
  });
  return {
    icssImports,
    icssExports
  };
};

var _default = extractICSS;
exports.default = _default;