// music mission
let mission4 = {
    numberSteps: 4,
    steps: [
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked'],
            init: {
                text: "Today, we're going to learn about if statements by playing some sounds! Let's start with the green flag block from events",
                image: './playground/media/icons/event_whenflagclicked.svg'
            },
            ok: {
                text: 'There you go! You did it!'
            },
            bad_block: {
                text: "ahhahaahh! you didn't use the magic block!"
            }
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'control_if'],
            init: {
                text: "Let's use an if then block next. This block checks its condition. If the condition is true, the blocks inside the block run and if the condition is false, the blocks inside the block will not run",
                image: ''
            },
            ok: {
                text: 'Awsom!'
            },
            bad_block: {
                text: "ahhahaahh! you didn't use the magic block!"
            }
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'control_if'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'control_if', 'sensing_mousedown'],
            init: {
                text: 'Place a mouse down sensing block inside of the if statement. Now, our if statement checks to see if the mouse is down. If it is, whatever is inside of the if statement will run. ',
                image: ''
            },
            ok: {
                text: 'Cool!'
            },
            bad_block: {
                text: 'remember to use the variable block!'
            }
        },
        {
            init_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'control_if', 'sensing_mousedown'],
            end_blocks: ['tutor.mission', 'tutor.menu.mission', 'event_whenflagclicked', 'control_if', 'sensing_mousedown', 'sound_playuntildone', 'sound_sounds_menu'],
            init: {
                text: 'Inside of the if statement, put a play sound until done block with the Meow sound.',
                image: ''
            },
            ok: {
                text: 'Now, you can click the green flag and test your program!'
            },
            bad_block: {
                text: 'remember to use the variable block!'
            }
        }
    ]
};
module.exports = mission4;
