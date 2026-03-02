
varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform vec2 uVideoResolution;
uniform float uMix;
uniform float uCircleScale;
uniform float time;
mat2 rot2d (in float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}
float r (in float a, in float b) { return fract(sin(dot(vec2(a,b),vec2(12.9898,78.233)))*43758.5453); }
float h (in float a) { return fract(sin(dot(a,dot(12.9898,78.233)))*43758.5453); }

float noise (in vec3 x) {
    vec3 p  = floor(x);
    vec3 f  = fract(x);
    f       = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix( h(n+0.0), h(n+1.0),f.x),
                   mix( h(n+57.0), h(n+58.0),f.x),f.y),
               mix(mix( h(n+113.0), h(n+114.0),f.x),
                   mix( h(n+170.0), h(n+171.0),f.x),f.y),f.z);
}
// http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
// http://www.pouet.net/topic.php?post=401468
vec3 dnoise2f (in vec2 p) {
    float i = floor(p.x), j = floor(p.y);
    float u = p.x-i, v = p.y-j;
    float du = 30.*u*u*(u*(u-2.)+1.);
    float dv = 30.*v*v*(v*(v-2.)+1.);
    u=u*u*u*(u*(u*6.-15.)+10.);
    v=v*v*v*(v*(v*6.-15.)+10.);
    float a = r(i,     j    );
    float b = r(i+1.0, j    );
    float c = r(i,     j+1.0);
    float d = r(i+1.0, j+1.0);
    float k0 = a;
    float k1 = b-a;
    float k2 = c-a;
    float k3 = a-b-c+d;
    return vec3(k0 + k1*u + k2*v + k3*u*v,
                du*(k1 + k3*v),
                dv*(k2 + k3*u));
}


float fbm (in vec2 uv) {
    vec2 p = uv;
	float f, dx, dz, w = 0.5;
    f = dx = dz = 0.0;
    for(int i = 0; i < 3; ++i){        
        vec3 n = dnoise2f(uv);
        dx += n.y;
        dz += n.z;
        f += w * n.x / (1.0 + dx*dx + dz*dz);
        w *= 0.86;
        uv *= vec2(1.36);
        uv *= rot2d(1.25 * noise(vec3(p * 0.1, 0.12 * time)) +
                    0.75 * noise(vec3(p * 0.1, 0.20 * time)));
    }
    return f;
}

float fbmLow (in vec2 uv) {
    float f, dx, dz, w = 0.5;
    f = dx = dz = 0.0;
    for(int i = 0; i < 3; ++i){        
        vec3 n = dnoise2f(uv);
        dx += n.y;
        dz += n.z;
        f += w * n.x / (1.0 + dx*dx + dz*dz);
        w *= 0.95;
        uv *= vec2(3);
    }
    return f;
}

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

float circle(vec2 uv, float radius,float sharp){
    vec2 tempUv= uv - vec2(0.5);
    tempUv.x *= uResolution.x / uResolution.y;
    return smoothstep(
        radius - radius * sharp,
        radius + radius * sharp,
        dot(tempUv, tempUv)*3.0
    );
}

void main(){

    //Remap Resolution
    vec2 textureUv = coverUv(vUv, uResolution, uTextureResolution);
    vec2 videoUv = coverUv(vUv, uResolution, uVideoResolution);

    vec2 centerVector= vUv - vec2(0.5);

    //Distance from center
    // vec2 circleUv= vUv - vec2(0.5);
    // float distanceFromCenter= length(circleUv);
    

    vec4 textureColor = texture2D(uTexture, textureUv);
    vec4 videoColor = texture2D(uVideo, videoUv);


    //Ripples
    vec2 noiseUv= vUv - vec2(0.5);
    noiseUv.x *= uResolution.x / uResolution.y; 

    vec2 rv= noiseUv/(length(noiseUv*10.0)*noiseUv*20.0);
    float swirl= 20.0 * fbm(
        noiseUv * fbmLow(vec2(length(noiseUv) - time + rv))
    );
    vec2 swirlDistort= fbmLow(noiseUv*swirl)*centerVector*10.0;

    float dist= circle(vUv * swirlDistort,uCircleScale,0.25+0.25*uCircleScale);

    vec4 final= mix(videoColor, textureColor, dist);
    gl_FragColor = final;
    // gl_FragColor= vec4(fbmLow(vUv * 100.0),0.0,0.0,1.0);
    // gl_FragColor = vec4(swirlDistort,0.0,1.0); 
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}