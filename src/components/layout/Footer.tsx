import React from 'react';
import { Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

export const Footer: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <footer className="w-full border-t-2 border-black bg-white text-black text-xs py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D4FF59] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000]">
              <Award className="w-4 h-4 text-black fill-current" />
            </div>
            <span className="font-black text-lg tracking-tight text-black uppercase">
              Review<span className="bg-[#D4FF59] px-1 rounded border border-black ml-0.5">Hub</span>
            </span>
          </div>
          <p className="text-zinc-600 leading-relaxed text-xs font-medium">
            A plataforma definitiva de reviews de hardware, comparativos técnicos, veredito "Vale a Pena" e melhores ofertas verificadas.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4FF59] border border-black text-black text-[11px] font-black uppercase">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Preços e avaliações auditadas</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Navegação</h4>
          <ul className="space-y-2 font-bold text-zinc-600">
            <li>
              <button onClick={() => setCurrentPage('home')} className="hover:text-black hover:underline transition-colors">
                Início
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products')} className="hover:text-black hover:underline transition-colors">
                Catálogo de Produtos
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('reviews')} className="hover:text-black hover:underline transition-colors">
                Reviews de Criadores
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('compare')} className="hover:text-black hover:underline transition-colors">
                Comparador Técnico
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('offers')} className="hover:text-black hover:underline transition-colors">
                Radar de Ofertas
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('creators')} className="hover:text-black hover:underline transition-colors">
                Criadores Certificados
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Categorias Populares</h4>
          <ul className="space-y-2 font-bold text-zinc-600">
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_gpu' })} className="hover:text-black hover:underline transition-colors">
                Placas de Vídeo (RTX & RX)
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_cpu' })} className="hover:text-black hover:underline transition-colors">
                Processadores Ryzen & Intel
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_storage' })} className="hover:text-black hover:underline transition-colors">
                SSDs NVMe Gen4 & Gen5
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_monitors' })} className="hover:text-black hover:underline transition-colors">
                Monitores Gamer IPS & OLED
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('products', { category: 'cat_peripherals' })} className="hover:text-black hover:underline transition-colors">
                Teclados & Headsets
              </button>
            </li>
          </ul>
        </div>

        {/* Creator Program & Transparency */}
        <div className="space-y-3">
          <h4 className="font-black text-black uppercase tracking-wider text-xs">Programa de Criadores</h4>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Publica vídeos e reviews de tecnologia? Junte-se ao ReviewHub e monetize com divisões justas de comissões de afiliados.
          </p>
          <button
            onClick={() => setCurrentPage('creators')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-zinc-800 text-[#D4FF59] border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase transition-all"
          >
            <span>Conheça os Criadores</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          
          <div className="pt-2 text-[10px] text-zinc-500 leading-normal font-medium">
            * Divulgação de Afiliados: O ReviewHub pode receber comissões quando você adquire produtos através de links parceiros. Isso não afeta a imparcialidade de nossas notas técnicas.
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t-2 border-black/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-bold">
        <div>
          © 2026 ReviewHub Brasil. Todos os direitos reservados.
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => setCurrentPage('legal', { doc: 'terms' })} className="hover:text-black">Termos de Uso</button>
          <button onClick={() => setCurrentPage('legal', { doc: 'privacy' })} className="hover:text-black">Privacidade</button>
          <button onClick={() => setCurrentPage('legal', { doc: 'reviews' })} className="hover:text-black">Diretrizes de Reviews</button>
          <button onClick={() => setCurrentPage('legal', { doc: 'affiliates' })} className="hover:text-black">Política de Afiliados</button>
        </div>
      </div>
    </footer>
  );
};
