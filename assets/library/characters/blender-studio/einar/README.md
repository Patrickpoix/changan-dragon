# Einar 原始完整源：成熟面部工艺研究

Blender Studio / Blender Foundation《Charge》官方 Einar v1，CC BY 4.0。
必须保留署名：**Einar Rig (CC-BY) Blender Foundation | studio.blender.org**。
来源、下载地址、ZIP 和各文件哈希见 manifest.json；原 ReadMe.txt 原样保留。

本目录保存原始 `.blend` 的**无损 gzip**及**全部原始纹理**，包括高分辨率面部位移、衣物和机械臂纹理。gzip 解开逐字节恢复原件，不减面、不降贴图。不要把仓库外缓存当唯一工程；可以在仓库外恢复：

```sh
mkdir -p /workspace/.environment/einar-restored
gzip -dc assets/library/characters/blender-studio/einar/einar_release_v1.blend.gz > /workspace/.environment/einar-restored/einar_release_v1.blend
cp -a assets/library/characters/blender-studio/einar/textures /workspace/.environment/einar-restored/
python3 tools/verify_mature_sources.py
```

检查源工程时禁用自动执行。原 CloudRig 的驱动/动作依赖尚未验证，不能把静态渲染称为生产绑定通过。`tools/render_mature_human_source.py` 在干净场景隔离原始头、眼、牙和毛发，以原材质渲染；没有替换为单色球头。原工程不是唐人，现代帽服、机械臂不能直接进入长安；专业面部、眼睑、肤材、毛发和细节层次用于成熟工艺对照。不是用户已经认可的唐代人物造型。

当前没有导入正式城市。Blender/Cycles 图不是浏览器实景，也不是最终游戏画质证明。
