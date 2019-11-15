# Cognimates-vm
Cognimates is platform where parents and children (7-10 years old) participate in creative programming activities where they learn how to build games, program robots, train their own AI models. Some of the activities are mediated by embodied intelligent agents which help learners scaffold learning and better collaborate. 
![List of Cognimates Extensions](https://github.com/mitmedialab/cognimates-gui/blob/379817bb6e013f585f672a85c8863b899d6381bd/src/lib/libraries/extensions/list_extensions.png?raw=true)



## Contributors:
* Stefania Druga - graduate student Personal Robots Group (Cognimates is part of my final thesis project) 
* Cynthia Breazeal - Advisor on the project and Stefania's thesis, Associate Professor of Media Arts and Sciences at the Massachusetts Institute of Technology, Director of the Personal Robots Group at the MIT Media Laboratory
* Eesh Likhith - visiting student MIT, UROP LLK 
* Sarah T Vu - undergraduate student MIT, UROP PRG
* Tammy Qiu - undergraduate student BU, intern PRG


## Instalation instructions:
```
cd cognimates-vm

npm install

npm link

npm link scratch-blocks 

npm run watch

cd ../scratch-blocks

npm install

npm link

cd ../cognimates-gui

npm install

npm link scratch-vm scratch-blocks

npm install

npm start

http://localhost:8601
```

Cognimates VM is building on Scratch VM: library for representing, running, and maintaining the state of computer programs written using [Scratch Blocks](https://github.com/LLK/scratch-blocks) provided as open source library by Lifelong Kindergarten Group.
