# Deploy na VPS (Hostinger + CloudPanel)

Este guia publica o projeto no dominio:

- `ezequiasalves.kltecnologia.com`

Stack atual do projeto:

- Next.js 16 (App Router)
- TypeScript
- Supabase (Auth, DB, Storage)

## 1) Preparar DNS na Hostinger

No painel DNS do dominio `kltecnologia.com`, crie/ajuste:

1. Tipo: `A`
2. Nome/Host: `ezequiasalves`
3. Valor: `IP_PUBLICO_DA_SUA_VPS`
4. TTL: padrao

Depois aguarde propagacao (normalmente alguns minutos, podendo levar mais).

## 2) Acessar a VPS

```bash
ssh root@SEU_IP
```

Verifique Node e npm:

```bash
node -v
npm -v
```

Se nao existir Node 20+:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

## 3) Criar site no CloudPanel

No CloudPanel:

1. `Sites` -> `Add Site`
2. Escolha `Node.js` (Application)
3. Domain: `ezequiasalves.kltecnologia.com`
4. Node version: `20` ou superior
5. Crie o site

Anote:

- `Site User` (usuario linux do site)
- `Site Path` (caminho do projeto no servidor)

## 4) Publicar codigo no servidor

Opcao Git (recomendada):

```bash
su - SEU_SITE_USER
cd /home/SEU_SITE_USER/htdocs/ezequiasalves.kltecnologia.com
git clone SEU_REPOSITORIO .
```

Opcao sem Git: enviar via `scp/rsync` para o mesmo path.

## 5) Configurar variaveis de ambiente

No path do projeto, crie `.env.local`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_URL_ENCODED@db.hqmptbcygiekkjrrwyaf.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://hqmptbcygiekkjrrwyaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_OLRXYrmoxnlQmxmwnuE4Pw_0ibVq8Xp
NEXT_PUBLIC_SUPABASE_PROPERTY_BUCKET=property-images
SUPABASE_MCP_API_KEY=sbp_22ffb6766c280fc7e8c1807d9b7e7050bcd2318c
```

Observacao:

- Se a senha do banco tiver `@`, use `%40`.
- Exemplo: `@@` vira `%40%40`.

## 6) Instalar dependencias e gerar build

No diretorio do projeto:

```bash
npm install
npm run build
```

## 7) Configurar comando de start no CloudPanel

No app Node.js do CloudPanel, configure:

- Build Command: `npm run build`
- Start Command: `PORT=3001 npm run start`
- Port/App Port: `3001` (ou outra porta livre)
- Working Directory: pasta do projeto

Garanta que o reverse proxy do CloudPanel aponte para essa porta.

Observacao importante:

- O `next start` usa a porta `3000` por padrao.
- Se nao definir `PORT`, ele sempre tentara `3000` e pode gerar `EADDRINUSE`.
- Alternativa equivalente de start command: `npm run start -- -p 3001`

## 8) SSL (Let's Encrypt)

No CloudPanel:

1. Abra o site `ezequiasalves.kltecnologia.com`
2. Aba `SSL/TLS`
3. Emitir certificado Let's Encrypt
4. Ativar redirecionamento HTTP -> HTTPS

## 9) Validacao final

Teste:

1. Home abre em `https://ezequiasalves.kltecnologia.com`
2. Admin abre em `/admin`
3. CRUD de imoveis:
   - criar
   - editar
   - excluir
4. Upload de imagens funciona (bucket `property-images`)
5. Home mostra dados reais (nao mock)
6. Pagina de detalhe do imovel abre ao clicar no card

## 10) Troubleshooting rapido

### Erro de imagem `next/image hostname is not configured`

Verifique `next.config.mjs` com o host:

- `hqmptbcygiekkjrrwyaf.supabase.co`

Depois rode de novo:

```bash
npm run build
```

### Erro `Bucket not found`

No Supabase Storage, confirme bucket:

- `property-images`

### Home sem dados reais

Verifique:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (ou ANON key)
3. policy `anon SELECT` na tabela `properties` para `status in ('active','sold')`

### Mudancas nao aparecem

Reinicie o app Node no CloudPanel e limpe cache do navegador.

## 11) Recomendacoes de producao

1. Rotacionar credenciais sensiveis compartilhadas.
2. Criar usuario de deploy sem usar `root`.
3. Configurar backups do banco Supabase.
4. Habilitar monitoramento de uptime (UptimeRobot/Better Stack).
