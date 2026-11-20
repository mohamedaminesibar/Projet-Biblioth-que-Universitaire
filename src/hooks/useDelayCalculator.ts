import { DelaySeverity } from '../types/library';

export interface DelayCalculationResult {
  daysOverdue: number;
  severity: DelaySeverity;
  label: string;
}

/**
 * Calculates days overdue and severity based on EST business rules:
 * - 0 or negative days: 'none' (Dans les délais)
 * - 1 to 3 days: 'yellow' (Retard léger)
 * - 4 to 7 days: 'orange' (Retard moyen)
 * - 8+ days: 'red' (Retard critique / suspension)
 */
export function calculateDelaySeverity(
  dueDateStr: string,
  currentDateStr: string = '2026-10-16'
): DelayCalculationResult {
  const due = new Date(dueDateStr).getTime();
  const current = new Date(currentDateStr).getTime();
  const diffDays = Math.floor((current - due) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      daysOverdue: 0,
      severity: 'none',
      label: 'Dans les délais',
    };
  }

  if (diffDays >= 1 && diffDays <= 3) {
    return {
      daysOverdue: diffDays,
      severity: 'yellow',
      label: `Retard léger (+${diffDays}j)`,
    };
  }

  if (diffDays >= 4 && diffDays <= 7) {
    return {
      daysOverdue: diffDays,
      severity: 'orange',
      label: `Retard intermédiaire (+${diffDays}j)`,
    };
  }

  return {
    daysOverdue: diffDays,
    severity: 'red',
    label: `Alerte critique (+${diffDays}j)`,
  };
}
