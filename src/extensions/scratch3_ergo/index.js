const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const Timer = require('../../util/timer');
const request = require('request');
const RenderedTarget = require('../../sprites/rendered-target');

// ergo

const iconURI = require('./assets/ergo_icon');
let hostURL = 'http://169.254.41.44:6969/';
let connectionURL = `${hostURL  }ip/`;
let motorsURL = `${hostURL  }motors/motors`;
let motorsPositionURL = `${hostURL  }motors/set/goto/`;
let motorsPositionGetURL = `${hostURL  }motors/get/positions`;
let motorRegisterURL = `${hostURL  }motors/set/registers/`;
let moveRecordURL = `${hostURL  }primitive/MoveRecorder/`;
let movePlayerURL = `${hostURL  }primitive/MovePlayer/`;
let primitivesURL = `${hostURL  }primitive/`;
let detectURL = `${hostURL  }detect/`;
let imageURL = `${hostURL  }camera/`;
var connected = false;
let motors = [];
let markersQueue = [];
var commandQueue = [];
var detectionMode = false;
let motorPositions = [0, 0, 0, 0, 0, 0];
let updateInterval = undefined;

function sendRequest (requestURL, params, callback) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (callback != undefined) {
                callback(request.responseText);
            }
        }
    };
    if (params != null) {
        request.open('GET', requestURL + params, true);
    } else {
        request.open('GET', requestURL, true);
    }
    request.send();
}
    
function getMotorPostions () {
    sendRequest(motorsPositionGetURL, null, (response) => {
        if(response.length == 0) {
            return;
        }
        motorPositions = response.split(';');
        });
}

function addMarkersToQueue (markers) {
    markersQueue = markersQueue.concat(markers);
    console.log(markersQueue, commandQueue);

}

function getMarkers () {
    if (detectionMode) {
        sendRequest(detectURL.slice(0, -1), null, (response) => {
        if(response != "False") {
          addMarkersToQueue(response.split(' '));
        }
      });
    }
}


function update () {
    if (!connected) {
        clearInterval(updateInterval);
        updateInterval = undefined;
        return;
    }
    getMotorPostions();
    if (detectionMode) {
        getMarkers();
    }
}

function setMotors (m) {
    motors = m;
}

function getMotorsList (callback) {
    sendRequest(motorsURL, null, (response) => {
      if(response.length == 0) {
        callback();
        return;
      } else {
        motors = response.split("/");
        setMotors(motors);
        callback();
      }
    });
}

// function setHost (host) {
//     hostURL = host;
//     connectionURL = `${hostURL  }ip/`;
//     motorsURL = `${hostURL  }motors/motors`;
//     motorsPositionGetURL = `${hostURL  }motors/get/positions`;
//     motorsPositionURL = `${hostURL  }motors/set/goto/`;
//     motorRegisterURL = `${hostURL  }motors/set/registers/`;
//     moveRecordURL = `${hostURL  }primitive/MoveRecorder/`;
//     movePlayerURL = `${hostURL  }primitive/MovePlayer/`;
//     primitivesURL = `${hostURL  }primitive/`;
//     detectURL = `${hostURL  }detect/`;
//     imageURL = `${hostURL  }camera/`;
// }

function sendRequest (requestURL, params, callback) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (callback != undefined) {
                callback(request.responseText);
            }
        }
    };
    if (params != null) {
        request.open('GET', requestURL + params, true);
    } else {
        request.open('GET', requestURL, true);
    }
    request.send();
}

function setRegisterValues (selectedMotors, register, values, callback) {
    if(selectedMotors.length != values.length) {
      console.error("Number of motors and number of values do not match");
      callback();
      return false;
    } 
      var params = "";
      for(var index = 0; index < selectedMotors.length; index++) {
        params += selectedMotors[index] + ":" + register + ":" + values[index] + ";";
      }
      params = params.slice(0, params.length-1);
      sendRequest(motorRegisterURL, params, function(response) {
        console.log("set register", register, "of", selectedMotors, "to", values);
        if(callback != undefined) {
          callback();
        }
        return;
      });
    
  };

