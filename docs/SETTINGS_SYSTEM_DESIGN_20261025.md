# 设置系统设计（2026-10-25）

> 游戏设置/选项系统的设计方案。

---

## 一、设置分类

### 画质设置
- **画质档位**：高/中/低
- **分辨率**：渲染分辨率
- **阴影质量**：关/低/中/高
- **抗锯齿**：关/开
- **后处理**：关/开
- **视野范围(FOV)**：60-100

### 音频设置
- **主音量**：0-100%
- **音乐音量**：0-100%
- **音效音量**：0-100%
- **环境音量**：0-100%

### 控制设置
- **鼠标灵敏度**：0.1-2.0
- **反转Y轴**：开/关
- **键位自定义**：可修改

### 游戏设置
- **语言**：中文/英文
- **自动存档**：开/关
- **字幕**：开/关
- **难度**：休闲/普通

---

## 二、设置数据

```javascript
{
  graphics: {
    quality: 'high',  // high/medium/low
    resolution: 1.0,
    shadowQuality: 'high',
    antiAliasing: true,
    postProcessing: true,
    fov: 75
  },
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    ambientVolume: 0.5
  },
  controls: {
    mouseSensitivity: 1.0,
    invertY: false,
    keyBindings: {
      forward: 'KeyW',
      back: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
      jump: 'Space',
      interact: 'KeyE',
      inventory: 'KeyI',
      map: 'KeyM'
    }
  },
  game: {
    language: 'zh',
    autoSave: true,
    subtitles: true,
    difficulty: 'normal'
  }
}
```

---

## 三、设置管理器

```javascript
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('changan_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return this.getDefaultSettings();
  }

  getDefaultSettings() {
    return {
      graphics: { quality: 'high', fov: 75 },
      audio: { masterVolume: 0.8 },
      controls: { mouseSensitivity: 1.0 },
      game: { language: 'zh' }
    };
  }

  saveSettings() {
    localStorage.setItem('changan_settings', JSON.stringify(this.settings));
  }

  applySettings() {
    // 应用画质设置
    rendererManager.setQuality(this.settings.graphics.quality);
    
    // 应用音频设置
    audioManager.setVolume(this.settings.audio);
    
    // 应用控制设置
    playerManager.setSensitivity(this.settings.controls.mouseSensitivity);
  }

  resetToDefaults() {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.applySettings();
  }
}
```

---

## 四、UI设计

### 设置界面
- 按Esc打开菜单
- 选择"设置"
- 分类标签(画质/音频/控制/游戏)
- 滑块/开关/下拉框
- 底部：恢复默认/应用/取消

---

文档日期：2026-10-25
