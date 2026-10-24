# 自然人物、连接裁衣与真实动作样板

**用户2026-10-24已否决本轮人脸与旧小龙的观感。当前文件仅保存缩骨/连接/动作/兼容性技术，不得默认为生产造型。继续实际筛选、取得并审阅成熟模型，停止给当前人台/拼接龙加细节后自称完成。**

这是独立制作样板，**未部署正式城市，未标记为最终电影美术**。以MakeHuman官方CC0成年男/女自然人体、成熟眼球及表情目标为输入；保持正常头身/五官，不使用被用户否决的Snow/Rain夸张头脸。

```sh
python3 tools/fetch_makehuman_details.py
blender -b --disable-autoexec -t 2 -P tools/build_character_studies.py
python3 tools/character_study_test.py --output /tmp/changan-natural-characters
blender -b --disable-autoexec -t 2 -P tools/build_unified_study.py
python3 tools/preparation_study_test.py --model natural-unified.glb --output /tmp/changan-unified-study
```

静态服务入口：`/tools/model_review.html?model=../assets/library/characters/tang-studies/male.glb`；另一个为`female.glb`。原验收台新增片段、播放/暂停/时间拖动与四个真实表情选择；静态样板加载时隐藏这些控件。新骨骼沿用正式r160的WebGL1兼容模块；灰模也保留骨纹理uniform，替换模型会释放骨纹理。

- 人体原点双脚、米制、GLB +Y向上/面朝+Z；男女解剖身高1.74/1.68m，发髻另计。原始拓扑/五官不放大，唐代识别来自服装、发髻与配色。
- 衣身真实挖出双臂袖窿，再从同一边界环生长袖片，连续连接肩部；男圆领长袍从同一腰环延续下摆，女襦裙为有意义的独立高腰叠层，非不相接的圆筒/圆锥。
- 原163骨的权重逐级映射到59个人体骨，加2个道具归属骨；保留四个最强权重并归一。肩袖按剪裁区域约束权重，避免最近表面误把躯干绑到手臂。
- 真实4个morph：Blink/Smile/Speak/BrowRaise，来自取得的官方单位位移。眼球按作者mhclo重心绑定与比例偏移适配基体，保留原UV，棕色眼图派生512²普通PBR。
- OfferTray/InspectFabric为3秒in-place骨骼片段；双臂使用二骨解析IK，托盘/食品随递出轨迹，布台/布匹与验布动作对应。片段切换用道具骨显隐，**是研究夹具的归属切换，不是已实现店铺状态机或游戏过渡**。
- 通过材质合并道具与衣服，保留面部morph网格：男38388面/9个primitive，女33504面/10个primitive，各1骨架61骨/2片段，两个512²图像的RGBA+mip估算约2.67MiB/模型；源/GLB字节及哈希见manifest。两套嵌入图相同，真实实例应共享，不能按人物数重复驻留。

这是带活动道具的近景工艺样板，**超出普通NPC 1.5万面目标**；不能直接给192个行人使用。后续角色LOD需将可复用道具从NPC身体提取为共享场景资产、按脸部/袖摆轮廓保护减面、降低中远景手指骨；模板明确这一成本，未承诺真机帧率。

还需生产级脸/发际/肤材与配饰随表情、衣领/袖褶/裙摆校准、抓握/物件接触、行走/坐姿衣摆权重及LOD。裙摆目前根骨固定，只验证站立经营片段，不将手腕IK误差当指尖/脚滑或所有动作通过。

新组合`assets/library/preparation-study/natural-unified.glb`把真实经营姿态静态烘焙到原建筑/柳树/alpha松/PBR/龙车尺度样板，旧assembly.glb原样保留。组合用于同场尺寸/材质审查，完整骨骼/表情/片段在本目录两个GLB内，不能把静态组合说成游戏NPC动画已接入。

许可链见相邻`makehuman-base/`和`makehuman-details/`，织物normal为已取得ambientCG CC0，衣服/道具/IK是项目原创代码；不把整个项目重新声明CC0。
