(function() {
	window.addEventListener('load', function() {
		var header = document.createElement('div');
		header.id = 'header';
		header.innerHTML = '\
			<div id="topmost"> \
				<h1 id="title">My Projects</h1> \
				<div id="links"> \
					<a href="http://www.facebook.com/kyle1321" target="kc_social_fb" class="fa fa-facebook-official"></a><br> \
					<a href="https://plus.google.com/+KyleCutler1" target="kc_social_gplus" class="fa fa-google-plus-square"></a><br> \
					<a href="http://github.com/kyle1320" target="kc_social_github" class="fa fa-github-alt"></a> \
				</div> \
			</div> \
			<ul id="menu"> \
				<a href="/index.html"><li>Home</li></a> \
				<li class="dropdown"> JS \
					<ul class="submenu"> \
						<a href="/projects/spirograph/spiro.html"><li>Spirograph</li></a> \
						<a href="/projects/graphs/graphs.html"><li>Graphs</li></a> \
						<a href="/projects/particles/particles.html"><li>Particles</li></a> \
					</ul> \
				</li> \
				<li>More to come...</li> \
			</ul> \
		'/*'\
			<h1>My Projects</h1> \
			<ul id="menu"> \
				<a href="/index.html"><li>Home</li></a> \
				<a href="/projects/spirograph/spiro.html"><li>Spirograph</li></a> \
				<a href="/projects/graphs/graphs.html"><li>Graphs</li></a> \
				<a href="/projects/particles/particles.html"><li>Particles</li></a> \
				<li>More to come...</li> \
			</ul> \
		'*/;
		
		var content = document.createElement('div');
		content.id = 'content';
		while (document.body.firstChild) {
			content.appendChild(document.body.firstChild);
		}
		
		document.body.appendChild(header);
		document.body.appendChild(content);
	});
}());