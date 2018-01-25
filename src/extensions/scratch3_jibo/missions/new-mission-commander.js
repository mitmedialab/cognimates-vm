
var mission = require('./mission3');
var mission_initialized = false;
var stepIdx = 0;
var STATE = 0;
var step= 0;
var notComplain = true
let actualImage;
var auxblocks = [];

function missionCommander(wblocks) {
    //workspace.getBlockById('event_whenflagclicked');
    auxblocks = [];
    for (var i = 0; i < wblocks.length; i++) {
        auxblocks.push(wblocks[i]['opcode']);
    }
   if ((window.robot) && (stepIdx < mission.steps.length)){
        if (!mission_initialized){
            populateMedia();
        }

        mission_initialized = true;
        step = mission.steps[stepIdx];
        if (STATE == 0){
            if (JSON.stringify(auxblocks) === JSON.stringify(step.init_blocks)) {
                this.tutorSay(step.init.text);
                jiboSay(step.init.text).then(()=>{
                    console.log('say promise resolved');
                    jiboShowImage(step.init.image);
                    setTimeout(()=>{
                            jiboHideImage();
                    },1000);
                });

                STATE = 1;
            }
        } else if ((STATE == 1) ){
            if (JSON.stringify(auxblocks) === JSON.stringify(step.end_blocks)) {
                STATE = 0;
                stepIdx = stepIdx + 1;
                this.tutorSay(step.ok.text);
                this.missionCommander(wblocks);
            } else{
                if (JSON.stringify(auxblocks) !== "[]"){
                    if (notComplain){
                        this.tutorSay(step.bad_block.text);
                        notComplain = false;
                        setTimeout(this.reinitComplain,30000);
                        jiboSay(step.bad_block.text).then(()=>{
                        });
                    }
                }
            }
        }
    }
}

module.exports= missionCommander;