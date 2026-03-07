


varying vec2 vUv;

uniform float time;
uniform vec2 uResolution;

// -------------------------
// Rectangle function (hard mask)
float rect(vec2 st, vec2 pos, vec2 size)
{
    vec2 bl = step(pos, st);                   // bottom-left
    vec2 tr = step(pos, 1.0 - st + size);      // top-right
    return bl.x * bl.y * tr.x * tr.y;          // 1 inside rect, 0 outside
}

// Rectangle outline (thickness)
float rectOutline(vec2 st, vec2 pos, vec2 size, float thickness)
{
    float outer = rect(st, pos, size);
    float inner = rect(st, pos + vec2(thickness), size - vec2(thickness * 2.0));
    return outer - inner;                      // 1 in border only
}

// -------------------------
void main()
{
    vec2 st = vUv;   // UV coords 0->1
    vec3 color = vec3(1.0);  // white background

    // Example rectangles
    float r1 = rect(st, vec2(0.0, 0.0), vec2(0.4, 0.6));  // bottom-left rectangle
    float r2 = rect(st, vec2(0.4, 0.6), vec2(0.6, 0.4));  // top-right rectangle
    float r3 = rect(st, vec2(0.0, 0.6), vec2(0.4, 0.4));  // top-left rectangle

    // Color them (Mondrian style)
    color = mix(color, vec3(1.0,0.0,0.0), r1);  // red
    color = mix(color, vec3(0.0,0.0,1.0), r2);  // blue
    color = mix(color, vec3(1.0,1.0,0.0), r3);  // yellow

    // Optional: black outlines
    float outlineThickness = 0.02;
    float o1 = rectOutline(st, vec2(0.0, 0.0), vec2(0.4, 0.6), outlineThickness);
    float o2 = rectOutline(st, vec2(0.4, 0.6), vec2(0.6, 0.4), outlineThickness);
    float o3 = rectOutline(st, vec2(0.0, 0.6), vec2(0.4, 0.4), outlineThickness);

    float outline = o1 + o2 + o3;
    color = mix(color, vec3(0.0), outline);  // black outline

    // -------------------------
    gl_FragColor = vec4(color, 1.0);
}