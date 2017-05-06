precision highp float;

uniform float time;
uniform vec2 screenSize;
uniform vec4 bounds;

bool isNaN(float x) {
	return !(x <= 0.0 || 0.0 <= x);
}

void main() {
    vec2 pos = (gl_FragCoord.xy / screenSize) * (bounds.zw - bounds.xy) + bounds.xy;

    float x = pos.x;
    float y = pos.y;
	float t = time;

    // float v = sin(y+cos(x)+cos(t)) * cos(x+cos(y)+sin(t)) + t;
    // float v = length(mat4(1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0) * vec4(x, y, cos(x), cos(y)));
	float v = sqrt((x + cos(y)) * (y + sin(x)));

	if (isNaN(v)) {
		gl_FragColor = vec4(0, 0, 0, 1);
		return;
	}

    float i = floor(v * 6.0);
    float f = mod(((v * 6.0 - i) + 1.0), 1.0);
    float q = (1.0 - f);
    float s = mod((i + 6.0), 6.0);

    if (s == 0.0) gl_FragColor = vec4(1, f, 0, 1); //return '#FF' + t + '00';
    if (s == 1.0) gl_FragColor = vec4(q, 1, 0, 1); //return '#' + q + 'FF00';
    if (s == 2.0) gl_FragColor = vec4(0, 1, f, 1); //return '#00FF' + t;
    if (s == 3.0) gl_FragColor = vec4(0, q, 1, 1); //return '#00' + q + 'FF';
    if (s == 4.0) gl_FragColor = vec4(f, 0, 1, 1); //return '#' + t + '00FF';
    if (s == 5.0) gl_FragColor = vec4(1, 0, q, 1); //return '#FF00' + q;
}