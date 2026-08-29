import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Youtube, Award, Sparkles } from 'lucide-react';
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
    'Novato': 'bg-zinc-100 text-black border-black',
    'Bronze': 'bg-amber-200 text-black border-black',
    'Prata': 'bg-zinc-200 text-black border-black',
    'Ouro': 'bg-yellow-300 text-black border-black',
    'Especialista': 'bg-[#FF6B00] text-black border-black'
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-black" />
            <span>Criadores & Especialistas Certificados</span>
          </h1>
          <p className="text-xs text-zinc-600 font-bold mt-1">
            Conheça os canais, bancadas de teste e autores que produzem reviews independentes com reputação verificada no ReviewHub.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('my-account', { tab: 'creator-apply' })}
          className="bento-btn-lime text-xs px-4 py-2.5 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>Quero Ser um Criador Parceiro</span>
        </button>
      </div>

      {/* Selected Creator Detail View if active */}
      {selectedCreatorReviews ? (
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-4">
            <button
              onClick={() => setSelectedCreatorReviews(null)}
              className="text-xs font-black text-black underline hover:bg-[#FF6B00] px-1 rounded flex items-center gap-1 inline-flex"
            >
              ← Voltar para lista de todos os criadores
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
              <img 
                src={selectedCreatorReviews.creator.avatarUrl} 
                alt={selectedCreatorReviews.creator.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-black shadow-[3px_3px_0px_0px_#000]" 
              />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-black">{selectedCreatorReviews.creator.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${creatorLevelColors[selectedCreatorReviews.creator.level]}`}>
                    Nível {selectedCreatorReviews.creator.level}
                  </span>
                  {selectedCreatorReviews.creator.isVerified && (
                    <span className="text-[11px] text-black font-black bg-[#FF6B00] px-2 py-0.5 rounded border border-black flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-700 font-semibold max-w-2xl leading-relaxed">
                  {selectedCreatorReviews.creator.bio}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-zinc-600 font-bold pt-1">
                  <span><strong className="text-black">{selectedCreatorReviews.creator.totalReviews}</strong> Reviews Publicados</span>
                  <span><strong className="text-black">{selectedCreatorReviews.creator.totalViews.toLocaleString()}</strong> Visualizações</span>
                  {selectedCreatorReviews.creator.youtubeChannelUrl && (
                    <a
                      href={selectedCreatorReviews.creator.youtubeChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-rose-600 hover:underline font-black"
                    >
                      <Youtube className="w-4 h-4" /> Canal no YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-black mb-4">Reviews Publicados por {selectedCreatorReviews.creator.name}</h3>
            {selectedCreatorReviews.reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-bold bento-card">
                Nenhum review público ainda para este criador.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCreatorReviews.reviews.map(rev => (
                  <ReviewCard
                    key={rev.id}
                    review={rev}
                    onPlayVideo={(r) => setActiveVideoModalReview(r)}
                    onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
                    onOpenCreator={() => {}}
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
            <div className="w-10 h-10 border-4 border-black border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-700 font-bold">Carregando lista de criadores parceiros...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map(creator => (
              <div
                key={creator.id}
                id={`creator-card-${creator.id}`}
                className="bento-card p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0" 
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-sm text-black truncate">
                        {creator.name}
                      </h3>
                      {creator.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />}
                    </div>

                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${creatorLevelColors[creator.level] || 'bg-zinc-100 text-black border-black'}`}>
                      {creator.level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 font-semibold line-clamp-3 leading-relaxed">
                  {creator.bio}
                </p>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2 text-xs">
                  <div className="text-zinc-600 font-bold text-[11px]">
                    <span className="font-black text-black">{creator.totalReviews}</span> reviews • <span className="font-black text-black">{creator.totalViews.toLocaleString()}</span> views
                  </div>

                  <button
                    onClick={() => handleOpenCreator(creator)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FF6B00] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors"
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
      {activeVideoModalReview && (
        <YouTubeEmbedModal
          isOpen={true}
          onClose={() => setActiveVideoModalReview(null)}
          youtubeVideoId={activeVideoModalReview.youtubeVideoId}
          reviewTitle={activeVideoModalReview.title}
          creatorName={activeVideoModalReview.creatorName}
        />
      )}

    </div>
  );
};
