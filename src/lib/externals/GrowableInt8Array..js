"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = GrowableInt8Array;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var MAX_SIGNED_INT_VALUE = Math.pow(2, 32) - 1;

function toInt32(x) {
  return x >>> 0;
}

function isArrayIndex(propName) {
  if (_typeof(propName) === 'symbol') {
    return false;
  }

  var uint32Prop = toInt32(propName);
  return String(uint32Prop) === propName && uint32Prop !== MAX_SIGNED_INT_VALUE;
}

var proxyHandler = {
  has: function has(target, key) {
    if (isArrayIndex(key)) {
      var uint32Prop = toInt32(key);
      return uint32Prop < target.length;
    }

    return Reflect.has(target, key);
  },
  get: function get(target, property, receiver) {
    if (isArrayIndex(property)) {
      if (property in receiver) {
        return target.buf[property];
      }

      return undefined;
    }

    return Reflect.get(target, property, receiver);
  },
  set: function set(target, property, value, receiver) {
    if (isArrayIndex(property)) {
      if (property in receiver) {
        target.buf[property] = value;
      }

      return true;
    }

    return Reflect.set(target, property, value, receiver);
  },
  ownKeys: function ownKeys(target) {
    var keys = new Set(Reflect.ownKeys(target.unwrap()).concat(Reflect.ownKeys(target)));
    keys["delete"]('buf');
    keys["delete"]('bytesUsed');
    keys["delete"]('_expansionRate');
    return Array.from(keys);
  },
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, prop) {
    if (isArrayIndex(prop)) {
      var uint32Prop = toInt32(prop);

      if (uint32Prop < target.length) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target.buf, uint32Prop);
        /*
            This descriptor is not really configurable, but Proxy
            invariants require that it be marked as such since `target`
            does not have the corresponding property.
             This has implications for deleteProperty
        */

        descriptor.configurable = true;
        return descriptor;
      }
    }

    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
  defineProperty: function defineProperty(target, key, descriptor) {
    if (isArrayIndex(key)) {
      var uint32Prop = toInt32(key);

      if (uint32Prop < target.length) {
        return Reflect.defineProperty(target.buf, key, descriptor);
      }

      throw new TypeError('Invalid typed array index');
    }

    return Reflect.defineProperty(target, key, descriptor);
  },
  deleteProperty: function deleteProperty(target, prop) {
    if (isArrayIndex(prop)) {
      return true;
    }

    return Reflect.deleteProperty(target, prop);
  }
};
/**
     Create a new GrowableInt8Array
     * @param {Int8Array} buf: Initial view
     * @param {number} expansionRate: How much to grow buffer
 */

function GrowableInt8Array() {
  var buf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var expansionRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  if (buf) {
    if (buf instanceof GrowableInt8Array) {
      return new GrowableInt8Array(buf.unwrap(true), expansionRate || buf.expansionRate);
    }

    if (!(buf instanceof Int8Array)) {
      throw new Error('Can only wrap Int8Array instances');
    }

    this.buf = buf;
    this.bytesUsed = this.buf.length;
  } else {
    this.buf = new Int8Array(parseInt(2 * Math.pow(expansionRate, 4)));
    this.bytesUsed = 0;
  }

  this.expansionRate = expansionRate;
}
/**
    Creates a new GrowableInt8Array from an array-like or iterable object.
    See also Array.from().
*/


GrowableInt8Array.from = function from() {
  return new GrowableInt8Array(Int8Array.from.apply(Int8Array, arguments));
};
/**
    Creates a new GrowableInt8Array with a variable number of arguments.
    See also Array.of().
*/


GrowableInt8Array.of = function of() {
  return new GrowableInt8Array(Int8Array.of.apply(Int8Array, arguments));
};

GrowableInt8Array.prototype.accessProxy = function accessProxy() {
  return new Proxy(this, proxyHandler);
};
/**
    Extend a GrowableInt8Array with new data
     * @param {Int8Array} buf: new data to add
     * @return {GrowableInt8Array} new GrowableInt8Array
 */


