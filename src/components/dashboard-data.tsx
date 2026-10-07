import { createContext, useContext, useState, type ReactNode } from 'react';
import { salesData, type Sale } from '@/lib/sales-data';
import { employees, assignments, type Employee, type Assignment } from '@/lib/hr-data';

export type SalesSource = { rows: Sale[]; filename?: string; currency: string };
export type HrSource = { employees: Employee[]; assignments: Assignment[]; filename?: string };
const demoSales: SalesSource = { rows: salesData, currency: 'USD' };
const demoHr: HrSource = { employees, assignments };
const DataContext = createContext({ sales: demoSales, hr: demoHr, replaceSales: (_source: SalesSource) => {}, replaceHr: (_source: HrSource) => {} });
export function DashboardDataProvider({ children }: { children: ReactNode }) {
  // Imported records stay in this mounted session; no browser storage or remote upload.
  const [sales, replaceSales] = useState(demoSales);
  const [hr, replaceHr] = useState(demoHr);
  return <DataContext.Provider value={{ sales, hr, replaceSales, replaceHr }}>{children}</DataContext.Provider>;
}
export const useDashboardData = () => useContext(DataContext);