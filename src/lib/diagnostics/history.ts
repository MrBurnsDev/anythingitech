/**
 * Local session history (browser-only adapter).
 *
 * Persists saved assessments to localStorage so a technician can keep a running
 * record per site and compare a fresh run against an earlier baseline (spec §19
 * before/after) — without a backend. When the Supabase layer lands, this same
 * interface can be backed by the server instead; the UI won't have to change.
 *
 * All functions are safe to call during prerender/SSR (no localStorage) — they
 * degrade to no-ops / empty results rather than throwing.
 */

import type { AssessmentResult } from "./types";

const STORAGE_KEY = "nnn.sessions.v1";
const MAX_SESSIONS = 50;

export interface StoredSession {
  id: string;
  savedAt: number;
  /** Technician-entered label, e.g. "Smith — living room, post-repair". */
  label: string;
  result: AssessmentResult;
}

function storage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Access can throw in privacy modes / sandboxed iframes.
    return null;
  }
}

function readAll(): StoredSession[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredSession[]) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: StoredSession[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    // Quota exceeded or blocked — drop silently; history is best-effort.
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
}

/** Newest first. */
export function listSessions(): StoredSession[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function getSession(id: string): StoredSession | undefined {
  return readAll().find((s) => s.id === id);
}

export function saveSession(result: AssessmentResult, label: string): StoredSession {
  const session: StoredSession = {
    id: newId(),
    savedAt: Date.now(),
    label: label.trim() || defaultLabel(result),
    result,
  };
  writeAll([session, ...readAll()]);
  return session;
}

export function deleteSession(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function clearSessions(): void {
  writeAll([]);
}

function defaultLabel(result: AssessmentResult): string {
  const d = new Date(result.completedAt);
  return `Session ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
