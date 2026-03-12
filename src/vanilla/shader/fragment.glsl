varying vec3 vPosition;
varying vec3 vNormal;

void main(){

  vec3 normal= normalize(vNormal);

  vec3 viewDirection= normalize(normal - cameraPosition);
  float fresnel= dot(viewDirection,normal) + 1.0;
  fresnel= pow(fresnel,3.0);

  gl_FragColor= vec4(vec3(fresnel),1.0);
}