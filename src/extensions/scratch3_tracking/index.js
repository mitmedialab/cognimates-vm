const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//tracking
let tracking = require('tracking');
let ColorTracker = require('./colortracker');
let localColorTracker; 
let videoElement;
let hidden_canvas;
const ajax = require('es-ajax');
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
                },
                {
                    opcode: 'isColorPresent',
                    blockType: BlockType.BOOLEAN,
                    text: 'is tracked color present?'
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
        const rgb = Cast.toRgbColorObject(args.COLOR);
        //this.registerColor(rgb);
        localColorTracker = new ColorTracker(['yellow']); 

        localColorTracker.on('track', function(event) {
            if (event.data.length === 0) {
                console.log('cat')
              // No colors were detected in this frame.
            } else {
              event.data.forEach(function(rect) {
                console.log('hiya')
                console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
              });
            }
          });
        localColorTracker.track('#camera-stream', localColorTracker, {camera: true})
    }
    
    registerColor(rgb){
        var rVal = rgb['r']
        var gVal = rgb['g']
        var bVal = rgb['b']
        ColorTracker.registerColor('color', function(rgb){
            if((rVal-r<50 || rVal-r>50) && (gVal-g<50 || gVal-g>50) && (bVal-b<50 || bVal-b>50)){
                return false;
            }
            return true; 
        });
    }

    isColorPresent(){
        localColorTracker.on('track', function(event) {
            if (event.data.length === 0) {
              console.log('false')
              return false;
            }
            else {
              console.log('true')
              return true;
            }
            });
            localColorTracker.track(videoElement, localColorTracker, {camera: true})
        }
}

module.exports = Scratch3Tracking;
