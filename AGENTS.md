<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Dashboard architecture
- Use deterministic local financial mock records and derive every KPI, chart, table and CSV from the same filtered records to keep analyses consistent.
- Keep sales content in its shared presentation module and all dashboard routes in DashboardShell with semantic CSS tokens so navigation and styling remain consistent.

- Keep HR employees and project assignments in a separate deterministic local model; derive filtered KPIs, charts and CSV from distinct employees and scoped assignments to avoid double counting.
- Label HR reconstructed rows as simulated, use anonymous IDs and salary units without asserting a currency or historical period because the repository does not expose raw records.
