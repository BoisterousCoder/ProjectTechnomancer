'use strict'
class Block extends Coord{
	constructor(blockType, layer, x, y) {
		for (let key in blockType) {
			this[key] = blockType[key];
		}
		if(this.maxHeat){
			this._heat = this.maxHeat;
		}
		this._y = y;
		this._x = x;
		this.isDead = false;
		if (!this._width) {
			this._width = 1;
		}
		if (!this._height) {
			this._height = 1;
		}
		this.points = [];
		this.updatePoints();
	}
	makeDisplay(game) {
		if (this._animations) {
			this.animations = {};
			let self = this;
			self._animations.forEach(function (animation) {
				let src = self.name + '/' + animation;
				self.animations[animation] = createImg(src, 'svg')
			});
			this._animationName = 'still';
			this.displayId = game.ui.addElement.img(game.ui, {
				width: squareSize,
				height: squareSize,
				img: self.animations[this.animation],
				x: squareSize * this._x,
				y: squareSize * this._y
			}, true);
		} else {
			this.displayId = game.ui.addElement.square(game.ui, {
				width: squareSize + 1,
				height: squareSize + 1,
				x: squareSize * this._x,
				y: squareSize * this._y
			});
			game.ui.elements[this.displayId].color = this.color;
		}
		this.display = game.ui.elements[this.displayId]
		this.display.parentId = this.id;
		this.display.layer = this.layer;
		game.ui.addClickablity(this.display, this.onClick);

		this._game = game;
		return game;
	}
	move(game, x, y, isColisionMove, noTriggerEvents) {
		x *= -1;
		y *= -1;
		if (isColisionMove) {
			let isBlockIntercepting = checkForBlock(game, this.points.add(x, y), noTriggerEvents);
			if (!isBlockIntercepting) {
				isColisionMove = false;
			}
		}
		if (!isColisionMove) {
			this.x += x;
			this.y += y;
			game.ui.elements[this.displayId].x = squareSize * this._x;
			game.ui.elements[this.displayId].y = squareSize * this._y;
		}
		this.hasMoved = true;
		return isColisionMove;
	}
	updatePoints() {
		let self = this;
		this.points = [
			new Coord(this._x, this._y),
			new Coord(this._x + this._width, this._y),
			new Coord(this._x, this._y + this._height),
			new Coord(this._x + this._width, this._y + this._height),
		]

		function add(x, y) {
			let newPoints = [];
			self.points.forEach(function (point, i) {
				newPoints[i] = new Coord(point.x + x, point.y + y);
			});
			return newPoints;
		}
		let offsetX = (1 - this._width) / 2;
		let offsetY = (1 - this._height) / 2;
		this.points = add(offsetX, offsetY);
		this.points.add = add;
	}
	onColide(game) {
		if (this.leadsTo) {
			mapName = this.leadsTo;
			game.isReloadingMap = true;
		} else if (this.name == 'door') {
			this.display.isVisable = false;
			this.colide = false;
			self = this;
			setTimeout(function () {
				self.display.isVisable = true;
				self.colide = true;
			}, doorWait);
		}
	}
	onClick(ui, input, game) {
		if (!game.isPaused) {
			let id = this.parentId;
			let self;
			if (this.layer == 'entLayer') {
				self = game.entLayer[id]
			} else {
				self = game.staticLayer[id]
			}

			if (!self.colide && input.mouse.isDoublePress && self.name != 'invisible') {
				let x = player.x - self.x;
				let y = player.y - self.y;
				player.move(game, x, y, true);
			}

			if (self.isClickable) {
				if (self.volume) {
					log(`this container has a ${self.volume} volume storage cap`)
				}
				if (self.role == 'wife') {
					log('That is your wife. You should probably know this by now.')
				}
				if (self.msg) {
					alert(msg);
				}
			}
		}

		return ui;
	}
	kill(){
		if(this.name == 'player'){
			$('body').slideUp();
			warn('GAMEOVER');
		}
		this.colide = false;
		this.isDead = true;
		this.display.isVisable = false;
		this._game[this.layer][this.id] = {
			isDead: true
		};
	}
	play(animation){
		let oldAnimation = this.animation;
		
	}
	set rotation(rotation) {
		this.display.rotation = rotation;
		return this;
	}
	get rotation() {
		return this.display.rotation;
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	set x(x) {
		this._x = x
		this.updatePoints();
	}
	set y(y) {
		this._y = y
		this.updatePoints();
	}
	get width() {
		return this._width;
	}
	get maxHeat() {
		return this._maxHeat;
	}
	set width(width) {
		this._width = width;
		this.updatePoints()
	}
	get height() {
		return this._height;
	}
	set height(height) {
		this._height = height;
		this.updatePoints()
	}
	get heat(){
		return this._heat;
	}
	set heat(heat){
		if(this._maxHeat){
			this._heat = heat;
			if(this._heat > this._maxHeat){
				this._heat = this._maxHeat;
			}else if(this._heat <= 0){
				this.kill();
			}
		}else{
			warn(`cannot set the heat property of ${this.name}, because it's maxHeat has not been set`);
		}
	}

	get animation() {
		return this._animationName;
	}
	set animation(name) {
		if (this.animations) {
			if (this.animations[name]) {
				this.display.img = this.animations[name];
				this.animationName = name;
			} else {
				throw `${name} animation not found for ${this.symbol}`
			}
		}
	}
}