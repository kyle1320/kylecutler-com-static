import { range } from '~/src/common/js/utils';

const MAX_EDGES = 16;

export default `
#if GL_FRAGMENT_PRECISION_HIGH == 1
  precision highp float;
#else
  precision mediump float;
#endif

#define MAX_EDGES ${MAX_EDGES}

uniform vec4 edges[MAX_EDGES];
uniform int num_edges;
uniform float sensitivity;
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

vec3 hsv2rgb(vec3 c)
{
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float val;
  float dists[MAX_EDGES];
  bool brokeearly;

  ${// unroll loop to support "dynamic" indexing
  range(MAX_EDGES).map(i => `
  if (${i} < num_edges) {
    val = lineDist(edges[${i}],  gl_FragCoord.xy / scale);

    brokeearly = false;
    for (int j = ${i}; j > 0; j--) {
      if (dists[j - 1] <= val) {
        dists[j] = val;
        brokeearly = true;
        break;
      }
      dists[j] = dists[j - 1];
    }

    if (!brokeearly) {
      dists[0] = val;
    }
  }
  `).join('\n')}

  int len = num_edges;
  vec3 color = vec3(1.0, 1.0, 1.0);
  float diff, fade;

  for (int i=0; i < MAX_EDGES; i++) {
    if (i > num_edges - 2) break;

    len--;

    for (int j=0; j < MAX_EDGES; j++) {
      if (j >= len) break;

      dists[j] = dists[j+1] - dists[j];

      if (j == 0) diff = abs(dists[0]);
      else diff = max(diff, abs(dists[j]));
    }

    fade = clamp(float(num_edges) * sensitivity / diff, 0.0, 1.0);
    color = mix(
      color,
      hsv2rgb(vec3(float(num_edges - 2 - i) / float(MAX_EDGES), fade, 1.0)),
      fade
    );
  }

  gl_FragColor = vec4(color, 1.0);
}`;