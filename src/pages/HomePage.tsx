import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, TrendingUp, Star, Flame, Award, Video, 
  ArrowRight, ShieldCheck, Tag, Cpu, Zap, HardDrive, Monitor, 
  Keyboard, Smartphone, CheckCircle, ExternalLink, Play
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
  const { setCurrentPage } = useApp();
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
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5" />;
      case 'Monitor': return <Monitor className="w-5 h-5" />;
      case 'Keyboard': return <Keyboard className="w-5 h-5" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  // Section items
  const bestValueProducts = [...products].sort((a, b) => b.costBenefitScore - a.costBenefitScore).slice(0, 4);
  const topRatedProducts = [...products].sort((a, b) => b.ratingOverall - a.ratingOverall).slice(0, 4);
  const mostViewedProducts = [...products].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 4);
  const recentProducts = [...products].slice(0, 4);

  const heroTrendingPills = [
    { label: 'RTX 4060', query: 'RTX 4060' },
    { label: 'RX 7600', query: 'RX 7600' },
    { label: 'Ryzen 7 5700X', query: 'Ryzen 7 5700X' },
    { label: 'SSD NVMe 1TB', query: 'SSD Kingston KC3000' },
    { label: 'Galaxy S25', query: 'Galaxy S25' },
    { label: 'iPhone 15', query: 'iPhone 15' }
  ];

  return (
    <div className="space-y-12 pb-12">
      
      {/* 1. HERO BENTO GRID SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Hero Bento Card (Large 8-col) */}
        <div className="lg:col-span-8 rounded-[28px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4FF59] border-2 border-black shadow-[2px_2px_0px_#000] text-black text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>O Guia Definitivo de Hardware & Tech</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-black leading-[1.1] uppercase">
              Antes de comprar, veja o que <span className="bg-[#D4FF59] px-2 py-0.5 rounded-lg border-2 border-black inline-block -rotate-1 shadow-[2px_2px_0px_#000]">realmente vale a pena</span>.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 max-w-xl leading-relaxed font-medium">
              Pesquise placas de vídeo, processadores, celulares, SSDs e periféricos. Analisamos benchmarks, vereditos de criadores certificados e as menores ofertas auditadas.
            </p>

            {/* Bento Big Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl">
              <div className="relative flex items-center p-1.5 rounded-full bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_#000] focus-within:bg-white focus-within:shadow-[4px_4px_0px_#000] transition-all">
                <Search className="w-5 h-5 text-zinc-700 ml-3.5 shrink-0" />
                <input
                  id="hero-search-input"
                  type="text"
                  value={homeSearch}
                  onChange={e => setHomeSearch(e.target.value)}
                  placeholder="Pesquise RTX 4060, Ryzen 7, SSD NVMe, Galaxy S25..."
                  className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-semibold text-black placeholder-zinc-500 focus:outline-none"
                />
                <button
                  id="btn-hero-search"
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#D4FF59] hover:bg-[#c5f53d] text-black border-2 border-black font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5"
                >
                  Analisar
                </button>
              </div>
            </form>

            {/* Quick Trending Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-zinc-500 font-black uppercase text-[11px] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-black" /> Tendências:
              </span>
              {heroTrendingPills.map(item => (
                <button
                  key={item.label}
                  onClick={() => setCurrentPage('products', { search: item.query })}
                  className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-[#D4FF59] border-2 border-black text-black transition-all text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side Hero Bento Cards (4-col) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          
          {/* Bento Stat Card 1 - Dark */}
          <div className="rounded-[28px] bg-black border-2 border-black shadow-[4px_4px_0px_#000] p-6 text-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4FF59] text-black border border-black">
                Transparência
              </span>
              <ShieldCheck className="w-6 h-6 text-[#D4FF59]" />
            </div>
            <div>
              <div className="text-3xl font-black stat-number text-[#D4FF59]">100%</div>
              <div className="text-sm font-black uppercase tracking-tight text-white mt-1">Análises Isentas</div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Vereditos calculados por testes de bancada e métricas técnicas sem viés de patrocínio.
              </p>
            </div>
          </div>

          {/* Bento Quick Compare Card 2 - Lime Accent */}
          <div 
            onClick={() => setCurrentPage('compare')}
            className="rounded-[28px] bg-[#D4FF59] border-2 border-black shadow-[4px_4px_0px_#000] p-6 text-black flex flex-col justify-between cursor-pointer hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                Ferramenta
              </span>
              <Award className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-xl font-black uppercase tracking-tight text-black">
                Comparador Lado a Lado
              </div>
              <p className="text-xs text-black/80 font-semibold mt-1 leading-relaxed">
                Coloque placas de vídeo e processadores em duelo direto de especificações.
              </p>
              <div className="mt-4 flex items-center gap-1 font-black text-xs uppercase text-black group-hover:underline">
                <span>Abrir Comparador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES BENTO GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-black" />
              <span>Explorar por Categoria</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase">Navegação segmentada por categoria técnica</p>
          </div>
          <button 
            onClick={() => setCurrentPage('products')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Ver Todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => setCurrentPage('products', { category: cat.id })}
              className="flex flex-col items-center text-center p-4 rounded-[20px] bg-white hover:bg-[#D4FF59] border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 group-hover:bg-white border-2 border-black flex items-center justify-center text-black mb-2.5 shadow-[1.5px_1.5px_0px_#000]">
                {getCategoryIcon(cat.iconName)}
              </div>
              <span className="font-black text-xs text-black uppercase tracking-tight line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-black uppercase mt-0.5 font-mono">
                {cat.productCount} produtos
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. 🔥 DEALS & OFFERS RADAR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-current" />
              <span>Radar de Ofertas Verificadas</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase">Preços menores auditados nas maiores lojas confiáveis</p>
          </div>
          <button 
            onClick={() => setCurrentPage('offers')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Ver Todas as Ofertas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {offers.slice(0, 4).map(offer => {
            const product = products.find(p => p.id === offer.productId);
            return (
              <div 
                key={offer.id}
                id={`offer-card-${offer.id}`}
                className="flex flex-col justify-between p-4 rounded-[24px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 text-black border border-black">
                      {offer.storeName}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500 text-white border border-black shadow-[1.5px_1.5px_0px_#000]">
                      -{offer.discountPercentage}% OFF
                    </span>
                  </div>

                  {product && (
                    <div 
                      onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                      className="cursor-pointer group-hover:text-zinc-700 transition-colors mb-3"
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-32 object-contain bg-zinc-50 p-2 rounded-2xl border-2 border-black/10 mb-2" 
                      />
                      <h4 className="font-black text-xs text-black line-clamp-2 leading-snug">{product.name}</h4>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-black/10">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-[9px] font-bold uppercase text-zinc-500">Preço atual</div>
                      <div className="text-lg font-black text-black stat-number">
                        R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-bold line-through">
                      R$ {offer.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <a
                    href={offer.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      try {
                        await apiService.trackAffiliateClick(offer.id);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#D4FF59] hover:bg-[#c5f53d] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all"
                  >
                    <span>Ir para {offer.storeName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. 🏆 VALE A PENA & MELHOR CUSTO-BENEFÍCIO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-black" />
              <span>Campeões de Custo-Benefício</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase">Melhor relação de FPS e desempenho por real investido</p>
          </div>
          <button 
            onClick={() => setCurrentPage('products', { sort: 'cost_benefit' })}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Ver Ranking Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestValueProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpen={(slug) => setCurrentPage('product-detail', { slug })}
            />
          ))}
        </div>
      </section>

      {/* 5. 🎥 REVIEWS EM DESTAQUE (YOUTUBE & CRIADORES) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Video className="w-5 h-5 text-black" />
              <span>Reviews em Vídeo & Análises de Criadores</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase">Testes práticos gravados pelos maiores canais técnicos</p>
          </div>
          <button 
            onClick={() => setCurrentPage('reviews')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Ver Todos os Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.slice(0, 4).map(rev => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onOpenVideo={(r) => setActiveVideoModalReview(r)}
              onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
            />
          ))}
        </div>
      </section>

      {/* 6. ⭐ MAIS BEM AVALIADOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-black fill-[#D4FF59]" />
              <span>Produtos Mais Bem Avaliados</span>
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase">Notas superiores a 8.5 aprovadas por especialistas</p>
          </div>
          <button 
            onClick={() => setCurrentPage('products', { sort: 'best_rating' })}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
          >
            <span>Explorar Mais</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topRatedProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpen={(slug) => setCurrentPage('product-detail', { slug })}
            />
          ))}
        </div>
      </section>

      {/* 7. COMPARADOR BENTO BANNER */}
      <section className="p-6 sm:p-8 rounded-[28px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4FF59] text-black border border-black">
              Comparativo Técnico
            </span>
            <h3 className="text-xl font-black uppercase text-black mt-2">Duelos Lado a Lado Populares</h3>
            <p className="text-xs text-zinc-600 font-medium">Descubra as diferenças técnicas entre modelos concorrentes antes da compra</p>
          </div>
          <button
            onClick={() => setCurrentPage('compare')}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 text-[#D4FF59] font-black uppercase text-xs rounded-full border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all shrink-0"
          >
            <span>Abrir Comparador de Hardware</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => setCurrentPage('compare', { productIds: ['prod_rtx4060', 'prod_rx7600'] })}
            className="p-5 rounded-[22px] bg-zinc-50 hover:bg-[#D4FF59] border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Duelo 1080p Clássico</div>
            <div className="font-black text-sm text-black">
              NVIDIA RTX 4060 vs AMD RX 7600
            </div>
            <p className="text-xs text-zinc-600 group-hover:text-black line-clamp-2 font-medium">
              DLSS 3 e 115W de consumo contra o menor preço por frame bruto da Radeon.
            </p>
          </div>

          <div 
            onClick={() => setCurrentPage('compare', { productIds: ['prod_ryzen5700x', 'prod_ryzen5600'] })}
            className="p-5 rounded-[22px] bg-zinc-50 hover:bg-[#D4FF59] border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Upgrade AM4</div>
            <div className="font-black text-sm text-black">
              Ryzen 7 5700X (8 Cores) vs Ryzen 5 5600 (6 Cores)
            </div>
            <p className="text-xs text-zinc-600 group-hover:text-black line-clamp-2 font-medium">
              Vale a pena pagar R$ 370 a mais pelos 2 núcleos adicionais para jogos e edição?
            </p>
          </div>

          <div 
            onClick={() => setCurrentPage('compare', { productIds: ['prod_galaxys25', 'prod_iphone15'] })}
            className="p-5 rounded-[22px] bg-zinc-50 hover:bg-[#D4FF59] border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] cursor-pointer transition-all space-y-2 group"
          >
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Flagships Compactos</div>
            <div className="font-black text-sm text-black">
              Samsung Galaxy S25 vs Apple iPhone 15
            </div>
            <p className="text-xs text-zinc-600 group-hover:text-black line-clamp-2 font-medium">
              Snapdragon 8 Elite e 120Hz contra o ecossistema iOS e Dynamic Island.
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Video Modal */}
      <YouTubeEmbedModal
        review={activeVideoModalReview}
        onClose={() => setActiveVideoModalReview(null)}
        onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
      />

    </div>
  );
};
