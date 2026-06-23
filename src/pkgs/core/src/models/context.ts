/**
 * SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { DateIso, Id } from "./primitives";

export enum Goal {
  NONE = "NONE",
  FREE_STUDY = "FREE_STUDY",
  COURSE = "COURSE",
  PUBLIC_EXAM = "PUBLIC_EXAM",
  UNIVERISTY = "UNIVERSITY",
}

export enum Link {
  PERSONAL = "PERSONAL",
  CLASS = "CLASS",
  GROUP = "GRUOP"
}

export enum AbsenceStance {
  NONE = "NONE",
  PLAN_ABSENCES = "PLAN_ABSENCES",
  FOCUS_ON_NOT_MISSING = "FOCUS_ON_NOT_MISSING"
}

export interface Modules {
  attendance: boolean;
  grades: boolean;
  term: boolean;
  streak: boolean;
  syllabus: boolean;
  certificate: boolean;
  //
  hours: boolean;
}

export interface Vocabulary {
  attendance: string;
  subject: string;
  activity: string;
  term: string;
}

/**
 * @todo
 */
export interface BackendRef {
  backend?: string; // e.g. "local", "official-cloud", "self-host"
  hostId?: Id;
}

export interface Term {
  id: Id;

  label: string; // "2026.1"

  start?: DateIso;
  end?: DateIso;
}

export enum BucketUnit {
  CREDITS = "CREDITS",
  HOURS = "HOURS",
  EXTRACURRICULARS = "EXTRACURRICULARS"
}

export interface Bucket {
  id: Id;

  name: string;
  icon?: string;

  done: number;
  goal: number;

  unit?: BucketUnit | string;
}

export type Score = string;

export interface Context {
  id: Id;

  name: string;

  goal: Goal;
  modules: Modules;

  link: Link;

  absenceStance: AbsenceStance;

  minAverage?: Score;
  attendanceFloor?: number;

  vocabulary?: Vocabulary;

  terms?: Term[];
  buckets?: Bucket[];

  social?: BackendRef;
}
