import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Heart, Scale, User, Shield, Video, 
  Menu, X, Sparkles, LogOut, Flame, Star, ChevronRight, Layers, Tag
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

  // Live search suggestion
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
      setIsMobileMenuOpen(false);
      setCurrentPage('products', { search: searchQuery.trim() });
    }
  };

  const navItems = [
    { id: 'nav-home', label: 'Início', page: 'home' },
    { id: 'nav-products', label: 'Produtos', page: 'products' },
    { id: 'nav-compare', label: 'Comparador', page: 'compare', count: compareList.length },
    { id: 'nav-offers', label: 'Ofertas', page: 'offers' },
    { id: 'nav-reviews', label: 'Reviews', page: 'reviews' },
    { id: 'nav-creators', label: 'Criadores', page: 'creators' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white/95 backdrop-blur-md transition-colors">
        {/* Top Announcement Bar - Destaque Laranja Neon */}
        <div className="w-full bg-[#FF6B00] border-b-2 border-black py-1.5 px-4 text-center text-xs text-black font-black uppercase tracking-wider flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-black fill-black" />
          <span>Vereditos técnicos independentes e comparação inteligente de hardware</span>
        </div>

        {/* Main Navbar Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo */}
          <div 
            id="nav-logo"
            onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-[3px_3px_0px_0px_#000] group-hover:bg-[#FF8533] transition-all">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-black flex items-center gap-1">
                REVIEW<span className="bg-[#FF6B00] text-black px-1.5 py-0.2 rounded-md border-2 border-black text-sm">HUB</span>
              </span>
              <span className="text-[10px] font-black text-zinc-600 -mt-0.5 tracking-widest uppercase">
                Hardware & Tech
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
                placeholder="Buscar placa de vídeo, processador, monitor..."
                aria-label="Buscar produtos"
                className="w-full bg-white border-2 border-black rounded-xl pl-10 pr-24 py-2 text-sm font-semibold text-black placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black font-bold text-xs"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#FF6B00] text-black font-black text-xs px-2.5 py-1 rounded-lg border-2 border-black hover:bg-[#FF8533] transition-all"
              >
                Buscar
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {isSearchOpen && suggestions && (
              <div 
                id="search-suggestions-dropdown"
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] overflow-hidden z-50 divide-y-2 divide-black"
              >
                {/* Produtos */}
                {suggestions.products.length > 0 && (
                  <div className="p-2">
                    <div className="text-[11px] font-black uppercase text-zinc-500 px-3 py-1">
                      Produtos Encontrados
                    </div>
                    {suggestions.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentPage('product-detail', { slug: p.slug });
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FF6B00]/30 cursor-pointer transition-colors border border-transparent hover:border-black"
                      >
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1 border-2 border-black" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-black truncate">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <span className="text-black font-mono font-black">
                              {p.price > 0 ? `R$ ${p.price.toLocaleString('pt-BR')}` : 'Sob consulta'}
                            </span>
                            <span>•</span>
                            <span className="font-semibold">{p.categoryName}</span>
                          </div>
                        </div>
                        <VerdictBadge verdict={p.verdict as any} size="sm" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Categorias & Marcas */}
                {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                  <div className="p-2.5 bg-zinc-100 flex flex-wrap gap-2">
                    {suggestions.categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentPage('products', { category: c.id });
                        }}
                        className="text-xs bg-white hover:bg-[#FF6B00] text-black font-bold px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
                      >
                        📁 {c.name}
                      </button>
                    ))}
                    {suggestions.brands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentPage('products', { search: b.name });
                        }}
                        className="text-xs bg-white hover:bg-[#FF6B00] text-black font-bold px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
                      >
                        🏷️ {b.name}
                      </button>
                    ))}
                  </div>
                )}

                <div 
                  onClick={handleSearchSubmit}
                  className="p-3 text-center text-xs font-black text-black bg-[#FF6B00] hover:bg-[#FF8533] cursor-pointer transition-colors"
                >
                  Ver todos os resultados para "{searchQuery}" →
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                id={item.id}
                onClick={() => setCurrentPage(item.page as any)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[40px] flex items-center gap-1.5 ${
                  currentPage === item.page
                    ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black text-[#FF6B00] text-[10px] font-black">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Compare Quick Button */}
            <button
              id="nav-quick-compare"
              onClick={() => setCurrentPage('compare')}
              aria-label={`Comparador com ${compareList.length} itens`}
              className={`bento-circle-btn relative ${
                compareList.length > 0 ? 'bg-[#FF6B00]' : ''
              }`}
            >
              <Scale className="w-4 h-4" />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-[#FF6B00] font-black text-[10px] rounded-full flex items-center justify-center border-2 border-black">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                id="nav-notifications-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label={`Notificações: ${unreadNotificationsCount} não lidas`}
                className="bento-circle-btn relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B00] rounded-full border-2 border-black"></span>
                )}
              </button>

              {isNotifOpen && (
                <div 
                  id="notifications-menu"
                  className="absolute right-0 mt-2 w-80 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] overflow-hidden z-50"
                >
                  <div className="p-3 border-b-2 border-black bg-[#FF6B00] flex items-center justify-between">
                    <span className="font-black text-xs text-black uppercase tracking-wider">Notificações</span>
                    <span className="text-[11px] font-bold text-black bg-white px-2 py-0.5 rounded-full border border-black">{unreadNotificationsCount} novas</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y-2 divide-zinc-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs font-semibold text-zinc-500">Nenhuma notificação recente</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { markNotificationRead(n.id); if (n.link) setCurrentPage(n.link as any); }}
                          className={`p-3 text-xs hover:bg-[#FF6B00]/20 cursor-pointer transition-colors ${!n.read ? 'bg-[#FF6B00]/10' : ''}`}
                        >
                          <div className="font-black text-black">{n.title}</div>
                          <div className="text-zinc-600 text-[11px] mt-0.5 font-medium">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Role Menu */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  id="nav-user-profile-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF6B00] transition-all min-h-[42px]"
                >
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover border-2 border-black" />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-black text-black leading-tight truncate max-w-[100px]">{currentUser.name}</span>
                    <span className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">{currentUser.role}</span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-60 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] overflow-hidden z-50 divide-y-2 divide-black"
                  >
                    <div className="p-3 bg-zinc-50">
                      <div className="text-xs font-black text-black truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-zinc-600 font-semibold truncate">{currentUser.email}</div>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FF6B00] text-black border border-black">
                        {currentUser.role === 'ADMIN' ? '👑 Administrador' : currentUser.role === 'CREATOR' ? '🎥 Criador Certificado' : '👤 Usuário'}
                      </div>
                    </div>

                    <div className="p-1.5 space-y-1">
                      {currentUser.role === 'ADMIN' && (
                        <button
                          id="user-menu-admin-panel"
                          onClick={() => { setIsUserMenuOpen(false); setCurrentPage('admin'); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black text-black hover:bg-[#FF6B00] rounded-xl transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Painel Administrativo</span>
                        </button>
                      )}

                      {currentUser.role === 'CREATOR' && (
                        <button
                          id="user-menu-creator-panel"
                          onClick={() => { setIsUserMenuOpen(false); setCurrentPage('creator-dashboard'); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black text-black hover:bg-[#FF6B00] rounded-xl transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span>Painel do Criador</span>
                        </button>
                      )}

                      <button
                        id="user-menu-favorites"
                        onClick={() => { setIsUserMenuOpen(false); setCurrentPage('products'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-xl transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span>Meus Favoritos ({favorites.length})</span>
                      </button>

                      {/* Switch User for Testing Roles */}
                      <button
                        onClick={() => { setIsRoleSwitcherOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-zinc-100 rounded-xl transition-colors"
                      >
                        <Layers className="w-4 h-4 text-zinc-700" />
                        <span>Alternar Perfil de Teste</span>
                      </button>
                    </div>

                    <div className="p-1.5">
                      <button
                        id="user-menu-logout"
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="bento-btn-lime text-xs px-4 py-2"
              >
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              className="lg:hidden bento-circle-btn"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Quick Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              id="mobile-quick-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar hardware ou review..."
              aria-label="Buscar produtos no mobile"
              className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-black placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <Search className="w-3.5 h-3.5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Full Mobile Drawer Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-nav-drawer"
            className="lg:hidden border-t-2 border-black bg-white px-4 py-4 space-y-3"
          >
            <div className="space-y-1.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.page as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black transition-all min-h-[44px] border-2 border-black ${
                    currentPage === item.page
                      ? 'bg-[#FF6B00] text-black shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                  </span>
                  {typeof item.count === 'number' && item.count > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-black text-[#FF6B00] text-xs font-black">
                      {item.count}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-black" />
                  )}
                </button>
              ))}
            </div>

            {/* Atalhos Rápidos no Mobile */}
            <div className="pt-2 border-t-2 border-black space-y-2">
              {currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setCurrentPage('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-black text-black bg-[#FF6B00] border-2 border-black shadow-[3px_3px_0px_0px_#000] min-h-[44px]"
                >
                  <Shield className="w-4 h-4" />
                  <span>Painel Administrativo</span>
                </button>
              )}

              {currentUser?.role === 'CREATOR' && (
                <button
                  onClick={() => {
                    setCurrentPage('creator-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-black text-black bg-[#FF6B00] border-2 border-black shadow-[3px_3px_0px_0px_#000] min-h-[44px]"
                >
                  <Video className="w-4 h-4" />
                  <span>Painel do Criador</span>
                </button>
              )}

              {!currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full bento-btn-lime py-3 text-sm font-black mt-2"
                >
                  Fazer Login / Cadastrar
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-black bg-rose-200 border-2 border-black shadow-[2px_2px_0px_0px_#000] min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Role Switcher Modal for Easy Sandbox Testing */}
      {isRoleSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-black">Alternar Perfil para Testes</h3>
              <button 
                onClick={() => setIsRoleSwitcherOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-black hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-semibold text-zinc-600">
              Selecione qualquer perfil para navegar instantaneamente como Usuário, Criador de Conteúdo ou Administrador.
            </p>
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {allUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setIsRoleSwitcherOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 border-black transition-all ${
                    currentUser?.id === u.id
                      ? 'bg-[#FF6B00] shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover border-2 border-black" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate">{u.name}</div>
                    <div className="text-[11px] font-bold text-zinc-600">{u.email}</div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border border-black uppercase ${
                    u.role === 'ADMIN' ? 'bg-rose-300 text-black' : u.role === 'CREATOR' ? 'bg-[#FF6B00] text-black' : 'bg-zinc-200 text-black'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
