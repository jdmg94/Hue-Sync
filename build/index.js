"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _exportNames = {};
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _hue.default;
    }
});
var _hueTypes = _interopRequireWildcard(require("./hue.types"));
Object.keys(_hueTypes).forEach(function(key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in exports && exports[key] === _hueTypes[key]) return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function() {
            return _hueTypes[key];
        }
    });
});
var _hue = _interopRequireDefault(require("./hue"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
if (!globalThis.fetch) {
    require("cross-fetch/polyfill");
}
