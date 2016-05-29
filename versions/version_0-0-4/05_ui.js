'use strict'

function updateUI(game) {
	game.ui.c.clearRect(0, 0, game.ui.c.canvas.width, game.ui.c.canvas.height);
	for (let i = 0; i < game.ui.elements.length; i++) {
		if (game.ui.elements[i].isVisable) {
			game.ui = game.ui.elements[i].refresh(game.ui, game.input, game);
		}
	}
	htmlImgs.forEach(function (img) {
		img.refresh();
	});
	return game;
}

function getUI(c, scale) {
	let cScale = setScale({
		c, scale
	});
	return {
		c,
		cScale,
		scale,
		width: c.canvas.width,
			height: c.canvas.height,
			elements: [],
			isFirstLoop: true,
			addElement: {
				square: function (ui, props) {
					let id = ui.elements.length;
					let square = {
						width: props.width,
						height: props.height,
						x: props.x,
						y: props.y,
						rotation: 0,
						isVisable: true,
						color: "#000000",
						id: id,
						isClickable: false,
						refresh: function (ui) {
							rotate(ui.c, this)
							ui.c.fillStyle = this.color;
							ui.c.fillRect(this.x, this.y, this.width, this.height);
							unRotate(ui.c, this)
							return ui;
						}
					}
					ui.elements[id] = square;
					return id;
				},
				img: function (ui, props, isForcingSquare) {
					let id = ui.elements.length;
					let square = {
						width: props.width,
						height: props.height,
						img: props.img,
						isForcingSquare: isForcingSquare,
						x: props.x,
						y: props.y,
						isVisable: true,
						id: id,
						rotation: 0,
						isClickable: false,
						refresh: function (ui) {
							rotate(ui.c, this)
							let img = htmlImgs[this.img].getImg()
							if (this.isForcingSquare) {
								let sizeMod = ((props.height + props.width) / 2) / ((img.height + img.width) / 2);
								let width = sizeMod * img.width;
								let height = sizeMod * img.height;
								let xOffset = (width - squareSize) / 2;
								let yOffset = (height - squareSize) / 2;
								ui.c.drawImage(img, this.x - xOffset, this.y - yOffset, width, height);
							} else {
								ui.c.drawImage(img, this.x, this.y, this.width, this.height);
							}
							unRotate(ui.c, this)
							return ui;
						}
					}
					ui.elements[id] = square;
					return id;
				}
			},
			addClickablity: function (element, callback) {
				element.oldRefresh = element.refresh;
				element.isClickable = true;
				element.hasClicked = false;
				element.onClick = callback;
				element.checkIfHover = function (x, y) {
					if ((x > this.x) && (x < this.x + this.width)) {
						if ((y > this.y) && (y < this.y + this.height)) {
							return true;
						}
					}
				}
				element.refresh = function (ui, inputs, game) {
					if (this.oldRefresh) {
						ui = this.oldRefresh(ui);
					}

					if (this.checkIfHover(inputs.mouse.x, inputs.mouse.y)) {
						if ((!this.hasClicked) && (inputs.mouse.isDragging)) {
							this.hasClicked = true;
							ui = this.onClick(ui, inputs, game);
						} else if (!inputs.mouse.isDragging) {
							this.hasClicked = false;
						}
					}
					return ui;
				}
				return element;
			},
			removeClickablity: function (element) {
				element.refresh = element.oldRefresh;
				element.isClickable = false;
				return element;
			}
	}
}

function createImg(src, type) {
	let imgLoc = false;
	htmlImgs.forEach(function (img, i) {
		if (img.src == src) {
			imgLoc = i;
		}
	});

	if (!imgLoc) {
		imgLoc = htmlImgs.length;
		htmlImgs[imgLoc] = [];
		let dir = "../resources/imgs/" + src;
		getFilesInFolder(dir, function (files) {
			htmlImgs[imgLoc] = {
				currentFrame: 0,
				frameCount: files.length,
				frames: [],
				src: src,
				getImg: function () {
					return this.frames[this.currentFrame];
				},
				refresh: function () {
					this.currentFrame++;
					if (this.currentFrame == this.frameCount) {
						this.currentFrame = 0;
					}
				},
			};
			files.forEach(function (imgName, i) {
				let img;
				if (isUsingCodeFile) {
					img = new Image();
					img.src = readZippedFile(dir + '/' + imgName);
				} else {
					img = new Image();
					img.src = '../' + dir + '/' + imgName
				}
				htmlImgs[imgLoc].frames[i] = img;
				img.onload = function () {
					log('an image has loaded');
				}
			});
		});
	}
	return imgLoc;
};

//function loadImgs() {
//	if (isUsingCodeFile) {
//		let path = `../${codeFileName}.code`
//		let loader = new ZipLoader(path);
//		for (let imgName of imgURLs) {
//			let imgPath = loader.loadImage(path + '://' + imgName);
//			addZippedFile(imgName, imgPath);
//		}
//	}
//}

function setScale(ui) {
	ui.c.canvas.height = window.innerHeight;
	ui.c.canvas.width = window.innerHeight;
	let cScale = ui.c.canvas.height / ui.scale;
	ui.c.scale(cScale, cScale);
	return cScale;
}


function rotate(c, obj) {
	let x = obj.x + obj.width / 2;
	let y = obj.y + obj.height / 2
	c.translate(x, y)
	c.rotate(obj.rotation)
	c.translate(-x, -y)
}

function unRotate(c, obj) {
	let x = obj.x + obj.width / 2;
	let y = obj.y + obj.height / 2
	c.translate(x, y)
	c.rotate(-obj.rotation)
	c.translate(-x, -y)
}