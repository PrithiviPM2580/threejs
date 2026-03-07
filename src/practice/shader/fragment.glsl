


varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uNoiseTexture;

void main()
{
    vec2 staticUv = vUv;
    vec2 uv = staticUv;
    uv.y -= uTime * 0.2;

    vec3 textureColor = texture2D(uNoiseTexture, uv).rgb;

    float gradient = 1.0 - staticUv.y;
    float subtractTexture= smoothstep(0.5,0.8,staticUv.y);

    gl_FragColor = vec4(textureColor + vec3(gradient) - vec3(subtractTexture), 1.0);
    // gl_FragColor = vec4(vec3(subtractTexture), 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}