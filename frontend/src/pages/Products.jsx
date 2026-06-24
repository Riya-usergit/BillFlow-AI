import React, { useEffect, useState } from 'react';
import productApi from '../services/api/productApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Percent,
  FileText
} from 'lucide-react';

export const Products = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products, entering Demo Mode fallback:', err);
      setProducts([
        { id: 1, name: 'SaaS Software Consultation', description: 'Enterprise architectural review and cloud roadmap designing.', price: 15000, taxRate: 18 },
        { id: 2, name: 'BillFlow Enterprise License', description: 'Multi-tenant invoice automation core system license.', price: 120000, taxRate: 18 },
        { id: 3, name: 'Database Optimization SLA', description: 'Monthly DBA review, profiling, index optimization support.', price: 25000, taxRate: 18 },
        { id: 4, name: 'AI Credit Scoring API (10k requests)', description: 'Access token for automated credit reliability analysis.', price: 8000, taxRate: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setTaxRate('');
    setFormErrors({});
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price !== undefined ? product.price.toString() : '');
    setTaxRate(product.taxRate !== undefined ? product.taxRate.toString() : '');
    setFormErrors({});
    setEditModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!name) errors.name = 'Product name is required';
    if (!price) errors.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) < 0) errors.price = 'Price must be a positive number';
    if (!taxRate) errors.taxRate = 'Tax rate is required';
    else if (isNaN(Number(taxRate)) || Number(taxRate) < 0) errors.taxRate = 'Tax rate must be a positive percentage';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await productApi.createProduct({
        name,
        description,
        price: Number(price),
        taxRate: Number(taxRate),
      });
      addToast('Product added successfully!', 'success');
      setAddModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast('Failed to create product.', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await productApi.updateProduct(selectedProduct.id, {
        name,
        description,
        price: Number(price),
        taxRate: Number(taxRate),
      });
      addToast('Product updated successfully!', 'success');
      setEditModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast('Failed to update product details.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      addToast('Product removed successfully.', 'success');
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete product.', 'error');
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = search.toLowerCase();
    return (
      (product.name || '').toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Catalog</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage items, flat rates, and tax ratios for dynamic billing.</p>
        </div>
        {user?.role === 'OWNER' && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            Add Product
          </Button>
        )}
      </div>

      {/* Control search panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by product name or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Product list grid */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No products found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add items to create line invoice items later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg">
                    Product ID: #{product.id}
                  </span>
                  <div className="flex gap-1">
                    {user?.role === 'OWNER' && (
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1 rounded text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {user?.role === 'OWNER' && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[32px]">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Price Tag Details */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Tag size={16} className="text-slate-400" />
                  <span className="text-lg font-black">₹{product.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Percent size={14} className="text-slate-400" />
                  <span>{product.taxRate}% GST</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Product to Catalog">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Product Name"
            type="text"
            placeholder="SaaS Consultation (Hourly)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            required
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <textarea
              placeholder="Provide catalog information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Price (₹)"
              type="text"
              placeholder="5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={formErrors.price}
              required
            />
            <Input
              label="Tax Rate (%)"
              type="text"
              placeholder="18"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              error={formErrors.taxRate}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Product Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Product Name"
            type="text"
            placeholder="SaaS Consultation (Hourly)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            required
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <textarea
              placeholder="Provide catalog information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Price (₹)"
              type="text"
              placeholder="5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={formErrors.price}
              required
            />
            <Input
              label="Tax Rate (%)"
              type="text"
              placeholder="18"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              error={formErrors.taxRate}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
