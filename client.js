//canvas vars
var canvas;
var ctx;
var player;
var flag;
var airborn = true;
var jumpTimer = 0;
var score = 0;
var high = 0;
var lava = false;
var platforms = [];
var edges = [];
var inputs = {
    left: false,
    up: false,
    right: false,
    down: false
};
var timestamp = Date.now();

var GRAVITY = 500;
var BOUNCE = .5;
var MIN_BOUNCE_VELOCITY = .5;
var FRICTION_DECEL = 3;
var MIN_SLIDE_VELOCITY = .5;
var JUMP_DECEL = 3;

var GROUND_ACCEL = 500;
var AIR_ACCEL = 200;
var JUMP_VELOCITY = 300;
var MAX_JUMP_TIME = .2;

var MAX_VELOCITY = 100;
var MAX_FALL_VELOCITY = 500;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = 600;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    player = new entity();
    player.x = 0;
    player.y = canvas.height - player.height;

    platforms.push(new entity(100, 550));
    platforms.push(new entity(225, 475));
    platforms.push(new entity(100, 400));
    platforms.push(new entity(225, 325));

    flag = new entity(0, 0, 10, 10);
    moveFlag();

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

    if(inputs.left) {
        if(airborn) {
            player.vx -= delta * AIR_ACCEL;
        } else {
            if(player.vx > 0) {
                player.vx -= delta * player.vx * FRICTION_DECEL;
                if(player.vx < MIN_SLIDE_VELOCITY) player.vx = 0;
            }
            player.vx -= delta * GROUND_ACCEL;
        }
    } else if(inputs.right) {
        if(airborn) {
            player.vx += delta * AIR_ACCEL;
        } else {
            if(player.vx < 0) {
                player.vx -= delta * player.vx * FRICTION_DECEL;
                if(-player.vx < MIN_SLIDE_VELOCITY) player.vx = 0;
            }
            player.vx += delta * GROUND_ACCEL;
        }
    } else {
        if(!airborn) {
            player.vx -= delta * player.vx * FRICTION_DECEL;
            if(Math.abs(player.vx) < MIN_SLIDE_VELOCITY) player.vx = 0;
        }
    }

    if(inputs.up) {
        if(!airborn) {
            jumpTimer = MAX_JUMP_TIME;
            player.vy = -JUMP_VELOCITY;
            airborn = true;
        }

        if(jumpTimer > 0) {
            jumpTimer -= delta;
        } else {
            if(player.vy < 0) player.vy -= delta * player.vy * JUMP_DECEL;
            player.vy += delta * GRAVITY;
        }

    } else {
        jumpTimer = 0;
        if(player.vy < 0) player.vy -= delta * player.vy * JUMP_DECEL;
        player.vy += delta * GRAVITY;
    }

    if(Math.abs(player.vx) > MAX_VELOCITY) {
        if(player.vx > 0) {
            player.vx = MAX_VELOCITY;
        } else {
            player.vx = -MAX_VELOCITY;
        }
    }

    if(player.vy > MAX_FALL_VELOCITY) {
        player.vy = MAX_FALL_VELOCITY;
    }

    player.x += player.vx * delta;
    player.y += player.vy * delta;
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

    // horizontal collision
    if(absDX > absDY) {
        if(dx < 0) {
            player.setLeft(platform.getRight());
        } else {
            player.setRight(platform.getLeft());
        }

        player.vx *= -BOUNCE;
        if(Math.abs(player.vx) < MIN_BOUNCE_VELOCITY) player.vx = 0;

    // vertical collision
    } else {
        if(dy < 0) {
            player.setTop(platform.getBottom());
            player.vy *= -BOUNCE;
            if(Math.abs(player.vy) < MIN_BOUNCE_VELOCITY) player.vy = 0;
            jumpTimer = 0;
        } else {
            player.setBottom(platform.getTop());
            player.vy = 0;
            airborn = false;
        }
    }
}

function pick(list) {
    var index = Math.floor(Math.random() * list.length);
    return list[index];
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

    var touch = false;
    //check edge collision
    for(var t=0; t<edges.length; t++) {
        platform = edges[t];
        if(collideRect(player, platform)) {
            solveCollision(platform);
            touch = true;
            if(!lava) {
                score -= 10;
                lava = true;
            }
        }
    }
    lava = touch;

    if(collideRect(player, flag)) {
        score += 10;
        if(score > high) high = score;
        moveFlag();
    }
}

function moveFlag() {
    var platform = pick(platforms);
    flag.setMidX(platform.getMidX());
    flag.setMidY(platform.getTop() - platform.halfHeight);
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

    //check flag collision
    if(collideRect(player, flag)) {
        score += 10;
        if(score > high) high = score;
        moveFlag();
    }

    player.y -= 1;
}

function renderEntities() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('High: ', canvas.width - 100, 30);
    ctx.fillText(high, canvas.width - 50, 30);
    ctx.fillText('Score: ', canvas.width - 110, 60);
    ctx.fillText(score, canvas.width - 50, 60);

    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    var platform;
    ctx.fillStyle = 'red';
    for(var p=0; p<platforms.length; p++) {
        platform = platforms[p];
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect(flag.x, flag.y, flag.width, flag.height);
}

function gameLoop() {
    updatePosition();
    checkCollision();
    checkAirborn();
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
