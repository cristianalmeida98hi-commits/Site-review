import React, { useState, useEffect } from 'react';
import { 
  Heart, Trash2, ArrowRight, 
  Sparkles, CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product } from '../types/index.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

interface MyAccountPageProps {
  initialTab?: string;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ initialTab = 'favorites' }) => {
  const { currentUser, favorites, toggleFavorite, setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'ratings' | 'creator-apply' | 'profile'>(
    (initialTab as any) || 'favorites'
  );

  const [favProducts, setFavProducts] = useState<Product[]>([]);
  const [, setIsLoading] = useState(true);

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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div className="flex items-center gap-3">
          <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000]" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-black">{currentUser?.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-[#FF6B00] text-black border border-black text-[10px] font-black uppercase">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-bold">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-black pb-2 flex-wrap">
        {[
          { id: 'favorites', label: `Lista de Desejos (${favorites.length})` },
          { id: 'creator-apply', label: 'Tornar-se Criador' },
          { id: 'profile', label: 'Dados do Perfil' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-zinc-700 hover:bg-zinc-100'
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
            <h3 className="text-base font-black text-black">Produtos Monitorados & Favoritos</h3>
            <span className="text-xs text-zinc-600 font-bold">Acompanhe alterações de preços e novas análises</span>
          </div>

          {favProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-600 rounded-3xl bento-card space-y-3">
              <Heart className="w-8 h-8 text-black fill-[#FF6B00] mx-auto" />
              <div className="font-black text-black text-sm">Sua lista de desejos está vazia.</div>
              <p className="font-semibold">Clique no ícone de coração nos produtos para acompanhar o histórico de preços e novos reviews.</p>
              <button
                onClick={() => setCurrentPage('products')}
                className="bento-btn-lime text-xs px-4 py-2"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favProducts.map(prod => (
                <div key={prod.id} className="bento-card p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 rounded-xl object-contain bg-white border-2 border-black p-1" />
                      <div>
                        <div className="text-[10px] font-black text-black bg-[#FF6B00] px-1.5 py-0.5 rounded border border-black uppercase inline-block">{prod.categoryName}</div>
                        <h4 
                          onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                          className="font-black text-xs text-black hover:underline cursor-pointer line-clamp-1 mt-1"
                        >
                          {prod.name}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(prod.id)}
                      className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-rose-600 hover:bg-rose-100"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t-2 border-black text-xs">
                    <div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase">Melhor Preço</div>
                      <div className="font-black text-black font-mono">
                        R$ {prod.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <VerdictBadge verdict={prod.recommendationVerdict} size="sm" />
                  </div>

                  <button
                    onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                    className="bento-btn-lime text-xs py-2 w-full flex items-center justify-center gap-1"
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
        <div className="max-w-2xl mx-auto bento-card p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6B00] border-2 border-black text-black text-xs font-black mb-2 shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Programa Oficial de Criadores</span>
            </div>
            <h2 className="text-xl font-black text-black">Monetize seus Reviews de Tecnologia</h2>
            <p className="text-xs text-zinc-700 font-semibold mt-1">
              Junte-se à bancada de criadores do ReviewHub. Publique análises, incorpore seus vídeos do YouTube e receba comissão sobre vendas geradas por links de afiliados.
            </p>
          </div>

          {applySuccess ? (
            <div className="p-6 rounded-2xl bg-[#FF6B00] border-2 border-black text-black space-y-2 text-center shadow-[3px_3px_0px_0px_#000]">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <h3 className="font-black text-sm">Candidatura enviada com sucesso!</h3>
              <p className="text-xs font-bold text-zinc-800">
                Nossa equipe editorial analisará seu canal e histórico de análises em até 48 horas úteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApplyCreator} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1">Link do Canal no YouTube / Portfólio *</label>
                <input
                  type="url"
                  value={applyChannelUrl}
                  onChange={e => setApplyChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@seucanal"
                  required
                  className="bento-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Nicho Principal de Análises *</label>
                <select
                  value={applyNiche}
                  onChange={e => setApplyNiche(e.target.value)}
                  className="bento-input text-xs"
                >
                  <option value="Placas de Vídeo e Processadores">Placas de Vídeo e Processadores</option>
                  <option value="Smartphones e Fotografia Mobile">Smartphones e Fotografia Mobile</option>
                  <option value="Armazenamento e SSDs NVMe">Armazenamento e SSDs NVMe</option>
                  <option value="Monitores e Displays Gamer">Monitores e Displays Gamer</option>
                  <option value="Periféricos, Teclados e Mouses">Periféricos, Teclados e Mouses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Link de um Review de Exemplo (Vídeo) *</label>
                <input
                  type="url"
                  value={applySampleVideo}
                  onChange={e => setApplySampleVideo(e.target.value)}
                  placeholder="https://youtu.be/xxxx"
                  required
                  className="bento-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Apresentação / Metodologia de Teste</label>
                <textarea
                  value={applyBio}
                  onChange={e => setApplyBio(e.target.value)}
                  placeholder="Conte-nos sobre seus equipamentos de teste (bancada, sensores, jogos testados)..."
                  rows={3}
                  className="bento-input text-xs"
                />
              </div>

              <div className="flex justify-end pt-3 border-t-2 border-black">
                <button
                  type="submit"
                  className="bento-btn-lime text-xs px-6 py-2.5 uppercase font-black"
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
        <div className="max-w-xl mx-auto bento-card p-6 sm:p-8 space-y-4 text-xs">
          <h3 className="text-base font-black text-black">Minhas Informações</h3>

          <div className="space-y-3">
            <div>
              <label className="block font-black text-zinc-600 mb-1">Nome</label>
              <div className="p-2.5 rounded-xl bg-zinc-50 border-2 border-black text-black font-bold">
                {currentUser?.name}
              </div>
            </div>

            <div>
              <label className="block font-black text-zinc-600 mb-1">Email</label>
              <div className="p-2.5 rounded-xl bg-zinc-50 border-2 border-black text-black font-bold">
                {currentUser?.email}
              </div>
            </div>

            <div>
              <label className="block font-black text-zinc-600 mb-1">Tipo de Conta</label>
              <div className="p-2.5 rounded-xl bg-[#FF6B00] border-2 border-black text-black font-black">
                {currentUser?.role}
              </div>
            </div>

            <div>
              <label className="block font-black text-zinc-600 mb-1">Biografia</label>
              <div className="p-2.5 rounded-xl bg-zinc-50 border-2 border-black text-black font-semibold">
                {currentUser?.bio || 'Nenhuma biografia informada.'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
