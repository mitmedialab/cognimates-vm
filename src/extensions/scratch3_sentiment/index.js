const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// sentiment
const sentiment = require('sentiment');
let localSentiment = 1;
let isHappy;
const ajax = require('es-ajax');
const iconURI = require('./assets/sentiment_icon');


class Scratch3Sentiment {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'sentiment',
            name: 'Feeling',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'whenPositive',
                    blockType: BlockType.HAT,
                    text: 'When text is positive'
                },
                {
                    opcode: 'whenNegative',
                    blockType: BlockType.HAT,
                    text: 'When text is negative'
                },
                {
                    opcode: 'getSentiment',
                    blockType: BlockType.COMMAND,
                    text: 'What is the feeling of the text: [phrase]?',
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
            return 'positive';
            isHappy = true;
        }
        return 'negative';
        isHappy = false;
    }

    isHappy () {
        if (localSentiment.score < 1){
            isHappy = false;
            return isHappy;
        }
        isHappy = true;
        return isHappy;
    }
  
    whenPositive (args, util) {
        if (localSentiment.score > 2){
            return true;
        }
        return false;
    }
    
    whenNegative (args, util) {
        if (localSentiment.score < 1){
            return true;
        }
        return false;         
    }
}

module.exports = Scratch3Sentiment;