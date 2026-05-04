/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { ShoppingCart, Search, Plus, Minus, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export default function POS() {
  const products = useLiveQuery(() => db.products.toArray());
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.price, cost: product.cost }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products?.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalProfit = cart.reduce((acc, item) => acc + ((item.price - item.cost) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // 1. Save sale
      await db.sales.add({
        timestamp: new Date(),
        totalAmount: total,
        totalProfit: totalProfit,
        items: cart.map(i => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          price: i.price,
          cost: i.cost
        }))
      });

      // 2. Update stock
      for (const item of cart) {
        const product = products?.find(p => p.id === item.productId);
        if (product) {
          await db.products.update(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }

      setCart([]);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      alert('Error al procesar la venta');
    }
  };

  return (
    <div className="pb-24 grid grid-rows-[auto_1fr_auto] h-screen overflow-hidden">
      <header className="px-6 py-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Registrar Venta</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider italic font-serif">Punto de Venta</p>
        </div>
        <div className="relative">
          <ShoppingCart className="text-gray-400" size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>
      </header>

      <div className="overflow-hidden flex flex-col">
        {/* Search */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts?.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-3xl border border-gray-100 text-left active:scale-95 transition-transform flex flex-col justify-between h-36"
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">STOCK: {product.stock}</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-sm font-black text-indigo-600">${product.price}</span>
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Summary (Docked) */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 left-0 right-0 px-4 z-40 pointer-events-none"
          >
            <div className="bg-white rounded-[32px] shadow-2xl p-6 border border-indigo-50 pointer-events-auto">
              <div className="max-h-40 overflow-y-auto mb-4 space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-400">${item.price} c/u</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 px-3">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="text-gray-400">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="text-indigo-600">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-300">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white rounded-2xl py-4 flex items-center justify-between px-6 shadow-xl shadow-indigo-100 active:scale-95 transition-transform"
              >
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Total</span>
                  <span className="text-xl font-bold">${total.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">PAGAR</span>
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-md"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-green-100">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Venta Exitosa</h2>
              <p className="text-gray-500 font-medium">El stock ha sido actualizado.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
