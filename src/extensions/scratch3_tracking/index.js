const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//tracking
let tracking = require('tracking');
const ajax = require('es-ajax');
const iconURI = require('./assets/tracking_icon');


class Scratch3Sentiment {
    constructor (runtime) {
        this.runtime = runtime;

    }

    getInfo () {
        return {
            id: 'tracking',
            name: 'Tracking',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'initializeCamera',
                    blockType: BlockType.COMMAND,
                    text: 'Start your camera',
                },
                {
                    opcode: 'setTrackedColor',
                    blockType: BlockType.COMMAND,
                    text: 'Set Color to be Tracked',
                    arguments: {
                      COLOR: {
                          type: ArgumentType.COLOR
                      }
                    }
                },
                {
                  opcode: 'trackColor',
                  blockType: BlockType.COMMAND,
                  text: 'Track Color',
                }

            ],
            menus: {
             	trueFalse: ['true', 'false']
            }
        };
    }

    initializeCamera () {
        console.log('Initializing camera');
        videoElement = document.createElement('video');
        videoElement.id = 'camera-stream';
        hidden_canvas = document.createElement('canvas');
        hidden_canvas.id = 'imageCanvas';

        navigator.getUserMedia(
            // Options
            {
                video: true
            },
            // Success Callback
            stream => {
            // Create an object URL for the video stream and
            // set it as src of our HTLM video element.
                videoElement.src = window.URL.createObjectURL(stream);
                // Play the video element to show the stream to the user.
                videoElement.play();
            },
            // Error Callback
            err => {
                // Most common errors are PermissionDenied and DevicesNotFound.
                console.error(err);
            }
        );
    }

    setTrackedColor(){
      var color = //most recent color
      const rgb = Cast.toRgbColorObject(args.COLOR);
      const hsv = Color.rgbToHsv(rgb);
      penState.color = (hsv.h / 360) * 100;

      // Set the legacy "shade" value the same way scratch 2 did.
      penState._shade = penState.brightness / 2;

      this._updatePenColor(penState);

    }

  EventEmitter() {
  /**
   * EventEmitter utility.
   * @constructor
   */
   tracking.EventEmitter = function() {};
  /**
   * Holds event listeners scoped by event type.
   * @type {object}
   * @private
   */
   tracking.EventEmitter.prototype.events_ = null;
  /**
   * Adds a listener to the end of the listeners array for the specified event.
   * @param {string} event
   * @param {function} listener
   * @return {object} Returns emitter, so calls can be chained.
   */
   tracking.EventEmitter.prototype.addListener = function(event, listener) {
     if (typeof listener !== 'function') {
       throw new TypeError('Listener must be a function');
     }
     if (!this.events_) {
       this.events_ = {};
     }
      this.emit('newListener', event, listener);
      if (!this.events_[event]) {
        this.events_[event] = [];
      }
      this.events_[event].push(listener);
      return this;
    };
    /**
     * Returns an array of listeners for the specified event.
     * @param {string} event
     * @return {array} Array of listeners.
     */
    tracking.EventEmitter.prototype.listeners = function(event) {
      return this.events_ && this.events_[event];
    };
    /**
     * Execute each of the listeners in order with the supplied arguments.
     * @param {string} event
     * @param {*} opt_args [arg1], [arg2], [...]
     * @return {boolean} Returns true if event had listeners, false otherwise.
     */
    tracking.EventEmitter.prototype.emit = function(event) {
      var listeners = this.listeners(event);
      if (listeners) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i]) {
            listeners[i].apply(this, args);
          }
        }
        return true;
      }
      return false;
    };
    /**
     * Adds a listener to the end of the listeners array for the specified event.
     * @param {string} event
     * @param {function} listener
     * @return {object} Returns emitter, so calls can be chained.
     */
    tracking.EventEmitter.prototype.on = tracking.EventEmitter.prototype.addListener;
    /**
     * Adds a one time listener for the event. This listener is invoked only the
     * next time the event is fired, after which it is removed.
     * @param {string} event
     * @param {function} listener
     * @return {object} Returns emitter, so calls can be chained.
     */
    tracking.EventEmitter.prototype.once = function(event, listener) {
      var self = this;
      self.on(event, function handlerInternal() {
        self.removeListener(event, handlerInternal);
        listener.apply(this, arguments);
      });
    };
    /**
     * Removes all listeners, or those of the specified event. It's not a good
     * idea to remove listeners that were added elsewhere in the code,
     * especially when it's on an emitter that you didn't create.
     * @param {string} event
     * @return {object} Returns emitter, so calls can be chained.
     */
    tracking.EventEmitter.prototype.removeAllListeners = function(opt_event) {
      if (!this.events_) {
        return this;
      }
      if (opt_event) {
        delete this.events_[opt_event];
      } else {
        delete this.events_;
      }
      return this;
    };
    /**
     * Remove a listener from the listener array for the specified event.
     * Caution: changes array indices in the listener array behind the listener.
     * @param {string} event
     * @param {function} listener
     * @return {object} Returns emitter, so calls can be chained.
     */
    tracking.EventEmitter.prototype.removeListener = function(event, listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('Listener must be a function');
      }
      if (!this.events_) {
        return this;
      }
      var listeners = this.listeners(event);
      if (Array.isArray(listeners)) {
        var i = listeners.indexOf(listener);
        if (i < 0) {
          return this;
        }
        listeners.splice(i, 1);
      }
      return this;
    };
    /**
     * By default EventEmitters will print a warning if more than 10 listeners
     * are added for a particular event. This is a useful default which helps
     * finding memory leaks. Obviously not all Emitters should be limited to 10.
     * This function allows that to be increased. Set to zero for unlimited.
     * @param {number} n The maximum number of listeners.
     */
    tracking.EventEmitter.prototype.setMaxListeners = function() {
      throw new Error('Not implemented');
      };
  }

  tracker() {
    /**
     * Tracker utility.
     * @constructor
     * @extends {tracking.EventEmitter}
     */
    tracking.Tracker = function() {
      tracking.Tracker.base(this, 'constructor');
    };
    tracking.inherits(tracking.Tracker, tracking.EventEmitter);
    /**
     * Tracks the pixels on the array. This method is called for each video
     * frame in order to emit `track` event.
     * @param {Uint8ClampedArray} pixels The pixels data to track.
     * @param {number} width The pixels canvas width.
     * @param {number} height The pixels canvas height.
     */
    tracking.Tracker.prototype.track = function() {};
  }

  colorTracker() {
    /**
     * ColorTracker utility to track colored blobs in a frrame using color
     * difference evaluation.
     * @constructor
     * @param {string|Array.<string>} opt_colors Optional colors to track.
     * @extends {tracking.Tracker}
     */
    tracking.ColorTracker = function(opt_colors) {
      tracking.ColorTracker.base(this, 'constructor');
      if (typeof opt_colors === 'string') {
        opt_colors = [opt_colors];
      }
      if (opt_colors) {
        opt_colors.forEach(function(color) {
          if (!tracking.ColorTracker.getColor(color)) {
            throw new Error('Color not valid, try `new tracking.ColorTracker("magenta")`.');
          }
        });
        this.setColors(opt_colors);
      }
    };
    tracking.inherits(tracking.ColorTracker, tracking.Tracker);
    /**
     * Holds the known colors.
     * @type {Object.<string, function>}
     * @private
     * @static
     */
    tracking.ColorTracker.knownColors_ = {};
    /**
     * Caches coordinates values of the neighbours surrounding a pixel.
     * @type {Object.<number, Int32Array>}
     * @private
     * @static
     */
    tracking.ColorTracker.neighbours_ = {};
    /**
     * Registers a color as known color.
     * @param {string} name The color name.
     * @param {function} fn The color function to test if the passed (r,g,b) is
     *     the desired color.
     * @static
     */
    tracking.ColorTracker.registerColor = function(name, fn) {
      tracking.ColorTracker.knownColors_[name] = fn;
    };
    /**
     * Gets the known color function that is able to test whether an (r,g,b) is
     * the desired color.
     * @param {string} name The color name.
     * @return {function} The known color test function.
     * @static
     */
    tracking.ColorTracker.getColor = function(name) {
      return tracking.ColorTracker.knownColors_[name];
    };
    /**
     * Holds the colors to be tracked by the `ColorTracker` instance.
     * @default ['magenta']
     * @type {Array.<string>}
     */
    tracking.ColorTracker.prototype.colors = ['magenta'];
    /**
     * Holds the minimum dimension to classify a rectangle.
     * @default 20
     * @type {number}
     */
    tracking.ColorTracker.prototype.minDimension = 20;
    /**
     * Holds the minimum group size to be classified as a rectangle.
     * @default 30
     * @type {number}
     */
    tracking.ColorTracker.prototype.minGroupSize = 30;
    /**
     * Calculates the central coordinate from the cloud points. The cloud points
     * are all points that matches the desired color.
     * @param {Array.<number>} cloud Major row order array containing all the
     *     points from the desired color, e.g. [x1, y1, c2, y2, ...].
     * @param {number} total Total numbers of pixels of the desired color.
     * @return {object} Object contaning the x, y and estimated z coordinate of
     *     the blog extracted from the cloud points.
     * @private
     */
    tracking.ColorTracker.prototype.calculateDimensions_ = function(cloud, total) {
      var maxx = -1;
      var maxy = -1;
      var minx = Infinity;
      var miny = Infinity;
      for (var c = 0; c < total; c += 2) {
        var x = cloud[c];
        var y = cloud[c + 1];
        if (x < minx) {
          minx = x;
        }
        if (x > maxx) {
          maxx = x;
        }
        if (y < miny) {
          miny = y;
        }
        if (y > maxy) {
          maxy = y;
        }
      }
      return {
        width: maxx - minx,
        height: maxy - miny,
        x: minx,
        y: miny
      };
    };
    /**
     * Gets the colors being tracked by the `ColorTracker` instance.
     * @return {Array.<string>}
     */
    tracking.ColorTracker.prototype.getColors = function() {
      return this.colors;
    };
    /**
     * Sets the minimum dimension to classify a rectangle.
     * @param {number} minDimension
     */
    tracking.ColorTracker.prototype.getMinDimension = function() {
      return this.minDimension;
    };
    /**
     * Gets the minimum group size to be classified as a rectangle.
     * @return {number}
     */
    tracking.ColorTracker.prototype.getMinGroupSize = function() {
      return this.minGroupSize;
    };
    /**
     * Gets the eight offset values of the neighbours surrounding a pixel.
     * @param {number} width The image width.
     * @return {array} Array with the eight offset values of the neighbours
     *     surrounding a pixel.
     * @private
     */
    tracking.ColorTracker.prototype.getNeighboursForWidth_ = function(width) {
      if (tracking.ColorTracker.neighbours_[width]) {
        return tracking.ColorTracker.neighbours_[width];
      }
      var neighbours = new Int32Array(8);
      neighbours[0] = -width * 4;
      neighbours[1] = -width * 4 + 4;
      neighbours[2] = 4;
      neighbours[3] = width * 4 + 4;
      neighbours[4] = width * 4;
      neighbours[5] = width * 4 - 4;
      neighbours[6] = -4;
      neighbours[7] = -width * 4 - 4;
      tracking.ColorTracker.neighbours_[width] = neighbours;
      return neighbours;
    };
    /**
     * Unites groups whose bounding box intersect with each other.
     * @param {Array.<Object>} rects
     * @private
     */
    tracking.ColorTracker.prototype.mergeRectangles_ = function(rects) {
      var intersects;
      var results = [];
      var minDimension = this.getMinDimension();
      for (var r = 0; r < rects.length; r++) {
        var r1 = rects[r];
        intersects = true;
        for (var s = r + 1; s < rects.length; s++) {
          var r2 = rects[s];
          if (tracking.Math.intersectRect(r1.x, r1.y, r1.x + r1.width, r1.y + r1.height, r2.x, r2.y, r2.x + r2.width, r2.y + r2.height)) {
            intersects = false;
            var x1 = Math.min(r1.x, r2.x);
            var y1 = Math.min(r1.y, r2.y);
            var x2 = Math.max(r1.x + r1.width, r2.x + r2.width);
            var y2 = Math.max(r1.y + r1.height, r2.y + r2.height);
            r2.height = y2 - y1;
            r2.width = x2 - x1;
            r2.x = x1;
            r2.y = y1;
            break;
          }
        }
        if (intersects) {
          if (r1.width >= minDimension && r1.height >= minDimension) {
            results.push(r1);
          }
        }
      }
      return results;
    };
    /**
     * Sets the colors to be tracked by the `ColorTracker` instance.
     * @param {Array.<string>} colors
     */
    tracking.ColorTracker.prototype.setColors = function(colors) {
      this.colors = colors;
    };
    /**
     * Sets the minimum dimension to classify a rectangle.
     * @return {number}
     */
    tracking.ColorTracker.prototype.setMinDimension = function(minDimension) {
      this.minDimension = minDimension;
    };
    /**
     * Sets the minimum group size to be classified as a rectangle.
     * @param {number} minGroupSize
     */
    tracking.ColorTracker.prototype.setMinGroupSize = function(minGroupSize) {
      this.minGroupSize = minGroupSize;
    };
    /**
     * Tracks the `Video` frames. This method is called for each video frame in
     * order to emit `track` event.
     * @param {Uint8ClampedArray} pixels The pixels data to track.
     * @param {number} width The pixels canvas width.
     * @param {number} height The pixels canvas height.
     */
    tracking.ColorTracker.prototype.track = function(pixels, width, height) {
      var self = this;
      var colors = this.getColors();
      if (!colors) {
        throw new Error('Colors not specified, try `new tracking.ColorTracker("magenta")`.');
      }
      var results = [];
      colors.forEach(function(color) {
        results = results.concat(self.trackColor_(pixels, width, height, color));
      });
      this.emit('track', {
        data: results
      });
    };
    /**
     * Find the given color in the given matrix of pixels using Flood fill
     * algorithm to determines the area connected to a given node in a
     * multi-dimensional array.
     * @param {Uint8ClampedArray} pixels The pixels data to track.
     * @param {number} width The pixels canvas width.
     * @param {number} height The pixels canvas height.
     * @param {string} color The color to be found
     * @private
     */
    tracking.ColorTracker.prototype.trackColor_ = function(pixels, width, height, color) {
      var colorFn = tracking.ColorTracker.knownColors_[color];
      var currGroup = new Int32Array(pixels.length >> 2);
      var currGroupSize;
      var currI;
      var currJ;
      var currW;
      var marked = new Int8Array(pixels.length);
      var minGroupSize = this.getMinGroupSize();
      var neighboursW = this.getNeighboursForWidth_(width);
      var queue = new Int32Array(pixels.length);
      var queuePosition;
      var results = [];
      var w = -4;
      if (!colorFn) {
        return results;
      }
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          w += 4;
          if (marked[w]) {
            continue;
          }
          currGroupSize = 0;
          queuePosition = -1;
          queue[++queuePosition] = w;
          queue[++queuePosition] = i;
          queue[++queuePosition] = j;
          marked[w] = 1;
          while (queuePosition >= 0) {
            currJ = queue[queuePosition--];
            currI = queue[queuePosition--];
            currW = queue[queuePosition--];
            if (colorFn(pixels[currW], pixels[currW + 1], pixels[currW + 2], pixels[currW + 3], currW, currI, currJ)) {
              currGroup[currGroupSize++] = currJ;
              currGroup[currGroupSize++] = currI;
              for (var k = 0; k < neighboursW.length; k++) {
                var otherW = currW + neighboursW[k];
                var otherI = currI + neighboursI[k];
                var otherJ = currJ + neighboursJ[k];
                if (!marked[otherW] && otherI >= 0 && otherI < height && otherJ >= 0 && otherJ < width) {
                  queue[++queuePosition] = otherW;
                  queue[++queuePosition] = otherI;
                  queue[++queuePosition] = otherJ;
                  marked[otherW] = 1;
                }
              }
            }
          }
          if (currGroupSize >= minGroupSize) {
            var data = this.calculateDimensions_(currGroup, currGroupSize);
            if (data) {
              data.color = color;
              results.push(data);
            }
          }
        }
      }
      return this.mergeRectangles_(results);
    };
    // Default colors
    //===================
    tracking.ColorTracker.registerColor('cyan', function(r, g, b) {
      var thresholdGreen = 50,
        thresholdBlue = 70,
        dx = r - 0,
        dy = g - 255,
        dz = b - 255;
      if ((g - r) >= thresholdGreen && (b - r) >= thresholdBlue) {
        return true;
      }
      return dx * dx + dy * dy + dz * dz < 6400;
    });
    tracking.ColorTracker.registerColor('magenta', function(r, g, b) {
      var threshold = 50,
        dx = r - 255,
        dy = g - 0,
        dz = b - 255;
      if ((r - g) >= threshold && (b - g) >= threshold) {
        return true;
      }
      return dx * dx + dy * dy + dz * dz < 19600;
    });
    tracking.ColorTracker.registerColor('yellow', function(r, g, b) {
      var threshold = 50,
        dx = r - 255,
        dy = g - 255,
        dz = b - 0;
      if ((r - b) >= threshold && (g - b) >= threshold) {
        return true;
      }
      return dx * dx + dy * dy + dz * dz < 10000;
    });
    // Caching neighbour i/j offset values.
    //=====================================
    var neighboursI = new Int32Array([-1, -1, 0, 1, 1, 1, 0, -1]);
    var neighboursJ = new Int32Array([0, 1, 1, 1, 0, -1, -1, -1]);
  }

}

module.exports = Scratch3Tracking;
