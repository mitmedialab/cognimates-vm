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
                text: "Good job!"
            },
            bad_block: {
                text: "Mmmm not this one. Try looking under operators."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext"],
            init: {
                text: "So we've already finished training our model. How can we now recognize if our command means to turn the lights on? What should we fill one of the blanks with?"
            },
            ok: {
                text: "Awesome! You're halfway there."
            },
            bad_block: {
                text: "Not quite. We need two blocks here and then for you to fill out one of the blank spaces in the operator block."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer"],
            init: {
                text: "Now what do you think should be in the other blank?"
            },
            ok: {
                text: "Great job!"
            },
            bad_block: {
                text: "Oops! Try again. What are we comparing Watson's answers to?"
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
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if"],
            init: {
                text: "Now do you think you can do what you did again, but this time turning the lights off? Give it a try! What's the first block that we should use?"
            },
            ok: {
                text: "Correct!"
            },
            bad_block: {
                text: "That's not the right block. Make sure you follow the same steps that we did for turning the lights on."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text"],
            init: {
                text: "Keep going, you got this!"
            },
            ok: {
                text: "You're right!"
            },
            bad_block: {
                text: "Oops! Try again."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext"],
            init: {
                text: "What now?"
            },
            ok: {
                text: "Amazing job!"
            },
            bad_block: {
                text: "Oh no that's not the right block! What did we do before?"
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer"],
            init: {
                text: "You know what's next!"
            },
            ok: {
                text: "You're right!"
            },
            bad_block: {
                text: "Try again! Look at what we did before."
            }
        },
        {
            init_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer"],
            end_blocks: ["tutor.mission", "tutor.menu.mission", "event_whenflagclicked", "control_forever", "sensing_askandwait", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text", "control_if", "operator_equals","text","text", "watson_recognizetext", "sensing_answer", "hue_setLightStatus", "text", "text"],
            init: {
                text: "And the very last step that will control the lights is:"
            },
            ok: {
                text: "You've completed your mission! Now you can go play with your smart lights."
            },
            bad_block: {
                text: "Almos there! Try again."
            }
        }
    ]
};
module.exports = mission10;