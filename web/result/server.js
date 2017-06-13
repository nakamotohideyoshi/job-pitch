require("source-map-support").install();
module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 159);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _stringify = __webpack_require__(132);

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = __webpack_require__(133);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Isomorphic CSS style loader for Webpack
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

var prefix = 's';
var inserted = {};

// Base64 encoding and decoding - The "Unicode Problem"
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

/**
 * Remove style/link elements for specified node IDs
 * if they are no longer referenced by UI components.
 */
function removeCss(ids) {
  ids.forEach(function (id) {
    if (--inserted[id] <= 0) {
      var elem = document.getElementById(prefix + id);
      if (elem) {
        elem.parentNode.removeChild(elem);
      }
    }
  });
}

/**
 * Example:
 *   // Insert CSS styles object generated by `css-loader` into DOM
 *   var removeCss = insertCss([[1, 'body { color: red; }']]);
 *
 *   // Remove it from the DOM
 *   removeCss();
 */
function insertCss(styles) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$replace = _ref.replace,
      replace = _ref$replace === undefined ? false : _ref$replace,
      _ref$prepend = _ref.prepend,
      prepend = _ref$prepend === undefined ? false : _ref$prepend;

  var ids = [];
  for (var i = 0; i < styles.length; i++) {
    var _styles$i = (0, _slicedToArray3.default)(styles[i], 4),
        moduleId = _styles$i[0],
        css = _styles$i[1],
        media = _styles$i[2],
        sourceMap = _styles$i[3];

    var id = moduleId + '-' + i;

    ids.push(id);

    if (inserted[id]) {
      if (!replace) {
        inserted[id]++;
        continue;
      }
    }

    inserted[id] = 1;

    var elem = document.getElementById(prefix + id);
    var create = false;

    if (!elem) {
      create = true;

      elem = document.createElement('style');
      elem.setAttribute('type', 'text/css');
      elem.id = prefix + id;

      if (media) {
        elem.setAttribute('media', media);
      }
    }

    var cssText = css;
    if (sourceMap && typeof btoa === 'function') {
      // skip IE9 and below, see http://caniuse.com/atob-btoa
      cssText += '\n/*# sourceMappingURL=data:application/json;base64,' + b64EncodeUnicode((0, _stringify2.default)(sourceMap)) + '*/';
      cssText += '\n/*# sourceURL=' + sourceMap.file + '?' + id + '*/';
    }

    if ('textContent' in elem) {
      elem.textContent = cssText;
    } else {
      elem.styleSheet.cssText = cssText;
    }

    if (create) {
      if (prepend) {
        document.head.insertBefore(elem, document.head.childNodes[0]);
      } else {
        document.head.appendChild(elem);
      }
    }
  }

  return removeCss.bind(null, ids);
}

module.exports = insertCss;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("isomorphic-style-loader/lib/withStyles");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* eslint-disable import/prefer-default-export */

/* action_types */

const SET_RUNTIME_VARIABLE = 'SET_RUNTIME_VARIABLE';
/* harmony export (immutable) */ __webpack_exports__["l"] = SET_RUNTIME_VARIABLE;


const SET_GLOBAL_STETE = 'SET_GLOBAL_STETE';
/* harmony export (immutable) */ __webpack_exports__["a"] = SET_GLOBAL_STETE;


const SELECT_TYPE = 'SELECT_TYPE';
/* harmony export (immutable) */ __webpack_exports__["j"] = SELECT_TYPE;


const BUSINESSES = 'BUSINESSES';
/* harmony export (immutable) */ __webpack_exports__["m"] = BUSINESSES;


/* global_state */

const GS_NONE = '';
/* harmony export (immutable) */ __webpack_exports__["b"] = GS_NONE;

const GS_LOADING = 'GS_LOADING';
/* harmony export (immutable) */ __webpack_exports__["c"] = GS_LOADING;

const GS_API_ERROR = 'GS_API_ERROR';
/* harmony export (immutable) */ __webpack_exports__["g"] = GS_API_ERROR;

const GS_ERROR = 'GS_ERROR';
/* harmony export (immutable) */ __webpack_exports__["d"] = GS_ERROR;

const GS_WARNING = 'GS_WARNING';
/* harmony export (immutable) */ __webpack_exports__["e"] = GS_WARNING;

const GS_ALERT = 'GS_ALERT';
/* harmony export (immutable) */ __webpack_exports__["f"] = GS_ALERT;


/* user type */

const UT_RECRUITER = '1';
/* harmony export (immutable) */ __webpack_exports__["h"] = UT_RECRUITER;

const UT_JOBSEEKER = '2';
/* harmony export (immutable) */ __webpack_exports__["i"] = UT_JOBSEEKER;


/* api */

const API_BASE_URL = 'http://localhost:8080';
/* harmony export (immutable) */ __webpack_exports__["k"] = API_BASE_URL;


const INIT_TOKENS = 'initial-tokens';
/* unused harmony export INIT_TOKENS */

const SECTORS = 'sectors';
/* unused harmony export SECTORS */

const CONTRACTS = 'contracts';
/* unused harmony export CONTRACTS */

const HOURS = 'hours';
/* unused harmony export HOURS */

const NATIONALITIES = 'nationalities';
/* unused harmony export NATIONALITIES */

const APPLICATION_STATUSES = 'application-statuses';
/* unused harmony export APPLICATION_STATUSES */

const JOB_STATUSES = 'job-statuses';
/* unused harmony export JOB_STATUSES */

const SEXES = 'sexes';
/* unused harmony export SEXES */

const ROLES = 'roles';
/* unused harmony export ROLES */


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_IconButton__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_IconButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_material_ui_IconButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__MainLayout_css__ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__MainLayout_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_title_png__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_title_png___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__assets_images_title_png__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__history__ = __webpack_require__(11);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();











const recruiterMenus = [{ id: 1, label: 'Find Talent', icon: 'fa-search', to: '/recruiter/find' }, { id: 2, label: 'Applications', icon: 'fa-id-badge', to: '/recruiter/applications' }, { id: 3, label: 'Connections', icon: 'fa-handshake-o', to: '/recruiter/connections' }, { id: 4, label: 'My Shortlist', icon: 'fa-tags', to: '/recruiter/shortlist' }, { id: 5, label: 'Messages', icon: 'fa-envelope-o', to: '/recruiter/messages' }, { id: 6, label: 'Add or Edit Jobs', icon: 'fa-briefcase', to: '/recruiter/businesses' }, { id: 7, label: 'Credit', icon: 'fa-credit-card', to: '/recruiter/credit' }, { id: 8, label: 'Change Password', icon: 'fa-key', to: '/recruiter/password' }, { id: 9, label: 'Help', icon: 'fa-question-circle-o', to: '/recruiter/help' }];

var _ref = _jsx('img', {
  src: __WEBPACK_IMPORTED_MODULE_6__assets_images_title_png___default.a,
  alt: ''
});

var _ref2 = _jsx('div', {}, void 0, '@ 2017 Sclabs Inc');

class MainLayout extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {

  constructor(props) {
    super(props);

    this.onToggleSidebar = () => this.setState({ open: !this.state.open });

    this.onCloseSidebar = () => this.setState({ open: false });

    this.onLogout = () => {
      __WEBPACK_IMPORTED_MODULE_7__history__["a" /* default */].push('/');
    };

    this.onClickItem = to => {
      __WEBPACK_IMPORTED_MODULE_7__history__["a" /* default */].push(to);
    };

    this.updatedDimensions = () => {
      const small = window.innerWidth < 768;
      if (small !== this.state.small) {
        this.setState({
          small,
          open: !small
        });
      }
    };

    this.state = {
      small: true,
      open: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updatedDimensions);
    this.updatedDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatedDimensions);
  }

  render() {
    const { path, children } = this.props;
    const { small, open } = this.state;
    return _jsx('div', {
      className: `${__WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.root} ${small ? __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.small : ''} ${open ? __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.open : ''}`
    }, void 0, _jsx('header', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.header
    }, void 0, small ? _jsx(__WEBPACK_IMPORTED_MODULE_2_material_ui_IconButton___default.a, {
      iconClassName: `fa fa-bars ${__WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.toggleIcon}`,
      onTouchTap: this.onToggleSidebar
    }) : '', _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.title
    }, void 0, _ref), _jsx(__WEBPACK_IMPORTED_MODULE_2_material_ui_IconButton___default.a, {
      iconClassName: `fa fa-sign-out ${__WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.logoutIcon}`,
      onTouchTap: this.onLogout
    })), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.container
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.sidebar
    }, void 0, _jsx('nav', {}, void 0, _jsx('ul', {}, void 0, recruiterMenus.map(item => _jsx('li', {}, item.id, _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      icon: _jsx('i', {
        className: `fa ${item.icon}`
      }),
      label: item.label,
      rippleColor: '#222',
      hoverColor: '#2d2d2d',
      className: item.to === path ? __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.active : '',
      onTouchTap: () => this.onClickItem(item.to)
    }))))), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.footer
    }, void 0, _ref2)), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.content
    }, void 0, children), small ? _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a.mask,
      onTouchTap: this.onCloseSidebar
    }) : ''));
  }
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_5__MainLayout_css___default.a)(MainLayout));

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_Popover__ = __webpack_require__(146);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_Popover___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_Popover__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_Menu__ = __webpack_require__(144);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_Menu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_material_ui_Menu__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_material_ui_MenuItem__ = __webpack_require__(145);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_material_ui_MenuItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_material_ui_MenuItem__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_material_ui_IconButton__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_material_ui_IconButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_material_ui_IconButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_material_ui_Snackbar__ = __webpack_require__(147);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_material_ui_Snackbar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_material_ui_Snackbar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_material_ui_LinearProgress__ = __webpack_require__(143);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_material_ui_LinearProgress___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_material_ui_LinearProgress__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__HomeLayout_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__components_Link__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__assets_images_title_png__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__assets_images_title_png___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__assets_images_title_png__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__assets_images_logo_png__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__assets_images_logo_png___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_13__assets_images_logo_png__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__actions__ = __webpack_require__(8);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();


















var _ref = _jsx('img', {
  src: __WEBPACK_IMPORTED_MODULE_12__assets_images_title_png___default.a,
  alt: ''
});

var _ref2 = _jsx('i', {
  className: 'fa fa-angle-down fa-lg'
});

var _ref3 = _jsx('h4', {}, void 0, _jsx('img', {
  src: __WEBPACK_IMPORTED_MODULE_13__assets_images_logo_png___default.a,
  alt: ''
}));

var _ref4 = _jsx('div', {}, void 0, '@ 2017 Sclabs Inc');

var _ref5 = _jsx('h4', {}, void 0, 'MENU');

var _ref6 = _jsx('i', {
  className: 'fa fa-genderless'
});

var _ref7 = _jsx('i', {
  className: 'fa fa-genderless'
});

var _ref8 = _jsx('h4', {}, void 0, 'CONTACT');

var _ref9 = _jsx('i', {
  className: 'fa fa-map-marker'
});

var _ref10 = _jsx('i', {
  className: 'fa fa-phone'
});

var _ref11 = _jsx('i', {
  className: 'fa fa-envelope'
});

var _ref12 = _jsx('h4', {}, void 0, 'FOLLOW US');

var _ref13 = _jsx('a', {
  href: 'https://www.facebook.com/'
}, void 0, _jsx('i', {
  className: 'fa fa-twitter fa-lg'
}));

