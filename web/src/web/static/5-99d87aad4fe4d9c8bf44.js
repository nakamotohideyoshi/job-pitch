webpackJsonp([5],{1208:function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=n(35),u=r(o),i=n(4),a=r(i),s=n(44),l=r(s),c=n(6),f=r(c),d=n(5),p=r(d),T=n(1),E=r(T),h=n(1220),y=r(h),A=n(1611),m=r(A),v=n(1535),b=r(v),S=n(82),_=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(S),g=n(1606),O=r(g),C=function(e){function t(){var e,n,r,o;(0,a.default)(this,t);for(var i=arguments.length,s=Array(i),l=0;l<i;l++)s[l]=arguments[l];return n=r=(0,f.default)(this,(e=t.__proto__||(0,u.default)(t)).call.apply(e,[this].concat(s))),r.onSuccess=function(e,t){console.log("The payment was succeeded!",e,t),_.successNotif("The payment was succeeded!")},r.onError=function(e){console.log("Error!",e),_.errorNotif("Payment Error!")},o=n,(0,f.default)(r,o)}return(0,p.default)(t,e),(0,l.default)(t,[{key:"render",value:function(){var e=this,t={sandbox:"AcFQJfacbVGOsuGNqLjU7mFAzPKfMf3ZHC403WF4jVuxlNxxGCJiu3ZLl_Z0tKnO6YGUNcjdUJYSkrCy"},n=[{credits:20,price:20},{credits:40,price:40}];return E.default.createElement("div",null,E.default.createElement(y.default,{title:"Add Credit"}),E.default.createElement("div",{className:"pageHeader"},E.default.createElement("h1",null,"Add Credit")),E.default.createElement("div",{className:"board"},E.default.createElement(b.default,{readOnly:!0}),E.default.createElement("div",{className:O.default.planContainer},n.map(function(n){return E.default.createElement("div",{className:O.default.planBox,key:n.credits},E.default.createElement("div",{className:O.default.credits},n.credits+" Credits"),E.default.createElement("div",{className:O.default.price},"€ "+n.price),E.default.createElement(m.default,{env:"sandbox",client:t,currency:"EUR",total:n.price,onSuccess:function(t){return e.onSuccess(t,n)},onError:e.onError}))}))))}}]),t}(T.Component);t.default=C,e.exports=t.default},1215:function(e,t){t.__esModule=!0;var n=(t.ATTRIBUTE_NAMES={BODY:"bodyAttributes",HTML:"htmlAttributes",TITLE:"titleAttributes"},t.TAG_NAMES={BASE:"base",BODY:"body",HEAD:"head",HTML:"html",LINK:"link",META:"meta",NOSCRIPT:"noscript",SCRIPT:"script",STYLE:"style",TITLE:"title"}),r=(t.VALID_TAG_NAMES=Object.keys(n).map(function(e){return n[e]}),t.TAG_PROPERTIES={CHARSET:"charset",CSS_TEXT:"cssText",HREF:"href",HTTPEQUIV:"http-equiv",INNER_HTML:"innerHTML",ITEM_PROP:"itemprop",NAME:"name",PROPERTY:"property",REL:"rel",SRC:"src"},t.REACT_TAG_MAP={accesskey:"accessKey",charset:"charSet",class:"className",contenteditable:"contentEditable",contextmenu:"contextMenu","http-equiv":"httpEquiv",itemprop:"itemProp",tabindex:"tabIndex"});t.HELMET_PROPS={DEFAULT_TITLE:"defaultTitle",ENCODE_SPECIAL_CHARACTERS:"encodeSpecialCharacters",ON_CHANGE_CLIENT_STATE:"onChangeClientState",TITLE_TEMPLATE:"titleTemplate"},t.HTML_TAG_MAP=Object.keys(r).reduce(function(e,t){return e[r[t]]=t,e},{}),t.SELF_CLOSING_TAGS=[n.NOSCRIPT,n.SCRIPT,n.STYLE],t.HELMET_ATTRIBUTE="data-react-helmet"},1216:function(e,t,n){function r(e){return null===e||void 0===e}function o(e){return!(!e||"object"!=typeof e||"number"!=typeof e.length)&&("function"==typeof e.copy&&"function"==typeof e.slice&&!(e.length>0&&"number"!=typeof e[0]))}function u(e,t,n){var u,c;if(r(e)||r(t))return!1;if(e.prototype!==t.prototype)return!1;if(s(e))return!!s(t)&&(e=i.call(e),t=i.call(t),l(e,t,n));if(o(e)){if(!o(t))return!1;if(e.length!==t.length)return!1;for(u=0;u<e.length;u++)if(e[u]!==t[u])return!1;return!0}try{var f=a(e),d=a(t)}catch(e){return!1}if(f.length!=d.length)return!1;for(f.sort(),d.sort(),u=f.length-1;u>=0;u--)if(f[u]!=d[u])return!1;for(u=f.length-1;u>=0;u--)if(c=f[u],!l(e[c],t[c],n))return!1;return typeof e==typeof t}var i=Array.prototype.slice,a=n(1218),s=n(1217),l=e.exports=function(e,t,n){return n||(n={}),e===t||(e instanceof Date&&t instanceof Date?e.getTime()===t.getTime():!e||!t||"object"!=typeof e&&"object"!=typeof t?n.strict?e===t:e==t:u(e,t,n))}},1217:function(e,t){function n(e){return"[object Arguments]"==Object.prototype.toString.call(e)}function r(e){return e&&"object"==typeof e&&"number"==typeof e.length&&Object.prototype.hasOwnProperty.call(e,"callee")&&!Object.prototype.propertyIsEnumerable.call(e,"callee")||!1}var o="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();t=e.exports=o?n:r,t.supported=n,t.unsupported=r},1218:function(e,t){function n(e){var t=[];for(var n in e)t.push(n);return t}t=e.exports="function"==typeof Object.keys?Object.keys:n,t.shim=n},1219:function(e,t,n){var r;/*!
  Copyright (c) 2015 Jed Watson.
  Based on code that is Copyright 2013-2015, Facebook, Inc.
  All rights reserved.
*/
!function(){"use strict";var o=!("undefined"==typeof window||!window.document||!window.document.createElement),u={canUseDOM:o,canUseWorkers:"undefined"!=typeof Worker,canUseEventListeners:o&&!(!window.addEventListener&&!window.attachEvent),canUseViewport:o&&!!window.screen};void 0!==(r=function(){return u}.call(t,n,t,e))&&(e.exports=r)}()},1220:function(e,t,n){function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}t.__esModule=!0,t.Helmet=void 0;var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(1),f=r(c),d=n(2),p=r(d),T=n(1222),E=r(T),h=n(1216),y=r(h),A=n(1221),m=n(1215),v=function(){return null},b=(0,E.default)(A.reducePropsToState,A.handleClientStateChange,A.mapStateOnServer)(v),S=function(e){var t,n;return n=t=function(t){function n(){return u(this,n),i(this,t.apply(this,arguments))}return a(n,t),n.prototype.shouldComponentUpdate=function(e){return!(0,y.default)(this.props,e)},n.prototype.mapNestedChildrenToProps=function(e,t){if(!t)return null;switch(e.type){case m.TAG_NAMES.SCRIPT:case m.TAG_NAMES.NOSCRIPT:return{innerHTML:t};case m.TAG_NAMES.STYLE:return{cssText:t}}throw new Error("<"+e.type+" /> elements are self-closing and can not contain children. Refer to our API for more information.")},n.prototype.flattenArrayTypeChildren=function(e){var t,n=e.child,r=e.arrayTypeChildren,o=e.newChildProps,u=e.nestedChildren;return s({},r,(t={},t[n.type]=[].concat(r[n.type]||[],[s({},o,this.mapNestedChildrenToProps(n,u))]),t))},n.prototype.mapObjectTypeChildren=function(e){var t,n,r=e.child,o=e.newProps,u=e.newChildProps,i=e.nestedChildren;switch(r.type){case m.TAG_NAMES.TITLE:return s({},o,(t={},t[r.type]=i,t.titleAttributes=s({},u),t));case m.TAG_NAMES.BODY:return s({},o,{bodyAttributes:s({},u)});case m.TAG_NAMES.HTML:return s({},o,{htmlAttributes:s({},u)})}return s({},o,(n={},n[r.type]=s({},u),n))},n.prototype.mapArrayTypeChildrenToProps=function(e,t){var n=s({},t);return Object.keys(e).forEach(function(t){var r;n=s({},n,(r={},r[t]=e[t],r))}),n},n.prototype.warnOnInvalidChildren=function(e,t){return!0},n.prototype.mapChildrenToProps=function(e,t){var n=this,r={};return f.default.Children.forEach(e,function(e){if(e&&e.props){var u=e.props,i=u.children,a=o(u,["children"]),s=(0,A.convertReactPropstoHtmlAttributes)(a);switch(n.warnOnInvalidChildren(e,i),e.type){case m.TAG_NAMES.LINK:case m.TAG_NAMES.META:case m.TAG_NAMES.NOSCRIPT:case m.TAG_NAMES.SCRIPT:case m.TAG_NAMES.STYLE:r=n.flattenArrayTypeChildren({child:e,arrayTypeChildren:r,newChildProps:s,nestedChildren:i});break;default:t=n.mapObjectTypeChildren({child:e,newProps:t,newChildProps:s,nestedChildren:i})}}}),t=this.mapArrayTypeChildrenToProps(r,t)},n.prototype.render=function(){var t=this.props,n=t.children,r=o(t,["children"]),u=s({},r);return n&&(u=this.mapChildrenToProps(n,u)),f.default.createElement(e,u)},l(n,null,[{key:"canUseDOM",set:function(t){e.canUseDOM=t}}]),n}(f.default.Component),t.propTypes={base:p.default.object,bodyAttributes:p.default.object,children:p.default.oneOfType([p.default.arrayOf(p.default.node),p.default.node]),defaultTitle:p.default.string,encodeSpecialCharacters:p.default.bool,htmlAttributes:p.default.object,link:p.default.arrayOf(p.default.object),meta:p.default.arrayOf(p.default.object),noscript:p.default.arrayOf(p.default.object),onChangeClientState:p.default.func,script:p.default.arrayOf(p.default.object),style:p.default.arrayOf(p.default.object),title:p.default.string,titleAttributes:p.default.object,titleTemplate:p.default.string},t.defaultProps={encodeSpecialCharacters:!0},t.peek=e.peek,t.rewind=function(){var t=e.rewind();return t||(t=(0,A.mapStateOnServer)({baseTag:[],bodyAttributes:{},encodeSpecialCharacters:!0,htmlAttributes:{},linkTags:[],metaTags:[],noscriptTags:[],scriptTags:[],styleTags:[],title:"",titleAttributes:{}})),t},n}(b);S.renderStatic=S.rewind,t.Helmet=S,t.default=S},1221:function(e,t,n){function r(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0,t.warn=t.requestIdleCallback=t.reducePropsToState=t.mapStateOnServer=t.handleClientStateChange=t.convertReactPropstoHtmlAttributes=void 0;var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i=n(1),a=r(i),s=n(19),l=r(s),c=n(1215),f=function(e){return!1===(!(arguments.length>1&&void 0!==arguments[1])||arguments[1])?String(e):String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")},d=function(e){var t=y(e,c.TAG_NAMES.TITLE),n=y(e,c.HELMET_PROPS.TITLE_TEMPLATE);if(n&&t)return n.replace(/%s/g,function(){return t});var r=y(e,c.HELMET_PROPS.DEFAULT_TITLE);return t||r||void 0},p=function(e){return y(e,c.HELMET_PROPS.ON_CHANGE_CLIENT_STATE)||function(){}},T=function(e,t){return t.filter(function(t){return void 0!==t[e]}).map(function(t){return t[e]}).reduce(function(e,t){return u({},e,t)},{})},E=function(e,t){return t.filter(function(e){return void 0!==e[c.TAG_NAMES.BASE]}).map(function(e){return e[c.TAG_NAMES.BASE]}).reverse().reduce(function(t,n){if(!t.length)for(var r=Object.keys(n),o=0;o<r.length;o++){var u=r[o],i=u.toLowerCase();if(-1!==e.indexOf(i)&&n[i])return t.concat(n)}return t},[])},h=function(e,t,n){var r={};return n.filter(function(t){return!!Array.isArray(t[e])||(void 0!==t[e]&&b("Helmet: "+e+' should be of type "Array". Instead found type "'+o(t[e])+'"'),!1)}).map(function(t){return t[e]}).reverse().reduce(function(e,n){var o={};n.filter(function(e){for(var n=void 0,u=Object.keys(e),i=0;i<u.length;i++){var a=u[i],s=a.toLowerCase();-1===t.indexOf(s)||n===c.TAG_PROPERTIES.REL&&"canonical"===e[n].toLowerCase()||s===c.TAG_PROPERTIES.REL&&"stylesheet"===e[s].toLowerCase()||(n=s),-1===t.indexOf(a)||a!==c.TAG_PROPERTIES.INNER_HTML&&a!==c.TAG_PROPERTIES.CSS_TEXT&&a!==c.TAG_PROPERTIES.ITEM_PROP||(n=a)}if(!n||!e[n])return!1;var l=e[n].toLowerCase();return r[n]||(r[n]={}),o[n]||(o[n]={}),!r[n][l]&&(o[n][l]=!0,!0)}).reverse().forEach(function(t){return e.push(t)});for(var u=Object.keys(o),i=0;i<u.length;i++){var a=u[i],s=(0,l.default)({},r[a],o[a]);r[a]=s}return e},[]).reverse()},y=function(e,t){for(var n=e.length-1;n>=0;n--){var r=e[n];if(r.hasOwnProperty(t))return r[t]}return null},A=function(e){return{baseTag:E([c.TAG_PROPERTIES.HREF],e),bodyAttributes:T(c.ATTRIBUTE_NAMES.BODY,e),encode:y(e,c.HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),htmlAttributes:T(c.ATTRIBUTE_NAMES.HTML,e),linkTags:h(c.TAG_NAMES.LINK,[c.TAG_PROPERTIES.REL,c.TAG_PROPERTIES.HREF],e),metaTags:h(c.TAG_NAMES.META,[c.TAG_PROPERTIES.NAME,c.TAG_PROPERTIES.CHARSET,c.TAG_PROPERTIES.HTTPEQUIV,c.TAG_PROPERTIES.PROPERTY,c.TAG_PROPERTIES.ITEM_PROP],e),noscriptTags:h(c.TAG_NAMES.NOSCRIPT,[c.TAG_PROPERTIES.INNER_HTML],e),onChangeClientState:p(e),scriptTags:h(c.TAG_NAMES.SCRIPT,[c.TAG_PROPERTIES.SRC,c.TAG_PROPERTIES.INNER_HTML],e),styleTags:h(c.TAG_NAMES.STYLE,[c.TAG_PROPERTIES.CSS_TEXT],e),title:d(e),titleAttributes:T(c.ATTRIBUTE_NAMES.TITLE,e)}},m=function(){return"undefined"!=typeof window&&void 0!==window.requestIdleCallback?window.requestIdleCallback:function(e){var t=Date.now();return setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)}}(),v=function(){return"undefined"!=typeof window&&void 0!==window.cancelIdleCallback?window.cancelIdleCallback:function(e){return clearTimeout(e)}}(),b=function(e){return console&&"function"==typeof console.warn&&console.warn(e)},S=null,_=function(e){var t=e.baseTag,n=e.bodyAttributes,r=e.htmlAttributes,o=e.linkTags,u=e.metaTags,i=e.noscriptTags,a=e.onChangeClientState,s=e.scriptTags,l=e.styleTags,f=e.title,d=e.titleAttributes;S&&v(S),S=m(function(){O(c.TAG_NAMES.BODY,n),O(c.TAG_NAMES.HTML,r),g(f,d);var p={baseTag:C(c.TAG_NAMES.BASE,t),linkTags:C(c.TAG_NAMES.LINK,o),metaTags:C(c.TAG_NAMES.META,u),noscriptTags:C(c.TAG_NAMES.NOSCRIPT,i),scriptTags:C(c.TAG_NAMES.SCRIPT,s),styleTags:C(c.TAG_NAMES.STYLE,l)},T={},E={};Object.keys(p).forEach(function(e){var t=p[e],n=t.newTags,r=t.oldTags;n.length&&(T[e]=n),r.length&&(E[e]=p[e].oldTags)}),S=null,a(e,T,E)})},g=function(e,t){void 0!==e&&document.title!==e&&(document.title=Array.isArray(e)?e.join(""):e),O(c.TAG_NAMES.TITLE,t)},O=function(e,t){var n=document.getElementsByTagName(e)[0];if(n){for(var r=n.getAttribute(c.HELMET_ATTRIBUTE),o=r?r.split(","):[],u=[].concat(o),i=Object.keys(t),a=0;a<i.length;a++){var s=i[a],l=t[s]||"";n.getAttribute(s)!==l&&n.setAttribute(s,l),-1===o.indexOf(s)&&o.push(s);var f=u.indexOf(s);-1!==f&&u.splice(f,1)}for(var d=u.length-1;d>=0;d--)n.removeAttribute(u[d]);o.length===u.length?n.removeAttribute(c.HELMET_ATTRIBUTE):n.getAttribute(c.HELMET_ATTRIBUTE)!==i.join(",")&&n.setAttribute(c.HELMET_ATTRIBUTE,i.join(","))}},C=function(e,t){var n=document.head||document.querySelector(c.TAG_NAMES.HEAD),r=n.querySelectorAll(e+"["+c.HELMET_ATTRIBUTE+"]"),o=Array.prototype.slice.call(r),u=[],i=void 0;return t&&t.length&&t.forEach(function(t){var n=document.createElement(e);for(var r in t)if(t.hasOwnProperty(r))if(r===c.TAG_PROPERTIES.INNER_HTML)n.innerHTML=t.innerHTML;else if(r===c.TAG_PROPERTIES.CSS_TEXT)n.styleSheet?n.styleSheet.cssText=t.cssText:n.appendChild(document.createTextNode(t.cssText));else{var a=void 0===t[r]?"":t[r];n.setAttribute(r,a)}n.setAttribute(c.HELMET_ATTRIBUTE,"true"),o.some(function(e,t){return i=t,n.isEqualNode(e)})?o.splice(i,1):u.push(n)}),o.forEach(function(e){return e.parentNode.removeChild(e)}),u.forEach(function(e){return n.appendChild(e)}),{oldTags:o,newTags:u}},P=function(e){return Object.keys(e).reduce(function(t,n){var r=void 0!==e[n]?n+'="'+e[n]+'"':""+n;return t?t+" "+r:r},"")},R=function(e,t,n,r){var o=P(n);return o?"<"+e+" "+c.HELMET_ATTRIBUTE+'="true" '+o+">"+f(t,r)+"</"+e+">":"<"+e+" "+c.HELMET_ATTRIBUTE+'="true">'+f(t,r)+"</"+e+">"},M=function(e,t,n){return t.reduce(function(t,r){var o=Object.keys(r).filter(function(e){return!(e===c.TAG_PROPERTIES.INNER_HTML||e===c.TAG_PROPERTIES.CSS_TEXT)}).reduce(function(e,t){var o=void 0===r[t]?t:t+'="'+f(r[t],n)+'"';return e?e+" "+o:o},""),u=r.innerHTML||r.cssText||"",i=-1===c.SELF_CLOSING_TAGS.indexOf(e);return t+"<"+e+" "+c.HELMET_ATTRIBUTE+'="true" '+o+(i?"/>":">"+u+"</"+e+">")},"")},w=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce(function(t,n){return t[c.REACT_TAG_MAP[n]||n]=e[n],t},t)},I=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce(function(t,n){return t[c.HTML_TAG_MAP[n]||n]=e[n],t},t)},L=function(e,t,n){var r,o=(r={key:t},r[c.HELMET_ATTRIBUTE]=!0,r),u=w(n,o);return[a.default.createElement(c.TAG_NAMES.TITLE,u,t)]},N=function(e,t){return t.map(function(t,n){var r,o=(r={key:n},r[c.HELMET_ATTRIBUTE]=!0,r);return Object.keys(t).forEach(function(e){var n=c.REACT_TAG_MAP[e]||e;if(n===c.TAG_PROPERTIES.INNER_HTML||n===c.TAG_PROPERTIES.CSS_TEXT){var r=t.innerHTML||t.cssText;o.dangerouslySetInnerHTML={__html:r}}else o[n]=t[e]}),a.default.createElement(e,o)})},j=function(e,t,n){switch(e){case c.TAG_NAMES.TITLE:return{toComponent:function(){return L(0,t.title,t.titleAttributes)},toString:function(){return R(e,t.title,t.titleAttributes,n)}};case c.ATTRIBUTE_NAMES.BODY:case c.ATTRIBUTE_NAMES.HTML:return{toComponent:function(){return w(t)},toString:function(){return P(t)}};default:return{toComponent:function(){return N(e,t)},toString:function(){return M(e,t,n)}}}},G=function(e){var t=e.baseTag,n=e.bodyAttributes,r=e.encode,o=e.htmlAttributes,u=e.linkTags,i=e.metaTags,a=e.noscriptTags,s=e.scriptTags,l=e.styleTags,f=e.title,d=void 0===f?"":f,p=e.titleAttributes;return{base:j(c.TAG_NAMES.BASE,t,r),bodyAttributes:j(c.ATTRIBUTE_NAMES.BODY,n,r),htmlAttributes:j(c.ATTRIBUTE_NAMES.HTML,o,r),link:j(c.TAG_NAMES.LINK,u,r),meta:j(c.TAG_NAMES.META,i,r),noscript:j(c.TAG_NAMES.NOSCRIPT,a,r),script:j(c.TAG_NAMES.SCRIPT,s,r),style:j(c.TAG_NAMES.STYLE,l,r),title:j(c.TAG_NAMES.TITLE,{title:d,titleAttributes:p},r)}};t.convertReactPropstoHtmlAttributes=I,t.handleClientStateChange=_,t.mapStateOnServer=G,t.reducePropsToState=A,t.requestIdleCallback=m,t.warn=b},1222:function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function u(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(1),s=r(a),l=n(1219),c=r(l),f=n(1223),d=r(f);e.exports=function(e,t,n){function r(e){return e.displayName||e.name||"Component"}if("function"!=typeof e)throw new Error("Expected reducePropsToState to be a function.");if("function"!=typeof t)throw new Error("Expected handleStateChangeOnClient to be a function.");if(void 0!==n&&"function"!=typeof n)throw new Error("Expected mapStateOnServer to either be undefined or a function.");return function(l){function f(){T=e(p.map(function(e){return e.props})),E.canUseDOM?t(T):n&&(T=n(T))}if("function"!=typeof l)throw new Error("Expected WrappedComponent to be a React component.");var p=[],T=void 0,E=function(e){function t(){return o(this,t),u(this,e.apply(this,arguments))}return i(t,e),t.peek=function(){return T},t.rewind=function(){if(t.canUseDOM)throw new Error("You may only call rewind() on the server. Call peek() to read the current state.");var e=T;return T=void 0,p=[],e},t.prototype.shouldComponentUpdate=function(e){return!(0,d.default)(e,this.props)},t.prototype.componentWillMount=function(){p.push(this),f()},t.prototype.componentDidUpdate=function(){f()},t.prototype.componentWillUnmount=function(){var e=p.indexOf(this);p.splice(e,1),f()},t.prototype.render=function(){return s.default.createElement(l,this.props)},t}(a.Component);return E.displayName="SideEffect("+r(l)+")",E.canUseDOM=c.default.canUseDOM,E}}},1223:function(e,t){e.exports=function(e,t,n,r){var o=n?n.call(r,e,t):void 0;if(void 0!==o)return!!o;if(e===t)return!0;if("object"!=typeof e||!e||"object"!=typeof t||!t)return!1;var u=Object.keys(e),i=Object.keys(t);if(u.length!==i.length)return!1;for(var a=Object.prototype.hasOwnProperty.bind(t),s=0;s<u.length;s++){var l=u[s];if(!a(l))return!1;var c=e[l],f=t[l];if(!1===(o=n?n.call(r,c,f,l):void 0)||void 0===o&&c!==f)return!1}return!0}},1228:function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}t.__esModule=!0;var o=n(3),u=r(o),i=n(8),a=r(i),s=n(4),l=r(s),c=n(6),f=r(c),d=n(5),p=r(d),T=n(10),E=r(T),h=n(1),y=r(h),A=n(2),m=r(A),v=n(45),b=r(v),S=n(16),_={horizontal:m.default.bool,inline:m.default.bool,componentClass:b.default},g={horizontal:!1,inline:!1,componentClass:"form"},O=function(e){function t(){return(0,l.default)(this,t),(0,f.default)(this,e.apply(this,arguments))}return(0,p.default)(t,e),t.prototype.render=function(){var e=this.props,t=e.horizontal,n=e.inline,r=e.componentClass,o=e.className,i=(0,a.default)(e,["horizontal","inline","componentClass","className"]),s=(0,S.splitBsProps)(i),l=s[0],c=s[1],f=[];return t&&f.push((0,S.prefix)(l,"horizontal")),n&&f.push((0,S.prefix)(l,"inline")),y.default.createElement(r,(0,u.default)({},c,{className:(0,E.default)(o,f)}))},t}(y.default.Component);O.propTypes=_,O.defaultProps=g,t.default=(0,S.bsClass)("form",O),e.exports=t.default},1534:function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var u,i,a,s,l=n(298),c=o(l),f=n(101),d=o(f),p=n(35),T=o(p),E=n(4),h=o(E),y=n(44),A=o(y),m=n(6),v=o(m),b=n(5),S=o(b),_=n(3),g=o(_),O=n(1),C=o(O),P=n(2),R=o(P),M=n(145),w=n(70),I=n(146),L=o(I),N=n(1228),j=o(N),G=n(492),B=o(G),k=n(299),x=o(k),H=n(494),U=o(H),D=n(83),q=o(D),F=n(100),Y=n(493),K=r(Y),V=n(82),X=r(V),z=(u=(0,w.connect)(function(e){return{staticData:e.auth.staticData,saving:e.jobmanager.saving}},(0,g.default)({},K)))((s=a=function(e){function t(){var e,n,r,o;(0,h.default)(this,t);for(var u=arguments.length,i=Array(u),a=0;a<u;a++)i[a]=arguments[a];return n=r=(0,v.default)(this,(e=t.__proto__||(0,T.default)(t)).call.apply(e,[this].concat(i))),r.onAddCredit=function(){r.props.selectBusiness(r.props.business),M.browserHistory.push("/recruiter/credits")},r.onClose=function(){return r.props.onClose()},r.onSave=function(){if(r.isValid(["name"])){var e=r.props,t=e.saveUserBusiness,n=e.uploadBusinessLogo,o=e.deleteBusinessLogo,u=e.onClose,i=r.state,a=i.formModel,s=i.logo;t(a).then(function(e){return s.file?n({business:e.id,image:s.file},function(e){console.log(e)}).then(function(){X.successNotif("Saved!"),u(e)}):e.images.length>0&&!s.exist?o(e.images[0].id).then(function(){X.successNotif("Saved!"),u(e)}):(X.successNotif("Saved!"),void u(e))})}},o=n,(0,v.default)(r,o)}return(0,S.default)(t,e),(0,A.default)(t,[{key:"componentDidMount",value:function(){var e=this;d.default.resolve(this.props.business).then(function(t){var n=(0,c.default)({},t),r={default:X.getBusinessLogo(),url:X.getBusinessLogo(t),exist:t.images&&t.images.length>0};e.setState({formModel:n,logo:r})})}},{key:"render",value:function(){var e=this.props,t=e.staticData,n=e.business,r=e.saving,o=n.id?n.tokens+" Credit"+(n.tokens>1?"s":""):t.initialTokens.tokens+" free credits";return C.default.createElement(L.default,{show:!0,onHide:this.onClose,backdrop:"static"},C.default.createElement(j.default,{horizontal:!0},C.default.createElement(L.default.Header,{closeButton:!0},C.default.createElement(L.default.Title,null,n.id?"Edit":"Add"," Business")),C.default.createElement(L.default.Body,null,C.default.createElement(this.TextFieldGroup,{type:"text",label:"Name",name:"name"}),C.default.createElement(B.default,null,C.default.createElement(x.default,{componentClass:U.default,sm:2},"Credits"),C.default.createElement(x.default,{sm:10},o,C.default.createElement(q.default,{bsStyle:"warning",style:{marginLeft:"10px"},onClick:this.onAddCredit},"Add Credits"))),C.default.createElement(this.ImageFieldGroup,{label:"Logo",name:"logo"})),C.default.createElement(L.default.Footer,null,C.default.createElement(this.SubmitCancelButtons,{submtting:r,labels:["Save","Saving..."],onClick:this.onSave,cancelLabel:"Cancel",onCancel:this.onClose}))))}}]),t}(F.FormComponent),a.propTypes={staticData:R.default.object.isRequired,saving:R.default.bool.isRequired,saveUserBusiness:R.default.func.isRequired,uploadBusinessLogo:R.default.func.isRequired,deleteBusinessLogo:R.default.func.isRequired,selectBusiness:R.default.func.isRequired,business:R.default.object.isRequired,onClose:R.default.func.isRequired},i=s))||i;t.default=z,e.exports=t.default},1535:function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var u,i,a,s,l=n(35),c=o(l),f=n(4),d=o(f),p=n(44),T=o(p),E=n(6),h=o(E),y=n(5),A=o(y),m=n(3),v=o(m),b=n(1),S=o(b),_=n(2),g=o(_),O=n(70),C=n(100),P=n(1534),R=o(P),M=n(493),w=r(M),I=n(144),L=r(I),N=n(82),j=r(N),G=(u=(0,O.connect)(function(e){return{user:e.auth.user,businesses:e.jobmanager.businesses,selectedBusiness:e.jobmanager.selectedBusiness}},(0,v.default)({},w,L)))((s=a=function(e){function t(e){(0,d.default)(this,t);var n=(0,h.default)(this,(t.__proto__||(0,c.default)(t)).call(this,e));return n.onFilter=function(e,t,n,r){return e.name.toLowerCase().indexOf(r)>-1},n.onRefresh=function(e){n.props.getUserBusinesses(e).then(function(){return n.setState({loaded:!0})})},n.onAdd=function(){var e=n.props,t=e.businesses,r=e.user,o=e.alertShow;t.length>0&&!r.can_create_businesses?o("Alert","Have more than one company?","No",null,"Yes",function(){}):n.setState({editBusiness:{}})},n.onEdit=function(){return n.setState({editBusiness:n.props.selectedBusiness})},n.onDelete=function(){var e=n.props,t=e.selectedBusiness,r=e.deleteUserBusiness;(0,e.alertShow)("Confirm","Are you sure you want to delete "+t.name,"Cancel",null,"Delete",function(){return r(t.id).then(function(){j.successNotif("Deleted!"),n.onRefresh()})})},n.dismissEdit=function(e){e&&n.onRefresh(e),n.setState({editBusiness:null})},n.renderItem=function(e){var t=j.getBusinessLogo(e,!0),n=e.locations.length;return S.default.createElement(C.JobItem,{key:e.id,image:t,name:e.name,comment:" Include "+n+" work place"+(n>1?"s":"")})},n.state={loaded:!1,editBusiness:null},n}return(0,A.default)(t,e),(0,T.default)(t,[{key:"componentDidMount",value:function(){this.onRefresh()}},{key:"render",value:function(){var e=this.props,t=e.user,n=e.selectedBusiness,r=e.businesses,o=e.selectBusiness,u=e.readOnly,i=this.state,a=i.editBusiness,s=i.loaded;return S.default.createElement("div",null,S.default.createElement(C.DropBox,{headerLabel:"Business",dataSource:r,initialValue:n,onRefresh:this.onRefresh,onAdd:this.onAdd,onEdit:n?this.onEdit:null,onDelete:n&&t&&(t.businesses.length>1?this.onDelete:null),onChange:o,customOptionTemplateFunction:this.renderItem,customFilterFunction:this.onFilter,disabled:!s,readOnly:u}),a&&S.default.createElement(R.default,{business:a,onClose:this.dismissEdit}))}}]),t}(b.Component),a.propTypes={user:g.default.object.isRequired,businesses:g.default.array.isRequired,selectedBusiness:g.default.object,getUserBusinesses:g.default.func.isRequired,deleteUserBusiness:g.default.func.isRequired,selectBusiness:g.default.func.isRequired,alertShow:g.default.func.isRequired,readOnly:g.default.bool},a.defaultProps={selectedBusiness:null,readOnly:!1},i=s))||i;t.default=G,e.exports=t.default},1606:function(e,t){e.exports={planContainer:"N1dfOCqKfPC-CfV4fqoKb",planBox:"_1XiL3H12tbe3MF71QEPSiX",credits:"XUIstECIihDItVnxcoahO",price:"_2JR6saHyUxgMEyRQdB-33J"}},1608:function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function u(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function s(e){var t=arguments.length<=1||void 0===arguments[1]?E.noop:arguments[1],n=function(e){if(h.indexOf(e)<0)return function(t){var n=y[e]||[];if(n.push(t),y[e]=n,1===n.length)return(0,E.newScript)(e)(function(t){y[e].forEach(function(n){return n(t,e)}),delete y[e]})}},r=e.map(function(e){return Array.isArray(e)?e.map(n):n(e)});E.series.apply(void 0,a(r))(function(e,t){e?A.push(t):Array.isArray(t)?t.forEach(m):m(t)})(function(e){v(),t(e)})}Object.defineProperty(t,"__esModule",{value:!0});var l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();t.startLoadingScripts=s;var f=n(1),d=r(f),p=n(301),T=r(p),E=n(1609),h=[],y={},A=[],m=function(e){h.indexOf(e)<0&&h.push(e)},v=function(){A.length>0&&(A.forEach(function(e){var t=document.querySelector("script[src='"+e+"']");null!=t&&t.parentNode.removeChild(t)}),A=[])},b=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){var n=function(n){function r(e,t){o(this,r);var n=u(this,Object.getPrototypeOf(r).call(this,e,t));return n.state={isScriptLoaded:!1,isScriptLoadSucceed:!1},n._isMounted=!1,n}return i(r,n),c(r,[{key:"componentDidMount",value:function(){var e=this;this._isMounted=!0,s(t,function(t){e._isMounted&&e.setState({isScriptLoaded:!0,isScriptLoadSucceed:!t},function(){t||e.props.onScriptLoaded()})})}},{key:"componentWillUnmount",value:function(){this._isMounted=!1}},{key:"render",value:function(){var t=l({},this.props,this.state);return d.default.createElement(e,t)}}]),r}(f.Component);return n.propTypes={onScriptLoaded:f.PropTypes.func},n.defaultProps={onScriptLoaded:E.noop},(0,T.default)(n,e)}};t.default=b},1609:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=(t.isDefined=function(e){return null!=e},t.isFunction=function(e){return"function"==typeof e}),o=(t.noop=function(e){},t.newScript=function(e){return function(t){var n=document.createElement("script");return n.src=e,n.addEventListener("load",function(){return t(null,e)}),n.addEventListener("error",function(){return t(!0,e)}),document.body.appendChild(n),n}},function(e){var t=Object.keys(e),n=-1;return{next:function(){return n++,n>=t.length?null:t[n]}}}),u=t.parallel=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){return function(n){var o=!1,u=0,i=[];t=t.filter(r),t.length<=0?n(null):t.forEach(function(a,s){a(function(a){for(var l=arguments.length,c=Array(l>1?l-1:0),f=1;f<l;f++)c[f-1]=arguments[f];a?o=!0:(c.length<=1&&(c=c[0]),i[s]=c,u++),r(e)&&e.call(null,a,c,s),o?n(!0):t.length===u&&n(null,i)})})}}};t.series=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(e){return function(n){t=t.filter(function(e){return null!=e});var i=o(t),a=function(){var n=i.next(),r=t[n];return Array.isArray(r)&&(r=u.apply(null,r).call(null,e)),[+n,r]},s=void 0,l=void 0,c=a();if(s=c[0],null==(l=c[1]))return n(null);var f=[];!function t(){l(function(o){for(var u=arguments.length,i=Array(u>1?u-1:0),d=1;d<u;d++)i[d-1]=arguments[d];if(i.length<=1&&(i=i[0]),r(e)&&e.call(null,o,i,s),o)n(o);else{if(f.push(i),c=a(),s=c[0],null==(l=c[1]))return n(null,f);t()}})}()}}}},1610:function(e,t,n){var r,o,u;!function(i,a){o=[t,n(1),n(29),n(1608),n(2)],r=a,void 0!==(u="function"==typeof r?r.apply(t,o):r)&&(e.exports=u)}(0,function(e,t,n,r,o){"use strict";function u(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(e,"__esModule",{value:!0});var l=u(t),c=u(n),f=u(r),d=u(o),p=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),T=function(e){function t(e){i(this,t);var n=a(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return window.React=l.default,window.ReactDOM=c.default,n.state={showButton:!1},n}return s(t,e),p(t,[{key:"componentWillReceiveProps",value:function(e){var t=e.isScriptLoaded,n=e.isScriptLoadSucceed;this.state.show||t&&!this.props.isScriptLoaded&&(n?this.setState({showButton:!0}):(console.log("Cannot load Paypal script!"),this.props.onError()))}},{key:"componentDidMount",value:function(){var e=this.props,t=e.isScriptLoaded,n=e.isScriptLoadSucceed;t&&n&&this.setState({showButton:!0})}},{key:"render",value:function(){var e=this,t=function(){return paypal.rest.payment.create(e.props.env,e.props.client,{transactions:[{amount:{total:e.props.total,currency:e.props.currency}}]})},n=function(t,n){return n.payment.execute().then(function(){var n=Object.assign({},e.props.payment);n.paid=!0,n.cancelled=!1,n.payerID=t.payerID,n.paymentID=t.paymentID,n.paymentToken=t.paymentToken,n.returnUrl=t.returnUrl,e.props.onSuccess(n)})},r="";return this.state.showButton&&(r=l.default.createElement(paypal.Button.react,{env:this.props.env,client:this.props.client,payment:t,commit:!0,onAuthorize:n,onCancel:this.props.onCancel})),l.default.createElement("div",null,r)}}]),t}(l.default.Component);T.propTypes={currency:d.default.string.isRequired,total:d.default.number.isRequired,client:d.default.object.isRequired},T.defaultProps={env:"sandbox",onSuccess:function(e){console.log("The payment was succeeded!",e)},onCancel:function(e){console.log("The payment was cancelled!",e)},onError:function(e){console.log("Error loading Paypal script!",e)}},e.default=(0,f.default)("https://www.paypalobjects.com/api/checkout.js")(T)})},1611:function(e,t,n){e.exports=n(1610)}});