import React, { useState, useEffect } from 'react';
import { 
  Heart, Star, User, Video, ShieldCheck, Trash2, ArrowRight, 
  TrendingDown, Sparkles, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product, UserRating } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

interface MyAccountPageProps {
  initialTab?: string;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ initialTab = 'favorites' }) => {
  const { currentUser, favorites, toggleFavorite, setCurrentPage, register } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'ratings' | 'creator-apply' | 'profile'>(
    (initialTab as any) || 'favorites'
  );

  const [favProducts, setFavProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Creator application state
  const [applyChannelUrl, setApplyChannelUrl] = useState('');
  const [applyNiche, setApplyNiche] = useState('Placas de Vídeo e Processadores');
  const [applySampleVideo, setApplySampleVideo] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const loadFavs = async () => {
      try {
        setIsLoading(true);
        const prods = await apiService.getProducts();
        const matches = prods.filter(p => favorites.includes(p.id));
        setFavProducts(matches);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavs();
  }, [favorites]);

  const handleApplyCreator = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySuccess(true);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser?.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        {[
          { id: 'favorites', label: `Lista de Desejos (${favorites.length})` },
          { id: 'creator-apply', label: 'Tornar-se Criador' },
          { id: 'profile', label: 'Dados do Perfil' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Produtos Monitorados & Favoritos</h3>
            <span className="text-xs text-slate-400">Acompanhe alterações de preços e novas análises</span>
          </div>

          {favProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Heart className="w-8 h-8 text-rose-500/60 mx-auto" />
              <div className="font-bold text-slate-200">Sua lista de desejos está vazia.</div>
              <p>Clique no ícone de coração nos produtos para acompanhar o histórico de preços e novos reviews.</p>
              <button
                onClick={() => setCurrentPage('products')}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favProducts.map(prod => (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1" />
                      <div>
                        <div className="text-[10px] font-bold text-cyan-400">{prod.categoryName}</div>
                        <h4 
                          onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                          className="font-bold text-xs text-slate-100 hover:text-cyan-400 cursor-pointer line-clamp-1"
                        >
                          {prod.name}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(prod.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Melhor Preço</div>
                      <div className="font-black text-emerald-400">
                        R$ {prod.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <VerdictBadge verdict={prod.recommendationVerdict} size="sm" />
                  </div>

                  <button
                    onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-colors"
                  >
                    <span>Ver Análise e Lojas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CREATOR APPLY TAB */}
      {activeTab === 'creator-apply' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Programa Oficial de Criadores</span>
            </div>
            <h2 className="text-xl font-black text-white">Monetize seus Reviews de Tecnologia</h2>
            <p className="text-xs text-slate-400 mt-1">
              Junte-se à bancada de criadores do ReviewHub. Publique análises, incorpore seus vídeos do YouTube e receba até 65% de comissão sobre vendas geradas por links de afiliados.
            </p>
          </div>

          {applySuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 text-center">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <h3 className="font-bold text-sm">Candidatura enviada com sucesso!</h3>
              <p className="text-xs text-slate-300">
                Nossa equipe editorial analisará seu canal e histórico de análises em até 48 horas úteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApplyCreator} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Link do Canal no YouTube / Portfólio *</label>
                <input
                  type="url"
                  value={applyChannelUrl}
                  onChange={e => setApplyChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@seucanal"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nicho Principal de Análises *</label>
                <select
                  value={applyNiche}
                  onChange={e => setApplyNiche(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Placas de Vídeo e Processadores">Placas de Vídeo e Processadores</option>
                  <option value="Smartphones e Fotografia Mobile">Smartphones e Fotografia Mobile</option>
                  <option value="Armazenamento e SSDs NVMe">Armazenamento e SSDs NVMe</option>
                  <option value="Monitores e Displays Gamer">Monitores e Displays Gamer</option>
                  <option value="Periféricos, Teclados e Mouses">Periféricos, Teclados e Mouses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Link de um Review de Exemplo (Vídeo) *</label>
                <input
                  type="url"
                  value={applySampleVideo}
                  onChange={e => setApplySampleVideo(e.target.value)}
                  placeholder="https://youtu.be/xxxx"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Apresentação / Metodologia de Teste</label>
                <textarea
                  value={applyBio}
                  onChange={e => setApplyBio(e.target.value)}
                  placeholder="Conte-nos sobre seus equipamentos de teste (bancada, sensores, jogos testados)..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-cyan-500/20"
                >
                  Enviar Candidatura
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-xs">
          <h3 className="text-base font-black text-white">Minhas Informações</h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Nome</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                {currentUser?.name}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Email</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                {currentUser?.email}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Tipo de Conta</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                {currentUser?.role}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Biografia</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                {currentUser?.bio || 'Nenhuma biografia informada.'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
