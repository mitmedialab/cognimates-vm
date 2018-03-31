var mission_intro = {
	numberSteps: 3,
	steps : [
		{
			init_blocks: [],
			end_blocks: ['event_whenflagclicked'],
			init: {
				text: "Hi there I would like to know your name, so let's do a program that allow me to learn it. L'ets start with the green flag block",
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
			end_blocks: ['event_whenflagclicked','jibo_ask','text'],
			init: {
				text: "No i need to you to make me ask a question and save the answer in a variable. For that we'll need the jibo ask block ",
				image: ''
			},
			ok: {
				text: "Awsom!"
			},
			bad_block:{
				text: "ahhahaahh! you didn't use the magic block!"	
			} 
		},
		{
			init_blocks: ['event_whenflagclicked','jibo_ask','text'],
			end_blocks: ['event_whenflagclicked','jibo_ask','text','jibo_say','text','operator_join','text','text','data_variable'],
			init: {
				text: "now put a jibo say block. And an join block inside operators for joining two words. In the first one you can put hello, or something like that. on the other space add the variable where you stored your name.",
				image: ''
			},
			ok: {
				text: "Cool! Now press the green flag button."
			},
			bad_block:{
				text: "remember to use the variable block!"	
			} 
		}
	]	
}