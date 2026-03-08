 uniform sampler2D uTexture;
 uniform float uDisplacement;
 uniform float uLayers;
 uniform float uSoftness;
 varying vec2 vUv;

 float getLuminance(vec3 color) {
     return dot(color, vec3(0.299, 0.587, 0.114));
 }

 void main() {
     vUv = uv;
     vec4 color = texture2D(uTexture, uv);
     float brightness = getLuminance(color.rgb);
     
     float stepped = floor(brightness * uLayers) / uLayers;
     float smoothVal = brightness;
     float elevation = mix(stepped, smoothVal, uSoftness);

    vec3 newPos = position + normal * (elevation * uDisplacement);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
 }
