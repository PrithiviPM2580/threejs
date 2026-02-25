
precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uCloudTexture;
uniform sampler2D uSpecularTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;


void main() {
    vec3 viewDirection= normalize(vPosition - cameraPosition);
    vec3 normal= normalize(vNormal);
    vec3 color = vec3(0.0);

    //Sun orientation
    float sunOrientation= dot(uSunDirection, normal);
    color = vec3(sunOrientation);    

    //Day and Night Texture
    float dayMix= smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
    vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
    color= mix(nightColor, dayColor, dayMix);

    //Specular Color
    vec2 specularColor= texture2D(uCloudTexture, vUv).rg;
    // color = vec3(specularColor);

    //Clouds
    float cloudMix= smoothstep(0.4, 1.0, specularColor.g);
    cloudMix *= dayMix;
    color= mix(color, vec3(1.0), cloudMix);

    //Fresnel Effect
    float fresnel= dot(viewDirection, normal) + 1.0;
    fresnel= pow(fresnel, 2.0);

    //Atmosphere
    float atmosphereMix= smoothstep(-0.5, 0.5, sunOrientation);
    vec3 atmosphereColor= mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereMix);

    //Specular Highlights
    vec3 reflection= reflect(-uSunDirection, normal);
    float specular= -dot(reflection, viewDirection);
    specular= max(specular, 0.0);
    specular= pow(specular,32.0);
    specular *= specularColor.r;
    vec3 specularEdgeColor= mix(vec3(1.0),atmosphereColor, fresnel);
    color += specular * specularEdgeColor;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}