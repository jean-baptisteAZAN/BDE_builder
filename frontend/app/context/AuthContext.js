import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const idToken = await SecureStore.getItemAsync('idToken');
      if (idToken) {
        try {
          const response = await fetch('http://localhost:5001/api/auth/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
          } else {
            console.log(data.message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
