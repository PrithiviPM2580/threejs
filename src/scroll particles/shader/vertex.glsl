
uniform float uTime;
uniform float uSize;
uniform float uProgress;

void main(){

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize= uSize * (1.0 / - mvPosition.z); // perspective correction
    gl_Position = projectionMatrix * mvPosition;
}