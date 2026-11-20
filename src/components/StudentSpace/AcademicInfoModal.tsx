import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/library';
import { GraduationCap, X, Check, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

interface AcademicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: UserProfile) => void;
  targetBookTitle?: string;
  initialProfile?: UserProfile | null;
}

export const AcademicInfoModal: React.FC<AcademicInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetBookTitle,
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [studentNumber, setStudentNumber] = useState(initialProfile?.studentNumber || '');
  const [filiere, setFiliere] = useState(
    initialProfile?.filiere || 'Génie Informatique & Systèmes Décisionnels'
  );
  const [academicYear, setAcademicYear] = useState('2ème Année DUT');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setEmail(initialProfile.email || '');
      setStudentNumber(initialProfile.studentNumber || '');
      if (initialProfile.filiere) setFiliere(initialProfile.filiere);
    }
  }, [initialProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filieresList = [
    'Génie Informatique & Systèmes Décisionnels',
    'Génie Électrique & Informatique Industrielle',
    'Génie Mécanique & Productique',
    'Techniques de Management & Finance',
    'Réseaux & Télécommunications',
    'Génie des Procédés & Biotechnologie',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !studentNumber.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    // Check institutional email format
    const isInstitutional =
      email.includes('@usmba.ac.ma') ||
      email.includes('@est.usmba.ac.ma') ||
      email.includes('@est.ac.ma');

    if (!isInstitutional && !email.includes('@')) {
      setError("Veuillez saisir votre adresse email institutionnelle (@usmba.ac.ma).");
      return;
    }

    const updatedProfile: UserProfile = {
      id: initialProfile?.id || `usr_std_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'student',
      studentNumber: studentNumber.trim().toUpperCase(),
      filiere: `${filiere} (${academicYear})`,
      avatarUrl:
        initialProfile?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    onSubmit(updatedProfile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="academic-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200/90 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-[11px] uppercase tracking-widest font-mono text-[#1E3A5F] font-semibold block mb-1">
            Identification Académique Obligatoire
          </span>
          <h2 id="academic-modal-title" className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {targetBookTitle ? 'Finaliser votre réservation' : 'Renseigner vos informations académiques'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-light leading-relaxed">
            {targetBookTitle ? (
              <>
                Pour réserver <strong className="font-semibold text-stone-900">« {targetBookTitle} »</strong>, la bibliothèque de l'EST doit vérifier votre statut d'étudiant actif.
              </>
            ) : (
              "Veuillez renseigner votre numéro d'étudiant (CNE/Apogée) et votre filière pour débloquer l'accès aux réservations."
            )}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Academic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nom complet de l'étudiant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mohamed Amine Sibari"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                N° Étudiant (Apogée / CNE) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="Ex: EST-2024-8942"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email institutionnel <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@usmba.ac.ma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Filière à l'EST Fès
              </label>
              <select
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
              >
                {filieresList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Niveau d'étude
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
              >
                <option value="1ère Année DUT">1ère Année DUT</option>
                <option value="2ème Année DUT">2ème Année DUT</option>
                <option value="Licence Professionnelle">Licence Professionnelle (LP)</option>
                <option value="Cycle Ingénieur">Cycle Ingénieur</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#152B47] transition-all shadow-sm"
            >
              <span>{targetBookTitle ? 'Valider et Confirmer la Réservation' : 'Enregistrer mon Profil'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
