const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
// const response = require('response');
const iconURI = require('./assets/watson_icon');
const fs = require('browserify-fs');
let image;

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

//variables to make sure requests are complete before continuing
const REQUEST_STATE = {
    IDLE: 0,
    PENDING: 1,
    FINISHED: 2
  };
let classifyRequestState = REQUEST_STATE.IDLE;

//models and their classifier_ids
const modelDictionary = {
    RockPaperScissors: 'RockPaperScissors_433767170',
    //RockPaperScissors: 'RockPaperScissors_1851580266',
    Default: 'default'
};

//server info
let apiURL = 'https://gateway-a.watsonplatform.net/visual-recognition/api';
let classifyURL = 'https://cognimate.me:3477/visual/classify';
//let classifyURL = 'http://localhost:3477/visual/classify';
let updateURL = 'https://cognimate.me:3477/visual/update';

//classifier_id
let classifier_id = 'default';
let api_key = "1438a8fdb764f1c8af8ada02e6c601cec369fc40";

//for parsing image response
let watson_response; //the full response
let classes; //the classes and scores returned for the watson_response
let image_class; //the highest scoring class returned for an image

//response when updating a classifier
let update_response;

//image that user takes
let videoElement;
let hidden_canvas;
let imageData;
let _track;

class Scratch3Watson {
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
     * Occasionally step a loop to sample the video, stamp it to the preview
     * skin, and add a TypedArray copy of the canvas's pixel data.
     * @private
     */
    _loop () {
        setTimeout(this._loop.bind(this), Math.max(this.runtime.currentStepTime, Scratch3Watson.INTERVAL));

        // Add frame to detector
        const time = Date.now();
        if (this._lastUpdate === null) {
            this._lastUpdate = time;
        }
        const offset = time - this._lastUpdate;
        if (offset > Scratch3Watson.INTERVAL) {
            const frame = this.runtime.ioDevices.video.getFrame({
                format: Video.FORMAT_IMAGE_DATA,
                dimensions: Scratch3Watson.DIMENSIONS
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
            id: 'watson',
            name: 'Watson',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'setAPI',
                    blockType: BlockType.COMMAND,
                    text: 'Set API key to [KEY]',
                    arguments:{
                        KEY:{
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        }
                    }
                },
                {
                    opcode: 'getModelFromList',
                    blockType: BlockType.COMMAND,
                    text: 'Choose image model from list: [MODELNAME]',
                    arguments: {
                        MODELNAME: {
                            type: ArgumentType.STRING,
                            menu: 'models',
                            defaultValue: 'RockPaperScissors'
                        }
                    }
                },
                {
                    opcode: 'getModelfromString',
                    blockType: BlockType.COMMAND,
                    text: 'Choose image model using id: [IDSTRING]',
                    //[THIS] needs to be equal to THIS in arguments
                    arguments: {
                        IDSTRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'model id'
                        }
                    }
                },
                {
                    opcode: 'takePhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Take photo from webcam'
                },
                {
                    opcode: 'setPhotoFromURL',
                    blockType: BlockType.COMMAND,
                    text: 'Use photo from url [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add link here'
                        }
                    }
                },
                {
                    opcode: 'recognizeObject', 
                    blockType: BlockType.REPORTER,
                    text: 'What do you see in the photo?',
                },
                {
                    opcode: 'getScore', 
                    blockType: BlockType.REPORTER,
                    text: 'How sure are you the photo is a [CLASS]?',
                    arguments:{
                        CLASS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add category here'
                        }
                    }
                },
                {
                    opcode: 'clearResults',
                    blockType: BlockType.COMMAND,
                    text: 'Clear results'
                },
                {
                    opcode: 'updateClassifier',
                    blockType: BlockType.COMMAND,
                    text: 'Add photo to [LABEL]',
                    arguments:{
                        LABEL:{
                            type: ArgumentType.STRING, 
                            defaultValue: 'add category here'
                        }
                    }
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
                models: ['Default','RockPaperScissors'],
                VIDEO_STATE: this._buildMenu(this.VIDEO_STATE_INFO)
            }
        };
    }


    getModelFromList (args, util){
        classifier_id = modelDictionary[args.MODELNAME];
        console.log(classifier_id);
    }

    getModelfromString (args, util){
        if(args.IDSTRING !== 'classifier id'){
            classifier_id = args.IDSTRING;
        }
        console.log(classifier_id);
    }

    getScore(args, util){
        //check that classes is not empty
        if(classes === null){
            return 'did you classify an object yet?'
        }
        var comparison_class = args.CLASS;
        //make sure the class entered is valid
        if(!classes.hasOwnProperty(comparison_class)){
            return 'this is not a valid class'
        }
        return classes[comparison_class];
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
        imageData = hidden_canvas.toDataURL();
        console.log(imageData);
    }

    recognizeObject(args,util) {
        if(classifyRequestState == REQUEST_STATE.FINISHED) {
          classifyRequestState = REQUEST_STATE.IDLE;
          image_class = this.parseResponse(watson_response);
          return image_class;
        }
        if(classifyRequestState == REQUEST_STATE.PENDING) {
          util.yield()
        }
        if(classifyRequestState == REQUEST_STATE.IDLE) {
            image_class = null
            classes = {};
            let image = imageData
            this.classify(classifier_id,
                image,
                function(err, response) {
                if (err)
                    console.log(err);
                else {
                    watson_response = JSON.parse(response, null, 2);
                    watson_response = watson_response.images;
                }
                classifyRequestState = REQUEST_STATE.FINISHED;
            });
            if(classifyRequestState == REQUEST_STATE.IDLE) {
            classifyRequestState = REQUEST_STATE.PENDING;
            util.yield();
            }
        }
      }

    parseResponse(input){
        var info = input[0].classifiers[0].classes;
        for (var i = 0, length = info.length; i < length; i++) {
            classes[info[i].class] = info[i].score;
        }
        //figure out the highest scoring class
        var class_label;                            
        var best_score = 0;
        for (var key in classes) {
            if (classes.hasOwnProperty(key)) {
                if(classes[key]>best_score){
                    best_score = classes[key];
                    class_label = key;
                }
            }
            }
        return class_label
    }

    classify(classifier, image, callback) {
        if(image.substring(0,4) === 'data'){
            request.post({
                url:     classifyURL,
                form:    { api_key: api_key, 
                            version_date: '2018-03-19', classifier_id: classifier_id,
                            threshold: 0.0, image_data: image, api_url: apiURL }
                }, function(error, response, body){
                callback(error, body);
                });
        } else{
            request.post({
                url:     classifyURL,
                form:    { api_key: api_key, 
                            version_date: '2018-03-19', classifier_id: classifier_id,
                            threshold: 0.0, image_url: image, api_url: apiURL }
                }, function(error, response, body){
                    callback(error, body);
                });
        }
    }


    setAPI(args, util){
        if(args.STRING === 'key')
        {
            api_key = "1438a8fdb764f1c8af8ada02e6c601cec369fc40"
        }
        else{
            api_key = args.KEY
        }
        console.log(api_key)
    }

    setPhotoFromURL(args,util){
        if(args.URL === 'add link here'){
            return 'invalid link'
        } else{
            imageData = args.URL
        }
    }

    clearResults () {
        image_class = null;
        imageData = null;
        classes = {};
    }

    updateClassifier(args, util){
        if(imageData.substring(0,4) === 'data'){
            request.post({
                url:     updateURL,
                form:    { api_key: "1438a8fdb764f1c8af8ada02e6c601cec369fc40", 
                            version_date: '2018-03-19', classifier_id: classifier_id,
                            label: args.LABEL,
                            positive_example: imageData }
                }, function(err, response, body) {
                    if (err)
                        console.log(err);
                    else {
                        update_response = response.body;
                        console.log(response);
                        console.log(update_response);
                    }
                });
        } else{
            return 'Only use webcam photos!'
        }
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

module.exports = Scratch3Watson;