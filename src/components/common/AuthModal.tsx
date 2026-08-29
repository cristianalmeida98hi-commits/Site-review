import React, { useState } from 'react';
import { X, UserCheck, Shield, Video, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { allUsers, switchUser, login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'CREATOR'>('USER');
  const [bio, setBio] = useState('');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickSwitch = async (userId: string) => {
    setIsSubmitting(true);
    await switchUser(userId);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (mode === 'login') {
      if (!email) {
        setErrorMessage('Por favor informe o email.');
        setIsSubmitting(false);
        return;
      }
      const success = await login(email);
      if (success) {
        onClose();
      } else {
        setErrorMessage('Email não cadastrado. Utilize um dos perfis rápidos abaixo ou cadastre-se.');
      }
    } else {
      if (!name || !email) {
        setErrorMessage('Preencha nome e email.');
        setIsSubmitting(false);
        return;
      }
      const success = await register({
        name,
        email,
        role,
        bio,
        youtubeChannelUrl: role === 'CREATOR' ? youtubeChannelUrl : undefined
      });
      if (success) {
        onClose();
      } else {
        setErrorMessage('Falha ao registrar usuário.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div 
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        id="auth-modal-content"
        className="relative w-full max-w-lg bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] text-black max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-black hover:bg-[#FF6B00] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00] border-2 border-black text-black text-xs font-black mb-3 shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>ReviewHub Community</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-black">
            {mode === 'login' ? 'Entrar no ReviewHub' : 'Crie sua Conta'}
          </h2>
          <p className="text-xs font-semibold text-zinc-600 mt-1">
            {mode === 'login' 
              ? 'Acesse avaliações, crie reviews, favorite produtos e acompanhe preços.' 
              : 'Junte-se à maior comunidade de decisões inteligentes de tecnologia.'}
          </p>
        </div>

        {/* 1-Click Fast Profile Switcher for effortless review & moderation testing */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center justify-between text-xs font-black text-black mb-2.5">
            <span className="flex items-center gap-1.5 text-black">
              <UserCheck className="w-4 h-4 text-black" /> Acesso Rápido de Teste (1 Clique)
            </span>
          </div>
          <p className="text-[11px] font-semibold text-zinc-600 mb-3">
            Alterne instantaneamente para experimentar permissões de Admin, Criador de Conteúdo ou Usuário:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allUsers.slice(0, 4).map(u => (
              <button
                key={u.id}
                id={`btn-quick-login-${u.username}`}
                type="button"
                onClick={() => handleQuickSwitch(u.id)}
                disabled={isSubmitting}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white hover:bg-[#FF6B00] border-2 border-black text-left transition-all group shadow-[2px_2px_0px_0px_#000]"
              >
                <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-black" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-black truncate">{u.name}</div>
                  <div className="text-[10px] text-zinc-600 font-bold flex items-center gap-1">
                    {u.role === 'ADMIN' && <span className="text-rose-600 font-black flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> Admin</span>}
                    {u.role === 'CREATOR' && <span className="text-black font-black flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> Criador</span>}
                    {u.role === 'USER' && <span className="text-zinc-600">Usuário</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-black text-black mb-1">Nome Completo</label>
              <input
                id="input-auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="bento-input text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-black mb-1">Email</label>
            <input
              id="input-auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
              className="bento-input text-xs"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-black text-black mb-1.5">Tipo de Perfil</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-black text-xs font-black transition-all ${
                      role === 'USER'
                        ? 'bg-[#FF6B00] text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Usuário Comum</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CREATOR')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-black text-xs font-black transition-all ${
                      role === 'CREATOR'
                        ? 'bg-[#FF6B00] text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Criador de Review</span>
                  </button>
                </div>
              </div>

              {role === 'CREATOR' && (
                <div>
                  <label className="block text-xs font-black text-black mb-1">Canal do YouTube / Portfólio</label>
                  <input
                    id="input-auth-yt"
                    type="url"
                    value={youtubeChannelUrl}
                    onChange={e => setYoutubeChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@seucanal"
                    className="bento-input text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-black mb-1">Biografia Curta (Opcional)</label>
                <textarea
                  id="input-auth-bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Quais categorias de hardware ou tecnologia você mais consome?"
                  rows={2}
                  className="bento-input text-xs"
                />
              </div>
            </>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 border-2 border-black text-black text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
              {errorMessage}
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full bento-btn-lime py-3 px-4 text-xs font-black flex items-center justify-center gap-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no ReviewHub</span>
              </>
            ) : (
              <>
                <span>Cadastrar e Começar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black text-center text-xs font-bold text-zinc-700">
          {mode === 'login' ? (
            <p>
              Ainda não tem conta?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className="text-black underline hover:bg-[#FF6B00] px-1 rounded font-black"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="text-black underline hover:bg-[#FF6B00] px-1 rounded font-black"
              >
                Entrar com email
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
