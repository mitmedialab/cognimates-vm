var mission2 = {
	numberSteps: 4,
	steps : [
		{
			init_blocks: [],
			end_blocks: ['event_whenflagclicked'],
			init: {
				text: "hey there, let's start the mission. Drag and drop the green flag block",
				image: './playground/media/icons/event_whenflagclicked.svg'
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
				text: "That's a good starting point. now put a forever loop.",
				image: './playground/media/icons/control_forever.svg'
			},
			ok: {
				text: "Awsom!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked','control_forever'],
			end_blocks: ['event_whenflagclicked','control_forever','jibo_say','text'],
			init: {
				text: "now put a jibo say block and type whatever you want me to repeat forever.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		}
	]	
}