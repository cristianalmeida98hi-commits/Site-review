import React from 'react';
import { X, ExternalLink, ThumbsUp, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Review } from '../../types/index.js';
import { VerdictBadge } from './VerdictBadge.js';
import { ScoreBadge } from './ScoreBadge.js';

interface YouTubeEmbedModalProps {
  review?: Review | null;
  isOpen?: boolean;
  onClose: () => void;
  onOpenProduct?: (productSlug: string) => void;
  youtubeVideoId?: string;
  reviewTitle?: string;
  creatorName?: string;
}

export const YouTubeEmbedModal: React.FC<YouTubeEmbedModalProps> = ({ 
  review, 
  isOpen, 
  onClose, 
  onOpenProduct,
  youtubeVideoId,
  reviewTitle,
  creatorName
}) => {
  const isVisible = isOpen !== undefined ? isOpen : !!review;
  const videoId = review?.youtubeVideoId || youtubeVideoId;
  const title = review?.title || reviewTitle || 'Vídeo de Análise';
  const author = review?.creatorName || creatorName || 'Criador';

  if (!isVisible || !videoId) return null;

  return (
    <div 
      id="youtube-embed-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        id="youtube-embed-modal-card"
        className="relative w-full max-w-4xl bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_#000]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#FF6B00]">
          <div className="flex items-center gap-3">
            {review?.creatorAvatar && (
              <img 
                src={review.creatorAvatar} 
                alt={author}
                className="w-10 h-10 rounded-full object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000]" 
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-black text-sm">{author}</span>
                {review?.creatorLevel && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white text-black border border-black">
                    {review.creatorLevel}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-black/80">Canal verificado ReviewHub</div>
            </div>
          </div>
          <button 
            id="btn-close-yt-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-black text-black hover:bg-zinc-200 transition-colors shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black border-b-2 border-black">
          <iframe 
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info & review verdict */}
        <div className="p-6 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-black">{title}</h3>
              {review?.productName && (
                <p className="text-xs font-bold text-zinc-600 mt-0.5">Produto: {review.productName}</p>
              )}
            </div>
            {review && (
              <div className="flex items-center gap-3">
                <ScoreBadge score={review.rating} size="lg" />
                <VerdictBadge verdict={review.recommendation} />
              </div>
            )}
          </div>

          {review?.summary && (
            <p className="text-sm text-zinc-800 font-semibold leading-relaxed bg-zinc-50 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {review.summary}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t-2 border-black flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-700">
              {review?.likes !== undefined && (
                <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4 fill-black" /> {review.likes} curtidas</span>
              )}
              {review?.commentsCount !== undefined && (
                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {review.commentsCount} comentários</span>
              )}
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 fill-[#FF6B00] text-black" /> Review auditado</span>
            </div>
            {onOpenProduct && review?.productSlug && (
              <button
                id="btn-view-product-from-yt-modal"
                onClick={() => {
                  onClose();
                  onOpenProduct(review.productSlug);
                }}
                className="bento-btn-lime text-xs px-4 py-2 flex items-center gap-2"
              >
                <span>Ver Produto e Melhores Ofertas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
