#if GL_FRAGMENT_PRECISION_HIGH == 1
	precision highp float;
#else
	precision mediump float;
#endif

#define MAX_EDGES 16

uniform vec4 edges[MAX_EDGES];
uniform int num_edges;
uniform int order;
uniform float range;
uniform float highlight;
uniform float modulo;
uniform float scale;

float lineDist(vec4 l, vec2 p) {
	vec2 t = l.zw - l.xy;
	float l2 = t.x*t.x + t.y*t.y;

	vec2 da = p - l.xy;

	float d = dot(t, da);

	if (d <= 0.0) {
		return length(da);
	} else if (d >= l2) {
		return length(p - l.zw);
	} else {
		return sqrt(da.x*da.x + da.y*da.y - (d * d) / l2);
	}
}

void main() {
	int len = num_edges;
	float val;
	float dists[MAX_EDGES];

	if (num_edges - order < 2 || num_edges > MAX_EDGES) return;

	for (int i=0; i < MAX_EDGES; i++) {
		if (i >= num_edges) break;

		/*if (length(gl_FragCoord.xy / scale - edges[i].xy) < 12.0 ||
			length(gl_FragCoord.xy / scale - edges[i].zw) < 12.0) {
				gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
				return;
			}*/
		val = lineDist(edges[i], gl_FragCoord.xy / scale);

		bool brokeearly = false;
		for (int j = MAX_EDGES - 1; j > 0; j--) {
			if (j <= i) {
				if (dists[j-1] <= val) {
					dists[j] = val;
					brokeearly = true;
					break;
				}
				dists[j] = dists[j-1];
			}
		}

		if (!brokeearly) {
			dists[0] = val;
		}
	}

	for (int i=0; i < MAX_EDGES; i++) {
		if (i >= order) break;

		len--;

		for (int j=0; j < MAX_EDGES; j++) {
			if (j >= len) break;
			dists[j] = dists[j+1] - dists[j];
		}
	}

	float sumsq = 0.0;
	float sqsum = 0.0;
	for (int j=0; j < MAX_EDGES; j++) {
		if (j >= len) break;

		sumsq += dists[j];
		sqsum += dists[j] * dists[j];
	}
	sumsq = (sumsq * sumsq) / float(len);
	if (sumsq > sqsum) sumsq = sqsum;

	float stdev = sqrt((sqsum - sumsq) / (float(len) - 1.0));

	if (modulo > 0.5) stdev = (range - mod(stdev, range)) / range;
	else stdev = max(0.0, (range - stdev) / range);

	float threshold = (range*0.99 - float(order)*range*0.01) / range;

	if (highlight > 0.5 && stdev > threshold) {
		float fade = (1.0 - stdev) / (1.0 - threshold);
		gl_FragColor = vec4(stdev, fade, fade, 1.0);
		//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	} else {
		gl_FragColor = vec4(stdev, stdev, stdev, 1.0);
		//gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
}