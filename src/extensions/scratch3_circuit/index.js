const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// sentiment

const ajax = require('es-ajax');
const iconURI = require('./assets/cp_icon');


class Scratch3Circuit {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'circuitplayground',
            name: 'Circuit Playground',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'whenButtonPressed',
                    blockType: BlockType.HAT,
                    text: 'When [BUTTON] button pressed',
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu:'button',
                            defaultValue: 'left'
                        }
                    }
                },
                {
                    opcode: 'whenShaken',
                    blockType: BlockType.HAT,
                    text: 'When shaken',
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.BOOLEAN,
                            defaultValue: 'true'
                        }
                    }
                },
                {
                    opcode: 'whenTilted',
                    blockType: BlockType.HAT,
                    text: 'When tilted',
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.BOOLEAN,
                            defaultValue: 'true'
                        }
                    }
                },
                {
                    opcode: 'playNote',
                    blockType: BlockType.COMMAND,
                    text: 'Play note [name] for [time]',
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: 'A'
                        },
                        time: {
                            type: ArgumentType.STRING,
                            defaultValue: '1 sec'
                        }
                    }
                },
                {
                    opcode: 'setLEDColorHex',
                    blockType: BlockType.COMMAND,
                    text: 'Set LED color hex: [hex]',
                    arguments: {
                        hex: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'setLEDColor',
                    blockType: BlockType.COMMAND,
                    text: 'Set LED color R:[red] G:[green] B:[blue]',
                    arguments: {
                        red: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        green: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        blue: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getSlider',
                    blockType: BlockType.REPORTER,
                    text: 'Get slider values'
                },
                {
                    opcode: 'getTemperature',
                    blockType: BlockType.REPORTER,
                    text: 'Get temperature'
                },
                {
                    opcode: 'getBrightness',
                    blockType: BlockType.BOOLEAN,
                    text: 'Get brightness'
                }
            ],
            menus: {
             	button: ['left', 'right']
            }
        };
    }
    whenButtonPressed (args, util){
    }
    getBrightness (args, util){
    }
    getTemperature (args, util){
    }
    getSlider (args, util){
    }
    setLEDColor (args, util){
    }
    setLEDColorHex (args, util){
    }
    playNote (args, util){
    }
    whenShaken (args, util){
    }
    whenTilted (args, util){
    }


}

module.exports = Scratch3Circuit;

