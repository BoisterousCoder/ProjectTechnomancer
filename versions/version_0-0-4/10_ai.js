'use strict'
class EatAI extends MoveAI {
	update(game) {
		super.moveTo(player);
		super.update(game);
	}
}

class FollowAI extends MoveAI {
	update(game) {
		super.disableMovement = false;
		super.isRunning = false;
		if (super.distanceTo(player) > aiFollowDistance) {
			super.moveTo(player);
		} else if (super.distanceTo(player) < aiChargeDistance) {
			super.isRunning = true;
			super.moveTo(player);
		} else {
			super.disableMovement = true;
		}
		super.update(game);
	}
}

class BulletAI extends MoveAI {
	constructor(game, tileId) {
		super.constructor(game, _tileId, true);
	}
	update(game) {
		super._destination = new Coord(
				Math.cos(super._tile.rotation) * this.moveSpeed,
				Math.sin(super._tile.rotation) * this.moveSpeed
			);
		super.update();
	}
}