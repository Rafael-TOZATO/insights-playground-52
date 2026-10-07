import { useMemo, useRef, useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useDashboardData } from './dashboard-data';
import { parseCsv, suggestMapping, validateImport, importFields, downloadCsv, csvContent, MAX_CSV_BYTES, type CsvTable, type ColumnMapping, type ImportKind, type NumericFormat } from '@/lib/csv-import';

export function CsvImportDialog({ kind, onImported }: { kind: ImportKind; onImported: () => void }) {
  const { replaceSales, replaceHr } = useDashboardData();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [table, setTable] = useState<CsvTable>();
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [format, setFormat] = useState<NumericFormat>('br');
  const [delimiter, setDelimiter] = useState('auto');
  const [currency, setCurrency] = useState('BRL');
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const request = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const validation = useMemo(() => table ? validateImport(kind, table, mapping, format) : undefined, [kind, table, mapping, format]);
  const valid = validation && !validation.issues.length;
  function load(raw: string, separator: string) {
    try { const next = parseCsv(raw, separator === 'auto' ? '' : separator); setTable(next); setMapping(suggestMapping(kind, next.headers)); setError(''); }
    catch (e) { setTable(undefined); setError(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.'); }
  }
  async function read(file?: File) {
    const version = ++request.current;
    setTable(undefined); setText(''); setError(''); setFilename(file?.name ?? '');
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) { setError('Selecione um arquivo com extensão .csv.'); return; }
    if (file.size > MAX_CSV_BYTES) { setError('O arquivo excede 20 MB.'); return; }
    setReading(true);
    try {
      const buffer = await file.arrayBuffer();
      let raw: string;
      try { raw = new TextDecoder('utf-8', { fatal: true }).decode(buffer); } catch { raw = new TextDecoder('windows-1252').decode(buffer); }
      if (version !== request.current) return;
      setText(raw); load(raw, delimiter);
    } catch { if (version === request.current) setError('Não foi possível ler o arquivo.'); }
    finally { if (version === request.current) setReading(false); }
  }
  function template() {
    const rows = kind === 'sales'
      ? [['Data', 'Produto', 'Categoria', 'Região', 'Unidades', 'Receita', 'Custos', 'Descontos'], ['2026-01-15', 'Produto A', 'Varejo', 'Brasil', '10', '1500,50', '900,00', '0']]
      : [['Identificador', 'Departamento', 'Sexo', 'Salário', 'Dependentes', 'Projeto', 'Horas'], ['EMP-001', 'Operações', 'Feminino', '4500,00', '1', 'Projeto A', '40'], ['EMP-001', 'Operações', 'Feminino', '4500,00', '1', 'Projeto B', '20']];
    downloadCsv(csvContent(rows), `modelo-${kind === 'sales' ? 'vendas' : 'rh'}.csv`);
  }
  return <><Button variant="outline" className="action-button" onClick={() => { setOpen(true); setTable(undefined); setText(''); setFilename(''); setError(''); }}><Upload />Importar CSV</Button>
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { request.current++; setReading(false); } }}><DialogContent className="csv-dialog">
      <DialogHeader><DialogTitle>Importar {kind === 'sales' ? 'vendas' : 'Recursos Humanos'}</DialogTitle><DialogDescription>Substituição da base de {kind === 'sales' ? 'vendas' : 'RH'} · somente nesta sessão, sem envio dos arquivos.</DialogDescription></DialogHeader>
      <div className="csv-toolbar"><Button variant="outline" onClick={() => input.current?.click()} disabled={reading}><FileSpreadsheet />{reading ? 'Lendo arquivo…' : filename ? 'Trocar arquivo' : 'Selecionar CSV'}</Button><Button variant="ghost" onClick={template}><Download />Baixar modelo</Button><input ref={input} className="hidden" type="file" accept=".csv,text/csv" aria-label="Arquivo CSV" onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }} /></div>
      {filename && <p className="csv-filename">{filename}</p>}
      <div className="csv-settings"><div className="filter"><label>Separador</label><Select value={delimiter} onValueChange={v => { setDelimiter(v); if (text) load(text, v); }}><SelectTrigger aria-label="Separador"><SelectValue /></SelectTrigger><SelectContent>{[['auto','Automático'],[';','Ponto e vírgula'],[',','Vírgula'],['\t','Tabulação']].map(([v,l]) => <SelectItem key={v} value={v ?? 'auto'}>{l}</SelectItem>)}</SelectContent></Select></div>
      <div className="filter"><label>Formato numérico</label><Select value={format} onValueChange={v => setFormat(v as NumericFormat)}><SelectTrigger aria-label="Formato numérico"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="br">1.234,56</SelectItem><SelectItem value="international">1,234.56</SelectItem></SelectContent></Select></div>
      {kind === 'sales' && <div className="filter"><label>Moeda da base</label><Select value={currency} onValueChange={setCurrency}><SelectTrigger aria-label="Moeda da base"><SelectValue /></SelectTrigger><SelectContent>{['BRL','USD','EUR'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>}</div>
      {error && <p className="csv-error" role="alert"><AlertCircle size={16} />{error}</p>}
      {table && <>
        <h2>Mapeamento de colunas</h2><div className="csv-mapping">{importFields[kind].map(f => <div className="filter" key={f.key}><label>{f.label}{f.required && ' *'}</label><Select value={mapping[f.key] || '__unmapped'} onValueChange={v => setMapping(m => ({ ...m, [f.key]: v === '__unmapped' ? '' : v }))}><SelectTrigger aria-label={`Coluna: ${f.label}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__unmapped">Sem coluna</SelectItem>{table.headers.map((h, i) => <SelectItem value={h} key={i}>{h}</SelectItem>)}</SelectContent></Select></div>)}</div>
        <h2>Prévia · {table.rows.length.toLocaleString('pt-BR')} registros</h2><div className="table-scroll csv-preview"><table className="sales-table"><thead><tr>{table.headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{table.rows.slice(0,3).map((r,i) => <tr key={i}>{r.map((v,j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div>
        <div aria-live="polite">{valid ? <p className="csv-valid"><CheckCircle2 size={16} />Todos os registros válidos{kind === 'hr' && ` · ${validation.records.employees.length} empregados únicos · ${validation.records.assignments.length} alocações`}</p> : <div className="csv-issues"><p className="csv-error"><AlertCircle size={16} />{validation?.issues.length} problemas · a base atual será preservada</p><ul>{validation?.issues.slice(0,20).map((issue,i) => <li key={i}>{issue.line ? `Linha ${issue.line} · ` : ''}{issue.field}: {issue.message}</li>)}</ul>{(validation?.issues.length ?? 0) > 20 && <p>Exibindo os primeiros 20 problemas.</p>}</div>}</div>
      </>}
      <div className="csv-confirm"><p>{kind === 'sales' ? 'Receita líquida; lucro calculado como receita − custos.' : 'Uma linha por empregado e projeto; salários e dependentes não são somados em repetições.'}</p><div className="flex gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={!valid || reading} onClick={() => {
        if (!validation || validation.issues.length) return;
        if (kind === 'sales') replaceSales({ rows: validation.records.sales, filename, currency });
        else replaceHr({ employees: validation.records.employees, assignments: validation.records.assignments, filename });
        onImported(); setOpen(false);
      }}><Upload />Substituir dados</Button></div></div>
    </DialogContent></Dialog>
  </>;
}