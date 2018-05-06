var express = require('express')
var app = express();
var Wemo = require('wemo-client');
var wemo = new Wemo();
var devices = [];
var client = undefined;
var cors = require('cors');

app.use(cors())

setInterval(function() {
  //wemo.discover(deviceDiscovered);
  wemo.discover(function(err, deviceInfo) {
  console.log('Wemo Device Found: %j', deviceInfo);

  // Get the client for the found device
  client = wemo.client(deviceInfo);

  // You definitely want to listen to error events (e.g. device went offline),
  // Node will throw them as an exception if they are left unhandled  
  client.on('error', function(err) {
    console.log('Error: %s', err.code);
  });

  // Handle BinaryState events
  client.on('binaryState', function(value) {
    console.log('Binary State changed to: %s', value);
  });

  // Turn the switch on
  devices.push(client);
});
}, 3000);

function deviceDiscovered(info) {
  for (var i=0; i<devices.length; i++) {
    if (devices[i].serialNumber == info.serialNumber)
      return
  }
  console.log("New device found: " + info.serialNumber);
  devices.push(info);
  client = wemo.client(info);
}

app.get('/search', function (req, res) {
  if(devices.length == 0) {
    console.log("No devices found");
    return;
  } else {
    res.send(JSON.stringify(devices));
  }
});

app.get('/connect/:index', function (req, res) {
  var index = req.params.index;
  console.log(index);
  if(index >= 0 && index < devices.length) {
    client = wemo.client(devices[index]);
    //setListeners(client);
    res.send("connected");
  }
});

app.get('/on', function (req, res) {
  if(client == undefined) {
    console.log("No client set");
    return;
  } else {
    client.setBinaryState(1);
    res.send("on");
  }
});

app.get('/off', function (req, res) {
  if(client == undefined) {
    console.log("No client set");
    return;
  } else {
    client.setBinaryState(0);
    res.send("off");
  }
});

app.listen(3000, function () {
  console.log("Server running on localhost:3000");
});