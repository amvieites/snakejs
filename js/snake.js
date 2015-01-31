var KEYLEFT = 37, KEYUP = 38, KEYRIGHT = 39, KEYDOWN = 40;
var LEFT = 1, UP = 2, RIGHT = 3, DOWN = 4;


/*************************************/
/**
 * From: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas/3368118#3368118
 *
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    "use strict";
    if (typeof stroke === "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

function addToArray(array, element) {
    "use strict";
    
    var i, newArray = [array.length + 1];
    
    for (i = 0; i < array.length; i = i + 1) {
        newArray[i] = array[i];
    }
    newArray[array.length] = element;
    
    return newArray;
}
/*************************************/


function Snake(snakeGame, x, y) {
    "use strict";
    this.game = snakeGame;
    this.direction = DOWN;
    var now = new Date();
    this.previousTime = now.getTime();
    this.points = [{x: x, y: y, dir: DOWN},
                  {x: x, y: y - 1},
                  {x: x + 1, y: y - 1},
                  {x: x + 1, y: y}];
}

Snake.prototype.eats = function () {
    "use strict";
    var m, mouse;
    
    for (m in this.game.mice) {
        if (this.game.mice.hasOwnProperty(m)) {
            if ((this.game.mice[m].x === this.points[0].x) && (this.game.mice[m].y === this.points[0].y)) {
                mouse = this.game.mice[m];
                delete this.game.mice[m];
                return mouse;
            }
        }
    }
};

Snake.prototype.update = function () {
    "use strict";
    var eaten;
    
    eaten = this.eats();
    if (eaten !== undefined) {
        this.enlarge();
        this.game.score(eaten);
    }
    if (new Date().getTime() - this.previousTime > 250) {
        this.move();
        this.previousTime = new Date().getTime();
    }
};

Snake.prototype.enlarge = function () {
    "use strict";
    
    this.points = addToArray(this.points, {x: this.points[this.points.length - 1].x, y: this.points[this.points.length - 1].y});
};

Snake.prototype.checkEdges = function (new_point) {
    "use strict";
    
    return (new_point.x >= 0) && (new_point.x < this.game.columns) && (new_point.y >= 0) && (new_point.y < this.game.rows);
};

Snake.prototype.checkSelf = function (new_point) {
    "use strict";
    
    var i;
    for (i = 1; i < this.points.length; i = i + 1) {
        if (this.points[i].x === new_point.x && this.points[i].y === new_point.y) {
            return false;
        }
    }
    return true;
};

Snake.prototype.move = function () {
    "use strict";
    var i, stop, new_point;
    
    if (this.points[0].dir === LEFT) {
        new_point = {x: this.points[0].x - 1, y: this.points[0].y, dir: this.points[0].dir};
    } else if (this.points[0].dir === RIGHT) {
        new_point = {x: this.points[0].x + 1, y: this.points[0].y, dir: this.points[0].dir};
    } else if (this.points[0].dir === UP) {
        new_point = {x: this.points[0].x, y: this.points[0].y - 1, dir: this.points[0].dir};
    } else if (this.points[0].dir === DOWN) {
        new_point = {x: this.points[0].x, y: this.points[0].y + 1, dir: this.points[0].dir};
    }
    
    if (this.checkEdges(new_point) && this.checkSelf(new_point)) {
        for (i = this.points.length - 1; i > 0; i = i - 1) {
            this.points[i].x = this.points[i - 1].x;
            this.points[i].y = this.points[i - 1].y;
        }
        this.points[0] = new_point;
    } else {
        this.game.playing = false;
    }

};

Snake.prototype.draw = function () {
    "use strict";
    var point;
    
    // Draw body
    this.game.ctx.fillStyle = this.game.playing ? this.game.skin.snake : this.game.skin.deadsnake;
    for (point in this.points) {
        if (this.points.hasOwnProperty(point)) {
            roundRect(this.game.ctx, 1 + this.points[point].x + this.points[point].x * this.game.SIDE,
                      1 + this.points[point].y + this.points[point].y * this.game.SIDE,
                      this.game.SIDE - 2, this.game.SIDE - 2, 3, true, false);
        }
    }
    
    // Draw eyes
    this.game.ctx.fillStyle = this.game.playing ? this.game.skin.food : this.game.skin.deadeye;
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.points[0].x + this.points[0].x * this.game.SIDE + 10, this.points[0].y + this.points[0].y * this.game.SIDE + 10, 2, 0, 2 * Math.PI, false);
    this.game.ctx.fill();
    
};

