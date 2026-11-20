import React, { useState } from 'react';
import { Reservation, Book } from '../../types/library';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ReservationsQueueViewProps {
  reservations: Reservation[];
  books: Book[];
}

export const ReservationsQueueView: React.FC<ReservationsQueueViewProps> = ({ reservations, books }) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('all');

  const booksWithReservations = books.filter((b) =>
    reservations.some((r) => r.bookId === b.id && r.status === 'waiting')
  );

  const filteredReservations = reservations.filter((r) => {
    if (r.status !== 'waiting') return false;
    if (selectedBookId === 'all') return true;
    return r.bookId === selectedBookId;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Supervision des Files d'Attente (FIFO)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ordre chronologique strict de réservation des ouvrages indisponibles et attribution avec fenêtre de retrait de 48 heures.
        </p>
      </div>

      {/* Filter by Book selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedBookId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedBookId === 'all'
              ? 'bg-[#359F9F] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-[#8AD6D1]/15 border border-slate-200'
          }`}
        >
          Tous les ouvrages en attente ({reservations.length})
        </button>
        {booksWithReservations.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBookId(b.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all truncate max-w-xs ${
              selectedBookId === b.id
                ? 'bg-[#359F9F] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-[#8AD6D1]/15 border border-slate-200'
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <CheckCircle2 className="w-10 h-10 text-[#359F9F] mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Aucune file d'attente active</p>
            <p className="text-xs text-slate-500 mt-1">Tous les ouvrages demandés sont actuellement servis.</p>
          </div>
        ) : (
          filteredReservations.map((res) => {
            const isFirst = res.position === 1;
            return (
              <div
                key={res.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                  isFirst ? 'border-[#359F9F] ring-2 ring-[#359F9F]/10' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                      isFirst
                        ? 'bg-[#359F9F] text-white shadow-md shadow-[#359F9F]/20'
                        : 'bg-[#FCFAF4] text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider opacity-80">Rang</span>
                    <span className="text-base leading-none">#{res.position}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{res.bookTitle}</h3>
                      {isFirst && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#8AD6D1]/25 text-[#227878] text-[10px] font-bold border border-[#8AD6D1]/40">
                          Prioritaire (Prochain exemplaire disponible)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>
                        Demandeur : <strong className="text-slate-800">{res.studentName}</strong>
                      </span>
                      <span className="font-mono text-[#359F9F]">{res.studentEmail}</span>
                      <span>Demande enregistrée le : {res.requestDate}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-mono">Fenêtre de retrait</span>
                    <span className="text-xs font-semibold text-slate-700">48h ouvrées dès notification</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
