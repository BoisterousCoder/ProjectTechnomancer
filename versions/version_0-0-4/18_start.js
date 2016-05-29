'use strict'
$(onload);

function onload() {
	$('#loadFromMainMenu').click(switchToLoad);
	$('#exitFromMainMenu').click(function () {
		let win = gui.Window.get();
		win.close();
	});
	if(isUsingCodeFile){
		$('#menu img').attr('src',readZippedFile('../../resources/imgs/menu/menu.svg'));
	}else{
		$('#menu img').attr('src','../../resources/imgs/menu/menu.svg');
	}
	makeAllMaps(function () {
		$('#loading').addClass('invisible');
	});
}

function start() {
	hideAllMenus();
	$('body').css('background-color', 'black');
	$('nav').css('display', 'block');
	$('#renderCanvas').css('display', 'block');
	$('#menu').click(function () {
		$('#gameMenu').slideToggle();
		isGamePaused = !isGamePaused;
	});
	$('#gameMenu button').click(function () {
		$('#gameMenu').slideUp();
		isGamePaused = false;
	});
	$('#inventory').click(switchToInventory)
	$('.back').click(switchToGameMenu);
	$('#settings').click(switchToSettings);
	$('#exit').click(function () {
		location.reload();
	});
	$('#gameMenu').slideUp();
	$('#save').click(save);
	$('#load').click(switchToLoad);
	get_game(undefined, function (game) {
		startGameLoop(game, 1000 / fps, gameLoop);
	});
}

function makeAllMaps(callback) {
	maps = {}
	let dir = `${resourcesPath}/maps`;
	let canvas = document.getElementById("renderCanvas");
	let c = canvas.getContext("2d");
	let completedMaps = 0;

	getFilesInFolder(dir, function (fileNames) {
		fileNames.forEach(function (fileName, i) {
			maps[fileName] = new Map(fileName);
			maps[fileName].onload(function () {
				completedMaps++;
				if (completedMaps + 1 >= fileNames.length) {
					if (callback) {
						callback();
					}
				}
			});
		});
	});
}

function startGameLoop(game, loopTime, eventLoop) {
	let mapScale = viewSize * squareSize;
	game.input = attachInputs(game.c.canvas);
	game.ui = getUI(game.c, mapScale);
	game.isFirstLoop = true;
	game.isReloadingMap = false;
	game.input.keyboard.getKey('esc').onPress = switchToGameMenu;

	let renderInterval = setInterval(function () {
		setTimeout(function () {
			game.renderFunc(loopTime, eventLoop);
		}, 0);
	}, loopTime);

	game.kill = function () {
		inventories = [];
		clearInterval(renderInterval);
	}
}

function get_game(oldGame, callback) {
	let game = maps[mapName];
	if (!game) {
		error(`map ${mapName} not found`)
	}
	for (let setting of game.vars) {
		window[setting.property] = setting.value;
	}
	if (!oldGame) {
		/*startPython(function (callback) {
			game.pythonLoop = callback;
		}, function (python) {
			game.python = python;*/
			callback(game);
		//});
	} else {
		//game.python = oldGame.python;
		//game.pythonLoop = oldGame.pythonLoop;
		callback(game);
	}
}

function getBlockTypes(callback) {
	let dir = `${resourcesPath}/blocks/`;
	let blockTypes = [];
	getFilesInFolder(dir, function (fileNames) {
		fileNames.forEach(function (fileName, i) {
			if (fileName.split('.')[1] != 'ini') {
				let fileDir = dir + fileName;
				readFile(fileDir, function (data) {
					let blockType = JSON.parse(data)
					blockType.name = fileName.split('.')[0]
					blockTypes[blockTypes.length] = blockType;
					if (i == fileNames.length - 1) {
						getItemTypes(function (itemTypes) {
							callback(blockTypes, itemTypes);
						})
					}
				});
			}
		});
	});
}

function getItemTypes(callback) {
	let dir = `${resourcesPath}/items/`;
	let itemTypes = [];
	getFilesInFolder(dir, function (fileNames) {
		fileNames.forEach(function (fileName, i) {
			if (fileName.split('.')[1] != 'ini') {
				let fileDir = dir + fileName;
				readFile(fileDir, function (data) {
					let itemType = JSON.parse(data)
					itemType.name = fileName.split('.')[0]
					itemTypes[itemTypes.length] = itemType;
					if (i == fileNames.length - 1) {
						callback(itemTypes);
					}
				});
			}
		});
	});
}