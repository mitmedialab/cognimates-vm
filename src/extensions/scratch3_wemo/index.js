const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// sentiment

const iconURI = require('./assets/wemo_icon');
const Wemo = require('wemo-client');
const wemo = new Wemo();


class Scratch3Wemo {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'wemo',
            name: 'Wemo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connectWemo',
                    blockType: BlockType.COMMAND,
                    text: 'Detect your switch'
                },
                {
                    opcode: 'turnOn',
                    blockType: BlockType.BOOLEAN,
                    text: 'Turn [TOGGLE]',
                    arguments: {
                        TOGGLE: {
                            type: ArgumentType.STRING,
                            menu: 'toggle',
                            defaultValue: 'on'
                        }
                    }
                }
            ],
            menus: {
             	toggle: ['on', 'off']
            }
        };
    }

    foundDevice (err, device) {
        if (device.deviceType === Wemo.DEVICE_TYPE.LightSwitch) {
            console.log('Wemo Light Switch found: %s', device.friendlyName);
      
            let state = 'off';
            const client = this.client(device);
      
            // The switch changed its state
            client.on('binaryState', function (value) {
                state = (value === '1') ? 'on' : 'off';
                console.log('Light Switch %s is %s', this.device.friendlyName, state);
            });
      
            // Toggle the switch every two seconds
            setInterval(() => {
                client.setBinaryState(state === 'on' ? 0 : 1);
            }, 2000);
      
        }
    }

    connectWemo() {
        wemo.discover(foundDevice);
    }

    turnOn (args, util){
        let state = 'off';
        const client = this.client(device);
        const toggle = args.TOGGLE;
        client.on('binaryState', function (value) {
            state = (value === '1') ? 'on' : 'off';
            console.log('Light Switch %s is %s', this.device.friendlyName, state);

        });
        client.setBinaryState(state === toggle ? 0 : 1);
    }
  

}

module.exports = Scratch3Wemo;