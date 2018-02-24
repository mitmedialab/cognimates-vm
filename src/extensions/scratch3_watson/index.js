const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// watson
var watson = require('watson-developer-cloud');
var fs = require('fs');

var visual_recognition = watson.visual_recognition({
  api_key: '',
  version_date: '2016-05-20'
});

let parameters = {
    classifier_ids: ["fruits_1462128776","SatelliteModel_6242312846"],
    threshold: 0.6
  };
  
  var params = {
    images_file: fs.createReadStream('./fruitbowl.jpg'),
    parameters: parameters
  };
  
  visual_recognition.classify(params, function(err, response) {
    if (err)
      console.log(err);
    else
      console.log(JSON.stringify(response, null, 2))
  });

const iconURI = require('./assets/watson_icon');


class Scratch3Watson {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'watson',
            name: 'Watson',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'recognizeObject',
                    blockType: BlockType.COMMAND,
                    text: 'recognise objects in [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'add apple link here'
                        }
                    }
                },
                {
                    opcode: 'classifyImage',
                    blockType: BlockType.BOOLEAN,
                    text:'get recognised object [OBJECT] from [CLASS]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        CLASS: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        
                    }                
                }
                
            ],
            menus: {
            }
        };
    }

    recognizeObject (args, util){

    }

    getImageClass(args, util) {
    //     console.log(myresults);
  
    //         var filtered = myresults.filter(function (obj) {
    //             return obj.score >= 0.59 &&
    //                    obj.name.indexOf(' color') === -1;
            
    //   }
    }
  
}

module.exports = Scratch3Watson;