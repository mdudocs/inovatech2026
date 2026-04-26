# Por Onde Comecar

## Se voce acabou de entrar no projeto

Leia nesta ordem:

1. `README.md`
2. `docs/estrutura-do-projeto.md`
3. `docs/arquitetura.md`

Depois abra estes arquivos:

1. `src/App.tsx`
2. `src/pages/HomePage.tsx`
3. `src/pages/portal/PortalPage.tsx`
4. `src/services/portalApi.ts`
5. `src/utils/liveCollections.ts`
6. `src/components/RiverMapPanel.tsx`

## Se voce vai mexer no portal publico

Comece por:

- `src/pages/HomePage.tsx`
- `src/pages/CommunitiesPage.tsx`
- `src/components/SiteLayout.tsx`
- `src/siteData.ts`

## Se voce vai mexer na coleta mobile

Comece por:

- `src/pages/portal/CollectorMobilePage.tsx`
- `src/utils/liveCollections.ts`
- `src/services/portalApi.ts`
- `src/components/RiverMapPanel.tsx`

## Se voce vai mexer nos paineis internos

Comece por:

- `src/pages/portal/PortalPage.tsx`
- `src/views/dashboard/`
- `src/components/portal/`
- `src/portalTypes.ts`

## Se voce vai mexer na API

Comece por:

- `server/index.js`

Pontos mais sensiveis:

- autenticacao
- coletas
- leitura do banco
- servico do frontend compilado

## Se voce vai mexer em deploy

Comece por:

- `README.md`
- `railway.json`
- `nixpacks.toml`
- `server/index.js`
- `src/services/portalApi.ts`

## Regras praticas para a equipe

- tente concentrar requests em `portalApi.ts`
- evite espalhar regra de coleta fora de `liveCollections.ts`
- use `views/` para blocos grandes e `components/` para pecas reutilizaveis
- se uma regra estiver ficando visual demais no mapa, extraia para utilitario
- documente qualquer fluxo novo em `docs/`
