import React, { useState, useEffect } from 'react';
import { Video, Search, Filter, Sparkles, Play } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Review, Category } from '../types/index.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { YouTubeEmbedModal } from '../components/common/YouTubeEmbedModal.js';

export const ReviewsPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [activeVideoModalReview, setActiveVideoModalReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReviewsData = async () => {
      try {
        setIsLoading(true);
        const [revList, catList] = await Promise.all([
          apiService.getReviews({ status: 'published' }),
          apiService.getCategories()
        ]);
        setReviews(revList);
        setCategories(catList);
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
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Video className="w-7 h-7 text-cyan-400" />
            <span>Reviews de Criadores & Análises em Vídeo</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Testes técnicos, benchmarks e opiniões fundamentadas dos maiores criadores e especialistas em hardware.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por título ou criador..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando análises e vídeos em HD...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          Nenhum review encontrado com os termos pesquisados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(rev => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onOpenVideo={(r) => setActiveVideoModalReview(r)}
              onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
            />
          ))}
        </div>
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
