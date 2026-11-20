import React, { useState, useRef, useEffect } from 'react';
import { Book, Loan } from '../../types/library';
import { BadgeSeverity } from '../BadgeSeverity';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
  MapPin,
  Clock,
  Printer,
  Sparkles,
  X,
  RefreshCw,
  Barcode,
} from 'lucide-react';

interface BookQrScannerSectionProps {
  books: Book[];
  loans: Loan[];
  onReturnLoan: (loanId: string) => void;
  onOpenNotificationModal?: (loan: Loan) => void;
}

export const BookQrScannerSection: React.FC<BookQrScannerSectionProps> = ({
  books,
  loans,
  onReturnLoan,
  onOpenNotificationModal,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('EST-IN-0101'); // Pre-fill with sample for instant preview
  const [searchQuery, setSearchQuery] = useState('');
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Autorisation de la caméra refusée. Utilisez la saisie manuelle ou les raccourcis.'
          : 'Impossible d’activer la webcam. Veuillez utiliser la saisie manuelle ci-dessous.'
      );
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle scanned query search
  const handleScanCode = (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    setScannedCode(clean);
    setSearchQuery(clean);
    setReturnSuccessMessage(null);
  };

  // Resolve matched book and active loan from scanned code
  const resolvedData = React.useMemo(() => {
    if (!scannedCode) return null;
    const term = scannedCode.toLowerCase().trim();

    // 1. Try to find matched active loan by barcode or bookId
    const matchedLoan = loans.find(
      (l) =>
        l.status === 'active' &&
        (l.copyBarcode.toLowerCase() === term ||
          l.bookId.toLowerCase() === term ||
          l.bookTitle.toLowerCase().includes(term))
    );

    // 2. Try to find matched book
    let matchedBook: Book | undefined;
    if (matchedLoan) {
      matchedBook = books.find((b) => b.id === matchedLoan.bookId);
    }

    if (!matchedBook) {
      matchedBook = books.find(
        (b) =>
          b.id.toLowerCase() === term ||
          b.isbn.replace(/[- ]/g, '').toLowerCase() === term.replace(/[- ]/g, '') ||
          b.title.toLowerCase().includes(term) ||
          b.isbn.toLowerCase().includes(term)
      );
    }

    return {
      book: matchedBook,
      loan: matchedLoan,
      rawCode: scannedCode,
    };
  }, [scannedCode, books, loans]);

  // Handle immediate return action
  const handleConfirmReturn = (loanId: string) => {
    onReturnLoan(loanId);
    setReturnSuccessMessage('Restitution validée avec succès ! Le stock en rayon a été mis à jour.');
    setTimeout(() => {
      setReturnSuccessMessage(null);
    }, 5000);
  };

  // Preset quick sample codes to test easily
  const samplePresets = [
    { label: 'EST-IN-0101 (Clean Code)', code: 'EST-IN-0101', desc: 'Emprunt en cours (À l’heure)' },
    { label: 'EST-GE-0107 (Électronique)', code: 'EST-GE-0107', desc: 'Emprunt en retard (2j)' },
    { label: 'EST-GE-0109 (Automatique)', code: 'EST-GE-0109', desc: 'Emprunt en retard (12j)' },
    { label: 'bk_02 (Algorithmique CLRS)', code: 'bk_02', desc: 'Disponible en rayon' },
    { label: 'bk_14 (Probabilités & Stats)', code: 'bk_14', desc: 'Disponible en rayon' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#1E3A5F] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
                Poste de Scan QR & Code-Barres Ouvrages
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[10px] font-semibold uppercase tracking-wider">
                Module Responsable
              </span>
            </div>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Scannez le QR code d’un ouvrage ou d’un exemplaire physique pour identifier son état, son emprunteur ou valider sa restitution en rayon.
            </p>
          </div>
        </div>

        {/* Camera toggle button */}
        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#162a45] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Activer la caméra</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <CameraOff className="w-4 h-4" />
              <span>Arrêter la caméra</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Camera Viewfinder (if active) */}
        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border-2 border-[#1E3A5F] shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Reticle with Scanning Laser Beam */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {/* Laser animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_#34d399]" />
                <span className="absolute top-2 left-2 text-[10px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">
                  SCANNER ACTIF
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={stopCamera}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Camera error message if permission blocked */}
        {cameraError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Input & Quick Scanner Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Manual input form */}
          <div className="lg:col-span-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanCode(searchQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Saisir ou flasher : EST-IN-0101, bk_01, ISBN..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/80 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162a45] text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </button>
            </form>
          </div>

          {/* Quick presets for realistic testing */}
          <div className="lg:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-stone-400 uppercase shrink-0 mr-1">
              Raccourcis :
            </span>
            {samplePresets.map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => handleScanCode(preset.code)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  scannedCode === preset.code
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Return Success Feedback */}
        {returnSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{returnSuccessMessage}</span>
          </div>
        )}

        {/* Results Box */}
        {resolvedData?.book ? (
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-5">
            <div className="flex flex-col md:flex-row items-start justify-between gap-5">
              {/* Left Column: Book Details */}
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={resolvedData.book.coverUrl}
                  alt={resolvedData.book.title}
                  className="w-16 h-22 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-mono font-medium">
                      {resolvedData.book.category}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      ISBN {resolvedData.book.isbn}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900 line-clamp-1">
                    {resolvedData.book.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-1">
                    {resolvedData.book.authors.join(', ')} · Édition {resolvedData.book.year}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{resolvedData.book.shelfLocation}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & QR Badge */}
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                {resolvedData.loan ? (
                  <div className="flex flex-col md:items-end gap-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Actuellement Emprunté</span>
                    </span>
                    <BadgeSeverity
                      severity={resolvedData.loan.severity}
                      days={resolvedData.loan.daysOverdue}
                      size="sm"
                    />
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disponible en rayon ({resolvedData.book.availableCopies} sur {resolvedData.book.totalCopies})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Loan Context Box if Borrowed */}
            {resolvedData.loan && (
              <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-stone-400 block">
                      Emprunteur enregistré
                    </span>
                    <div className="text-sm font-semibold text-stone-900">
                      {resolvedData.loan.studentName}
                    </div>
                    <div className="text-xs text-stone-500 font-mono">
                      {resolvedData.loan.studentEmail} · {resolvedData.loan.studentFiliere}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-mono text-stone-400 block">
                      Échéance réglementaire
                    </span>
                    <div className="text-sm font-semibold text-stone-900">
                      {resolvedData.loan.dueDate}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Prêt enregistré le {resolvedData.loan.loanDate}
                    </div>
                  </div>
                </div>

                {/* Instant Actions for Librarian */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                  {resolvedData.loan.daysOverdue > 0 && onOpenNotificationModal && (
                    <button
                      type="button"
                      onClick={() => onOpenNotificationModal(resolvedData.loan!)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Envoyer un rappel de retard
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConfirmReturn(resolvedData.loan!.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valider la restitution immédiate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generated QR Code Sticker Preview for the book */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/70">
              <div className="flex items-center gap-3">
                {/* SVG QR Code Pattern */}
                <div className="w-14 h-14 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code Matrix Elements */}
                    <rect x="0" y="0" width="30" height="30" fill="#1E3A5F" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="#1E3A5F" />

                    <rect x="70" y="0" width="30" height="30" fill="#1E3A5F" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="#1E3A5F" />

                    <rect x="0" y="70" width="30" height="30" fill="#1E3A5F" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="#1E3A5F" />

                    <rect x="40" y="10" width="10" height="20" fill="#1E3A5F" />
                    <rect x="55" y="15" width="10" height="10" fill="#1E3A5F" />
                    <rect x="40" y="40" width="20" height="20" fill="#1E3A5F" />
                    <rect x="15" y="45" width="15" height="10" fill="#1E3A5F" />
                    <rect x="70" y="45" width="20" height="10" fill="#1E3A5F" />
                    <rect x="45" y="70" width="15" height="20" fill="#1E3A5F" />
                    <rect x="75" y="75" width="15" height="15" fill="#1E3A5F" />
                  </svg>
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-stone-900">
                    Étiquette d’inventaire physique EST Fès
                  </div>
                  <div className="text-stone-400 font-mono text-[11px]">
                    Code: {resolvedData.loan?.copyBarcode || resolvedData.book.id.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-stone-400" />
                <span>Imprimer l’étiquette QR</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty or not found state */
          <div className="py-8 text-center space-y-2 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
            <QrCode className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500 font-light">
              Scannez ou sélectionnez un code ci-dessus pour afficher la fiche de l'ouvrage et de son exemplaire.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
