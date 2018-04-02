const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
//const response = require('response');

const iconURI = require('./assets/watson_nlc_icon');

const REQUEST_STATE = {
  IDLE: 0,
  PENDING: 1,
  FINISHED: 2
}

let classifier_id = '2fbda2x327-nlc-1430'
let classifyRequestState = REQUEST_STATE.IDLE
let predicted_class = null

let gatewayURL = 'https://gateway.watsonplatform.net/natural-language-classifier/api'
let classifyURL = `http://cognimate.me:3477/nlc/classify`

//models and their classifier_ids
const modelDictionary = {
    'good_bad': '2fbda2x327-nlc-1430'
}


let authInfo = {
  username: '3c175df7-5d3e-42c0-9458-cd723829c915',
  password: 'hfYTqyeWp3rL'
}

let parameters = {
    classifier_ids: [],
    url: null,
    threshold: 0
  };

var params = {
    //images_file: null,
    parameters: parameters
};

class Scratch3WatsonNlp{
    constructor (runtime) {
        this.runtime = runtime;

    }

    getInfo () {
        return {
            id: 'watson_nlc',
            name: 'Watson Natural Language Classifier',
            blockIconURI: iconURI,
            blocks: [
                // {
                //     opcode: 'setAuthData',
                //     blockType: BlockType.COMMAND,
                //     text: 'Set username [USERNAME] password [PASSWORD]',
                //     arguments: {
                //         USERNAME: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '3c175df7-5d3e-42c0-9458-cd723829c915'
                //         },
                //         PASSWORD: {
                //           type: ArgumentType.STRING,
                //           defaultValue: 'hfYTqyeWp3rL'
                //         }
                //     }
                // },
                {
                    opcode: 'getModelFromList',
                    blockType: BlockType.COMMAND,
                    text: 'Choose model from list: [MODELNAME]',
                    arguments: {
                        MODELNAME: {
                            type: ArgumentType.STRING,
                            menu: 'models',
                            defaultValue: 'good_bad'
                        }
                    }
                },
                {
                    opcode: 'getModelfromString',
                    blockType: BlockType.COMMAND,
                    text: 'Choose model using id: [IDSTRING]',
                    //[THIS] needs to be equal to THIS in arguments
                    arguments: {
                        IDSTRING: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                            // 2fbda2x327-nlc-1430
                        }
                    }
                },
                {
                    opcode: 'getTextClass',
                    blockType: BlockType.REPORTER,
                    text:'classify text [PHRASE]',
                    arguments: {
                        PHRASE: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                }
            ],
            menus: {
                models: ['good_bad']
            }
        };
    }

    getModelFromList(args, util){
        classifier_id = modelDictionary[args.MODELNAME]
    }

    getModelfromString(args, util){
        classifier_id = args.IDSTRING;
    }

    getTextClass(args, util) {
        if(classifyRequestState == REQUEST_STATE.FINISHED) {
          classifyRequestState = REQUEST_STATE.IDLE
          return predicted_class
        }
        if(classifyRequestState == REQUEST_STATE.PENDING) {
          util.yield()
        }
        if(classifyRequestState == REQUEST_STATE.IDLE) {
          predicted_class = null
          let phrase = args.PHRASE
          this.classify(classifier_id,
              phrase,
              function(err, response) {
              if (err)
                console.log(err);
              else {
                response = JSON.parse(response)
                predicted_class = response.top_class
                console.log(predicted_class);
              }
              classifyRequestState = REQUEST_STATE.FINISHED
              util.yield()
          });
          if(classifyRequestState == REQUEST_STATE.IDLE) {
            classifyRequestState = REQUEST_STATE.PENDING
            util.yield()
          }
        }
      }

      classify(classifier, phrase, callback) {

     request.post({
          url:     classifyURL,
          form:    { auth_user: authInfo.username, auth_pass:authInfo.password, text: phrase, classifier_id: classifier_id }
        }, function(error, response, body){
          callback(error, body);
        });
      }

      setAuthData(args) {
        authInfo.username = args.USERNAME
        authInfo.password = args.PASSWORD
      }
}

module.exports = Scratch3WatsonNlp;