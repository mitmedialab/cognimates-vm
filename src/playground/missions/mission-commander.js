console.log("mission commander loaded!");

//Mission
var mission = mission_intro;
var mission_initialized = false;
var stepIdx = 0;
var STATE = 0;
var notComplain = true
let metadata;
let actualImage;
// get metadata of the server
 $.ajax({
		type: 'GET',
		dataType: 'text',
		url: './metadata',
		success: (e) => {
				console.log(e);
				metadata = JSON.parse(e);
		},
		error: (error) => {
				console.log("error ");
				console.log(error);
		}
});

function reinitComplain(){
	notComplain = true3
}

function missionCommander(wblocks) {
	console.log("blocks: ",wblocks);

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
				jiboSay(step.ok.text).then(()=>{
					missionCommander(wblocks);
					animateBlock(wblocks, 100, 100, 5);	
				});
				STATE = 0;
				stepIdx = stepIdx + 1;
			} else{
				if (JSON.stringify(auxblocks) !== "[]"){
					if (notComplain){
						jiboSay(step.bad_block.text).then(()=>{
							notComplain = false;
							setTimeout(reinitComplain,30000);
						});

					}


				}
			}
		}
    }

}

//Jibo functions
function jiboSay(tts) {

	return window.robot.say(tts);

}

function jiboSay(tts) {

	return window.robot.say(tts);

}

function jiboShowImage(filename) {
	const path = "http://"+metadata.ip+":8080/" + filename;
	console.log(path);
	actualImage = window.robot.showRemoteImage(path);
}

function jiboHideImage() {
	if (actualImage) {
			actualImage.cancel();
			actualImage = null;
	}
}


