
varying vec2 vUv;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

float remap(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {

   float progress= uProgress * aTimeMultiplier;
   vec3 newPosition = position;

   //Exploding
   float exploadingProgress= remap(progress, 0.0, 0.1, 0.0, 1.0);
   exploadingProgress = clamp(exploadingProgress, 0.0, 1.0);
   exploadingProgress = 1.0 - pow(1.0 - exploadingProgress, 3.0);
   newPosition *= exploadingProgress;

   //Falling
   float fallingProgress= remap(progress, 0.1, 1.0, 0.0, 1.0);
   fallingProgress = clamp(fallingProgress, 0.0, 1.0);
   fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
   newPosition.y -= fallingProgress * 0.2;

   //Scaling
   float sizeOpeningProgress= remap(progress, 0.0, 0.125, 0.0, 1.0);
   float sizeClosingProgress= remap(progress, 0.125, 1.0, 1.0, 0.0);
   float sizeProgress= min(sizeOpeningProgress, sizeClosingProgress);
   sizeProgress = clamp(sizeProgress, 0.0, 1.0);

   //Twinkling
   float twinklingProgress= remap(progress, 0.2, 0.8, 0.0, 1.0);
   twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
   float sizeTwinkle= sin(twinklingProgress * 20.0) * 0.5 + 0.5;
   sizeTwinkle = 1.0 -sizeTwinkle * twinklingProgress; // fade in twinkle


   vec4 modelPosition= modelMatrix * vec4(newPosition, 1.0);
   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;

   gl_PointSize= uSize * uResolution.y * aSize * sizeProgress * sizeTwinkle;
   gl_PointSize *= (1.0 / - viewPosition.z); // perspective correction
   vUv = uv;

   if(gl_PointSize < 1.0) {
     gl_Position = vec4(9999.0);
   }
 
}