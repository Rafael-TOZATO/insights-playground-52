import { createFileRoute } from '@tanstack/react-router';
import { SalesDashboard } from '@/components/sales-dashboard';
export const Route = createFileRoute('/regioes')({
  head: () => ({ meta: [ { title: 'Regiões · Atlas Sales Intelligence' }, { name: 'description', content: 'Analise o desempenho de vendas e a distribuição geográfica da receita por país.' }, { property: 'og:title', content: 'Regiões · Atlas Sales Intelligence' }, { property: 'og:description', content: 'Indicadores de vendas por região e país com filtros interativos.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
  component: () => <SalesDashboard view="regions" />,
});
