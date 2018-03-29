const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
let connected = false;
const Bundle = null;
const socket = null;

//const iconURI = require('./assets/watson_icon');

// watson
var watson = require('watson-developer-cloud');
//text to speech
const speech = require('speech-synth');
const voiceArray = {Albert: 'Albert',
    Agnes: 'Agnes',
    Veena: 'Veena',
    Alex: 'Alex',
    Alice: 'Alice',
    Alva: 'Alva',
    Amelie: 'Amelie',
    Anna: 'Anna',
    Banh: 'Bahh',
    Bells: 'Bells',
    Boing: 'Boing',
    Bruce: 'Bruce',
    Bubbles: 'Bubbles',
    Carmit: 'Carmit',
    Cellos: 'Cellos',
    Damayanti: 'Damayanti',
    Daniel: 'Daniel',
    Deranged: 'Deranged',
    Diego: 'Diego',
    Elle: 'Ellen',
    Fiona: 'Fiona',
    Fred: 'Fred',
    Hysterical: 'Hysterical',
    Ioana: 'Ioana',
    Joana: 'Joana'};
let voice = 'Alice';

class Scratch3Speech {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'speech',
            name: 'Speech',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'textToSpeech',
                    blockType: BlockType.COMMAND,
                    text: 'say [phrase]',
                    arguments: {
                        phrase: {
                            type: ArgumentType.STRING,
                            defaultValue: 'your text here'
                        }
                    }
                },
                {
                    opcode: 'setVoice',
                    blockType: BlockType.COMMAND,
                    text: 'Set voice to [VOICE]',
                    arguments: {
                        VOICE:{
                            type: ArgumentType.STRING,
                            menu: 'voices',
                            defaultValue: 'Alice'
                        }
                    }
                },
                {
                    opcode: 'speechToText',
                    blockType: BlockType.COMMAND,
                    text: 'your [RECORDING]',
                    arguments: {
                            RECORDING:{
                                type: ArgumentType.STRING, 
                                defaultValue: 'recording'
                            }
                    }
                }  
            ],
            menus: {
                voices: ['Veena', 'Agnes', 'Albert', 'Alex', 'Alice', 'Alva', 'Amelie', 'Anna', 'Bahh', 'Bells', 'Boing', 'Bruce', 'Bubbles', 'Carmit', 'Cellos', 'Damayanti',
                    'Daniel', 'Deranged', 'Diego', 'Ellen', 'Fiona', 'Fred', 'Hysterical', 'Ioana', 'Joana']
            }
        };
    }

    textToSpeech(args, util){
        speech.say(args.phrase, voice);
    }

    speechToText(args, util){
        var recording = args.RECORDING
    }
  

}

module.exports = Scratch3Speech;