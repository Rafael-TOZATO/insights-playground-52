import Papa from 'papaparse';
import { z } from 'zod';
import { months, type Sale } from './sales-data';
import type { Employee, Assignment } from './hr-data';

export type ImportKind = 'sales' | 'hr';
export type NumericFormat = 'br' | 'international';
export type CsvTable = { headers: string[]; rows: string[][]; lines: number[] };
export type ColumnMapping = Record<string, string>;
export type ImportIssue = { line: number; field: string; message: string };
export type ImportedRecords = { sales: Sale[]; employees: Employee[]; assignments: Assignment[] };
export const MAX_CSV_BYTES = 20 * 1024 * 1024;
export const MAX_CSV_ROWS = 50000;
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const importFields: Record<ImportKind, { key: string; label: string; required: boolean; aliases: string[] }[]> = {
  sales: [
    { key: 'date', label: 'Data (AAAA-MM-DD ou DD/MM/AAAA)', required: false, aliases: ['data', 'date'] },
    { key: 'year', label: 'Ano', required: false, aliases: ['ano', 'year'] },
    { key: 'month', label: 'Mês (1–12 ou nome)', required: false, aliases: ['mes', 'month', 'monthname', 'monthnumber'] },
    { key: 'product', label: 'Produto', required: true, aliases: ['produto', 'product'] },
    { key: 'category', label: 'Categoria', required: true, aliases: ['categoria', 'category', 'segment', 'segmento'] },
    { key: 'region', label: 'Região', required: true, aliases: ['regiao', 'region', 'pais', 'country'] },
    { key: 'units', label: 'Unidades', required: true, aliases: ['unidades', 'units', 'unitssold', 'unidadesvendidas'] },
    { key: 'sales', label: 'Receita líquida', required: true, aliases: ['receita', 'receitaliquida', 'sales', 'vendas', 'vendasusd', 'receitausd'] },
    { key: 'cogs', label: 'Custos', required: true, aliases: ['custos', 'cogs', 'custosusd', 'cost'] },
    { key: 'discounts', label: 'Descontos (opcional; padrão 0)', required: false, aliases: ['descontos', 'discounts', 'descontosusd'] },
    { key: 'profit', label: 'Lucro (opcional; receita − custos)', required: false, aliases: ['lucro', 'profit', 'lucrousd', 'lucrobruto'] },
  ],
  hr: [
    { key: 'id', label: 'Identificador do empregado', required: true, aliases: ['id', 'identificador', 'employeeid', 'matricula', 'empregado'] },
    { key: 'department', label: 'Departamento', required: true, aliases: ['departamento', 'department'] },
    { key: 'sex', label: 'Sexo', required: true, aliases: ['sexo', 'sex', 'genero', 'gender'] },
    { key: 'salary', label: 'Salário', required: true, aliases: ['salario', 'salary', 'salarioum'] },
    { key: 'dependents', label: 'Dependentes', required: true, aliases: ['dependentes', 'dependents'] },
    { key: 'project', label: 'Projeto (opcional)', required: false, aliases: ['projeto', 'project'] },
    { key: 'hours', label: 'Horas (obrigatório com projeto)', required: false, aliases: ['horas', 'hours', 'horastrabalhadas'] },
  ],
};

