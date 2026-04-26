# Diagrama ER do Banco

Este documento isola o `ER do banco operacional atual` para apresentacao, revisao tecnica e alinhamento com a equipe de banco.

## Arquivos visuais

- [diagrama-er-banco.svg](C:/Users/teste/Documents/Inovatech2026/docs/diagrama-er-banco.svg): imagem pronta para slide ou documento
- [mysql-relacionamento.md](C:/Users/teste/Documents/Inovatech2026/docs/mysql-relacionamento.md): visao ampliada com fluxo do sistema

## Escopo do ER atual

A API em `server/index.js` trabalha hoje principalmente com estas tabelas:

- `usuarios`
- `comunidades`
- `pesquisadores`
- `registros_mercuario`
- `clinical_patient_cases`
- `clinical_case_actions`
- `field_collections`
- `support_requests`
- `admin_change_log`
- `system_migrations`

## Como ler este ER

O banco atual mistura dois tipos de relacionamento:

1. `relacionamento fisico`
2. `relacionamento logico`

### Relacionamento fisico

Existe `FOREIGN KEY` real no banco.

Hoje a relacao fisica principal e:

- `clinical_case_actions.case_id -> clinical_patient_cases.id_caso`

### Relacionamento logico

Existe na operacao do sistema, mas ainda nao foi convertido para `FOREIGN KEY`.

Hoje os principais sao:

- `field_collections.collector_user_id -> usuarios.id_usuario`
- `field_collections.community -> comunidades.id_comunidade`
- `clinical_patient_cases.community -> comunidades.id_comunidade`
- `clinical_case_actions.doctor_user_id -> usuarios.id_usuario`
- `registros_mercuario.comunidade -> comunidades.id_comunidade`
- `admin_change_log.record_id -> tabela auditada`

## Leitura por dominios

### 1. Acesso

- `usuarios`

Controla:

- login
- perfil
- territorio
- ativacao do acesso

### 2. Territorio

- `comunidades`
- `registros_mercuario`
- `pesquisadores`

Organiza:

- leitura geografica
- referencias institucionais
- registros territoriais basicos

### 3. Operacao de campo

- `field_collections`

Guarda:

- coleta
- protocolo
- coordenada
- fotos
- nota de campo
- numero oficial crescente da coleta

### 4. Assistencial

- `clinical_patient_cases`
- `clinical_case_actions`

Guarda:

- fila clinica
- prioridade
- sintomas
- exposicao
- condutas medicas
- historico de acao

### 5. Suporte e auditoria

- `support_requests`
- `admin_change_log`
- `system_migrations`

Guarda:

- solicitacoes abertas
- rastreabilidade administrativa
- migracoes de banco ja aplicadas

## Mermaid ER melhorado

```mermaid
erDiagram
    USUARIOS {
        bigint id_usuario PK
        varchar nome
        enum perfil
        varchar identificador_login UK
        varchar senha
        varchar territorio
        tinyint ativo
    }

    COMUNIDADES {
        bigint id_comunidade PK
        varchar municipio_comunidade
        varchar territorio
    }

    PESQUISADORES {
        bigint id_pesquisador PK
        varchar nome
        varchar instituicao
    }

    REGISTROS_MERCUARIO {
        varchar id_registo PK
        varchar comunidade
        varchar tipo_amostra
        varchar risco
    }

    FIELD_COLLECTIONS {
        bigint id_coleta PK
        varchar external_id UK
        varchar community
        varchar sample_type
        varchar protocol_id
        varchar protocol_title
        varchar collector_user_id
        varchar collector_name
        varchar sample_status
        decimal latitude
        decimal longitude
        enum risk
        text field_note
        longtext photos_json
    }

    CLINICAL_PATIENT_CASES {
        bigint id_caso PK
        varchar patient_name
        varchar community
        varchar risk_label
        varchar case_status
        varchar priority_group
        text symptoms
        text exposure_summary
        text clinical_note
        datetime return_at
        varchar last_action
    }

    CLINICAL_CASE_ACTIONS {
        bigint id_acao PK
        bigint case_id FK
        varchar doctor_user_id
        varchar action_type
        text note
        datetime return_at
        varchar next_status
        text next_step
    }

    SUPPORT_REQUESTS {
        bigint id_solicitacao PK
        varchar protocol UK
        varchar selected_role
        varchar requester_name
        varchar contact_info
        text message
        varchar request_status
    }

    ADMIN_CHANGE_LOG {
        bigint id_evento PK
        varchar table_name
        enum action_type
        varchar record_id
        varchar summary
    }

    SYSTEM_MIGRATIONS {
        varchar migration_key PK
    }

    CLINICAL_PATIENT_CASES ||--o{ CLINICAL_CASE_ACTIONS : "1:N fisico"

    USUARIOS o..o{ FIELD_COLLECTIONS : "1:N logico por collector_user_id"
    COMUNIDADES o..o{ FIELD_COLLECTIONS : "1:N logico por community"
    COMUNIDADES o..o{ CLINICAL_PATIENT_CASES : "1:N logico por community"
    USUARIOS o..o{ CLINICAL_CASE_ACTIONS : "1:N logico por doctor_user_id"
    COMUNIDADES o..o{ REGISTROS_MERCUARIO : "1:N logico por comunidade"

    ADMIN_CHANGE_LOG o..o{ USUARIOS : "audita"
    ADMIN_CHANGE_LOG o..o{ COMUNIDADES : "audita"
    ADMIN_CHANGE_LOG o..o{ PESQUISADORES : "audita"
    ADMIN_CHANGE_LOG o..o{ REGISTROS_MERCUARIO : "audita"
```

## Resumo executivo

Se voce for explicar o banco em pouco tempo:

1. `usuarios` e a tabela de acesso e perfis
2. `comunidades` e a referencia territorial do sistema
3. `field_collections` e a tabela central da operacao de campo
4. `clinical_patient_cases` e `clinical_case_actions` formam o nucleo assistencial
5. `admin_change_log` garante rastreabilidade de alteracoes administrativas

## Melhorias recomendadas para o banco

Para deixar o modelo mais robusto, o proximo passo natural e transformar os relacionamentos logicos em `FOREIGN KEY` reais.

Prioridade alta:

- `field_collections.community -> comunidades.id_comunidade`
- `field_collections.collector_user_id -> usuarios.id_usuario`
- `clinical_patient_cases.community -> comunidades.id_comunidade`
- `clinical_case_actions.doctor_user_id -> usuarios.id_usuario`

Prioridade media:

- normalizar `registros_mercuario`
- aproximar `pesquisadores` de uma tabela de estudos/publicacoes
- reduzir dependencia de nomes textuais para joins operacionais
