const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// muse

const { MUSE_SERVICE, MuseClient, zipSamples, channelNames } = require('muse-js');
//const noble = require('noble');
//const bleat = require('bleat').webbluetooth;
//const { Observable } = require('rxjs');
const ajax = require('es-ajax');
const iconURI = require('./assets/muse_icon');
const client = new MuseClient() 

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
        let button = document.createElement("button");
        button.textContent = "Connect";
        button.addEventListener("click", connectMuse);
        document.body.appendChild(button);

        async function connectMuse () {
          await muse.connect();
          await muse.start();
          stream();
        }
        /*
        (async() => {
            console.log('connect')
            client.connectionStatus.subscribe((status) => {
                console.log(status ? 'Connected!' : 'Disconnected');
            });
            try {
                client.enableAux = true;
                await client.connect();
                await client.start();
                var name = client.deviceName;
            } catch (err) {
                console.error('Connection failed', err);
            }
        });*/      
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