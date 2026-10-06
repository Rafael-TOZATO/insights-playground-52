// Local demonstrative reconstruction, not an extraction of the PBIX DataModel.
// The README confirms 8 employees, 3 departments, 6 projects and 7 dependents.
// Assignments, hours and salaries below are simulated; no historical dates or PII.
export type Employee = { id: string; department: string; sex: 'Feminino' | 'Masculino'; salary: number; dependents: number };
export type Assignment = { employeeId: string; project: string; hours: number };
export type HrFilters = { department: string; project: string; sex: string };
export const initialHrFilters: HrFilters = { department: 'all', project: 'all', sex: 'all' };
export const departments = ['Pesquisa', 'Administração', 'Sede'];
export const hrProjects = ['Computerization', 'ProductX', 'ProductZ', 'ProductY', 'Newbenefits', 'Reorganization'];
export const employees: Employee[] = [
  { id: 'RH-001', department: 'Pesquisa', sex: 'Masculino', salary: 30000, dependents: 3 },
  { id: 'RH-002', department: 'Pesquisa', sex: 'Masculino', salary: 40000, dependents: 3 },
  { id: 'RH-003', department: 'Pesquisa', sex: 'Feminino', salary: 25000, dependents: 0 },
  { id: 'RH-004', department: 'Pesquisa', sex: 'Masculino', salary: 38000, dependents: 0 },
  { id: 'RH-005', department: 'Administração', sex: 'Feminino', salary: 43000, dependents: 1 },
  { id: 'RH-006', department: 'Administração', sex: 'Feminino', salary: 25000, dependents: 0 },
  { id: 'RH-007', department: 'Administração', sex: 'Masculino', salary: 25000, dependents: 0 },
  { id: 'RH-008', department: 'Sede', sex: 'Masculino', salary: 55000, dependents: 0 },
];
export const assignments: Assignment[] = [
  { employeeId: 'RH-001', project: 'ProductX', hours: 325 }, { employeeId: 'RH-001', project: 'ProductY', hours: 75 },
  { employeeId: 'RH-002', project: 'ProductX', hours: 100 }, { employeeId: 'RH-002', project: 'ProductY', hours: 100 },
  { employeeId: 'RH-002', project: 'Computerization', hours: 100 }, { employeeId: 'RH-002', project: 'Reorganization', hours: 100 },
  { employeeId: 'RH-003', project: 'ProductX', hours: 100 }, { employeeId: 'RH-003', project: 'ProductY', hours: 200 },
  { employeeId: 'RH-004', project: 'ProductZ', hours: 400 },
  { employeeId: 'RH-005', project: 'Newbenefits', hours: 200 },
  { employeeId: 'RH-006', project: 'Computerization', hours: 300 },
  { employeeId: 'RH-007', project: 'Computerization', hours: 150 }, { employeeId: 'RH-007', project: 'Newbenefits', hours: 150 },
  { employeeId: 'RH-008', project: 'ProductZ', hours: 100 },
];
export function filterHr(filters: HrFilters) {
  const people = employees.filter(e => (filters.department === 'all' || e.department === filters.department) && (filters.sex === 'all' || e.sex === filters.sex) && (filters.project === 'all' || assignments.some(a => a.employeeId === e.id && a.project === filters.project)));
  const ids = new Set(people.map(e => e.id));
  const work = assignments.filter(a => ids.has(a.employeeId) && (filters.project === 'all' || a.project === filters.project));
  return { people, work };
}
export function summarizeHr({ people, work }: ReturnType<typeof filterHr>) {
  return { employees: people.length, departments: new Set(people.map(e => e.department)).size, projects: new Set(work.map(a => a.project)).size, dependents: people.reduce((s,e) => s + e.dependents, 0), hours: work.reduce((s,a) => s + a.hours, 0), salary: people.reduce((s,e) => s + e.salary, 0) };
}
export function hrCsv(data: ReturnType<typeof filterHr>) {
  const lines = data.people.map(e => [e.id, e.department, e.sex, e.salary, e.dependents, data.work.filter(a => a.employeeId === e.id).reduce((s,a) => s + a.hours, 0), data.work.filter(a => a.employeeId === e.id).map(a => a.project).join(', ')].join(';'));
  return '\uFEFF' + ['Dados simulados baseados na estrutura do relatório DIO Santander', 'Identificador;Departamento;Sexo;Salário (u.m.);Dependentes;Horas;Projetos', ...lines].join('\n');
}