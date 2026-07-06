const Validation = {
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPassword(password) {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  },

  isValidPhone(phone) {
    if (!phone) return true;
    return /^[0-9+\-\s()]{7,15}$/.test(phone);
  }
};

window.Validation = Validation;
