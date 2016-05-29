'use strict'
class Mod {
	constructor(modName, sandbox) {
		let javascriptString = '';
		let entries;
		if (isDebugMode) {
			entries = getAllFiles(modDir + modName);
		} else {
			entries = getAllFiles(modDir + modName + '.code');
		}
		for (let entry of entries) {
			switch (entry.name.split('.')[1]) {
			case 'js':
				var code = entry.getData().toString();
				javascriptString += code;
				break;
			case 'css':
				var code = entry.getData().toString();
				var style = document.createElement("style");
				style.innerHTML = code;
				document.getElementsByTagName("head")[0].appendChild(style);
				log('loaded ' + entry.name + ' from ' + modName);
				break;
			case 'jpg':
			case 'png':
			case 'gif':
				error('cannot load ' + entry.name + ', because it is an image not in svg format from ' + modName);
				break;
			case 'map':
			case 'json':
			case 'dialog':
				var data = entry.getData().toString();
				addZippedFile(entry.entryName, data);
				log('loaded ' + entry.name + ' from ' + modName);
				break;
			case 'svg':
				var data = entry.getData().toString();
				var url = 'data:image/svg+xml,' + data;
				addZippedFile(entry.entryName, url);
				log('loaded ' + entry.name + ' from ' + modName);
				break;
			case 'npm':
				break;
			default:
				warn(entry.name + ' does not have a recognized file type from ' + modName);
				break;
			}
		}
		this.compile(javascriptString, sandbox);
	}
	onLoop(game) {
		this.globals.exports.onGameLoop(game);
	}
	onGameChange(oldGame, newGame) {
		this.globals.exports.onGameChange(oldGame, newGame);
	}
	compile(code, sandbox) {
		if (!sandbox) {
			sandbox = {};
		}
		this.globals = sandbox;
		this.globals.exports = {
			onload() {},
				onGameLoop() {},
				onGameChange() {}
		}
		this.globals.modName = name;
		this.name = name;
		this.globals.console = {
			info(msg) {
					info(`${this.name}:${msg}`);
				},
				log(msg) {
					log(`${this.name}:${msg}`);
				},
				warn(msg) {
					warn(`${this.name}:${msg}`);
				},
				error(msg) {
					error(`${this.name}:${msg}`);
				}
		};
		let context = new vm.createContext(this.globals);
		this.script = new vm.Script(code);
		this.script.runInContext(context, {
			displayErrors: true
		});
		this.globals.onLoad();
	}
}