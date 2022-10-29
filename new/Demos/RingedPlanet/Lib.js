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


  static triplanar() {
      return 
  }
}