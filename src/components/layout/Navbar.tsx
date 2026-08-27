import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Sun, Moon, Bell, Heart, Scale, User, Shield, Video, 
  Menu, X, Sparkles, ExternalLink, ChevronDown, Check, LogOut,
  SlidersHorizontal, Flame, Star, Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/api.js';
import { ScoreBadge } from '../common/ScoreBadge.js';
import { VerdictBadge } from '../common/VerdictBadge.js';
import { AuthModal } from '../common/AuthModal.js';

interface NavbarProps {
  onOpenSearchPage?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    logout, 
    theme, 
    toggleTheme, 
    currentPage, 
    setCurrentPage, 
    compareList, 
    favorites, 
    notifications, 
    unreadNotificationsCount, 
    markNotificationRead 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    products: Array<{ id: string; name: string; slug: string; imageUrl: string; price: number; rating: number; verdict: string; categoryName: string }>;
    brands: Array<{ id: string; name: string; slug: string }>;
    categories: Array<{ id: string; name: string; slug: string }>;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  // Live auto-suggest search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await apiService.searchSuggest(searchQuery.trim());
          setSuggestions(res);
          setIsSearchOpen(true);
        } catch (e) {
          console.error(e);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(null);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setCurrentPage('products', { search: searchQuery.trim() });
    }
  };

  const navItems = [
    { id: 'nav-home', label: 'Início', page: 'home' },
    { id: 'nav-products', label: 'Produtos', page: 'products' },
    { id: 'nav-reviews', label: 'Reviews', page: 'reviews' },
    { id: 'nav-compare', label: 'Comparar', page: 'compare' },
    { id: 'nav-offers', label: 'Ofertas', page: 'offers' },
    { id: 'nav-creators', label: 'Criadores', page: 'creators' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white/95 backdrop-blur-md transition-colors shadow-[0_2px_0px_#000]">
        {/* Top Announcement Bar - Bento Lime Accent */}
        <div className="w-full bg-[#D4FF59] border-b-2 border-black py-1 px-4 text-center text-xs text-black font-black uppercase tracking-wider flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Antes de comprar, confira vereditos técnicos certificados e melhores ofertas</span>
        </div>

        {/* Main Navbar Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            id="reviewhub-logo"
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D4FF59] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-black fill-current" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-black group-hover:text-zinc-700 transition-colors">
                Review<span className="bg-black text-[#D4FF59] px-1 rounded ml-0.5">HUB</span>
              </span>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 -mt-0.5">
                Hardware & Tech
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                id={item.id}
                onClick={() => setCurrentPage(item.page)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${
                  currentPage === item.page
                    ? 'bg-[#D4FF59] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Global Smart Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  id="navbar-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => { if (suggestions) setIsSearchOpen(true); }}
                  placeholder="Pesquise RTX 4060, Ryzen 7, SSD, Monitor..."
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-zinc-100 border-2 border-black focus:bg-white text-xs font-semibold text-black placeholder-zinc-500 focus:outline-none shadow-[2px_2px_0px_#000] transition-all"
                />
              </div>
            </form>

            {/* Smart Suggestions Dropdown */}
            {isSearchOpen && suggestions && (
              <div 
                id="search-suggestions-dropdown"
                className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] z-50 max-h-[75vh] overflow-y-auto space-y-3"
              >
                {suggestions.products.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
                      Produtos Encontrados
                    </div>
                    <div className="space-y-1">
                      {suggestions.products.map(p => (
                        <div
                          key={p.id}
                          id={`suggest-item-${p.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            setCurrentPage('product-detail', { slug: p.slug });
                          }}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-black cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-zinc-50 border border-black/10 shrink-0 p-1" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-black group-hover:text-zinc-700 truncate">{p.name}</div>
                              <div className="text-[10px] text-zinc-500">{p.categoryName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <ScoreBadge score={p.rating} size="sm" />
                            <span className="text-xs font-black text-emerald-600 font-mono">
                              R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.categories.length > 0 && (
                  <div className="border-t-2 border-black/10 pt-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-2 mb-1">
                      Categorias
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {suggestions.categories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setCurrentPage('products', { category: c.id });
                          }}
                          className="px-2.5 py-1 rounded-full bg-zinc-100 border border-black text-[11px] font-bold text-black hover:bg-[#D4FF59]"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            
            {/* Live Role Switcher */}
            <div ref={roleSwitcherRef} className="relative hidden md:block">
              <button
                id="btn-role-switcher"
                onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] transition-colors"
                title="Alternar Perfil de Demonstração"
              >
                {currentUser?.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-rose-600" />}
                {currentUser?.role === 'CREATOR' && <Video className="w-3.5 h-3.5 text-blue-600" />}
                {currentUser?.role === 'USER' && <User className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="truncate max-w-[100px]">{currentUser?.name.split(' ')[0]}</span>
                <span className="text-[10px] bg-black text-white px-1 rounded font-mono">[{currentUser?.role}]</span>
                <ChevronDown className="w-3 h-3 text-black" />
              </button>

              {isRoleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] z-50 space-y-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-black/10">
                    Alternar Conta de Demonstração
                  </div>
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      id={`btn-select-user-${u.username}`}
                      onClick={() => {
                        switchUser(u.id);
                        setIsRoleSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        currentUser?.id === u.id ? 'bg-[#D4FF59] text-black border border-black font-bold' : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-black shrink-0" />
                        <div className="truncate">
                          <div className="font-bold truncate">{u.name}</div>
                          <div className="text-[10px] opacity-75 font-mono">{u.role}</div>
                        </div>
                      </div>
                      {currentUser?.id === u.id && <Check className="w-4 h-4 shrink-0 text-black font-bold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compare Counter Button */}
            <button
              id="btn-nav-compare"
              onClick={() => setCurrentPage('compare')}
              className={`relative p-2 rounded-full border-2 border-black transition-colors ${
                compareList.length > 0
                  ? 'bg-[#D4FF59] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100'
              }`}
              title="Comparador de Produtos"
            >
              <Scale className="w-4 h-4" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-[#D4FF59] font-black text-[10px] flex items-center justify-center border border-black">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist Favorites Button */}
            <button
              id="btn-nav-favorites"
              onClick={() => setCurrentPage('my-account', { tab: 'favorites' })}
              className={`relative p-2 rounded-full border-2 border-black transition-colors ${
                favorites.length > 0
                  ? 'bg-rose-100 border-2 border-black text-rose-600 shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100'
              }`}
              title="Lista de Desejos"
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-current' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border border-black">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                id="btn-nav-notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-full border-2 border-black transition-colors ${
                  unreadNotificationsCount > 0
                    ? 'bg-amber-200 border-2 border-black text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100'
                }`}
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-[#D4FF59] font-black text-[10px] flex items-center justify-center border border-black">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div 
                  id="notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] z-50 space-y-2 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
                    <span className="text-xs font-black uppercase text-black">Notificações</span>
                    <span className="text-[10px] bg-[#D4FF59] border border-black text-black font-black px-1.5 py-0.5 rounded-full">{unreadNotificationsCount} novas</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500">Nenhuma notificação por enquanto.</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link) setCurrentPage(n.link.replace('/', ''));
                          setIsNotifOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-xs cursor-pointer transition-colors ${
                          n.read 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-500' 
                            : 'bg-[#D4FF59]/20 border-black text-black font-medium shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        <div className="font-black text-black">{n.title}</div>
                        <div className="text-[11px] text-zinc-700 mt-0.5">{n.message}</div>
                        <div className="text-[9px] text-zinc-400 font-mono mt-1">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100 transition-colors"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-800" />}
            </button>

            {/* User Account Menu */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_#000] transition-colors"
                >
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-black" />
                  <ChevronDown className="w-3 h-3 text-black" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] z-50 space-y-1 text-xs">
                    <div className="px-3 py-2 border-b-2 border-black/10">
                      <div className="font-black text-black">{currentUser.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{currentUser.email}</div>
                    </div>

                    <button
                      id="btn-menu-my-account"
                      onClick={() => { setIsUserMenuOpen(false); setCurrentPage('my-account'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 text-black text-left font-bold"
                    >
                      <User className="w-4 h-4 text-black" />
                      <span>Minha Conta</span>
                    </button>

                    {(currentUser.role === 'CREATOR' || currentUser.role === 'ADMIN') && (
                      <button
                        id="btn-menu-creator-panel"
                        onClick={() => { setIsUserMenuOpen(false); setCurrentPage('creator-dashboard'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 text-black text-left font-bold"
                      >
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>Painel do Criador</span>
                      </button>
                    )}

                    {currentUser.role === 'ADMIN' && (
                      <button
                        id="btn-menu-admin-panel"
                        onClick={() => { setIsUserMenuOpen(false); setCurrentPage('admin-panel'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 text-left font-black"
                      >
                        <Shield className="w-4 h-4 text-rose-600" />
                        <span>Painel Administrativo</span>
                      </button>
                    )}

                    <div className="border-t-2 border-black/10 pt-1">
                      <button
                        id="btn-menu-logout"
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-100 text-rose-700 text-left font-black"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-[#D4FF59] hover:bg-[#c5f53d] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] transition-colors"
              >
                Entrar
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 bg-white border-b-2 border-black space-y-2">
            {/* Mobile Search input */}
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar produto..."
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-zinc-100 border-2 border-black text-xs text-black font-semibold"
                />
              </div>
            </form>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-black uppercase border-2 border-black ${
                    currentPage === item.page ? 'bg-[#D4FF59] text-black shadow-[2px_2px_0px_#000]' : 'bg-white text-black shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {currentUser && (
              <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-bold">Perfil: <strong className="text-black">{currentUser.name}</strong></span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black text-[#D4FF59] font-mono">{currentUser.role}</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