export function parseCsv(text: string, delimiter = ''): CsvTable {
  if (new TextEncoder().encode(text).length > MAX_CSV_BYTES) throw new Error('O arquivo excede 20 MB.');
  const result = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { delimiter, skipEmptyLines: false });
  const malformed = result.errors.filter(e => e.code !== 'UndetectableDelimiter');
  if (malformed.length) throw new Error(`CSV inválido: ${malformed[0]?.message ?? 'aspas incorretas'}.`);
  let line = 1;
  const numbered = result.data.map(values => {
    const record = { values, line };
    line += 1 + values.reduce((sum, value) => sum + (value.match(/\n/g)?.length ?? 0), 0);
    return record;
  }).filter(r => r.values.some(v => v.trim()));
  // Accept the demonstrative metadata line produced by the previous HR exporter.
  if (numbered[0]?.values.length === 1 && /^Dados simulados/.test(numbered[0].values[0] ?? '')) numbered.shift();
  const first = numbered.shift();
  if (!first || first.values.length < 2) throw new Error('O CSV precisa de um cabeçalho com pelo menos duas colunas.');
  const headers = first.values.map(h => h.trim());
  if (headers.some(h => !h) || new Set(headers.map(normalize)).size !== headers.length) throw new Error('Há cabeçalhos vazios ou repetidos.');
  if (!numbered.length) throw new Error('O arquivo não contém registros.');
  if (numbered.length > MAX_CSV_ROWS) throw new Error('O limite é de 50.000 registros por arquivo.');
  const wrong = numbered.find(r => r.values.length !== headers.length);
  if (wrong) throw new Error(`Linha ${wrong.line}: quantidade de colunas diferente do cabeçalho.`);
  return { headers, rows: numbered.map(r => r.values), lines: numbered.map(r => r.line) };
}

export function suggestMapping(kind: ImportKind, headers: string[]): ColumnMapping {
  return Object.fromEntries(importFields[kind].map(f => [f.key, headers.find(h => f.aliases.includes(normalize(h))) ?? '']));
}

export function parseNumber(value: string, format: NumericFormat): number {
  const cleaned = value.trim().replace(/[\s\u00A0]/g, '');
  const pattern = format === 'br' ? /^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/ : /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
  if (!pattern.test(cleaned)) throw new Error('Número inválido para o formato selecionado.');
  const n = Number(format === 'br' ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, ''));
  if (!Number.isFinite(n) || Math.abs(n) > 1e12) throw new Error('Número fora do intervalo permitido.');
  return n;
}

