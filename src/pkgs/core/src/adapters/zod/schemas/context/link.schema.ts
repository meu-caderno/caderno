import * as z from "zod";
import { Link } from "../../../../types/context/link";

export const LinkSchema = z.enum(Link);
