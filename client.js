//canvas vars
var canvas;
var ctx;
var player;
var airborn = true;
var jumpTimer = 0;
var platforms = [];
var edges = [];
var inputs = {
    left: false,
    up: false,
    right: false,
    down: false
};
var timestamp = Date.now();

var GRAVITY = 20;
var FRICTION = 20;

var GROUND_JERK = 100;
var AIR_JERK = 50;
var JUMP_VELOCITY = 150;
var MAX_JUMP_TIME = .5;

var MAX_GROUND_VELOCITY = 50;
var MAX_AIR_VELOCITY = 25;
var MAX_FALL_VELOCITY = 100;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = 600;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    player = new entity();
    player.y = 550;

    platforms.push(new entity(300, 475));
    platforms.push(new entity(400, 550));

    edges.push(new entity(-100, 0, 100, 600));
    edges.push(new entity(0, -100, 600, 100));
    edges.push(new entity(600, 0, 100, 600));
    edges.push(new entity(0, 600, 600, 100));

    window.requestAnimationFrame(gameLoop);
}

function keyDown(e) {
    e.preventDefault();
    switch(e.keyCode) {
        case 37:
            inputs.left = true;
            break;
        case 38:
            inputs.up = true;
            break;
        case 39:
            inputs.right = true;
            break;
        case 40:
            inputs.down = true;
            break;
    }
}

function keyUp(e) {
    e.preventDefault();
    switch(e.keyCode) {
        case 37:
            inputs.left = false;
            break;
        case 38:
            inputs.up = false;
            break;
        case 39:
            inputs.right = false;
            break;
        case 40:
            inputs.down = false;
            break;
    }
}

function updatePosition() {
    var now = Date.now();
    var delta = (now - timestamp) / 1000;
    timestamp = now;

    player.vx += player.ax * delta;
    player.vy += player.ay * delta;

    player.x += player.vx * delta;
    player.y += player.vy * delta;

    if(inputs.left) {
        if(airborn) {
            player.ax -= delta * AIR_JERK;
        } else {
            player.ax -= delta * GROUND_JERK;
        }
    } else if(inputs.right) {
        if(airborn) {
            player.ax += delta * AIR_JERK;
        } else {
            player.ax += delta * GROUND_JERK;
        }
    } else {
        player.ax = 0;
        if(!airborn) {
            if(Math.abs(player.vx) < delta * FRICTION) {
                player.vx = 0;
            } else if(player.vx > 0) {
                player.vx -= delta * FRICTION;
            } else {
                player.vx += delta * FRICTION;
            }
        }
    }

    if(inputs.up) {
        if(!airborn) {
            jumpTimer = MAX_JUMP_TIME;
            player.vy = -JUMP_VELOCITY;
            airborn = true;
        } else if(jumpTimer <= 0) {
            player.ay += GRAVITY;
        } else {
            jumpTimer -= delta;
        }
    } else {
        player.ay += GRAVITY;
    }
}

function solveCollision(platform) {
    var pMidX = player.getMidX();
    var pMidY = player.getMidY();
    var tMidX = platform.getMidX();
    var tMidY = platform.getMidY();

    // position of player midpoint relative to platform midpoint
    var dx = (tMidX - pMidX) / platform.halfWidth;
    var dy = (tMidY - pMidY) / platform.halfHeight;

    var absDX = Math.abs(dx);
    var absDY = Math.abs(dy);

    // corner collision
    if(Math.abs(absDX - absDY) < .1) {
        if(dx < 0) {
            player.setLeft(platform.getRight());
        } else {
            player.setRight(platform.getLeft());
        }

        if(dy < 0) {
            player.setTop(platform.getBottom());
        } else {
            player.setBottom(platform.getTop());
        }

        player.ax = 0;
        player.ay = 0;
        player.vx *= -1;
        player.vy *= -1;

    // horizontal collision
    } else if(absDX > absDY) {
        if(dx < 0) {
            player.setLeft(platform.getRight());
        } else {
            player.setRight(platform.getLeft());
        }

        player.ax = 0;
        player.vx *= -1;

    // vertical collision
    } else {
        if(dy < 0) {
            player.setTop(platform.getBottom());
            player.vy *= -1;
            jumpTimer = 0;
        } else {
            player.setBottom(platform.getTop());
            player.vy = 0;
            airborn = false;
        }
        player.ay = 0;
    }
}

function checkCollision() {
    var platform;

    //check platform collision
    for(var t=0; t<platforms.length; t++) {
        platform = platforms[t];
        if(collideRect(player, platform)) {
            solveCollision(platform);
        }
    }

    //check edge collision
    for(var t=0; t<edges.length; t++) {
        platform = edges[t];
        if(collideRect(player, platform)) {
            solveCollision(platform);
        }
    }
}

function checkAirborn() {
    if(airborn) return;

    airborn = true;
    player.y += 1;

    //check platform collision
    for(var t=0; t<platforms.length; t++) {
        platform = platforms[t];
        if(collideRect(player, platform)) {
            airborn = false;
        }
    }

    //check edge collision
    for(var t=0; t<edges.length; t++) {
        platform = edges[t];
        if(collideRect(player, platform)) {
            airborn = false;
        }
    }

    player.y -= 1;
}

function applyLimits() {
    if(Math.abs(player.vx) > MAX_GROUND_VELOCITY) {
        player.ax = 0;
        if(player.vx > 0) {
            player.vx = MAX_GROUND_VELOCITY;
        } else {
            player.vx = -MAX_GROUND_VELOCITY;
        }
    }

    if(player.vy > MAX_FALL_VELOCITY) {
        player.vy = MAX_FALL_VELOCITY;
        player.ay = 0;
    }
}

function renderEntities() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    var platform;
    ctx.fillStyle = 'red';
    for(var p=0; p<platforms.length; p++) {
        platform = platforms[p];
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}

function gameLoop() {
    updatePosition();
    checkCollision();
    checkAirborn();
    applyLimits();
    renderEntities();

    //queue next loop
    window.requestAnimationFrame(gameLoop);
}

function collideRect(a, b) {
    var al = a.getLeft();
    var at = a.getTop();
    var ar = a.getRight();
    var ab = a.getBottom();

    var bl = b.getLeft();
    var bt = b.getTop();
    var br = b.getRight();
    var bb = b.getBottom();

    if(al >= br || ar <= bl || at >= bb || ab <= bt) {
        return false;
    }

    return true;
}