const dimension = z.string().trim().min(1).max(160).refine(v => v !== 'all', 'Valor reservado; use outro identificador.');
const nonnegative = z.number().finite().min(0).max(1e12);
const employeeSchema = z.object({ id: dimension, department: dimension, sex: dimension, salary: nonnegative, dependents: nonnegative.int() });
const saleSchema = z.object({ id: z.string(), year: z.number().int().min(1900).max(9999), month: z.number().int().min(0).max(11), product: dimension, category: dimension, region: dimension, units: nonnegative.int(), sales: nonnegative, cogs: nonnegative, discounts: nonnegative, profit: z.number().finite() });
const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fullMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function validateImport(kind: ImportKind, table: CsvTable, mapping: ColumnMapping, format: NumericFormat) {
  const issues: ImportIssue[] = [];
  const records: ImportedRecords = { sales: [], employees: [], assignments: [] };
  const fields = importFields[kind];
  const add = (line: number, field: string, message: string) => issues.push({ line, field, message });
  fields.filter(f => f.required && !mapping[f.key]).forEach(f => add(0, f.label, 'Selecione uma coluna.'));
  const selected = Object.values(mapping).filter(Boolean);
  if (new Set(selected).size !== selected.length) add(0, 'Mapeamento', 'Cada coluna pode ser usada apenas uma vez.');
  if (selected.some(h => !table.headers.includes(h))) add(0, 'Mapeamento', 'Coluna inexistente.');
  if (kind === 'sales' && !mapping['date'] && !(mapping['year'] && mapping['month'])) add(0, 'Período', 'Mapeie a data ou o ano e o mês.');
  if (kind === 'hr' && Boolean(mapping['project']) !== Boolean(mapping['hours'])) add(0, 'Alocação', 'Mapeie projeto e horas juntos, ou deixe ambos sem coluna.');
  if (issues.length) return { issues, records };
  const people = new Map<string, Employee>();
  const allocationKeys = new Set<string>();
  table.rows.forEach((row, index) => {
    const line = table.lines[index] ?? index + 2;
    const get = (key: string) => row[table.headers.indexOf(mapping[key] ?? '')]?.trim() ?? '';
    const num = (key: string, optional = false) => {
      try { return optional && !get(key) ? 0 : parseNumber(get(key), format); }
      catch (e) { add(line, fields.find(f => f.key === key)?.label ?? key, e instanceof Error ? e.message : 'Número inválido.'); return NaN; }
    };
    const before = issues.length;
    if (kind === 'sales') {
      let year = Number(get('year')), month = Number(get('month')) - 1;
      if (mapping['date']) {
        const raw = get('date');
        const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
        const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
        year = Number(iso?.[1] ?? br?.[3]); month = Number(iso?.[2] ?? br?.[2]) - 1;
        const day = Number(iso?.[3] ?? br?.[1]);
        const date = new Date(Date.UTC(year, month, day));
        if ((!iso && !br) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) add(line, 'Data', 'Data inválida; use AAAA-MM-DD ou DD/MM/AAAA.');
      } else if (!/^\d+$/.test(get('month'))) {
        month = fullMonths.findIndex((name, i) => [name, months[i] ?? '', englishMonths[i] ?? '', (englishMonths[i] ?? '').slice(0, 3)].map(normalize).includes(normalize(get('month'))));
      }
      const sales = num('sales'), cogs = num('cogs');
      const profit = mapping['profit'] && get('profit') ? num('profit') : sales - cogs;
      if (Number.isFinite(profit) && Math.abs(profit - (sales - cogs)) > 0.011) add(line, 'Lucro', 'Lucro deve corresponder à receita líquida menos custos.');
      const parsed = saleSchema.safeParse({ id: `CSV-${index + 1}`, year, month, product: get('product'), category: get('category'), region: get('region'), units: num('units'), sales, cogs, discounts: num('discounts', true), profit: sales - cogs });
      if (!parsed.success) parsed.error.issues.forEach(e => add(line, fields.find(f => f.key === e.path[0])?.label ?? 'Registro', 'Valor obrigatório ou fora do intervalo válido.'));
      else if (issues.length === before) records.sales.push(parsed.data);
    } else {
      const sexValue = get('sex');
      const sex = ['f', 'feminino', 'female'].includes(normalize(sexValue)) ? 'Feminino' : ['m', 'masculino', 'male'].includes(normalize(sexValue)) ? 'Masculino' : sexValue;
      const parsed = employeeSchema.safeParse({ id: get('id'), department: get('department'), sex, salary: num('salary'), dependents: num('dependents') });
      if (!parsed.success) { parsed.error.issues.forEach(e => add(line, fields.find(f => f.key === e.path[0])?.label ?? 'Registro', 'Valor obrigatório ou fora do intervalo válido.')); return; }
      const person = parsed.data, existing = people.get(person.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(person)) add(line, 'Empregado', 'Dados conflitantes para o mesmo identificador.');
      const project = get('project'), hoursValue = get('hours');
      if (project) {
        const hours = num('hours');
        if (!dimension.safeParse(project).success || !nonnegative.safeParse(hours).success) add(line, 'Alocação', 'Projeto ou horas inválidos.');
        const key = JSON.stringify([person.id, project]);
        if (allocationKeys.has(key)) add(line, 'Alocação', 'Empregado e projeto repetidos; consolide as horas em uma linha.');
        if (issues.length === before) { allocationKeys.add(key); records.assignments.push({ employeeId: person.id, project, hours }); }
      } else if (hoursValue && num('hours') !== 0) add(line, 'Projeto', 'Horas sem projeto correspondente.');
      if (existing && !project) add(line, 'Empregado', 'Empregado repetido sem uma nova alocação.');
      if (issues.length === before) people.set(person.id, person);
    }
  });
  records.employees = [...people.values()];
  return { issues, records };
}

export function csvContent(rows: (string | number)[][]) {
  return '\uFEFF' + Papa.unparse(rows, { delimiter: ';', newline: '\n', escapeFormulae: true });
}
export function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}