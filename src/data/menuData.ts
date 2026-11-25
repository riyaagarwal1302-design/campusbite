import type { MealSlot, MenuItem, PaymentMethod } from '../types/campusBite';

export const ADMIN_EMAIL = 'riyaagarwal1302@gmail.com';

export const HERO_IMAGE = '/src/assets/images/hero_campusbite_meals_1795583947430.jpg';

export const VALIDATION_LIMITS = {
  uidMax: 128,
  emailMax: 200,
  displayNameMax: 100,
  photoUrlMax: 500,
  phoneMin: 7,
  phoneMax: 20,
  phonePattern: /^[0-9+\-\s]*$/,
  collegeMax: 120,
  hostelOrPgMax: 120,
  areaMax: 100,
  roomNumberMax: 40,
  deliveryLocationMin: 3,
  deliveryLocationMax: 200,
  itemsSummaryMax: 500,
  maxOrderItems: 20,
  notesMax: 300,
  feedbackCommentMax: 400,
};

export const MEAL_SLOTS: MealSlot[] = [
  'Lunch (12:30 - 2:00 PM)',
  'Evening (4:30 - 6:00 PM)',
  'Dinner (7:30 - 9:30 PM)',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI on Delivery',
  'Cash on Delivery',
];

export const DEHRADUN_AREAS: string[] = [
  'Prem Nagar & Nanda Ki Chowki',
  'Clement Town & Subhash Nagar',
  'Rajpur Road & Jakhan',
  'Sahastradhara Road & IT Park',
  'Karanpur & Dalanwala',
  'Bidholi & Pondha Campus Belt',
];

export const DEHRADUN_COLLEGES: string[] = [
  'DBS Global University',
  'UPES Dehradun',
  'Graphic Era University',
  'Uttaranchal University',
  'DIT University',
  'Doon University',
  'Other Dehradun College / PG',
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'homestyle-veg-thali',
    name: 'Homestyle Veg Thali',
    category: 'Daily Thalis',
    price: 100,
    portionNote: 'Full Meal · 4 Phulkas + Rice + Dal + Sabzi',
    calories: '640 kcal',
    prepWindow: 'Lunch & Dinner',
    dietaryTag: '100% Pure Veg',
    description:
      'Yellow arhar dal tadka, steamed basmati rice, 4 soft whole-wheat phulkas, seasonal aloo gobi sabzi, and cool cucumber raita.',
    ingredients: [
      'Chakki atta whole-wheat phulkas',
      'Cumin-tempered arhar dal',
      'Seasonal aloo gobi matar',
      'Fresh homemade curd raita',
    ],
    image: '/src/assets/images/dish_homestyle_thali_1795583948069.jpg',
  },
  {
    id: 'rajma-chawal-bowl',
    name: 'Pahadi Rajma Chawal Bowl',
    category: 'Comfort Bowls',
    price: 90,
    portionNote: '550g Bowl · Red Onions & Green Chutney',
    calories: '560 kcal',
    prepWindow: 'Lunch & Dinner',
    dietaryTag: 'High Fiber',
    description:
      'Slow-simmered Uttarakhand mountain rajma cooked in mild tomato-ginger gravy over fluffy basmati rice with mint chutney.',
    ingredients: [
      'Organic mountain rajma',
      'Aged basmati rice',
      'Fresh mint-coriander chutney',
      'Crisp red onion rings & lemon',
    ],
    image: '/src/assets/images/dish_rajma_chawal_1795583948014.jpg',
  },
  {
    id: 'paneer-bhurji-paratha',
    name: 'Paneer Bhurji & Tawa Paratha Box',
    category: 'Daily Thalis',
    price: 115,
    portionNote: 'Protein Meal · 2 Ajwain Parathas + Bhurji',
    calories: '680 kcal',
    prepWindow: 'Lunch & Dinner',
    dietaryTag: 'High Protein',
    description:
      'Freshly crumbled dairy paneer sautéed with bell peppers, onions, and mild spices, served with two flaky whole-wheat parathas.',
    ingredients: [
      'Fresh low-oil malai paneer',
      'Whole-wheat ajwain tawa parathas',
      'House-ground coriander & jeera',
      'Green mint yogurt dip',
    ],
    image: '/src/assets/images/dish_paneer_paratha_1795583948742.jpg',
  },
  {
    id: 'moong-millet-khichdi',
    name: 'Ghee-Tempered Moong Khichdi',
    category: 'Comfort Bowls',
    price: 85,
    portionNote: '500g Bowl · Fresh Curd & Roasted Papad',
    calories: '470 kcal',
    prepWindow: 'Lunch & Dinner',
    dietaryTag: 'Light & Gut-Friendly',
    description:
      'Warm, light yellow moong dal and millet khichdi finished with pure cow ghee, cumin tadka, homemade curd, and roasted papad.',
    ingredients: [
      'Split yellow moong dal & bajra',
      'Pure A2 ghee & roasted cumin',
      'Fresh chilled dahi bowl',
      'Fire-roasted moong papad',
    ],
    image: '/src/assets/images/dish_moong_khichdi_1795583949993.jpg',
  },
  {
    id: 'poha-masala-chai',
    name: 'Kanda Poha & Kulhad Masala Chai',
    category: 'Snacks & Chai',
    price: 60,
    portionNote: 'Study Break Combo · 300g Poha + 200ml Chai',
    calories: '380 kcal',
    prepWindow: 'Evening Slot',
    dietaryTag: 'Light Snack',
    description:
      'Fluffy flattened rice tossed with mustard seeds, curry leaves, roasted peanuts, and lemon, paired with crushed-ginger masala chai.',
    ingredients: [
      'Thick Indori flattened poha',
      'Roasted crunchy peanuts & sev',
      'Fresh ginger-cardamom chai',
      'Coriander & lemon wedge',
    ],
    image: '/src/assets/images/dish_poha_chai_1795583949206.jpg',
  },
  {
    id: 'grilled-paneer-wrap-coffee',
    name: 'Grilled Paneer Wrap & Cold Coffee',
    category: 'Snacks & Chai',
    price: 95,
    portionNote: 'Evening Fuel · Whole-Wheat Wrap + 300ml Coffee',
    calories: '510 kcal',
    prepWindow: 'Evening & Dinner',
    dietaryTag: 'Student Favorite',
    description:
      'Toasted multigrain roti stuffed with smoky grilled paneer cubes, crunchy veggies, and mint mayo, paired with chilled creamy coffee.',
    ingredients: [
      'Grilled herb-marinated paneer',
      'Crisp lettuce, capsicum & onion',
      'Whole-wheat multigrain wrap',
      'Chilled blended cold coffee',
    ],
    image: '/src/assets/images/dish_wrap_coldcoffee_1795583951074.jpg',
  },
];

export const STUDENT_REVIEWS = [
  {
    name: 'Ananya Verma',
    context: 'MBA Student, DBS Global University · Prem Nagar Hostel',
    quote:
      'Delivery apps were costing me ₹190+ per meal with packaging fees. CampusBite thalis arrive warm at ₹100 and taste like home.',
  },
  {
    name: 'Rohan Bisht',
    context: 'B.Tech CSE, UPES · Pondha PG',
    quote:
      'Having the evening poha and chai or paneer wrap between lab submissions saves me an hour every day without relying on oily street food.',
  },
  {
    name: 'Mehek Negi',
    context: 'B.Com Hons, Graphic Era · Clement Town PG',
    quote:
      'Consistent hygiene and zero delivery markup made it easy to switch my weekday dinners here with three of my hostel roommates.',
  },
];
