# Security Policy

`caderno` é um projeto de software livre (AGPL-3.0), local-first e mantido em
trabalho voluntário. Levamos a segurança a sério, mas pedimos paciência: os
prazos abaixo são metas de boa-fé, não garantias contratuais.

## Supported Versions

Por estar em fase de MVP, apenas a versão mais recente (`main` / última release)
recebe correções de segurança. Não há suporte retroativo a versões anteriores.

| Versão          | Suporte            |
| --------------- | ------------------ |
| última release  | :white_check_mark: |
| `main` (em dev) | :white_check_mark: |
| anteriores      | :x:                |

## Reporting a Vulnerability

**Não abra uma issue pública** para relatar vulnerabilidades. Use um canal privado:

- **GitHub Security Advisories** (preferencial): abra um relatório privado em
  [Security → Advisories](https://github.com/meu-caderno/caderno/security/advisories/new).

Isso permite discutir e corrigir o problema antes de qualquer divulgação pública.

### O que incluir no relatório

- Descrição da vulnerabilidade e do impacto potencial.
- Passos para reproduzir (proof of concept, se aplicável).
- Versão/commit afetado e ambiente relevante.
- Sugestão de correção ou mitigação, se houver.

### Escopo

Por ser **local-first**, os dados do `caderno` ficam no dispositivo do usuário e
o app funciona offline. Têm prioridade relatos como:

- Acesso ou vazamento indevido de dados locais do usuário.
- Falhas de integridade na importação/exportação de dados.
- Vulnerabilidades na cadeia de suprimentos (dependências, workflows de CI).
- Execução de código não confiável a partir de conteúdo importado.

Fora de escopo, em geral: ataques que exigem acesso físico a um dispositivo já
comprometido, engenharia social e relatos automatizados sem impacto real
demonstrável.

### O que esperar

Como o projeto é mantido em horário voluntário, respondemos o mais rápido que
conseguimos. Como referência (best-effort, não garantido):

- **Confirmação de recebimento**: alguns dias.
- **Avaliação e classificação de severidade**: assim que possível.
- **Divulgação coordenada**: após uma correção estar disponível. Damos os
  devidos créditos no advisory, salvo se preferir permanecer anônimo.

Pedimos que não divulgue publicamente a vulnerabilidade até que uma correção
tenha sido lançada.

## Medidas automatizadas de segurança

A segurança do código e da cadeia de suprimentos é verificada continuamente:

- **CodeQL** — análise estática (SAST) a cada push e pull request.
- **Dependabot** — alertas e atualização de dependências vulneráveis.
- **zizmor** — auditoria de segurança dos workflows do GitHub Actions.
- **actionlint** — validação e lint dos workflows de CI.
- **Build attestation (SLSA)** — proveniência verificável dos artefatos de deploy.

Todos os workflows seguem o princípio de menor privilégio (`permissions` mínimas
por job) e fazem checkout sem persistir credenciais.
