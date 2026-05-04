/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react';

export default function Reports() {
  const sales = useLiveQuery(() => db.sales.orderBy('timestamp').reverse().toArray());

  return (
    <div className="pb-24 min-h-screen">
      <header className="px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Reportes</h1>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider italic font-serif">Historial y Métricas</p>
      </header>

      <div className="px-6 space-y-6">
        {/* Performance Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <ReportSummaryCard icon={TrendingUp} label="Ventas Totales" value={sales?.length || 0} />
          <ReportSummaryCard icon={Calendar} label="Días Activos" value={new Set(sales?.map(s => format(s.timestamp, 'yyyy-MM-dd'))).size} />
        </div>

        {/* Transactions list */}
        <div>
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-4 px-1">Ventas Recientes</h2>
          <div className="space-y-4">
            {sales?.map((sale) => (
              <div key={sale.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold text-indigo-600 mb-0.5">{format(sale.timestamp, 'dd MMM, HH:mm', { locale: es })}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">ID: #{sale.id?.toString().padStart(4, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900 leading-none">${sale.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-green-500 font-bold tracking-tighter self-end mt-1">+${sale.totalProfit.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-1 border-t border-gray-50 pt-3">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                      <span className="text-gray-400 font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                {/* Visual marker decoration */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-600 opacity-20"></div>
              </div>
            ))}
            {sales?.length === 0 && (
              <div className="bg-gray-50 rounded-3xl p-12 text-center">
                <FileText className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-400 text-sm font-medium">Sin ventas registradas todavía.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSummaryCard({ icon: Icon, label, value }: any) {
  return (
    <div className="flex-shrink-0 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{label}</p>
        <p className="text-xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}
