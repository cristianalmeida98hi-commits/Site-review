import React, { useState, useEffect } from 'react';
import { Video, ShieldCheck, Star, ArrowRight, ExternalLink, Youtube, Award, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { CreatorProfile, Review } from '../types/index.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { YouTubeEmbedModal } from '../components/common/YouTubeEmbedModal.js';

export const CreatorsPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedCreatorReviews, setSelectedCreatorReviews] = useState<{ creator: CreatorProfile; reviews: Review[] } | null>(null);
  const [activeVideoModalReview, setActiveVideoModalReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoading(true);
        const list = await apiService.getCreators();
        setCreators(list);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCreators();
  }, []);

  const handleOpenCreator = async (creator: CreatorProfile) => {
    try {
      const revs = await apiService.getReviews({ creatorId: creator.id });
      setSelectedCreatorReviews({ creator, reviews: revs });
    } catch (e) {
      console.error(e);
    }
  };

  const creatorLevelColors: Record<string, string> = {
    'Novato': 'bg-slate-700 text-slate-300',
    'Bronze': 'bg-amber-700/30 text-amber-300 border-amber-600/40',
    'Prata': 'bg-slate-400/20 text-slate-300 border-slate-400/40',
    'Ouro': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'Especialista': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-yellow-400" />
            <span>Criadores & Especialistas Certificados</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conheça os canais, bancadas de teste e autores que produzem reviews independentes com reputação verificada no ReviewHub.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('my-account', { tab: 'creator-apply' })}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Quero Ser um Criador Parceiro</span>
        </button>
      </div>

      {/* Selected Creator Detail View if active */}
      {selectedCreatorReviews ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <button
              onClick={() => setSelectedCreatorReviews(null)}
              className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              ← Voltar para lista de todos os criadores
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
              <img 
                src={selectedCreatorReviews.creator.avatarUrl} 
                alt={selectedCreatorReviews.creator.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700" 
              />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-white">{selectedCreatorReviews.creator.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${creatorLevelColors[selectedCreatorReviews.creator.level]}`}>
                    Nível {selectedCreatorReviews.creator.level}
                  </span>
                  {selectedCreatorReviews.creator.isVerified && (
                    <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Verificado
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {selectedCreatorReviews.creator.bio}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
                  <span><strong>{selectedCreatorReviews.creator.totalReviews}</strong> Reviews Publicados</span>
                  <span><strong>{selectedCreatorReviews.creator.totalViews.toLocaleString()}</strong> Visualizações</span>
                  {selectedCreatorReviews.creator.youtubeChannelUrl && (
                    <a
                      href={selectedCreatorReviews.creator.youtubeChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-rose-400 hover:underline font-bold"
                    >
                      <Youtube className="w-4 h-4" /> Canal no YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-white mb-4">Reviews Publicados por {selectedCreatorReviews.creator.name}</h3>
            {selectedCreatorReviews.reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
                Nenhum review público ainda para este criador.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCreatorReviews.reviews.map(rev => (
                  <ReviewCard
                    key={rev.id}
                    review={rev}
                    onOpenVideo={(r) => setActiveVideoModalReview(r)}
                    onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Creators Directory Grid */
        isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Carregando lista de criadores parceiros...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map(creator => (
              <div
                key={creator.id}
                id={`creator-card-${creator.id}`}
                className="flex flex-col justify-between p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-4 group"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name} 
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0" 
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                        {creator.name}
                      </h3>
                      {creator.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>

                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${creatorLevelColors[creator.level] || 'bg-slate-800 text-slate-300'}`}>
                      {creator.level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {creator.bio}
                </p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-200">{creator.totalReviews}</span> reviews • <span className="font-bold text-slate-200">{creator.totalViews.toLocaleString()}</span> views
                  </div>

                  <button
                    onClick={() => handleOpenCreator(creator)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-colors"
                  >
                    <span>Ver Perfil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* YouTube Modal */}
      <YouTubeEmbedModal
        review={activeVideoModalReview}
        onClose={() => setActiveVideoModalReview(null)}
        onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
      />

    </div>
  );
};
