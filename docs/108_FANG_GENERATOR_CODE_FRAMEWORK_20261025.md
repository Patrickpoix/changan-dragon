# 108坊生成器代码框架设计（2026-10-25）

> 108坊程序化生成器的代码结构设计。

---

## 一、文件结构

```
src/generator/
├── FangGenerator.js      # 主生成器
├── FangTypes.js           # 坊类型定义
├── BuildingPlacer.js      # 建筑放置器
├── VegetationPlacer.js   # 植被放置器
├── NPCPlacer.js           # NPC放置器
├── MaterialAssigner.js    # 材质分配器
└── utils/
    ├── mulberry32.js      # 随机数生成器
    ├── geometryUtils.js    # 几何工具
    └── meshUtils.js        # 网格工具
```

---

## 二、主生成器

### FangGenerator类
```javascript
class FangGenerator {
  constructor(config) {
    this.fangList = config.fangList;  // 108个坊
    this.buildingKits = config.buildingKits;  // 25个kit
    this.materials = config.materials;  // 材质库
  }

  generateFang(fangData) {
    // 1. 分配seed
    const seed = fangData.seed;
    const rand = mulberry32(seed);

    // 2. 选择建筑组合
    const buildings = this.selectBuildings(fangData.type, rand);

    // 3. 放置建筑
    const buildingGroup = this.placeBuildings(buildings, fangData.bounds, rand);

    // 4. 分配材质
    this.assignMaterials(buildingGroup, fangData.type);

    // 5. 放置植被
    const vegetation = this.placeVegetation(fangData.type, fangData.bounds, rand);

    // 6. 分配NPC
    const npcs = this.placeNPCs(fangData.type, fangData.bounds, rand);

    return {
      buildings: buildingGroup,
      vegetation: vegetation,
      npcs: npcs,
      bounds: fangData.bounds
    };
  }
}
```

---

## 三、坊类型定义

### FangTypes.js
```javascript
export const FANG_TYPES = {
  GOVERNMENT: {
    name: '官署区',
    buildingHeight: '2-3层',
    roofColor: '灰+绿',
    wallColor: '土白+朱红',
    gateLevel: '高大门戟',
    vegetationDensity: '中',
    npcDensity: '中',
    npcTypes: ['official_high', 'official_mid', 'soldier']
  },

  NOBLE: {
    name: '贵族住宅区',
    buildingHeight: '1-2层',
    roofColor: '灰+绿',
    wallColor: '土白+朱红',
    gateLevel: '朱红照壁',
    vegetationDensity: '高',
    npcDensity: '低',
    npcTypes: ['noble_woman', 'servant']
  },

  COMMONER: {
    name: '平民里坊',
    buildingHeight: '1层',
    roofColor: '灰',
    wallColor: '土白/土黄',
    gateLevel: '小门门楼',
    vegetationDensity: '低',
    npcDensity: '高',
    npcTypes: ['commoner', 'woman', 'child', 'craftsman']
  },

  TEMPLE: {
    name: '寺庙区',
    buildingHeight: '1-2层',
    roofColor: '灰',
    wallColor: '土黄/深木',
    gateLevel: '山门钟楼',
    vegetationDensity: '高',
    npcDensity: '中',
    npcTypes: ['monk', 'pilgrim']
  },

  MARKET: {
    name: '商业区',
    buildingHeight: '2-3层',
    roofColor: '灰',
    wallColor: '木色+布篷',
    gateLevel: '临街招牌',
    vegetationDensity: '低',
    npcDensity: '极高',
    npcTypes: ['merchant', 'customer', 'foreigner']
  },

  ENTERTAINMENT: {
    name: '娱乐区',
    buildingHeight: '2-3层',
    roofColor: '灰',
    wallColor: '木色+装饰',
    gateLevel: '华丽灯笼',
    vegetationDensity: '中',
    npcDensity: '高',
    npcTypes: ['scholar', 'entertainer', 'customer']
  },

  GARDEN: {
    name: '园林风景区',
    buildingHeight: '1层',
    roofColor: '灰',
    wallColor: '白墙+木色',
    gateLevel: '园门亭台',
    vegetationDensity: '极高',
    npcDensity: '中',
    npcTypes: ['visitor', 'noble_woman', 'scholar']
  },

  WORKSHOP: {
    name: '作坊区',
    buildingHeight: '1层',
    roofColor: '灰',
    wallColor: '土黄/简陋',
    gateLevel: '简陋烟囱',
    vegetationDensity: '极低',
    npcDensity: '中',
    npcTypes: ['craftsman', 'apprentice']
  }
};
```

---

## 四、建筑放置器

### BuildingPlacer.js
```javascript
class BuildingPlacer {
  placeBuildings(fangType, bounds, rand) {
    const buildings = [];

    // 坊内十字街
    const roadX = bounds.centerX;
    const roadZ = bounds.centerZ;

    // 四个象限
    const quads = [
      { x: bounds.minX, z: bounds.minZ },
      { x: roadX, z: bounds.minZ },
      { x: bounds.minX, z: roadZ },
      { x: roadX, z: roadZ }
    ];

    // 每个象限放建筑
    for (const quad of quads) {
      const count = Math.floor(rand() * 5) + 3;  // 3-7栋
      for (let i = 0; i < count; i++) {
        const building = this.pickBuilding(fangType, rand);
        const x = quad.x + rand() * 100;
        const z = quad.z + rand() * 100;
        buildings.push({ ...building, x, z });
      }
    }

    return buildings;
  }
}
```

---

## 五、使用示例

```javascript
// 创建生成器
const generator = new FangGenerator({
  fangList: fangListData,
  buildingKits: buildingKits,
  materials: materialLibrary
});

// 生成一个坊
const fang = generator.generateFang({
  type: 'COMMONER',
  bounds: { minX: -1000, maxX: -500, minZ: 1000, maxZ: 1500, centerX: -750, centerZ: 1250 },
  seed: 12345
});

// 添加到场景
scene.add(fang.buildings);
scene.add(fang.vegetation);
```

---
文档日期：2026-10-25
