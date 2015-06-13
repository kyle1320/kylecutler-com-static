function scaleCanvas(canvas, context) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    var scale = devicePixelRatio / backingStoreRatio;

    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
    canvas.width *= scale;
    canvas.height *= scale;
    context.scale(scale, scale);
}

function randomColor() {
    return '#'+('00000'+(Math.floor(Math.random()*16777216)).toString(16)).slice(-6);
}

function getRelativeCoord(canvas, evt) {
    var x, y;
    if (evt instanceof MouseEvent) {
        x = evt.clientX;
        y = evt.clientY;
    } else if (window.TouchEvent && evt instanceof TouchEvent) {
        var touch = evt.touches[0];
        x = touch.clientX;
        y = touch.clientY;
    }
    
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

window.requestAnimFrame = (function(){
    return (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            });
})();

window.cancelAnimFrame = (function(){
    return (window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.clearTimeout);
})();