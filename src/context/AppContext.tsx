import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Product, Notification, Favorite, PlatformSettings } from '../types/index.js';
import { apiService, setStoredUserId } from '../services/api.js';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoadingUser: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string, params?: Record<string, any>) => void;
  pageParams: Record<string, any>;
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  favorites: Favorite[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: Partial<User>) => Promise<boolean>;
  settings: PlatformSettings | null;
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentPage, setCurrentPageState] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setCurrentPage = (page: string, params: Record<string, any> = {}) => {
    setCurrentPageState(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      setIsLoadingUser(true);
      const [meRes, usersRes, favRes, notifRes, setRes] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getAllUsers(),
        apiService.getFavorites().catch(() => []),
        apiService.getNotifications().catch(() => []),
        apiService.getSettings().catch(() => null)
      ]);

      if (meRes?.user) {
        setCurrentUser(meRes.user);
        setStoredUserId(meRes.user.id);
      }
      setAllUsers(usersRes);
      setFavorites(favRes);
      setNotifications(notifRes);
      if (setRes) setSettings(setRes);
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshUserData = async () => {
    try {
      const [meRes, favRes, notifRes] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getFavorites().catch(() => []),
        apiService.getNotifications().catch(() => [])
      ]);
      if (meRes?.user) {
        setCurrentUser(meRes.user);
        setStoredUserId(meRes.user.id);
      }
      setFavorites(favRes);
      setNotifications(notifRes);
    } catch (e) {
      console.error(e);
    }
  };

  const switchUser = async (userId: string) => {
    try {
      setStoredUserId(userId);
      const res = await apiService.switchProfile(userId);
      setCurrentUser(res.user);
      await refreshUserData();
    } catch (e) {
      console.error('Falha ao alternar usuário', e);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await apiService.login(email, password);
      if (res.user) {
        setStoredUserId(res.user.id);
        setCurrentUser(res.user);
        await refreshUserData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setStoredUserId(null);
      await loadInitialData();
      setCurrentPage('home');
    } catch (e) {
      console.error(e);
    }
  };

  const register = async (data: Partial<User>): Promise<boolean> => {
    try {
      const res = await apiService.register(data);
      if (res.user) {
        setStoredUserId(res.user.id);
        setCurrentUser(res.user);
        await refreshUserData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const addToCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) return;
    if (compareList.length >= 4) {
      alert('Você pode comparar no máximo 4 produtos simultaneamente.');
      return;
    }
    setCompareList(prev => [...prev, product]);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isFavorite = (productId: string) => {
    return favorites.some(f => f.productId === productId);
  };

  const toggleFavorite = async (productId: string) => {
    try {
      await apiService.toggleFavorite(productId);
      const updatedFavs = await apiService.getFavorites();
      setFavorites(updatedFavs);
    } catch (e) {
      console.error('Erro ao alternar favorito:', e);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifs = await apiService.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoadingUser,
        theme,
        toggleTheme,
        currentPage,
        setCurrentPage,
        pageParams,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        favorites,
        isFavorite,
        toggleFavorite,
        notifications,
        unreadNotificationsCount,
        refreshNotifications,
        markNotificationRead,
        switchUser,
        login,
        logout,
        register,
        settings,
        refreshUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
