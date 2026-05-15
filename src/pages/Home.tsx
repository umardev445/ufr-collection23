import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'motion/react';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { DUMMY_PRODUCTS, CATEGORIES, HERO_BANNERS } from '../dummyData';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Home = () => {
  const featuredProducts = DUMMY_PRODUCTS.filter(p => p.isFeatured);

  return (
    <div className="overflow-hidden">
      {/* Hero Slider */}
      <section className="relative h-[85vh]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-full w-full"
        >
          {HERO_BANNERS.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative h-full w-full">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                  >
                    <span className="text-white/80 text-xs md:text-sm tracking-[0.3em] font-medium uppercase mb-4 block">
                      {banner.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-7xl text-white font-serif font-bold mb-8 leading-tight tracking-tight">
                      {banner.title}
                    </h1>
                    <Link
                      to={banner.link}
                      className="inline-block bg-white text-brand-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all duration-300"
                    >
                      Shop Collection
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Services Bar */}
      <section className="bg-brand-beige py-12">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Truck size={24} />, title: "Free Shipping", sub: "On orders above 3 suits" },
            { icon: <ShieldCheck size={24} />, title: "Secure Payment", sub: "100% safe transactions" },
            { icon: <RefreshCw size={24} />, title: "Easy Returns", sub: "7-day exchange policy" },
            { icon: <Smartphone size={24} />, title: "WhatsApp Order", sub: "24/7 customer support" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-3">
              <div className="text-brand-gold">{item.icon}</div>
              <h4 className="text-sm font-bold uppercase tracking-widest">{item.title}</h4>
              <p className="text-[10px] text-brand-gray uppercase tracking-wider">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 block">Curation</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Featured Categories</h2>
            </div>
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest flex items-center hover:text-brand-gold transition-colors">
              View All <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative h-96 group overflow-hidden cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6 bg-linear-to-t from-black/60 to-transparent">
                  <h3 className="text-white text-xl font-serif mb-4">{cat.name}</h3>
                  <Link
                    to={`/shop?category=${cat.id}`}
                    className="text-white text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center"
                  >
                    Explore Now <ArrowRight size={12} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 bg-brand-pink/20">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 text-center mb-16">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2 block">Latest</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">New Arrivals</h2>
          <p className="text-brand-gray text-sm max-w-2xl mx-auto">Discover our latest collection of premium unstitched fabrics, featuring intricate embroidery and classic Pakistani aesthetics.</p>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1600&auto=format&fit=crop"
              alt="Promo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-black/40 flex items-center">
              <div className="max-w-xl px-12 text-white">
                <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 block">Limited Offer</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Wedding Season Sale Up to 40% Off</h2>
                <p className="text-gray-200 mb-8 max-w-md">Make your celebration unforgettable with our bridal and festive collections at exclusive prices.</p>
                <Link
                  to="/shop"
                  className="inline-block bg-brand-gold text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-black transition-colors"
                >
                  Shop the Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-brand-black text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-serif mb-4">Join Our Exclusive List</h2>
          <p className="text-gray-400 text-sm mb-8 tracking-wide">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow bg-white/10 border border-white/20 px-6 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
              required
            />
            <button className="bg-white text-brand-black px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
