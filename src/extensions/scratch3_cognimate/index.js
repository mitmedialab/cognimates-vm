const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
let connected = false;
const Bundle = null;
const socket = null;
const RenderedTarget = require('../../sprites/rendered-target');

// cognimate
const iconURI = require('./assets/cognimate_icon');
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
let voice = 'Ellen';

// missions
const mission1 = require('./missions/mission1');
const mission2 = require('./missions/mission2');
const mission3 = require('./missions/mission3');
const mission4 = require('./missions/mission4');
const mission5 = require('./missions/mission5');
const mission7 = require('./missions/mission7');
const mission8 = require('./missions/mission8');
let mission = mission3;
const missionArray = {1:mission1, 2: mission2, 3: mission3, 4: mission4, 8: mission8};
let mission_initialized = false;
let stepIdx = 0;
let STATE = 0;
let notComplain = true;
let auxblocks = [];
let step;
let prev_wblocks = null;
let reminded = false;


class Scratch3Cognimate {

    constructor (runtime) {
        this.runtime = runtime;
        this._answer = '';
        this._questionList = [];

        // this.setIPVariable(this.getLocalIP());
        // when blocks move, call the function that calls missionCommander
        this.runtime.on('ANSWER', this._onAnswer.bind(this));
        this.runtime.on('PROJECT_START', this._resetAnswer.bind(this));
        this.runtime.on('PROJECT_STOP_ALL', this._clearAllQuestions.bind(this));
        this.onWorkspaceUpdate = this.onWorkspaceUpdate.bind(this);
        runtime.on('blocksChanged', this.onWorkspaceUpdate);
    }

    _onAnswer (answer) {
        this._answer = answer;
        const questionObj = this._questionList.shift();
        if (questionObj) {
            const [_question, resolve, target, wasVisible, wasStage] = questionObj;
            // If the target was visible when asked, hide the say bubble unless the target was the stage.
            if (wasVisible && !wasStage) {
                this.runtime.emit('SAY', target, 'say', '');
            }
            resolve();
            this._askNextQuestion();
        }
    }

    _resetAnswer () {
        this._answer = '';
    }

    _enqueueAsk (question, resolve, target, wasVisible, wasStage) {
        this._questionList.push([question, resolve, target, wasVisible, wasStage]);
    }

    _askNextQuestion () {
        if (this._questionList.length > 0) {
            const [question, _resolve, target, wasVisible, wasStage] = this._questionList[0];
            // If the target is visible, emit a blank question and use the
            // say event to trigger a bubble unless the target was the stage.
            if (wasVisible && !wasStage) {
                this.runtime.emit('SAY', target, 'say', question);
                this.runtime.emit('QUESTION', '');
            } else {
                this.runtime.emit('QUESTION', question);
            }
        }
    }

    _clearAllQuestions () {
        this._questionList = [];
        this.runtime.emit('QUESTION', null);
    }

    askAndWait (args, util) {
        const _target = util.target;
        return new Promise(resolve => {
            const isQuestionAsked = this._questionList.length > 0;
            this._enqueueAsk(String(args.QUESTION), resolve, _target, _target.visible, _target.isStage);
            if (!isQuestionAsked) {
                this._askNextQuestion();
            }
        });
    }

    getAnswer () {
        return this._answer;
    }

