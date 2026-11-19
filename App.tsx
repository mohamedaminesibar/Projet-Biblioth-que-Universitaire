import React, { useState, useEffect, useRef } from 'react';
import { Book, Loan, NotificationLog, SearchHistoryEntry, UserProfile } from './types/library';
import { MOCK_BOOKS, MOCK_LOANS, CURRENT_LIBRARIAN } from './data/mockData';
import { libraryApi } from './services/api';
import { AppLayout } from './layouts/AppLayout';
import { AuthScreen } from './components/AuthScreen';
import { BookCatalog, SortOption } from './components/StudentSpace/BookCatalog';
import { BookDetailView } from './components/StudentSpace/BookDetailView';
import { LibrarianDashboard } from './components/LibrarianSpace/LibrarianDashboard';
import { NotificationHistoryView } from './components/LibrarianSpace/NotificationHistoryView';
import { NotificationModal } from './components/LibrarianSpace/NotificationModal';

export default function App() {
  // Authenticated user state: loaded from localStorage or null (requires login on entry)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('est_biblio_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation tab state
  const [studentNavTab, setStudentNavTab] = useState<'catalog'>('catalog');
  const [librarianNavTab, setLibrarianNavTab] = useState<'dashboard' | 'notifications_history'>('dashboard');

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Catalog & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les disciplines');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

  // Active book detail state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Domain Data State
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Active notification modal state
  const [modalLoan, setModalLoan] = useState<Loan | null>(null);

  // Toast confirmation feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Synchronize API authentication context whenever user changes
  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      setIsLoading(true);
      libraryApi.setAuthContext(currentUser!.id, currentUser!.role);

      try {
        const [loadedBooks, loadedLoans, loadedNotifications, loadedHistory] = await Promise.all([
          libraryApi.getBooks(),
          libraryApi.getLoans(),
          libraryApi.getNotifications(),
          libraryApi.getSearchHistory(),
        ]);
        setBooks(loadedBooks);
        setLoans(loadedLoans);
        setNotifications(loadedNotifications);
        setSearchHistory(loadedHistory);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Authentication handler: sets user and routes automatically by role
  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('est_biblio_user', JSON.stringify(user));
    } catch {}

    if (user.role === 'student') {
      setStudentNavTab('catalog');
      setSelectedBook(null);
    } else {
      setLibrarianNavTab('dashboard');
    }
    showToast(`Connexion réussie. Bienvenue sur votre espace, ${user.name}.`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedBook(null);
    try {
      localStorage.removeItem('est_biblio_user');
    } catch {}
    showToast('Vous avez été déconnecté avec succès.');
  };

  // Search query change handler
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      const matchCount = books.filter((b) => b.title.toLowerCase().includes(query.toLowerCase())).length;
      await libraryApi.addSearchQuery(query.trim(), selectedCategory, matchCount);
      const updatedHistory = await libraryApi.getSearchHistory();
      setSearchHistory(updatedHistory);
    }
  };

  const handleSelectHistory = (query: string) => {
    setSearchQuery(query);
    setSelectedBook(null);
  };

  const handleClearHistory = async () => {
    await libraryApi.clearSearchHistory();
    setSearchHistory([]);
  };

  const handleRemoveHistoryEntry = async (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Book selection
  const handleSelectBook = (book: Book) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedBook(book);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToResults = () => {
    setSelectedBook(null);
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    }, 50);
  };

  // Librarian action: Return loan
  const handleReturnLoan = async (loanId: string) => {
    const res = await libraryApi.returnLoan(loanId);
    if (res.success && res.loan) {
      setLoans((prev) => prev.map((l) => (l.id === loanId ? res.loan! : l)));
      const updatedBooks = await libraryApi.getBooks();
      setBooks(updatedBooks);
      showToast('Restitution de l’ouvrage validée avec succès.');
    }
  };

  // Librarian action: Send notification
  const handleSendNotification = async (loan: Loan, customMessage: string) => {
    const newNotif = await libraryApi.sendNotification({
      loanId: loan.id,
      recipientEmail: loan.studentEmail,
      recipientName: loan.studentName,
      bookTitle: loan.bookTitle,
      severity: loan.severity,
      subject:
        loan.severity === 'red'
          ? `URGENT - Retard critique et suspension : ${loan.bookTitle}`
          : loan.severity === 'orange'
          ? `Deuxième avertissement : ${loan.bookTitle}`
          : `Rappel amical : ${loan.bookTitle}`,
      message: customMessage,
      channel: 'both',
    });
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Notification transmise à l’étudiant ${loan.studentName}.`);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // If user is not authenticated, display the mandatory central login screen
  if (!currentUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const activeNavTab = currentUser.role === 'student' ? studentNavTab : librarianNavTab;

  const handleNavChange = (tab: string) => {
    if (currentUser.role === 'student') {
      setStudentNavTab('catalog');
      setSelectedBook(null);
    } else {
      setLibrarianNavTab(tab as 'dashboard' | 'notifications_history');
    }
  };

  return (
    <AppLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkNotificationsRead={handleMarkNotificationsRead}
      activeNavTab={activeNavTab}
      onNavChange={handleNavChange}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E3A5F] text-white px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. ESPACE ÉTUDIANT (Consultation pure du catalogue et détails d'ouvrages, sans réservation ni 'mes emprunts') */}
      {currentUser.role === 'student' && (
        <div>
          {selectedBook ? (
            <BookDetailView
              book={selectedBook}
              allBooks={books}
              onBackToResults={handleBackToResults}
              onSelectSimilarBook={handleSelectBook}
            />
          ) : (
            <BookCatalog
              books={books}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onlyAvailable={onlyAvailable}
              onOnlyAvailableChange={setOnlyAvailable}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchHistory={searchHistory}
              onSelectHistory={handleSelectHistory}
              onRemoveHistoryEntry={handleRemoveHistoryEntry}
              onClearHistory={handleClearHistory}
              onSelectBook={handleSelectBook}
            />
          )}
        </div>
      )}

      {/* 2. ESPACE RESPONSABLE (Supervision des prêts/retards & Journal des notifications, sans file d'attente) */}
      {currentUser.role === 'librarian' && (
        <div>
          {librarianNavTab === 'dashboard' && (
            <LibrarianDashboard
              loans={loans}
              books={books}
              onReturnLoan={handleReturnLoan}
              onOpenNotificationModal={(loan) => setModalLoan(loan)}
            />
          )}

          {librarianNavTab === 'notifications_history' && (
            <NotificationHistoryView notifications={notifications} />
          )}
        </div>
      )}

      {/* Modal Notification Dispatcher */}
      {modalLoan && (
        <NotificationModal
          loan={modalLoan}
          onClose={() => setModalLoan(null)}
          onSend={handleSendNotification}
        />
      )}
    </AppLayout>
  );
}
