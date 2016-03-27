//canvas vars
var canvas;
var ctx;
var players = [];
var platforms = [];
var timestamp = Date.now();

//constants
var FRICTION = 20;
var GRAVITY = 50;

$(document).ready(function() {
    canvas = document.getElementById('canvas');
    canvas.width = 600;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    players.push(new player());
    console.log(players.length);

    window.requestAnimationFrame(gameLoop);
});

function keyDown(e) {
    e.preventDefault();
    var key = e.keyCode;
    for(var p=0; p<players.length; p++) {
        players[p].setInput(key, true);
    }
}

function keyUp(e) {
    e.preventDefault();
    var key = e.keyCode;
    for(var p=0; p<players.length; p++) {
        players[p].setInput(key, false);
    }
}

function gameLoop() {
    //calculate delta
    var now = Date.now();
    var delta = (now - timestamp) / 1000;
    timestamp = now;

    //move players
    for(var p=0; p<players.length; p++) {
        players[p].update(delta);
    }

    //check player collision
    var left, right;
    for(var p=0; p<players.length; p++) {
        left = players[p];
        for(var r=p+1; r<players.length; r++) {
            right = players[r];
            if(checkCollision(left, right)) {
                //deal with collision
            }
        }
    }

    //draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var p=0; p<players.length; p++) {
        players[p].draw(ctx);
    }

    //queue next loop
    window.requestAnimationFrame(gameLoop);
}

function checkCollision(left, right) {
    var x = left.position.x;
    var y = left.position.y;
    var x2 = x + left.size.x;
    var y2 = y + left.size.y;

    var xx = right.position.x;
    var yy = right.position.y;
    var xx2 = x + right.size.x;
    var yy2 = y + right.size.y;

    if (x > xx && x < xx2 && y > yy && y < yy2) {
        return true;
    } else if (x2 > xx && x2 < xx2 && y > yy && y < yy2) {
        return true;
    } else if (x > xx && x < xx2 && y2 > yy && y2 < yy2) {
        return true;
    } else if (x2 > xx && x2 < xx2 && y2 > yy && y2 < yy2) {
        return true;
    } else if (xx > x && xx < x2 && yy > y && yy < y2) {
        return true;
    } else if (xx2 > x && xx2 < x2 && yy > y && yy < y2) {
        return true;
    } else if (xx > x && xx < x2 && yy2 > y && yy2 < y2) {
        return true;
    } else if (xx2 > x && xx2 < x2 && yy2 > y && yy2 < y2) {
        return true;
    } else if (x == xx && x2 == xx2 && ((y > yy && y < yy2) || y2 > yy && y < yy2)) {
        return true;
    } else if (y == yy && y2 == yy2 && ((x > xx && x < xx2) || x2 > xx && x < xx2)) {
        return true;
    } else {
        return false;
    }
}
