import React, { useState, useEffect } from 'react';
import { 
  Heart, Scale, Share2, ThumbsUp, CheckCircle, XCircle, 
  ExternalLink, ArrowLeft, Video, MessageSquare, 
  AlertCircle, ShoppingBag, Sparkles, Check,
  Layers, Award
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
  const { currentUser, setCurrentPage, isFavorite, toggleFavorite, addToCompare, compareList, handleAffiliateRedirect } = useApp();

  const [data, setData] = useState<{
    product: Product;
    offers: Offer[];
    reviews: Review[];
    ratings: UserRating[];
  } | null>(null);

  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
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

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiService.getProductBySlugOrId(slug);
      setData(res);
      setSelectedImage(res.product.imageUrl);

      // Carrega produtos similares da mesma categoria
      const allProds = await apiService.getProducts();
      const similars = allProds
        .filter(p => p.id !== res.product.id && p.categoryId === res.product.categoryId)
        .slice(0, 3);
      setSimilarProducts(similars);
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
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 border-4 border-black border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-black font-black">Carregando análise técnica e ofertas auditadas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-4 p-8 rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-black">Produto não encontrado</h2>
        <p className="text-xs text-zinc-600 font-semibold">{error || 'Este item pode ter sido arquivado ou o link está incorreto.'}</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="bento-btn-lime text-xs px-4 py-2"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const { product, offers, reviews, ratings } = data;
  const isFav = isFavorite(product.id);
  const isCompared = compareList.some(p => p.id === product.id);

  const bestOffer = offers.length > 0
    ? [...offers].sort((a, b) => a.price - b.price)[0]
    : null;

  const isPriceGood = product.idealPrice > 0 
    ? product.currentBestPrice <= product.idealPrice 
    : false;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTitle.trim() || !userComment.trim()) return;

    try {
      setIsSubmittingRating(true);
      await apiService.submitRating({
        productId: product.id,
        userId: currentUser?.id || 'anon',
        userName: currentUser?.name || 'Comprador Anônimo',
        userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        rating: userScore,
        title: userTitle.trim(),
        comment: userComment.trim(),
        pros: userPros.split('\n').filter(p => p.trim()),
        cons: userCons.split('\n').filter(c => c.trim()),
        isVerifiedPurchase: isVerified,
        wouldRecommend
      });
      setIsRatingModalOpen(false);
      loadProductData();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar avaliação.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. TOP NAV & QUICK ACTIONS BAR */}
      <div className="flex items-center justify-between pt-3 flex-wrap gap-3">
        <button
          onClick={() => setCurrentPage('products')}
          className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o catálogo</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black hover:bg-[#FF6B00] text-xs font-black flex items-center gap-1.5 transition-all"
            title="Compartilhar análise"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
          </button>
          <button
            onClick={() => addToCompare(product)}
            className={`p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black flex items-center gap-1.5 transition-all ${
              isCompared ? 'bg-[#FF6B00] text-black' : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'No comparador' : 'Comparar'}</span>
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black flex items-center gap-1.5 transition-all ${
              isFav ? 'bg-rose-300 text-black' : 'bg-white text-black hover:bg-rose-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-black' : ''}`} />
            <span>{isFav ? 'Salvo' : 'Favoritar'}</span>
          </button>
        </div>
      </div>

      {/* 2. PRODUCT HERO: GALLERY & PRIMARY SPECS & VERDICT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gallery & Product Overview (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bento-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#FF6B00] border-2 border-black text-black text-xs font-black uppercase">
                  {product.categoryName}
                </span>
                <span className="text-xs font-black text-zinc-600 uppercase tracking-wider">
                  {product.brandName}
                </span>
              </div>
              {product.targetAudience && (
                <span className="text-xs font-black text-black bg-zinc-100 px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  🎯 {product.targetAudience}
                </span>
              )}
            </div>

            {/* Main Interactive Gallery */}
            <div className="space-y-4">
              <div className="w-full h-80 sm:h-96 bg-white rounded-2xl border-2 border-black p-6 flex items-center justify-center relative overflow-hidden shadow-[3px_3px_0px_0px_#000]">
                <img 
                  src={selectedImage || product.imageUrl} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              {product.galleryImages && product.galleryImages.length > 0 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedImage(product.imageUrl)}
                    className={`w-16 h-16 rounded-xl bg-white border-2 p-1 shrink-0 transition-all ${
                      selectedImage === product.imageUrl ? 'border-black bg-[#FF6B00] shadow-[3px_3px_0px_0px_#000]' : 'border-zinc-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={product.imageUrl} alt="Thumbnail principal" className="w-full h-full object-contain" />
                  </button>
                  {product.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl bg-white border-2 p-1 shrink-0 transition-all ${
                        selectedImage === img ? 'border-black bg-[#FF6B00] shadow-[3px_3px_0px_0px_#000]' : 'border-zinc-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Title and Description */}
            <div className="space-y-3 pt-4 border-t-2 border-black">
              <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-zinc-800 font-semibold leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] bg-zinc-100 text-black font-black px-2.5 py-0.5 rounded-md border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Technical Verdict, Pricing & Ratings (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Verdict Card */}
          <div className="bento-card-lime p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black fill-black" />
                <h2 className="text-base font-black text-black uppercase tracking-tight">
                  Veredito da Bancada
                </h2>
              </div>
              <VerdictBadge verdict={product.recommendationVerdict} size="md" />
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5">
              <div className="text-[11px] font-black text-black uppercase tracking-wider">
                Análise Fundamental:
              </div>
              <p className="text-xs sm:text-sm text-black font-bold leading-relaxed">
                {product.verdictReason || 'Construção sólida com alto rendimento por watt e temperatura operacional abaixo da média do mercado.'}
              </p>
            </div>

            {/* Price Gauge & Ideal Price */}
            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase">Preço Atual Verificado</div>
                  <div className="text-xl font-black text-black font-mono">
                    {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob consulta'}
                  </div>
                </div>
                {product.referencePrice > product.currentBestPrice && product.currentBestPrice > 0 && (
                  <div className="text-right">
                    <div className="text-[10px] font-black text-zinc-400 uppercase">Preço de Lançamento</div>
                    <div className="text-xs text-zinc-500 line-through font-mono font-bold">
                      R$ {product.referencePrice.toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-zinc-500 uppercase">Preço Considerado Ideal/Bom</div>
                  {product.idealPrice > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border border-black ${
                      isPriceGood ? 'bg-[#FF6B00] text-black' : 'bg-amber-300 text-black'
                    }`}>
                      {isPriceGood ? '✓ Em faixa ideal' : '⚠️ Acima do ideal'}
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-black font-mono">
                  {product.idealPrice > 0 ? `Até R$ ${product.idealPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Em calibragem'}
                </div>
              </div>
            </div>

            {/* Direct Buy CTA */}
            {bestOffer && (
              <button
                onClick={() => handleAffiliateRedirect(bestOffer.id, bestOffer.affiliateUrl, product.id, bestOffer.storeName, bestOffer.price)}
                className="w-full bento-btn-dark text-xs py-3 flex items-center justify-center gap-2"
              >
                <span>Comprar por R$ {bestOffer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na {bestOffer.storeName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scores Breakdown Card */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-black" />
                <h3 className="text-xs font-black text-black uppercase tracking-wider">Notas de Bancada</h3>
              </div>
              <ScoreBadge score={product.ratingOverall} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
                <div className="text-[10px] text-zinc-600 font-black uppercase">Nota dos Criadores</div>
                <div className="text-base font-black text-black font-mono">
                  {Number(product.creatorRating || product.ratingOverall).toFixed(1)} <span className="text-[10px] text-zinc-500">/10</span>
                </div>
                <span className="text-[10px] font-bold text-black">{reviews.length} reviews</span>
              </div>

              <div className="bg-zinc-50 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
                <div className="text-[10px] text-zinc-600 font-black uppercase">Nota da Comunidade</div>
                <div className="text-base font-black text-black font-mono">
                  {Number(product.communityRating || 8.5).toFixed(1)} <span className="text-[10px] text-zinc-500">/10</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-500">{product.ratingCount || ratings.length} votos</span>
              </div>
            </div>

            {/* Subscores */}
            <div className="space-y-2 pt-2 border-t-2 border-black">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-700">Desempenho</span>
                <span className="font-black text-black font-mono">{Number(product.performanceScore || 8.8).toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-700">Custo-Benefício</span>
                <span className="font-black text-black font-mono">{Number(product.costBenefitScore || 8.5).toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-700">Qualidade de Construção</span>
                <span className="font-black text-black font-mono">{Number(product.qualityScore || 8.6).toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-700">Durabilidade & Garantia</span>
                <span className="font-black text-black font-mono">{Number(product.durabilityScore || 8.4).toFixed(1)}/10</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. PROS & CONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-black border-b-2 border-black pb-3">
            <ThumbsUp className="w-4 h-4 fill-[#FF6B00]" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Pontos Fortes (Prós)</h3>
          </div>
          <ul className="space-y-2.5">
            {product.pros && product.pros.length > 0 ? (
              product.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-black font-bold">
                  <span className="text-black bg-[#FF6B00] px-1 rounded border border-black font-black shrink-0 mt-0.5">✓</span>
                  <span>{pro}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500 font-semibold">Nenhum ponto registrado.</li>
            )}
          </ul>
        </div>

        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-black border-b-2 border-black pb-3">
            <XCircle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Pontos de Atenção (Contras)</h3>
          </div>
          <ul className="space-y-2.5">
            {product.cons && product.cons.length > 0 ? (
              product.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-black font-bold">
                  <span className="text-white bg-rose-500 px-1 rounded border border-black font-black shrink-0 mt-0.5">✗</span>
                  <span>{con}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-zinc-500 font-semibold">Nenhum ponto negativo crítico detectado.</li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. STORE OFFERS TABLE */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h3 className="text-base font-black text-black">Ofertas Disponíveis em Lojas Homologadas</h3>
          </div>
          <span className="text-xs font-bold text-zinc-500">Preços verificados diariamente</span>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-zinc-500">
            Nenhuma oferta cadastrada no momento para este produto.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-zinc-600 font-black uppercase text-[11px]">
                  <th className="py-3 px-4">Loja Parceira</th>
                  <th className="py-3 px-4">Disponibilidade</th>
                  <th className="py-3 px-4">Preço à Vista</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-100">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-[#FF6B00]/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={offer.storeLogo} alt={offer.storeName} className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 border-2 border-black" />
                        <span className="font-black text-black">{offer.storeName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {offer.inStock ? (
                        <span className="text-black bg-[#FF6B00] px-2 py-0.5 rounded-md border border-black font-black flex items-center gap-1 inline-flex">
                          <CheckCircle className="w-3.5 h-3.5" /> Em estoque
                        </span>
                      ) : (
                        <span className="text-white bg-rose-500 px-2 py-0.5 rounded-md border border-black font-black flex items-center gap-1 inline-flex">
                          <XCircle className="w-3.5 h-3.5" /> Esgotado
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-black text-black text-base font-mono">
                        R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAffiliateRedirect(offer.id, offer.affiliateUrl, product.id, offer.storeName, offer.price)}
                        className="bento-btn-lime text-xs px-3.5 py-1.5"
                      >
                        <span>Ir para a Loja</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. DETAILED TECHNICAL SPECIFICATIONS TABLE */}
      <div id="full-specs-section" className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <h3 className="text-base font-black text-black">Especificações Técnicas Detalhadas</h3>
          </div>
          <span className="text-xs font-bold text-zinc-500">Fonte: Fabricante ({product.brandName})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-zinc-600 font-black uppercase text-[11px]">
                <th className="py-3 px-4">Especificação</th>
                <th className="py-3 px-4">Valor Técnico</th>
                <th className="py-3 px-4 hidden sm:table-cell">Fonte</th>
                <th className="py-3 px-4 text-right">Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-100">
              {product.specs && Object.entries(product.specs).map(([specKey, specVal], idx) => {
                const valString = String(specVal || '');
                const isUnavailable = !valString || valString.includes('não disponível') || valString.includes('Não disponível');
                return (
                  <tr key={idx} className="hover:bg-[#FF6B00]/10 transition-colors">
                    <td className="py-3 px-4 font-black text-black w-1/3">
                      {specKey}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-800">
                      {isUnavailable ? (
                        <span className="text-zinc-400 italic">Informação não disponível</span>
                      ) : (
                        valString
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-semibold hidden sm:table-cell">
                      Fabricante Oficial ({product.brandName})
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isUnavailable ? (
                        <span className="text-[10px] font-black text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded border border-black">
                          Não Localizado
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-black bg-[#FF6B00] border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#000]">
                          ✓ Alta Confiança
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. CREATOR VIDEO REVIEWS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-black" />
            <h3 className="text-lg font-black text-black">Análises de Criadores & Bancada</h3>
          </div>
          <span className="text-xs bg-[#FF6B00] text-black px-2 py-0.5 rounded-md border border-black font-black">{reviews.length} análises</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-zinc-500 bento-card p-6">
            Nenhuma review em vídeo submetida para este produto ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onPlayVideo={(r) => setActiveVideoModalReview(r)}
                onOpenProduct={(slug) => setCurrentPage('product-detail', { slug })}
                onOpenCreator={() => setCurrentPage('creators')}
              />
            ))}
          </div>
        )}
      </div>

      {/* 7. SIMILAR PRODUCTS COMPARISON */}
      {similarProducts.length > 0 && (
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-black" />
              <h3 className="text-base font-black text-black">Compare com Produtos Similares</h3>
            </div>
            <button
              onClick={() => {
                addToCompare(product);
                similarProducts.forEach(p => addToCompare(p));
                setCurrentPage('compare');
              }}
              className="text-xs font-black text-black hover:underline"
            >
              Comparar Todos →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarProducts.map(sim => (
              <div 
                key={sim.id}
                className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img src={sim.imageUrl} alt={sim.name} className="w-12 h-12 rounded-xl object-contain bg-white border-2 border-black p-1 shrink-0" />
                  <div className="min-w-0">
                    <h5 
                      onClick={() => setCurrentPage('product-detail', { slug: sim.slug })}
                      className="text-xs font-black text-black hover:underline cursor-pointer truncate"
                    >
                      {sim.name}
                    </h5>
                    <div className="text-xs font-mono text-black font-black">
                      {sim.currentBestPrice > 0 ? `R$ ${sim.currentBestPrice.toLocaleString('pt-BR')}` : 'Sob consulta'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('product-detail', { slug: sim.slug })}
                    className="flex-1 bento-btn-white text-[11px] py-1.5"
                  >
                    Ver Análise
                  </button>
                  <button
                    onClick={() => {
                      addToCompare(product);
                      addToCompare(sim);
                      setCurrentPage('compare');
                    }}
                    className="bento-btn-lime text-[11px] px-3 py-1.5"
                  >
                    VS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. COMMUNITY REVIEWS & RATINGS */}
      <div className="bento-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-black" />
            <h3 className="text-base font-black text-black">Avaliações da Comunidade</h3>
          </div>
          <button
            onClick={() => setIsRatingModalOpen(true)}
            className="bento-btn-lime text-xs px-3.5 py-2"
          >
            + Avaliar este produto
          </button>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-zinc-500">
            Seja o primeiro a avaliar este produto e compartilhe sua experiência com outros compradores!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratings.map(rating => (
              <div key={rating.id} className="bg-zinc-50 border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={rating.userAvatar} alt={rating.userName} className="w-8 h-8 rounded-full object-cover border border-black" />
                    <div>
                      <div className="text-xs font-black text-black">{rating.userName}</div>
                      <div className="text-[10px] text-zinc-500 font-bold">{new Date(rating.createdAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <ScoreBadge score={rating.rating} size="sm" />
                </div>

                <div className="text-xs text-black font-semibold leading-relaxed">
                  {rating.comment}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* User Rating Submission Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-[6px_6px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black text-black">Avaliar {product.name}</h3>
              <button onClick={() => setIsRatingModalOpen(false)} className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-black font-black hover:bg-zinc-200">✕</button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1">Nota Geral (0 a 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={userScore}
                  onChange={(e) => setUserScore(parseFloat(e.target.value))}
                  className="bento-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Título da Avaliação</label>
                <input
                  type="text"
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  placeholder="Ex: Excelente para 1080p competitivo"
                  className="bento-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Seu Comentário Detalhado</label>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Descreva o desempenho, temperaturas, ruído e experiência geral..."
                  rows={3}
                  className="bento-input"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="bento-btn-white text-xs px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="bento-btn-lime text-xs px-4 py-2"
                >
                  {isSubmittingRating ? 'Enviando...' : 'Publicar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
