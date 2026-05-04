/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db } from '../db/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { startOfDay, startOfMonth, format, subDays, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const sales = useLiveQuery(() => db.sales.toArray());
  const products = useLiveQuery(() => db.products.toArray());

  const seedDemoData = async () => {
    const demoProducts = [
      { name: 'Café Espresso', sku: 'COF-01', category: 'Bebidas', price: 1500, cost: 400, stock: 50, minStock: 10 },
      { name: 'Medialuna', sku: 'BK-01', category: 'Panadería', price: 800, cost: 200, stock: 5, minStock: 15 },
      { name: 'Jugo Naranja', sku: 'JU-22', category: 'Bebidas', price: 1200, cost: 300, stock: 20, minStock: 5 },
    ];
    for (const p of demoProducts) {
      await db.products.add(p);
    }
  };

  if (!sales || !products) return <div className="p-8 text-center text-gray-400 font-mono text-xs uppercase tracking-widest pt-40">Inicializando base de datos local...</div>;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
          <Package size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido a StockMaster!</h2>
        <p className="text-gray-500 mb-8 font-medium">Parece que aún no tienes productos. Agrega algunos manualmente o usa datos de prueba.</p>
        <button 
          onClick={seedDemoData}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Cargar Datos de Prueba
        </button>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  const todaySales = sales.filter(s => s.timestamp >= today);
  const monthSales = sales.filter(s => s.timestamp >= monthStart);

  const stats = {
    todayRevenue: todaySales.reduce((acc, s) => acc + s.totalAmount, 0),
    todayProfit: todaySales.reduce((acc, s) => acc + s.totalProfit, 0),
    monthRevenue: monthSales.reduce((acc, s) => acc + s.totalAmount, 0),
    monthProfit: monthSales.reduce((acc, s) => acc + s.totalProfit, 0),
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= (p.minStock || 5)).length
  };

  // Chart Data: Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(d);
    const daySales = sales.filter(s => format(s.timestamp, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));
    return {
      name: format(d, 'EEE', { locale: es }),
      ventas: daySales.reduce((acc, s) => acc + s.totalAmount, 0),
      ganancia: daySales.reduce((acc, s) => acc + s.totalProfit, 0)
    };
  });

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">StockMaster</h1>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider italic font-serif">Panel de Control</p>
      </header>

      <div className="px-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Venta Hoy" 
            value={`$${stats.todayRevenue.toLocaleString()}`} 
            subValue={`+${stats.todayProfit.toLocaleString()} ganancia`}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard 
            label="Env. Bajo" 
            value={stats.lowStock.toString()} 
            subValue="Productos en alerta"
            icon={Package}
            trend={stats.lowStock > 0 ? "down" : "up"}
            intensity={stats.lowStock > 3 ? "high" : "low"}
          />
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Ventas 7 Días</h3>
              <p className="text-2xl font-bold text-gray-900">${stats.monthRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <DollarSign className="text-indigo-600" size={20} />
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <div className="bg-gray-900 text-white p-6 rounded-3xl overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-1">Resumen Mensual</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold">${stats.monthRevenue.toLocaleString()}</span>
              <span className="text-xs text-green-400 font-medium mb-1 flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                Ventas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-tighter">Costo Total</p>
                <p className="text-lg font-bold text-gray-200">${(stats.monthRevenue - stats.monthProfit).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-tighter">Ganancia Neta</p>
                <p className="text-lg font-bold text-green-400">${stats.monthProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, trend, intensity = "low" }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:border-indigo-100 transition-colors">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${intensity === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`text-[10px] font-bold p-1 rounded-md px-1.5 ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">{label}</h4>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500 mt-1 font-medium">{subValue}</p>
      </div>
    </div>
  );
}
