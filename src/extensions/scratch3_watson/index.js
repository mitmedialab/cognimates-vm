const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
// const response = require('response');

const iconURI = require('./assets/watson_icon');

//variable to make sure requests are complete before continuing
let requestInProgress = false;

//models and their classifier_ids
const modelDictionary = {
    RockPaperScissors: 'RockPaperScissors_371532596',
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
//classifier_id
let classifier_id = 'default'

//for parsing image response
let watson_response; //the full response
let classes = {}; //the classes and scores returned for the watson_response
let image_class; //the highest scoring class returned for an image

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
                }     
            ],
            menus: {
                models: ['RockPaperScissors', 'Default']
            }
        };
    }


    getModelFromList (args, util){
        classifier_id = modelDictionary[args.MODELNAME];
    }

    getModelfromString (args, util){
        classifier_id = args.IDSTRING;
    }
    
    recognizeObject (args, util){
        if (requestInProgress == true) { // Stop if you're still waiting for request to finish
            util.yield(); // Stop Scratch from executing the next block
        } else{
            var urlToRecognise = args.URL;
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
    
}

module.exports = Scratch3Watson;
