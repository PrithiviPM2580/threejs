
varying vec2 vUv;

uniform sampler2D uPerlinTexture;
uniform float uTime;

vec2 rotate2D(vec2 uv, float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    mat2 rotationMatrix = mat2(cosA, -sinA, sinA, cosA);
    return rotationMatrix * uv;
}

void main() {
   vec4 modelPosition= modelMatrix * vec4(position, 1.0);


   //Twist
   float twistPerlin= texture2D(uPerlinTexture, vec2(0.5,uv.y * 0.2 - uTime * 0.003)).r;

   //Elevation based angle
   float angle= twistPerlin * 10.0;

   //Rotate UVs
   modelPosition.xz= rotate2D(modelPosition.xz,angle);

   //WindOffset
   vec2 windOffset= vec2(texture2D(uPerlinTexture, vec2(0.25,uTime * 0.01)).r - 0.5,
   texture2D(uPerlinTexture, vec2(0.75,uTime * 0.01)).r - 0.5
   );

   windOffset *= pow(uv.y,2.0) * 6.0;

   modelPosition.xz += windOffset;

   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;
   vUv = uv;
}