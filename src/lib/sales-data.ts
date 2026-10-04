export const products = ['Paseo', 'VTT', 'Velo', 'Amarilla', 'Montana', 'Carretera'];
export const categories = ['Governo', 'Pequenas empresas', 'Empresas', 'Mercado intermediário', 'Parceiros'];
export const regions = ['Estados Unidos', 'Canadá', 'França', 'Alemanha', 'México'];
export const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export type Sale = { id: string; year: number; month: number; product: string; category: string; region: string; units: number; sales: number; cogs: number; discounts: number; profit: number };
export type Filters = { year: string; period: string; category: string; region: string };
export const initialFilters: Filters = { year: '2025', period: 'year', category: 'all', region: 'all' };
export const salesData: Sale[] = [2024, 2025].flatMap(year => months.flatMap((_, month) => products.flatMap((product, p) => categories.flatMap((category, c) => regions.map((region, r) => {
  const season = [0.72, 0.81, 0.91, 0.85, 0.97, 1.09, 0.95, 1.02, 1.18, 1.32, 1.22, 1.46][month] ?? 1;
  const units = Math.round((126 + ((month * 29 + p * 43 + c * 17 + r * 31) % 136)) * season * [1.7, 1.12, 0.98, 1.08, 0.9, 0.78][p] * [1.8, 1.1, 0.78, 0.65, 0.48][c] * (year === 2025 ? 1.145 : 1));
  const gross = units * (134 + p * 19 + c * 8);
  const discounts = Math.round(gross * (0.035 + c * 0.012));
  const sales = gross - discounts;
  const cogs = Math.round(sales * (0.69 + p * 0.017 + c * 0.009 - (year === 2025 ? 0.014 : 0)));
  return { id: `${year}-${month}-${p}-${c}-${r}`, year, month, product, category, region, units, sales, cogs, discounts, profit: sales - cogs };
})))));
export function filterSales(filters: Filters, year = Number(filters.year)) {
  return salesData.filter(row => row.year === year && (filters.period === 'year' || (filters.period === 'h1' ? row.month < 6 : filters.period === 'h2' ? row.month >= 6 : row.month >= 9)) && (filters.category === 'all' || row.category === filters.category) && (filters.region === 'all' || row.region === filters.region));
}
export function total(rows: Sale[]) {
  const sums = rows.reduce((s, row) => ({ sales: s.sales + row.sales, profit: s.profit + row.profit, units: s.units + row.units, discounts: s.discounts + row.discounts, cogs: s.cogs + row.cogs }), { sales: 0, profit: 0, units: 0, discounts: 0, cogs: 0 });
  return { ...sums, margin: sums.sales ? sums.profit / sums.sales * 100 : 0 };
}
export function groupSales(rows: Sale[], key: 'product' | 'category' | 'region') {
  return [...new Set(rows.map(row => row[key]))].map(name => ({ name, ...total(rows.filter(row => row[key] === name)) })).sort((a, b) => b.sales - a.sales);
}
export const money = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const compact = (n: number) => `US$ ${new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 2 }).format(n)}`;
export const number = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
export const percent = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
export const periodLabels: Record<string, string> = { year: 'Ano completo', h1: '1º semestre', h2: '2º semestre', q4: '4º trimestre' };
