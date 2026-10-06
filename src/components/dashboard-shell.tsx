import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { BarChart3, LayoutDashboard, Package, Globe2, Users, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DashboardView = 'overview' | 'products' | 'regions' | 'hr';
const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, key: 'overview' },
  { to: '/produtos', label: 'Produtos', icon: Package, key: 'products' },
  { to: '/regioes', label: 'Regiões', icon: Globe2, key: 'regions' },
  { to: '/rh', label: 'Recursos Humanos', icon: Users, key: 'hr' },
] as const;
export function DashboardShell({ view, children }: { view: DashboardView; children: ReactNode }) {
  return <div className="dashboard">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><BarChart3 size={21} /></span><div><div className="brand-name">atlas<span className="text-chart-2">.</span></div><div className="brand-sub">SALES INTELLIGENCE</div></div></div>
      <div className="nav-label">ANÁLISES</div>
      <nav className="sidebar-nav" aria-label="Navegação principal">{navigation.map(item => <Button asChild variant="ghost" className="nav-item" key={item.key}><Link to={item.to} aria-current={view === item.key ? 'page' : undefined}><item.icon size={17} />{item.label}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><div className="workspace-label">ESPAÇO DE TRABALHO</div><div className="workspace-name"><Building2 size={15} className="text-muted-foreground" />{view === 'hr' ? 'Gestão de pessoas' : 'Relatórios de vendas'}</div></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={12} /><span className="breadcrumb-current">{navigation.find(n => n.key === view)?.label}</span></div><span className="demo-badge"><span />Dados demonstrativos</span></header><div className="content">{children}</div></main>
  </div>;
}