import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, Award, Lock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface LegalPagesProps {
  doc?: string;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ doc = 'terms' }) => {
  const { setCurrentPage } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentPage('home')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Início</span>
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        {[
          { id: 'terms', label: 'Termos de Uso' },
          { id: 'privacy', label: 'Política de Privacidade' },
          { id: 'reviews', label: 'Diretrizes de Reviews & Imparcialidade' },
          { id: 'affiliates', label: 'Política de Afiliados & Transparência' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage('legal', { doc: item.id })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              doc === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content based on selected doc */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-300 text-xs sm:text-sm space-y-6 leading-relaxed">
        
        {doc === 'terms' && (
          <>
            <h1 className="text-2xl font-black text-white">Termos de Uso do ReviewHub</h1>
            <p>
              Bem-vindo ao ReviewHub. Ao acessar ou utilizar nossa plataforma de avaliações, comparativos técnicos e agregação de ofertas de tecnologia, você concorda em cumprir estes Termos de Uso.
            </p>
            <h2 className="text-base font-bold text-white pt-2">1. Uso da Plataforma</h2>
            <p>
              O ReviewHub fornece informações editoriais técnicas, benchmarks, notas consolidadas e direcionamento para lojas parceiras de comércio eletrônico. As especificações e preços são atualizados periodicamente, mas podem sofrer variações dinâmicas nas lojas de destino.
            </p>
            <h2 className="text-base font-bold text-white pt-2">2. Conduta e Avaliações de Usuários</h2>
            <p>
              Usuários cadastrados podem submeter notas e comentários de produtos. É expressamente proibida a criação de avaliações fraudulentas (fake reviews), difamatórias ou patrocinadas sem identificação. Qualquer violação resultará na exclusão do conteúdo e suspensão da conta.
            </p>
          </>
        )}

        {doc === 'privacy' && (
          <>
            <h1 className="text-2xl font-black text-white">Política de Privacidade</h1>
            <p>
              Sua privacidade é prioridade para o ReviewHub. Esta política descreve como tratamos informações de navegação e perfis de usuários em conformidade com a LGPD (Lei Geral de Proteção de Dados).
            </p>
            <h2 className="text-base font-bold text-white pt-2">1. Coleta de Informações</h2>
            <p>
              Coletamos informações como nome e e-mail no momento do cadastro, além de métricas agregadas de cliques e visualizações de produtos para aprimorar as recomendações e ordenar o comparador técnico.
            </p>
            <h2 className="text-base font-bold text-white pt-2">2. Segurança dos Dados</h2>
            <p>
              Não vendemos dados pessoais a terceiros. Links de afiliados usam parâmetros de rastreamento anônimos para atribuição de comissão junto aos lojistas parceiros.
            </p>
          </>
        )}

        {doc === 'reviews' && (
          <>
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
              <Award className="w-5 h-5" />
              <span>Código de Ética Editorial</span>
            </div>
            <h1 className="text-2xl font-black text-white">Diretrizes de Reviews & Imparcialidade</h1>
            <p>
              O ReviewHub nasceu com o propósito inegociável de dizer se um produto realmente <strong>Vale a Pena</strong> comprar.
            </p>
            <h2 className="text-base font-bold text-white pt-2">1. Vereditos Transparentes</h2>
            <p>
              Nossa nota técnica de 0 a 10 e o selo "Vale a Pena" são baseados em benchmarks mensuráveis, custo por frame, testes de ruído, qualidade de construção e histórico de RMA. Nenhum fabricante ou patrocinador pode comprar ou alterar nossa nota técnica.
            </p>
            <h2 className="text-base font-bold text-white pt-2">2. Critérios de Moderação de Criadores</h2>
            <p>
              Todo review enviado por criadores parceiros passa por moderação humana prévia para garantir que testes empíricos foram realizados e que o link do vídeo do YouTube é legítimo.
            </p>
          </>
        )}

        {doc === 'affiliates' && (
          <>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Divulgação de Afiliados Conforme Normas FTC & CONAR</span>
            </div>
            <h1 className="text-2xl font-black text-white">Política de Afiliados & Transparência Comercial</h1>
            <p>
              Em conformidade com as diretrizes de transparência comercial, informamos que o ReviewHub participa de programas de afiliados de varejistas confiáveis, incluindo Amazon, KaBuM!, Pichau, Terabyte e Mercado Livre.
            </p>
            <h2 className="text-base font-bold text-white pt-2">1. Como Funciona a Remuneração</h2>
            <p>
              Quando você clica em um botão de oferta ("Ir para Loja", "Comprar") e conclui uma compra, a loja nos paga uma pequena comissão percentual sem nenhum custo adicional para você. O preço para o consumidor final é rigorosamente o mesmo.
            </p>
            <h2 className="text-base font-bold text-white pt-2">2. Divisão com Criadores</h2>
            <p>
              Repassamos a maior fatia das comissões diretamente para os criadores de conteúdo que produziram as análises, fomentando um ecossistema sustentável de jornalismo de tecnologia independente no Brasil.
            </p>
          </>
        )}

      </div>

    </div>
  );
};
