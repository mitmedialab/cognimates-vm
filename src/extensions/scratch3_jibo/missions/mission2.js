var mission2 = {
	numberSteps: 5,
	steps : [
		{
			init_blocks: [],
			end_blocks: ['event_whenflagclicked'],
			init: {
				text: "You've probably heard of pacman before. Well, today we are going to make our own version of pacman. Start with green flag block",
				image: ''
			},
			ok: {
				text: "There you go! You did it!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked'],
			end_blocks: ['event_whenflagclicked','control_forever'],
			init: {
				text: "The whole time our pacman game is running, we want our pacman character to be opening and closing his mouth. First, use a forever loop that we will put directions for the pacman inside of.",
				image: ''
			},
			ok: {
				text: "Awesome!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked','control_forever'],
			end_blocks: ['event_whenflagclicked','control_forever','looks_nextcostume'],
			init: {
				text: "Put the next costume block inside of that forever loop to make it so pacman switches back and forth between having an open mouth and a closed mouth.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Remember to use the next costume block!"	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked','control_forever','looks_nextcostume'],
			end_blocks: ['event_whenflagclicked','control_forever','looks_nextcostume','control_wait'],
			init: {
				text: "Pacman is opening and closing his mouth too fast! Use a wait for one second block in your forever loop to make him open and close it more slowly.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Try again! Make sure you are using the wait for one second block."	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked','control_forever','looks_nextcostume','control_wait'],
			end_blocks: ['event_whenflagclicked','control_forever','looks_nextcostume','control_wait','event_whenkeypressed'],
			init: {
				text: "Now we want to be able to make Pacman move left, right, up, and down. Let's start with the event block that says when left key pressed",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "Try again! Look in the events panel for a block that says when key pressed!"	
			} 
		}
	]	
}
module.exports= mission2;