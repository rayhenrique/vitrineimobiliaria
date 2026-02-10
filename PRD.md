# Product Requirements Document (PRD)

## 1. Visão do Produto
Uma vitrine digital rápida e elegante que centraliza o portfólio do corretor, permitindo busca fácil por cidade/bairro e contato imediato via WhatsApp.

## 2. Personas
* **O Admin (Corretor):** Não é técnico. Quer abrir o painel, arrastar as fotos, preencher o valor e salvar. Quer ver seu site bonito no celular para mostrar a clientes em reuniões.
* **O Comprador:** Está cansado de sites lentos e poluídos. Quer ver as fotos grandes, saber onde fica (Cidade/Bairro) e chamar no Zap se gostar.

## 3. User Stories
* **US01:** Como Admin, quero fazer login seguro para que apenas eu possa alterar os dados.
* **US02:** Como Admin, quero cadastrar um imóvel com fotos, título, descrição, preço, cidade e bairro.
* **US03:** Como Visitante, quero filtrar imóveis por Cidade, Bairro e Faixa de Preço para encontrar o que busco.
* **US04:** Como Visitante, quero clicar em "Tenho Interesse" e abrir meu WhatsApp já com uma mensagem pronta sobre aquele imóvel.
* **US05:** Como Visitante, quero ver uma galeria de fotos fluida (swipe no mobile) para analisar os detalhes do imóvel.

## 4. Requisitos Funcionais

### 4.1. Gestão de Imóveis (Admin)
* **CRUD Completo:** Criar, Ler, Atualizar e Deletar imóveis.
* **Campos Obrigatórios:**
    * Título (ex: "Apartamento Vista Mar")
    * Descrição (Rich text ou texto simples)
    * Preço (Venda e/ou Locação)
    * Cidade
    * Bairro
    * Área (m²)
    * Quartos / Banheiros / Vagas
    * Status (Disponível, Reservado, Vendido)
* **Upload de Imagens:** Integração com Supabase Storage. Suporte a múltiplas imagens. Drag & drop.

### 4.2. Vitrine (Público)
* **Listagem:** Grid responsivo de cards de imóveis.
* **Filtros:** Sidebar ou Topbar com filtros de Cidade, Bairro, Tipo e Preço.
* **Paginação/Load More:** Botão "Carregar mais" para suportar o crescimento do portfólio.
* **Detalhe do Imóvel:**
    * Carrossel de imagens.
    * Informações principais em destaque.
    * Botão flutuante de WhatsApp (Sticky no mobile).

## 5. Requisitos Não-Funcionais
* **Performance:** Next.js com SSR (Server Side Rendering) ou ISR para SEO otimizado.
* **Imagens:** Uso do componente `next/image` para otimização automática (WebP, Lazy Loading).
* **Banco de Dados:** Supabase (PostgreSQL).
* **Estilização:** Tailwind CSS + shadcn/ui.
* **Responsividade:** Mobile-first.

## 6. Integrações
* **Supabase Auth:** Para login do admin.
* **Supabase Database & Storage:** Para dados e fotos.
* **WhatsApp API (Link):** Formato `https://wa.me/${PHONE}?text=${MESSAGE}`.

## 7. Modelo de Dados (Sugestão Simplificada)
**Tabela: properties**
* id (uuid)
* title (text)
* description (text)
* price (numeric)
* city (text)
* neighborhood (text)
* specs (jsonb) -> { beds: 3, baths: 2, size: 120 }
* images (text[]) -> Array de URLs
* status (text) -> 'active', 'sold'
* created_at (timestamp)