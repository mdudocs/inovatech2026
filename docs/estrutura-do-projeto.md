# Estrutura do Projeto

## Raiz

- `src/`: frontend
- `server/`: API e conexao com banco
- `public/`: arquivos estaticos
- `database/`: apoio de banco e materiais relacionados
- `docs/`: documentacao da equipe

## Frontend

### `src/components/`

Componentes reutilizaveis.

- `components/portal/`: UI compartilhada do portal autenticado
- `components/admin/`: UI de apoio da area administrativa
- `RiverMapPanel.tsx`: mapa e leitura territorial
- `LazyRiverMapPanel.tsx`: carregamento sob demanda do mapa

### `src/pages/`

Paginas completas.

- paginas publicas na raiz de `pages/`
- paginas autenticadas em `pages/portal/`
- paginas administrativas em `pages/admin/`

### `src/views/`

Secoes grandes de cada painel.

- `views/dashboard/`: blocos por perfil de usuario
- `views/admin/`: blocos da area administrativa

### `src/services/`

Integracao com API.

- `portalApi.ts`: funcoes de request e endpoints do frontend

### `src/utils/`

Funcoes de apoio e regras locais.

- `liveCollections.ts`: regras do fluxo de coleta
- `portalSession.ts`: sessao local do usuario

### `src/siteData.ts`, `src/mockPortalData.ts`, `src/portalContent.ts`

Arquivos de conteudo, mocks e apoio textual.

## Organizacao recomendada daqui para frente

Quando a equipe for crescer o sistema, vale seguir esta regra:

1. `pages/` monta a tela
2. `views/` organiza secoes grandes
3. `components/` guarda pecas reutilizaveis
4. `services/` fala com API
5. `utils/` guarda regra transversal e funcoes puras

## Onde criar coisas novas

### Novo componente pequeno

Criar em:

- `src/components/`
- ou em `src/components/portal/` se for so do portal

### Nova pagina

Criar em:

- `src/pages/`
- ou `src/pages/portal/`
- ou `src/pages/admin/`

### Nova chamada HTTP

Criar em:

- `src/services/portalApi.ts`

### Nova regra de coleta

Criar em:

- `src/utils/liveCollections.ts`

### Novo bloco do painel de um perfil

Criar em:

- `src/views/dashboard/`

## Refatoracoes futuras recomendadas

- quebrar `server/index.js` em rotas e modulos
- separar tipos do mapa em um arquivo proprio
- extrair regras de risco do mapa para utilitario dedicado
- separar melhor conteudo estatico de logica de interface
