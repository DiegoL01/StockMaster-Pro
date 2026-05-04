/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'inventory', label: 'Stock', icon: Package },
  { id: 'pos', label: 'Venta', icon: ShoppingCart },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
];

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-6 pt-3 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex flex-col items-center gap-1 group"
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
              <Icon size={24} />
            </div>
            <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
