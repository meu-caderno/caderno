import type { Color, Id } from "../primitives";
import { Background } from "./background";
import { ContextMode } from "./context-mode";
import { Density } from "./density";
import { Immersion } from "./immersion";
import { WidgetPref } from "./widget-pref";

export interface Profile {
  id: Id;

  name: string;

  contextMode: ContextMode;
  contexts?: Id[];

  accent?: Color;
  density?: Density;
  background?: Background;
  immersion?: Immersion;
  widgets?: WidgetPref[];

  headingFont?: string;
}
