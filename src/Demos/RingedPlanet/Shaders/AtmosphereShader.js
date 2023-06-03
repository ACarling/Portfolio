import * as THREE from 'three';
import { ShaderLib } from '../../Lib';
import imgUrl from '/noise.png'

export const AtmosphereShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                cloudTex: { type: "sampler2D", value: new THREE.TextureLoader().load( imgUrl ) },
                planetRotation: {type: 'float', value: 1.8},
                
                colora: {type: 'vec3', value: new THREE.Color(window.palletHero)},
                colorb: {type: 'vec3', value: new THREE.Color(window.palletDarkmod)},

                colorDark: {type: 'vec3', value: new THREE.Color(window.palletDark)},
                colorDark2: {type: 'vec3', value: new THREE.Color(window.palletDarkmod)},
                ambientLightIntensity: {type: 'float', value: 0},
                time: {type: 'float', value: 1}
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
        
        ${ShaderLib.Simplex3DNoise()}
        ${ShaderLib.Orthoganal()}

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
        uniform vec3 colora;
        uniform vec3 colorb;

        uniform vec3 planetPosition;
        uniform float planetRadius;

        uniform float ambientLightIntensity;
        uniform float time;
        uniform vec3 colorDark;
        uniform vec3 colorDark2;

        uniform sampler2D cloudTex;
        uniform float planetRotation;

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


        vec2 rotateUV(vec2 uv, float rotation)
        {
            float mid = 0.5;
            return vec2(
                cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
                cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
            );
        }
        

        void main() {
            


            // fresnel
            vec3 viewDirectionW = normalize(cameraPosition - WSpos);
            float fresnelTerm = dot(viewDirectionW, wNormal);
            fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
            float fresexpon = 2.0;
            float fresdiv = 1.2;
            fresnelTerm = pow(((fresnelTerm)/fresdiv), fresexpon);

            // lighting w+wrap
            DirectionalLight light = directionalLights[0];
            vec3 lightDir = normalize(light.direction);
            float nDotL = max(0.0,dot(-wNormal, lightDir));

            float lightexpon = 4.0;
            float lightdiv = 1.2;
            float transparency = pow(((1.0-nDotL)/lightdiv), lightexpon);

            transparency -= fresnelTerm;

            vec3 col = mix(colora, colorb, transparency);


            float cloudMask = pow(texture2D(cloudTex, vUv).r, 4.0) * 2.0;
            cloudMask *= pow(1.0-nDotL, 4.0);

            col = mix(col, vec3(.9), cloudMask);
            transparency = mix(transparency, 1.0, cloudMask);

            // gl_FragColor = vec4(vec3(), 1.0);
            gl_FragColor = vec4(col,transparency);
        }
    `
};