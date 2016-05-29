'use strict'

function gameLoop(game) {
	let moveSpeed = walkSpeed;

	if (game.isFirstLoop) {
		$canvas = $('#renderCanvas');

		game.input.window.onResize = function () {
			game.ui.cScale = setScale(game.ui);
		}
		/*let background = game.ui.addElement.img(game.ui, {
			width: game.ui.c.canvas.width,
			height: game.ui.c.canvas.height,
			img: createImg('background', 'jpg'),
			x: 0,
			y: 0
		});*/

		game.staticLayer.forEach(function (block) {
			game = block.makeDisplay(game);
		});
		game.entLayer.forEach(function (block) {
			game = block.makeDisplay(game);
			if (block.inventory) {
				block.inventory.makeDisplay()
			}
			if (block.symbol == 'p') {
				player = block;
				if (!playerInventory) {
					playerInventory = new Inventory(player, playerStartInventory);
				}
				player.inventory = playerInventory;
				playerInventory.makeDisplay();
			}
		});
		let playerHeatBarBackground = game.ui.addElement.square(game.ui, {
			width: game.ui.scale - 2*squareSize,
			height: squareSize / 2,
			x: squareSize,
			y: game.ui.scale - squareSize / 2
		});
		game.ui.elements[playerHeatBarBackground].color = 'gray';
		playerHeatBar = game.ui.addElement.square(game.ui, {
			width: game.ui.scale - 2*squareSize,
			height: squareSize / 2,
			x: squareSize,
			y: game.ui.scale - squareSize / 2
		});
		game.ui.elements[playerHeatBar].color = 'red';
		$('#inventory').click(function () {
			game.entLayer.forEach(function (block) {
				if (block.inventory) {
					block.inventory.isVisable = false;
					if (block.distanceTo(player) < interactRange) {
						block.inventory.showNav();
					} else {
						block.inventory.hideNav();
					}
				}
			})
		});
	}

	if (game.input.keyboard.getKey('shift').isPressed) {
		moveSpeed = runSpeed;
	}
	if (game.input.keyboard.getKey('w').isPressed) {
		movePlayer(game, 0, moveSpeed);
	}
	if (game.input.keyboard.getKey('s').isPressed) {
		movePlayer(game, 0, -moveSpeed);
	}
	if (game.input.keyboard.getKey('a').isPressed) {
		movePlayer(game, moveSpeed, 0);
	}
	if (game.input.keyboard.getKey('d').isPressed) {
		movePlayer(game, -moveSpeed, 0);
	}

	if (player.hasMoved && moveSpeed == runSpeed) {
		player.animation = 'run';
	} else if (player.hasMoved) {
		player.animation = 'walk';
	} else {
		player.animation = 'still';
	}
	player.hasMoved = false;
	let playerLoc = new Coord(player.display.x + player.display.width / 2,
		player.display.y + player.display.height / 2);
	player.rotation = getAngle(playerLoc, game.input.mouse) - Math.PI / 2;

	for (let inventory of inventories) {
		inventory.update();
	}
	
	game.ui.elements[playerHeatBar].width = (game.ui.scale - 2*squareSize) * (player.heat/player.maxHeat);
	for(let block of game.entLayer){
		if(block.maxHeat){
			block.heat += block.heatRegen;
		}
	}
	return game
}