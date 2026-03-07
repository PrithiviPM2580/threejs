uniform float uTime;
uniform sampler2D uNoiseTexture;

varying vec2 vUv;
varying float vHeight;

void main()
{
vec2 uv = vUv;

float t = uTime * 1.5;

// Layered noise
float n1 = texture2D(uNoiseTexture, vec2(uv.x * 1.5, uv.y * 2.0 - t)).r;
float n2 = texture2D(uNoiseTexture, vec2(uv.x * 3.0, uv.y * 3.5 - t * 1.3)).r;
float noise = (n1 * 0.6 + n2 * 0.4);

// Flame mask
float flame = smoothstep(0.2, 1.0, noise);

// Radial falloff (keeps flame center bright)
float center = 1.0 - abs(uv.x - 0.5) * 2.0;
flame *= center;

// Height fade
flame *= smoothstep(0.0, 0.3, uv.y);
flame *= 1.0 - uv.y * 0.6;

// Fire color gradient
vec3 yellow = vec3(1.0, 0.95, 0.6);
vec3 orange = vec3(1.0, 0.5, 0.05);
vec3 red = vec3(0.7, 0.05, 0.01);

vec3 color = mix(red, orange, flame);
color = mix(color, yellow, pow(flame, 3.0));

float alpha = flame;

gl_FragColor = vec4(color, alpha);

}
