
precision highp float;

#include <alphatest_pars_fragment>

void main() {
    vec4 diffuseColor = vec4(1.0, 0.0, 0.0, 1.0);

    #include <alphatest_fragment>

    gl_FragColor = diffuseColor;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
