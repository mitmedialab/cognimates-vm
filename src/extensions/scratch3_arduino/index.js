const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

const ajax = require('es-ajax');
const iconURI = require('./assets/sentiment_icon');

const notificationOptions = {icon: iconURI}
const arduinoService = "a56ada00-ed09-11e5-9c97-0002a5d5c51b"
//const arduinoService = "20b10010-e8f2-537e-4f6c-d104768a1214"
const digitalChar = "a56ada04-ed09-11e5-9c97-0002a5d5c51b"
//const digitalChar = "19b10011-e8f2-537e-4f6c-d104768a1214"

const pinChar = "a56ada04-ed09-11e5-9c97-0002a5d5c51b"

//const io = require('socket.io-client');
//const  socket = io.connect('http://localhost:3000');

var board, led;
var gatt, service;
var digitalOutputData = new Uint8Array(16);
var PIN_MODE = 0xF4;
var TOTAL_PIN_MODES = 13;
var DIGITAL_MESSAGE = 0x90;
var INPUT = 0x00;
var OUTPUT = 0x01
var pinModes = [];


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
                    opcode: 'digitalWrite',
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

    _hasCapability(pin, mode) {
        if (pinModes[mode].indexOf(pin) > -1)
            return true;
        else    
            return false;
    }

    _pinMode(pin, mode) {
        var msg = new Uint8Array([PIN_MODE, pin, mode]);
        device.send(msg.buffer);
    }


    connectBoard (args, util) {
        for (var i = 0; i < TOTAL_PIN_MODES; i++) pinModes[i] = [];
        var myNotification = new Notification('Click to Connect to Arduino', notificationOptions);
        myNotification.addEventListener('click', function(e){
            myNotification.close()
            const device = navigator.bluetooth.requestDevice({
                filters: [{ services: [arduinoService] }]
            }).then(device => {
                gatt = device.gatt.connect()
                console.log('connected')
                return gatt
            }).then(gatt=> {
                service = gatt.getPrimaryService(arduinoService)
                return service
            }).then(service => {
                var chars = service.getCharacteristics(digitalChar)
                var pins = service.getCharacteristics(pinChar)
                return chars
            }).then(chars => {
                console.log(chars)
                var pinCharacteristic = chars[0];
                console.log('pin char',pinCharacteristic[1])
                var bufferToSend = new Buffer(1);
                var byte = 0;
                setInterval(function() {
                    bufferToSend.writeUInt8((byte ^= 1)); // you can pass this any integer, we just do this to alternate 0/1
                    ledCharacteristic.writeValue(bufferToSend, false);
                 }, 1000);
            })
        });
    }

    digitalWrite (args, util) {
        var pin = parseInt(args.PIN)
        var val = args.SWITCH

        if (!this._hasCapability(pin, OUTPUT)) {
            console.log('ERROR: valid output pins are ' + pinModes[OUTPUT].join(', '))
            return;
        }
        var portNum = (pin >> 3) & 0x0F;
        if (val == 'off') 
            digitalOutputData[portNum] &= ~(1 << (pin & 0x07));
        else    
            digitalOutputData[portNum] |= (1 << (pin & 0x07));
        this._pinMode(pin, OUTPUT);
        var msg = new Uint8Array([
            DIGITAL_MESSAGE | portNum,
            digitalOutputData[portNum] & 0x7F,
            digitalOutputData[portNum] >> 0x07
        ]);
        device.send(msg.buffer);
    }

    whenPinOn (args, util) {

    }

    pinOn (args, util) {

    }
}

module.exports = Scratch3Arduino;