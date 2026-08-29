import React from 'react';
import { ArrowLeft, Award } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface LegalPagesProps {
  doc?: string;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ doc = 'terms' }) => {
  const { setCurrentPage } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentPage('home')}
        className="flex items-center gap-1.5 text-xs text-black hover:underline font-black"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Início</span>
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-black pb-2 flex-wrap">
        {[
          { id: 'terms', label: 'Termos de Uso' },
          { id: 'privacy', label: 'Política de Privacidade' },
          { id: 'reviews', label: 'Diretrizes de Reviews & Imparcialidade' },
          { id: 'affiliates', label: 'Política de Afiliados & Transparência' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage('legal', { doc: item.id })}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              doc === item.id
                ? 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content based on selected doc */}
      <div className="bento-card p-8 text-black text-xs sm:text-sm space-y-6 leading-relaxed">
        
        {doc === 'terms' && (
          <>
            <h1 className="text-2xl font-black text-black">Termos de Uso do ReviewHub</h1>
            <p className="font-semibold text-zinc-800">
              Bem-vindo ao ReviewHub. Ao acessar ou utilizar nossa plataforma de avaliações, comparativos técnicos e agregação de ofertas de tecnologia, você concorda em cumprir estes Termos de Uso.
            </p>
            <h2 className="text-base font-black text-black pt-2">1. Uso da Plataforma</h2>
            <p className="font-semibold text-zinc-800">
              O ReviewHub fornece informações editoriais técnicas, benchmarks, notas consolidadas e direcionamento para lojas parceiras de comércio eletrônico. As especificações e preços são atualizados periodicamente, mas podem sofrer variações dinâmicas nas lojas de destino.
            </p>
            <h2 className="text-base font-black text-black pt-2">2. Conduta e Avaliações de Usuários</h2>
            <p className="font-semibold text-zinc-800">
              Usuários cadastrados podem submeter notas e comentários de produtos. É expressamente proibida a criação de avaliações fraudulentas (fake reviews), difamatórias ou patrocinadas sem identificação. Qualquer violação resultará na exclusão do conteúdo e suspensão da conta.
            </p>
          </>
        )}

        {doc === 'privacy' && (
          <>
            <h1 className="text-2xl font-black text-black">Política de Privacidade</h1>
            <p className="font-semibold text-zinc-800">
              Sua privacidade é prioridade para o ReviewHub. Esta política descreve como tratamos informações de navegação e perfis de usuários em conformidade com a LGPD (Lei Geral de Proteção de Dados).
            </p>
            <h2 className="text-base font-black text-black pt-2">1. Coleta de Informações</h2>
            <p className="font-semibold text-zinc-800">
              Coletamos informações como nome e e-mail no momento do cadastro, além de métricas agregadas de cliques e visualizações de produtos para aprimorar as recomendações e ordenar o comparador técnico.
            </p>
            <h2 className="text-base font-black text-black pt-2">2. Segurança dos Dados</h2>
            <p className="font-semibold text-zinc-800">
              Não vendemos dados pessoais a terceiros. Links de afiliados usam parâmetros de rastreamento anônimos para atribuição de comissão junto aos lojistas parceiros.
            </p>
          </>
        )}

        {doc === 'reviews' && (
          <>
            <div className="flex items-center gap-2 text-black font-black mb-2">
              <Award className="w-5 h-5 text-black fill-[#FF6B00]" />
              <span>Código de Ética Editorial</span>
            </div>
            <h1 className="text-2xl font-black text-black">Diretrizes de Reviews & Imparcialidade</h1>
            <p className="font-semibold text-zinc-800">
              O ReviewHub nasceu com o propósito inegociável de dizer se um produto realmente <strong>Vale a Pena</strong> comprar.
            </p>
            <h2 className="text-base font-black text-black pt-2">1. Vereditos Transparentes</h2>
            <p className="font-semibold text-zinc-800">
              Nossa nota técnica de 0 a 10 e o selo "Vale a Pena" são baseados em benchmarks mensuráveis, custo por frame, testes de ruído, qualidade de construção e histórico de RMA. Nenhum fabricante ou patrocinador pode comprar ou alterar nossa nota técnica.
            </p>
            <h2 className="text-base font-black text-black pt-2">2. Critérios de Moderação de Criadores</h2>
            <p className="font-semibold text-zinc-800">
              Todo review enviado por criadores parceiros passa por moderação humana prévia para garantir que testes empíricos foram realizados e que o link do vídeo do YouTube é legítimo.
            </p>
          </>
        )}

        {doc === 'affiliates' && (
          <>
            <h1 className="text-2xl font-black text-black">Política de Afiliados & Transparência</h1>
            <p className="font-semibold text-zinc-800">
              O ReviewHub participa de programas de afiliados com lojas auditadas (como Amazon, KaBuM!, Terabyte, Pichau, Mercado Livre).
            </p>
            <h2 className="text-base font-black text-black pt-2">1. Como Funcionam as Comissões</h2>
            <p className="font-semibold text-zinc-800">
              Quando você clica em um link de oferta e conclui uma compra, podemos receber uma pequena comissão da loja. Isso <strong>nunca altera o preço final</strong> para o consumidor nem interfere na nossa avaliação técnica do produto.
            </p>
          </>
        )}

      </div>

    </div>
  );
};
