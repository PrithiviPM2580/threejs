
uniform float uTime;
uniform float uSize;
uniform float uProgress;
uniform float uPixelRatio;

attribute vec3 aCoordinates;

varying vec2 vCoordinates;
varying vec2 vUv;

void main(){

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
    vUv = uv;
}