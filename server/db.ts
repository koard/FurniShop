import 'server-only';
import { createHash } from 'node:crypto';
import { nanoid } from 'nanoid';
import type { Product } from '../types/product';
import type { Promotion } from '../types/promotion';
import type { Order } from '../types/order';
import type { User, Session } from '../types/user';
import { DeliveryStatus } from '../types/enums';

export type StoredUser = User & { password: string };

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: string;
};

export type DeliveryTask = {
  id: string;
  orderId: string;
  courierId: string;
  customerName: string;
  address: string;
  scheduledDate: string;
  status: DeliveryStatus;
  note?: string;
  updatedAt: string;
};

const categories = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Outdoor',
  'Decor',
];

const productSeed: Product[] = [
  {
    id: nanoid(),
    slug: 'modern-harmony-sofa',
    name: 'Modern Harmony Sofa',
    price: 29900,
    size: '220 x 90 x 85 cm',
    material: 'Linen & Oak Wood',
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1495435229349-e86db7bfa013?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    ],
    category: 'Living Room',
    rating: 4.7,
    reviewCount: 184,
    stock: 12,
    createdAt: new Date('2024-01-12T08:30:00Z').toISOString(),
    description:
      'A contemporary sofa with modular cushions and solid oak legs designed for comfort and durability.',
    discountPercentage: 10,
  },
  {
    id: nanoid(),
    slug: 'aurora-king-bed',
    name: 'Aurora King Bed',
    price: 35900,
    size: '190 x 210 x 110 cm',
    material: 'Velvet & Steel',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353',
    ],
    category: 'Bedroom',
    rating: 4.8,
    reviewCount: 129,
    stock: 8,
    createdAt: new Date('2023-11-28T11:15:00Z').toISOString(),
    description:
      'Luxurious velvet-upholstered king size bed with integrated storage and LED ambience strip.',
    discountAmount: 2000,
  },
  {
    id: nanoid(),
    slug: 'solstice-dining-table',
    name: 'Solstice Dining Table',
    price: 18900,
    size: '180 x 90 x 75 cm',
    material: 'Walnut Wood',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
      'https://images.unsplash.com/photo-1505692794403-35d0b23eba22',
    ],
    category: 'Dining Room',
    rating: 4.6,
    reviewCount: 92,
    stock: 6,
    createdAt: new Date('2024-02-09T09:00:00Z').toISOString(),
    description:
      'A six-seater dining table crafted from premium walnut with rounded edges and matte finish.',
  },
  {
    id: nanoid(),
    slug: 'pivot-ergonomic-chair',
    name: 'Pivot Ergonomic Chair',
    price: 12900,
    size: '65 x 65 x 120 cm',
    material: 'Mesh & Aluminum',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      'https://images.unsplash.com/photo-1586717799252-bd134ad00e26',
    ],
    category: 'Office',
    rating: 4.9,
    reviewCount: 245,
    stock: 25,
    createdAt: new Date('2024-03-20T15:40:00Z').toISOString(),
    description:
      'Adjustable lumbar support, breathable mesh, and tilt control built for productive workdays.',
  },
  {
    id: nanoid(),
    slug: 'terrassa-outdoor-lounge',
    name: 'Terrassa Outdoor Lounge Set',
    price: 24900,
    size: 'Modular',
    material: 'Weatherproof Rattan',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
    ],
    category: 'Outdoor',
    rating: 4.5,
    reviewCount: 63,
    stock: 4,
    createdAt: new Date('2023-09-14T13:22:00Z').toISOString(),
    description:
      'A modular outdoor lounge with weather-resistant cushions and UV-protected rattan weave.',
  },
  {
    id: nanoid(),
    slug: 'cascade-bookshelf',
    name: 'Cascade Bookshelf',
    price: 8900,
    size: '120 x 35 x 190 cm',
    material: 'Ash Wood & Steel',
    images: [
      'https://images.unsplash.com/photo-1487015307662-6ce6210680f1',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
    ],
    category: 'Living Room',
    rating: 4.4,
    reviewCount: 57,
    stock: 18,
    createdAt: new Date('2023-10-02T07:55:00Z').toISOString(),
    description:
      'Open shelving unit with asymmetrical design and powder-coated steel supports.',
  },
  {
    id: nanoid(),
    slug: 'lotus-nightstand',
    name: 'Lotus Nightstand',
    price: 3900,
    size: '50 x 40 x 52 cm',
    material: 'Birch Wood',
    images: [
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnwx&ixlib=rb-1.2.1&q=80&w=800',
    ],
    category: 'Bedroom',
    rating: 4.2,
    reviewCount: 38,
    stock: 32,
    createdAt: new Date('2024-04-01T10:12:00Z').toISOString(),
    description:
      'Minimalist nightstand with concealed drawer and cable management slot.',
  },
  {
    id: nanoid(),
    slug: 'halo-floor-lamp',
    name: 'Halo Arc Floor Lamp',
    price: 5200,
    size: '180 cm height',
    material: 'Brushed Steel & Linen',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnwx&ixlib=rb-1.2.1&q=80&w=800',
    ],
    category: 'Decor',
    rating: 4.3,
    reviewCount: 44,
    stock: 20,
    createdAt: new Date('2023-12-05T18:00:00Z').toISOString(),
    description:
      'An adjustable arc lamp delivering warm diffused light ideal for reading corners.',
  },
  {
    id: nanoid(),
    slug: 'atelier-writing-desk',
    name: 'Atelier Writing Desk',
    price: 15900,
    size: '140 x 65 x 78 cm',
    material: 'Walnut & Brass',
    images: [
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
    ],
    category: 'Office',
    rating: 4.7,
    reviewCount: 74,
    stock: 11,
    createdAt: new Date('2024-01-22T16:18:00Z').toISOString(),
    description:
      'Mid-century desk with floating drawers and brass inlay perfect for creative work.',
  },
  {
    id: nanoid(),
    slug: 'serene-lounger',
    name: 'Serene Chaise Lounger',
    price: 11200,
    size: '175 x 70 x 85 cm',
    material: 'Bouclé Fabric',
    images: [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'Living Room',
    rating: 4.6,
    reviewCount: 51,
    stock: 9,
    createdAt: new Date('2024-05-30T12:45:00Z').toISOString(),
    description:
      'Organic curved lounger with deep cushioning and performance bouclé upholstery.',
  },
];

