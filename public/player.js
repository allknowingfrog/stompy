function player(id, size, lastTick) {
    this.id = id;
    this.size = size;
    this.position = {x: 0, y: 0};
    this.vector = {x: 0, y: 0};
    this.lastTick = lastTick;
    this.airborn = false;
    this.inputs = [];

    this.move = function(tick) {
        var input;
        if(this.inputs.length) {
            var next = this.inputs[0];
            while(next.tick <= tick) {
                this.inputs.splice(0, 1);
                input = next;
                next = this.inputs[0];
            }
        }

        var delta = (tick - this.lastTick) * INTERVAL / 1000;
        if(input) {
            if(input.left) {
                this.vector.x -= ACCEL * delta;
            } else if(input.right) {
                this.vector.x += ACCEL * delta;
            }

            if(input.up) {
                this.vector.y -= ACCEL * delta;
            } else if(input.down) {
                this.vector.y += ACCEL * delta;
            }
        }

        this.position.x += this.vector.x * delta;
        if(this.positon.x < 0) {
            this.position.x = 0;
            this.vector.x = 0;
        } else if(this.position.x > CANVAS_W - this.size.x) {
            this.position.x = CANVAS_W - this.size.x;
            this.vector.x = 0;
        }

        this.position.y += this.vector.y * delta;
        if(this.positon.y < 0) {
            this.position.y = 0;
            this.vector.y = 0;
        } else if(this.position.y > CANVAS_H - this.size.y) {
            this.position.y = CANVAS_H - this.size.y;
            this.vector.y = 0;
        }
    };

    this.state = function() {
        return {
            position: this.position,
            vector: this.vector
        };
    };

    this.set = function(data) {
        this.position.x = data.position.x;
        this.position.y = data.position.y;
        this.vector.x = data.vector.x;
        this.vector.y = data.vector.y;
    };

    this.collidePlayers = function() {
        var player;
        for(var p in players) {
            player = players[p];
            if(player == this) continue;
            if(this.collide(player)) {
                return player;
            }
        }
        return false;
    };

    this.collide = function(obj) {
        return this.collision(this.position.x, this.position.y, this.size.x, this.size.y, obj.position.x, obj.position.y, obj.size.x, obj.size.y);
    };

    this.collision = function(x,y,w,h,xx,yy,ww,hh) {
        var x2 = x + w;
        var y2 = y + h;
        var xx2 = xx + ww;
        var yy2 = yy + hh;
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
    };

    this.reset = function() {
        this.position.x = 0;
        this.position.y = 0;
        this.vector.x = 0;
        this.vector.y = 0;
    };
}

//server
if(!(typeof window != 'undefined' && window.document)) module.exports = player;
