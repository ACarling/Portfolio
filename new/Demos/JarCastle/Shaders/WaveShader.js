const WaveShader = {

    uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.shadowmap,
            THREE.UniformsLib.fog,
            {
                colorShallow : {type: 'vec3', value : new THREE.Color(0x3d9c94)},
                colorDeep : { type: 'vec3', value : new THREE.Color(0x1c8583)}, // 0x1c8583
                specularCol : { type: 'vec3', value : new THREE.Color(0x469c90)},
                tDiffuse: { value: null },
                tDepth: { value: null },    
                uTime : {type : 'float', value : 1.0},
                windDirection : {type : "vec2", value : new THREE.Vector2(0, 1)},
                windSpeed : {type : "float", value : 1.8} // between 0 and 2
    
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

        varying vec4 screenCoord;

        varying vec2 viewportPixelCoord;
        varying vec3 ndc;

        uniform float uTime;
        uniform vec2 windDirection;
        uniform float windSpeed;

        ${ShaderLib.Simple2DNoise()}
        ${ShaderLib.farazzshaikhWater()}

        void main() {
            ${THREE.ShaderChunk["begin_vertex"]}
            ${THREE.ShaderChunk["beginnormal_vertex"]}
            ${THREE.ShaderChunk["defaultnormal_vertex"]}
            ${THREE.ShaderChunk["project_vertex"]}
            ${THREE.ShaderChunk["worldpos_vertex"]}

            OSpos = displace(position, windDirection, windSpeed);
            vNormal = recalcNormals(OSpos, windDirection, windSpeed);            
            vUv = uv;
            vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;


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

        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform vec3 colorDeep;
        uniform vec3 colorShallow;
        uniform vec3 specularCol;
    
        
        varying vec3 OSpos;
        varying vec3 WSpos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        varying vec2 viewportPixelCoord;
        varying vec3 ndc;

        uniform mat3 normalMatrix;
        uniform mat4 projectionMatrix;

        ${ShaderLib.Simple2DNoise()}
        void main() {
            vec3 ld = vec3( 10.0, 5.0, 6.0 ) * 50.0;
            ld = ld.xyz;


        //foam
            float foam = OSpos.z + snoise2d(OSpos * .3);
            foam += snoise2d(OSpos * 1.6) / 2.0;
            // foam += snoise2d(OSpos * 3.2) / 4.0;
            float foamMask = round((mix(0.0, 1.0, foam)) / 3.0);
            foamMask = clamp(foamMask, 0.0, 1.0);



        // specular
            vec3 N = vNormal.xzy;

            vec3 L = normalize(ld);
            vec3 R = 2.0 * dot(N,L) * N - L;
            vec3 V = normalize(cameraPosition - WSpos);
            

            float specular = clamp(dot(V,R), 0.0, 1.0);
            specular = pow(specular, 15.0);
            float specularPoints = round(pow(specular, 300.0) * 1000.0);



        // fake subsurface
            float lightMask = (1.0 - dot(N, L)) * .2;
            lightMask += (1.0 - dot(normalize(N), -L)) * .5;

            lightMask = pow(lightMask, 15.0);


        // circle mask
            float dist = distance(WSpos.xz, vec2(0.0));
            dist = 1.0 - pow(dist * .013, 12.0);
            
            vec3 circleMask = vec3(dist);


        // refraction
            // vec3 vsN = normalMatrix * N * 0.5 + 0.5;
            // vsN = normalize(vsN);
            
            // vec3 refractedUV = refract(V, vsN, 1.0);
            // vec3 refractedDiffuse = texture2D( tDiffuse, mix(viewportPixelCoord, vsN.xy, 0.05) ).rgb;



        // finalise

            vec3 col = mix(colorDeep, colorShallow, OSpos.z + round(lightMask * 1.3));
            col = mix(col, specularCol, lightMask);
            col = mix(col, vec3(0.8), foamMask);


            specular = 0.0;//round(specular);
            specularPoints *= 1.0 - foamMask;
            specular *= 1.0 - foamMask;

            col = mix(col, specularCol, specular);
            col = mix(col, vec3(1.0, .9, .8), round(specularPoints));

            float alpha = clamp(.85 + specular + foamMask, 0.0, 1.0);
            // col = mix(refractedDiffuse, col, alpha);

            gl_FragColor = vec4(col, circleMask * alpha);

        }
    `
};