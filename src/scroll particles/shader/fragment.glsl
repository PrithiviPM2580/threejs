

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uMaskTexture;

varying vec2 vCoordinates;
varying vec3 vPos;

void main(){
 
    vec4 maskTexture= texture2D(uMaskTexture, gl_PointCoord);

    vec2 myUv= vec2(vCoordinates.x/512., vCoordinates.y/512.);
    vec4 image1 = texture2D(uTexture1, myUv);

    float alpha= 1.0 - clamp(0.0,1.0,abs(vPos.z/900.0));

    // gl_FragColor = vec4(vCoordinates.x/512., vCoordinates.y/512., 0.0, 1.0);
    gl_FragColor = image1;
    gl_FragColor.a *= maskTexture.r * alpha;
}