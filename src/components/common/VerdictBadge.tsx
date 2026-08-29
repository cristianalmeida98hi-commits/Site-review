import React from 'react';
import type { RecommendationVerdict } from '../../types/index.js';
import { ThumbsUp, AlertTriangle, ThumbsDown, HelpCircle } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: RecommendationVerdict;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ 
  verdict, 
  size = 'md', 
  showLabel = true 
}) => {
  const getVerdictConfig = () => {
    switch (verdict) {
      case 'RECOMENDADO':
        return {
          label: 'RECOMENDADO',
          sub: 'Vale a pena',
          symbol: '🟠',
          icon: ThumbsUp,
          badgeClass: 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
          dotClass: 'bg-black'
        };
      case 'DEPENDE':
        return {
          label: 'DEPENDE',
          sub: 'Avalie o preço',
          symbol: '🟡',
          icon: AlertTriangle,
          badgeClass: 'bg-[#FEF08A] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
          dotClass: 'bg-black'
        };
      case 'NAO_RECOMENDADO':
        return {
          label: 'NÃO RECOMENDADO',
          sub: 'Evite ou aguarde',
          symbol: '🔴',
          icon: ThumbsDown,
          badgeClass: 'bg-[#FDA4AF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
          dotClass: 'bg-black'
        };
      default:
        return {
          label: 'EM ANÁLISE',
          sub: 'Dados insuficientes',
          symbol: '⚪',
          icon: HelpCircle,
          badgeClass: 'bg-zinc-200 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
          dotClass: 'bg-black'
        };
    }
  };

  const config = getVerdictConfig();

  if (size === 'sm') {
    return (
      <span 
        id={`verdict-badge-${verdict.toLowerCase()}-sm`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${config.badgeClass}`}
        role="status"
        aria-label={`Veredito: ${config.label}`}
      >
        <span className="text-[12px]">{config.symbol}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div 
        id={`verdict-badge-${verdict.toLowerCase()}-lg`}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${config.badgeClass}`}
        role="status"
      >
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg shadow-[1px_1px_0px_0px_#fff]">
          {config.symbol}
        </div>
        <div>
          <div className="text-sm font-black tracking-wide uppercase">
            {config.label}
          </div>
          <div className="text-xs text-black/80 font-bold">
            {config.sub}
          </div>
        </div>
      </div>
    );
  }

  return (
    <span 
      id={`verdict-badge-${verdict.toLowerCase()}-md`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${config.badgeClass}`}
      role="status"
      aria-label={`Veredito: ${config.label}`}
    >
      <span className="text-xs">{config.symbol}</span>
      <span>{showLabel ? config.label : config.sub}</span>
    </span>
  );
};
