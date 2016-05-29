'use strict'
function startPython(loopFunction, callback) {
	let indexedElements = [];
	let placeholderIds = 0;
	if(!callback){
		callback = function(data){};
	}

	let python = new PQ(mainDir);

	//commands
	python.add.commandHandler('loaded', function(){
		callback(python);
	});
	python.add.commandHandler('warn', function (data) {
		warn('Python Warns:' + data.msg);
	});
	python.add.commandHandler('alert', function (data) {
		alert(data.msg);
	});
	python.add.commandHandler('killMe', function (data) {
		warn("Python is requesting death");
		py.kill();
		alert("Python Suicided");
	});
	python.add.commandHandler('css', function (data) {
		getJqueryObj(data.selector, data.index).css(data.rules);
	});
	python.add.commandHandler('html', function (data) {
		getJqueryObj(data.selector, data.index).html(data.text);
	});
	python.add.commandHandler('append', function (data) {
		getJqueryObj(data.selector, data.index).append(data.text);
	});
	python.add.commandHandler('attribute', function (data) {
		getJqueryObj(data.selector, data.index).attr(data.property, data.value);
	});
	python.add.commandHandler('value', function (data) {
		return getJqueryObj(data.selector, data.index).value(data.value);
	});
	python.add.commandHandler('toggleClass', function (data) {
		getJqueryObj(data.selector, data.index).toggleClass(data.class)
	})
	python.add.commandHandler('loop', function (data) {
		loopFunction(function(game){
			let gameLayers = {
				staticLayer:[],
				entLayer:[]
			}
			game.staticLayer.forEach(function(block, i){
				gameLayers.staticLayer[i] = {
					name: block.name,
					x: block.x,
					y: block.y
				}
			});
			game.entLayer.forEach(function(block, i){
				gameLayers.entLayer[i] = {
					name: block.name,
					x: block.x,
					y: block.y
				}
			});
			let res = JSON.stringify(gameLayers);
			python.call(data.name, res);
		});
	});
	python.add.commandHandler('callback', function (data) {
		getJqueryObj(data.selector, data.index)[data.type](function (event) {
			if (this.id == '') {
				placeholderIds++;
				this.id = 'PlaceholderId' + placeholderIds;
			}
			py.call(data.name, '#' + this.id);
		});
	});

	//requests
	python.add.requestHandler('index', function (data) {
		let i = indexedElements.length;
		indexedElements[i] = $(data.selector);
		return i;
	});
	python.add.requestHandler('attribute', function (data) {
		return getJqueryObj(data.selector, data.index).attr(data.property);
	});
	python.add.requestHandler('css', function (data) {
		return getJqueryObj(data.selector, data.index).css(data.property);
	});
	python.add.requestHandler('html', function (data) {
		return getJqueryObj(data.selector, data.index).html();
	});
	python.add.requestHandler('size', function (data) {
		return getJqueryObj(data.selector, data.index).size();
	});
	python.add.requestHandler('value', function (data) {
		return getJqueryObj(data.selector, data.index).value();
	});

	function getJqueryObj(selector, index) {
		if (isNaN(index)) {
			return $(selector)
		} else {
			return indexedElements[index]
		}
	}
}