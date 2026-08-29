import React, { useState, useEffect } from 'react';
import { 
  Scale, Plus, X, Sparkles, LayoutGrid, Table as TableIcon, AlertTriangle, Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import { specificationService } from '../services/specificationService.js';
import type { Product, ComparisonEvaluation, ComparisonWeights } from '../types/index.js';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showWeightConfig, setShowWeightConfig] = useState(false);

  const [weights, setWeights] = useState<ComparisonWeights>({
    performanceWeight: 40,
    priceWeight: 25,
    efficiencyWeight: 15,
    ratingWeight: 10,
    featuresWeight: 10
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const prods = await apiService.getProducts();
        setAllProducts(prods);

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

  const items = compareList;
  const primaryCategory = items[0]?.categoryId || 'cat_gpu';
  
  // Verifica se todos pertencem à mesma categoria
  const isSameCategory = items.every(p => p.categoryId === items[0]?.categoryId);

  // Avaliação automatizada pelo SpecificationService
  const evaluation: ComparisonEvaluation = specificationService.evaluateComparison(
    items, 
    primaryCategory, 
    weights
  );

  // Schema de especificações da categoria
  const activeSchema = specificationService.getSchemaForCategory(items[0]?.categoryName || 'Placas de Vídeo');
  
  // Lista unificada de especificações técnicas
  const allSpecKeys: string[] = activeSchema 
    ? activeSchema.fields.map(f => f.label)
    : Array.from(new Set(items.flatMap(p => Object.keys(p.specs || {}))));

  const filteredModalProducts = allProducts.filter(p => 
    !items.some(c => c.id === p.id) &&
    (p.name.toLowerCase().includes(addSearch.toLowerCase()) || 
     p.categoryName.toLowerCase().includes(addSearch.toLowerCase()) ||
     p.brandName.toLowerCase().includes(addSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header com controles de visualização */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-black" />
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Comparador Inteligente por Categoria
            </h1>
          </div>
          <p className="text-xs text-zinc-600 font-bold mt-1">
            Análise ponderada de hardware com cálculo de vencedor e nível de confiança baseado em dados reais.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Alternador de Visualização Tabela vs Cards */}
          <div className="bg-white border-2 border-black p-1 rounded-xl shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              aria-label="Visualização em tabela"
              className={`p-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-[#FF6B00] text-black border border-black' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              aria-label="Visualização em cards"
              className={`p-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-[#FF6B00] text-black border border-black' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={() => setShowWeightConfig(!showWeightConfig)}
            className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black hover:bg-zinc-100 text-xs font-black flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-black" />
            <span>Pesos ({weights.performanceWeight}% Desempenho)</span>
          </button>

          {items.length < 4 && (
            <button
              id="btn-open-add-compare"
              onClick={() => setIsAddModalOpen(true)}
              className="bento-btn-lime text-xs px-3.5 py-2.5"
            >
              <Plus className="w-4 h-4 mr-1 inline" />
              <span>Adicionar ({items.length}/4)</span>
            </button>
          )}
        </div>
      </div>

      {/* Painel Configurador de Pesos */}
      {showWeightConfig && (
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-sm font-black text-black flex items-center gap-2">
              <Sliders className="w-4 h-4 text-black" />
              <span>Configurar Pesos da Pontuação Relativa</span>
            </h3>
            <button 
              onClick={() => setWeights({ performanceWeight: 40, priceWeight: 25, efficiencyWeight: 15, ratingWeight: 10, featuresWeight: 10 })}
              className="text-xs text-black font-black underline hover:bg-[#FF6B00] px-1 rounded"
            >
              Restaurar Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">Performance ({weights.performanceWeight}%)</label>
              <input 
                type="range" 
                min="10" 
                max="60" 
                value={weights.performanceWeight} 
                onChange={(e) => setWeights({ ...weights, performanceWeight: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Preço / Valor ({weights.priceWeight}%)</label>
              <input 
                type="range" 
                min="10" 
                max="50" 
                value={weights.priceWeight} 
                onChange={(e) => setWeights({ ...weights, priceWeight: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Eficiência ({weights.efficiencyWeight}%)</label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                value={weights.efficiencyWeight} 
                onChange={(e) => setWeights({ ...weights, efficiencyWeight: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Avaliação ({weights.ratingWeight}%)</label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                value={weights.ratingWeight} 
                onChange={(e) => setWeights({ ...weights, ratingWeight: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Recursos ({weights.featuresWeight}%)</label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                value={weights.featuresWeight} 
                onChange={(e) => setWeights({ ...weights, featuresWeight: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerta se houver categorias misturadas */}
      {!isSameCategory && items.length > 1 && (
        <div className="bg-amber-100 border-2 border-black rounded-2xl p-4 flex items-center gap-3 text-black text-xs font-bold shadow-[3px_3px_0px_0px_#000]">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            <strong>Aviso de Compatibilidade:</strong> Você está comparando produtos de categorias diferentes ({Array.from(new Set(items.map(p => p.categoryName))).join(', ')}). As especificações técnicas diretas podem não coincidir perfeitamente.
          </span>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="p-12 text-center max-w-lg mx-auto space-y-4 bento-card">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] border-2 border-black text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-black">Nenhum produto no comparador</h3>
          <p className="text-xs text-zinc-600 font-bold leading-relaxed">
            Selecione 2 ou mais itens no catálogo para analisar lado a lado especificações, notas e veredito inteligente.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bento-btn-lime text-xs px-4 py-2"
          >
            + Selecionar Produtos
          </button>
        </div>
      ) : (
        <>
          {/* Card Inteligente de Análise do Vencedor e Nível de Confiança */}
          {items.length >= 2 && evaluation.hasSufficientData && (
            <div className="bento-card-lime p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-black fill-black" />
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">
                    {evaluation.verdictTitle}
                  </h3>
                </div>

                {/* Indicador de Confiança */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-800 font-bold">Confiabilidade dos dados:</span>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 ${
                    evaluation.confidenceLevel === 'high' 
                      ? 'bg-white text-black'
                      : evaluation.confidenceLevel === 'medium'
                      ? 'bg-amber-300 text-black'
                      : 'bg-rose-300 text-black'
                  }`}>
                    {evaluation.confidenceLevel === 'high' ? '🟢 Alta Confiança' : evaluation.confidenceLevel === 'medium' ? '🟡 Média Confiança' : '🔴 Baixa Confiança'}
                    <span>({evaluation.confidencePercentage}%)</span>
                  </span>
                </div>
              </div>

              <p className="text-sm text-black font-bold leading-relaxed bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                {evaluation.explanation}
              </p>

              {/* Pontuações Ponderadas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {items.map(p => {
                  const score = evaluation.scores[p.id]?.totalScore || 0;
                  const isWinner = evaluation.winnerId === p.id;
                  return (
                    <div 
                      key={p.id}
                      className={`p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] ${
                        isWinner 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate max-w-[120px]">{p.name}</span>
                        {isWinner && <span className="text-[10px] font-black bg-[#FF6B00] text-black border border-black px-1.5 py-0.5 rounded">👑 Melhor</span>}
                      </div>
                      <div className="text-lg font-black font-mono mt-1">
                        {score} <span className={`text-[10px] font-bold ${isWinner ? 'text-zinc-300' : 'text-zinc-600'}`}>pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO EM TABELA */}
          {viewMode === 'table' ? (
            <div className="bento-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  {/* Top Row: Imagens e Títulos dos Produtos */}
                  <thead>
                    <tr className="border-b-2 border-black bg-zinc-50">
                      <th className="p-4 w-48 text-zinc-600 font-black uppercase text-[11px] align-top">
                        Especificações Técnicas
                      </th>
                      {items.map(product => (
                        <th key={product.id} className="p-4 min-w-[220px] max-w-[260px] align-top border-l-2 border-black">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-black bg-[#FF6B00] px-2 py-0.5 rounded border border-black uppercase">{product.brandName}</span>
                              <button
                                onClick={() => removeFromCompare(product.id)}
                                className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-black hover:bg-rose-200"
                                title="Remover do comparador"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="w-full h-28 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] p-2 flex items-center justify-center">
                              <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                            </div>

                            <h4 
                              onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                              className="text-sm font-black text-black hover:underline cursor-pointer line-clamp-2"
                            >
                              {product.name}
                            </h4>

                            <div className="flex items-center justify-between">
                              <ScoreBadge score={product.ratingOverall} size="sm" />
                              <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
                            </div>

                            <div className="text-base font-black text-black font-mono pt-1 border-t-2 border-black">
                              {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR')}` : 'Sob consulta'}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y-2 divide-zinc-200">
                    {allSpecKeys.map(specKey => (
                      <tr key={specKey} className="hover:bg-[#FF6B00]/10 transition-colors">
                        <td className="p-4 font-black text-black bg-zinc-50">
                          {specKey}
                        </td>
                        {items.map(product => {
                          const val = product.specs?.[specKey] || 'Não disponível';
                          const isMissing = val === 'Não disponível' || val.includes('não disponível');
                          return (
                            <td key={product.id} className="p-4 border-l-2 border-black font-semibold text-black">
                              {isMissing ? (
                                <span className="text-zinc-400 italic">Não disponível</span>
                              ) : (
                                <span>{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Veredito e Ação */}
                    <tr className="bg-zinc-50 border-t-2 border-black">
                      <td className="p-4 font-black text-black">Ação</td>
                      {items.map(product => (
                        <td key={product.id} className="p-4 border-l-2 border-black">
                          <button
                            onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                            className="w-full bento-btn-lime text-xs py-2"
                          >
                            Ver Análise Completa
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* VISUALIZAÇÃO EM CARDS LADO A LADO (IDEAL MOBILE) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(product => (
                <div 
                  key={product.id}
                  className="bento-card p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black bg-[#FF6B00] px-2 py-0.5 rounded border border-black uppercase">{product.categoryName}</span>
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-black hover:bg-rose-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-full h-36 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] p-3 flex items-center justify-center">
                      <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <h4 className="text-base font-black text-black">{product.name}</h4>

                    <div className="flex items-center justify-between">
                      <ScoreBadge score={product.ratingOverall} size="sm" />
                      <VerdictBadge verdict={product.recommendationVerdict} size="sm" />
                    </div>

                    <div className="text-lg font-black text-black font-mono">
                      {product.currentBestPrice > 0 ? `R$ ${product.currentBestPrice.toLocaleString('pt-BR')}` : 'Sob consulta'}
                    </div>

                    {/* Especificações no Card */}
                    <div className="pt-2 border-t-2 border-black space-y-2">
                      {allSpecKeys.map(key => (
                        <div key={key} className="flex justify-between text-xs py-1 border-b border-zinc-200">
                          <span className="text-zinc-600 font-bold">{key}:</span>
                          <span className="text-black font-black">{product.specs?.[key] || 'Não disponível'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentPage('product-detail', { slug: product.slug })}
                    className="w-full bento-btn-lime text-xs py-2 mt-4"
                  >
                    Ver Produto Completo
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Adicionar Produto ao Comparador */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-[6px_6px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black text-black">Adicionar Produto ao Comparador</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-bold hover:bg-zinc-200">✕</button>
            </div>

            <input
              type="text"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Buscar por nome, marca ou categoria..."
              className="bento-input"
            />

            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredModalProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    addToCompare(p);
                    setIsAddModalOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border-2 border-black hover:bg-[#FF6B00] cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain rounded-xl bg-white border border-black p-1" />
                    <div>
                      <div className="text-xs font-black text-black">{p.name}</div>
                      <div className="text-[11px] text-zinc-600 font-bold">{p.categoryName} • {p.brandName}</div>
                    </div>
                  </div>
                  <ScoreBadge score={p.ratingOverall} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
