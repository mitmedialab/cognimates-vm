var five = require("johnny-five");
var express = require('express')
var app = express();

const server = require('http').createServer(app).listen(3001);
const io = require('socket.io')(server);

var board = new five.Board();

setPin = function(num, state) {
  var led = new five.Led(num)
  if (state == 'on') led.on()
  if (state == 'off') led.off()
}

board.on("ready", function() {
  console.log("Ready event. Repl instance auto-initialized!");
  this.repl.inject({
    setPin : function(num, state) {
      var led = new five.Led(num)
      if (state == 'on') led.on()
      if (state == 'off') led.off()
    }
  })
  
  io.sockets.on('connection', function(client) {
    client.on('join', function(handshake) {
      console.log(handshake)
    });
    client.on('setPin', function(data) {
      setPin(parseInt(data.num), data.state);
      client.emit('setPin', data);
      client.broadcast.emit('setPin', data);
    });
  });
});

const port = process.env.PORT || 3000;

//server.listen(port);
console.log(`Server listening on http://localhost:${port}`);


