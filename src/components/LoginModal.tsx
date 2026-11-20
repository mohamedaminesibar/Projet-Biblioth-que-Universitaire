import React, { useEffect } from 'react';
import { Role } from '../types/library';
import { CURRENT_STUDENT, CURRENT_LIBRARIAN } from '../data/mockData';
import { BookOpen, GraduationCap, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: Role) => void;
  currentRole: Role;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, currentRole }) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <div className="bg-[#FCFAF4] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#8AD6D1]/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#8AD6D1]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#FFF0C5]/40 blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-[#8AD6D1] focus:outline-none"
          aria-label="Fermer la boîte de connexion"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#359F9F] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#359F9F]/20">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0C5] text-slate-800 text-[11px] font-semibold border border-[#8AD6D1]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#359F9F]" />
            <span>Portail d'authentification EST</span>
          </span>
          <h2 id="login-dialog-title" className="text-xl font-bold text-slate-900">
            Connexion à BiblioEST
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
            Accès sécurisé réservé aux étudiants et au personnel autorisé de l'EST (USMBA).
          </p>
        </div>

        {/* Roles selection */}
        <div className="space-y-3 relative z-10">
          {/* Étudiant option */}
          <button
            onClick={() => {
              onLogin('student');
              onClose();
            }}
            className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group focus:outline-none focus:ring-4 focus:ring-[#8AD6D1]/40 ${
              currentRole === 'student'
                ? 'bg-white border-[#359F9F] ring-2 ring-[#359F9F]/15 shadow-sm'
                : 'bg-white/80 border-slate-200/80 hover:border-[#8AD6D1]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8AD6D1]/30 text-[#227878] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Espace Étudiant</div>
                <div className="text-[11px] text-slate-500 font-mono">{CURRENT_STUDENT.email}</div>
                <div className="text-[10px] text-[#359F9F] font-semibold">{CURRENT_STUDENT.filiere}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#359F9F] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Responsable option */}
          <button
            onClick={() => {
              onLogin('librarian');
              onClose();
            }}
            className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group focus:outline-none focus:ring-4 focus:ring-[#8AD6D1]/40 ${
              currentRole === 'librarian'
                ? 'bg-white border-[#359F9F] ring-2 ring-[#359F9F]/15 shadow-sm'
                : 'bg-white/80 border-slate-200/80 hover:border-[#8AD6D1]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0C5] text-slate-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#359F9F]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Espace Responsable Médiathèque</div>
                <div className="text-[11px] text-slate-500 font-mono">{CURRENT_LIBRARIAN.email}</div>
                <div className="text-[10px] text-slate-500">Supervision & Retards</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#359F9F] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-[11px] text-slate-500">
          Système universitaire sous protocole OIDC / OAuth institutionnel USMBA.
        </div>
      </div>
    </div>
  );
};
