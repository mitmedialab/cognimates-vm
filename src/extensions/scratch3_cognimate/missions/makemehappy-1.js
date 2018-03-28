//make me happy step 1
let mission16 = {
	numberSteps: 5,
	steps: [
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
			init: {
				text: "Let's teach Oscar how to ask us a question. Start with the green flag block."
			},
			ok: {
				text: "Awesome!"
			},
			bad_block: {
				text: "Oh no! That's not the right block. Try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume"],
			init: {
				text: "Oscar is waiting for our question, so let's have him put on his waiting costume. Get the switch costume\
				block from under Looks and choose waiting."
			},
			ok: {
				text: "That's exactly right!"
			},
			bad_block: {
				text: "Oops! That's not the right block. Look for it under looks."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume", 
			"sensing_askandwait", "text"],
			init: {
				text: "Now let's have him actually ask us a question! Using the ask and wait block from sensing. Remember to store,\
				your answer in a variable so we can use it later."
			},
			ok: {
				text: "Perfect! Inside the block you can have Oscar ask you any question you want."
			},
			bad_block: {
				text: "Oh no! That's not the right block. It should be under sensing. Which block will ask you a question and wait\
				for your answer?"
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume", 
			"sensing_askandwait", "text", "sensing_answer"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume", 
			"sensing_askandwait", "text", "tutor.speak","text"],
			init: {
				text: "We can have our cognimate read our answer back to us! First put down a speaking block from the Cognimates\
				extension."
			},
			ok: {
				text: "Great!"
			},
			bad_block: {
				text: "That's not quite it. Try again!"
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume", 
			"sensing_askandwait", "text", "tutor.speak","text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto", "looks_costume", 
			"sensing_askandwait", "text", "tutor.speak","text", "sensing_answer"],
			init: {
				text: "Remember our answers variable? Now it's time to put it inside the speak block so that our cognimate will\
				read your answer to Oscar."
			},
			ok: {
				text: "Great! Now let's have Oscar react to what we say. Start mission 16 now."
			},
			bad_block: {
				text: "Oops! Try again."
			}
		}
	]
};
module.exports = mission16;