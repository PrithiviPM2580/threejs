varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec2 vUv1;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uPixels;
uniform vec2 uUvRate1;

void main() {

   vec2 _uv= uv - 0.5;
   vUv1= _uv;
   vUv1 *= uUvRate1.xy;
   vUv1 += 0.5;

   vec4 modelPosition= modelMatrix * vec4(position, 1.0);
   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectedPosition = projectionMatrix * viewPosition;
   gl_Position = projectedPosition;

   vPosition= position;
   vNormal= normal;
   vUv= uv;
}
