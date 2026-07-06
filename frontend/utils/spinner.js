const Spinner = {
  overlay: null,

  show(message = 'Loading...') {
    this.hide();
    this.overlay = document.createElement('div');
    this.overlay.id = 'global-spinner';
    this.overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 9998; backdrop-filter: blur(4px);
    `;
    this.overlay.innerHTML = `
      <div style="width:48px;height:48px;border:4px solid rgba(212,175,55,0.2);border-top-color:#d4af37;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <p style="margin-top:1rem;color:#fff;font-weight:600;">${message}</p>
    `;
    document.body.appendChild(this.overlay);
  },

  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
};

if (!document.getElementById('spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'spinner-styles';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

window.Spinner = Spinner;