function Mouse(game, x, y) {
    "use strict";
    this.x = x;
    this.y = y;
    this.game = game;
    this.value = 1000;
    this.created = new Date().getTime();
}

Mouse.prototype.update = function () {
    "use strict";
};

Mouse.prototype.draw = function () {
    "use strict";
    
    this.game.ctx.fillStyle = this.game.skin.food;
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.x + this.x * this.game.SIDE + 10, this.y + this.y * this.game.SIDE + 10, 2, 0, 2 * Math.PI, false);
    this.game.ctx.fill();
};

function keydownLogic(event, game) {
    "use strict";
    var dir, coords = {x: game.snake.points[0].x, y: game.snake.points[0].y};
    
    if (event.keyCode === KEYLEFT) { coords.x -= 1; dir = LEFT; }
    if (event.keyCode === KEYUP) { coords.y -= 1; dir = UP; }
    if (event.keyCode === KEYRIGHT) { coords.x += 1; dir = RIGHT; }
    if (event.keyCode === KEYDOWN) { coords.y += 1; dir = DOWN; }
    
    if ((coords.x !== game.snake.points[1].x) || (coords.y !== game.snake.points[1].y)) {
        game.snake.points[0].dir = dir;
    }
}

function SnakeGame(skin, canvasid, score_callback) {
    "use strict";
    this.SIDE = 20;
    this.score_function = score_callback;
    this.skin = skin;
    this.canvas = document.getElementById(canvasid);
    this.ctx = this.canvas.getContext('2d');
    this.width = parseInt(this.canvas.getAttribute("width"), 10);
    this.height = parseInt(this.canvas.getAttribute("height"), 10);
    this.columns = Math.floor(this.width / (this.SIDE + 1));
    this.rows = Math.floor(this.height / (this.SIDE + 1));
    this.effectiveWidth = this.columns * this.SIDE + this.columns;
    this.effectiveHeight = this.rows * this.SIDE + this.rows;
    
    var game = this;
    document.addEventListener("keydown", function () {
        keydownLogic(event, game);
    });
}

SnakeGame.prototype.init = function () {
    "use strict";
    this.playing = true;
    this.lastMouseTime = new Date().getTime();
    this.scoring = 0;
    this.snake = new Snake(this, 2, 2);
    this.mice = new Array(3);
    this.lastMouse = 3;
    
    this.loop();
};

SnakeGame.prototype.draw = function () {
    "use strict";
    var i, j;
    
    this.ctx.fillStyle = this.skin.snake;
    this.ctx.fillRect(0, 0, this.effectiveWidth, this.effectiveHeight);
    
    this.ctx.fillStyle = this.skin.field;
    for (i = 0; i < this.columns; i = i + 1) {
        for (j = 0; j < this.rows; j = j + 1) {
            this.ctx.fillRect(i + i * this.SIDE, j + j * this.SIDE, this.SIDE, this.SIDE);
        }
    }
    
    for (i = 0; i < this.mice.length; i = i + 1) {
        if (this.mice[i] !== undefined) {
            this.mice[i].update();
            this.mice[i].draw();
        }
    }
    this.snake.update();
    this.snake.draw();
    
    this.score_function(this.scoring);
    
    this.ctx.restore();
};

SnakeGame.prototype.update = function () {
    "use strict";
    var m;
    
    if (new Date().getTime() - this.lastMouseTime > 4000) {
        this.lastMouseTime = new Date().getTime();
        this.lastMouse = this.lastMouse + 1;
        this.mice[this.lastMouse % this.mice.length] = new Mouse(this, Math.floor((Math.random() * this.columns) + 1), Math.floor((Math.random() * this.rows) + 1));
    }
    for (m in this.mice) {
        if (this.mice.hasOwnProperty(m)) {
            if (new Date().getTime() - this.mice[m].created > 5000) {
                delete this.mice[m];
            }
        }
    }
};

SnakeGame.prototype.loop = function () {
    "use strict";
    
    if (this.playing) {
        this.update();
        this.draw();
    }
    
    window.requestAnimationFrame(this.loop.bind(this), this.canvas);
};

SnakeGame.prototype.score = function (mouse) {
    "use strict";
    
    this.scoring += mouse.value;
};






