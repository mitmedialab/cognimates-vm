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
        this.runtime = runtime;
  
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
                    text: 'Take picture as [TITTLE]',
                    arguments: {
                        TITTLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'tittle'
                        }
                    }
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
                    opcode: 'performSearch',
                    blockType: BlockType.COMMAND,
                    text: 'Search predictions for [IMAGE]',
                    arguments:{
                        IMAGE:{
                            type: ArgumentType.STRING,
                            defaultValue: 'tittle'
                        }
                    }
                },
                {
                    opcode: 'initializeCamera',
                    blockType: BlockType.COMMAND,
                    text: 'Start your webcam'
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
    performSearch (args, util) {
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
