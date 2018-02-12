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
const known_colors = {
    'cyan': function(r, g, b) {
        var thresholdGreen = 50,
          thresholdBlue = 70,
          dx = r - 0,
          dy = g - 255,
          dz = b - 255;
        if ((g - r) >= thresholdGreen && (b - r) >= thresholdBlue) {
          return true;
        }
        return dx * dx + dy * dy + dz * dz < 6400;
      }
    
    'magenta': function(r, g, b) {
        var threshold = 50,
          dx = r - 255,
          dy = g - 0,
          dz = b - 255;
        if ((r - g) >= threshold && (b - g) >= threshold) {
          return true;
        }
        return dx * dx + dy * dy + dz * dz < 19600;
      }
      
      'yellow', function(r, g, b) {
        var threshold = 50,
          dx = r - 255,
          dy = g - 255,
          dz = b - 0;
        if ((r - b) >= threshold && (g - b) >= threshold) {
          return true;
        }
        return dx * dx + dy * dy + dz * dz < 10000;
      }
};

class Scratch3Tracking {
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
                    text: 'Set Color to be Tracked [COLOR]',
                    arguments: {
                      COLOR: {
                          type: ArgumentType.COLOR
                      }
                    }
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

    setTrackedColor(args,util){
        var self = this;
        var color = args.COLOR;
        var results = [];
        results = results.concat(self.trackColor(pixels, width, height, color));
        this.emit('track', {
            data: results
        } 
    }

    trackColor(pixels, width, height, color){
        var colorFn = known_colors[color];
    }

}


module.exports = Scratch3Tracking;
