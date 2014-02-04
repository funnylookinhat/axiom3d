/**
 * Axiom Engine
 */
var _ = require('underscore');
var PNG = require('png-js');
var util = require('util');
var async = require('async');
var events2 = require('eventemitter2');

var Terrain = require('./engine/terrain');
var Entity = require('./engine/entity');
var Loop = require('./engine/loop');

var Engine = function (params) {
  this.__baseDirectory = params.baseDirectory ? params.baseDirectory : '/';

  this._eventListener = params.eventListener ? params.eventListener : null;

  if( this._eventListener == null ) 
    throw "No event listener provided.";

  this._terrainImagePath = params.terrainImagePath;

  this._entities = null;
  this._terrain = null;
  this._objects = null;

  // These are integer offsets ( +/- ) that dictate the engine's position in the world.
  this._worldX = params.worldX ? params.worldX : 0;
  this._worldZ = params.worldZ ? params.worldZ : 0;
  this._width = 5000;
  this._depth = 5000;

  this._loopLastTime = null;

  // Used for terrain height conversion.
  this._convertToRgba = parameters.convertToRgba ? parameters.convertToRgba : function (value) {
    value = parseInt(1000 * (parseFloat(value).toFixed(3)));
    var a = value & 255; value = value >>> 8;
    var b = value & 255; value = value >>> 8;
    var g = value & 255; value = value >>> 8;
    var r = value & 255; value = value >>> 8;
    return {
      r: r,
      g: g,
      b: b,
      a: a
    }
  };

  this._convertToFloat = parameters.convertToFloat ? parameters.convertToFloat : function (rgba) {
    var value = 0 >>> 32;
    value += rgba.r; value = value << 8;
    value += rgba.g; value = value << 8;
    value += rgba.b; value = value << 8;
    value += rgba.a;
    return value / 1000;
  }
}

util.inherits(Engine, events2.EventEmitter2);

Engine.prototype.init = function (data, callback) {
  var _this = this;

  async.series(
    [
      function (seriesCallback) {
        _this.terrain._init(_this,seriesCallback);
      },

      function (seriesCallback) {
        // TODO - OBJECTS - StaticQuadTree ?
        _this._objects = [];
        return seriesCallback();
      },

      function (seriesCallback) {
        // Entities
        _this._entities = [];
        return seriesCallback();
      },

      // Events
      function (seriesCallback) {
        // Bind Events
        _this._initEvents(seriesCallback);
      },

      // Init and start loop
      function (seriesCallback) {
        _this.loop._init(_this,seriesCallback);
      }
    ],
    callback
  );
}

Engine.prototype._initEvents = function (callback) {
  return callback();
}

// // // // // // // // // // // // // // // // // // // // // // // // // //
// Extensions
// // // // // // // // // // // // // // // // // // // // // // // // // //

Engine.prototype.terrain = Terrain;
Engine.prototype.entity = Entity;
Engine.prototype.loop = Loop;

module.exports = Engine;