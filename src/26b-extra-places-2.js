/* ============================================================
   额外景点第二批 · 从12个增加到16个
   ============================================================ */

(function() {
  const morePlaces = [
    { name: '东市繁华', note: '四方珍奇，皆所积集', x: 174, z: 0, yaw: Math.PI, focus: [174, 6, -14], radius: 80, height: 32 },
    { name: '西市胡风', note: '胡姬酒肆，波斯商队', x: -258, z: 0, yaw: 0, focus: [-258, 6, -14], radius: 80, height: 32 },
    { name: '芙蓉园春', note: '柳丝拂水，杏花如雪', x: 420, z: 300, yaw: 2.8, focus: [354, 4, 318], radius: 90, height: 25 },
    { name: '宫城夜色', note: '月照宫墙，万家灯火', x: 0, z: -280, yaw: Math.PI, focus: [0, 10, -330], radius: 85, height: 40 },
  ];
  
  if (typeof Explore !== 'undefined' && Explore.places) {
    Explore.places = Explore.places.concat(morePlaces);
  }
})();
