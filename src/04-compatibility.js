/* Three r150's MIT bone-texture lookup, adapted for r160's material API.
 * Source and checksum: vendor/three-r150-skinning_pars_vertex.glsl.SOURCE.txt.
 * WebGL1 has texture2D, but no textureSize/texelFetch. Native WebGL2 keeps r160.
 */
const LegacySkinning=(() => {
  const enabled=!renderer.capabilities.isWebGL2;
  const prepared=new WeakSet(),materials=new WeakMap(),depthMaterials=new Map();
  let meshes=0;
  if(enabled)THREE.ShaderChunk.skinning_pars_vertex=`
    #ifdef USE_SKINNING
      uniform mat4 bindMatrix;
      uniform mat4 bindMatrixInverse;
      uniform highp sampler2D boneTexture;
      uniform int boneTextureSize;
      mat4 getBoneMatrix(const in float i) {
        float j=i*4.0;
        float x=mod(j,float(boneTextureSize));
        float y=floor(j/float(boneTextureSize));
        float dx=1.0/float(boneTextureSize);
        float dy=1.0/float(boneTextureSize);
        y=dy*(y+.5);
        vec4 v1=texture2D(boneTexture,vec2(dx*(x+.5),y));
        vec4 v2=texture2D(boneTexture,vec2(dx*(x+1.5),y));
        vec4 v3=texture2D(boneTexture,vec2(dx*(x+2.5),y));
        vec4 v4=texture2D(boneTexture,vec2(dx*(x+3.5),y));
        return mat4(v1,v2,v3,v4);
      }
    #endif`;

  function materialFor(source,size) {
    if(!materials.has(source))materials.set(source,new Map());
    const variants=materials.get(source);
    if(variants.has(size))return variants.get(size);
    const material=source.clone(),hook=source.onBeforeCompile,key=source.customProgramCacheKey();
    material.onBeforeCompile=(shader,renderer)=>{
      hook.call(material,shader,renderer);
      shader.uniforms.boneTextureSize={value:size};
    };
    material.customProgramCacheKey=()=>key+'-webgl1-bones-'+size;
    variants.set(size,material);return material;
  }
  function depthFor(size) {
    if(depthMaterials.has(size))return depthMaterials.get(size);
    const material=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
    material.onBeforeCompile=shader=>{shader.uniforms.boneTextureSize={value:size};};
    material.customProgramCacheKey=()=> 'webgl1-skin-shadow-'+size;
    depthMaterials.set(size,material);return material;
  }
  return {
    prepareScene(root) {
      if(!enabled)return;
      root.traverse(mesh=>{
        if(!mesh.isSkinnedMesh||prepared.has(mesh))return;
        const skeleton=mesh.skeleton;
        if(!skeleton.boneTexture)skeleton.computeBoneTexture();
        const size=skeleton.boneTexture.image.width;
        mesh.material=Array.isArray(mesh.material)?mesh.material.map(m=>materialFor(m,size)):materialFor(mesh.material,size);
        mesh.customDepthMaterial=depthFor(size);
        prepared.add(mesh);meshes++;
      });
    },
    getStatus(){return {enabled,meshes,floatVertexTextures:renderer.capabilities.floatVertexTextures};},
  };
})();
