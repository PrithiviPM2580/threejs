
precision highp float;

uniform float uTime;

varying vec2 vUv;
uniform vec3 uColor;
uniform float uOffset;

float qinticOut(float t) {
    return 1.0 - (pow(t - 1.0, 5.0));
}

void main() {


    float localProgress= mod(uTime * 2.0 + uOffset * 2.0,1.0);
    localProgress = qinticOut(localProgress / 2.0) * 2.0;
    if(vUv.x > localProgress || vUv.x + 1.0 < localProgress){
        discard;
    }

    gl_FragColor = vec4(uColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}