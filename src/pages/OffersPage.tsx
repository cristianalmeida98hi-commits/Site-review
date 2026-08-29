import React, { useState, useEffect } from 'react';
import { 
  Flame, ExternalLink, TrendingDown, 
  Copy, Check
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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2">
            <Flame className="w-7 h-7 text-black fill-black" />
            <span>Radar de Ofertas & Melhores Preços</span>
          </h1>
          <p className="text-xs text-zinc-600 font-bold mt-1">
            Monitoramento de descontos reais, cupons ativos e menor preço histórico nas maiores lojas de informática do Brasil.
          </p>
        </div>

        {/* Store Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStore('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedStore === '' ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-zinc-700 border-2 border-black hover:bg-zinc-100'
            }`}
          >
            Todas as Lojas
          </button>
          {stores.map(store => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedStore === store ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-zinc-700 border-2 border-black hover:bg-zinc-100'
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
          <div className="w-10 h-10 border-4 border-black border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-700 font-bold">Verificando cupons e estoques em tempo real...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => {
            const product = products.find(p => p.id === offer.productId);
            return (
              <div
                key={offer.id}
                id={`offer-card-${offer.id}`}
                className="bento-card p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Store Header & Discount Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img src={offer.storeLogo} alt={offer.storeName} className="w-8 h-8 rounded-lg object-contain bg-white p-1 shrink-0 border border-black" />
                    <span className="font-black text-xs text-black">{offer.storeName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#FF6B00] text-black border border-black font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                    <TrendingDown className="w-3.5 h-3.5" /> -{offer.discountPercentage}% OFF
                  </span>
                </div>

                {/* Product Thumbnail and Title */}
                {product && (
                  <div 
                    onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                    className="cursor-pointer space-y-2"
                  >
                    <div className="w-full h-40 rounded-xl bg-white border-2 border-black p-3 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                      <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black text-black bg-[#FF6B00] px-2 py-0.5 rounded border border-black uppercase">{product.categoryName}</span>
                    <h3 className="font-black text-sm text-black line-clamp-2 leading-snug hover:underline">{product.name}</h3>
                  </div>
                )}

                {/* Coupon Box if available */}
                {offer.couponCode && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-[11px] text-zinc-800 font-bold">Cupom: <strong className="text-black font-black">{offer.couponCode}</strong></span>
                    <button
                      onClick={() => handleCopyCoupon(offer.couponCode!)}
                      className="p-1 rounded-md hover:bg-[#FF6B00] text-black transition-colors"
                      title="Copiar cupom"
                    >
                      {copiedCoupon === offer.couponCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Pricing & Outbound Link */}
                <div className="pt-3 border-t-2 border-black space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase">Preço com desconto</div>
                      <div className="text-xl font-black text-black font-mono">
                        R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    {offer.originalPrice > offer.price && (
                      <div className="text-xs text-zinc-500 line-through font-mono font-bold">
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
                    className="w-full bento-btn-lime py-2.5 px-4 text-xs font-black flex items-center justify-center gap-2"
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
