'use strict'
class PQ {
	constructor(pyDir) {
		if (pyDir) {
			this._pyDir = pyDir;
		} else {
			this._pyDir = '../lib/PY/main.py'
		}

		if (this.platform == 'win32') {
			this._pyDir = this.pyDir.replaceAll('/', '\\');
		}

		let spawnChild = require('child_process').spawn;

		this.process = spawnChild('python', ['-u', this.rootDir + this.pyDir]);
		this.onCommand = {};
		this.onRequest = {};
		
		console.info('nw.js version:' + this.process.version);
		console.info('platform:' + this.platform());
		console.info('root directory:' + this.rootDir);
		
		let py = this;
		py.add = {
			commandHandler: function (name, callback) {
				py.onCommand[name] = callback;
			},
			requestHandler: function (name, callback) {
				py.onRequest[name] = callback;
			}
		}
		
		py.process.stderr.on('data', function (data) {
			data = data.toString();
			py.onError(data);
		});
		py.process.stdout.on('data', function (msg) {
			msg = msg.toString();
			msg.split('\n').forEach(function (data) {
				if (data.substring(0, 3) == '<*>') {
					data = data.split('<*>');
					py.onCommand[data[1]](JSON.parse(data[2]));
				} else if (data.substring(0, 3) == '<:>') {
					data = data.split('<:>');
					let res = py.onRequest[data[1]](JSON.parse(data[2]));
					res = JSON.stringify(res)
					res = '<:>' + data[1] + '<:>' + res;
					res = res.replaceAll('\n', ' ');
					res += '\n';
					py.process.stdin.write(res);
				} else if (data != '') {
					py.onLog(data)
				}
			});
		});
		py.process.stderr.on('data', function (data) {
			data = data.toString();
			py.onError(data);
		});

		py.process.on('close', function (code) {
			py.onClose(code);
		});
	}
	onLog(data) {
		log('python log: ' + data);
	}
	call(name, eventData) {
		let res = '<*>' + name + '<*>' + eventData;
		res = res.replaceAll('\n', ' ');
		res += '\n';
		this.process.stdin.write(res);
	}
	onClose(code) {
		log('python exited with code ' + code);
	}
	onError(data) {
		error('python had error:\n' + data);
	}
	kill(){
		py.process.kill();
		warn('killing Python...');
	}
	get platform(){
		return require("os").platform;
	}
	get rootDir(){
		let returnData = process.cwd() + '/'
		if (this.platform == 'win32') {
			returnData.replaceAll('/', '\\');
		}
		return returnData;
	}
	get pyDir(){
		return this._pyDir;
	}
}
let PyQuery = PQ;