// cognimate mission
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
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.tutorVoice', 'text'],
            init: {
                text: "If you don't like my voice you can change it to any other voice from the set voice block, try it",
                image: ''
            },
            ok: {
                text: 'Awsome!'
            },
            bad_block: {
                text: "Try it again!remember to use the set voice block!"
            }
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission'],
            end_blocks: ['mission'],
            init: {
                text: 'Whenever you want to learn different things with me you may use the mission block and remove all the other blocks.',
                image: ''
            },
            ok: {
                text: 'Great! now on to new coding adventures'
            },
            bad_block: {
                text: 'remember to remove all other blocks'
            }
        }
    ]
};

module.exports = mission1;
