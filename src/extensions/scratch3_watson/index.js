const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
// const response = require('response');

const iconURI = require('./assets/watson_icon');

// camera
const videoElement = undefined;
const hidden_canvas = undefined;
const imageDataURL = undefined;
const image = undefined;
const stream = undefined;

// models and their classifier_ids
const modelDictionary = {
    RockPaperScissors: 'RockPaperScissors_371532596'
};

// var fs = require('fs-extra');
// watson
const watson = require('watson-developer-cloud');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const visual_recognition = new VisualRecognitionV3({
    url: 'https://gateway-a.watsonplatform.net/visual-recognition/api/',
    api_key: '13d2bfc00cfe4046d3fb850533db03e939576af3',
    version_date: '2016-05-20'
});

const parameters = {
    classifier_ids: [],
    url: null,
    threshold: 0.6
};
  
const params = {
    // images_file: null,
    parameters: parameters
};

// for parsing response
let watson_response;
let image_class;

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
                    text: 'Choose model from list: [MODELNAME]',
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
                    text: 'Choose model using id: [IDSTRING]',
                    // [THIS] needs to be equal to THIS in arguments
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
                    opcode: 'getImageClass',
                    blockType: BlockType.REPORTER,
                    text: 'recognize image [IMAGE]',
                    arguments: {
                        IMAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Image name'
                        }
                    }
                }
                
            ],
            menus: {
                models: ['RockPaperScissors']
            }
        };
    }


    getModelFromList (args, util){
        parameters.classifier_ids[0] = modelDictionary[args.MODELNAME];
    }

    getModelfromString (args, util){
        parameters.classifier_ids[0] = args.IDSTRING;
    }
    
    recognizeObject (args, util){
        const urlToRecognise = args.URL;
        parameters.url = args.URL;
        console.log(parameters.classifier_ids[0]);
        request.get('https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify',
            {qs: {url: urlToRecognise,
                classifier_ids: parameters.classifier_ids[0],
                api_key: '13d2bfc00cfe4046d3fb850533db03e939576af3',
                version: '2018-03-19'}
            },
            (err, response) => {
                if (err){
                    console.log(err);
                } else {
                    console.log(JSON.stringify(response, null, 2));
                    watson_response = JSON.parse(JSON.stringify(response, null, 2));
                    watson_response = JSON.parse(watson_response.body);
                }
            });
        // need to delay call to this function so the request has time to get through
        setTimeout(() => { image_class = watson_response.images[0].classifiers[0].classes[0].class;
            console.log(image_class);}, 2500);
        return String(image_class);
    }

    getImageClass (args, util) {
        // call visual_recognition to classify the image
        visual_recognition.classify(params, (err, response) => {
            if (err)
                {console.log(err);}
            else
                {image_class = JSON.stringify(response, null, 2);}
            console.log(JSON.stringify(response, null, 2));
        });
        console.log(image_class);
        return image_class;
    }
    
}

module.exports = Scratch3Watson;
