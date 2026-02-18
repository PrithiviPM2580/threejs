
precision highp float;

varying vec2 vUv;

uniform float radius;

float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


void main() {

  
    float dist= abs(distance(vUv, vec2(0.5)) - radius);
    gl_FragColor = vec4(dist,dist,dist, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}