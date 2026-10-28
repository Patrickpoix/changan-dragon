/* ============================================================
   文物收藏鉴赏系统增强 v2.0
   文物、收藏、鉴赏、展览
   ============================================================ */

const ArtifactCollectionEnhancer = {
  
  artifacts: [
    {
      id: 'art_001',
      name: '唐三彩马',
      dynasty: '唐',
      type: '陶器',
      desc: '唐三彩是唐代低温铅质彩釉陶器的总称，以黄、绿、白三色为主',
      discovered: false,
      location: '西市古董铺',
    },
    {
      id: 'art_002',
      name: '越窑青瓷',
      dynasty: '唐',
      type: '瓷器',
      desc: '越窑青瓷类冰似玉，是唐代瓷器中的珍品',
      discovered: false,
      location: '曲江池畔',
    },
    {
      id: 'art_003',
      name: '王羲之书法摹本',
      dynasty: '晋',
      type: '书画',
      desc: '唐代摹本，笔法精妙，气韵生动',
      discovered: false,
      location: '翰林院',
    },
    {
      id: 'art_004',
      name: '敦煌飞天壁画摹本',
      dynasty: '唐',
      type: '壁画',
      desc: '飞天仕女，衣带飘扬，栩栩如生',
      discovered: false,
      location: '大慈恩寺',
    },
    {
      id: 'art_005',
      name: '和田白玉佩',
      dynasty: '唐',
      type: '玉器',
      desc: '和田白玉，温润细腻，雕工精美',
      discovered: false,
      location: '东市珠宝行',
    },
  ],
  
  artifactPanel: null,
  
  init() {
    this.createArtifactPanel();
    console.log('[Artifact] 文物收藏鉴赏系统初始化完成');
  },
  
  createArtifactPanel() {
    this.artifactPanel = document.createElement('div');
    this.artifactPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      max-height: 600px;
      background: rgba(139, 69, 19, 0.98);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
      z-index: 2000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    `;
    
    document.body.appendChild(this.artifactPanel);
  },
  
  showArtifactPanel() {
    this.renderArtifactPanel();
    this.artifactPanel.style.display = 'block';
  },
  
  closeArtifactPanel() {
    this.artifactPanel.style.display = 'none';
  },
  
  renderArtifactPanel() {
    let discoveredCount = this.artifacts.filter(a => a.discovered).length;
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏺 文物收藏
        <span style="float: right; font-size: 16px; color: #d4af37;">${discoveredCount}/${this.artifacts.length}</span>
      </div>
    `;
    
    this.artifacts.forEach(artifact => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${artifact.discovered ? '#d4af37' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div style="font-weight: bold; color: ${artifact.discovered ? '#ffd700' : '#999'};">
              ${artifact.discovered ? artifact.name : '？？？'}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">${artifact.dynasty} · ${artifact.type}</div>
          </div>
          ${artifact.discovered ? `
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">${artifact.desc}</div>
            <div style="font-size: 11px; opacity: 0.6;">发现地点: ${artifact.location}</div>
          ` : '<div style="font-size: 12px; opacity: 0.5;">未发现</div>'}
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ArtifactCollectionEnhancer.closeArtifactPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.artifactPanel.innerHTML = html;
  },
  
  discoverArtifact(artifactId) {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact || artifact.discovered) return;
    
    artifact.discovered = true;
    
    console.log('[Artifact] 发现文物:', artifact.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('发现文物！', `你发现了 ${artifact.name}！`);
    }
    
    this.renderArtifactPanel();
  }
};

window.ArtifactCollectionEnhancer = ArtifactCollectionEnhancer;

console.log('[Artifact] 文物收藏鉴赏系统增强模块加载完成');
