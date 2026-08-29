import React from 'react';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

export const Footer: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <footer className="w-full border-t-2 border-black bg-white text-black text-xs py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B00] border-2 border-black flex items-center justify-center text-black font-black text-lg shadow-[2px_2px_0px_0px_#000]">
              R
            </div>
            <span className="font-black text-lg tracking-tight text-black uppercase">
              REVIEW<span className="bg-[#FF6B00] text-black px-1.5 py-0.5 rounded-md border-2 border-black text-xs ml-1">HUB</span>
            </span>
          </div>
          <p className="text-zinc-700 leading-relaxed text-xs font-semibold">
            A plataforma de referência para avaliações de hardware, comparativos técnicos detalhados, análise de custo-benefício e rastreador de melhores ofertas.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF6B00] border-2 border-black text-black text-[11px] font-black shadow-[2px_2px_0px_0px_#000]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Dados técnicos verificados</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Navegação</h4>
          <ul className="space-y-2 text-zinc-700 font-bold">
            <li>
              <button onClick={() => setCurrentPage('home')} className="hover:text-black hover:underline transition-colors">
                Início
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products')} className="hover:text-black hover:underline transition-colors">
                Catálogo de Hardware
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('compare')} className="hover:text-black hover:underline transition-colors">
                Comparador Inteligente
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('offers')} className="hover:text-black hover:underline transition-colors">
                Radar de Ofertas
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('reviews')} className="hover:text-black hover:underline transition-colors">
                Reviews da Comunidade
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Categorias em Alta</h4>
          <ul className="space-y-2 text-zinc-700 font-bold">
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_gpu' })} className="hover:text-black hover:underline transition-colors">
                Placas de Vídeo (RTX / RX)
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_cpu' })} className="hover:text-black hover:underline transition-colors">
                Processadores (Intel / AMD)
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_monitors' })} className="hover:text-black hover:underline transition-colors">
                Monitores Gamer
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_peripherals' })} className="hover:text-black hover:underline transition-colors">
                Periféricos & Áudio
              </button>
            </li>
          </ul>
        </div>

        {/* Transparency & Disclosure */}
        <div className="space-y-3">
          <h4 className="font-black text-black uppercase tracking-wider text-xs">Transparência</h4>
          <p className="text-zinc-700 leading-relaxed text-[11px] font-medium">
            Links de afiliados podem gerar uma comissão para a plataforma e criadores parceiros sem nenhum custo adicional para o comprador. Os vereditos são baseados em especificações oficiais e testes rigorosos.
          </p>
          <div className="text-[11px] text-zinc-600 font-bold">
            © {new Date().getFullYear()} ReviewHub Inc. Todos os direitos reservados.
          </div>
        </div>

      </div>
    </footer>
  );
};