    getInfo () {
        return {
            id: 'tutor',
            name: 'Cognimate',
            blockIconURI: iconURI,
            blocks: [
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
                    opcode: 'tutorVoice',
                    blockType: BlockType.COMMAND,
                    text: 'set voice to [VOICE]',
                    arguments: {
                        VOICE: {
                            type: ArgumentType.STRING,
                            menu: 'voices',
                            defaultValue: 'Albert'
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
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'closeMission',
                    blockType: BlockType.COMMAND,
                    text: 'End current mission'
                }
                // {
                //     opcode: 'playAudio',
                //     blockType: BlockType.COMMAND,
                //     text: 'Play audio [name]',
                //     arguments: {
                //         name: {
                //             type: ArgumentType.STRING,
                //             defaultValue: ''
                //         }
                //     }
                // }
            ],
            menus: {
                voices: ['Veena', 'Agnes', 'Albert', 'Alex', 'Alice', 'Alva', 'Amelie', 'Anna', 'Bahh', 'Bells', 'Boing', 'Bruce', 'Bubbles', 'Carmit', 'Cellos', 'Damayanti',
                    'Daniel', 'Deranged', 'Diego', 'Ellen', 'Fiona', 'Fred', 'Hysterical', 'Ioana', 'Joana'],
            	mission: ['1','2','3', '4', '5', '6', '7', '8'],
            	lookAt: ['left', 'right', 'center', 'back'],
             	trueFalse: ['true', 'false']
            }
        };
    }
    onWorkspaceUpdate () {
    	if (!mission_initialized) {
    		return;
    	}
    	const blocks = this.runtime.getEditingTarget().blocks;
        const wblocks = [];
        // var blockevent = false;
        if (typeof mission !== 'undefined') {
            for (const i in blocks._blocks) {
                const block = {
                    opcode: null,
                    next: null
                };

                block.opcode = blocks._blocks[i].opcode;

                if (blocks._blocks[i].next != null) {
                    block.next = blocks._blocks[blocks._blocks[i].next].opcode;
                }
                wblocks.push(block);
            }
            if (!mission_initialized){
            	console.log('mission not initialized');
                this.missionCommander(wblocks);
            }
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

    missionCommander (wblocks) {
        auxblocks = [];
        for (let i = 0; i < wblocks.length; i++) {
            auxblocks.push(wblocks[i].opcode);
        }
        // if (STATE == 0 && stepIdx == 0 && JSON.stringify(auxblocks) != ['tutor.mission', 'tutor.menu.mission']) {
        //     if(!reminded) {
        //     	this.tutorSay("Please clear all blocks from the stage except for the Mission Number block. Then, re-run the mission.");
        //     	reminded = true;
        //     	return;
        //     }
        // }
        if (stepIdx < mission.steps.length){
            step = mission.steps[stepIdx];
            if (STATE == 0){
                console.log(JSON.stringify(step.init_blocks));
                console.log(JSON.stringify(auxblocks))
                if (JSON.stringify(auxblocks) === JSON.stringify(step.init_blocks)) {
                    this.tutorSay(step.init.text);
                    STATE = 1;
                }
            } else if ((STATE == 1)){
                if (JSON.stringify(auxblocks) === JSON.stringify(step.end_blocks)) {
                    STATE = 0;
                    stepIdx = stepIdx + 1;
                    this.tutorSay(step.ok.text);
                    this.missionCommander(wblocks);
                } else if (JSON.stringify(auxblocks) !== '[]'){
                    this.tutorSay(step.bad_block.text);
                    setTimeout(this.reinitComplain, 30000);
                }
            }
	      }
    }

    setupSocket () {
        const _this = this;
        socket.addEventListener('open', () => {
            console.log('Connected to jibo app frame');
        });

        socket.addEventListener('message', message => {
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
                    screenTouchTimer = setTimeout(resetScreenTouch, 1000);
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
                            resetHeadTouch();
                        }, 1000);
                    }
                }
            } else if (message.type == 'transaction') {
                _this.handleTransaction(message.status, message.payload);
            }
            console.log(message);
        });
    }

    /* Cognimate Functionality*/

    reinitComplain (){
        notComplain = true;
    }

    tutorVoice (args, util){
        const str = args.VOICE;
        voice = voiceArray[str];
        this.tutorSay('hello', voice);
    }
    tutorSay (tts) {
        speech.say(tts, voice);
        return;
    }

    tutorAnimate (block) {
        animateBlock(block, 100, 100, 5);
    }

    speak (args, util) {
    	this.tutorSay(args.phrase);
    }

    askQuestion (args, util) {
        this.tutorSay(args.question);
    }

    
    mission (args, util) {
    	reminded = true;
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


    _stackTimerNeedsInit (util) {
        return !util.stackFrame.timer;
    }

  
    _startStackTimer (util, duration) {
        util.stackFrame.timer = new Timer();
        util.stackFrame.timer.start();
        util.stackFrame.duration = duration;
        util.yield();
    }

    _checkStackTimer (util) {
        const timeElapsed = util.stackFrame.timer.timeElapsed();
        if (timeElapsed < util.stackFrame.duration * 1000) {
            util.yield();
        }
    }

  
    // Animation Help Functions

    linearInterpolate (percent) {
	  return percent;
    }

    animateBlock (block, dx, dy, seconds, optionalInterpolateFn) {
        const interpolate = optionalInterpolateFn || linearInterpolate;
        const dt = seconds * 1000; // Convert to milliseconds.
        const start = Date.now();
        let movedX = 0, movedY = 0;

        const step = function () {
            const now = Date.now();
            const percent = (now - start) / dt;
            if (percent < 1.0) {
                const stepX = interpolate(percent) * dx - movedX;
                const stepY = interpolate(percent) * dy - movedY;
                block.moveBy(stepX, stepY);
                movedX += stepX;
                movedY += stepY;
                window.requestAnimationFrame(step); // repeat
            } else {
                // Complete the animation.
                block.moveBy(dx - movedX, dy - movedY);
            }
        };
        step();
    }
}

module.exports = Scratch3Cognimate;
