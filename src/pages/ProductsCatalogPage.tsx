import React, { useState, useEffect } from 'react';
import { 
  Filter, Search, SlidersHorizontal, X, 
  RotateCcw, AlertCircle
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
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Catálogo de Produtos & Análises
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {products.length} itens auditados
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-bold mt-1">
            Fichas técnicas oficiais, notas transparentes e rastreamento de menor preço do mercado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão de Filtro Mobile */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black text-black"
          >
            <Filter className="w-4 h-4 text-black" />
            <span>Filtros {hasActiveFilters && '(Ativos)'}</span>
          </button>

          {/* Ordenação */}
          <div className="flex items-center gap-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-zinc-700 font-black">Ordenar:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-black text-black focus:outline-none cursor-pointer"
            >
              <option value="cost_benefit">Melhor Custo-Benefício</option>
              <option value="rating_desc">Maior Nota Técnica</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="newest">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal: Sidebar Filtros + Listagem */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar de Filtros (Desktop) */}
        <div className="hidden md:block md:col-span-3 space-y-5 bento-card p-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-black" />
              <span>Filtros de Busca</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-black text-black underline hover:bg-[#FF6B00] px-1 rounded flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>

          {/* Busca por texto */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5">Buscar por Nome</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex: RTX 4070, Ryzen..."
                className="bento-input pl-8"
              />
              <Search className="w-3.5 h-3.5 text-black absolute left-3 top-3" />
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5">Categoria</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  !selectedCategory ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Todas as Categorias
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedCategory === c.id ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Marcas */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5">Marca</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bento-input"
            >
              <option value="">Todas as Marcas</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Veredito */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5">Veredito do ReviewHub</label>
            <div className="space-y-1.5">
              {[
                { label: 'Todos os vereditos', val: '' },
                { label: '🟢 RECOMENDADO', val: 'RECOMENDADO' },
                { label: '🟡 DEPENDE', val: 'DEPENDE' },
                { label: '🔴 NÃO RECOMENDADO', val: 'NAO_RECOMENDADO' }
              ].map(item => (
                <label key={item.val} className="flex items-center gap-2 text-xs text-black font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    checked={selectedVerdict === item.val}
                    onChange={() => setSelectedVerdict(item.val)}
                    className="accent-black"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Listagem de Produtos */}
        <div className="md:col-span-9 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-black border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-700 font-bold">Filtrando produtos com especificações verificadas...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bento-card p-12 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-black mx-auto" />
              <h3 className="text-lg font-black text-black">Nenhum produto encontrado com estes filtros</h3>
              <p className="text-xs text-zinc-600 font-semibold max-w-sm mx-auto">
                Tente ajustar os critérios de categoria, marca ou termo de busca para visualizar os itens cadastrados.
              </p>
              <button
                onClick={handleResetFilters}
                className="bento-btn-lime text-xs px-4 py-2"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={(slug) => setCurrentPage('product-detail', { slug })}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Drawer Mobile de Filtros */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-l-2 border-black w-full max-w-xs h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <h3 className="text-base font-black text-black">Filtros de Busca</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo dos filtros mobile */}
            <div>
              <label className="block text-xs font-black text-black mb-1.5">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex: RTX 4070..."
                className="bento-input"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1.5">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bento-input"
              >
                <option value="">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1.5">Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bento-input"
              >
                <option value="">Todas</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t-2 border-black flex gap-2">
              <button
                onClick={handleResetFilters}
                className="w-1/2 bento-btn-white text-xs"
              >
                Limpar
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 bento-btn-lime text-xs"
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
