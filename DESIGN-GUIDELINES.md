# Diretrizes de Design & UI

## Estilo Visual
* **Vibe:** Clean, Minimalista, Sofisticado. "Menos é mais".
* **Referência:** Sites de arquitetura e imobiliárias de alto padrão (ex: The Agency, Sotheby's).

## Cores (Sugestão)
* **Primary:** `#0F172A` (Slate 900 - Quase preto, para textos e botões fortes). Passa seriedade.
* **Secondary:** `#64748B` (Slate 500 - Cinza médio para textos secundários).
* **Accent:** `#B45309` (Amber 700 - Dourado/Bronze sutil para detalhes de luxo, usar com moderação) OU `#0EA5E9` (Sky 500 - Azul para botões de ação se quiser algo mais tech).
* **Background:** `#FFFFFF` (Branco puro) e `#F8FAFC` (Slate 50 - Off-white para seções alternadas).

## Tipografia
* **Font Family:** `Inter` ou `Plus Jakarta Sans` (Google Fonts). Modernas, geométricas e extremamente legíveis.
* **Headings:** Bold ou Semi-bold. Letter-spacing levemente negativo (-0.02em).
* **Body:** Regular, 16px base.

## Componentes shadcn/ui Recomendados
* **Cards:** Para a listagem de imóveis (`Card`, `CardHeader`, `CardContent`).
* **Select:** Para os filtros de busca (`Select`, `SelectTrigger`).
* **Carousel:** Para a galeria de fotos do imóvel.
* **Badge:** Para status "Vendido", "Novo" ou "Exclusivo".
* **Button:** Variantes `default` (preto) e `outline` (borda fina).
* **Skeleton:** Para loading states (essencial para percepção de performance).

## Imagens
* **Proporção:** Padronizar aspect-ratio (ex: 16:9 ou 4:3) via CSS (`object-cover`) para que o grid fique sempre alinhado, independente do tamanho original da foto enviada.
* **Bordas:** `rounded-lg` (8px) ou `rounded-xl` (12px) para suavizar.