
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;

uniform float uPixelSize;

float bayer8x8(vec2 uv) {
    int x = int(mod(uv.x, 8.0));
    int y = int(mod(uv.y, 8.0));
    
    float dither[64] = float[](
        0.0/64.0,  32.0/64.0,  8.0/64.0, 40.0/64.0,  2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
        48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0, 50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
        12.0/64.0, 44.0/64.0,  4.0/64.0, 36.0/64.0, 14.0/64.0, 46.0/64.0,  6.0/64.0, 38.0/64.0,
        60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0, 62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0,
         3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0,  1.0/64.0, 33.0/64.0,  9.0/64.0, 41.0/64.0,
        51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0, 49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
        15.0/64.0, 47.0/64.0,  7.0/64.0, 39.0/64.0, 13.0/64.0, 45.0/64.0,  5.0/64.0, 37.0/64.0,
        63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0, 61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
    );

    return dither[y * 8 + x];
}



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

    // float threshold= bayer[i][j];
    float threshold = bayer8x8(gl_FragCoord.xy);

    float dither= step(threshold, brightness);


    vec3 color= vec3(1.0, 0.5, 0.0);
    color *= brightness * dither;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
