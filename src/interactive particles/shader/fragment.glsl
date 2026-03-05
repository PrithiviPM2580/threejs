
precision highp float;

varying vec2 vUv;
varying vec4 vColor;


void main() {
    gl_FragColor = vColor;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}