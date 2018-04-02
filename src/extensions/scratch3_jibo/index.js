import {win32} from 'path';
// exteension constants
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const ip_module = require('ip');
const iconURI = require('./assets/jibo_icon');

// jibo blocks
let metadata = null;
let ip = 'http://18.85.39.50:8888/';
let headTouches = null;
let headTouchCount = 0;
let headTouchTimer;
let handOn;
let screenTouchTimer;
let screenTouched = false;
let screenVector = {};
let personCount = 0;
let personVector = null;
let lastPersonVector = null;
let motionCount = 0;
let motionVector = null;
let lastMotionVector = null;
let blinkCallback = null;
let lookAtCallback = null;
let lookAtAngleCallback = null;
let speakCallback = null;
let askQuestionCallback = null;
let ringColorCallback = null;
let animationCallback = null;
let captureImageCallback = null;
let showImageCallback = null;
let hideImageCallback = null;
const animationsMap = {
    'gift': 'gifts/1-gift-show-01.keys',
    'smile': 'gifts/1-gift-show-02.keys'
    
};
const soundsMap = {
    '1-gift-show-01': 'gifts/1-gift-show-01.keys',
    '1-gift-show-02': 'gifts/1-gift-show-02.keys'
};

// missions
// const missionCommander = require('./missions/new-mission-commander');
// let mission2 = require('./missions/mission2');
// let mission3 = require('./missions/mission3');
// let mission = require('./missions/mission3');
// const missionArray = {'2': mission2, '2': mission3};

const speech = require('speech-synth');
window.socket = null;
let connected = false;
// var Bundle = null;
// const RenderedTarget = require('../../sprites/rendered-target');
let prev_wblocks = null;
let mission_initialized = false;
let stepIdx = 0;
let STATE = 0;
let step = 0;
let notComplain = true;
let actualImage;
let auxblocks = [];
var reminded = false;


const RenderedTarget = require('../../sprites/rendered-target');

var mission2 = {
	numberSteps: 5,
	steps : [
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked'],
			init: {
				text: "You've probably heard of pacman before. Well, today we are going to make our own version of pacman. Start with green flag block",
				image: ''
			},
			ok: {
				text: "There you go! You did it!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever'],
			init: {
				text: "The whole time our pacman game is running, we want our pacman character to be opening and closing his mouth. First, use a forever loop that we will put directions for the pacman inside of.",
				image: ''
			},
			ok: {
				text: "Awesome!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever','looks_nextcostume'],
			init: {
				text: "Put the next costume block inside of that forever loop to make it so pacman switches back and forth between having an open mouth and a closed mouth.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Remember to use the next costume block!"	
			} 
		},
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever','looks_nextcostume'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever','looks_nextcostume','control_wait'],
			init: {
				text: "Pacman is opening and closing his mouth too fast! Use a wait for one second block in your forever loop to make him open and close it more slowly.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Try again! Make sure you are using the wait for one second block."	
			} 
		},
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever','looks_nextcostume','control_wait'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','control_forever','looks_nextcostume','control_wait','event_whenkeypressed'],
			init: {
				text: "Now we want to be able to make Pacman move left, right, up, and down. Let's start with the event block that says when left key pressed",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Try again! Look in the events panel for a block that says when key pressed!"	
			} 
		}
	]	
}
var mission3 = {
	numberSteps: 3,
	steps : [
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked'],
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
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','sensing_askandwait','text'],
			init: {
				text: "Now I need to you to make me ask a question and save the answer in a variable. For that we'll need the Sensing ask block ",
				image: ''
			},
			ok: {
				text: "Awsome!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','sensing_askandwait','text'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission','event_whenflagclicked','sensing_askandwait','text','jibo.speak','sensing_answer', 'text'],
			init: {
				text: "now put a jibo say block. And inside and the sensing answer block where you stored your name.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "remember to use the answer block, when ready click on green flag"	
			} 
		}
	]	
}

