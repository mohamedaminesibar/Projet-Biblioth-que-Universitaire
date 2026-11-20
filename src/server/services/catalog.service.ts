import { db } from '../db/database';
import { Book } from '../../types/library';
import { BookCopy } from '../types';

export class CatalogService {
  /**
   * Search and filter books (READ ONLY)
   */
  async searchBooks(params: {
    query?: string;
    category?: string;
    onlyAvailable?: boolean;
    sortBy?: 'relevance' | 'title' | 'year' | 'availability';
  }): Promise<Book[]> {
    let result = Array.from(db.books.values());

    // Search query
    if (params.query) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q)) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.isbn.includes(q)
      );
    }

    // Category filter
    if (params.category && params.category !== 'Toutes les disciplines') {
      result = result.filter((b) => b.category === params.category);
    }

    // Availability filter
    if (params.onlyAvailable) {
      result = result.filter((b) => b.availableCopies > 0);
    }

    // Sort
    if (params.sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
    } else if (params.sortBy === 'year') {
      result.sort((a, b) => b.year - a.year);
    } else if (params.sortBy === 'availability') {
      result.sort((a, b) => b.availableCopies - a.availableCopies);
    }

    return result;
  }

  async getBookById(id: string): Promise<Book | null> {
    const book = db.books.get(id);
    return book ? { ...book } : null;
  }

  async getCopiesForBook(bookId: string): Promise<BookCopy[]> {
    const copies = Array.from(db.copies.values()).filter((c) => c.bookId === bookId);
    return copies;
  }

  async getSimilarBooks(bookId: string): Promise<Book[]> {
    const book = db.books.get(bookId);
    if (!book) return [];

    return Array.from(db.books.values()).filter((b) => book.similarBookIds.includes(b.id));
  }
}

export const catalogService = new CatalogService();
