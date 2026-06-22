/**
Caderno
Copyright (C) 2026 <gabrielrodantunes@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "@typespec/json-schema";

using TypeSpec.JsonSchema;

namespace MeuCaderno.Caderno.Schemas;

// Shared primitives

/** Stable identifier. */
@format("uuid")
scalar Id extends string;

/** Simple date, without hour (ISO YYYY-MM-DD). */
@format("date")
scalar DateIso extends string;

/** Instant. */
@format("date-time")
scalar Instant extends string;

/** Color representation. */
scalar Color extends string;

/** Score from 0 to 100. */
@minValue(0)
@maxValue(100)
scalar Score extends uint8;
