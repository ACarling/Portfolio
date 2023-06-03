import * as THREE from 'three';

export const AsteroidShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                color: {type: 'vec3', value: new THREE.Color(window.palletFieldColour)},
                colorDark: {type: 'vec3', value: new THREE.Color(window.palletDark)},
                colorDark2: {type: 'vec3', value: new THREE.Color(window.palletDarkmod)},
            }
        ]
    ),
  
    vertexShader: /* glsl */`
        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["shadowmap_pars_vertex"]}
        ${THREE.ShaderChunk["fog_pars_vertex"]}


        varying vec3 vNormal;
        varying vec3 wNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos; 

        void main() {
            ${THREE.ShaderChunk["begin_vertex"]}
            ${THREE.ShaderChunk["beginnormal_vertex"]}
            ${THREE.ShaderChunk["defaultnormal_vertex"]}
            ${THREE.ShaderChunk["project_vertex"]}
            ${THREE.ShaderChunk["worldpos_vertex"]}

            vNormal = normal;
            wNormal = vec3(modelMatrix * vec4(normal, 0.0));

            OSpos = position;
            vUv = uv;

            #ifdef USE_INSTANCING
                WSpos = (instanceMatrix * modelMatrix * vec4(OSpos, 1.0)).xyz;
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(OSpos, 1.0);
            #else
                WSpos = (modelMatrix * vec4(OSpos, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(OSpos,1.0);
            #endif

            ${THREE.ShaderChunk["shadowmap_vertex"]}
        }
    `,
    
    fragmentShader: /* glsl */`
        uniform vec3 color;
        uniform vec3 colorDark;
        uniform vec3 colorDark2;

        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["packing"]}
        ${THREE.ShaderChunk["fog_pars_fragment"]}
        ${THREE.ShaderChunk["bsdfs"]}
        ${THREE.ShaderChunk["lights_pars_begin"]}
        ${THREE.ShaderChunk["shadowmap_pars_fragment"]}
        ${THREE.ShaderChunk["shadowmask_pars_fragment"]}
        ${THREE.ShaderChunk["dithering_pars_fragment"]}

        varying vec3 vNormal;
        varying vec3 wNormal;

        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;

        void main() {
            
            float NdotL = dot(wNormal, directionalLights[0].direction);
            NdotL = saturate(NdotL * 2.0);

            // vec3 finalDiffuse = mix(color, colorDark, 1.0-NdotL);
            vec3 finalDiffuse = mix(color, colorDark2, round(1.0-getShadowMask()));
            // vec3 finalDiffuse = mix(color, colorDark2, saturate(round(max(1.0-getShadowMask(), 1.0-NdotL))) );

            gl_FragColor = vec4(finalDiffuse,1.0);
        }
    `
};