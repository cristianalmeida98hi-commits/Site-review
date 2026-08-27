import React, { useState, useEffect } from 'react';
import { 
  Scale, Plus, X, Award, Zap, DollarSign, Star, CheckCircle, 
  XCircle, ArrowRight, Sparkles, ExternalLink, Search, Info 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

interface ComparePageProps {
  initialProductIds?: string[];
}

export const ComparePage: React.FC<ComparePageProps> = ({ initialProductIds }) => {
  const { compareList, removeFromCompare, addToCompare, setCurrentPage } = useApp();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const prods = await apiService.getProducts();
        setAllProducts(prods);

        // If initialProductIds was passed, load them into compare
        if (initialProductIds && initialProductIds.length > 0) {
          initialProductIds.forEach(id => {
            const match = prods.find(p => p.id === id);
            if (match && !compareList.some(c => c.id === match.id)) {
              addToCompare(match);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAll();
  }, [initialProductIds]);

  // Derived winners for smart badges
  const items = compareList;
  const highestOverall = items.length > 1 ? [...items].sort((a, b) => b.ratingOverall - a.ratingOverall)[0] : null;
  const bestCostBenefit = items.length > 1 ? [...items].sort((a, b) => b.costBenefitScore - a.costBenefitScore)[0] : null;
  const lowestPrice = items.length > 1 ? [...items].filter(p => p.currentBestPrice > 0).sort((a, b) => a.currentBestPrice - b.currentBestPrice)[0] : null;
  const bestPerformance = items.length > 1 ? [...items].sort((a, b) => b.performanceScore - a.performanceScore)[0] : null;

  // Collect all unique spec keys across compared products
  const allSpecKeys: string[] = Array.from(
    new Set(items.flatMap(p => Object.keys(p.specs || {})))
  );

  const filteredModalProducts = allProducts.filter(p => 
    !items.some(c => c.id === p.id) &&
    (p.name.toLowerCase().includes(addSearch.toLowerCase()) || 
     p.categoryName.toLowerCase().includes(addSearch.toLowerCase()) ||
     p.brandName.toLowerCase().includes(addSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-cyan-400" />
            <span>Comparador Técnico de Hardware</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare até 4 produtos simultaneamente com destaque automático para o melhor desempenho, custo-benefício e menor preço.
          </p>
        </div>

        {items.length < 4 && (
          <button
            id="btn-open-add-compare"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Produto ({items.length}/4)</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="p-12 text-center max-w-lg mx-auto space-y-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">Nenhum produto selecionado para comparação</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecione 2 ou mais placas de vídeo, processadores ou celulares para analisar o comparativo completo de especificações, notas e veredito "Vale a Pena".
          </p>
          <button
            id="btn-empty-add-compare"
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
          >
            Escolher Primeiro Produto
          </button>
        </div>
      ) : (
        /* Comparison Table Container */
        <div className="space-y-6">
          
          {/* Smart Winners Banner (When 2+ products) */}
          {items.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              {highestOverall && (
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
                  <Award className="w-6 h-6 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-cyan-400">Melhor Nota Geral</div>
                    <div className="text-xs font-black text-white truncate">{highestOverall.name}</div>
                  </div>
                </div>
              )}

              {bestCostBenefit && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-emerald-400">Melhor Custo-Benefício</div>
                    <div className="text-xs font-black text-white truncate">{bestCostBenefit.name}</div>
                  </div>
                </div>
              )}

              {bestPerformance && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-amber-400">Maior Desempenho</div>
                    <div className="text-xs font-black text-white truncate">{bestPerformance.name}</div>
                  </div>
                </div>
              )}

              {lowestPrice && (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-blue-400">Menor Preço</div>
                    <div className="text-xs font-black text-white truncate">{lowestPrice.name}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Side by Side Matrix */}
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-4 w-44 font-bold text-slate-400 text-xs uppercase tracking-wider sticky left-0 bg-slate-950 z-10">
                    Produto
                  </th>
                  {items.map(prod => (
                    <th key={prod.id} className="p-4 min-w-[240px] max-w-[280px] align-top">
                      <div className="relative space-y-2">
                        <button
                          onClick={() => removeFromCompare(prod.id)}
                          className="absolute -top-1 -right-1 p-1 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-colors"
                          title="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        <div 
                          onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                          className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center cursor-pointer group"
                        >
                          <img src={prod.imageUrl} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                        </div>

                        <div className="text-[10px] font-bold text-cyan-400">{prod.categoryName}</div>
                        <div 
                          onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                          className="font-bold text-sm text-slate-100 hover:text-cyan-400 transition-colors line-clamp-2 cursor-pointer"
                        >
                          {prod.name}
                        </div>
                        <div className="text-base font-black text-emerald-400">
                          {prod.currentBestPrice > 0 ? `R$ ${prod.currentBestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Ver Lojas'}
                        </div>
                      </div>
                    </th>
                  ))}
                  {items.length < 4 && (
                    <th className="p-4 min-w-[200px] align-middle text-center">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-cyan-400 transition-all"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-bold">+ Adicionar Concorrente</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                
                {/* Veredito Vale a Pena */}
                <tr className="bg-slate-950/40">
                  <td className="p-4 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                    Veredito "Vale a Pena"
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4">
                      <VerdictBadge verdict={prod.recommendationVerdict} size="sm" />
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {prod.verdictReason}
                      </p>
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Nota Geral */}
                <tr>
                  <td className="p-4 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                    Nota Geral ReviewHub
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4">
                      <ScoreBadge score={prod.ratingOverall} size="md" />
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Custo-Benefício */}
                <tr className="bg-slate-950/40">
                  <td className="p-4 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                    Índice Custo-Benefício
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4 font-bold text-emerald-400">
                      {prod.costBenefitScore} / 10.0
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Desempenho Bruto */}
                <tr>
                  <td className="p-4 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                    Desempenho Bruto
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4 font-bold text-cyan-400">
                      {prod.performanceScore} / 10.0
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Público Alvo */}
                <tr className="bg-slate-950/40">
                  <td className="p-4 font-bold text-slate-300 sticky left-0 bg-slate-950 z-10">
                    Indicação de Uso
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4 text-slate-300 text-[11px]">
                      {prod.targetAudience}
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Dynamic Technical Specs Matrix */}
                {allSpecKeys.map(specKey => (
                  <tr key={specKey}>
                    <td className="p-4 font-medium text-slate-400 sticky left-0 bg-slate-950 z-10">
                      {specKey}
                    </td>
                    {items.map(prod => (
                      <td key={prod.id} className="p-4 font-bold text-slate-200">
                        {prod.specs?.[specKey] || '—'}
                      </td>
                    ))}
                    {items.length < 4 && <td />}
                  </tr>
                ))}

                {/* Top Pros */}
                <tr className="bg-slate-950/40">
                  <td className="p-4 font-bold text-emerald-400 sticky left-0 bg-slate-950 z-10">
                    Principais Prós
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4 space-y-1">
                      {prod.pros.slice(0, 3).map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-300">
                          <span>✓</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* Top Cons */}
                <tr>
                  <td className="p-4 font-bold text-rose-400 sticky left-0 bg-slate-950 z-10">
                    Principais Contras
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4 space-y-1">
                      {prod.cons.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-300">
                          <span>✗</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

                {/* CTA Action Row */}
                <tr className="bg-slate-950">
                  <td className="p-4 font-bold text-slate-400 sticky left-0 bg-slate-950 z-10">
                    Ações
                  </td>
                  {items.map(prod => (
                    <td key={prod.id} className="p-4">
                      <button
                        onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                        className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        <span>Ver Análise Completa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ))}
                  {items.length < 4 && <td />}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Escolha um Produto para Comparar</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                placeholder="Filtrar por nome (ex: RTX 4060, RX 7600, Ryzen)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredModalProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum outro produto disponível para comparação.
                </div>
              ) : (
                filteredModalProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      addToCompare(p);
                      setIsAddModalOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-400 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.categoryName} • {p.brandName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ScoreBadge score={p.ratingOverall} size="sm" />
                      <span className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
                        Adicionar
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
