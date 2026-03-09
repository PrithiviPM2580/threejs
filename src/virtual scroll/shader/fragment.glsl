
varying vec2 vUv;
uniform sampler2D uTexture;

void main()
{
vec2 uv = vUv;

vec4 videoColor = texture2D(uTexture, uv);

gl_FragColor = videoColor;

}
