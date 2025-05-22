## Políticas de privacidade

A `maisvalias-tool` foi desenvolvida com foco na **privacidade** dos utilizadores:
- Todos os dados inseridos na ferramenta (transações, dividendos, etc.) são **processados localmente no teu navegador**.
- **Nenhuma informação pessoal é enviada para servidores.**

As duas **únicas situações em que há comunicação com um servidor externo** são:

1. Obtenção de taxas de câmbio — apenas **se a corretora não fornecer diretamente a mesma**.
2. **Identificação do tipo de ativo (Ação ou ETF)**, pois isto influencia a maneira como deve ser declarado no IRS.

Nestes casos, a ferramenta consulta serviços públicos para obter a informação necessária.
Dito isto, **apenas é enviado para os serviços a data e a moeda** necessária para obter a taxa de câmbio (ex.: `USD` em `2024-06-10`), assim como o **ticker** do ativo (ex.: `VUAA`) para a ferramenta saber se é uma ação ou ETF.