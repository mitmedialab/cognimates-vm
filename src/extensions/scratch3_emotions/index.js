const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const RenderedTarget = require('../../sprites/rendered-target');


//socket
const request = require('request');
const SocketIO = require('socket.io-client');
const OSC = require('osc-js/lib/osc');

var osc = new OSC();
// const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() });

var emotion; 

class Scratch3Emotions {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'emotions',
            name: 'Facial Emotions',
            blocks: [
                {
                    opcode: 'startHelperSocket',
                    blockType: BlockType.COMMAND,
                    text: 'Connect to Model',
                },
                {
                    opcode: 'getFeeling',
                    BlockType: BlockType.COMMAND,
                    text: 'Get the face emotion'
                }
                
            ],
            menus: {
             	trueFalse: ['true', 'false']
            }
        };
    }

    startHelperSocket(args, util) {
        osc.open({port: 8080}); // connect by default to ws://localhost:8080
    };

    getFeeling (args, util){
        osc.on('/test', (message) => {
            console.log(message.args); // prints the message arguments
            emotion = message.args;
        });
        return emotion;
    }
}
module.exports = Scratch3Emotions;