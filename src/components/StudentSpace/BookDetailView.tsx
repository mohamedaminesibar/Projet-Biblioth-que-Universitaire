import React, { useState, useEffect } from 'react';
import { Book, UserProfile } from '../../types/library';
import { ArrowLeft, MapPin, Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { libraryApi } from '../../services/api';

interface BookDetailViewProps {
  book: Book;
  allBooks: Book[];
  onBackToResults: () => void;
  onSelectSimilarBook: (book: Book) => void;
  studentProfile?: UserProfile | null;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  allBooks,
  onBackToResults,
  onSelectSimilarBook,
}) => {
  const [groundedRecs, setGroundedRecs] = useState<Array<{ book: Book; explanation: string; source: string }>>([]);

  const isAvailable = book.availableCopies > 0;
  const fallbackSimilar = allBooks.filter((b) => book.similarBookIds.includes(b.id)).slice(0, 4);

  useEffect(() => {
    let isMounted = true;
    libraryApi.getGroundedRecommendations(book.id).then((recs) => {
      if (isMounted && recs.length > 0) {
        setGroundedRecs(recs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [book.id]);

  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top back navigation button */}
      <div>
        <button
          onClick={onBackToResults}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-stone-700 hover:text-[#1E3A5F] hover:bg-stone-50 border border-stone-200 shadow-xs transition-all font-medium text-xs sm:text-sm group focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Revenir au catalogue des ouvrages</span>
        </button>
      </div>

      {/* Main Book Presentation Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Book Cover with realistic 3D Book styling */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-3/4 rounded-2xl overflow-hidden shadow-xl border border-stone-200 group">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Left Spine Book Shadow */}
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none"></div>
              {/* Right page depth edge */}
              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Physical Location in Library */}
            <div className="w-full max-w-[280px] mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800">
              <div className="flex items-center gap-2 font-semibold text-xs mb-1 text-[#1E3A5F]">
                <MapPin className="w-4 h-4 text-[#1E3A5F]" />
                <span>Rayon Physique à l'EST Fès</span>
              </div>
              <p className="text-xs text-stone-900 font-bold">{book.shelfLocation}</p>
              <p className="text-[11px] text-stone-500 mt-1 font-light leading-snug">
                L'emprunt s'effectue exclusivement en présentiel au guichet de la médiathèque sur présentation de votre carte étudiant.
              </p>
            </div>
          </div>

          {/* Right Column: Book Details (Pure Consultation) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category, Publisher & Year */}
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <span className="px-3 py-1 rounded-full font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F]">
                  {book.category}
                </span>
                <span className="px-3 py-1 rounded-full font-mono bg-stone-100 text-stone-600">
                  ISBN: {book.isbn}
                </span>
                <span className="text-stone-400">· {book.publisher} ({book.year})</span>
              </div>

              {/* Title & Author */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-stone-900 mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-sm sm:text-base text-stone-600 font-light mb-6">
                Par <strong className="text-stone-900 font-medium">{book.authors.join(', ')}</strong>
              </p>

              {/* Availability & Physical In-Person Loan Notice */}
              <div className="p-5 rounded-2xl border border-stone-200/90 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAvailable ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    ></span>
                    <span className="font-semibold text-sm text-stone-900">
                      {isAvailable
                        ? `${book.availableCopies} exemplaire${book.availableCopies > 1 ? 's' : ''} disponible${book.availableCopies > 1 ? 's' : ''} en rayon`
                        : 'Tous les exemplaires physiques sont actuellement en prêt'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 font-light">
                    Total répertorié à la médiathèque EST : {book.totalCopies} exemplaires physiques
                  </p>
                </div>

                <div className="shrink-0">
                  {isAvailable ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Empruntable au guichet</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>En circulation (Retour attendu)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary / Résumé */}
              <div className="space-y-2 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-sans">
                  Résumé de l'ouvrage
                </h2>
                <p className="text-sm text-stone-700 leading-relaxed font-light">{book.summary}</p>
              </div>

              {/* Table of contents */}
              {book.tableOfContents && book.tableOfContents.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-sans">
                    Sommaire & Structure de l'ouvrage
                  </h2>
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 space-y-2 text-xs text-stone-700">
                    {book.tableOfContents.map((chap, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] shrink-0"></span>
                        <span className="font-light">{chap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Similar Books */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1E3A5F]" />
            <h2 className="text-lg font-serif font-bold text-stone-900 tracking-tight">
              Ouvrages complémentaires recommandés
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-light">{book.category}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
          {(groundedRecs.length > 0
            ? groundedRecs.map((r) => r.book)
            : fallbackSimilar
          ).map((simBook) => {
            const isSimAvail = simBook.availableCopies > 0;
            return (
              <div
                key={simBook.id}
                onClick={() => onSelectSimilarBook(simBook)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectSimilarBook(simBook)}
                tabIndex={0}
                role="button"
                className="group flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] rounded-2xl p-1 transition-transform"
                title={`${simBook.title} - ${simBook.authors.join(', ')}`}
              >
                <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 bg-stone-100 border border-stone-200">
                  <img
                    src={simBook.coverUrl}
                    alt={simBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none"></div>

                  <div className="absolute top-2 right-2">
                    {isSimAvail ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-medium shadow-xs">
                        {simBook.availableCopies} dispo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-600/90 text-white text-[10px] font-medium shadow-xs">
                        En prêt
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#1E3A5F] transition-colors">
                    {simBook.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-light">
                    {simBook.authors.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
