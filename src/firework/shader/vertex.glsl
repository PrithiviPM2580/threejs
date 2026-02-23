
varying vec2 vUv;

uniform float uSize;
uniform vec2 uResolution;

attribute float aSize;

void main() {
   vec4 modelPosition= modelMatrix * vec4(position, 1.0);
   


   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;

   gl_PointSize= uSize * uResolution.y * aSize;
   gl_PointSize *= (1.0 / - viewPosition.z); // perspective correction
   vUv = uv;
 
}