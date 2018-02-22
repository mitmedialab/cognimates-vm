// name mission
let mission1 = {
    numberSteps: 1,
    steps: [
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.speak','text'],
            init: {
                text: "Hi there I am your cognimate, I can help you learn how to program. You can also program me, try to make me say hello by dragging and clicking the cognimate say block",
                // image: './playground/media/icons/event_whenflagclicked.svg'
            },
            ok: {
                text: 'There you go! You did it!'
            },
            bad_block: {
                text: "Try again! you didn't use the magic block!"
            }
        }
        // {
        //     init_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked'],
        //     end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'tutor.askQuestion', 'text'],
        //     init: {
        //         text: "Now I need to you to make me ask a question and save the answer in a variable. For that we'll need the Tutor ask block ",
        //         image: ''
        //     },
        //     ok: {
        //         text: 'Awsome!'
        //     },
        //     bad_block: {
        //         text: "ahhahaahh! you didn't use the magic block!"
        //     }
        // },
        // {
        //     init_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'tutor.askQuestion', 'text'],
        //     end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'tutor.askQuestion', 'text', 'tutor.speak', 'text', 'operator_join', 'text', 'text', 'data_variable'],
        //     init: {
        //         text: 'now put a jibo say block. And an join block inside operators for joining two words. In the first one you can put hello, or something like that. on the other space add the variable where you stored your name.',
        //         image: ''
        //     },
        //     ok: {
        //         text: 'Cool! Now press the green flag button.'
        //     },
        //     bad_block: {
        //         text: 'remember to use the variable block!'
        //     }
        // }
    ]
};

module.exports = mission1;
