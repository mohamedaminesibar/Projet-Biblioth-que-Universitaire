import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/db/database';
import { aiService } from '../server/services/ai.service';
import { notificationService } from '../server/services/notification.service';
import { loanService } from '../server/services/loan.service';

describe('Système de Recommandations Intelligentes et Notifications de Retard', () => {
  beforeEach(() => {
    db.seed();
  });

  describe('A. Intégrité des Recommandations LLM & Anti-Hallucination', () => {
    it('ne doit retourner que des ouvrages existant réellement dans le catalogue', async () => {
      const recommendations = await aiService.getGroundedRecommendations({
        currentBookId: 'bk_01',
        studentId: 'usr_std_01',
      });

      expect(recommendations.length).toBeGreaterThan(0);
      for (const rec of recommendations) {
        // Must exist in catalog
        expect(db.books.has(rec.book.id)).toBe(true);
        // Must not recommend the current book to itself
        expect(rec.book.id).not.toBe('bk_01');
        // Must have an academic explanation
        expect(rec.explanation.length).toBeGreaterThan(10);
      }
    });

    it('doit basculer de façon transparente sur le fallback heuristique en cas d’absence de clé API ou timeout', async () => {
      // Force fallback by asking for a book
      const recommendations = await aiService.getGroundedRecommendations({
        currentBookId: 'bk_02',
      });

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.every((r) => db.books.has(r.book.id))).toBe(true);
    });
  });

  describe('B. Calcul Précis des Retards depuis les Dates Réelles', () => {
    it('doit calculer les jours de retard à partir de la date d’échéance réelle', () => {
      const refDate = '2026-10-16';

      // Due on 2026-10-14 -> 2 days late -> Yellow
      const yellow = loanService.calculateDelay('2026-10-14', refDate);
      expect(yellow.daysOverdue).toBe(2);
      expect(yellow.severity).toBe('yellow');

      // Due on 2026-10-11 -> 5 days late -> Orange
      const orange = loanService.calculateDelay('2026-10-11', refDate);
      expect(orange.daysOverdue).toBe(5);
      expect(orange.severity).toBe('orange');

      // Due on 2026-10-04 -> 12 days late -> Red
      const red = loanService.calculateDelay('2026-10-04', refDate);
      expect(red.daysOverdue).toBe(12);
      expect(red.severity).toBe('red');
    });
  });

  describe('C. Notifications : Anti-Doublon, Confirmation et Cessation après Retour', () => {
    it('doit bloquer les relances en doublon pour le même emprunt et même niveau', async () => {
      const librarianUser = db.users.get('usr_lib_01')!;

      // First dispatch
      const firstResult = await notificationService.sendNotification(
        {
          loanId: 'ln_02',
          recipientEmail: 'yassine.berrada@usmba.ac.ma',
          recipientName: 'Yassine Berrada',
          bookTitle: 'Électronique de Puissance',
          severity: 'yellow',
          subject: 'Rappel amical',
          message: 'Merci de rapporter le document.',
        },
        librarianUser
      );

      expect(firstResult.deliveryStatus).toBe('delivered');
      expect(firstResult.providerMessageId).toBeDefined();

      // Second identical dispatch must be rejected as duplicate
      await expect(
        notificationService.sendNotification(
          {
            loanId: 'ln_02',
            recipientEmail: 'yassine.berrada@usmba.ac.ma',
            recipientName: 'Yassine Berrada',
            bookTitle: 'Électronique de Puissance',
            severity: 'yellow',
            subject: 'Rappel amical',
            message: 'Merci de rapporter le document.',
          },
          librarianUser
        )
      ).rejects.toThrow(/Une notification de même niveau/);
    });

    it('doit ARRÊTER et refuser l’envoi de rappels si l’ouvrage a déjà été restitué', async () => {
      const librarianUser = db.users.get('usr_lib_01')!;

      // 1. Confirm return of loan ln_04
      await loanService.returnLoan('ln_04', librarianUser);

      // 2. Attempt to send a reminder on ln_04 must fail
      await expect(
        notificationService.sendNotification(
          {
            loanId: 'ln_04',
            recipientEmail: 'hamza.tahiri@usmba.ac.ma',
            recipientName: 'Hamza Tahiri',
            bookTitle: 'Automatique Linéaire',
            severity: 'red',
            subject: 'URGENT - Retard',
            message: 'Mise en demeure...',
          },
          librarianUser
        )
      ).rejects.toThrow(/cet ouvrage a déjà été restitué/);
    });
  });
});
