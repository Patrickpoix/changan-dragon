/* ============================================================
   唐代音乐舞蹈系统增强 v2.0
   音乐、舞蹈、乐器、表演
   ============================================================ */

const MusicDanceSystemEnhancer = {
  
  instruments: [
    {
      id: 'instrument_001',
      name: '琵琶',
      dynasty: '唐',
      desc: '琵琶是唐代最流行的乐器之一，音色清脆悦耳',
      unlocked: false,
    },
    {
      id: 'instrument_002',
      name: '古筝',
      dynasty: '唐',
      desc: '古筝音色悠扬，适合独奏和合奏',
      unlocked: false,
    },
    {
      id: 'instrument_003',
      name: '笛子',
      dynasty: '唐',
      desc: '笛子音色清亮，常用于户外演奏',
      unlocked: false,
    },
    {
      id: 'instrument_004',
      name: '二胡',
      dynasty: '唐',
      desc: '胡琴音色凄凉，适合表达情感',
      unlocked: false,
    },
    {
      id: 'instrument_005',
      name: '鼓',
      dynasty: '唐',
      desc: '鼓是唐代宴会和庆典中必不可少的乐器',
      unlocked: false,
    },
  ],
  
  dances: [
    {
      id: 'dance_001',
      name: '霓裳羽衣舞',
      dynasty: '唐',
      desc: '唐玄宗编创的著名舞蹈，仙女般轻盈',
      learned: false,
    },
    {
      id: 'dance_002',
      name: '胡旋舞',
      dynasty: '唐',
      desc: '从西域传入的舞蹈，旋转如飞',
      learned: false,
    },
    {
      id: 'dance_003',
      name: '剑器舞',
      dynasty: '唐',
      desc: '公孙大娘擅长的剑舞，气势磅礴',
      learned: false,
    },
  ],
  
  musicPanel: null,
  
  init() {
    this.createMusicPanel();
    console.log('[MusicDance] 唐代音乐舞蹈系统初始化完成');
  },
  
  createMusicPanel() {
    this.musicPanel = document.createElement('div');
    this.musicPanel.style.cssText = `
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
    
    document.body.appendChild(this.musicPanel);
  },
  
  showMusicPanel() {
    this.renderMusicPanel();
    this.musicPanel.style.display = 'block';
  },
  
  closeMusicPanel() {
    this.musicPanel.style.display = 'none';
  },
  
  renderMusicPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🎵 音乐舞蹈
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">🎸 乐器</div>
    `;
    
    this.instruments.forEach(instrument => {
      html += `
        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${instrument.unlocked ? '#4CAF50' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: ${instrument.unlocked ? '#4CAF50' : '#999'}">${instrument.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${instrument.desc}</div>
            </div>
            <button onclick="MusicDanceSystemEnhancer.unlockInstrument('${instrument.id}')" style="padding: 5px 10px; background: ${instrument.unlocked ? '#666' : '#4CAF50'}; border: none; color: ${instrument.unlocked ? '#999' : '#fff'}; border-radius: 4px; cursor: ${instrument.unlocked ? 'default' : 'pointer'};">
              ${instrument.unlocked ? '已解锁' : '解锁'}
            </button>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">💃 舞蹈</div>
    `;
    
    this.dances.forEach(dance => {
      html += `
        <div style="padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${dance.learned ? '#ffb6c1' : '#666'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; color: ${dance.learned ? '#ffb6c1' : '#999'}">${dance.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${dance.desc}</div>
            </div>
            <button onclick="MusicDanceSystemEnhancer.learnDance('${dance.id}')" style="padding: 5px 10px; background: ${dance.learned ? '#666' : '#ffb6c1'}; border: none; color: ${dance.learned ? '#999' : '#000'}; border-radius: 4px; cursor: ${dance.learned ? 'default' : 'pointer'};">
              ${dance.learned ? '已学会' : '学习'}
            </button>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="MusicDanceSystemEnhancer.closeMusicPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.musicPanel.innerHTML = html;
  },
  
  unlockInstrument(instrumentId) {
    const instrument = this.instruments.find(i => i.id === instrumentId);
    if (!instrument || instrument.unlocked) return;
    
    instrument.unlocked = true;
    
    console.log('[MusicDance] 解锁乐器:', instrument.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('解锁成功！', `你学会了演奏 ${instrument.name}！`);
    }
    
    this.renderMusicPanel();
  },
  
  learnDance(danceId) {
    const dance = this.dances.find(d => d.id === danceId);
    if (!dance || dance.learned) return;
    
    dance.learned = true;
    
    console.log('[MusicDance] 学习舞蹈:', dance.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('学习成功！', `你学会了 ${dance.name}！`);
    }
    
    this.renderMusicPanel();
  }
};

window.MusicDanceSystemEnhancer = MusicDanceSystemEnhancer;

console.log('[MusicDance] 唐代音乐舞蹈系统增强模块加载完成');
