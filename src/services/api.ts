/**
 * API Client Layer for BiblioEST Frontend
 * Communicates with the Express REST API endpoints under /api/*
 * Handles role headers, parsing, and structured error responses.
 */

import { Book, Loan, Reservation, NotificationLog, SearchHistoryEntry, UserProfile } from '../types/library';
import { DashboardMetrics } from '../server/types';

class LibraryApiClient {
  private currentUserId: string = 'usr_std_01';
  private currentUserRole: string = 'student';

  public setAuthContext(userId: string, role: string) {
    this.currentUserId = userId;
    this.currentUserRole = role;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
      'x-user-role': this.currentUserRole,
    };
  }

  // Catalogue
  async getBooks(params?: {
    query?: string;
    category?: string;
    onlyAvailable?: boolean;
    sortBy?: string;
  }): Promise<Book[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.onlyAvailable) searchParams.set('onlyAvailable', 'true');
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);

      const res = await fetch(`/api/books?${searchParams.toString()}`, {
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        // Return dynamic mock books if server endpoint returned non-200
        const { MOCK_BOOKS } = await import('../data/mockData');
        return MOCK_BOOKS;
      }

      const json = await res.json();
      return json.data && json.data.length > 0 ? json.data : (await import('../data/mockData')).MOCK_BOOKS;
    } catch (err) {
      console.warn('[LibraryApiClient] Fetch books fallback to local dataset:', err);
      const { MOCK_BOOKS } = await import('../data/mockData');
      return MOCK_BOOKS;
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    const res = await fetch(`/api/books/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  async getSimilarBooks(id: string): Promise<Book[]> {
    const res = await fetch(`/api/books/${id}/similar`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  // Loans
  async getLoans(severity?: string): Promise<Loan[]> {
    const url = severity ? `/api/loans?severity=${severity}` : '/api/loans';
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch loans: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  }

  async returnLoan(loanId: string): Promise<{ success: boolean; loan: Loan | null }> {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Échec de la validation du retour.');
    }

    const json = await res.json();
    return { success: true, loan: json.data };
  }

  async borrowBook(copyBarcode: string): Promise<Loan> {
    const res = await fetch('/api/loans/borrow', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ copyBarcode }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Échec de l’emprunt.');
    }

    const json = await res.json();
    return json.data;
  }

  // Reservations
  async getReservations(bookId?: string): Promise<Reservation[]> {
    const url = bookId ? `/api/reservations?bookId=${bookId}` : '/api/reservations';
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  async createReservation(params: {
    bookId: string;
    studentId?: string;
    studentName?: string;
    studentEmail?: string;
  }): Promise<Reservation> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bookId: params.bookId }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Impossible de réserver cet ouvrage.');
    }

    const json = await res.json();
    return json.data;
  }

  async cancelReservation(resId: string): Promise<boolean> {
    const res = await fetch(`/api/reservations/${resId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.ok;
  }

  // Dashboard Stats (Librarian only)
  async getDashboardStats(): Promise<DashboardMetrics | null> {
    const res = await fetch('/api/dashboard/stats', {
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  // Notifications
  async getNotifications(): Promise<NotificationLog[]> {
    const res = await fetch('/api/notifications', {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  async sendNotification(notification: {
    loanId?: string;
    recipientEmail: string;
    recipientName: string;
    bookTitle: string;
    severity: string;
    subject: string;
    message: string;
    channel?: string;
  }): Promise<NotificationLog> {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(notification),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Échec de l’envoi de la notification.');
    }

    const json = await res.json();
    return json.data;
  }

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  // Search History
  async getSearchHistory(): Promise<SearchHistoryEntry[]> {
    const res = await fetch('/api/history', {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  async addSearchQuery(query: string, category?: string, count: number = 0): Promise<SearchHistoryEntry> {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, category, resultsCount: count }),
    });
    if (!res.ok) {
      return { id: `sh_${Date.now()}`, query, timestamp: 'À l’instant', resultsCount: count };
    }
    const json = await res.json();
    return json.data;
  }

  async clearSearchHistory(): Promise<void> {
    await fetch('/api/history', {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // AI Services
  async getGroundedRecommendations(currentBookId: string): Promise<Array<{ book: Book; explanation: string; source: string }>> {
    const res = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentBookId }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  async draftAiNotification(loanId: string): Promise<{ subject: string; message: string } | null> {
    const res = await fetch('/api/ai/draft-notification', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ loanId }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  async getStudyPath(bookTitle: string, filiere: string): Promise<{ summary: string; relatedConcepts: string[] }> {
    const res = await fetch('/api/ai/study-path', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bookTitle, filiere }),
    });
    if (!res.ok) {
      return {
        summary: 'Approfondissement académique recommandé pour le cursus de l’EST.',
        relatedConcepts: ['Théorie', 'Pratique', 'Laboratoire'],
      };
    }
    const json = await res.json();
    return json.data;
  }

  // Authentication
  async login(email: string, password: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Identifiants incorrects ou introuvables.');
    }

    return data.user;
  }

  // Google Authentication API
  async loginWithGoogle(email: string, name?: string, avatarUrl?: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, avatarUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Échec de la connexion via le compte Google.');
    }

    return data.user;
  }

  // Access control & Role Management API
  async getUsersList(): Promise<UserProfile[]> {
    const res = await fetch('/api/auth/users', {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  }

  async assignRole(email: string, role: string, name?: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/assign-role', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, role, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Impossible d’attribuer le rôle.');
    }
    return data.user;
  }
}

export const libraryApi = new LibraryApiClient();
