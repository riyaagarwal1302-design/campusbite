import React from 'react';
import { STUDENT_REVIEWS } from '../data/menuData';

export const KitchenStorySection: React.FC = () => {
  return (
    <section
      id="our-kitchen"
      className="py-12 sm:py-16 bg-white border-t border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-200/80">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-stone-500 mb-2">
              Why CampusBite Exists
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#171E1A] text-balance">
              Built for students living away from home in Dehradun.
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-[#171E1A]">
                01. Hygienic Home-Kitchen Standards
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Every meal is cooked in small batches using RO water, fresh local vegetables, and low-oil tempering—never reheated bulk canteen stock.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171E1A]">
                02. Predictable ₹100 Student Pricing
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Restaurant delivery apps easily push a simple meal to ₹180–₹250 with platform fees. Our focused menu keeps daily eating comfortable on a student budget.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171E1A]">
                03. Timed Around Class &amp; Exam Schedules
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Pre-order for Lunch, Evening Chai, or Dinner slots so food reaches your hostel gate or PG right when lectures wrap up.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171E1A]">
                04. WhatsApp &amp; Web Pre-Ordering
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Sign in with Google to save your hostel address, track live meal status, repeat past orders in one tap, or share your tray summary straight to WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12">
          <p className="text-xs font-medium text-stone-500 mb-2">
            Dehradun Hostel &amp; PG Community
          </p>
          <h3 className="font-display text-2xl font-semibold text-[#171E1A] mb-8">
            What local students say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STUDENT_REVIEWS.map((review) => (
              <blockquote
                key={review.name}
                className="p-6 bg-[#FAFAF8] border border-stone-200/80 rounded-xl flex flex-col justify-between"
              >
                <p className="text-sm text-stone-700 leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="mt-5 pt-4 border-t border-stone-200/70">
                  <p className="text-sm font-semibold text-[#171E1A]">{review.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{review.context}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
