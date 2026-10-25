/* ============================================================
   额外景点扩展 · 太极宫 / 小雁塔 / 青龙寺 / 通化门
   ============================================================ */

// 在 Explore.init() 之前扩展 places 数组
(function() {
  const extraPlaces = [
    { name: '太极晨钟', note: '钟鼓初歇，宫阙肃穆', x: 0, z: -300, yaw: 0, focus: [0, 8, -340], radius: 75, height: 38 },
    { name: '雁塔晚钟', note: '荐福寺古塔，晨钟暮鼓', x: -216, z: 360, yaw: Math.PI, focus: [-216, 18, 349], radius: 60, height: 36 },
    { name: '青龙春晓', note: '乐游原上，樱花满径', x: 180, z: -180, yaw: 0.6, focus: [180, 6, -180], radius: 80, height: 28 },
    { name: '通化远眺', note: '东郭城门，一望平林', x: 480, z: 0, yaw: Math.PI / 2, focus: [460, 8, 0], radius: 65, height: 26 },
  ];
  
  // 合并到 Explore.places
  if (typeof Explore !== 'undefined' && Explore.places) {
    Explore.places = Explore.places.concat(extraPlaces);
  }
})();
