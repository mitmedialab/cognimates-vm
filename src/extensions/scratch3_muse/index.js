const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');


const { MUSE_SERVICE, MuseClient, zipSamples, channelNames } = require('muse-js');
//const rxjs = require("rxjs");
const ajax = require('es-ajax');

const { Observable, BehaviorSubject, ReplaySubject, from, of, range, merge, timer, interval } = require('rxjs');
const { map, filter, switchMap, take } = require('rxjs/operators');
import {toPromise} from 'rxjs/operator/toPromise';

const leftEyeChannel = channelNames.indexOf('AF7');
const rightEyeChannel = channelNames.indexOf('AF8');
const leftEarChannel = channelNames.indexOf('TP9');
const rightEarChannel = channelNames.indexOf('TP10');
const electrode = channel => filter(r => r.electrode === channel);
const mapSamples = map(r => Math.max(...r.samples.map(n => Math.abs(n))));
const topromise = toPromise();
const threshold = map(max => max > 500);

const iconURI = require('./assets/muse_icon');

var client = new MuseClient()
var leftBlinks = new BehaviorSubject(false)
var rightBlinks = new BehaviorSubject(false)
var leftClench = new BehaviorSubject(false)
var rightClench = new BehaviorSubject(false)
var blinkValue = new BehaviorSubject(0)
var gatt, service;

const notificationOptions = {icon: iconURI}

class Scratch3Muse {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'muse',
            name: 'Muse',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: 'Connect Muse'
                },
                {
                    opcode: 'museBlink',
                    blockType: BlockType.HAT,
                    text: 'When I blink'
                },
                /*{
                    opcode: 'museClench',
                    blockType: BlockType.HAT,
                    text: 'When I clench my jaw'
                },
                {
                    opcode: 'museEeg',
                    blockType: BlockType.HAT,
                    text: 'When I focus'
                },*/
                {
                    opcode: 'getSignal',
                    blockType: BlockType.REPORTER,
                    text: 'What signal do you want to read: [TEXT]?',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            menu: 'signals',
                            defaultValue: 'blink'
                        }
                    }
                }
                
            ],
            menus: {
                 trueFalse: ['true', 'false'],
                 signals: ['blink']
            }
        };
    }

    connect(args, util){
        var myNotification = new Notification('Click to Connect to Muse', notificationOptions);
        myNotification.addEventListener('click', function(e){
            myNotification.close()
            const device = navigator.bluetooth.requestDevice({
                filters: [{ services: [MUSE_SERVICE ]}]
            }).then(device => {
                gatt = device.gatt.connect()
                return gatt
            }).then(gatt => {
                return client.connect(gatt)
            }).then(() => {
                console.log('connected')
                console.log(client)
                return client.start()
            }).then(() => {
                console.log('started')
                console.log('client properties', Object.getOwnPropertyNames(client))
                console.log('client readings',client.eegReadings)
                client.controlResponses.subscribe(x => console.log('Response:', x));           

                

            }).catch(console.log(client.connect()))
    
        });
        
    }

    thresholdSignal(value, thresh) {
        if (value > thresh) {
            console.log('value', value)
            return true;
        } else {
            return false;
        }
    }

    _eegBlink(channel) {
        client.eegReadings.pipe(
            electrode(channel),
            mapSamples,
            take(1)            
        ).subscribe(value => {
            if (channel == leftEyeChannel){
                blinkValue.next(value)
                leftBlinks.next(this.thresholdSignal(value, 500))
                return leftBlinks.value
            }
            if (channel == rightEyeChannel) {
                rightBlinks.next(this.thresholdSignal(value, 500))
                return rightBlinks.value
            }
            
        })
    }

    _eegClench(channel) {
        client.eegReadings.pipe(
            electrode(channel),
            mapSamples,
            take(1)
        ).subscribe(value => {
            if (channel == leftEarChannel) {
                leftClench.next(this.thresholdSignal(value, 700))
                return leftClench.value
            }
            if (channel == rightEarChannel) {
                rightClench.next(this.thresholdSignal(value, 700))
                return rightClench
            }
        })
    }

    museClench(args, util) {
        setTimeout(() => {
            this._eegClench(rightEarChannel)      
        }, 1000)
        return rightClench.value         
    }

    museBlink(args, util){
        setTimeout(() => {
            this._eegBlink(leftEyeChannel)
            
        }, 1000)
        return leftBlinks.value   
    }

    winkRight (args, util) {
        setTimeout(() => {
            this._eegBlink(rightEyeChannel)
            
        }, 1000)
        return rightBlinks.value
    }
    
    whenNegative (args, util) {
        if (feeling == 'negative'){
            return true;
        }
        return false;         
    }

    getSignal (args, util) {
        this._eegBlink(leftEyeChannel)
        return blinkValue.value
    }
}

module.exports = Scratch3Muse;