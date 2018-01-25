const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const ip_module = require('ip');

const speech = require('speech-synth');

//const say = require( path.resolve( __dirname, 'say' ) );
//const say = require('say');
//var Speak = require('tts-speak');
/*var speak = new Speak({
    tts: {
        engine: 'tts',                  // The engine to use for tts
        lang: 'en-us',                  // The voice to use
        amplitude: 100,                 // Amplitude from 0 to 200
        wordgap: 0,                     // Gap between each word
        pitch: 50,                      // Voice pitch
        speed: 60,                      // Speed in %
        cache: __dirname + '/cache',    // The cache directory were audio files will be stored
        loglevel: 0,                    // TTS log level (0: trace -> 5: fatal)
        delayAfter: 700                 // Mark a delay (ms) after each message
    },
    speak: {
        volume: 80,                     // Audio player volume
        loglevel: 0                     // Audio player log level
    },
    loglevel: 0                         // Wrapper log level
});*/


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


var animationsMap = {
	'1-gift-show-01':'gifts/1-gift-show-01.keys',
	'1-gift-show-02':'gifts/1-gift-show-02.keys'
}

const RenderedTarget = require('../../sprites/rendered-target');
var prev_wblocks = null;


var mission3 = {
	numberSteps: 3,
	steps : [
		{
			init_blocks: [],
			end_blocks: ['event_whenflagclicked'],
			init: {
				text: "Hi there I would like to know your name, so let's do a program that allow me to learn it. Let's start with the green flag block",
				image: './playground/media/icons/event_whenflagclicked.svg'
			},
			ok: {
				text: "There you go! You did it!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"
			}
		},
		{
			init_blocks: ['event_whenflagclicked'],
			end_blocks: ['event_whenflagclicked','jibo.askQuestion','text'],
			init: {
				text: "No i need to you to make me ask a question and save the answer in a variable. For that we'll need the jibo ask block ",
				image: ''
			},
			ok: {
				text: "Awsom!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"
			}
		},
		{
			init_blocks: ['event_whenflagclicked','jibo.askQuestion','text'],
			end_blocks: ['event_whenflagclicked','jibo.askQuestion','text','jibo.speak','text','operator_join','text','text','data_variable'],
			init: {
				text: "now put a jibo say block. And an join block inside operators for joining two words. In the first one you can put hello, or something like that. on the other space add the variable where you stored your name.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "remember to use the variable block!"
			}
		}
	]
}


var mission = mission3;
var mission_initialized = false;
var stepIdx = 0;
var STATE = 0;
var notComplain = true
let actualImage;
var auxblocks = [];
var step;



