export type Role = 'student' | 'librarian';

export type DelaySeverity = 'none' | 'yellow' | 'orange' | 'red';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  filiere?: string;
  studentNumber?: string;
  department?: string;
  avatarUrl: string;
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  isbn: string;
  category: 'Informatique' | 'Génie Électrique' | 'Génie Mécanique' | 'Gestion & Économie' | 'Sciences Appliquées';
  year: number;
  publisher: string;
  shelfLocation: string; // Ex: Rayon B - Étagère 3
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  summary: string;
  tags: string[];
  tableOfContents: string[];
  similarBookIds: string[];
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  copyBarcode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentFiliere: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  returnDate?: string;
  status: 'active' | 'returned';
  daysOverdue: number; // 0 if not overdue
  severity: DelaySeverity;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  position: number;
  requestDate: string;
  status: 'waiting' | 'ready_for_pickup' | 'cancelled' | 'fulfilled';
  pickupDeadline?: string; // Ex: 48h limit
}

export interface NotificationLog {
  id: string;
  loanId?: string;
  recipientEmail: string;
  recipientName: string;
  bookTitle: string;
  severity: DelaySeverity;
  subject: string;
  message: string;
  sentAt: string;
  channel: 'in_app' | 'email' | 'both';
  read: boolean;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  filterCategory?: string;
  timestamp: string;
  resultsCount: number;
}
