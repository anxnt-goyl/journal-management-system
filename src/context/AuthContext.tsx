/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, getUserById, initializeStorage } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => boolean;
  register: (name: string, email: string, institution: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  usersList: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    // Initialize storage first
    initializeStorage();
    const loadedUsers = getUsers();
    setUsersList(loadedUsers);

    // Default: auto-authenticate as author to make the preview instant and rich
    const defaultUserId = 'user_author_1';
    const savedUserId = localStorage.getItem('jms_current_user_id');
    const targetId = savedUserId || defaultUserId;
    
    const matchedUser = loadedUsers.find(u => u.id === targetId);
    if (matchedUser) {
      setUser(matchedUser);
      // Retrieve role if saved, otherwise use user's default role
      const savedRole = localStorage.getItem('jms_current_role') as UserRole;
      setCurrentRole(savedRole || matchedUser.role);
    }
  }, []);

  const login = (email: string, role: UserRole): boolean => {
    const loadedUsers = getUsers();
    const matched = loadedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (matched) {
      setUser(matched);
      setCurrentRole(role); // Use preferred login role
      localStorage.setItem('jms_current_user_id', matched.id);
      localStorage.setItem('jms_current_role', role);
      return true;
    }
    
    // Fallback: if email not found, create a temporary user for smooth testing
    const id = `user_${Date.now()}`;
    const newUser: User = {
      id,
      name: email.split('@')[0].toUpperCase(),
      email,
      role,
      institution: 'Global Research University',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    
    const updatedUsers = [...loadedUsers, newUser];
    localStorage.setItem('jms_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);
    
    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('jms_current_user_id', newUser.id);
    localStorage.setItem('jms_current_role', role);
    return true;
  };

  const register = (name: string, email: string, institution: string, role: UserRole) => {
    const loadedUsers = getUsers();
    const id = `user_${Date.now()}`;
    const newUser: User = {
      id,
      name,
      email,
      role,
      institution,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const updatedUsers = [...loadedUsers, newUser];
    localStorage.setItem('jms_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);

    setUser(newUser);
    setCurrentRole(role);
    localStorage.setItem('jms_current_user_id', id);
    localStorage.setItem('jms_current_role', role);
  };

  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem('jms_current_user_id');
    localStorage.removeItem('jms_current_role');
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('jms_current_role', role);

    // Map user profile corresponding to the switched role for realistic view switching
    const loadedUsers = getUsers();
    let correspondingUser = loadedUsers.find(u => u.role === role);
    if (!correspondingUser) {
      // Create user if not exists
      correspondingUser = INITIAL_USERS_MAPPING[role];
      const updated = [...loadedUsers, correspondingUser];
      localStorage.setItem('jms_users', JSON.stringify(updated));
      setUsersList(updated);
    }
    setUser(correspondingUser);
    localStorage.setItem('jms_current_user_id', correspondingUser.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        usersList
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

const INITIAL_USERS_MAPPING: Record<UserRole, User> = {
  author: {
    id: 'user_author_1',
    name: 'Dr. Emily Harrison',
    email: 'emily.h@university.edu',
    role: 'author',
    institution: 'Stanford University',
    publicationsCount: 14,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  reviewer: {
    id: 'user_reviewer_1',
    name: 'Prof. Marcus Vance',
    email: 'marcus.v@oxford.ac.uk',
    role: 'reviewer',
    institution: 'University of Oxford',
    specialty: ['Quantum Computing', 'Cryptography', 'Parallel Systems'],
    publicationsCount: 42,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    id: 'user_admin_1',
    name: 'Prof. Alistair Sterling',
    email: 'a.sterling@nature-jms.org',
    role: 'admin',
    institution: 'Editor-in-Chief, Journal of Modern Science',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
};
