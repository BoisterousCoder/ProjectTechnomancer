'use strict'
function updateInputs(game) {
    let offsetX = 0;
    let offsetY = 0;
    if (game.ui.c.canvas.offsetParent) {
        do {
            offsetX += game.ui.c.canvas.offsetLeft;
            offsetY += game.ui.c.canvas.offsetTop;
        } while (game.ui.c.canvas == game.ui.c.canvas.offsetParent);
        game.input.mouse.x = (game.input.mouse.realX - offsetX) / game.ui.cScale;
        game.input.mouse.y = (game.input.mouse.realY - offsetY) / game.ui.cScale;
    }
    return game
}


function attachInputs(canvas) {
    let input = {
        mouse: {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0,
            wheelZoom: 0,
            dragStart: {
                x: 0,
                y: 0
            },
            dragEnd: {
                x: 0,
                y: 0
            },
            lastClickTime: 0,
            onDoublePress: function() {},
			isDoublePress: false,
            isDragging: false,
            onPress: function() {},
            onRelease: function() {},
			onRight: function() {},
        },
        window: {
            onResize: function() {

            }
        },
        keyboard: {
            keys: [{
                name: "left",
                isPressed: false,
                onPress: function() {},
                code: 37
            }, {
                name: "up",
                isPressed: false,
                onPress: function() {},
                code: 38
            }, {
                name: "down",
                isPressed: false,
                onPress: function() {},
                code: 40
            }, {
                name: "right",
                isPressed: false,
                onPress: function() {},
                code: 39
            }, {
                name: "w",
                isPressed: false,
                onPress: function() {},
                code: 87
            }, {
                name: "a",
                isPressed: false,
                onPress: function() {},
                code: 65
            }, {
                name: "s",
                isPressed: false,
                onPress: function() {},
                code: 83
            }, {
                name: "d",
                isPressed: false,
                onPress: function() {},
                code: 68
            }, {
                name: "shift",
                isPressed: false,
                onPress: function() {},
                code: 16
            },{
                name: "space",
                isPressed: false,
                onPress: function() {},
                code: 32
            }, {
                name: "esc",
                isPressed: false,
                onPress: function() {},
                code: 27
            }],
            getKey: function(keyName) {
                let returnKey;
                input.keyboard.keys.forEach(function(key) {
                    if (key.name == keyName) {
                        returnKey = key;
                    }
                });
                return returnKey;
            }
        }
    };

    if (canvas.addEventListener) {
        // IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", mouseWheelHandler, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
    } else {
        // IE 6/7/8
        canvas.attachEvent("onmousewheel", mouseWheelHandler);
    }
    document.onmousemove = function(e) {
        input.mouse.realX = e.pageX;
        input.mouse.realY = e.pageY;
    }
    document.onmousedown = function(e) {
        input.mouse.dragEnd = {
            x: input.mouse.x,
            y: input.mouse.y
        };
        input.mouse.isDragging = true;
        if ((new Date()).getTime() - input.mouse.lastClickTime < doublePressDelay) {
            input.mouse.isDoublePress = true;
        }else{
			input.mouse.isDoublePress = false;
		}
        input.mouse.lastClickTime = (new Date()).getTime();
		input.mouse.onPress(e);
    };
    document.onmouseup = function(e) {
        input.mouse.dragStart = {
            x: input.mouse.x,
            y: input.mouse.y
        };
        input.mouse.isDragging = false;
        input.mouse.onRelease(e);
    };
    document.onkeydown = function(e) {
        input.keyboard.keys.forEach(function(key) {
            if (key.code == e.keyCode) {
                key.onPress(e);
                key.isPressed = true;
            }
        });
    }
	document.oncontextmenu = function(e){
		input.mouse.onRight(e);
	}
    document.onkeyup = function(e) {
        input.keyboard.keys.forEach(function(key) {
            if (key.code == e.keyCode) {
                key.isPressed = false;
            }
        });
    }
    document.body.onresize = function(e) {
        input.window.onResize(e);
    }

    function mouseWheelHandler(e) {
        // cross-browser wheel delta
        e = window.event || e; // old IE support
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        input.mouse.wheelZoom += delta
    }

    return input;
}