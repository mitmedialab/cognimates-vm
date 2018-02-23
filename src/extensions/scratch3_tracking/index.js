const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//tracking, need to require specific file 
let tracking = require('tracking/build/tracking');
let localColorTracker; //this tracker creates the rectangles
let boolean_tracker; //this tracker checks if a color is present or not
let videoElement; //the video element
let hidden_canvas;
const img = document.createElement('img')
//testing tracking
img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Color_icon_violet_v2.svg/225px-Color_icon_violet_v2.svg.png'
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
        //create new tracking object
        
        //register the color
        const rgb = Cast.toRgbColorObject(args.COLOR);
        console.log(rgb);
        this.registerColor(rgb);
        //create tracking object
        localColorTracker = new tracking.ColorTracker(['color']); 

        //turn on tracking object
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
         
        //begin tracking 
        tracking.track(img, localColorTracker, {camera: true})
        console.log('here')
    }
    
    registerColor(rgb){
        //get the rgb values and separate them
        var rVal = rgb['r']
        var gVal = rgb['g']
        var bVal = rgb['b']
        //register the color, create function
        tracking.ColorTracker.registerColor('color', function(r, g, b){
            //tracking events where all r,g, and b values are within 50 of the tracked color
            if((Math.abs(rVal-r)<50) && (Math.abs(gVal-g)<50) && (Math.abs(bVal-b)<50)){
                return true;
            } else{
                return false;
            }
        });
    }

    isColorPresent(){
        //create new tracker to check for color presence 
        boolean_tracker = new tracking.ColorTracker(['color'])
        //turn on tracker
        boolean_tracker.on('track', function(event) {
            if (event.data.length === 0) {
              console.log('false')
              return false;
            }
            else {
              console.log('true')
              return true;
            }
            });
        //begin tracking  
        tracking.track(img, boolean_tracker, {camera: true})
        }
}

module.exports = Scratch3Tracking;
