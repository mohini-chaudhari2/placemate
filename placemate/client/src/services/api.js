import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placemate_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      /*
       * Do not immediately destroy the local session here.
       *
       * A protected request can fail temporarily while the
       * application is restoring the authentication state.
       */
      console.warn(
        'PlaceMate authentication request failed:',
        error.response?.data?.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;