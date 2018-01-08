//server for the webpage (just localy visible)
var WebSocket = require('ws');

var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    webfile = process.argv[2] || null,
    port = process.argv[3] || 8080;
    portWebsocket = process.argv[4] || 8888;
    mimeTypes = {
      "html": "text/html",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "js": "text/javascript",
      "css": "text/css",
      "svg": "image/svg+xml"
    };

var ws = null;
var aux = "";

var local = require("ip");

// Get your local ip:
const myIp = local.address();

// For multiple jibos connected to the same app
var namedConnections = {}
// The queue with the event to be sent to Jibo
var queue = []
var freeToSend = true;

// Handshaken name
var jiboName = "";
var blockly  = null;
var _smallTalk = false;

// For multiple head-touch (HT) events (ROM bug?)
var _eventHT = false;
var timer = null;

function rewriteAudioList() {
  if (!fs.existsSync('./src/playground/assets/audio/')) {
    fs.mkdirSync('./src/playground/assets/audio/');
  }
  if (fs.existsSync("./src/playground/assets/image-list.json")){
    fs.unlink("./src/playground/assets/audio-list.json");

  }

  fs.readdir('./src/playground/assets/audio/', (err, files) => {
    var imagelist = [];
    files.forEach(file => {
      var imageName = file.split(".")[0];
      imagelist.push([imageName,'./src/playground/assets/audio/'+file]);
      fs.writeFile("./src/playground/assets/audio-list.json", JSON.stringify(imagelist), function(err) {
        if(err) {
            return console.log(err);
        }
      });
    });
    fs.writeFile("./src/playground/assets/audio-list.json", JSON.stringify(imagelist), function(err) {
      if(err) {
          return console.log(err);
      }
    });
  });
}

function rewriteImageList() {
  if (!fs.existsSync('./src/playground/assets/images/')) {
    fs.mkdirSync('./src/playground/assets/images/');
  }
  if (fs.existsSync("./src/playground/assets/image-list.json")){
    fs.unlink("./src/playground/assets/image-list.json");

  }

  fs.readdir('./src/playground/assets/images/', (err, files) => {
    var imagelist = [];
    files.forEach(file => {
      var imageName = file.split(".")[0];
      imagelist.push([imageName,'./src/playground/assets/images/'+file]);
      fs.writeFile("./src/playground/assets/image-list.json", JSON.stringify(imagelist), function(err) {
        if(err) {
            return console.log(err);
        }
      });
    });
    fs.writeFile("./src/playground/assets/image-list.json", JSON.stringify(imagelist), function(err) {
      if(err) {
          return console.log(err);
      }
    });
  });
}

function saveImage(dataimage, filename, callback) {
  
  fs.writeFile("./src/playground/assets/images/"+escape(filename)+".jpg", dataimage, function(err) {
    console.log(err);
    fs.readFile('./src/playground/assets/image-list.json', function read(err, data) {
      console.log(err);
      var imagelist = JSON.parse(data);
      var element = [escape(filename),"./src/playground/assets/images/"+escape(filename)+".jpg"];
      if (imagelist.indexOf(element)<0) {
        imagelist.push(element);
        fs.writeFile("./src/playground/assets/image-list.json", JSON.stringify(imagelist), function(err) {
          if(err) {
              return console.log(err);
          } else {
            if (callback){
              callback();
            }
          }
        });
      }

    });
  });
  //save the name on a list
  
}

function saveWorkspace(jsonData) {
  if (!fs.existsSync('./src/playground/projects/')) {
    fs.mkdirSync('./src/playground/projects/');
  }
  fs.writeFile("./src/playground/projects/"+escape(jsonData.saveName)+".xml", jsonData.xml, function(err) {
      if(err) {
          return console.log(err);
      }
  });
  //save the name on a list
  fs.readFile('./src/playground/projects/project-list.json', function read(err, data) {
      if (err) {
        if (err.code === 'ENOENT') {
          var projectlist = [];
          projectlist.push(escape(jsonData.saveName));
          fs.writeFile("./src/playground/projects/project-list.json", JSON.stringify(projectlist), function(err) {
            if(err) {
                return console.log(err);
            }
          });
        }

      }else {
        var projectlist = JSON.parse(data);
        if (projectlist.indexOf(escape(jsonData.saveName))>=0) {
          alert('this name alreaday exist');
        }else {
          projectlist.push(escape(jsonData.saveName));
          fs.writeFile("./src/playground/projects/project-list.json", JSON.stringify(projectlist), function(err) {
            if(err) {
                return console.log(err);
            }
          });
        }
      }
  });
}

// HTTP server (webpage app)
if (webfile === null || webfile === 'free'){
  webfile = './playground/website/free-project.html'
}else if (webfile == 'mission') {
  webfile = './playground/website/missions-projects.html'
}

const web = http.createServer( (request, response) => {
  if (request.method =='POST'){
    console.log("post received");
    var uri = url.parse(request.url).pathname
        , filename = path.join(process.cwd(), uri);

    //image received
    console.log(uri);
    if (uri.startsWith("/image/")) {
      let filename = uri.split("/image/")[1];
      let dataArray = [];
      request.on('data', function (data) {
          dataArray.push(data);
      });

      request.on('end', function () {

        let data = Buffer.concat(dataArray);

        saveImage(data, filename, ()=> {
          console.log("image saved");
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.end('post received');
        });

      });
      return;
    }else if (uri.startsWith("/workspace")) {

      dataArray = [];
      request.on('data', function (data) {
        dataArray.push(data);
      });

      request.on('end', function () {
        
        var jsonData = JSON.parse(dataArray.toString());
        if (jsonData.saveType === "workspace") {
          saveWorkspace(jsonData);
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.end('post received');
        }
      });
    }
    

  } else {
    var uri = url.parse(request.url).pathname
        , filename = path.join(process.cwd(), uri);

     var mimeType = mimeTypes[filename.split('.').pop()];

    if (uri == "/metadata") {
      response.writeHead(200, {'Content-Type': mimeType});
      let data = {ip: myIp, port: portWebsocket};
      response.write(JSON.stringify(data));
      response.end();
      return;
    }
    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
      }
      if (fs.statSync(filename).isDirectory()) filename += webfile;

      fs.readFile(filename, "binary", function(err, file) {
        if(err) {
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }
        
        var mimeType = mimeTypes[filename.split('.').pop()];

        if (!mimeType) {
          mimeType = 'text/plain';
        }
        response.writeHead(200, {'Content-Type': mimeType});
        response.write(file, "binary");
        response.end();
      });
    });
  }
});
//update medialists
rewriteImageList();
rewriteAudioList();

// WEB - ON CONNECTION
web.on('connection', function(sock){
  // remoteAddress must match localIP
  // if (sock.remoteAddress !== "localhost") {
  //   console.log("Unauhtorized! IP:" + sock.remoteAddress + " tried to access blockly server");
  //   web.close();
  //   // TODO! it better
  //   setTimeout( ()=> {
  //     web.listen(parseInt(port), myIp, 10);
  //   }, 3000);
  // }else {
  //   // console.log("Blockly connected successfully");
  // }
});

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");// Require HTTP module (to start server) and Socket.IO



// HTTP web server
web.listen(parseInt(port), "0.0.0.0", 10);


