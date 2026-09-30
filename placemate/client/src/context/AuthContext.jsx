import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'placemate_token';
const USER_KEY = 'placemate_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const savedToken =
        localStorage.getItem(TOKEN_KEY);

      const savedUser =
        localStorage.getItem(USER_KEY);

      /*
       * No token means there is no session to restore.
       */
      if (!savedToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        return;
      }

      /*
       * Immediately restore the locally saved session.
       * This prevents navigation between pages from temporarily
       * behaving as if the user is logged out.
       */
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);

          if (mounted) {
            setUser(parsedUser);
            setToken(savedToken);
          }
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      /*
       * Verify the token with the backend.
       */
      try {
        const userData = await authService.getMe();

        if (!mounted) return;

        setUser(userData);
        setToken(savedToken);

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(userData)
        );
      } catch (error) {
        console.error(
          'Session restoration failed:',
          error.response?.data?.message ||
            error.message
        );

        /*
         * Only remove the session when the backend explicitly
         * says the token is invalid/unauthorized.
         */
        if (error.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);

          if (mounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data)
    );

    setToken(data.token);
    setUser(data);

    return data;
  }, []);

  const register = useCallback(async (details) => {
    const data = await authService.register(details);

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data)
    );

    setToken(data.token);
    setUser(data);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated =
    Boolean(token) && Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;