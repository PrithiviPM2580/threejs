
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

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

vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightposition, vec3 viewDirection, float specularPower,vec3 position, float lightDecay){
    vec3 lightDelta= lightposition - position;
    float lightDistance= length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection= reflect(-lightDirection, normal);

    //Shading
    float shading= dot(normal, lightDirection);
    shading= max(shading, 0.0);

    //Specular
    float specular= -dot(lightReflection, viewDirection);
    specular= max(0.0,specular);
    specular= pow(specular, specularPower);

    //Decay
    float decay = 1.0 - lightDistance * lightDecay;
    decay = max(0.0, decay);

    return lightColor * lightIntensity * (shading + specular) * decay;
}



void main() {

     vec3 viewDirection= normalize(vPosition - cameraPosition);
     vec3 normal= normalize(vNormal);

    //Base color
    float mixStrength = (vElevation * uColorMultiplier) + uColorOffset;
    mixStrength= smoothstep(0.0,1.0,mixStrength);
    vec3 color= mix(uDepthColor,uSurfaceColor,mixStrength);

    //Light
    vec3 light= vec3(0.0);
    light += pointLight(
        vec3(1.0),
        10.0,
        normal,
        vec3(0.0,0.25,0.0),
        viewDirection,
        30.0,
        vPosition,
        0.95
     );

     color *= light;
  
    //Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}