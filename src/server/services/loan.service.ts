import { db } from '../db/database';
import { Loan, DelaySeverity } from '../../types/library';
import { AuthUser } from '../types';

export class LoanService {
  /**
   * Calculate overdue days and severity classification according to EST rules
   */
  public calculateDelay(dueDateStr: string, referenceDateStr: string = '2026-10-16'): { daysOverdue: number; severity: DelaySeverity } {
    const due = new Date(dueDateStr).getTime();
    const ref = new Date(referenceDateStr).getTime();
    const diffDays = Math.floor((ref - due) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { daysOverdue: 0, severity: 'none' };
    }
    if (diffDays <= 3) {
      return { daysOverdue: diffDays, severity: 'yellow' };
    }
    if (diffDays <= 7) {
      return { daysOverdue: diffDays, severity: 'orange' };
    }
    return { daysOverdue: diffDays, severity: 'red' };
  }

  /**
   * Get loans filtered according to role & privacy
   */
  async getLoans(user: AuthUser, severityFilter?: DelaySeverity): Promise<Loan[]> {
    let allLoans = Array.from(db.loans.values());

    // Update delays dynamically
    allLoans = allLoans.map((loan) => {
      if (loan.status === 'active') {
        const { daysOverdue, severity } = this.calculateDelay(loan.dueDate);
        return { ...loan, daysOverdue, severity };
      }
      return loan;
    });

    // Role-based visibility: students can ONLY view their own loans
    if (user.role === 'student') {
      allLoans = allLoans.filter((l) => l.studentId === user.id);
    }

    if (severityFilter && severityFilter !== 'none') {
      allLoans = allLoans.filter((l) => l.severity === severityFilter);
    }

    return allLoans;
  }

  /**
   * Transactional return of physical copy
   */
  async returnLoan(loanId: string, librarianUser: AuthUser): Promise<{ loan: Loan; nextReservationAllocated?: boolean }> {
    if (librarianUser.role !== 'librarian') {
      const err: any = new Error('Seul un responsable de bibliothèque peut valider la restitution d’un ouvrage.');
      err.statusCode = 403;
      err.code = 'UNAUTHORIZED_RETURN_ACTION';
      throw err;
    }

    return await db.withTransaction(async () => {
      const loan = db.loans.get(loanId);
      if (!loan) {
        const err: any = new Error('Emprunt non trouvé.');
        err.statusCode = 404;
        err.code = 'LOAN_NOT_FOUND';
        throw err;
      }

      if (loan.status === 'returned') {
        const err: any = new Error('Cet emprunt a déjà été clôturé.');
        err.statusCode = 400;
        err.code = 'LOAN_ALREADY_RETURNED';
        throw err;
      }

      // Close the loan
      const closedLoan: Loan = {
        ...loan,
        status: 'returned',
        returnDate: new Date().toISOString().split('T')[0],
        daysOverdue: 0,
        severity: 'none',
      };
      db.loans.set(loanId, closedLoan);

      // Free copy or assign to FIFO reservation
      const copy = db.copies.get(loan.copyBarcode);
      const book = db.books.get(loan.bookId);

      // Check if there is an active reservation waiting for this book
      const pendingReservations = Array.from(db.reservations.values())
        .filter((r) => r.bookId === loan.bookId && r.status === 'waiting')
        .sort((a, b) => a.position - b.position);

      let nextReservationAllocated = false;

      if (pendingReservations.length > 0) {
        const nextInLine = pendingReservations[0];
        // Allocate copy for pickup
        if (copy) {
          copy.status = 'reserved_pickup';
          copy.reservedForStudentId = nextInLine.studentId;
          copy.pickupDeadline = 'Sous 48h ouvrées';
          db.copies.set(copy.barcode, copy);
        }

        // Update reservation status
        nextInLine.status = 'ready_for_pickup';
        nextInLine.pickupDeadline = 'Sous 48h ouvrées';
        db.reservations.set(nextInLine.id, nextInLine);
        nextReservationAllocated = true;
      } else {
        // Free copy for shelf loan
        if (copy) {
          copy.status = 'available';
          copy.currentLoanId = undefined;
          db.copies.set(copy.barcode, copy);
        }
        if (book) {
          book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
          db.books.set(book.id, book);
        }
      }

      return { loan: closedLoan, nextReservationAllocated };
    });
  }