function setPrimitive (primitiveName, behavior, callback) {
    sendRequest(primitivesURL, `${primitiveName  }/${  behavior}`, callback);
};

function setCompliance (selectedMotors, value, callback) {
    values = [];
    selectedMotors = selectedMotors.trim();
    selectedMotors = selectedMotors.split(' ');
    selectedMotors.forEach((motor) => {
    if(motors.indexOf(motor) != -1) {
    values.push(value*1);
    }
});
    console.log(values);
    setRegisterValues(selectedMotors, 'compliant', values, callback);
};

function getImage  (params = '') {
    function receiveImage (imageData) {
        console.log(imageData);
        if (imageData == undefined) {
            return '';
        }
        return imageData;
    }

    sendRequest(imageURL, params, receiveImage);
};


class Scratch3Ergo {
    constructor (runtime) {
        this.runtime = runtime;
  
    }

    getInfo () {
        return {
            id: 'ergo',
            name: 'Ergo',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'connectErgo',
                    blockType: BlockType.COMMAND,
                    text: 'Connect robot'
                },
                {
                    opcode: 'turnTo',
                    blockType: BlockType.COMMAND,
                    text: 'Turn to [DIRECTION]',
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu:'motorDirection',
                            defaultValue: 'Right'
                        }
                    }
                },
                {
                    opcode: 'setLED',
                    blockType: BlockType.BOOLEAN,
                    text: 'Set motors [MOTORS] to color [COLOR]',
                    arguments: {
                        MOTORS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'm1'
                        },
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu:'lights',
                            defaultValue: 'green'
                        }

                    }
                },
                {
                    opcode: 'setPosture',
                    blockType: BlockType.BOOLEAN,
                    text: 'Set posture [POSTURE]',
                    arguments: {
                        POSTURE: {
                            type: ArgumentType.STRING,
                            menu:'postures',
                            defaultValue: 'curious'
                        }
                    }
                },
                {
                    opcode: 'recordMove',
                    blockType: BlockType.BOOLEAN,
                    text: 'Record move [MOTORS] for [DURATION]',
                    arguments: {
                        MOTORS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'm1'
                        },
                        DURATION: {
                            type: ArgumentType.STRING,
                            defaultValue: '10 SEC'
                        }

                    }
                },
                {
                    opcode: 'recordMove',
                    blockType: BlockType.BOOLEAN,
                    text: 'Record move [MOTORS] for [MOVENAME]',
                    arguments: {
                        MOTORS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'm1'
                        },
                        MOVENAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Move name'
                        }

                    }
                }
                
            ],
            menus: {
                motorDirection: ['Left', 'Right', 'Front', 'Back'],
                lights: ['off', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'white'],
                danceMenu: ['start', 'stop', 'pause', 'resume'],
                playMenu: ['Play', 'Stop'],
                postures: ['rest', 'curious', 'tetris', 'base'],
                markerDetection: ['start', 'stop']
            }
        };
    }

    
    connectErgo () {
        sendRequest(connectionURL, null, (e) => {
        if(e.length > 0) {
          connected = true;
          getMotorsList(callback);
          updateInterval = setInterval(update, 1000);
        } else {
          connected = false;
        }
      });
    }


    // turnBy (selectedMotors, position, time) {
    //     selectedMotors.trim();
    //     selectedMotors = selectedMotors.split(' ');
    //     const paramPart = ':' + position + ':' + time;
    //     let params = '';
    //     selectedMotors.forEach((m) => {
    //     params += m + paramPart + ';';
    //   });
    //     params = params.slice(0, params.length - 1);
    //     sendRequest(motorsPositionURL, params, (response) => {
    //     console.log("Turn",selectedMotors,position, time);
    //   });
    // };


    turnTo (args, util) {
        let angle = 0;
        let params = '';
        if (args.DIRECTION == 'Left') {
            angle = 90;
            params = 'm1:goal_position:' + angle;
        } else if (args.DIRECTION == 'Right') {
            angle = -90;
            params = 'm1:goal_position:' + angle;
        } else if (args.DIRECTION == 'Front') {
            angle = 0;
            params = 'm1:goal_position:' + angle;
            params += ';m3:goal_position:' + angle;
        } else {
            params = 'm1:goal_position:0';
            params += ';m3:goal_position:-90';
        }
        sendRequest(motorRegisterURL, params, (response) => {
        console.log("Turn ergo to", args.DIRECTION);
      });
    }


    setLED (args, util) {
       var selectedMotors= args.MOTORS.trim();
       selectedMotors = selectedMotors.split(' ');
        var paramPart = ':led:' + args.COLOR;
        let params = '';
        selectedMotors.forEach((m) => {
        params += m + paramPart + ';';
      });
        params = params.slice(0, params.length - 1);
        sendRequest(motorRegisterURL, params, (response) => {
        console.log("Set LED of", selectedMotors, "to", args.COLOR)
      });
    };

    setPosture (args,util) {
        const primitiveName = `${args.POSTURE}_posture`;
        setPrimitive(primitiveName, 'start', undefined);
        setTimeout(() => {
        setPrimitive(primitiveName, 'stop');
      }, 3000);
    }
    // recordMove (args,util) {

    //     setCompliance(selectedMotors, true, undefined);
    //     const selectedMotors = args.MOTORS.trim();
    //     selectedMotors = selectedMotors.split(' ');
    //     let params = '';
    //     for (let index = 0; index < selectedMotors.length; index++) {
    //         params += `${selectedMotors[index]  };`;
    //     }
    //     params = params.slice(0, params.length - 1);
    //     const url = `${moveRecordURL + args.MOVENAME  }/start/`;
    //     sendRequest(url, params, (response) => {
    //   });
    // };

}

