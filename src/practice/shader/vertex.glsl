uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vHeight;

void main()
{
vUv = uv;

vec4 videoColor = texture2D(uTexture, vUv);
float brightness= dot(videoColor.rgb, vec3(0.299, 0.587, 0.114));
float stepped= floor(brightness * 5.0) / 5.0;
float elevation= mix(stepped, brightness, 0.5);

vec3 pos = position + normal *( elevation * 0.3);
gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
