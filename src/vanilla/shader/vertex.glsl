
varying vec3 vPosition;
varying vec3 vNormal;

void main(){

   vec3 newPos= position;

   gl_Position= projectionMatrix * modelViewMatrix * vec4(newPos,1.0);

   vPosition= position;
   vNormal= normal;
}