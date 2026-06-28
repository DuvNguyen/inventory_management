'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import api, { getErrorMessage } from '../../../lib/api';
import { Product, ApiResponse } from '../../../types';
import ProductTable from '../../../components/products/ProductTable';
import ProductForm, { ProductFormValues } from '../../../components/products/ProductForm';
import CsvUploader from '../../../components/products/CsvUploader';
import { Plus, UploadCloud, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProductSelection } from '../../../hooks/useProductSelection';

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'upload' | 'deleteConfirm' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Selection Hook
  const {
    isSelectMode,
    setIsSelectMode,
    selectedIds,
    toggleSelectMode,
    toggleSelect,
    selectAll,
    clearSelections,
  } = useProductSelection(page, search);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<ProductsResponse>>('/products', {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });
      setProducts(response.data.data.data);
      setTotal(response.data.data.total);
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, toast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInputValue);
    setPage(1);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) {
      return;
    }
    try {
      await api.delete(`/products/${id}`);
      toast('Product successfully deleted.', 'success');
      fetchProducts();
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setActiveModal('edit');
  };

  const handleCreateProduct = async (values: ProductFormValues) => {
    try {
      await api.post('/products', values);
      toast('Product successfully created.', 'success');
      setActiveModal(null);
      fetchProducts();
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    }
  };

  const handleUpdateProduct = async (values: ProductFormValues) => {
    if (!editingProduct) return;
    try {
      await api.patch(`/products/${editingProduct._id}`, values);
      toast('Product successfully updated.', 'success');
      setActiveModal(null);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await api.delete<ApiResponse<{ deletedCount: number }>>('/products/bulk', {
        data: { ids: Array.from(selectedIds) },
      });
      toast('Products successfully deleted.', 'success');
      clearSelections();
      setIsSelectMode(false);
      setActiveModal(null);
      fetchProducts();
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setEditingProduct(null);
    fetchProducts(); // Refresh list in case of CSV upload changes
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full bg-surface border border-secondary/35 text-primary px-10 py-2.5 text-xs tracking-wider uppercase font-semibold focus:border-tertiary focus:outline-none transition-colors"
            style={{ borderRadius: '2px' }}
          />
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
          <button type="submit" className="hidden" />
        </form>

        {isAdmin && (
          <div className="flex items-center gap-3">
            {selectedIds.size >= 1 && (
              <button
                onClick={() => setActiveModal('deleteConfirm')}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                style={{ borderRadius: '2px' }}
              >
                <span>
                  {selectedIds.size === 1
                    ? 'Delete Selected'
                    : `Delete Selected (${selectedIds.size})`}
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveModal('upload')}
              className="flex items-center gap-2 border border-secondary/40 hover:border-primary text-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors bg-surface cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                isSelectMode
                  ? 'bg-neutral border-tertiary text-tertiary hover:bg-neutral/85'
                  : 'bg-surface border-secondary/40 hover:border-primary text-primary'
              }`}
              style={{ borderRadius: '2px' }}
            >
              <span>{isSelectMode ? 'Cancel' : 'Select'}</span>
            </button>
            <button
              onClick={() => setActiveModal('add')}
              className="flex items-center gap-2 bg-tertiary text-on-primary hover:bg-tertiary/90 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      <ProductTable
        products={products}
        isLoading={isLoading}
        onDelete={handleDeleteProduct}
        onEdit={handleEditClick}
        isAdmin={isAdmin}
        isSelectMode={isSelectMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
      />

      {products.length > 0 && (
        <div className="flex items-center justify-between border-t border-secondary/15 pt-4">
          <p className="text-xs text-secondary font-semibold uppercase tracking-wider">
            Showing Page {page} of {totalPages} ({total} total records)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-2 border border-secondary/20 bg-surface text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary transition-colors cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="p-2 border border-secondary/20 bg-surface text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary transition-colors cursor-pointer"
              style={{ borderRadius: '2px' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-surface border border-secondary/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl p-6"
            style={{ borderRadius: '3px' }}
          >
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="mt-4">
              {activeModal === 'add' && (
                <ProductForm onSubmit={handleCreateProduct} />
              )}
              {activeModal === 'edit' && editingProduct && (
                <ProductForm 
                  initialData={editingProduct} 
                  onSubmit={handleUpdateProduct} 
                  isEdit={true} 
                />
              )}
              {activeModal === 'upload' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl tracking-wide text-primary border-b border-secondary/15 pb-4">
                    IMPORT PRODUCTS FROM CSV
                  </h3>
                  <CsvUploader />
                </div>
              )}
              {activeModal === 'deleteConfirm' && (
                <div className="space-y-6">
                  <h3 className="font-serif text-xl tracking-wide text-primary border-b border-secondary/15 pb-4">
                    CONFIRM DELETION
                  </h3>
                  <p className="text-sm text-secondary">
                    Are you sure you want to delete {selectedIds.size} product(s)? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3 pt-4 border-t border-secondary/15">
                    <button
                      onClick={() => setActiveModal(null)}
                      disabled={isBulkDeleting}
                      className="border border-secondary/40 hover:border-primary text-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors bg-surface cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: '2px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs tracking-widest uppercase px-6 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ borderRadius: '2px' }}
                    >
                      {isBulkDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
