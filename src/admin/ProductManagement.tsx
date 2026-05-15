import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  X,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productList);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const fileArray = Array.from(files);
    const promises = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Limit size to prevent Firestore 1MB document limit
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to web-safe, compressed JPEG Base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedBase64);
          };
          img.onerror = () => reject('Failed to load image');
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject('Failed to read file');
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(base64Images => {
        setCurrentProduct(prev => ({
          ...prev,
          images: [...(prev?.images || []), ...base64Images].slice(0, 5) // Limit to 5 images
        }));
        toast.success(`${base64Images.length} images prepared`);
      })
      .catch(err => {
        console.error(err);
        toast.error('Image upload failed');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const removeImage = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      images: prev?.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct?.name || !currentProduct?.price) return;
    if (!currentProduct.images || currentProduct.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const productData = {
        ...currentProduct,
        images: currentProduct.images,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && currentProduct.id) {
        await updateDoc(doc(db, 'products', currentProduct.id), productData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success('Product added');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setIsEditing(true);
    } else {
      setCurrentProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Summer Lawn',
        stock: 0,
        isFeatured: false,
        images: []
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-serif font-bold">Manage Boutique Products</h2>
        <button
          onClick={() => openModal()}
          className="bg-brand-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-brand-gold transition-colors"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, category..."
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 text-sm focus:ring-2 focus:ring-brand-gold/20"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 border-none rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-widest text-brand-gray">
            <option>All Categories</option>
            <option>Summer Lawn</option>
            <option>Winter Collection</option>
            <option>Festive Wear</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4]">
                <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                  <button onClick={() => openModal(product)} className="bg-white p-3 rounded-full text-brand-black hover:text-brand-gold transition-colors scale-90 group-hover:scale-100 transition-transform">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="bg-white p-3 rounded-full text-red-500 hover:bg-red-50 transition-colors scale-90 group-hover:scale-100 transition-transform">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <span className="text-[10px] text-brand-gray uppercase tracking-widest font-bold mb-1 block">{product.category}</span>
                <h4 className="text-sm font-bold truncate mb-2">{product.name}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gold font-bold">Rs. {product.price.toLocaleString()}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} Inherit` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold">{isEditing ? 'Edit Product' : 'Add New Boutique Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Product Name</label>
                  <input
                    required
                    value={currentProduct?.name || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Category</label>
                  <select
                    value={currentProduct?.category || 'Summer Lawn'}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  >
                    <option>Summer Lawn</option>
                    <option>Winter Collection</option>
                    <option>Festive Wear</option>
                    <option>Chiffon</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Description</label>
                  <textarea
                    rows={4}
                    value={currentProduct?.description || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={currentProduct?.price || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Original Price</label>
                  <input
                    type="number"
                    value={currentProduct?.originalPrice || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Stock Quantity</label>
                  <input
                    type="number"
                    value={currentProduct?.stock || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-brand-beige rounded-xl">
                 <input
                  type="checkbox"
                  checked={currentProduct?.isFeatured || false}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, isFeatured: e.target.checked })}
                  className="w-5 h-5 accent-brand-gold"
                 />
                 <span className="text-xs font-bold uppercase tracking-widest">Show in "Best Sellers" section</span>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Product Images (Upload from PC)</label>
                 
                 {/* Image Grid */}
                 <div className="grid grid-cols-5 gap-4">
                   {currentProduct?.images?.map((img, index) => (
                     <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                       <img src={img} className="w-full h-full object-cover" alt={`Upload ${index}`} />
                       <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X size={12} />
                       </button>
                     </div>
                   ))}
                   
                   {(!currentProduct?.images || currentProduct.images.length < 5) && (
                     <label className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-beige/30 transition-colors group">
                       <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                       />
                       {uploading ? (
                         <Loader2 className="text-brand-gold animate-spin" size={24} />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-brand-gold transition-colors" size={20} />
                           <span className="text-[8px] text-brand-gray mt-1 uppercase font-bold tracking-widest">Add Image</span>
                         </>
                       )}
                     </label>
                   )}
                 </div>
                 <p className="text-[9px] text-brand-gray italic">Max 5 images allowed. Images are automatically compressed to save space.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold transition-all rounded-xl"
              >
                {isEditing ? 'Update Collection' : 'Add to Collection'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