GrowableInt8Array.prototype.extend = function extend(buf) {
  if (buf.length + this.length > this.buf.byteLength) {
    var oldBuf = this.buf;
    var newSize = Math.max(parseInt(this.buf.buffer.byteLength * this.expansionRate), buf.length + this.length + 1);
    this.buf = new Int8Array(newSize);
    this.set(oldBuf);
  }

  this.set(buf, this.length);
  this.bytesUsed += buf.length;
  return this;
};
/*
    Return a DataView of the underlying buffer, starting at the specified offset
    * @return {DataView}
*/


GrowableInt8Array.prototype.dataView = function dataView() {
  var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new DataView(this.buf.buffer, offset, this.length - offset);
};

Object.defineProperty(GrowableInt8Array.prototype, 'length', {
  get: function get() {
    return this.bytesUsed;
  },
  set: function set(_val) {}
});
Object.defineProperty(GrowableInt8Array.prototype, 'expansionRate', {
  get: function get() {
    return this._expansionRate;
  },
  set: function set(val) {
    if (val <= 1) {
      throw new RangeError('expansionRate must be greater than 1');
    }

    this._expansionRate = val;
  }
});
/*
    Returns the underlying Int8Array buffer.
    * @param {boolean} copy Pass `true` to return a copy of the buffer.
    * @return {Int8Array}
*/

GrowableInt8Array.prototype.unwrap = function unwrap() {
  var copy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var unwrapped = this.buf.subarray(0, this.length);

  if (copy) {
    return unwrapped.slice();
  }

  return unwrapped;
};
/*
    Functions which simply pass their argument through to the underlying
    Int8Array.
*/


var _PASSTHROUGH_FNS = [Symbol.iterator, 'entries', 'every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'reduce', 'reduceRight', 'some', 'values'];

var _loop = function _loop() {
  var fName = _PASSTHROUGH_FNS2[_i];

  GrowableInt8Array.prototype[fName] = function () {
    var _this$unwrap2;

    return (_this$unwrap2 = this.unwrap())[fName].apply(_this$unwrap2, arguments);
  };
};

for (var _i = 0, _PASSTHROUGH_FNS2 = _PASSTHROUGH_FNS; _i < _PASSTHROUGH_FNS2.length; _i++) {
  _loop();
}
/*
    Functions which use the underlying Int8Array function, but return an
    instance of GrowableInt8Array
*/


var _WRAP_FNS = ['copyWithin', 'filter', 'map', 'reverse', 'slice', 'sort'];

var _loop2 = function _loop2() {
  var fName = _WRAP_FNS2[_i2];

  GrowableInt8Array.prototype[fName] = function () {
    var _this$unwrap3;

    return new GrowableInt8Array((_this$unwrap3 = this.unwrap())[fName].apply(_this$unwrap3, arguments), this.expansionRate);
  };
};

for (var _i2 = 0, _WRAP_FNS2 = _WRAP_FNS; _i2 < _WRAP_FNS2.length; _i2++) {
  _loop2();
}

GrowableInt8Array.prototype.fill = function fill() {
  var _this$unwrap;

  (_this$unwrap = this.unwrap()).fill.apply(_this$unwrap, arguments);

  return this;
};

GrowableInt8Array.prototype.set = function set(array) {
  var _this$buf;

  if (array instanceof GrowableInt8Array) {
    array = array.unwrap();
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return (_this$buf = this.buf).set.apply(_this$buf, [array].concat(args));
};
/*
    Get the element at a specific index
    * @param {number} index index of element.
    * @return {number}
*/


GrowableInt8Array.prototype.getElement = function getElement(index) {
  if (index < this.length) {
    return this.buf[index];
  }

  return undefined;
};
/*
    Set the element at a specific index to a value
    * @param {number} index index of element.
    * @param {number} value value to set
    * @return {number}
*/


GrowableInt8Array.prototype.setElement = function setElement(index, value) {
  if (index < this.length) {
    return this.buf[index] = value;
  }

  return value;
};

var inspect = Symbol["for"]('nodejs.util.inspect.custom');

GrowableInt8Array.prototype[inspect] = function inspect() {
  var _require;

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return (_require = require('util')).inspect.apply(_require, [this.unwrap()].concat(args)).replace('Int8Array', 'GrowableInt8Array');
};