import React, { useState } from 'react';
import { UserProfile, NotificationLog } from '../types/library';
import { BookOpen, Bell, ShieldCheck, GraduationCap, X, LogOut, CheckCheck, Sliders, BellRing, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
  notifications: NotificationLog[];
  onMarkNotificationsRead: () => void;
  activeNavTab: string;
  onNavChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  activeNavTab,
  onNavChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isStudent = currentUser.role === 'student';

  const userInitials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full editorial-nav transition-all duration-200">
      {/* Delicate top gradient hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#1E3A5F]/35 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Institution branding */}
          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#10233B] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(30,58,95,0.22)] border border-white/20 shrink-0 transition-transform duration-200 group-hover:scale-[1.02]">
              <BookOpen className="w-5 h-5 text-stone-100" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 tracking-tight text-lg sm:text-xl font-['Google_Sans_Flex']">
                  Biblio<span className="text-[#1E3A5F] font-bold">EST</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80 font-mono">
                  EST Fès
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-normal hidden sm:block tracking-wide">
                Médiathèque Universitaire · Université Sidi Mohamed Ben Abdellah
              </p>
            </div>
          </div>

          {/* Navigation links based on role (floating segmented pill) */}
          <nav className="flex items-center bg-stone-100/70 p-1 rounded-full border border-stone-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
            {isStudent ? (
              <button
                onClick={() => onNavChange('catalog')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-2 focus:outline-none ${
                  activeNavTab === 'catalog'
                    ? 'bg-white text-stone-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A5F]" />
                <span>Catalogue & Consultation</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavChange('dashboard')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${
                    activeNavTab === 'dashboard'
                      ? 'bg-white text-stone-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#1E3A5F]" />
                  <span>Supervision & Retards</span>
                </button>
                <button
                  onClick={() => onNavChange('notifications_history')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${
                    activeNavTab === 'notifications_history'
                      ? 'bg-white text-stone-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5 text-stone-500" />
                  <span>Journal des Relances</span>
                  {notifications.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#1E3A5F] text-[10px] text-white font-bold leading-tight">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </nav>

          {/* User Profile Capsule, Notification Bell & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Capsule */}
            <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold tracking-tight text-white shadow-xs ${
                    isStudent
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                      : 'bg-gradient-to-tr from-[#1E3A5F] to-[#2E5584]'
                  }`}
                >
                  {userInitials || (isStudent ? 'ET' : 'RP')}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-stone-900 leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-stone-400 font-normal leading-tight flex items-center gap-1">
                  {isStudent ? (
                    <>
                      <GraduationCap className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Étudiant</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5 text-[#1E3A5F]" />
                      <span>Responsable</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className={`relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-200 focus:outline-none ${
                  showNotifications
                    ? 'bg-stone-100 border-stone-300 text-stone-900'
                    : 'bg-white border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                }`}
                aria-label="Voir les notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-stone-200/90 py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-sm">
                        {isStudent ? 'Vos alertes de prêt' : 'Notifications & Relances'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 px-2 mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs text-stone-400 font-light">Aucune notification pour le moment</p>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div key={n.id} className="py-2.5 px-3 hover:bg-stone-50 rounded-xl transition-colors">
                          <p className="text-xs font-semibold text-stone-900">{n.subject}</p>
                          <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 font-light leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-stone-400 block mt-1 font-mono">{n.sentAt}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-500 hover:text-red-700 hover:bg-red-50/80 border border-stone-200/80 hover:border-red-200 transition-all duration-200 focus:outline-none group shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-600 transition-colors" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
