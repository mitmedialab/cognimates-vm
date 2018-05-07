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
let feeling;
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
                    opcode: 'whenNeutral',
                    blockType: BlockType.HAT,
                    text: 'When text is neutral'
                },
                {
                    opcode: 'getFeeling',
                    blockType: BlockType.REPORTER,
                    text: 'What is the feeling of the text: [phrase]?',
                    arguments: {
                        phrase: {
                            type: ArgumentType.STRING,
                            defaultValue: 'your text here'
                        }
                    }
                }
                
            ],
            menus: {
             	trueFalse: ['true', 'false']
            }
        };
    }

    getFeeling (args, util){
        const text = args.phrase;
        localSentiment = sentiment(text);
        console.log(sentiment(text));
        if (localSentiment.score > 2){
            feeling = 'positive';
        } else if (localSentiment.score < 0){
            feeling = 'negative';
        } else {
            feeling = 'neutral';
        }
        return feeling;
        
    }
  
    whenPositive (args, util) {
        if (feeling == 'positive'){
            return true;
        }
        return false;
    }
    
    whenNegative (args, util) {
        if (feeling == 'negative'){
            return true;
        }
        return false;         
    }

    whenNeutral (args, util) {
        if (feeling == 'neutral'){
            return true;
        }
        return false;
    }
}

module.exports = Scratch3Sentiment;