const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// ergo

const iconURI = require('./assets/ergo_icon');


class Scratch3Ergo {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'ergo',
            name: 'Ergo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'getSentiment',
                    blockType: BlockType.COMMAND,
                    text: 'get sentiment of: [phrase]',
                    arguments: {
                        phrase: {
                            type: ArgumentType.STRING,
                            defaultValue: 'your text here'
                        }
                    }
                },
                {
                    opcode: 'isHappy',
                    blockType: BlockType.BOOLEAN,
                    text: 'Is the text happy?'
                }
                
            ],
            menus: {
             	trueFalse: ['true', 'false']
            }
        };
    }

    getSentiment (args, util){
        const text = args.phrase;
        localSentiment = sentiment(text);
        console.log(sentiment(text));
        if (localSentiment.score > 2){
            return "positive";
        }
        return "negative";

    }

    isHappy () {
        if (localSentiment.score < 1){
            isHappy = false;
            return false;
        }
        return true;
    }
  

}

module.exports = Scratch3Ergo;