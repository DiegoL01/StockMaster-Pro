/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { Table } from 'dexie';
import { Product, Sale } from '../types';

export class StockDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;

  constructor() {
    super('StockMasterDB');
    this.version(1).stores({
      products: '++id, name, sku, category',
      sales: '++id, timestamp, totalAmount, totalProfit'
    });
  }
}

export const db = new StockDatabase();
