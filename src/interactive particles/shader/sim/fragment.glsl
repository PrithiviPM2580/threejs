
precision highp float;

uniform sampler2D uPositions;
uniform sampler2D uInfo;

varying vec2 vUv;


void main() {

   vec4 pos= texture2D(uPositions,vUv);
   vec4 info= texture2D(uInfo,vUv);

   float radius= info.x;
   float angle= atan(pos.y,pos.x) - 0.1;

   vec3 targetPos= vec3(cos(angle),sin(angle),0.0) * radius;
  
   pos.xy += (targetPos.xy - pos.xy) * 0.01;
    gl_FragColor = vec4(pos.xy,1.0  , 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}