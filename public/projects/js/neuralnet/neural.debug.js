"use strict";

function normRand() {
    return (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3;
}

function NeuralNode(inputs, bias, value) {
    this.inputs = inputs;
    this.value = value;
    this.use = 1.0;

    if (bias !== undefined) {
        this.bias = bias;
    } else {
        this.bias = 2.0 * Math.random() - 1.0;
    }
}

NeuralNode.prototype.update = function () {
    var t = 0;
    var input;

    for (var i = 0; i < this.inputs.length; ++i) {
        input = this.inputs[i];
        t += input.input.value * input.weight;
    }

    t += this.bias;

    // I just picked a value for Beta. I have no idea what I'm doing.
    var newvalue = 1.0 / (1.0 + Math.exp(-8.0 * t));

    if (this.value) {
        var diff = Math.abs(newvalue - this.value);
        this.use += diff;
        this.use *= 0.99;
    }

    this.value = newvalue;
};

NeuralNode.prototype.mutate = function () {
    this.bias += normRand();
};

NeuralNode.prototype.copy = function (node) {
    this.bias = node.bias;
};

NeuralNode.prototype.equals = function (node) {
    return Math.abs(this.bias - node.bias) < 0.1;
};

function NeuralEdge(input, weight, bias) {
    this.input = input;
    if (weight !== undefined) {
        this.weight = weight;
    } else {
        this.weight = 2.0 * Math.random() - 1.0;
    }
}

NeuralEdge.prototype.mutate = function () {
    // this.weight *= Math.min(1.0, Math.max(0.0, Math.sqrt(1.0 - this.input.use))) * 2;
    this.weight += normRand();
};

NeuralEdge.prototype.copy = function (edge) {
    this.weight = edge.weight;
};

NeuralEdge.prototype.equals = function (edge) {
    return Math.abs(this.weight - edge.weight) < 0.1;
};

function NeuralNet(n_inputs, layer_sizes, n_outputs, initial_weights) {
    this.inputs = Array(n_inputs);

    if (n_outputs > 0) {
        // copy the layer sizes for our use
        layer_sizes = layer_sizes.slice(0);
        layer_sizes[layer_sizes.length] = n_outputs;
    }

    this.layers = Array(layer_sizes.length);

    // useful in breeding
    this.n_inputs = n_inputs;
    this.layer_sizes = layer_sizes;
    this.fitness = 0;

    var i;

    for (i = 0; i < n_inputs; i++) {
        this.inputs[i] = new NeuralNode([]);
    }

    var i, j, k;
    var edges, len, nodes;
    var prev_len = n_inputs;
    var prev_layer = this.inputs;

    for (i = 0; i < layer_sizes.length; i++) {
        len = layer_sizes[i];
        layer = this.layers[i] = Array(len);

        for (j = 0; j < len; j++) {
            edges = [];

            for (k = 0; k < prev_len; k++) {
                edges[k] = new NeuralEdge(prev_layer[k], initial_weights);
            }

            layer[j] = new NeuralNode(edges);
        }

        prev_len = len;
        prev_layer = layer;
    }

    this.outputs = prev_layer;
}

NeuralNet.prototype.update = function () {
    var i, j, len;

    for (i = 0; i < this.layers.length; i++) {
        len = this.layers[i].length;

        for (j = 0; j < len; j++) {
            this.layers[i][j].update();
        }
    }
};

NeuralNet.prototype.input = function () {
    var len = Math.min(arguments.length, this.inputs.length);
    for (var i = 0; i < len; i++) {
        this.inputs[i].value = arguments[i];
    }
    this.update();
};

NeuralNet.prototype.output = function (i) {
    return this.outputs[i].value;
};

NeuralNet.prototype.breed = function (mate, child) {
    if (!child) child = new NeuralNet(this.n_inputs, this.layer_sizes, 0, 0);

    var i, j, k, len;
    var layer, node, edge;
    var inbreeding;

    if (this == mate) {
        // if we are breeding with ourself, ignore inbreeding. Results in smaller deviations.
        inbreeding = 1.0;
    } else {
        var samecount = 0,
            count = 0;

        for (i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];

            for (j = 0; j < layer.length; j++) {
                node = layer[j];
                len = node.inputs.length;

                count++;
                if (node.equals(mate.layers[i][j])) {
                    samecount++;
                }

                for (k = 0; k < len; k++) {
                    edge = node.inputs[k];

                    count++;
                    if (edge.equals(mate.layers[i][j].inputs[k])) {
                        samecount++;
                    }
                }
            }
        }

        inbreeding = (1 + count) / (1 + count - samecount);
    }

    for (i = 0; i < child.layers.length; i++) {
        layer = child.layers[i];

        for (j = 0; j < layer.length; j++) {
            node = layer[j];
            len = node.inputs.length;

            if (Math.random() < 0.5) {
                node.copy(this.layers[i][j]);
            } else {
                node.copy(mate.layers[i][j]);
            }

            if (Math.random() < options.mutation_rate * inbreeding) {
                node.mutate();
            }

            for (k = 0; k < len; k++) {
                edge = node.inputs[k];

                if (Math.random() < 0.5) {
                    edge.copy(this.layers[i][j].inputs[k]);
                } else {
                    edge.copy(mate.layers[i][j].inputs[k]);
                }

                if (Math.random() < options.mutation_rate * inbreeding) {
                    edge.mutate();
                }
            }
        }
    }

    return child;
};

