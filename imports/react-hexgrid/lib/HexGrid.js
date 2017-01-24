(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'react', './Hex', './HexShape', './Path', './Layout', './GridGenerator'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('react'), require('./Hex'), require('./HexShape'), require('./Path'), require('./Layout'), require('./GridGenerator'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.React, global.Hex, global.HexShape, global.Path, global.Layout, global.GridGenerator);
    global.HexGrid = mod.exports;
  }
})(this, function (exports, _react, _Hex, _HexShape, _Path, _Layout, _GridGenerator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  var _Hex2 = _interopRequireDefault(_Hex);

  var _HexShape2 = _interopRequireDefault(_HexShape);

  var _Path2 = _interopRequireDefault(_Path);

  var _Layout2 = _interopRequireDefault(_Layout);

  var _GridGenerator2 = _interopRequireDefault(_GridGenerator);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _React$PropTypes = _react2.default.PropTypes,
      number = _React$PropTypes.number,
      object = _React$PropTypes.object,
      bool = _React$PropTypes.bool,
      string = _React$PropTypes.string,
      array = _React$PropTypes.array;

  var HexGrid = function (_React$Component) {
    _inherits(HexGrid, _React$Component);

    function HexGrid() {
      _classCallCheck(this, HexGrid);

      return _possibleConstructorReturn(this, (HexGrid.__proto__ || Object.getPrototypeOf(HexGrid)).apply(this, arguments));
    }

    _createClass(HexGrid, [{
      key: 'render',
      value: function render() {
        var _this2 = this;

        return _react2.default.createElement(
          'svg',
          { className: 'grid', width: this.props.width, height: this.props.height, viewBox: '-50 -50 100 100', version: '1.1', xmlns: 'http://www.w3.org/2000/svg' },
          this.props.hexagons.map(function (hex, index) {
            return _react2.default.createElement(_HexShape2.default, { key: index, hex: hex, layout: _this2.props.layout, actions: _this2.props.actions });
          }),
          _react2.default.createElement(_Path2.default, _extends({}, this.props.path, { layout: this.props.layout }))
        );
      }
    }]);

    return HexGrid;
  }(_react2.default.Component);

  HexGrid.generate = function (config, content) {
    var layout = new _Layout2.default(config.layout, config.origin);
    var generator = _GridGenerator2.default.getGenerator(config.map);
    var hexagons = generator.apply(undefined, config.mapProps);

    return { hexagons: hexagons, layout: layout };
  };

  HexGrid.propTypes = {
    width: number.isRequired,
    height: number.isRequired,
    actions: object.isRequired,
    layout: object.isRequired,
    hexagons: array.isRequired,
    path: object
  };

  HexGrid.defaultProps = {
    width: 800,
    height: 600,
    path: { start: null, end: null },
    actions: {},
    draggable: false,
    droppable: false
  };

  exports.default = HexGrid;
});