var _ref14 = _jsx('a', {
  href: 'https://twitter.com/'
}, void 0, _jsx('i', {
  className: 'fa fa-facebook fa-lg'
}));

var _ref15 = _jsx('a', {
  href: 'https://www.linkedin.com/'
}, void 0, _jsx('i', {
  className: 'fa fa-linkedin fa-lg'
}));

class HomeLayout extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {

  constructor(props) {
    super(props);

    this.updatedDimensions = () => {
      const small = window.innerWidth < 768;
      if (small !== this.state.small) {
        this.setState({
          small,
          headerOpened: false,
          howitOpened: false
        });
      }
    };

    this.openHowIt = event => this.setState({
      howitOpened: true,
      anchorEl: event.currentTarget
    });

    this.toggleHeader = () => this.setState({
      headerOpened: !this.state.headerOpened
    });

    this.closeHeader = () => this.setState({
      headerOpened: false,
      howitOpened: false
    });

    this.linkRender = (to, childs, className) => _jsx(__WEBPACK_IMPORTED_MODULE_11__components_Link__["a" /* default */], {
      className: className !== undefined ? className : '',
      to: to,
      onClick: this.closeHeader
    }, void 0, childs);

    this.state = {
      small: true,
      headerOpened: false,
      howitOpened: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updatedDimensions);
    this.updatedDimensions();
  }

  componentWillReceiveProps(nextProps) {
    let messageColor;
    if (nextProps.error) messageColor = '#f00';
    if (nextProps.warning) messageColor = '#ff9300';
    if (nextProps.alert) messageColor = '#00b6a4';
    if (messageColor) {
      this.setState({ messageColor });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatedDimensions);
  }

  render() {
    const { small, headerOpened, messageColor } = this.state;
    const smallClass = small ? __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.small : '';
    const openClass = headerOpened ? __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.open : '';
    const { error, warning, alert } = this.props;
    return _jsx('div', {
      className: `${__WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.root} ${smallClass} ${openClass}`
    }, void 0, _jsx('header', {}, void 0, _jsx('div', {
      className: 'container'
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.headerBrandRoot
    }, void 0, this.linkRender('/', _ref, __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.headerBrand), _jsx(__WEBPACK_IMPORTED_MODULE_6_material_ui_IconButton___default.a, {
      iconClassName: 'fa fa-bars',
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.toggle,
      onTouchTap: this.toggleHeader
    })), _jsx('ul', {}, void 0, _jsx('li', {}, void 0, _jsx('a', {
      onTouchTap: this.openHowIt
    }, void 0, 'How it works ', _ref2)), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_Popover___default.a, {
      className: `${__WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.subMenu} ${smallClass}`,
      open: this.state.howitOpened,
      anchorEl: this.state.anchorEl,
      onRequestClose: this.closeHeader
    }, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_4_material_ui_Menu___default.a, {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_5_material_ui_MenuItem___default.a, {}, void 0, this.linkRender('/jobseeker', 'Job Seeker')), _jsx(__WEBPACK_IMPORTED_MODULE_5_material_ui_MenuItem___default.a, {}, void 0, this.linkRender('/recruiter', 'Recruiter')))), _jsx('li', {}, void 0, this.linkRender('/about', 'About')), _jsx('li', {}, void 0, this.linkRender('/terms', 'Terms & Conditions')), _jsx('li', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.logout
    }, void 0, this.linkRender('/login', 'Login'))))), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.content
    }, void 0, this.props.children, this.props.loading && _jsx('div', {}, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.loadingMask
    }), _jsx(__WEBPACK_IMPORTED_MODULE_8_material_ui_LinearProgress___default.a, {
      mode: 'indeterminate',
      color: '#ff9300',
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.loadingBar
    }))), _jsx('footer', {}, void 0, _jsx('div', {
      className: 'container'
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerBlock
    }, void 0, this.linkRender('/', _ref3), _ref4), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerBlock
    }, void 0, _ref5, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem
    }, void 0, 'How it works'), _jsx(__WEBPACK_IMPORTED_MODULE_11__components_Link__["a" /* default */], {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem,
      to: '/jobseeker',
      onClick: this.closeHeader
    }, void 0, _ref6, 'Job Seeker'), _jsx(__WEBPACK_IMPORTED_MODULE_11__components_Link__["a" /* default */], {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem,
      to: '/recruiter',
      onClick: this.closeHeader
    }, void 0, _ref7, 'Recruiter'), this.linkRender('/about', 'About', __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem), this.linkRender('/terms', 'Terms & Conditions', __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem), this.linkRender('/login', 'Login', __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem)), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerBlock
    }, void 0, _ref8, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem
    }, void 0, _ref9, '229 Leith Walk, Edinburgh EH6 8NY, UK'), _jsx('a', {
      href: 'tel:+441315535900',
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem
    }, void 0, _ref10, '(131) 553-5900'), _jsx('a', {
      href: 'mailto:mike@bodabar.com',
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerItem
    }, void 0, _ref11, 'mike@bodabar.com')), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a.footerBlock
    }, void 0, _ref12, _ref13, _ref14, _ref15))), _jsx(__WEBPACK_IMPORTED_MODULE_7_material_ui_Snackbar___default.a, {
      open: error !== '' || warning !== '' || alert !== '',
      message: error || warning || alert,
      autoHideDuration: 4000,
      bodyStyle: { backgroundColor: messageColor },
      onRequestClose: () => this.props.setNone()
    }));
  }
}

HomeLayout.defaultProps = {
  loading: false,
  error: '',
  warning: '',
  alert: ''
};

const mapState = state => ({
  loading: state.global.loading,
  error: state.global.error,
  warning: state.global.warning,
  alert: state.global.alert
});

const mapDispatch = {
  setNone: __WEBPACK_IMPORTED_MODULE_14__actions__["d" /* setNone */]
};

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9_react_redux__["connect"])(mapState, mapDispatch)(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_10__HomeLayout_css___default.a)(HomeLayout)));

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__(12);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__global__["e"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_0__global__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__auth__ = __webpack_require__(27);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__auth__["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_1__auth__["b"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_1__auth__["c"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_1__auth__["d"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__getBusinesses__ = __webpack_require__(28);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__getBusinesses__["a"]; });





/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("react-redux");

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Page_css__ = __webpack_require__(109);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Page_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__Page_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






function Page(props) {
  const { title, html } = props;
  return _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_3__Page_css___default.a.contant
  }, void 0, _jsx('div', {
    className: 'container'
  }, void 0, _jsx('h1', {}, void 0, title), _jsx('div', {
    dangerouslySetInnerHTML: { __html: html }
  })));
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_3__Page_css___default.a)(Page));

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_createBrowserHistory__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_createBrowserHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_createBrowserHistory__);
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */



// Navigation manager, e.g. history.push('/home')
// https://github.com/mjackson/history
/* harmony default export */ __webpack_exports__["a"] = (false && __WEBPACK_IMPORTED_MODULE_0_history_createBrowserHistory___default()());

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);
/* eslint-disable import/prefer-default-export */



const setGlobalState = (gs, data) => ({
  type: __WEBPACK_IMPORTED_MODULE_0__data_const__["a" /* SET_GLOBAL_STETE */],
  gs,
  data
});

const setNone = () => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["b" /* GS_NONE */], null);
/* harmony export (immutable) */ __webpack_exports__["b"] = setNone;

const setLoading = () => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["c" /* GS_LOADING */], null);
/* harmony export (immutable) */ __webpack_exports__["a"] = setLoading;

const setError = data => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["d" /* GS_ERROR */], data);
/* harmony export (immutable) */ __webpack_exports__["e"] = setError;

const setWarning = data => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["e" /* GS_WARNING */], data);
/* unused harmony export setWarning */

const setAlert = data => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["f" /* GS_ALERT */], data);
/* harmony export (immutable) */ __webpack_exports__["d"] = setAlert;

const setAPIErrors = data => setGlobalState(__WEBPACK_IMPORTED_MODULE_0__data_const__["g" /* GS_API_ERROR */], data);
/* harmony export (immutable) */ __webpack_exports__["c"] = setAPIErrors;


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_material_ui_TextField__ = __webpack_require__(148);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_material_ui_TextField___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_material_ui_TextField__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Checkbox__ = __webpack_require__(141);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Checkbox___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_material_ui_Checkbox__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__BaseComponent__ = __webpack_require__(17);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






const getErrorKey = id => `${id}Error`;

class FormComponent extends __WEBPACK_IMPORTED_MODULE_3__BaseComponent__["a" /* default */] {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.valid = () => {
      const oldState = this.state;
      const newState = {};
      let foundError = false;
      this.requiredFields.forEach(id => {
        if (oldState[getErrorKey(id)]) {
          foundError = true;
        } else if (!oldState[id]) {
          newState[getErrorKey(id)] = 'Required';
          foundError = true;
        }
      });

      this.setState(newState);
      return !foundError;
    }, this.handleInputChange = event => {
      const { id, value } = event.target;
      let error = this.state[getErrorKey(id)];
      if (error !== undefined) {
        error = value ? '' : 'Required';
      }
      this.setState({
        [id]: value,
        [getErrorKey(id)]: error
      });
    }, this.handleCheckChange = (event, isInputChecked) => {
      this.setState({
        [event.target.id]: isInputChecked
      });
    }, this.renderTextField = info => {
      const { type, id, hint, style } = info;
      return _jsx('div', {
        style: { display: 'flex' }
      }, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_1_material_ui_TextField___default.a, {
        type: type,
        id: id,
        hintText: hint,
        floatingLabelText: hint,
        style: style,
        value: this.state[id],
        errorText: this.state[getErrorKey(id)],
        onChange: this.handleInputChange
      }));
    }, this.renderCheckbox = info => {
      const { id, label } = info;
      return _jsx(__WEBPACK_IMPORTED_MODULE_2_material_ui_Checkbox___default.a, {
        id: id,
        label: label,
        defaultChecked: this.state[id],
        onCheck: this.handleCheckChange
      });
    }, _temp;
  }

  componentWillReceiveProps(nextProps) {
    const { apiErrors } = nextProps;
    if (apiErrors) {
      const newState = {};
      const requiredFields = this.requiredFields;
      requiredFields.forEach(id => {
        newState[getErrorKey(id)] = '';
      });

      if (typeof apiErrors === 'string') {
        this.props.setError(apiErrors);
        return;
      }

      Object.keys(apiErrors).forEach(id => {
        const error = apiErrors[id];
        if (requiredFields.indexOf(id) !== -1) {
          newState[getErrorKey(id)] = error;
        } else {
          this.props.setError(Array.isArray(error) ? error[0] : error);
        }
      });

      this.setState(newState);
    }
  }

}

FormComponent.mapState = state => _extends({}, __WEBPACK_IMPORTED_MODULE_3__BaseComponent__["a" /* default */].mapState(state));

FormComponent.mapDispatch = _extends({}, __WEBPACK_IMPORTED_MODULE_3__BaseComponent__["a" /* default */].mapDispatch);

/* harmony default export */ __webpack_exports__["a"] = (FormComponent);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__history__ = __webpack_require__(11);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }





function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

class Link extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleClick = event => {
      if (this.props.onClick) {
        this.props.onClick(event);
      }

      if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return;
      }

      if (event.defaultPrevented === true) {
        return;
      }

      event.preventDefault();
      __WEBPACK_IMPORTED_MODULE_2__history__["a" /* default */].push(this.props.to);
    }, _temp;
  }

  render() {
    const _props = this.props,
          { to, children } = _props,
          props = _objectWithoutProperties(_props, ['to', 'children']);
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'a',
      _extends({ href: to }, props, { onClick: this.handleClick }),
      children
    );
  }
}

