<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Guia open source do Caderno

Este documento é um **checklist vivo** que mapeia o Caderno às boas práticas do
[opensource.guide](https://opensource.guide/) (mantido pelo GitHub). Ele serve
para acompanhar o que já está pronto, o que falta e quais ações dependem de
configuração manual no GitHub.

> Referências do guia: *Starting an Open Source Project*, *Best Practices for
> Maintainers*, *Building Welcoming Communities* e *Leadership and Governance*.

## Princípios que seguimos

O opensource.guide resume um projeto saudável em alguns pilares. Como o Caderno os
atende:

1. **Deixar claro o que o projeto faz e por que é útil** → [README](../README.md).
2. **Facilitar o uso e a primeira contribuição** → [CONTRIBUTING](../CONTRIBUTING.md),
   [DEVELOPMENT](./DEVELOPMENT.md), DevContainer.
3. **Definir regras de convivência** → [CODE_OF_CONDUCT](../CODE_OF_CONDUCT.md).
4. **Reduzir atrito com templates** → templates de issue e PR em `.github/`.
5. **Ser transparente sobre direção e decisões** → [ROADMAP](../ROADMAP.md),
   [GOVERNANCE](../GOVERNANCE.md), [CHANGELOG](../CHANGELOG.md).
6. **Levar segurança e licenciamento a sério** → [SECURITY](../SECURITY.md),
   [LICENSE](../LICENSE) + [REUSE.toml](../REUSE.toml).

## Estado dos arquivos de saúde da comunidade

| Item | Status | Onde |
| --- | --- | --- |
| README | ✅ | [README.md](../README.md) |
| Licença | ✅ AGPL-3.0 + CC-BY-SA-4.0 (assets) | [LICENSE](../LICENSE), [REUSE.toml](../REUSE.toml) |
| Política de segurança | ✅ | [SECURITY.md](../SECURITY.md) |
| Guia de contribuição | ✅ | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Código de conduta | ✅ | [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) |
| Suporte | ✅ | [SUPPORT.md](../SUPPORT.md) |
| Templates de issue | ✅ | [.github/ISSUE_TEMPLATE/](../.github/ISSUE_TEMPLATE/) |
| Template de PR | ✅ | [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) |
| Governança | ✅ | [GOVERNANCE.md](../GOVERNANCE.md) |
| Roadmap | ✅ | [ROADMAP.md](../ROADMAP.md) |
| Changelog | ✅ | [CHANGELOG.md](../CHANGELOG.md) |
| Documentação técnica | ✅ | [docs/](./) |
| CODEOWNERS | ✅ | [CODEOWNERS](../CODEOWNERS) |
| Financiamento | ✅ | [.github/FUNDING.yml](../.github/FUNDING.yml) |
| CI/CD + Dependabot | ✅ | [.github/workflows/](../.github/workflows/), [dependabot.yml](../.github/dependabot.yml) |

E os documentos de filosofia, que vão além do que o guia pede:
[CONSTITUTION.md](../CONSTITUTION.md) (governa o produto) e
[PRINCIPLES.md](../PRINCIPLES.md) (base ética).

## Ações manuais no GitHub (não vivem no repositório)

Estas dependem de configuração na interface/admin do repositório e **devem ser
feitas pelo mantenedor**:

- [ ] **Habilitar GitHub Discussions** (os templates e o SUPPORT já apontam para lá).
- [ ] **Descrição e _topics_** do repositório (descoberta/SEO). Sugestão de topics:
      `local-first`, `pwa`, `nuxt`, `vue`, `study`, `education`, `offline-first`,
      `agpl`, `typescript`.
- [ ] **Branch protection** em `main` (exigir checks verdes e revisão de CODEOWNERS).
- [ ] **Labels** úteis para acolher contribuidores: `good first issue`,
      `help wanted`, `bug`, `enhancement`, `triage`, `docs`.
- [ ] Conferir em **Insights → Community Standards** se o GitHub reconhece todos os
      community health files (devem aparecer como ✅).
- [ ] Marcar issues simples como `good first issue` para atrair primeiras
      contribuições (recomendação central do opensource.guide).

## Melhorias futuras possíveis

Itens opcionais, conforme o projeto crescer:

- Página de documentação para usuários finais (não só desenvolvedores).
- Automação de `CHANGELOG`/release a partir dos Conventional Commits.
- `AUTHORS.md` / seção de agradecimentos reconhecendo contribuidores.
- Tradução dos documentos-chave para inglês, ampliando o alcance.

---

Mantenha esta tabela atualizada quando criar, mover ou remover arquivos de
comunidade.
