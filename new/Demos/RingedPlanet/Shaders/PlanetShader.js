const PlanetShader = {

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


            float noiseScale = 1.2;
            float noiseIntensity = .09;
            
            float offset = 0.1;
            vec3 tangent = orthogonal(normal);
            vec3 bitangent = normalize(cross(normal, tangent));
            vec3 neighbour1 = position + tangent * offset;
            vec3 neighbour2 = position + bitangent * offset;
            
            neighbour1 += noiseFunction(neighbour1, noiseIntensity, noiseScale) * normal;
            neighbour2 += noiseFunction(neighbour2, noiseIntensity, noiseScale) * normal;

            OSpos += noiseFunction(OSpos, noiseIntensity, noiseScale) * normal;

            vec3 displacedTangent = neighbour1 - OSpos;
            vec3 displacedBitangent = neighbour2 - OSpos;
          
            vNormal = normalize(cross(displacedTangent, displacedBitangent));
        
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

            float planetShadow = saturate(1.0 - pow(saturate(nDotL + .2) * 2.5, .8));
            vec3 col = mix(colora, mix(colora, vec3(1.0), .6), mountainMask);

            col = mix(col, colorDark2, saturate(1.0 - (planetShadow * 2.0)));

            // if(planetShadow < .5) {
            //     col = mix(colora, colorDark2, .7);
            // }
            // if(planetShadow < .25) {
            //     col = colorDark2;
            // }



            gl_FragColor = vec4(col,1.0);
        }
    `
};