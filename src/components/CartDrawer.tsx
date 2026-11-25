import React, { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Check,
  Copy,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  DEHRADUN_AREAS,
  MEAL_SLOTS,
  PAYMENT_METHODS,
  VALIDATION_LIMITS,
} from '../data/menuData';
import type {
  CartItem,
  MealSlot,
  PaymentMethod,
  UserProfile,
} from '../types/campusBite';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  user: User | null;
  profile: UserProfile | null;
  onSignIn: () => Promise<void>;
  signingIn: boolean;
  onOrderSuccess: () => void;
}

interface ConfirmedOrderSummary {
  orderId: string;
  itemsSummary: string;
  totalAmount: number;
  mealSlot: MealSlot;
  deliveryLocation: string;
  area: string;
  paymentMethod: PaymentMethod;
  phone: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  user,
  profile,
  onSignIn,
  signingIn,
  onOrderSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState(DEHRADUN_AREAS[0]);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [mealSlot, setMealSlot] = useState<MealSlot>(MEAL_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI on Delivery');
  const [notes, setNotes] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderSummary | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.phone) setPhone(profile.phone);
      if (profile.area && DEHRADUN_AREAS.includes(profile.area)) setArea(profile.area);
      const composedLocation = [profile.hostelOrPg, profile.roomNumber ? `Room ${profile.roomNumber}` : '']
        .filter(Boolean)
        .join(', ');
      if (composedLocation) setDeliveryLocation(composedLocation);
    }
  }, [profile]);

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, entry) => ({
        count: acc.count + entry.quantity,
        amount: acc.amount + entry.item.price * entry.quantity,
      }),
      { count: 0, amount: 0 }
    );
  }, [cart]);

  if (!isOpen) return null;

  const buildWhatsAppMessage = (summary: ConfirmedOrderSummary) => {
    return [
      `Hi CampusBite, I just pre-ordered a meal:`,
      `Order Ref: #${summary.orderId.slice(0, 8).toUpperCase()}`,
      `Meals: ${summary.itemsSummary}`,
      `Total: ₹${summary.totalAmount} (${summary.paymentMethod})`,
      `Slot: ${summary.mealSlot}`,
      `Deliver to: ${summary.deliveryLocation}, ${summary.area}`,
      `Phone: ${summary.phone}`,
    ].join('\n');
  };

  const handleCopyWhatsApp = async () => {
    if (!confirmedOrder) return;
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage(confirmedOrder));
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2500);
    } catch {
      setCopiedWhatsApp(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);

    const cleanPhone = phone.trim().slice(0, VALIDATION_LIMITS.phoneMax);
    const cleanLocation = deliveryLocation.trim().slice(0, VALIDATION_LIMITS.deliveryLocationMax);
    const cleanArea = area.trim().slice(0, VALIDATION_LIMITS.areaMax);
    const cleanNotes = notes.trim().slice(0, VALIDATION_LIMITS.notesMax);

    if (
      cleanPhone.length < VALIDATION_LIMITS.phoneMin ||
      !VALIDATION_LIMITS.phonePattern.test(cleanPhone)
    ) {
      setFormError('Enter a valid 10-digit WhatsApp / mobile number for delivery.');
      return;
    }

    if (cleanLocation.length < VALIDATION_LIMITS.deliveryLocationMin) {
      setFormError('Enter your hostel, PG name, or campus gate.');
      return;
    }

    if (totals.count < 1 || totals.count > VALIDATION_LIMITS.maxOrderItems) {
      setFormError(`Please keep total items per order between 1 and ${VALIDATION_LIMITS.maxOrderItems}.`);
      return;
    }

    const itemsSummary = cart
      .map((entry) => `${entry.quantity}x ${entry.item.name}`)
      .join(', ')
      .slice(0, VALIDATION_LIMITS.itemsSummaryMax);

    const itemIds = cart
      .flatMap((entry) => Array(entry.quantity).fill(entry.item.id) as string[])
      .slice(0, VALIDATION_LIMITS.maxOrderItems);

    const studentName = (user.displayName || profile?.displayName || 'CampusBite Student')
      .trim()
      .slice(0, VALIDATION_LIMITS.displayNameMax);
    const studentEmail = (user.email || profile?.email || '')
      .trim()
      .slice(0, VALIDATION_LIMITS.emailMax);

    setSubmitting(true);
    try {
      const orderRef = doc(collection(db, 'orders'));
      const orderPayload: Record<string, unknown> = {
        userId: user.uid,
        studentName,
        studentEmail,
        phone: cleanPhone,
        deliveryLocation: cleanLocation,
        area: cleanArea,
        mealSlot,
        paymentMethod,
        itemsSummary,
        itemIds,
        totalItems: totals.count,
        totalAmount: totals.amount,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (cleanNotes.length > 0) {
        orderPayload.notes = cleanNotes;
      }

      try {
        await setDoc(orderRef, orderPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderRef.id}`);
      }

      if (saveAddress) {
        const userRef = doc(db, 'users', user.uid);
        try {
          if (profile) {
            await updateDoc(userRef, {
              phone: cleanPhone,
              hostelOrPg: cleanLocation.slice(0, VALIDATION_LIMITS.hostelOrPgMax),
              area: cleanArea,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(userRef, {
              uid: user.uid,
              email: studentEmail,
              displayName: studentName,
              ...(user.photoURL ? { photoURL: user.photoURL.slice(0, VALIDATION_LIMITS.photoUrlMax) } : {}),
              phone: cleanPhone,
              hostelOrPg: cleanLocation.slice(0, VALIDATION_LIMITS.hostelOrPgMax),
              area: cleanArea,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      setConfirmedOrder({
        orderId: orderRef.id,
        itemsSummary,
        totalAmount: totals.amount,
        mealSlot,
        deliveryLocation: cleanLocation,
        area: cleanArea,
        paymentMethod,
        phone: cleanPhone,
      });
      setNotes('');
      onClearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meal Tray and Checkout"
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FAFAF8] h-full shadow-2xl border-l border-stone-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#166534]" />
            <h2 className="font-display text-xl font-semibold text-[#171E1A]">
              Your Meal Tray
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            aria-label="Close meal tray"
            className="p-2 text-stone-500 hover:text-[#171E1A] hover:bg-stone-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {confirmedOrder ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#166534]">
                  Order #{confirmedOrder.orderId.slice(0, 8).toUpperCase()} Confirmed
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#171E1A] mt-1">
                  Preparing your homemade meal
                </h3>
                <p className="text-sm text-stone-600 mt-2">
                  Scheduled for <span className="font-medium text-[#171E1A]">{confirmedOrder.mealSlot}</span> to{' '}
                  {confirmedOrder.deliveryLocation}, {confirmedOrder.area}.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Items</span>
                  <span className="text-right font-medium text-[#171E1A]">
                    {confirmedOrder.itemsSummary}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Payment</span>
                  <span className="text-[#171E1A]">
                    {confirmedOrder.paymentMethod} ·{' '}
                    <span className="font-semibold tabular-nums">
                      ₹{confirmedOrder.totalAmount}
                    </span>
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-3">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#171E1A] bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedWhatsApp ? (
                    <>
                      <Check className="w-4 h-4 text-[#166534]" />
                      <span>WhatsApp Summary Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy WhatsApp Order Summary</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                    onOrderSuccess();
                  }}
                  className="w-full px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer"
                >
                  Track in My Orders
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-base font-medium text-[#171E1A]">Your meal tray is empty</p>
              <p className="text-sm text-stone-500 mt-1 mb-6">
                Add a homemade thali, comfort bowl, or evening chai combo from today&apos;s menu.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#166534] hover:bg-[#14532D] rounded-lg cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171E1A] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                        ₹{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Remove one ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#171E1A] cursor-pointer"
                        >
                          {quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums text-[#171E1A]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Add one ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#171E1A] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="w-14 text-right text-sm font-semibold tabular-nums text-[#171E1A]">
                        ₹{item.price * quantity}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-stone-50/60 space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Hostel / PG Delivery</span>
                    <span className="font-medium text-[#166534]">Free (₹0)</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base text-[#171E1A] pt-1">
                    <span>Total Payable</span>
                    <span className="tabular-nums">₹{totals.amount}</span>
                  </div>
                </div>
              </div>

              {!user ? (
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#171E1A]">
                      Sign in with Google to pre-order
                    </h3>
                    <p className="text-sm text-stone-600 mt-1">
                      Your Google account saves your Dehradun hostel or PG address and lets you track meal delivery in real time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onSignIn}
                    disabled={signingIn}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-semibold text-[#171E1A]">
                    Delivery &amp; Meal Slot
                  </h3>

                  <div>
                    <label
                      htmlFor="checkout-slot"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      Delivery Window
                    </label>
                    <select
                      id="checkout-slot"
                      value={mealSlot}
                      onChange={(e) => setMealSlot(e.target.value as MealSlot)}
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    >
                      {MEAL_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-area"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      Dehradun Locality
                    </label>
                    <select
                      id="checkout-area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    >
                      {DEHRADUN_AREAS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-location"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      Hostel / PG Name &amp; Room / Gate
                    </label>
                    <input
                      id="checkout-location"
                      type="text"
                      required
                      maxLength={VALIDATION_LIMITS.deliveryLocationMax}
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g., Himalaya Boys Hostel, Room 204"
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      WhatsApp / Mobile Number
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      maxLength={VALIDATION_LIMITS.phoneMax}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., +91 98765 43210"
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-payment"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      Payment Mode
                    </label>
                    <select
                      id="checkout-payment"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-notes"
                      className="block text-xs font-medium text-stone-600 mb-1.5"
                    >
                      Spice or Gate Note (Optional)
                    </label>
                    <input
                      id="checkout-notes"
                      type="text"
                      maxLength={VALIDATION_LIMITS.notesMax}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Less spicy dal, call on arrival"
                      className="w-full px-3 py-2.5 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="rounded border-stone-300 text-[#166534] focus:ring-[#166534]"
                    />
                    <span>Save hostel &amp; phone for faster repeat orders</span>
                  </label>

                  {formError && (
                    <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {submitting
                      ? 'Confirming Pre-Order...'
                      : `Place Meal Order · ₹${totals.amount}`}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
