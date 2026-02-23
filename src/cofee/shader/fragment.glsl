
precision highp float;

varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uColor;



void main() {

    //Normalize the normal vector
   vec3 normal = normalize(vNormal);
   if(!gl_FrontFacing) {
     normal *= -1.0;
   }

   //Stripes
   float stripes= mod((vPosition.y - uTime * 0.02)*20.0, 1.0);
   stripes = pow(stripes, 3.0);

  
  //Fresnel
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  float fresnel = dot(viewDirection, normal) + 1.0;
  fresnel = pow(fresnel, 2.0);

   //Fallout
   float fallout= smoothstep(0.8, 0.0, fresnel);

   //Hologram effect
  float hologramEffect = stripes * fresnel;
  hologramEffect += fresnel * 1.25;
  hologramEffect *= fallout;


   gl_FragColor = vec4(uColor, hologramEffect);
//    gl_FragColor = vec4( vNormal,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}