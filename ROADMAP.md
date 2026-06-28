<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Roadmap

Este é um documento **vivo**: indica a direção, não uma promessa. Prioridades
mudam conforme o projeto evolui e conforme o feedback da comunidade. Para o que já
saiu, veja o [CHANGELOG.md](./CHANGELOG.md).

A espinha dorsal do roadmap é a **escada de profundidade** da
[Constituição][constitution] — o poder do app se revela em camadas, e a
construção segue essa lógica:

> 0. **Só usar** → 1. **Ajustar** → 2. **Controlar** → 3. **Compor** → 4. **Moldar**

## Agora — MVP (nível 0: "só usar")

Foco em entregar uma base local-first que funciona de cara, sem configuração.

- [ ] Modelagem de domínio no core (disciplinas, atividades, presença, biblioteca).
- [ ] PWA funcional offline com persistência local.
- [ ] Fluxos essenciais: cadastrar disciplinas, registrar presença/faltas, notas
      e atividades.
- [ ] Exportação e importação de dados (princípio de **sem lock-in**).
- [ ] Onboarding de baixo atrito (ver "O primeiro minuto" na Constituição).

## Próximo — Ajustar & Controlar (níveis 1–2)

- [ ] Personalização de conforto: widgets, densidade, tema.
- [ ] Presets ("Calmo", "Foco", "Meu Jeito") como pontos de partida reversíveis.
- [ ] Perfis salvos (ex.: "Semana de provas", "Férias").
- [ ] Estrutura personalizável das disciplinas/cursos.

## Depois — Compor & Moldar (níveis 3–4)

- [ ] Sincronização **opcional** entre dispositivos (com conflitos visíveis).
- [ ] Automações e regras definidas pelo usuário.
- [ ] Aprendizado de hábitos **com consentimento explícito** (nunca em silêncio).

## Fora de escopo (por enquanto)

Por princípio, algumas coisas **não** estão no horizonte:

- Recursos pagos que travam funcionalidade (o Caderno não vende vantagem).
- Coleta de dados ou telemetria que comprometa a privacidade local-first.
- Qualquer mecânica que prenda o usuário (lock-in) ou explore atenção.

---

Tem uma ideia que se encaixa (ou que deveria estar aqui)? Abra uma
[sugestão de funcionalidade][issues] ou participe das
[Discussions][discussions].

[constitution]: ./CONSTITUTION.md
[issues]: https://github.com/meu-caderno/caderno/issues
[discussions]: https://github.com/meu-caderno/caderno/discussions
