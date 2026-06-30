import type { CapabilityManifest } from "./capabilities";
import type {
  Activity,
  AttendanceRecord,
  Context,
  Edge,
  LibraryItem,
  Mood,
  NotebookNode,
  OpLogEntry,
  Preferences,
  Profile,
  StudyMap,
  Subject,
} from "./model";
import type { Id, Timestamp } from "./values";

export enum EntityName {
  CONTEXT = "CONTEXT",
  SUBJECT = "SUBJECT",
  RECORD = "RECORD",
  ACTIVITY = "ACTIVITY",
  NODE = "NODE",
  EDGE = "EDGE",
  LIBRARY = "LIBRARY",
  MAP = "MAP",
  PROFILE = "PROFILE",
  MOOD = "MOOD",
}

export const ENTITY_COLLECTIONS = [
  "contexts",
  "subjects",
  "records",
  "activities",
  "library",
  "nodes",
  "edges",
  "maps",
] as const;

export type EntityCollection = (typeof ENTITY_COLLECTIONS)[number];

export interface Identified {
  id: Id;
}

export interface Repository<T extends Identified> {
  get(id: Id): Promise<T | undefined>;
  list(): Promise<T[]>;
  where(predicate: (entity: T) => boolean): Promise<T[]>;
  put(entity: T): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface GraphRepository {
  nodes: Repository<NotebookNode>;
  edges: Repository<Edge>;
  childrenOf(parentId: Id): Promise<NotebookNode[]>;
  edgesFrom(from: Id): Promise<Edge[]>;
  edgesTo(to: Id): Promise<Edge[]>;
}

export interface OpLogStore {
  append(entry: OpLogEntry): Promise<void>;
  appendMany(entries: readonly OpLogEntry[]): Promise<void>;
  since(timestamp: Timestamp): Promise<OpLogEntry[]>;
  forId(id: Id): Promise<OpLogEntry[]>;
}

export interface ContextTx {
  contexts: Repository<Context>;
  subjects: Repository<Subject>;
  records: Repository<AttendanceRecord>;
  activities: Repository<Activity>;
  library: Repository<LibraryItem>;
  maps: Repository<StudyMap>;
  graph: GraphRepository;
  oplog: OpLogStore;
}

export interface ContextStore extends ContextTx {
  transaction<R>(work: (tx: ContextTx) => Promise<R>): Promise<R>;
}

export interface ReadonlyRepository<T extends Identified> {
  get(id: Id): Promise<T | undefined>;
  list(): Promise<T[]>;
  where(predicate: (entity: T) => boolean): Promise<T[]>;
}

export interface ReadonlyGraphRepository {
  nodes: ReadonlyRepository<NotebookNode>;
  edges: ReadonlyRepository<Edge>;
  childrenOf(parentId: Id): Promise<NotebookNode[]>;
  edgesFrom(from: Id): Promise<Edge[]>;
  edgesTo(to: Id): Promise<Edge[]>;
}

export interface ReadonlyOpLog {
  since(timestamp: Timestamp): Promise<OpLogEntry[]>;
  forId(id: Id): Promise<OpLogEntry[]>;
}

export interface ReadonlyContextStore {
  contexts: ReadonlyRepository<Context>;
  subjects: ReadonlyRepository<Subject>;
  records: ReadonlyRepository<AttendanceRecord>;
  activities: ReadonlyRepository<Activity>;
  library: ReadonlyRepository<LibraryItem>;
  maps: ReadonlyRepository<StudyMap>;
  graph: ReadonlyGraphRepository;
  oplog: ReadonlyOpLog;
}

export interface ConfigStore {
  profiles: Repository<Profile>;
  moods: Repository<Mood>;
  preferences: Repository<Preferences>;
}

export interface StorageProvider {
  manifest: CapabilityManifest;
  createContextStore(): Promise<ContextStore>;
}

export interface BlobRow {
  id: string;
  data: string;
}

export interface BlobRepository {
  get(id: string): Promise<BlobRow | undefined>;
  list(): Promise<BlobRow[]>;
  put(row: BlobRow): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface BlobLog {
  append(data: string): Promise<void>;
  appendMany(entries: readonly string[]): Promise<void>;
  list(): Promise<string[]>;
}

export interface BlobTx {
  contexts: BlobRepository;
  subjects: BlobRepository;
  records: BlobRepository;
  activities: BlobRepository;
  library: BlobRepository;
  nodes: BlobRepository;
  edges: BlobRepository;
  maps: BlobRepository;
  oplog: BlobLog;
}

export interface BlobStore extends BlobTx {
  transaction<R>(work: (tx: BlobTx) => Promise<R>): Promise<R>;
}
