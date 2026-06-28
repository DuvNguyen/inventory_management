'use client';

import { Product } from '../../types';
import { Edit2, Trash2, ShieldAlert } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (product: Product) => void;
  isAdmin: boolean;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export default function ProductTable({
  products,
  isLoading,
  onDelete,
  onEdit,
  isAdmin,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-surface/50 border border-secondary/10 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-surface border border-secondary/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-secondary/20 bg-surface p-12 text-center flex flex-col items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-secondary mb-3" />
        <h3 className="font-serif text-lg text-primary tracking-wide">NO PRODUCTS FOUND</h3>
        <p className="text-xs text-secondary mt-1 max-w-sm">
          No records match the current database query. Please add a product or import a CSV file.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-secondary/20 bg-surface">
      <table className="w-full text-left border-collapse font-sans text-sm">
        <thead>
          <tr className="border-b border-secondary/20 bg-neutral/40">
            {isAdmin && isSelectMode && (
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={products.length > 0 && products.every((p) => selectedIds.has(p._id))}
                  onChange={() => {
                    onSelectAll(products.map((p) => p._id));
                  }}
                  className="w-4 h-4 border border-secondary/30 bg-surface text-tertiary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  style={{ borderRadius: '2px' }}
                />
              </th>
            )}
            <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary">
              SKU
            </th>
            <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary">
              NAME
            </th>
            <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary text-right">
              PRICE
            </th>
            <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary text-right">
              STOCK
            </th>
            <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary">
              LAST UPDATED BY
            </th>
            {isAdmin && (
              <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-secondary text-right">
                ACTIONS
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/10">
          {products.map((product) => {
            const updater = product.lastUpdatedBy;
            const updatedByName = updater
              ? `${updater.firstName} ${updater.lastName}`
              : 'System';
            const updatedByEmail = updater ? updater.email : '';

            return (
              <tr key={product._id} className="hover:bg-neutral/40 transition-colors">
                {isAdmin && isSelectMode && (
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product._id)}
                      onChange={() => {
                        onToggleSelect(product._id);
                      }}
                      className="w-4 h-4 border border-secondary/30 bg-surface text-tertiary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      style={{ borderRadius: '2px' }}
                    />
                  </td>
                )}
                <td className="px-6 py-4 font-mono text-xs font-semibold text-tertiary">
                  {product.sku}
                </td>
                <td className="px-6 py-4 font-medium text-primary">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-right font-mono text-primary">
                  ${product.price.toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-right font-mono ${product.stock === 0 ? 'text-red-400 font-semibold' : 'text-primary'}`}>
                  {product.stock}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-xs text-primary font-medium">{updatedByName}</p>
                    {updatedByEmail && (
                      <p className="text-[10px] text-secondary">{updatedByEmail}</p>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 min-h-[32px]">
                      {(!isSelectMode || (selectedIds.size === 1 && selectedIds.has(product._id))) && (
                        <>
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 text-secondary hover:text-tertiary transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product._id)}
                            className="p-1.5 text-secondary hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
