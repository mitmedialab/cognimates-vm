const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
//const response = require('response');

const iconURI = require('./assets/watson_icon');

//camera
let videoElement = undefined;
let hidden_canvas = undefined;
let imageDataURL = undefined;
let image = undefined;
let stream = undefined;

//variable to make sure requests are complete before continuing
let requestInProgress = false;

//models and their classifier_ids
const modelDictionary = {
    'RockPaperScissors': 'RockPaperScissors_371532596'
}

// watson
var watson = require('watson-developer-cloud');
//watson assistant/conversation
var AssistantV1 = require('watson-developer-cloud/conversation/v1');
var assistant = new AssistantV1({
    version_date: '2018-02-16',
    username: "0a425f9f-919a-422c-bac7-b9ce3de71949",
    password: "xkCnqszwIFvF",
    url: 'https://gateway-fra.watsonplatform.net/assistant/api'
});
//watson visual recognition
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visual_recognition = new VisualRecognitionV3({
  url: "https://gateway-a.watsonplatform.net/visual-recognition/api/",
  api_key: '13d2bfc00cfe4046d3fb850533db03e939576af3',
  version_date: '2016-05-20'
});
let parameters = {
    classifier_ids: ['default'],
    url: null,
    threshold: 0.6 
  };  
var params = {
    //images_file: null,
    parameters: parameters
};

//for parsing image response
let watson_response; //the full response
let classes = {}; //the classes and scores returned for the watson_response
let image_class; //the highest scoring class returned for an image

//for parsing assistant response
let assistant_response; 
let labels = {};
let text_label;

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
                            defaultValue: 'title'
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
                            defaultValue: 'classifier id'
                        }
                    }
                },
                {
                    opcode: 'recognizeObject',
                    blockType: BlockType.REPORTER,
                    text: 'recognise objects in photo [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add photo link here'
                        }
                    }
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
                    opcode: 'recognizeText', 
                    blockType: BlockType.REPORTER,
                    text: 'recognize text [TEXT] label',
                    arguments:{
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'type a message!'
                        }
                    }
                },
                {
                    opcode: 'getTextScore', 
                    blockType: BlockType.REPORTER,
                    text: 'score for text label [CLASS]',
                    arguments:{
                        CLASS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'class name'
                        }
                    }
                }     
            ],
            menus: {
                models: ['RockPaperScissors']
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

    getModelFromList(args, util){
        parameters.classifier_ids[0] = modelDictionary[args.MODELNAME];
    }

    getModelfromString(args, util){
        parameters.classifier_ids[0] = args.IDSTRING;
    }
    
    recognizeObject (args, util){
        if (requestInProgress == true) { // Stop if you're still waiting for request to finish
            util.yield(); // Stop Scratch from executing the next block
        } else{
        var urlToRecognise = args.URL;
            parameters.url = args.URL;
            console.log(parameters.classifier_ids[0]);
            request.get('https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify',
                        { qs : {  url: urlToRecognise, threshold: 0.0,
                                classifier_ids : parameters.classifier_ids[0],
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
                            var class_label = null;
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
                            requestInProgress = false;
                            }
                        }); 
            if(image_class === null){
                requestInProgress = true; //set status to waiting
                util.yield(); //block execution of next block   
            }if(image_class !== null){
                    return image_class;
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

    recognizeText(args, util){
        var message = args.TEXT;
        if (requestInProgress == true) { // Stop if you're still waiting for request to finish
            util.yield(); // Stop Scratch from executing the next block
        } else{
            request.get('https://gateway-fra.watsonplatform.net/assistant/api/v1/message',
                { qs : { input: {text: message}, workspace_id: "7d9b43b7-0f5b-4ab2-8979-7ad1c1891221" }, 
                  auth : { username: "0a425f9f-919a-422c-bac7-b9ce3de71949", password: "xkCnqszwIFvF" }
                  //,headers: {'Access-Allow-Control-Origin': 'http://0.0.0.0:8601/'}
                },
                function (err, response) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        response.header("Access-Control-Allow-Origin", 'http://0.0.0.0:8601/');
                        console.log(JSON.stringify(response, null, 2));
                        assistant_response = JSON.parse(JSON.stringify(response, null, 2));
                        assistant_response = JSON.parse(assistant_response.body);
                    }
                });
            if(assistant_response === null){
                requestInProgress = true; //set status to waiting
                util.yield(); //block execution of next block   
            }
            if(assistant_response !== null){
                return assistant_response //will change, but for now just checking for a correct return
             }
        }  
    }
    
    getTextScore(args, util){
        return null;
    }
    
}

module.exports = Scratch3Watson;