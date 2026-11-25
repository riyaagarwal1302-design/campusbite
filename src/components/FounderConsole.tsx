import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { MealOrder, OrderFeedback, OrderStatus } from '../types/campusBite';

interface FounderConsoleProps {
  isAdmin: boolean;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  pending: { next: 'preparing', label: 'Start Preparing' },
  preparing: { next: 'out_for_delivery', label: 'Dispatch to Hostel' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered' },
};

export const FounderConsole: React.FC<FounderConsoleProps> = ({ isAdmin }) => {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [feedbackList, setFeedbackList] = useState<OrderFeedback[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MealOrder, 'id'>),
        }));
        list.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() ?? 0;
          const tB = b.createdAt?.toMillis?.() ?? 0;
          return tB - tA;
        });
        setOrders(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
    );

    const unsubFeedback = onSnapshot(
      collection(db, 'feedback'),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<OrderFeedback, 'id'>),
        }));
        setFeedbackList(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'feedback')
    );

    return () => {
      unsubOrders();
      unsubFeedback();
    };
  }, [isAdmin]);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const countsByUser: Record<string, number> = {};
    let revenue = 0;

    activeOrders.forEach((order) => {
      countsByUser[order.userId] = (countsByUser[order.userId] || 0) + 1;
      revenue += order.totalAmount || 0;
    });

    const uniqueCustomers = Object.keys(countsByUser).length;
    const repeatCustomers = Object.values(countsByUser).filter((c) => c >= 2).length;
    const repeatRate =
      uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

    const avgRating =
      feedbackList.length > 0
        ? (
            feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length
          ).toFixed(1)
        : '—';

    const affordablePct =
      feedbackList.length > 0
        ? Math.round(
            (feedbackList.filter((f) => f.priceFeelsAffordable).length /
              feedbackList.length) *
              100
          )
        : 0;

    return {
      uniqueCustomers,
      repeatRate,
      avgRating,
      affordablePct,
      revenue,
      totalActiveOrders: activeOrders.length,
    };
  }, [orders, feedbackList]);

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <section className="py-12 sm:py-16 min-h-[65vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <p className="text-xs font-medium text-stone-500 mb-2">
            30-Day Venture Validation &amp; Kitchen Dispatch
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#171E1A]">
            Founder Console
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-500">Paying Students (30-day goal: 20)</p>
            <p className="mt-2 text-2xl font-semibold text-[#171E1A] tabular-nums">
              {metrics.uniqueCustomers} / 20
            </p>
            <p className="mt-1 text-xs text-stone-500 tabular-nums">
              {metrics.totalActiveOrders} active orders · ₹{metrics.revenue} gross
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-500">Repeat Order Rate (Goal: 30%)</p>
            <p className="mt-2 text-2xl font-semibold text-[#171E1A] tabular-nums">
              {metrics.repeatRate}%
            </p>
            <p className="mt-1 text-xs text-stone-500">Students ordering 2+ times</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-500">Average Satisfaction (Goal: 4.0/5)</p>
            <p className="mt-2 text-2xl font-semibold text-[#171E1A] tabular-nums">
              {metrics.avgRating} / 5
            </p>
            <p className="mt-1 text-xs text-stone-500 tabular-nums">
              Based on {feedbackList.length} verified reviews
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-500">₹100 Affordability Validation</p>
            <p className="mt-2 text-2xl font-semibold text-[#171E1A] tabular-nums">
              {feedbackList.length > 0 ? `${metrics.affordablePct}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-stone-500">Students rating price affordable</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#171E1A]">
              Live Kitchen Order Queue
            </h2>
            <span className="text-xs text-stone-500 tabular-nums">
              {orders.length} total records
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              No student meal orders recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-500">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Student &amp; Hostel</th>
                    <th className="py-3 px-4">Meals &amp; Slot</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => {
                    const nextAction = NEXT_STATUS[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-stone-50/70">
                        <td className="py-3.5 px-4 font-mono text-xs text-stone-600 whitespace-nowrap">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#171E1A]">{order.studentName}</p>
                          <p className="text-xs text-stone-500">
                            {order.deliveryLocation}, {order.area} · {order.phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-[#171E1A]">{order.itemsSummary}</p>
                          <p className="text-xs text-stone-500">{order.mealSlot}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold tabular-nums text-[#171E1A] whitespace-nowrap">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-stone-700 capitalize whitespace-nowrap">
                          {order.status.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {nextAction ? (
                            <button
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() =>
                                handleAdvanceStatus(order.id, nextAction.next)
                              }
                              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {updatingId === order.id ? 'Updating...' : nextAction.label}
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
