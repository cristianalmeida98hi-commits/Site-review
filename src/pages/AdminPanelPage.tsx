import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Video, ShoppingBag, DollarSign, CheckCircle, 
  XCircle, AlertTriangle, Settings, Plus, Trash2, Edit3, 
  RefreshCw, Check, Clock, Sparkles, ExternalLink, Database,
  Layers, Tag, FileText, BarChart3, Search, Sliders, CheckSquare, Edit,
  HelpCircle, Bot, Zap, Globe, Cpu, Server, CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import { specificationService } from '../services/specificationService.js';
import type { Review, Product, Report, PlatformSettings, AuditLog, Category, Brand, SpecificationItem, PriceSource, PriceRobotLog } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

type MainTabGroup = 'catalog' | 'content' | 'commercial' | 'robot' | 'users' | 'system';

interface AdminSpecRow {
  label: string;
  value: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  accepted: boolean;
}

export const AdminPanelPage: React.FC = () => {
  const { currentUser, setCurrentPage } = useApp();

  const [activeGroup, setActiveGroup] = useState<MainTabGroup>('catalog');
  const [subTab, setSubTab] = useState<string>('products');

  const [stats, setStats] = useState<any>(null);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Price Robot & Supabase State
  const [robotSources, setRobotSources] = useState<PriceSource[]>([]);
  const [robotLogs, setRobotLogs] = useState<PriceRobotLog[]>([]);
  const [robotStats, setRobotStats] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isScanningRobot, setIsScanningRobot] = useState(false);
  const [isTestingLiveConnector, setIsTestingLiveConnector] = useState(false);
  const [selectedScanProduct, setSelectedScanProduct] = useState<string>('');
  const [liveScanResult, setLiveScanResult] = useState<any>(null);

  // Modal de Rejeição de Review
  const [rejectModalReviewId, setRejectModalReviewId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Modal de Cadastro/Edição de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(1000);
  const [prodIdealPrice, setProdIdealPrice] = useState<number>(900);
  const [prodVerdict, setProdVerdict] = useState<'RECOMENDADO' | 'DEPENDE' | 'NAO_RECOMENDADO'>('RECOMENDADO');
  const [prodVerdictReason, setProdVerdictReason] = useState('');
  const [prodTarget, setProdTarget] = useState('');
  const [prodPros, setProdPros] = useState('Desempenho excelente\nBaixo consumo');
  const [prodCons, setProdCons] = useState('Preço de lançamento elevado');
  
  // Especificações automáticas do modal
  const [specsTable, setSpecsTable] = useState<Record<string, AdminSpecRow>>({});
  const [isSearchingSpecs, setIsSearchingSpecs] = useState(false);
  const [specsSearchNotes, setSpecsSearchNotes] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [st, pRevs, prods, reps, sets, logs, cats, brs, rSources, rLogs, rStats, supaStatus] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getPendingReviews(),
        apiService.getProducts(),
        apiService.getReports(),
        apiService.getPlatformSettings(),
        apiService.getAuditLogs(),
        apiService.getCategories(),
        apiService.getBrands(),
        apiService.getPriceRobotSources(),
        apiService.getPriceRobotLogs(),
        apiService.getPriceRobotStats(),
        apiService.getSupabaseStatus()
      ]);
      setStats(st);
      setPendingReviews(pRevs);
      setProducts(prods);
      setReports(reps);
      setSettings(sets);
      setAuditLogs(logs);
      setCategories(cats);
      setBrands(brs);
      setRobotSources(rSources);
      setRobotLogs(rLogs);
      setRobotStats(rStats);
      setSupabaseStatus(supaStatus);
      if (prods.length > 0 && !selectedScanProduct) setSelectedScanProduct(prods[0].id);
      if (cats.length > 0 && !prodCategory) setProdCategory(cats[0].id);
      if (brs.length > 0 && !prodBrand) setProdBrand(brs[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRobotSource = async (sourceId: string) => {
    try {
      const updated = await apiService.togglePriceRobotSource(sourceId);
      setRobotSources(prev => prev.map(s => s.id === sourceId ? updated : s));
    } catch (err: any) {
      alert('Erro ao alterar status da fonte: ' + err.message);
    }
  };

  const handleRunBatchRobotScan = async () => {
    try {
      setIsScanningRobot(true);
      const result = await apiService.triggerPriceRobotScan();
      alert(`Varredura do Robô concluída com sucesso!\n${result.scannedProductsCount} produtos analisados.\n${result.totalOffersFound} ofertas capturadas e normalizadas.`);
      await loadAdminData();
    } catch (err: any) {
      alert('Erro durante varredura do robô: ' + err.message);
    } finally {
      setIsScanningRobot(false);
    }
  };

  const handleRunSingleProductLiveScan = async () => {
    if (!selectedScanProduct) {
      alert('Selecione um produto para escanear.');
      return;
    }
    try {
      setIsTestingLiveConnector(true);
      setLiveScanResult(null);
      const result = await apiService.triggerPriceRobotScanProduct(selectedScanProduct);
      setLiveScanResult(result);
      await loadAdminData();
    } catch (err: any) {
      alert('Erro ao testar conector de preço ao vivo: ' + err.message);
    } finally {
      setIsTestingLiveConnector(false);
    }
  };

  const handleTestDatabase = async () => {
    try {
      setIsTestingDb(true);
      const status = await apiService.getSupabaseStatus();
      setDbTestResult(status);
      setSupabaseStatus(status);
    } catch (e: any) {
      setDbTestResult({ connected: false, message: e.message });
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

  // Função para buscar especificações automaticamente via SpecificationService
  const handleAutoFetchSpecs = async () => {
    if (!prodName.trim()) {
      alert('Preencha o nome do produto antes de buscar as especificações.');
      return;
    }

    try {
      setIsSearchingSpecs(true);
      setSpecsSearchNotes(null);
      const categoryObj = categories.find(c => c.id === prodCategory);
      const brandObj = brands.find(b => b.id === prodBrand);

      const result = await specificationService.searchSpecifications(
        prodName.trim(),
        categoryObj?.name || 'GPU',
        brandObj?.name
      );

      const newSpecs: Record<string, { label: string; value: string; source: string; confidence: 'high' | 'medium' | 'low'; accepted: boolean }> = {};

      for (const [key, item] of Object.entries(result.items)) {
        newSpecs[key] = {
          label: item.label,
          value: item.value,
          source: item.source,
          confidence: item.confidence,
          accepted: item.confidence === 'high' && item.value !== 'Informação não disponível'
        };
      }

      setSpecsTable(newSpecs);
      setSpecsSearchNotes(
        result.success 
          ? `✓ Ficha técnica localizada com sucesso (${result.confidenceScore}% de dados oficiais preenchidos via ${result.sourceProvider}).`
          : `⚠️ Nenhuma ficha técnica exata foi encontrada. Preencha manualmente ou edite os campos abaixo.`
      );
    } catch (err: any) {
      alert('Erro ao consultar especificações automáticas: ' + err.message);
    } finally {
      setIsSearchingSpecs(false);
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdDesc('');
    setProdImage('');
    setProdPrice(1000);
    setProdIdealPrice(900);
    setProdVerdict('RECOMENDADO');
    setProdVerdictReason('');
    setProdTarget('');
    setProdPros('Desempenho sólido\nConstrução durável');
    setProdCons('Preço elevado');
    setSpecsTable({});
    setSpecsSearchNotes(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Converte specs aprovadas em dicionário final
      const finalSpecs: Record<string, string> = {};
      const detailedSpecs: Record<string, SpecificationItem> = {};

      (Object.entries(specsTable) as [string, AdminSpecRow][]).forEach(([k, v]) => {
        if (v.accepted && v.value) {
          finalSpecs[v.label] = v.value;
          detailedSpecs[k] = {
            key: k,
            label: v.label,
            value: v.value,
            source: v.source,
            confidence: v.confidence,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
      });

      const categoryObj = categories.find(c => c.id === prodCategory);
      const brandObj = brands.find(b => b.id === prodBrand);

      const productPayload = {
        name: prodName,
        categoryId: prodCategory,
        categoryName: categoryObj?.name || 'Hardware',
        brandId: prodBrand,
        brandName: brandObj?.name || 'Marca',
        imageUrl: prodImage || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
        description: prodDesc,
        currentBestPrice: prodPrice,
        referencePrice: prodPrice * 1.15,
        idealPrice: prodIdealPrice || prodPrice * 0.9,
        recommendationVerdict: prodVerdict,
        verdictReason: prodVerdictReason || 'Excelente relação custo-benefício comprovada.',
        targetAudience: prodTarget || 'Gamers e profissionais',
        pros: prodPros.split('\n').filter(p => p.trim()),
        cons: prodCons.split('\n').filter(c => c.trim()),
        specs: Object.keys(finalSpecs).length > 0 ? finalSpecs : { 'Garantia': '12 meses' },
        specificationsDetailed: detailedSpecs
      };

      if (editingProductId) {
        await apiService.updateProduct(editingProductId, productPayload);
      } else {
        await apiService.createProduct(productPayload);
      }

      setIsProductModalOpen(false);
      await loadAdminData();
    } catch (e: any) {
      alert('Erro ao salvar produto: ' + e.message);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await apiService.moderateReview(reviewId, 'PUBLISHED');
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReviewId) return;
    try {
      await apiService.moderateReview(rejectModalReviewId, 'REJECTED', rejectFeedback);
      setRejectModalReviewId(null);
      setRejectFeedback('');
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#283044] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Painel Administrativo</h1>
            <p className="text-xs text-zinc-400">Gestão global do catálogo, moderação de conteúdo, comercial e configurações</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="p-2 rounded-lg bg-[#141721] border border-[#283044] text-zinc-300 hover:text-white text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#141721] border border-[#283044] rounded-xl p-4">
            <div className="text-xs text-zinc-400 font-medium">Produtos Ativos</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{stats.totalProducts || products.length}</div>
          </div>
          <div className="bg-[#141721] border border-[#283044] rounded-xl p-4">
            <div className="text-xs text-zinc-400 font-medium">Reviews Publicadas</div>
            <div className="text-2xl font-bold text-orange-400 font-mono mt-1">{stats.totalReviews || 0}</div>
          </div>
          <div className="bg-[#141721] border border-[#283044] rounded-xl p-4">
            <div className="text-xs text-zinc-400 font-medium">Reviews Pendentes</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{pendingReviews.length}</div>
          </div>
          <div className="bg-[#141721] border border-[#283044] rounded-xl p-4">
            <div className="text-xs text-zinc-400 font-medium">Volume Transacionado</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">R$ {(stats.totalSales || 0).toLocaleString('pt-BR')}</div>
          </div>
        </div>
      )}

      {/* Abas Principais Agrupadas */}
      <div className="flex border-b border-[#283044] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveGroup('catalog'); setSubTab('products'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeGroup === 'catalog'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>📦 CATÁLOGO</span>
        </button>

        <button
          onClick={() => { setActiveGroup('content'); setSubTab('moderation'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 relative ${
            activeGroup === 'content'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📝 CONTEÚDO</span>
          {pendingReviews.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          )}
        </button>

        <button
          onClick={() => { setActiveGroup('commercial'); setSubTab('offers'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeGroup === 'commercial'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>💼 COMERCIAL</span>
        </button>

        <button
          onClick={() => { setActiveGroup('robot'); setSubTab('robot_sources'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 relative ${
            activeGroup === 'robot'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-orange-400" />
          <span>🤖 ROBÔ DE PREÇOS (SUPABASE)</span>
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-mono">
            Ao Vivo
          </span>
        </button>

        <button
          onClick={() => { setActiveGroup('users'); setSubTab('creators'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeGroup === 'users'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 USUÁRIOS</span>
        </button>

        <button
          onClick={() => { setActiveGroup('system'); setSubTab('settings'); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeGroup === 'system'
              ? 'bg-[#141721] text-orange-400 border-t-2 border-[#FF6600]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>⚙️ SISTEMA</span>
        </button>
      </div>

      {/* CONTEÚDO DO GRUPO: 📦 CATÁLOGO */}
      {activeGroup === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Catálogo de Hardware & Produtos</h2>
            <button
              onClick={handleOpenNewProduct}
              className="btn-orange-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>

          <div className="bg-[#141721] border border-[#283044] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#283044] bg-[#0D0F15] text-zinc-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Veredito</th>
                  <th className="py-3 px-4">Preço Atual</th>
                  <th className="py-3 px-4">Nota</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283044]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#1A1E2B]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-contain rounded bg-[#0D0F15] p-1 border border-[#283044]" />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-zinc-400">{p.brandName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{p.categoryName}</td>
                    <td className="py-3 px-4">
                      <VerdictBadge verdict={p.recommendationVerdict} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      R$ {p.currentBestPrice > 0 ? p.currentBestPrice.toLocaleString('pt-BR') : 'Sob consulta'}
                    </td>
                    <td className="py-3 px-4">
                      <ScoreBadge score={p.ratingOverall} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setCurrentPage('product-detail', { slug: p.slug })}
                        className="text-xs text-orange-400 hover:underline mr-3"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DO GRUPO: 📝 CONTEÚDO */}
      {activeGroup === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Moderação de Reviews Pendentes ({pendingReviews.length})</h2>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="bg-[#141721] border border-[#283044] rounded-2xl p-8 text-center text-xs text-zinc-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              Nenhuma review aguardando moderação no momento. Todas foram revisadas!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(rev => (
                <div key={rev.id} className="bg-[#141721] border border-[#283044] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#283044] pb-3">
                    <div className="flex items-center gap-2.5">
                      <img src={rev.creatorAvatar} alt={rev.creatorName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{rev.creatorName}</div>
                        <div className="text-[10px] text-zinc-400">Submetido para: {rev.productName}</div>
                      </div>
                    </div>
                    <ScoreBadge score={rev.rating} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-white">{rev.title}</h3>
                  <p className="text-xs text-zinc-300">{rev.summary}</p>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRejectModalReviewId(rev.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApproveReview(rev.id)}
                      className="btn-orange-primary text-xs px-4 py-1.5"
                    >
                      Aprovar e Publicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DO GRUPO: 💼 COMERCIAL */}
      {activeGroup === 'commercial' && (
        <div className="space-y-6">
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Comissões & Transparência de Afiliados</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O ReviewHub divide comissões de vendas qualificadas entre a plataforma e o criador responsável pela recomendação.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#0D0F15] p-4 rounded-xl border border-[#283044]">
                <div className="text-xs text-zinc-400">Taxa do Criador</div>
                <div className="text-xl font-bold text-orange-400 font-mono mt-1">{settings?.creatorCommissionRate || 40}%</div>
              </div>
              <div className="bg-[#0D0F15] p-4 rounded-xl border border-[#283044]">
                <div className="text-xs text-zinc-400">Taxa da Plataforma</div>
                <div className="text-xl font-bold text-zinc-200 font-mono mt-1">{settings?.platformCommissionRate || 60}%</div>
              </div>
              <div className="bg-[#0D0F15] p-4 rounded-xl border border-[#283044]">
                <div className="text-xs text-zinc-400">Saque Mínimo</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">R$ {settings?.minWithdrawalAmount || 50},00</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DO GRUPO: 🤖 ROBÔ DE PREÇOS (SUPABASE) */}
      {activeGroup === 'robot' && (
        <div className="space-y-6">
          
          {/* Top Status & Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141721] border border-[#283044] rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Status do Robô</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {robotStats?.status === 'running' ? 'Varredura Ativa' : 'Em Monitoramento'}
              </div>
              <div className="text-[10px] text-zinc-400">Intervalo: a cada 60 min</div>
            </div>

            <div className="bg-[#141721] border border-[#283044] rounded-xl p-4 space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Fontes Homologadas</span>
              <div className="text-xl font-bold text-white font-mono">
                {robotSources.filter(s => s.status === 'active').length} / {robotSources.length}
              </div>
              <div className="text-[10px] text-zinc-400">Lojas Nacionais Ativas</div>
            </div>

            <div className="bg-[#141721] border border-[#283044] rounded-xl p-4 space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Confiança Média</span>
              <div className="text-xl font-bold text-orange-400 font-mono">
                {robotStats?.averageConfidence || 97.5}%
              </div>
              <div className="text-[10px] text-zinc-400">Normalização e Outliers</div>
            </div>

            <div className="bg-[#141721] border border-[#283044] rounded-xl p-4 space-y-1">
              <span className="text-xs text-zinc-400 font-medium">Banco Supabase</span>
              <div className={`text-xl font-bold font-mono ${supabaseStatus?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {supabaseStatus?.connected ? 'PostgreSQL Conectado' : 'Modo Seguro / Memória'}
              </div>
              <div className="text-[10px] text-zinc-400">{supabaseStatus?.supabaseUrlHost || 'Pronto para credenciais'}</div>
            </div>
          </div>

          {/* Teste do Conector Ao Vivo (Mercado Livre API / Multi-Lojas) */}
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#283044] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span>Teste do Conector Ao Vivo (Mercado Livre & Lojas Oficiais)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Executa a consulta real, pontuação de confiança (0-100), verificação de outliers e persiste a oferta e histórico no Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunBatchRobotScan}
                  disabled={isScanningRobot}
                  className="px-3.5 py-2 rounded-lg bg-[#283044] text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningRobot ? 'animate-spin' : ''}`} />
                  <span>{isScanningRobot ? 'Varrendo Catálogo...' : 'Varredura Geral'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-300 mb-1">Selecione o Produto para Varredura de Preços:</label>
                <select
                  value={selectedScanProduct}
                  onChange={(e) => setSelectedScanProduct(e.target.value)}
                  className="tech-input text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Atual: R$ {p.currentBestPrice.toLocaleString('pt-BR')} (Meta: R$ {p.idealPrice ? p.idealPrice.toLocaleString('pt-BR') : 'N/D'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:self-end">
                <button
                  onClick={handleRunSingleProductLiveScan}
                  disabled={isTestingLiveConnector || !selectedScanProduct}
                  className="btn-orange-primary text-xs px-5 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Bot className={`w-4 h-4 ${isTestingLiveConnector ? 'animate-bounce' : ''}`} />
                  <span>{isTestingLiveConnector ? 'Consultando Fontes...' : 'Executar Varredura Ao Vivo'}</span>
                </button>
              </div>
            </div>

            {/* Resultado do Teste Ao Vivo */}
            {liveScanResult && (
              <div className="bg-[#0D0F15] border border-[#283044] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#283044] pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    <span>Varredura Concluída: {liveScanResult.offers?.length || 0} Ofertas Capturadas</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    Menor Preço Normalizado: R$ {liveScanResult.bestPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {liveScanResult.offers?.slice(0, 4).map((off: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#141721] rounded-lg border border-[#283044] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-400">{off.storeName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                          Confiança: {off.confidenceScore}% ({off.matchQuality})
                        </span>
                      </div>
                      <div className="text-zinc-200 font-medium line-clamp-1">{off.rawTitle}</div>
                      <div className="flex items-center justify-between text-zinc-400 pt-1 font-mono">
                        <span className="text-emerald-400 font-bold text-sm">R$ {off.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        {off.installmentText && <span className="text-[10px]">{off.installmentText}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabela de Fontes Homologadas */}
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#283044] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-400" />
                  <span>Fontes de Preço & Conectores de Lojas</span>
                </h3>
                <p className="text-xs text-zinc-400">Ative ou pause lojas e configure intervalos de rastreio.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#283044] text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Loja / Conector</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Confiabilidade</th>
                    <th className="py-2.5 px-3">Intervalo</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283044]/60">
                  {robotSources.map(src => (
                    <tr key={src.id} className="hover:bg-[#1f2433]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={src.logoUrl} alt={src.name} className="w-6 h-6 rounded-md object-contain bg-white p-0.5" />
                          <span className="font-bold text-white">{src.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-mono text-[11px]">
                        {src.parserType === 'api_connector' ? '⚡ API Conector' : '🔍 Scraper HTML'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-mono font-bold">{src.reliabilityScore}%</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono">
                        {src.scrapeIntervalMinutes} min
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          src.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-zinc-700/50 text-zinc-400'
                        }`}>
                          {src.status === 'active' ? 'Ativo' : 'Pausado'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleRobotSource(src.id)}
                          className={`text-xs px-2.5 py-1 rounded font-bold transition-colors ${
                            src.status === 'active'
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                          }`}
                        >
                          {src.status === 'active' ? 'Pausar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs de Execução do Robô de Preços */}
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#283044] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-orange-400" />
                  <span>Logs de Execução & Auditoria do Robô</span>
                </h3>
                <p className="text-xs text-zinc-400">Histórico de varreduras, tempos de resposta e validação de ofertas.</p>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {robotLogs.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">Nenhum log registrado ainda.</div>
              ) : (
                robotLogs.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 bg-[#0D0F15] rounded-xl border border-[#283044] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className="font-bold text-white">{log.sourceName}</span>
                        {log.productName && <span className="text-zinc-400">({log.productName})</span>}
                      </div>
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')} • {log.durationMs}ms
                      </span>
                    </div>
                    <p className="text-zinc-300 text-[11px]">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* CONTEÚDO DO GRUPO: 👥 USUÁRIOS */}
      {activeGroup === 'users' && (
        <div className="space-y-6">
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Gestão de Criadores Certificados</h3>
            <p className="text-xs text-zinc-400">
              Criadores com canal verificado e histórico de publicações rigorosas possuem permissão de publicação e divisão de receita de afiliados.
            </p>
          </div>
        </div>
      )}

      {/* CONTEÚDO DO GRUPO: ⚙️ SISTEMA */}
      {activeGroup === 'system' && (
        <div className="space-y-6">
          {/* Teste de Conexão com Firestore */}
          <div className="bg-[#141721] border border-[#283044] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-400" />
                  <span>Diagnóstico de Banco de Dados & Firestore</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Teste a conexão direta e saúde dos registros na nuvem.</p>
              </div>

              <button
                onClick={handleTestDatabase}
                disabled={isTestingDb}
                className="btn-orange-primary text-xs px-4 py-2"
              >
                {isTestingDb ? 'Testando Conexão...' : 'Executar Teste de Conexão'}
              </button>
            </div>

            {dbTestResult && (
              <div className={`p-4 rounded-xl border text-xs font-mono ${
                dbTestResult.connected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="font-bold mb-1">{dbTestResult.connected ? '✓ Firestore Conectado com Sucesso' : '✗ Erro de Conexão'}</div>
                <div>Status: {dbTestResult.message}</div>
                {dbTestResult.projectId && (
                  <div className="mt-1 text-zinc-400">Projeto: {dbTestResult.projectId} ({dbTestResult.productCount || 0} produtos sincronizados)</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO DE PRODUTO COM BUSCA AUTOMÁTICA DE ESPECIFICAÇÕES */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141721] border border-[#283044] rounded-2xl max-w-3xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#283044] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha os dados e use a busca automática de especificações oficiais.</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: GeForce RTX 4060 8GB"
                    className="tech-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="tech-input"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Marca</label>
                  <select
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="tech-input"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="https://..."
                    className="tech-input"
                  />
                </div>
              </div>

              {/* Bloco de Veredito e Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Preço Atual (R$)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                    className="tech-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Preço Considerado Bom (R$)</label>
                  <input
                    type="number"
                    value={prodIdealPrice}
                    onChange={(e) => setProdIdealPrice(parseFloat(e.target.value) || 0)}
                    className="tech-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Veredito</label>
                  <select
                    value={prodVerdict}
                    onChange={(e) => setProdVerdict(e.target.value as any)}
                    className="tech-input"
                  >
                    <option value="RECOMENDADO">🟠 RECOMENDADO</option>
                    <option value="DEPENDE">🟡 DEPENDE</option>
                    <option value="NAO_RECOMENDADO">🔴 NÃO RECOMENDADO</option>
                  </select>
                </div>
              </div>

              {/* BLOCO DE ESPECIFICAÇÕES AUTOMÁTICAS (REQUISITO FUNDAMENTAL) */}
              <div className="bg-[#0D0F15] border border-[#283044] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#283044] pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      Especificações Técnicas
                    </h4>
                    <span className="text-[11px] text-zinc-400">Consulte dados oficiais sem inventar informações.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFetchSpecs}
                    disabled={isSearchingSpecs}
                    className="btn-orange-primary text-xs px-3 py-1.5"
                  >
                    <Search className="w-3.5 h-3.5 mr-1" />
                    <span>{isSearchingSpecs ? 'Buscando Fichas Oficiais...' : 'Buscar Especificações Automaticamente'}</span>
                  </button>
                </div>

                {specsSearchNotes && (
                  <div className="text-xs text-zinc-300 bg-[#141721] p-3 rounded-lg border border-[#283044]">
                    {specsSearchNotes}
                  </div>
                )}

                {/* Tabela de Revisão das Especificações (Aceitar, Editar, Rejeitar) */}
                {Object.keys(specsTable).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#283044] text-zinc-400 font-bold uppercase text-[10px]">
                          <th className="py-2 px-3">Campo</th>
                          <th className="py-2 px-3">Valor</th>
                          <th className="py-2 px-3">Fonte</th>
                          <th className="py-2 px-3">Confiança</th>
                          <th className="py-2 px-3 text-right">Aprovar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#283044]">
                        {(Object.entries(specsTable) as [string, AdminSpecRow][]).map(([key, item]) => (
                          <tr key={key} className="hover:bg-[#141721]">
                            <td className="py-2 px-3 font-semibold text-zinc-300">{item.label}</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => {
                                  setSpecsTable({
                                    ...specsTable,
                                    [key]: { ...item, value: e.target.value }
                                  });
                                }}
                                className="bg-[#141721] border border-[#283044] rounded px-2 py-1 text-xs text-white w-full"
                              />
                            </td>
                            <td className="py-2 px-3 text-zinc-400 text-[11px]">{item.source}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {item.confidence}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecsTable({
                                    ...specsTable,
                                    [key]: { ...item, accepted: !item.accepted }
                                  });
                                }}
                                className={`p-1 rounded text-xs font-bold ${
                                  item.accepted ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'
                                }`}
                              >
                                {item.accepted ? '✓ Aceito' : '✗ Ignorar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic text-center py-4">
                    Clique em "Buscar Especificações Automaticamente" para carregar os campos técnicos da categoria.
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#283044]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-dark-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-orange-primary text-xs px-5 py-2.5"
                >
                  Salvar Produto no Catálogo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de Rejeição de Review */}
      {rejectModalReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141721] border border-[#283044] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Rejeitar Review</h3>
            <form onSubmit={handleRejectReview} className="space-y-4">
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Informe o motivo da rejeição para o criador ajustar..."
                className="tech-input"
                rows={3}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectModalReviewId(null)} className="btn-dark-secondary text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-lg">Confirmar Rejeição</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
