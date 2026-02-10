# Vitrine Imobiliária - Ezequias Alves

Plataforma imobiliária premium construída com Next.js + Supabase, focada em performance, design clean e conversão via WhatsApp.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + componentes estilo shadcn/ui
- Lucide React
- Supabase (Auth, Database, Storage)

## Funcionalidades

- Home pública com:
  - Hero + busca real por cidade e tipo
  - Destaques e prova social com dados reais do banco
  - Cards clicáveis para página de detalhe do imóvel
- Página de imóvel:
  - Galeria/carrossel
  - Specs completas
  - CTA de WhatsApp contextual
- Admin:
  - Login via Supabase Auth
  - CRUD de imóveis com upload de múltiplas imagens
  - Campo tipo de imóvel (`property_type`)
  - Mini CRM (CRUD de leads)
  - Sidebar por módulo (Imóveis / Leads)

## Requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase configurado

## Variáveis de ambiente

Crie `.env.local` com base em `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SUPABASE_PROPERTY_BUCKET` (ex.: `property-images`)
- `DATABASE_URL` (para operações SQL diretas, se necessário)

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse:

- `http://localhost:3000`
- `http://localhost:3000/admin`

## Build de produção

```bash
npm run build
npm run start
```

Para porta customizada:

```bash
PORT=3001 npm run start
```

## Deploy em VPS

Guia completo em:

- `DEPLOY-VPS.md`

## Estrutura principal

- `src/app/page.tsx` - Home
- `src/app/imoveis/[id]/page.tsx` - Detalhe do imóvel
- `src/app/admin/page.tsx` - Admin (imóveis + leads)
- `src/components/header.tsx` - Cabeçalho
- `src/components/footer.tsx` - Rodapé

## Licença

Projeto privado.
