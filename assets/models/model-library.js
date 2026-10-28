/* ============================================================
   龙游长安 模型库集成 v1.0
   统一入口：建筑、人物、植被、桥梁、动物、交通工具、奇观
   ============================================================ */

const ChangAnModelLibrary = {
  
  Architecture: {
    Palace: TangArchPro ? TangArchPro.createPalace : null,
    Temple: TangArchPro ? TangArchPro.createTemple : null,
    Pagoda: TangArchPro ? TangArchPro.createPagoda : null,
    House: TangArchPro ? TangArchPro.createHouse : null,
  },
  
  Character: {
    Official: TangCharacterBuilder ? TangCharacterBuilder.createOfficial : null,
    Lady: TangCharacterBuilder ? TangCharacterBuilder.createLady : null,
    Commoner: TangCharacterBuilder ? TangCharacterBuilder.createCommoner : null,
  },
  
  Nature: {
    Pine: TangNatureBuilder ? TangNatureBuilder.createPine : null,
    Willow: TangNatureBuilder ? TangNatureBuilder.createWillow : null,
    PeachTree: TangNatureBuilder ? TangNatureBuilder.createPeachTree : null,
    Bamboo: TangNatureBuilder ? TangNatureBuilder.createBamboo : null,
    Lotus: TangNatureBuilder ? TangNatureBuilder.createLotus : null,
  },
  
  Bridge: {
    StoneArch: TangBridgeBuilder ? TangBridgeBuilder.createStoneArchBridge : null,
    Wooden: TangBridgeBuilder ? TangBridgeBuilder.createWoodenBridge : null,
    Covered: TangBridgeBuilder ? TangBridgeBuilder.createCoveredBridge : null,
  },
  
  Animal: {
    Horse: TangAnimalBuilder ? TangAnimalBuilder.createHorse : null,
    Camel: TangAnimalBuilder ? TangAnimalBuilder.createCamel : null,
    Bird: TangAnimalBuilder ? TangAnimalBuilder.createBird : null,
    Fish: TangAnimalBuilder ? TangAnimalBuilder.createFish : null,
  },
  
  Vehicle: {
    Carriage: TangVehicleBuilder ? TangVehicleBuilder.createCarriage : null,
    OxCart: TangVehicleBuilder ? TangVehicleBuilder.createOxCart : null,
    Boat: TangVehicleBuilder ? TangVehicleBuilder.createBoat : null,
  },
  
  Wonder: {
    FloatingIsland: FantasyWonderBuilder ? FantasyWonderBuilder.createFloatingIsland : null,
    XianxiaPavilion: FantasyWonderBuilder ? FantasyWonderBuilder.createXianxiaPavilion : null,
    SkyBridge: FantasyWonderBuilder ? FantasyWonderBuilder.createSkyBridge : null,
    StarTower: FantasyWonderBuilder ? FantasyWonderBuilder.createStarTower : null,
    CloudSea: FantasyWonderBuilder ? FantasyWonderBuilder.createCloudSea : null,
  },
  
  batchGenerate(type, count, positionGenerator) {
    const group = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
      let model = null;
      
      switch (type) {
        case 'house':
          model = this.Architecture.House ? this.Architecture.House(2 + Math.random() * 2) : null;
          break;
        case 'tree':
          model = this.Nature.Pine ? this.Nature.Pine(1 + Math.random() * 0.5) : null;
          break;
        case 'npc':
          model = this.Character.Commoner ? this.Character.Commoner(0.9 + Math.random() * 0.2) : null;
          break;
      }
      
      if (model && positionGenerator) {
        const pos = positionGenerator(i);
        model.position.set(pos.x, pos.y || 0, pos.z);
        model.rotation.y = Math.random() * Math.PI * 2;
        group.add(model);
      }
    }
    
    return group;
  }
};

window.ChangAnModelLibrary = ChangAnModelLibrary;

console.log('[Model-Library] 龙游长安模型库集成完成');
console.log('[Model-Library] 可用分类:', Object.keys(ChangAnModelLibrary).filter(k => typeof ChangAnModelLibrary[k] === 'object'));
