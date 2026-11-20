import React from 'react';
import { NotificationLog } from '../../types/library';
import { Bell, CheckCheck, Mail, Sparkles, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface NotificationHistoryViewProps {
  notifications: NotificationLog[];
}

export const NotificationHistoryView: React.FC<NotificationHistoryViewProps> = ({ notifications }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Journal des Notifications & Relances
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historique des rappels amiables, avertissements formels et mises en demeure transmis aux étudiants de l'EST.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7 text-[#359F9F]" />}
          title="Aucune notification enregistrée"
          description="Les notifications et relances envoyées aux étudiants en retard apparaîtront dans ce registre avec leur statut de transmission."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {notifications.map((notif) => {
            const isRed = notif.severity === 'red';
            const isOrange = notif.severity === 'orange';
            return (
              <div key={notif.id} className="p-5 hover:bg-[#FCFAF4] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isRed
                          ? 'bg-[#FF8C52]/20 text-[#E67236] border border-[#FF8C52]/40'
                          : isOrange
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-[#FFF0C5] text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isRed ? (
                        <>
                          <ShieldAlert className="w-3 h-3 text-[#FF8C52]" />
                          <span>Retard Critique</span>
                        </>
                      ) : isOrange ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span>Avertissement</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>Rappel Léger</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-bold text-slate-900">{notif.recipientName}</span>
                    <span className="text-xs text-[#359F9F] font-mono">({notif.recipientEmail})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-[11px]">{notif.sentAt}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Transmis (In-App + Email USMBA)</span>
                    </span>
                  </div>
                </div>

                <div className="pl-0 sm:pl-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">{notif.subject}</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-2xl border border-slate-100 font-sans leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Ouvrage concerné : <strong className="text-slate-700">{notif.bookTitle}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
