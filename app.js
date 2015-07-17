var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var player = require('./public/player.js');

//globals
players = {};

CANVAS_W = 600;
CANVAS_H = 600;
PLAYER_W = 50;
PLAYER_H = 50;

ACCEL = 20;
INTERVAL = 15;

var UPDATE_RATE = 3;
var UPDATE_BUFFER = 3;
var TICK_BUFFER = 3;
var tick = 1;
var updates = [];

for(var i=0; i<UPDATE_BUFFER; i++) {
    updates.push({tick: 0});
}

server.listen(3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.on('init', function(data, callback) {
        players[socket.id] = new player(socket.id, {x: PLAYER_W, y: PLAYER_H}, tick - TICK_BUFFER);
        socket.broadcast.emit('join');

        var state = {
            CANVAS_W: CANVAS_W,
            CANVAS_H: CANVAS_H,
            PLAYER_W: PLAYER_W,
            PLAYER_H: PLAYER_H,
            ACCEL: ACCEL,
            INTERVAL: INTERVAL,
            UPDATE_RATE: UPDATE_RATE,
            TICK_BUFFER: TICK_BUFFER * 2,
            id: socket.id,
            tick: tick,
            updates: updates
        };
        callback(state);
    });
    socket.on('input', function(input) {
        players[socket.id].inputs.push(input);
    });
    socket.on('ping', function(data, callback) {
        callback(tick);
    });
    socket.on('disconnect', function(data) {
        delete players[socket.id];
        io.sockets.emit('leave', socket.id);
    });
});

setInterval(gameLoop, INTERVAL);

function gameLoop() {
    var update = {
        tick: tick - TICK_BUFFER,
        players: []
    };
    for(var p in players) {
        update.players.push(players[p].move(tick - TICK_BUFFER));
    }
    updates.push(update);

    if(tick % UPDATE_RATE == 0) {
        //remove last set of updates
        updates.splice(0, UPDATE_RATE);

        //send a copy of next set of updates
        io.sockets.emit('update', updates.slice(0, UPDATE_RATE));
    }
}
