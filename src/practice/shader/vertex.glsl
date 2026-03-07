uniform float uTime;
uniform sampler2D uNoiseTexture;

varying vec2 vUv;
varying float vHeight;

void main()
{
vUv = uv;
vec3 pos = position;

float t = uTime * 0.6;

// Base noise
float n1 = texture2D(uNoiseTexture, vec2(uv.x * 1.5, uv.y * 2.0 - t)).r;
float n2 = texture2D(uNoiseTexture, vec2(uv.x * 3.0, uv.y * 4.0 - t * 1.5)).r;

float noise = (n1 + n2) * 0.5;

// Flame gets stronger toward top
float strength = pow(uv.y, 2.0);

// Side movement
pos.x += (noise - 0.5) * 0.8 * strength;
pos.z += (noise - 0.5) * 0.8 * strength;

// Vertical stretch
pos.y += noise * 1.5 * strength;

vHeight = uv.y;

gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
