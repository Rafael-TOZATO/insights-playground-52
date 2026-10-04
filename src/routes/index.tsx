import { createFileRoute } from '@tanstack/react-router';
import { SalesDashboard } from '@/components/sales-dashboard';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [ { title: 'Atlas · Dashboard de vendas' }, { name: 'description', content: 'Análise interativa de vendas, lucro, produtos e regiões com dados demonstrativos e filtros de período.' }, { property: 'og:title', content: 'Atlas · Dashboard de vendas' }, { property: 'og:description', content: 'Visão consolidada de vendas e indicadores financeiros com filtros interativos.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
  component: () => <SalesDashboard />,
});
