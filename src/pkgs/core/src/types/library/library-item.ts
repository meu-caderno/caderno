import type { Id } from "../primitives";

export interface LibraryItem {
  id: Id;

  title: string;
  cover?: string;
  synopsis?: string;

  progress?: number;
  stars?: number;
}
