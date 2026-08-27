import React from 'react';
import { X, ExternalLink, ThumbsUp, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Review } from '../../types/index.js';
import { VerdictBadge } from './VerdictBadge.js';
import { ScoreBadge } from './ScoreBadge.js';

interface YouTubeEmbedModalProps {
  review: Review | null;
  onClose: () => void;
  onOpenProduct: (productSlug: string) => void;
}

export const YouTubeEmbedModal: React.FC<YouTubeEmbedModalProps> = ({ review, onClose, onOpenProduct }) => {
  if (!review || !review.youtubeVideoId) return null;

  return (
    <div 
      id="youtube-embed-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        id="youtube-embed-modal-card"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <img 
              src={review.creatorAvatar} 
              alt={review.creatorName}
              className="w-10 h-10 rounded-full object-cover border border-cyan-500/40" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{review.creatorName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {review.creatorLevel}
                </span>
              </div>
              <div className="text-xs text-slate-400">Canal verificado ReviewHub</div>
            </div>
          </div>
          <button 
            id="btn-close-yt-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe 
            src={`https://www.youtube-nocookie.com/embed/${review.youtubeVideoId}?autoplay=1&rel=0`}
            title={review.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info & review verdict */}
        <div className="p-6 bg-slate-950/90 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-white">{review.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Produto: {review.productName}</p>
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge score={review.rating} size="lg" />
              <VerdictBadge verdict={review.recommendation} />
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
            {review.summary}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4 text-cyan-400" /> {review.likes} curtidas</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-slate-400" /> {review.commentsCount} comentários</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Review auditado</span>
            </div>
            <button
              id="btn-view-product-from-yt-modal"
              onClick={() => {
                onClose();
                onOpenProduct(review.productSlug);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
            >
              <span>Ver Produto e Melhores Ofertas</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
