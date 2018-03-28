//smart home mission (with instructions)
let mission9 = {
    numberSteps: 13,
    steps:[
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
            init: {
                text: "Let's train a smart home that can understand our commands. \
                Start off with the green flag block from events"
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
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever"],
            init: {
                text: "We always want our lights to be waiting for our commands. So let's make sure to wrap \
                everything with a forever loop under controls."
            },
            ok: {
                text: "Great job!"
            },
            bad_block: {
                text: "Oh no! Look for the block that says forever in controls."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text"],
            init: {
                text: "Now write your smart home a message and save it in an answer variable. You should use the Ask \
                and Wait block under sensing."
            },
            ok: {
                text: "Awesome!"
            },
            bad_block: {
                text: "Oh no! You didn't use the right block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if"],
            init: {
                text: "The smart lights should turn on depending on what your command is. Let's start by placing using an\
                 empty if block."
            },
            ok: {
                text: "Great job!"
            },
            bad_block: {
                text: "Oh no! That's not the right one."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text"],
            init: {
                text: "Now we want to see if the smart lights think our message means lights on. For that, put a green equals block\
                 into the if block."
            },
            ok: {
                text: "Awesome! Let's move on to the next step."
            },
            bad_block: {
                text: "Oh no! Make sure you're using the gren equals block under operators."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text"],
            init: {
                text: "Using your trained Watson model, you want to see if the smart lights recognize your command as lights on. \
                You can find the recognize text block under the Watson extension and put it in one of the blanks."
            },
            ok: {
                text: "Great job! Let's move on."
            },
            bad_block: {
                text: "Those aren't the right blocks. Make sure you're using your answer variable, the Watson recognize text \
                block, and filling in the other side of the equals operator."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer"],
            init: {
                text: "In the other blank put in your answer variable so it can be compared to what Watson thinks the answer means."
            },
            ok: {
                text: "Awesome!"
            },
            bad_block: {
                text: "Oops! try again."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text"],
            init: {
                text: "If your model recognizes your command to mean lights on, we can have the smart lights turn on. Nest the \
                Set light status to On block under the if block."
            },
            ok: {
                text: "Great job! You're almost done."
            },
            bad_block: {
                text: "That's not the right block. Try again."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if"],
            init: {
                text: "Now let's repeat what we did above to turn the lights on on the opposite command. Turning the light off. Start with another if statement."
            },
            ok: {
                text: "Fantastic!"
            },
            bad_block: {
                text: "That's not the right block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text"],
            init: {
                text: "Let's put another equals operator into the if block."
            },
            ok: {
                text: "Good job!"
            },
            bad_block: {
                text: "Oops! Try again."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text"],
            init: {
                text: "You know the drill, put the watson recognize text into one of the blanks"
            },
            ok: {
                text: "Let's move on."
            },
            bad_block: {
                text: "Oh no! You're not using the right block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer"],
            init: {
                text: "Put the answer variable inot the other blank."
            },
            ok: {
                text: "Great! We're almost there!"
            },
            bad_block: {
                text: "Oops! Try again."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson.recognizeText","text", "sensing_answer", "hue.setLightStatus", "text", "text"],
            init: {
                text: "Finally, nest the set lights status to off block in the if block."
            },
            ok: {
                text: "You've completed your mission! Good job!"
            },
            bad_block: {
                text: "Mmm not quite, try again."
            }
        }
    ]
};

module.exports = mission9;