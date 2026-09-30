import api from './api';

const authService = {
  /**
   * Register a new user (student or recruiter only)
   */
  register: async ({ name, email, password, role }) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Fetch the currently authenticated user
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
