import React, { useState, useEffect } from 'react';
import { 
  Heart, Scale, Share2, Star, ThumbsUp, CheckCircle, XCircle, 
  ExternalLink, ArrowLeft, ShieldCheck, Video, MessageSquare, 
  Flag, AlertCircle, ShoppingBag, TrendingDown, Sparkles, Check, Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product, Offer, Review, UserRating } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { YouTubeEmbedModal } from '../components/common/YouTubeEmbedModal.js';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { currentUser, setCurrentPage, isFavorite, toggleFavorite, addToCompare, compareList } = useApp();

  const [data, setData] = useState<{
    product: Product;
    offers: Offer[];
    reviews: Review[];
    ratings: UserRating[];
  } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeVideoModalReview, setActiveVideoModalReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Rating submission modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userScore, setUserScore] = useState<number>(9.0);
  const [userTitle, setUserTitle] = useState('');
  const [userComment, setUserComment] = useState('');
  const [userPros, setUserPros] = useState('');
  const [userCons, setUserCons] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Report modal state
  const [reportModalTarget, setReportModalTarget] = useState<{ type: string; id: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>('Fake review');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiService.getProductBySlugOrId(slug);
      setData(res);
      setSelectedImage(res.product.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar as informações deste produto.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Carregando análise técnica e ofertas em tempo real...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-4 p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Produto não encontrado</h2>
        <p className="text-xs text-slate-400">{error || 'Este item pode ter sido arquivado ou o link está incorreto.'}</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const { product, offers, reviews, ratings } = data;
  const isFav = isFavorite(product.id);
  const isCompared = compareList.some(p => p.id === product.id);

  const handleShare = (network: string) => {
    const url = window.location.href;
    const text = `Confira a análise técnica e veredito de compra do ${product.name} no ReviewHub:`;
    if (network === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    } else if (network === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (network === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Você precisa estar conectado para enviar uma avaliação.');
      return;
    }
    try {
      setIsSubmittingRating(true);
      await apiService.submitRating({
        productId: product.id,
        rating: Number(userScore),
        title: userTitle,
        comment: userComment,
        pros: userPros.split('\n').filter(p => p.trim().length > 0),
        cons: userCons.split('\n').filter(c => c.trim().length > 0),
        wouldRecommend,
        isVerifiedPurchase: isVerified
      });
      setIsRatingModalOpen(false);
      await loadProductData();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar avaliação.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalTarget) return;
    try {
      await apiService.createReport({
        targetType: reportModalTarget.type,
        targetId: reportModalTarget.id,
        reason: reportReason,
        details: reportDetails
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalTarget(null);
        setReportDetails('');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Top Breadcrumbs & Back */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => setCurrentPage('products')}
          className="flex items-center gap-1.5 hover:text-cyan-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Catálogo</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Compartilhar análise:</span>
          <button 
            onClick={() => handleShare('whatsapp')} 
            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
            title="Compartilhar no WhatsApp"
          >
            WhatsApp
          </button>
          <button 
            onClick={() => handleShare('twitter')} 
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" 
            title="Compartilhar no X (Twitter)"
          >
            X
          </button>
          <button 
            onClick={() => handleShare('copy')} 
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Gallery & Images (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full aspect-square rounded-3xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-center overflow-hidden shadow-2xl">
            <img 
              src={selectedImage} 
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
            {product.referencePrice > product.currentBestPrice && product.currentBestPrice > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                -{Math.round(((product.referencePrice - product.currentBestPrice) / product.referencePrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl bg-slate-900 border p-1.5 shrink-0 transition-all ${
                    selectedImage === img ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Veredito & Key Stats (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                {product.categoryName}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{product.brandName}</span>
              {product.isSponsored && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {product.sponsoredTag || 'Destaque'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 🟢 "VALE A PENA?" DECISION CARD (Crucial Requirement) */}
          <div 
            id="vale-a-pena-decision-card"
            className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border-2 border-cyan-500/40 shadow-2xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Veredito de Compra ReviewHub
                </div>
                <div className="text-lg font-black text-white mt-0.5">Vale a pena comprar?</div>
              </div>
              <VerdictBadge verdict={product.recommendationVerdict} size="lg" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              "{product.verdictReason}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Público-alvo ideal</div>
                <div className="font-bold text-slate-200 mt-0.5 text-[11px] leading-tight">{product.targetAudience}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Preço teto recomendado</div>
                <div className="font-black text-cyan-400 mt-0.5 text-sm">
                  {product.idealPrice > 0 ? `Até R$ ${product.idealPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Indefinido'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Melhor oferta agora</div>
                <div className="font-black text-emerald-400 mt-0.5 text-sm">
                  {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Consulte'}
                </div>
              </div>
            </div>
          </div>

          {/* Score & Breakdown Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-4">
              <ScoreBadge score={product.ratingOverall} size="hero" />
              <div className="space-y-1 text-xs">
                <div className="text-slate-300">
                  <span className="font-bold text-cyan-400">{product.creatorRating}/10</span> Nota Criadores
                </div>
                <div className="text-slate-300">
                  <span className="font-bold text-emerald-400">{product.communityRating}/10</span> Nota Usuários ({product.ratingCount} votos)
                </div>
              </div>
            </div>

            {/* Micro Scores Progress Bars */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-medium mb-1">
                  <span>Desempenho</span>
                  <span className="font-bold text-cyan-400">{product.performanceScore}/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${product.performanceScore * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-medium mb-1">
                  <span>Custo-Benefício</span>
                  <span className="font-bold text-emerald-400">{product.costBenefitScore}/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${product.costBenefitScore * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-medium mb-1">
                  <span>Qualidade & Durabilidade</span>
                  <span className="font-bold text-amber-400">{product.durabilityScore}/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${product.durabilityScore * 10}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions: Favorite & Compare */}
          <div className="flex items-center gap-3">
            <button
              id="btn-detail-fav"
              onClick={() => toggleFavorite(product.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-bold text-xs transition-colors ${
                isFav 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/40 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Salvo nos Favoritos' : 'Adicionar à Lista de Desejos'}</span>
            </button>

            <button
              id="btn-detail-compare"
              onClick={() => addToCompare(product)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-bold text-xs transition-colors ${
                isCompared 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/40 hover:text-cyan-400'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isCompared ? 'Adicionado ao Comparador' : 'Comparar com Outro'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. PROS & CONS (PRÓS E CONTRAS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pros */}
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
          <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Pontos Positivos (Prós)</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {product.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
          <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Pontos Negativos (Contras)</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {product.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{con}</span>
              </li>
            ))}
          </ul>
        </div>

      </section>

      {/* 3. LOJAS & OFERTAS (LINKS DE AFILIADOS RASTREADOS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Onde Comprar & Melhores Ofertas</span>
            </h2>
            <p className="text-xs text-slate-400">Preços verificados nas lojas parceiras com estoque ativo</p>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Links seguros e auditados
          </span>
        </div>

        <div className="space-y-3">
          {offers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              Nenhuma oferta cadastrada no momento para este produto.
            </div>
          ) : (
            offers.map(offer => (
              <div 
                key={offer.id}
                id={`product-offer-row-${offer.id}`}
                className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all gap-4 shadow-md"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img src={offer.storeLogo} alt={offer.storeName} className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{offer.storeName}</span>
                      {offer.couponCode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Cupom: {offer.couponCode}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400">● Em estoque</span>
                      <span>• Atualizado {offer.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">
                      R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {offer.originalPrice > offer.price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        R$ {offer.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (-{offer.discountPercentage}%)
                      </div>
                    )}
                  </div>

                  <a
                    href={offer.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      try {
                        await apiService.trackAffiliateClick(offer.id);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <span>Ir para Loja</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. ESPECIFICAÇÕES TÉCNICAS */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-black text-white tracking-tight">Especificações Técnicas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(product.specs || {}).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 font-medium">{key}</span>
              <span className="font-bold text-slate-100 text-right">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. REVIEWS DE CRIADORES DE CONTEÚDO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-400" />
              <span>Reviews em Vídeo & Artigos de Criadores</span>
            </h2>
            <p className="text-xs text-slate-400">Análises detalhadas com testes reais gravados em vídeo</p>
          </div>
          {currentUser && (currentUser.role === 'CREATOR' || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => setCurrentPage('creator-dashboard', { tab: 'new-review', productId: product.id })}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              + Publicar Review Deste Produto
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
            Ainda não há reviews de criadores publicados para este produto. Seja o primeiro!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <ReviewCard
                key={rev.id}
                review={rev}
                onOpenVideo={(r) => setActiveVideoModalReview(r)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. AVALIAÇÕES DOS USUÁRIOS & FORMULÁRIO */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Avaliações da Comunidade ({ratings.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Experiências reais de quem comprou e testou no dia a dia</p>
          </div>

          <button
            id="btn-open-user-rating-modal"
            onClick={() => setIsRatingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Avaliar Este Produto</span>
          </button>
        </div>

        {/* User ratings list */}
        <div className="space-y-3">
          {ratings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              Nenhuma avaliação de usuário enviada ainda. Deixe sua opinião e ajude outros compradores!
            </div>
          ) : (
            ratings.map(rating => (
              <div 
                key={rating.id}
                id={`rating-item-${rating.id}`}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={rating.userAvatar} alt={rating.userName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{rating.userName}</span>
                        {rating.isVerifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Compra Verificada
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(rating.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <ScoreBadge score={rating.rating} size="sm" />
                </div>

                {rating.title && <h4 className="font-bold text-xs text-slate-200">{rating.title}</h4>}
                <p className="text-xs text-slate-300 leading-relaxed">{rating.comment}</p>

                {/* Pros/Cons sub-bullets */}
                {(rating.pros.length > 0 || rating.cons.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    {rating.pros.length > 0 && (
                      <div className="text-emerald-400">
                        <strong>✓ Pró:</strong> {rating.pros.join(', ')}
                      </div>
                    )}
                    {rating.cons.length > 0 && (
                      <div className="text-rose-400">
                        <strong>✗ Contra:</strong> {rating.cons.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <button
                    id={`btn-helpful-rating-${rating.id}`}
                    onClick={async () => {
                      try {
                        const res = await apiService.voteRatingHelpful(rating.id);
                        rating.helpfulCount = res.helpfulCount;
                        setData({ ...data });
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Útil ({rating.helpfulCount})</span>
                  </button>

                  <button
                    onClick={() => setReportModalTarget({ type: 'rating', id: rating.id })}
                    className="flex items-center gap-1 hover:text-rose-400 transition-colors text-[11px]"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Denunciar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* User Rating Submission Modal */}
      {isRatingModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsRatingModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white">Avaliar {product.name}</h3>
            <p className="text-xs text-slate-400">Compartilhe sua experiência real para ajudar a comunidade do ReviewHub.</p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nota (0 a 10)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={userScore}
                    onChange={e => setUserScore(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <ScoreBadge score={userScore} size="lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título Resumo</label>
                <input
                  type="text"
                  value={userTitle}
                  onChange={e => setUserTitle(e.target.value)}
                  placeholder="Ex: Excelente custo-benefício para Full HD"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Comentário Detalhado</label>
                <textarea
                  value={userComment}
                  onChange={e => setUserComment(e.target.value)}
                  placeholder="Conte sobre desempenho, temperaturas, construção e durabilidade..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">Prós (1 por linha)</label>
                  <textarea
                    value={userPros}
                    onChange={e => setUserPros(e.target.value)}
                    placeholder="Baixo consumo&#10;Fria e silenciosa"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-400 mb-1">Contras (1 por linha)</label>
                  <textarea
                    value={userCons}
                    onChange={e => setUserCons(e.target.value)}
                    placeholder="Preço no lançamento&#10;Apenas 8GB"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wouldRecommend}
                    onChange={e => setWouldRecommend(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  <span>Recomendaria este produto?</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={e => setIsVerified(e.target.checked)}
                    className="accent-emerald-400"
                  />
                  <span>Compra verificada</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black"
                >
                  Publicar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setReportModalTarget(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
              <Flag className="w-4 h-4" /> Denunciar Conteúdo
            </h3>
            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
                Denúncia enviada com sucesso! Nossa equipe analisará o caso.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Motivo</label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  >
                    <option value="Fake review">Review Falso / Manipulado</option>
                    <option value="Spam">Spam ou Link Malicioso</option>
                    <option value="Conteúdo ofensivo">Conteúdo Ofensivo / Desrespeitoso</option>
                    <option value="Informação falsa">Informação Técnica Falsa</option>
                    <option value="Publicidade não identificada">Publicidade Não Identificada</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Detalhes (Opcional)</label>
                  <textarea
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    placeholder="Explique resumidamente por que este item viola as diretrizes..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalTarget(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
                  >
                    Enviar Denúncia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* YouTube Video Modal */}
      <YouTubeEmbedModal
        review={activeVideoModalReview}
        onClose={() => setActiveVideoModalReview(null)}
        onOpenProduct={(s) => setCurrentPage('product-detail', { slug: s })}
      />

    </div>
  );
};
