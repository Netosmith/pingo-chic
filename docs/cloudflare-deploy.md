# Publicação Cloudflare — Pingo Chic

## 1. Entrar na pasta do Worker

```bash
cd worker
```

## 2. Criar o banco D1

```bash
npx wrangler@latest d1 create pingo-chic
```

Copie o `database_id` retornado e substitua `REPLACE_WITH_D1_DATABASE_ID` em `worker/wrangler.toml`.

## 3. Aplicar o schema no D1 remoto

A partir da pasta `worker/`:

```bash
npx wrangler d1 execute pingo-chic --remote --file=../database/schema.sql
```

## 4. Inserir os dados iniciais

```bash
npx wrangler d1 execute pingo-chic --remote --file=../database/seed.sql
```

## 5. Criar o segredo do Admin

Gere um valor longo e aleatório e grave apenas no Cloudflare:

```bash
npx wrangler secret put ADMIN_TOKEN
```

Nunca coloque o token no GitHub.

## 6. Publicar a API

```bash
npx wrangler deploy
```

Anote a URL `https://...workers.dev` retornada pelo deploy.

## 7. Testar

```bash
curl https://SUA-URL.workers.dev/api/health
curl https://SUA-URL.workers.dev/api/catalog
```

O primeiro deve retornar `ok: true`. O segundo deve retornar os produtos e variantes do D1.

## 8. Conectar o Admin

Abra `admin/index.html`, informe a URL do Worker e o mesmo `ADMIN_TOKEN` configurado no Cloudflare. O token fica apenas na sessão do navegador.

## 9. Conectar a vitrine

A vitrine usa `assets/js/api.js`. Enquanto nenhuma API estiver configurada, ela continua usando os produtos locais como fallback.

Depois de publicar a API, a URL pode ser configurada no navegador com:

```js
localStorage.setItem('pingoChicApiUrl', 'https://SUA-URL.workers.dev')
```

Na etapa de publicação do site, substituiremos isso por configuração oficial de produção, sem exigir comando manual da cliente.
