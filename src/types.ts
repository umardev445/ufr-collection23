export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  discount?: number;
  isFeatured: boolean;
  fabrics?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
  address?: string;
  phone?: string;
  wishlist?: string[];
  createdAt: any;
}

export interface Order {
  id: string;
  userId?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: CartItem[];
  totalAmount: number;
  shippingFee: number;
  paymentMethod: 'COD' | 'Easypaisa' | 'JazzCash';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Order Received' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingId: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link: string;
  type: 'hero' | 'promo';
}

export interface AppSettings {
  deliveryCharges: number;
  freeShippingThreshold: number;
  easypaisaNumber: string;
  jazzcashNumber: string;
  contactWhatsApp: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: any;
}
