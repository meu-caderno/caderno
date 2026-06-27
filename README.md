# Caderno

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Status](https://img.shields.io/badge/status-MVP-orange)](#status)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contribuindo)
![GitHub last commit](https://img.shields.io/github/last-commit/meu-caderno/caderno)
![GitHub issues](https://img.shields.io/github/issues/meu-caderno/caderno)
![GitHub stars](https://img.shields.io/github/stars/meu-caderno/caderno?style=social)

Stack: 

![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt&logoColor=fff)

Fluxo: 

[![Flow - Quality][badge-quality-src]][badge-quality-href]
[![Flow - Deploy][badge-deploy-src]][badge-deploy-href]

Segurança: 

[![Flow - CI Lint][badge-lint-ci-src]][badge-lint-ci-href]
[![CodeQL][badge-codeql-src]][badge-codeql-href]
[![Dependabot Updates][badge-dependabot-src]][badge-dependabot-href]

Aplicativo de estudos local-first para organizar disciplinas, cursos, projetos de aprendizado e conhecimento pessoal em um único lugar.

O objetivo é reunir aquilo que normalmente fica espalhado entre anotações, calendários, planilhas e aplicativos diferentes: presença, faltas, atividades, notas, materiais de estudo e conhecimento acumulado ao longo do tempo.

O projeto funciona offline e mantém os dados no dispositivo do usuário. Sincronização, quando existir, será um recurso opcional.

## O que é

O Caderno se adapta ao tipo de estudo que você está fazendo.

* Faculdade e ensino formal: controle de presença, faltas, notas e atividades.
* Concursos e vestibulares: edital, planejamento e revisões.
* Cursos livres: acompanhamento de módulos, progresso e certificados.
* Estudo independente: metas, hábitos, horas estudadas e organização de conhecimento.

A ideia não é criar aplicativos diferentes para cada caso, mas oferecer uma base comum que pode crescer conforme a necessidade.

## Princípios

### Local-first

Os dados pertencem ao usuário e permanecem disponíveis mesmo sem conexão com a internet.

### Controle do usuário

O sistema pode sugerir, alertar e explicar, mas não deve impor decisões. Ações importantes precisam ser reversíveis.

### Complexidade gradual

Quem está começando não precisa lidar com todos os recursos de uma vez. Funcionalidades mais avançadas aparecem conforme fazem sentido para cada pessoa.

### Consentimento

Mudanças relevantes devem acontecer de forma explícita e compreensível.

### Sem lock-in

Exportação e importação de dados são partes fundamentais do projeto.

## Status

Em desenvolvimento. Atualmente na fase de MVP.

## Contribuindo

Antes de propor uma funcionalidade, considere:

* Ela funciona offline?
* O usuário continua no controle?
* É reversível?
* Mantém os dados portáveis?
* Faz sentido para iniciantes sem limitar usuários avançados?

Se alguma resposta for negativa, provavelmente a proposta precisa ser revisada.

### Desenvolvimento

```sh
git clone https://github.com/meu-caderno/caderno.git
cd caderno
```

Utilize DevContainer no VSCode ou sua IDE JetBrains para conectar ao Caderno SDK.

## Segurança

A segurança do código e da cadeia de suprimentos é verificada de forma automatizada:

* **CodeQL**: análise estática de segurança (SAST) a cada push e PR.
* **Dependabot**: atualização e alerta de vulnerabilidades em dependências.
* **zizmor**: auditoria de segurança dos workflows do GitHub Actions, com resultados publicados no painel *Security*.
* **actionlint**: validação e lint dos workflows de CI.
* **Build attestation**: artefatos de deploy recebem [attestation de proveniência](https://docs.github.com/actions/security-guides/using-artifact-attestations) (SLSA), permitindo verificar a origem do build.

Todos os workflows seguem o princípio de menor privilégio (`permissions` mínimas por job) e fazem checkout sem persistir credenciais.

Encontrou uma vulnerabilidade? Por favor, **não abra uma issue pública**. Veja [SECURITY.md](./SECURITY.md) para reportar de forma responsável.

## Licença

[![GNU AGPLv3 Image](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)](https://www.gnu.org/licenses/agpl-3.0.html)

This project is a Free Software: You can use, study share and improve it at your will. Specifically you can redistribute and/or modify it under the terms of the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.html) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Você deve ter recebido uma cópia em [LICENSE](./LICENSE). Caso não, veja em <https://www.gnu.org/licenses/agpl-3.0.html>.

<!-- 00 -->

[badge-codeql-src]: https://github.com/meu-caderno/caderno/actions/workflows/github-code-scanning/codeql/badge.svg
[badge-codeql-href]: https://github.com/meu-caderno/caderno/actions/workflows/github-code-scanning/codeql

[badge-dependabot-src]: https://github.com/meu-caderno/caderno/actions/workflows/dependabot/dependabot-updates/badge.svg
[badge-dependabot-href]: https://github.com/meu-caderno/caderno/actions/workflows/dependabot/dependabot-updates

[badge-deploy-src]: https://github.com/meu-caderno/caderno/actions/workflows/deploy.yml/badge.svg
[badge-deploy-href]: https://github.com/meu-caderno/caderno/actions/workflows/deploy.yml

[badge-quality-src]: https://github.com/meu-caderno/caderno/actions/workflows/quality.yml/badge.svg
[badge-quality-href]: https://github.com/meu-caderno/caderno/actions/workflows/quality.yml

[badge-lint-ci-src]: https://github.com/meu-caderno/caderno/actions/workflows/lint-ci.yml/badge.svg
[badge-lint-ci-href]: https://github.com/meu-caderno/caderno/actions/workflows/lint-ci.yml