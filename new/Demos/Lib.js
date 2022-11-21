class ShaderLib {
  static Simplex2DNoise() {
      //https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
      return `
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

          float snoise2d(vec2 v) {
              const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
              vec2 i  = floor(v + dot(v, C.yy) );
              vec2 x0 = v -   i + dot(i, C.xx);
              vec2 i1;
              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
              vec4 x12 = x0.xyxy + C.xxzz;
              x12.xy -= i1;
              i = mod(i, 289.0);
              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
              vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                  dot(x12.zw,x12.zw)), 0.0);
              m = m*m ;
              m = m*m ;
              vec3 x = 2.0 * fract(p * C.www) - 1.0;
              vec3 h = abs(x) - 0.5;
              vec3 ox = floor(x + 0.5);
              vec3 a0 = x - ox;
              m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
              vec3 g;
              g.x  = a0.x  * x0.x  + h.x  * x0.y;
              g.yz = a0.yz * x12.xz + h.yz * x12.yw;
              return 130.0 * dot(m, g);
          }
      `
  }

  static Orthoganal() {
    return `
    vec3 orthogonal(vec3 v) {
      return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
      : vec3(0.0, -v.z, v.y));
    }`
  }

  static Simplex3DNoise() {
      return `//	Simplex 3D Noise 
      //	by Ian McEwan, Ashima Arts
      //
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      
      float snoise3d(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;
      
      // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
      
        //  x0 = x0 - 0. + 0.0 * C 
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1. + 3.0 * C.xxx;
      
      // Permutations
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      
      // Gradients
      // ( N*N points uniformly over a square, mapped onto an octahedron.)
        float n_ = 1.0/7.0; // N=7
        vec3  ns = n_ * D.wyz - D.xzx;
      
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
      
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
      
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
      
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
      
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
      
      //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
      
      // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }`
  }

  static VoronoiNoise() {
    return `#define OCTAVES   		1		// 7
    

    
    vec2 hash( vec2 p ){
      p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
      return fract(sin(p)*43758.5453);
    }
    
    float voronoi( in vec2 x ){

      float t = 0.5;
    
      float function 			= mod(t,4.0);
      bool  multiply_by_F1	= mod(t,8.0)  >= 4.0;
      bool  inverse				= mod(t,16.0) >= 8.0;
      float distance_type	= mod(t/16.0,4.0);

      vec2 n = floor( x );
      vec2 f = fract( x );
      
      float F1 = 8.0;
      float F2 = 8.0;
      
      for( int j=-1; j<=1; j++ )
        for( int i=-1; i<=1; i++ ){
          vec2 g = vec2(i,j);
          vec2 o = hash( n + g );
    
          o = 0.5 + 0.41*sin( t + 6.2831*o );	
          vec2 r = g - f + o;
    
        float d = 	distance_type < 1.0 ? dot(r,r)  :				// euclidean^2
                distance_type < 2.0 ? sqrt(dot(r,r)) :			// euclidean
              distance_type < 3.0 ? abs(r.x) + abs(r.y) :		// manhattan
              distance_type < 4.0 ? max(abs(r.x), abs(r.y)) :	// chebyshev
              0.0;
    
        if( d<F1 ) { 
          F2 = F1; 
          F1 = d; 
        } else if( d<F2 ) {
          F2 = d;
        }
        }
      
      float c = function < 1.0 ? F1 : 
            function < 2.0 ? F2 : 
            function < 3.0 ? F2-F1 :
            function < 4.0 ? (F1+F2)/2.0 : 
            0.0;
        
      if( multiply_by_F1 )	c *= F1;
      if( inverse )			c = 1.0 - c;
      
        return c;
    }
    
    float fbm( in vec2 p ){
      float s = 0.0;
      float m = 0.0;
      float a = 0.5;
      
      for( int i=0; i<OCTAVES; i++ ){
        s += a * voronoi(p);
        m += a;
        a *= 0.5;
        p *= 2.0;
      }
      return s/m;
    }`
  }

  
  static farazzshaikhWater() {
    return `
    struct gln_tGerstnerWaveOpts {
      vec2 direction;   // Direction of the wave
      float steepness;  // Steepness/Sharpness of the peaks
      float wavelength; // Wavelength...self explnitory
  };
  vec3 gln_GerstnerWave(vec3 p, gln_tGerstnerWaveOpts opts, float time) {
    float steepness = opts.steepness;
    float wavelength = opts.wavelength;
  
    float k = 2.0 * PI / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(opts.direction);
    float f = k * (dot(d, p.xy) - c * time);
    float a = steepness / k;
  
    return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
    );
  }
  
    vec2 rotatev2(vec2 inputVector, float rot) {
      float x2 = (cos(rot) * inputVector.x) + (sin(rot) * inputVector.y);
      float y2 = (-sin(rot) * inputVector.x) + (cos(rot) * inputVector.y);
      return vec2(x2, y2);
    }
  
    vec3 displace(vec3 point, vec2 direction, float windSpeed) {
      
  
      vec3 p = point;
    
      p.y += uTime * 2.0;
  
      float rnoise = (snoise2d(p * .01  + (uTime/ 500.0)) / 500.0);
      direction += rnoise * windSpeed;
    
      gln_tGerstnerWaveOpts A = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, -0.4)), 0.4, 20.0 * windSpeed);
      gln_tGerstnerWaveOpts B = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, .03)), 0.3, 20.0);
      gln_tGerstnerWaveOpts C = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, -.02)), 0.4, 25.0 * windSpeed);
      gln_tGerstnerWaveOpts D = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, .15)), 0.6, 3.0);
      gln_tGerstnerWaveOpts E = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, .1)), 0.8, 9.5);
      gln_tGerstnerWaveOpts F = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, -.2)), 0.2, 4.0);
      gln_tGerstnerWaveOpts G = gln_tGerstnerWaveOpts(normalize(rotatev2(direction, -.1)), 0.4, 4.0);
  
  
    
  
      vec3 n = vec3(0.0);
  
      n += gln_GerstnerWave(p, A, uTime).xzy  + (snoise2d(p * .2  + (uTime/ 500.0)) / 9.0) * windSpeed;
      n += gln_GerstnerWave(p, B, uTime * .5).xzy * 0.5 * windSpeed;
      n += gln_GerstnerWave(p, C, uTime * 2.0).xzy * 0.25 + (snoise2d(p * .6 + (uTime/ 500.0)) / 25.0);
      n += gln_GerstnerWave(p, D, uTime * 1.6).xzy * 0.2 + (snoise2d(p * .2  + (uTime/ 500.0)) / 15.0);
      n += gln_GerstnerWave(p, E, uTime * 1.1).xzy * 0.1;
      n += gln_GerstnerWave(p, F, uTime * 1.1).xzy * 0.1;
      n += gln_GerstnerWave(p, G, uTime * 1.1).xzy * 0.1;
  
      // n += (snoise2d(p * .05 + uTime/50.0) * .5);
    
    
      return point + n;
    }  
    
    vec3 orthogonal(vec3 v) {
      return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
      : vec3(0.0, -v.z, v.y));
    }
    
    vec3 recalcNormals(vec3 newPos, vec2 directon, float windSpeed) {
      float offset = 0.1;
      vec3 tangent = orthogonal(normal);
      vec3 bitangent = normalize(cross(normal, tangent));
      vec3 neighbour1 = position + tangent * offset;
      vec3 neighbour2 = position + bitangent * offset;
    
      vec3 displacedNeighbour1 = displace(neighbour1, directon, windSpeed);
      vec3 displacedNeighbour2 = displace(neighbour2, directon, windSpeed);
    
      vec3 displacedTangent = displacedNeighbour1 - newPos;
      vec3 displacedBitangent = displacedNeighbour2 - newPos;
    
      return normalize(cross(displacedTangent, displacedBitangent));
    }`
  }

  static Simple2DNoise() {
    return `
    //
  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : stegu
  //     Lastmod : 20201014 (stegu)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise
  //               https://github.com/stegu/webgl-noise
  // 
  
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+10.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise2d(vec3 v)
    { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  
  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
  
  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
  
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  
  // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  
  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
  
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
  
    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
  
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
  
  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
  // Mix final noise value
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
    }
    `
  }
  
}