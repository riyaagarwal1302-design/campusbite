import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEHRADUN_AREAS,
  DEHRADUN_COLLEGES,
  VALIDATION_LIMITS,
} from '../data/menuData';
import type { UserProfile } from '../types/campusBite';

interface ProfileSectionProps {
  user: User | null;
  profile: UserProfile | null;
  onSignIn: () => Promise<void>;
  signingIn: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  profile,
  onSignIn,
  signingIn,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState(DEHRADUN_COLLEGES[0]);
  const [area, setArea] = useState(DEHRADUN_AREAS[0]);
  const [hostelOrPg, setHostelOrPg] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(profile?.displayName || user.displayName || '');
      setPhone(profile?.phone || '');
      setCollege(
        profile?.college && DEHRADUN_COLLEGES.includes(profile.college)
          ? profile.college
          : DEHRADUN_COLLEGES[0]
      );
      setArea(
        profile?.area && DEHRADUN_AREAS.includes(profile.area)
          ? profile.area
          : DEHRADUN_AREAS[0]
      );
      setHostelOrPg(profile?.hostelOrPg || '');
      setRoomNumber(profile?.roomNumber || '');
    }
  }, [user, profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);
    setSavedNotice(false);

    const cleanName = displayName.trim().slice(0, VALIDATION_LIMITS.displayNameMax);
    const cleanPhone = phone.trim().slice(0, VALIDATION_LIMITS.phoneMax);
    const cleanHostel = hostelOrPg.trim().slice(0, VALIDATION_LIMITS.hostelOrPgMax);
    const cleanRoom = roomNumber.trim().slice(0, VALIDATION_LIMITS.roomNumberMax);

    if (!cleanName) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (cleanPhone && !VALIDATION_LIMITS.phonePattern.test(cleanPhone)) {
      setErrorMsg('Phone number may only include digits, spaces, + or -.');
      return;
    }

    setSaving(true);
    const userRef = doc(db, 'users', user.uid);
    try {
      if (profile) {
        await updateDoc(userRef, {
          displayName: cleanName,
          phone: cleanPhone,
          college: college.slice(0, VALIDATION_LIMITS.collegeMax),
          area: area.slice(0, VALIDATION_LIMITS.areaMax),
          hostelOrPg: cleanHostel,
          roomNumber: cleanRoom,
          ...(user.photoURL
            ? { photoURL: user.photoURL.slice(0, VALIDATION_LIMITS.photoUrlMax) }
            : {}),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: (user.email || '').slice(0, VALIDATION_LIMITS.emailMax),
          displayName: cleanName,
          ...(user.photoURL
            ? { photoURL: user.photoURL.slice(0, VALIDATION_LIMITS.photoUrlMax) }
            : {}),
          phone: cleanPhone,
          college: college.slice(0, VALIDATION_LIMITS.collegeMax),
          area: area.slice(0, VALIDATION_LIMITS.areaMax),
          hostelOrPg: cleanHostel,
          roomNumber: cleanRoom,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (error) {
      handleFirestoreError(
        error,
        profile ? OperationType.UPDATE : OperationType.CREATE,
        `users/${user.uid}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 min-h-[65vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-stone-500 mb-2">
            Saved Delivery Preferences
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#171E1A]">
            Hostel &amp; PG Profile
          </h1>
        </div>

        {!user ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-[#171E1A]">
              Sign in with Google to save your hostel address
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto mb-6">
              Save your Dehradun college, hostel or PG building, and WhatsApp number once for one-click meal pre-ordering.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              disabled={signingIn}
              className="px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-4 pb-5 border-b border-stone-100">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Student'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#166534] text-white font-semibold flex items-center justify-center">
                  {(user.displayName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171E1A] truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  Google Verified · {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  maxLength={VALIDATION_LIMITS.displayNameMax}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  WhatsApp / Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  maxLength={VALIDATION_LIMITS.phoneMax}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-college"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  College / University
                </label>
                <select
                  id="profile-college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                >
                  {DEHRADUN_COLLEGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-area"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  Dehradun Locality
                </label>
                <select
                  id="profile-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                >
                  {DEHRADUN_AREAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="profile-hostel"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  Hostel / PG Building Name
                </label>
                <input
                  id="profile-hostel"
                  type="text"
                  maxLength={VALIDATION_LIMITS.hostelOrPgMax}
                  value={hostelOrPg}
                  onChange={(e) => setHostelOrPg(e.target.value)}
                  placeholder="e.g., Shivalik Residency PG"
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-room"
                  className="block text-xs font-medium text-stone-600 mb-1.5"
                >
                  Room / Gate
                </label>
                <input
                  id="profile-room"
                  type="text"
                  maxLength={VALIDATION_LIMITS.roomNumberMax}
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Room 108"
                  className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                {savedNotice && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#166534]">
                    <Check className="w-4 h-4" />
                    Delivery preferences saved
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
