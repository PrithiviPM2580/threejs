
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;

uniform float uPixelSize;



void main() {
   
    vec3 lightDir= normalize(vec3(1.0,1.0,1.0));

    // float diffuse= dot(vNormal, lightDir);
    float diffuse= max(dot(vNormal, lightDir), 0.0);
    float ambient= 0.2;

    float brightness= ambient + diffuse;

    const mat4 bayer= mat4(
      0.0, 12.0, 3.0, 15.0,
      8.0, 4.0, 11.0, 7.0,
      2.0, 14.0, 1.0, 13.0,
      10.0, 6.0, 9.0, 5.
    ) / 16.0;

    vec2 coord= gl_FragCoord.xy / uPixelSize;

    int i= int(mod(coord.x, 4.0));
    int j= int(mod(coord.y, 4.0));

    float threshold= bayer[i][j];

    float dither= step(threshold, brightness);


    vec3 color= vec3(1.0, 0.5, 0.0);
    color *= brightness * dither;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
