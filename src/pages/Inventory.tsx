/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Edit2, Trash2, Package, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const products = useLiveQuery(() => db.products.toArray());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await db.products.delete(id);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      cost: Number(formData.get('cost')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
    };

    if (editingProduct) {
      await db.products.update(editingProduct.id, productData);
    } else {
      await db.products.add(productData);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="pb-24 min-h-screen">
      <header className="px-6 py-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Inventario</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider italic font-serif">Gestión de Stock</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 space-y-4">
        {filteredProducts?.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${product.stock <= (product.minStock || 5) ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <Package size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
              <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">${product.price}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock <= (product.minStock || 5) ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(product.id!)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">No se encontraron productos.</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nombre</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">SKU</label>
                    <input name="sku" defaultValue={editingProduct?.sku} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Categoría</label>
                    <input name="category" defaultValue={editingProduct?.category} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Costo ($)</label>
                    <input type="number" step="0.01" name="cost" defaultValue={editingProduct?.cost} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Venta ($)</label>
                    <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Stock</label>
                    <input type="number" name="stock" defaultValue={editingProduct?.stock} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Mín. Alerta</label>
                    <input type="number" name="minStock" defaultValue={editingProduct?.minStock || 5} required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 mt-4 active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <Check size={20} />
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
