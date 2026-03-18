 uniform float uTime;
                uniform float uGlobalSpeed;
                uniform float uTrailLength;
                
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;
                uniform vec3 uColor4;

                varying vec2 vUv;
                varying float vSpeed;
                varying float vOffset;
                varying float vColorIdx;

                void main() {
                    float time = uTime * uGlobalSpeed * vSpeed;
                    
                    // Inward movement
                    float trailPos = fract(vUv.x - time + vOffset);
                    
                    // Fixed Length Logic
                    float minLen = 0.001; 
                    float effectiveLength = mix(minLen, 0.8, uTrailLength);
                    
                    float trail = smoothstep(1.0 - effectiveLength, 1.0, trailPos);
                    
                    float power = mix(1.0, 3.0, uTrailLength);
                    trail = pow(trail, power);

                    // Soft fade at edges
                    float edgeFade = smoothstep(0.0, 0.05, vUv.x) * (1.0 - smoothstep(0.95, 1.0, vUv.x));

                    // Colors
                    vec3 finalColor;
                    if (vColorIdx < 0.5) finalColor = uColor1;
                    else if (vColorIdx < 1.5) finalColor = uColor2;
                    else if (vColorIdx < 2.5) finalColor = uColor3;
                    else finalColor = uColor4;

                    finalColor = mix(finalColor, vec3(1.0), trail * 0.8);
                    float alpha = trail * edgeFade;

                    gl_FragColor = vec4(finalColor, alpha);
                }