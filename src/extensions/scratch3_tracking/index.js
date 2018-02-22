const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//tracking
let tracking = require('tracking');
let ColorTracker = require('./colotracker')
let videoElement;
let hidden_canvas;
const ajax = require('es-ajax');
//dictionary of functions to register colors
const iconURI = require('./assets/tracking_icon');

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

    setTrackedColor(args, util){
        var colors = new ColorTracker(['magenta']); 
        colors.on('track', function(event) {
            if (event.data.length === 0) {
              // No colors were detected in this frame.
            } else {
              event.data.forEach(function(rect) {
                console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
              });
            }
          });
        tracking.track(videoElement, colors, {camera: true});
    }
}

module.exports = Scratch3Tracking;
