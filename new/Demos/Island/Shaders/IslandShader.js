const IslandShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                colora: {type: 'vec3', value: new THREE.Color(palletHero)},
                colorb: {type: 'vec3', value: new THREE.Color(palletDarkmod)},

                colorDark: {type: 'vec3', value: new THREE.Color(palletDark)},
                colorDark2: {type: 'vec3', value: new THREE.Color(palletDarkmod)},
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
        
        ${ShaderLib.Simplex3DNoise()}
        ${ShaderLib.Orthoganal()}

        float noiseFunction(vec3 pos, float noiseIntensity, float noiseScale) {
            return snoise3d(pos * noiseScale) * noiseIntensity;
        }


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
        uniform vec3 colorDark2;

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
            float nDotL = max(0.0,dot(-vNormal, lightDir));



            float noise = snoise3d((vec3(WSpos.x, WSpos.y, WSpos.z) / .3));



            float mountainMask = saturate(pow(distance(WSpos, vec3(0,0,0)) / 2.0, 40.0) * 25.0);

            float shadow = 1.0 - nDotL;
            vec3 col = mix(colora, mix(colora, vec3(1.0), .6), shadow);

            float alpha = round(OSpos.z * 20.0);
            // col = vec3(getShadowMask());

            gl_FragColor = vec4(col,alpha);
        }
    `
};