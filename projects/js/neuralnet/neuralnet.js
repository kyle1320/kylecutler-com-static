// contains variables that can be changed by the user
var options = {
    mutation_rate: 0.05,
    breed_percent: 0.1,
    top_percent: 0.01,

    population: 1000,
    layers: [10, 10],
};

window.onload = function() {
    var drawCanvas = $('draw-canvas');
    var drawContext = drawCanvas.getContext('2d');
    var netCanvas = $('net-canvas');
    var netContext = netCanvas.getContext('2d');

    var paused = true;
    var evolving = true;
    var drawInterval;

    var sim;
    var game;

    // contains references to HTML elements
    // that are used to change options or perform actions
    var inputs = {
        pauseBtn: $('pause'),
        evolveBtn: $('evolve'),
        resetBtn: $('reset'),
    };

    var outputs = {
        generation: $('generation'),
        bestfit: $('bestfit'),
        diversity: $('diversity'),
    };

    // set everything up
    function init() {
        // scale the canvases to the actual screen resolution
        scaleCanvas(drawCanvas, drawContext);
        scaleCanvas(netCanvas, netContext);

        // setup button events
        inputs.pauseBtn.addEventListener('click', function() {setPaused(!paused);});
        inputs.evolveBtn.addEventListener('click', function() {setEvolving(!evolving);});
        inputs.resetBtn.addEventListener('click', reset);

        window.addEventListener('keydown', function(evt) {
            if (!evolving) {
                game.keyPressed(evt);
            }
        });

        // run it
        reset();
        setEvolving(true);
        setPaused(false);
    }

    // reset everything
    function reset() {
        game = new FlappyGame();
        sim = new NeuralSim(options.population, Infinity, function(net) {
            game.run(net);
        }, game.num_inputs, options.layers, game.num_outputs);
    }

    // update what's running
    function update() {
        if (evolving) sim.advance();
        else game.update(sim.bestnet);

        outputs.generation.innerHTML = sim.gen_num + ' / ' + sim.n_gens;
        outputs.bestfit.innerHTML = '' + sim.bestfit;
        outputs.diversity.innerHTML = '' + (sim.bestfit - sim.worstfit) / sim.bestfit;

        // schedule another update
        if (!paused) setTimeout(update, 10);
    }

    // draw to the canvas
    function draw() {
        if (sim.bestnet)
            sim.bestnet.draw(netCanvas, netContext);
        game.draw(drawCanvas, drawContext, sim);
    }

    function setEvolving(e) {
        evolving = e;

        if (!e) {
            console.log(sim.bestnet);
        }

        inputs.evolveBtn.innerHTML = evolving ? 'Watch' : 'Evolve';
    }

    // pause / resume
    function setPaused(p) {
        if (p && !paused) {
            paused = p;
            clearInterval(drawInterval);
        } else if (!p && paused) {
            paused = p;
            drawInterval = setInterval(draw, 15);
            update();
        }

        inputs.pauseBtn.innerHTML = paused ? 'Resume' : 'Pause';
    }

    init();
};
