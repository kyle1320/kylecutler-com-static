(function() {
	window.addEventListener('load', function() {
		var header = document.createElement('div');
		header.id = 'header';
		header.innerHTML = '\
			<h1>My Projects</h1> \
			<ul id="menu"> \
				<a href="/projects/spirograph/spiro.html"><li>Spirograph</li></a> \
				<a href="/projects/graphs/graphs.html"><li>Graphs</li></a> \
				<a href="/projects/particles/particles.html"><li>Particles</li></a> \
				<li>More to come...</li> \
			</ul> \
		';
		document.body.insertBefore(header, document.body.firstChild);
	});
}());