
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uColor;

#include ./includes/ambient-light.glsl;

vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection) {
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(-lightDirection, normal);
    float shading = dot(normal, lightDirection);
    shading = max(shading, 0.0);

    //Specular
    float specularShading = -dot(lightReflection, viewDirection);
    specularShading = max(specularShading, 0.0);
    specularShading= pow(specularShading, 20.0);
    return lightColor * lightIntensity * shading + specularShading  ;
    // return vec3(specularShading);
}

void main() {

    //View Direction
    vec3 viewDirection= vPosition - cameraPosition;

    //Color
    vec3 color= uColor;

    //Light
    vec3 light= vec3(0.0);
    light += ambientLight(vec3(1.0), 0.1);
    light += directionalLight(
        vec3(0.1,0.1,1.0) //Light Color
        , 1.0 //Light Intensity
        ,vNormal //Normal
        ,vec3(0.0,0.0,3.0) //Light Position
        ,viewDirection //View Direction
        );
    color *= light;
  
    gl_FragColor = vec4(color, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}