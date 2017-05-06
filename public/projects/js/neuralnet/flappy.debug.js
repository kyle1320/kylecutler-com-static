"use strict";

function FlappyGame() {
    this.reset();

    this.num_inputs = 4;
    this.num_outputs = 1;
}

FlappyGame.prototype.reset = function () {
    this.player_x = 0.0;
    this.player_y = 0.5;

    this.player_vx = 0.3;
    this.player_vy = 0;

    this.gates = { front: null, rear: null };

    this.jumped = 0;
    this.running = true;
};

FlappyGame.prototype.update = function (net) {
    if (this.running) {
        if (net) {
            var gate = this.nearestGate();
            net.input(gate.x - this.player_x, gate.y - this.player_y, this.player_y, this.player_vx);
            // if (!net.output(0)) console.log(net);
            if (net.output(0) >= 0.5) {
                this.jump();
            }
        }

        this.player_vy += 1.5 * 0.01;
        // this.player_vx += 0.0001;
        this.player_x += this.player_vx * 0.01;
        this.player_y += this.player_vy * 0.01;

        // you win. good job..
        if (this.player_x > 10000) {
            this.running = false;
        }

        if (!this.gates.rear || this.gates.rear.x - this.player_x < 0.8) {
            if (this.gates.rear) {
                this.gates.rear.next = { x: this.gates.rear.x + this.player_vx * 1.5, y: Math.random() * 0.85 + 0, next: null };
                this.gates.rear = this.gates.rear.next;
            } else {
                this.gates.front = this.gates.rear = { x: this.player_x + this.player_vx * 1.5, y: Math.random() * 0.85 + 0, next: null };
            }
        }

        if (this.player_y < 0.02 || this.player_y > 0.98) {
            this.running = false;
        }

        if (this.gates.front && this.player_x - this.gates.front.x > 0.05) {
            this.jumped++;
            this.gates.front = this.gates.front.next;
            if (!this.gates.front) this.gates.rear = null;
        }

        var curr = this.gates.front;

        while (curr) {
            var distx = this.player_x - curr.x;

            if (Math.abs(distx) < 0.02) {
                var disty = this.player_y - curr.y;
                var ht = Math.sqrt(0.0004 - distx * distx);

                if (disty < ht || disty > 0.15 - ht) {
                    this.running = false;
                    break;
                }
            }

            curr = curr.next;
        }
    }
};

FlappyGame.prototype.run = function (net) {
    this.reset();

    while (this.running) {
        this.update(net);
    }

    net.fitness = this.player_x;
};

FlappyGame.prototype.jump = function () {
    this.player_vy = -0.7;
};

FlappyGame.prototype.nearestGate = function () {
    var curr = this.gates.front;

    while (curr) {
        if (curr.x > this.player_x - 0.02) {
            return curr;
        }

        curr = curr.next;
    }

    return { x: this.player_x + 1.0, y: 0.5 };
};

function drawMessage(ctx, msg, x, y) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeText(msg, x, y);
    ctx.fillStyle = "#000000";
    ctx.fillText(msg, x, y);
}

FlappyGame.prototype.draw = function (canvas, ctx) {
    ctx.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

    ctx.beginPath();
    ctx.arc(0.2 * canvas.drawWidth, this.player_y * canvas.drawHeight, 0.02 * canvas.drawHeight, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#000000";
    ctx.fill();

    var curr = this.gates.front;

    while (curr) {
        var x = (curr.x - this.player_x + 0.2) * canvas.drawWidth;
        var y = curr.y * canvas.drawHeight;

        curr = curr.next;

        if (x < 0 || x > canvas.drawWidth) continue;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.moveTo(x, y + 0.15 * canvas.drawHeight);
        ctx.lineTo(x, canvas.drawHeight);
        // ctx.closePath();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }

    ctx.font = "15px Verdana";
    drawMessage(ctx, 'Distance: ' + this.player_x.toFixed(2), 0, 15);
    drawMessage(ctx, 'Gates jumped: ' + this.jumped, 0, 35);

    if (!this.running) {
        var unit = 0.1 * canvas.drawWidth;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(3 * unit, 2 * unit, 1.5 * unit, 6 * unit);
        ctx.fillRect(5.5 * unit, 2 * unit, 1.5 * unit, 6 * unit);

        var msg = "press space to restart";
        var padding = (4 * unit - ctx.measureText(msg).width) / 2;

        drawMessage(ctx, msg, 3 * unit + padding, 8 * unit + 20);
    }
};

FlappyGame.prototype.keyPressed = function (evt) {
    switch (evt.keyCode) {
        case 32:
            evt.preventDefault();
            if (this.running) {
                this.jump();
            } else {
                this.reset();
            }
            break;
    }
};