import { Product, Banner, Category } from './types';

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Luxury Velvet Unstitched Suit',
    description: 'Exquisite velvet collection with gold embroidery. Perfect for wedding season.',
    price: 8500,
    originalPrice: 12000,
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'Winter Collection',
    stock: 10,
    discount: 25,
    isFeatured: true,
    fabrics: 'Velvet',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Floral Print Lawn Suit',
    description: 'High quality Turkish lawn with digital floral prints. Lightweight and breathable.',
    price: 3200,
    originalPrice: 4500,
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'Summer Lawn',
    stock: 50,
    discount: 15,
    isFeatured: true,
    fabrics: 'Lawn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Silk Embroidered Party Wear',
    description: 'Stunning silk ensemble with intricate hand embroidery and mirror work.',
    price: 15000,
    images: [
      'https://images.unsplash.com/photo-1618333244973-2803cbead3d3?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'Festive',
    stock: 5,
    isFeatured: true,
    fabrics: 'Silk',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Chiffon Elegance 3-Piece',
    description: 'Classic chiffon collection with thread work. Minimalist yet luxurious.',
    price: 6800,
    originalPrice: 8000,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'Chiffon',
    stock: 20,
    discount: 10,
    isFeatured: false,
    fabrics: 'Chiffon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Winter Collection', slug: 'winter', image: 'https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?q=80&w=1000&auto=format&fit=crop' },
  { id: '2', name: 'Summer Lawn', slug: 'summer', image: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=1000&auto=format&fit=crop' },
  { id: '3', name: 'Festive Wear', slug: 'festive', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop' },
  { id: '4', name: 'Casual Chic', slug: 'casual', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop' }
];

export const HERO_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'WINTER VELVET COLLECTION 2026',
    subtitle: 'Experience the Ultimate Luxury',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    link: '/shop',
    type: 'hero'
  },
  {
    id: '2',
    title: 'THE ART OF UNSTITCHED',
    subtitle: 'Define Your Style With Our Premium Prints',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
    link: '/shop',
    type: 'hero'
  }
];
