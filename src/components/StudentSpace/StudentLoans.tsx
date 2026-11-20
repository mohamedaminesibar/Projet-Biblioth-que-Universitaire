import React, { useState } from 'react';
import { Book, Loan, Reservation, UserProfile, NotificationLog } from '../../types/library';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Bell, Mail, ShieldAlert } from 'lucide-react';
import { BadgeSeverity } from '../BadgeSeverity';

interface StudentLoansProps {
  loans: Loan[];
  reservations: Reservation[];
  notifications?: NotificationLog[];
  currentStudentId?: string;
  studentProfile?: UserProfile | null;
  onCancelReservation: (resId: string) => void;
  onGoToCatalog: () => void;
  onOpenAcademicModal?: () => void;
  onMarkNotificationsRead?: () => void;
}

export const StudentLoans: React.FC<StudentLoansProps> = ({
  loans,
  reservations,
  notifications = [],
  currentStudentId,
  studentProfile,
  onCancelReservation,
  onGoToCatalog,
  onOpenAcademicModal,
  onMarkNotificationsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'reservations' | 'notifications'>('loans');

  const myLoans = loans.filter(
    (l) => (currentStudentId ? l.studentId === currentStudentId : true) && l.status === 'active'
  );
  const myReservations = reservations.filter(
    (r) => (currentStudentId ? r.studentId === currentStudentId : true) && r.status === 'waiting'
  );
  const myNotifications = notifications.filter(
    (n) => !studentProfile || n.recipientEmail === studentProfile.email || n.recipientEmail.includes('@usmba.ac.ma')
  );

  const hasLateLoan = myLoans.some((l) => l.daysOverdue > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Editorial Page Header */}
      <div className="border-b border-stone-200/80 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-sans text-stone-500 block mb-1">
              Espace Personnel de l'Étudiant
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Mes Emprunts & Suivi des Remises
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl font-light leading-relaxed">
              Consultez vos dates limites de remise calculées en direct, l'échelle officielle des retards et les messages de relance envoyés par le responsable.
            </p>
          </div>

          {/* Academic Profile summary chip or sign-in invitation */}
          {studentProfile ? (
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 text-xs text-stone-700 shrink-0">
              <div className="font-semibold text-stone-900">{studentProfile.name}</div>
              <div className="text-stone-500 font-mono text-[11px]">{studentProfile.studentNumber} · {studentProfile.filiere}</div>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 shrink-0">
              <div className="font-semibold">Mode Invité (Consultation)</div>
              <button
                onClick={onOpenAcademicModal}
                className="text-[#1E3A5F] hover:underline font-medium text-[11px] mt-0.5 block"
              >
                Renseigner mon profil académique →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Institutional Color-Coded Delay Rules Guide (Identical to Librarians) */}
      <div className="editorial-panel rounded-2xl p-5 border border-stone-200/80">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#1E3A5F]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Échelle réglementaire des remises de documents (Règlement EST Fès)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Vert : À l'heure</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1 font-light leading-snug">
              0 jour de retard. Date de remise respectée, droits d'emprunt intacts.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Jaune : Retard léger</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-light leading-snug">
              1 à 3 jours de retard. Message amical de rappel transmis par le responsable.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-950">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Orange : Retard modéré</span>
            </div>
            <p className="text-[11px] text-orange-900 mt-1 font-light leading-snug">
              4 à 7 jours de retard. Avertissement formel et suspension temporaire d'emprunt.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-950">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Rouge : Retard critique</span>
            </div>
            <p className="text-[11px] text-red-900 mt-1 font-light leading-snug">
              ≥ 8 jours. Mise en demeure et signalement au chef de filière.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Emprunts vs Réservations vs Notifications */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'loans'
              ? 'bg-[#1E3A5F] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Mes Ouvrages en cours ({myLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'reservations'
              ? 'bg-[#1E3A5F] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>Mes Réservations ({myReservations.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            if (onMarkNotificationsRead) onMarkNotificationsRead();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'notifications'
              ? 'bg-[#1E3A5F] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Messages du Responsable ({myNotifications.length})</span>
        </button>
      </div>

      {/* Tab 1: Emprunts Actifs avec dates de remise explicites */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {myLoans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Aucun emprunt actif actuellement
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light">
                Vous n'avez aucun livre ou article en cours de prêt. Parcourez le catalogue pour réserver ou consulter les disponibilités physiques.
              </p>
              <button
                onClick={onGoToCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#152B47] transition-colors"
              >
                <span>Explorer le catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            myLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={loan.bookCover}
                    alt={loan.bookTitle}
                    className="w-16 h-22 object-cover rounded-xl shadow-sm shrink-0 border border-stone-200"
                  />
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                      Code Exemplaire : {loan.copyBarcode}
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                      {loan.bookTitle}
                    </h3>

                    {/* Explicite highlight of Return Date */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-stone-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Emprunté le : <strong className="font-medium text-stone-700">{loan.loanDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 text-stone-800">
                        <Clock className="w-3.5 h-3.5 text-[#1E3A5F]" />
                        <span>Date de remise obligatoire : <strong className="font-bold text-[#1E3A5F]">{loan.dueDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <BadgeSeverity severity={loan.severity} days={loan.daysOverdue} showDetailText={true} />
                  <span className="text-[11px] text-stone-500 font-light">
                    {loan.daysOverdue === 0
                      ? `Remise attendue avant le ${loan.dueDate} à la médiathèque`
                      : `Retard de ${loan.daysOverdue}j · Restituez ce document au guichet`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Réservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {myReservations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Aucune réservation active
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light">
                Vous pouvez réserver tout livre ou article du catalogue dès que vous renseignez vos informations académiques.
              </p>
              <button
                onClick={onGoToCatalog}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#152B47] transition-colors"
              >
                <span>Choisir un livre à réserver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            myReservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={res.bookCover}
                    alt={res.bookTitle}
                    className="w-16 h-22 object-cover rounded-xl shadow-sm shrink-0 border border-stone-200"
                  />
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[11px] font-semibold">
                      <span>Rang en file d'attente : #{res.position}</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                      {res.bookTitle}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Demande enregistrée le {res.requestDate} · {res.pickupDeadline || 'Retrait sous 48h à libération'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    onClick={() => onCancelReservation(res.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Annuler ma réservation</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Messages et Notifications du Responsable */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            <span>
              Voici l'historique complet des messages institutionnels et des relances de remise envoyés par la médiathèque de l'EST à votre attention.
            </span>
          </div>

          {myNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-lg mx-auto">
              <Mail className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Aucune notification en attente
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Vous n'avez reçu aucun message de relance. Votre dossier de prêt est à jour.
              </p>
            </div>
          ) : (
            myNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]"></span>
                    <h3 className="font-serif font-bold text-sm text-stone-900">{notif.subject}</h3>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{notif.sentAt}</span>
                </div>

                <div className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed whitespace-pre-line bg-stone-50/70 p-4 rounded-xl border border-stone-100">
                  {notif.message}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Concerne : <strong className="font-medium text-stone-800">{notif.bookTitle}</strong></span>
                  <span className="font-mono text-stone-400">Canal : In-App & Email institutionnel</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
