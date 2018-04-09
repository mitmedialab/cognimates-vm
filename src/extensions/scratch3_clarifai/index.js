// console.log('Callback is:'); console.dir(callback);
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

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
let videoElement = undefined;
let hidden_canvas = undefined;
let imageDataURL = undefined;
let image = undefined;
let stream = undefined;
const iconURI = require('./assets/clarifai_icon');



function processResponse(response) {
    response.outputs[0].data.concepts.forEach(function(result) {
      predictionResults.push(result.name);
    });
};

class Scratch3Clarifai {
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
        this.runtime.renderer.setDrawableOrder(this._drawable, Scratch3Clarifai.ORDER);
        this.runtime.renderer.updateDrawableProperties(this._drawable, {skinId: this._skinId});
    }

    _setupVideo () {
        videoElement = document.createElement('video');
        videoElement.id = 'camera-stream';
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
                Scratch3Clarifai.WIDTH,
                (nativeHeight * (Scratch3Clarifai.WIDTH / nativeWidth))
            );
            const data = canvas.toDataURL();

            // Render to preview layer
            if (this._skin !== null) {
                this._skin.drawStamp(canvas, -240, 180);
                this.runtime.requestRedraw();
            }
        }, Scratch3Clarifai.INTERVAL);
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
                 menuIndex:["1","2","3","4","5"]
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


}

module.exports = Scratch3Clarifai;
