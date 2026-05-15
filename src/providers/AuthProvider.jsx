import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeToAuthState, syncUserState } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    authReady: false,
    user: null,
  });

  useEffect(() => {
    let alive = true;

    const unsubscribe = subscribeToAuthState((user) => {
      if (!user) {
        if (alive) setState({ authReady: true, user: null });
        return;
      }

      syncUserState(user)
        .then(() => {
          if (alive) setState({ authReady: true, user });
        })
        .catch((error) => {
          console.warn('[auth] current session DB sync failed; keeping Auth session active', {
            uid: user.uid,
            code: error?.code,
            message: error?.message,
          });

          if (alive) setState({ authReady: true, user });
        });
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      authReady: state.authReady,
      currentUser: state.user,
      isAuthenticated: Boolean(state.user),
    }),
    [state.authReady, state.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
