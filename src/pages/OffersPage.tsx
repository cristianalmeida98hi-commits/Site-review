import React, { useState, useEffect } from 'react';
import { 
  Flame, Tag, ExternalLink, Sparkles, Filter, TrendingDown, 
  Copy, Check, ShieldCheck, ShoppingBag 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Offer, Product } from '../types/index.js';

export const OffersPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOffersData = async () => {
      try {
        setIsLoading(true);
        const [offList, prodList] = await Promise.all([
          apiService.getOffers(),
          apiService.getProducts()
        ]);
        setOffers(offList);
        setProducts(prodList);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadOffersData();
  }, []);

  const stores = Array.from(new Set(offers.map(o => o.storeName)));

  const filteredOffers = selectedStore 
    ? offers.filter(o => o.storeName === selectedStore)
    : offers;

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-7 h-7 text-rose-500" />
            <span>Radar de Ofertas & Melhores Preços</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento de descontos reais, cupons ativos e menor preço histórico nas maiores lojas de informática do Brasil.
          </p>
        </div>

        {/* Store Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStore('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedStore === '' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            Todas as Lojas
          </button>
          {stores.map(store => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedStore === store ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {store}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Offers */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verificando cupons e estoques em tempo real...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => {
            const product = products.find(p => p.id === offer.productId);
            return (
              <div
                key={offer.id}
                id={`offer-card-${offer.id}`}
                className="flex flex-col justify-between p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl space-y-4 group"
              >
                {/* Store Header & Discount Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img src={offer.storeLogo} alt={offer.storeName} className="w-8 h-8 rounded-xl object-contain bg-slate-950 p-1 shrink-0" />
                    <span className="font-bold text-xs text-slate-200">{offer.storeName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-rose-500/20">
                    <TrendingDown className="w-3.5 h-3.5" /> -{offer.discountPercentage}% OFF
                  </span>
                </div>

                {/* Product Thumbnail and Title */}
                {product && (
                  <div 
                    onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                    className="cursor-pointer group-hover:text-cyan-400 transition-colors space-y-2"
                  >
                    <div className="w-full h-40 rounded-2xl bg-slate-950 p-3 flex items-center justify-center">
                      <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400">{product.categoryName}</span>
                    <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug">{product.name}</h3>
                  </div>
                )}

                {/* Coupon Box if available */}
                {offer.couponCode && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                    <span className="text-[11px] text-cyan-300 font-medium">Cupom: <strong className="text-white font-black">{offer.couponCode}</strong></span>
                    <button
                      onClick={() => handleCopyCoupon(offer.couponCode!)}
                      className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                      title="Copiar cupom"
                    >
                      {copiedCoupon === offer.couponCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Pricing & Outbound Link */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Preço com desconto</div>
                      <div className="text-xl font-black text-emerald-400">
                        R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    {offer.originalPrice > offer.price && (
                      <div className="text-xs text-slate-400 line-through">
                        De: R$ {offer.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <span>Aproveitar na {offer.storeName}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
