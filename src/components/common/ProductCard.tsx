import React from 'react';
import { Heart, Scale, ArrowRight, TrendingDown } from 'lucide-react';
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
        className="group relative flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200"
      >
        {/* Thumbnail */}
        <div 
          onClick={() => onOpen(product.slug)}
          className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-white border-2 border-black shrink-0 cursor-pointer flex items-center justify-center p-3 shadow-[2px_2px_0px_0px_#000]"
        >
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[11px] border border-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
              <TrendingDown className="w-3 h-3" /> -{discountPercent}%
            </span>
          )}
        </div>

        {/* Informações Principais */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black text-black bg-[#FF6B00] px-2.5 py-0.5 rounded-md border-2 border-black uppercase tracking-wider">
              {product.categoryName}
            </span>
            <span className="text-xs font-black text-zinc-500 uppercase">{product.brandName}</span>
          </div>

          <h3 
            onClick={() => onOpen(product.slug)}
            className="font-black text-base text-black group-hover:text-zinc-800 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <ScoreBadge score={product.ratingOverall} size="sm" />
            <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
          </div>
        </div>

        {/* Preço e Botão */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 shrink-0 pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-black gap-2">
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-black text-zinc-500 uppercase">Melhor Preço</div>
            <div className="text-xl font-black text-black font-mono">
              {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob consulta'}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id={`fav-btn-list-${product.id}`}
              onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
              aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`p-2.5 rounded-xl border-2 border-black transition-all min-h-[42px] min-w-[42px] flex items-center justify-center shadow-[2px_2px_0px_0px_#000] ${favorited ? 'bg-rose-400 text-black' : 'bg-white text-black hover:bg-zinc-100'}`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-black' : ''}`} />
            </button>
            <button
              id={`open-product-list-${product.id}`}
              onClick={() => onOpen(product.slug)}
              className="flex-1 sm:flex-none bento-btn-lime text-xs px-3.5 py-2"
            >
              <span>Ver produto</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout - Bento Editorial
  return (
    <div 
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Botões Rápidos de Ação no Topo */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          id={`btn-compare-${product.id}`}
          onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
          title={isCompared ? 'No comparador' : 'Adicionar ao comparador'}
          aria-label={isCompared ? 'No comparador' : 'Adicionar ao comparador'}
          className={`p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
            isCompared 
              ? 'bg-[#FF6B00] text-black font-black' 
              : 'bg-white hover:bg-[#FF6B00] text-black'
          }`}
        >
          <Scale className="w-4 h-4" />
        </button>
        <button
          id={`btn-fav-${product.id}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          title={favorited ? 'Remover dos favoritos' : 'Favoritar'}
          aria-label={favorited ? 'Remover dos favoritos' : 'Favoritar'}
          className={`p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
            favorited 
              ? 'bg-rose-400 text-black' 
              : 'bg-white hover:bg-rose-100 text-black'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Imagem do Produto */}
      <div 
        onClick={() => onOpen(product.slug)}
        className="relative w-full h-48 bg-white cursor-pointer flex items-center justify-center p-4 border-b-2 border-black"
      >
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[11px] border border-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
            <TrendingDown className="w-3 h-3" /> -{discountPercent}%
          </span>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-black uppercase tracking-wider bg-[#FF6B00] px-2 py-0.5 rounded-md border-2 border-black">
              {product.categoryName}
            </span>
            <span className="text-xs font-black text-zinc-500 uppercase">
              {product.brandName}
            </span>
          </div>

          <h3 
            onClick={() => onOpen(product.slug)}
            className="font-black text-sm text-black group-hover:text-zinc-800 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Nota e Veredito */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <ScoreBadge score={product.ratingOverall} size="sm" />
          <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
        </div>

        {/* Preço e Botão de Ação */}
        <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-black text-zinc-500 uppercase">A partir de</div>
            <div className="text-lg font-black text-black font-mono">
              {product.currentBestPrice > 0 
                ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Sob consulta'
              }
            </div>
          </div>

          <button
            id={`btn-open-card-${product.id}`}
            onClick={() => onOpen(product.slug)}
            className="bento-btn-lime text-xs px-3.5 py-2"
          >
            <span>Ver</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
