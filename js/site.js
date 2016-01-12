(function() {
	window.addEventListener('load', function() {
		var header = document.createElement('div');
		header.id = 'header';
		header.innerHTML = '\
			<div id="titlebar"> \
				<h1 id="title">My Projects</h1> \
				<ul id="menu"> \
					<li><a href="/index.html">Home</a></li \
					><li class="dropdown"> \
						<a>JavaScript</a> \
						<ul class="submenu"> \
							<li><a href="/projects/js/spirograph/spiro.html">Spirograph</a></li> \
							<li><a href="/projects/js/graphs/graphs.html">Graphs</a></li> \
							<li><a href="/projects/js/particles/particles.html">Particles</a></li> \
							<li><a href="/projects/js/painter/painter.html">Painter</a></li> \
							<li><a href="/projects/js/bubbles/bubbles.html">Bubbles</a></li> \
						</ul> \
					</li \
					><li><a>More to come...</a></li \
				></ul> \
			</div> \
		'/*<li class="dropdown"> \
						<a>Java</a> \
						<ul class="submenu"> \
							<li><a href="">Platform&nbsp;Game</li></a> \
							<li><a href="">NyanPower</a></li> \
							<li><a href="">BlockToss</a></li> \
							<li><a href="">Painter</a></li> \
							<li><a href="">Patterns</a></li> \
						</ul> \
					</li> \
					<li class="dropdown"> \
						<a>C</a> \
						<ul class="submenu"> \
							<li><a href="">Voxels</a></li> \
						</ul> \
					</li> \
					<li class="dropdown"> \
						<a>Hackathons</a> \
						<ul class="submenu"> \
							<li><a href="">PennApps: UkeCopter</a></li> \
							<li><a href="">BrickHack: WTFU</a></li> \
						</ul> \
					</li> \
		'*/;

		var content = document.createElement('div');
		content.id = 'content';
		while (document.body.firstChild) {
			content.appendChild(document.body.firstChild);
		}

		var footer = document.createElement('div');
		footer.id = 'footer';
		footer.innerHTML = '\
			<hr> \
			<div id="links"> \
				<a href="http://www.facebook.com/kyle1321" title="Facebook" target="kc_social_fb" class="fa-facebook-square"></a> \
				<a href="mailto:kyle1320@gmail.com" title="E-mail" class="fa-envelope-square"></a> \
				<a href="https://plus.google.com/+KyleCutler1" title="Google+" target="kc_social_gplus" class="fa-google-plus-square"></a> \
				<a href="http://github.com/kyle1320" title="GitHub" target="kc_social_github" class="fa-github-square"></a> \
			</div> \
		';

		document.body.appendChild(header);
		document.body.appendChild(content);
		document.body.appendChild(footer);
	});
}());
