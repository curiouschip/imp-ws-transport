(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/work/cc/workspace/imp-ws-transport/demo/main.js":[function(require,module,exports){
var createTransport = require('../');

window.init = function() {
	var transport = createTransport('ws://localhost:10111/socket');

	setTimeout(function() {
		transport.send(new Uint8Array([1,2,3,4,5]), function(err, res) {
			if (err) {

			} else {
				console.log(res);
			}
		});
	}, 500);

	setTimeout(function() {
		transport.send(new Uint8Array([6, 10, 15, 23, 19, 100]), function(err, res) {
			if (err) {

			} else {
				console.log(res);
			}
		});
	}, 200);
}
},{"../":"/Users/jason/work/cc/workspace/imp-ws-transport/index.js"}],"/Users/jason/work/cc/workspace/imp-ws-transport/index.js":[function(require,module,exports){
var S_CONNECTING	= 1,
	S_IDLE			= 2,
	S_WAIT_REPLY	= 3,
	S_CLOSED		= 4;

var CLOSED 			= {};

module.exports = function(url) {
	return new Transport(url);
}

module.exports.CLOSED = CLOSED;

function Transport(url) {
	var self = this;
	this._socket = null;
	this._url = url;
	this._queue = [];
	this._state = S_CONNECTING;
	this._pendingCallback = null;
	this._reconnect();
	this._ping = setInterval(function() {
		self._socket.send("ping"); 
	}, 5000);
}

Transport.prototype.close = function() {
	if (this._state !== S_CLOSED) {
		this._state = S_CLOSED;
		this._socket.close();
		this._cancelPending();
		clearInterval(this._ping);
	}
}

Transport.prototype.send = function(buffer, cb) {
	if (this._state === S_CLOSED) {
		setTimeout(function() { cb(CLOSED); }, 0);
	} else {
		this._queue.push(cb, buffer);
		this._drain();
	}
}

Transport.prototype._reconnect = function() {
	var self = this;
	var sock = this._socket = new WebSocket(this._url);
	sock.binaryType = 'arraybuffer';
	sock.onopen = function() {
		if (self._state === S_CONNECTING) {
			self._state = S_IDLE;	
			self._drain();
		} else {
			console.error("socket opened when not in connecting state");
		}
	}
	sock.onclose = function() {
		sock.onopen = sock.onmessage = sock.onclose = null;
		switch (self._state) {
			case S_CONNECTING:
			case S_IDLE:
			case S_WAIT_REPLY:
				if (self._pendingCallback) {
					try {
						self._pendingCallback(new Error("error"));
						self._pendingCallback = null;
					} catch (e) {}	
				}
				self._state = S_CONNECTING;
				self._reconnect(); // TODO: throttle
				break;
			case S_CLOSED:
				// do nothing
		}
	}
	sock.onmessage = function(evt) {
		self._messageReceived(evt);
	}
}

Transport.prototype._messageReceived = function(evt) {
	if (this._state === S_WAIT_REPLY) {
		try {
			this._pendingCallback(null, new Uint8Array(evt.data));
			this._pendingCallback = null;
		} catch (e) {}
		this._state = S_IDLE;
		this._drain();
	} else {
		// drop it on the floor!
	}
}

Transport.prototype._drain = function() {
	if (this._state === S_IDLE && this._queue.length > 0) {
		this._state = S_WAIT_REPLY;
		this._pendingCallback = this._queue.shift();
		this._socket.send(this._queue.shift(), {binary: true});
	}
}

Transport.prototype._cancelPending = function() {
	while (this._queue.length) {
		try {
			this._queue.shift()(CLOSED);
		} catch (e) {}
		this._queue.shift();
	}	
}
},{}]},{},["/Users/jason/work/cc/workspace/imp-ws-transport/demo/main.js"]);
