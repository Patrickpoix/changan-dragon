/* ============================================================
   用户反馈系统增强 v2.0
   问题上报、意见反馈、客服支持
   ============================================================ */

const FeedbackSystemEnhancer = {
  
  feedbackPanel: null,
  
  init() {
    this.createFeedbackPanel();
    this.createFeedbackButton();
    console.log('[Feedback] 用户反馈系统初始化完成');
  },
  
  createFeedbackPanel() {
    this.feedbackPanel = document.createElement('div');
    this.feedbackPanel.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      background: rgba(139, 69, 19, 0.98);
      border: 3px solid #d4af37;
      border-radius: 12px;
      padding: 20px;
      color: #ffd700;
      font-family: serif;
      font-size: 14px;
      display: none;
      z-index: 2000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    `;
    
    document.body.appendChild(this.feedbackPanel);
  },
  
  createFeedbackButton() {
    const button = document.createElement('button');
    button.textContent = '💬 反馈';
    button.style.cssText = `
      position: absolute;
      right: 20px;
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(139, 69, 19, 0.9);
      border: 2px solid #d4af37;
      color: #ffd700;
      font-size: 12px;
      cursor: pointer;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;
    
    button.onclick = () => this.showFeedbackPanel();
    
    document.body.appendChild(button);
  },
  
  showFeedbackPanel() {
    this.renderFeedbackForm();
    this.feedbackPanel.style.display = 'block';
  },
  
  closeFeedbackPanel() {
    this.feedbackPanel.style.display = 'none';
  },
  
  renderFeedbackForm() {
    this.feedbackPanel.innerHTML = `
      <div style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        💬 用户反馈
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">反馈类型：</label>
        <select id="feedback-type" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px;">
          <option value="bug">🐛 问题反馈</option>
          <option value="suggestion">💡 建议意见</option>
          <option value="complaint">😤 投诉</option>
          <option value="other">📝 其他</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">详细描述：</label>
        <textarea id="feedback-content" rows="6" placeholder="请详细描述您遇到的问题或建议..." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">联系方式（选填）：</label>
        <input type="text" id="feedback-contact" placeholder="邮箱或QQ" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 4px;">
      </div>
      
      <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
        <button onclick="FeedbackSystemEnhancer.closeFeedbackPanel()" style="padding: 10px 20px; background: rgba(0,0,0,0.3); border: 1px solid #d4af37; color: #ffd700; border-radius: 6px; cursor: pointer;">
          取消
        </button>
        <button onclick="FeedbackSystemEnhancer.submitFeedback()" style="padding: 10px 20px; background: #d4af37; border: none; color: #000; border-radius: 6px; cursor: pointer;">
          提交反馈
        </button>
      </div>
    `;
  },
  
  submitFeedback() {
    const type = document.getElementById('feedback-type').value;
    const content = document.getElementById('feedback-content').value;
    const contact = document.getElementById('feedback-contact').value;
    
    if (!content.trim()) {
      if (window.NotificationSystemEnhancer) {
        NotificationSystemEnhancer.warning('请填写反馈内容', '请详细描述您的问题或建议');
      }
      return;
    }
    
    const feedbacks = JSON.parse(localStorage.getItem('changan_feedbacks') || '[]');
    feedbacks.push({
      type,
      content,
      contact,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('changan_feedbacks', JSON.stringify(feedbacks));
    
    console.log('[Feedback] 提交反馈:', { type, content, contact });
    
    if (window.NotificationSystemEnhancer) {
      NotificationSystemEnhancer.success('反馈提交成功', '感谢您的反馈！我们会尽快处理。');
    }
    
    this.closeFeedbackPanel();
  }
};

window.FeedbackSystemEnhancer = FeedbackSystemEnhancer;

console.log('[Feedback] 用户反馈系统增强模块加载完成');
