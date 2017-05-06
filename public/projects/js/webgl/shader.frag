precision highp float;

uniform float time;

float HSQRT3 = sqrt(3.0) / 2.0;
float SIZE = 100.0;

float push(float x, float n) {
	return x - n * floor(x / n);
}

void main() {
	float x = gl_FragCoord.x / SIZE;
	float y = gl_FragCoord.y / SIZE;

	float tx = cos(time*0.7)*6.0;
	float ty = sin(time*0.863)*6.0;

	float nx = (x-tx)*cos(time) - (y-ty)*sin(time);
	float ny = (x-tx)*sin(time) + (y-ty)*cos(time);

	x = nx+tx;
	y = ny+ty;

	// translate to the hexagonal grid
	y = y * HSQRT3 - x * 0.5;

	int hx = int(floor(x));
	int hy = int(floor(y));

	float ex = x - float(hx);
	float ey = y - float(hy);

	float l1 = ey + 2.0 * ex;
	float l2 = ey + 0.5 * ex;
	float n = ey - ex;

	if (l1 < 1.0 && l2 < 0.5) {

	} else if (l1 > 2.0 && l2 > 1.0) {
		hx++;
		hy++;
	} else if (n < 0.0) {
		hx++;
	} else {
		hy++;
	}

	gl_FragColor = vec4(
		push(float(hx), 6.0) / 6.0,
		push(float(hy), 6.0) / 6.0,
		push(float(hx+hy), 6.0) / 6.0,
		1.0
	);
}