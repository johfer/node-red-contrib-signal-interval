var expect = require('chai').expect;
var helper = require("node-red-node-test-helper");
var signalInterval = require("./signal-interval.js");

helper.init(require.resolve('node-red'));

describe('signal-interval Node', function () {

	const defaultFlow = [{
			id: "n1",
			type: "signal-interval",
			name: "test name",
			cmd: "cmd",
			dummy: "300",
			wires: [["n2"]]
	},
		{
			id: "n2",
			type: "helper"
	}];

	let n1, n2;

	beforeEach(function (done) {
		helper.startServer(function () {
			helper.load(signalInterval, defaultFlow, function () {
				n1 = helper.getNode("n1");
				n2 = helper.getNode("n2");
				done();
			});
		});
	});

	afterEach(function (done) {
		helper.unload();
		helper.stopServer(done);
	});

	it('should be loaded', function () {
		expect(n1.name).to.equal('test name');
	});

	it('should calculate duration for normal on-off', function (done) {

		n2.on("input", function (msg) {
			expect(msg.payload.type).to.equal('actual');
			expect(msg.payload.duration).to.equal(100);
			done();
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 0
			}
		});
		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 100000
			}
		});

	});

	it('should use dummy duration if first signal is "off"', function (done) {

		n2.on("input", function (msg) {
			expect(msg.payload.type).to.equal('dummy');
			expect(msg.payload.duration).to.equal(300);
			done();
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 100000
			}
		});

	});

	it('should use dummy duration on repeated "off"', function (done) {

		var index = 0;

		n2.on("input", function (msg) {
			index++;
			expect(msg.payload.type).to.equal('dummy');
			expect(msg.payload.duration).to.equal(300);

			if (index == 3)
				done();
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 100000
			}
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 200000
			}
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 300000
			}
		});

	});


	it('should use dummy duration on repeated "on"', function (done) {

		var index = 0;

		n2.on("input", function (msg) {
			index++;
			expect(msg.payload.type).to.equal('dummy');
			expect(msg.payload.duration).to.equal(300);

			if (index == 2) //how to check that this function must only be called 2 times?
				done();
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 100000
			}
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 200000
			}
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 300000
			}
		});

	});

	it('calculates dummy and actual values (complicated case)', function (done) {

		var index = 0;

		n2.on("input", function (msg) {
			index++;

			switch (index) {
				case 1:
					expect(msg.payload.type).to.equal('dummy');
					expect(msg.payload.duration).to.equal(300);
					break;
				case 2:
					expect(msg.payload.type).to.equal('actual');
					expect(msg.payload.duration).to.equal(100);
					break;
				case 3:
					expect(msg.payload.type).to.equal('dummy');
					expect(msg.payload.duration).to.equal(300);
					break;
				case 4:
					expect(msg.payload.type).to.equal('actual');
					expect(msg.payload.duration).to.equal(100);
					done();
			}
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 100000
			}
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 200000
			}
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 300000
			}
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 400000
			}
		});

		n1.receive({
			payload: {
				cmd: 'on',
				timestamp: 500000
			}
		});

		n1.receive({
			payload: {
				cmd: 'off',
				timestamp: 600000
			}
		});

	});

});
