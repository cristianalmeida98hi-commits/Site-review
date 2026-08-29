import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, TrendingUp, Flame, Award, Video, 
  ArrowRight, ShieldCheck, Tag, Cpu, Zap, HardDrive, Monitor, 
  Keyboard, Smartphone, Swords, ShoppingBag, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product, Review, Offer, Category } from '../types/index.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { YouTubeEmbedModal } from '../components/common/YouTubeEmbedModal.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

export const HomePage: React.FC = () => {
  const { setCurrentPage, handleAffiliateRedirect, addToCompare } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeVideoModalReview, setActiveVideoModalReview] = useState<Review | null>(null);
  const [homeSearch, setHomeSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [prodList, revList, offList, catList] = await Promise.all([
          apiService.getProducts(),
          apiService.getReviews({ status: 'published' }),
          apiService.getOffers(undefined, true),
          apiService.getCategories()
        ]);
        setProducts(prodList);
        setReviews(revList);
        setOffers(offList);
        setCategories(catList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      setCurrentPage('products', { search: homeSearch.trim() });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'HardDrive': return <HardDrive className="w-6 h-6" />;
      case 'Monitor': return <Monitor className="w-6 h-6" />;
      case 'Keyboard': return <Keyboard className="w-6 h-6" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const featuredProduct = products.find(p => p.ratingOverall >= 9.0) || products[0];

  const heroTrendingPills = [
    { label: 'RTX 4060', query: 'RTX 4060' },
    { label: 'RX 7600', query: 'RX 7600' },
    { label: 'Ryzen 7 5700X', query: 'Ryzen 7 5700X' },
    { label: 'SSD NVMe 1TB', query: 'SSD' },
    { label: 'Monitor 144Hz', query: 'UltraGear' }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="pt-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <Sparkles className="w-4 h-4 text-black fill-black" />
          <span>Bancada Técnica & Comparador Inteligente</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.15]">
          Antes de comprar, confira o que <span className="bg-[#FF6B00] px-2 py-0.5 rounded-lg border-2 border-black inline-block transform -rotate-1">realmente vale a pena</span>.
        </h1>

        <p className="text-sm sm:text-base text-zinc-700 font-bold max-w-2xl mx-auto leading-relaxed">
          Notas de bancada sem jabá, vereditos fundamentados, cruzamento de preços ideais e ofertas auditadas.
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleHeroSearch} className="relative max-w-2xl mx-auto pt-2">
          <div className="flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-[4px_4px_0px_0px_#000] focus-within:shadow-[6px_6px_0px_0px_#000] transition-all">
            <Search className="w-5 h-5 text-black ml-3 shrink-0" />
            <input
              id="hero-search-input"
              type="text"
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
              placeholder="Busque por placa de vídeo, processador, monitor, SSD..."
              aria-label="Buscar produtos no catálogo"
              className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-bold text-black placeholder-zinc-500 focus:outline-none"
            />
            <button
              id="hero-search-submit-btn"
              type="submit"
              className="bento-btn-lime text-xs sm:text-sm px-6 py-2.5 shrink-0"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Quick Trending Tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-black font-black flex items-center gap-1">
            <Flame className="w-4 h-4 text-black fill-[#FF6B00]" /> Mais buscados:
          </span>
          {heroTrendingPills.map(pill => (
            <button
              key={pill.label}
              onClick={() => setCurrentPage('products', { search: pill.query })}
              className="text-xs bg-white hover:bg-[#FF6B00] text-black font-bold px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. CATEGORIES ROW */}
      <section id="categories-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <span>Navegar por Categorias</span>
          </h2>
          <button
            onClick={() => setCurrentPage('products')}
            className="text-xs font-black text-black hover:bg-[#FF6B00] px-2 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setCurrentPage('products', { category: cat.id })}
              className="bento-card p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer group hover:bg-[#FF6B00]/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:scale-105 transition-transform">
                {getCategoryIcon(cat.iconName)}
              </div>
              <div>
                <h4 className="text-xs font-black text-black truncate max-w-full">
                  {cat.name}
                </h4>
                <span className="text-[10px] font-bold text-zinc-500">
                  {cat.productCount} produtos
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED HIGHLIGHT BANNER */}
      {featuredProduct && (
        <section id="featured-hero-banner" className="bento-card-lime p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Product Image */}
            <div 
              onClick={() => setCurrentPage('product-detail', { slug: featuredProduct.slug })}
              className="lg:col-span-5 aspect-[4/3] rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-6 flex items-center justify-center cursor-pointer group"
            >
              <img 
                src={featuredProduct.imageUrl} 
                alt={featuredProduct.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Product Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                  <Award className="w-4 h-4 fill-black text-black" />
                  <span>Destaque de Bancada • Escolha da Redação</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBadge score={featuredProduct.ratingOverall} size="md" />
                  <VerdictBadge verdict={featuredProduct.recommendationVerdict} size="md" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black text-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-black inline-block">
                  {featuredProduct.brandName} • {featuredProduct.categoryName}
                </span>
                <h3 
                  onClick={() => setCurrentPage('product-detail', { slug: featuredProduct.slug })}
                  className="text-2xl sm:text-3xl font-black text-black hover:text-zinc-800 transition-colors cursor-pointer leading-snug"
                >
                  {featuredProduct.name}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-black font-semibold leading-relaxed line-clamp-3">
                {featuredProduct.description || featuredProduct.verdictReason}
              </p>

              {/* Specs & Pricing Pill */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-3 border-t-2 border-black">
                <div>
                  <div className="text-[10px] font-black text-zinc-700 uppercase">Melhor preço apurado</div>
                  <div className="text-2xl font-black text-black font-mono">
                    R$ {featuredProduct.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCompare(featuredProduct);
                      setCurrentPage('compare');
                    }}
                    className="bento-btn-white text-xs px-4 py-2.5"
                  >
                    <Swords className="w-4 h-4 mr-1.5 text-black" />
                    Comparar
                  </button>
                  <button
                    onClick={() => setCurrentPage('product-detail', { slug: featuredProduct.slug })}
                    className="bento-btn-dark text-xs px-5 py-2.5"
                  >
                    <span>Ver Análise Completa</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 4. POPULAR PRODUCTS (GRID DE PRODUTOS POPULARES) */}
      <section id="popular-products-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Flame className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Produtos em Alta & Mais Analisados</h2>
              <p className="text-xs text-zinc-600 font-bold">Hardware e eletrônicos com maior relevância e volume de testes de bancada</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('products')}
            className="text-xs font-black text-black bg-white hover:bg-[#FF6B00] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all self-start sm:self-auto"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map(prod => (
            <ProductCard 
              key={prod.id} 
              product={prod} 
              onOpen={(slug) => setCurrentPage('product-detail', { slug })}
            />
          ))}
        </div>
      </section>

      {/* 5. AUDITED DEALS & OFFERS (RADAR DE OFERTAS) */}
      <section id="deals-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Radar de Ofertas Auditadas</h2>
              <p className="text-xs text-zinc-600 font-bold">Preços verificados nas principais lojas parceiras com estoque confirmado</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('offers')}
            className="text-xs font-black text-black bg-white hover:bg-[#FF6B00] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all self-start sm:self-auto"
          >
            <span>Ver todas as ofertas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.slice(0, 4).map(offer => {
            const matchedProduct = products.find(p => p.id === offer.productId);
            return (
              <div 
                key={offer.id}
                className="bento-card p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-black flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-black" />
                      {offer.storeName}
                    </span>
                    {offer.discountPercentage > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white border border-black font-black text-[10px] shadow-[1px_1px_0px_0px_#000]">
                        -{offer.discountPercentage}%
                      </span>
                    )}
                  </div>

                  <h4 
                    onClick={() => matchedProduct && setCurrentPage('product-detail', { slug: matchedProduct.slug })}
                    className="text-sm font-black text-black hover:text-zinc-700 cursor-pointer line-clamp-2"
                  >
                    {matchedProduct ? matchedProduct.name : 'Produto em promoção'}
                  </h4>

                  {offer.couponCode && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF6B00] border-2 border-black text-xs text-black font-mono font-black shadow-[2px_2px_0px_0px_#000]">
                      Cupom: {offer.couponCode}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase">Preço à vista</div>
                    <div className="text-base font-black text-black font-mono">
                      R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAffiliateRedirect(offer.id, offer.affiliateUrl, offer.productId, offer.storeName, offer.price)}
                    className="bento-btn-lime text-xs px-3.5 py-1.5"
                  >
                    <span>Ir à Loja</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. REVIEWS DE CRIADORES & ANÁLISES EM VÍDEO */}
      <section id="reviews-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Análises de Criadores Homologados</h2>
              <p className="text-xs text-zinc-600 font-bold">Reviews técnicas, testes práticos e opiniões fundamentadas da bancada</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('reviews')}
            className="text-xs font-black text-black bg-white hover:bg-[#FF6B00] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all self-start sm:self-auto"
          >
            <span>Ver todas as reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onPlayVideo={(r) => setActiveVideoModalReview(r)}
              onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
              onOpenCreator={() => setCurrentPage('creators')}
            />
          ))}
        </div>
      </section>

      {/* 7. METHODOLOGY & TRUST BANNER */}
      <section id="trust-banner" className="bento-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black mx-auto md:mx-0 shadow-[2px_2px_0px_0px_#000]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-black">Veredito 100% Independente</h4>
            <p className="text-xs text-zinc-700 font-semibold leading-relaxed">
              Notas técnicas geradas a partir de métricas reais de bancada, sem influência ou patrocínio de marcas.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black mx-auto md:mx-0 shadow-[2px_2px_0px_0px_#000]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-black">Cálculo de Preço Ideal</h4>
            <p className="text-xs text-zinc-700 font-semibold leading-relaxed">
              Cruzamos performance, histórico de mercado e concorrência para indicar a faixa de compra recomendada.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black mx-auto md:mx-0 shadow-[2px_2px_0px_0px_#000]">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-black">Criadores Certificados</h4>
            <p className="text-xs text-zinc-700 font-semibold leading-relaxed">
              Comunidade de testadores de hardware com reputação auditada e transparência total nas recomendações.
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Video Modal */}
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
