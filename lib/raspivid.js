"use strict";

const util      = require('util');
const spawn     = require('child_process').spawn;
const merge     = require('mout/object/merge');

const Server    = require('./_server');


class RpiServer extends Server {

  constructor(server, opts) {
    super(server, merge({
      fps : 8,
    }, opts));
  }

  get_feed() {
    var msk = "libcamera-vid -t 0 -o - --width %d --height %d -fps %d";
    var cmd = util.format(msk, this.options.width, this.options.height, this.options.fps);
    console.log(cmd);
    var streamer = spawn('libcamera-vid', ['-t', '0', '-o', '-', '--width', this.options.width, '--height', this.options.height, '--framerate', this.options.fps, '-n', '--profile', 'baseline']);
    streamer.on("exit", function(code){
      console.log("Failure", code);
    });
    this.cameraProcess = streamer;

    return streamer.stdout;
  }

  sendPicture(socket) {
    console.log("Taking picture");
    var pictureProcess = spawn('libcamera-still', ['-o', './public/picture.jpg', '--width', 2592, '--height', 1944]);
    pictureProcess.on("exit", (code) => {
      console.log("libcamera-still exited with code", code);
      this.sendPictureEnd(socket);
    });
  }

  sendPictureEnd(socket) {
    socket.send(JSON.stringify({
      action : "picture"
    }));
  }
};



module.exports = RpiServer;
