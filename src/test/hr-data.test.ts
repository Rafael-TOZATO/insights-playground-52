import { describe, expect, it } from 'vitest';
import { filterHr, summarizeHr, initialHrFilters, hrCsv, employees, assignments } from '@/lib/hr-data';
import { salesData, total, filterSales, initialFilters } from '@/lib/sales-data';

describe('HR local model', () => {
  it('keeps repository-confirmed totals and simulated hours consistent', () => {
    expect(summarizeHr(filterHr(initialHrFilters))).toMatchObject({ employees: 8, departments: 3, projects: 6, dependents: 7, hours: 2400 });
    expect(assignments.every(a => employees.some(e => e.id === a.employeeId))).toBe(true);
  });
  it('filters department, project and sex without duplicating employees', () => {
    const data = filterHr({ department: 'Pesquisa', project: 'ProductX', sex: 'Masculino' });
    expect(summarizeHr(data)).toMatchObject({ employees: 2, departments: 1, projects: 1, dependents: 6, hours: 425, salary: 70000 });
    expect(data.work.every(a => a.project === 'ProductX')).toBe(true);
    const csv = hrCsv(data);
    expect(csv).toContain('RH-001;Pesquisa;Masculino;30000;3;325;ProductX');
    expect(csv).not.toContain('ProductY');
    expect(csv).not.toContain('RH-003');
  });
  it('handles empty intersections and zeros', () => {
    const data = filterHr({ department: 'Sede', project: 'ProductX', sex: 'Feminino' });
    expect(summarizeHr(data)).toEqual({ employees: 0, departments: 0, projects: 0, dependents: 0, hours: 0, salary: 0 });
    expect(hrCsv(data).split('\n')).toHaveLength(2);
  });
});
describe('Sales regression', () => {
  it('keeps financial records finite and balanced', () => {
    expect(salesData.every(r => Number.isFinite(r.sales) && r.sales - r.cogs === r.profit)).toBe(true);
    const sums = total(filterSales(initialFilters));
    expect(sums.profit).toBe(sums.sales - sums.cogs);
    expect(sums.margin).toBeGreaterThan(0);
  });
});