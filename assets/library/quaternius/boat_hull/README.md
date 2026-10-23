# Quaternius Ships Pack · Boat

作者原页：https://quaternius.com/packs/ships.html，明确CC0；页面存于ships.html。原GLB来自固定版本公开镜像，路径、提交、SHA256见manifest.json。版权授权依据作者具体包页，不使用镜像仓库MIT许可替代模型授权。

原船体是真中空网格。tools/prepare_boats.py保留原轮廓与木色分区，焊接导出接缝、加22mm三段圆角/加权法线，归一为2.15×0.83×4.4米，龙骨y=-0.20、舷边y=0.63。导出为assets/boat-hulls.js中的790顶点/1460三角形索引数据，不需额外GLTF加载或解码器。

运行时甲板板条/横凳/舷侧桨座/双桨、人物与划桨动作、尾流均在src/20-character.js中以代码组合。人物面部为另一个单独记录的Quaternius来源。没有把西式大帆船成套场景混入唐代长安。

修改方式：改原文件加工参数后运行python3 tools/prepare_boats.py，再重建单文件。不要将预览用runtime.glb放进本目录；GLB动物打包器只接受带原动作/蒙皮的动物，船体采用独立索引数据。
