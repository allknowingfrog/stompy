function player() {
    this.size = {x: 50, y: 50};
    this.speed = {x: 100, y: 100};
    this.position = {x: 0, y: 0};
    this.vector = {x: 0, y: 0};
    this.input = {x: 0, y: 0};
    this.keys = [37, 39, 38]; //left, right, jump
    this.color = 'white';
    this.airborn = false;

    this.update = function(delta) {
        //stop instantly when changing directions
        if(this.vector.x * this.input.x < 0) this.vector.x = 0;
        this.vector.x += this.input.x * this.speed.x * delta;
        if(Math.abs(this.vector.x) < FRICTION * delta) {
            this.vector.x = 0;
        } else {
            this.vector.x -= this.input.x * FRICTION * delta;
        }
        if(Math.abs(this.vector.x) > this.speed.x) {
            this.vector.x = this.input.x * this.speed.x;
        }

        if(this.input.y == -1) {
            if(!this.airborn) {
                this.vector.y = this.input.y * this.speed.y;
                this.airborn = true;
            }
        } else if(this.vector.y < 0) {
            this.vector.y = 0;
        }
        this.vector.y += GRAVITY * delta;

        this.position.x += this.vector.x * delta;
        if(this.position.x < 0) {
            this.position.x = 0;
            this.vector.x = 0;
        } else if(this.position.x > canvas.width - this.size.x) {
            this.position.x = canvas.width - this.size.x;
            this.vector.x = 0;
        }

        this.position.y += this.vector.y * delta;
        if(this.position.y < 0) {
            this.position.y = 0;
            this.vector.y = 0;
        } else if(this.position.y > canvas.height - this.size.y) {
            this.position.y = canvas.height - this.size.y;
            this.vector.y = 0;
            this.airborn = false;
        }
    };

    this.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    };

    this.setInput = function(key, state) {
        var index = this.keys.indexOf(key);
        switch(index) {
            //left
            case 0:
                if(state) {
                    this.input.x = -1;
                } else {
                    this.input.x = 0;
                }
                break;
            //right
            case 1:
                if(state) {
                    this.input.x = 1;
                } else {
                    this.input.x = 0;
                }
                break;
            //jump
            case 2:
                if(state) {
                    this.input.y = -1;
                } else {
                    this.input.y = 0;
                }
                break;
        }
    };
}
