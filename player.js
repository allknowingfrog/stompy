function Player(x, y, w, h, l, u, r, d) {
    Entity.call(this, x, y, w, h);

    this.keys = {
        left: l,
        up: u,
        right: r,
        down: d
    };

    this.inputs = {
        left: false,
        up: false,
        right: false,
        down: false
    };

    this.airborn = true;
    this.sliding = false;
    this.facingRight = true;
    this.jetting = false;
    this.jetPack = 100;
    this.jumpTimer = 100;
    this.score = 0;

    this.input = function(code, down) {
        down = down ? true : false;

        for(var k in this.keys) {
            if(this.keys[k] == code) {
                this.inputs[k] = down;
                break;
            }
        }
    };
}

Player.prototype = Object.create(Entity.prototype);
