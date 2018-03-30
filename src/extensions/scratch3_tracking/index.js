const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');

//tracking, need to require specific file 
let tracking = require('tracking/build/tracking');
let localColorTracker; //this tracker creates the rectangles
let videoElement;
let trackerTask; 
//testing tracking
//const img = document.createElement('img');
//img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Color_icon_violet_v2.svg/225px-Color_icon_violet_v2.svg.png';
const ajax = require('es-ajax');
const iconURI = require('./assets/tracking_icon');

class Scratch3Tracking {
    constructor (runtime) {
        // Renderer
        this.runtime = runtime;
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;

        // Video
        videoElement = null;
        this._track = null;
        this._nativeWidth = null;
        this._nativeHeight = null;

        // Server
        this._socket = null;

        // Labels
        this._lastLabels = [];
        this._currentLabels = [];

        // Setup system and start streaming video to analysis server
        this._setupPreview();
        this._setupVideo();
        this._loop();
    }

    static get HOST () {
        return 'wss://vision.scratch.mit.edu';
    }

    static get INTERVAL () {
        return 500;
    }

    static get WIDTH () {
        return 240;
    }

    static get ORDER () {
        return 1;
    }

    _setupPreview () {
        if (this._skinId !== -1) return;
        if (this._skin !== null) return;
        if (this._drawable !== -1) return;
        if (!this.runtime.renderer) return;

        this._skinId = this.runtime.renderer.createPenSkin();
        this._skin = this.runtime.renderer._allSkins[this._skinId];
        this._drawable = this.runtime.renderer.createDrawable();
        this.runtime.renderer.setDrawableOrder(this._drawable, Scratch3Tracking.ORDER);
        this.runtime.renderer.updateDrawableProperties(this._drawable, {skinId: this._skinId});
    }

    _setupVideo () {
        videoElement = document.createElement('video');
        navigator.getUserMedia({
            video: true,
            audio: false
        }, (stream) => {
            videoElement.src = window.URL.createObjectURL(stream);
            this._track = stream.getTracks()[0]; // @todo Is this needed?
        }, (err) => {
            // @todo Properly handle errors
            log(err);
        });
    }

    _loop () {
        setInterval(() => {
            // Ensure video stream is established
            if (!videoElement) return;
            if (!this._track) return;
            if (typeof videoElement.videoWidth !== 'number') return;
            if (typeof videoElement.videoHeight !== 'number') return;

            // Create low-resolution PNG for analysis
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const nativeWidth = videoElement.videoWidth;
            const nativeHeight = videoElement.videoHeight;

            // Generate video thumbnail for analysis
            ctx.drawImage(
                videoElement,
                0,
                0,
                nativeWidth,
                nativeHeight,
                0,
                0,
                Scratch3Tracking.WIDTH,
                (nativeHeight * (Scratch3Tracking.WIDTH / nativeWidth))
            );
            const data = canvas.toDataURL();

            // Render to preview layer
            if (this._skin !== null) {
                this._skin.drawStamp(canvas, -240, 180);
                this.runtime.requestRedraw();
            }
        }, Scratch3Tracking.INTERVAL);
    }

    getInfo () {
        return {
            id: 'tracking',
            name: 'Tracking',
            blockIconURI: iconURI,
            blocks: [
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

    setTrackedColor(args, util){
        //stop tracking so it doesn't keep tracking previous colors
        if(trackerTask){
            trackerTask.stop();
        }

        //create new tracking object
        localColorTracker = null;
        localColorTracker = new tracking.ColorTracker([]); 

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
            if((Math.abs(rVal-r)<100) && (Math.abs(gVal-g)<100) && (Math.abs(bVal-b)<100)){
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
                console.log("false");
              } else {
                event.data.forEach(function(rect) {
                  console.log(args.COLOR);
                });
              }
        });

        //begin tracking and setting TrackerTask
        trackerTask = tracking.track(videoElement, localColorTracker, {camera: true});
    }

    isColorPresent(){
        //at this point, aribitrary color has already been registered in boolean_tracker
        //set boolean_tracker to track  arbitrary 'color'
        boolean_tracker.setColors(['color']);

        //turn on tracker
        boolean_tracker.on('track', function(event) {
            if (event.data.length === 0) { 
              return false;
            }
            else {
              return true;
            }
        });

        //begin tracking  
        tracking.track(videoElement, boolean_tracker, {camera: true});
    }
}

module.exports = Scratch3Tracking;
