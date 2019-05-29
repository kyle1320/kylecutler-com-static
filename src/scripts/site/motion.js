window.addEventListener('load', function() {
    var el = document.body;
    var valid = false;
    var px, py;
    var cx = 0, cy = 0;
    const scale = -0.02;

    function update(e) {
        var x = e.clientX - el.clientLeft;
        var y = e.clientY - el.clientTop;

        if (valid) {
            cx += (x - px) * scale;
            cy += (y - py) * scale;
            el.style.backgroundPosition = `${cx}px ${cy}px, 0 0`;
        }
        px = x;
        py = y;
        valid = true;
    }

    el.addEventListener('mouseenter', update);
    el.addEventListener('mousemove',  update);
    el.addEventListener('mouseleave', () => valid = false);
});