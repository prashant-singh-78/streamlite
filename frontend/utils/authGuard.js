const AuthGuard = {
  async requireAuth(redirectTo = '/login.html') {
    try {
      const user = await api.me();
      AuthContext.setUser(user);
      return user;
    } catch {
      AuthContext.clearUser();
      window.location.href = redirectTo;
      return null;
    }
  },

  async requireAdmin(redirectTo = '/dashboard.html') {
    const user = await this.requireAuth();
    if (!user) return null;
    if (user.role !== 'admin') {
      Toast.error('Admin access required.');
      window.location.href = redirectTo;
      return null;
    }
    return user;
  },

  async requireStudent(redirectTo = '/dashboard.html') {
    const user = await this.requireAuth();
    if (!user) return null;
    if (user.role !== 'student') {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  },

  async redirectIfAuthenticated(destination = '/dashboard.html') {
    try {
      const user = await api.me();
      if (user) {
        AuthContext.setUser(user);
        window.location.href = destination;
        return true;
      }
    } catch {
      AuthContext.clearUser();
    }
    return false;
  }
};

window.AuthGuard = AuthGuard;

