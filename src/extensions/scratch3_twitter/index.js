const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const ajax = require('es-ajax');
const iconURI = require('./assets/twitter_icon');

let server_url = 'http://localhost:3477/twitter/call';
let output = null;

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
        var uri = 'statuses/user_timeline.json';
        var params = {uri: uri, user: user};
        this.makeCall(params,
            function(err, response) {
            if (err)
                console.log(err);
            else {
                console.log(response.body);
                output = JSON.parse(response.body);
            }});
        return output;
    }


    getTopTweet(args, util){
        var category = args.CATEGORY;
        var hashtag = encodeURIComponent(args.HASH);
        var uri = '/search/tweets';
        var params = {uri: uri, hashtag: hashtag, category: category};
        this.makeCall(params,
            function(err, response) {
            if (err)
                console.log(err);
            else {
                console.log(response.body);
                output = JSON.parse(response.body);
            }});
        return output;
        
    }

    makeCall(params, callback){
        var uri = params.uri;
        if(params.user){
            var user = params.user;
            request.post({
                url: server_url,
                form: { uri: uri, user: user}
                }, function(err, response){
                    callback(err, response);
                });
        } else{
            var category = params.category;
            var hashtag = params.hashtag;
            request.post({
                url: server_url,
                form: { uri: uri, hashtag: hashtag, category: category}
                }, function(err, response){
                    callback(err, response);
                });
        }
    }

}

module.exports = Scratch3Twitter;