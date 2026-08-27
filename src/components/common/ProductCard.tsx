import React from 'react';
import { Heart, Scale, ArrowRight, TrendingDown, Eye } from 'lucide-react';
import type { Product } from '../../types/index.js';
import { ScoreBadge } from './ScoreBadge.js';
import { VerdictBadge } from './VerdictBadge.js';
import { useApp } from '../../context/AppContext.js';

interface ProductCardProps {
  product: Product;
  onOpen: (slug: string) => void;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpen,
  layout = 'grid'
}) => {
  const { isFavorite, toggleFavorite, addToCompare, compareList } = useApp();
  const favorited = isFavorite(product.id);
  const isCompared = compareList.some(p => p.id === product.id);

  const discountPercent = product.referencePrice > product.currentBestPrice && product.currentBestPrice > 0
    ? Math.round(((product.referencePrice - product.currentBestPrice) / product.referencePrice) * 100)
    : 0;

  if (layout === 'list') {
    return (
      <div 
        id={`product-card-${product.slug}`}
        className="group relative flex flex-col md:flex-row items-center gap-5 p-5 rounded-[24px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Thumbnail */}
        <div 
          onClick={() => onOpen(product.slug)}
          className="relative w-full md:w-48 h-36 rounded-2xl overflow-hidden bg-zinc-50 border-2 border-black/10 shrink-0 cursor-pointer flex items-center justify-center p-2"
        >
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center gap-1 border border-black shadow-[1.5px_1.5px_0px_#000]">
              <TrendingDown className="w-3 h-3" /> -{discountPercent}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase text-black bg-[#D4FF59] px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000]">
              {product.categoryName}
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase">{product.brandName}</span>
            {product.isSponsored && (
              <span className="text-[10px] font-black uppercase text-black bg-amber-300 px-2 py-0.5 rounded-full border border-black">
                {product.sponsoredTag || 'Patrocinado'}
              </span>
            )}
          </div>

          <h3 
            onClick={() => onOpen(product.slug)}
            className="font-black text-base text-black group-hover:text-zinc-700 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <ScoreBadge score={product.ratingOverall} size="sm" />
            <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
            <span className="text-[11px] font-bold text-zinc-500 hidden sm:inline-flex items-center gap-1">
              <Eye className="w-3 h-3" /> {product.viewsCount.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-48 shrink-0 pt-3 md:pt-0 border-t-2 md:border-t-0 border-black/10 gap-2">
          <div className="text-left md:text-right">
            <div className="text-[10px] font-bold uppercase text-zinc-500">A partir de</div>
            <div className="text-lg font-black text-black stat-number">
              {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Ver lojas'}
            </div>
            {product.referencePrice > product.currentBestPrice && (
              <div className="text-[10px] text-zinc-400 line-through font-bold">
                Ref: R$ {product.referencePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id={`btn-card-fav-${product.id}`}
              onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
              title="Favoritar"
              className={`p-2 rounded-full border-2 border-black transition-colors ${
                favorited 
                  ? 'bg-rose-100 text-rose-600 shadow-[2px_2px_0px_#000]' 
                  : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <button
              id={`btn-card-comp-${product.id}`}
              onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
              title="Comparar com outro produto"
              className={`p-2 rounded-full border-2 border-black transition-colors ${
                isCompared 
                  ? 'bg-[#D4FF59] text-black shadow-[2px_2px_0px_#000]' 
                  : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
            <button
              id={`btn-card-open-${product.id}`}
              onClick={() => onOpen(product.slug)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#D4FF59] hover:bg-[#c5f53d] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] transition-all"
            >
              <span>Ver Análise</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout - Bento Grid Card
  return (
    <div 
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col justify-between rounded-[24px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 p-4 transition-all duration-200"
    >
      {/* Top Floating Actions & Tags */}
      <div className="flex items-center justify-between gap-2 mb-2 z-10">
        <span className="text-[10px] font-black uppercase text-black bg-[#D4FF59] px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000]">
          {product.categoryName}
        </span>
        <div className="flex items-center gap-1">
          <button
            id={`btn-grid-fav-${product.id}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            title="Favoritar"
            className={`p-1.5 rounded-full border-2 border-black transition-colors ${
              favorited 
                ? 'bg-rose-100 text-rose-600 shadow-[1.5px_1.5px_0px_#000]' 
                : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:bg-zinc-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
          </button>
          <button
            id={`btn-grid-comp-${product.id}`}
            onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
            title="Comparar"
            className={`p-1.5 rounded-full border-2 border-black transition-colors ${
              isCompared 
                ? 'bg-[#D4FF59] text-black shadow-[1.5px_1.5px_0px_#000]' 
                : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:bg-zinc-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div 
        onClick={() => onOpen(product.slug)}
        className="relative w-full h-44 rounded-2xl overflow-hidden bg-zinc-50 border-2 border-black/10 flex items-center justify-center p-3 mb-3 cursor-pointer"
      >
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center gap-1 border border-black shadow-[1.5px_1.5px_0px_#000]">
            <TrendingDown className="w-3 h-3" /> -{discountPercent}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{product.brandName}</div>
        <h3 
          onClick={() => onOpen(product.slug)}
          className="font-black text-sm text-black group-hover:text-zinc-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-1.5 pt-1">
          <ScoreBadge score={product.ratingOverall} size="sm" />
          <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
        </div>
      </div>

      {/* Price & Action */}
      <div className="pt-3 border-t-2 border-black/10 mt-auto">
        <div className="flex items-end justify-between gap-2 mb-2.5">
          <div>
            <div className="text-[9px] font-bold uppercase text-zinc-500">A partir de</div>
            <div className="text-base font-black text-black stat-number">
              {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob Consulta'}
            </div>
          </div>
          {product.referencePrice > product.currentBestPrice && (
            <div className="text-[10px] text-zinc-400 line-through font-bold">
              R$ {product.referencePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>

        <button
          id={`btn-grid-open-${product.id}`}
          onClick={() => onOpen(product.slug)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-black hover:bg-zinc-800 text-[#D4FF59] font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all"
        >
          <span>Ver Análise e Ofertas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
