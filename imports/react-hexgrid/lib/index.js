(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './Hex', './HexGrid', './Layout', './HexUtils'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./Hex'), require('./HexGrid'), require('./Layout'), require('./HexUtils'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Hex, global.HexGrid, global.Layout, global.HexUtils);
    global.index = mod.exports;
  }
})(this, function (exports, _Hex, _HexGrid, _Layout, _HexUtils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.HexUtils = exports.Layout = exports.Hex = exports.HexGrid = undefined;

  var _Hex2 = _interopRequireDefault(_Hex);

  var _HexGrid2 = _interopRequireDefault(_HexGrid);

  var _Layout2 = _interopRequireDefault(_Layout);

  var _HexUtils2 = _interopRequireDefault(_HexUtils);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.HexGrid = _HexGrid2.default;
  exports.Hex = _Hex2.default;
  exports.Layout = _Layout2.default;
  exports.HexUtils = _HexUtils2.default;
});