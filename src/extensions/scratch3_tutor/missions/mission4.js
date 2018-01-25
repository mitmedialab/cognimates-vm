var mission4 = {
	numberSteps: 5,
	steps : [
		{
			blocks : [],
			text : 'Hello this is a test mission, press the green flag'
		},
		{
			blocks : ['event_whenflagclicked'],
            text: "That worked great. Now try to make me blink",
            image: './playground/media/icons/event_whenflagclicked.svg'

		},
		{
			blocks : ['event_whenflagclicked','jibo_blink'],
            text: "yay",
            image: './playground/media/icons/set-led_blue.svg'

		},
		{
			blocks : ['event_whenflagclicked','control_forever','jibo_say','text'],
			text: "We are almost there! Now click the green flag!"
		}

	]
}
