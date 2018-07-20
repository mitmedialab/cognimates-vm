
const Runtime = require('../../engine/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const dispatch = require('/Users/clementeocejo/Desktop/MIT/Cognimates/cognimates-vm/src/dispatch/central-dispatch.js');
const log = require('/Users/clementeocejo/Desktop/MIT/Cognimates/cognimates-vm/src/util/log.js');
const maybeFormatMessage = require('/Users/clementeocejo/Desktop/MIT/Cognimates/cognimates-vm/src/util/maybe-format-message.js');
const http = require('http');
/**
 * Class for the motion-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */

class Scratch3ImageTransferBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */

        this.runtime = runtime;
        this.target = this.runtime.getTargetForStage();
        this.costumes = this.target.getCostumes();
        this.images = [];
        this._loadedExtensions = new Map();

        console.log(this.costumes);
        for(var i = 0; i < this.costumes.length; i++){
            if(this.costumes[i].bitmapResolution == undefined){
                this.images.push(this.costumes[i].name);
            }
        }
        console.log(this.images);
    }

    /**
     * The key to load & store a target's music-related state.
     * @type {string}
     */
    static get STATE_KEY () {
        return 'Scratch.imagetransfer';
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'imagetransferExtension',
            name: 'Image Effect',
            blocks: [
                {
                    opcode: 'setImageEffect',
                    text: 'Set image effect of [BACKDROP] to [PRESETS]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        BACKDROP:{
                            type: ArgumentType.STRING,
                            menu: 'backdrop'
                        },
                        PRESETS:{
                            type: ArgumentType.STRING,
                            menu: 'styles'
                        }
                    }
                }
                
            ],
            menus: {
                backdrop: this.images,
                styles: ['WAVE', 'SQUARES', 'OLD', 'ABSTRACT', 'LIGHT', 'SCREAM']
            }
        };
    }

    setImageEffect(args, util){
        var responseString = "";
        var imageBase64 = ""
        var options = {
            host: "localhost",
            port: "5000",
            path: "/styletransfer",
            method: "POST"
        };
        var req = http.request(options, function(res){
            
            res.on("data", function(data){
                responseString += data;
            })
            res.on("end", function(){
                console.log(btoa(unescape(encodeURIComponent(responseString))));
                imageBase64 = btoa(unescape(encodeURIComponent(responseString)));
            })
        });
        var info = args.BACKDROP + "," + args.PRESETS;
        req.write(info);
        req.end();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var image = new Image();
        image.onload = function(){
            ctx.drawImage(image, 0, 0);
        };
        image.src = "data:image/png;base64," + imageBase64;
    }
}

module.exports = Scratch3ImageTransferBlocks;

