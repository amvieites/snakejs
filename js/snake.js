var KEYLEFT = 37, KEYUP = 38, KEYRIGHT = 39, KEYDOWN = 40;
var LEFT = 1, UP = 2, RIGHT = 3, DOWN = 4;
var keys = {};
var canvas = document.getElementById("snakegame");
var ctx = canvas.getContext('2d');
var WIDTH = parseInt(canvas.getAttribute("width"), 10);
var HEIGHT = parseInt(canvas.getAttribute("height"), 10);
var score;


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
/*************************************/


function Snake(snakeGame) {
    "use strict";
    this.game = snakeGame;
    this.direction = LEFT;
    var now = new Date();
    this.previousTime = now.getTime();
    this.points = [{x: 13, y: 9, dir: LEFT},
                  {x: 14, y: 9},
                  {x: 15, y: 9},
                  {x: 16, y: 9},
                  {x: 17, y: 9}];
    
}

Snake.prototype.update = function () {
    "use strict";
    
    if (new Date().getTime() - this.previousTime > 500) {
        this.move();
        this.previousTime = new Date().getTime();
    }
};

Snake.prototype.move = function () {
    "use strict";
    var i;
    for (i = this.points.length - 1; i > 0; i = i - 1) {
        this.points[i].x = this.points[i - 1].x;
        this.points[i].y = this.points[i - 1].y;
    }
    if (this.points[0].dir === LEFT) {
        this.points[0].x -= 1;
    } else if (this.points[0].dir === RIGHT) {
        this.points[0].x += 1;
    } else if (this.points[0].dir === UP) {
        this.points[0].y -= 1;
    } else if (this.points[0].dir === DOWN) {
        this.points[0].y += 1;
    }
};

Snake.prototype.draw = function () {
    "use strict";
    var point;
    
    // Draw body
    ctx.fillStyle = this.game.skin.snake;
    for (point in this.points) {
        if (this.points.hasOwnProperty(point)) {
            roundRect(ctx, 1 + this.points[point].x + this.points[point].x * 20,
                      1 + this.points[point].y + this.points[point].y * 20,
                      22, 18, 3, true, false);
        }
    }
    
    // Draw eyes
    ctx.fillStyle = this.game.skin.food;
    ctx.beginPath();
    ctx.arc(this.points[0].x + this.points[0].x * 20 + 5, this.points[0].y + this.points[0].y * 20 + 6, 2, 0, 2 * Math.PI, false);
    ctx.arc(this.points[0].x + this.points[0].x * 20 + 5, this.points[0].y + this.points[0].y * 20 + 14, 2, 0, 2 * Math.PI, false);
    ctx.fill();
    
};

function SnakeGame(skin) {
    "use strict";
    this.skin = skin;
}

function keydownLogic(event, snake) {
    "use strict";
    if (event.keyCode === KEYLEFT && snake.points[0].dir !== RIGHT) { snake.points[0].dir = LEFT; }
    if (event.keyCode === KEYUP && snake.points[0].dir !== UP) { snake.points[0].dir = UP; }
    if (event.keyCode === KEYRIGHT && snake.points[0].dir !== LEFT) { snake.points[0].dir = RIGHT; }
    if (event.keyCode === KEYDOWN && snake.points[0].dir !== UP) { snake.points[0].dir = DOWN; }
}

SnakeGame.prototype.init = function () {
    "use strict";
    this.snake = new Snake(this);
    this.playing = true;
    var snake = this.snake;
    document.addEventListener("keydown", function () {
        keydownLogic(event, snake);
    });
    
    this.loop();
};

SnakeGame.prototype.draw = function () {
    "use strict";
    var i, j;
    
    ctx.fillStyle = this.skin.snake;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = this.skin.field;
    for (i = 0; i < 20; i = i + 1) {
        for (j = 0; j < 20; j = j + 1) {
            ctx.fillRect(i + i * 20, j + j * 20, 20, 20);
        }
    }
    
    this.snake.update();
    this.snake.draw();
    
    ctx.restore();
};

SnakeGame.prototype.update = function () {
    "use strict";
};

SnakeGame.prototype.loop = function () {
    "use strict";
    
    if (this.playing) {
        this.update();
        this.draw();
    }
    
    window.requestAnimationFrame(this.loop.bind(this), canvas);
};






