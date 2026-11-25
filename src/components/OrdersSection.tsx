import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { VALIDATION_LIMITS } from '../data/menuData';
import type {
  MealOrder,
  OrderFeedback,
  OrderStatus,
} from '../types/campusBite';

interface OrdersSectionProps {
  user: User | null;
  authReady: boolean;
  onSignIn: () => Promise<void>;
  signingIn: boolean;
  onRepeatOrder: (itemIds: string[]) => void;
  onBrowseMenu: () => void;
}

const STATUS_META: Record<
  OrderStatus,
  { label: string; colorClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: 'Order Received',
    colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
    Icon: Clock,
  },
  preparing: {
    label: 'Cooking in Kitchen',
    colorClass: 'text-sky-800 bg-sky-50 border-sky-200',
    Icon: ChefHat,
  },
  out_for_delivery: {
    label: 'Out for Hostel Delivery',
    colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    Icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    colorClass: 'text-[#166534] bg-emerald-50 border-emerald-200',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-stone-600 bg-stone-100 border-stone-200',
    Icon: XCircle,
  },
};

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  user,
  authReady,
  onSignIn,
  signingIn,
  onRepeatOrder,
  onBrowseMenu,
}) => {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, OrderFeedback>>({});
  const [loading, setLoading] = useState(true);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [priceFeelsAffordable, setPriceFeelsAffordable] = useState(true);
  const [wouldRefer, setWouldRefer] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !user) {
      setOrders([]);
      setFeedbackMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('userId', '==', user.uid)
    );

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const loaded = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MealOrder, 'id'>),
        }));
        loaded.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() ?? 0;
          const tB = b.createdAt?.toMillis?.() ?? 0;
          return tB - tA;
        });
        setOrders(loaded);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    const unsubFeedback = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const nextMap: Record<string, OrderFeedback> = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as Omit<OrderFeedback, 'id'>;
          nextMap[data.orderId] = { id: docSnap.id, ...data };
        });
        setFeedbackMap(nextMap);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'feedback');
      }
    );

    return () => {
      unsubOrders();
      unsubFeedback();
    };
  }, [authReady, user]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingFeedback(true);

    const cleanComment = comment.trim().slice(0, VALIDATION_LIMITS.feedbackCommentMax);
    const payload: Record<string, unknown> = {
      orderId,
      userId: user.uid,
      rating,
      priceFeelsAffordable,
      wouldRefer,
      createdAt: serverTimestamp(),
    };
    if (cleanComment.length > 0) {
      payload.comment = cleanComment;
    }

    try {
      await setDoc(doc(db, 'feedback', orderId), payload);
      setReviewingOrderId(null);
      setComment('');
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `feedback/${orderId}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 min-h-[65vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-stone-500 mb-2">
            Real-Time Meal Tracking &amp; Reordering
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#171E1A]">
            My Meal Orders
          </h1>
        </div>

        {!user ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-[#171E1A]">
              Sign in with Google to view your orders
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto mb-6">
              Track live kitchen preparation, reorder favorite thalis in one tap, and share post-meal feedback.
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
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((key) => (
              <div
                key={key}
                className="h-36 bg-white border border-stone-200 rounded-xl p-6 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
            <h2 className="font-display text-xl font-semibold text-[#171E1A]">
              No meal orders placed yet
            </h2>
            <p className="text-sm text-stone-600 mt-1.5 mb-6">
              Pick a fresh homestyle thali or comfort bowl from today&apos;s menu to place your first pre-order.
            </p>
            <button
              type="button"
              onClick={onBrowseMenu}
              className="px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusMeta = STATUS_META[order.status] || STATUS_META.pending;
              const StatusIcon = statusMeta.Icon;
              const existingFeedback = feedbackMap[order.id];
              const isReviewOpen = reviewingOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="bg-white border border-stone-200 rounded-xl p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <p className="text-xs font-mono text-stone-500">
                        Order #{order.id.slice(0, 8).toUpperCase()} · {order.mealSlot}
                      </p>
                      <h2 className="text-base font-semibold text-[#171E1A] mt-1">
                        {order.itemsSummary}
                      </h2>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg self-start sm:self-auto whitespace-nowrap shrink-0 ${statusMeta.colorClass}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusMeta.label}</span>
                    </div>
                  </div>

                  <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-stone-500">Delivery Address</p>
                      <p className="font-medium text-[#171E1A] mt-0.5">
                        {order.deliveryLocation}
                      </p>
                      <p className="text-xs text-stone-500">{order.area}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Payment</p>
                      <p className="font-medium text-[#171E1A] mt-0.5">
                        {order.paymentMethod}
                      </p>
                      <p className="text-xs text-stone-500">
                        {order.totalItems} {order.totalItems === 1 ? 'meal' : 'meals'}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-stone-500">Order Total</p>
                      <p className="text-lg font-semibold text-[#171E1A] tabular-nums mt-0.5">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onRepeatOrder(order.itemIds)}
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-[#171E1A] bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Repeat Order</span>
                    </button>

                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-stone-700 border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    {order.status !== 'cancelled' && !existingFeedback && (
                      <button
                        type="button"
                        onClick={() =>
                          setReviewingOrderId(isReviewOpen ? null : order.id)
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-[#166534] border border-[#166534]/30 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{isReviewOpen ? 'Close Review' : 'Rate Meal & Price'}</span>
                      </button>
                    )}

                    {existingFeedback && (
                      <div className="text-xs text-stone-600 flex items-center gap-2 ml-auto">
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span className="font-medium text-[#171E1A] tabular-nums">
                          Rated {existingFeedback.rating}/5
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {existingFeedback.priceFeelsAffordable
                            ? 'Price felt affordable'
                            : 'Price feedback shared'}
                        </span>
                      </div>
                    )}
                  </div>

                  {isReviewOpen && !existingFeedback && (
                    <form
                      onSubmit={(e) => handleSubmitFeedback(e, order.id)}
                      className="mt-5 pt-5 border-t border-stone-200 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#171E1A]">
                            How was your meal?
                          </p>
                          <p className="text-xs text-stone-500">
                            Your rating helps us improve taste, hygiene, and student pricing.
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              aria-label={`Rate ${value} out of 5 stars`}
                              className="p-1.5 cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  value <= rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6 text-xs text-stone-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={priceFeelsAffordable}
                            onChange={(e) => setPriceFeelsAffordable(e.target.checked)}
                            className="rounded border-stone-300 text-[#166534]"
                          />
                          <span>The ~₹100 price feels affordable for regular meals</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={wouldRefer}
                            onChange={(e) => setWouldRefer(e.target.checked)}
                            className="rounded border-stone-300 text-[#166534]"
                          />
                          <span>Would recommend to hostel/PG friends</span>
                        </label>
                      </div>

                      <textarea
                        rows={2}
                        maxLength={VALIDATION_LIMITS.feedbackCommentMax}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share quick feedback on taste, portion size, or delivery timing..."
                        className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-[#171E1A] focus:outline-none focus:border-[#166534]"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="px-4 py-2 min-h-[40px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg cursor-pointer disabled:opacity-60"
                        >
                          {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
