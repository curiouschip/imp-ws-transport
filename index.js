var Buffer = require('buffer/').Buffer;

var NOP = function() {};

module.exports = function(url) {
	var sock = new WebSocket(url);
	sock.binaryType = 'arraybuffer';
	var ready = false;

	sock.onopen = function() {
		ready = true;
		iface.onready();
		setInterval(function() {
			sock.send("ping");
		}, 5000);
	}

	sock.onmessage = function(evt) {
		iface.onpacket(new Buffer(evt.data));
	}

	var iface = {
		onready: NOP,
		onpacket: NOP,
		send: function(buffer) {
			if (!ready) {
				throw new Error("state error");
			} else {
				sock.send(buffer);
			}
		},
		close: function() {

		}
	};

	return iface;

}
