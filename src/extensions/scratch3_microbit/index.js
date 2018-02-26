const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// sentiment

const ajax = require('es-ajax');
const iconURI = require('./assets/microbit_icon');


class Scratch3Microbit {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'microbit',
            name: 'Microbit',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'whenButtonPressed',
                    blockType: BlockType.HAT,
                    text: 'When button pressed',
                    arguments: {
                        button: {
                            type: ArgumentType.BOOLEAN,
                            defaultValue: 'false'
                        }
                    }
                },
                {
                    opcode: 'whenMoved',
                    blockType: BlockType.HAT,
                    text: 'When moved'
                },
                {
                    opcode: 'whenShaken',
                    blockType: BlockType.HAT,
                    text: 'When shaken'
                },
                {
                    opcode: 'whenJumped',
                    blockType: BlockType.HAT,
                    text: 'When jumped'
                },
                {
                    opcode: 'whenPinConnected',
                    blockType: BlockType.HAT,
                    text: 'when pin [PIN] connected',
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            // menu:'pins',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'whenTilted',
                    blockType: BlockType.HAT,
                    text: 'When tilted [DIRECTION]',
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: "directions",
                            defaultValue: 'any'
                        }
                    }
                },
                {
                    opcode: 'tiltAngle',
                    blockType: BlockType.REPORTER,
                    text: 'Tilt angle?'
                },
                {
                    opcode: 'displayText',
                    blockType: BlockType.COMMAND,
                    text: 'Display [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        }
                    }
                },
                {
                    opcode: 'setMatrixLED',
                    blockType: BlockType.COMMAND,
                    text: 'set light x:[X] y:[Y] [STATE]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        STATE: {
                            type: ArgumentType.STRING,
                            menu:'state',
                            defaultValue: 'On'
                        },

                    }
                },
                {
                    opcode: 'clearAllMatrixLEDs',
                    blockType: BlockType.COMMAND,
                    text: 'Set all lights off'
                }
                
            ],
            menus: {
                 trueFalse: ['True', 'False'],
                 directions:['Right', 'Left', 'Up', 'Down'],
                //  pins:[1,2,3,4],
                 state: ['On', 'Off']
            }
        };
    }

    whenButtonPressed (args, util){
    }

    clearAllMatrixLEDs (args, util){
    }

    setMatrixLED (args, util){
    }

    tiltAngle (args, util){
    }

    whenTilted (args, util){
    }

    whenJumped (args, util){
    }

    whenShaken (args, util){
    }

    whenMoved (args, util){
    }

    displayText(){

    }
    whenPinConnected (args, util){
    }
  

}

module.exports = Scratch3Microbit;