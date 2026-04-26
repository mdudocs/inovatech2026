# Arquitetura

## Visao geral

O sistema e dividido em duas partes principais:

1. `frontend React`
2. `API Node/Express com MySQL`

O frontend entrega:

- portal publico
- login por perfil
- paineis internos
- mapa interativo
- coleta mobile

A API entrega:

- autenticacao
- leitura de dashboards
- persistencia de coletas
- administracao basica
- integracao com banco MySQL

## Camadas do frontend

### `src/App.tsx`

Ponto de entrada das rotas principais.

Responsavel por:

- montar rotas publicas
- montar rotas autenticadas
- integrar login e sessao

### `src/pages/`

Define paginas completas.

Exemplos:

- `HomePage.tsx`: entrada publica
- `CommunitiesPage.tsx`: comunidades e mapa
- `portal/CollectorMobilePage.tsx`: coleta em celular
- `portal/PortalPage.tsx`: shell dos paineis por perfil

### `src/components/`

Componentes reutilizaveis de interface.

Exemplos:

- `RiverMapPanel.tsx`: mapa principal
- `SiteLayout.tsx`: estrutura comum de paginas publicas
- `portal/Panel.tsx`: bloco reutilizavel dos paineis internos

### `src/views/`

Blocos de tela mais densos por perfil.

Exemplos:

- `dashboard/CollectorView.tsx`
- `dashboard/DoctorView.tsx`
- `dashboard/NurseView.tsx`
- `admin/AdminOverviewSection.tsx`

### `src/services/portalApi.ts`

Camada central de comunicacao com a API.

Responsavel por:

- montar URL base
- padronizar requests
- lidar com timeout
- buscar colecoes e dashboards
- enviar coletas

### `src/utils/liveCollections.ts`

Camada de regra local da coleta.

Responsavel por:

- protocolo por tipo de amostra
- ids locais
- leitura e escrita no `localStorage`
- merge entre dado local e dado da API
- reducao de imagem para envio

## Camadas do backend

### `server/index.js`

Arquivo principal da API.

Responsavel por:

- subir o servidor
- configurar JSON/CORS
- conectar no MySQL
- garantir infraestrutura minima
- expor endpoints
- servir o frontend compilado em producao

## Fluxos importantes

## 1. Login

Fluxo:

1. usuario entra pela tela de login
2. frontend chama `portalApi.login`
3. API valida usuario
4. frontend grava sessao
5. usuario entra no painel do seu perfil

## 2. Coleta mobile

Fluxo:

1. agente preenche a coleta no celular
2. frontend monta um `LiveCollectionRecord`
3. coleta e salva primeiro no aparelho
4. API recebe a coleta em segundo plano
5. banco devolve o numero oficial crescente
6. frontend substitui o registro local pela versao confirmada

Esse fluxo foi desenhado assim para:

- funcionar melhor em internet ruim
- evitar travar o agente em campo
- manter rastro local mesmo sem API imediata

## 3. Mapa interativo

Fluxo:

1. `RiverMapPanel` carrega a base territorial
2. le o historico local
3. se houver token, busca coletas da API
4. mistura os dois conjuntos
5. recalcula o risco por ponto
6. mostra prioridade no mapa e no painel lateral

## 4. Deploy

Hoje o projeto esta preparado para deploy unico:

- frontend compilado em `dist`
- backend servindo `dist`
- API no mesmo dominio via `/api`

Isso simplifica publicacao no Railway.

## Decisoes tecnicas importantes

- `localStorage` e usado como cache operacional da coleta
- `collectionNumber` e a referencia oficial de sequencia quando vem do banco
- fotos podem ser reduzidas antes do envio para melhorar uso mobile
- o mapa usa heuristica de risco no frontend enquanto a regra definitiva nao mora no backend

## Pontos de atencao para a equipe

- `RiverMapPanel.tsx` concentra bastante regra de visualizacao
- `liveCollections.ts` concentra bastante regra de negocio do fluxo mobile
- `portalApi.ts` deve continuar sendo a unica porta de acesso HTTP do frontend
- `server/index.js` ja esta grande; futuras rotas podem ser quebradas em modulos
