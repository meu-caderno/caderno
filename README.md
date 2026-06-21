# Caderno

[![CodeQL][badge-codeql-src]][badge-codeql-href]
[![Dependabot Updates][badge-dependabot-src]][badge-dependabot-href]
[![CI - Build][badge-ci-src]][badge-ci-href]

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

## Licença

[![GNU AGPLv3 Image](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)](https://www.gnu.org/licenses/agpl-3.0.html)

This project is a Free Software: You can use, study share and improve it at your will. Specifically you can redistribute and/or modify it under the terms of the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.html) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Você deve ter recebido uma cópia em [LICENSE](./LICENSE). Caso não, veja em <https://www.gnu.org/licenses/agpl-3.0.html>.

<!-- 00 -->

[badge-codeql-src]: https://github.com/meu-caderno/caderno/actions/workflows/github-code-scanning/codeql/badge.svg
[badge-codeql-href]: https://github.com/meu-caderno/caderno/actions/workflows/github-code-scanning/codeql

[badge-dependabot-src]: https://github.com/meu-caderno/caderno/actions/workflows/dependabot/dependabot-updates/badge.svg
[badge-dependabot-href]: https://github.com/meu-caderno/caderno/actions/workflows/dependabot/dependabot-updates

[badge-ci-src]: https://github.com/meu-caderno/caderno/actions/workflows/ci.yml/badge.svg
[badge-ci-href]: https://github.com/meu-caderno/caderno/actions/workflows/ci.yml
