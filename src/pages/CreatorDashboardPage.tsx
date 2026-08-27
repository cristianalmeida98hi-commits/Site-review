import React, { useState, useEffect } from 'react';
import { 
  Video, DollarSign, Eye, MousePointer, TrendingUp, Plus, 
  Clock, CheckCircle, XCircle, AlertCircle, Sparkles, Send, 
  ExternalLink, ArrowRight, Play, Wallet, RefreshCw, BarChart2 
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/api.js';
import type { Review, Product, CreatorDashboardData } from '../types/index.js';
import { ScoreBadge } from '../components/common/ScoreBadge.js';
import { VerdictBadge } from '../components/common/VerdictBadge.js';

interface CreatorDashboardPageProps {
  initialTab?: string;
  productId?: string;
}

export const CreatorDashboardPage: React.FC<CreatorDashboardPageProps> = ({ 
  initialTab = 'overview',
  productId
}) => {
  const { currentUser, setCurrentPage } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'new-review' | 'my-reviews' | 'payouts'>(
    (initialTab as any) || 'overview'
  );

  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Review Form State
  const [formProductId, setFormProductId] = useState(productId || '');
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formRating, setFormRating] = useState<number>(9.0);
  const [formVerdict, setFormVerdict] = useState<'RECOMENDADO' | 'DEPENDE' | 'NAO_RECOMENDADO'>('RECOMENDADO');
  const [formPros, setFormPros] = useState('');
  const [formCons, setFormCons] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutPixKey, setPayoutPixKey] = useState('');
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dash, prods] = await Promise.all([
        apiService.getCreatorDashboard(),
        apiService.getProducts()
      ]);
      setDashboardData(dash);
      setProducts(prods);
      if (!formProductId && prods.length > 0) {
        setFormProductId(prods[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Extract YouTube ID preview
  const extractVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const previewVideoId = extractVideoId(formYoutubeUrl);

  const handleCreateReview = async (isDraft: boolean) => {
    if (!formProductId || !formTitle || !formSummary) {
      setSubmitMessage({ type: 'error', text: 'Preencha o produto, título e resumo do review.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      await apiService.createReview({
        productId: formProductId,
        title: formTitle,
        summary: formSummary,
        content: formContent || formSummary,
        rating: Number(formRating),
        recommendation: formVerdict,
        pros: formPros.split('\n').filter(p => p.trim().length > 0),
        cons: formCons.split('\n').filter(c => c.trim().length > 0),
        youtubeUrl: formYoutubeUrl || undefined,
        isDraft
      });

      setSubmitMessage({
        type: 'success',
        text: isDraft 
          ? 'Rascunho salvo com sucesso!' 
          : 'Review enviado para moderação! Nossa equipe revisará em breve.'
      });

      // Clear form
      setFormTitle('');
      setFormSummary('');
      setFormContent('');
      setFormPros('');
      setFormCons('');
      setFormYoutubeUrl('');

      await loadData();
      setTimeout(() => setActiveTab('my-reviews'), 1200);
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message || 'Erro ao enviar review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateConversion = async () => {
    try {
      // Simulate random test sale for demonstration
      await apiService.trackAffiliateClick('off_1');
      await loadData();
      alert('Simulação de clique e comissão de afiliado processada com sucesso!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData) return;
    if (payoutAmount > dashboardData.stats.availableBalance) {
      setPayoutMessage('Saldo disponível insuficiente para este valor.');
      return;
    }
    if (payoutAmount < 50) {
      setPayoutMessage('O valor mínimo para resgate é de R$ 50,00.');
      return;
    }
    try {
      const res = await apiService.requestPayout(payoutAmount, payoutPixKey);
      setPayoutMessage(`Solicitação de saque PIX de R$ ${payoutAmount.toFixed(2)} criada com sucesso!`);
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        setPayoutMessage(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setPayoutMessage(err.message || 'Erro ao solicitar saque.');
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Carregando painel do criador e métricas de monetização...</p>
      </div>
    );
  }

  const { stats, recentReviews, earningsHistory } = dashboardData;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-500/40" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser?.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                Painel do Criador
              </span>
            </div>
            <p className="text-xs text-slate-400">Monitore visualizações, comissões de afiliados e publique novas análises.</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-simulate-sale"
            onClick={handleSimulateConversion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-colors"
            title="Simula 1 clique/conversão de afiliado para testar o painel em tempo real"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simular Conversão</span>
          </button>

          <button
            id="btn-new-review-tab"
            onClick={() => setActiveTab('new-review')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Review</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        {[
          { id: 'overview', label: 'Visão Geral & Métricas' },
          { id: 'new-review', label: 'Publicar Review' },
          { id: 'my-reviews', label: `Meus Reviews (${recentReviews.length})` },
          { id: 'payouts', label: 'Monetização & Saques' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Views */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Visualizações de Reviews</span>
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-[11px] text-cyan-400 font-medium">
                +14% em relação ao mês anterior
              </div>
            </div>

            {/* Clicks on Affiliate Links */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Cliques de Afiliados</span>
                <MousePointer className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {stats.totalClicks.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                Taxa de conversão estimada: {((stats.totalConversions / (stats.totalClicks || 1)) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Total Earnings */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Ganhos Totais</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400">
                {stats.totalConversions} vendas geradas
              </div>
            </div>

            {/* Available Balance */}
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 text-xs font-semibold">
                <span>Saldo Disponível para Saque</span>
                <Wallet className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                R$ {stats.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={stats.availableBalance < 50}
                className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-colors"
              >
                Solicitar Saque PIX
              </button>
            </div>

          </div>

          {/* Quick Creator Level Status */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nível de Criador ReviewHub</div>
              <div className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <span>Nível {currentUser?.creatorLevel || 'Bronze'}</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-xs text-slate-400">
                Comissão de afiliados atual: <strong className="text-emerald-400">50% do total da plataforma</strong>. Alcance 5 reviews para desbloquear o nível Ouro (65%).
              </p>
            </div>
            <div className="w-full sm:w-64 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Progresso para Próximo Nível</span>
                <span className="font-bold text-cyan-400">60%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Recent Reviews Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Últimos Reviews Criados</h3>
              <button 
                onClick={() => setActiveTab('my-reviews')} 
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReviews.slice(0, 4).map(rev => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">{rev.productName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rev.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      rev.status === 'PENDING_MODERATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      rev.status === 'DRAFT' ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {rev.status === 'PUBLISHED' ? 'Publicado' : rev.status === 'PENDING_MODERATION' ? 'Em Análise' : rev.status === 'DRAFT' ? 'Rascunho' : 'Rejeitado'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{rev.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{rev.viewsCount.toLocaleString()} visualizações</span>
                    <ScoreBadge score={rev.rating} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. NEW REVIEW TAB */}
      {activeTab === 'new-review' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Criar Nova Análise Técnica</h2>
            <p className="text-xs text-slate-400 mt-1">
              Escreva uma análise honesta, inclua prós, contras, nota de 0 a 10 e o link do seu vídeo no YouTube para que os leitores possam assistir.
            </p>
          </div>

          {submitMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold ${
              submitMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {submitMessage.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            
            {/* Select Product */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Produto Analisado *</label>
              <select
                id="select-review-product"
                value={formProductId}
                onChange={e => setFormProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.categoryName})
                  </option>
                ))}
              </select>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Título do Review *</label>
              <input
                id="input-review-title"
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Ex: Análise Completa: RTX 4060 Vale a Pena em 2026? Testes em 10 Jogos"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Rating & Verdict */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nota Geral (0 a 10) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={formRating}
                    onChange={e => setFormRating(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <ScoreBadge score={formRating} size="md" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Veredito "Vale a Pena" *</label>
                <select
                  value={formVerdict}
                  onChange={e => setFormVerdict(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="RECOMENDADO">🟢 Vale a Pena (Recomendado)</option>
                  <option value="DEPENDE">🟡 Depende do Preço</option>
                  <option value="NAO_RECOMENDADO">🔴 Não Recomendado</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Resumo Executivo (1 ou 2 parágrafos) *</label>
              <textarea
                id="input-review-summary"
                value={formSummary}
                onChange={e => setFormSummary(e.target.value)}
                placeholder="Apresente as conclusões dos testes de temperatura, ruído, FPS e comparativo de preço..."
                rows={3}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">Pontos Positivos (1 por linha)</label>
                <textarea
                  value={formPros}
                  onChange={e => setFormPros(e.target.value)}
                  placeholder="Consumo elétrico baixíssimo (115W)&#10;Excelente desempenho com DLSS 3&#10;Fria e silenciosa"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1">Pontos Negativos (1 por linha)</label>
                <textarea
                  value={formCons}
                  onChange={e => setFormCons(e.target.value)}
                  placeholder="Apenas 8GB de VRAM&#10;Barramento PCIe x8&#10;Preço alto no lançamento"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* YouTube Video URL */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Link do Vídeo no YouTube (Opcional)</label>
              <input
                id="input-review-youtube"
                type="url"
                value={formYoutubeUrl}
                onChange={e => setFormYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=xxxx ou https://youtu.be/xxxx"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              {previewVideoId && (
                <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img 
                    src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`} 
                    alt="Preview" 
                    className="w-20 h-12 object-cover rounded-lg"
                  />
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Vídeo vinculado com sucesso!
                  </div>
                </div>
              )}
            </div>

            {/* Full Markdown content */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Texto Completo da Análise (Markdown aceito)</label>
              <textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                placeholder="Insira detalhes de benchmarks, tabelas de FPS, especificações e considerações finais..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Submission Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCreateReview(true)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Salvar como Rascunho
              </button>

              <button
                type="button"
                onClick={() => handleCreateReview(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
              >
                Enviar para Moderação
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 3. MY REVIEWS TAB */}
      {activeTab === 'my-reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Todos os Meus Reviews</h3>
            <button
              onClick={() => setActiveTab('new-review')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              + Novo Review
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <th className="p-3.5">Review & Produto</th>
                  <th className="p-3.5">Nota</th>
                  <th className="p-3.5">Veredito</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Visualizações</th>
                  <th className="p-3.5">Criado Em</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentReviews.map(rev => (
                  <tr key={rev.id} className="hover:bg-slate-850/50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{rev.title}</div>
                      <div className="text-[10px] text-cyan-400">{rev.productName}</div>
                      {rev.moderationFeedback && (
                        <div className="text-[10px] text-rose-400 mt-1">
                          Nota do Moderador: {rev.moderationFeedback}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <ScoreBadge score={rev.rating} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <VerdictBadge verdict={rev.recommendation} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rev.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        rev.status === 'PENDING_MODERATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        rev.status === 'DRAFT' ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {rev.status === 'PUBLISHED' ? 'Publicado' : rev.status === 'PENDING_MODERATION' ? 'Em Análise' : rev.status === 'DRAFT' ? 'Rascunho' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">
                      {rev.viewsCount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setCurrentPage('product-detail', { slug: rev.productSlug })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Ver no Site
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Saldo Disponível para Saque</div>
              <div className="text-2xl font-black text-emerald-400">
                R$ {stats.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={stats.availableBalance < 50}
                className="mt-2 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-colors"
              >
                Solicitar Saque PIX
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Saldo Pendente (Aguardando Liquidação)</div>
              <div className="text-2xl font-black text-amber-400">
                R$ {stats.pendingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Lojas parceiras liquidam vendas aprovadas em até 30 dias.
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Total Já Sacado</div>
              <div className="text-2xl font-black text-white">
                R$ {(stats.totalEarnings - stats.availableBalance - stats.pendingBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Pagamentos efetuados via chave PIX cadastrada.
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white">Histórico Recente de Ganhos</h3>
            <div className="space-y-2">
              {earningsHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{item.description}</div>
                    <div className="text-[10px] text-slate-400">{item.date}</div>
                  </div>
                  <div className="text-sm font-black text-emerald-400">
                    + R$ {item.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsPayoutModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-white flex items-center gap-2 text-emerald-400">
              <Wallet className="w-5 h-5" /> Solicitar Resgate PIX
            </h3>
            
            <p className="text-xs text-slate-400">
              Saldo disponível: <strong className="text-white">R$ {stats.availableBalance.toFixed(2)}</strong>. O valor mínimo é R$ 50,00.
            </p>

            {payoutMessage && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                {payoutMessage}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Valor do Saque (R$)</label>
                <input
                  type="number"
                  min="50"
                  max={stats.availableBalance}
                  step="0.01"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(parseFloat(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chave PIX (CPF, Email, Telefone ou Aleatória)</label>
                <input
                  type="text"
                  value={payoutPixKey}
                  onChange={e => setPayoutPixKey(e.target.value)}
                  placeholder="suachave@pix.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black"
                >
                  Confirmar Saque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
