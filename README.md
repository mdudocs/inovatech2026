# Inovatech 2026

Sistema web de monitoramento territorial para vigilancia de mercurio e apoio a decisoes em saude, com frontend React, API Node/Express e banco MySQL.

## O que existe hoje

- portal publico com leitura territorial, comunidades e orientacoes
- mapa interativo com pontos, niveis de risco e resumo das coletas
- area de login por perfil
- painel do agente com coleta mobile, fotos, localizacao e relatorio guiado
- sincronizacao entre armazenamento local e API
- camadas internas para medico, populacao, enfermagem e administracao

## Stack

- React 19
- TypeScript
- Vite
- Node.js + Express
- MySQL
- MapLibre

## Estrutura principal

- `src/` frontend do portal e das areas autenticadas
- `server/` API e integracao com banco
- `public/` arquivos estaticos
- `database/` materiais e apoio de banco
- `docs/` documentacao para onboard da equipe

## Documentacao da equipe

- [docs/README.md](C:/Users/teste/Documents/Inovatech2026/docs/README.md)
- [docs/por-onde-comecar.md](C:/Users/teste/Documents/Inovatech2026/docs/por-onde-comecar.md)
- [docs/estrutura-do-projeto.md](C:/Users/teste/Documents/Inovatech2026/docs/estrutura-do-projeto.md)
- [docs/arquitetura.md](C:/Users/teste/Documents/Inovatech2026/docs/arquitetura.md)

## Deploy recomendado

O caminho mais simples para publicar e usar este sistema e um deploy unico no `Railway`:

1. o frontend compilado e servido pela propria API
2. a API Node roda no mesmo dominio
3. o banco MySQL fica no mesmo projeto Railway

Este repositorio ja esta preparado para isso:

- `nixpacks.toml` instala dependencias e gera o build
- `railway.json` configura healthcheck do deploy
- `server/index.js` serve `dist` e tambem responde a API
- `src/services/portalApi.ts` usa `/api` no mesmo dominio em producao

## Variaveis de ambiente

Obrigatorias em producao:

- `ADMIN_ACCESS_KEY`
- `SESSION_SECRET`

Opcional, quando a API for acessada por outro dominio:

- `CORS_ORIGIN` com uma ou mais origens separadas por virgula
- `VITE_MOCK_LOGIN_PASSWORD` apenas para desenvolvimento com `VITE_DATA_SOURCE=mock`

Usuarios iniciais em banco novo, configure somente quando precisar semear acessos:

- `SEED_POPULATION_PASSWORD`
- `SEED_DOCTOR_PASSWORD`
- `SEED_NURSE_PASSWORD`
- `SEED_COLLECTOR_PASSWORD`
- `SEED_ADMIN_PASSWORD`

Banco local ou externo:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

No Railway, o projeto tambem entende automaticamente:

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

## Como publicar no Railway

1. Suba este repositorio no GitHub.
2. No Railway, clique em `New Project`.
3. Escolha `Deploy from GitHub repo`.
4. Selecione este repositorio.
5. Adicione um servico `MySQL` no mesmo projeto.
6. Em `Variables`, configure `ADMIN_ACCESS_KEY`.
7. Aguarde o build e abra a URL publica gerada.

## Como rodar localmente

Frontend:

```bash
npm run dev
```

API:

```bash
npm run server
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```
