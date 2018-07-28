import sys
import asyncio
import websockets
import cozmo
from cozmo.util import degrees
import time

CMD_SPEAK = 0x01
CMD_DRIVE = 0x02
CMD_STOP = 0x03
CMD_TURN = 0x04
CMD_PICKUP_BLOCK = 0x05
CMD_SET_BLOCK = 0x06
CMD_LOOK = 0x07
CMD_LIST = [CMD_SPEAK, CMD_DRIVE, CMD_STOP, CMD_TURN, CMD_PICKUP_BLOCK, CMD_SET_BLOCK, CMD_LOOK]

EMOTION_LABELS = ['happy', 'sad', 'shocked']
EMOTION_TRIGGERS = [cozmo.anim.Triggers.MajorWin, cozmo.anim.Triggers.FrustratedByFailureMajor, cozmo.anim.Triggers.Shocked]

robot = None
cube = None

async def scratch_server(websocket, path):
    print("Connected to {!s}".format(websocket.local_address))
    while websocket.open:
        rawData = await websocket.recv()
        process_data(rawData)
    print("Connection closed")

def process_data(rawData):
    inputData = rawData.split(',')
    cmd = int(inputData[0])
    if cmd in CMD_LIST:
        run_cmd(inputData)

def run_cmd(inputData):
    global robot, cube
    cmd = int(inputData[0])
    if cmd == CMD_SPEAK:
        robot.say_text(inputData[1]).wait_for_completed()
    elif cmd == CMD_DRIVE:
        speed = float(inputData[1])
        robot.drive_wheels(speed, speed, speed, speed)
    elif cmd == CMD_STOP:
        robot.stop_all_motors()
    elif cmd == CMD_TURN:
        robot.turn_in_place(degrees(int(inputData[1]))).wait_for_completed()
    elif cmd == CMD_PICKUP_BLOCK:
        look_around = robot.start_behavior(cozmo.behavior.BehaviorTypes.LookAroundInPlace)
        cube = None
        try:
            cube = robot.world.wait_for_observed_light_cube(timeout=30)
            print("Found a cube")
        except asyncio.TimeoutError:
            print("No cube found")
        look_around.stop()
        if not cube:
            robot.play_anim_trigger(cozmo.anim.Triggers.MajorFail)
            return
        cube.set_lights(cozmo.lights.green_light.flash())
        anim = robot.play_anim_trigger(cozmo.anim.Triggers.BlockReact)
        anim.wait_for_completed()
        action = robot.pickup_object(cube)
        result = action.wait_for_completed(timeout=30)
    elif cmd == CMD_SET_BLOCK:
        action = robot.place_object_on_ground_here(cube)
        result = action.wait_for_completed(timeout=30)
        anim = robot.play_anim_trigger(cozmo.anim.Triggers.MajorWin)
        cube.set_light_corners(None, None, None, None)
        anim.wait_for_completed()
    elif cmd == CMD_LOOK:
        animation = EMOTION_TRIGGERS[EMOTION_LABELS.index(inputData[1])]
        robot.play_anim_trigger(animation).wait_for_completed()

def run(sdk_conn):
    global robot
    robot = sdk_conn.wait_for_robot()
    print("Connected to {!s}".format(robot))
    start_server = websockets.serve(scratch_server, '127.0.0.1', 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

if __name__=='__main__':
    while not robot:
        time.sleep(2)
        print(robot)
        try:
            cozmo.connect(run)
        except cozmo.ConnectionError as e:
            print("Cozmo not found")
