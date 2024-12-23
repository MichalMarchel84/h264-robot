"use strict";
const onMessage = require('./robotControl.js').onMessage;

const WebSocketServer = require('ws').Server;
const Splitter        = require('stream-split');
const merge           = require('mout/object/merge');

const NALseparator    = new Buffer([0,0,0,1]);//NAL break


class _Server {

  constructor(server, options) {

    this.options = merge({
        width : 640,
        height: 480,
        // width : 1296,
        // height: 972,
        // width : 1920,
        // height: 1080,
    }, options);

    this.wss = new WebSocketServer({ server });

    this.new_client = this.new_client.bind(this);
    this.start_feed = this.start_feed.bind(this);
    this.broadcast  = this.broadcast.bind(this);

    this.wss.on('connection', this.new_client);
  }
  

  start_feed() {
    var readStream = this.get_feed();
    this.readStream = readStream;

    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on("data", this.broadcast);
  }

  get_feed() {
    throw new Error("to be implemented");
  }

  broadcast(data) {
    this.wss.clients.forEach(function(socket) {

      if(socket.buzy)
        return;

      socket.buzy = true;
      socket.buzy = false;

      socket.send(Buffer.concat([NALseparator, data]), { binary: true}, function ack(error) {
        socket.buzy = false;
      });
    });
  }

  sendPicture(socket) {
    throw new Error("to be implemented");
  }

  new_client(socket) {
  
    var self = this;
    console.log('New guy');

    socket.send(JSON.stringify({
      action : "init",
      width  : this.options.width,
      height : this.options.height,
    }));

    socket.on("message", function(data){
      var cmd = "" + data, action = data.split(' ')[0];
      // console.log("Incomming action '%s'", action);

      if(action == "REQUESTSTREAM") {
        if((self.cameraProcess === undefined) || (self.cameraProcess.killed)){
          self.start_feed();
        }
      } else if(action == "CAPTURE") {
        self.readStream.pause();
        self.cameraProcess.kill();
        self.sendPicture(socket);
      } else {
        onMessage(data);
      }
    });

    socket.on('close', function() {
      self.readStream.end();
      self.cameraProcess.kill();
      console.log('stopping client interval');
    });
  }
};


module.exports = _Server;