Link.defaultProps = {
  onClick: null
};
/* harmony default export */ __webpack_exports__["a"] = (Link);

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

/* eslint-disable import/prefer-default-export */

const getUserType = () => localStorage.getItem('user_type');
/* harmony export (immutable) */ __webpack_exports__["a"] = getUserType;

const setUserType = type => localStorage.setItem('user_type', type);
/* harmony export (immutable) */ __webpack_exports__["b"] = setUserType;


const getToken = () => localStorage.getItem('token');
/* unused harmony export getToken */

const setToken = token => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};
/* harmony export (immutable) */ __webpack_exports__["c"] = setToken;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("material-ui/RaisedButton");

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__actions__ = __webpack_require__(8);






class BaseComponent extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {

  componentWillReceiveProps(nextProps) {
    const { apiErrors } = nextProps;
    if (apiErrors) {
      // const newState = {};
      // const requiredFields = this.requiredFields;
      // requiredFields.forEach((id) => {
      //   newState[getErrorKey(id)] = '';
      // });
      // Object.keys(apiErrors).forEach((id) => {
      //   const error = apiErrors[id];
      //   if (requiredFields.indexOf(id) !== -1) {
      //     newState[getErrorKey(id)] = error;
      //   } else {
      //     this.props.setError(Array.isArray(error) ? error[0] : error);
      //   }
      // });
      // this.setState(newState);
    }
  }
}

BaseComponent.defaultProps = {
  loading: false,
  apiErrors: {}
};

BaseComponent.mapState = state => ({
  loading: state.global.loading,
  apiErrors: state.global.apiErrors
});

BaseComponent.mapDispatch = {
  setError: __WEBPACK_IMPORTED_MODULE_2__actions__["b" /* setError */]
};

/* harmony default export */ __webpack_exports__["a"] = (BaseComponent);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */

if (false) {
  throw new Error('Do not import `config.js` from inside the client-side code.');
}

module.exports = {
  // Node.js app
  port: process.env.PORT || 3000,

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl: process.env.API_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || 'sqlite:database.sqlite',

  // Web analytics
  analytics: {
    // https://analytics.google.com/
    googleTrackingId: process.env.GOOGLE_TRACKING_ID },

  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },

    // https://developers.facebook.com/
    facebook: {
      id: process.env.FACEBOOK_APP_ID || '186244551745631',
      secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc'
    },

    // https://cloud.google.com/console/project
    google: {
      id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
      secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd'
    },

    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
      secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ'
    }
  }
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "5b20ae11.png";

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(83);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./ErrorPage.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./ErrorPage.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("material-ui/FlatButton");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("material-ui/IconButton");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Paper");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_path__ = __webpack_require__(151);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_path___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_path__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_express__ = __webpack_require__(136);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_cookie_parser__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_cookie_parser___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_cookie_parser__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_body_parser__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_body_parser___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_body_parser__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_express_jwt__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_express_jwt___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_express_jwt__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_express_graphql__ = __webpack_require__(137);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_express_graphql___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_express_graphql__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_react_dom_server__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_react_dom_server___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_react_dom_server__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_pretty_error__ = __webpack_require__(152);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_pretty_error___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_pretty_error__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_App__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__components_Html__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__routes_error_ErrorPage__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__routes_error_ErrorPage_css__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__routes_error_ErrorPage_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__routes_error_ErrorPage_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__createFetch__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__router__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__assets_json__ = __webpack_require__(130);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__assets_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_15__assets_json__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__store_configureStore__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__actions_runtime__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__config__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__config___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_18__config__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
















 // eslint-disable-line import/no-unresolved




const app = __WEBPACK_IMPORTED_MODULE_1_express___default()();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(__WEBPACK_IMPORTED_MODULE_1_express___default.a.static(__WEBPACK_IMPORTED_MODULE_0_path___default.a.join(__dirname, 'public')));
app.use(__WEBPACK_IMPORTED_MODULE_2_cookie_parser___default()());
app.use(__WEBPACK_IMPORTED_MODULE_3_body_parser___default.a.urlencoded({ extended: true }));
app.use(__WEBPACK_IMPORTED_MODULE_3_body_parser___default.a.json());

//
// Authentication
// -----------------------------------------------------------------------------
app.use(__WEBPACK_IMPORTED_MODULE_4_express_jwt___default()({
  secret: __WEBPACK_IMPORTED_MODULE_18__config___default.a.auth.jwt.secret,
  credentialsRequired: false,
  getToken: req => req.cookies.id_token
}));
// Error handler for express-jwt
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err instanceof __WEBPACK_IMPORTED_MODULE_4_express_jwt__["UnauthorizedError"]) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie('id_token');
  }
  next(err);
});

//
// Register API middleware
// -----------------------------------------------------------------------------
app.use('/graphql', __WEBPACK_IMPORTED_MODULE_5_express_graphql___default()(req => ({
  graphiql: false,
  rootValue: { request: req },
  pretty: false
})));

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', (() => {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    try {
      const css = new Set();

      const fetch = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_13__createFetch__["a" /* default */])({
        baseUrl: __WEBPACK_IMPORTED_MODULE_18__config___default.a.api.serverUrl,
        cookie: req.headers.cookie
      });

      const initialState = {};

      const store = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_16__store_configureStore__["a" /* default */])(initialState, {
        fetch
      });

      store.dispatch(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_17__actions_runtime__["a" /* setRuntimeVariable */])({
        name: 'initialNow',
        value: Date.now()
      }));

      // Global (context) variables that can be easily accessed from any React component
      // https://facebook.github.io/react/docs/context.html
      const context = {
        // Enables critical path CSS rendering
        // https://github.com/kriasoft/isomorphic-style-loader
        insertCss: function (...styles) {
          // eslint-disable-next-line no-underscore-dangle
          styles.forEach(function (style) {
            return css.add(style._getCss());
          });
        },
        fetch,
        // You can access redux through react-redux connect
        store,
        storeSubscription: null
      };

      const route = yield __WEBPACK_IMPORTED_MODULE_14__router__["a" /* default */].resolve(_extends({}, context, {
        path: req.path,
        query: req.query
      }));

      if (route.redirect) {
        res.redirect(route.status || 302, route.redirect);
        return;
      }

      const data = _extends({}, route);
      data.children = __WEBPACK_IMPORTED_MODULE_7_react_dom_server___default.a.renderToString(_jsx(__WEBPACK_IMPORTED_MODULE_9__components_App__["a" /* default */], {
        context: context,
        store: store
      }, void 0, route.component));
      data.styles = [{ id: 'css', cssText: [...css].join('') }];
      data.scripts = [__WEBPACK_IMPORTED_MODULE_15__assets_json___default.a.vendor.js, __WEBPACK_IMPORTED_MODULE_15__assets_json___default.a.client.js];
      if (__WEBPACK_IMPORTED_MODULE_15__assets_json___default.a[route.chunk]) {
        data.scripts.push(__WEBPACK_IMPORTED_MODULE_15__assets_json___default.a[route.chunk].js);
      }
      data.app = {
        apiUrl: __WEBPACK_IMPORTED_MODULE_18__config___default.a.api.clientUrl,
        state: context.store.getState()
      };

      const html = __WEBPACK_IMPORTED_MODULE_7_react_dom_server___default.a.renderToStaticMarkup(__WEBPACK_IMPORTED_MODULE_6_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_10__components_Html__["a" /* default */], data));
      res.status(route.status || 200);
      res.send(`<!doctype html>${html}`);
    } catch (err) {
      next(err);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})());

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new __WEBPACK_IMPORTED_MODULE_8_pretty_error___default.a();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(pe.render(err));
  const html = __WEBPACK_IMPORTED_MODULE_7_react_dom_server___default.a.renderToStaticMarkup(_jsx(__WEBPACK_IMPORTED_MODULE_10__components_Html__["a" /* default */], {
    title: 'Internal Server Error',
    description: err.message,
    styles: [{ id: 'css', cssText: __WEBPACK_IMPORTED_MODULE_12__routes_error_ErrorPage_css___default.a._getCss() }]
  }, void 0, __WEBPACK_IMPORTED_MODULE_7_react_dom_server___default.a.renderToString(_jsx(__WEBPACK_IMPORTED_MODULE_11__routes_error_ErrorPage__["a" /* ErrorPageWithoutStyle */], {
    error: err
  }))));
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
app.listen(__WEBPACK_IMPORTED_MODULE_18__config___default.a.port, () => {
  console.info(`The server is running at http://localhost:${__WEBPACK_IMPORTED_MODULE_18__config___default.a.port}/`);
});

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__history__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__data_shared__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__data_const__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__global__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__data_api__ = __webpack_require__(35);
/* eslint-disable import/prefer-default-export */







const getData = (dispatch, userType) => {
  __WEBPACK_IMPORTED_MODULE_4__data_api__["a" /* getUser */]().then(user => {
    dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["b" /* setNone */]());
    if (user.businesses.length) {
      __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
    } else if (user.job_seeker) {
      __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
    } else {
      const type = userType || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__data_shared__["a" /* getUserType */])();
      if (type === __WEBPACK_IMPORTED_MODULE_2__data_const__["h" /* UT_RECRUITER */]) {
        __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
      } else if (type === __WEBPACK_IMPORTED_MODULE_2__data_const__["i" /* UT_JOBSEEKER */]) {
        __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
      } else {
        dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__data_const__["j" /* SELECT_TYPE */] });
      }
    }
  }).catch(errors => dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["c" /* setAPIErrors */](errors)));
};

const loginWithType = type => {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__data_shared__["b" /* setUserType */])(type);
  if (type === __WEBPACK_IMPORTED_MODULE_2__data_const__["h" /* UT_RECRUITER */]) {
    __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
  } else if (type === __WEBPACK_IMPORTED_MODULE_2__data_const__["i" /* UT_JOBSEEKER */]) {
    __WEBPACK_IMPORTED_MODULE_0__history__["a" /* default */].push('/recruiter/find');
  }
};
/* harmony export (immutable) */ __webpack_exports__["c"] = loginWithType;


const login = (email, password) => dispatch => {
  dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["a" /* setLoading */]());
  __WEBPACK_IMPORTED_MODULE_4__data_api__["b" /* login */]({ email, password }).then(() => getData(dispatch)).catch(errors => dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["c" /* setAPIErrors */](errors)));
};
/* harmony export (immutable) */ __webpack_exports__["d"] = login;


const register = (email, password1, password2, type) => dispatch => {
  dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["a" /* setLoading */]());
  __WEBPACK_IMPORTED_MODULE_4__data_api__["c" /* register */]({ email, password1, password2 }).then(() => getData(dispatch, type)).catch(errors => dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["c" /* setAPIErrors */](errors)));
};
/* harmony export (immutable) */ __webpack_exports__["b"] = register;


const reset = email => dispatch => {
  dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["a" /* setLoading */]());
  __WEBPACK_IMPORTED_MODULE_4__data_api__["d" /* resetPassowrd */]({ email }).then(() => dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["d" /* setAlert */]('Success'))).catch(errors => dispatch(__WEBPACK_IMPORTED_MODULE_3__global__["c" /* setAPIErrors */](errors)));
};
/* harmony export (immutable) */ __webpack_exports__["a"] = reset;


