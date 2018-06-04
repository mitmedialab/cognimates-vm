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

const { Observable, Subject, ReplaySubject, from, of, range, merge, timer, interval } = require('rxjs');
const { map, filter, switchMap, take } = require('rxjs/operators');


const iconURI = require('./assets/muse_icon');

var client = new MuseClient()
var leftBlinks = Observable.create()
var rightBlinks = Observable.create()
var gatt, service;
var blink = false;

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
                {
                    opcode: 'museEeg',
                    blockType: BlockType.HAT,
                    text: 'When I focus'
                },
                {
                    opcode: 'getSignal',
                    blockType: BlockType.REPORTER,
                    text: 'What signal do you want to read: [TEXT]?',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'your text here'
                        }
                    }
                }
                
            ],
            menus: {
             	trueFalse: ['true', 'false']
            }
        };
    }

    connect(args, util){
        var myNotification = new Notification('Click to Connect to Muse');
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
                console.log(client.eegReadings)

                

            }).catch(console.log(client.connect()))
    
        });
        
    }

    museBlink (args, util) {
        const leftEyeChannel = channelNames.indexOf('AF7');
        const rightEyeChannel = channelNames.indexOf('AF8');
        const electrode = channel => filter(r => r.electrode === channel);
        const choose = take(1);
        const mapSamples = map(r => Math.max(...r.samples.map(n => Math.abs(n))));
        const threshold = filter(max => max > 500);
        leftBlinks = client.eegReadings.pipe(
            choose,
            electrode(rightEyeChannel),
            mapSamples,
            threshold
        ).subscribe(value => {
            console.log('blink', value)
            //blink = true
            return true;
        })
        rightBlinks = client.eegReadings.pipe(
            choose,
            electrode(rightEyeChannel),
            mapSamples,
            threshold
        ).subscribe(value => {
            console.log('blink', value)
            //blink = true
            return true;
        })
        /*
        if (blink === true){
            return true;
        } else {
            return false;
        }*/
        return false; 
    }
    
    whenNegative (args, util) {
        if (feeling == 'negative'){
            return true;
        }
        return false;         
    }

    museEeg(){

    }
    getSignal (args, util) {
     
    }
}

module.exports = Scratch3Muse;