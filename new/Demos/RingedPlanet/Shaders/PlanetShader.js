const PlanetShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                colora: {type: 'vec3', value: new THREE.Color(palletPlanetColoura)},
                colorb: {type: 'vec3', value: new THREE.Color(palletPlanetColourb)},

                colorDark: {type: 'vec3', value: new THREE.Color(palletBackground)},
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

        uniform float ambientLightIntensity;
        uniform float time;
        uniform vec3 colorDark;

        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["packing"]}
        ${THREE.ShaderChunk["fog_pars_fragment"]}
        ${THREE.ShaderChunk["bsdfs"]}
        ${THREE.ShaderChunk["lights_pars_begin"]}
        ${THREE.ShaderChunk["shadowmap_pars_fragment"]}
        ${THREE.ShaderChunk["shadowmask_pars_fragment"]}
        ${THREE.ShaderChunk["dithering_pars_fragment"]}

        ${ShaderLib.Simplex3DNoise()}

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos; 


        void main() {
            
            DirectionalLight light = directionalLights[0];
            vec3 lightDir = normalize(light.direction);
            float nDotL = max(0.0,dot(vNormal, lightDir));



            float noise = snoise3d((vec3(WSpos.x, WSpos.y, WSpos.z) / .3));

            // vec3 col = mix(colora, colorb, noise);

            float ringShadowMask = round(1.0 - abs(OSpos.y * 2.8 + (noise / 3.0)));

            float planetShadow = round((1.0-nDotL) / 1.9);
            float shadowMask = planetShadow; //max(planetShadow, ringShadowMask);

            vec3 finalDiffuse = mix(colora, colorDark, shadowMask);

            // finalDiffuse = vec3(ringShadowMask);

            gl_FragColor = vec4(finalDiffuse,1.0);
        }
    `
};