// export const changePassword = (email, password) => {
//   return {
//     type: AUTH_CHANGE_PASS,
//     payload: {
//       email,
//       password,
//     },
//   };
// };

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__(12);
/* eslint-disable import/prefer-default-export */



const getBusinesses = () => dispatch => {
  dispatch(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* setLoading */])());
  // api.getBusinesses()
  //   .then((data) => {
  //     console.log(data);
  //   })
  //   .catch(errors => dispatch(setAPIErrors(errors)));
};
/* harmony export (immutable) */ __webpack_exports__["a"] = getBusinesses;


/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = setRuntimeVariable;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);
/* eslint-disable import/prefer-default-export */



function setRuntimeVariable({ name, value }) {
  return {
    type: __WEBPACK_IMPORTED_MODULE_0__data_const__["l" /* SET_RUNTIME_VARIABLE */],
    payload: {
      name,
      value
    }
  };
}

/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_styles_MuiThemeProvider__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_styles_MuiThemeProvider___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_styles_MuiThemeProvider__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_styles_getMuiTheme__ = __webpack_require__(150);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_styles_getMuiTheme___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_material_ui_styles_getMuiTheme__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_tap_event_plugin__ = __webpack_require__(154);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_tap_event_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_tap_event_plugin__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__CustomTheme__ = __webpack_require__(31);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */









__WEBPACK_IMPORTED_MODULE_5_react_tap_event_plugin___default()();

const ContextType = _extends({
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  // Universal HTTP client
  fetch: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired
}, __WEBPACK_IMPORTED_MODULE_2_react_redux__["Provider"].childContextTypes);

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
class App extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.PureComponent {

  getChildContext() {
    return this.props.context;
  }

  render() {
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    return _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_styles_MuiThemeProvider___default.a, {
      muiTheme: __WEBPACK_IMPORTED_MODULE_4_material_ui_styles_getMuiTheme___default()(__WEBPACK_IMPORTED_MODULE_6__CustomTheme__["a" /* default */], { userAgent: 'all' })
    }, void 0, __WEBPACK_IMPORTED_MODULE_0_react___default.a.Children.only(this.props.children));
  }

}

App.childContextTypes = ContextType;
/* harmony default export */ __webpack_exports__["a"] = (App);

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

const GREEN_COLOR = '#00b6a4';
const YELLOW_COLOR = '#ff9300';

const CustomTheme = {

  raisedButton: {
    primaryColor: GREEN_COLOR,
    primaryTextColor: '#ffffff',
    secondaryColor: YELLOW_COLOR,
    secondaryTextColor: '#ffffff'
  },

  flatButton: {
    primaryTextColor: GREEN_COLOR,
    secondaryTextColor: YELLOW_COLOR
  },

  textField: {
    focusColor: GREEN_COLOR
  },

  checkbox: {
    checkedColor: GREEN_COLOR
  },

  refreshIndicator: {
    strokeColor: '#ff0000',
    loadingStrokeColor: '#ff0000'
  }

};

/* harmony default export */ __webpack_exports__["a"] = (CustomTheme);

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_serialize_javascript__ = __webpack_require__(156);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_serialize_javascript___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_serialize_javascript__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__config__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__config___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__config__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */






/* eslint-disable react/no-danger */

var _ref = _jsx('meta', {
  charSet: 'utf-8'
});

var _ref2 = _jsx('meta', {
  httpEquiv: 'x-ua-compatible',
  content: 'ie=edge'
});

var _ref3 = _jsx('meta', {
  name: 'viewport',
  content: 'width=device-width, initial-scale=1'
});

var _ref4 = _jsx('link', {
  rel: 'apple-touch-icon',
  href: 'apple-touch-icon.png'
});

var _ref5 = _jsx('link', {
  rel: 'stylesheet',
  href: 'http://fonts.googleapis.com/css?family=Roboto:400,300,500&subset=latin',
  media: 'all'
});

var _ref6 = _jsx('link', {
  rel: 'stylesheet',
  href: 'http://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
});

var _ref7 = _jsx('script', {
  src: 'https://www.google-analytics.com/analytics.js',
  async: true,
  defer: true
});

function Html(props) {
  const { title, description, styles, scripts, app, children } = props;
  return _jsx('html', {
    className: 'no-js',
    lang: 'en'
  }, void 0, _jsx('head', {}, void 0, _ref, _ref2, _jsx('title', {}, void 0, title), _jsx('meta', {
    name: 'description',
    content: description
  }), _ref3, _ref4, _ref5, _ref6, styles.map(style => _jsx('style', {
    id: style.id,
    dangerouslySetInnerHTML: { __html: style.cssText }
  }, style.id))), _jsx('body', {}, void 0, _jsx('div', {
    id: 'app',
    dangerouslySetInnerHTML: { __html: children }
  }), _jsx('script', {
    dangerouslySetInnerHTML: { __html: `window.App=${__WEBPACK_IMPORTED_MODULE_2_serialize_javascript___default()(app)}` }
  }), scripts.map(script => _jsx('script', {
    src: script
  }, script)), __WEBPACK_IMPORTED_MODULE_3__config___default.a.analytics.googleTrackingId && _jsx('script', {
    dangerouslySetInnerHTML: { __html: 'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' + `ga('create','${__WEBPACK_IMPORTED_MODULE_3__config___default.a.analytics.googleTrackingId}','auto');ga('send','pageview')` }
  }), __WEBPACK_IMPORTED_MODULE_3__config___default.a.analytics.googleTrackingId && _ref7));
}

Html.defaultProps = {
  styles: [],
  scripts: []
};


/* harmony default export */ __webpack_exports__["a"] = (Html);

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Slick_css__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Slick_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Slick_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__assets_images_splash1_jpg__ = __webpack_require__(102);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__assets_images_splash1_jpg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__assets_images_splash1_jpg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__assets_images_splash2_jpg__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__assets_images_splash2_jpg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__assets_images_splash2_jpg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__assets_images_splash3_jpg__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__assets_images_splash3_jpg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__assets_images_splash3_jpg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_splash4_jpg__ = __webpack_require__(105);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_splash4_jpg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__assets_images_splash4_jpg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__assets_images_splash5_jpg__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__assets_images_splash5_jpg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__assets_images_splash5_jpg__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();











const SPLASH_IMAGES = [__WEBPACK_IMPORTED_MODULE_3__assets_images_splash1_jpg___default.a, __WEBPACK_IMPORTED_MODULE_4__assets_images_splash2_jpg___default.a, __WEBPACK_IMPORTED_MODULE_5__assets_images_splash3_jpg___default.a, __WEBPACK_IMPORTED_MODULE_6__assets_images_splash4_jpg___default.a, __WEBPACK_IMPORTED_MODULE_7__assets_images_splash5_jpg___default.a];

class Splash extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        currentIndex: (this.state.currentIndex + 1) % SPLASH_IMAGES.length
      });
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const currentIndex = this.state.currentIndex;
    return _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_2__Slick_css___default.a.container
    }, void 0, SPLASH_IMAGES.map((image, index) => _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_2__Slick_css___default.a.image,
      style: {
        backgroundImage: `url(${image})`,
        opacity: index === currentIndex ? 1 : 0
      }
    }, image)));
  }
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Slick_css___default.a)(Splash));

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_isomorphic_fetch__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_isomorphic_fetch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_isomorphic_fetch__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */



/**
 * Creates a wrapper function around the HTML5 Fetch API that provides
 * default arguments to fetch(...) and is intended to reduce the amount
 * of boilerplate code in the application.
 * https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 */
function createFetch({ baseUrl, cookie }) {
  // NOTE: Tweak the default options to suite your application needs
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    mode: baseUrl ? 'cors' : 'same-origin',
    credentials: baseUrl ? 'include' : 'same-origin',
    headers: _extends({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }, cookie ? { Cookie: cookie } : null)
  };

  return (url, options) => url.startsWith('/graphql') || url.startsWith('/api') ? __WEBPACK_IMPORTED_MODULE_0_isomorphic_fetch___default()(`${baseUrl}${url}`, _extends({}, defaults, options, {
    headers: _extends({}, defaults.headers, options && options.headers)
  })) : __WEBPACK_IMPORTED_MODULE_0_isomorphic_fetch___default()(url, options);
}

/* harmony default export */ __webpack_exports__["a"] = (createFetch);

/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_axios__ = __webpack_require__(131);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_axios___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_axios__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__const__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared__ = __webpack_require__(15);
/* eslint-disable import/prefer-default-export */





__WEBPACK_IMPORTED_MODULE_0_axios___default.a.defaults.baseURL = __WEBPACK_IMPORTED_MODULE_1__const__["k" /* API_BASE_URL */];
__WEBPACK_IMPORTED_MODULE_0_axios___default.a.defaults.headers.common.Accept = 'application/json';
__WEBPACK_IMPORTED_MODULE_0_axios___default.a.defaults.headers.post['Content-Type'] = 'application/json';

const getUrl = path => `/api/${path}/`;

const getData = url => __WEBPACK_IMPORTED_MODULE_0_axios___default.a.get(url).then(response => Promise.resolve(response.data)).catch(error => {
  const response = error.response;
  return Promise.reject(response.status === 500 ? response.statusText : response.data);
});
/* unused harmony export getData */


const getDataByPath = path => getData(getUrl(path));
/* unused harmony export getDataByPath */


const postData = (url, data) => __WEBPACK_IMPORTED_MODULE_0_axios___default.a.post(url, data).then(response => Promise.resolve(response.data)).catch(error => {
  const response = error.response;
  return Promise.reject(response.status === 500 ? response.statusText : response.data);
});
/* unused harmony export postData */


const postDataByPath = (path, data) => postData(getUrl(path), data);
/* unused harmony export postDataByPath */


const allData = (promises, callback) => __WEBPACK_IMPORTED_MODULE_0_axios___default.a.all(promises).then(__WEBPACK_IMPORTED_MODULE_0_axios___default.a.spread(callback));
/* unused harmony export allData */


const setToken = token => {
  __WEBPACK_IMPORTED_MODULE_2__shared__["c" /* setToken */](token);
  __WEBPACK_IMPORTED_MODULE_0_axios___default.a.defaults.headers.common.Authorization = `Token ${token}`;
};

const logout = () => {
  __WEBPACK_IMPORTED_MODULE_2__shared__["c" /* setToken */]();
};
/* unused harmony export logout */


const register = info => postData('/api-rest-auth/registration/', info).then(data => {
  setToken(data.key);
  return Promise.resolve();
});
/* harmony export (immutable) */ __webpack_exports__["c"] = register;


const login = info => postData('/api-rest-auth/login/', info).then(data => {
  setToken(data.key);
  return Promise.resolve();
});
/* harmony export (immutable) */ __webpack_exports__["b"] = login;


const resetPassowrd = info => postData('/api-rest-auth/password/reset/', info);
/* harmony export (immutable) */ __webpack_exports__["d"] = resetPassowrd;


const getUser = () => getData('/api-rest-auth/user/');
/* harmony export (immutable) */ __webpack_exports__["a"] = getUser;


const getBusinesses = () => getData('/api/user-businesses/');
/* unused harmony export getBusinesses */


/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = auth;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);


function auth(state = {}, action) {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_0__data_const__["j" /* SELECT_TYPE */]:
      return {
        selectType: true
      };
    default:
      return state;
  }
}

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getBusinesses;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);


function getBusinesses(state = {}, action) {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_0__data_const__["m" /* BUSINESSES */]:
      return {
        selectType: true
      };
    default:
      return state;
  }
}

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = global;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);