const promotionSeed: Promotion[] = [
  {
    id: nanoid(),
    name: 'Welcome Offer',
    code: 'WELCOME10',
    discountPct: 10,
    startsAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    endsAt: new Date('2025-12-31T23:59:59Z').toISOString(),
    active: true,
  },
  {
    id: nanoid(),
    name: 'Summer Savings',
    code: 'SUMMER25',
    discountPct: 15,
    startsAt: new Date('2024-05-01T00:00:00Z').toISOString(),
    endsAt: new Date('2024-09-30T23:59:59Z').toISOString(),
    active: false,
  },
];

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

const userSeed: StoredUser[] = [
  {
    id: nanoid(),
    name: 'Ariya Lertchai',
    email: 'admin@furnishop.com',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=12',
    password: hashPassword('Admin@123'),
    phone: '+66 2 123 4567',
    createdAt: new Date('2023-10-01T10:00:00Z').toISOString(),
  },
  {
    id: nanoid(),
    name: 'Nina Chokdee',
    email: 'nina@example.com',
    role: 'CUSTOMER',
    avatar: 'https://i.pravatar.cc/150?img=35',
    password: hashPassword('Customer@123'),
    phone: '+66 8 7654 3210',
    createdAt: new Date('2024-03-15T09:30:00Z').toISOString(),
  },
  {
    id: nanoid(),
    name: 'Prasit Wong',
    email: 'delivery@furnishop.com',
    role: 'DELIVERY',
    avatar: 'https://i.pravatar.cc/150?img=45',
    password: hashPassword('Delivery@123'),
    phone: '+66 6 2345 6789',
    createdAt: new Date('2024-02-10T14:20:00Z').toISOString(),
  },
];

const reviewSeed: Review[] = [
  {
    id: nanoid(),
    productId: productSeed[0].id,
    userId: userSeed[1].id,
    rating: 5,
    comment: 'The sofa instantly elevated our living room. Cushions are supportive yet soft.',
    createdAt: new Date('2024-04-21T17:05:00Z').toISOString(),
  },
  {
    id: nanoid(),
    productId: productSeed[2].id,
    userId: userSeed[1].id,
    rating: 4,
    comment: 'Beautiful finish and easy to assemble. Wish it came with matching chairs.',
    createdAt: new Date('2024-03-12T11:40:00Z').toISOString(),
  },
  {
    id: nanoid(),
    productId: productSeed[3].id,
    userId: userSeed[0].id,
    rating: 5,
    comment: 'The ergonomic support is incredible. No more back pain after long work hours.',
    createdAt: new Date('2024-02-18T08:55:00Z').toISOString(),
  },
];

