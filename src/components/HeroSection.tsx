import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { ArrowRight, Utensils } from 'lucide-react';
import { HERO_IMAGE } from '../data/menuData';

interface HeroSectionProps {
  user: User | null;
  onBrowseMenu: () => void;
  onSignIn: () => Promise<void>;
  signingIn: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  onBrowseMenu,
  onSignIn,
  signingIn,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section id="top" className="pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <p className="text-xs font-medium tracking-wide text-stone-500 mb-4">
              Dehradun Student Meal Service · Hostels, PGs &amp; Campus Gates
            </p>
            <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] font-semibold tracking-tight text-[#171E1A] text-balance mb-5">
              Fresh, homemade meals built for Dehradun hostel life.
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mb-8">
              Skip repetitive canteen trays and ₹200+ delivery markups. CampusBite cooks small-batch homestyle thalis, bowls, and chai combos around ₹100 per meal and delivers right to your hostel or PG.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onBrowseMenu}
                className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
              >
                <span>Browse Today&apos;s Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!user && (
                <button
                  type="button"
                  onClick={onSignIn}
                  disabled={signingIn}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-[#171E1A] bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                >
                  <span>{signingIn ? 'Connecting Google...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
              {!imgFailed ? (
                <img
                  src={HERO_IMAGE}
                  alt="Freshly prepared Indian homestyle thali with dal, rice, phulkas, paneer sabzi, salad, and buttermilk"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600">
                  <Utensils className="w-10 h-10 mb-3 text-[#166534]" />
                  <p className="font-display text-lg font-medium text-[#171E1A]">
                    CampusBite Daily Homestyle Thali
                  </p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6">
                <p className="text-sm font-medium text-white">
                  Today&apos;s Kitchen Anchor · Homestyle Veg Thali at ₹100
                </p>
                <p className="text-xs text-stone-200 mt-1">
                  Prepared fresh before each slot · Zero delivery surcharges
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-stone-500">Student Price Range</p>
            <p className="mt-1 text-xl font-semibold text-[#171E1A] tabular-nums">₹60 – ₹115</p>
            <p className="mt-0.5 text-xs text-stone-500">Core meals around ₹100</p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Daily Delivery Windows</p>
            <p className="mt-1 text-xl font-semibold text-[#171E1A] tabular-nums">3 Slots</p>
            <p className="mt-0.5 text-xs text-stone-500">Lunch · Evening · Dinner</p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Delivery Markup</p>
            <p className="mt-1 text-xl font-semibold text-[#171E1A] tabular-nums">₹0</p>
            <p className="mt-0.5 text-xs text-stone-500">Direct to hostels &amp; PGs</p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Dehradun Coverage</p>
            <p className="mt-1 text-xl font-semibold text-[#171E1A] tabular-nums">6 Zones</p>
            <p className="mt-0.5 text-xs text-stone-500">Prem Nagar to Rajpur Road</p>
          </div>
        </div>
      </div>
    </section>
  );
};
