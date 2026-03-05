
varying vec2 vUv;

uniform float uSize;
uniform vec2 uResolution;
uniform sampler2D uPositions;

void main() {

   vec4 newPosition= texture2D(uPositions,uv);


   vec4 modelPosition= modelMatrix * vec4(newPosition.xyz, 1.0);
   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;
   vUv = uv;

   gl_PointSize=  uSize ;
   gl_PointSize *= (1.0 / - viewPosition.z);
}