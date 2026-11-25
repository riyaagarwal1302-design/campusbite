import React, { useState, useRef, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { ChevronDown, LogOut, MapPin, ClipboardList, ShieldCheck } from 'lucide-react';
import type { ActiveSection } from '../types/campusBite';

interface NavbarProps {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection, anchorId?: string) => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  signingIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  authReady,
  isAdmin,
  activeSection,
  onNavigate,
  onSignIn,
  onSignOut,
  signingIn,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const firstName = user?.displayName?.split(' ')[0] || 'Student';

  const navLinkClass = (isActive: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534] ${
      isActive
        ? 'text-[#171E1A] border-[#166534]'
        : 'text-stone-600 border-transparent hover:text-[#171E1A] hover:border-stone-300'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('menu', 'top');
          }}
          className="font-display text-2xl font-bold tracking-tight text-[#171E1A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534]"
        >
          CampusBite
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => onNavigate('menu', 'daily-menu')}
            className={navLinkClass(activeSection === 'menu')}
          >
            Menu
          </button>
          <button
            type="button"
            onClick={() => onNavigate('menu', 'our-kitchen')}
            className={navLinkClass(false)}
          >
            Our Kitchen
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={navLinkClass(activeSection === 'orders')}
          >
            My Orders
          </button>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={navLinkClass(activeSection === 'profile')}
          >
            Hostel Profile
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('founder')}
              className={navLinkClass(activeSection === 'founder')}
            >
              Founder Console
            </button>
          )}
        </nav>

        <div className="shrink-0 relative" ref={dropdownRef}>
          {!authReady ? (
            <div className="h-10 w-36 rounded-lg bg-stone-200/70" aria-hidden="true" />
          ) : !user ? (
            <button
              type="button"
              onClick={onSignIn}
              disabled={signingIn}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-[40px] text-sm font-medium text-[#171E1A] bg-white border border-stone-300 rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2.5 px-3 py-1.5 min-h-[40px] text-sm font-medium text-[#171E1A] bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={firstName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-md object-cover border border-stone-200"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-md bg-[#166534] text-white text-xs font-semibold flex items-center justify-center">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[110px] truncate">{firstName}</span>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-sm font-semibold text-[#171E1A] truncate">
                      {user.displayName || 'CampusBite Student'}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigate('orders');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 text-stone-500" />
                    My Meal Orders
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-stone-500" />
                    Hostel &amp; PG Address
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigate('founder');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#166534] font-medium hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#166534]" />
                      Founder Validation Console
                    </button>
                  )}
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-stone-500" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
