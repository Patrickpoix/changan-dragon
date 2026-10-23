# Microsoft SheenCloth PBR maps (CC0)

Four original 256 x 256 tiled maps from the Khronos SheenCloth sample; Microsoft donated the entire asset under CC0. See README-upstream.md and CC0-1.0.txt. File URLs, sizes and SHA256 are in manifest.json.

- technicalFabricSmall_basecolor_256.png: sRGB base color. Original fabric is blue; tint/recolor deliberately if making warm silk/canvas.
- technicalFabricSmall_normal_256.png: tangent-space normal, linear data. Start at a low normal strength for cloth viewed at city scale.
- technicalFabricSmall_orm_256.png: linear packed R occlusion, G roughness, B metalness. Cloth is dielectric; keep metalness near zero.
- technicalFabricSmall_sheen_256.png: sheen color in RGB, sheen roughness in alpha, as described in upstream README.

Use repeated UVs on a genuinely draped mesh; the original model repeats 30 times on its small specimen. Determine repeat from the scene's physical cloth scale rather than copying 30 blindly. These maps improve surface response; they do not supply a historical Tang textile pattern. Keep shared materials and avoid per-banner draw-call growth.

SheenCloth-source.gltf is archived material metadata only. Its source binary (115,200 triangles) and mesh-specific AO image are intentionally omitted, so this metadata file is not a self-contained loadable model. Use the four texture maps on project geometry.
