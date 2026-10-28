/* ============================================================
   交通工具系统增强 v2.0
   马车、牛车、船只、乘坐系统
   ============================================================ */

const VehicleSystemEnhancer = {
  
  vehicles: [],
  
  currentVehicle: null,
  
  init() {
    console.log('[Vehicle] 交通工具系统初始化完成');
  },
  
  spawnVehicle(type, x, z) {
    let vehicle;
    
    if (typeof TangVehicleBuilder !== 'undefined') {
      switch (type) {
        case 'carriage':
          vehicle = TangVehicleBuilder.createCarriage(1);
          break;
        case 'oxcart':
          vehicle = TangVehicleBuilder.createOxcart(1);
          break;
        case 'boat':
          vehicle = TangVehicleBuilder.createBoat(1);
          break;
        default:
          vehicle = this.createSimpleVehicle(type);
      }
    } else {
      vehicle = this.createSimpleVehicle(type);
    }
    
    vehicle.position.set(x, 0, z);
    vehicle.userData = {
      type: 'vehicle',
      vehicleType: type,
      speed: type === 'carriage' ? 5 : 3,
      passenger: null,
    };
    
    this.vehicles.push(vehicle);
    
    if (window.GAME?.scene) {
      GAME.scene.add(vehicle);
    }
    
    return vehicle;
  },
  
  createSimpleVehicle(type) {
    const group = new THREE.Group();
    
    const colors = {
      carriage: 0x8b4513,
      oxcart: 0xa0522d,
      boat: 0x6b4f2a,
    };
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 3),
      new THREE.MeshStandardMaterial({ color: colors[type] || colors.carriage })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    
    for (const side of [-1, 1]) {
      for (const frontBack of [-1, 1]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(side * 1, 0.3, frontBack * 1);
        wheel.rotation.z = Math.PI / 2;
        group.add(wheel);
      }
    }
    
    return group;
  },
  
  enterVehicle(vehicle) {
    if (this.currentVehicle) {
      this.exitVehicle();
    }
    
    this.currentVehicle = vehicle;
    vehicle.userData.passenger = 'player';
    
    console.log('[Vehicle] 乘坐车辆');
  },
  
  exitVehicle() {
    if (!this.currentVehicle) return;
    
    this.currentVehicle.userData.passenger = null;
    this.currentVehicle = null;
    
    console.log('[Vehicle] 离开车辆');
  },
  
  update(deltaTime, time) {
    this.vehicles.forEach(vehicle => {
      if (vehicle.userData.vehicleType === 'boat') {
        vehicle.position.x += Math.sin(time * 0.2) * 0.5;
      }
    });
  }
};

window.VehicleSystemEnhancer = VehicleSystemEnhancer;

console.log('[Vehicle] 交通工具系统增强模块加载完成');
