/* ============================================================
   最终视觉系统整合 · 国风漫剧电影质感
   统一调色/氛围/光影的最终确认
   ============================================================ */

class FinalVisualPolish {
  // 最终色调统一（国风电影色）
  colorGrading() {
    if (typeof renderer !== 'undefined') {
      // ACES Filmic ToneMapping 已在05-rendering.js中设置
      // 这里做最终确认
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1; // 稍微提高曝光
      console.log('[FinalVisualPolish] 色调映射已确认为ACESFilmic，曝光1.1');
    }
  },

  // 雾效最终调整（国风薄雾）
  fogPolish() {
    if (typeof scene !== 'undefined') {
      scene.fog = new THREE.Fog(0xf0d8b8, 100, 1000); // 暖色调，远雾
      scene.fog.color.setHex(0xf0d8b8);
      console.log('[FinalVisualPolish] 雾效已调整为暖色调薄雾');
    }
  },

  // 环境光最终调整
  ambientPolish() {
    if (typeof ambientLight !== 'undefined') {
      ambientLight.color.setHex(0xffe8d0); // 暖白色环境光
      ambientLight.intensity = 0.5;
      console.log('[FinalVisualPolish] 环境光已调整为暖白色');
    }
  },

  // 主光源最终调整（黄金时刻）
  sunPolish() {
    if (typeof sunLight !== 'undefined') {
      sunLight.color.setHex(0xffd4a0); // 暖金色
      sunLight.intensity = 1.3;
      sunLight.position.set(200, 100, 100); // 低角度黄金时刻
      console.log('[FinalVisualPolish] 主光源已调整为黄金时刻暖金色');
    }
  },

  init() {
    this.colorGrading();
    this.fogPolish();
    this.ambientPolish();
    this.sunPolish();
    console.log('[FinalVisualPolish] 最终视觉系统整合完成 - 国风漫剧电影质感');
  },
}

if (typeof buildWorld !== 'undefined') {
  const origBuild = buildWorld;
  buildWorld = async function() {
    await origBuild();
    new FinalVisualPolish().init();
  };
}
