(function() {
	window.addEventListener('load', function() {
		var header = document.createElement('div');
		header.id = 'header';
		header.innerHTML = '\
			<div id="topmost"> \
				<h1 id="title">My Projects</h1> \
				<div id="links"> \
					<a href="http://www.facebook.com/kyle1321" target="kc_social_fb" class="fa-facebook-square"></a> \
					<a href="https://plus.google.com/+KyleCutler1" target="kc_social_gplus" class="fa-google-plus-square"></a><br> \
					<a href="mailto:kyle1320@gmail.com" class="fa-envelope-square"></a> \
					<a href="http://github.com/kyle1320" target="kc_social_github" class="fa-github-square"></a> \
				</div> \
			</div> \
			<ul id="menu"> \
				<a href="/index.html"><li>Home</li></a> \
				<li class="dropdown"> JavaScript \
					<ul class="submenu"> \
						<a href="/projects/spirograph/spiro.html"><li>Spirograph</li></a> \
						<a href="/projects/graphs/graphs.html"><li>Graphs</li></a> \
						<a href="/projects/particles/particles.html"><li>Particles</li></a> \
					</ul> \
				</li> \
				<li>More to come...</li> \
			</ul> \
		'/*<li class="dropdown"> Java \
					<ul class="submenu"> \
						<a href=""><li>Platform&nbsp;Game</li></a> \
						<a href=""><li>NyanPower</li></a> \
						<a href=""><li>BlockToss</li></a> \
						<a href=""><li>Painter</li></a> \
						<a href=""><li>Patterns</li></a> \
					</ul> \
				</li> \
				<li class="dropdown"> C \
					<ul class="submenu"> \
						<a href=""><li>Voxels</li></a> \
					</ul> \
				</li> \
				<li class="dropdown"> Hackathons \
					<ul class="submenu"> \
						<a href=""><li>PennApps: UkeCopter</li></a> \
						<a href=""><li>BrickHack: WTFU</li></a> \
					</ul> \
				</li> \
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