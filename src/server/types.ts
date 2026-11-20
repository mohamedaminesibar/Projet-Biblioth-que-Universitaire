import { Role, DelaySeverity, Book, Loan, Reservation, NotificationLog, UserProfile, SearchHistoryEntry } from '../types/library';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  filiere?: string;
  department?: string;
}

export interface BookCopy {
  barcode: string;
  bookId: string;
  shelfLocation: string;
  status: 'available' | 'loaned' | 'reserved_pickup' | 'maintenance';
  currentLoanId?: string;
  reservedForStudentId?: string;
  pickupDeadline?: string;
}

export interface DashboardMetrics {
  totalActiveLoans: number;
  onTimeLoansCount: number;
  yellowDelayCount: number;
  orangeDelayCount: number;
  redDelayCount: number;
  pendingReservationsCount: number;
  expectedReturnsTodayCount: number;
}
