const WaterShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                colora: {type: 'vec3', value: new THREE.Color(palletWaterShallow)},
                colorb: {type: 'vec3', value: new THREE.Color(palletWaterDeep)},

                colorDark: {type: 'vec3', value: new THREE.Color(palletDark)},
                colorDark2: {type: 'vec3', value: new THREE.Color(palletDarkmod)},
                ambientLightIntensity: {type: 'float', value: 0},
                time: {type: 'float', value: 1},
                cameraNear: {type: 'float', value: 1},
                cameraFar: {type: 'float', value: 1},
                tDepth: {type: 'sampler2D', value: null},
                tDiffuse: {type: 'sampler2D',value: null},

            }
        ]
    ),
  
    vertexShader: /* glsl */`
        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["shadowmap_pars_vertex"]}


        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;
        varying vec2 viewportPixelCoord;

        
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

            vec3 ndc = gl_Position.xyz / gl_Position.w; //perspective divide/normalize
            viewportPixelCoord = ndc.xy * 0.5 + 0.5; //ndc is -1 to 1 in GL. scale for 0 to 1

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
        uniform sampler2D tDepth;
        uniform sampler2D tDiffuse;

        uniform float cameraNear;
        uniform float cameraFar;

        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["packing"]}
        ${THREE.ShaderChunk["bsdfs"]}
        ${THREE.ShaderChunk["lights_pars_begin"]}
        ${THREE.ShaderChunk["shadowmap_pars_fragment"]}
        ${THREE.ShaderChunk["shadowmask_pars_fragment"]}
        ${THREE.ShaderChunk["dithering_pars_fragment"]}

        ${ShaderLib.Simplex2DNoise()}

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos; 
        varying vec2 viewportPixelCoord;

        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }


        void main() {
            
            // DirectionalLight light = directionalLights[0];
            // vec3 lightDir = normalize(light.direction);
            // float nDotL = max(0.0,dot(-vNormal, lightDir));

            float depth = readDepth( tDepth, vUv);
            vec3 diffuse = texture2D( tDiffuse, viewportPixelCoord ).rgb;


            // depth = (1.0 - pow(depth, 150.0)) * 2.0;
            depth = (1.0 - pow(depth, 3.0)) * 1.8;
            

            // waveMask = round(sin((waveMask + (time * waveSpeed)) * 25.1327));
            // waveMask += (waveModNoise * (1.0 - pow(OldHeight,.1))) * 2.0;



            

            gl_FragColor = vec4(vec3(1.0),(1.0));
        }
    `
};