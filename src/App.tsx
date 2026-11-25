import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { X } from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import { ADMIN_EMAIL, MENU_ITEMS } from './data/menuData';
import type {
  ActiveSection,
  CartItem,
  MenuItem,
  UserProfile,
} from './types/campusBite';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { KitchenStorySection } from './components/KitchenStorySection';
import { CartDrawer } from './components/CartDrawer';
import { OrdersSection } from './components/OrdersSection';
import { ProfileSection } from './components/ProfileSection';
import { FounderConsole } from './components/FounderConsole';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setProfile(null);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          setProfile(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const isAdmin = Boolean(
    user?.emailVerified && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const handleSignIn = useCallback(async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completing.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Please allow popups for this site to sign in with Google.');
      } else {
        setAuthError('Unable to complete Google sign-in right now. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    if (activeSection === 'founder') {
      setActiveSection('menu');
    }
  }, [activeSection]);

  const handleNavigate = useCallback((section: ActiveSection, anchorId?: string) => {
    setActiveSection(section);
    if (anchorId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const totalCount = prev.reduce((sum, entry) => sum + entry.quantity, 0);
      if (totalCount >= 20) return prev;
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      const totalCount = prev.reduce((sum, entry) => sum + entry.quantity, 0);
      if (delta > 0 && totalCount >= 20) return prev;
      return prev
        .map((entry) =>
          entry.item.id === itemId
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0);
    });
  }, []);

  const handleRepeatOrder = useCallback((itemIds: string[]) => {
    const counts: Record<string, number> = {};
    itemIds.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const nextCart: CartItem[] = [];
    Object.entries(counts).forEach(([id, quantity]) => {
      const found = MENU_ITEMS.find((m) => m.id === id);
      if (found) {
        nextCart.push({ item: found, quantity });
      }
    });

    if (nextCart.length > 0) {
      setCart(nextCart);
      setCartOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#171E1A]">
      <Navbar
        user={user}
        authReady={authReady}
        isAdmin={isAdmin}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        signingIn={signingIn}
      />

      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-900">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              aria-label="Dismiss sign-in notice"
              className="p-1 text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden border-b border-stone-200/80 bg-white px-4 py-2.5 flex items-center gap-4 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => handleNavigate('menu', 'daily-menu')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            activeSection === 'menu' ? 'text-[#166534] font-semibold' : 'text-stone-600'
          }`}
        >
          Menu
        </button>
        <button
          type="button"
          onClick={() => handleNavigate('orders')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            activeSection === 'orders' ? 'text-[#166534] font-semibold' : 'text-stone-600'
          }`}
        >
          My Orders
        </button>
        <button
          type="button"
          onClick={() => handleNavigate('profile')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            activeSection === 'profile' ? 'text-[#166534] font-semibold' : 'text-stone-600'
          }`}
        >
          Hostel Profile
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleNavigate('founder')}
            className={`whitespace-nowrap shrink-0 py-1 ${
              activeSection === 'founder' ? 'text-[#166534] font-semibold' : 'text-stone-600'
            }`}
          >
            Founder Console
          </button>
        )}
      </div>

      <main className="flex-1">
        {activeSection === 'menu' && (
          <>
            <HeroSection
              user={user}
              onBrowseMenu={() => handleNavigate('menu', 'daily-menu')}
              onSignIn={handleSignIn}
              signingIn={signingIn}
            />
            <MenuSection
              items={MENU_ITEMS}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onOpenCart={() => setCartOpen(true)}
            />
            <KitchenStorySection />
          </>
        )}

        {activeSection === 'orders' && (
          <OrdersSection
            user={user}
            authReady={authReady}
            onSignIn={handleSignIn}
            signingIn={signingIn}
            onRepeatOrder={handleRepeatOrder}
            onBrowseMenu={() => handleNavigate('menu', 'daily-menu')}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileSection
            user={user}
            profile={profile}
            onSignIn={handleSignIn}
            signingIn={signingIn}
          />
        )}

        {activeSection === 'founder' && <FounderConsole isAdmin={isAdmin} />}
      </main>

      <footer className="bg-white border-t border-stone-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-[#171E1A]">CampusBite</p>
            <p className="text-xs text-stone-500 mt-1">
              Dehradun, Uttarakhand · Affordable, hygienic homemade-style meals for hostel &amp; PG students
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-stone-600">
            <button
              type="button"
              onClick={() => handleNavigate('menu', 'daily-menu')}
              className="hover:text-[#171E1A] cursor-pointer"
            >
              Daily Menu
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('menu', 'our-kitchen')}
              className="hover:text-[#171E1A] cursor-pointer"
            >
              Kitchen Standards
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('orders')}
              className="hover:text-[#171E1A] cursor-pointer"
            >
              Order Tracking
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('profile')}
              className="hover:text-[#171E1A] cursor-pointer"
            >
              Hostel Delivery Setup
            </button>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={() => setCart([])}
        user={user}
        profile={profile}
        onSignIn={handleSignIn}
        signingIn={signingIn}
        onOrderSuccess={() => handleNavigate('orders')}
      />
    </div>
  );
}
