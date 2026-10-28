/* ============================================================
   季节变化系统增强 v2.0
   春夏秋冬四季变化、植被颜色、节日氛围
   ============================================================ */

const SeasonSystemEnhancer = {
  
  seasons: {
    SPRING: 'spring',
    SUMMER: 'summer',
    AUTUMN: 'autumn',
    WINTER: 'winter'
  },
  
  currentSeason: 'spring',
  
  seasonLength: 7,
  
  dayCount: 0,
  
  seasonColors: {
    spring: {
      foliage: 0x7ac142,
      flower: 0xffb7c5,
      fog: 0xd4e5d4,
      ambient: 0.8,
    },
    summer: {
      foliage: 0x2d5016,
      flower: 0xff6b6b,
      fog: 0xd4e5f0,
      ambient: 1.0,
    },
    autumn: {
      foliage: 0xd4763a,
      flower: 0xd4a63a,
      fog: 0xe5d4c4,
      ambient: 0.7,
    },
    winter: {
      foliage: 0x4a5a4a,
      flower: 0xffffff,
      fog: 0xe0e8f0,
      ambient: 0.5,
    }
  },
  
  init() {
    console.log('[Season] 季节系统初始化完成，当前季节:', this.currentSeason);
  },
  
  setSeason(season) {
    this.currentSeason = season;
    this.applySeason();
    console.log('[Season] 切换到季节:', season);
  },
  
  applySeason() {
    const colors = this.seasonColors[this.currentSeason];
    if (!colors) return;
    
    console.log('[Season] 应用季节颜色:', colors);
    
    if (window.GAME?.scene) {
      GAME.scene.traverse((child) => {
        if (child.isMesh && child.material?.color) {
          if (child.userData.type === 'tree' || child.userData.type === 'foliage') {
            child.material.color.set(colors.foliage);
          }
        }
      });
    }
  },
  
  onNewDay() {
    this.dayCount++;
    
    if (this.dayCount >= this.seasonLength) {
      this.dayCount = 0;
      this.nextSeason();
    }
  },
  
  nextSeason() {
    const order = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = order.indexOf(this.currentSeason);
    const nextIndex = (currentIndex + 1) % order.length;
    
    this.setSeason(order[nextIndex]);
    
    if (window.NotificationSystemEnhancer) {
      const seasonNames = {
        spring: '春天',
        summer: '夏天',
        autumn: '秋天',
        winter: '冬天',
      };
      NotificationSystemEnhancer.info('季节变化', `现在是${seasonNames[this.currentSeason]}`);
    }
  },
  
  getSeasonName() {
    const names = {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬',
    };
    return names[this.currentSeason];
  },
  
  getSeasonDescription() {
    const descriptions = {
      spring: '万物复苏，桃花盛开',
      summer: '绿树成荫，荷花映日',
      autumn: '金秋送爽，红叶满山',
      winter: '白雪皑皑，银装素裹',
    };
    return descriptions[this.currentSeason];
  },
  
  getFestivals() {
    const festivals = {
      spring: ['上元节', '上巳节'],
      summer: ['端午节', '七夕节'],
      autumn: ['中秋节', '重阳节'],
      winter: ['冬至', '春节'],
    };
    return festivals[this.currentSeason] || [];
  }
};

window.SeasonSystemEnhancer = SeasonSystemEnhancer;

console.log('[Season] 季节变化系统增强模块加载完成');
