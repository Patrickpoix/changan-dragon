# Blender MCP 与模型优化工具发现

> 发现时间：2026-10-25

---

## nirholas/blender-mcp ⭐5
- URL: https://github.com/nirholas/blender-mcp
- 描述: AI agent驱动Blender，无头模式
- 功能:
  - GLB/glTF/FBX/OBJ互转
  - 渲染预览图
  - bpy脚本执行
  - Meshopt+Draco压缩
  - 模型简化(decimate)
- 价值: 可用于批量优化44个建筑GLB
- 用途: 将高模转低模、压缩贴图、生成LOD

---

## 优化管线规划
1. 用blender-mcp批量处理44个GLB
2. 生成L1精模(<100m)
3. 生成L2中模(100-300m)
4. 生成L3 billboard(300-800m)
5. Draco压缩几何
6. Meshopt压缩索引

---

*待沙箱恢复后实施。*
