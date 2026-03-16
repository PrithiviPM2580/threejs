
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;


void main() {
   
   vec3 normal= normalize(vNormal);

   if(!gl_FrontFacing) {
     normal *= -1.0;
   };

   //Stripes
   float stripes= mod((vPosition.y - uTime * 0.3) * 10.0,1.0);

   //Fresnel
   vec3 viewDirection= normalize(normal - cameraPosition);
   float fresnel= dot(viewDirection,normal) + 1.0;
   fresnel = pow(fresnel,3.0);

    gl_FragColor = vec4(vec3(fresnel * stripes), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
