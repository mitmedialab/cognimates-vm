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
let tracked_image;
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
        this._video = null;
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
        this._setupServer();
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
        this._video = document.createElement('video');
        navigator.getUserMedia({
            video: true,
            audio: false
        }, (stream) => {
            this._video.src = window.URL.createObjectURL(stream);
            this._track = stream.getTracks()[0]; // @todo Is this needed?
        }, (err) => {
            // @todo Properly handle errors
            log(err);
        });
    }

    _setupServer () {
        this._socket = new WebSocket(Scratch3Tracking.HOST);
        /*
        // Handle message events
        this._socket.onmessage = (e) => {
            // Extract data
            let data;
            try {
                data = JSON.parse(e.data);
            } catch (err) {
                console.log(err);
            }

            // Push data to label storage arrays
            this._lastLabels = this._currentLabels;
            this._currentLabels = [];
            for (let i in data.labels) {
                this._currentLabels.push(data.labels[i]);
            }

            // Print debug information
            console.clear();
            for (let i in data.debug) {
                console.log(data.debug[i]);
            }
        };

        // Handle error events
        this._socket.onerror = (e) => {
            console.log(e);
            // @todo Handle reconnection
        };

        // Handle close events
        this._socket.onclose = (e) => {
            console.log(e);
            // @todo Handle reconnection
        }*/
    }

    _loop () {
        setInterval(() => {
            // Ensure video stream is established
            if (!this._video) return;
            if (!this._track) return;
            if (typeof this._video.videoWidth !== 'number') return;
            if (typeof this._video.videoHeight !== 'number') return;

            // Ensure server connection is established
            if (!this._socket) return;

            // Create low-resolution PNG for analysis
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const nativeWidth = this._video.videoWidth;
            const nativeHeight = this._video.videoHeight;

            // Generate video thumbnail for analysis
            ctx.drawImage(
                this._video,
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
            
            // Forward to websocket server
            if (this._socket.readyState === 1) {
                this._socket.send(data);
            };
        }, Scratch3Tracking.INTERVAL);
    }

    getInfo () {
        return {
            id: 'tracking',
            name: 'Tracking',
            blockIconURI: iconURI,
            blocks: [
                /*{
                    opcode: 'initializeCamera',
                    blockType: BlockType.COMMAND,
                    text: 'Start your camera',
                },*/
                {
                    opcode: 'setTrackedColor',
                    blockType: BlockType.COMMAND,
                    text: 'Set Color to be Tracked [COLOR]',
                    arguments: {
                      COLOR: {
                          type: ArgumentType.STRING
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
        //create new tracking objects to track the arbitrary color
        localColorTracker = new tracking.ColorTracker([]); 

        localColorTracker.setColors([args.COLOR])
        //register the color
        //const rgb = Cast.toRgbColorObject(args.COLOR);
        //console.log(rgb);

        //separate the rgb values
        /*var rVal = rgb['r'];
        var gVal = rgb['g'];
        var bVal = rgb['b'];*/

        //register the color, create function w/ arbitrary key 'color'
        /*tracking.ColorTracker.registerColor('color', function(r, g, b){
            //tracking events where all r,g, and b values are within 50 of the tracked color
            if((Math.abs(rVal-r)<50) && (Math.abs(gVal-g)<50) && (Math.abs(bVal-b)<50)){
                return true;
            } else{
                return false;
            }
        });*/

        //set arbitrary 'color' to be tracked
        //localColorTracker.setColors(['color']);

        //turn on local tracking object
        localColorTracker.on('track', function(event) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            event.data.forEach(function(rect) {
            if (rect.color === 'custom') {
                rect.color = tracker.customColor;
            }
            console.log(rect.color)
            context.strokeStyle = rect.color;
            context.strokeRect(rect.x, rect.y, rect.width, rect.height);
            context.font = '11px Helvetica';
            context.fillStyle = "#fff";
            context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
            context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
            });
        });

        //begin tracking 
        tracking.track(tracked_image, localColorTracker, {camera: true});
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
