const nets = require('nets');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const cast = require('../../util/cast');
const color = require('../../util/color');
const log = require('../../util/log');
const math = require('../../util/math-util');

/**
 * Host for discovery of Philips Hue bridge devices on the LAN.
 * @type {String}
 */
const DISCOVERY_HOST = 'https://www.meethue.com/api/nupnp';

/**
 * Delay time (milliseconds) between updates sent to a light.
 * @note This should not exceed 10 Hz for a single light or 4 Hz for a group.
 * @type {Number}
 */
const RENDER_TIME = 100;

/**
 * Transition time (seconds) between states of a light.
 * @note The Philips Hue bridge unfortunately does not accept floats for
 *       transition time. This must be an integer.
 * @type {Number}
 */
const TRANSITION_TIME = 1;

/**
 * Maximum amount of time (milliseconds) to wait on a single HTTP request.
 * @type {Array}
 */
const HTTP_TIMEOUT = 1000;

/**
 * Accepted color parameters.
 * @type {Array}
 */
const COLOR_PARMETERS = ['color', 'saturation', 'brightness'];

/***
 * The four lights and their values, default is orange
 * @type {Array}
 */
const ALL_LIGHTS = {'1': {on: true, color: 10, saturation: 100, brightness: 100}, 
                    '2': {on: true, color: 10, saturation: 100, brightness: 100}, 
                    '3': {on: true, color: 10, saturation: 100, brightness: 100}, 
                    '4': {on: true, color: 10, saturation: 100, brightness: 100}}
/**
 * Key used for local storage settings.
 * @type {String}
 */
const STORAGE_KEY = 'scratch:extension:hue';

/**
 * Philips Hue extension.
 */
class Scratch3Hue {
    /**
     * Creates an instance of the Philips Hue extension.
     * @constructor
     */
    constructor () {
        // Connection information
        this._host = null;
        this._index = null;
        this._identifier = 'scratch';
        this._username = null;

        // Get light index for extension
        // @todo This should be presented to the user visually, but for now it
        //       accepts a numeric input between 1 and 4.
        // eslint-disable-next-line no-alert
        //const index = window.prompt('Light index:');
        //this._index = index;

        // Use NUPNP to automatically discover a Philips Hue bridge on network
        nets({
            method: 'GET',
            uri: DISCOVERY_HOST,
            json: {}
        }, (err, res, body) => {
            if (err) return log.error(err);
            if (res.statusCode !== 200) return log.error(body);
            if (body.length === 0) return log.error('Not found');

            // Set host IP for bridge
            this._host = body[0].internalipaddress;

            // Authenticate client
            // @todo Present the user with a UI to prompt pressing the pair
            //       button on the bridge.
            this._authenticate((e, username) => {
                if (e) return log.error(e);

                // Set username for future requests
                this._username = username;

                // Start update loop
                this._loop();
            });
        });
    }

