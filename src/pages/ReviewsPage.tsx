import React, { useState, useEffect } from 'react';
import { Video, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Review } from '../types/index.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { YouTubeEmbedModal } from '../components/common/YouTubeEmbedModal.js';

export const ReviewsPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [activeVideoModalReview, setActiveVideoModalReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReviewsData = async () => {
      try {
        setIsLoading(true);
        const revList = await apiService.getReviews({ status: 'published' });
        setReviews(revList);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadReviewsData();
  }, []);

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = search === '' || 
      rev.title.toLowerCase().includes(search.toLowerCase()) || 
      rev.summary.toLowerCase().includes(search.toLowerCase()) ||
      rev.creatorName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2">
            <Video className="w-7 h-7 text-black" />
            <span>Reviews de Criadores & Análises em Vídeo</span>
          </h1>
          <p className="text-xs text-zinc-600 font-bold mt-1">
            Testes técnicos, benchmarks e opiniões fundamentadas dos maiores criadores e especialistas em hardware.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por título ou criador..."
            className="bento-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-black border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-700 font-bold">Carregando análises e vídeos em HD...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-600 font-bold p-8 bento-card">
          Nenhum review encontrado com os termos pesquisados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(rev => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onPlayVideo={(r) => setActiveVideoModalReview(r)}
              onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
              onOpenCreator={() => setCurrentPage('creators')}
            />
          ))}
        </div>
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
