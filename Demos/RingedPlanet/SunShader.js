

class SunShader {

    static sunMaterial;



    static vertexProgram() {
        return `
            uniform float u_time;
            uniform vec3 ambientLightColor;

            varying vec3 OSpos; 
            varying vec3 WSpos;
            varying vec3 vNormal;
            varying vec2 vertexUV;

            varying float sTime;
            varying float snoisescale;
            varying float oct;

            varying float vTime;
            varying float Vscale;

            ${ShaderLib.Simplex3DNoise()}
            ${ShaderLib.VoronoiNoise()}


            void main() {


                vertexUV = uv;
                vNormal = normal;
                OSpos = position;


                // simplex varyings
                sTime = u_time / 200.0;
                snoisescale = 2.0;
                oct = 5.0;

                // voronoi varyings 
                vTime = u_time/600.0;
                Vscale = 1.5;


                // simplex noise octaves
                float snoiseOct = 0.0;
                for(int i = 1; i < int(oct)+1; i++) {
                    float octScale = snoisescale * (float(i)/2.0);
                    vec3 op = vec3((octScale*OSpos.x) + sTime, (octScale*OSpos.y) + sTime, (octScale*OSpos.z) + sTime);
                    snoiseOct += snoise3d(op)/float(i*2);
                }

                // voronoi in 3 dimentions
                float v1 = voronoi(vec2((OSpos.x*Vscale)+(vTime), (OSpos.y*Vscale)+(vTime)));
                float v2 = voronoi(vec2((-OSpos.x*Vscale)+(vTime), (OSpos.z*Vscale)+(vTime)));

                float spotMask = 1.0 - max(0.0, min(1.0, pow((v1+v2)+.3, 2.0)   ));
                float sunHeight = min(1.0, (snoiseOct + .1)*2.0 + spotMask);


                OSpos = OSpos + (sunHeight * normal) * .02;

                WSpos = (modelMatrix * vec4(position, 1.0)).xyz;


                gl_Position = projectionMatrix * modelViewMatrix * vec4(OSpos,1.0);
            }
        `;
    } 

    static fragmentProgram() {
        return `

            uniform vec3 sunColor;
            uniform float u_time;

    
            ${ShaderLib.Simplex3DNoise()}
            ${ShaderLib.VoronoiNoise()}


            varying vec3 OSpos; 
            varying vec3 WSpos;
            varying vec3 vNormal;
            varying vec2 vertexUV;

            varying float sTime;
            varying float snoisescale;
            varying float oct;

            varying float vTime;
            varying float Vscale;


            void main() {
                vec3 sunCollorLow = vec3(1, 0.784, .458);
                vec3 sunCollorHeigh = vec3(1, 0.878, 0.612);
                // simplex noise time

                // simplex noise octaves
                float snoiseOct = 0.0;
                for(int i = 1; i < int(oct)+1; i++) {
                    float octScale = snoisescale * (float(i)/2.0);
                    vec3 op = vec3((octScale*OSpos.x) + sTime, (octScale*OSpos.y) + sTime, (octScale*OSpos.z) + sTime);
                    snoiseOct += snoise3d(op)/float(i*2);
                }

                // voronoi in 3 dimentions
                float v1 = voronoi(vec2((OSpos.x*Vscale)+(vTime), (OSpos.y*Vscale)+(vTime)));
                float v2 = voronoi(vec2((-OSpos.x*Vscale)+(vTime), (OSpos.z*Vscale)+(vTime)));

                float spotMask = 1.0 - max(0.0, min(1.0, pow((v1+v2)+.3, 2.0)   ));
                float sunHeight = min(1.0, (snoiseOct + .1)*2.0 + spotMask);


                float bias = -.65;
                float scale = 1.5;
                float power = 1.0;
                vec3 l = normalize(WSpos - cameraPosition);

                float fresnel = max(0.0, min(1.0, bias + scale * pow( (1.0 + dot(l, vNormal)), power ) ));

                vec4 fEffect = vec4(fresnel,fresnel,fresnel, 1.0) * .3;
                gl_FragColor = vec4(mix(sunCollorLow, sunCollorHeigh, sunHeight), 1.0) + fEffect;

            }
        `;
    } 


    static getSunMaterial(lightColor) {
        let uniforms = 
                {
                    sunColor: {type: 'sunColor', value: new THREE.Color(lightColor)},
                    u_time: { value: 0.0 }
                }

        if(!SunShader.sunMaterial) {
            SunShader.sunMaterial = new THREE.ShaderMaterial({
                uniforms : uniforms,
                vertexShader : SunShader.vertexProgram(),
                fragmentShader : SunShader.fragmentProgram()
                // wireframe : true
            });
            SunShader.sunMaterial.flatShading = true;
            return SunShader.sunMaterial;
        } else {
            return SunShader.sunMaterial;
        }
    }


}