module.exports = Scratch3Ergo;



    
    

    // getRecordingMotors = function (moveName, after) {
    //     const url = `${moveRecordURL + moveName  }/get_motors`;
    //     sendRequest(url, null, (response) => {
    //     after(response);
    //   });
    // };

    // ext.stopRecordingMove = function (moveName, callback) {
    //     let afterRequest = function (response) {
    //         callback();
    //     };
    //     let stopRecording = function (selectedMotors) {
    //         motors = selectedMotors.split('/');
    //         motors = motors.join(' ');
    //         setCompliance(motors, false, undefined);
    //         const url = `${moveRecordURL + moveName  }/stop`;
    //         sendRequest(url, null, afterRequest);
    //     };
    //     getRecordingMotors(moveName, stopRecording);
    // };


    // ext.playRecording = function (behavior, recordingName, callback) {
    //     if (behavior == 'Play') {
    //         behavior = 'start';
    //     } else {
    //         behavior = 'stop';
    //     }
    //     let params = `${recordingName  }/${  behavior.toLowerCase()}`;
    //     sendRequest(movePlayerURL, params, callback);
    // };


//     ext.setMarkerDetection = function (toggle, callback) {
//         setPrimitive('tracking_feedback', toggle, callback);
//         if (toggle == 'start') {
//             detectionMode = true;
//         } else {
//             detectURL = false;
//         }
//     };

//     ext.isCaribou = function () {
//         return 221052793;
//     };

//     ext.isTetris = function () {
//         return 112259237;
//     };

//     ext.isLapin = function () {
//         return 44616414;
//     };

//     ext.markersDetected = function (markerCount) {
//         if (markersQueue.length >= markerCount) {
//             console.log(markersQueue.length);
//             commandQueue = markersQueue.splice(0, markerCount);
//             console.log(markersQueue.length);
//             markersQueue = [];
//             console.log(commandQueue);
//             return true;
//         }
//         return false;
//     };

//     ext.getMarkersQueue = function () {
//         return commandQueue;
//     };

//     ext.getItemFromMarkerQueue = function (index) {
//         if (index > 0 && index <= commandQueue.length) {
//             return commandQueue[index - 1];
//         }
//     };

//     ext.getLengthOfMarkerQueue = function () {
//         return commandQueue.length;
//     };

//     ext.getBlock1Position = function () {
//         return motorPositions[0];
//     };

