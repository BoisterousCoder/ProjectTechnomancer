'use strict'
function updateAIs(game) {
	for (let ai of this.ais) {
		ai.update(game);
	}
}
class MoveAI {
	constructor(game, tileId, isWaypointsDisabled) {
		if (!isWaypointsDisabled) {
			isWaypointsDisabled = false;
		}
		this.isWaypointsDisabled = isWaypointsDisabled;
		this._tile = game.entLayer[tileId];
		this._tileId = tileId;
		this.isRunning = false;
		this.isMoving = false;
		this.disableMovement = false;
		this.runSpeed = runSpeed;
		this.walkSpeed = walkSpeed;
		this._destination = new Coord(this._tile.x, this._tile.y);
		this.waypointNum = 0;
		game.ais.push(this);
	}
	moveToWaypoint() {
		let isCloseToWaypoint = {
			x: Math.abs(this.waypoint.x - this._tile.x) <= this.moveSpeed / 2,
			y: Math.abs(this.waypoint.y - this._tile.y) <= this.moveSpeed / 2
		};
		if (isCloseToWaypoint.x && isCloseToWaypoint.y) {
			this.waypointNum++;
		}
		if (this.waypoint) {
			//move npc
			let angle = getAngle(this._tile, this.waypoint);
			let move = new Coord(
				Math.cos(angle) * this.moveSpeed,
				Math.sin(angle) * this.moveSpeed
			);
			let isBlockedX = this._tile.move(this._game, 0, move.y, true, true);
			let isBlockedY = this._tile.move(this._game, move.x, 0, true, true);
			this.isBlocked = (isBlockedX||isBlockedY);
		}
	}
	makeWaypoints(callback) {
		this.waypoints = [];
		if (!this.isWaypointsDisabled) {
			let self = this;
			this.path.forEach(function (node) {
				let waypoint = new Coord(node[0], node[1]);
				self.waypoints.push(waypoint);
			});
			callback();
		} else {
			this.waypoints.push(this.destination);
			callback();
		}
	}
	update(game) {
		this._game = game;
		this._tile = game.entLayer[this._tileId];
		let isCloseToDestination = {
			x: Math.abs(this._destination.x - this._tile.x) <= this.moveSpeed,
			y: Math.abs(this._destination.y - this._tile.y) <= this.moveSpeed
		};
		if ((isCloseToDestination.x && isCloseToDestination.y) || this.disableMovement) {
			this.isMoving = false;
		} else {
			this.isMoving = true;
			let self = this
			this.makeWaypoints(function () {
				self.moveToWaypoint();
			});
		}
		if (this.isRunning && this.isMoving) {
			this._tile.animation = 'run';
		} else if (this.isMoving) {
			this._tile.animation = 'walk';
		} else {
			this._tile.animation = 'still';
		}
	}
	distanceTo(coord) {
		return Math.sqrt(
			Math.pow(this.loc.x - coord.x, 2) +
			Math.pow(this.loc.y - coord.y, 2));
	}
	moveTo(coord) {
		this._destination = new Coord(coord.x, coord.y);
	}
	get waypoint() {
		if (this.waypoints[this.waypointNum]) {
			return this.waypoints[this.waypointNum];
		} else {
			return false;
		}
	}
	get moveSpeed() {
		if (this.isRunning) {
			return this.runSpeed;
		} else {
			return this.walkSpeed;
		}
	}
	get gameGrid() {
		let grid = new pf.Grid(viewSize, viewSize);
		this._game.staticLayer.forEach(function (block) {
			if (block.colide) {
				grid.setWalkableAt(block.x, block.y, false);
			}/*else{
				//grid.setWalkableAt(block.x, block.y, true);
			}*/
		});
		return grid;
	}
	get path() {
		let finder = new pf.AStarFinder({
			allowDiagonal: true,
			dontCrossCorners: true,
			heuristic: pf.Heuristic.manhattan
		});
		let path = finder.findPath(this.loc.x, this.loc.y,
			this.destination.x, this.destination.y,
			this.gameGrid);
		//path = pf.Util.compressPath(path);
		return path;
	}
	get destination() {
		return new Coord(
			Math.floor(this._destination.x),
			Math.floor(this._destination.y));
	}
	get loc() {
		return new Coord(
			Math.floor(this._tile.x + this._tile.width),
			Math.floor(this._tile.y + this._tile.height));
	}
}