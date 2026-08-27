import React, { useState, useEffect } from 'react';
import { 
  Filter, Search, SlidersHorizontal, Grid, List, X, 
  RotateCcw, Sparkles, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Product, Category, Brand } from '../types/index.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface ProductsCatalogPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
}

export const ProductsCatalogPage: React.FC<ProductsCatalogPageProps> = ({
  initialCategory,
  initialSearch,
  initialSort
}) => {
  const { setCurrentPage } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('');
  const [sort, setSort] = useState(initialSort || 'cost_benefit');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          apiService.getCategories(),
          apiService.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (e) {
        console.error(e);
      }
    };
    loadFiltersData();
  }, []);

  const fetchFilteredProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getProducts({
        search: search || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        verdict: selectedVerdict || undefined,
        sort: sort || undefined,
        minRating: minRating || undefined,
        maxPrice: maxPrice || undefined
      });
      setProducts(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [search, selectedCategory, selectedBrand, selectedVerdict, sort, minRating, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedVerdict('');
    setSort('cost_benefit');
    setMinRating(undefined);
    setMaxPrice(undefined);
  };

  const hasActiveFilters = Boolean(search || selectedCategory || selectedBrand || selectedVerdict || minRating || maxPrice);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Catálogo de Produtos & Análises</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {products.length} itens
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filtre por categoria, marca, faixa de preço, veredito "Vale a Pena" e nota técnica.
          </p>
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Ordenar:</span>
            <select
              id="select-sort-products"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            >
              <option value="cost_benefit" className="bg-slate-900">Melhor Custo-Benefício</option>
              <option value="best_rating" className="bg-slate-900">Mais Bem Avaliados</option>
              <option value="price_asc" className="bg-slate-900">Menor Preço</option>
              <option value="price_desc" className="bg-slate-900">Maior Preço</option>
              <option value="reviews" className="bg-slate-900">Mais Reviews</option>
              <option value="popular" className="bg-slate-900">Mais Populares</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              id="btn-layout-grid"
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${layout === 'grid' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="btn-layout-list"
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition-colors ${layout === 'list' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar (3 cols) + Products Grid (9 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <aside className={`md:col-span-3 space-y-6 bg-slate-900/80 md:bg-transparent p-5 md:p-0 rounded-3xl md:rounded-none border md:border-0 border-slate-800 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          
          {/* Quick Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Buscar por Texto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ex: RTX, Ryzen, SSD..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Veredito "Vale a Pena" Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Veredito "Vale a Pena"</label>
            <div className="space-y-1.5">
              {[
                { id: '', label: 'Todos os Vereditos' },
                { id: 'RECOMENDADO', label: '🟢 Vale a Pena (Recomendado)' },
                { id: 'DEPENDE', label: '🟡 Depende do Preço' },
                { id: 'NAO_RECOMENDADO', label: '🔴 Não Recomendado' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVerdict(v.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedVerdict === v.id
                      ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Categorias</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === '' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas as Categorias
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === c.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-60">({c.productCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Marcas</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedBrand === '' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas as Marcas
              </button>
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedBrand === b.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Todos os Filtros</span>
            </button>
          )}

        </aside>

        {/* Products Results List (9 cols) */}
        <main className="md:col-span-9 space-y-4">
          
          {/* Active Filters Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Filtros ativos:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Busca: "{search}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Categoria: {categories.find(c => c.id === selectedCategory)?.name} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Marca: {brands.find(b => b.id === selectedBrand)?.name} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('')} />
                </span>
              )}
              {selectedVerdict && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Veredito: {selectedVerdict} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedVerdict('')} />
                </span>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Consultando produtos e reviews...</p>
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="py-16 text-center space-y-4 p-8 rounded-3xl bg-slate-900 border border-slate-800">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">Nenhum produto encontrado com os filtros selecionados</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente buscar por termos mais genéricos como "RTX", "Ryzen" ou limpe os filtros aplicados.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            /* Product List / Grid */
            <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {products.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  layout={layout}
                  onOpen={(slug) => setCurrentPage('product-detail', { slug })}
                />
              ))}
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
