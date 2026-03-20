
precision highp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uPixels;

varying vec2 vUv;

void main() {
   
    vec4 image= texture2D(uTexture1, vUv);

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor= image;
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}
