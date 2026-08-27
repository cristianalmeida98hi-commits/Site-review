import React from 'react';
import { Star } from 'lucide-react';

interface ScoreBadgeProps {
  score: number; // 0 to 10
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showStar?: boolean;
  label?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ 
  score, 
  size = 'md', 
  showStar = true,
  label 
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 9.0) return 'text-black bg-[#D4FF59] border-black shadow-[2px_2px_0px_#000]';
    if (val >= 8.0) return 'text-black bg-emerald-300 border-black shadow-[2px_2px_0px_#000]';
    if (val >= 7.0) return 'text-black bg-cyan-200 border-black shadow-[2px_2px_0px_#000]';
    if (val >= 5.5) return 'text-black bg-amber-200 border-black shadow-[2px_2px_0px_#000]';
    return 'text-white bg-rose-500 border-black shadow-[2px_2px_0px_#000]';
  };

  const getScoreText = (val: number) => {
    if (val >= 9.0) return 'Excelente';
    if (val >= 8.0) return 'Muito Bom';
    if (val >= 7.0) return 'Bom';
    if (val >= 5.5) return 'Regular';
    return 'Fraco';
  };

  const colorClass = getScoreColor(score);
  const formattedScore = Number(score || 0).toFixed(1).replace('.', ',');

  if (size === 'hero') {
    return (
      <div 
        id="score-badge-hero"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 ${colorClass}`}
      >
        <div className="flex items-center gap-1.5 font-black text-2xl tracking-tight stat-number">
          {showStar && <Star className="w-6 h-6 fill-current text-black" />}
          <span>{formattedScore}</span>
          <span className="text-xs font-bold opacity-75">/10</span>
        </div>
        <div className="border-l-2 border-black/20 pl-3">
          <div className="text-xs font-black uppercase tracking-wider">{label || getScoreText(score)}</div>
          <div className="text-[11px] font-bold text-black/70">Nota Técnica</div>
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div 
        id="score-badge-lg"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 ${colorClass} font-black text-base stat-number`}
      >
        {showStar && <Star className="w-4 h-4 fill-current text-black" />}
        <span>{formattedScore}</span>
        <span className="text-xs opacity-75">/10</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span 
        id="score-badge-sm"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 ${colorClass} font-black text-xs stat-number`}
      >
        {showStar && <Star className="w-3 h-3 fill-current text-black" />}
        <span>{formattedScore}</span>
      </span>
    );
  }

  return (
    <span 
      id="score-badge-md"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 ${colorClass} font-black text-xs stat-number`}
    >
      {showStar && <Star className="w-3.5 h-3.5 fill-current text-black" />}
      <span>{formattedScore}</span>
      <span className="text-[10px] opacity-75">/10</span>
    </span>
  );
};

