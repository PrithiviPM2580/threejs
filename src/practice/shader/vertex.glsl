
uniform vec2 uResolution;
varying vec2 vUv;

void main(){

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;

    // gl_PointSize = uSize * uResolution.y;
    // gl_PointSize *= (1.0 / - viewPosition.z);
}