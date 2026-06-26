import type { Color, Id } from "../primitives";
import type { Background } from "./background";
import type { ContextMode } from "./context-mode";
import type { Density } from "./density";
import type { Immersion } from "./immersion";
import type { WidgetPref } from "./widget-pref";

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
