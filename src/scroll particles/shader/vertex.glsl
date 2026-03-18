
uniform float uTime;
uniform float uSize;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uMove;

attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;

varying vec2 vCoordinates;
varying vec3 vPos;
varying vec2 vUv;

void main(){

    vec3 pos = position;
    pos.x += sin(uMove * aSpeed) * 3.0;
    pos.y += sin(uMove * aSpeed) * 3.0;
    pos.z = mod(position.z + uMove *20.0 * aSpeed + aOffset, 2000.0) - 1000.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
    vUv = uv;
    vPos = pos;

}