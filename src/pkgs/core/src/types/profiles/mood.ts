import type { Color, Id } from "../primitives";
import { Background } from "./background";
import { Density } from "./density";
import { Immersion } from "./immersion";
import { WidgetPref } from "./widget-pref";

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
