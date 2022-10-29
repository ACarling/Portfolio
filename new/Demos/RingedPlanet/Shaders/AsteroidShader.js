const AsteroidShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                color: {type: 'vec3', value: new THREE.Color(palletFieldColour)},
                colorDark: {type: 'vec3', value: new THREE.Color(palletBackground)},
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
        uniform vec3 color;
        uniform vec3 colorDark;

        ${THREE.ShaderChunk["common"]}
        ${THREE.ShaderChunk["packing"]}
        ${THREE.ShaderChunk["fog_pars_fragment"]}
        ${THREE.ShaderChunk["bsdfs"]}
        ${THREE.ShaderChunk["lights_pars_begin"]}
        ${THREE.ShaderChunk["shadowmap_pars_fragment"]}
        ${THREE.ShaderChunk["shadowmask_pars_fragment"]}
        ${THREE.ShaderChunk["dithering_pars_fragment"]}

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 WSpos;
        varying vec3 OSpos;

        void main() {
            
            DirectionalLight light = directionalLights[0];
            vec3 lightDir = normalize(light.direction);
            float NdotL = max(0.0,dot(vNormal, lightDir));


            // vec3 finalDiffuse = mix(color, colorDark, 1.0-NdotL);
            vec3 finalDiffuse = mix(color, colorDark, (1.0-getShadowMask()));


            gl_FragColor = vec4(finalDiffuse,(getShadowMask()));
        }
    `
};