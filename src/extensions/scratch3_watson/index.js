const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//camera
let videoElement = undefined;
let hidden_canvas = undefined;
let imageDataURL = undefined;
let image = undefined;
let stream = undefined;

//models and their classifier_ids
const modelDictionary = {
    'RockPaperScissors': 'its classifier_id'
}

// watson
var watson = require('watson-developer-cloud');
var fs = require('fs');

var visual_recognition = watson.visual_recognition({
  api_key: '13d2bfc00cfe4046d3fb850533db03e939576af3',
  version_date: '2016-05-20'
});

let parameters = {
    classifier_ids: [],
    threshold: 0.6
  };
  
  var params = {
    images_file: fs.createReadStream('./fruitbowl.jpg'),
    parameters: parameters
  };

let image_class;

const iconURI = require('./assets/watson_icon');


class Scratch3Watson {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'watson',
            name: 'Watson',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'initializeCamera',
                    blockType: BlockType.COMMAND,
                    text: 'Start your webcam'
                },
                {
                    opcode: 'takePhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Take photo as [TITLE]',
                    arguments: {
                        TITLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'tittle'
                        }
                    }
                },
                {
                    opcode: 'recognizeObject',
                    blockType: BlockType.COMMAND,
                    text: 'recognise objects in [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add apple link here'
                        }
                    }
                },
                {
                    opcode: 'getModel',
                    blockType: BlockType.COMMAND,
                    text: 'Model: [modelName]',
                    arguments: {
                        modelName: {
                            type: ArgumentType.STRING,
                            menu: 'models',
                            defaultValue: 'RockPaperScissors'
                        }
                    }
                },
                {
                    opcode: 'classifyImage',
                    blockType: BlockType.BOOLEAN,
                    text:'recognize [IMAGE]',
                    arguments: {
                        IMAGE: {
                            type: '',
                            defaultValue: ''
                        }
                    }                
                }
                
            ],
            menus: {
                models: ['RockPaperScissors']
            }
        };
    }

    getModel(args, util){
        parameters[classifier_ids] = modelDictionary[args.modelName];
    }

    recognizeObject (args, util){

    }

    getImageClass(args, util) {
        //call visual_recognition to classify the image
        visual_recognition.classify(params, function(err, response) {
            if (err)
              console.log(err);
            else
              image_class = JSON.stringify(response, null, 2);
              console.log(JSON.stringify(response, null, 2))
        });
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
        imageDataURL = hidden_canvas.toDataURL(args.TITLE + '/png');
        console.log(imageDataURL);
        return imageDataURL;
    }
}

module.exports = Scratch3Watson;