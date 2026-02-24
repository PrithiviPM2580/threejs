
precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uLightRepeatation;
uniform float uShadeRepeatation;
uniform float uLow;
uniform float uHigh;
uniform vec3 uShadeColor;
uniform vec3 uLightColor;


vec3 ambientLight(vec3 lightColor, float lightIntensity){
    return lightColor * lightIntensity;
}

vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightposition, vec3 viewDirection, float specularPower){
    vec3 lightDirection = normalize(lightposition);
    vec3 lightReflection= reflect(-lightDirection, normal);

    //Shading
    float shading= dot(normal, lightDirection);
    shading= max(shading, 0.0);

    //Specular
    float specular= -dot(lightReflection, viewDirection);
    specular= max(0.0,specular);
    specular= pow(specular, specularPower);

    return lightColor * lightIntensity * (shading + specular);
}

vec3 halftone(
    vec3 color, vec3 normal, vec3 direction, float low, float high, float repeatations, vec3 shadeColor
){
    float intensity= dot(normal, direction);
    intensity= smoothstep(low, high, intensity);


    vec2 uv= gl_FragCoord.xy / uResolution.y;
    uv *= repeatations;
    uv= mod(uv, 1.0);

    float point= distance(uv, vec2(0.5));
    point= 1.0 -step(0.5 * intensity, point); 

    return mix(color,shadeColor, point);
}


void main() {
    vec3 viewDirection= normalize(vPosition - cameraPosition);
    vec3 normal= normalize(vNormal);
    vec3 color= uColor;

    //Light
    vec3 light= vec3(0.0);
    light += ambientLight(vec3(1.0), 1.0);
    light += directionalLight(vec3(1.0), 1.0, normal, vec3(1.0,1.0,0.0), viewDirection, 1.0);
    color *= light;
    
    color = halftone(
        color, normal, vec3(0.0,-1.0,0.0), uLow, uHigh, uShadeRepeatation, uShadeColor
    );

     color = halftone(
        color, normal, vec3(1.0,1.0,0.0), 0.5, 1.5, uLightRepeatation, uLightColor
    );

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}