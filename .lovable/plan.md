# Aba de Recursos Humanos

Adicionar **Recursos Humanos** ao menu do dashboard, preservando azul escuro, cinza chumbo, detalhes em azul royal, cards com bordas sutis e sombras suaves.

## Informações e interações
- Reproduzir os indicadores identificados no relatório do repositório: empregados, departamentos, projetos, dependentes e horas trabalhadas.
- Exibir empregados por departamento, horas por projeto, dependentes e distribuição salarial por departamento e sexo.
- Oferecer filtros por departamento, projeto e sexo, busca, ordenação, paginação, redefinição e exportação CSV.
- Utilizar os dados legíveis do repositório quando disponíveis; quando o arquivo Power BI não permitir extrair registros, identificar claramente a simulação baseada na estrutura original, sem inventar dados históricos.
- Corrigir o erro existente que impedia a prévia de abrir e validar a navegação e os cálculos.

## Detalhes técnicos
- Nova página `/rh`, com apresentação compartilhada com as páginas de vendas.
- Modelo local de RH separado, com indicadores, gráficos e exportação derivados do mesmo conjunto filtrado, sem conexão contínua com GitHub ou necessidade de login.
- Testes dos cálculos e verificações da nova página e das páginas existentes.