const orderSeed: Order[] = [
  {
    id: nanoid(),
    userId: userSeed[1].id,
    items: [
      {
        productId: productSeed[0].id,
        name: productSeed[0].name,
        price: productSeed[0].price,
        qty: 1,
      },
      {
        productId: productSeed[6].id,
        name: productSeed[6].name,
        price: productSeed[6].price,
        qty: 2,
      },
    ],
    total: productSeed[0].price + productSeed[6].price * 2,
    status: 'PROCESSING',
    paymentRef: 'PAY-20240421-FT123',
    trackingCode: 'FS-TH-4587123',
    timeline: [
      { status: 'PENDING', at: new Date('2024-04-21T08:00:00Z').toISOString() },
      { status: 'PAID', at: new Date('2024-04-21T08:15:00Z').toISOString() },
      { status: 'PROCESSING', at: new Date('2024-04-21T10:40:00Z').toISOString() },
    ],
    createdAt: new Date('2024-04-21T08:00:00Z').toISOString(),
    updatedAt: new Date('2024-04-22T11:30:00Z').toISOString(),
  },
  {
    id: nanoid(),
    userId: userSeed[2].id,
    items: [
      {
        productId: productSeed[4].id,
        name: productSeed[4].name,
        price: productSeed[4].price,
        qty: 1,
      },
    ],
    total: productSeed[4].price,
  status: DeliveryStatus.OutForDelivery,
    timeline: [
      { status: 'PENDING', at: new Date('2024-05-02T07:00:00Z').toISOString() },
      { status: 'PAID', at: new Date('2024-05-02T07:10:00Z').toISOString() },
      { status: 'PROCESSING', at: new Date('2024-05-02T09:00:00Z').toISOString() },
      { status: 'SHIPPING', at: new Date('2024-05-03T03:15:00Z').toISOString() },
      { status: 'OUT_FOR_DELIVERY', at: new Date('2024-05-03T06:45:00Z').toISOString(), note: 'Loaded on delivery van #DL-04' },
    ],
    createdAt: new Date('2024-05-02T07:00:00Z').toISOString(),
    updatedAt: new Date('2024-05-03T06:45:00Z').toISOString(),
  },
];

const deliverySeed: DeliveryTask[] = [
  {
    id: nanoid(),
    orderId: orderSeed[1].id,
    courierId: userSeed[2].id,
    customerName: 'Siriwan Phol',
    address: '128 Sukhumvit Rd, Bangkok',
    scheduledDate: new Date('2024-05-03T08:00:00Z').toISOString(),
    status: DeliveryStatus.OutForDelivery,
    note: 'Deliver before noon, call upon arrival.',
    updatedAt: new Date('2024-05-03T06:45:00Z').toISOString(),
  },
  {
    id: nanoid(),
    orderId: nanoid(),
    courierId: userSeed[2].id,
    customerName: 'Chanon Meechai',
    address: '55 Chiang Mai Rd, Chiang Mai',
    scheduledDate: new Date('2024-05-03T13:30:00Z').toISOString(),
  status: DeliveryStatus.InTransit,
    updatedAt: new Date('2024-05-03T05:10:00Z').toISOString(),
  },
];

const cartStore = new Map<string, Cart>();
cartStore.set(userSeed[1].id, {
  userId: userSeed[1].id,
  items: [
    {
      productId: productSeed[0].id,
      qty: 1,
    },
    {
      productId: productSeed[6].id,
      qty: 2,
    },
  ],
  updatedAt: new Date('2024-05-01T10:00:00Z').toISOString(),
});
const sessionStore = new Map<string, Session>();

export const db = {
  categories,
  products: productSeed,
  promotions: promotionSeed,
  users: userSeed,
  orders: orderSeed,
  reviews: reviewSeed,
  deliveries: deliverySeed,
  carts: cartStore,
  sessions: sessionStore,
};

export async function findUserByEmail(email: string) {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(user: Omit<User, 'id'> & { password: string }) {
  const newUser: StoredUser = {
    id: nanoid(),
    ...user,
    password: hashPassword(user.password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  return newUser;
}

export async function verifyPassword(password: string, hashed: string) {
  return hashPassword(password) === hashed;
}

export async function upsertCart(userId: string, items: CartItem[]) {
  const cart: Cart = {
    userId,
    items,
    updatedAt: new Date().toISOString(),
  };
  db.carts.set(userId, cart);
  return cart;
}

export async function clearCart(userId: string) {
  db.carts.delete(userId);
}

export async function getCartByUser(userId: string) {
  return db.carts.get(userId) ?? {
    userId,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function saveSession(token: string, session: Session) {
  db.sessions.set(token, session);
}

export async function getSessionByToken(token: string) {
  return db.sessions.get(token) ?? null;
}

export async function deleteSession(token: string) {
  db.sessions.delete(token);
}
