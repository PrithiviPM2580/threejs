
varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform vec2 uVideoResolution;
uniform float uMix;

vec2 coverUv(vec2 uv, vec2 outputResolution, vec2 mediaResolution) {
    float outputAspect = outputResolution.x / outputResolution.y;
    float mediaAspect = mediaResolution.x / mediaResolution.y;

    vec2 newUv = uv;

    if (outputAspect > mediaAspect) {
        float scale = mediaAspect / outputAspect;
        newUv.y = uv.y * scale + (1.0 - scale) * 0.5;
    } else {
        float scale = outputAspect / mediaAspect;
        newUv.x = uv.x * scale + (1.0 - scale) * 0.5;
    }

    return newUv;
}

void main(){

    //Remap Resolution
    vec2 textureUv = coverUv(vUv, uResolution, uTextureResolution);
    vec2 videoUv = coverUv(vUv, uResolution, uVideoResolution);

    //Distance from center
    vec2 circleUv= vUv - vec2(0.5);
    float distanceFromCenter= length(circleUv);
    

    vec4 textureColor = texture2D(uTexture, textureUv);
    vec4 videoColor = texture2D(uVideo, videoUv);
    gl_FragColor = vec4(distanceFromCenter);
    // gl_FragColor = vec4(vUv,1.0, 1.0); 
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}