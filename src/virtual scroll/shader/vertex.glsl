uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vHeight;

void main()
{
vUv = uv;
vec3 pos = position;
gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
