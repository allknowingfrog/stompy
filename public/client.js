var socket = io.connect();

//canvas vars
var canvas;
var ctx;

//keypress vars
var leftKey = false;
var rightKey = false;
var upKey = false;
var downKey = false;

//key-binding vars
var LEFT = 37;
var RIGHT = 39;
var UP = 38;
var DOWN = 40;

//game vars
var players = {};
var updates = [];
var inputs = [];

var CANVAS_W;
var CANVAS_H;
var PLAYER_W;
var PLAYER_H;

var ACCEL;
var INTERVAL;
var UPDATE_RATE;
var TICK_BUFFER;
var tick;

var id;

function updateLoop() {
    //update game
    var update = updates[0];
    while(update.tick < tick) {
        update.splice(0, 1);
        update = updates[0];
    }
    var state = update.players;
    for(var p in players) {
        if(p == id) {
            players[p].move();
        } else {
            if(update.tick == tick) {
                players[p].set(state);
            } else {
                players[p].move(tick - TICK_BUFFER);
            }
        }
    }

    //sample input
    var input = {
        tick: tick,
        left: false,
        right: false,
        up: false,
        down: false
    };

    if(leftKey) input.left = true;
    else if(rightKey)  input.right = true;

    if(upKey) input.up = true;
    else if(downKey) input.down = true;

    inputs.push(input);

    //send input to server
    if(tick % UPDATE_RATE == 0) {
        socket.emit('input', inputs);
        inputs = [];
    }

    //check latency
    if(tick % 100 == 0) {
        var sendTime = Date.now();
        socket.emit('ping', null, function(serverTick) {
            var receiveTime = Date.now();
            var latency = (receiveTime - sendTime) / 2;
            
            //estimate current server tick
            serverTick += latency / INTERVAL;

            //average expected and estimated ticks
            tick = Math.round((tick + serverTick) / 2);
        });
    }

    tick++;
}

function draw() {
    ctx.clearRect(0,0,CANVAS_W,CANVAS_H);

    for(var p in players) {
        ctx.fillStyle = "white";
        ctx.fillRect(players[p].position.x, players[p].position.y, players[p].size.x, players[p].size.y);
    }

    window.requestAnimationFrame(draw);
}

//input functions
function keyDown(e) {
    if(e.keyCode == LEFT) {
        e.preventDefault();
        leftKey = true;
        rightKey = false;
    } else if(e.keyCode == RIGHT) {
        e.preventDefault();
        rightKey = true;
        leftKey = false;
    }

    if(e.keyCode == UP) {
        e.preventDefault();
        upKey = true;
        downKey = false;
    } else if(e.keyCode == DOWN) {
        e.preventDefault();
        downKey = true;
        upKey = false;
    }
}

function keyUp(e) {
    if(e.keyCode == RIGHT) {
        rightKey = false;
    } else if(e.keyCode == LEFT) {
        leftKey = false;
    }

    if(e.keyCode == UP) {
        upKey = false;
    } else if(e.keyCode == DOWN) {
        downKey = false;
    }

    inputLoop();
}

$(document).ready(function() {
    socket.emit('init', null, function(data) {
        if(data) {
            CANVAS_W = data.CANVAS_W;
            CANVAS_H = data.CANVAS_H;
            PLAYER_W = data.PLAYER_W;
            PLAYER_H = data.PLAYER_H;
            ACCEL = data.ACCEL;
            INTERVAL = data.INTERVAL;
            UPDATE_RATE = date.UPDATE_RATE;
            TICK_BUFFER = data.TICK_BUFFER;
            tick = data.tick;
            updates = data.updates;
            id = data.id;

            var state = updates[0].players;
            for(var id in state) {
                players[id] = new player(id, {x: PLAYER_W, y: PLAYER_H}, tick - TICK_BUFFER);
                players[id].set(state[id]);
            }

            canvas = document.getElementById('canvas');
            canvas.width = CANVAS_W;
            canvas.height = CANVAS_H;
            ctx = canvas.getContext('2d');
            document.addEventListener('keydown', keyDown, false);
            document.addEventListener('keyup', keyUp, false);

            setInterval(updateLoop, INTERVAL);
            window.requestAnimationFrame(draw);

            socket.on('update', function(data) {
                updates = updates.concat(data);
            });

            socket.on('join', function(data) {
                players[data.id] = new player(data.id, {x: PLAYER_W, y: PLAYER_H}, tick - TICK_BUFFER);
            });

            socket.on('leave', function(data) {
                delete players[data];
            });
        }
    });
});
