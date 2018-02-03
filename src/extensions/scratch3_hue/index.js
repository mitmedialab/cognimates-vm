const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// hue

const iconURI = require('./assets/hue_icon');
// const huepi = require('huepi');

const MyHue = new huepi();
var heartbeatInterval = 1000;

class Scratch3Hue {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'hue',
            name: 'Smart Lights',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connectMyHue',
                    blockType: BlockType.COMMAND,
                    text: 'Connect my lamp'
                },
                {
                    opcode: 'startHeartbeat',
                    blockType: BlockType.BOOLEAN,
                    text: 'Start Heartbeat'
                },
                {
                    opcode: 'onLightSwitchOn',
                    blockType: BlockType.BOOLEAN,
                    text: 'Turn Lamp on'
                },
                {
                    opcode: 'onLightSwitchOff',
                    blockType: BlockType.BOOLEAN,
                    text: 'Turn Lamp off'
                }
                
            ],
            menus: {
            }
        };
    }
   
    connectMyHue () {
        console.log('Discovering hue Bridge via hue Portal');
        MyHue.PortalDiscoverLocalBridges().then(() => {
            console.log(`Bridge IP: ${MyHue.BridgeIP}`);
            MyHue.BridgeGetConfig().then(() => {
                console.log(`Bridge ID: ${MyHue.BridgeID}`);
                console.log(`Bridge Name: ${MyHue.BridgeName}`);
                MyHue.BridgeGetData().then(() => {
                    console.log(`Bridge Username: ${MyHue.Username}`);
                    startHeartbeat();
                }, () => {
                    console.log('Please press connect button on the Bridge');
                    MyHue.BridgeCreateUser().then(() => {
                        console.log(`Bridge Username Created: ${  MyHue.Username}`);
                        StartHeartbeat();
                    }, () => {
                        console.log('.Please press connect button on the Bridge.');
                        setTimeout(ConnectMyHue, 1000);
                    });
                });
            }, () => {
                console.log('Unable to Retreive Bridge Configuration');
                setTimeout(ConnectMyHue, 1000);
            });
        }, () => {
            console.log('Unable to find Local Bridge via hue Portal');
            setTimeout(ConnectMyHue, 3000);
        });
    }

   
    
    statusHeartbeat () {
        const PrevHueLights = MyHue.Lights; // Store Previous State of Lights
        MyHue.LightsGetData().then(() => {
            // Triggers on Reachable which actually means Powered On/Off in my case ;-)
            LightNr = 1;
            while (MyHue.Lights[MyHue.LightGetId(LightNr)] !== undefined) {
                if ((MyHue.Lights[MyHue.LightGetId(LightNr)].state.reachable) !== (PrevHueLights[MyHue.LightGetId(LightNr)].state.reachable)) {
                    if (MyHue.Lights[MyHue.LightGetId(LightNr)].state.reachable) {
                        onLightSwitchOn(MyHue.LightGetId(LightNr));
                    } else {
                        onLightSwitchOff(MyHue.LightGetId(LightNr));
                    }
                }
                LightNr++;
            }
        }, () => {
            console.log('statusHeartbeat BridgeGet Failed');
            clearInterval(heartbeatInterval);
            ConnectMyHue();
        });
    }
    startHeartbeat () {
        MyHue.GroupAlertSelect(1);
        heartbeatInterval = setInterval(statusHeartbeat, 2500);
    }

    onLightSwitchOn (lightNr) {
        console.log(`LightSwitch ${lightNr} On  - ${MyHue.Lights[MyHue.LightGetId(lightNr)].name}`);
        MyHue.GroupOn(1);
        MyHue.GroupSetCT(1, 467);
        MyHue.GroupSetBrightness(1, 144);
    }

    onLightSwitchOff (lightNr) {
        console.log(`LightSwitch ${lightNr} Off - ${MyHue.Lights[MyHue.LightGetId(lightNr)].name}`);
        MyHue.GroupOff(1);
    }

}

module.exports = Scratch3Hue;
