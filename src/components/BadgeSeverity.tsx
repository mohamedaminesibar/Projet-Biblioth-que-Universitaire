import React from 'react';
import { DelaySeverity } from '../types/library';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface BadgeSeverityProps {
  severity: DelaySeverity;
  days: number;
  size?: 'sm' | 'md';
  showDetailText?: boolean;
}

export const BadgeSeverity: React.FC<BadgeSeverityProps> = ({
  severity,
  days,
  size = 'md',
  showDetailText = false,
}) => {
  const isSm = size === 'sm';

  if (severity === 'none' || days <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${
          isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600`} />
        <span>À l'heure</span>
        {showDetailText && <span className="text-emerald-600 text-[11px] font-normal hidden sm:inline">· Restitution conforme</span>}
      </span>
    );
  }

  if (severity === 'yellow') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-300 ${
          isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <Clock className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-600`} />
        <span>Retard léger (+{days}j)</span>
        {showDetailText && <span className="text-amber-700 text-[11px] font-normal hidden sm:inline">· 1 à 3 jours</span>}
      </span>
    );
  }

  if (severity === 'orange') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-50 text-orange-950 border border-orange-300 ${
          isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <AlertTriangle className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-orange-600`} />
        <span>Retard modéré (+{days}j)</span>
        {showDetailText && <span className="text-orange-700 text-[11px] font-normal hidden sm:inline">· 4 à 7 jours</span>}
      </span>
    );
  }

  // Critical delay
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-50 text-red-900 border border-red-300 ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <AlertCircle className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-red-600`} />
      <span>Retard critique (+{days}j)</span>
      {showDetailText && <span className="text-red-700 text-[11px] font-normal hidden sm:inline">· 8 jours et plus</span>}
    </span>
  );
};