    /**
     * Returns metadata and block information for the extension.
     * @return {object} Extension definition
     */
    getInfo () {
        return {
            id: 'hue',
            name: 'Smart Lights',
            blocks: [
                {
                    opcode: 'setLightColor',
                    text: 'set light [INDEX] color to [VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.COLOR
                        },
                        INDEX:{
                            type: ArgumentType.STRING,
                            menu: 'LIGHTS',
                            defaultValue:'1'
                        }
                    }
                },
                {
                    opcode: 'changeLightProperty',
                    text: 'change light [INDEX] [PROPERTY] by [VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROPERTY: {
                            type: ArgumentType.STRING,
                            menu: 'COLOR_PARAM',
                            defaultValue: COLOR_PARMETERS[0]
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        },
                        INDEX:{
                            type: ArgumentType.STRING,
                            menu: 'LIGHTS',
                            defaultValue:'1'
                        }
                    }
                },
                {
                    opcode: 'setLightProperty',
                    text: 'set light [INDEX] [PROPERTY] to [VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROPERTY: {
                            type: ArgumentType.STRING,
                            menu: 'COLOR_PARAM',
                            defaultValue: COLOR_PARMETERS[0]
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        INDEX:{
                            type: ArgumentType.STRING,
                            menu: 'LIGHTS',
                            defaultValue:'1'
                        }
                    }
                },
                {
                    opcode: 'turnLightOnOff',
                    text: 'turn light [INDEX] [VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            menu: 'LIGHT_STATE',
                            defaultValue: 'on'
                        },
                        INDEX:{
                            type: ArgumentType.STRING,
                            menu: 'LIGHTS',
                            defaultValue:'1'
                        }
                    }
                }
            ],
            menus: {
                COLOR_PARAM: COLOR_PARMETERS,
                LIGHT_STATE: ['on', 'off'],
                LIGHTS: ['1', '2', '3', '4']
            }
        };
    }

    /**
     * Performs an XHR request against the currently connected Philips Hue
     * bridge.
     * @param  {object}   req      HTTP request object
     * @param  {Function} callback Error and HTTP response body
     * @return {void}
     */
    _xhr (req, callback) {
        // Set HTTP request defaults
        req.uri = `http://${this._host}${req.uri}`;
        req.timeout = HTTP_TIMEOUT;

        // Log request
        // @todo Remove this once extension is stable
        log.info(req.uri);

        // Make XHR request
        nets(req, (err, res, body) => {
            if (err) return callback('Could not connect to bridge');
            if (res.statusCode !== 200) return callback(res.statusCode);
            callback(null, body);
        });
    }

    /**
     * Returns a valid username for the Philips Hue bridge.
     * @param  {Function} callback Error or username
     * @return {void}
     */
    _authenticate (callback) {
        // Check for user in local storage
        // @todo This has an unfortunate error condition where the specified
        //       user may *not* exist on the bridge, but still have the same
        //       IP address. In this case, the authentication service should
        //       attempt to create a new user.
        let settings = window.localStorage.getItem(STORAGE_KEY);
        if (settings !== null) {
            settings = JSON.parse(settings);
            if (settings.host === this._host) {
                return callback(null, settings.username);
            }
            window.localStorage.removeItem(STORAGE_KEY);
        }

        // Create new user
        this._xhr({
            method: 'POST',
            uri: `/api`,
            json: {
                devicetype: this._identifier
            }
        }, (err, body) => {
            if (err) return callback(err);
            if (typeof body[0] === 'undefined') return callback(403);
            if (typeof body[0].success === 'undefined') return callback(403);
            const username = body[0].success.username;

            // Save credentials
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                host: this._host,
                username: username
            }));

            // Return username
            callback(null, username);
        });
    }

    /**
     * Convert 0 - 100 range as tracked by the extension to an 8-bit integer
     * as needed by the Philips Hue API.
     * @note   For some reason Philips Hue only accepts numbers between 0 and
     *         *254* thus the odd 8-bit scaling.
     * @param  {number} input Input value between 0 and 100
     * @return {number}       Output value between 0 and 254 (née 255)
     */
    _rangeToEight (input) {
        return Math.floor(input / 100 * 254);
    }

    /**
     * Convert 0 - 100 range as tracked by the extension to a 16-bit integer
     * as needed by the Philips Hue API.
     * @param  {number} input Input value between 0 and 100
     * @return {number}       Output value between 0 and 65535
     */
    _rangeToSixteen (input) {
        return Math.floor(input / 100 * 65535);
    }

    /**
     * Main rendering loop.
     * @return {void}
     */
    _loop () {
        // If pushing state to the light is not needed, delay and check again
        /*
        if (!this._dirty) {
            return setTimeout(
                this._loop.bind(this),
                Math.floor(RENDER_TIME / 2)
            );
        }*/

        // Create payload
        // @todo Gamut correction
        const payload = {
            "on": true,
            "hue": 10,
            "sat": 100,
            "bri": 100,
            "transitiontime": TRANSITION_TIME
        };

        // Add "on" state if needed
        // @note This is done as a perf*ormance optimization. The Hue system
        //       is much less responsive if the "on" state is sent as part of
        //       each request.

        // Push current light state to hue system via HTTP request
        this._xhr({
            method: 'PUT',
            uri: `/api/${this._username}/groups/0/action`,
            json: payload
        }, err => {
            if (err) log.error(err);
        });
    }

    turnLightOnOff (args) {
        // Update "on" state
        var index = args.INDEX;
        if(args.VALUE === 'on'){
            ALL_LIGHTS[index]['on'] = true;
        } else{
            ALL_LIGHTS[index]['on'] = false;
        }
        // Set state to "dirty"
        //this._dirty = true;

        this._xhr({
            method: 'PUT',
            uri: `/api/${this._username}/lights/${index}/state`,
            json: {'on': ALL_LIGHTS[index]['on'], 'transitiontime': TRANSITION_TIME}
        }, err => {
            if (err) log.error(err);
        });

        // Yield
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    setLightColor (args) {
        // Convert argument to RGB, HSB, and then update state
        var index = args.INDEX;        
        const rgb = cast.toRgbColorObject(args.VALUE);
        const hsv = color.rgbToHsv(rgb);
        ALL_LIGHTS[index]['color'] = Math.floor(hsv.h / 360 * 100);
        ALL_LIGHTS[index]['brightness'] = Math.floor(hsv.s * 100);
        ALL_LIGHTS[index]['saturation'] = Math.floor(hsv.v * 100);
        
        // Set state to "dirty"
        //this._dirty = true;

        this._xhr({
            method: 'PUT',
            uri: `/api/${this._username}/lights/${index}/state`,
            json: {"hue": this._rangeToSixteen(ALL_LIGHTS[index]['color']),
                    "sat": this._rangeToEight(ALL_LIGHTS[index]['brightness']),
                    "bri": this._rangeToEight(ALL_LIGHTS[index]['saturation']),
                    "transitiontime": TRANSITION_TIME}
        }, err => {
            if (err) log.error(err);
        });

        // Yield
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    changeLightProperty (args) {
        // Parse arguments and update state
        var index = args.INDEX;
        const prop = args.PROPERTY;
        const value = cast.toNumber(args.VALUE);
        if (COLOR_PARMETERS.indexOf(prop) === -1) return;
        ALL_LIGHTS[index][prop] += value;
        if (prop === 'color') {
            ALL_LIGHTS[index][prop] = math.wrapClamp(ALL_LIGHTS[index][prop], 0, 100);
        } else {
            ALL_LIGHTS[index][prop] = math.clamp(ALL_LIGHTS[index][prop], 0, 100);
        }

        // Set state to "dirty"
        //this._dirty = true;

        this._xhr({
            method: 'PUT',
            uri: `/api/${this._username}/lights/${index}/state`,
            json: {"hue": this._rangeToSixteen(ALL_LIGHTS[index]['color']),
                    "sat": this._rangeToEight(ALL_LIGHTS[index]['saturation']),
                    "bri": this._rangeToEight(ALL_LIGHTS[index]['brightness']),
                    "transitiontime": TRANSITION_TIME}
        }, err => {
            if (err) log.error(err);
        });

        // Yield
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    setLightProperty (args) {
        // Parse arguments and update state
        var index = args.INDEX;
        const prop = args.PROPERTY;
        const value = cast.toNumber(args.VALUE);
        if (COLOR_PARMETERS.indexOf(prop) === -1) return;
        if (prop === 'color') {
            ALL_LIGHTS[index][prop] = math.wrapClamp(ALL_LIGHTS[index][prop], 0, 100);
        } else {
            ALL_LIGHTS[index][prop] = math.clamp(ALL_LIGHTS[index][prop], 0, 100);
        }

        // Set state to "dirty"
        //this._dirty = true;

        this._xhr({
            method: 'PUT',
            uri: `/api/${this._username}/lights/${index}/state`,
            json: {"hue": this._rangeToSixteen(ALL_LIGHTS[index]['color']),
                    "sat": this._rangeToEight(ALL_LIGHTS[index]['saturation']),
                    "bri": this._rangeToEight(ALL_LIGHTS[index]['brightness']),
                    "transitiontime": TRANSITION_TIME}
        }, err => {
            if (err) log.error(err);
        });

        // Yield
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }
}

module.exports = Scratch3Hue;