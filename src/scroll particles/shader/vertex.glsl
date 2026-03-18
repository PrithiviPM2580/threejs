 uniform float uTime;
                uniform float uWaveAmplitude; // Uniform for wave height

                attribute float aOffset;
                attribute float aSpeed;
                attribute float aColorIdx;
                
                varying vec2 vUv;
                varying float vSpeed;
                varying float vOffset;
                varying float vColorIdx;

                void main() {
                    vUv = uv;
                    vSpeed = aSpeed;
                    vOffset = aOffset;
                    vColorIdx = aColorIdx;
                    
                    vec3 pos = position;

                    // --- WAVE MOTION ---
                    // Calculate a sine wave based on time and position along the tube (uv.x)
                    // aOffset makes sure each trail waves differently
                    float wave = sin(uv.x * 10.0 + uTime * 2.0 + aOffset);
                    
                    // Apply wave to Z axis (Up/Down relative to camera view usually)
                    pos.z += wave * uWaveAmplitude;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }