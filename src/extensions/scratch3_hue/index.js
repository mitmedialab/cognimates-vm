import {getUsername} from 'hue-module';

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// hue

const iconURI = require('./assets/hue_icon');
const pulseTime = 500;
var loginRetryAmount = 6;
var loginRetryTimeout = 5000;
var lightMap = {};
var onOffMap = {"On": true, "Off": false};
var ip = localStorage.getItem("hueIp");
var username = localStorage.getItem("hueUsername");
let lightMenuItems = { Hue1 : "Hue color lamp 1", Hue2 : "Hue color lamp 2"};



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
                    opcode: 'loadHue',
                    blockType: BlockType.COMMAND,
                    text: 'Connect to my lamp'
                },
                {
                    opcode: 'toggleLight',
                    blockType: BlockType.COMMAND,
                    text: 'Set light [LIGHT] status to [STATUS]',
                    rguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            menu: light,
                            defaultValue: 'Hue color lamp 1'
                        },
                        STATUS: {
                            type: ArgumentType.STRING,
                            menu: status,
                            defaultValue: '' 
                        }
                    }

                },
                {
                    opcode: 'setBrightness',
                    blockType: BlockType.COMMAND,
                    text: 'Set light [LIGHT] brightness to [BRIGHT]',
                    rguments: {
                        LIGHT: {
                            type: ArgumentType.STRING,
                            menu: light,
                            defaultValue: ''
                        },
                        BRIGHT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50 
                        }
                    }

                }
            ],
            menus: {
                status: ['On', 'Off'],
                light: lightMenuItems
            }
        };
    }
   
    _shutdown() {

    }

    _getStatus() {
        if (ip === null && username === null) {
            return {status: 1, msg: 'Configuration required, refresh page and press button on hub'};
        }
        if ($.isEmptyObject(lightMap)) {
            return {status: 1, msg: 'No lights found'};
        }
        return {status: 2, msg: 'Ready'};
    }

    connectMyHue (args, util, callback) {
        ip = args.IP.trim();
        localStorage.setItem("hueIp", ip);
        username = args.USERNAME.trim();
        localStorage.setItem("hueUsername", username);
        callback();
    };

    toggleLight(args, util, callback){
        $.ajax({
            url: 'http://' + ip + '/api/' + username + '/lights/' + lightMap[args.LIGHT] + '/state',
            type: 'PUT',
            data: '{"on":' + onOffMap[args.STATUS] + '}'
        }).always(callback);
    }

    setBrightness (args, util, callback) {
        $.ajax({
            url: 'http://' + ip + '/api/' + username + '/lights/' + lightMap[args.LIGHT] + '/state',
            type: 'PUT',
            data: '{"bri":' + args.BRIGHT + '}'
        }).always(callback);
    }

    
    get_light_status (light, callback) {
        $.get('http://' + ip + '/api/' + username + '/lights/' + lightMap[light], function (data) {
            callback(data.on)
        })
    }

    get_light_brightness(light, callback) {
        $.get('http://' + ip + '/api/' + username + '/lights/' + lightMap[light], function (data) {
            callback(data.bri)
        })
    }


    checkIp(ipToCheck, retries) {
        return $.ajax({
            method: 'POST',
            url: 'http://' + ipToCheck + '/api',
            dataType: "json",
            data: '{"devicetype": "scratch#scratchUser"}',
            timeout: 500
        }).then(function (data) {
            if (data[0] && data[0].success && data[0].success.username) {
                ext.set_config(ipToCheck, data[0].success.username, function () {
                });
                return loadLights()
            } else if (data[0].error && data[0].error.type === 101 && retries > 0) {
                return timer(loginRetryTimeout).then(function () {
                    return checkIp(ipToCheck, retries - 1);
                });
            }
        }, $.Deferred().resolve().promise)
    }

    timer(timeout) {
        var deferred = $.Deferred();
        setTimeout(deferred.resolve, timeout);
        return deferred.promise();
    }

    loadLights() {
        return $.get('http://' + ip + '/api/' + username + '/lights')
            .then(function (lights) {
                $.each(lights, function (key, value) {
                    lightMenuItems.push(value.name);
                    lightMap[value.name] = key;
                });
            });
    }

    getLocalIp() {
        var deferred = $.Deferred();
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
        var pc = new RTCPeerConnection({iceServers: []}), noop = function () {
        };
        pc.createDataChannel("");    //create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
        pc.onicecandidate = function (ice) {  //listen for candidate events
            if (!ice || !ice.candidate || !ice.candidate.candidate)  return;
            var localIp = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
            pc.onicecandidate = noop;
            deferred.resolve(localIp);
        };
        return deferred.promise();
    }

   loadHue(){
        if (ip && username) {
            loadLights().then(register);
        } else {
            getLocalIp().then(function (localIp) {
                var baseIp = localIp.replace(/\d*$/, '');

                return $.when.apply($, _.map(_.range(1, 255), function (_, i) {
                    return checkIp(baseIp + i, loginRetryAmount);
                }))
            }).then(register)
        }
    }

    changeColor (color) {
    
    }


    startHeartbeat (pulseTime) {
        // setTimeout() {
        //     turnOnLights(host, result.username);
        // }, pulseTime);
        // turnOfLights(host, result.username);
    }

}
module.exports = Scratch3Hue;

