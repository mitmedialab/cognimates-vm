//make me happy direct mission from starter pack
let mission14 = {
	numberSteps: 3,
	steps: [
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission", "watson.recognizeText","text"],
			init: {
				text: "Let's make use of our newly trained model! Inside the equals operator, replace the answer\
				variable with a block that will recognize text from a label instead."
			},
			ok: {
				text: "Great job!"
			},
			bad_block: {
				text: "Oh no! That's not the right block. Try looking under the Watson extension."
			}
		},
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission", "watson.recognizeText","text"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission", "watson.recognizeText","text","sensing_answer"],
			init: {
				text: "The text that we want to recognize is our answer. So let's put that back into the\
				recognize text block."
			},
			ok: {
				text: "Awesome!"
			},
			bad_block: {
				text: "Oops! Use the answer variable block."
			}
		},
		{
			init_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission", "watson.recognizeText","text","sensing_answer"],
			end_blocks: ["event_whenflagclicked","looks_switchcostumeto",
			"looks_costume","sensing_askandwait","text","control_if_else","operator_equals","text","text",
			"sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume",
			"tutor.mission","tutor.menu.mission", "watson.recognizeText","text","sensing_answer", "data_variable", "text"],
			init: {
				text: "We want to see if what Oscar recognizes our answer matches our funny label. So in the\
				other blank, ill it in with funny."
			},
			ok: {
				text: "Yay! Now you've completed your mission. Write Oscar some messages now!"
			},
			bad_block: {
				text: "Oh no, that's not it. Try again you're almost there."
			}
		}
	]
};
module.exports = mission14;