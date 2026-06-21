import "@typespec/json-schema";

using TypeSpec.JsonSchema;

namespace MeuCaderno.Caderno.Schemas;

// ─────────────────────────────────────────────────────────────────────────────
// Primitivos compartilhados
// ─────────────────────────────────────────────────────────────────────────────

/** Identificador estável. */
@format("uuid")
scalar Id extends string;

/** Data simples, sem hora (ISO YYYY-MM-DD). */
@format("date")
scalar DiaIso extends string;

/** Instante UNIX em ms (usado em logs e carimbos de tempo). */
scalar Timestamp extends int64;

/** Cor da disciplina/marca, em hex #rrggbb. */
scalar Cor extends string;
