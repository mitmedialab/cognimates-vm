const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');


const muse = require('muse-js');
const rxjs = require('rxjs');
const { map, filter, take } = require('rxjs/operators');

const leftEyeChannel = muse.channelNames.indexOf('AF7');
const rightEyeChannel = muse.channelNames.indexOf('AF8');
const leftEarChannel = muse.channelNames.indexOf('TP9');
const rightEarChannel = muse.channelNames.indexOf('TP10');

const electrode = channel => filter(r => r.electrode === channel);
const mapSamples = map(r => Math.max(...r.samples.map(n => Math.abs(n))));
const threshold = map(max => max > 500);

const iconURI = require('./assets/muse_icon');

var client = new muse.MuseClient()
var leftSensor = new rxjs.BehaviorSubject(0)
var rightSensor = new rxjs.BehaviorSubject(0)
var leftEar = new rxjs.BehaviorSubject(0)
var rightEar = new rxjs.BehaviorSubject(0)
var gatt, service;

const notificationOptions = {icon: iconURI}

class Scratch3Muse {
    constructor (runtime) {
        this.runtime = runtime;
        Notification.requestPermission()
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
                {
                    opcode: 'getSignal',
                    blockType: BlockType.REPORTER,
                    text: 'Get value of [TEXT]?',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            menu: 'signals',
                            defaultValue: 'left sensor'
                        }
                    }
                }
                
            ],
            menus: {
                 trueFalse: ['true', 'false'],
                 signals: ['left sensor', 'right sensor', 'left ear', 'right ear']
            }
        };
    }

    connect(args, util){
        
        var myNotification = new Notification('Click to Connect to Muse', notificationOptions);
        myNotification.addEventListener('click', function(e){
            myNotification.close()
            const device = navigator.bluetooth.requestDevice({
                filters: [{ services: [muse.MUSE_SERVICE ]}]
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
                console.log('client readings',client.eegReadings)
                client.controlResponses.subscribe(x => console.log('Response:', x));          
            }).catch(console.log(client.connect()))  
        });     
    }

    _thresholdSignal(value, thresh) {
        if (value > thresh) {
            console.log('value', value)
            return true;
        } else {
            return false;
        }
    }

    _eegSignal(channel) {
        client.eegReadings.pipe(
            electrode(channel),
            mapSamples,
            take(1)            
        ).subscribe(value => {
            if (channel == leftEyeChannel){
                leftSensor.next(value)
                return leftSensor.value
            }
            if (channel == rightEyeChannel) {
                rightSensor.next(value)
                return rightSensor.value
            }
            if (channel == leftEarChannel){
                leftEar.next(value)
            }
            if (channel == rightEarChannel){
                rightEar.next(value)
            }         
        })
    }

    museBlink(args, util){
        setTimeout(() => {
            this._eegSignal(leftEyeChannel)        
        }, 1000)
        return this._thresholdSignal(leftSensor.value, 500)   
    }

    getSignal (args, util) {
        if (args.TEXT === 'left sensor'){
            this._eegSignal(leftEyeChannel)
            return leftSensor.value
        }
        if (args.TEXT === 'right sensor'){
            this._eegSignal(rightEyeChannel)
            return rightSensor.value
        }
        if (args.TEXT === 'left ear'){
            this._eegSignal(leftEarChannel)
            return leftEar.value
        }
        if (args.TEXT === 'right ear'){
            this._eegSignal(rightEarChannel)
            return rightEar.value
        }
    }
}

module.exports = Scratch3Muse;