const AuthContext = {
  user: null,
  listeners: [],

  setUser(user) {
    this.user = user;
    if (user?.token) {
      localStorage.setItem('skill_nova_token', user.token);
    }
    this.listeners.forEach((fn) => fn(user));
  },

  clearUser() {
    this.user = null;
    localStorage.removeItem('skill_nova_token');
    this.listeners.forEach((fn) => fn(null));
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  },

  getStoredToken() {
    return localStorage.getItem('skill_nova_token');
  },

  isAuthenticated() {
    return !!this.user;
  },

  isAdmin() {
    return this.user?.role === 'admin';
  },

  isStudent() {
    return this.user?.role === 'student';
  }
};

window.AuthContext = AuthContext;
