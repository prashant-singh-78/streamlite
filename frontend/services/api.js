const api = {
  getAuthHeaders() {
    const token = AuthContext.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async fetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include'
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Unexpected server response.' };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    if (data.token) {
      localStorage.setItem('skill_nova_token', data.token);
    }

    return data;
  },

  // Auth
  async register(payload) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async signup(email, password, role, extra = {}) {
    return this.register({
      email,
      password,
      fullName: extra.fullName || email.split('@')[0],
      phoneNumber: extra.phoneNumber || '',
      role: role === 'admin' ? 'student' : (role || 'student')
    });
  },

  async login(email, password) {
    const data = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.user) AuthContext.setUser({ ...data.user, token: data.token });
    return data;
  },

  async me() {
    const data = await this.fetch('/auth/me');
    if (data.user) AuthContext.setUser(data.user);
    return data.user;
  },

  async updateProfile(payload) {
    return this.fetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async logout() {
    try {
      await this.fetch('/auth/logout', { method: 'POST' });
    } catch {
      // Continue logout even if API fails
    }
    AuthContext.clearUser();
    window.location.href = 'login.html';
  },

  // Subscription
  async getPlans() {
    return this.fetch('/sub/plans');
  },

  async buyPlan(planName, amount, paymentMethod = 'whatsapp') {
    return this.fetch('/sub/buy', {
      method: 'POST',
      body: JSON.stringify({ planName, amount, paymentMethod })
    });
  },

  async getSubscriptionStatus() {
    return this.fetch('/sub/status');
  },

  async cancelSubscription() {
    return this.fetch('/sub/cancel', { method: 'POST' });
  },

  async subscribe(paymentMethod = 'whatsapp') {
    return this.fetch('/sub/subscribe', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod })
    });
  },

  // Videos
  async getVideos() {
    return this.fetch('/video/all');
  },

  async uploadVideo(videoData) {
    return this.fetch('/video/upload', {
      method: 'POST',
      body: JSON.stringify(videoData)
    });
  },

  // Settings & Admin
  async getSettings() {
    return this.fetch('/settings');
  },

  async updatePrice(price) {
    return this.fetch('/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ price })
    });
  },

  async addMember(memberData) {
    return this.fetch('/admin/add-member', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  async getStudents() {
    return this.fetch('/admin/users');
  },

  async deleteStudent(id) {
    return this.fetch(`/admin/users/${id}`, { method: 'DELETE' });
  },

  async getSubscriptions(status) {
    const query = status ? `?status=${status}` : '';
    return this.fetch(`/admin/subscriptions${query}`);
  },

  async updateSubscriptionStatus(id, status) {
    return this.fetch(`/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getAnalytics() {
    return this.fetch('/admin/analytics');
  },

  async grantAccess(id) {
    return this.fetch(`/admin/users/${id}/grant`, { method: 'PUT' });
  },

  async getDataDump() {
    return this.fetch('/admin/data-dump');
  }
};

window.api = api;
