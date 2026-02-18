
precision highp float;

varying vec2 vUv;
varying float vElevation;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;



void main() {

    float mixStrength = (vElevation * uColorMultiplier) + uColorOffset;
    vec3 color= mix(uDepthColor,uSurfaceColor,mixStrength);
  
    gl_FragColor = vec4(color, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}