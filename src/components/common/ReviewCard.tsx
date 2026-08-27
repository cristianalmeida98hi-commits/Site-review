import React from 'react';
import { Play, ThumbsUp, MessageSquare, ShieldCheck, ArrowRight, Video } from 'lucide-react';
import type { Review } from '../../types/index.js';
import { ScoreBadge } from './ScoreBadge.js';
import { VerdictBadge } from './VerdictBadge.js';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/api.js';

interface ReviewCardProps {
  review: Review;
  onOpenVideo?: (review: Review) => void;
  onOpenProduct?: (productSlug: string) => void;
  onOpenReviewDetail?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onOpenVideo, 
  onOpenProduct,
  onOpenReviewDetail 
}) => {
  const { currentUser } = useApp();
  const [likesCount, setLikesCount] = React.useState(review.likes);
  const [hasLiked, setHasLiked] = React.useState(
    currentUser ? review.likedBy.includes(currentUser.id) : false
  );

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiService.likeReview(review.id);
      setLikesCount(res.likes);
      setHasLiked(res.hasLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const creatorBadgeColors: Record<string, string> = {
    'Novato': 'bg-zinc-200 text-black border border-black',
    'Bronze': 'bg-amber-200 text-black border border-black',
    'Prata': 'bg-zinc-300 text-black border border-black',
    'Ouro': 'bg-yellow-300 text-black border border-black font-black',
    'Especialista': 'bg-[#D4FF59] text-black border border-black font-black'
  };

  return (
    <div 
      id={`review-card-${review.id}`}
      className="group relative flex flex-col justify-between rounded-[24px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 p-5 transition-all duration-200"
    >
      {/* Top Header: Creator Info & Badges */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <img 
            src={review.creatorAvatar} 
            alt={review.creatorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-black shadow-[1.5px_1.5px_0px_#000]" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-black">{review.creatorName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-black fill-[#D4FF59]" title="Criador Verificado" />
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${creatorBadgeColors[review.creatorLevel] || 'bg-zinc-100 text-black border border-black'}`}>
              {review.creatorLevel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ScoreBadge score={review.rating} size="sm" />
          <VerdictBadge verdict={review.recommendation} size="sm" />
        </div>
      </div>

      {/* Video Thumbnail preview if has YouTube video */}
      {review.youtubeVideoId && (
        <div 
          onClick={() => onOpenVideo ? onOpenVideo(review) : undefined}
          className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 bg-black border-2 border-black cursor-pointer group/vid shadow-[2px_2px_0px_#000]"
        >
          <img 
            src={`https://img.youtube.com/vi/${review.youtubeVideoId}/hqdefault.jpg`} 
            alt={review.title}
            className="w-full h-full object-cover opacity-90 group-hover/vid:opacity-100 group-hover/vid:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#D4FF59] group-hover/vid:scale-110 text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-bold">
            <span className="flex items-center gap-1 bg-black/80 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm uppercase text-[10px]">
              <Video className="w-3 h-3 text-[#D4FF59]" /> Vídeo Análise
            </span>
            <span className="bg-black/80 px-2 py-0.5 rounded-full border border-white/20 text-[10px] font-mono">YouTube HD</span>
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="space-y-2 mb-3">
        <h4 
          onClick={() => onOpenReviewDetail ? onOpenReviewDetail(review.id) : (onOpenProduct && onOpenProduct(review.productSlug))}
          className="font-black text-sm text-black group-hover:text-zinc-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {review.title}
        </h4>

        <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
          {review.summary}
        </p>

        {/* Quick Pros bullet */}
        {review.pros.length > 0 && (
          <div className="p-2 rounded-xl bg-zinc-100 border border-black/10 text-[11px] text-black font-semibold line-clamp-1">
            <span className="text-emerald-700 font-black">✓ Destaque: </span>
            {review.pros[0]}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-3 text-xs text-zinc-600 font-bold">
          <button 
            id={`btn-like-review-${review.id}`}
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-black transition-colors ${hasLiked ? 'text-black font-black' : ''}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="stat-number">{likesCount}</span>
          </button>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="stat-number">{review.commentsCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenProduct && (
            <button
              id={`btn-rev-product-${review.id}`}
              onClick={() => onOpenProduct(review.productSlug)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black hover:bg-zinc-800 text-[#D4FF59] text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all"
            >
              <span>Ver Produto</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
