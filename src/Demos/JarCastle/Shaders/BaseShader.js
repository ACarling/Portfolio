import * as THREE from 'three';
import { ShaderLib } from '../../Lib';
import paintURL from '/robot_paint.png'
import baseURL from '/robot_base.png'

export const BaseShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                paintTex: { type: "sampler2D", value: new THREE.TextureLoader().load( paintURL ) },
                baseTex: { type: "sampler2D", value: new THREE.TextureLoader().load( baseURL ) },
                
                paintColor : {type: 'vec3', value: new THREE.Color(window.palletHero)},
                rustColor : {type: 'vec3', value: new THREE.Color(0xffffff)},
                warningColor : {type: 'vec3', value: new THREE.Color(window.palletDarkmod)},

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
        varying vec3 vViewPosition;


        void main() {
            ${THREE.ShaderChunk["begin_vertex"]}
            ${THREE.ShaderChunk["beginnormal_vertex"]}
            ${THREE.ShaderChunk["defaultnormal_vertex"]}
            ${THREE.ShaderChunk["project_vertex"]}
            ${THREE.ShaderChunk["worldpos_vertex"]}

            vNormal = normalize(normalMatrix * normal);
            wNormal = vec3(modelMatrix * vec4(normal, 0.0));
            WSpos = position;
            vUv = uv;

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
      


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

        uniform sampler2D paintTex;
        uniform sampler2D baseTex;

        uniform vec3 paintColor;
        uniform vec3 rustColor;
        uniform vec3 warningColor;

        varying vec3 vNormal;
        varying vec3 wNormal;
        varying vec2 vUv;
        varying vec3 WSpos;

        void main() {

            vec3 lightDir = normalize(vec3(-20.0, 20.0, 0.0));
            float nDotL = max(0.0,dot(wNormal, lightDir));


            vec3 paint = mix(paintColor, vec3(1.0), texture2D(paintTex, vUv).r);

            vec3 col = mix(texture2D(baseTex, vUv).rgb, warningColor, texture2D(paintTex, vUv).r);
            col = mix(col, paintColor, texture2D(paintTex, vUv).g);
            col = mix(col, rustColor, texture2D(paintTex, vUv).b);

            col = mix(warningColor, col, saturate(min(nDotL, getShadowMask()) + .2));

            // gl_FragColor = vec4(vec3(1.0-getShadowMask()), 1.0);
            gl_FragColor = vec4(col, 1.0);
        }
    `
};