import React from 'react';
import { Book, SearchHistoryEntry } from '../../types/library';
import { Search, X, Check, Clock, Sparkles } from 'lucide-react';

export type SortOption = 'relevance' | 'title' | 'year' | 'availability';

interface BookCatalogProps {
  books: Book[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (onlyAvailable: boolean) => void;
  searchHistory?: SearchHistoryEntry[];
  onSelectHistory?: (query: string) => void;
  onClearHistory?: () => void;
  onSelectBook: (book: Book) => void;
  // Backward compatibility props
  sortBy?: any;
  onSortByChange?: any;
  viewMode?: any;
  onViewModeChange?: any;
  onRemoveHistoryEntry?: any;
  onQuickReserve?: any;
  studentIsIdentified?: any;
  onOpenAcademicModal?: any;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  isLoading = false,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onlyAvailable,
  onOnlyAvailableChange,
  searchHistory = [],
  onSelectHistory,
  onClearHistory,
  onSelectBook,
}) => {
  const categories = [
    'Toutes les disciplines',
    'Informatique',
    'Génie Électrique',
    'Génie Mécanique',
    'Gestion & Économie',
    'Sciences Appliquées',
  ];

  // Filtering
  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.authors.some((a) => a.toLowerCase().includes(q)) ||
      (book.tags && book.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesCategory =
      selectedCategory === 'Toutes les disciplines' || book.category === selectedCategory;

    const matchesAvailability = !onlyAvailable || book.availableCopies > 0;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto pt-2 pb-2">
        <span className="text-xs uppercase tracking-widest font-sans text-stone-500 block mb-2 font-medium">
          Médiathèque Universitaire EST Fès · Consultation du Catalogue
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-stone-900 tracking-tight mb-3">
          Fonds Documentaire Universitaire
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-light max-w-xl mx-auto mb-6 leading-relaxed">
          Consultez la disponibilité physique des ouvrages et manuels en rayon. L'emprunt s'effectue directement au guichet de la médiathèque.
        </p>

        {/* Minimalist, Clean Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par titre, auteur, matière (ex: Clean Code, Tanenbaum, Algorithmique)..."
            className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white text-stone-900 placeholder-stone-400 text-sm sm:text-base border border-stone-200/90 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-all"
            aria-label="Rechercher dans le catalogue"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 inset-y-0 my-auto w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search History Tags */}
        {searchHistory && searchHistory.length > 0 && !searchQuery && (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
            <span className="font-light text-stone-400">Recherches récentes :</span>
            {searchHistory.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory && onSelectHistory(item.query)}
                className="px-2.5 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                {item.query}
              </button>
            ))}
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-stone-400 hover:text-stone-600 underline ml-1"
              >
                Effacer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Discipline Filters & Availability Switch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        {/* Category horizontal buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus:outline-none ${
                  isSelected
                    ? 'bg-[#1E3A5F] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80'
                }`}
              >
                {cat === 'Toutes les disciplines' ? 'Tout le catalogue' : cat}
              </button>
            );
          })}
        </div>

        {/* Available only toggle */}
        <button
          onClick={() => onOnlyAvailableChange(!onlyAvailable)}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            onlyAvailable
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200/80'
          }`}
        >
          <span
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
              onlyAvailable ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
            }`}
          >
            {onlyAvailable && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </span>
          <span>Disponibles en rayon</span>
        </button>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          <strong className="text-stone-900 font-semibold">{filteredBooks.length}</strong> ouvrage
          {filteredBooks.length > 1 ? 's' : ''} répertorié{filteredBooks.length > 1 ? 's' : ''}
          {selectedCategory !== 'Toutes les disciplines' && ` en ${selectedCategory}`}
        </span>
        <span className="text-[11px] text-stone-400">Cliquez sur un ouvrage pour consulter sa fiche détaillée</span>
      </div>

      {/* Grid of Books & Articles */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-3/4 rounded-2xl bg-stone-200"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 max-w-lg mx-auto">
          <p className="text-base font-serif font-bold text-stone-900 mb-1">Aucun document trouvé</p>
          <p className="text-xs text-stone-500 mb-6 font-light">
            Aucun livre ou article ne correspond à votre recherche. Modifiez vos termes ou désactivez les filtres.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('Toutes les disciplines');
              onOnlyAvailableChange(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#152B47] transition-colors"
          >
            Réinitialiser le catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-7">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectBook(book)}
                tabIndex={0}
                role="button"
                className="group flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] rounded-2xl p-1 transition-all"
                title={`${book.title} - ${book.authors.join(', ')}`}
              >
                <div>
                  {/* Book Cover with 3D Spine and Minimalist Depth */}
                  <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:-translate-y-1.5 transition-all duration-300 bg-stone-100 border border-stone-200/80">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Left Spine Book Shadow */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none"></div>

                    {/* Gradient Overlay for Text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                    {/* Discrete Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-md text-[10px] font-medium shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span>{book.availableCopies} dispo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600/90 text-white backdrop-blur-md text-[10px] font-medium shadow-xs">
                          <Clock className="w-2.5 h-2.5 text-amber-100" />
                          <span>En prêt</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Category */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[10px] font-medium text-white/90 drop-shadow-sm uppercase tracking-wider line-clamp-1 font-mono">
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#1E3A5F] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 font-light line-clamp-1 mt-1">
                      {book.authors.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 group-hover:text-[#1E3A5F] transition-colors font-medium">
                  <span>Consulter la fiche</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
