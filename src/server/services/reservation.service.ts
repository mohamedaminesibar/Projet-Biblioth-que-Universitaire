import { db } from '../db/database';
import { Reservation } from '../../types/library';
import { AuthUser } from '../types';

export class ReservationService {
  /**
   * Get reservations list filtered by user role
   */
  async getReservations(user: AuthUser, bookId?: string): Promise<Reservation[]> {
    let result = Array.from(db.reservations.values());

    if (bookId) {
      result = result.filter((r) => r.bookId === bookId);
    }

    // Role privacy: students only see their own reservations
    if (user.role === 'student') {
      result = result.filter((r) => r.studentId === user.id);
    }

    result.sort((a, b) => a.position - b.position);
    return result;
  }

  /**
   * Transactional creation of a FIFO reservation
   */
  async createReservation(user: AuthUser, bookId: string): Promise<Reservation> {
    if (user.role !== 'student') {
      const err: any = new Error('Seuls les étudiants peuvent s’inscrire en file d’attente de réservation.');
      err.statusCode = 403;
      err.code = 'STUDENT_ONLY_ACTION';
      throw err;
    }

    return await db.withTransaction(async () => {
      const book = db.books.get(bookId);
      if (!book) {
        const err: any = new Error('Ouvrage introuvable.');
        err.statusCode = 404;
        err.code = 'BOOK_NOT_FOUND';
        throw err;
      }

      // Check if book has available copies (BR-RES-01)
      if (book.availableCopies > 0) {
        const err: any = new Error('Des exemplaires sont actuellement disponibles en rayon. Veuillez vous présenter directement à la bibliothèque.');
        err.statusCode = 400;
        err.code = 'COPIES_AVAILABLE_IN_SHELF';
        throw err;
      }

      // Check student quota of active reservations (Max 2)
      const studentReservations = Array.from(db.reservations.values()).filter(
        (r) => r.studentId === user.id && (r.status === 'waiting' || r.status === 'ready_for_pickup')
      );
      if (studentReservations.length >= 2) {
        const err: any = new Error('Quota de réservations atteint : vous ne pouvez pas avoir plus de 2 réservations simultanées.');
        err.statusCode = 400;
        err.code = 'RESERVATIONS_QUOTA_EXCEEDED';
        throw err;
      }

      // Check if student already has a reservation for this book
      const alreadyReserved = studentReservations.some((r) => r.bookId === bookId);
      if (alreadyReserved) {
        const err: any = new Error('Vous êtes déjà inscrit dans la file d’attente pour cet ouvrage.');
        err.statusCode = 400;
        err.code = 'ALREADY_RESERVED';
        throw err;
      }

      // Check if student currently loans this book
      const studentActiveLoans = Array.from(db.loans.values()).filter(
        (l) => l.studentId === user.id && l.bookId === bookId && l.status === 'active'
      );
      if (studentActiveLoans.length > 0) {
        const err: any = new Error('Vous avez déjà un exemplaire de cet ouvrage en cours d’emprunt.');
        err.statusCode = 400;
        err.code = 'ALREADY_LOANED_BY_STUDENT';
        throw err;
      }

      // Compute FIFO queue position
      const currentQueueLength = Array.from(db.reservations.values()).filter(
        (r) => r.bookId === bookId && r.status === 'waiting'
      ).length;

      const newReservation: Reservation = {
        id: `res_${Date.now()}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverUrl,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        position: currentQueueLength + 1,
        requestDate: 'Aujourd’hui à l’instant',
        status: 'waiting',
        pickupDeadline: 'Dès restitution (fenêtre de 48h)',
      };

      db.reservations.set(newReservation.id, newReservation);
      return newReservation;
    });
  }

  /**
   * Cancel reservation and shift FIFO ranks
   */
  async cancelReservation(user: AuthUser, reservationId: string): Promise<boolean> {
    return await db.withTransaction(async () => {
      const res = db.reservations.get(reservationId);
      if (!res) {
        const err: any = new Error('Réservation introuvable.');
        err.statusCode = 404;
        err.code = 'RESERVATION_NOT_FOUND';
        throw err;
      }

      // Ensure ownership or librarian rights
      if (user.role !== 'librarian' && res.studentId !== user.id) {
        const err: any = new Error('Vous ne pouvez annuler que vos propres réservations.');
        err.statusCode = 403;
        err.code = 'UNAUTHORIZED_RESERVATION_CANCEL';
        throw err;
      }

      // Remove reservation
      db.reservations.delete(reservationId);

      // Re-rank remaining reservations in queue for this book
      const remainingForBook = Array.from(db.reservations.values())
        .filter((r) => r.bookId === res.bookId && r.status === 'waiting')
        .sort((a, b) => a.position - b.position);

      remainingForBook.forEach((item, index) => {
        item.position = index + 1;
        db.reservations.set(item.id, item);
      });

      return true;
    });
  }
}

export const reservationService = new ReservationService();
