
uniform float uSize;
uniform float uTime;
varying vec3 vColor;

attribute float aScale;

void main() {
   vec4 modelPosition = modelMatrix * vec4(position, 1.0);

   float angle = atan(modelPosition.z, modelPosition.x);
   float radius = length(modelPosition.xz);
   float angleOffset = (1.0 / radius) * uTime * 0.2;
   angle += angleOffset;
   modelPosition.x = cos(angle) * radius;
   modelPosition.z = sin(angle) * radius;

   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;

   gl_PointSize = uSize * aScale;
   gl_PointSize *= (5.0 / -viewPosition.z);
   
   // Pass color to fragment shader
   vColor = color;
}