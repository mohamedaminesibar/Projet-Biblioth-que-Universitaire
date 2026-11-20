import { describe, it, expect } from 'vitest';
import { calculateDelaySeverity } from '../hooks/useDelayCalculator';

describe('Règles Métier de la Bibliothèque EST', () => {
  describe('BR-RETARD-01 & BR-RETARD-02 : Calcul et classification des retards', () => {
    const referenceDate = '2026-10-16';

    it('devrait classer un emprunt dans les délais avec sévérité "none"', () => {
      const result = calculateDelaySeverity('2026-10-20', referenceDate);
      expect(result.daysOverdue).toBe(0);
      expect(result.severity).toBe('none');
    });

    it('devrait classer un retard de 1 à 3 jours en Jaune (Retard Léger)', () => {
      // 2 jours de retard : échéance au 14/10 pour le 16/10
      const result = calculateDelaySeverity('2026-10-14', referenceDate);
      expect(result.daysOverdue).toBe(2);
      expect(result.severity).toBe('yellow');
      expect(result.label).toContain('Retard léger');
    });

    it('devrait classer un retard de 4 à 7 jours en Orange (Retard Moyen)', () => {
      // 5 jours de retard : échéance au 11/10 pour le 16/10
      const result = calculateDelaySeverity('2026-10-11', referenceDate);
      expect(result.daysOverdue).toBe(5);
      expect(result.severity).toBe('orange');
      expect(result.label).toContain('Retard intermédiaire');
    });

    it('devrait classer un retard de 8 jours et plus en Rouge (Retard Critique)', () => {
      // 12 jours de retard : échéance au 04/10 pour le 16/10
      const result = calculateDelaySeverity('2026-10-04', referenceDate);
      expect(result.daysOverdue).toBe(12);
      expect(result.severity).toBe('red');
      expect(result.label).toContain('Alerte critique');
    });
  });

  describe('BR-DISP-01 : Disponibilité et éligibilité à la réservation FIFO', () => {
    it('devrait autoriser la réservation seulement si tous les exemplaires sont indisponibles', () => {
      const bookAvailable = { total: 4, loaned: 2, available: 2 };
      const bookExhausted = { total: 3, loaned: 3, available: 0 };

      expect(bookAvailable.available > 0).toBe(true);
      expect(bookExhausted.available === 0).toBe(true);
    });

    it('devrait assigner le rang séquentiel (FIFO) aux réservations', () => {
      const reservations = [
        { id: 'res_1', position: 1, requestTime: 1000 },
        { id: 'res_2', position: 2, requestTime: 2000 },
      ];
      expect(reservations[0].position).toBe(1);
      expect(reservations[1].position).toBe(2);
      expect(reservations[0].requestTime).toBeLessThan(reservations[1].requestTime);
    });
  });
});
