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
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.speak','text'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.speak','text','tutor.tutorVoice','tutor.menu.voices'],
            init: {
                text: "If you don't like my voice you can change it to any other voice from the set voice block, try it",
                image: ''
            },
            ok: {
                text: 'Awsome!'
            },
            bad_block: {
                text: "Try it again!  remember to use the set voice block!"
            }
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.speak','text','tutor.tutorVoice','tutor.menu.voices'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'tutor.speak','text','tutor.tutorVoice','tutor.menu.voices','mission'],
            init: {
                text: 'Now try to change my voice and make me say different things and when you are ready try different missions with the mission block',
                image: ''
            },
            ok: {
                text: 'Great! now on to new coding adventures,Whenever you want to learn different things with me you may use the mission block and remove all the other blocks.'
            },
            bad_block: {
                text: 'remember to remove all other blocks when ready to try new missions'
            }
        }
    ]
};

module.exports = mission1;
