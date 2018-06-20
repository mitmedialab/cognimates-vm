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

let classifier_id = 'ab2c7bx342-nlc-1109'
let classifyRequestState = REQUEST_STATE.IDLE
let predicted_class = null

let gatewayURL = 'https://gateway.watsonplatform.net/natural-language-classifier/api'
let classifyURL = `https://cognimate.me:3477/nlc/classify`

//models and their classifier_ids
const modelDictionary = {
    'good_bad': 'ab2c7bx342-nlc-1109'
}


let authInfo = {
  username: 'b2580e82-8b43-4ff0-9162-6f2798e90381',
  password: 'o6Q6r2uRhtws'
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

class Scratch3WatsonNLCBlocks{
    constructor (runtime) {
        this.runtime = runtime;

    }

    getInfo () {
        return {
            id: 'watsonNlc',
            name: 'Text',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'setAuthData',
                    blockType: BlockType.COMMAND,
                    text: 'Enter your username [USERNAME] and password [PASSWORD]',
                    arguments: {
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                            //3c175df7-5d3e-42c0-9458-cd723829c915
                        },
                        PASSWORD: {
                          type: ArgumentType.STRING,
                          defaultValue: ''
                          //hfYTqyeWp3rL
                        }
                    }
                },
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
                            defaultValue: 'add your model id here'
                            // 2fbda2x327-nlc-1430
                        }
                    }
                },
                {
                    opcode: 'getResult',
                    blockType: BlockType.REPORTER,
                    text:'What kind of text is this [PHRASE]?',
                    arguments: {
                        PHRASE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'my day was awesome'
                        }
                    }
                },
                {
                  opcode: 'whenResultIs',
                  blockType: BlockType.HAT,
                  text: 'When text is [LABEL]',
                  arguments: {
                    LABEL: {
                      type: ArgumentType.STRING,
                      defaultValue: 'good'
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

    getResult(args, util) {
        let phrase = args.PHRASE;
        if (this._lastPhrase === phrase &&
            this._lastResult !== null) {
            return this._lastResult;
        }
        this._lastPhrase = phrase;
        const _this = this;
        let promise = new Promise((resolve) => {
          console.log(phrase);
          this.classify(classifier_id,
                phrase,
                function(err, response) {
                if (err) {
                  console.log(err);
                  _this._lastResult = '';
                  resolve('');
                } else {
                  response = JSON.parse(response);
                  predicted_class = response.top_class;
                  _this._lastResult = predicted_class;
                  console.log(predicted_class);
                  resolve(predicted_class);
                }
            });
        })
        promise.then(predicted_class => predicted_class);
        console.log(predicted_class);
        return promise;
    }

    classify(classifier, phrase, callback) {
        console.log('here')
        request.post({
            url:     classifyURL,
            form:    { auth_user: authInfo.username, auth_pass:authInfo.password, text: phrase, classifier_id: classifier_id }
        }, function(error, response, body){
            callback(error, body);
        });
      }

    setAuthData(args) {
      authInfo.username = args.USERNAME;
      authInfo.password = args.PASSWORD;
    }

    whenResultIs(args, util) {
      let label = args.LABEL
      if(label.length == 0 || predicted_class == null) {
        console.log(label, predicted_class);
        return
      }
      if(label == predicted_class) {
        console.log('Matched');
        return true
      } else{
        console.log('No match', label, predicted_class);
        return false
      }
    }

}

module.exports = Scratch3WatsonNLCBlocks;
