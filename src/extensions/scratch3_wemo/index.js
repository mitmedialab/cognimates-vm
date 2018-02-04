// const ArgumentType = require('../../extension-support/argument-type');
// const BlockType = require('../../extension-support/block-type');
// const Clone = require('../../util/clone');
// const Cast = require('../../util/cast');
// const Timer = require('../../util/timer');
// const request = require('request');
// const RenderedTarget = require('../../sprites/rendered-target');


// const iconURI = require('./assets/wemo_icon');
// var WeMo = require('wemo.js');

// WeMo.discover(function(wemos) {

//     console.log(wemos);
//   });
// // var wemoSwitch = new WeMo('192.168.1.102', 49154);

// // var Wemo = require('wemo-client');
// // var wemo = new Wemo();

// class Scratch3Wemo {
//     constructor (runtime) {
//         this.runtime = runtime;
  
//     }

//     getInfo () {
//         return {
//             id: 'wemo',
//             name: 'Wemo',
//             blockIconURI: iconURI,
//             blocks: [
//                 {
//                     opcode: 'connectWemo',
//                     blockType: BlockType.COMMAND,
//                     text: 'Detect your switch'
//                 },
//                 {
//                     opcode: 'turnOn',
//                     blockType: BlockType.BOOLEAN,
//                     text: 'Turn [TOGGLE]',
//                     arguments: {
//                         TOGGLE: {
//                             type: ArgumentType.STRING,
//                             menu: 'toggle',
//                             defaultValue: 'on'
//                         }
//                     }
//                 }
//             ],
//             menus: {
//              	toggle: ['on', 'off']
//             }
//         };
//     }

//     foundDevice (err, device) {
//     }

//     connectWemo() {
//         wemo.discover(foundDevice);
//     }

//     turnOn (args, util){
        
//     }
  

// }

// module.exports = Scratch3Wemo;