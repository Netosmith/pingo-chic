# Pingo Chic

E-commerce oficial da **Pingo Chic | Moda Infantil**.

## Estrutura inicial

- `index.html` — Home da loja
- `produto.html` — Página de produto
- `checkout.html` — Checkout
- `assets/css/` — Estilos
- `assets/js/` — Aplicação, catálogo, carrinho e API
- `assets/img/` — Imagens e identidade visual
- `admin/` — Painel administrativo
- `worker/` — API Cloudflare Worker
- `database/` — Schema do banco Cloudflare D1

## Arquitetura planejada

Frontend → Cloudflare Worker API → Cloudflare D1

Imagens de produtos → Cloudflare R2

Pagamentos e frete serão integrados em etapas posteriores.

## Segurança

Nunca adicionar tokens, senhas, chaves de API ou credenciais ao repositório.
