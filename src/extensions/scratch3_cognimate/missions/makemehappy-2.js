//make me happy starter pt 2
let mission17 = {
	numberSteps: 5,
	steps: [
		{
            init_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer"],
            end_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer", "control_if_else"],
            init:{
                text: "Because we want Oscar to react differently depending on the message, we should use an if else block from controls that will change Oscar's expression depending whether or not the message was funny or serious. Make sure to store your answer in an answers variable."
            },
            ok:{
                text: "Great job!"
            },
            bad_block: {
                text: "Oh no! Remember to use the orange if else from controls!"
            }
        },
        {
            init_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer", "control_if_else"],
            end_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text"],
            init:{
                text: "In order to test whether or not our message is funny, we should use an equals operator."
            },
            ok: {
                text: "Great job! Let's move on to the next step."
            },
            bad_block: {
                text: "Oh no! That's not the right block! Use the equals block from the operators."
            }
        },
        {
            init_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text"],
            end_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text","sensing_answer"],
            init:{
                text: "Let's set our answer variable into the first part of the equals operator. We can see if our answer is equal to a funny message, such as: Unicorn poops taste like oranges. You can also write your own!"
            },
            ok: {
                text: "Awesome!"
            },
            bad_block: {
                text: "Oh no! Make sure you are using an answer variable block."
            }
        },
        {
            init_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text","sensing_answer"],
            end_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text","sensing_answer","looks_switchcostumeto","looks_costume"],
            init:{
                text: "When someone types that message to Oscar, he should look happy. Let's nest a switch costume to happy block under the if statement."
            },
            ok: {
                text: "Good job! Let's move onto the next step."
            },  
            bad_block: {
                text: "Oh no! Try again!"
            }
        },
        {
            init_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text","sensing_answer","looks_switchcostumeto","looks_costume"],
            end_blocks: ["tutor.mission","tutor.menu.mission","event_whenflagclicked","looks_switchcostumeto","looks_costume","sensing_askandwait","text", "tutor.speak","text", "sensing_answer","control_if_else","operator_equals","text","text","sensing_answer","looks_switchcostumeto","looks_costume","looks_switchcostumeto","looks_costume"],
            init: {
                text: "Now, when someone types a message that isn't our funny message, Oscar will look sad. Let's nest a switch costume to sad block under the else statement."
            },
            ok: {
                text: "Good job! You're done with this simple script. Try it out!"
            },
            bad_block: {
                text: "Oh no! Make sure you are using the same switch costume block as in the previous step!"
            }
        }
	]
};
module.exports = mission17;