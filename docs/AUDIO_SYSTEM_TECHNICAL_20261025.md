# 音频系统 — 技术实现文档

> 版本：v1.0
> 状态：✅ 已完成

---

## 1. AudioManager 架构

### 1.1 核心模块
```javascript
class AudioManager {
  constructor() {
    this.volume = { master: 1, music: 0.7, sfx: 1 };
    this.channels = new ChannelPool(32);  // 32个并发声道
    this.bgmChannels = new ChannelPool(10); // 10个BGM声道
  }
}
```

### 1.2 三档音量
- Master（总音量）
- Music（背景音乐）
- SFX（音效）

---

## 2. 3D 音效

### 2.1 PositionalAudio
- 每个NPC/建筑/道具可挂载音频
- 距离衰减：近大远小
- 遮挡衰减：建筑遮挡时音量降低
- 立体声定位

### 2.2 场景音
| 场景 | 音效 |
|---|---|
| 石板路 | 脚步声（硬） |
| 土路 | 脚步声（闷） |
| 木地板 | 脚步声（脆） |
| 市集 | 人群嗡嗡声 |
| 寺庙 | 诵经声 |
| 酒肆 | 喧闹声 |

---

## 3. 时辰感知 BGM

| 时段 | BGM风格 |
|---|---|
| 白日 | 笛箫悠扬 |
| 黄昏 | 轻快 |
| 夜晚 | 舒缓 |
| 上元 | 热闹 |

### 3.1 BGM 交叉淡入
```javascript
// 切换BGM时2秒淡入淡出
bgmOld.gain.linearRampToValueAtTime(0, now + 2);
bgmNew.gain.linearRampToValueAtTime(targetVolume, now + 2);
```

---

## 4. 音效素材清单

| 类别 | 数量 | 来源 |
|---|---|---|
| 脚步（3材质） | 15 | Kenney |
| 门声 | 5 | Kenney |
| 铜钱/交易 | 10 | Kenney |
| 布料/衣物 | 8 | Kenney |
| NPC互动 | 12 | Kenney |
| 马蹄 | 6 | Kenney |
| 环境音 | 200+ | Freesound替代 |
| **合计** | **359个** | |

---

## 5. 性能数据

| 指标 | 数值 |
|---|---|
| 音频内存 | 363MB |
| 并发声道 | 34 |
| 声道池 | 32+10 |
| BGM交叉淡入 | 2秒 |

---

## 6. 已知缺口

1. 无真市集嘈杂采样（用程序化噪声合成）
2. 无雨声/雷声真采样
3. 无唐代乐器录音（用MIDI替代）
4. 无语音（NPC不说话）

---

## 7. 下一步

- [ ] 真市集环境采样
- [ ] 雷雨音效
- [ ] 唐代乐器BGM
- [ ] NPC语音（TTS）
- [ ] 动态音乐（根据战斗/探索）

---

*音频系统 demo 在 audio-system-demo/ 目录下。*
