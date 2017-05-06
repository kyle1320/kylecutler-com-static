"use strict";

// A Game has:
// num_inputs - number of input variables for the neural network
// num_outputs - number of output variables from the neural network
// update() - updates the game (think user-controlled)
// run() - runs through a course of the game and updates the network fitness
// draw() - draws the game to the given canvas / context
// keyPressed() - handles key press events, if required

function FitGame() {
    this.num_inputs = 2;
    this.num_outputs = 1;
}

FitGame.prototype.update = function (net) {};

FitGame.prototype.run = function (net) {
    var fit = function fit(n, x, y, f, a) {
        n.input(x, y);n.fitness += f(n.output(0), a);
    };
    // net.fitness = Math.random();
    // var f = function(x, d) {return Math.max(0, 1.0-7*Math.abs(x-d))};
    // fit(net, 0.0, 0.0, f, (0 / 6));
    // fit(net, 0.0, 0.5, f, (1 / 6));
    // fit(net, 0.0, 1.0, f, (2 / 6));
    // fit(net, 1.0, 1.0, f, (4 / 6));
    // fit(net, 1.0, 0.5, f, (5 / 6));
    // fit(net, 1.0, 0.0, f, (6 / 6));

    // fit(n, 0.0, 0.0, f, (0 / 6));
    // fit(n, 1.0, 1.0, f, (0 / 6));
    // fit(n, 0.0, 1.0, f, (6 / 6));
    // fit(n, 1.0, 0.0, f, (6 / 6));
    //
    // fit(n, 0.5, 0.5, f, (3 / 6));
    // fit(n, 0.5, 0.0, f, (2 / 6));
    // fit(n, 0.0, 0.5, f, (4 / 6));
    // fit(n, 0.5, 1.0, f, (2 / 6));
    // fit(n, 1.0, 0.5, f, (4 / 6));

    var f = function f(x, d) {
        return d > 0 ? (x > 0.8 ? 1.0 + x / 10.0 : 0.0) * d : (x < 0.2 ? 1.0 + (1.0 - x) / 10.0 : 0.0) * -d;
    };
    fit(net, 0.1, 0.1, f, -1);
    fit(net, 0.1, 0.5, f, -1);
    fit(net, 0.1, 0.9, f, -1);
    fit(net, 0.5, 0.9, f, -1);
    fit(net, 0.9, 0.9, f, -1);
    fit(net, 0.9, 0.5, f, -1);
    fit(net, 0.9, 0.1, f, -1);
    fit(net, 0.5, 0.1, f, -1);

    fit(net, 0.25, 0.1, f, -1);
    fit(net, 0.75, 0.1, f, -1);
    fit(net, 0.25, 0.9, f, -1);
    fit(net, 0.75, 0.9, f, -1);
    fit(net, 0.9, 0.25, f, -1);
    fit(net, 0.9, 0.75, f, -1);
    fit(net, 0.1, 0.25, f, -1);
    fit(net, 0.1, 0.75, f, -1);

    fit(net, 0.5, 0.5, f, 1);

    fit(net, 0.7, 0.5, f, 2);
    fit(net, 0.5, 0.7, f, 2);
    fit(net, 0.3, 0.5, f, 2);
    fit(net, 0.5, 0.3, f, 2);
    fit(net, 0.3, 0.3, f, 2);
    fit(net, 0.7, 0.3, f, 2);
    fit(net, 0.3, 0.7, f, 2);
    fit(net, 0.7, 0.7, f, 2);
};

FitGame.prototype.draw = function (canvas, ctx, sim) {
    if (sim.bestnet != this.bestnet) {
        this.bestnet = sim.bestnet;

        ctx.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

        for (var x = 0; x < canvas.drawWidth; x++) {
            for (var y = 0; y < canvas.drawHeight; y++) {
                this.bestnet.input(x / canvas.drawWidth, y / canvas.drawHeight);

                var val = this.bestnet.output(0);

                ctx.fillStyle = getSaturatedColor(val * 0.8);
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
};

FitGame.prototype.keyPressed = function (evt) {};