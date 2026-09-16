import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [currency, setCurrency] = useState('$');
  const [receiptLanguage, setReceiptLanguage] = useState('nepali');
  const [codes, setCodes] = useState([]);

  const refreshOrgName = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.org_name) {
          setOrgName(data.org_name);
          document.title = data.org_name;
        } else {
          const lang = data.receipt_language || 'nepali';
          document.title = lang === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड';
        }
        if (data.org_address) setOrgAddress(data.org_address);
        if (data.currency) setCurrency(data.currency);
        if (data.receipt_language) setReceiptLanguage(data.receipt_language);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshOrgName();
  }, []);

  // Update title whenever receiptLanguage changes if orgName is empty
  useEffect(() => {
    if (!orgName) {
      document.title = receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड';
    }
  }, [receiptLanguage, orgName]);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(payload);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (tokenData, userData) => {
    localStorage.setItem('token', tokenData);
    setToken(tokenData);
    setUser(userData);
    
    // Fetch codes and save to sessionStorage
    try {
      const res = await fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + tokenData } });
      if (res.ok) {
        const codes = await res.json();
        sessionStorage.setItem('codes', JSON.stringify(codes));
      }
    } catch (e) {
      console.error("Failed to fetch codes on login");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('codes');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, orgName, orgAddress, currency, receiptLanguage, login, logout, codes, setCodes, loading, refreshOrgName }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
