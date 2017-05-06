"use strict";

function ShooterGame() {
    this.reset();

    this.num_inputs = 7;
    this.num_outputs = 2;
}

ShooterGame.prototype.reset = function () {
    this.player_x = 0.5;
    this.player_vx = 0.0;
    this.bullet_countdown = 0;

    this.bullets = { front: null, rear: null };
    this.enemies = [];

    this.score = 0;
    this.time = 0;
    this.running = true;

    for (var i = 0; i < 3; i++) {
        this.enemies[i] = { x: Math.random(), v: Math.random() - 0.5 };
    }
};

ShooterGame.prototype.update = function (net) {
    if (this.running) {
        if (net) {
            net.input(this.enemies[0].x, this.enemies[1].x, this.enemies[2].x, this.enemies[0].v, this.enemies[1].v, this.enemies[2].v, this.player_x);

            if (net.outputs[0].value <= 0.3) {
                this.left();
            }
            if (net.outputs[0].value >= 0.7) {
                this.right();
            }
            if (net.outputs[1].value >= 0.5) {
                this.fire();
            }
        }

        this.player_x += this.player_vx * 0.01;
        this.player_vx = 0.0;
        this.bullet_countdown--;
        this.time++;

        if (this.time > 3000) {
            this.running = false;
        }

        if (this.player_x > 0.98) this.player_x = 0.98;
        if (this.player_x < 0.02) this.player_x = 0.02;

        var i;
        var curr = this.bullets.front;

        while (curr) {
            curr.y -= 0.01;

            if (curr.y <= 0) {
                if (curr == this.bullets.front) {
                    this.bullets.front = this.bullets.front.next;
                } else if (curr == this.bullets.rear) {
                    this.bullets.rear = this.bullets.rear.prev;
                }
                if (curr.prev) curr.prev.next = curr.next;
                if (curr.next) curr.next.prev = curr.prev;
            } else if (Math.abs(curr.y - 0.04) < 0.02) {
                for (i = 0; i < this.enemies.length; i++) {
                    if (Math.abs(this.enemies[i].x - curr.x) < 0.02) {
                        this.enemies[i].x = Math.random();
                        this.enemies[i].v = Math.random() - 0.5;
                        this.score++;

                        if (curr == this.bullets.front) {
                            this.bullets.front = this.bullets.front.next;
                        } else if (curr == this.bullets.rear) {
                            this.bullets.rear = this.bullets.rear.prev;
                        }
                        if (curr.prev) curr.prev.next = curr.next;
                        if (curr.next) curr.next.prev = curr.prev;
                    }
                }
            }

            curr = curr.next;
        }

        for (i = 0; i < this.enemies.length; i++) {
            this.enemies[i].x += this.enemies[i].v * 0.01;

            if (this.enemies[i].x < 0.05) {
                this.enemies[i].x = 0.1 - this.enemies[i].x;
                this.enemies[i].v = -this.enemies[i].v;
            }

            if (this.enemies[i].x > 0.95) {
                this.enemies[i].x = 1.9 - this.enemies[i].x;
                this.enemies[i].v = -this.enemies[i].v;
            }
        }
    }
};

ShooterGame.prototype.run = function (net) {
    this.reset();

    while (this.running) {
        this.update(net);
    }

    net.fitness = this.score;
};

ShooterGame.prototype.draw = function (canvas, ctx) {
    ctx.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

    ctx.fillStyle = "#000000";
    ctx.fillRect((this.player_x - 0.02) * canvas.drawWidth, 0.94 * canvas.drawHeight, 0.04 * canvas.drawWidth, 0.04 * canvas.drawHeight);

    var curr = this.bullets.front;

    while (curr) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect((curr.x - 0.01) * canvas.drawWidth, (curr.y - 0.01) * canvas.drawHeight, 0.02 * canvas.drawWidth, 0.02 * canvas.drawHeight);
        curr = curr.next;
    }

    for (i = 0; i < this.enemies.length; i++) {
        ctx.fillStyle = "#000000";
        ctx.fillRect((this.enemies[i].x - 0.02) * canvas.drawWidth, 0.02 * canvas.drawHeight, 0.04 * canvas.drawWidth, 0.04 * canvas.drawHeight);
    }
};

ShooterGame.prototype.left = function () {
    this.player_vx = -1;
};

ShooterGame.prototype.right = function () {
    this.player_vx = 1;
};

ShooterGame.prototype.fire = function () {
    if (this.bullet_countdown <= 0) {
        if (this.bullets.rear) {
            this.bullets.rear.next = { x: this.player_x, y: 0.95, next: null, prev: this.bullets.rear };
            this.bullets.rear = this.bullets.rear.next;
        } else {
            this.bullets.front = this.bullets.rear = { x: this.player_x, y: 0.95, next: null, prev: null };
        }
        this.bullet_countdown = 50;
    }
};

ShooterGame.prototype.keyPressed = function (evt) {
    switch (evt.keyCode) {
        case 37:
            evt.preventDefault();
            if (this.running) {
                this.left();
            } else {
                this.reset();
            }
            break;
        case 38:
            evt.preventDefault();
            if (this.running) {
                this.fire();
            } else {
                this.reset();
            }
            break;
        case 39:
            evt.preventDefault();
            if (this.running) {
                this.right();
            } else {
                this.reset();
            }
            break;
    }
};