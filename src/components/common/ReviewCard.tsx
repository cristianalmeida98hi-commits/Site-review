import React from 'react';
import { Play, ThumbsUp, ShieldCheck, ArrowRight, Video } from 'lucide-react';
import type { Review } from '../../types/index.js';
import { ScoreBadge } from './ScoreBadge.js';
import { VerdictBadge } from './VerdictBadge.js';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/api.js';

interface ReviewCardProps {
  review: Review;
  onPlayVideo?: (review: Review) => void;
  onOpenProduct?: (productSlug: string) => void;
  onOpenCreator?: (creatorId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onPlayVideo, 
  onOpenProduct,
  onOpenCreator 
}) => {
  const { currentUser, setCurrentPage } = useApp();
  const [likesCount, setLikesCount] = React.useState(review.likes);
  const [hasLiked, setHasLiked] = React.useState(
    currentUser ? review.likedBy?.includes(currentUser.id) : false
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

  return (
    <div 
      id={`review-card-${review.id}`}
      className="bento-card flex flex-col justify-between p-5 space-y-4"
    >
      {/* Top Header: Creator Info & Badges */}
      <div className="flex items-center justify-between gap-3">
        <div 
          onClick={() => onOpenCreator ? onOpenCreator(review.creatorId) : setCurrentPage('creators')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img 
            src={review.creatorAvatar} 
            alt={review.creatorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000]" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-black group-hover:text-zinc-700">{review.creatorName}</span>
              <ShieldCheck className="w-4 h-4 text-black fill-[#FF6B00]" title="Criador Verificado" />
            </div>
            <span className="text-[10px] text-zinc-600 font-bold uppercase">
              {review.creatorLevel || 'Especialista'}
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
          onClick={() => onPlayVideo ? onPlayVideo(review) : undefined}
          className="relative w-full h-44 rounded-xl overflow-hidden bg-black border-2 border-black cursor-pointer group/vid shadow-[2px_2px_0px_0px_#000]"
        >
          <img 
            src={`https://img.youtube.com/vi/${review.youtubeVideoId}/hqdefault.jpg`} 
            alt={review.title}
            className="w-full h-full object-cover opacity-90 group-hover/vid:opacity-100 group-hover/vid:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00] group-hover/vid:scale-110 border-2 border-black text-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-black">
            <span className="flex items-center gap-1 bg-[#FF6B00] text-black px-2 py-0.5 rounded-md text-[10px] uppercase font-black border border-black">
              <Video className="w-3 h-3" /> Vídeo Análise
            </span>
            <span className="bg-black/90 px-2 py-0.5 rounded text-[10px] font-mono border border-white/20">YouTube HD</span>
          </div>
        </div>
      )}

      {/* Title & Summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-black text-black leading-snug line-clamp-2">
          {review.title}
        </h4>
        <p className="text-xs text-zinc-700 font-semibold line-clamp-3 leading-relaxed">
          {review.summary}
        </p>
      </div>

      {/* Target Product Bar */}
      <div 
        onClick={() => onOpenProduct ? onOpenProduct(review.productSlug) : setCurrentPage('product-detail', { slug: review.productSlug })}
        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 border-2 border-black hover:bg-[#FF6B00]/30 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000]"
      >
        <span className="text-xs font-black text-black truncate">
          {review.productName}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-black shrink-0" />
      </div>

      {/* Footer Likes & Comments */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-black text-xs text-zinc-600 font-bold">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 font-black transition-colors ${
            hasLiked ? 'text-black bg-[#FF6B00] px-2 py-0.5 rounded-md border border-black' : 'hover:text-black'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-black' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <span className="text-[11px] font-bold text-zinc-500">
          {new Date(review.publishedAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
};
