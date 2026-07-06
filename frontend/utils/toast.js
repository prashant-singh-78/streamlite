const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed; top: 1.25rem; right: 1.25rem; z-index: 9999;
      display: flex; flex-direction: column; gap: 0.75rem; max-width: 360px;
    `;
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    const toast = document.createElement('div');
    const colors = {
      success: { bg: '#166534', border: '#22c55e' },
      error: { bg: '#7f1d1d', border: '#ef4444' },
      info: { bg: '#1e3a5f', border: '#3b82f6' }
    };
    const c = colors[type] || colors.info;

    toast.style.cssText = `
      padding: 1rem 1.25rem; border-radius: 0.75rem; color: #fff;
      background: ${c.bg}; border-left: 4px solid ${c.border};
      box-shadow: 0 8px 24px rgba(0,0,0,0.3); font-weight: 600;
      animation: toastIn 0.3s ease; font-size: 0.95rem;
    `;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};

if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`;
  document.head.appendChild(style);
}

window.Toast = Toast;
