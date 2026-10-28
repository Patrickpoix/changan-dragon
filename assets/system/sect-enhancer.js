/* ============================================================
   门派加入修炼升级系统增强 v2.0
   门派、加入、修炼、升级、功法
   ============================================================ */

const SectSystemEnhancer = {
  
  sects: [
    {
      id: 'taoist',
      name: '道教上清派',
      desc: '以炼丹修道为主，追求长生不老',
      location: '终南山',
      joined: false,
      level: 0,
      contribution: 0,
    },
    {
      id: 'buddhist',
      name: '佛教禅宗',
      desc: '以禅修悟道为主，普度众生',
      location: '少林寺',
      joined: false,
      level: 0,
      contribution: 0,
    },
    {
      id: 'scholar',
      name: '文人诗社',
      desc: '以诗词歌赋为主，风雅之人聚集',
      location: '长安城',
      joined: false,
      level: 0,
      contribution: 0,
    },
  ],
  
  learnedSkills: [],
  
  sectPanel: null,
  
  init() {
    this.createSectPanel();
    console.log('[Sect] 门派加入修炼升级系统初始化完成');
  },
  
  createSectPanel() {
    this.sectPanel = document.createElement('div');
    this.sectPanel.style.cssText = `
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
    
    document.body.appendChild(this.sectPanel);
  },
  
  showSectPanel() {
    this.renderSectPanel();
    this.sectPanel.style.display = 'block';
  },
  
  closeSectPanel() {
    this.sectPanel.style.display = 'none';
  },
  
  renderSectPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        🏯 门派系统
      </div>
    `;
    
    this.sects.forEach(sect => {
      html += `
        <div style="padding: 15px; margin-bottom: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 4px solid ${sect.joined ? '#4CAF50' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-weight: bold; font-size: 16px; color: ${sect.joined ? '#4CAF50' : '#ffd700'}">${sect.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">地点: ${sect.location}</div>
            </div>
            ${sect.joined 
              ? `<span style="color: #4CAF50;">✓ 已加入 (Lv.${sect.level})</span>`
              : `<button onclick="SectSystemEnhancer.joinSect('${sect.id}')" style="padding: 8px 16px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
                  加入
                </button>`
            }
          </div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${sect.desc}</div>
          ${sect.joined ? `
            <div style="font-size: 12px; opacity: 0.7;">
              贡献度: ${sect.contribution}
              <button onclick="SectSystemEnhancer.donate('${sect.id}')" style="margin-left: 10px; padding: 3px 8px; background: #4CAF50; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 11px;">
                捐赠
              </button>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="SectSystemEnhancer.closeSectPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.sectPanel.innerHTML = html;
  },
  
  joinSect(sectId) {
    const sect = this.sects.find(s => s.id === sectId);
    if (!sect) return;
    
    sect.joined = true;
    sect.level = 1;
    
    console.log('[Sect] 加入门派:', sect.name);
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('加入成功！', `你加入了${sect.name}！`);
    }
    
    this.renderSectPanel();
  },
  
  donate(sectId) {
    const sect = this.sects.find(s => s.id === sectId);
    if (!sect || !sect.joined) return;
    
    sect.contribution += 10;
    
    console.log('[Sect] 捐赠给:', sect.name, '贡献度:', sect.contribution);
    
    if (sect.contribution >= 100 * sect.level) {
      sect.level++;
      
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.success('门派升级！', `你在${sect.name}的等级提升到了 Lv.${sect.level}！`);
      }
    }
    
    this.renderSectPanel();
  }
};

window.SectSystemEnhancer = SectSystemEnhancer;

console.log('[Sect] 门派加入修炼升级系统增强模块加载完成');
