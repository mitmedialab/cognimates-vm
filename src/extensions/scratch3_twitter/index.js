const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const ajax = require('es-ajax');
const iconURI = require('./assets/twitter_icon');
const nets = require('nets');

class Scratch3Twitter {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'twitter',
            name: 'Twitter',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'latestUserTweet',
                    blockType: BlockType.REPORTER,
                    text: 'Get the latest tweet from @[USER]',
                    arguments:{
                        USER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'medialab'
                        }
                    }
                },
                {
                    opcode: 'getTopTweet',
                    blockType: BlockType.REPORTER,
                    text: 'Most [CATEGORY] tweet containing #[HASH]',
                    arguments:{
                        CATEGORY:{
                            type: ArgumentType.STRING,
                            menu: 'categories',
                            defaultValue: 'recent'
                        },
                        HASH:{
                            type: ArgumentType.STRING,
                            defaultValue: 'cognimates'
                        }
                    }
                }
                
            ],
            menus: {
             	categories: ['recent', 'popular']
            }
        };
    }

    latestUserTweet(args, util) {
        var user = args.USER;
        request.get({url: 'http://scratchx-twitter.herokuapp.com/1.1/statuses/user_timeline.json', 
                    data: { screen_name: user, count: 1}, 
                    function(err, response){
                        if (err){
                            console.log(err);
                        }
                        else {
                            data = JSON.parse(response);
                            console.log(data);
                            return data[0].text;
                        }
        }});
    }

    getTopTweet(args, util){
        var category = args.CATEGORY;
        var hashtag = encodeURIComponent(args.HASH);
        request.get({ url: "http://scratchx-twitter.herokuapp.com/1.1/search/tweets.json",
                    data: { q: hashtag, result_type: category, count: 1} ,
                    function(err, response){
                        if (err){
                            console.log(err);
                        }
                        else {
                            data = JSON.parse(response);
                            console.log(data);
                            return data.statuses[0].text;
                        }
        }});
    }

}

module.exports = Scratch3Twitter;