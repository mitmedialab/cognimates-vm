const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const RenderedTarget = require('../../sprites/rendered-target');


//socket
const request = require('request');
const SocketIO = require('socket.io-client');

// cozmo

const iconURI = require('./assets/cozmo_icon');
var device = null;
var connected = false;
var socket = null;
var rawData = null;
var shutdown = false;
let deg = 0;
let expression = "happy";
let emotionsArray={happy: "happy", sad: "sad", shocked :"shocked", surprised: "surprised", bored: "bored"};
let angleArray={"90": "90", "180": "180", "-90": "-90", "-180": "-180"};
var CMD_SPEAK = 0x01,
  CMD_DRIVE = 0x02,
  CMD_STOP = 0x03,
  CMD_TURN = 0x04,
  CMD_PICKUP_BLOCK = 0x05,
  CMD_SET_BLOCK = 0x06,
  CMD_LOOK = 0x07;
var robotList = { robot1 : '8765',
  robot2 : '8766',
  robot3 : '8767' 
  };


class Scratch3Cozmo {
    constructor (runtime) {
        this.runtime = runtime;
  
    }
    getInfo () {
        return {
            id: 'cozmo',
            name: 'Cozmo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'speak',
                    blockType: BlockType.COMMAND,
                    text: 'Speak: [phrase]',
                    arguments: {
                        phrase: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'pickupBlock',
                    blockType: BlockType.COMMAND,
                    text: 'Pick up block'
                },
                {
                    opcode: 'setBlock',
                    blockType: BlockType.COMMAND,
                    text: 'Set down block'
                },
                {
                    opcode: 'forward',
                    blockType: BlockType.COMMAND,
                    text: 'Forward'
                },
                {
                    opcode: 'reverse',
                    blockType: BlockType.COMMAND,
                    text: 'Reverse'
                },
                {
                    opcode: 'stop',
                    blockType: BlockType.COMMAND,
                    text: 'Stop'
                },
                {
                    opcode: 'turn',
                    blockType: BlockType.COMMAND,
                    text: 'Turn [ANGLE] degrees',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            menu: 'angle',
                            defaultValue: '90'
                        }
                    }
                },
                {
                    opcode: 'express',
                    blockType: BlockType.COMMAND,
                    text: 'Look [EMOTION]',
                    arguments: {
                        EMOTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'emotions',
                            defaultValue: 'happy'
                        }
                    }
                },
                {
                    opcode: 'startHelperSocket',
                    blockType: BlockType.COMMAND,
                    text: 'Connect to robot',
                    // arguments: {
                    //     ROBOT: {
                    //         type: ArgumentType.String,
                    //         menu: 'robots',
                    //         defaultValue: 'robot1'
                    //     }
                    // }
                }
                
            ],
            menus: {
                robots: ['robot1', 'robot2', 'robot3'],
                emotions: ['happy', 'sad', 'shocked','surprised','bored'],
                angle:['90','180','-90', '-180']
            }
        };
    }


    startHelperSocket(args, util) {
        socket = new WebSocket('ws://127.0.0.1:8765');
        socket.onopen = function(event) {
          console.log('socket opened');
          connected = true;
        };
    
        socket.onclose = function(event) {
          connected = false;
          socket = null;
          if (!shutdown)
            setTimeout(startHelperSocket, 2000);
        };
    
        socket.onmessage = function(event) {
          console.log(event.data);
        };
    };
    
    sendHelper (buffer) {
        setTimeout(function() {
        socket.send(buffer);
        }, 0);
    };
    
    speak (args) {
        if (connected)
            socket.send(CMD_SPEAK + "," + args.phrase);
    };

    forward () {
        if (connected)
          socket.send(CMD_DRIVE + "," + 50);
    };
    
    reverse () {
        if (connected)
        socket.send(CMD_DRIVE + "," + -50);
    };
    
    stop () {
       if (connected)
          socket.send(CMD_STOP);
    };

    turn (args) {
        if (connected) {
            const current = args.ANGLE;
            deg = angleArray[current];
            if (deg > 360) deg = 360;
            else if (deg < -360) deg = -360;
            socket.send(CMD_TURN + "," + deg);
        }
    };

    pickupBlock () {
        if (connected)
            socket.send(CMD_PICKUP_BLOCK);
    };
    
    setBlock () {
        if (connected)
            socket.send(CMD_SET_BLOCK);
    };

    express (args) {
        if (connected){
            const emo = args.EMOTION;
            expression = emotionsArray[emo];
            socket.send(CMD_LOOK + "," + expression);
        }
    };

    _shutdown () {
        shutdown = true;
        socket.close()
        socket = null;
        device = null;
    };

    _getStatus () {
        if(!connected) return {status: 1, msg: 'Cozmo disconnected'};
        return {status: 2, msg: 'Cozmo connected'};
    }

}

module.exports = Scratch3Cozmo;