const initialStates = {
  gs: __WEBPACK_IMPORTED_MODULE_0__data_const__["b" /* GS_NONE */],
  data: null
};

function global(state = initialStates, action) {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_0__data_const__["a" /* SET_GLOBAL_STETE */]:
      return {
        gs: action.gs,
        gsData: action.data
      };
    default:
      return state;
  }
}

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__auth__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__getBusinesses__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__runtime__ = __webpack_require__(40);






/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_redux__["combineReducers"])({
  global: __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */],
  auth: __WEBPACK_IMPORTED_MODULE_2__auth__["a" /* default */],
  getBusinesses: __WEBPACK_IMPORTED_MODULE_3__getBusinesses__["a" /* default */],
  runtime: __WEBPACK_IMPORTED_MODULE_4__runtime__["a" /* default */]
}));

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = runtime;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__data_const__ = __webpack_require__(5);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



function runtime(state = {}, action) {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_0__data_const__["l" /* SET_RUNTIME_VARIABLE */]:
      return _extends({}, state, {
        [action.payload.name]: action.payload.value
      });
    default:
      return state;
  }
}

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_universal_router__ = __webpack_require__(157);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_universal_router___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_universal_router__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__routes__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__history__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__data_shared__ = __webpack_require__(15);
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */






// const options = {
//   context: { store: {} },
//   resolveRoute(context, params) {
//     if (typeof (Storage) !== 'undefined') {
//       const token = getToken();
//       if (context.route.redirectIfAuth) {
//         if (token) {
//           history.push('/recruiter/find');
//           return null;
//         }
//       } else if (!token) {
//         history.push('/');
//         return null;
//       }
//     }

//     if (typeof context.route.action === 'function') {
//       return context.route.action(context, params);
//     }
//     return null;
//   },
// };

// const router = new Router(routes, options);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_0_universal_router___default.a(__WEBPACK_IMPORTED_MODULE_1__routes__["a" /* default */]));
// export default router;

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ErrorPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ErrorPage_css__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ErrorPage_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__ErrorPage_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, _jsx('h1', {}, void 0, 'Error'), _jsx('p', {}, void 0, 'Sorry, a critical error occurred on this page.'));

function ErrorPage(props) {
  if (false) {
    const { error } = props;
    return _jsx('div', {}, void 0, _jsx('h1', {}, void 0, error.name), _jsx('p', {}, void 0, error.message), _jsx('pre', {}, void 0, error.stack));
  }

  return _ref;
}


/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_3__ErrorPage_css___default.a)(ErrorPage));

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Page__ = __webpack_require__(10);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/about',
  redirectIfAuth: true,

  action() {
    return _asyncToGenerator(function* () {
      const data = yield new Promise(function(resolve) { resolve(); }).then((function (require) {
        return __webpack_require__(126);
      }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

      return {
        title: data.title,
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__components_Page__["a" /* default */], data))
      };
    })();
  }

});

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Page__ = __webpack_require__(10);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/jobseeker',
  redirectIfAuth: true,

  action() {
    return _asyncToGenerator(function* () {
      const data = yield new Promise(function(resolve) { resolve(); }).then((function (require) {
        return __webpack_require__(127);
      }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

      return {
        title: data.title,
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__components_Page__["a" /* default */], data))
      };
    })();
  }

});

/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Landing_css__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Landing_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Landing_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_Link__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_Slick__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__assets_images_googleplay_button_svg__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__assets_images_googleplay_button_svg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__assets_images_googleplay_button_svg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_itunes_button_svg__ = __webpack_require__(100);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__assets_images_itunes_button_svg___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__assets_images_itunes_button_svg__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__data_const__ = __webpack_require__(5);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();











var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_4__components_Slick__["a" /* default */], {});

var _ref2 = _jsx('span', {}, void 0, "I'm a");

var _ref3 = _jsx('br', {});

var _ref4 = _jsx('span', {}, void 0, 'Recruiter');

var _ref5 = _jsx('span', {}, void 0, "I'm a");

var _ref6 = _jsx('br', {});

var _ref7 = _jsx('span', {}, void 0, 'Job Seeker');

var _ref8 = _jsx('br', {});

function Landing(props) {
  return _jsx('div', {}, void 0, _ref, _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.content
  }, void 0, _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.title
  }, void 0, 'Recruitment where first impression count'), _jsx('div', {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_3__components_Link__["a" /* default */], {
    to: `/register/${__WEBPACK_IMPORTED_MODULE_7__data_const__["h" /* UT_RECRUITER */]}`,
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.register
  }, void 0, _ref2, _ref3, _ref4), _jsx(__WEBPACK_IMPORTED_MODULE_3__components_Link__["a" /* default */], {
    to: `/register/${__WEBPACK_IMPORTED_MODULE_7__data_const__["i" /* UT_JOBSEEKER */]}`,
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.register
  }, void 0, _ref5, _ref6, _ref7)), _jsx('a', {
    href: ''
  }, void 0, _jsx('img', {
    src: __WEBPACK_IMPORTED_MODULE_5__assets_images_googleplay_button_svg___default.a,
    alt: '',
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.appButton
  })), _ref8, _jsx('a', {
    href: ''
  }, void 0, _jsx('img', {
    src: __WEBPACK_IMPORTED_MODULE_6__assets_images_itunes_button_svg___default.a,
    alt: '',
    className: __WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a.appButton
  }))));
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Landing_css___default.a)(Landing));

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Landing__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_HomeLayout__ = __webpack_require__(7);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__components_HomeLayout__["a" /* default */], {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_1__Landing__["a" /* default */], {}));

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/',
  redirectIfAuth: true,

  action() {
    return _asyncToGenerator(function* () {
      return {
        title: 'My Job Pitch',
        component: _ref
      };
    })();
  }

});

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_Dialog__ = __webpack_require__(142);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_material_ui_Dialog___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_material_ui_Dialog__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Login_css__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Login_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__Login_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_Link__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_FormComponent__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__actions__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__data_const__ = __webpack_require__(5);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();














var _ref = _jsx('h1', {}, void 0, 'Login');

var _ref2 = _jsx('br', {});

class Login extends __WEBPACK_IMPORTED_MODULE_8__components_FormComponent__["a" /* default */] {

  constructor(props) {
    super(props);

    this.onLogin = () => {
      if (!this.valid()) {
        return;
      }
      const { email, password } = this.state;
      this.props.login(email, password);
    };

    this.state = {
      email: '',
      password: ''
    };
    this.requiredFields = ['email', 'password'];
  }

  render() {
    const tfStyle = { width: 300 };
    return _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_6__Login_css___default.a.root
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_6__Login_css___default.a.container
    }, void 0, _ref, this.renderTextField({
      id: 'email',
      hint: 'Email Address',
      style: tfStyle
    }), this.renderTextField({
      type: 'password',
      id: 'password',
      hint: 'Password',
      style: tfStyle
    }), _ref2, this.renderCheckbox({
      id: 'remember',
      label: 'Remember password'
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default.a, {
      label: 'Login',
      primary: true,
      fullWidth: true,
      className: __WEBPACK_IMPORTED_MODULE_6__Login_css___default.a.loginButton,
      onTouchTap: this.onLogin
    }), _jsx(__WEBPACK_IMPORTED_MODULE_7__components_Link__["a" /* default */], {
      to: '/reset',
      className: __WEBPACK_IMPORTED_MODULE_6__Login_css___default.a.reset
    }, void 0, 'Forgot password?')), _jsx(__WEBPACK_IMPORTED_MODULE_4_material_ui_Dialog___default.a, {
      title: 'Select Type',
      modal: true,
      open: this.props.selectType,
      contentStyle: { maxWidth: '350px' }
    }, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default.a, {
      label: 'Recruiter',
      primary: true,
      fullWidth: true,
      style: { marginBottom: '15px' },
      onTouchTap: () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__actions__["f" /* loginWithType */])(__WEBPACK_IMPORTED_MODULE_10__data_const__["h" /* UT_RECRUITER */])
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default.a, {
      label: 'JobSeeker',
      secondary: true,
      fullWidth: true,
      onTouchTap: () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__actions__["f" /* loginWithType */])(__WEBPACK_IMPORTED_MODULE_10__data_const__["i" /* UT_JOBSEEKER */])
    })));
  }
}

Login.propTypes = {
  selectType: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  login: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired
};

Login.defaultProps = {
  selectType: false
};

const mapState = state => _extends({
  selectType: state.auth.selectType
}, __WEBPACK_IMPORTED_MODULE_8__components_FormComponent__["a" /* default */].mapState(state));

const mapDispatch = _extends({
  login: __WEBPACK_IMPORTED_MODULE_9__actions__["g" /* login */]
}, __WEBPACK_IMPORTED_MODULE_8__components_FormComponent__["a" /* default */].mapDispatch);

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5_react_redux__["connect"])(mapState, mapDispatch)(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_6__Login_css___default.a)(Login)));

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Login__ = __webpack_require__(47);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();





const title = 'Login';

var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_2__Login__["a" /* default */], {}));

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/login',
  redirectIfAuth: true,

  action() {
    return {
      title,
      component: _ref
    };
  }

});

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Page__ = __webpack_require__(10);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter',
  redirectIfAuth: true,

  action() {
    return _asyncToGenerator(function* () {
      const data = yield new Promise(function(resolve) { resolve(); }).then((function (require) {
        return __webpack_require__(128);
      }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

      return {
        title: data.title,
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__components_Page__["a" /* default */], data))
      };
    })();
  }

});

/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Register_css__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Register_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__Register_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__actions__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__data_const__ = __webpack_require__(5);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();












const TITLES = {
  [__WEBPACK_IMPORTED_MODULE_8__data_const__["h" /* UT_RECRUITER */]]: 'Recruiter Registration',
  [__WEBPACK_IMPORTED_MODULE_8__data_const__["i" /* UT_JOBSEEKER */]]: 'JobSeeker Registration'
};

var _ref = _jsx('br', {});

class Register extends __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */] {

  constructor(props) {
    super(props);

    this.onRegister = () => {
      if (!this.valid()) {
        return;
      }
      const { email, password1, password2 } = this.state;
      this.props.register(email, password1, password2, this.props.type);
    };

    this.state = {
      email: '',
      password1: '',
      password2: ''
    };
    this.requiredFields = ['email', 'password1', 'password2'];
  }

  render() {
    const tfStyle = { width: 300 };
    return _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__Register_css___default.a.root
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__Register_css___default.a.container
    }, void 0, _jsx('h1', {}, void 0, TITLES[this.props.type]), this.renderTextField({
      id: 'email',
      hint: 'Email Address',
      style: tfStyle
    }), this.renderTextField({
      type: 'password',
      id: 'password1',
      hint: 'Password',
      style: tfStyle
    }), this.renderTextField({
      type: 'password',
      id: 'password2',
      hint: 'Confirm Password',
      error: this.state.error,
      style: tfStyle
    }), _ref, this.renderCheckbox({
      id: 'remember',
      label: 'Remember password'
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default.a, {
      label: 'Register',
      primary: true,
      fullWidth: true,
      className: __WEBPACK_IMPORTED_MODULE_5__Register_css___default.a.registerButton,
      onTouchTap: this.onRegister
    })));
  }
}

Register.propTypes = {
  type: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string.isRequired,
  register: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired
};

Register.defaultProps = {};

const mapState = state => _extends({}, __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */].mapState(state));

