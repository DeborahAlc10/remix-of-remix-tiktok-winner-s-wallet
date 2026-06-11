

## Plano: Melhorar visualização do Dashboard

### Melhorias propostas

**1. Balance Card mais impactante**
- Adicionar ícone decorativo de moeda/wallet no canto superior direito com opacidade baixa
- Adicionar shimmer/brilho sutil no gradiente
- Melhorar espaçamento e tipografia

**2. Stepper mais visual**
- Aumentar tamanho dos ícones dos steps (w-10 h-10)
- Adicionar subtítulo em cada step com o status atual (ex: "Approved", "Processing", "Pending")
- Linha conectora mais grossa e com gradiente entre estados
- Adicionar ícone de erro (XCircle) quando cashout falha em vez do ícone genérico

**3. Transactions com mais detalhes**
- Adicionar badge de status em cada transação (Processing, Failed, Completed)
- Hover effect nos itens
- Adicionar ícone de seta para indicar que é clicável

**4. Layout e espaçamento geral**
- Melhorar padding e gaps entre seções
- Adicionar background sutil (surface color) no body da página
- Withdraw button com gradiente quando habilitado, e visual mais clean quando desabilitado
- Footer mais discreto

### Mudanças técnicas

**`src/components/DashboardScreen.tsx`**:
- Refatorar o componente `Step` para incluir subtítulo de status e ícones maiores
- Redesenhar o balance card com elemento decorativo
- Adicionar badges de status nas transações
- Melhorar espaçamentos e efeitos visuais
- Usar `bg-surface` no container principal para criar mais profundidade

