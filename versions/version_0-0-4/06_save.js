'use strict'

function save() {
	let saveNum = fs.readdirSync(saveLocation).length;
	let saveData = {
		map: mapName,
		settings: []
	}
	$('.setting').each(function (i) {
		if (i != 0) {
			let setting = {
				name: this.innerHTML
			};
			setting.value = window[setting.name];
			saveData.settings.push(setting);
		}
	});
	let json = JSON.stringify(saveData);
	let path = `${saveLocation}/save${saveNum}.json`;
	fs.writeFile(path, json);
}

function load(url) {
	url = url.split('"').join();
	fs.readFile(url, "utf8", function (err, data) {
		if (err) {
			error(err)
		}
		data = JSON.parse(data);
		mapName = data.map;
		for (let setting of data.settings) {
			window[setting.name] = setting.value;
		}
		start();
	});
}

function buildLoadMenu(game) {
	let loadMenu = $('#loadMenu').html('');
	fs.readdirSync(saveLocation).forEach(function (fileName) {
		let fileDir = saveLocation + '/' + fileName;
		fileName = fileName.split('.')[0];
		loadMenu.prepend(`<button loadFile='${fileDir}' class='loadButton'>${fileName}</button>`)
	});
	loadMenu.prepend(`<button id='newGame'>New Game</button>`)
	loadMenu.prepend(`<button id='goHome' class='right'>Back</button>`)
	$('#newGame').click(function () {
		if (game) {
			game.isReloadingMap = true;
		} else {
			start();
		}
	});
	$('#goHome').click(function () {
		location.reload();
	});
	$('.loadButton').click(function () {
		let url = this.getAttribute('loadFile');
		load(url);
	});
}