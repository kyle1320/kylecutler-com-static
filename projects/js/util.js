var $ = function(e) { return document.getElementById(e); };
var isNaN = Number.isNaN || window.isNaN || function(n) {return typeof n === 'number' && n !== n;};

function scaleCanvas(canvas, context) {
	var devicePixelRatio = window.devicePixelRatio || 1;
	var backingStoreRatio = context.webkitBackingStorePixelRatio ||
	context.mozBackingStorePixelRatio ||
	context.msBackingStorePixelRatio ||
	context.oBackingStorePixelRatio ||
	context.backingStorePixelRatio || 1;

	var scale = devicePixelRatio / backingStoreRatio;

	canvas.style.width = canvas.width + 'px';
	canvas.style.height = canvas.height + 'px';
	canvas.width *= scale;
	canvas.height *= scale;
	context.scale(scale, scale);
}

function randomColor() {
	return '#'+('00000'+(Math.floor(Math.random()*16777216)).toString(16)).slice(-6);
}

function getRelativeCoord(canvas, evt) {
	var x, y;
	var pressed;
	if (evt instanceof MouseEvent) {
		x = evt.clientX;
		y = evt.clientY;
		pressed = ~evt.buttons;
	} else if (window.TouchEvent && evt instanceof TouchEvent) {
		var touch = evt.touches[0];
		x = touch.clientX;
		y = touch.clientY;
		pressed = true;
	}

	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top,
	};
};

function getSaturatedColor(v) {
	var i = Math.floor(v * 6);
	var f = ((v * 6 - i) + 1) % 1;
	var q = ('0' + Math.round(255 * (1 - f)).toString(16)).slice(-2);
	var t = ('0' + Math.round(255 * f).toString(16)).slice(-2);
	switch ((i + 6) % 6) {
		case 0: return '#FF' + t + '00';
		case 1: return '#' + q + 'FF00';
		case 2: return '#00FF' + t;
		case 3: return '#00' + q + 'FF';
		case 4: return '#' + t + '00FF';
		case 5: return '#FF00' + q;
	}
}

function linkCheckboxToBoolean(checkbox, object, attr, func) {
	func = func || function() {};

	checkbox.checked = object[attr];
	checkbox.addEventListener('click', function() {object[attr] = checkbox.checked; func();});
}

function linkInputToNumber(input, object, attr, func, instant) {
	func = func || function() {};
	if (instant === undefined) instant = true;

	input.valueAsNumber = object[attr];
	if (instant) input.addEventListener('input', function() {if (!isNaN(input.valueAsNumber)) object[attr] = input.valueAsNumber; func();});
	else input.addEventListener('change', function() {if (!isNaN(input.valueAsNumber)) object[attr] = input.valueAsNumber; func();});

	input.addEventListener('blur', function() {input.valueAsNumber = object[attr];});
}

function linkColorChooserToValues(color, object, attr, func) {
	func = func || function() {};

	color.color.fromRGB(object[attr][0] / 255, object[attr][1] / 255, object[attr][2] / 255);
	color.addEventListener('change', function() {
		object[attr][0] = Math.floor(color.color.rgb[0] * 255);
		object[attr][1] = Math.floor(color.color.rgb[1] * 255);
		object[attr][2] = Math.floor(color.color.rgb[2] * 255);
		func();
	});
}

function linkSelectToString(select, object, attr, func) {
	func = func || function() {};

	select.value = object[attr];
	select.addEventListener('change', function() {object[attr] = select.value; func();});
}

Math.clamp = function(num, min, max) {
	return Math.max(min, Math.min(num, max));
}

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