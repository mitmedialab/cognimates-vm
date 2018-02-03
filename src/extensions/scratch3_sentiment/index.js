const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// sentiment
let sentiment = require('sentiment');
let localSentiment = 1;
let isHappy = true;
const ajax = require('es-ajax');
const iconURI = require('./assets/sentiment_icon');


class Scratch3Sentiment {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'sentiment',
            name: 'Sentiment',
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
        
        // return localSentiment;
        // ajax('https://community-sentiment.p.mashape.com/text/')
        //     .post({
        //         headers: {
        //             'X-Mashape-Key': 'Q14WJgrx19mshS8fWT4B2cUFpC8Tp1EkM80jsnoiN4lmSP7CuH'
        //         },
        //         data: {
        //             txt: text
        //         }
        //     })
        //     .then(sucess => {
        //         console.log('success', data);
        //         sentiment = data.result.sentiment;
        //         callback(sentiment);
        
        //     })
        //     .catch(err => {
        //         console.log('error', reason);
        //     });
    }

    isHappy () {
        if (localSentiment.score < 1){
            isHappy = false;
            return false;
        }
        return true;
    }
  

}

module.exports = Scratch3Sentiment;

// new (function() {
//     var ext = this;

//     // Cleanup function when the extension is unloaded
//     ext._shutdown = function() {};

//     // Status reporting code
//     // Use this to report missing hardware, plugin or unsupported browser
//     ext._getStatus = function() {
//         return {status: 2, msg: 'Ready'};
//     };

//     // Get a text from user, use Sentiment API to determine if it is positve, neutral, negative.
//     ext.get_sentiment = function(text, callback) {
//         var sentiment;

//         // Make an AJAX call to the sentiment API through using Mashape key
//         $.ajax({
//             url: "https://community-sentiment.p.mashape.com/text/",
//             method: 'post',
//             headers: {
//                 'X-Mashape-Key': 'Q14WJgrx19mshS8fWT4B2cUFpC8Tp1EkM80jsnoiN4lmSP7CuH'
//             },
//             data: {
//                 txt: text
//             },
//             success: function(data) {
//                 console.log('success', data);
//                 sentiment = data['result']['sentiment'];
//                 callback(sentiment);
//             },
//             error: function(reason) {
//                 console.log('error', reason);
//             }
//         });
//     };

//     // Use the result from get_sentiment to determine whether the user is happy or not.
//     ext.is_happy = function(sentiment){
//         var is_happy;

//         if(sentiment == 'Negative'){
//             is_happy = false;
//         }else{
//             is_happy = true;
//         }
//         console.log("is_happy", is_happy);
//         return is_happy;
//     }

//     // Block and block menu descriptions
//     var descriptor = {
//         blocks: [
//             ['R', 'get sentiment of text %s', 'get_sentiment'],
//             ['b', 'is happy %s', 'is_happy']
//         ]
//     };

//     // Register the extension
//     ScratchExtensions.register('Text Sentiment extension', descriptor, ext);
// })();
