import React from 'react';
import type { RecommendationVerdict } from '../../types/index.js';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

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
          label: 'VALE A PENA',
          sub: 'Recomendado',
          icon: CheckCircle2,
          bgClass: 'bg-[#D4FF59] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
          dotClass: 'bg-black'
        };
      case 'DEPENDE':
        return {
          label: 'DEPENDE',
          sub: 'Avalie o preço',
          icon: AlertTriangle,
          bgClass: 'bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]',
          dotClass: 'bg-black'
        };
      case 'NAO_RECOMENDADO':
        return {
          label: 'NÃO VALE A PENA',
          sub: 'Evite ou aguarde',
          icon: XCircle,
          bgClass: 'bg-rose-400 text-black border-2 border-black shadow-[2px_2px_0px_#000]',
          dotClass: 'bg-black'
        };
      default:
        return {
          label: 'EM ANÁLISE',
          sub: 'Dados insuficientes',
          icon: HelpCircle,
          bgClass: 'bg-zinc-200 text-black border-2 border-black shadow-[2px_2px_0px_#000]',
          dotClass: 'bg-black'
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span 
        id={`verdict-badge-${verdict.toLowerCase()}-sm`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${config.bgClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        {showLabel ? config.label : null}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div 
        id={`verdict-badge-${verdict.toLowerCase()}-lg`}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${config.bgClass}`}
      >
        <Icon className="w-6 h-6 shrink-0 text-black stroke-[2.5]" />
        <div>
          <div className="font-black text-sm uppercase tracking-wide">{config.label}</div>
          <div className="text-xs font-bold opacity-80">{config.sub}</div>
        </div>
      </div>
    );
  }

  return (
    <span 
      id={`verdict-badge-${verdict.toLowerCase()}-md`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${config.bgClass}`}
    >
      <Icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
      <span>{config.label}</span>
    </span>
  );
};

