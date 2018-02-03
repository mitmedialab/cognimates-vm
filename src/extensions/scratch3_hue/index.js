import { getUsername } from 'hue-module';

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// hue

const iconURI = require('./assets/hue_icon');

var hue = require('hue-module');
let pulseTime = 500;
const host = "192.168.1.149";

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
   
    // getUsername(){
    //     hue.getUsername(err, result) {
    //         if (err) {
    //             console.log(err);
    //             return ;
    //         } 
    //     }  
    // };
    // const username = getUsername();

    // connectMyHue = function(host) {
    //     hue.load({
    //         "host"  : host
    //     });
    
    //     hue.getUsername(function(err, result) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    
    //         turnOnLights(host, result.username);
    //     });
    // };

    // connectMyHue (host) {
    //     const username = getUsername();
    //     hue.load({
    //         "host"  : host, 
    //         "key"   : username,
    //         "port"  : 80
    //     });
        
    // };   
    

    changeColor (color) {
        if (hue.load) {
        hue.lights(lights)  {
            for (i in lights) {
                if (lights.hasOwnProperty(i)) {
                    hue.change(lights[i].set({"on": true, "rgb":[0,255,255]}));
                }
            }
        };
        
    }
    turnOnLights (host, username) {
        hue.load{
            "host"  : host,
            "key"   : username
        };
    
        hue.lights(lights) {
            for (var i in lights) {
                if (lights.hasOwnProperty(i)) {
                    hue.change(lights[i].set({
                        "on"    : true,
                        "rgb"   : [
                            Math.random() * 256 >>> 0,
                            Math.random() * 256 >>> 0,
                            Math.random() * 256 >>> 0
                        ]
                    }));
                }
            }
        };
    };

    turnOfLights (host, username) {
        hue.load(
            "host"  : host,
            "key"   : username
        );
    
        hue.lights(lights) {
            for (var i in lights) {
                if (lights.hasOwnProperty(i)) {
                    hue.change(lights[i].set({
                        "on"    : false
                    }));
                }
            }
        };
    };
    onLightSwitchOn () {
        turnOnLights(host, result.username);
    }

    onLightSwitchOff () {
        turnOfLights(host, result.username);       
    }
    startHeartbeat (pulseTime) {
        setTimeout(() => {
            turnOnLights(host, result.username);
        }, pulseTime);
        turnOfLights(host, result.username);       
    }
}

module.exports = Scratch3Hue;





// hue.nupnpDiscover(function(error, hosts) {

//     if (error) {
//         console.error(error);
//         return;
//     }

//     for (var i in hosts) {
//         if (hosts.hasOwnProperty(i)) {
//             loadBridge(hosts[i].internalipaddress);
//         }
//     }
// });