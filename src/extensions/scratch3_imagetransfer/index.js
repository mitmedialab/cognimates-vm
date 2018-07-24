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
        this.images = [""];
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
                backdrop: ['1','2','3','4','5','6','7','8','9','10'],
                styles: ['WAVE', 'SQUARES', 'OLD', 'ABSTRACT', 'LIGHT', 'SCREAM']
            }
        };
    }

    getCostumeFromIndex(index){
        const stage = this.runtime.getTargetForStage();
        return stage.getCostumes()[index]
    }
    setImageEffect(args, util){
        if(this.getCostumeFromIndex(parseInt(args.BACKDROP, 10)) == undefined){
            return "Haven't uploaded backdrop number " + args.BACKDROP
        }
        var costumeName = this.getCostumeFromIndex(parseInt(args.BACKDROP, 10)).name;
        var thumbnails = document.getElementsByClassName("stage_stage-wrapper_eRRuk box_box_2jjDp")[0];
        var responseString = "";
        var listOfData = [];
        var imageBase64 = "";
        var width = 0;
        var type = 0;
        var height = 0;
        var link = 0;
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
                listOfData = responseString.split(',');
                link = listOfData[0];
                width = listOfData[1];
                height = listOfData[2];
                type = listOfData[3];
                var newHeight = 0;
                var newWidth = 0;

                if(width >= height){
                    if(width > 100){
                        newHeight = height / (width/100)
                        newWidth = 100
                    }
                    if(newHeight > 100){
                        newWidth = width / (height/100)
                        newHeight = 100
                    }
                } else{
                    if(height > 100){
                        newWidth = width / (height/100)
                        newHeight = 100
                    }
                    if(newWidth > 100){
                        height = height / (width/100)
                        newWidth = 100      
                    }
                }
                console.log(newWidth, newHeight);
                var image = new Image(newWidth, newHeight);
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var fullImage = new Image(width, height);
                fullImage.crossOrigin = 'anonymous';     
                canvas.height = height;
                canvas.width = width;
                image.src = link;
                canvas.style.display = 'none';
                fullImage.src = image.src;
                fullImage.onload = function(){
                    ctx.drawImage(fullImage, 0, 0);
                    document.body.appendChild(canvas);
                    canvas.toBlob(function(blob){
                        a.href = URL.createObjectURL(blob);
                    });
                }
                
                
                var a = document.createElement('a');
                a.style.display = 'none';
                a.download = costumeName + ".png";
                image.onclick = function(){
                    a.click();
                }
                document.body.appendChild(a);

                image.style.position = "relative";
                image.style.top = "6px";
                image.style.left = "6px";
                image.onload = function(){
                    thumbnails.appendChild(image);
                }
                
            });
        });
        var info = costumeName + "," + args.PRESETS;
        req.write(info);
        req.end();
        return costumeName
    }
}

module.exports = Scratch3ImageTransferBlocks;

