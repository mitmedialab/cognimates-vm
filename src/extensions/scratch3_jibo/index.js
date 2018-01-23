const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const ip_module = require('ip');

var connected = false;
var Bundle = null;
var socket = null;

var headTouches = null;
var headTouchCount = 0;
var headTouchTimer;
var handOn;

var screenTouchTimer;
var screenTouched = false;
var screenVector = {};
var personCount = 0;
var personVector = null;
var lastPersonVector = null;
var motionCount = 0;
var motionVector = null;
var lastMotionVector = null;

var blinkCallback = null;
var lookAtCallback = null;
var lookAtAngleCallback = null;
var speakCallback = null;
var askQuestionCallback = null;
var ringColorCallback = null;
var animationCallback = null;
var captureImageCallback = null;
var showImageCallback = null;
var hideImageCallback = null;

var metadata = null;
var ip = "http://18.85.39.50:8888/";

const iconURI = 'data:image/png;base64,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';


/**
 * Class for the alexa-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3Jibo {

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        // this.runtime. getEditingTarget get blocks here 
        this.setIPVariable(this.getLocalIP());
        // debugger;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'jibo',
            name: 'Jibo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'isScreenTouched',
                    blockType: BlockType.BOOLEAN,
                    text: 'Screen is touched?'
                },
                {
                    opcode: 'onHeadTouch',
                    blockType: BlockType.HAT,
                    text: 'On head [action]',
                    arguments: {
                        action: {
                            type: ArgumentType.STRING,
                            menu: 'headTouchList',
                            defaultValue: 'head'
                        }
                    }
                },
                {
                    opcode: 'connectToJibo',
                    blockType: BlockType.COMMAND,
                    text: 'Connect to Jibo at [host]',
                    arguments: {
                        host: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ws://18.85.39.50:8888/'
                        }
                    }
                },
                {
                    opcode: 'blink',
                    blockType: BlockType.COMMAND,
                    text: 'Jibo blink',
                },
                {
                    opcode: 'speak',
                    blockType: BlockType.COMMAND,
                    text: 'Say: [phrase]',
                    arguments: {
                      phrase: {
                        type: ArgumentType.STRING,
                        defaultValue: 'hey'
                      }
                    }
                },
                {
                    opcode: 'askQuestion',
                    blockType: BlockType.COMMAND,
                    text: 'Ask [question]',
                    arguments: {
                      question: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                      }
                    }
                },
                {
                    opcode: 'setLEDColorHex',
                    blockType: BlockType.COMMAND,
                    text: 'Set LED color hex: [hex]',
                    arguments: {
                      hex: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
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
                    opcode: 'lookAtAngle',
                    blockType: BlockType.COMMAND,
                    text: 'Look at: [direction]',
                    arguments: {
                      direction: {
                        direction: ArgumentType.STRING,
                        menu: 'lookAt',
                        defaultValue: 'center'
                      }
                    }
                },
                {
                    opcode: 'lookAt',
                    blockType: BlockType.COMMAND,
                    text: 'Look at: x: [x] y: [y] z: [z]',
                    arguments: {
                      x: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                      },
                      y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                      },
                      z: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                      }
                    }
                },
                {
                    opcode: 'setAttention',
                    blockType: BlockType.COMMAND,
                    text: 'Turn attention: [attention]',
                    arguments: {
                      attention: {
                        type: ArgumentType.STRING,
                        menu: 'onOff',
                        defaultValue: 'on'
                      }
                    }
                },
                {
                    opcode: 'playAnimation',
                    blockType: BlockType.COMMAND,
                    text: 'Play [filePath]',
                    arguments: {
                      filePath: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                      }
                    }
                },
                {
                    opcode: 'captureImage',
                    blockType: BlockType.COMMAND,
                    text: 'Take photo, save as: [fileName]',
                    arguments: {
                      fileName: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                      }
                    }
                },
                {
                    opcode: 'showPhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Show [fileName]',
                    arguments: {
                      fileName: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                      }
                    }
                },
                {
                    opcode: 'hidePhoto',
                    blockType: BlockType.COMMAND,
                    text: 'Hide image'
                },
                {
                    opcode: 'playAudio',
                    blockType: BlockType.COMMAND,
                    text: 'Play audio [name]',
                    arguments: {
                      name: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                      }
                    }
                },
                {
                    opcode: 'getMotionCount',
                    blockType: BlockType.REPORTER,
                    text: 'moving objects'
                },
                {
                    opcode: 'getMotionVectorX',
                    blockType: BlockType.REPORTER,
                    text: 'motion x'
                },
                {
                    opcode: 'getMotionVectorY',
                    blockType: BlockType.REPORTER,
                    text: 'motion y'
                },
                {
                    opcode: 'getMotionVectorZ',
                    blockType: BlockType.REPORTER,
                    text: 'motion z'
                },
                {
                    opcode: 'getPersonCount',
                    blockType: BlockType.REPORTER,
                    text: 'number of people'
                },
                {
                    opcode: 'getPersonVectorX',
                    blockType: BlockType.REPORTER,
                    text: 'person z'
                },
                {
                    opcode: 'getPersonVectorY',
                    blockType: BlockType.REPORTER,
                    text: 'person y'
                },
                {
                    opcode: 'getPersonVectorZ',
                    blockType: BlockType.REPORTER,
                    text: 'person z'
                },
                {
                    opcode: 'getScreenVectorX',
                    blockType: BlockType.REPORTER,
                    text: 'Screen vector X'
                },
                {
                    opcode: 'getScreenVectorY',
                    blockType: BlockType.REPORTER,
                    text: 'Screen vector Y'
                }
            ]
            ,
            menus: {
              lookAt: ['left', 'right', 'center', 'back'],
              trueFalse: ['true', 'false'],
              onOff: ['ON', 'OFF'],
              vectorDimensions2D: ['x' , 'y'],
              vectorDimensions3D: ['x' , 'y', 'z'],
              headTouchList: ['tapped', 'tickled', 'held']
            }
        };
    }


    setupSocket() {

      var _this = this;
      socket.addEventListener('open', function() {
         console.log('Connected to jibo app frame');
      });

      socket.addEventListener('message', function (message) {
        message = JSON.parse(message.data);
        if(message.name == "blockly.robotList") {
          if(message.type == "robotlist") {
            if(message.data.names.length > 0) {
              connected = true;
            }
          }
        } else {
          if(message.type == 'event') {
            if(message.payload.type == "screen-touch") {
              screenVector = message.payload.data;
              screenTouched = true;
              if (screenTouchTimer) {
                  clearTimeout(screenTouchTimer);
              }
              screenTouchTimer = setTimeout(resetScreenTouch,1000);
            } else if(message.payload.type == "lps-summary") {
              personCount = message.payload.data.personCount;
              personVector = message.payload.data.personVector;
              motionCount = message.payload.data.motionCount;
              motionVector = message.payload.data.motionVector;
            } else if(message.payload.type == "head-touch") {
              headTouches = message.payload.touches;
              headTouchCount += 1;
              handOn = JSON.stringify(headTouches).indexOf('true') >= 0;
              if (!headTouchTimer) {
                  headTouchTimer = setTimeout(() => {
                      resetHeadTouch();
                  } ,1000);
              }
            }
          } else if(message.type == "transaction") {
            _this.handleTransaction(message.status, message.payload);
          }
        }
        console.log(message);
      });
    }

    handleTransaction (status, payload) {
      switch(payload.id) {
        case "a8oqmako5jup9jkujjhs8n":
          if(blinkCallback != null) {
            blinkCallback = null;
          }
          break;
        case "rkj7naw3qhoeqqx75qie8p":
          if(ringColorCallback != null) {
            ringColorCallback = null;
          }
          break;
        case "luzbwwsphl5yc5gd35ltp":
          if(lookAtCallback != null) {
            lookAtCallback = null;
          }
          break;
        case "gyv2w5gmd1fx3dsi1ya2q":
          if(lookAtAngleCallback != null) {
            lookAtAngleCallback = null;
          }
          break;
        case "37puq9rz3u9dktwl4dta3f":
          if(lookAtAngleCallback != null) {
            lookAtAngleCallback = null;
          }
          break;
        case "x2xbfg17pfe7ojng9xny5l":
          if(lookAtAngleCallback != null) {
            lookAtAngleCallback = null;
          }
          break;
        case "rdar1z5itp854npicluamx":
          if(lookAtAngleCallback != null) {
            lookAtAngleCallback = null;
          }
          break;
        case "fnqo3l6m1jjcrib7sz0xyc":
          if(animationCallback != null) {
            animationCallback = null;
          }
          break;
        case "8iziqydahmxoosr78pb8zo":
          if(speakCallback != null) {
            speakCallback = null;
          }
          break;
        case "mnvwvc6ydbjcfg60u5ou":
          if(askQuestionCallback != null) {
            askQuestionCallback = null;
          }
          break;
        case "ir49rvv4v42nm8ledkdso":
          if(captureImageCallback != null) {
            captureImageCallback = null;
          }
          break;
        case "l8yovibh75ca72n67e3":
          if(showImageCallback != null) {
            showImageCallback = null;
          }
          break;
        case "iuth2xj8a3tkrgk8m6jll":
          if(hideImageCallback != null) {
            hideImageCallback = null;
          }
          break;
        case "fu8b9x5jctqeoon3fagn6a":
          if(audioCallback != null) {
            audioCallback = null;
          }
          break;
      }
    }

    resetScreenTouch () {
        screenTouched = false;
        screenTouchTimer = null;
    }

    isScreenTouched () {
      if (screenTouch){
        screenTouched = false;
        return true;
      } else{
        return false;
      }
    }

    resetHeadTouch () {
        // setTimeout(() => {
        //      headTouchTimer = null;
        //      headTouchCount = 0;
        // } ,2);
        headTouchTimer = null;
        headTouchCount = 0;
    }

    onHeadTouch (args, util) {
      action = args.action;
      if (headTouchCount>0) {
          if (!handOn) {
              if (action == "tapped") {
                  return true;
              }
          } else {
              if (headTouchCount > 4) {
                  if (action == "tickled"){
                      return true;
                  }
              }else {
                  if (action == "held") {
                      return true
                  }
              }
          }
      }
      return false;
    }

    onDetectMotion () {
      if(motionCount > 0 && motionVector != lastMotionVector && motionVector != null) {
        lastMotionVector = motionVector;
        return true;
      }
      return false;
    }

    onDetectPerson () {
      if(personCount > 0 && personVector != lastPersonVector && personVector != null) {
        lastPersonVector = personVector;
        return true;
      }
      return false;
    }

    connectToJibo (args, util) {
      var host = args.host;
      socket = new WebSocket(args.host);
      this.setupSocket();
    }

    blink (args, util) {
      if(connected == true) {
        if(blinkCallback == false) {
          util.yield();
        }
        if (blinkCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "timestamp": Date.now()
              },
              "type":"blink",
              "id":"a8oqmako5jup9jkujjhs8n"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          blinkCallback = false;
          util.yield();
        }
      } else {
        console.log('Not connected');
      }
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    setLEDColor (args, util) {
      var red = args.red;
      var green = args.green;
      var blue = args.blue;
      if(connected == true) {
        if(ringColorCallback == false) {
          util.yield();
        }
        if(ringColorCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "colour": rgbToHex(red, green, blue),
                "timestamp": Date.now()
              },
              "type":"ringColour",
              "id":"rkj7naw3qhoeqqx75qie8p"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          ringColorCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    setLEDColorHex (args, util) {
      var hex = args.hex;
      if(connected == true) {
        if(ringColorCallback == false) {
          util.yield();
        }
        if(ringColorCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "colour": hex,
                "timestamp": Date.now()
              },
              "type":"ringColour",
              "id":"rkj7naw3qhoeqqx75qie8p"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          ringColorCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    speak (args, util) {
      var phrase = args.phrase;
      if(connected == true) {
        if(speakCallback == false) {
          util.yield();
        }
        if(speakCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "text": phrase,
                "timestamp": Date.now()
              },
              "type":"tts",
              "id":"8iziqydahmxoosr78pb8zo"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          speakCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }


    askQuestion (args, util) {
      var question = args.question;
      if(connected == true) {
        if(askQuestionCallback == false) {
          util.yield();
        }
        if(askQuestionCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "prompt": question,
                "timestamp": Date.now()
              },
              "type":"mim",
              "id":"mnvwvc6ydbjcfg60u5ou"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          askQuestionCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    moveLeft (args, util) {
      lookAt(1, -1, 1, callback);
    }

    moveRight (args, util) {
      lookAt(1, 1, 1, callback);
    }

    faceForward (args, util) {
      lookAt(1, 0, 1, callback);
    }

    lookAt (args, util) {
      if(lookAtCallback == false) {
        util.yield();
      }
      var x = Cast.toNumber(args.x);
      var y = Cast.toNumber(args.y);
      var z = Cast.toNumber(args.z);
      if(connected == true) {
        if(lookAtCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                'x': x,
                'y': y,
                'z': z,
                "timestamp": Date.now()
              },
              "type":"lookAt3D",
              "id":"luzbwwsphl5yc5gd35ltp"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          lookAtCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    lookAtAngle (args, util) {
      if(lookAtAngleCallback == false) {
        util.yield();
      }
      var direction = args.direction;
      var angle = null;
      var id = null;
      switch(direction) {
        case 'left':
          angle = 1.57;
          id = 'gyv2w5gmd1fx3dsi1ya2q';
        case 'right':
          angle = -1.57;
          id = '37puq9rz3u9dktwl4dta3f';
        case 'center':
          angle = 0;
          id = 'x2xbfg17pfe7ojng9xny5l';
        case 'back':
          angle = 3.14;
          id = 'rdar1z5itp854npicluamx';
      }
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "angle": angle,
              "timestamp": Date.now()
            },
            "type":"lookAt",
            "id": id
          }
        };
        socket.send(JSON.stringify(commandMessage));

        //this._startStackTimer(util, 2);
        lookAtAngleCallback = util;
        if(lookAtAngleCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "angle": angle,
                "timestamp": Date.now()
              },
              "type":"lookAt",
              "id": id
            }
          };
          socket.send(JSON.stringify(commandMessage));
          lookAtAngleCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    captureImage (args, util) {
      var fileName = args.fileName;
      var url = "http://" + ip + ":8082/image/" + fileName;
      if(connected == true) {
        if(captureImageCallback == false) {
          util.yield();
        }
        if(captureImageCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "url": url,
                "timestamp": Date.now()
              },
              "type":"photo",
              "id":"ir49rvv4v42nm8ledkdso"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          captureImageCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    showPhoto (args, util) {
      var fileName = args.fileName;
      var url = "http://"+ip+":8082/./src/playground/assets/images/" + fileName;
      console.log(url);
      if(connected == true) {
        if(showImageCallback == false) {
          util.yield();
        }
        if(showImageCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "type": "image/jpeg",
                "url": url,
                "timestamp": Date.now()
              },
              "type":"image",
              "id":"l8yovibh75ca72n67e3"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          showImageCallback = false;
        }

      } else {
        console.log('Not connected');
      }
    }

    hidePhoto (args, util) {
      var url = args.url;
      if(connected == true) {
        if(hideImageCallback == false) {
          util.yield();
        }
        if(hideImageCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "timestamp": Date.now()
              },
              "type":"hideImage",
              "id":"iuth2xj8a3tkrgk8m6jll"
            }
          };
          socket.send(JSON.stringify(commandMessage));
          hideImageCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    setAttention (args, util) {
      var attention = args.attention;
      var state = 'idle';
      var id = 'etsolxdeclmkj3nhjp3kb';
      if(attention == 'OFF') {
        state = 'OFF';
        id = '53v5yx4f99kqkdfcj4hf4';
      }
      if(connected == true) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "state": state,
                "timestamp": Date.now()
              },
              "type":"attention",
              "id":id
            }
          };
          socket.send(JSON.stringify(commandMessage));
      } else {
        console.log('Not connected');
      }
    }

    playAnimation (args, util) {
      var filePath = args.filePath;
      if(connected == true) {
        if(animationCallback == false) {
          util.yield();
        }
        if(animationCallback == null) {
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "filepath": filePath,
                "timestamp": Date.now()
              },
              "type":"animation",
              "id": 'fnqo3l6m1jjcrib7sz0xyc'
            }
          };
          socket.send(JSON.stringify(commandMessage));
          animationCallback = false;
        }
      } else {
        console.log('Not connected');
      }
    }

    getMotionCount (args, util) {
      return motionCount;
    }

    getMotionVectorX (args, util) {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.x;
    }

    getMotionVectorY (args, util) {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.y;
    }

    getMotionVectorZ (args, util) {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.z;
    }

    getPersonCount (args, util) {
      return personCount;
    }

    getPersonVectorX (args, util) {
      if(personVector == null) {
        return 0;
      }
      return personVector.x;
    }

    getPersonVectorY (args, util) {
      if(personVector == null) {
        return 0;
      }
      return personVector.y;
    }

    getPersonVectorZ (args, util) {
      if(personVector == null) {
        return 0;
      }
      return personVector.z;
    }

    getScreenVectorX (args, util) {
      if(screenVector == null) {
        return 0;
      }
      return screenVector.x;
    }

    getScreenVectorY () {
      if(screenVector == null) {
        return 0;
      }
      return screenVector.y;
    }


    playAudio (args, util) {
      name = args.name;
      if(connected == true) {
        if(audioCallback == false) {
          util.yield();
        }
        if(audioCallback == null) {
          var path = "http://"+metadata.ip+":8082/./src/playground/assets/audio/" + name;
          if(metadata == null) {
            path = "http://"+ip+":8082/" + name;
          }
          var commandMessage = {
            "type":"command",
            "command": {
              "data": {
                "filename": path,
                "timestamp": Date.now()
              },
              "type":"audio",
              "id": 'fu8b9x5jctqeoon3fagn6a'
            }
          };
          socket.send(JSON.stringify(commandMessage));
          audioCallback = false;
        }else {
        console.log('Not connected');
      }
    }
  }
    getLocalIP() {
      return ip_module.address();
    }

    getMetadata() {
      request.get({url: './metadata'}, function (error, response, body) {
        if(error) {
          console.log("error ");
          console.log(error);
          return;
        }
        console.log(body);
        metadata = JSON.parse(body);
      });
    }

    setIPVariable(address) {
      ip = address;
      console.log(ip);
    }

    _stackTimerNeedsInit (util) {
        return !util.stackFrame.timer;
    }

    /**
     * Start the stack timer and the yield the thread if necessary.
     * @param {object} util - utility object provided by the runtime.
     * @param {number} duration - a duration in seconds to set the timer for.
     * @private
     */
    _startStackTimer (util, duration) {
        util.stackFrame.timer = new Timer();
        util.stackFrame.timer.start();
        util.stackFrame.duration = duration;
        util.yield();
    }

    /**
     * Check the stack timer, and if its time is not up yet, yield the thread.
     * @param {object} util - utility object provided by the runtime.
     * @private
     */
    _checkStackTimer (util) {
        const timeElapsed = util.stackFrame.timer.timeElapsed();
        if (timeElapsed < util.stackFrame.duration * 1000) {
            util.yield();
        }
    }

}

module.exports = Scratch3Jibo;