var mission4 = {
	numberSteps: 4,
	steps : [
		{
			init_blocks: ['jibo.mission', 'jibo.menu.mission'],
			end_blocks: ['jibo.mission', 'jibo.menu.mission', 'event_whenflagclicked'],
			init: {
				text: "Today, we're going to learn about if statements by playing some sounds! Let's start with the green flag block",
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
			init_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked'],
			end_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked','control_if'],
			init: {
				text: "Let's use an if then block next. This block checks its condition. If the condition is true, the blocks inside the block run and if the condition is false, the blocks inside the block will not run",
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
			init_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked','control_if'],
			end_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked','control_if','sensing_mousedown'],
			init: {
				text: "Place a mouse down sensing block inside of the if statement. Now, our if statement checks to see if the mouse is down. If it is, whatever is inside of the if statement will run. ",
				image: ''
			},
			ok: {
				text: "Cool!"
			},
			bad_block:{
				text: "remember to use the variable block!"	
			} 
		},
		{
			init_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked','control_if','sensing_mousedown'],
			end_blocks: ['jibo.mission','jibo.menu.mission', 'event_whenflagclicked','control_if','sensing_mousedown', 'sound_playuntildone', 'sound_sounds_menu'],
			init: {
				text: "Inside of the if statement, put a play sound until done block with the Meow sound.",
				image: ''
			},
			ok: {
				text: "Now, you can click the green flag and test your program!"
			},
			bad_block:{
				text: "remember to use the variable block!"	
			} 
		}
	]	
}

var mission5 = {
	numberSteps: 3,
	steps : [
		{
			init_blocks: [],
			end_blocks: ['event_whenflagclicked'],
			init: {
				text: "Green flag block",
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
				text: "No i need to you to make me ask a question and save the answer in a variable. For that we'll need the Jibo say block ",
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

var missionArray = {"2":mission2, "3":mission3, "4": mission4};
var mission = mission2;
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
        this.setIPVariable(this.getLocalIP());
        // initializing robot connection so mission for robot loads with constructor
        // const robotIp = prompt('robot ip:');
        // window.socket = new WebSocket("ws://"+robotIp.toLowerCase()+".local:8888/");
        // window.socket = new WebSocket('ws://0.0.0.0:8888/');
        // this.runtime. getEditingTarget get blocks here
        // when blocks move, call the function that calls missionCommander
        // this.onWorkspaceUpdate = this.onWorkspaceUpdate.bind(this);
        // runtime.on('blocksChanged', this.onWorkspaceUpdate);
    }

    missionCommander (wblocks) {
        // workspace.getBlockById('event_whenflagclicked');
        auxblocks = [];
        for (let i = 0; i < wblocks.length; i++) {
            auxblocks.push(wblocks[i].opcode);
        }
        if (STATE == 0 && stepIdx == 0 && JSON.stringify(auxblocks) != ['jibo.mission', 'jibo.menu.mission']) { //
            // if (!reminded) {
            //     // this.tutorSay("Please clear all blocks from the stage except for the Mission Number block. Then, re-run the mission.");
            //     this.jiboSay('Please clear all blocks from the stage except for the Mission Number block. Then chose the mission you like.');
            //     reminded = true;
            //     return;
            // }
        }
        if (stepIdx < mission.steps.length){
            step = mission.steps[stepIdx];
            if (STATE == 0){
                console.log(JSON.stringify(step.init_blocks));
                if (JSON.stringify(auxblocks) === JSON.stringify(step.init_blocks)) {
                    // this.tutorSay(step.init.text);
                    this.jiboSay(step.init.text);

                    STATE = 1;
                }
            } else if ((STATE == 1)){
                if (JSON.stringify(auxblocks) === JSON.stringify(step.end_blocks)) {
                    STATE = 0;
                    stepIdx = stepIdx + 1;
                    this.jiboSay(step.ok.text);  
                    // this.tutorSay(step.ok.text);
                    this.missionCommander(wblocks);
                } else if (JSON.stringify(auxblocks) !== '[]'){
                    // this.tutorSay(step.bad_block.text);
                    this.jiboSay(step.bad_block.text);
                    setTimeout(this.reinitComplain, 30000);
                }
            }
        }
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
                            defaultValue: 'tapped'
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
                            defaultValue: 'ws://192.168.1.115:8888/'
                        }
                    }
                },
                {
                    opcode: 'blink',
                    blockType: BlockType.COMMAND,
                    text: 'Jibo blink'
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
                    opcode: 'mission',
                    blockType: BlockType.COMMAND,
                    text: 'Mission number: [missionNum]',
                    arguments: {
                        missionNum: {
                            type: ArgumentType.STRING,
                            menu: 'mission',
                            defaultValue: '3'
                        }
                    }
                },
                {
                    opcode: 'closeMission',
                    blockType: BlockType.COMMAND,
                    text: 'End current mission'
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
                // {
                //     opcode: 'setLEDColor',
                //     blockType: BlockType.COMMAND,
                //     text: 'Set LED color R:[red] G:[green] B:[blue]',
                //     arguments: {
                //       red: {
                //         type: ArgumentType.NUMBER,
                //         defaultValue: 0
                //       },
                //       green: {
                //         type: ArgumentType.NUMBER,
                //         defaultValue: 0
                //       },
                //       blue: {
                //         type: ArgumentType.NUMBER,
                //         defaultValue: 0
                //       }
                //     }
                // },
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
                // {
                //     opcode: 'getMotionVectorX',
                //     blockType: BlockType.REPORTER,
                //     text: 'motion x'
                // },
                // {
                //     opcode: 'getMotionVectorY',
                //     blockType: BlockType.REPORTER,
                //     text: 'motion y'
                // },
                // {
                //     opcode: 'getMotionVectorZ',
                //     blockType: BlockType.REPORTER,
                //     text: 'motion z'
                // },
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
                    blockType: BlockType.COMMAND,
                    text: 'Set local IP: [ADDRESS]',
                    arguments: {
                        ADDRESS: {
                            type: ArgumentType.STRING,
                            defaultValue: '192.168.1.115'
                        }
                    }
                }
            ],
            menus: {
                mission: ['2', '3', '4'],
                lookAt: ['left', 'right', 'center', 'back'],
                trueFalse: ['true', 'false'],
                onOff: ['ON', 'OFF'],
                vectorDimensions2D: ['x', 'y'],
                vectorDimensions3D: ['x', 'y', 'z'],
                headTouchList: ['tapped', 'tickled', 'held'],
                animations: this.generateMenu(animationsMap)
            }
        };
    }

    reinitComplain (){
        notComplain = true;
    }


    // Jibo mission function

    jiboSay (tts) {
        const commandMessage = {
            type: 'command',
            command: {
                data: {
                    text: tts,
                    timestamp: Date.now()
                },
                type: 'tts',
                id: '8iziqydahmxoosr78pb8zo'
            }
        };
        window.socket.send(JSON.stringify(commandMessage));
        return;
    }
    // Scratch Tutor Functions
    // const say = require( path.resolve( __dirname, 'say' ) );
    // const say = require('say');
    // var Speak = require('tts-speak');
    /* var speak = new Speak({
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

    tutorSay (tts) {
    	 	speech.say(tts);
		    return;
    }

    // wip
	    tutorAnimate (block) {
		    animateBlock(block, 100, 100, 5);
    }
    /**
   * When a workspace update occurs, run our mission commander
   * @param {[Block]} [blocks] - the blocks currently in the workspace
   * @listens Runtime#event:workspaceUpdate
   * @private
   */
    onWorkspaceUpdate () {
        if (!mission_initialized) {
            return;
        }
        let blocks = this.runtime.getEditingTarget().blocks;
        let wblocks = [];
        // var blockevent = false;
        if (typeof mission !== 'undefined') {
            for (let i in blocks._blocks) {
                let block = {
                    opcode: null,
                    next: null
                };

                block.opcode = blocks._blocks[i].opcode;

                if (blocks._blocks[i].next != null) {
                    block.next = blocks._blocks[blocks._blocks[i].next].opcode;
                }
                wblocks.push(block);
            }
            /* if (!mission_initialized){
                console.log("mission not initialized");
                  this.missionCommander(wblocks);
              }*/
            /* if (vm.blockevent != null) {
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
    setupSocket () {
        const _this = this;
        window.socket.addEventListener('open', () => {
            console.log('Connected to jibo app frame');
        });

        window.socket.addEventListener('message', function (message) {
            message = JSON.parse(message.data);
            if (message.name == 'blockly.robotList') {
                if (message.type == 'robotlist') {
                    if (message.data.names.length > 0) {
                        connected = true;
                    }
                }
            } else if (message.type == 'event') {
                if (message.payload.type == 'screen-touch') {
                    screenVector = message.payload.data;
                    screenTouched = true;
                    if (screenTouchTimer) {
                        clearTimeout(screenTouchTimer);
                    }
                    screenTouchTimer = setTimeout(this.resetScreenTouch, 1000);
                } else if (message.payload.type == 'lps-summary') {
                    personCount = message.payload.data.personCount;
                    personVector = message.payload.data.personVector;
                    motionCount = message.payload.data.motionCount;
                    motionVector = message.payload.data.motionVector;
                } else if (message.payload.type == 'head-touch') {
                    headTouches = message.payload.touches;
                    headTouchCount += 1;
                    handOn = JSON.stringify(headTouches).indexOf('true') >= 0;
                    if (!headTouchTimer) {
                        headTouchTimer = setTimeout(() => {
                            _this.resetHeadTouch();
                        } , 1000);
                    }
                }
            } else if (message.type == 'transaction') {
                _this.handleTransaction(message.status, message.payload);
            }
            console.log(message);
        });
    }

    handleTransaction (status, payload) {
        switch (payload.id) {
        case 'a8oqmako5jup9jkujjhs8n':
            if (blinkCallback != null) {
                blinkCallback = null;
            }
            break;
        case 'rkj7naw3qhoeqqx75qie8p':
            if (ringColorCallback != null) {
                ringColorCallback = null;
            }
            break;
        case 'luzbwwsphl5yc5gd35ltp':
            if (lookAtCallback != null) {
                lookAtCallback = null;
            }
            break;
        case 'gyv2w5gmd1fx3dsi1ya2q':
            if (lookAtAngleCallback != null) {
                lookAtAngleCallback = null;
            }
            break;
        case '37puq9rz3u9dktwl4dta3f':
            if (lookAtAngleCallback != null) {
                lookAtAngleCallback = null;
            }
            break;
        case 'x2xbfg17pfe7ojng9xny5l':
            if (lookAtAngleCallback != null) {
                lookAtAngleCallback = null;
            }
            break;
        case 'rdar1z5itp854npicluamx':
            if (lookAtAngleCallback != null) {
                lookAtAngleCallback = null;
            }
            break;
        case 'fnqo3l6m1jjcrib7sz0xyc':
            if (animationCallback != null) {
                animationCallback = null;
            }
            break;
        case '8iziqydahmxoosr78pb8zo':
            if (speakCallback != null) {
                speakCallback = null;
            }
            break;
        case 'mnvwvc6ydbjcfg60u5ou':
            if (askQuestionCallback != null) {
                askQuestionCallback = null;
            }
            break;
        case 'ir49rvv4v42nm8ledkdso':
            if (captureImageCallback != null) {
                captureImageCallback = null;
            }
            break;
        case 'l8yovibh75ca72n67e3':
            if (showImageCallback != null) {
                showImageCallback = null;
            }
            break;
        case 'iuth2xj8a3tkrgk8m6jll':
            if (hideImageCallback != null) {
                hideImageCallback = null;
            }
            break;
        case 'fu8b9x5jctqeoon3fagn6a':
            if (audioCallback != null) {
                audioCallback = null;
            }
            break;
        }
    }

    generateMenu (menuItems) {
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
        }
        return false;
      
    }

    resetHeadTouch () {
        setTimeout(() => {
            headTouchTimer = null;
            headTouchCount = 0;
        }, 2);
        headTouchTimer = null;
        headTouchCount = 0;
    }

    onHeadTouch (args, util) {
        const action = args.action;
        if (headTouchCount > 0) {
            if (!handOn) {
                if (action == 'tapped') {
                    return true;
                }
            } else if (headTouchCount > 4) {
                if (action == 'tickled'){
                    return true;
                }
            } else if (action == "held") {
                    return true
                }
        }
        return false;
    }

    onDetectMotion () {
        if (motionCount > 0 && motionVector != lastMotionVector && motionVector != null) {
            lastMotionVector = motionVector;
            return true;
        }
        return false;
    }

    onDetectPerson () {
        if (personCount > 0 && personVector != lastPersonVector && personVector != null) {
            lastPersonVector = personVector;
            return true;
        }
        return false;
    }

    connectToJibo (args, util) {
        const host = args.host;
        window.socket = new WebSocket(args.host);
        this.getMetadata();
        this.setupSocket();
    }

    blink (args, util) {
        if (connected == true) {
            if (blinkCallback == false) {
                util.yield();
            }
            if (blinkCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            timestamp: Date.now()
                        },
                        type: 'blink',
                        id: 'a8oqmako5jup9jkujjhs8n'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                blinkCallback = false;
                util.yield();
            }
        } else {
            console.log('Not connected');
        }
    }

    componentToHex (c) {
        const hex = c.toString(16);
        return hex.length == 1 ? `0${  hex}` : hex;
    }

    rgbToHex (r, g, b) {
        return `#${  this.componentToHex(r)  }${this.componentToHex(g)  }${this.componentToHex(b)}`;
    }

    setLEDColor (args, util) {
        const red = args.red;
        const green = args.green;
        const blue = args.blue;
        if (connected == true) {
            if (ringColorCallback == false) {
                util.yield();
            }
            if (ringColorCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            colour: this.rgbToHex(red, green, blue),
                            timestamp: Date.now()
                        },
                        type: 'ringColour',
                        id: 'rkj7naw3qhoeqqx75qie8p'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                ringColorCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }

    setLEDColorHex (args, util) {
        const hex = args.hex;
        if (connected == true) {
            if (ringColorCallback == false) {
                util.yield();
            }
            if (ringColorCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            colour: hex,
                            timestamp: Date.now()
                        },
                        type: 'ringColour',
                        id: 'rkj7naw3qhoeqqx75qie8p'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                ringColorCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }

    speak (args, util) {
        const phrase = args.phrase;
        if (connected == true) {
            if (speakCallback == false) {
                util.yield();
            }
            if (speakCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            text: phrase,
                            timestamp: Date.now()
                        },
                        type: 'tts',
                        id: '8iziqydahmxoosr78pb8zo'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                speakCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }


    askQuestion (args, util) {
        const question = args.question;
        if (connected == true) {
            if (askQuestionCallback == false) {
                util.yield();
            }
            if (askQuestionCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            prompt: question,
                            timestamp: Date.now()
                        },
                        type: 'mim',
                        id: 'mnvwvc6ydbjcfg60u5ou'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
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
        if (lookAtCallback == false) {
            util.yield();
        }
        const x = Cast.toNumber(args.x);
        const y = Cast.toNumber(args.y);
        const z = Cast.toNumber(args.z);
        if (connected == true) {
            if (lookAtCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            x: x,
                            y: y,
                            z: z,
                            timestamp: Date.now()
                        },
                        type: 'lookAt3D',
                        id: 'luzbwwsphl5yc5gd35ltp'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                lookAtCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }

    lookAtAngle (args, util) {
        if (lookAtAngleCallback == false) {
            util.yield();
        }
        const direction = args.direction;
        let angle = null;
        let id = null;
        switch (direction) {
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
        if (connected == true) {
            var commandMessage = {
                type: 'command',
                command: {
                    data: {
                        angle: angle,
                        timestamp: Date.now()
                    },
                    type: 'lookAt',
                    id: id
                }
            };
            window.socket.send(JSON.stringify(commandMessage));

            // this._startStackTimer(util, 2);
            lookAtAngleCallback = util;
            if (lookAtAngleCallback == null) {
                var commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            angle: angle,
                            timestamp: Date.now()
                        },
                        type: 'lookAt',
                        id: id
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                lookAtAngleCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }

    captureImage (args, util) {
        const fileName = args.fileName;
        const url = `http://${  ip  }:8080/image/${  fileName}`;
        if (connected == true) {
            if (captureImageCallback == false) {
                util.yield();
            }
            if (captureImageCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            url: url,
                            timestamp: Date.now()
                        },
                        type: 'photo',
                        id: 'ir49rvv4v42nm8ledkdso'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                captureImageCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }
    // needs refactor
    showPhoto (args, util) {
        const fileName = args.fileName;
        const url = `http://${  ip  }:8080/./src/playground/assets/images/${  fileName}`;
        console.log(url);
        if (connected == true) {
            if (showImageCallback == false) {
                util.yield();
            }
            if (showImageCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            type: 'image/jpeg',
                            url: url,
                            timestamp: Date.now()
                        },
                        type: 'image',
                        id: 'l8yovibh75ca72n67e3'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                showImageCallback = false;
            }

        } else {
            console.log('Not connected');
        }
    }

    hidePhoto (args, util) {
        const url = args.url;
        if (connected == true) {
            if (hideImageCallback == false) {
                util.yield();
            }
            if (hideImageCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            timestamp: Date.now()
                        },
                        type: 'hideImage',
                        id: 'iuth2xj8a3tkrgk8m6jll'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                hideImageCallback = false;
            }
        } else {
            console.log('Not connected');
        }
    }
    mission (args, util) {
    	reminded = false;
	  	stepIdx = 0;
	  	auxblocks = [];
      	const num = args.missionNum;
      	mission = missionArray[num];
      	mission_initialized = true;
      	prev_wblocks = null;
      	STATE = 0;
     	this.onWorkspaceUpdate();
    }

    closeMission (args, util) {
    	mission_initialized = false;
    }
    setAttention (args, util) {
        const attention = args.attention;
        let state = 'idle';
        let id = 'etsolxdeclmkj3nhjp3kb';
        if (attention == 'OFF') {
            state = 'OFF';
            id = '53v5yx4f99kqkdfcj4hf4';
        }
        if (connected == true) {
            const commandMessage = {
                type: 'command',
                command: {
                    data: {
                        state: state,
                        timestamp: Date.now()
                    },
                    type: 'attention',
                    id: id
                }
            };
            window.socket.send(JSON.stringify(commandMessage));
        } else {
            console.log('Not connected');
        }
    }

    playAnimation (args, util) {
        const filePath = animationsMap[args.filePath];
        if (connected == true) {
            if (animationCallback == false) {
                util.yield();
            }
            if (animationCallback == null) {
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            filepath: filePath,
                            timestamp: Date.now()
                        },
                        type: 'animation',
                        id: 'fnqo3l6m1jjcrib7sz0xyc'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
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
        if (motionVector == null) {
            return 0;
        }
        return motionVector.x;
    }

    getMotionVectorY () {
        if (motionVector == null) {
            return 0;
        }
        return motionVector.y;
    }

    getMotionVectorZ () {
        if (motionVector == null) {
            return 0;
        }
        return motionVector.z;
    }

    getPersonCount () {
        return personCount;
    }

    getPersonVectorX () {
        if (personVector == null) {
            return 0;
        }
        return personVector.x;
    }

    getPersonVectorY () {
        if (personVector == null) {
            return 0;
        }
        return personVector.y;
    }

    getPersonVectorZ () {
        if (personVector == null) {
            return 0;
        }
        return personVector.z;
    }

    getScreenVectorX () {
        if (screenVector == null) {
            return 0;
        }
        return screenVector.x;
    }

    getScreenVectorY () {
        if (screenVector == null) {
            return 0;
        }
        return screenVector.y;
    }


    playAudio (args, util) {
        name = args.name;
        if (connected == true) {
            if (audioCallback == false) {
                util.yield();
            }
            if (audioCallback == null) {
                let path = `http://${  metadata.ip  }:8080/./src/playground/assets/audio/${  name}`;
                if (metadata == null) {
                    path = `http://${  ip  }:8080/${  name}`;
                }
                const commandMessage = {
                    type: 'command',
                    command: {
                        data: {
                            filename: path,
                            timestamp: Date.now()
                        },
                        type: 'audio',
                        id: 'fu8b9x5jctqeoon3fagn6a'
                    }
                };
                window.socket.send(JSON.stringify(commandMessage));
                audioCallback = false;
            } else {
                console.log('Not connected');
            }
        }
    }

    getLocalIP () {
        return ip;
    }

    getMetadata () {
        request.get({url: `http://${  metadata.ip  }:8080/metadata`}, (error, response, body) => {
            if (error) {
                console.log('error ');
                console.log(error);
                return;
            }
            console.log(body);
            metadata = JSON.parse(body);
        });
    }

    setIPVariable (args, util) {
        const address = args.ADDRESS;
        ip = address;
        if (metadata == null) {
            metadata = {};
        }
        metadata.ip = address;
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
};