const mapDispatch = _extends({
  register: __WEBPACK_IMPORTED_MODULE_7__actions__["e" /* register */]
}, __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */].mapDispatch);

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_react_redux__["connect"])(mapState, mapDispatch)(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_5__Register_css___default.a)(Register)));

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Register__ = __webpack_require__(50);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();





const title = 'Registration';

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/register/:type',
  redirectIfAuth: true,

  action({ params }) {
    return {
      title,
      component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_2__Register__["a" /* default */], {
        type: params.type
      }))
    };
  }

});

/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Reset_css__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Reset_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__Reset_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__actions__ = __webpack_require__(8);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();











var _ref = _jsx('h1', {}, void 0, 'Reset Password');

var _ref2 = _jsx('br', {});

class Reset extends __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */] {
  constructor(props) {
    super(props);

    this.onReset = () => {
      if (!this.valid()) {
        return;
      }
      this.props.reset(this.state.email);
    };

    this.state = {
      email: ''
    };
    this.requiredFields = ['email'];
  }

  render() {
    return _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__Reset_css___default.a.root
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_5__Reset_css___default.a.container
    }, void 0, _ref, this.renderTextField({
      id: 'email',
      hint: 'Email Address',
      style: { width: 300 }
    }), _ref2, _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_RaisedButton___default.a, {
      label: 'Reset',
      primary: true,
      fullWidth: true,
      className: __WEBPACK_IMPORTED_MODULE_5__Reset_css___default.a.resetButton,
      onTouchTap: this.onReset
    })));
  }
}

Reset.propTypes = {
  reset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired
};

Reset.defaultProps = {};

const mapState = state => _extends({}, __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */].mapState(state));

const mapDispatch = _extends({
  reset: __WEBPACK_IMPORTED_MODULE_7__actions__["c" /* reset */]
}, __WEBPACK_IMPORTED_MODULE_6__components_FormComponent__["a" /* default */].mapDispatch);

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4_react_redux__["connect"])(mapState, mapDispatch)(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_5__Reset_css___default.a)(Reset)));

/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Reset__ = __webpack_require__(52);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();





const title = 'Reset Password';

var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_2__Reset__["a" /* default */], {}));

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/reset',
  redirectIfAuth: true,

  action() {
    return {
      title,
      component: _ref
    };
  }

});

/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Page__ = __webpack_require__(10);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/terms',
  redirectIfAuth: true,

  action() {
    return _asyncToGenerator(function* () {
      const data = yield new Promise(function(resolve) { resolve(); }).then((function (require) {
        return __webpack_require__(129);
      }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

      return {
        title: data.title,
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_HomeLayout__["a" /* default */], {}, void 0, __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__components_Page__["a" /* default */], data))
      };
    })();
  }

});

/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable global-require */
/* harmony default export */ __webpack_exports__["a"] = ({

  path: '/',

  // Keep in mind, routes are evaluated in order
  children: [__webpack_require__(46).default, __webpack_require__(44).default, __webpack_require__(49).default, __webpack_require__(43).default, __webpack_require__(54).default, __webpack_require__(48).default, __webpack_require__(51).default, __webpack_require__(53).default, __webpack_require__(57).default, __webpack_require__(59).default, __webpack_require__(61).default, __webpack_require__(63).default, __webpack_require__(65).default, __webpack_require__(67).default, __webpack_require__(69).default, __webpack_require__(71).default, __webpack_require__(73).default,

  // Wildcard routes, e.g. { path: '*', ... } (must go last)
  __webpack_require__(75).default],

  action({ next }) {
    return _asyncToGenerator(function* () {
      // Execute each child route until one of them return the result
      const route = yield next();

      // Provide default values for title, description etc.
      route.title = `${route.title || 'Untitled Page'} - www.sclabs.co.uk`;
      route.description = route.description || '';

      return route;
    })();
  }

});

/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Applications_css__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Applications_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Applications_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();





function Applications(props) {
  return _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_2__Applications_css___default.a.aaa
  }, void 0, 'applications');
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Applications_css___default.a)(Applications));

/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Applications__ = __webpack_require__(56);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Applications__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/applications',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Applications',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Paper__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Paper___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_material_ui_Paper__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_redux__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Businesses_css__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__Businesses_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__main_css__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__main_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__main_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_BaseComponent__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__actions__ = __webpack_require__(8);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();













const TestData = [1, 2, 3, 4];

var _ref = _jsx('i', {
  className: 'fa fa-plus'
});

var _ref2 = _jsx('i', {
  className: 'fa fa-refresh'
});

var _ref3 = _jsx('i', {
  className: 'fa fa-pencil'
});

var _ref4 = _jsx('i', {
  className: 'fa fa-trash-o'
});

class Businesses extends __WEBPACK_IMPORTED_MODULE_8__components_BaseComponent__["a" /* default */] {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.onAdd = () => {}, this.onRefresh = () => {
      // this.props.getBusinesses();
    }, _temp;
  }

  // constructor(props) {
  //   super(props);
  //   // this.onRefresh();
  // }

  render() {
    return _jsx('div', {}, void 0, _jsx(__WEBPACK_IMPORTED_MODULE_2_material_ui_Paper___default.a, {
      zDepth: 1,
      rounded: false
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_7__main_css___default.a.header
    }, void 0, _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_7__main_css___default.a.title
    }, void 0, 'Businesses'), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      label: 'ADD',
      primary: true,
      icon: _ref,
      onTouchTap: this.onAdd
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      label: 'REFRESH',
      primary: true,
      icon: _ref2,
      onTouchTap: this.onRefresh
    })), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_7__main_css___default.a.content
    }, void 0, this.props.loading ? '' : TestData.map(item => _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a.businessItem
    }, item, _jsx('div', {
      style: { backgroundImage: "url('https://www.sclabs.co.uk/media/location/2017/05/15/photo_thumbnail.jpg')" },
      className: __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a.logo
    }), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a.name
    }, void 0, 'Name'), _jsx('div', {
      className: __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a.credits
    }, void 0, '87 Credits'), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      label: 'Includes 5 work places',
      onTouchTap: this.onRefresh,
      className: __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a.workPlaces
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      label: 'EDIT',
      secondary: true,
      icon: _ref3,
      onTouchTap: this.onRefresh
    }), _jsx(__WEBPACK_IMPORTED_MODULE_3_material_ui_FlatButton___default.a, {
      label: 'DELETE',
      secondary: true,
      icon: _ref4,
      onTouchTap: this.onRefresh
    }))))));
  }
}

Businesses.propTypes = {
  // loading: PropTypes.bool,
  getBusinesses: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired
};

Businesses.defaultProps = {
  // loading: false,
};

const mapState = state => _extends({}, __WEBPACK_IMPORTED_MODULE_8__components_BaseComponent__["a" /* default */].mapState(state));

const mapDispatch = _extends({}, __WEBPACK_IMPORTED_MODULE_8__components_BaseComponent__["a" /* default */].mapDispatch, {
  getBusinesses: __WEBPACK_IMPORTED_MODULE_9__actions__["a" /* getBusinesses */]
});

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5_react_redux__["connect"])(mapState, mapDispatch)(__WEBPACK_IMPORTED_MODULE_4_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_7__main_css___default.a, __WEBPACK_IMPORTED_MODULE_6__Businesses_css___default.a)(Businesses)));

/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Businesses__ = __webpack_require__(58);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Businesses__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/businesses',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Business List',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Connections_css__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Connections_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Connections_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'connections');

function Connections(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Connections_css___default.a)(Connections));

/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Connections__ = __webpack_require__(60);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Connections__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/connections',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Connections',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Credit_css__ = __webpack_require__(119);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Credit_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Credit_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'credit');

function Credit(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Credit_css___default.a)(Credit));

/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Credit__ = __webpack_require__(62);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Credit__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/credit',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Credit',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 64 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Paper__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_material_ui_Paper___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_material_ui_Paper__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__FindTalent_css__ = __webpack_require__(120);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__FindTalent_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__FindTalent_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();








const style = {
  height: '200',
  width: '200',
  margin: 20,
  textAlign: 'center',
  display: 'inline-block'
};

var _ref = _jsx('div', {}, void 0, 'sdf');

function FindTalent(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_3__FindTalent_css___default.a)(FindTalent));

/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__FindTalent__ = __webpack_require__(64);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__FindTalent__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/find',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Find Talent',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Help_css__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Help_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Help_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'help');

function Help(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Help_css___default.a)(Help));

/***/ }),
/* 67 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Help__ = __webpack_require__(66);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Help__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/help',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Help',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Messages_css__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Messages_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Messages_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'Messages');

function Messages(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Messages_css___default.a)(Messages));

/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Messages__ = __webpack_require__(68);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Messages__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/messages',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Messages',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Password_css__ = __webpack_require__(123);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Password_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Password_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'change password');

function Password(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__Password_css___default.a)(Password));

/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Password__ = __webpack_require__(70);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__Password__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/password',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'Change Password',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ShortList_css__ = __webpack_require__(124);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ShortList_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__ShortList_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('div', {}, void 0, 'shortlist');

function ShortList(props) {
  return _ref;
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_2__ShortList_css___default.a)(ShortList));

/***/ }),
/* 73 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_MainLayout__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ShortList__ = __webpack_require__(72);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }





var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_2__ShortList__["a" /* default */], {});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '/recruiter/shortlist',

  action() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return {
        title: 'ShortList',
        component: _jsx(__WEBPACK_IMPORTED_MODULE_1__components_MainLayout__["a" /* default */], {
          path: _this.path
        }, void 0, _ref)
      };
    })();
  }

});

/***/ }),
/* 74 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__NotFound_css__ = __webpack_require__(125);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__NotFound_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__NotFound_css__);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();






var _ref = _jsx('p', {}, void 0, 'Sorry, the page you were trying to view does not exist.');

function NotFound(props) {
  return _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_3__NotFound_css___default.a.root
  }, void 0, _jsx('div', {
    className: __WEBPACK_IMPORTED_MODULE_3__NotFound_css___default.a.container
  }, void 0, _jsx('h1', {}, void 0, props.title), _ref));
}

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_2_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_3__NotFound_css___default.a)(NotFound));

/***/ }),
/* 75 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__NotFound__ = __webpack_require__(74);
var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();




const title = 'Page Not Found';

var _ref = _jsx(__WEBPACK_IMPORTED_MODULE_1__NotFound__["a" /* default */], {
  title: title
});

/* harmony default export */ __webpack_exports__["default"] = ({

  path: '*',

  action() {
    return {
      title,
      component: _ref,
      status: 404
    };
  }

});

/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = configureStore;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_redux_thunk__ = __webpack_require__(155);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_redux_thunk___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_redux_thunk__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__reducers__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__createHelpers__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__logger__ = __webpack_require__(78);






function configureStore(initialState, helpersConfig) {
  const helpers = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__createHelpers__["a" /* default */])(helpersConfig);
  const middleware = [__WEBPACK_IMPORTED_MODULE_1_redux_thunk___default.a.withExtraArgument(helpers)];

  let enhancer;

  if (false) {
    middleware.push(createLogger());

    // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
    let devToolsExtension = f => f;
    if (process.env.BROWSER && window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }

    enhancer = compose(applyMiddleware(...middleware), devToolsExtension);
  } else {
    enhancer = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_redux__["applyMiddleware"])(...middleware);
  }

  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_redux__["createStore"])(__WEBPACK_IMPORTED_MODULE_2__reducers__["a" /* default */], initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (false) {
    module.hot.accept('../reducers', () =>
    // eslint-disable-next-line global-require
    store.replaceReducer(require('../reducers').default));
  }

  return store;
}

