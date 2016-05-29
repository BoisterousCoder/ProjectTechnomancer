'use strict'
class Map {
	constructor(name) {
		this.url = `${resourcesPath}/maps/${name}.map`;
		let canvas = document.getElementById("renderCanvas");
		this.c = canvas.getContext("2d");
		this.name = name;
		this.appenedFuncs = [];
		this._loadCallbacks = [];
		this.ais = [];
		this.hasLoaded = false;
		let self = this;
		makeMap(this.name, function(staticLayer, entLayer, vars){
			self._makeMapCallback(staticLayer, entLayer, vars);
		});
	}
	_makeMapCallback(staticLayer, entLayer, vars) {
		this.staticLayer = staticLayer;
		this.entLayer = entLayer;
		this.vars = vars;
		for(let block of this.entLayer){
			if(block.aiType){
				attachAITo(block, this);
			}
		}

		this.hasLoaded = true;
		this._loadCallbacks.forEach(function (func) {
			func();
		});

	}
	appendLoop(callback) {
		let id = 0;
		while (true) {
			if (!this.appenedFuncs[id]) {
				this.appenedFuncs[id] = callback;
				break;
			}
			id++;
		}
		let self = this;
		return function () {
			self.appenedFuncs[id] = undefined;
		}
	}
	onload(callback) {
		if (this.hasLoaded) {
			callback();
		} else {
			this._loadCallbacks.push(callback);
		}
	}
	updateAIs(){
		for(let ai of this.ais){
			ai.update(this);
		}
	}
	renderFunc(loopTime, eventLoop){
		updateInputs(this);
		updateUI(this);
		if (!isGamePaused) {
			eventLoop(this);
			//this.pythonLoop(this);
			for (let func of this.appenedFuncs) {
				if (func) {
					func(this); //just so funky
				}
			}
			this.updateAIs();
		}
		this.isFirstLoop = false;
		if (this.isReloadingMap) {
			self = this;
			get_game(self, function(map){
				self.kill();
				startGameLoop(map, loopTime, eventLoop);
			});
		}
	}
}