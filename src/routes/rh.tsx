import { createFileRoute } from '@tanstack/react-router';
import { HrDashboard } from '@/components/hr-dashboard';

export const Route = createFileRoute('/rh')({
  head: () => ({ meta: [
    { title: 'Recursos Humanos · Atlas' },
    { name: 'description', content: 'Dashboard de Recursos Humanos com empregados, departamentos, projetos, dependentes e horas trabalhadas em uma base demonstrativa inspirada no relatório DIO Santander.' },
    { property: 'og:title', content: 'Recursos Humanos · Atlas' },
    { property: 'og:description', content: 'Análise interativa de pessoas, salários e alocações por departamento e projeto com dados simulados.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: HrDashboard,
});