import React from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = React.createContext(null);

export const AuthProvider: React.FC = (props) => {
  const [user, setUser] = React.useState(null);

  // When the app first mounts, check for a token ...
  React.useEffect(() => {
    const token = window.localStorage.getItem('__legenda_token');
    if (token) {
      const decoded = jwt_decode(token);
      setUser(decoded.username);
    }
  }, []);

  function login(userDetails: { username: string; token: string }) {
    window.localStorage.setItem('__legenda_token', userDetails.token);
    setUser(userDetails.username);
  }

  function logout() {
    window.localStorage.removeItem('__legenda_token');
    setUser(null);
  }

  const ctx = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
