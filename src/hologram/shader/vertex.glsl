
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

float random2D(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
   vec4 modelPosition= modelMatrix * vec4(position, 1.0);
   vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
   

  // Glitch
  float glitchStrength = sin(uTime - modelPosition.y);
  glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
  glitchStrength *= 0.25;
  modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
  modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;


   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;
   
   vPosition = modelPosition.xyz;

   vNormal =modelNormal.xyz;
 
}