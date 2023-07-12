import * as THREE from 'three';
import normalURL from '/rippleNormal.jpg'

export const WaterShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                waterColor : {type: 'vec3', value : new THREE.Color(0x9abfd6)},
                sceneAlbedo: { type: "sampler2D", value: new THREE.TextureLoader().load( normalURL ) },
                sceneRefractionMask: { type: "sampler2D", value: new THREE.TextureLoader().load( normalURL ) },
                sceneReflectionTexture: { type: "sampler2D", value: new THREE.TextureLoader().load( normalURL ) },

                rippleTex: { type: "sampler2D", value: new THREE.TextureLoader().load( normalURL ) },
                uTime : {type : 'float', value : 1.0},
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
        varying vec3 vViewPosition;


        varying vec2 viewportPixelCoord;
        varying vec3 ndc;


        void main() {
            ${THREE.ShaderChunk["begin_vertex"]}
            ${THREE.ShaderChunk["beginnormal_vertex"]}
            ${THREE.ShaderChunk["defaultnormal_vertex"]}
            ${THREE.ShaderChunk["project_vertex"]}
            ${THREE.ShaderChunk["worldpos_vertex"]}

            vNormal = normalize(normalMatrix * normal);
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

            ndc = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
            viewportPixelCoord = ndc.xy * 0.5 + 0.5; //ndc is -1 to 1 in GL. scale for 0 to 1

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

        uniform sampler2D rippleTex;
        uniform sampler2D sceneAlbedo;
        uniform sampler2D sceneRefractionMask;
        uniform sampler2D sceneReflectionTexture;
        uniform float uTime;

        uniform vec3 waterColor;

        varying vec3 vNormal;
        varying vec3 wNormal;

        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;

        uniform mat3 normalMatrix;
        varying vec2 viewportPixelCoord;
        varying vec3 ndc;


        float fresnel(vec3 normal, vec3 viewDir, float power) {
            return pow((1.0 - saturate(dot(normalize(normal), normalize(viewDir)))), power);
        }


        void main() {
            vec3 mappedNormal = 2.0 * (texture2D(rippleTex, fract(
                (vUv + vec2(0.0, -uTime / 42.0)) * 1.0
            )).rgb) - 1.0;

            vec3 lightDir = normalize(vec3(-20.0, 20.0, 0.0));
            float nDotL = max(0.0,dot(mappedNormal, lightDir));
            nDotL = saturate(min(nDotL, getShadowMask()) + .2);


            vec3 col = waterColor;



        // fresnel

        vec3 viewDirectionW = normalize(cameraPosition - WSpos);
        float fresnelTerm = dot(viewDirectionW, wNormal);
        fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
        float fresexpon = 2.0;
        float fresdiv = 1.2;
        fresnelTerm = pow(((fresnelTerm)/fresdiv), fresexpon);




        //apply refraction 
            float IOR = .025;
            IOR *= length(mappedNormal.rg); // only refract when non up normal frag moves


            vec3 V = normalize(cameraPosition - WSpos);
            vec3 vsN = mappedNormal;
            vsN = normalize(vsN);


            vec2 refractedUV = mix(viewportPixelCoord, vsN.xy, IOR);

            float refractionMask = texture2D( sceneRefractionMask, refractedUV ).r;
            

            if(refractionMask <= 0.0) {
                refractedUV = viewportPixelCoord;
            }
            
            vec4 refractedDiffuse = texture2D( sceneAlbedo, refractedUV ).rgba;
            vec4 reflectionDiffuse = texture2D( sceneReflectionTexture, refractedUV ).rgba;

            refractedDiffuse.rgb = mix(refractedDiffuse.rgb, vec3(1.0), 1.0 - refractedDiffuse.a);
            vec3 diffuse = mix(refractedDiffuse.rgb, waterColor, .5);



            diffuse = mix(diffuse, reflectionDiffuse.rgb, reflectionDiffuse.a * fresnelTerm);


            gl_FragColor = vec4(diffuse, refractedDiffuse.a);

        }
    `
};



/*
// refractedDiffuse.a = refractionMask;
// gl_FragColor = vec4(vec3(length(mappedNormal.rg)), 1.0);
// gl_FragColor = vec4(vec3(mix(refractedDiffuse.rgb, col, .5)), refractedDiffuse.a);
*/