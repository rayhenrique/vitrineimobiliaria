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

## 7) Configurar start no CloudPanel

Em algumas instalacoes do CloudPanel nao existe campo de `Build Command`/`Start Command` para site Node.

Nesse caso, o start vem do `package.json`:

- `start`: `next start -p 3001`

No CloudPanel, mantenha:

- Porta do aplicativo: `3001`
- Diretorio raiz: pasta correta do projeto

Depois de buildar, reinicie o app no painel.

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

## 12) Como atualizar o repositorio (local -> GitHub)

No seu computador/local de desenvolvimento:

```bash
cd /caminho/do/projeto
git add .
git commit -m "sua mensagem"
git push origin main
```

Se pedir credencial HTTPS, use:

- Username: seu usuario GitHub
- Password: PAT (token), nao senha da conta

## 13) Como atualizar na VPS

### Cenário A: pasta da VPS eh um clone Git (tem `.git`)

```bash
cd ~/htdocs/ezequiasalves.kltecnologia.com
git pull origin main
npm install
npm run build
```

Depois, reinicie o app no CloudPanel.

### Cenário B: pasta da VPS nao eh clone Git

Sintoma:

- `fatal: not a git repository`

Opcoes:

1. Recomendada: migrar para clone Git

```bash
cd ~/htdocs
mv ezequiasalves.kltecnologia.com ezequiasalves.kltecnologia.com.bkp
git clone https://github.com/rayhenrique/vitrineimobiliaria.git ezequiasalves.kltecnologia.com
cp ezequiasalves.kltecnologia.com.bkp/.env.local ezequiasalves.kltecnologia.com/.env.local
cd ezequiasalves.kltecnologia.com
npm install
npm run build
```

2. Manter upload manual (sem git pull)

- Enviar arquivos atualizados
- Rodar:

```bash
npm install
npm run build
```

Em ambos os casos: reiniciar app no CloudPanel.
