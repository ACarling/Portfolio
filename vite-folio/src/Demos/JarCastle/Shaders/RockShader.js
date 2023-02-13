import * as THREE from 'three';
import { ShaderLib } from '../../Lib';

export const RockShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                colora : {type: 'vec3', value : new THREE.Color(0x307843)},
                colorb : {type: 'vec3', value : new THREE.Color(0x307843)},
                shadowBias: {type: 'float', value: .005},
                lightPosition: {type: 'vec3', value: new THREE.Vector3(0,0,0)},
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

        uniform vec3 colora;
        uniform vec3 colorb;
        uniform vec3 lightPosition;
        uniform float shadowBias;


        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;
        ${ShaderLib.Simple2DNoise()}

        void main() {


            float NdotL = dot(vNormal, directionalLights[0].direction);
            float shadowMask = clamp(0.0, 1.0, min(getShadowMask(), NdotL));

            vec3 finalDiffuse = mix(colora, colorb, vUv.y);
            finalDiffuse = mix(finalDiffuse - .2, finalDiffuse,  shadowMask);
            
            gl_FragColor = vec4(finalDiffuse, 1.0);

        }
    `
};