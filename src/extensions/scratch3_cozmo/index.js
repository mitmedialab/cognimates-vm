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
let emotionsArray={happy: "happy", sad: "sad", shocked :"shocked", confused: "confused", upset: "upset", bored: "bored"};
let actionsArray ={shiver:'shiver', fistbump:'fistbump', hiccup:'hiccup'};
let action;
let angleArray={"90": "90", "180": "180", "-90": "-90", "-180": "-180"};
var CMD_SPEAK = 0x01,
  CMD_DRIVE = 0x02,
  CMD_STOP = 0x03,
  CMD_TURN = 0x04,
  CMD_PICKUP_BLOCK = 0x05,
  CMD_SET_BLOCK = 0x06,
  CMD_LOOK = 0x07,
  CMD_ACTION = 0x10;
var robotList = { robot1 : '8765',
  robot2 : '8766',
  robot3 : '8767'
  };

const blockWaitTime = 1000

function  delayBlock(time, callback) {
    setTimeout(callback, time)
  }

function getPromise(context, time, key) {
    var _this = context
    let promise = new Promise((resolve) => {
      _this._startTime[key] = new Date().getTime()
      console.log(_this._startTime[key]);
      delayBlock(time, () => {
        console.log(new Date().getTime() - _this._startTime[key]);
        _this._startTime[key] = undefined
        resolve()
      })
    })
    promise.then((result) => result)
    return promise
  }

class Scratch3Cozmo {
    constructor (runtime) {
        this.runtime = runtime;
        this._startTime = {}
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
                    opcode: 'performAction',
                    blockType: BlockType.COMMAND,
                    text: 'Perform [ACTION]',
                    arguments:{
                        ACTION: {
                            type:ArgumentType.NUMBER,
                            menu: 'actions',
                            defaultValue: 'shiver'
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
                emotions: ['happy', 'sad', 'shocked', 'thinking', 'upset', 'bored'],
                actions: ['shiver', 'fistbump', 'hiccup'],
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
        var key = "speak"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
            socket.send(CMD_SPEAK + "," + args.phrase);
            return getPromise(this, blockWaitTime, key)
    };

    forward () {
        var key = "forward"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
          socket.send(CMD_DRIVE + "," + 50);990
          return getPromise(this, blockWaitTime, key)
    };

    reverse () {
        var key = "reverse"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
          socket.send(CMD_DRIVE + "," + -50);
          return getPromise(this, blockWaitTime, key)
    };

    stop () {
        var key = "stop"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
            socket.send(CMD_STOP);
            return getPromise(this, blockWaitTime, key)
    };

    turn (args) {
        var key = "turn"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key])  < blockWaitTime) {
          return
        }
        if (connected) {
            const current = args.ANGLE;
            deg = angleArray[current];
            if (deg > 360) deg = 360;
            else if (deg < -360) deg = -360;
            socket.send(CMD_TURN + "," + deg);
            return getPromise(this, blockWaitTime, key)
        }
    };

    pickupBlock () {
        var key = "pickup"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
            socket.send(CMD_PICKUP_BLOCK);
            return getPromise(this, blockWaitTime, key)
    };


    setBlock () {
        var key = "setblock"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected)
            socket.send(CMD_SET_BLOCK);
            return getPromise(this, blockWaitTime, key)
    };


    express (args) {
        var key = "express"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
          return
        }
        if (connected){
            const emo = args.EMOTION;
            expression = emotionsArray[emo];
            socket.send(CMD_LOOK + "," + expression);
            return getPromise(this, blockWaitTime, key)
        }
    };

    performAction(args) {
        var key = "performAction"
        let currentTime = new Date().getTime()
        if (this._startTime[key] != undefined && (currentTime - this._startTime[key]) < blockWaitTime) {
            return
        }
        if (connected){
            const act = args.ACTION;
            action = actionsArray[act];
            socket.send(CMD_ACTION + "," + action);
            return getPromise(this, blockWaitTime, key)
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