//     ext.getBlock2Position = function () {
//         return motorPositions[1];
//     };

//     ext.getBlock3Position = function () {
//         return motorPositions[2];
//     };

//     ext.getBlock4Position = function () {
//         return motorPositions[3];
//     };

//     ext.getBlock5Position = function () {
//         return motorPositions[4];
//     };

//     ext.getBlock6Position = function () {
//         return motorPositions[5];
//     };

//     function getInvertedImage (callback) {
//         sendRequest(imageURL, 'black/image', (response) => {
//         callback(response);
//       });
//     }

//     ext.recognizeDigit = function (callback) {

//         function result (digit) {
//             callback(digit);
//         }

//         function processImage (img) {
//             getDigit(img, result);
//         }
//         getInvertedImage(processImage);
//     };

//     ext.getColorImage = function (callback) {
//         sendRequest(imageURL, 'image', (response) => {
//         callback(response);
//       });
//     };

//     // Cleanup function when the extension is unloaded
//     ext._shutdown = function () {
//         console.log('shutting down');
//         if (updateInterval != undefined) {
//             clearInterval(updateInterval);
//         }
//     };

//     ext._stop = function () {
//         console.log('stopping');
//         if (updateInterval != undefined) {
//             clearInterval(updateInterval);
//         }
//     };

//     // Status reporting code
//     // Use this to report missing hardware, plugin or unsupported browser
//     ext._getStatus = function() {
//       if(connected == false) {
//         return {status:1, msg: 'Not connected to Poppy Ergo Jr.'};
//       } 
//         return {status:2, msg: 'Connected to Poppy Ergo Jr.'};
      
//     };

//     // Block and block menu descriptions
//     let descriptor = {
//         blocks: [
//             ['w', 'Call Ergo Jr. at %s', 'connectErgo', 'http://18.85.58.226:6969/'],
//             ['w', 'Turn blocks %s to %n position in %n seconds', 'turnBy'],
//             ['w', 'Turn %m.motorDirection', 'turnTo', 'Left'],
//             ['w', 'Set light of blocks %s to %m.lights', 'setLED', '', 'off'],
//             ['w', 'Record movement of blocks %s as %s', 'recordMove', '', 'move_name'],
//             ['w', 'Stop recording move %s', 'stopRecordingMove', 'move_name'],
//             ['w', '%m.danceMenu dance', 'dance', 'start'],
//             ['w', '%m.playMenu recording %s', 'playRecording', 'Play', 'move_name'],
//             ['w', 'Set %m.postures posture', 'setPosture', 'rest'],
//             ['w', '%m.markerDetection tracking', 'setMarkerDetection', 'start'],
//             ['r', 'Caribou', 'isCaribou'],
//             ['r', 'Lapin', 'isLapin'],
//             ['r', 'Tetris', 'isTetris'],
//             ['h', 'When %n markers detected', 'markersDetected'],
//             ['r', 'markers', 'getMarkersQueue'],
//             ['r', 'item %n of markers', 'getItemFromMarkerQueue'],
//             ['r', 'length of markers', 'getLengthOfMarkerQueue'],
//             ['r', 'block 1', 'getBlock1Position'],
//             ['r', 'block 2', 'getBlock2Position'],
//             ['r', 'block 3', 'getBlock3Position'],
//             ['r', 'block 4', 'getBlock4Position'],
//             ['r', 'block 5', 'getBlock5Position'],
//             ['r', 'block 6', 'getBlock6Position'],
//             ['R', 'Recognize number', 'recognizeDigit'],
//             ['R', 'Get image', 'getColorImage']
//         ],
//         menus: {
//             motorDirection: ['Left', 'Right', 'Front', 'Back'],
//             lights: ['off', 'red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'white'],
//             danceMenu: ['start', 'stop', 'pause', 'resume'],
//             playMenu: ['Play', 'Stop'],
//             postures: ['rest', 'curious', 'tetris', 'base'],
//             markerDetection: ['start', 'stop']
//         }
//     };

//     // Register the extension
//     ScratchExtensions.register('Poppy Ergo Jr.', descriptor, ext);
// }({}));
