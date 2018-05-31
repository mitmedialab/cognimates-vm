const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// muse

const { MUSE_SERVICE, MuseClient, zipSamples, channelNames } = require('muse-js');
const ajax = require('es-ajax');
const iconURI = require('./assets/muse_icon');
//const bluetooth = require("webbluetooth").bluetooth;

var client = new MuseClient()

Notification.requestPermission()

        

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
        console.log(client)
        var myNotification = new Notification('Click to Connect to Muse');
        myNotification.addEventListener('click', function(e){
            client.connect().then(function() {
            client.start()
            console.log('success')
        }).catch(console.log(client.connect()))
    
        });
    }



    stream () {
      muse.eegReadings.subscribe(eeg => console.log(eeg));
    }

    museBlink (args, util) {
        if (blink == 'positive'){
            return true;
        }
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