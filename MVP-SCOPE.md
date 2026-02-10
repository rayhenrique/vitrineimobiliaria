# Escopo do MVP (Mínimo Produto Viável)

## O que ESTÁ no MVP (Prioridade Alta)
1.  **Painel Admin (Backoffice):**
    * Login simples.
    * Formulário de cadastro de imóveis (incluindo Cidade).
    * Upload de fotos (funcionalidade core).
    * Listagem de gestão (editar/excluir).
2.  **Site Público (Frontend):**
    * Home Page com "Imóveis em Destaque".
    * Página de Busca com filtros (Cidade, Preço, Tipo).
    * Página de Detalhe do Imóvel com galeria.
    * Botão de WhatsApp dinâmico ("Olá, vi o imóvel X na cidade Y...").
    * Página Institucional "Sobre".

## O que NÃO ESTÁ no MVP (Future Scope)
1.  **Área do Cliente:** Login para usuários salvarem favoritos (desnecessário agora).
2.  **Integração com Portais:** XML para Zap/OLX (complexidade alta inicial).
3.  **Mapa Interativo:** (Google Maps API custa caro e adiciona complexidade; usar apenas texto "Bairro/Cidade" no MVP).
4.  **Blog:** Focar em vender imóveis primeiro.
5.  **Agendamento Automático:** Manter o contato humano via WhatsApp.

## Critérios de Sucesso do MVP
* Admin consegue cadastrar um imóvel completo em menos de 3 minutos.
* Site carrega em menos de 2 segundos no 4G.
* Link do WhatsApp abre corretamente com a mensagem personalizada.