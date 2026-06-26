import type { Color, Id } from "../primitives";
import type { Background } from "./background";
import type { Density } from "./density";
import type { Immersion } from "./immersion";
import type { WidgetPref } from "./widget-pref";

export interface Mood {
  id: Id;

  name: string;

  density: Density;
  dopamine: boolean;
  immersion: Immersion;
  accent?: Color;
  background?: Background;

  widgets?: WidgetPref[];

  scope?: Id[];
}
