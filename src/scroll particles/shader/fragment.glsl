

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uMaskTexture;
uniform float uMove;

varying vec2 vCoordinates;
varying vec3 vPos;

void main(){
 
    vec4 maskTexture= texture2D(uMaskTexture, gl_PointCoord);

    vec2 myUv= vec2(vCoordinates.x/512., vCoordinates.y/512.);
    vec4 image1 = texture2D(uTexture1, myUv);
    vec4 image2 = texture2D(uTexture2, myUv);
    vec4 final= mix(image1,image2,fract(uMove));

    float alpha= 1.0 - clamp(0.0,1.0,abs(vPos.z/900.0));

    // gl_FragColor = vec4(vCoordinates.x/512., vCoordinates.y/512., 0.0, 1.0);
    gl_FragColor = final;
    // gl_FragColor.a *= maskTexture.r * alpha;
}