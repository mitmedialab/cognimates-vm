const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// muse

// var nodeMuse = require('node-muse');
// var Muse = nodeMuse.Muse;
// var OSC = nodeMuse.OSC;
const ajax = require('es-ajax');
const iconURI = require('./assets/muse_icon');


class Scratch3Muse {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'muse',
            name: 'Muse',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: 'Connect Muse'
                },
                {
                    opcode: 'museBlink',
                    blockType: BlockType.COMMAND,
                    text: 'Blink detector'
                },
                {
                    opcode: 'museEeg',
                    blockType: BlockType.COMMAND,
                    text: 'Eeg reader'
                },
                {
                    opcode: 'getSignal',
                    blockType: BlockType.REPORTER,
                    text: 'What signal do you want to read: [TEXT]?',
                    arguments: {
                        TEXT: {
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

    connect(args, util){
    }
  
    museBlink (args, util) {
        if (blink == 'positive'){
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

    museEeg(){

    }
    getSignal (args, util) {
     
    }
}

module.exports = Scratch3Muse;