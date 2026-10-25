# 龙游长安 · 音频系统架构

> 三档音量 + 3D空间音频 + BGM交叉淡入淡出 + 音效池

## 核心类：AudioManager

```javascript
const am = new AudioManager(camera, scene);
await am.init();
canvas.addEventListener('pointerdown', () => am.resume());
am.setHour(10);  // 自动选BGM
am.playSfx('coin', { position: v3 });
```

## BGM 时间感知

| 时段 | 曲目 | 风格 |
|---|---|---|
| 白天(6-18) | Eastern_Thought.mp3 | 平和笛/箫 |
| 黄昏(18-20) | Hammock_Fight.mp3 | 轻快律动 |
| 夜晚(20-6) | Dream_Catcher.mp3 | 舒缓安静 |
| 上元灯节 | Sincerely.mp3 | 温暖热闹 |

## SFX 音效池

| 类别 | 素材源 | 数量 |
|---|---|---|
| 脚步(石板) | kenney_impact footstep_concrete | 5 |
| 脚步(泥土) | kenney_impact footstep_grass | 5 |
| 脚步(木板) | kenney_impact footstep_wood | 5 |
| 铜钱 | kenney_rpg handleCoins | 2 |
| 坊门开关 | kenney_rpg doorOpen/Close | 6 |
| 铃铛 | kenney_impact impactBell | 5 |
| NPC对话 | kenney_rpg cloth + iface pluck | 6 |
| 马蹄 | kenney_impact impactWood (proxy) | 5 |
| UI点击 | kenney_iface click | 5 |

## 程序化环境音
- 人群嗡嗡：带通噪声 + 随机调制
- 雨声：高通噪声 + 强度随天气变化

## 3D空间音频
- THREE.PositionalAudio，inverse距离衰减模型
- 声源位置随NPC/物体移动实时更新

## 素材来源
- Kenney.nl (CC0)：impact/rpg/iface 三个包
- 所有音频文件放在 public/audio/ 目录
