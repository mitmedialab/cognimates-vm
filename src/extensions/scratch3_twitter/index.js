const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

//twitter vars 
const ajax = require('es-ajax');
const iconURI = require('./assets/twitter_icon');
// let server_url = 'http://cognimate.me:3276/twitter/call';
let server_url = 'https://cognimate.me:3276/twitter/call';
let output = null;
let top_output = null;

const REQUEST_STATE = {
    IDLE: 0,
    PENDING: 1,
    FINISHED: 2
  };
let classifyRequestState = REQUEST_STATE.IDLE;

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
        if (this._lastUser === user &&
            this._lastResult !== null) {
            return this._lastResult;
        }
        this._lastUser = user;
        const _this = this;
        var uri = 'statuses/user_timeline.json';
        var params = {uri: uri, user: user};
        let promise = new Promise((resolve)=>{
        this.makeCall(params,
            function(err, response) {
            if (err){
                console.log(err);
                this._lastResult = '';
                resolve('');
            }
            else {
                console.log(response.body);
                output = JSON.parse(response.body);
                _this._lastResult = output;
                resolve(output);
            }});
        });
        promise.then(output => output);
        return promise
    }


    getTopTweet(args, util){
        if(classifyRequestState == REQUEST_STATE.FINISHED) {
            classifyRequestState = REQUEST_STATE.IDLE;
            return top_output;
          }
          if(classifyRequestState == REQUEST_STATE.PENDING) {
            util.yield()
          }
          if(classifyRequestState == REQUEST_STATE.IDLE) {
            var hashtag = encodeURIComponent(args.HASH);
            var uri = '/search/tweets';
            var category = args.CATEGORY;
            var params = {uri: uri, hashtag: hashtag, category: category};
            this.makeCall(params,
                function(err, response) {
                if (err){
                    console.log(err);
                }
                else {
                    console.log(response.body);
                    top_output = JSON.parse(response.body);
                    classifyRequestState = REQUEST_STATE.FINISHED;
                }});
            if(classifyRequestState == REQUEST_STATE.IDLE) {
                classifyRequestState = REQUEST_STATE.PENDING;
                util.yield();
            }
          }
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