// console.log('Callback is:'); console.dir(callback);
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

const Runtime = require('../../engine/runtime');
const formatMessage = require('format-message');
const Video = require('../../io/video');
let videoElement;
let hidden_canvas;
let _track;
const VideoState = {
    /** Video turned off. */
    OFF: 'off',

    /** Video turned on with default y axis mirroring. */
    ON: 'on',

    /** Video turned on without default y axis mirroring. */
    ON_FLIPPED: 'on-flipped'
};

// clarifai
const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: 'ab5e0215ef78483fbfd93ce075575f3a'
   });
   
const ajax = require('es-ajax');
let clarifai = undefined;
let clarifaiLoaded = false;
var predictionResults = [];

let arrayResults = {"1":1,"2":2,"3":3,"4":4,"5":5}
let imageDataURL = undefined;
let image = undefined;
// let stream = undefined;
const iconURI = require('./assets/clarifai_icon');

function processResponse(response) {
    response.outputs[0].data.concepts.forEach(function(result) {
      predictionResults.push(result.name);
    });
};

class Scratch3Clarifai {
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

            this.videoToggle({
                VIDEO_STATE: 'on'
            });
        }

        this._setupVideo();
        console.log('initialized');
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
     * Occasionally step a loop to sample the video, stamp it to the preview
     * skin, and add a TypedArray copy of the canvas's pixel data.
     * @private
     */
    _loop () {
        setTimeout(this._loop.bind(this), Math.max(this.runtime.currentStepTime, Scratch3Clarifai.INTERVAL));

        // Add frame to detector
        const time = Date.now();
        if (this._lastUpdate === null) {
            this._lastUpdate = time;
        }
        const offset = time - this._lastUpdate;
        if (offset > Scratch3Clarifai.INTERVAL) {
            const frame = this.runtime.ioDevices.video.getFrame({
                format: Video.FORMAT_IMAGE_DATA,
                dimensions: Scratch3Clarifai.DIMENSIONS
            });
            if (frame) {
                this._lastUpdate = time;
                // this.detect.addFrame(frame.data);
            }
        }

        if(this.globalVideoState == 'off'){
            if(videoElement){
                videoElement.pause();
                _track.stop();
                videoElement = null;
                _track = null;
            }
        } else {
            if(videoElement === null){
                this._setupVideo();
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
            id: 'clarifai',
            name: 'Clarifai',
            blockIconURI: iconURI,
            blocks: [
                // {
                //     opcode: 'connect',
                //     blockType: BlockType.COMMAND,
                //     text: 'Connect to API: [USER] [PASS]',
                //     arguments: {
                //         USER: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'vKCXoGNBI9RrFYs33BUxcDOB3WoMJ5rK9D0hSD4J'
                //         },
                //         PASS: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'cva5xoSvMf_htwZZHIZ_9JhjThL8N0BX_PqaJPUj'
                //         }
                //     }
                // },
                {
                    opcode: 'takePhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Take photo as [TITTLE]',
                    arguments: {
                        TITTLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'title'
                        }
                    }
                },
                {
                    opcode: 'performSearch',
                    blockType: BlockType.COMMAND,
                    text: 'Search predictions for your photo'
                },
                {
                    opcode: 'searchLink',
                    blockType: BlockType.COMMAND,
                    text: 'Search image using link [LINK]',
                    arguments: {
                        LINK: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'getResultsLength',
                    blockType: BlockType.REPORTER,
                    text: 'Image results count'
                },
                {
                    opcode: 'getResults',
                    blockType: BlockType.REPORTER,
                    text: 'Get result [INDEX]',
                    arguments:{
                        INDEX:{
                            type: ArgumentType.NUMBER,
                            menu: 'menuIndex',
                            defaultValue: "1"
                        }

                    }
                },
                {
                    opcode: 'clearResults',
                    blockType: BlockType.COMMAND,
                    text: 'Clear results'
                }
            ],
            menus: {
                //  trueFalse: ['true', 'false'],
                 menuIndex:["1","2","3","4","5"],
            }
        };
    }

    connect (args, util){
        const user = args.USER;
        const pass = args.PASS;
        clarifai = new Clarifai.App(user, pass);
        if (clarifai == undefined) {
            clarifaiLoaded = false;
        } else {
            clarifaiLoaded = true;
        }
        console.log('Clarifai initialized');
    }

    takePhoto (args, util) {
        // Get the exact size of the video element.
       const width = videoElement.videoWidth;
       const height = videoElement.videoHeight;
    
        // Context object for working with the canvas.
        const context = hidden_canvas.getContext('2d');
    
        // Set the canvas to the same dimensions as the video.
        hidden_canvas.width = width;
        hidden_canvas.height = height;
    
        // Draw a copy of the current frame from the video on the canvas.
        context.drawImage(videoElement, 0, 0, width, height);
    
        // Get an image dataURL from the canvas.
        imageDataURL = hidden_canvas.toDataURL(args.TITTLE + '/png');
        console.log(imageDataURL);
        return imageDataURL;
    }

    //needs mods
    performSearch () {
        var snapshot = imageDataURL;
        var base64v = snapshot.substring(snapshot.indexOf(',')+1);
        image = { base64 : base64v };
        app.models.predict(Clarifai.GENERAL_MODEL, image).then(
            function(response) {
                console.log(response);
                processResponse(response);
            },
            function(err) {
                console.error(err);
            }
            );
    }
    searchLink(args, util){
        app.models.predict(Clarifai.GENERAL_MODEL, args.LINK).then(
            function(response) {
                console.log(response);
                processResponse(response);
            },
            function(err) {
                console.error(err);
            }
            );
    }

    getResultsLength() {
        return predictionResults.length;
    }


    getResults (args, util) {
        const index = arrayResults[args.INDEX]; 
        if(index >= 0 && index < predictionResults.length) {
        return predictionResults[index];
        } else {
        console.log("Index out of bounds");
        }
    }
    
    clearResults () {
        predictionResults = [];
    }

    _setupVideo () {
        videoElement = document.createElement('video');
        hidden_canvas = document.createElement('canvas');
        hidden_canvas.id = 'imageCanvas';
        navigator.getUserMedia({
            video: true,
            audio: false
        }, (stream) => {
            videoElement.srcObject = stream;
            _track = stream.getTracks()[0]; // @todo Is this needed?
        }, (err) => {
            // @todo Properly handle errors
            console.log(err);
        });
        console.log('here, video set up');
    }

    videoToggle (args) {
        const state = args.VIDEO_STATE;
        this.globalVideoState = state;
        if (state === VideoState.OFF) {
            if(videoElement){
                trackerTask.stop();
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


    /**
     * A scratch command block handle that configures the video preview's
     * transparency from passed arguments.
     * @param {object} args - the block arguments
     * @param {number} args.TRANSPARENCY - the transparency to set the video
     *   preview to
     */
    setVideoTransparency (args) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        this.globalVideoTransparency = transparency;
        this.runtime.ioDevices.video.setPreviewGhost(transparency);
    }
}

module.exports = Scratch3Clarifai;
