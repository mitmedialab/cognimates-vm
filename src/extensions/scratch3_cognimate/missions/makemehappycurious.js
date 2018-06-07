//make me happy curious mission from starter pack
let mission15 = {
	numberSteps: 2,
	steps: [
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission", "watson.recognizeText","text"],
			init: {
				text: "Let's make use of our newly trained model! Inside the equals operator, what block could\
				we replace the answers variable with?"
			},
			ok: {
				text: "Great job!"
			},
			bad_block: {
				text: "Oh no! That's not the right block. Try looking under the Watson extension for a block that\
				will recognize text."
			}
		},
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission", "watson.recognizeText","text"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission", "watson.recognizeText","text","sensing_answer"],
			init: {
				text: "Okay, what is the text that Oscar should recognize? Fill the blank recognize block with it. And what should\
				this label be?"
			},
			ok: {
				text: "Awesome!"
			},
			bad_block: {
				text: "Oops! Try again."
			}
		}
		/*
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission", "watson.recognizeText","text","sensing_answer"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait",
			"text","sensing_answer","control_if_else","operator_equals","text","text","looks_switchcostumeto",
			"looks_costume","looks_switchcostumeto","looks_costume","tutor_mission","tutor_menu_mission", "watson.recognizeText","text","sensing_answer", "data_variable", "text"],
			init: {
				text: "Now that Oscar recognizes our answer, what should we be comparing this to? Hint: where\
				do you think his answer would look like?"
			},
			ok: {
				text: "Yay! Now you've completed your mission. Write Oscar some messages now!"
			},
			bad_block: {
				text: "Oh no, that's not it. Try again you're almost there."
			}
		}*/
	]
};
module.exports = mission15;