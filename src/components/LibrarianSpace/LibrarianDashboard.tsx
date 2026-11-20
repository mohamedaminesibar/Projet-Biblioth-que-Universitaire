import React, { useState } from 'react';
import { Loan, Book } from '../../types/library';
import { BadgeSeverity } from '../BadgeSeverity';
import { BookQrScannerSection } from './BookQrScannerSection';
import { BookOpen, CheckCircle2, Clock, Search, Bell, Sliders, AlertTriangle } from 'lucide-react';

interface LibrarianDashboardProps {
  loans: Loan[];
  books?: Book[];
  onReturnLoan: (loanId: string) => void;
  onOpenNotificationModal: (loan: Loan) => void;
}

export const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({
  loans,
  books = [],
  onReturnLoan,
  onOpenNotificationModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'none' | 'yellow' | 'orange' | 'red'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Real computed stats
  const activeLoans = loans.filter((l) => l.status === 'active');
  const onTimeCount = activeLoans.filter((l) => l.severity === 'none').length;
  const yellowCount = activeLoans.filter((l) => l.severity === 'yellow').length;
  const orangeCount = activeLoans.filter((l) => l.severity === 'orange').length;
  const redCount = activeLoans.filter((l) => l.severity === 'red').length;

  // Filtered loans list
  const filteredLoans = activeLoans.filter((loan) => {
    const matchesSearch =
      loan.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.copyBarcode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' || loan.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-sans text-stone-500 block mb-1">
            Médiathèque EST Fès · Direction des Prêts
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Supervision des Emprunts & Classification des Retards
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-light mt-1 max-w-2xl leading-relaxed">
            Échelle réglementaire de suivi : Délais respectés (à l'heure), 1 à 3 jours, 4 à 7 jours, 8 jours et plus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <div className="text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-mono">Date Référence</span>
              <span className="font-semibold text-stone-900">Vendredi 16 Octobre 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Shared Color Spectrum */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Active */}
        <div
          onClick={() => setFilterSeverity('all')}
          className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer ${
            filterSeverity === 'all'
              ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/15 shadow-sm'
              : 'border-stone-200/90 shadow-2xs hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium text-stone-600">Total en cours</span>
            <BookOpen className="w-4 h-4 text-[#1E3A5F]" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">{activeLoans.length}</div>
          <span className="text-[10px] text-stone-400 mt-1 block">Ouvrages prêtés</span>
        </div>

        {/* On Time */}
        <div
          onClick={() => setFilterSeverity('none')}
          className={`p-4 rounded-2xl bg-emerald-50/50 border transition-all cursor-pointer ${
            filterSeverity === 'none'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'border-emerald-200 shadow-2xs hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-900">À l'heure</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-900">{onTimeCount}</div>
          <span className="text-[10px] text-emerald-700 font-light mt-1 block">Délais respectés</span>
        </div>

        {/* 1-3 days */}
        <div
          onClick={() => setFilterSeverity('yellow')}
          className={`p-4 rounded-2xl bg-amber-50/50 border transition-all cursor-pointer ${
            filterSeverity === 'yellow'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'border-amber-200 shadow-2xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900">1 à 3 jours</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900">{yellowCount}</div>
          <span className="text-[10px] text-amber-700 font-light mt-1 block">Rappels courtois</span>
        </div>

        {/* 4-7 days */}
        <div
          onClick={() => setFilterSeverity('orange')}
          className={`p-4 rounded-2xl bg-orange-50/50 border transition-all cursor-pointer ${
            filterSeverity === 'orange'
              ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
              : 'border-orange-200 shadow-2xs hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-orange-950">4 à 7 jours</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-orange-950">{orangeCount}</div>
          <span className="text-[10px] text-orange-800 font-light mt-1 block">Avertissements</span>
        </div>

        {/* >= 8 days */}
        <div
          onClick={() => setFilterSeverity('red')}
          className={`p-4 rounded-2xl bg-red-50/50 border transition-all cursor-pointer ${
            filterSeverity === 'red'
              ? 'border-red-500 ring-2 ring-red-500/20 shadow-sm'
              : 'border-red-200 shadow-2xs hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-950">≥ 8 jours</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-red-950">{redCount}</div>
          <span className="text-[10px] text-red-800 font-light mt-1 block">Suspensions critiques</span>
        </div>
      </div>

      {/* Section de Scan des Codes QR & Codes-Barres pour le Responsable */}
      <BookQrScannerSection
        books={books}
        loans={loans}
        onReturnLoan={onReturnLoan}
        onOpenNotificationModal={onOpenNotificationModal}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par nom d'étudiant, titre d'ouvrage, barcode ou email..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterSeverity === 'all' ? 'bg-[#1E3A5F] text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tous ({activeLoans.length})
          </button>
          <button
            onClick={() => setFilterSeverity('yellow')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterSeverity === 'yellow' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            1 à 3j ({yellowCount})
          </button>
          <button
            onClick={() => setFilterSeverity('orange')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterSeverity === 'orange' ? 'bg-orange-600 text-white' : 'text-orange-900 hover:bg-orange-50'
            }`}
          >
            4 à 7j ({orangeCount})
          </button>
          <button
            onClick={() => setFilterSeverity('red')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterSeverity === 'red' ? 'bg-red-600 text-white' : 'text-red-900 hover:bg-red-50'
            }`}
          >
            ≥ 8j ({redCount})
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 text-stone-500 border-b border-stone-200 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Ouvrage</th>
                <th className="py-3 px-4">Étudiant Emprunteur</th>
                <th className="py-3 px-4">Échéance de remise</th>
                <th className="py-3 px-4">Niveau de Retard</th>
                <th className="py-3 px-4 text-right">Actions Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    Aucun emprunt ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-10 h-14 object-cover rounded-md border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1 max-w-xs">
                            {loan.bookTitle}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">{loan.copyBarcode}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-900">{loan.studentName}</div>
                      <div className="text-stone-400 font-mono text-[10px]">{loan.studentEmail}</div>
                      <div className="text-[10px] text-stone-500">{loan.studentFiliere}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{loan.dueDate}</div>
                      <div className="text-stone-400 text-[10px]">Prêté le {loan.loanDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <BadgeSeverity severity={loan.severity} days={loan.daysOverdue} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {loan.daysOverdue > 0 && (
                          <button
                            onClick={() => onOpenNotificationModal(loan)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium transition-colors"
                          >
                            Relancer
                          </button>
                        )}
                        <button
                          onClick={() => onReturnLoan(loan.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                        >
                          Valider Retour
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
