/* ============================================================
   科举考试官职升迁系统增强 v2.0
   科举考试、官职、升迁、俸禄
   ============================================================ */

const ImperialExamEnhancer = {
  
  currentRank: {
    name: '白衣秀才',
    level: 0,
    salary: 0,
  },
  
  ranks: [
    { name: '白衣秀才', level: 0, salary: 0, requiredExp: 0 },
    { name: '举人', level: 1, salary: 100, requiredExp: 100 },
    { name: '进士', level: 2, salary: 300, requiredExp: 300 },
    { name: '翰林院编修', level: 3, salary: 500, requiredExp: 600 },
    { name: '六科给事中', level: 4, salary: 800, requiredExp: 1200 },
    { name: '知府', level: 5, salary: 1500, requiredExp: 2500 },
    { name: '按察使', level: 6, salary: 3000, requiredExp: 5000 },
    { name: '布政使', level: 7, salary: 6000, requiredExp: 10000 },
    { name: '尚书', level: 8, salary: 12000, requiredExp: 20000 },
    { name: '宰相', level: 9, salary: 50000, requiredExp: 50000 },
  ],
  
  exams: [
    {
      id: 'exam_1',
      name: '乡试',
      desc: '每三年一次的省级考试，考中即为举人',
      difficulty: 'easy',
      completed: false,
    },
    {
      id: 'exam_2',
      name: '会试',
      desc: '京城举行的全国考试，考中即为贡士',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 'exam_3',
      name: '殿试',
      desc: '皇帝亲自主持的最高考试，考中即为进士',
      difficulty: 'hard',
      completed: false,
    },
  ],
  
  examPanel: null,
  
  init() {
    this.createExamPanel();
    console.log('[Exam] 科举考试官职升迁系统初始化完成');
  },
  
  createExamPanel() {
    this.examPanel = document.createElement('div');
    this.examPanel.style.cssText = `
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
    
    document.body.appendChild(this.examPanel);
  },
  
  showExamPanel() {
    this.renderExamPanel();
    this.examPanel.style.display = 'block';
  },
  
  closeExamPanel() {
    this.examPanel.style.display = 'none';
  },
  
  renderExamPanel() {
    let html = `
      <div style="font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        📜 科举与官职
      </div>
      
      <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #d4af37;">${this.currentRank.name}</div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">俸禄: ${this.currentRank.salary} 文/月</div>
      </div>
    `;
    
    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #87ceeb;">科举考试</div>
    `;
    
    this.exams.forEach(exam => {
      html += `
        <div style="padding: 12px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${exam.completed ? '#4CAF50' : '#d4af37'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold;">${exam.name}</div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 3px;">${exam.desc}</div>
            </div>
            ${exam.completed ? '<span style="color: #4CAF50;">✓ 已通过</span>' : `<button onclick="ImperialExamEnhancer.takeExam('${exam.id}')" style="padding: 5px 10px; background: #d4af37; border: none; color: #000; border-radius: 4px; cursor: pointer;">
              参加
            </button>`}
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffb6c1;">官职晋升路线</div>
    `;
    
    this.ranks.forEach(rank => {
      const isCurrent = rank.level === this.currentRank.level;
      const isUnlocked = rank.level <= this.currentRank.level;
      
      html += `
        <div style="padding: 8px 12px; margin-bottom: 5px; background: ${isCurrent ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.15)'}; border-radius: 4px; opacity: ${isUnlocked ? 1 : 0.5};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="${isCurrent ? 'font-weight: bold; color: #d4af37;' : ''}">${rank.name}</div>
            <div style="font-size: 12px; opacity: 0.7;">俸禄: ${rank.salary} 文</div>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    html += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="ImperialExamEnhancer.closeExamPanel()" style="padding: 10px 30px; background: #6b3410; border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
    
    this.examPanel.innerHTML = html;
  },
  
  takeExam(examId) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return;
    
    console.log('[Exam] 参加考试:', exam.name);
    
    exam.completed = true;
    
    const nextRank = this.ranks.find(r => r.level === this.currentRank.level + 1);
    if (nextRank) {
      this.currentRank = nextRank;
    }
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('考试通过！', `你通过了${exam.name}，晋升为${this.currentRank.name}！`);
    }
    
    this.renderExamPanel();
  }
};

window.ImperialExamEnhancer = ImperialExamEnhancer;

console.log('[Exam] 科举考试官职升迁系统增强模块加载完成');
