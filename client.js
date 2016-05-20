//canvas vars
var canvas;
var ctx;
var player;
var platforms = [];
var edges = [];
var inputs = {
    left: false,
    up: false,
    right: false,
    down: false
};
var timestamp = Date.now();
var STICKY_THRESHOLD = .0004;
var JERK = 100;
var MAX_VELOCITY = 50;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = 600;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    player = new entity();

    platforms.push(new entity(100, 100));
    platforms.push(new entity(200, 200));

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
        player.ax -= delta * JERK;
    } else if(inputs.right) {
        player.ax += delta * JERK;
    }

    if(inputs.up) {
        player.ay -= delta * JERK;
    } else if(inputs.down) {
        player.ay += delta * JERK;
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

        player.vx *= -1;
        player.vy *= -1;

    // horizontal collision
    } else if(absDX > absDY) {
        if(dx < 0) {
            player.setLeft(platform.getRight());
        } else {
            player.setRight(platform.getLeft());
        }

        player.vx *= -1;

    // vertical collision
    } else {
        if(dy < 0) {
            player.setTop(platform.getBottom());
        } else {
            player.setBottom(platform.getTop());
        }

        player.vy *= -1;
    }

    player.ax = 0;
    player.ay = 0;
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

function applyLimits() {
    if(Math.abs(player.vx) > MAX_VELOCITY) {
        player.ax = 0;
        if(player.vx > 0) {
            player.vx = MAX_VELOCITY;
        } else {
            player.vx = -MAX_VELOCITY;
        }
    }

    if(Math.abs(player.vy) > MAX_VELOCITY) {
        player.ay = 0;
        if(player.vy > 0) {
            player.vy = MAX_VELOCITY;
        } else {
            player.vy = -MAX_VELOCITY;
        }
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
    applyLimits();
    renderEntities();

    console.log(player.x+', '+player.y);

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
