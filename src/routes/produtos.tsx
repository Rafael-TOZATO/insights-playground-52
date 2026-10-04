import { createFileRoute } from '@tanstack/react-router';
import { SalesDashboard } from '@/components/sales-dashboard';
export const Route = createFileRoute('/produtos')({
  head: () => ({ meta: [ { title: 'Produtos · Atlas Sales Intelligence' }, { name: 'description', content: 'Compare receita, lucro e margem por produto no dashboard demonstrativo Atlas.' }, { property: 'og:title', content: 'Produtos · Atlas Sales Intelligence' }, { property: 'og:description', content: 'Análise comparativa de produtos, vendas e rentabilidade.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
  component: () => <SalesDashboard view="products" />,
});