  /**
   * Transactional borrowing of a physical copy
   */
  async borrowCopy(studentId: string, copyBarcode: string): Promise<Loan> {
    return await db.withTransaction(async () => {
      // 1. Check student quota (max 3 loans)
      const studentActiveLoans = Array.from(db.loans.values()).filter(
        (l) => l.studentId === studentId && l.status === 'active'
      );
      if (studentActiveLoans.length >= 3) {
        const err: any = new Error('Quota maximal atteint : vous ne pouvez pas emprunter plus de 3 ouvrages simultanément.');
        err.statusCode = 400;
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }

      // 2. Check no active overdue loans
      const hasLateLoans = studentActiveLoans.some((l) => {
        const { daysOverdue } = this.calculateDelay(l.dueDate);
        return daysOverdue > 0;
      });
      if (hasLateLoans) {
        const err: any = new Error('Emprunt impossible : vous avez au moins un ouvrage en retard non régularisé.');
        err.statusCode = 403;
        err.code = 'ACCOUNT_RESTRICTED_LATE_LOAN';
        throw err;
      }

      // 3. Acquire copy lock and verify copy availability
      const lockAcquired = db.acquireCopyLock(copyBarcode);
      if (!lockAcquired) {
        const err: any = new Error('L’exemplaire demandé fait l’objet d’une transaction concurrente en cours. Veuillez réessayer.');
        err.statusCode = 409;
        err.code = 'COPY_LOCKED_CONCURRENT_TRANSACTION';
        throw err;
      }

      try {
        const copy = db.copies.get(copyBarcode);
        if (!copy || copy.status !== 'available') {
          const err: any = new Error('Cet exemplaire n’est pas disponible pour l’emprunt.');
          err.statusCode = 400;
          err.code = 'COPY_NOT_AVAILABLE';
          throw err;
        }

        const book = db.books.get(copy.bookId);
        if (!book) {
          const err: any = new Error('Ouvrage introuvable.');
          err.statusCode = 404;
          err.code = 'BOOK_NOT_FOUND';
          throw err;
        }

        const student = db.users.get(studentId);
        if (!student) {
          const err: any = new Error('Étudiant introuvable.');
          err.statusCode = 404;
          err.code = 'STUDENT_NOT_FOUND';
          throw err;
        }

        // Create loan
        const loanDate = '2026-10-16';
        const dueDate = '2026-10-30'; // +14 days

        const newLoan: Loan = {
          id: `ln_${Date.now()}`,
          bookId: book.id,
          bookTitle: book.title,
          bookCover: book.coverUrl,
          copyBarcode: copy.barcode,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          studentFiliere: student.filiere || 'Étudiant EST',
          loanDate,
          dueDate,
          status: 'active',
          daysOverdue: 0,
          severity: 'none',
        };

        // Update state
        db.loans.set(newLoan.id, newLoan);
        copy.status = 'loaned';
        copy.currentLoanId = newLoan.id;
        db.copies.set(copy.barcode, copy);

        book.availableCopies = Math.max(0, book.availableCopies - 1);
        db.books.set(book.id, book);

        // Notify Librarian: "Nouvel emprunt enregistré"
        const librarianNotifId = `notif_lib_${Date.now()}`;
        db.notifications.set(librarianNotifId, {
          id: librarianNotifId,
          loanId: newLoan.id,
          recipientEmail: 'k.idrissi@est.usmba.ac.ma',
          recipientName: 'Direction de la Médiathèque',
          bookTitle: book.title,
          severity: 'none',
          subject: `Nouvel emprunt enregistré : ${book.title}`,
          message: `L’étudiant ${student.name} (${student.filiere || 'EST'}) a emprunté l’exemplaire ${copy.barcode} du livre « ${book.title} ». Date limite de remise convenue : ${dueDate}.`,
          sentAt: 'À l’instant',
          channel: 'both',
          read: false,
        });

        return newLoan;
      } finally {
        db.releaseCopyLock(copyBarcode);
      }
    });
  }
}

export const loanService = new LoanService();
