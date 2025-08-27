import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import customerDataService from '../services/customerDataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('sales-manager'); // Default for demo
  const [visibleSites, setVisibleSites] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await api.getStoredAuth();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const userData = await api.login(credentials);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setUserRole('sales-manager');
      setVisibleSites([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const switchRole = (role, sites = []) => {
    setUserRole(role);
    setVisibleSites(sites);
    // Update customer data service with new role
    customerDataService.setUserRole(role, user?.id, sites);
    console.log(`Switched to role: ${role}${sites.length > 0 ? ` with ${sites.length} visible sites` : ''}`);
  };

  const getUserPermissions = () => {
    return customerDataService.getUserPermissions(userRole);
  };

  const canEditPrices = () => {
    return customerDataService.canEditPrices(userRole);
  };

  const canViewAllSites = () => {
    return customerDataService.canViewAllSites(userRole);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole,
    visibleSites,
    switchRole,
    getUserPermissions,
    canEditPrices,
    canViewAllSites,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};