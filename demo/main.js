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