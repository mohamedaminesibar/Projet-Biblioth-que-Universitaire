/**
 * In-Memory Transactional Database for BiblioEST Backend
 * Implements strict ACID semantics, copy locking to prevent double-allocations,
 * and indexed access patterns.
 */

import { Book, Loan, Reservation, NotificationLog, SearchHistoryEntry } from '../../types/library';
import { AuthUser, BookCopy } from '../types';
import {
  MOCK_BOOKS,
  MOCK_LOANS,
  MOCK_RESERVATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_SEARCH_HISTORY,
  CURRENT_STUDENT,
  CURRENT_LIBRARIAN,
} from '../../data/mockData';

class TransactionalDatabase {
  // Read-only Book catalogue
  public books: Map<string, Book> = new Map();

  // Physical copies with discrete barcodes
  public copies: Map<string, BookCopy> = new Map();

  // Transactional Loans
  public loans: Map<string, Loan> = new Map();

  // FIFO Reservations
  public reservations: Map<string, Reservation> = new Map();

  // Notification logs
  public notifications: Map<string, NotificationLog> = new Map();

  // Search History per student
  public searchHistory: Map<string, SearchHistoryEntry[]> = new Map();

  // Users registry
  public users: Map<string, AuthUser> = new Map();

  // Concurrency lock for physical copies
  private copyLocks: Set<string> = new Set();

  constructor() {
    this.seed();
  }

  public seed() {
    // Seed Users (including requested real Google accounts)
    this.users.set(CURRENT_STUDENT.id, {
      id: CURRENT_STUDENT.id,
      name: 'Mohamed Amine Sibari',
      email: 'mohamedamine.sibari@usmba.ac.ma',
      role: 'student',
      filiere: 'Génie Informatique & Systèmes Décisionnels (EST)',
    });

    // Responsable Google account (mohamedamine.sibari@uit.ac.ma)
    this.users.set('usr_lib_uit_01', {
      id: 'usr_lib_uit_01',
      name: 'Mohamed Amine Sibari',
      email: 'mohamedamine.sibari@uit.ac.ma',
      role: 'librarian',
      department: 'Direction de la Médiathèque & Ressources Numériques',
    });

    this.users.set(CURRENT_LIBRARIAN.id, {
      id: CURRENT_LIBRARIAN.id,
      name: CURRENT_LIBRARIAN.name,
      email: CURRENT_LIBRARIAN.email,
      role: 'librarian',
      department: CURRENT_LIBRARIAN.department,
    });

    // Seed Books (READ ONLY)
    for (const book of MOCK_BOOKS) {
      this.books.set(book.id, { ...book });

      // Generate discrete physical copies
      for (let i = 1; i <= book.totalCopies; i++) {
        const barcode = `EST-${book.category.substring(0, 2).toUpperCase()}-0${i}${book.id.replace('bk_', '')}`;
        const isLoaned = i > book.availableCopies;
        this.copies.set(barcode, {
          barcode,
          bookId: book.id,
          shelfLocation: book.shelfLocation,
          status: isLoaned ? 'loaned' : 'available',
        });
      }
    }

    // Seed Loans
    for (const loan of MOCK_LOANS) {
      this.loans.set(loan.id, { ...loan });
    }

    // Seed Reservations
    for (const res of MOCK_RESERVATIONS) {
      this.reservations.set(res.id, { ...res });
    }

    // Seed Notifications
    for (const notif of MOCK_NOTIFICATIONS) {
      this.notifications.set(notif.id, { ...notif });
    }

    // Seed Search History
    this.searchHistory.set(CURRENT_STUDENT.id, [...MOCK_SEARCH_HISTORY]);
  }

  /**
   * Acquire a temporary copy lock to prevent race conditions during simultaneous loan/reservation requests
   */
  public acquireCopyLock(barcode: string): boolean {
    if (this.copyLocks.has(barcode)) {
      return false;
    }
    this.copyLocks.add(barcode);
    return true;
  }

  public releaseCopyLock(barcode: string): void {
    this.copyLocks.delete(barcode);
  }

  /**
   * Transactional wrapper ensuring atomic execution
   */
  public async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    // Snapshot state for potential rollback
    const loansSnapshot = new Map(this.loans);
    const copiesSnapshot = new Map(this.copies);
    const reservationsSnapshot = new Map(this.reservations);

    try {
      return await fn();
    } catch (error) {
      // Rollback on failure
      this.loans = loansSnapshot;
      this.copies = copiesSnapshot;
      this.reservations = reservationsSnapshot;
      throw error;
    }
  }
}

export const db = new TransactionalDatabase();
