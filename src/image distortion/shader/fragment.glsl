
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 newUv = vUv - vec2(0.5);
    newUv.x *= aspect;
    newUv += vec2(0.5);
    vec4 color= texture2D(uTexture, newUv);
    vec4 offset = texture2D(uDataTexture, vUv);

    gl_FragColor= vec4(offset.r,0.0,0.0,1.0);
    gl_FragColor= texture2D(uTexture,newUv - 0.02 * offset.rg);
    // gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}