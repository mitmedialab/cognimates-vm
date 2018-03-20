//rock, paper, scissors for computer sprite
let mission11 = {
	numberSteps: 23,
	steps: [
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
            init: {
                text: "Let's write a program for the computer sprite that will play rock, paper scissors with us! Start off with the green flag block from events."
            },
            ok: {
                text: "Alright, let's get started!"
            },

            bad_block: {
                text: "Oh no! You didn't use the magic block!"
            }
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
			end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto","looks_costume"],
			init: {
				text: "Let's get the computer ready to play with us! Use a switch costume block under looks and put on the computer costume."
			},
			ok: {
				text: "Perfect! Let's move onto the next step."
			},
			bad_block: {
				text: "Try again! Look for the switch costume block under looks."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "looks_switchcostumeto","looks_costume"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text"],
			init: {
				text: "Let's set up two variables. One for you and one for the computer. Under variables, select two set blocks, one for you and one for the computer. You can leave them blank\
				for now since we haven't made any moves yet. Make sure you check the computer and you variables from the menu."
			},
			ok: {
				text: "Great job! Let's move on."
			},
			bad_block: {
				text: "Not quite. Try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu"],
			init: {
				text: "Now it's time to start making moves! Get the broadcast New Moves! block from under events."
			},
			ok: {
				text: "Awesome!"
			},
			bad_block: {
				text: "Oh no, that's not the right block. Choose the broadcast block from under events and choose New Moves from the menu."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived"],
			init: {
				text: "Now start a new section with the when I receive new moves! block from events. This block will receive the broadcast we sent from the previous step."
			},
			ok: {
				text: "You're doing great!"
			},
			bad_block: {
				text: "That's not the right block. Try another block from events."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text"],
			init: {
				text: "Let's help the computer choose a move! Use another set variable block for the computer, but this time let's fill in the blank!"
			},
			ok: {
				text: "     "
			},
			bad_block: {
				text: "Remember to use the set variable block under variables!"
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer"],
			init: {
				text: "We are going to choose an item from a list of moves. Inside the blank, place an item from list block under variables."
			},
			ok: {
				text: "    "
			},
			bad_block: {
				text: "Not quite, find the block that selects an item from a list of moves."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number"],
			init: {
				text: "For now, let's have the computer randomly choose between moves. So inside that last variable block, put a random number block from operators, and set it to choose between 1 and 3, one number for each move."
			},
			ok: {
				text: "Great job! You've now helped the computer pick its move!"
			},
			bad_block: {
				text: "Oh no that's not the right block! Look for the green random number block."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived"],
			init: {
				text: "Now we can change the computer's appearance depending on what move it chose. In a new code section, let's use another receiving block, except this time set it to receive Set computer costume."
			},
			ok: {
				text: "Awesome!"
			},
			bad_block: {
				text: "Not quite, remember to use the receive braodcast block from events."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if"],
			init: {
				text: "Now let's use an if block to check what kind of move the computer chose."
			},
			ok: {
				text: "Good job!"
			},
			bad_block: {
				text: "That's not the right block. Try another yellow block from under controls."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text"],
			init: {
				text: "In order to check if the computer chose paper, we first need an equals block from operators. Fill in one of the blank spaces with paper."
			},
			ok: {
				text: "You're doing great!"
			},
			bad_block: {
				text: "Not quite, try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable"],
			init: {
				text: "Now let's use our computer variable, which contains information on which move the computer chose, in the other blank of our equals operator."
			},
			ok: {
				text: "Great job!"
			},
			bad_block: {
				text: "Oh no! You didn't use the right block."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume"],
			init: {
				text: "So now, if the computer did choose paper, then we can switch its costume to paper. Go ahead and use the switch costume block and nest it inside the if block."
			},
			ok: {
				text: "Awesome! Now let's do the same for rock and scissors!"
			},
			bad_block: {
				text: "That's not the right block. Make sure to use the switch costume block under looks."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume"],			
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived"],
			init: {
				text: "In another section, let's use the receiving block again."
			},
			ok: {
				text: "Great job! Let's move on."
			},
			bad_block: {
				text: "No that's not the right block. Remember, you've used this block before."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if"],
			init: {
				text: "Following what we did before, use an if block."
			},
			ok: {
				text: "You're doing great!"
			},
			bad_block: {
				text: "Oh no! Try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text"],
			init: {
				text: "Use another equals operator, but this time set one of the blanks to scissors."
			},
			ok: {
				text: "Onto the next step!"
			},
			bad_block: {
				text: "Oh no! Try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable"],
			init: {
				text: "Use the computer variable again in the other blank."
			},
			ok: {
				text: "Great job!"
			},
			bad_block: {
				text: "Mmmmm not quite. Give it another go."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume"],
			init: {
				text: "You know what to do. Time to switch costumes to scissors."
			},
			ok: {
				text: "You're almost done helping the computer!"
			},
			bad_block: {
				text: "Oh no! You didn't use the right block. Make sure to use the switch costume block under looks."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived"],
			init: {
				text: "One last time. Let's use a receiving block for set computer costume again."
			},
			ok: {
				text: "You're doing an awesome job!"
			},
			bad_block: {
				text: "Oops! Wrong block."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if"],
			init: {
				text: "You know what to do! What control block should we use after?"
			},
			ok: {
				text: "Perfect!"
			},
			bad_block: {
				text: "Oh no! You used the wrong block."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text"],
			init: {
				text: "What operator block do we use now?"
			},
			ok: {
				text: "Exactly right!"
			},
			bad_block: {
				text: "Whoops! Try again."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable"],
			init: {
				text: "Now let's put our variable in."
			},
			ok: {
				text: "You're almost there!"
			},
			bad_block: {
				text: "That's not quite right. Choose another block."
			}
		},
		{
			init_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable"],
			end_blocks: ["tutor.mission", "tutor.menu.mission","looks_switchcostumeto","looks_costume", "data_setvariableto","text","data_setvariableto","text", "event_broadcast","event_broadcast_menu", "event_whenbroadcastreceived", "data_setvariableto","text", "data_itemoflist","math_integer", "operator_random","math_number","math_number", "event_whenbroadcastreceived", "control_if", "operator_equals","text","text", "data_variable", "looks_switchcostumeto","looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume", "event_whenbroadcastreceived", "control_if", "operator_equals", "text", "text", "data_variable", "looks_switchcostumeto", "looks_costume"],
			init: {
				text: "Finally, let's switch the computer costume to scissors."
			},
			ok: {
				text: "Fantastic job! You've finished programming the computer's sprite. But now let's move onto programming your own sprite."
			},
			bad_block: {
				text: "Almost there! Try another block."
			}
		}
	]
};
module.exports = mission11;