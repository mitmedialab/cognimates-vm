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

//variables to make sure requests are complete before continuing
const REQUEST_STATE = {
    IDLE: 0,
    PENDING: 1,
    FINISHED: 2
  };
let classifyRequestState = REQUEST_STATE.IDLE;

//models and their classifier_ids
const modelDictionary = {
    RockPaperScissors: 'DefaultCustomModel_1216089182',
    Default: 'default'
};

// watson
var watson = require('watson-developer-cloud');
//watson visual recognition
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visual_recognition = new VisualRecognitionV3({
  url: "https://gateway-a.watsonplatform.net/visual-recognition/api/",
  api_key: '13d2bfc00cfe4046d3fb850533db03e939576af3',
  version_date: '2016-05-20'
});
//server info
let apiURL = 'https://gateway-a.watsonplatform.net/visual-recognition/api';
let classifyURL = `http://35.169.45.24:3477/visual/classify`;

//classifier_id
let classifier_id = 'default'

//for parsing image response
let watson_response; //the full response
let classes; //the classes and scores returned for the watson_response
let image_class; //the highest scoring class returned for an image

//image that user takes
let videoElement;
let hidden_canvas;
let imageData;

class Scratch3Watson {
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
        this.runtime.renderer.setDrawableOrder(this._drawable, Scratch3Watson.ORDER);
        this.runtime.renderer.updateDrawableProperties(this._drawable, {skinId: this._skinId});
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
            this._track = stream.getTracks()[0]; // @todo Is this needed?
        }, (err) => {
            // @todo Properly handle errors
            console.log(err);
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
                Scratch3Watson.WIDTH,
                (nativeHeight * (Scratch3Watson.WIDTH / nativeWidth))
            );
            const data = canvas.toDataURL();

            // Render to preview layer
            if (this._skin !== null) {
                this._skin.drawStamp(canvas, -240, 180);
                this.runtime.requestRedraw();
            }
            
        }, Scratch3Watson.INTERVAL);
    }

    getInfo () {
        return {
            id: 'watson',
            name: 'Watson',
            blockIconURI: iconURI,
            blocks: [
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
                            defaultValue: 'classifier id'
                        }
                    }
                },
                {
                    opcode: 'takePhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Take photo form webcam'
                },
                {
                    opcode: 'recognizeObject',
                    blockType: BlockType.REPORTER,
                    text: 'recognise objects in linked photo [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add photo link here'
                        }
                    }
                },
                {
                    opcode: 'recognizeFileObject', 
                    blockType: BlockType.REPORTER,
                    text: 'get the label for your webcam photo',
                },
                {
                    opcode: 'getScore', 
                    blockType: BlockType.REPORTER,
                    text: 'score for image label [CLASS]',
                    arguments:{
                        CLASS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'label name'
                        }
                    }
                },
                {
                    opcode: 'clearResults',
                    blockType: BlockType.COMMAND,
                    text: 'clear results'
                }
            ],
            menus: {
                models: ['RockPaperScissors', 'Default']
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
    recognizeObject (args, util){
        if(classifyRequestState == REQUEST_STATE.FINISHED) {
            classifyRequestState = REQUEST_STATE.IDLE;
            return image_class;
        }
        if(classifyRequestState == REQUEST_STATE.PENDING) {
            util.yield();
        } 
        if(classifyRequestState == REQUEST_STATE.IDLE){
            var urlToRecognise = args.URL;
            classes = {};
            request.get('https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify',
                        { qs : {  url: urlToRecognise, threshold: 0.0,
                                classifier_ids : classifier_id,
                                api_key : '13d2bfc00cfe4046d3fb850533db03e939576af3',
                                version: '2018-03-19'} 
                        },
                        function (err, response) {
                            if (err){
                                console.log(err);
                            }
                            else{
                            console.log(JSON.stringify(response, null, 2));
                            //gets the class info from watson response
                            watson_response = JSON.parse(JSON.stringify(response, null, 2));
                            watson_response = JSON.parse(watson_response.body);
                            //go through the response and create a javascript object holding class info
                            var info = watson_response.images[0].classifiers[0].classes;
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
                            image_class = class_label;
                            console.log(image_class);
                            classifyRequestState = REQUEST_STATE.FINISHED;
                            util.yield();
                            }
        }); 
        if(classifyRequestState == REQUEST_STATE.IDLE) {
            classifyRequestState = REQUEST_STATE.PENDING;
            util.yield();
            }   
        }

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
        //return the class if valid
        console.log(classes);
        console.log(classes[comparison_class]);
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
    
    recognizeFileObject(args,util) {
        if(classifyRequestState == REQUEST_STATE.FINISHED) {
          classifyRequestState = REQUEST_STATE.IDLE
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
                //response = JSON.parse(response);
                watson_response = JSON.parse(response, null, 2);
                watson_response = watson_response.images;
                var info = watson_response[0].classifiers[0].classes;
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
                image_class = class_label;
                console.log(image_class);
              }
              classifyRequestState = REQUEST_STATE.FINISHED
              //util.yield()
          });
          if(classifyRequestState == REQUEST_STATE.IDLE) {
            classifyRequestState = REQUEST_STATE.PENDING
            util.yield()
          }
        }
      }

    classify(classifier, image, callback) {
        request.post({
            url:     classifyURL,
            form:    { api_key: "1438a8fdb764f1c8af8ada02e6c601cec369fc40", 
                        version_date: '2018-03-19', classifier_id: classifier_id,
                        threshold: 0.0, image_data: image, api_url: apiURL }
            }, function(error, response, body){
            callback(error, body);
            });
    }

    clearResults () {
        image_class = null;
        imageData = null;
        classes = {};
    }
}

module.exports = Scratch3Watson;
