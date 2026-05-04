/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id?: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock?: number;
}

export interface Sale {
  id?: number;
  timestamp: Date;
  totalAmount: number;
  totalProfit: number;
  items: SaleItem[];
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number; // price at time of sale
  cost: number;  // cost at time of sale
}
