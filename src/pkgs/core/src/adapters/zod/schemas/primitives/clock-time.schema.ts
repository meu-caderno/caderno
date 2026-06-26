import * as zod from "zod";

export const ClockTimeSchema = zod.iso.time();
