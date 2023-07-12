import * as THREE from 'three';
import { ShaderLib } from '../../Lib';

export const BaseShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                color : {type: 'vec3', value : new THREE.Color(0xfffff)},
            }
        ]
    ),
  
    vertexShader: /* glsl */`
        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["shadowmap_pars_vertex"]}
        ${THREE.ShaderChunk["fog_pars_vertex"]}


        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos; 
        varying vec3 vViewPosition;


        void main() {
            ${THREE.ShaderChunk["begin_vertex"]}
            ${THREE.ShaderChunk["beginnormal_vertex"]}
            ${THREE.ShaderChunk["defaultnormal_vertex"]}
            ${THREE.ShaderChunk["project_vertex"]}
            ${THREE.ShaderChunk["worldpos_vertex"]}

            vNormal = normalize(normalMatrix * normal);
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

        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["packing"]}
        ${THREE.ShaderChunk["fog_pars_fragment"]}
        ${THREE.ShaderChunk["bsdfs"]}
        ${THREE.ShaderChunk["lights_pars_begin"]}
        ${THREE.ShaderChunk["shadowmap_pars_fragment"]}
        ${THREE.ShaderChunk["shadowmask_pars_fragment"]}
        ${THREE.ShaderChunk["dithering_pars_fragment"]}

        uniform vec3 color;
    

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;
        ${ShaderLib.Simple2DNoise()}

        void main() {

        // circle mask
            float dist = distance(WSpos.xz, vec2(0.0));

            // dist = 1.0 - pow(dist * .55, 5.0);
            // dist += (snoise2d(OSpos * .3) / 2.5);

            dist = 1.0 - pow(dist * .55, 5.0);
            dist += (snoise2d(OSpos * 3.0) / 5.5);

            vec3 circleMask = vec3(dist);

            vec3 col = vec3(vUv.x, vUv.y, 0.0);

            vec3 finalDiffuse = mix(color, color - .1, 1.0-getShadowMask());

            gl_FragColor = vec4(finalDiffuse, round(circleMask));
            // gl_FragColor = vec4(round(circleMask), 1.0);

        }
    `
};
