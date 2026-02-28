
precision highp float;

uniform float uTime;

varying vec2 vUv;

void main() {

    vec3 color = vec3(1.0, 1.0, 1.0);

    float localProgress= mod(uTime * 2.0,1.0);
    if(vUv.x > localProgress || vUv.x + 1.0 < localProgress){
        discard;
    }

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}