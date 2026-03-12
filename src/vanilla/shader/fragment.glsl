varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

void main(){

  vec3 normal= normalize(vNormal);

  float stripes= mod((vPosition.y - uTime * 0.02)* 20.0,1.0);
  stripes= pow(stripes,3.0);

  vec3 viewDirection= normalize(normal - cameraPosition);
  float fresnel= dot(viewDirection,normal) + 1.0;
  fresnel= pow(fresnel,2.0);

  vec3 color = vec3(0.5451, 0.3608, 0.9647);


  gl_FragColor= vec4(color * stripes,1.0);
}