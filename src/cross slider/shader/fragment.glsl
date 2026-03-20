
precision highp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uPixels;
uniform vec2 uAccel;
uniform float uTime;

varying vec2 vUv;
varying vec2 vUv1;

vec2 mirrored(vec2 v){
    vec2 m= mod(v, 2.);
    return mix(m, 2. - m, step(1., m));
}

float tri(float p){
    return mix(p,1.0 - p, step(0.5,p)) * 2.0;
}

void main() {
    vec2 uv= gl_FragCoord.xy / uPixels.xy;

    float delayValue= uProgress*7. - uv.y*2. + uv.x - 2.0;

    delayValue= clamp(delayValue, 0., 1.);

    vec2 translateValue= uProgress + delayValue * uAccel;
    vec2 translateValue1= vec2(-0.5,1.) * translateValue;
    vec2 translateValue2= vec2(-0.5,1.) * (translateValue - 1. - uAccel);

    vec2 w= sin(sin(uTime) * vec2(0,0.3) + vUv.yx * vec2(0,4.0)) * vec2(0,0.5);
    vec2 xy= w * (tri(uProgress) * 0.5 + tri(delayValue) * 0.5);

    vec2 uv1= vUv1 + translateValue1 +xy;
    vec2 uv2= vUv1 + translateValue2 +xy;
   
    vec4 image1= texture2D(uTexture1, mirrored(uv1));
    vec4 image2= texture2D(uTexture2, mirrored(uv2));

    vec4 image= mix(image1, image2, delayValue);

    gl_FragColor = vec4(uv, 0.0, 1.0);
    gl_FragColor= image;
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}
