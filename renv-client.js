var RENV_IP = "localhost";


var RenvClient = function(host, port) {
  this.host = host;
  this.port = port;
  this.uri = "ws://" + host + ":" + port;

  this.ws = null;

  this.onConnectFunc = null;
  this.onFirstConnectFunc = null;
  this.onReceiveEventFunc = null;

  this.isFirstConnect = true;
  this.isConnected = false

  initWS(this);

  var self = this;
  setInterval(function(){
    if(self.ws.readyState === WebSocket.CLOSED) {
      initWS(self);
    }
  }, 10 * 1000);
};

RenvClient.prototype.setDeviceInfo = function(deviceInfo) {
  console.log("[RenvClient] Set Device Info.");
  this.deviceInfo = deviceInfo;
};


RenvClient.prototype.sendEvent = function(event) {
  if(this.ws !== null)
    //console.log("[Blockly] Send Event: " + JSON.stringify(event));
    this.ws.send(JSON.stringify(event));
};


RenvClient.prototype.onConnect = function(func) {
  this.onConnectFunc = func;
};

RenvClient.prototype.onFirstConnect = function(func) {
  this.onFirstConnectFunc = func;
};

RenvClient.prototype.onReceiveEvent = function(func) {
  this.onReceiveEventFunc = func;
};


/*
WebSocket
*/
function initWS(self) {
  
  var cas = jiboCert;
  console.log(">>> ", self);
  self.ws = new WebSocket(self.uri);
  
  self.ws.onopen = function(err){
    console.log("[Blockly ws client] Open connection." + err);
    self.isConnected = true;
    self.ws.send(JSON.stringify(self.deviceInfo));

    if(self.onFirstConnectFunc !== null && self.isFirstConnect) {
      self.isFirstConnect = false;
      self.onFirstConnectFunc();
    }

    if(self.onConnectFunc !== null)
      self.onConnectFunc();

  };

  self.ws.onmessage = function(msg){
    console.log('[Blockly ws] Receive event: ' + msg.data);
    var aux = JSON.parse(msg.data);
    if (aux.eventName === "Renv.System.StartTransportEvent") {
      self.isConnected = true;
      console.log("Connected: ",  self.isConnected);
    }

    var jsonObj = null;
    try{
      jsonObj = JSON.parse(msg.data);
    } catch(err) {
    }

    if(jsonObj !==null && self.onReceiveEventFunc !== null)
      self.onReceiveEventFunc(jsonObj);
  };

  // エラー発生時
  self.ws.onerror = function(err){
    console.log("[Blockly ws] Network Error: " + err);
  };

  // 切断時
  self.ws.onclose = function(err) {
    console.log("[Blockly ws] Connection closed.");
    self.isConnected = false;
  };
}