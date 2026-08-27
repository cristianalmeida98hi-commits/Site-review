import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Video, ShoppingBag, DollarSign, CheckCircle, 
  XCircle, AlertTriangle, Settings, Plus, Trash2, Edit3, 
  RefreshCw, Check, Clock, Sparkles, ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Review, Product, Report, PlatformSettings, AuditLog, Category, Brand } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

export const AdminPanelPage: React.FC = () => {
  const { currentUser, setCurrentPage } = useApp();

  const [activeTab, setActiveTab] = useState<'moderation' | 'products' | 'reports' | 'settings' | 'logs'>('moderation');
  const [stats, setStats] = useState<any>(null);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rejection modal state
  const [rejectModalReviewId, setRejectModalReviewId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // New Product modal state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(1000);
  const [newProdVerdict, setNewProdVerdict] = useState<'RECOMENDADO' | 'DEPENDE' | 'NAO_RECOMENDADO'>('RECOMENDADO');
  const [newProdVerdictReason, setNewProdVerdictReason] = useState('');
  const [newProdTarget, setNewProdTarget] = useState('');

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [st, pRevs, prods, reps, sets, logs, cats, brs] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getPendingReviews(),
        apiService.getProducts(),
        apiService.getReports(),
        apiService.getPlatformSettings(),
        apiService.getAuditLogs(),
        apiService.getCategories(),
        apiService.getBrands()
      ]);
      setStats(st);
      setPendingReviews(pRevs);
      setProducts(prods);
      setReports(reps);
      setSettings(sets);
      setAuditLogs(logs);
      setCategories(cats);
      setBrands(brs);
      if (cats.length > 0 && !newProdCategory) setNewProdCategory(cats[0].id);
      if (brs.length > 0 && !newProdBrand) setNewProdBrand(brs[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createProduct({
        name: newProdName,
        categoryId: newProdCategory,
        brandId: newProdBrand,
        imageUrl: newProdImage || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
        description: newProdDesc,
        currentBestPrice: newProdPrice,
        referencePrice: newProdPrice * 1.15,
        idealPrice: newProdPrice * 0.9,
        recommendationVerdict: newProdVerdict,
        verdictReason: newProdVerdictReason || 'Excelente opção testada em laboratório.',
        targetAudience: newProdTarget || 'Entusiastas e gamers',
        pros: ['Alta eficiência', 'Construção sólida'],
        cons: ['Disponibilidade limitada'],
        specs: { 'Garantia': '12 meses' }
      });
      setIsNewProductModalOpen(false);
      // Reset form
      setNewProdName('');
      setNewProdDesc('');
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await apiService.updatePlatformSettings(settings);
      alert('Configurações salvas com sucesso!');
      await loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Carregando painel de administração e fila de moderação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-rose-500" />
            <span>Painel Administrativo do ReviewHub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modere reviews de criadores, gerencie catálogo de produtos, controle comissões e audite denúncias.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Global Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Usuários</div>
          <div className="text-xl font-black text-white">{stats.totalUsers}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Criadores</div>
          <div className="text-xl font-black text-cyan-400">{stats.totalCreators}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Produtos</div>
          <div className="text-xl font-black text-white">{stats.totalProducts}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cliques Afiliados</div>
          <div className="text-xl font-black text-blue-400">{stats.totalAffiliateClicks}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Receita Bruta</div>
          <div className="text-xl font-black text-emerald-400">R$ {stats.totalRevenue.toFixed(0)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-300">Moderação Pendente</div>
          <div className="text-xl font-black text-rose-400">{stats.pendingReviewsCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'moderation', label: `Fila de Moderação (${pendingReviews.length})` },
          { id: 'products', label: `Gerenciar Produtos (${products.length})` },
          { id: 'reports', label: `Denúncias (${reports.length})` },
          { id: 'settings', label: 'Taxas & Configurações' },
          { id: 'logs', label: 'Logs de Auditoria' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. MODERATION QUEUE TAB */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Reviews Aguardando Aprovação</h3>
            <span className="text-xs text-slate-400">Garante que apenas reviews imparciais e fundamentados vão para o site</span>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-slate-200">Fila de moderação limpa!</div>
              <p>Nenhum review pendente de revisão no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(rev => (
                <div key={rev.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img src={rev.creatorAvatar} alt={rev.creatorName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-xs text-white">{rev.creatorName}</div>
                        <div className="text-[10px] text-cyan-400">Produto: {rev.productName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={rev.rating} size="sm" />
                      <VerdictBadge verdict={rev.recommendation} size="sm" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{rev.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rev.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="font-bold text-emerald-400">✓ Prós: </span>
                      {rev.pros.join(', ') || 'Nenhum'}
                    </div>
                    <div>
                      <span className="font-bold text-rose-400">✗ Contras: </span>
                      {rev.cons.join(', ') || 'Nenhum'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRejectModalReviewId(rev.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rejeitar / Solicitar Ajustes</span>
                    </button>

                    <button
                      onClick={() => handleApproveReview(rev.id)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprovar e Publicar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Catálogo de Produtos Cadastrados</h3>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Produto</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <th className="p-3.5">Produto</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Veredito</th>
                  <th className="p-3.5">Melhor Preço</th>
                  <th className="p-3.5">Nota</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-850/50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={prod.imageUrl} alt={prod.name} className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-1" />
                        <div>
                          <div className="font-bold text-slate-100">{prod.name}</div>
                          <div className="text-[10px] text-slate-400">{prod.brandName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">{prod.categoryName}</td>
                    <td className="p-3.5"><VerdictBadge verdict={prod.recommendationVerdict} size="sm" /></td>
                    <td className="p-3.5 text-emerald-400 font-bold">R$ {prod.currentBestPrice.toFixed(2)}</td>
                    <td className="p-3.5"><ScoreBadge score={prod.ratingOverall} size="sm" /></td>
                    <td className="p-3.5 text-slate-300 font-medium">{prod.viewsCount.toLocaleString()}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setCurrentPage('product-detail', { slug: prod.slug })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
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

      {/* 3. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-white">Denúncias da Comunidade</h3>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              Nenhuma denúncia pendente.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400">Motivo: {rep.reason}</span>
                    <span className="text-[10px] text-slate-500">{new Date(rep.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-xs text-slate-300">{rep.details || 'Sem detalhes informados.'}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={async () => {
                        await apiService.resolveReport(rep.id, 'DISMISSED');
                        await loadAdminData();
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-400"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={async () => {
                        await apiService.resolveReport(rep.id, 'RESOLVED');
                        await loadAdminData();
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
                    >
                      Remover Conteúdo & Punir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-white">Configurações Gerais da Plataforma</h3>
            <p className="text-xs text-slate-400 mt-1">Divisão de comissões de afiliados, limites e regras de moderação.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Repasse ao Criador (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.creatorCommissionRate}
                  onChange={e => setSettings({ ...settings, creatorCommissionRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Taxa da Plataforma (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformCommissionRate}
                  onChange={e => setSettings({ ...settings, platformCommissionRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Valor Mínimo de Resgate / Saque (R$)</label>
              <input
                type="number"
                min="10"
                value={settings.minimumWithdrawalAmount}
                onChange={e => setSettings({ ...settings, minimumWithdrawalAmount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveVerifiedCreators}
                  onChange={e => setSettings({ ...settings, autoApproveVerifiedCreators: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span>Aprovar automaticamente reviews de criadores nível Especialista / Verificados</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-white">Registro de Auditoria de Ações Administrativas</h3>
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <th className="p-3.5">Data/Hora</th>
                  <th className="p-3.5">Administrador</th>
                  <th className="p-3.5">Ação</th>
                  <th className="p-3.5">Alvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-3.5 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="p-3.5 font-bold text-slate-200">{log.userName}</td>
                    <td className="p-3.5 text-cyan-400 font-medium">{log.action}</td>
                    <td className="p-3.5 text-slate-300">{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalReviewId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setRejectModalReviewId(null)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-rose-400">Rejeitar ou Solicitar Ajustes no Review</h3>
            <p className="text-xs text-slate-400">Explique ao criador o que precisa ser corrigido antes da publicação.</p>

            <form onSubmit={handleRejectReview} className="space-y-3">
              <textarea
                value={rejectFeedback}
                onChange={e => setRejectFeedback(e.target.value)}
                placeholder="Ex: Por favor incluir dados de temperatura do teste ou corrigir o link do vídeo..."
                rows={4}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReviewId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsNewProductModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-white">Cadastrar Novo Produto</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="Ex: AMD Radeon RX 7800 XT 16GB"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Marca *</label>
                  <select
                    value={newProdBrand}
                    onChange={e => setNewProdBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Preço Atual (R$) *</label>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={e => setNewProdPrice(parseFloat(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={e => setNewProdImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Veredito Inicial</label>
                <select
                  value={newProdVerdict}
                  onChange={e => setNewProdVerdict(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="RECOMENDADO">🟢 Vale a Pena (Recomendado)</option>
                  <option value="DEPENDE">🟡 Depende do Preço</option>
                  <option value="NAO_RECOMENDADO">🔴 Não Recomendado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Motivo do Veredito</label>
                <textarea
                  value={newProdVerdictReason}
                  onChange={e => setNewProdVerdictReason(e.target.value)}
                  placeholder="Explique o motivo do veredito..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descrição Breve</label>
                <textarea
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  placeholder="Descrição geral do produto..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
