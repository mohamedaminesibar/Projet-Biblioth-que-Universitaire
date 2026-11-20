import React, { useState } from 'react';
import { UserProfile } from '../types/library';
import { libraryApi } from '../services/api';
import { BookOpen, User, X, Loader2, ArrowRight, AlertCircle, ChevronDown } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  // Fenêtre Google ouverte par défaut avec croix 'X' pour la fermer
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  // État du formulaire "Utiliser un autre compte"
  const [isAddingOtherAccount, setIsAddingOtherAccount] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [otherName, setOtherName] = useState('');

  // Liste des comptes Google (strictement nom et email, sans mention de rôle)
  const accounts = [
    {
      name: 'MOHAMED AMINE SIBARI',
      email: 'mohamedamine.sibari@usmba.ac.ma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'MOHAMED AMINE SIBARI',
      email: 'mohamedamine.sibari@uit.ac.ma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleAccountClick = async (accountEmail: string, name?: string, avatarUrl?: string) => {
    setError(null);
    setLoadingEmail(accountEmail);

    try {
      // Authentification Google : le rôle est détecté automatiquement côté serveur
      // mohamedamine.sibari@usmba.ac.ma -> étudiant
      // mohamedamine.sibari@uit.ac.ma -> responsable
      const user = await libraryApi.loginWithGoogle(accountEmail, name, avatarUrl);
      onAuthenticated(user);
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion avec le compte Google.');
      setLoadingEmail(null);
    }
  };

  const handleOtherAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = otherEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    handleAccountClick(clean, otherName.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white flex flex-col justify-between selection:bg-[#4285F4] selection:text-white font-sans antialiased">
      {/* Barre d'en-tête discrète */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-stone-800/60 bg-[#171717]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center border border-white/10 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight text-base font-['Google_Sans_Flex']">
              Biblio<span className="text-[#8AB4F8] font-bold">EST</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase ml-2 px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              EST Fès · USMBA
            </span>
          </div>
        </div>

        <span className="text-xs text-stone-400 font-light hidden sm:inline">
          Portail Central d'Authentification Google
        </span>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        {isOpen ? (
          /* Fenêtre Google avec croix de fermeture */
          <div className="w-full max-w-2xl bg-[#131314] rounded-3xl border border-[#303134] shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Barre supérieure : Logo Google + Titre + Croix pour fermer */}
            <div className="flex items-center justify-between pb-2 border-b border-[#28292A]">
              <div className="flex items-center gap-3">
                {/* Logo officiel Google */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                  />
                </svg>
                <span className="text-sm font-medium text-[#E8EAED]">
                  Se connecter avec Google
                </span>
              </div>

              {/* Croix pour sortir de cette fenêtre */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9AA0A6] hover:text-white hover:bg-[#28292A] transition-colors focus:outline-none cursor-pointer"
                title="Fermer cette fenêtre"
                aria-label="Fermer cette fenêtre"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message d'erreur éventuel */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 animate-in shake duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Disposition en deux colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start pt-2">
              {/* Colonne gauche : Intitulé & Application de destination */}
              <div className="md:col-span-5 space-y-3">
                <h1 className="text-2xl sm:text-3xl font-normal text-[#E8EAED] tracking-tight leading-snug">
                  Sélectionnez un<br />compte
                </h1>
                <div className="space-y-0.5 pt-1">
                  <p className="text-xs sm:text-sm text-[#9AA0A6]">
                    Accéder à l'application
                  </p>
                  <a
                    href="#biblio"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs sm:text-sm text-[#8AB4F8] hover:underline font-normal block truncate"
                  >
                    biblio-estfes-demo.alwaysdata.net
                  </a>
                </div>
              </div>

              {/* Colonne droite : Liste des comptes Google & "Utiliser un autre compte" */}
              <div className="md:col-span-7 space-y-0 divide-y divide-[#303134]">
                {accounts.map((acc) => {
                  const isThisLoading = loadingEmail === acc.email;

                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={!!loadingEmail}
                      onClick={() => handleAccountClick(acc.email, acc.name, acc.avatarUrl)}
                      className="w-full py-3.5 px-3 rounded-xl hover:bg-[#202124] transition-colors text-left flex items-center justify-between gap-3 group focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#3C4043] shrink-0 border border-[#5F6368]">
                          <img
                            src={acc.avatarUrl}
                            alt={acc.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Nom et Email uniquement (SANS mention de rôle) */}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-[#E8EAED] truncate leading-tight">
                            {acc.name}
                          </div>
                          <div className="text-xs text-[#9AA0A6] font-normal truncate leading-tight mt-0.5">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      {isThisLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-[#8AB4F8] shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Utiliser un autre compte */}
                <div className="pt-2">
                  {!isAddingOtherAccount ? (
                    <button
                      type="button"
                      disabled={!!loadingEmail}
                      onClick={() => setIsAddingOtherAccount(true)}
                      className="w-full py-3.5 px-3 rounded-xl hover:bg-[#202124] transition-colors text-left flex items-center gap-3.5 focus:outline-none cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#9AA0A6] shrink-0">
                        <User className="w-5 h-5 text-[#9AA0A6]" />
                      </div>
                      <span className="text-xs sm:text-sm font-normal text-[#E8EAED]">
                        Utiliser un autre compte
                      </span>
                    </button>
                  ) : (
                    <form onSubmit={handleOtherAccountSubmit} className="p-3.5 mt-2 rounded-2xl bg-[#1E1F20] border border-[#3C4043] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#E8EAED]">
                          Saisir un autre compte Google
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingOtherAccount(false)}
                          className="text-[#9AA0A6] hover:text-white text-xs cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>

                      <input
                        type="email"
                        required
                        value={otherEmail}
                        onChange={(e) => setOtherEmail(e.target.value)}
                        placeholder="nom.prenom@usmba.ac.ma ou autre compte Google"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#3C4043] bg-[#131314] text-white focus:outline-none focus:ring-1 focus:ring-[#8AB4F8]"
                        autoComplete="email"
                      />

                      <input
                        type="text"
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                        placeholder="Nom complet (facultatif)"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#3C4043] bg-[#131314] text-white focus:outline-none focus:ring-1 focus:ring-[#8AB4F8]"
                      />

                      <button
                        type="submit"
                        disabled={!!loadingEmail}
                        className="w-full py-2.5 rounded-xl bg-[#8AB4F8] hover:bg-[#7ba6ee] text-[#131314] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loadingEmail ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#131314]" />
                        ) : (
                          <>
                            <span>Se connecter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Carte d'accès lorsque la fenêtre est fermée avec bouton de réouverture */
          <div className="w-full max-w-md bg-[#131314] rounded-3xl border border-[#303134] p-8 text-center space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F]/30 border border-[#1E3A5F]/40 flex items-center justify-center mx-auto text-[#8AB4F8]">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Médiathèque BiblioEST
              </h2>
              <p className="text-xs text-[#9AA0A6] font-light leading-relaxed">
                Fenêtre de connexion fermée. Cliquez ci-dessous pour rouvrir l'authentification Google.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full py-3 px-4 rounded-xl border border-[#3C4043] hover:border-[#5F6368] bg-[#202124] hover:bg-[#28292A] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </button>
          </div>
        )}
      </main>

      {/* Pied de page Google */}
      <footer className="w-full max-w-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AA0A6] gap-2 border-t sm:border-t-0 border-[#28292A]">
        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
          <span>Français (France)</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-6">
          <span className="hover:text-white cursor-pointer">Aide</span>
          <span className="hover:text-white cursor-pointer">Confidentialité</span>
          <span className="hover:text-white cursor-pointer">Conditions</span>
        </div>
      </footer>
    </div>
  );
};
