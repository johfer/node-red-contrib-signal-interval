module.exports = function (RED) {

	function SignalInterval(config) {
		RED.nodes.createNode(this, config);
		
		var node = this;
		
		var context = node.context();
	
		node.on("input", function (msg) {
			var newTimestamp;

			var newStatus = msg.payload[config.cmd];
			var oldStatus = context.get("status");
			
			if (typeof msg.payload.timestamp !== 'undefined')
				newTimestamp = msg.payload.timestamp;	//for testing
			else
				newTimestamp = Date.now();
			
			var oldTimestamp = context.get("timestamp");
			
			var lostSignal = (newStatus == oldStatus);
			
			if (newStatus === 'off' || lostSignal) {
				var isDummy = lostSignal || typeof(oldTimestamp)==='undefined';
				var duration = isDummy? parseInt(config.dummy) : (newTimestamp - oldTimestamp)/1000;
				var type = isDummy? 'dummy' : 'actual';
				msg.payload = {
					type: type,
					duration: duration
				};
				node.send(msg);
			}
			else {
				node.send(null);
			}
			
			context.set("timestamp", newTimestamp);
			context.set("status", newStatus);
		});
	}

	RED.nodes.registerType("signal-interval", SignalInterval);
};