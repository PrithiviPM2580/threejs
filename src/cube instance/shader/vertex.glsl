
varying vec2 vUv;

void main() {
  vec4 modelPosition = instanceMatrix * vec4(position, 1.0);
  vec4 viewPosition = modelViewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  vUv = uv;
}