NeuralNet.prototype.draw = function (canvas, ctx) {
    var circles = [];
    var circlesrad = 0.8 / this.inputs.length;
    var unitx = 1.0 / (this.layers.length + 1);
    var lines = [];
    var layer, node, edge;
    var i, j, k;

    circlesrad = Math.min(circlesrad, unitx * 0.8);

    for (i = 0; i < this.inputs.length; i++) {
        circles.push({ x: unitx * 0.5, y: (i + 0.5) / this.inputs.length, color: getSaturatedColor(this.inputs[i].value * 0.8), use: this.inputs[i].use });
    }

    for (i = 0; i < this.layers.length; i++) {
        layer = this.layers[i];

        circlesrad = Math.min(circlesrad, 0.8 / layer.length);

        for (j = 0; j < layer.length; j++) {
            node = layer[j];

            circles.push({ x: unitx * (i + 1.5), y: (j + 0.5) / layer.length, color: getSaturatedColor(node.value * 0.8), use: node.use });

            for (k = 0; k < node.inputs.length; k++) {
                edge = node.inputs[k];

                if (i == 0) {
                    lines.push({ x1: unitx * (i + 0.5), y1: (k + 0.5) / this.inputs.length,
                        x2: unitx * (i + 1.5), y2: (j + 0.5) / layer.length, weight: Math.abs(edge.weight) });
                } else {
                    lines.push({ x1: unitx * (i + 0.5), y1: (k + 0.5) / this.layers[i - 1].length,
                        x2: unitx * (i + 1.5), y2: (j + 0.5) / layer.length, weight: Math.abs(edge.weight) });
                }
            }
        }
    }

    circlesrad = circlesrad / 2;

    ctx.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

    for (i = 0; i < lines.length; i++) {
        ctx.beginPath();
        ctx.moveTo(lines[i].x1 * canvas.drawWidth, lines[i].y1 * canvas.drawHeight);
        ctx.lineTo(lines[i].x2 * canvas.drawWidth, lines[i].y2 * canvas.drawHeight);
        ctx.strokeStyle = "#000000";
        ctx.globalAlpha = lines[i].weight;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    for (i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.arc(circles[i].x * canvas.drawWidth, circles[i].y * canvas.drawHeight, circlesrad * canvas.drawWidth, 0, 2 * Math.PI);
        // ctx.fillStyle = "#FFFFFF";
        // ctx.fill();
        ctx.globalAlpha = circles[i].use;
        ctx.fillStyle = circles[i].color;
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
};

function NeuralSim(population, n_generations, activity, n_inputs, layers, n_outputs) {
    this.population = population;
    this.generation = Array(population);
    this.activity = activity;

    this.gen_num = 0;
    this.n_gens = n_generations;

    this.bestnet = null;

    for (var i = 0; i < population; i++) {
        this.generation[i] = new NeuralNet(n_inputs, layers, n_outputs);
    }
}

NeuralSim.prototype.advance = function () {
    if (this.gen_num >= this.n_gens) return;

    for (var i = 0; i < this.population; i++) {
        this.activity(this.generation[i]);
    }

    this.generation.sort(function (a, b) {
        if (a.fitness > b.fitness) return -1;else if (a.fitness < b.fitness) return 1;else return 0;
    });

    var num_breed = Math.ceil(this.population * options.breed_percent);
    var num_top = Math.ceil(this.population * options.top_percent);

    var best = this.generation.slice(0, num_breed);

    this.bestnet = best[0];

    this.bestfit = best[0].fitness;
    this.worstfit = this.generation[this.generation.length - 1].fitness;

    this.gen_num++;

    if (this.gen_num >= this.n_gens) {
        return;
    }

    this.generation = [];

    var i = 0;
    while (i < num_top) {
        this.generation[i] = best[i];
        this.generation[i].fitness = 0;
        i++;
    }

    for (var j = i; j < this.population; j++) {
        this.generation[j] = best[Math.floor(Math.random() * num_top)].breed(best[Math.floor(Math.random() * num_breed)]);
    }
};

/*
function normRand() {
    // a somewhat normal distribution.
    return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}

function sigmoid(x) {
    // I just picked a value for Beta. I have no idea what I'm doing.
    return 1.0 / (1.0 + Math.exp(-8.0 * x));
}

function Genome(n_neurons, generate) {
    var i, o;

    this.n_neurons = n_neurons;

    // build the adjacency matrix, generate gene weights
    this.genes = new Array();
    for (o = 0; o < this.n_neurons; o++) {
        this.genes[o] = new Array();

        // if (generate === undefined || generate) {
        //     for (i = 0; i < o; i++) {
        //         if (Math.random() < 0.5) {
        //             this.genes[o][i] = 2.0 * Math.random() - 1.0;
        //         }
        //     }
        // }
    }

    // generate neuron biases
    this.neurons = new Array(this.n_neurons);
    for (i = 0; i < this.n_neurons; i++) {
        this.neurons[i] = 2.0 * Math.random() - 1.0;
    }
}

Genome.prototype.breed = function(mate) {
    var child, count, samecount, inbreeding, i, o;

    if (this == mate) {
        // if we are breeding with ourself, ignore inbreeding. Results in smaller deviations.
        inbreeding = 1.0;
    } else {
        samecount = 0;
        count = 0;

        for (o = 0; o < this.n_neurons; o++) {
            count++;
            if (Math.abs(this.neurons[o] - mate.neurons[o]) < 0.1)
                samecount++;

            for (i = 0; i < this.n_neurons; i++) {
                if (this.genes[o][i] !== undefined && mate.genes[o][i] !== undefined) {
                    count++;
                    if (Math.abs(this.genes[o][i] - mate.genes[o][i]) < 0.1)
                        samecount++;
                }
            }
        }

        // inbreeding (lots of similar genes) results in higher mutation rates
        inbreeding = (1 + count) / (1 + count - samecount);
    }

    child = new Genome(this.n_neurons, false);

    for (o = 0; o < this.n_neurons; o++) {
        child.neurons[o] = (Math.random() < 0.5) ? this.neurons[o] : mate.neurons[o];

        // mutate the neuron bias
        if (Math.random() < (options.mutation_rate * inbreeding)) {
            child.neurons[o] += normRand();
        }

        for (i = 0; i < o; i++) {
            child.genes[o][i] = (Math.random() < 0.5) ? this.genes[o][i] : mate.genes[o][i];

            // mutate the gene weight
            if (child.genes[o][i] !== undefined) {
                if (Math.random() < (options.mutation_rate * inbreeding)) {
                    child.genes[o][i] += normRand();
                }
            }

            // create / destroy the gene
            if (Math.random() < (options.growth_rate * inbreeding)) {
                if (child.genes[o][i] !== undefined) {
                    child.genes[o][i] = undefined;
                } else {
                    child.genes[o][i] = 2.0 * Math.random() - 1.0;
                }
            }
        }
    }

    return child;
};

function Network(genome, n_inputs, n_outputs) {
    // the genome this network is based on
    this.genome = genome;

    // activation values for the neurons in this network
    this.neurons = new Array(genome.n_neurons);

    // "activity" levels for each neuron.
    // activity levels fade as a neuron's value continues to stay the same.
    this.activity = new Array(genome.n_neurons);

    this.n_inputs = n_inputs;
    this.n_outputs = n_outputs;
    this.n_neurons = this.genome.n_neurons;

    this.reset();
}

Network.prototype.update = function() {
    var i, o, oldvalue, diff;

    // don't calculate values for the input neurons (they are already set)
    for (o = this.n_inputs; o < this.n_neurons; o++) {
        oldvalue = this.neurons[o];

        // add the initial bias
        this.neurons[o] = this.genome.neurons[o];

        // for each gene connected to this neuron, multiply its weight by the connected neuron.
        for (i = 0; i < o; i++) {
            if (this.genome.genes[o][i])
                this.neurons[o] += this.neurons[i] * this.genome.genes[o][i];
        }

        // apply the activation function
        this.neurons[o] = sigmoid(this.neurons[o]);

        // update the activity for this neuron
        if (oldvalue) {
            diff = Math.abs(this.neurons[o] - oldvalue);
            this.activity[o] += diff;
            this.activity[o] *= 0.99;
        }
    }
};

Network.prototype.reset = function() {
    for (i = 0; i < this.n_neurons; i++) {
        this.neurons[i] = 0.0;
        this.activity[i] = 1.0;
    }

    this.fitness = 0;
};

Network.prototype.input = function() {
    var len = Math.min(arguments.length, this.n_inputs);
    for (var i = 0; i < len; i++) {
        this.neurons[i] = arguments[i];
    }
    this.update();
};

Network.prototype.output = function(i) {
    // outputs aren't actually different from other neurons,
    // but for organization's sake we specify the number of intended outputs.
    return this.neurons[this.n_neurons - this.n_outputs + i];
};

Network.prototype.draw = function(canvas, ctx) {
    var unit = canvas.drawWidth / this.n_neurons;
    var circlesrad = unit * 0.4;
    var i, o;

    ctx.clearRect(0, 0, canvas.drawWidth, canvas.drawHeight);

    // draw the boxes around inputs and outputs
    ctx.beginPath();
    ctx.rect(0, canvas.drawHeight * 0.5 - unit / 2, unit * this.n_inputs, unit);
    ctx.rect(canvas.drawWidth, canvas.drawHeight * 0.5 - unit / 2, -unit * this.n_outputs, unit);

    ctx.fillStyle = "#CCCCAA";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // 2*atan(1/3). First solution to .5cos(x) = 1-sin(x).
    var theta = 0.6435011088;
    var rad = unit / (2.0 * Math.cos(theta));
    var vert = Math.sin(theta);

    // draw the arcs
    this.genome.genes.forEach(function(genes, o) {
        genes.forEach(function(gene, i) {
            if (gene) {
                ctx.beginPath();
                var radius = rad * Math.abs(i-o);
                ctx.arc(unit * (i+o+1) / 2.0, (i+o)%2 ? canvas.drawHeight * 0.5 - radius * vert : canvas.drawHeight * 0.5 + radius * vert, radius, (i+o)%2 ? theta : Math.PI + theta, (i+o)%2 ? Math.PI - theta : 2*Math.PI - theta);
                ctx.strokeStyle = "#000000";
                ctx.globalAlpha = gene;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        });
    });

    // draw the neurons
    for (i = 0; i < this.n_neurons; i++) {
        ctx.beginPath();
        ctx.arc(unit * (i+0.5), canvas.drawHeight * 0.5, circlesrad, 0, 2*Math.PI);
        ctx.globalAlpha = this.activity[i];
        ctx.fillStyle = getSaturatedColor(this.neurons[i] * 0.8);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
};

function NeuralSim(population, n_generations, activity, n_inputs, n_neurons, n_outputs) {
    this.population = population;
    this.generation = Array(population);
    this.activity = activity;

    this.gen_num = 0;
    this.n_gens = n_generations;

    this.n_inputs = n_inputs;
    this.n_outputs = n_outputs;

    this.bestnet = null;

    // initial population
    for (var i = 0; i < population; i++) {
        this.generation[i] = new Network(new Genome(n_inputs + n_neurons + n_outputs), n_inputs, n_outputs);
    }
}

NeuralSim.prototype.advance = function() {
    if (this.gen_num >= this.n_gens)
        return;

    // run the activity on each network
    for (var i = 0; i < this.population; i++) {
        this.activity(this.generation[i]);
    }

    // sort the networks by fitness
    this.generation.sort(function(a, b) {
        if (a.fitness > b.fitness) return -1;
        else if (a.fitness < b.fitness) return 1;
        else return 0;
    });

    var num_breed = Math.ceil(this.population * options.breed_percent);
    var num_top = Math.ceil(this.population * options.top_percent);

    var best = this.generation.slice(0, num_breed);

    this.bestnet = best[0];

    this.bestfit = best[0].fitness;
    this.worstfit = this.generation[this.generation.length - 1].fitness;

    this.gen_num++;

    if (this.gen_num >= this.n_gens) {
        return;
    }

    this.generation = [];

    // copy the top networks to the next generation
    var i = 0;
    while (i < num_top) {
        this.generation[i] = best[i];
        this.generation[i].reset();
        i++;
    }

    // breed new networks from the top and breeding networks
    for (var j = i; j < this.population; j++) {
        this.generation[j] = new Network(
            best[Math.floor(Math.random() * num_top)].genome.breed(
                best[Math.floor(Math.random() * num_breed)].genome
            ), this.n_inputs, this.n_outputs
        );
    }
};
*/