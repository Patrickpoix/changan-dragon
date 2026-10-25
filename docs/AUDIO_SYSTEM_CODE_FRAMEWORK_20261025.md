# 音频系统代码框架设计（2026-10-25）

> 音频系统的代码结构设计。

---

## 一、文件结构

```
src/audio/
├── AudioManager.js      # 音频管理器
├── AmbientAudio.js      # 环境音
├── SFXPlayer.js         # 音效播放器
├── MusicPlayer.js       # 音乐播放器
└── utils/
    └── audioUtils.js    # 音频工具
```

---

## 二、AudioManager类

```javascript
class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();

    this.ambientAudio = new AmbientAudio(this.context);
    this.sfxPlayer = new SFXPlayer(this.context);
    this.musicPlayer = new MusicPlayer(this.context);

    // 音量
    this.masterVolume = 0.8;
    this.ambientVolume = 0.5;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
  }

  update(playerPosition) {
    // 根据玩家位置更新空间音效
    this.ambientAudio.update(playerPosition);
    this.sfxPlayer.update(playerPosition);
  }

  setRegionAudio(region) {
    // 根据区域切换环境音和音乐
    switch(region) {
      case 'zhuque':
        this.ambientAudio.play('street');
        this.musicPlayer.play('street_day');
        break;
      case 'west_market':
        this.ambientAudio.play('market');
        this.musicPlayer.play('market_busy');
        break;
      case 'temple':
        this.ambientAudio.play('temple');
        this.musicPlayer.play('temple_calm');
        break;
      case 'qujiang':
        this.ambientAudio.play('water');
        this.musicPlayer.play('qujiang_poetic');
        break;
    }
  }
}
```

---

## 三、SFXPlayer类

```javascript
class SFXPlayer {
  constructor(context) {
    this.context = context;
    this.sounds = new Map();
  }

  async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  playSound(name, position) {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // 空间音效
    const panner = this.context.createPanner();
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    // 连接
    source.connect(panner);
    panner.connect(this.context.destination);

    // 播放
    source.start();
  }

  update(playerPosition) {
    // 更新监听器位置
    this.context.listener.positionX.value = playerPosition.x;
    this.context.listener.positionY.value = playerPosition.y;
    this.context.listener.positionZ.value = playerPosition.z;
  }
}
```

---

## 四、MusicPlayer类

```javascript
class MusicPlayer {
  constructor(context) {
    this.context = context;
    this.currentMusic = null;
  }

  async play(name) {
    // 停止当前音乐
    if (this.currentMusic) {
      this.fadeOut(this.currentMusic);
    }

    // 加载新音乐
    const response = await fetch(`/audio/music/${name}.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    // 淡入
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 2);

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start();
    this.currentMusic = source;
  }

  fadeOut(source) {
    const gainNode = source.gain;
    gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
    setTimeout(() => source.stop(), 1000);
  }
}
```

---

## 五、使用示例

```javascript
const audioManager = new AudioManager();

// 加载音效
await audioManager.sfxPlayer.loadSound('footstep_stone', '/audio/sfx/footstep_stone.wav');
await audioManager.sfxPlayer.loadSound('horse_neigh', '/audio/sfx/horse_neigh.wav');

// 播放音效
function onPlayerWalk() {
  audioManager.sfxPlayer.playSound('footstep_stone', player.position);
}

function gameLoop() {
  audioManager.update(player.position);
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
```

---
文档日期：2026-10-25
