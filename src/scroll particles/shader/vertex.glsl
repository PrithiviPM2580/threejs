
uniform float uTime;
uniform float uSize;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uMove;
uniform vec2 uMouse;
uniform float uMousePressed;

attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;


varying vec2 vCoordinates;
varying vec3 vPos;
varying vec2 vUv;

void main(){

    vec3 pos = position;
    pos.x += sin(uMove * aSpeed) * 3.0;
    pos.y += sin(uMove * aSpeed) * 3.0;
    pos.z = mod(position.z + uMove *20.0 * aSpeed + aOffset, 2000.0) - 1000.0;

    vec3 stablePos = position;
    float dist= distance(stablePos.xy,uMouse);
    float area= 1.0 - smoothstep(0.,300.,dist);

    stablePos.x += 50.0 *sin(uTime * aPress) * aDirection * area * uMousePressed;
    stablePos.y += 50.0 *sin(uTime * aPress) * aDirection * area * uMousePressed;
    stablePos.z += 200.0 *cos(uTime * aPress) * aDirection * area * uMousePressed;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
    vUv = uv;
    vPos = pos;

}