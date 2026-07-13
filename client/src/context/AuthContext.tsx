/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginWithBackend, registerWithBackend, getCurrentUserFromBackend } from '../services/api';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<UserRole | null>;
  register: (
    name: string,
    email: string,
    password: string,
    institution: string,
    role: UserRole,
    avatarFile?: File | null
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Only restore an existing session — never auto-log a fresh visitor in.
    const token = localStorage.getItem('jms_auth_token');
    if (!token) {
      return;
    }

    // Validate the saved token against the real backend and pull fresh user
    // data. Previously this looked the saved user id up in a local mock
    // users list — real backend-authenticated users were never added to
    // that list, so restoration silently failed on every page refresh and
    // the person appeared logged out even with a perfectly valid token.
    void getCurrentUserFromBackend(token).then((freshUser) => {
      if (freshUser) {
        setUser(freshUser);
        const savedRole = localStorage.getItem('jms_current_role') as UserRole;
        setCurrentRole(savedRole || freshUser.role);
      } else {
        // Token is invalid/expired — clear the stale session rather than
        // leaving the app in a half-logged-in state.
        localStorage.removeItem('jms_auth_token');
        localStorage.removeItem('jms_current_user_id');
        localStorage.removeItem('jms_current_role');
      }
    });
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<UserRole | null> => {
    try {
      const response = await loginWithBackend(email, password, role);
      const authenticatedUser = response.user;

      // IMPORTANT: trust the role the backend returns for this account, never the
      // role button the person happened to have selected on the login form.
      // Previously this used the selected `role` param directly, which meant
      // logging in with a reviewer's real credentials while the "Author" tab
      // was selected would land you on the Author dashboard as that reviewer.
      const actualRole = authenticatedUser.role as UserRole;

      if (actualRole !== role) {
        console.warn(
          `Selected role "${role}" did not match account role "${actualRole}". Using the account's real role.`
        );
      }

      setUser(authenticatedUser);
      setCurrentRole(actualRole);
      localStorage.setItem('jms_current_user_id', authenticatedUser.id);
      localStorage.setItem('jms_current_role', actualRole);
      localStorage.setItem('jms_auth_token', response.token);
      return actualRole;
    } catch (error) {
      console.warn('Backend login failed:', error);
      return null;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    institution: string,
    role: UserRole,
    avatarFile?: File | null
  ) => {
    const response = await registerWithBackend(name, email, password, institution, role, avatarFile);
    const registeredUser = response.user;
    setUser(registeredUser);
    setCurrentRole(role);
    localStorage.setItem('jms_current_user_id', registeredUser.id);
    localStorage.setItem('jms_current_role', role);
    localStorage.setItem('jms_auth_token', response.token);
  };

  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem('jms_current_user_id');
    localStorage.removeItem('jms_current_role');
    localStorage.removeItem('jms_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
