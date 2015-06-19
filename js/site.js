(function() {
	window.addEventListener('load', function() {
		var header = document.createElement('div');
		header.id = 'header';
		header.innerHTML = '\
			<h1>My Projects</h1> \
			<ul id="menu"> \
				<a href="/index.html"><li>Home</li></a> \
				<a href="/projects/spirograph/spiro.html"><li>Spirograph</li></a> \
				<a href="/projects/graphs/graphs.html"><li>Graphs</li></a> \
				<a href="/projects/particles/particles.html"><li>Particles</li></a> \
				<li>More to come...</li> \
			</ul> \
		';
		
		var content = document.createElement('div');
		content.id = 'content';
		while (document.body.firstChild) {
			content.appendChild(document.body.firstChild);
		}
		
		document.body.appendChild(header);
		document.body.appendChild(content);
	});
}());