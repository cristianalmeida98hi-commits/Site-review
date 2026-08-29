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
  const getScoreStyle = (val: number) => {
    if (val >= 8.5) return {
      bg: 'bg-[#FF6B00] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      starFill: 'fill-black text-black',
      text: 'Excelente'
    };
    if (val >= 7.5) return {
      bg: 'bg-[#FF944D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      starFill: 'fill-black text-black',
      text: 'Muito Bom'
    };
    if (val >= 6.0) return {
      bg: 'bg-[#FEF08A] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      starFill: 'fill-black text-black',
      text: 'Regular'
    };
    return {
      bg: 'bg-[#FDA4AF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      starFill: 'fill-black text-black',
      text: 'Fraco'
    };
  };

  const style = getScoreStyle(score);
  const formattedScore = Number(score || 0).toFixed(1).replace('.', ',');

  if (size === 'hero') {
    return (
      <div 
        id="score-badge-hero"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${style.bg}`}
      >
        <div className="flex items-center gap-1.5 font-black text-2xl tracking-tight">
          {showStar && <Star className={`w-6 h-6 ${style.starFill}`} />}
          <span className="text-black font-mono font-black">{formattedScore}</span>
          <span className="text-xs text-black/70 font-bold">/10</span>
        </div>
        <div className="border-l-2 border-black pl-3">
          <div className="text-xs font-black uppercase tracking-wider text-black">
            {label || style.text}
          </div>
          <div className="text-[11px] font-bold text-black/80">Score Técnico</div>
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div 
        id="score-badge-lg"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${style.bg} font-black text-base`}
      >
        {showStar && <Star className={`w-4 h-4 ${style.starFill}`} />}
        <span className="font-mono text-black font-black">{formattedScore}</span>
        <span className="text-xs text-black/70 font-bold">/10</span>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span 
        id="score-badge-sm"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${style.bg} text-xs font-black`}
      >
        {showStar && <Star className={`w-3 h-3 ${style.starFill}`} />}
        <span className="font-mono text-black font-black">{formattedScore}</span>
      </span>
    );
  }

  return (
    <span 
      id="score-badge-md"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${style.bg} text-xs font-black`}
    >
      {showStar && <Star className={`w-3.5 h-3.5 ${style.starFill}`} />}
      <span className="font-mono text-black font-black">{formattedScore}</span>
      <span className="text-[10px] text-black/70 font-bold">/10</span>
    </span>
  );
};
