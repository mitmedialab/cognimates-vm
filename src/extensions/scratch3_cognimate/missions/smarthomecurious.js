//smart home curious mission
let mission10 = {
    numberSteps: 8,
    steps: [
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked"],
            init: {
                text: "Let's train a smart home that can understand our commands. Start off with the green flag block from events"
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
                text: "Do we want our smart home to only listen to our commands once? Or should it always be listening? What kind of control block should we use to make sure that our smart home is always waiting for our commands?"
            },
            ok: {
                text: "Great job! That's exactly the right block."
            },
            bad_block: {
                text: "Oops! That's not the right block try another orange block and see."
            }   
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text"],
            init: {
                text: "But how do we even get our smart home to listen to what we say? What kind of block would ask a question?"
            },
            ok: {
                text: "Awesome! That's the right block."
            },
            bad_block: {
                text: "Not quite. Here's a hint: this is a blue block under sensing."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if"],
            init: {
                text: "What kind of control tests whether a statement is true or not, and then performs an action if it is? Hint, it's one of the control blocks."
            },
            ok: {
                text: "You're doing great!"
            },
            bad_block: {
                text: "Mmmm not this one. Try another control block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text"],
            init: {
                text: "Now, inside of our if block we need some sort of operator that checks if two statements are equal or not. Where would we find a block like that?"
            },
            ok: {
                text: "Great job! You found it!"
            },
            bad_block: {
                "That's not the right block. Try looking under operators."
            }
        }
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer"],
            init: {
                text: "So we've already finished training our model. How can we now recognize if our command means to turn the lights on?"
            },
            ok: {
                text: "Awesome! You're halfway there."
            },
            bad_block: {
                text: "Not quite. We need two blocks here and then for you to fill out one of the blank spaces in the operator block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text"],
            init: {
                text: "If smart home recognizes that our command means to turn the lights on. We should use a block that will turn a light on, right? Try looking for one under the Hue extension."
            },
            ok: {
                text: "Great job!"
            },
            bad_block: {
                text: "That's not the right block. Try looking for another one under the extension."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text"],
            init: {
                text: "Now do you think you can do what you did again, but this time turning the lights off? Give it a try!"
            },
            ok: {
                text: "Fantastic job! You've just successfully programmed your own smart home!"
            },
            bad_block: {
                text: "That's not the right block. Make sure you follow the same steps that we did for turning the lights on. But make sure to set everything as lights off!"
            }
        }
    ]
};
module.exports = mission10;