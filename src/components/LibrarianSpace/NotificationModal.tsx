import React, { useState } from 'react';
import { Loan } from '../../types/library';
import { X, Send, Bell, Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { libraryApi } from '../../services/api';

interface NotificationModalProps {
  loan: Loan | null;
  onClose: () => void;
  onSend: (loan: Loan, customMessage: string) => Promise<void> | void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ loan, onClose, onSend }) => {
  if (!loan) return null;

  const defaultTemplates = {
    yellow: {
      subject: `Rappel amical : Retour d'ouvrage attendu - Bibliothèque EST`,
      message: `Bonjour ${loan.studentName},\n\nLa date de retour convenue pour l'ouvrage « ${loan.bookTitle} » était fixée au ${loan.dueDate} (retard de ${loan.daysOverdue} jours).\n\nMerci de bien vouloir rapporter ce document à l'accueil de la médiathèque dès que possible ou de vous présenter pour régulariser votre situation.\n\nBien cordialement,\nLa Médiathèque de l'EST Fès.`,
    },
    orange: {
      subject: `Deuxième avertissement : Retard sur l'ouvrage « ${loan.bookTitle} »`,
      message: `Bonjour ${loan.studentName},\n\nL'ouvrage « ${loan.bookTitle} » accuse actuellement un retard de ${loan.daysOverdue} jours.\n\nNous vous rappelons que d'autres étudiants de l'EST peuvent nécessiter ce document pour leurs examens. Conformément au règlement intérieur, vos droits à tout nouvel emprunt sont suspendus jusqu'à la restitution complète.\n\nMerci de vous présenter sous 48 heures.\n\nLa Direction de la Médiathèque EST.`,
    },
    red: {
      subject: `URGENT - Retard critique et suspension des services bibliothèque - EST`,
      message: `Bonjour ${loan.studentName},\n\nMalgré nos précédentes relances, l'ouvrage « ${loan.bookTitle} » n'a toujours pas été retourné (retard critique de ${loan.daysOverdue} jours).\n\nVotre compte bibliothèque est définitivement suspendu et votre dossier fait l'objet d'un signalement auprès de l'administration pédagogique de votre filière (${loan.studentFiliere}).\n\nVous êtes mis en demeure de restituer cet ouvrage sous 24 heures.\n\nLe Conservateur de la Médiathèque EST Fès.`,
    },
  };

  const template =
    loan.severity === 'red'
      ? defaultTemplates.red
      : loan.severity === 'orange'
      ? defaultTemplates.orange
      : defaultTemplates.yellow;

  const [message, setMessage] = useState(template.message);
  const [subject, setSubject] = useState(template.subject);
  const [channel, setChannel] = useState<'both' | 'email' | 'in_app'>('both');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    setErrorMessage(null);
    try {
      const draft = await libraryApi.draftAiNotification(loan.id);
      if (draft) {
        setSubject(draft.subject);
        setMessage(draft.message);
      }
    } catch (err: any) {
      console.warn('AI generation fallback:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSend = async () => {
    setErrorMessage(null);
    try {
      await onSend(loan, message);
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l’envoi de la relance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FCFAF4] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#8AD6D1]/40 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                loan.severity === 'red'
                  ? 'bg-[#FF8C52]'
                  : loan.severity === 'orange'
                  ? 'bg-orange-600'
                  : 'bg-amber-600'
              }`}
            >
              {loan.severity === 'red' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Notifier l'étudiant en retard</h3>
              <p className="text-xs text-slate-500">
                Classification :{' '}
                <strong
                  className={
                    loan.severity === 'red'
                      ? 'text-[#E67236]'
                      : loan.severity === 'orange'
                      ? 'text-orange-700'
                      : 'text-amber-800'
                  }
                >
                  {loan.severity === 'red'
                    ? 'Retard critique (≥ 8 jours)'
                    : loan.severity === 'orange'
                    ? 'Retard modéré (4-7 jours)'
                    : 'Retard léger (1-3 jours)'}
                </strong>{' '}
                • {loan.daysOverdue} jours de retard
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner (e.g. anti-duplicate / returned loan) */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Student info card */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1 shadow-2xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Étudiant :</span>
            <span className="font-bold text-slate-900">{loan.studentName} ({loan.studentFiliere})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email académique :</span>
            <span className="font-mono text-[#359F9F] font-semibold">{loan.studentEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ouvrage :</span>
            <span className="font-medium text-slate-800 truncate max-w-[280px]">{loan.bookTitle}</span>
          </div>
        </div>

        {/* AI Drafting button */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Contenu du message :</span>
          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#8AD6D1]/20 hover:bg-[#8AD6D1]/30 text-[#227878] text-xs font-bold border border-[#8AD6D1]/40 transition-all focus:outline-none"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#359F9F]" />
                <span>Génération Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#359F9F]" />
                <span>Régénérer avec Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* Subject & message editor */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Objet :</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#359F9F] text-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Corps du texte (gradué selon sévérité) :
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs text-slate-800 p-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#359F9F] leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Canal de transmission :</label>
          <div className="flex gap-2">
            <button
              onClick={() => setChannel('both')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                channel === 'both'
                  ? 'bg-[#8AD6D1]/20 border-[#359F9F] text-[#227878]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#359F9F]" />
              <span>In-App + E-mail USMBA</span>
            </button>
            <button
              onClick={() => setChannel('in_app')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                channel === 'in_app'
                  ? 'bg-[#8AD6D1]/20 border-[#359F9F] text-[#227878]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>In-App uniquement</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Annuler
          </button>

          {sentSuccess ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#359F9F] text-white text-xs font-bold shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>Livré et confirmé par le fournisseur</span>
            </div>
          ) : (
            <button
              onClick={handleSend}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                loan.severity === 'red'
                  ? 'bg-[#FF8C52] hover:bg-[#E67236] shadow-[#FF8C52]/20'
                  : 'bg-[#359F9F] hover:bg-[#227878] shadow-[#359F9F]/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Envoyer la notification</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
