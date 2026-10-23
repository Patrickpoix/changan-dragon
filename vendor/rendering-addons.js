/* Official Three.js 0.160.1 addons, MIT. See rendering-addons-LICENSE.txt. Uses the existing global THREE; no second engine. */
var ChanganRenderingAddons=(()=>{var Qe=Object.defineProperty;var Kr=Object.getOwnPropertyDescriptor;var Xr=Object.getOwnPropertyNames;var qr=Object.prototype.hasOwnProperty;var Qr=(u,e)=>{for(var t in e)Qe(u,t,{get:e[t],enumerable:!0})},Yr=(u,e,t,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Xr(e))!qr.call(u,r)&&r!==t&&Qe(u,r,{get:()=>e[r],enumerable:!(o=Kr(e,r))||o.enumerable});return u};var Zr=u=>Yr(Qe({},"__esModule",{value:!0}),u);var fo={};Qr(fo,{EffectComposer:()=>Oe,FXAAShader:()=>Ur,GLTFLoader:()=>We,OutputPass:()=>Ve,RGBELoader:()=>Xe,RenderPass:()=>ke,RoomEnvironment:()=>ze,SAOPass:()=>ve,ShaderPass:()=>he,UnrealBloomPass:()=>pe,Water:()=>je,cloneSkeleton:()=>jr});var Vt=globalThis.THREE.ACESFilmicToneMapping,Ye=globalThis.THREE.AddEquation,go=globalThis.THREE.AddOperation,To=globalThis.THREE.AdditiveAnimationBlendMode,zt=globalThis.THREE.AdditiveBlending,jt=globalThis.THREE.AgXToneMapping,Eo=globalThis.THREE.AlphaFormat,xo=globalThis.THREE.AlwaysCompare,Ro=globalThis.THREE.AlwaysDepth,bo=globalThis.THREE.AlwaysStencilFunc,Ao=globalThis.THREE.AmbientLight,So=globalThis.THREE.AnimationAction,Ze=globalThis.THREE.AnimationClip,vo=globalThis.THREE.AnimationLoader,$r=globalThis.THREE.AnimationMixer,Mo=globalThis.THREE.AnimationObjectGroup,Co=globalThis.THREE.AnimationUtils,_o=globalThis.THREE.ArcCurve,yo=globalThis.THREE.ArrayCamera,Ho=globalThis.THREE.ArrowHelper,wo=globalThis.THREE.AttachedBindMode,Bo=globalThis.THREE.Audio,Do=globalThis.THREE.AudioAnalyser,Lo=globalThis.THREE.AudioContext,No=globalThis.THREE.AudioListener,Fo=globalThis.THREE.AudioLoader,Io=globalThis.THREE.AxesHelper,Wt=globalThis.THREE.BackSide,Po=globalThis.THREE.BasicDepthPacking,Uo=globalThis.THREE.BasicShadowMap,Go=globalThis.THREE.BatchedMesh,Kt=globalThis.THREE.Bone,Oo=globalThis.THREE.BooleanKeyframeTrack,ko=globalThis.THREE.Box2,Xt=globalThis.THREE.Box3,Vo=globalThis.THREE.Box3Helper,qt=globalThis.THREE.BoxGeometry,zo=globalThis.THREE.BoxHelper,me=globalThis.THREE.BufferAttribute,ge=globalThis.THREE.BufferGeometry,jo=globalThis.THREE.BufferGeometryLoader,Wo=globalThis.THREE.ByteType,Ko=globalThis.THREE.Cache,Xo=globalThis.THREE.Camera,qo=globalThis.THREE.CameraHelper,Qo=globalThis.THREE.CanvasTexture,Yo=globalThis.THREE.CapsuleGeometry,Zo=globalThis.THREE.CatmullRomCurve3,Qt=globalThis.THREE.CineonToneMapping,$o=globalThis.THREE.CircleGeometry,Yt=globalThis.THREE.ClampToEdgeWrapping,Zt=globalThis.THREE.Clock,N=globalThis.THREE.Color,Jo=globalThis.THREE.ColorKeyframeTrack,Te=globalThis.THREE.ColorManagement,es=globalThis.THREE.CompressedArrayTexture,ts=globalThis.THREE.CompressedCubeTexture,rs=globalThis.THREE.CompressedTexture,os=globalThis.THREE.CompressedTextureLoader,ss=globalThis.THREE.ConeGeometry,is=globalThis.THREE.ConstantAlphaFactor,ns=globalThis.THREE.ConstantColorFactor,as=globalThis.THREE.CubeCamera,ls=globalThis.THREE.CubeReflectionMapping,cs=globalThis.THREE.CubeRefractionMapping,us=globalThis.THREE.CubeTexture,hs=globalThis.THREE.CubeTextureLoader,ps=globalThis.THREE.CubeUVReflectionMapping,fs=globalThis.THREE.CubicBezierCurve,ds=globalThis.THREE.CubicBezierCurve3,ms=globalThis.THREE.CubicInterpolant,gs=globalThis.THREE.CullFaceBack,Ts=globalThis.THREE.CullFaceFront,Es=globalThis.THREE.CullFaceFrontBack,xs=globalThis.THREE.CullFaceNone,Rs=globalThis.THREE.Curve,bs=globalThis.THREE.CurvePath,$e=globalThis.THREE.CustomBlending,As=globalThis.THREE.CustomToneMapping,Ss=globalThis.THREE.CylinderGeometry,vs=globalThis.THREE.Cylindrical,Ms=globalThis.THREE.Data3DTexture,Cs=globalThis.THREE.DataArrayTexture,_s=globalThis.THREE.DataTexture,$t=globalThis.THREE.DataTextureLoader,Ee=globalThis.THREE.DataUtils,ys=globalThis.THREE.DecrementStencilOp,Hs=globalThis.THREE.DecrementWrapStencilOp,ws=globalThis.THREE.DefaultLoadingManager,Bs=globalThis.THREE.DepthFormat,Jt=globalThis.THREE.DepthStencilFormat,er=globalThis.THREE.DepthTexture,Ds=globalThis.THREE.DetachedBindMode,tr=globalThis.THREE.DirectionalLight,Ls=globalThis.THREE.DirectionalLightHelper,Ns=globalThis.THREE.DiscreteInterpolant,Fs=globalThis.THREE.DisplayP3ColorSpace,Is=globalThis.THREE.DodecahedronGeometry,rr=globalThis.THREE.DoubleSide,or=globalThis.THREE.DstAlphaFactor,sr=globalThis.THREE.DstColorFactor,Ps=globalThis.THREE.DynamicCopyUsage,Us=globalThis.THREE.DynamicDrawUsage,Gs=globalThis.THREE.DynamicReadUsage,Os=globalThis.THREE.EdgesGeometry,ks=globalThis.THREE.EllipseCurve,Vs=globalThis.THREE.EqualCompare,zs=globalThis.THREE.EqualDepth,js=globalThis.THREE.EqualStencilFunc,Ws=globalThis.THREE.EquirectangularReflectionMapping,Ks=globalThis.THREE.EquirectangularRefractionMapping,Xs=globalThis.THREE.Euler,qs=globalThis.THREE.EventDispatcher,Qs=globalThis.THREE.ExtrudeGeometry,Je=globalThis.THREE.FileLoader,Ys=globalThis.THREE.Float16BufferAttribute,Ce=globalThis.THREE.Float32BufferAttribute,Zs=globalThis.THREE.Float64BufferAttribute,_e=globalThis.THREE.FloatType,$s=globalThis.THREE.Fog,Js=globalThis.THREE.FogExp2,ei=globalThis.THREE.FramebufferTexture,ye=globalThis.THREE.FrontSide,ti=globalThis.THREE.Frustum,ri=globalThis.THREE.GLBufferAttribute,oi=globalThis.THREE.GLSL1,si=globalThis.THREE.GLSL3,ii=globalThis.THREE.GreaterCompare,ni=globalThis.THREE.GreaterDepth,ai=globalThis.THREE.GreaterEqualCompare,li=globalThis.THREE.GreaterEqualDepth,ci=globalThis.THREE.GreaterEqualStencilFunc,ui=globalThis.THREE.GreaterStencilFunc,hi=globalThis.THREE.GridHelper,He=globalThis.THREE.Group,V=globalThis.THREE.HalfFloatType,pi=globalThis.THREE.HemisphereLight,fi=globalThis.THREE.HemisphereLightHelper,di=globalThis.THREE.IcosahedronGeometry,ir=globalThis.THREE.ImageBitmapLoader,mi=globalThis.THREE.ImageLoader,gi=globalThis.THREE.ImageUtils,Ti=globalThis.THREE.IncrementStencilOp,Ei=globalThis.THREE.IncrementWrapStencilOp,et=globalThis.THREE.InstancedBufferAttribute,xi=globalThis.THREE.InstancedBufferGeometry,Ri=globalThis.THREE.InstancedInterleavedBuffer,nr=globalThis.THREE.InstancedMesh,bi=globalThis.THREE.Int16BufferAttribute,Ai=globalThis.THREE.Int32BufferAttribute,Si=globalThis.THREE.Int8BufferAttribute,vi=globalThis.THREE.IntType,tt=globalThis.THREE.InterleavedBuffer,rt=globalThis.THREE.InterleavedBufferAttribute,ar=globalThis.THREE.Interpolant,lr=globalThis.THREE.InterpolateDiscrete,ot=globalThis.THREE.InterpolateLinear,Mi=globalThis.THREE.InterpolateSmooth,Ci=globalThis.THREE.InvertStencilOp,_i=globalThis.THREE.KeepStencilOp,yi=globalThis.THREE.KeyframeTrack,Hi=globalThis.THREE.LOD,wi=globalThis.THREE.LatheGeometry,Bi=globalThis.THREE.Layers,Di=globalThis.THREE.LessCompare,Li=globalThis.THREE.LessDepth,Ni=globalThis.THREE.LessEqualCompare,Fi=globalThis.THREE.LessEqualDepth,Ii=globalThis.THREE.LessEqualStencilFunc,Pi=globalThis.THREE.LessStencilFunc,Ui=globalThis.THREE.Light,Gi=globalThis.THREE.LightProbe,cr=globalThis.THREE.Line,Oi=globalThis.THREE.Line3,ur=globalThis.THREE.LineBasicMaterial,ki=globalThis.THREE.LineCurve,Vi=globalThis.THREE.LineCurve3,zi=globalThis.THREE.LineDashedMaterial,hr=globalThis.THREE.LineLoop,pr=globalThis.THREE.LineSegments,ji=globalThis.THREE.LinearDisplayP3ColorSpace,Wi=globalThis.THREE.LinearEncoding,ae=globalThis.THREE.LinearFilter,Ki=globalThis.THREE.LinearInterpolant,Xi=globalThis.THREE.LinearMipMapLinearFilter,qi=globalThis.THREE.LinearMipMapNearestFilter,st=globalThis.THREE.LinearMipmapLinearFilter,fr=globalThis.THREE.LinearMipmapNearestFilter,W=globalThis.THREE.LinearSRGBColorSpace,dr=globalThis.THREE.LinearToneMapping,Qi=globalThis.THREE.LinearTransfer,mr=globalThis.THREE.Loader,le=globalThis.THREE.LoaderUtils,Yi=globalThis.THREE.LoadingManager,Zi=globalThis.THREE.LoopOnce,$i=globalThis.THREE.LoopPingPong,Ji=globalThis.THREE.LoopRepeat,en=globalThis.THREE.LuminanceAlphaFormat,tn=globalThis.THREE.LuminanceFormat,rn=globalThis.THREE.MOUSE,we=globalThis.THREE.Material,on=globalThis.THREE.MaterialLoader,gr=globalThis.THREE.MathUtils,sn=globalThis.THREE.Matrix3,z=globalThis.THREE.Matrix4,nn=globalThis.THREE.MaxEquation,I=globalThis.THREE.Mesh,Y=globalThis.THREE.MeshBasicMaterial,an=globalThis.THREE.MeshDepthMaterial,ln=globalThis.THREE.MeshDistanceMaterial,cn=globalThis.THREE.MeshLambertMaterial,un=globalThis.THREE.MeshMatcapMaterial,Tr=globalThis.THREE.MeshNormalMaterial,hn=globalThis.THREE.MeshPhongMaterial,Z=globalThis.THREE.MeshPhysicalMaterial,ce=globalThis.THREE.MeshStandardMaterial,pn=globalThis.THREE.MeshToonMaterial,fn=globalThis.THREE.MinEquation,Er=globalThis.THREE.MirroredRepeatWrapping,dn=globalThis.THREE.MixOperation,mn=globalThis.THREE.MultiplyBlending,gn=globalThis.THREE.MultiplyOperation,xe=globalThis.THREE.NearestFilter,Tn=globalThis.THREE.NearestMipMapLinearFilter,En=globalThis.THREE.NearestMipMapNearestFilter,xr=globalThis.THREE.NearestMipmapLinearFilter,Rr=globalThis.THREE.NearestMipmapNearestFilter,xn=globalThis.THREE.NeverCompare,Rn=globalThis.THREE.NeverDepth,bn=globalThis.THREE.NeverStencilFunc,$=globalThis.THREE.NoBlending,An=globalThis.THREE.NoColorSpace,Sn=globalThis.THREE.NoToneMapping,vn=globalThis.THREE.NormalAnimationBlendMode,Mn=globalThis.THREE.NormalBlending,Cn=globalThis.THREE.NotEqualCompare,_n=globalThis.THREE.NotEqualDepth,yn=globalThis.THREE.NotEqualStencilFunc,it=globalThis.THREE.NumberKeyframeTrack,nt=globalThis.THREE.Object3D,Hn=globalThis.THREE.ObjectLoader,wn=globalThis.THREE.ObjectSpaceNormalMap,Bn=globalThis.THREE.OctahedronGeometry,Dn=globalThis.THREE.OneFactor,Ln=globalThis.THREE.OneMinusConstantAlphaFactor,Nn=globalThis.THREE.OneMinusConstantColorFactor,Fn=globalThis.THREE.OneMinusDstAlphaFactor,In=globalThis.THREE.OneMinusDstColorFactor,Pn=globalThis.THREE.OneMinusSrcAlphaFactor,Un=globalThis.THREE.OneMinusSrcColorFactor,Be=globalThis.THREE.OrthographicCamera,Gn=globalThis.THREE.P3Primaries,On=globalThis.THREE.PCFShadowMap,kn=globalThis.THREE.PCFSoftShadowMap,Vn=globalThis.THREE.PMREMGenerator,zn=globalThis.THREE.Path,De=globalThis.THREE.PerspectiveCamera,br=globalThis.THREE.Plane,jn=globalThis.THREE.PlaneGeometry,Wn=globalThis.THREE.PlaneHelper,Le=globalThis.THREE.PointLight,Kn=globalThis.THREE.PointLightHelper,Ar=globalThis.THREE.Points,Sr=globalThis.THREE.PointsMaterial,Xn=globalThis.THREE.PolarGridHelper,qn=globalThis.THREE.PolyhedronGeometry,Qn=globalThis.THREE.PositionalAudio,vr=globalThis.THREE.PropertyBinding,Yn=globalThis.THREE.PropertyMixer,Zn=globalThis.THREE.QuadraticBezierCurve,$n=globalThis.THREE.QuadraticBezierCurve3,Ne=globalThis.THREE.Quaternion,Fe=globalThis.THREE.QuaternionKeyframeTrack,Jn=globalThis.THREE.QuaternionLinearInterpolant,ea=globalThis.THREE.RED_GREEN_RGTC2_Format,ta=globalThis.THREE.RED_RGTC1_Format,ra=globalThis.THREE.REVISION,oa=globalThis.THREE.RGBADepthPacking,sa=globalThis.THREE.RGBAFormat,ia=globalThis.THREE.RGBAIntegerFormat,na=globalThis.THREE.RGBA_ASTC_10x10_Format,aa=globalThis.THREE.RGBA_ASTC_10x5_Format,la=globalThis.THREE.RGBA_ASTC_10x6_Format,ca=globalThis.THREE.RGBA_ASTC_10x8_Format,ua=globalThis.THREE.RGBA_ASTC_12x10_Format,ha=globalThis.THREE.RGBA_ASTC_12x12_Format,pa=globalThis.THREE.RGBA_ASTC_4x4_Format,fa=globalThis.THREE.RGBA_ASTC_5x4_Format,da=globalThis.THREE.RGBA_ASTC_5x5_Format,ma=globalThis.THREE.RGBA_ASTC_6x5_Format,ga=globalThis.THREE.RGBA_ASTC_6x6_Format,Ta=globalThis.THREE.RGBA_ASTC_8x5_Format,Ea=globalThis.THREE.RGBA_ASTC_8x6_Format,xa=globalThis.THREE.RGBA_ASTC_8x8_Format,Ra=globalThis.THREE.RGBA_BPTC_Format,ba=globalThis.THREE.RGBA_ETC2_EAC_Format,Aa=globalThis.THREE.RGBA_PVRTC_2BPPV1_Format,Sa=globalThis.THREE.RGBA_PVRTC_4BPPV1_Format,va=globalThis.THREE.RGBA_S3TC_DXT1_Format,Ma=globalThis.THREE.RGBA_S3TC_DXT3_Format,Ca=globalThis.THREE.RGBA_S3TC_DXT5_Format,_a=globalThis.THREE.RGB_BPTC_SIGNED_Format,ya=globalThis.THREE.RGB_BPTC_UNSIGNED_Format,Ha=globalThis.THREE.RGB_ETC1_Format,wa=globalThis.THREE.RGB_ETC2_Format,Ba=globalThis.THREE.RGB_PVRTC_2BPPV1_Format,Da=globalThis.THREE.RGB_PVRTC_4BPPV1_Format,La=globalThis.THREE.RGB_S3TC_DXT1_Format,Na=globalThis.THREE.RGFormat,Fa=globalThis.THREE.RGIntegerFormat,Mr=globalThis.THREE.RawShaderMaterial,Ia=globalThis.THREE.Ray,Pa=globalThis.THREE.Raycaster,Ua=globalThis.THREE.Rec709Primaries,Ga=globalThis.THREE.RectAreaLight,Oa=globalThis.THREE.RedFormat,ka=globalThis.THREE.RedIntegerFormat,Cr=globalThis.THREE.ReinhardToneMapping,Va=globalThis.THREE.RenderTarget,Ie=globalThis.THREE.RepeatWrapping,za=globalThis.THREE.ReplaceStencilOp,ja=globalThis.THREE.ReverseSubtractEquation,Wa=globalThis.THREE.RingGeometry,Ka=globalThis.THREE.SIGNED_RED_GREEN_RGTC2_Format,Xa=globalThis.THREE.SIGNED_RED_RGTC1_Format,ue=globalThis.THREE.SRGBColorSpace,_r=globalThis.THREE.SRGBTransfer,yr=globalThis.THREE.Scene,qa=globalThis.THREE.ShaderChunk,Qa=globalThis.THREE.ShaderLib,G=globalThis.THREE.ShaderMaterial,Ya=globalThis.THREE.ShadowMaterial,Za=globalThis.THREE.Shape,$a=globalThis.THREE.ShapeGeometry,Ja=globalThis.THREE.ShapePath,el=globalThis.THREE.ShapeUtils,tl=globalThis.THREE.ShortType,Hr=globalThis.THREE.Skeleton,Jr=globalThis.THREE.SkeletonHelper,wr=globalThis.THREE.SkinnedMesh,rl=globalThis.THREE.Source,Br=globalThis.THREE.Sphere,ol=globalThis.THREE.SphereGeometry,sl=globalThis.THREE.Spherical,il=globalThis.THREE.SphericalHarmonics3,nl=globalThis.THREE.SplineCurve,Dr=globalThis.THREE.SpotLight,al=globalThis.THREE.SpotLightHelper,ll=globalThis.THREE.Sprite,cl=globalThis.THREE.SpriteMaterial,ul=globalThis.THREE.SrcAlphaFactor,hl=globalThis.THREE.SrcAlphaSaturateFactor,pl=globalThis.THREE.SrcColorFactor,fl=globalThis.THREE.StaticCopyUsage,dl=globalThis.THREE.StaticDrawUsage,ml=globalThis.THREE.StaticReadUsage,gl=globalThis.THREE.StereoCamera,Tl=globalThis.THREE.StreamCopyUsage,El=globalThis.THREE.StreamDrawUsage,xl=globalThis.THREE.StreamReadUsage,Rl=globalThis.THREE.StringKeyframeTrack,bl=globalThis.THREE.SubtractEquation,Al=globalThis.THREE.SubtractiveBlending,Sl=globalThis.THREE.TOUCH,vl=globalThis.THREE.TangentSpaceNormalMap,Ml=globalThis.THREE.TetrahedronGeometry,at=globalThis.THREE.Texture,Lr=globalThis.THREE.TextureLoader,Cl=globalThis.THREE.TorusGeometry,_l=globalThis.THREE.TorusKnotGeometry,yl=globalThis.THREE.Triangle,Re=globalThis.THREE.TriangleFanDrawMode,Pe=globalThis.THREE.TriangleStripDrawMode,Nr=globalThis.THREE.TrianglesDrawMode,Hl=globalThis.THREE.TubeGeometry,wl=globalThis.THREE.TwoPassDoubleSide,Bl=globalThis.THREE.UVMapping,Dl=globalThis.THREE.Uint16BufferAttribute,Ll=globalThis.THREE.Uint32BufferAttribute,Nl=globalThis.THREE.Uint8BufferAttribute,Fl=globalThis.THREE.Uint8ClampedBufferAttribute,Il=globalThis.THREE.Uniform,Pl=globalThis.THREE.UniformsGroup,lt=globalThis.THREE.UniformsLib,O=globalThis.THREE.UniformsUtils,Ul=globalThis.THREE.UnsignedByteType,Fr=globalThis.THREE.UnsignedInt248Type,Gl=globalThis.THREE.UnsignedIntType,Ol=globalThis.THREE.UnsignedShort4444Type,kl=globalThis.THREE.UnsignedShort5551Type,Vl=globalThis.THREE.UnsignedShortType,zl=globalThis.THREE.VSMShadowMap,B=globalThis.THREE.Vector2,D=globalThis.THREE.Vector3,ct=globalThis.THREE.Vector4,Ue=globalThis.THREE.VectorKeyframeTrack,jl=globalThis.THREE.VideoTexture,Wl=globalThis.THREE.WebGL1Renderer,Kl=globalThis.THREE.WebGL3DRenderTarget,Xl=globalThis.THREE.WebGLArrayRenderTarget,ql=globalThis.THREE.WebGLCoordinateSystem,Ql=globalThis.THREE.WebGLCubeRenderTarget,Yl=globalThis.THREE.WebGLMultipleRenderTargets,Q=globalThis.THREE.WebGLRenderTarget,Zl=globalThis.THREE.WebGLRenderer,$l=globalThis.THREE.WebGLUtils,Jl=globalThis.THREE.WebGPUCoordinateSystem,ec=globalThis.THREE.WireframeGeometry,tc=globalThis.THREE.WrapAroundEnding,rc=globalThis.THREE.ZeroCurvatureEnding,ut=globalThis.THREE.ZeroFactor,oc=globalThis.THREE.ZeroSlopeEnding,sc=globalThis.THREE.ZeroStencilOp,ic=globalThis.THREE._SRGBAFormat,nc=globalThis.THREE.createCanvasElement,ac=globalThis.THREE.sRGBEncoding;var oe={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var k=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},eo=new Be(-1,1,1,-1,0,1),ht=class extends ge{constructor(){super(),this.setAttribute("position",new Ce([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ce([0,2,0,0,2,0],2))}},to=new ht,J=class{constructor(e){this._mesh=new I(to,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,eo)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var he=class extends k{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof G?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=O.clone(e.uniforms),this.material=new G({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new J(this.material)}render(e,t,o){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=o.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var be=class extends k{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,o){let r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let i,a;this.inverse?(i=0,a=1):(i=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,i,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(o),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}},Ge=class extends k{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Oe=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let o=e.getSize(new B);this._width=o.width,this._height=o.height,t=new Q(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:V}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new he(oe),this.copyPass.material.blending=$,this.clock=new Zt}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),o=!1;for(let r=0,s=this.passes.length;r<s;r++){let i=this.passes[r];if(i.enabled!==!1){if(i.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),i.render(this.renderer,this.writeBuffer,this.readBuffer,e,o),i.needsSwap){if(o){let a=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}be!==void 0&&(i instanceof be?o=!0:i instanceof Ge&&(o=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new B);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let o=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(o,r),this.renderTarget2.setSize(o,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(o,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var ke=class extends k{constructor(e,t,o=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=o,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new N}render(e,t,o){let r=e.autoClear;e.autoClear=!1;let s,i;this.overrideMaterial!==null&&(i=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor)),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:o),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=i),e.autoClear=r}};var Ae={name:"SAOShader",defines:{NUM_SAMPLES:7,NUM_RINGS:4,DIFFUSE_TEXTURE:0,PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},tDiffuse:{value:null},tNormal:{value:null},size:{value:new B(512,512)},cameraNear:{value:1},cameraFar:{value:100},cameraProjectionMatrix:{value:new z},cameraInverseProjectionMatrix:{value:new z},scale:{value:1},intensity:{value:.1},bias:{value:.5},minResolution:{value:0},kernelRadius:{value:100},randomSeed:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		#include <common>

		varying vec2 vUv;

		#if DIFFUSE_TEXTURE == 1
		uniform sampler2D tDiffuse;
		#endif

		uniform highp sampler2D tDepth;
		uniform highp sampler2D tNormal;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float scale;
		uniform float intensity;
		uniform float bias;
		uniform float kernelRadius;
		uniform float minResolution;
		uniform vec2 size;
		uniform float randomSeed;

		// RGBA depth

		#include <packing>

		vec4 getDefaultColor( const in vec2 screenPosition ) {
			#if DIFFUSE_TEXTURE == 1
			return texture2D( tDiffuse, vUv );
			#else
			return vec4( 1.0 );
			#endif
		}

		float getDepth( const in vec2 screenPosition ) {
			return texture2D( tDepth, screenPosition ).x;
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}

		vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
		}

		float scaleDividedByCameraFar;
		float minResolutionMultipliedByCameraFar;

		float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
			vec3 viewDelta = sampleViewPosition - centerViewPosition;
			float viewDistance = length( viewDelta );
			float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;

			return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );
		}

		// moving costly divides into consts
		const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
		const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

		float getAmbientOcclusion( const in vec3 centerViewPosition ) {
			// precompute some variables require in getOcclusion.
			scaleDividedByCameraFar = scale / cameraFar;
			minResolutionMultipliedByCameraFar = minResolution * cameraFar;
			vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( vUv + randomSeed ) * PI2;
			vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;
			vec2 radiusStep = radius;

			float occlusionSum = 0.0;
			float weightSum = 0.0;

			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;
				radius += radiusStep;
				angle += ANGLE_STEP;

				float sampleDepth = getDepth( sampleUv );
				if( sampleDepth >= ( 1.0 - EPSILON ) ) {
					continue;
				}

				float sampleViewZ = getViewZ( sampleDepth );
				vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );
				occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );
				weightSum += 1.0;
			}

			if( weightSum == 0.0 ) discard;

			return occlusionSum * ( intensity / weightSum );
		}

		void main() {
			float centerDepth = getDepth( vUv );
			if( centerDepth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = getViewZ( centerDepth );
			vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );

			float ambientOcclusion = getAmbientOcclusion( viewPosition );

			gl_FragColor = getDefaultColor( vUv );
			gl_FragColor.xyz *=  1.0 - ambientOcclusion;
		}`};var te={name:"DepthLimitedBlurShader",defines:{KERNEL_RADIUS:4,DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tDiffuse:{value:null},size:{value:new B(512,512)},sampleUvOffsets:{value:[new B(0,0)]},sampleWeights:{value:[1]},tDepth:{value:null},cameraNear:{value:10},cameraFar:{value:1e3},depthCutoff:{value:10}},vertexShader:`

		#include <common>

		uniform vec2 size;

		varying vec2 vUv;
		varying vec2 vInvSize;

		void main() {
			vUv = uv;
			vInvSize = 1.0 / size;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		#include <common>
		#include <packing>

		uniform sampler2D tDiffuse;
		uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform float depthCutoff;

		uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];
		uniform float sampleWeights[ KERNEL_RADIUS + 1 ];

		varying vec2 vUv;
		varying vec2 vInvSize;

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		void main() {
			float depth = getDepth( vUv );
			if( depth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = -getViewZ( depth );
			bool rBreak = false, lBreak = false;

			float weightSum = sampleWeights[0];
			vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;

			for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {

				float sampleWeight = sampleWeights[i];
				vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;

				vec2 sampleUv = vUv + sampleUvOffset;
				float viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;

				if( ! rBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

				sampleUv = vUv - sampleUvOffset;
				viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;

				if( ! lBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

			}

			gl_FragColor = diffuseSum / weightSum;
		}`},Se={createSampleWeights:function(u,e){let t=[];for(let o=0;o<=u;o++)t.push(ro(o,e));return t},createSampleOffsets:function(u,e){let t=[];for(let o=0;o<=u;o++)t.push(e.clone().multiplyScalar(o));return t},configure:function(u,e,t,o){u.defines.KERNEL_RADIUS=e,u.uniforms.sampleUvOffsets.value=Se.createSampleOffsets(e,o),u.uniforms.sampleWeights.value=Se.createSampleWeights(e,t),u.needsUpdate=!0}};function ro(u,e){return Math.exp(-(u*u)/(2*(e*e)))/(Math.sqrt(2*Math.PI)*e)}var ve=class u extends k{constructor(e,t,o=new B(256,256)){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.originalClearColor=new N,this._oldClearColor=new N,this.oldClearAlpha=1,this.params={output:0,saoBias:.5,saoIntensity:.18,saoScale:1,saoKernelRadius:100,saoMinResolution:0,saoBlur:!0,saoBlurRadius:8,saoBlurStdDev:4,saoBlurDepthCutoff:.01},this.resolution=new B(o.x,o.y),this.saoRenderTarget=new Q(this.resolution.x,this.resolution.y,{type:V}),this.blurIntermediateRenderTarget=this.saoRenderTarget.clone();let r=new er;r.format=Jt,r.type=Fr,this.normalRenderTarget=new Q(this.resolution.x,this.resolution.y,{minFilter:xe,magFilter:xe,type:V,depthTexture:r}),this.normalMaterial=new Tr,this.normalMaterial.blending=$,this.saoMaterial=new G({defines:Object.assign({},Ae.defines),fragmentShader:Ae.fragmentShader,vertexShader:Ae.vertexShader,uniforms:O.clone(Ae.uniforms)}),this.saoMaterial.extensions.derivatives=!0,this.saoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.saoMaterial.uniforms.tDepth.value=r,this.saoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.saoMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.saoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.saoMaterial.uniforms.cameraProjectionMatrix.value=this.camera.projectionMatrix,this.saoMaterial.blending=$,this.vBlurMaterial=new G({uniforms:O.clone(te.uniforms),defines:Object.assign({},te.defines),vertexShader:te.vertexShader,fragmentShader:te.fragmentShader}),this.vBlurMaterial.defines.DEPTH_PACKING=0,this.vBlurMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.vBlurMaterial.uniforms.tDiffuse.value=this.saoRenderTarget.texture,this.vBlurMaterial.uniforms.tDepth.value=r,this.vBlurMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.vBlurMaterial.blending=$,this.hBlurMaterial=new G({uniforms:O.clone(te.uniforms),defines:Object.assign({},te.defines),vertexShader:te.vertexShader,fragmentShader:te.fragmentShader}),this.hBlurMaterial.defines.DEPTH_PACKING=0,this.hBlurMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.hBlurMaterial.uniforms.tDiffuse.value=this.blurIntermediateRenderTarget.texture,this.hBlurMaterial.uniforms.tDepth.value=r,this.hBlurMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.hBlurMaterial.blending=$,this.materialCopy=new G({uniforms:O.clone(oe.uniforms),vertexShader:oe.vertexShader,fragmentShader:oe.fragmentShader,blending:$}),this.materialCopy.transparent=!0,this.materialCopy.depthTest=!1,this.materialCopy.depthWrite=!1,this.materialCopy.blending=$e,this.materialCopy.blendSrc=sr,this.materialCopy.blendDst=ut,this.materialCopy.blendEquation=Ye,this.materialCopy.blendSrcAlpha=or,this.materialCopy.blendDstAlpha=ut,this.materialCopy.blendEquationAlpha=Ye,this.fsQuad=new J(null)}render(e,t,o){this.renderToScreen&&(this.materialCopy.blending=$,this.materialCopy.uniforms.tDiffuse.value=o.texture,this.materialCopy.needsUpdate=!0,this.renderPass(e,this.materialCopy,null)),e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();let r=e.autoClear;e.autoClear=!1,this.saoMaterial.uniforms.bias.value=this.params.saoBias,this.saoMaterial.uniforms.intensity.value=this.params.saoIntensity,this.saoMaterial.uniforms.scale.value=this.params.saoScale,this.saoMaterial.uniforms.kernelRadius.value=this.params.saoKernelRadius,this.saoMaterial.uniforms.minResolution.value=this.params.saoMinResolution,this.saoMaterial.uniforms.cameraNear.value=this.camera.near,this.saoMaterial.uniforms.cameraFar.value=this.camera.far;let s=this.params.saoBlurDepthCutoff*(this.camera.far-this.camera.near);this.vBlurMaterial.uniforms.depthCutoff.value=s,this.hBlurMaterial.uniforms.depthCutoff.value=s,this.vBlurMaterial.uniforms.cameraNear.value=this.camera.near,this.vBlurMaterial.uniforms.cameraFar.value=this.camera.far,this.hBlurMaterial.uniforms.cameraNear.value=this.camera.near,this.hBlurMaterial.uniforms.cameraFar.value=this.camera.far,this.params.saoBlurRadius=Math.floor(this.params.saoBlurRadius),(this.prevStdDev!==this.params.saoBlurStdDev||this.prevNumSamples!==this.params.saoBlurRadius)&&(Se.configure(this.vBlurMaterial,this.params.saoBlurRadius,this.params.saoBlurStdDev,new B(0,1)),Se.configure(this.hBlurMaterial,this.params.saoBlurRadius,this.params.saoBlurStdDev,new B(1,0)),this.prevStdDev=this.params.saoBlurStdDev,this.prevNumSamples=this.params.saoBlurRadius),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.renderPass(e,this.saoMaterial,this.saoRenderTarget,16777215,1),this.params.saoBlur&&(this.renderPass(e,this.vBlurMaterial,this.blurIntermediateRenderTarget,16777215,1),this.renderPass(e,this.hBlurMaterial,this.saoRenderTarget,16777215,1));let i=this.materialCopy;this.params.output===u.OUTPUT.Normal?(this.materialCopy.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.materialCopy.needsUpdate=!0):(this.materialCopy.uniforms.tDiffuse.value=this.saoRenderTarget.texture,this.materialCopy.needsUpdate=!0),this.params.output===u.OUTPUT.Default?i.blending=$e:i.blending=$,this.renderPass(e,i,this.renderToScreen?null:o),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=r}renderPass(e,t,o,r,s){e.getClearColor(this.originalClearColor);let i=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(o),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=a,e.setClearColor(this.originalClearColor),e.setClearAlpha(i)}renderOverride(e,t,o,r,s){e.getClearColor(this.originalClearColor);let i=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(o),e.autoClear=!1,r=t.clearColor||r,s=t.clearAlpha||s,r!=null&&(e.setClearColor(r),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=a,e.setClearColor(this.originalClearColor),e.setClearAlpha(i)}setSize(e,t){this.saoRenderTarget.setSize(e,t),this.blurIntermediateRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.saoMaterial.uniforms.size.value.set(e,t),this.saoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.saoMaterial.uniforms.cameraProjectionMatrix.value=this.camera.projectionMatrix,this.saoMaterial.needsUpdate=!0,this.vBlurMaterial.uniforms.size.value.set(e,t),this.vBlurMaterial.needsUpdate=!0,this.hBlurMaterial.uniforms.size.value.set(e,t),this.hBlurMaterial.needsUpdate=!0}dispose(){this.saoRenderTarget.dispose(),this.blurIntermediateRenderTarget.dispose(),this.normalRenderTarget.dispose(),this.normalMaterial.dispose(),this.saoMaterial.dispose(),this.vBlurMaterial.dispose(),this.hBlurMaterial.dispose(),this.materialCopy.dispose(),this.fsQuad.dispose()}};ve.OUTPUT={Default:0,SAO:1,Normal:2};var Ir={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new N(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var pe=class u extends k{constructor(e,t,o,r){super(),this.strength=t!==void 0?t:1,this.radius=o,this.threshold=r,this.resolution=e!==void 0?new B(e.x,e.y):new B(256,256),this.clearColor=new N(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),i=Math.round(this.resolution.y/2);this.renderTargetBright=new Q(s,i,{type:V}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){let p=new Q(s,i,{type:V});p.texture.name="UnrealBloomPass.h"+c,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);let f=new Q(s,i,{type:V});f.texture.name="UnrealBloomPass.v"+c,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),s=Math.round(s/2),i=Math.round(i/2)}let a=Ir;this.highPassUniforms=O.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new G({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let n=[3,5,7,9,11];s=Math.round(this.resolution.x/2),i=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(n[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new B(1/s,1/i),s=Math.round(s/2),i=Math.round(i/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let h=oe;this.copyUniforms=O.clone(h.uniforms),this.blendMaterial=new G({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:zt,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new N,this.oldClearAlpha=1,this.basic=new Y,this.fsQuad=new J(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let o=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(o,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(o,r),this.renderTargetsVertical[s].setSize(o,r),this.separableBlurMaterials[s].uniforms.invSize.value=new B(1/o,1/r),o=Math.round(o/2),r=Math.round(r/2)}render(e,t,o,r,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();let i=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=o.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=o.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this.fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[n].uniforms.direction.value=u.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=u.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[n];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(o),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=i}getSeperableBlurMaterial(e){let t=[];for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(e*e))/e);return new G({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new B(.5,.5)},direction:{value:new B(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new G({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};pe.BlurDirectionX=new B(1,0);pe.BlurDirectionY=new B(0,1);var Pr={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Ve=class extends k{constructor(){super();let e=Pr;this.uniforms=O.clone(e.uniforms),this.material=new Mr({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new J(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,o){this.uniforms.tDiffuse.value=o.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Te.getTransfer(this._outputColorSpace)===_r&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===dr?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Cr?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Qt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Vt?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===jt&&(this.material.defines.AGX_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Ur={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new B(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		precision highp float;

		uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

		//----------------------------------------------------------------------------------
		// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
		// SDK Version: v3.00
		// Email:       gameworks@nvidia.com
		// Site:        http://developer.nvidia.com/
		//
		// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
		//
		// Redistribution and use in source and binary forms, with or without
		// modification, are permitted provided that the following conditions
		// are met:
		//  * Redistributions of source code must retain the above copyright
		//    notice, this list of conditions and the following disclaimer.
		//  * Redistributions in binary form must reproduce the above copyright
		//    notice, this list of conditions and the following disclaimer in the
		//    documentation and/or other materials provided with the distribution.
		//  * Neither the name of NVIDIA CORPORATION nor the names of its
		//    contributors may be used to endorse or promote products derived
		//    from this software without specific prior written permission.
		//
		// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
		// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
		// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
		// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
		// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
		// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
		// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		//
		//----------------------------------------------------------------------------------

		#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
		#endif

		/*--------------------------------------------------------------------------*/
		#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
		#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
		/*--------------------------------------------------------------------------*/

		#define NUM_SAMPLES 5

		// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
		float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
		}

		/*============================================================================

									FXAA3 QUALITY - PC

		============================================================================*/

		/*--------------------------------------------------------------------------*/
		vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
		) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
				if(earlyExit) FxaaDiscard;
			#else
				if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
				// locate the edge
				vec2 dirToEdge;
				dirToEdge.x = contrastE > contrastW ? 1. : -1.;
				dirToEdge.y = contrastS > contrastN ? 1. : -1.;
				// . 2 .      . 1 .
				// 1 0 2  ~=  0 0 1
				// . 1 .      . 0 .

				// tap 2 pixels and see which ones are "outside" the edge, to
				// determine if the edge is vertical or horizontal

				vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongH = contrast( rgbaM, rgbaAlongH );
				// . 1 .
				// 0 0 1
				// . 0 H

				vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongV = contrast( rgbaM, rgbaAlongV );
				// V 1 .
				// 0 0 1
				// . 0 .

				relativeVContrast = matchAlongV - matchAlongH;
				relativeVContrast *= fxaaQualityinvEdgeThreshold;

				if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
					// 1 1 .
					// 0 0 1
					// . 0 1

					// do a simple blur
					return mix(
						rgbaM,
						(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
						.4
					);
				}

				horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsed = 0;
			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {
				iterationsUsed = i;

				float increment = float(i + 1);

				if(!doneN) {
					nDist += increment;
					posN = posM + offNP * nDist;
					vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
					doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
					iterationsUsedN = i;
				}

				if(!doneP) {
					pDist += increment;
					posP = posM - offNP * pDist;
					vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
					doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
					iterationsUsedP = i;
				}

				if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
				doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
				doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
				rgbaM,
				rgbaN,
				dist * .5
			);
		}

		void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
				vUv,
				tDiffuse,
				resolution,
				edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
				invEdgeDetectionQuality
			);

		}
	`};var ze=class extends yr{constructor(e=null){super();let t=new qt;t.deleteAttribute("uv");let o=new ce({side:Wt}),r=new ce,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let i=new Le(16777215,s,28,2);i.position.set(.418,16.199,.3),this.add(i);let a=new I(t,o);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let n=new I(t,r);n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),this.add(n);let l=new I(t,r);l.position.set(-5.607,-.754,-.758),l.rotation.set(0,.994,0),l.scale.set(1.97,1.534,3.955),this.add(l);let h=new I(t,r);h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),this.add(h);let c=new I(t,r);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);let p=new I(t,r);p.position.set(2.291,-.756,-2.621),p.rotation.set(0,-.286,0),p.scale.set(1.546,1.552,1.496),this.add(p);let f=new I(t,r);f.position.set(-2.193,-.369,-5.547),f.rotation.set(0,.516,0),f.scale.set(3.875,3.487,2.986),this.add(f);let T=new I(t,fe(50));T.position.set(-16.116,14.37,8.208),T.scale.set(.1,2.428,2.739),this.add(T);let S=new I(t,fe(50));S.position.set(-16.109,18.021,-8.207),S.scale.set(.1,2.425,2.751),this.add(S);let m=new I(t,fe(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);let g=new I(t,fe(43));g.position.set(-.462,8.89,14.52),g.scale.set(4.38,5.441,.088),this.add(g);let E=new I(t,fe(20));E.position.set(3.235,11.486,-12.541),E.scale.set(2.5,2,.1),this.add(E);let y=new I(t,fe(100));y.position.set(0,20,0),y.scale.set(1,.1,1),this.add(y)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function fe(u){let e=new Y;return e.color.setScalar(u),e}var je=class extends I{constructor(e,t={}){super(e),this.isWater=!0;let o=this,r=t.textureWidth!==void 0?t.textureWidth:512,s=t.textureHeight!==void 0?t.textureHeight:512,i=t.clipBias!==void 0?t.clipBias:0,a=t.alpha!==void 0?t.alpha:1,n=t.time!==void 0?t.time:0,l=t.waterNormals!==void 0?t.waterNormals:null,h=t.sunDirection!==void 0?t.sunDirection:new D(.70707,.70707,0),c=new N(t.sunColor!==void 0?t.sunColor:16777215),p=new N(t.waterColor!==void 0?t.waterColor:8355711),f=t.eye!==void 0?t.eye:new D(0,0,0),T=t.distortionScale!==void 0?t.distortionScale:20,S=t.side!==void 0?t.side:ye,m=t.fog!==void 0?t.fog:!1,g=new br,E=new D,y=new D,A=new D,F=new z,P=new D(0,0,-1),H=new ct,d=new D,x=new D,v=new ct,w=new z,C=new De,L=new Q(r,s),b={name:"MirrorShader",uniforms:O.merge([lt.fog,lt.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new z},sunColor:{value:new N(8355711)},sunDirection:{value:new D(.70707,.70707,0)},eye:{value:new D},waterColor:{value:new N(5592405)}}]),vertexShader:`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,fragmentShader:`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`},_=new G({name:b.name,uniforms:O.clone(b.uniforms),vertexShader:b.vertexShader,fragmentShader:b.fragmentShader,lights:!0,side:S,fog:m});_.uniforms.mirrorSampler.value=L.texture,_.uniforms.textureMatrix.value=w,_.uniforms.alpha.value=a,_.uniforms.time.value=n,_.uniforms.normalSampler.value=l,_.uniforms.sunColor.value=c,_.uniforms.waterColor.value=p,_.uniforms.sunDirection.value=h,_.uniforms.distortionScale.value=T,_.uniforms.eye.value=f,o.material=_,o.onBeforeRender=function(R,re,ee){if(y.setFromMatrixPosition(o.matrixWorld),A.setFromMatrixPosition(ee.matrixWorld),F.extractRotation(o.matrixWorld),E.set(0,0,1),E.applyMatrix4(F),d.subVectors(y,A),d.dot(E)>0)return;d.reflect(E).negate(),d.add(y),F.extractRotation(ee.matrixWorld),P.set(0,0,-1),P.applyMatrix4(F),P.add(A),x.subVectors(y,P),x.reflect(E).negate(),x.add(y),C.position.copy(d),C.up.set(0,1,0),C.up.applyMatrix4(F),C.up.reflect(E),C.lookAt(x),C.far=ee.far,C.updateMatrixWorld(),C.projectionMatrix.copy(ee.projectionMatrix),w.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),w.multiply(C.projectionMatrix),w.multiply(C.matrixWorldInverse),g.setFromNormalAndCoplanarPoint(E,y),g.applyMatrix4(C.matrixWorldInverse),H.set(g.normal.x,g.normal.y,g.normal.z,g.constant);let U=C.projectionMatrix;v.x=(Math.sign(H.x)+U.elements[8])/U.elements[0],v.y=(Math.sign(H.y)+U.elements[9])/U.elements[5],v.z=-1,v.w=(1+U.elements[10])/U.elements[14],H.multiplyScalar(2/H.dot(v)),U.elements[2]=H.x,U.elements[6]=H.y,U.elements[10]=H.z+1-i,U.elements[14]=H.w,f.setFromMatrixPosition(ee.matrixWorld);let X=R.getRenderTarget(),qe=R.xr.enabled,q=R.shadowMap.autoUpdate;o.visible=!1,R.xr.enabled=!1,R.shadowMap.autoUpdate=!1,R.setRenderTarget(L),R.state.buffers.depth.setMask(!0),R.autoClear===!1&&R.clear(),R.render(re,C),o.visible=!0,R.xr.enabled=qe,R.shadowMap.autoUpdate=q,R.setRenderTarget(X);let j=ee.viewport;j!==void 0&&R.state.viewport(j)}}};function pt(u,e){if(e===Nr)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),u;if(e===Re||e===Pe){let t=u.getIndex();if(t===null){let i=[],a=u.getAttribute("position");if(a!==void 0){for(let n=0;n<a.count;n++)i.push(n);u.setIndex(i),t=u.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),u}let o=t.count-2,r=[];if(e===Re)for(let i=1;i<=o;i++)r.push(t.getX(0)),r.push(t.getX(i)),r.push(t.getX(i+1));else for(let i=0;i<o;i++)i%2===0?(r.push(t.getX(i)),r.push(t.getX(i+1)),r.push(t.getX(i+2))):(r.push(t.getX(i+2)),r.push(t.getX(i+1)),r.push(t.getX(i)));r.length/3!==o&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let s=u.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),u}var We=class extends mr{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new xt(t)}),this.register(function(t){return new yt(t)}),this.register(function(t){return new Ht(t)}),this.register(function(t){return new wt(t)}),this.register(function(t){return new bt(t)}),this.register(function(t){return new At(t)}),this.register(function(t){return new St(t)}),this.register(function(t){return new vt(t)}),this.register(function(t){return new Et(t)}),this.register(function(t){return new Mt(t)}),this.register(function(t){return new Rt(t)}),this.register(function(t){return new _t(t)}),this.register(function(t){return new Ct(t)}),this.register(function(t){return new gt(t)}),this.register(function(t){return new Bt(t)}),this.register(function(t){return new Dt(t)})}load(e,t,o,r){let s=this,i;if(this.resourcePath!=="")i=this.resourcePath;else if(this.path!==""){let l=le.extractUrlBase(e);i=le.resolveURL(l,this.path)}else i=le.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){r?r(l):console.error(l),s.manager.itemError(e),s.manager.itemEnd(e)},n=new Je(this.manager);n.setPath(this.path),n.setResponseType("arraybuffer"),n.setRequestHeader(this.requestHeader),n.setWithCredentials(this.withCredentials),n.load(e,function(l){try{s.parse(l,i,function(h){t(h),s.manager.itemEnd(e)},a)}catch(h){a(h)}},o,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,o,r){let s,i={},a={},n=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(n.decode(new Uint8Array(e,0,4))===zr){try{i[M.KHR_BINARY_GLTF]=new Lt(e)}catch(c){r&&r(c);return}s=JSON.parse(i[M.KHR_BINARY_GLTF].content)}else s=JSON.parse(n.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Ot(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let c=this.pluginCallbacks[h](l);c.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[c.name]=c,i[c.name]=!0}if(s.extensionsUsed)for(let h=0;h<s.extensionsUsed.length;++h){let c=s.extensionsUsed[h],p=s.extensionsRequired||[];switch(c){case M.KHR_MATERIALS_UNLIT:i[c]=new Tt;break;case M.KHR_DRACO_MESH_COMPRESSION:i[c]=new Nt(s,this.dracoLoader);break;case M.KHR_TEXTURE_TRANSFORM:i[c]=new Ft;break;case M.KHR_MESH_QUANTIZATION:i[c]=new It;break;default:p.indexOf(c)>=0&&a[c]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+c+'".')}}l.setExtensions(i),l.setPlugins(a),l.parse(o,r)}parseAsync(e,t){let o=this;return new Promise(function(r,s){o.parse(e,t,r,s)})}};function oo(){let u={};return{get:function(e){return u[e]},add:function(e,t){u[e]=t},remove:function(e){delete u[e]},removeAll:function(){u={}}}}var M={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},gt=class{constructor(e){this.parser=e,this.name=M.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let o=0,r=t.length;o<r;o++){let s=t[o];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,o="light:"+e,r=t.cache.get(o);if(r)return r;let s=t.json,n=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],l,h=new N(16777215);n.color!==void 0&&h.setRGB(n.color[0],n.color[1],n.color[2],W);let c=n.range!==void 0?n.range:0;switch(n.type){case"directional":l=new tr(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Le(h),l.distance=c;break;case"spot":l=new Dr(h),l.distance=c,n.spot=n.spot||{},n.spot.innerConeAngle=n.spot.innerConeAngle!==void 0?n.spot.innerConeAngle:0,n.spot.outerConeAngle=n.spot.outerConeAngle!==void 0?n.spot.outerConeAngle:Math.PI/4,l.angle=n.spot.outerConeAngle,l.penumbra=1-n.spot.innerConeAngle/n.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+n.type)}return l.position.set(0,0,0),l.decay=2,ie(l,n),n.intensity!==void 0&&(l.intensity=n.intensity),l.name=t.createUniqueName(n.name||"light_"+e),r=Promise.resolve(l),t.cache.add(o,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,o=this.parser,s=o.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(n){return o._getNodeRef(t.cache,a,n)})}},Tt=class{constructor(){this.name=M.KHR_MATERIALS_UNLIT}getMaterialType(){return Y}extendParams(e,t,o){let r=[];e.color=new N(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let i=s.baseColorFactor;e.color.setRGB(i[0],i[1],i[2],W),e.opacity=i[3]}s.baseColorTexture!==void 0&&r.push(o.assignTexture(e,"map",s.baseColorTexture,ue))}return Promise.all(r)}},Et=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}},xt=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];if(i.clearcoatFactor!==void 0&&(t.clearcoat=i.clearcoatFactor),i.clearcoatTexture!==void 0&&s.push(o.assignTexture(t,"clearcoatMap",i.clearcoatTexture)),i.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=i.clearcoatRoughnessFactor),i.clearcoatRoughnessTexture!==void 0&&s.push(o.assignTexture(t,"clearcoatRoughnessMap",i.clearcoatRoughnessTexture)),i.clearcoatNormalTexture!==void 0&&(s.push(o.assignTexture(t,"clearcoatNormalMap",i.clearcoatNormalTexture)),i.clearcoatNormalTexture.scale!==void 0)){let a=i.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new B(a,a)}return Promise.all(s)}},Rt=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];return i.iridescenceFactor!==void 0&&(t.iridescence=i.iridescenceFactor),i.iridescenceTexture!==void 0&&s.push(o.assignTexture(t,"iridescenceMap",i.iridescenceTexture)),i.iridescenceIor!==void 0&&(t.iridescenceIOR=i.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),i.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=i.iridescenceThicknessMinimum),i.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=i.iridescenceThicknessMaximum),i.iridescenceThicknessTexture!==void 0&&s.push(o.assignTexture(t,"iridescenceThicknessMap",i.iridescenceThicknessTexture)),Promise.all(s)}},bt=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_SHEEN}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new N(0,0,0),t.sheenRoughness=0,t.sheen=1;let i=r.extensions[this.name];if(i.sheenColorFactor!==void 0){let a=i.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],W)}return i.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=i.sheenRoughnessFactor),i.sheenColorTexture!==void 0&&s.push(o.assignTexture(t,"sheenColorMap",i.sheenColorTexture,ue)),i.sheenRoughnessTexture!==void 0&&s.push(o.assignTexture(t,"sheenRoughnessMap",i.sheenRoughnessTexture)),Promise.all(s)}},At=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];return i.transmissionFactor!==void 0&&(t.transmission=i.transmissionFactor),i.transmissionTexture!==void 0&&s.push(o.assignTexture(t,"transmissionMap",i.transmissionTexture)),Promise.all(s)}},St=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_VOLUME}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];t.thickness=i.thicknessFactor!==void 0?i.thicknessFactor:0,i.thicknessTexture!==void 0&&s.push(o.assignTexture(t,"thicknessMap",i.thicknessTexture)),t.attenuationDistance=i.attenuationDistance||1/0;let a=i.attenuationColor||[1,1,1];return t.attenuationColor=new N().setRGB(a[0],a[1],a[2],W),Promise.all(s)}},vt=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_IOR}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},Mt=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_SPECULAR}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];t.specularIntensity=i.specularFactor!==void 0?i.specularFactor:1,i.specularTexture!==void 0&&s.push(o.assignTexture(t,"specularIntensityMap",i.specularTexture));let a=i.specularColorFactor||[1,1,1];return t.specularColor=new N().setRGB(a[0],a[1],a[2],W),i.specularColorTexture!==void 0&&s.push(o.assignTexture(t,"specularColorMap",i.specularColorTexture,ue)),Promise.all(s)}},Ct=class{constructor(e){this.parser=e,this.name=M.EXT_MATERIALS_BUMP}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];return t.bumpScale=i.bumpFactor!==void 0?i.bumpFactor:1,i.bumpTexture!==void 0&&s.push(o.assignTexture(t,"bumpMap",i.bumpTexture)),Promise.all(s)}},_t=class{constructor(e){this.parser=e,this.name=M.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let o=this.parser.json.materials[e];return!o.extensions||!o.extensions[this.name]?null:Z}extendMaterialParams(e,t){let o=this.parser,r=o.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],i=r.extensions[this.name];return i.anisotropyStrength!==void 0&&(t.anisotropy=i.anisotropyStrength),i.anisotropyRotation!==void 0&&(t.anisotropyRotation=i.anisotropyRotation),i.anisotropyTexture!==void 0&&s.push(o.assignTexture(t,"anisotropyMap",i.anisotropyTexture)),Promise.all(s)}},yt=class{constructor(e){this.parser=e,this.name=M.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,o=t.json,r=o.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let s=r.extensions[this.name],i=t.options.ktx2Loader;if(!i){if(o.extensionsRequired&&o.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,i)}},Ht=class{constructor(e){this.parser=e,this.name=M.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,o=this.parser,r=o.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let i=s.extensions[t],a=r.images[i.source],n=o.textureLoader;if(a.uri){let l=o.options.manager.getHandler(a.uri);l!==null&&(n=l)}return this.detectSupport().then(function(l){if(l)return o.loadTextureImage(e,i.source,n);if(r.extensionsRequired&&r.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return o.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},wt=class{constructor(e){this.parser=e,this.name=M.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,o=this.parser,r=o.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let i=s.extensions[t],a=r.images[i.source],n=o.textureLoader;if(a.uri){let l=o.options.manager.getHandler(a.uri);l!==null&&(n=l)}return this.detectSupport().then(function(l){if(l)return o.loadTextureImage(e,i.source,n);if(r.extensionsRequired&&r.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return o.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Bt=class{constructor(e){this.name=M.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,o=t.bufferViews[e];if(o.extensions&&o.extensions[this.name]){let r=o.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){let n=r.byteOffset||0,l=r.byteLength||0,h=r.count,c=r.byteStride,p=new Uint8Array(a,n,l);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(h,c,p,r.mode,r.filter).then(function(f){return f.buffer}):i.ready.then(function(){let f=new ArrayBuffer(h*c);return i.decodeGltfBuffer(new Uint8Array(f),h,c,p,r.mode,r.filter),f})})}else return null}},Dt=class{constructor(e){this.name=M.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,o=t.nodes[e];if(!o.extensions||!o.extensions[this.name]||o.mesh===void 0)return null;let r=t.meshes[o.mesh];for(let l of r.primitives)if(l.mode!==K.TRIANGLES&&l.mode!==K.TRIANGLE_STRIP&&l.mode!==K.TRIANGLE_FAN&&l.mode!==void 0)return null;let i=o.extensions[this.name].attributes,a=[],n={};for(let l in i)a.push(this.parser.getDependency("accessor",i[l]).then(h=>(n[l]=h,n[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let h=l.pop(),c=h.isGroup?h.children:[h],p=l[0].count,f=[];for(let T of c){let S=new z,m=new D,g=new Ne,E=new D(1,1,1),y=new nr(T.geometry,T.material,p);for(let A=0;A<p;A++)n.TRANSLATION&&m.fromBufferAttribute(n.TRANSLATION,A),n.ROTATION&&g.fromBufferAttribute(n.ROTATION,A),n.SCALE&&E.fromBufferAttribute(n.SCALE,A),y.setMatrixAt(A,S.compose(m,g,E));for(let A in n)if(A==="_COLOR_0"){let F=n[A];y.instanceColor=new et(F.array,F.itemSize,F.normalized)}else A!=="TRANSLATION"&&A!=="ROTATION"&&A!=="SCALE"&&T.geometry.setAttribute(A,n[A]);nt.prototype.copy.call(y,T),this.parser.assignFinalMaterial(y),f.push(y)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},zr="glTF",Me=12,Gr={JSON:1313821514,BIN:5130562},Lt=class{constructor(e){this.name=M.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Me),o=new TextDecoder;if(this.header={magic:o.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==zr)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-Me,s=new DataView(e,Me),i=0;for(;i<r;){let a=s.getUint32(i,!0);i+=4;let n=s.getUint32(i,!0);if(i+=4,n===Gr.JSON){let l=new Uint8Array(e,Me+i,a);this.content=o.decode(l)}else if(n===Gr.BIN){let l=Me+i;this.body=e.slice(l,l+a)}i+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Nt=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=M.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let o=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,i=e.extensions[this.name].attributes,a={},n={},l={};for(let h in i){let c=Ut[h]||h.toLowerCase();a[c]=i[h]}for(let h in e.attributes){let c=Ut[h]||h.toLowerCase();if(i[h]!==void 0){let p=o.accessors[e.attributes[h]],f=de[p.componentType];l[c]=f.name,n[c]=p.normalized===!0}}return t.getDependency("bufferView",s).then(function(h){return new Promise(function(c,p){r.decodeDracoFile(h,function(f){for(let T in f.attributes){let S=f.attributes[T],m=n[T];m!==void 0&&(S.normalized=m)}c(f)},a,l,W,p)})})}},Ft=class{constructor(){this.name=M.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},It=class{constructor(){this.name=M.KHR_MESH_QUANTIZATION}},Ke=class extends ar{constructor(e,t,o,r){super(e,t,o,r)}copySampleValue_(e){let t=this.resultBuffer,o=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let i=0;i!==r;i++)t[i]=o[s+i];return t}interpolate_(e,t,o,r){let s=this.resultBuffer,i=this.sampleValues,a=this.valueSize,n=a*2,l=a*3,h=r-t,c=(o-t)/h,p=c*c,f=p*c,T=e*l,S=T-l,m=-2*f+3*p,g=f-p,E=1-m,y=g-p+c;for(let A=0;A!==a;A++){let F=i[S+A+a],P=i[S+A+n]*h,H=i[T+A+a],d=i[T+A]*h;s[A]=E*F+y*P+m*H+g*d}return s}},so=new Ne,Pt=class extends Ke{interpolate_(e,t,o,r){let s=super.interpolate_(e,t,o,r);return so.fromArray(s).normalize().toArray(s),s}},K={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},de={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Or={9728:xe,9729:ae,9984:Rr,9985:fr,9986:xr,9987:st},kr={33071:Yt,33648:Er,10497:Ie},ft={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ut={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},se={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},io={CUBICSPLINE:void 0,LINEAR:ot,STEP:lr},dt={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function no(u){return u.DefaultMaterial===void 0&&(u.DefaultMaterial=new ce({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ye})),u.DefaultMaterial}function ne(u,e,t){for(let o in t.extensions)u[o]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[o]=t.extensions[o])}function ie(u,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(u.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function ao(u,e,t){let o=!1,r=!1,s=!1;for(let l=0,h=e.length;l<h;l++){let c=e[l];if(c.POSITION!==void 0&&(o=!0),c.NORMAL!==void 0&&(r=!0),c.COLOR_0!==void 0&&(s=!0),o&&r&&s)break}if(!o&&!r&&!s)return Promise.resolve(u);let i=[],a=[],n=[];for(let l=0,h=e.length;l<h;l++){let c=e[l];if(o){let p=c.POSITION!==void 0?t.getDependency("accessor",c.POSITION):u.attributes.position;i.push(p)}if(r){let p=c.NORMAL!==void 0?t.getDependency("accessor",c.NORMAL):u.attributes.normal;a.push(p)}if(s){let p=c.COLOR_0!==void 0?t.getDependency("accessor",c.COLOR_0):u.attributes.color;n.push(p)}}return Promise.all([Promise.all(i),Promise.all(a),Promise.all(n)]).then(function(l){let h=l[0],c=l[1],p=l[2];return o&&(u.morphAttributes.position=h),r&&(u.morphAttributes.normal=c),s&&(u.morphAttributes.color=p),u.morphTargetsRelative=!0,u})}function lo(u,e){if(u.updateMorphTargets(),e.weights!==void 0)for(let t=0,o=e.weights.length;t<o;t++)u.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(u.morphTargetInfluences.length===t.length){u.morphTargetDictionary={};for(let o=0,r=t.length;o<r;o++)u.morphTargetDictionary[t[o]]=o}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function co(u){let e,t=u.extensions&&u.extensions[M.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+mt(t.attributes):e=u.indices+":"+mt(u.attributes)+":"+u.mode,u.targets!==void 0)for(let o=0,r=u.targets.length;o<r;o++)e+=":"+mt(u.targets[o]);return e}function mt(u){let e="",t=Object.keys(u).sort();for(let o=0,r=t.length;o<r;o++)e+=t[o]+":"+u[t[o]]+";";return e}function Gt(u){switch(u){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function uo(u){return u.search(/\.jpe?g($|\?)/i)>0||u.search(/^data\:image\/jpeg/)===0?"image/jpeg":u.search(/\.webp($|\?)/i)>0||u.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}var ho=new z,Ot=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new oo,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let o=!1,r=!1,s=-1;typeof navigator<"u"&&(o=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,r=navigator.userAgent.indexOf("Firefox")>-1,s=r?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||o||r&&s<98?this.textureLoader=new Lr(this.options.manager):this.textureLoader=new ir(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Je(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let o=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(i){return i._markDefs&&i._markDefs()}),Promise.all(this._invokeAll(function(i){return i.beforeRoot&&i.beforeRoot()})).then(function(){return Promise.all([o.getDependencies("scene"),o.getDependencies("animation"),o.getDependencies("camera")])}).then(function(i){let a={scene:i[0][r.scene||0],scenes:i[0],animations:i[1],cameras:i[2],asset:r.asset,parser:o,userData:{}};return ne(s,a,r),ie(a,r),Promise.all(o._invokeAll(function(n){return n.afterRoot&&n.afterRoot(a)})).then(function(){e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],o=this.json.meshes||[];for(let r=0,s=t.length;r<s;r++){let i=t[r].joints;for(let a=0,n=i.length;a<n;a++)e[i[a]].isBone=!0}for(let r=0,s=e.length;r<s;r++){let i=e[r];i.mesh!==void 0&&(this._addNodeRef(this.meshCache,i.mesh),i.skin!==void 0&&(o[i.mesh].isSkinnedMesh=!0)),i.camera!==void 0&&this._addNodeRef(this.cameraCache,i.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,o){if(e.refs[t]<=1)return o;let r=o.clone(),s=(i,a)=>{let n=this.associations.get(i);n!=null&&this.associations.set(a,n);for(let[l,h]of i.children.entries())s(h,a.children[l])};return s(o,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let o=0;o<t.length;o++){let r=e(t[o]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let o=[];for(let r=0;r<t.length;r++){let s=e(t[r]);s&&o.push(s)}return o}getDependency(e,t){let o=e+":"+t,r=this.cache.get(o);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(o,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let o=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(s,i){return o.getDependency(e,i)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],o=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[M.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(s,i){o.load(le.resolveURL(t.uri,r.path),s,void 0,function(){i(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(o){let r=t.byteLength||0,s=t.byteOffset||0;return o.slice(s,s+r)})}loadAccessor(e){let t=this,o=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let i=ft[r.type],a=de[r.componentType],n=r.normalized===!0,l=new a(r.count*i);return Promise.resolve(new me(l,i,n))}let s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(i){let a=i[0],n=ft[r.type],l=de[r.componentType],h=l.BYTES_PER_ELEMENT,c=h*n,p=r.byteOffset||0,f=r.bufferView!==void 0?o.bufferViews[r.bufferView].byteStride:void 0,T=r.normalized===!0,S,m;if(f&&f!==c){let g=Math.floor(p/f),E="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+g+":"+r.count,y=t.cache.get(E);y||(S=new l(a,g*f,r.count*f/h),y=new tt(S,f/h),t.cache.add(E,y)),m=new rt(y,n,p%f/h,T)}else a===null?S=new l(r.count*n):S=new l(a,p,r.count*n),m=new me(S,n,T);if(r.sparse!==void 0){let g=ft.SCALAR,E=de[r.sparse.indices.componentType],y=r.sparse.indices.byteOffset||0,A=r.sparse.values.byteOffset||0,F=new E(i[1],y,r.sparse.count*g),P=new l(i[2],A,r.sparse.count*n);a!==null&&(m=new me(m.array.slice(),m.itemSize,m.normalized));for(let H=0,d=F.length;H<d;H++){let x=F[H];if(m.setX(x,P[H*n]),n>=2&&m.setY(x,P[H*n+1]),n>=3&&m.setZ(x,P[H*n+2]),n>=4&&m.setW(x,P[H*n+3]),n>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return m})}loadTexture(e){let t=this.json,o=this.options,s=t.textures[e].source,i=t.images[s],a=this.textureLoader;if(i.uri){let n=o.manager.getHandler(i.uri);n!==null&&(a=n)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,o){let r=this,s=this.json,i=s.textures[e],a=s.images[t],n=(a.uri||a.bufferView)+":"+i.sampler;if(this.textureCache[n])return this.textureCache[n];let l=this.loadImageSource(t,o).then(function(h){h.flipY=!1,h.name=i.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let p=(s.samplers||{})[i.sampler]||{};return h.magFilter=Or[p.magFilter]||ae,h.minFilter=Or[p.minFilter]||st,h.wrapS=kr[p.wrapS]||Ie,h.wrapT=kr[p.wrapT]||Ie,r.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[n]=l,l}loadImageSource(e,t){let o=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(c=>c.clone());let i=r.images[e],a=self.URL||self.webkitURL,n=i.uri||"",l=!1;if(i.bufferView!==void 0)n=o.getDependency("bufferView",i.bufferView).then(function(c){l=!0;let p=new Blob([c],{type:i.mimeType});return n=a.createObjectURL(p),n});else if(i.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(n).then(function(c){return new Promise(function(p,f){let T=p;t.isImageBitmapLoader===!0&&(T=function(S){let m=new at(S);m.needsUpdate=!0,p(m)}),t.load(le.resolveURL(c,s.path),T,void 0,f)})}).then(function(c){return l===!0&&a.revokeObjectURL(n),c.userData.mimeType=i.mimeType||uo(i.uri),c}).catch(function(c){throw console.error("THREE.GLTFLoader: Couldn't load texture",n),c});return this.sourceCache[e]=h,h}assignTexture(e,t,o,r){let s=this;return this.getDependency("texture",o.index).then(function(i){if(!i)return null;if(o.texCoord!==void 0&&o.texCoord>0&&(i=i.clone(),i.channel=o.texCoord),s.extensions[M.KHR_TEXTURE_TRANSFORM]){let a=o.extensions!==void 0?o.extensions[M.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let n=s.associations.get(i);i=s.extensions[M.KHR_TEXTURE_TRANSFORM].extendTexture(i,a),s.associations.set(i,n)}}return r!==void 0&&(i.colorSpace=r),e[t]=i,i})}assignFinalMaterial(e){let t=e.geometry,o=e.material,r=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,i=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+o.uuid,n=this.cache.get(a);n||(n=new Sr,we.prototype.copy.call(n,o),n.color.copy(o.color),n.map=o.map,n.sizeAttenuation=!1,this.cache.add(a,n)),o=n}else if(e.isLine){let a="LineBasicMaterial:"+o.uuid,n=this.cache.get(a);n||(n=new ur,we.prototype.copy.call(n,o),n.color.copy(o.color),n.map=o.map,this.cache.add(a,n)),o=n}if(r||s||i){let a="ClonedMaterial:"+o.uuid+":";r&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),i&&(a+="flat-shading:");let n=this.cache.get(a);n||(n=o.clone(),s&&(n.vertexColors=!0),i&&(n.flatShading=!0),r&&(n.normalScale&&(n.normalScale.y*=-1),n.clearcoatNormalScale&&(n.clearcoatNormalScale.y*=-1)),this.cache.add(a,n),this.associations.set(n,this.associations.get(o))),o=n}e.material=o}getMaterialType(){return ce}loadMaterial(e){let t=this,o=this.json,r=this.extensions,s=o.materials[e],i,a={},n=s.extensions||{},l=[];if(n[M.KHR_MATERIALS_UNLIT]){let c=r[M.KHR_MATERIALS_UNLIT];i=c.getMaterialType(),l.push(c.extendParams(a,s,t))}else{let c=s.pbrMetallicRoughness||{};if(a.color=new N(1,1,1),a.opacity=1,Array.isArray(c.baseColorFactor)){let p=c.baseColorFactor;a.color.setRGB(p[0],p[1],p[2],W),a.opacity=p[3]}c.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",c.baseColorTexture,ue)),a.metalness=c.metallicFactor!==void 0?c.metallicFactor:1,a.roughness=c.roughnessFactor!==void 0?c.roughnessFactor:1,c.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",c.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",c.metallicRoughnessTexture))),i=this._invokeOne(function(p){return p.getMaterialType&&p.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(p){return p.extendMaterialParams&&p.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=rr);let h=s.alphaMode||dt.OPAQUE;if(h===dt.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===dt.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&i!==Y&&(l.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new B(1,1),s.normalTexture.scale!==void 0)){let c=s.normalTexture.scale;a.normalScale.set(c,c)}if(s.occlusionTexture!==void 0&&i!==Y&&(l.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&i!==Y){let c=s.emissiveFactor;a.emissive=new N().setRGB(c[0],c[1],c[2],W)}return s.emissiveTexture!==void 0&&i!==Y&&l.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,ue)),Promise.all(l).then(function(){let c=new i(a);return s.name&&(c.name=s.name),ie(c,s),t.associations.set(c,{materials:e}),s.extensions&&ne(r,c,s),c})}createUniqueName(e){let t=vr.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,o=this.extensions,r=this.primitiveCache;function s(a){return o[M.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(n){return Vr(n,a,t)})}let i=[];for(let a=0,n=e.length;a<n;a++){let l=e[a],h=co(l),c=r[h];if(c)i.push(c.promise);else{let p;l.extensions&&l.extensions[M.KHR_DRACO_MESH_COMPRESSION]?p=s(l):p=Vr(new ge,l,t),r[h]={primitive:l,promise:p},i.push(p)}}return Promise.all(i)}loadMesh(e){let t=this,o=this.json,r=this.extensions,s=o.meshes[e],i=s.primitives,a=[];for(let n=0,l=i.length;n<l;n++){let h=i[n].material===void 0?no(this.cache):this.getDependency("material",i[n].material);a.push(h)}return a.push(t.loadGeometries(i)),Promise.all(a).then(function(n){let l=n.slice(0,n.length-1),h=n[n.length-1],c=[];for(let f=0,T=h.length;f<T;f++){let S=h[f],m=i[f],g,E=l[f];if(m.mode===K.TRIANGLES||m.mode===K.TRIANGLE_STRIP||m.mode===K.TRIANGLE_FAN||m.mode===void 0)g=s.isSkinnedMesh===!0?new wr(S,E):new I(S,E),g.isSkinnedMesh===!0&&g.normalizeSkinWeights(),m.mode===K.TRIANGLE_STRIP?g.geometry=pt(g.geometry,Pe):m.mode===K.TRIANGLE_FAN&&(g.geometry=pt(g.geometry,Re));else if(m.mode===K.LINES)g=new pr(S,E);else if(m.mode===K.LINE_STRIP)g=new cr(S,E);else if(m.mode===K.LINE_LOOP)g=new hr(S,E);else if(m.mode===K.POINTS)g=new Ar(S,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(g.geometry.morphAttributes).length>0&&lo(g,s),g.name=t.createUniqueName(s.name||"mesh_"+e),ie(g,s),m.extensions&&ne(r,g,m),t.assignFinalMaterial(g),c.push(g)}for(let f=0,T=c.length;f<T;f++)t.associations.set(c[f],{meshes:e,primitives:f});if(c.length===1)return s.extensions&&ne(r,c[0],s),c[0];let p=new He;s.extensions&&ne(r,p,s),t.associations.set(p,{meshes:e});for(let f=0,T=c.length;f<T;f++)p.add(c[f]);return p})}loadCamera(e){let t,o=this.json.cameras[e],r=o[o.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return o.type==="perspective"?t=new De(gr.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):o.type==="orthographic"&&(t=new Be(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),o.name&&(t.name=this.createUniqueName(o.name)),ie(t,o),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],o=[];for(let r=0,s=t.joints.length;r<s;r++)o.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?o.push(this.getDependency("accessor",t.inverseBindMatrices)):o.push(null),Promise.all(o).then(function(r){let s=r.pop(),i=r,a=[],n=[];for(let l=0,h=i.length;l<h;l++){let c=i[l];if(c){a.push(c);let p=new z;s!==null&&p.fromArray(s.array,l*16),n.push(p)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Hr(a,n)})}loadAnimation(e){let t=this.json,o=this,r=t.animations[e],s=r.name?r.name:"animation_"+e,i=[],a=[],n=[],l=[],h=[];for(let c=0,p=r.channels.length;c<p;c++){let f=r.channels[c],T=r.samplers[f.sampler],S=f.target,m=S.node,g=r.parameters!==void 0?r.parameters[T.input]:T.input,E=r.parameters!==void 0?r.parameters[T.output]:T.output;S.node!==void 0&&(i.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",g)),n.push(this.getDependency("accessor",E)),l.push(T),h.push(S))}return Promise.all([Promise.all(i),Promise.all(a),Promise.all(n),Promise.all(l),Promise.all(h)]).then(function(c){let p=c[0],f=c[1],T=c[2],S=c[3],m=c[4],g=[];for(let E=0,y=p.length;E<y;E++){let A=p[E],F=f[E],P=T[E],H=S[E],d=m[E];if(A===void 0)continue;A.updateMatrix&&A.updateMatrix();let x=o._createAnimationTracks(A,F,P,H,d);if(x)for(let v=0;v<x.length;v++)g.push(x[v])}return new Ze(s,void 0,g)})}createNodeMesh(e){let t=this.json,o=this,r=t.nodes[e];return r.mesh===void 0?null:o.getDependency("mesh",r.mesh).then(function(s){let i=o._getNodeRef(o.meshCache,r.mesh,s);return r.weights!==void 0&&i.traverse(function(a){if(a.isMesh)for(let n=0,l=r.weights.length;n<l;n++)a.morphTargetInfluences[n]=r.weights[n]}),i})}loadNode(e){let t=this.json,o=this,r=t.nodes[e],s=o._loadNodeShallow(e),i=[],a=r.children||[];for(let l=0,h=a.length;l<h;l++)i.push(o.getDependency("node",a[l]));let n=r.skin===void 0?Promise.resolve(null):o.getDependency("skin",r.skin);return Promise.all([s,Promise.all(i),n]).then(function(l){let h=l[0],c=l[1],p=l[2];p!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(p,ho)});for(let f=0,T=c.length;f<T;f++)h.add(c[f]);return h})}_loadNodeShallow(e){let t=this.json,o=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],i=s.name?r.createUniqueName(s.name):"",a=[],n=r._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return n&&a.push(n),s.camera!==void 0&&a.push(r.getDependency("camera",s.camera).then(function(l){return r._getNodeRef(r.cameraCache,s.camera,l)})),r._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let h;if(s.isBone===!0?h=new Kt:l.length>1?h=new He:l.length===1?h=l[0]:h=new nt,h!==l[0])for(let c=0,p=l.length;c<p;c++)h.add(l[c]);if(s.name&&(h.userData.name=s.name,h.name=i),ie(h,s),s.extensions&&ne(o,h,s),s.matrix!==void 0){let c=new z;c.fromArray(s.matrix),h.applyMatrix4(c)}else s.translation!==void 0&&h.position.fromArray(s.translation),s.rotation!==void 0&&h.quaternion.fromArray(s.rotation),s.scale!==void 0&&h.scale.fromArray(s.scale);return r.associations.has(h)||r.associations.set(h,{}),r.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,o=this.json.scenes[e],r=this,s=new He;o.name&&(s.name=r.createUniqueName(o.name)),ie(s,o),o.extensions&&ne(t,s,o);let i=o.nodes||[],a=[];for(let n=0,l=i.length;n<l;n++)a.push(r.getDependency("node",i[n]));return Promise.all(a).then(function(n){for(let h=0,c=n.length;h<c;h++)s.add(n[h]);let l=h=>{let c=new Map;for(let[p,f]of r.associations)(p instanceof we||p instanceof at)&&c.set(p,f);return h.traverse(p=>{let f=r.associations.get(p);f!=null&&c.set(p,f)}),c};return r.associations=l(s),s})}_createAnimationTracks(e,t,o,r,s){let i=[],a=e.name?e.name:e.uuid,n=[];se[s.path]===se.weights?e.traverse(function(p){p.morphTargetInfluences&&n.push(p.name?p.name:p.uuid)}):n.push(a);let l;switch(se[s.path]){case se.weights:l=it;break;case se.rotation:l=Fe;break;case se.position:case se.scale:l=Ue;break;default:switch(o.itemSize){case 1:l=it;break;case 2:case 3:default:l=Ue;break}break}let h=r.interpolation!==void 0?io[r.interpolation]:ot,c=this._getArrayFromAccessor(o);for(let p=0,f=n.length;p<f;p++){let T=new l(n[p]+"."+se[s.path],t.array,c,h);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(T),i.push(T)}return i}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let o=Gt(t.constructor),r=new Float32Array(t.length);for(let s=0,i=t.length;s<i;s++)r[s]=t[s]*o;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(o){let r=this instanceof Fe?Pt:Ke;return new r(this.times,this.values,this.getValueSize()/3,o)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function po(u,e,t){let o=e.attributes,r=new Xt;if(o.POSITION!==void 0){let a=t.json.accessors[o.POSITION],n=a.min,l=a.max;if(n!==void 0&&l!==void 0){if(r.set(new D(n[0],n[1],n[2]),new D(l[0],l[1],l[2])),a.normalized){let h=Gt(de[a.componentType]);r.min.multiplyScalar(h),r.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let s=e.targets;if(s!==void 0){let a=new D,n=new D;for(let l=0,h=s.length;l<h;l++){let c=s[l];if(c.POSITION!==void 0){let p=t.json.accessors[c.POSITION],f=p.min,T=p.max;if(f!==void 0&&T!==void 0){if(n.setX(Math.max(Math.abs(f[0]),Math.abs(T[0]))),n.setY(Math.max(Math.abs(f[1]),Math.abs(T[1]))),n.setZ(Math.max(Math.abs(f[2]),Math.abs(T[2]))),p.normalized){let S=Gt(de[p.componentType]);n.multiplyScalar(S)}a.max(n)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(a)}u.boundingBox=r;let i=new Br;r.getCenter(i.center),i.radius=r.min.distanceTo(r.max)/2,u.boundingSphere=i}function Vr(u,e,t){let o=e.attributes,r=[];function s(i,a){return t.getDependency("accessor",i).then(function(n){u.setAttribute(a,n)})}for(let i in o){let a=Ut[i]||i.toLowerCase();a in u.attributes||r.push(s(o[i],a))}if(e.indices!==void 0&&!u.index){let i=t.getDependency("accessor",e.indices).then(function(a){u.setIndex(a)});r.push(i)}return Te.workingColorSpace!==W&&"COLOR_0"in o&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Te.workingColorSpace}" not supported.`),ie(u,e),po(u,e,t),Promise.all(r).then(function(){return e.targets!==void 0?ao(u,e.targets,t):u})}var Xe=class extends $t{constructor(e){super(e),this.type=V}parse(e){let i=function(d,x){switch(d){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(x||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(x||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(x||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(x||""))}},c=function(d,x,v){x=x||1024;let C=d.pos,L=-1,b=0,_="",R=String.fromCharCode.apply(null,new Uint16Array(d.subarray(C,C+128)));for(;0>(L=R.indexOf(`
`))&&b<x&&C<d.byteLength;)_+=R,b+=R.length,C+=128,R+=String.fromCharCode.apply(null,new Uint16Array(d.subarray(C,C+128)));return-1<L?(v!==!1&&(d.pos+=b+L+1),_+R.slice(0,L)):!1},p=function(d){let x=/^#\?(\S+)/,v=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,w=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,C=/^\s*FORMAT=(\S+)\s*$/,L=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,b={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},_,R;for((d.pos>=d.byteLength||!(_=c(d)))&&i(1,"no header found"),(R=_.match(x))||i(3,"bad initial token"),b.valid|=1,b.programtype=R[1],b.string+=_+`
`;_=c(d),_!==!1;){if(b.string+=_+`
`,_.charAt(0)==="#"){b.comments+=_+`
`;continue}if((R=_.match(v))&&(b.gamma=parseFloat(R[1])),(R=_.match(w))&&(b.exposure=parseFloat(R[1])),(R=_.match(C))&&(b.valid|=2,b.format=R[1]),(R=_.match(L))&&(b.valid|=4,b.height=parseInt(R[1],10),b.width=parseInt(R[2],10)),b.valid&2&&b.valid&4)break}return b.valid&2||i(3,"missing format specifier"),b.valid&4||i(3,"missing image size specifier"),b},f=function(d,x,v){let w=x;if(w<8||w>32767||d[0]!==2||d[1]!==2||d[2]&128)return new Uint8Array(d);w!==(d[2]<<8|d[3])&&i(3,"wrong scanline width");let C=new Uint8Array(4*x*v);C.length||i(4,"unable to allocate buffer space");let L=0,b=0,_=4*w,R=new Uint8Array(4),re=new Uint8Array(_),ee=v;for(;ee>0&&b<d.byteLength;){b+4>d.byteLength&&i(1),R[0]=d[b++],R[1]=d[b++],R[2]=d[b++],R[3]=d[b++],(R[0]!=2||R[1]!=2||(R[2]<<8|R[3])!=w)&&i(3,"bad rgbe scanline format");let U=0,X;for(;U<_&&b<d.byteLength;){X=d[b++];let q=X>128;if(q&&(X-=128),(X===0||U+X>_)&&i(3,"bad scanline data"),q){let j=d[b++];for(let kt=0;kt<X;kt++)re[U++]=j}else re.set(d.subarray(b,b+X),U),U+=X,b+=X}let qe=w;for(let q=0;q<qe;q++){let j=0;C[L]=re[q+j],j+=w,C[L+1]=re[q+j],j+=w,C[L+2]=re[q+j],j+=w,C[L+3]=re[q+j],L+=4}ee--}return C},T=function(d,x,v,w){let C=d[x+3],L=Math.pow(2,C-128)/255;v[w+0]=d[x+0]*L,v[w+1]=d[x+1]*L,v[w+2]=d[x+2]*L,v[w+3]=1},S=function(d,x,v,w){let C=d[x+3],L=Math.pow(2,C-128)/255;v[w+0]=Ee.toHalfFloat(Math.min(d[x+0]*L,65504)),v[w+1]=Ee.toHalfFloat(Math.min(d[x+1]*L,65504)),v[w+2]=Ee.toHalfFloat(Math.min(d[x+2]*L,65504)),v[w+3]=Ee.toHalfFloat(1)},m=new Uint8Array(e);m.pos=0;let g=p(m),E=g.width,y=g.height,A=f(m.subarray(m.pos),E,y),F,P,H;switch(this.type){case _e:H=A.length/4;let d=new Float32Array(H*4);for(let v=0;v<H;v++)T(A,v*4,d,v*4);F=d,P=_e;break;case V:H=A.length/4;let x=new Uint16Array(H*4);for(let v=0;v<H;v++)S(A,v*4,x,v*4);F=x,P=V;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:E,height:y,data:F,header:g.string,gamma:g.gamma,exposure:g.exposure,type:P}}setDataType(e){return this.type=e,this}load(e,t,o,r){function s(i,a){switch(i.type){case _e:case V:i.colorSpace=W,i.minFilter=ae,i.magFilter=ae,i.generateMipmaps=!1,i.flipY=!0;break}t&&t(i,a)}return super.load(e,s,o,r)}};function jr(u){let e=new Map,t=new Map,o=u.clone();return Wr(u,o,function(r,s){e.set(s,r),t.set(r,s)}),o.traverse(function(r){if(!r.isSkinnedMesh)return;let s=r,i=e.get(r),a=i.skeleton.bones;s.skeleton=i.skeleton.clone(),s.bindMatrix.copy(i.bindMatrix),s.skeleton.bones=a.map(function(n){return t.get(n)}),s.bind(s.skeleton,s.bindMatrix)}),o}function Wr(u,e,t){t(u,e);for(let o=0;o<u.children.length;o++)Wr(u.children[o],e.children[o],t)}return Zr(fo);})();
