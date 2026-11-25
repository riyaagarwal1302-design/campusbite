import type { Timestamp } from 'firebase/firestore';

export type MenuCategory = 'All' | 'Daily Thalis' | 'Comfort Bowls' | 'Snacks & Chai';

export type MealSlot =
  | 'Lunch (12:30 - 2:00 PM)'
  | 'Evening (4:30 - 6:00 PM)'
  | 'Dinner (7:30 - 9:30 PM)';

export type PaymentMethod = 'UPI on Delivery' | 'Cash on Delivery';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type ActiveSection = 'menu' | 'orders' | 'profile' | 'founder';

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuCategory, 'All'>;
  price: number;
  portionNote: string;
  calories: string;
  prepWindow: string;
  description: string;
  ingredients: string[];
  image: string;
  dietaryTag: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  college?: string;
  hostelOrPg?: string;
  area?: string;
  roomNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MealOrder {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  phone: string;
  deliveryLocation: string;
  area: string;
  mealSlot: MealSlot;
  paymentMethod: PaymentMethod;
  itemsSummary: string;
  itemIds: string[];
  totalItems: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderFeedback {
  id: string;
  orderId: string;
  userId: string;
  rating: number;
  priceFeelsAffordable: boolean;
  wouldRefer: boolean;
  comment?: string;
  createdAt: Timestamp;
}