/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createHelpers;
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createGraphqlRequest(fetch) {
  return (() => {
    var _ref = _asyncToGenerator(function* (query, variables) {
      const fetchConfig = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables }),
        credentials: 'include'
      };
      const resp = yield fetch('/graphql', fetchConfig);
      if (resp.status !== 200) throw new Error(resp.statusText);
      return resp.json();
    });

    function graphqlRequest(_x, _x2) {
      return _ref.apply(this, arguments);
    }

    return graphqlRequest;
  })();
}

function createHelpers({ fetch, history }) {
  return {
    fetch,
    history,
    graphqlRequest: createGraphqlRequest(fetch)
  };
}

/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export default */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_util__ = __webpack_require__(158);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_util__);


function inspectObject(object) {
  return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_util__["inspect"])(object, {
    colors: true
  });
}

function singleLine(str) {
  return str.replace(/\s+/g, ' ');
}

const actionFormatters = {
  // This is used at feature/apollo branch, but it can help you when implementing Apollo
  APOLLO_QUERY_INIT: a => `queryId:${a.queryId} variables:${inspectObject(a.variables)}\n   ${singleLine(a.queryString)}`,

  APOLLO_QUERY_RESULT: a => `queryId:${a.queryId}\n   ${singleLine(inspectObject(a.result))}`,

  APOLLO_QUERY_STOP: a => `queryId:${a.queryId}`
};

// Server side redux action logger
function createLogger() {
  // eslint-disable-next-line no-unused-vars
  return store => next => action => {
    let formattedPayload = '';
    const actionFormatter = actionFormatters[action.type];
    if (typeof actionFormatter === 'function') {
      formattedPayload = actionFormatter(action);
    } else if (action.toString !== Object.prototype.toString) {
      formattedPayload = action.toString();
    } else if (typeof action.payload !== 'undefined') {
      formattedPayload = inspectObject(action.payload);
    } else {
      formattedPayload = inspectObject(action);
    }

    console.log(` * ${action.type}: ${formattedPayload}`); // eslint-disable-line no-console
    return next(action);
  };
}

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "body{margin:0;color:#222;font-weight:100;font-size:1em;font-family:Roboto,Segoe UI,HelveticaNeue-Light,sans-serif;line-height:1.375}._BYvE{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;min-width:300px;min-height:100vh}@media (min-width:768px){.container{width:750px}}@media (min-width:992px){.container{width:970px}}@media (min-width:1200px){.container{width:1170px}}.container{padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}header{background-color:#333;font-size:.85em}._2r24D{float:left;-ms-flex-item-align:center;align-self:center;margin-top:20px;margin-right:20px}._2YCQz{display:none!important}header ul{list-style-type:none;margin:0;padding:0}header li{float:left}header li a{display:block;padding:0 10px;line-height:60px;text-transform:uppercase;text-align:center;text-decoration:none;color:#9d9d9d;cursor:pointer;-webkit-transition:color .7s ease 0s;-o-transition:color .7s ease 0s;transition:color .7s ease 0s}header li a:hover{color:#fff}.Rn_ME{background-color:#333!important;border-radius:0!important}.Rn_ME a{display:block;padding:0 16px;margin:0 -16px;font-size:.85em;text-decoration:none;text-transform:uppercase;color:#9d9d9d;cursor:pointer;-webkit-transition:color .7s ease 0s;-o-transition:color .7s ease 0s;transition:color .7s ease 0s}.Rn_ME a:hover{color:#fff}._7P_Rz{float:right}._3GU8o{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative;min-height:500px}._2WJZ4{position:absolute;top:0;width:100%;height:100%;background-color:#fafafa;opacity:.5}._2HROn{position:absolute!important;top:0;background-color:#e0e0e0!important}footer{padding-top:15px;padding-bottom:20px;font-size:.85em;color:#9d9d9d;background-color:#333}footer a{color:#9d9d9d;-webkit-transition:color .7s ease 0s;-o-transition:color .7s ease 0s;transition:color .7s ease 0s;text-decoration:none}footer a:hover{color:#fff}.C2Ryj{display:inline-block;width:25%;float:left}._2mvxU{display:block;margin-bottom:10px}footer .fa{margin-right:8px}@media (max-width:767px){._1yizo ._2r24D,._1yizo ._7P_Rz,._1yizo header li{float:none}._1yizo ._3vb15{margin:0 -15px;padding:0 15px;height:50px}._1yizo.yc4oe ._3vb15{border-bottom:1px solid #282828}._1yizo ._2r24D{display:inline-block;text-align:left;margin-top:15px}._1yizo header ul{-webkit-transition:all .45s cubic-bezier(.23,1,.32,1) 0ms;-o-transition:all .45s cubic-bezier(.23,1,.32,1) 0ms;transition:all .45s cubic-bezier(.23,1,.32,1) 0ms;overflow-y:hidden;height:0;margin:0 -15px;padding:0 15px}._1yizo.yc4oe header ul{height:160px;border-top:1px solid #3a3a3a}._1yizo header li a{text-align:left;line-height:40px}._1yizo.Rn_ME{background-color:#404040!important}._1yizo ._2YCQz{display:inline-block!important;float:right}._1yizo ._2YCQz span{color:#9d9d9d!important}._1yizo .C2Ryj{width:100%}}", ""]);

// exports
exports.locals = {
	"root": "_BYvE",
	"headerBrand": "_2r24D",
	"toggle": "_2YCQz",
	"subMenu": "Rn_ME",
	"logout": "_7P_Rz",
	"content": "_3GU8o",
	"loadingMask": "_2WJZ4",
	"loadingBar": "_2HROn",
	"footerBlock": "C2Ryj",
	"footerItem": "_2mvxU",
	"small": "_1yizo",
	"headerBrandRoot": "_3vb15",
	"open": "yc4oe"
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "body{margin:0;overflow-y:hidden;color:#222;font-weight:100;font-size:16px;font-family:Roboto,Segoe UI,HelveticaNeue-Light,sans-serif;line-height:1.375}._3kThm{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}._1ErFs,._3kThm{display:-webkit-box;display:-ms-flexbox;display:flex}._1ErFs{height:60px;-webkit-box-align:center;-ms-flex-align:center;align-items:center;background-color:#333;-webkit-box-shadow:rgba(0,0,0,.12) 0 1px 6px,rgba(0,0,0,.12) 0 1px 4px;box-shadow:0 1px 6px rgba(0,0,0,.12),0 1px 4px rgba(0,0,0,.12);padding:0 6px;border-bottom:1px solid #2a2a2a}._132Zw{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%;padding:0 15px}.-TL4h,.AavA5{color:#9d9d9d!important}._2tZJG{-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%}._1eP4-,._2tZJG{display:-webkit-box;display:-ms-flexbox;display:flex}._1eP4-{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;background-color:#333;width:250px;height:calc(100vh - 60px);margin-left:-250px;border-top:1px solid #3a3a3a;-webkit-box-shadow:rgba(0,0,0,.12) 0 1px 6px,rgba(0,0,0,.12) 0 1px 4px;box-shadow:0 1px 6px rgba(0,0,0,.12),0 1px 4px rgba(0,0,0,.12);-webkit-transition:margin .45s cubic-bezier(.23,1,.32,1) 0ms;-o-transition:margin .45s cubic-bezier(.23,1,.32,1) 0ms;transition:margin .45s cubic-bezier(.23,1,.32,1) 0ms}.rJY1P ._1eP4-{position:fixed;z-index:1}._5pts9 ._1eP4-{margin-left:0}._1eP4- ul{padding:0}._1eP4- button{width:100%!important;height:50px!important;text-align:left!important;color:#9d9d9d!important}._1eP4- button.njn-C{background-color:#222!important}._1eP4- button i{width:40px;text-align:center}._1eP4- button.njn-C i{color:#00b6a4}._1eP4- button span{font-weight:inherit!important;text-transform:none!important;font-size:1em!important}._1eP4- button.njn-C span{text-align:center}._1eP4- ._31b91{-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%;position:relative;min-height:40px}._1eP4- ._31b91 div{position:absolute;bottom:0;left:0;right:0;text-align:center;padding:30px;color:#9d9d9d!important;font-size:.8em}._5pts9 .Fn87_{position:absolute;width:100%;height:100%;background-color:rgba(0,0,0,.5)}._1ofi5{-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%;padding:2em;overflow-y:auto;height:calc(100vh - 60px)}", ""]);

// exports
exports.locals = {
	"root": "_3kThm",
	"header": "_1ErFs",
	"title": "_132Zw",
	"toggleIcon": "-TL4h",
	"logoutIcon": "AavA5",
	"container": "_2tZJG",
	"sidebar": "_1eP4-",
	"small": "rJY1P",
	"open": "_5pts9",
	"active": "njn-C",
	"footer": "_31b91",
	"mask": "Fn87_",
	"content": "_1ofi5"
};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, ".ahT7K{padding-top:20px;padding-bottom:40px}", ""]);

// exports
exports.locals = {
	"contant": "ahT7K"
};

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "._3rDnr,._18ial{position:absolute;width:100%;height:100%}._18ial{background-size:cover;background-position:50%;-webkit-transition:opacity 2s ease;-o-transition:opacity 2s ease;transition:opacity 2s ease}", ""]);

// exports
exports.locals = {
	"container": "_3rDnr",
	"image": "_18ial"
};

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "*{line-height:1.2;margin:0}html{color:#888;display:table;font-family:sans-serif;height:100%;text-align:center;width:100%}body{display:table-cell;vertical-align:middle;padding:2em}h1{color:#555;font-size:2em;font-weight:400}p{margin:0 auto;width:280px}pre{text-align:left;margin-top:32px;margin-top:2rem}@media only screen and (max-width:280px){body,p{width:95%}h1{font-size:1.5em;margin:0 0 .3em}}", ""]);

// exports


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, ".hkjtl{position:absolute;width:100%;top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);text-align:center}._1lh7C{color:#fff;font-size:36px;margin-bottom:30px}._3Jl_o{display:inline-block;width:250px;margin:0 15px;margin-bottom:25px;padding:5px 0;color:#fff;border:1px solid #fff;border-radius:250px;text-decoration:none;-webkit-transition:background-color .5s ease 0s;-o-transition:background-color .5s ease 0s;transition:background-color .5s ease 0s}._3Jl_o:first-child{background-color:rgba(255,147,0,.5)}._3Jl_o:first-child:hover{background-color:#ff9300}._3Jl_o:last-child{background-color:rgba(0,182,164,.5)}._3Jl_o:last-child:hover{background-color:#00b6a4}._3Jl_o span:first-child{font-size:16px}._3Jl_o span:last-child{font-size:24px}.OL54b{height:50px;margin:10px}", ""]);

// exports
exports.locals = {
	"content": "hkjtl",
	"title": "_1lh7C",
	"register": "_3Jl_o",
	"appButton": "OL54b"
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "._2KizQ{position:absolute;width:100%;top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);text-align:center}._3bL9j{display:inline-block;text-align:left}._3bL9j h1{margin:0}.agT-j{margin:15px 0}.XRt5p{color:#00b6a4;cursor:pointer;text-decoration:none}", ""]);

// exports
exports.locals = {
	"root": "_2KizQ",
	"container": "_3bL9j",
	"loginButton": "agT-j",
	"reset": "XRt5p"
};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "._1ucDt{position:absolute;width:100%;top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);text-align:center}._1Xm_D{display:inline-block;text-align:left}._1Xm_D h1{margin:0}._1dSGt{margin:15px 0}", ""]);

