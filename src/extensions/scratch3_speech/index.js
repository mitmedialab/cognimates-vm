const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const Timer = require('../../util/timer');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');

// speech
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

// let sentiment = require('sentiment');
// let localSentiment = 1;
// let isHappy = true;
// const ajax = require('es-ajax');
const iconURI = require('./assets/speech_icon');

const REQUEST_STATE = {
    IDLE: 0,
    PENDING: 1,
    FINISHED: 2
}

let speechState = REQUEST_STATE.IDLE;


class Scratch3SpeechBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this.SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.msSpeechRecognition ||
                          window.oSpeechRecognition;

    /**
     * A flag to indicate that speech recognition is paused during a speech synthesis utterance
     * to avoid feedback. This is used to avoid stopping and re-starting the speech recognition
     * engine.
     * @type {Boolean}
     */
    this.speechRecognitionPaused = false;

    /**
     * The most recent result from the speech recognizer, used for a reporter block.
     * @type {String}
     */
    this.latest_speech = '';

    /**
     * The name of the selected voice for speech synthesis.
     * @type {String}
     */
    this.current_voice_name = 'default';

    /**
     * The current speech synthesis utterance object.
     * Storing the utterance prevents a bug in which garbage collection causes the onend event to fail.
     * @type {String}
     */
    this.current_utterance = null;

    this.runtime.HACK_SpeechBlocks = this;

    //At what point is no match declared (0.0 = perfection, 1.0 = very loose).
    this.Match_Threshold = 0.5;

    //How far to search for a match (0 = exact location. 1000+ = broad match)
    //A match this many characters away from the expected location will add
    //1.0 to the score 
    this.Match_Distance = 1000;
    
    this.Match_MaxBits = 32;
    }

    _setupMicrophone (){

    }

    getInfo () {
        return {
            id: 'watson_speech',
            name: 'Speech',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'speak',
                    blockType: BlockType.COMMAND,
                    text: 'Say: [PHRASE]',
                    arguments: {
                        PHRASE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hey'
                        }
                    }
                },
                {                
                    opcode: 'speechVoice',
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
                    opcode: 'startSpeechRecognition',
                    blockType: BlockType.COMMAND,
                    text: 'Turn speech recognition [SWITCH]',
                    arguments: {
                        SWITCH: {
                            type: ArgumentType.STRING,
                            menu: 'switches',
                            defaultValue: 'off'
                        }
                    }
                },
                {
                    opcode: 'whenIHear',
                    blockType: BlockType.HAT,
                    text: 'When I hear[TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        }
                    }
                },
                {
                    opcode: 'getLatestSpeech',
                    blockType: BlockType.REPORTER,
                    text: 'Get latest speech'
                },
                {
                    opcode: 'stopSpeaking',
                    blockType: BlockType.COMMAND,
                    text: 'Stop speaking'
                }
                
            ],
            menus: {
                voices: ['Veena', 'Albert', 'Alex', 'Ellen'],
                switches: ['on', 'off']            
            }
        };
    }

    getHats() {
        return {
            speech_whenihear: {
                restartExistingThreads: false,
                edgeActivated: true
            }
        };
    };

    //Speech Synthesis Functions
    speechVoice (args, util){
        const str = args.VOICE;
        voice = voiceArray[str];
    }
    speechSay (tts) {
        speech.say(tts, voice);
        return;
    }

    speak (args, util) {
    	this.speechSay(args.PHRASE);
    }

    //Match Functions

    //Locate the best instance of 'pattern' in 'text' near 'loc'
    match_main (text, pattern, loc) {
        //Check for null inputs
        if (text == null || pattern == null || loc == null) {
            throw new Error('Null input. (match_main)');
        }

        loc = Math.max(0, Math.min(loc, text.length));
        if (text == pattern) {
            return 0;
        } else if (!text.length) {
            return -1;
        } else if (text.substring(loc, loc + pattern.length) == pattern) {
            return loc;
        } else {
            //Do a fuzzy compare
            return this.match_bitap_(text, pattern, loc);
        }
    };

    //Locate the best instance of 'pattern' in 'text' near 'loc' using the 
    //Bitap algorithm.
    match_bitap_ (text, pattern, loc) {
        if (pattern.length > this.Match_MaxBits) {
            throw new Error ('Pattern too long for this browser.');
        }

        //Initialize the alphabet.
        var s = this.match_alphabet_(pattern);

        var dmp = this;

        //Compute and return the score for a match with e errors and x location
        function match_bitapScore_(e,x) {
            var accuracy = e / pattern.length;
            var proximity = Math.abs(loc-x);
            if (!dmp.Match_Distance) {
                return proximity ? 1.0 : accuracy;
            }
            return accuracy + (proximity / dmp.Match_Distance);
        }

        //Highest score beyond which we give up
        var score_threshold = this.Match_Threshold;

        //Is there a nearby exact match?
        var best_loc = text.indexOf(pattern, loc);
        if (best_loc != -1) {
            score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
            best_loc = text.lastIndexOf(pattern, loc + pattern.length);
            if (best_loc != -1){
                score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
            }
        }

        //Initialize bit arrays
        var matchmask = 1 << (pattern.length - 1);
        best_loc = -1;

        var bin_min, bin_mid;
        var bin_max = pattern.length + text.length;
        var last_rd;

        for (var d = 0; d < pattern.length; d++) { 
            //Scan for the best match; each iteration allows for one more error.
            //Run a binary search to determine how far from 'loc' we can stray at 
            //this error level.
            bin_mid = 0;
            bin_mid = bin_max;
            while (bin_mid < bin_mid) { 
                if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                    bin_mid = bin_mid;
                } else {
                    bin_max = bin_mid;
                }
                bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
            }

            //Use the result from this iteration as the maximum for the next.
            bin_max = bin_mid;
            var start = Math.max(1, loc - bin_mid + 1);
            var finish = Math.min(loc + bin_mid, text.length) + pattern.length; 

            var rd = Array(finish + 2);
            rd[finish + 1] = (1 << d) - 1;
            for (var j = finish; j >= start; j--) {
                var charMatch = s[text.charAt(j-1)];
                if (d == 0) {
                    rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
                } else {
                    rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                            (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                            last_rd[j + 1];
                }
                if (rd[j] & matchmask) {
                    var score = match_bitapScore_(d, j - 1);

                    if (score <= score_threshold) {
                        score_threshold = score;
                        best_loc = j - 1;
                        if (best_loc > loc) {
                            start = Math.max(1, 2 * loc - best_loc);
                        } else {
                            break;
                        }
                    }
                }
            }
            if (match_bitapScore_(d + 1, loc) > score_threshold) {
                break;
            }
            last_rd = rd;
        }
        return best_loc;
    }

    //Initialize the alphabet for the Bitap algorithm
    match_alphabet_ (pattern) {
        var s = {};
        for (var i = 0; i < pattern.length; i++) {
            s[pattern.charAt(i)] = 0;
        }
        for (var i = 0; i < pattern.length; i++) {
            s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
        }
        return s;
    }

    _computeMatch (needle, haystack) {
        if (!needle || !haystack) {
            return -1;
        }

        var loc = 0;

        var match = this.match_main(haystack, needle, loc);
        if (match == -1) {
            console.log('No match');
        } else {
            var quote = haystack.substring(match, match + haystack.length);
            console.log('Match found at character' + match + ' ' + quote);
        }
        return match;
    }

    _speechMatches (needle, haystack) {
        let input = Cast.toString(needle).toLowerCase();
        input = input.replace(/[.?!]/g, '');
        input = input.trim();

        var match = this._computeMatch(needle, haystack);
        return match != -1;
    }



    //Speech Recognition Functions
    startSpeechRecognition(args, util) {
        this.recognition = new this.SpeechRecognition();
        this.recognition.interimResults = false;
        this.recognized_speech = [];

        this.recognition.onresult = function(event){
            if (this.speechRecognitionPaused) {
                return;
            }

            const SpeechRecognitionResult = event.results[event.resultIndex];
            const results = [];
            for (let k=0; k<SpeechRecognitionResult.length; k++) {
                results[k] = SpeechRecognitionResult[k].transcript.toLowerCase();
            }
            this.recognized_speech = results;
            console.log(this.recognized_speech.length);
            console.log(this.recognized_speech);
            
            if (this.recognized_speech.length == 0){
                console.log('yielding');
                util.yield();
            }
            this.latest_speech = this.recognized_speech[0];
            console.log(this.latest_speech);
        }.bind(this);

        this.recognition.onspeechend = function () {
            if (this.speechRecognitionPaused) {
                return;
            }
            this.recognition.start();
        }.bind(this);

        this.recognition.onstart = function () {
            console.log('Speech recognition started');
        };

        this.recognition.onerror = function (event) {
            console.error('Speech recognition error', event.error);
        };

        this.recognition.onnomatch = function () {
            console.log('Speech Recognition: no match');
        };
        if (args.SWITCH == 'on'){
            try {
                this.recognition.start();
            } catch(e) {
                console.error(e);
            }
        }
        
    };

    whenIHear (args, util) {

        if (!this.recognition) {
            return;
        }
        /*
        let input = Cast.toString(args.TEXT).toLowerCase();
        input = input.replace(/[.?!]/g, '');
        input = input.trim();

        if (input === '') return false;
        console.log(this.latest_speech);
        
        for (let i = 0; i<this.recognized_speech.length; i++){
            console.log(this.recognized_speech[i])
            if (this.recognized_speech[i].includes(input)) {
                console.log('Speech recognized');
                window.setTimeout(() => {
                    this.recognized_speech = [];
                }, 300);
                return true;
            }
        }
        
        if (this.latest_speech.includes(input)){
            return true;
        }
        else{
            return false;
        }
        */
        console.log('Using fuzzy');
        return this._speechMatches(args.TEXT, this.latest_speech);
    };

    getLatestSpeech () {
        console.log(this.recognized_speech);
        return this.latest_speech;
    };

    stopSpeaking () {
        speechSynthesis.cancel();
    };
    
}


module.exports = Scratch3SpeechBlocks;
