const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const ajax = require('es-ajax');
const iconURI = require('./assets/twitter_icon');
const dotenv = require('dotenv').config()
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

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
        var params = {screen_name: user, count:1};
        /*
        client.get('statuses/user_timeline.json', params, 
            function(error, tweet, response){
                if(err){console.logg(err)}
                console.log(tweet);
        });*/
        request.get({url:'https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/search/tweets.json?q=nasa&result_type=popular', 
                    headers: data,
                    function(err, response){
                        if (err){
                            console.log(err);
                        }
                        else {
                            console.log(response)
                        }
                    }});
    }

    getTopTweet(args, util){
        var category = args.CATEGORY;
        var hashtag = encodeURIComponent(args.HASH);
        var params = {q: hashtag, result_type: category, count: 1}
        request.get("/search/tweets", params,
            function(err, tweet, response){
                if (err){
                    console.log(err);
                }
                console.log(tweet);
        });
    }

}

module.exports = Scratch3Twitter;