// exports
exports.locals = {
	"root": "_1ucDt",
	"container": "_1Xm_D",
	"registerButton": "_1dSGt"
};

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, ".duk1V{position:absolute;width:100%;top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);text-align:center}._3PPv1{display:inline-block;text-align:left}._3PPv1 h1{margin:0}._1-vVi{margin:20px 0}", ""]);

// exports
exports.locals = {
	"root": "duk1V",
	"container": "_3PPv1",
	"resetButton": "_1-vVi"
};

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "._2QTNW{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:15px;font-size:1.3em;font-weight:400}.bW8WF{-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%}._2QTNW button i{font-size:.8em}._2QTNW button span{font-weight:400!important}", ""]);

// exports
exports.locals = {
	"header": "_2QTNW",
	"title": "bW8WF",
	"content": "_3EsRr",
	"footer": "_10Tuq"
};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports
exports.locals = {
	"aaa": "_2Hpyh"
};

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, ".L8O_W{display:-webkit-box;display:-ms-flexbox;display:flex;padding:10px;-webkit-box-align:center;-ms-flex-align:center;align-items:center}._1Q8px{width:50px;height:50px;background-size:cover}._2NEVY{padding:10px}._3QAz4{-webkit-box-flex:1;-ms-flex:1 1 0%;flex:1 1 0%}", ""]);

// exports
exports.locals = {
	"businessItem": "L8O_W",
	"logo": "_1Q8px",
	"name": "_2NEVY",
	"credits": "_3W9yA",
	"workPlaces": "_3QAz4"
};

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "._3_3g8{padding-left:20px;padding-right:20px}._3FKMx{margin:0 auto;padding:0 0 40px;max-width:1000px}", ""]);

// exports
exports.locals = {
	"root": "_3_3g8",
	"container": "_3FKMx"
};

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "56b44686.svg";

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4430ec41.svg";

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "f7b5fa08.png";

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "0d9d4e67.jpg";

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4d461099.jpg";

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fd618d0e.jpg";

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "428173ee.jpg";

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "c1ed64ae.jpg";

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(79);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./HomeLayout.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./HomeLayout.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(80);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./MainLayout.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./MainLayout.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(81);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Page.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Page.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(82);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Slick.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Slick.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(84);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Landing.css", function() {
        content = require("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Landing.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(85);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Login.css", function() {
        content = require("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Login.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(86);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Register.css", function() {
        content = require("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Register.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(87);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Reset.css", function() {
        content = require("!!../../../../node_modules/css-loader/index.js??ref--1-1!../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Reset.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(88);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./main.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./main.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(89);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Applications.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Applications.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(90);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Businesses.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Businesses.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(91);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Connections.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Connections.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(92);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Credit.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Credit.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(93);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./FindTalent.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./FindTalent.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(94);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Help.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Help.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(95);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Messages.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Messages.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(96);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Password.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./Password.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(97);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./ShortList.css", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js??ref--1-1!../../../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./ShortList.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(98);
    var insertCss = __webpack_require__(2);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./NotFound.css", function() {
        content = require("!!../../../node_modules/css-loader/index.js??ref--1-1!../../../node_modules/postcss-loader/lib/index.js??ref--1-2!./NotFound.css");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),
/* 126 */
/***/ (function(module, exports) {

module.exports = {"title":"About Us","html":"<p>For too long hiring across the hospitality, retail and service industries has been beset with issues. Businesses become embroiled in time-consuming and often structure lacking recruitment processes – and must invest resources in interviews that, more often than not, lead to no job position offer whatsoever.</p>\n<p>MyJobPitch was established to overcome each and every last one of these problems.</p>\n<p>For recruiters, we offer access to thousands of job seekers who each provide information critical to your hiring decisions – read CVs and view candidates’ 30 second pitch videos. Just interview candidate that actually can get the Job.</p>\n<p>For job seekers, we provide a platform for connecting with the right recruiters spanning the hospitality, retail and the service industry . For discovering your next job role without the hassle and free from the need of registering with tens of differing websites and running around handing in CV every were.</p>\n<p><b>This is the recruitment industry, revolutionised.</b></p>\n<ul style=\"list-style-type:circle\">\n<li>Easy-to-use, intuitive interface – for desktop and mobile</li>\n<li>30 Second job video pitches</li>\n<li>Connections made between employer and candidate – with details only released when both parties agree</li>\n<li>High quality employers, high calibre employees</li>\n</ul>\n<p><i>We’re eliminating efficiencies from the recruitment process for retail, hospitality and service businesses – doing away with the random and completely eradicating the unknown.</i></p>\n<p><i>For better job seeking. For better candidate hunting.</i></p>\n"};

/***/ }),
/* 127 */
/***/ (function(module, exports) {

module.exports = {"title":"Job Seeker","html":"<p><b>Welcome to your next job role – here’s where you meet the perfect employer</b></p>\n<p><i>Register</i></p>\n<p>Create your profile - upload your CV, write a short CV overview with key skills and other information that portrays you as the illustrious candidate you are.</p>\n<p><i>Record Your Pitch</i></p>\n<p>Use your smartphone or web cam to create a up to 30 second candidate pitch video – show and tell our employees exactly why you should be their next hire.</p>\n<p><i>Get Hired</i></p>\n<p>Then sit back and relax as employers contact you to invite you to an interview, or hire you right there, and right then. What could be simpler?</p>\n<p><b>Seek and discover your hospitality, retail or services position</b></p>\n<p>As a worker in any of these industries, you often face tens of differing websites when it comes to discovering your next position. With MyJobPitch, that search stops here. Recruiters come to us as we provide real insight into potential candidates – for which your pitch will prove pivotal to securing your next position – so take charge and make it count!</p>\n"};

/***/ }),
/* 128 */
/***/ (function(module, exports) {

module.exports = {"title":"Recruiter","html":"<p><b>Discover the new age of recruitment – and explore superior calibre candidates at the tap of a few buttons</b></p>\n<p><i>Register</i></p>\n<p>Quickly and easily set up your profile – from desktop or mobile. No long forms, no complex processes.</p>\n<p><i>Post Your Job</i></p>\n<p>Post your job, painlessly - pause it once you’ve discovered your next employee, and un-pause it as soon as another position pops up, just edit if you need to.</p>\n<p><i>Recruit</i></p>\n<p>Browse through high calibre candidates – view pitch videos, explore key information that’s relevant to your criteria, read CVs and decide whether to interview or hire on sight.</p>\n<p><b>Recruitment. Simplified.</b></p>\n<p>Forget about posting multiple Gumtree ads, spending time organising numerous profiles and piles of paperwork – this is the single online destination for recruiting in the hospitality, retail and services industries.</p>\n<p><b>Pay only when your discover your next hire</b></p>\n<p>Transparency and fairness – we believe that they’re both vitally important in our line of business. Which is why you only pay when you discover a jobseeker who you wish to connect to.</p>\n"};

/***/ }),
/* 129 */
/***/ (function(module, exports) {

module.exports = {"title":"Terms & Conditions","html":"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consequat\ntortor fermentum mi fermentum dignissim. Nullam vel ipsum ut ligula elementum\nlobortis. Maecenas aliquam, massa laoreet lacinia pretium, nisi urna venenatis\ntortor, nec imperdiet tellus libero efficitur metus. Fusce semper posuere\nligula, et facilisis metus bibendum interdum. Mauris at mauris sit amet sem\npharetra commodo a eu leo. Nam at est non risus cursus maximus. Nam feugiat\naugue libero, id consectetur tortor bibendum non. Quisque nec fringilla lorem.\nNullam efficitur vulputate mauris, nec maximus leo dignissim id.</p>\n<p>Nullam eu feugiat mi. Quisque nec tristique nisl, dignissim dictum leo. Nam\nnon quam nisi. Donec rutrum turpis ac diam blandit, id pulvinar mauris\nsuscipit. Pellentesque tincidunt libero ultricies risus iaculis, sit amet\nconsequat velit blandit. Fusce quis varius nulla. Nullam nisi nisi, suscipit\nut magna quis, feugiat porta nibh. Sed id enim lectus. Suspendisse elementum\njusto sapien, sit amet consequat orci accumsan et. Aliquam ornare ullamcorper\nsem sed finibus. Nullam ac lacus pulvinar, egestas felis ut, accumsan est.</p>\n<p>Pellentesque sagittis vehicula sem quis luctus. Proin sodales magna in lorem\nhendrerit aliquam. Integer eu varius orci. Vestibulum ante ipsum primis in\nfaucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum ante ipsum\nprimis in faucibus orci luctus et ultrices posuere cubilia Curae; Ut at mauris\nnibh. Suspendisse maximus ac eros at vestibulum.</p>\n<p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque egestas\ntortor et dui consequat faucibus. Nunc vitae odio ornare, venenatis ligula a,\nvulputate nisl. Aenean congue varius ex, sit amet bibendum odio posuere at.\nNulla facilisi. In finibus, nulla vitae tincidunt ornare, sapien nulla\nfermentum mauris, sed consectetur tortor arcu eget arcu. Vestibulum vel quam\nenim.</p>\n"};

/***/ }),
/* 130 */
/***/ (function(module, exports) {

module.exports = require("./assets.json");

/***/ }),
/* 131 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 132 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 133 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/slicedToArray");

/***/ }),
/* 134 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 135 */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),
/* 136 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 137 */
/***/ (function(module, exports) {

module.exports = require("express-graphql");

/***/ }),
/* 138 */
/***/ (function(module, exports) {

module.exports = require("express-jwt");

/***/ }),
/* 139 */
/***/ (function(module, exports) {

module.exports = require("history/createBrowserHistory");

/***/ }),
/* 140 */
/***/ (function(module, exports) {

module.exports = require("isomorphic-fetch");

/***/ }),
/* 141 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Checkbox");

/***/ }),
/* 142 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Dialog");

/***/ }),
/* 143 */
/***/ (function(module, exports) {

module.exports = require("material-ui/LinearProgress");

/***/ }),
/* 144 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Menu");

/***/ }),
/* 145 */
/***/ (function(module, exports) {

module.exports = require("material-ui/MenuItem");

/***/ }),
/* 146 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Popover");

/***/ }),
/* 147 */
/***/ (function(module, exports) {

module.exports = require("material-ui/Snackbar");

/***/ }),
/* 148 */
/***/ (function(module, exports) {

module.exports = require("material-ui/TextField");

/***/ }),
/* 149 */
/***/ (function(module, exports) {

module.exports = require("material-ui/styles/MuiThemeProvider");

/***/ }),
/* 150 */
/***/ (function(module, exports) {

module.exports = require("material-ui/styles/getMuiTheme");

/***/ }),
/* 151 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 152 */
/***/ (function(module, exports) {

module.exports = require("pretty-error");

/***/ }),
/* 153 */
/***/ (function(module, exports) {

module.exports = require("react-dom/server");

/***/ }),
/* 154 */
/***/ (function(module, exports) {

module.exports = require("react-tap-event-plugin");

/***/ }),
/* 155 */
/***/ (function(module, exports) {

module.exports = require("redux-thunk");

/***/ }),
/* 156 */
/***/ (function(module, exports) {

module.exports = require("serialize-javascript");

/***/ }),
/* 157 */
/***/ (function(module, exports) {

module.exports = require("universal-router");

/***/ }),
/* 158 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26);
module.exports = __webpack_require__(25);


/***/ })
/******/ ]);
//# sourceMappingURL=server.js.map