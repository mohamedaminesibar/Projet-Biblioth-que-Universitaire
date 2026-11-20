import React, { ReactNode } from 'react';
import { Header } from '../components/Header';
import { UserProfile, NotificationLog } from '../types/library';

interface AppLayoutProps {
  children: ReactNode;
  currentUser: UserProfile;
  onLogout: () => void;
  notifications: NotificationLog[];
  onMarkNotificationsRead: () => void;
  activeNavTab: string;
  onNavChange: (tab: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  activeNavTab,
  onNavChange,
}) => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] font-sans text-stone-900 antialiased selection:bg-[#1E3A5F] selection:text-white flex flex-col justify-between">
      <div>
        {/* Curatorial Header */}
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          notifications={notifications}
          onMarkNotificationsRead={onMarkNotificationsRead}
          activeNavTab={activeNavTab}
          onNavChange={onNavChange}
        />

        {/* Main Content Area with generous airy padding */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
          {children}
        </main>
      </div>

      {/* Subtle Institutional Footer */}
      <footer className="border-t border-stone-200/80 py-8 text-center text-xs text-stone-500 bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-light">
            © 2026 École Supérieure de Technologie (EST) — Université Sidi Mohamed Ben Abdellah
          </p>
          <div className="flex items-center gap-4 text-[11px] text-stone-600">
            <span>Règlement des Prêts</span>
            <span>·</span>
            <span>Médiathèque Numérique</span>
            <span>·</span>
            <span className="font-semibold text-[#1E3A5F]">EST Fès</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
