const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const iconURI = require('./assets/wemo_icon')

class Scratch3Wemo {
    constructor (runtime) {
        this.runtime = runtime;

    }

    getInfo () {
        return {
            id: 'wemo',
            name: 'Wemo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'turnOn',
                    blockType: BlockType.COMMAND,
                    text: 'Turn [TOGGLE]',
                    arguments: {
                        TOGGLE: {
                            type: ArgumentType.STRING,
                            menu: 'toggle',
                            defaultValue: 'on'
                        }
                    }
                },
            ],
            menus: {
                toggle: ['on', 'off']
            }
        };
    }

    turnOn (args, util){
        if(args.TOGGLE === 'on'){
            request.get({url: 'http://localhost:3000/on', function(err, response){
                if (err){
                    console.log(err);
                }
                else {
                    console.log('on')
                }
            }});
        } else{
            request.get({url: 'http://localhost:3000/off', function(err, response){
                if (err){
                    console.log(err);
                }
                else {
                    console.log('off')
                }
            }});
        }   
    }   

}

module.exports = Scratch3Wemo;