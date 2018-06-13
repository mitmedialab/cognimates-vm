const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

const ajax = require('es-ajax');
const iconURI = require('./assets/sentiment_icon');

const BleIO = require("ble-io");
const BoardIO = require('board-io');
const noble = require('noble');
const util = require('util')

const notificationOptions = {icon: iconURI}
var io;
var gatt, service;

class Scratch3Arduino {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'arduino',
            name: 'Arduino 101',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connectBoard',
                    blockType: BlockType.COMMAND,
                    text: 'Connect to Arduino 101'
                },
                {
                    opcode: 'setPin',
                    blockType: BlockType.COMMAND,
                    text: 'Set pin [PIN] [SWITCH]',
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: '13'
                        },
                        SWITCH: {
                            type: ArgumentType.STRING,
                            menu: 'switch',
                            defaultValue: 'off'
                        }
                    }
                },
                {
                    opcode: 'whenPinOn',
                    blockType: BlockType.HAT,
                    text: 'When pin [PIN] is [SWITCH]',
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: '13'
                        },
                        SWITCH: {
                            type: ArgumentType.STRING,
                            menu: 'switch',
                            defaultValue: 'on'
                        }
                    }
                },
                {
                    opcode: 'pinOn',
                    blockType: BlockType.BOOLEAN,
                    text: 'Is pin [PIN] on?',
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: '13'
                        }
                    }
                }
                
            ],
            menus: {
                 pins: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
                 switch: ['on', 'off'],
                 analog: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
                 tilt: ['up', 'left', 'right', 'down']
            } 
        };
    }

    connectBoard (args, util) {
        var myNotification = new Notification('Click to Connect to Arduino', notificationOptions);
        myNotification.addEventListener('click', function(e){
            myNotification.close()
            io = new BleIO()
        })
         
    }

    setPin (args, util) {
        var pin = parseInt(args.PIN)
        var val = args.SWITCH
        console.log(io)
        io.on("ready", () => {
            console.log('ready')
            this.digitalWrite(pin,1)
        })
    }

    whenPinOn (args, util) {

    }

    pinOn (args, util) {

    }

    
}

module.exports = Scratch3Arduino;