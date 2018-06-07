import { EILSEQ } from 'constants';

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');

const Runtime = require('../../engine/runtime');
const formatMessage = require('format-message');
const Video = require('../../io/video');
const VideoState = {
    /** Video turned off. */
    OFF: 'off',

    /** Video turned on with default y axis mirroring. */
    ON: 'on',

    /** Video turned on without default y axis mirroring. */
    ON_FLIPPED: 'on-flipped'
};
// tracking, need to require specific file
// Don't forget to put module.exports = window.tracking; at the very bottom of the file
// Change line 247 and 248 from offsetWidth and offsetHeight to videoWidth and videoHeight
const tracking = require('tracking/build/tracking');
let localColorTracker;
let videoElement;
let hidden_canvas;
let _track;
let trackerTask;
let color_spotter = false;
let trackerState;
// testing tracking
const ajax = require('es-ajax');
const iconURI = require('./assets/tracking_icon');

class Scratch3Tracking {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * The last millisecond epoch timestamp that the video stream was
         * analyzed.
         * @type {number}
         */
        this._lastUpdate = null;

        if (this.runtime.ioDevices) {
            // Clear target motion state values when the project starts.
            // this.runtime.on(Runtime.PROJECT_RUN_START, this.reset.bind(this));

            // Kick off looping the analysis logic.
            this._loop();

            // Configure the video device with values from a globally stored
            // location.
            this.setVideoTransparency({
                TRANSPARENCY: this.globalVideoTransparency
            });
            this.videoToggle({
                VIDEO_STATE: this.globalVideoState
            });
        }
    }

    /**
     * After analyzing a frame the amount of milliseconds until another frame
     * is analyzed.
     * @type {number}
     */
    static get INTERVAL () {
        return 33;
    }

    /**
     * Dimensions the video stream is analyzed at after its rendered to the
     * sample canvas.
     * @type {Array.<number>}
     */
    static get DIMENSIONS () {
        return [480, 360];
    }

    /**
     * The transparency setting of the video preview stored in a value
     * accessible by any object connected to the virtual machine.
     * @type {number}
     */
    get globalVideoTransparency () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.videoTransparency;
        }
        return 50;
    }

    set globalVideoTransparency (transparency) {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoTransparency = transparency;
        }
        return transparency;
    }

    /**
     * The video state of the video preview stored in a value accessible by any
     * object connected to the virtual machine.
     * @type {number}
     */
    get globalVideoState () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.videoState;
        }
        return VideoState.ON;
    }

    set globalVideoState (state) {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoState = state;
        }
        return state;
    }

    /**
     * Reset the extension's data motion detection data. This will clear out
     * for example old frames, so the first analyzed frame will not be compared
     * against a frame from before reset was called.
     */
    // reset () {
    //     this.detect.reset();

    //     const targets = this.runtime.targets;
    //     for (let i = 0; i < targets.length; i++) {
    //         const state = targets[i].getCustomState(Scratch3Tracking.STATE_KEY);
    //         if (state) {
    //             state.motionAmount = 0;
    //             state.motionDirection = 0;
    //         }
    //     }
    // }

    /**
     * Occasionally step a loop to sample the video, stamp it to the preview
     * skin, and add a TypedArray copy of the canvas's pixel data.
     * @private
     */
    _loop () {
        setTimeout(this._loop.bind(this), Math.max(this.runtime.currentStepTime, Scratch3Tracking.INTERVAL));

        // Add frame to detector
        const time = Date.now();
        if (this._lastUpdate === null) {
            this._lastUpdate = time;
        }
        const offset = time - this._lastUpdate;
        if (offset > Scratch3Tracking.INTERVAL) {
            const frame = this.runtime.ioDevices.video.getFrame({
                format: Video.FORMAT_IMAGE_DATA,
                dimensions: Scratch3Tracking.DIMENSIONS
            });
            if (frame) {
                this._lastUpdate = time;
                // this.detect.addFrame(frame.data);
            }
        }
    }

    /**
     * Create data for a menu in scratch-blocks format, consisting of an array
     * of objects with text and value properties. The text is a translated
     * string, and the value is one-indexed.
     * @param {object[]} info - An array of info objects each having a name
     *   property.
     * @return {array} - An array of objects with text and value properties.
     * @private
     */
    _buildMenu (info) {
        return info.map((entry, index) => {
            const obj = {};
            obj.text = entry.name;
            obj.value = entry.value || String(index + 1);
            return obj;
        });
    }

    /**
     * States the video sensing activity can be set to.
     * @readonly
     * @enum {string}
     */
    static get VideoState () {
        return VideoState;
    }

    /**
     * An array of info on video state options for the "turn video [STATE]" block.
     * @type {object[]} an array of objects
     * @param {string} name - the translatable name to display in the video state menu
     * @param {string} value - the serializable value stored in the block
     */
    get VIDEO_STATE_INFO () {
        return [
            {
                name: formatMessage({
                    id: 'videoSensing.off',
                    default: 'off',
                    description: 'Option for the "turn video [STATE]" block'
                }),
                value: VideoState.OFF
            },
            {
                name: formatMessage({
                    id: 'videoSensing.on',
                    default: 'on',
                    description: 'Option for the "turn video [STATE]" block'
                }),
                value: VideoState.ON
            },
            {
                name: formatMessage({
                    id: 'videoSensing.onFlipped',
                    default: 'on flipped',
                    description: 'Option for the "turn video [STATE]" block that causes the video to be flipped' +
                        ' horizontally (reversed as in a mirror)'
                }),
                value: VideoState.ON_FLIPPED
            }
        ];
    }

    getInfo () {
        return {
            id: 'tracking',
            name: 'Color',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'setTrackedColor',
                    blockType: BlockType.COMMAND,
                    text: 'track the color [COLOR]',
                    arguments:{
                        COLOR:{
                            type: ArgumentType.COLOR
                        } 
                    }
                },
                {
                    opcode: 'whenISee',
                    blockType: BlockType.HAT,
                    text: 'When I see color'
                },
                {
                    opcode: 'whenINotSee', 
                    blockType: BlockType.HAT,
                    text: 'When I do not see color'
                },
                {
                    opcode: 'isPresent',
                    blockType: BlockType.BOOLEAN,
                    text: 'Do you see the color?'
                },
                {
                    opcode: 'videoToggle',
                    text: formatMessage({
                        id: 'videoSensing.videoToggle',
                        default: 'turn video [VIDEO_STATE]',
                        description: 'Controls display of the video preview layer'
                    }),
                    arguments: {
                        VIDEO_STATE: {
                            type: ArgumentType.NUMBER,
                            menu: 'VIDEO_STATE',
                            defaultValue: VideoState.ON
                        }
                    }
                },
                {
                    opcode: 'setVideoTransparency',
                    text: formatMessage({
                        id: 'videoSensing.setVideoTransparency',
                        default: 'set video transparency to [TRANSPARENCY]',
                        description: 'Controls transparency of the video preview layer'
                    }),
                    arguments: {
                        TRANSPARENCY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                }
            ],
            menus: {
                 trueFalse: ['true', 'false'],
                 VIDEO_STATE: this._buildMenu(this.VIDEO_STATE_INFO)
            }
        };
    }

    setTrackedColor (args, util){
        // stop tracking so it doesn't keep tracking previous colors
        if (trackerTask){
            trackerTask.stop();
        }

        // create new tracking object
        localColorTracker = null;
        localColorTracker = new tracking.ColorTracker([]);

        // register the color
        const rgb = Cast.toRgbColorObject(args.COLOR);
        // separate the rgb values
        let rVal = rgb.r;
        let gVal = rgb.g;
        let bVal = rgb.b;
        // register the color, create function w/ arbitrary key 'color'
        tracking.ColorTracker.registerColor('color', (r, g, b) => {
            //tracking events where all r,g, and b values are within 50 of the tracked color
            if((Math.abs(rVal-r)<50) && (Math.abs(gVal-g)<50) && (Math.abs(bVal-b)<50)){
                return true;
            } else{
                return false;
            }
        });

        // set arbitrary 'color' to be tracked
        localColorTracker.setColors(['color']);
        // turn on local tracking object
        localColorTracker.on('track', (event) => {
            if (event.data.length === 0) {
                color_spotter = false;
                console.log("false");
                } else {
                event.data.forEach(function(rect) {
                    color_spotter = true;
                    console.log('true');
                });
                }
        });
        console.log(videoElement);
        // begin tracking and setting TrackerTask
        trackerTask = tracking.track(videoElement, localColorTracker, {camera: true});
    }


    whenISee (args, util) {
        if(trackerTask){
            if (color_spotter) {  
                return true;
            } else{
                return false;
            } 
        }
    }

    whenINotSee (args, util) {
        if(trackerTask){
            if (color_spotter) {
                return false;
            } else{
                return true;
            }
        }
    }

    isPresent(){
        return color_spotter;
    }

    videoToggle (args) {
        const state = args.VIDEO_STATE;
        this.globalVideoState = state;
        if (state === VideoState.OFF) {
            if(videoElement){
                videoElement.pause();
                _track.stop();
                videoElement = null;
                _track = null;
            }
            this.runtime.ioDevices.video.disableVideo();
        } else {
            this._setupVideo();
            this.runtime.ioDevices.video.enableVideo();
            // Mirror if state is ON. Do not mirror if state is ON_FLIPPED.
            this.runtime.ioDevices.video.mirror = state === VideoState.ON;
        }
    }

    setVideoTransparency (args) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        this.globalVideoTransparency = transparency;
        this.runtime.ioDevices.video.setPreviewGhost(transparency);
    }

    _setupVideo () {
        videoElement = document.createElement('video');
        hidden_canvas = document.createElement('canvas');
        hidden_canvas.id = 'imageCanvas';
        navigator.getUserMedia({
            video: true,
            audio: false
        }, (stream) => {
            videoElement.src = window.URL.createObjectURL(stream);
            _track = stream.getTracks()[0]; // @todo Is this needed?
        }, (err) => {
            // @todo Properly handle errors
            console.log(err);
        });
    }
}

module.exports = Scratch3Tracking;