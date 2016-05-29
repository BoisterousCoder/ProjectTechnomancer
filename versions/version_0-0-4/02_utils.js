'use strict'
var doublePressDelay = 300;
var squareSize = 64;
var fps = 30;
var interactRange = 2;
var viewSize = 10;
var doorWait = 1000;
const aiChargeDistance = 2;
const aiFollowDistance = 3
const runSpeedMod = 7;
const walkSpeedMod = 3;
const saveLocation = '../saves';
let resourcesPath;
if(isUsingCodeFile){
	resourcesPath = '../resources';
}else{
	resourcesPath = `${mainDir}resources`;
}

let $canvas;
let player;
let mapName = 'test';
let htmlImgs = [];
let inventories = [];
let playerStartInventory = [];
let playerHeatBar;
//let endPythonLoop;
let maps;
let isGamePaused = false;
let isFirstBuild = true;
let playerInventory;
let runSpeed = runSpeedMod / 30;
let walkSpeed = walkSpeedMod / 30;
let scale;

const pf = require('pathfinding');
const gui = require('nw.gui');
const parseSVG = require('parse-svg');
const vm = require('vm');

class Coord {
	constructor(x, y) {
		this._x = x;
		this._y = y;
	}
	add(coord) {
		this._x += coord.x;
		this._y += coord.y;
	}
	subtract(coord) {
		this._x -= coord.x;
		this._y -= coord.y;
	}
	distanceTo(coord) {
		return Math.sqrt(
			Math.pow(this._x - coord.x, 2) +
			Math.pow(this._y - coord.y, 2));
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	set x(x) {
		this._x = x;
	}
	set y(y) {
		this._y = y;
	}
}

function attachAITo(block, game) {
	switch (block.aiType) {
	case ('move'):
		block.ai = new MoveAI(game, block.id);
		break;
	case ('eat'):
		block.ai = new EatAI(game, block.id);
		break;
	case ('follow'):
		block.ai = new FollowAI(game, block.id);
		break;
	}
}


function movePlayer(game, x, y) {
	game.entLayer.forEach(function (block) {
		if (block.symbol == 'p') {
			block.move(game, x, y, true);
			player = block;
		}
	})
}

function checkForBlock(game, checkPoints, isEventTriggerDisabled) {
	let blockAtLocation = false;
	for (let blockId in game.staticLayer) {
		let block = game.staticLayer[blockId];
		checkPoints.forEach(function (checkPoint) {
			if ((checkPoint.y > block.points[0].y) &&
				(checkPoint.y < block.points[3].y) &&
				(checkPoint.x > block.points[0].x) &&
				(checkPoint.x < block.points[3].x)) {
				if (block.colide) {
					blockAtLocation = true;
				}
			}
		});
	}
	for (let blockId in game.entLayer) {
		let block = game.entLayer[blockId];
		checkPoints.forEach(function (checkPoint) {
			if ((checkPoint.y > block.points[0].y) &&
				(checkPoint.y < block.points[3].y) &&
				(checkPoint.x > block.points[0].x) &&
				(checkPoint.x < block.points[3].x)) {
				if (block.colide) {
					blockAtLocation = true;
					if (block.onColide && !isEventTriggerDisabled) {
						block.onColide(game, blockAtLocation)
					}
				}
			}
		});
	}
	return blockAtLocation;
}


function readFile(url, callback) {
	if (isUsingCodeFile) {
		log(url);
		callback(readZippedFile(url));
	} else {
		fs.readFile(url, "utf8", function (error, data) {
			if (error) {
				log(error)
			}
			callback(data);
		});
	}
}

function getFilesInFolder(dir, callback) {
	let fileNames = [];
	if (isUsingCodeFile) {
		let files = readZippedFile(dir);
		for (let file in files){
			fileNames.push(file);
		}
	} else {
		for (let file of fs.readdirSync(dir)) {
			if (file.split('.')[1] != 'ini') {
				fileNames.push(file);
			}
		}
	}
	callback(fileNames);
}

function getAngle(from, to) {
	let relCoord = new Coord(from.x - to.x, from.y - to.y);
	return Math.atan2(relCoord.y, relCoord.x);
}

//Replace last
String.prototype.reverse = function () {
	return this.split('').reverse().join('');
};

String.prototype.replaceLast = function (what, replacement) {
	return this.reverse().replace(new RegExp(what.reverse()), replacement.reverse()).reverse();
};
//Replace All
String.prototype.replaceAll = function (textToRemove, replacement) {
	return this.split(textToRemove).join(replacement);
}