const iconURI = require('./assets/icon');
/*
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
        //when blocks move, call the function that calls missionCommander
        this.onWorkspaceUpdate = this.onWorkspaceUpdate.bind(this);
        runtime.on('blocksChanged', this.onWorkspaceUpdate);

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
												menu: 'animations',
												defaultValue: '1-gift-show-01'
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
                },
								{
										opcode: 'setIPVariable',
										blockType BlockType.COMMAND,
										text: 'Set local IP: [ADDRESS]',
										arguments: {
											ADDRESS: {
												type: ArgumentType.STRING,
												defaultValue: '192.168.1.126'
											}
										}
								}
            ]
            ,
            menus: {
              lookAt: ['left', 'right', 'center', 'back'],
              trueFalse: ['true', 'false'],
              onOff: ['ON', 'OFF'],
              vectorDimensions2D: ['x' , 'y'],
              vectorDimensions3D: ['x' , 'y', 'z'],
              headTouchList: ['tapped', 'tickled', 'held'],
							animations: this.generateMenu(animationsMap)
            }
        };
    }

    reinitComplain(){
		notComplain = true
	}



	//Scratch Tutor Functions

	tutorSay(tts) {
		//responsiveVoice.speak(tts);
		//say.speak(tts);
		//console.log(tts);
		speech.say(tts);
		return;
	}

	tutorAnimate(block) {
		animateBlock(block, 100, 100, 5);
	}

	//Animation Help Functions

	/**
	 * Trivial interpolation.
	 * Find alternative curves at https://gist.github.com/gre/1650294
	 * @param parcent {number} Value from 0.0 to 1.0
	 */
	linearInterpolate(percent) {
	  return percent;
	}

	/**
	 * Animate moving a Blockly top block by a given distance, relative to where
	 * ever it started.
	 *
	 * @param block {Blockly.Block} A top block in the Blockly Workspace.
	 * @param dx {number} Relative distance to move horizontally.
	 * @param dy {number} Relative distance to move vertically.
	 * @param seconds {number} Animation duration in seconds.
	 * @param optionalInterpolateFn {function(number)} Optional interpolation
	 *     function, defines the animation curve/easing.
	 */
	animateBlock(block, dx, dy, seconds, optionalInterpolateFn) {
	  let interpolate = optionalInterpolateFn || linearInterpolate;
	  let dt = seconds * 1000; // Convert to milliseconds.
	  let start = Date.now();
	  var movedX = 0, movedY = 0;

	  let step = function() {
	    let now = Date.now();
	    let percent = (now - start) / dt;
	    if (percent < 1.0) {
	      let stepX = interpolate(percent) * dx - movedX;
	      let stepY = interpolate(percent) * dy - movedY;
	      block.moveBy(stepX, stepY);
	      movedX += stepX;
	      movedY += stepY;
	      window.requestAnimationFrame(step);  // repeat
	    } else {
	      // Complete the animation.
	      block.moveBy(dx - movedX, dy - movedY);
	    }
	  }
	  step();
	}

     /**
     * When a workspace update occurs, run our mission commander
     * @param {[Block]} [blocks] - the blocks currently in the workspace
     * @listens Runtime#event:workspaceUpdate
     * @private
     */
    onWorkspaceUpdate () {
    	var blocks = this.runtime.getEditingTarget().blocks;
        var wblocks = [];
        //var blockevent = false;
        if (typeof mission !== 'undefined') {
            if (!mission_initialized){
                this.missionCommander(wblocks);
            }
            for (var i in blocks['_blocks']) {
                var block = {
                    opcode: null,
                    next: null
                }

                block.opcode = blocks['_blocks'][i]['opcode'];

                if (blocks['_blocks'][i]['next'] != null) {
                    block.next = blocks['_blocks'][blocks['_blocks'][i]['next']]['opcode'];
                }
                wblocks.push(block);
            }
            /*if (vm.blockevent != null) {
                if (('blockId' in vm.blockevent) && ('newCoordinate' in vm.blockevent)) {
                    blockevent = true;
                }
            }*/
            if ((JSON.stringify(prev_wblocks) !== JSON.stringify(wblocks))) {
                prev_wblocks = JSON.parse(JSON.stringify(wblocks));

                this.missionCommander(wblocks);
            }
        }
    }

    missionCommander(wblocks) {
		//workspace.getBlockById('event_whenflagclicked');
		auxblocks = [];
		for (var i = 0; i < wblocks.length; i++) {
			auxblocks.push(wblocks[i]['opcode']);
		}
		if (stepIdx < mission.steps.length){ //if ((window.robot) && (stepIdx < mission.steps.length)){
			/*if (!mission_initialized){
				populateMedia();
			}

			mission_initialized = true;*/
			step = mission.steps[stepIdx];
			if (STATE == 0){
				if (JSON.stringify(auxblocks) === JSON.stringify(step.init_blocks)) {
					this.tutorSay(step.init.text);
					/*jiboSay(step.init.text).then(()=>{
						console.log('say promise resolved');
						jiboShowImage(step.init.image);
						setTimeout(()=>{
								jiboHideImage();
						},1000);
					});*/

					STATE = 1;
				}
			} else if ((STATE == 1) ){
				if (JSON.stringify(auxblocks) === JSON.stringify(step.end_blocks)) {
					STATE = 0;
					stepIdx = stepIdx + 1;
					this.tutorSay(step.ok.text);
					this.missionCommander(wblocks);
				} else{
					if (JSON.stringify(auxblocks) !== "[]"){
						if (notComplain){
							this.tutorSay(step.bad_block.text);
							notComplain = false;
							setTimeout(this.reinitComplain,30000);
							/*jiboSay(step.bad_block.text).then(()=>{
							});*/

						}


					}
				}
			}
	    }

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
              screenTouchTimer = setTimeout(this.resetScreenTouch,1000);
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
                      _this.resetHeadTouch();
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

		generateMenu(menuItems) {
			return Object.keys(menuItems);
		}

    resetScreenTouch () {
        screenTouched = false;
        screenTouchTimer = null;
    }

    isScreenTouched () {
      if (screenTouched){
        screenTouched = false;
        return true;
      } else{
        return false;
      }
    }

    resetHeadTouch () {
        setTimeout(() => {
             headTouchTimer = null;
             headTouchCount = 0;
        } ,2);
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
			this.getMetadata();
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
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
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
                "colour": this.rgbToHex(red, green, blue),
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
      var url = "http://"+metadata.ip+":8080/./src/playground/assets/images/" + fileName;
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
      var filePath = animationsMap[args.filePath];
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

    getMotionCount () {
      return motionCount;
    }

    getMotionVectorX () {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.x;
    }

    getMotionVectorY () {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.y;
    }

    getMotionVectorZ () {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.z;
    }

    getPersonCount () {
      return personCount;
    }

    getPersonVectorX () {
      if(personVector == null) {
        return 0;
      }
      return personVector.x;
    }

    getPersonVectorY () {
      if(personVector == null) {
        return 0;
      }
      return personVector.y;
    }

    getPersonVectorZ () {
      if(personVector == null) {
        return 0;
      }
      return personVector.z;
    }

    getScreenVectorX () {
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
      return ip;
    }

    getMetadata() {
      request.get({url: 'http://127.0.0.1:8080/metadata'}, function (error, response, body) {
        if(error) {
          console.log("error ");
          console.log(error);
          return;
        }
        console.log(body);
        metadata = JSON.parse(body);
      });
    }

    setIPVariable(args, util) {
			var address = args.ADDRESS;
      ip = address;
			if(metadata == null) {
				metadata = {};
			}
			metadata.ip = address
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

module.exports.node = {
  child_process: 'empty'
}
