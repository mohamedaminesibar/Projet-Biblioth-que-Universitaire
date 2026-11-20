import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../server/app';
import { db } from '../server/db/database';
import { loanService } from '../server/services/loan.service';
import { reservationService } from '../server/services/reservation.service';
import { catalogService } from '../server/services/catalog.service';

describe('BiblioEST Backend Services & Rules', () => {
  beforeEach(() => {
    // Reset database to fresh seed state
    db.seed();
  });

  describe('1. Read-Only Catalogue & Disponibilités', () => {
    it('devrait retourner la liste des ouvrages sans autoriser de mutation', async () => {
      const books = await catalogService.searchBooks({});
      expect(books.length).toBeGreaterThan(0);

      // Verify copies breakdown
      const copies = await catalogService.getCopiesForBook('bk_01');
      expect(copies.length).toBe(4);
    });

    it('devrait filtrer les ouvrages disponibles en rayon', async () => {
      const availableOnly = await catalogService.searchBooks({ onlyAvailable: true });
      expect(availableOnly.every((b) => b.availableCopies > 0)).toBe(true);
    });
  });

  describe('2. Protection des données et Autorisation RBAC', () => {
    it('un étudiant ne doit voir que ses propres emprunts', async () => {
      const studentUser = db.users.get('usr_std_01')!;
      const studentLoans = await loanService.getLoans(studentUser);

      expect(studentLoans.every((l) => l.studentId === studentUser.id)).toBe(true);
      expect(studentLoans.length).toBe(1);
    });

    it('le responsable doit avoir accès à l’ensemble des emprunts du fonds', async () => {
      const librarianUser = db.users.get('usr_lib_01')!;
      const allLoans = await loanService.getLoans(librarianUser);

      expect(allLoans.length).toBe(5);
    });

    it('un étudiant ne peut pas valider un retour d’ouvrage physique (403)', async () => {
      const studentUser = db.users.get('usr_std_01')!;
      await expect(loanService.returnLoan('ln_01', studentUser)).rejects.toThrow();
    });
  });

  describe('3. Transaction de Retour et Attribution FIFO (BR-RES-02)', () => {
    it('la restitution par le responsable doit clôturer l’emprunt et servir la file FIFO', async () => {
      const librarianUser = db.users.get('usr_lib_01')!;

      // ln_03 is for book bk_02, which has a waiting reservation (res_01)
      const result = await loanService.returnLoan('ln_03', librarianUser);

      expect(result.loan.status).toBe('returned');
      expect(result.loan.daysOverdue).toBe(0);
      expect(result.nextReservationAllocated).toBe(true);

      // The reservation should now be ready for pickup with 48h deadline
      const res01 = db.reservations.get('res_01')!;
      expect(res01.status).toBe('ready_for_pickup');
      expect(res01.pickupDeadline).toContain('48h');
    });
  });

  describe('4. File d’Attente FIFO & Annulation (BR-RES-01 & BR-RES-03)', () => {
    it('un étudiant ne peut réserver un ouvrage que si aucun exemplaire n’est disponible', async () => {
      const studentUser = db.users.get('usr_std_01')!;
      // bk_01 has 1 available copy -> reservation must be rejected
      await expect(reservationService.createReservation(studentUser, 'bk_01')).rejects.toThrow(
        /Des exemplaires sont actuellement disponibles/
      );
    });

    it('l’annulation d’une réservation doit décaler d’un rang les suivants dans la file', async () => {
      const librarianUser = db.users.get('usr_lib_01')!;

      // Initial state: res_01 is #1, res_02 is #2 for bk_02
      expect(db.reservations.get('res_02')!.position).toBe(2);

      await reservationService.cancelReservation(librarianUser, 'res_01');

      // res_02 should now be at position #1
      expect(db.reservations.get('res_02')!.position).toBe(1);
    });
  });

  describe('5. Règle Anti-Double Allocation Concurrente', () => {
    it('ne doit pas autoriser deux emprunts simultanés sur le même exemplaire', async () => {
      const barcode = 'EST-IN-01bk_01';
      // First lock attempt
      const lock1 = db.acquireCopyLock(barcode);
      expect(lock1).toBe(true);

      // Second simultaneous lock attempt must fail
      const lock2 = db.acquireCopyLock(barcode);
      expect(lock2).toBe(false);

      // Release lock
      db.releaseCopyLock(barcode);
      expect(db.acquireCopyLock(barcode)).toBe(true);
      db.releaseCopyLock(barcode);
    });
  });
});
