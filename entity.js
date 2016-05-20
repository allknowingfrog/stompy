function entity(x, y, w, h) {
    this.width = w || 50;
    this.height = h || 50;

    this.halfWidth = this.width * .5;
    this.halfHeight = this.height * .5;

    this.x = x || 0;
    this.y = y || 0;

    this.vx = 0;
    this.vy = 0;

    this.ax = 0;
    this.ay = 0;

    this.getMidX = function() {
        return this.halfWidth + this.x;
    };

    this.getMidY = function() {
        return this.halfHeight + this.y;
    };

    this.getLeft = function() {
        return this.x;
    };

    this.getTop = function() {
        return this.y;
    };

    this.getRight = function() {
        return this.x + this.width;
    };

    this.getBottom = function() {
        return this.y + this.height;
    };

    this.setLeft = function(val) {
        this.x = val;
    };

    this.setTop = function(val) {
        this.y = val;
    };

    this.setRight = function(val) {
        this.x = val - this.width;
    };

    this.setBottom = function(val) {
        this.y = val - this.height;
    };
}
