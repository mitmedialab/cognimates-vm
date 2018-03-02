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
let stream;
//testing tracking
//const img = document.createElement('img');
//img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Color_icon_violet_v2.svg/225px-Color_icon_violet_v2.svg.png';
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
            // set it as src of our HTML video element.
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
        //create new tracking objects to track the arbitrary color
        localColorTracker = new tracking.ColorTracker([]); 
        boolean_tracker = new tracking.ColorTracker([]);

        //register the color
        const rgb = Cast.toRgbColorObject(args.COLOR);
        console.log(rgb);

        //separate the rgb values
        var rVal = rgb['r'];
        var gVal = rgb['g'];
        var bVal = rgb['b'];

        //register the color, create function w/ arbitrary key 'color'
        tracking.ColorTracker.registerColor('color', function(r, g, b){
            //tracking events where all r,g, and b values are within 50 of the tracked color
            if((Math.abs(rVal-r)<50) && (Math.abs(gVal-g)<50) && (Math.abs(bVal-b)<50)){
                return true;
            } else{
                return false;
            }
        });

        //set arbitrary 'color' to be tracked
        localColorTracker.setColors(['color']);

        //turn on local tracking object
        localColorTracker.on('track', function(event) {
            if (event.data.length === 0) {
                console.log('cat');
              // No colors were detected in this frame.
            } else {
              event.data.forEach(function(rect) {
                console.log('hiya');
                console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
              });
            }
          });

        //begin tracking 
        tracking.track(videoElement, localColorTracker, {camera: true});
    }

    isColorPresent(){
        //at this point, aribitrary color has already been registered in boolean_tracker
        //set boolean_tracker to track  arbitrary 'color'
        boolean_tracker.setColors(['color']);

        //turn on tracker
        boolean_tracker.on('track', function(event) {
            if (event.data.length === 0) {
              console.log('false');
              return false;
            }
            else {
              console.log('true');
              return true;
            }
            });

        //begin tracking  
        tracking.track(videoElement, boolean_tracker, {camera: true});
        }
}

module.exports = Scratch3Tracking;
