import {getUsername} from 'hue-module';
import {read} from 'fs';

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');
const SocketIO = require('socket.io-client');
const ajax = require('es-ajax');
// hue

const iconURI = require('./assets/hue_icon');
const pulseTime = 500;
const loginRetryAmount = 6;
const loginRetryTimeout = 5000;
const lightMap = {};
const onOffMap = {On: true, Off: false};
let ip = localStorage.getItem('hueIp');
let username = localStorage.getItem('hueUsername');
const lightMenuItems = {Hue1: 'Hue color lamp 1', Hue2: 'Hue color lamp 2'};

let REGISTER_URL = "http://192.168.1.149/api/"
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
                    text: 'set ip [IP] and username [USERNAME]',
                    arguments: {
                        IP: {
                            type: ArgumentType.STRING,
                            defaultValue: '192.168.1.149'
                        },
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'mSF1iiV2fyqmDGFX5He7xJCI5kkJtuUxvYoqDD89'
                        }
                    }
                },
                {
                    opcode: 'toggleLight',
                    blockType: BlockType.COMMAND,
                    text: 'toggleLight'
                },
                {
                    opcode: 'loadLights',
                    blockType: BlockType.COMMAND,
                    text: 'loadLights'
                },
                {
                    opcode: 'getLightStatus',
                    blockType: BlockType.REPORTER,
                    text: 'Get Light Status '
                },
                {
                    opcode: 'getLightBrightness',
                    blockType: BlockType.REPORTER,
                    text: 'Get Light Brightness'
                },
                {
                    opcode: 'setLightStatus',
                    blockType: BlockType.COMMAND,
                    text: 'Set light [LIGHT] status to [STATUS]',
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            // menu: light,
                            defaultValue: 'Hue color lamp 1'
                        },
                        STATUS: {
                            type: ArgumentType.STRING,
                            menu: status,
                            defaultValue: 'On'
                        }
                    }

                },
                {
                    opcode: 'setBrightness',
                    blockType: BlockType.COMMAND,
                    text: 'Set light [LIGHT] brightness to [BRIGHT]',
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            // menu: light,
                            defaultValue: 'Hue color lamp 1'
                        },
                        BRIGHT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }

                }
            ],
            menus: {
                status: ['On', 'Off']
                // light: lightMenuItems
            }
        };
    }
   
    _shutdown () {

    }

    _getStatus () {
        if (ip === null && username === null) {
            return {status: 1, msg: 'Configuration required, refresh page and press button on hub'};
        }
        if ($.isEmptyObject(lightMap)) {
            return {status: 1, msg: 'No lights found'};
        }
        return {status: 2, msg: 'Ready'};
    }

    connectMyHue (args, util) {
        ip = args.IP.trim();
        localStorage.setItem('hueIp', ip);
        username = args.USERNAME.trim();
        localStorage.setItem('hueUsername', username);
    }

    toggleLight(args, util){
        // const passphrase = "mSF1iiV2fyqmDGFX5He7xJCI5kkJtuUxvYoqDD89";
        request.get(REGISTER_URL, {form: {username: username}}, (err, httpResponse, body) => {
            if (err == null) {
                const res = JSON.parse(body);
                if (res.username != undefined) {
                    console.log('registerUser: Ok');
                } else console.log('registerUser: Fail');
            } else {
                console.log(`Error: ${err.message}`);
            }
        });
        ajax('http://' + ip + '/api/' + username + '/lights/' + args.LIGHT + '/state')
            .put()
            .then(function(response){
                data: '{"on":' + onOffMap[args.STATUS] + '}'
            })
            .catch(function(err) {
                console.log(err);
              });
    }


    setLightStatus(args, util){
        ajax('http://' + ip + '/api/' + username + '/lights/' + args.LIGHT + '/state')
            .put({
                data: '{"on":' + args.STATUS + '}'
            })
            .catch(err => {
                console.log(err);
            // .then(callback);
        });
    }

    setBrightness (args, util) {
        ajax(`http://${ip }/api/${username }/lights/${args.LIGHT}/state`)
           .put({
                data: `{"bri":${ args.BRIGHT}}`
           })
           .catch(err => {
                console.log(err);
            });
    }

    
    getLightStatus (args, util) {
        ajax(`http://${ ip }/api/${username}/lights/${args.LIGHT}`)
            .get()
            .then(data => {
                callback(data.on);
            })
            .catch(err => {
                console.log(err);
            });
    }

    getLightBrightness (args, util, callback) {
        $.get(`http://${ip }/api/${ username}/lights/${args.LIGHT}`, data => {
            callback(data.bri);
        });
    }


    checkIp (ipToCheck, retries) {
        return ajax(`http://${ipToCheck }/api`)
            .post({
                dataType: 'json',
                data: '{"devicetype": "scratch#scratchUser"}',
                timeout: 500
            })
            .then(data => {
                if (data[0] && data[0].success && data[0].success.username) {
                    connectMyHue(ipToCheck, data[0].success.username)
                } else if (data[0].error && data[0].error.type === 101 && retries > 0) {
                    return timer(loginRetryTimeout).then(() => {
                        return checkIp(ipToCheck, retries - 1);
                    });
                }
            }) 
    }

    timer (timeout) {
        const deferred = $.Deferred();
        setTimeout(deferred.resolve, timeout);
        return deferred.promise();
    }

    loadLights () {
        return ajax(`http://${ ip }/api/${username}/lights`)
            .get()
            .then(lights => {
                $.each(lights, (key, value) => {
                    lightMenuItems.push(value.name);
                    lightMap[value.name] = key;
                });
            });
        console.log(lightMenuItems);
    }

    getLocalIp () {
        const deferred = $.Deferred();
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; // compatibility for firefox and chrome
        let pc = new RTCPeerConnection({iceServers: []}), noop = function () {
        };
        pc.createDataChannel(''); // create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
        pc.onicecandidate = function (ice) { // listen for candidate events
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            const localIp = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
            pc.onicecandidate = noop;
            deferred.resolve(localIp);
        };
        return deferred.promise();
    }

    loadHue() {
    //     if (ip && username) {
    //         then(register);
    //     } else {
    //         getLocalIp().then(localIp => {
    //             let baseIp = localIp.replace(/\d*$/, '');

    //             return $.when.apply($, _.map(_.range(1, 255), (_, i) => {
    //                 return checkIp(baseIp + i, loginRetryAmount);
    //             }));
    //         })
    //         then(register);
    //     }
    }

   

    startHeartbeat (pulseTime) {
        // setTimeout() {
        //     turnOnLights(host, result.username);
        // }, pulseTime);
        // turnOfLights(host, result.username);
    }

}
module.exports = Scratch3Hue;
