uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;

void main(){

    float time = uTime * 0.2;
    vec2 uv= gl_FragCoord.xy / resolution.xy;
    vec4 particle= texture2D(uParticles,uv);
    vec4 base= texture2D(uBase,uv);

    gl_FragColor= base;
}