# Design: Ledger Library & Consumption Cadence (R24)

## Context

A visualização da biblioteca (`/library`) precisa evoluir para a densidade estética e de produto consolidado ("Ledger Pessoal v2.4") demonstrada na referência visual do projeto. O objetivo é fornecer uma visão analítica rica com KPIs de consumo (Concluídos, Em Andamento, Tempo Total), filtros rápidos locais com busca textual instantânea, cards aprimorados com seletor popover de notas de 1 a 10 estrelas e atalho para anotações do diário, card pontilhado "Registrar Nova Obra" com atalho para exploração global e o banner inferior "Cadência de Consumo" com cálculo de média diária e gráfico de sparkline em SVG.

## Goals / Non-Goals

### Goals
- Renderizar cabeçalho do Ledger com tag de versão `LEDGER PESSOAL V2.4`, indicador de sincronização e 3 cartões de KPI consolidados (*Concluídos*, *Em Andamento*, *Tempo Total*).
- Prover campo de busca local `Filtrar nesta lista...` operando em memória sem requisições HTTP redundantes.
- Enriquecer os cards com seletor popover de nota rápida de 1 a 10 estrelas e atalho para o modal de diário.
- Inserir o card com borda tracejada *"Registrar Nova Obra"* na grade da biblioteca com botão direcionando para `/explore`.
- Renderizar o banner inferior *"Cadência de Consumo"* com total de unidades consumidas nos últimos 30 dias, média diária calculada e sparkline SVG fluido.
- Prover ação de exportação rápida para CSV a partir dos dados do acervo.
- Manter acessibilidade estrita WCAG 2.2 AA (mínimo 44x44px em alvos de toque) e paleta Asian Editorial.

### Non-Goals
- Não alterar schemas do banco de dados no PostgreSQL ou contratos de API backend (cálculos de agregação e KPIs no cliente garantem custo R$ 0 e funcionamento offline).
- Não criar rotas fora de `/library`.

## Decisions

### Decisão 1: Agregação Reativa no Cliente (useMemo) para KPIs e Cadência
- **Alternativas consideradas:**
  - *Opção 1 (Rejeitada):* Criar novo endpoint no backend com consultas SQL pesadas de agregação. Rejeitada por adicionar latência desnecessária e quebrar a independência offline do PWA.
  - *Opção 2 (Adotada):* Calcular os 3 KPIs e o array de 30 dias no cliente via hook reativo `useMemo` a partir dos itens da biblioteca (`items`) e registros do diário (`diaryEvents`), garantindo resposta em < 5ms e conformidade total com o monólito modular.

### Decisão 2: Sparkline SVG Nativo Responsivo
- **Alternativas consideradas:**
  - *Opção 1 (Rejeitada):* Adicionar dependência externa pesada de gráficos (Chart.js, Recharts). Rejeitada pela Constituição Art. II (Custo Zero e bundle leve).
  - *Opção 2 (Adotada):* Componente SVG nativo leve (`<svg viewBox="0 0 300 48">`) com curva suavizada (Catmull-Rom ou interpolação linear limpa) e preenchimento em gradiente carmim/lavanda.

### Decisão 3: Popover de Nota Inline Flutuante
- **Alternativas consideradas:**
  - *Opção 1 (Rejeitada):* Abrir o modal completo de edição para qualquer ajuste de nota.
  - *Opção 2 (Adotada):* Popover flutuante acessível no rodapé do card com botões de 1 a 10 estrelas, acionando `libraryApi.updateItem` imediatamente e exibindo feedback de confirmação.

## Risks / Trade-offs

- **Risco 1 (Cálculo de Tempo Total sem duração por obra):** Obras de mangá não possuem duração em minutos registrada no card.
  - *Mitigação:* Usar duração média padrão (24 minutos por episódio para animes/doramas e 10 minutos por capítulo para mangás/manhwas) com indicação sutil na interface.
- **Risco 2 (Busca local versus paginação futura):** A biblioteca atual carrega todos os itens do usuário no cliente.
  - *Mitigação:* A busca filtra instantaneamente a lista em memória com suporte a normalização de strings (acentos e maiúsculas/minúsculas).

## Migration Plan

- Nenhuma migração de banco necessária. As mudanças são 100% incrementais na camada de componentes web de `apps/web/src/components/library/`.

## Touch-Points (Arquivos Impactados)

- `[MODIFY]` `apps/web/src/components/library/library-view.tsx`
- `[CREATE]` `apps/web/src/components/library/ledger-header.tsx`
- `[CREATE]` `apps/web/src/components/library/quick-rating-popover.tsx`
- `[CREATE]` `apps/web/src/components/library/dashed-register-card.tsx`
- `[CREATE]` `apps/web/src/components/library/consumption-cadence-banner.tsx`
- `[MODIFY]` `apps/web/src/components/library/library-filters.tsx`
- `[MODIFY]` `apps/web/src/components/library/library-card.tsx`
- `[CREATE]` `tests/ledger-library-and-cadence.test.mjs`

## Data Model

```typescript
export interface LedgerKpiMetrics {
  completedCount: number;
  inProgressCount: number;
  totalHours: number;
  syncTimestampText: string;
}

export interface ConsumptionCadenceData {
  totalEpisodes30Days: number;
  totalChapters30Days: number;
  dailyAverage: number;
  dailyPoints: number[]; // 30 valores para a curva do sparkline
}
```

## Contracts

- **Exportação CSV no Cliente**:
  - Headers: `ID,Título,Título Original,Categoria,Status,Progresso,Total,Nota,Favorito,Atualizado Em`
  - MIME type: `text/csv;charset=utf-8;` com BOM `\uFEFF` para compatibilidade com Excel.

## Research

A análise da referência visual 2 comprovou que a exibição da biblioteca como um "Ledger Pessoal" transforma a percepção do usuário de uma simples lista para um centro de comando pessoal e auditável, estimulando a retenção através de métricas de esforço investido (*Tempo Total*) e constância recente (*Cadência de Consumo*).

