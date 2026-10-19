/**
 * Anonymous session persistence using sessionStorage.
 * Data is scoped to the browser tab and cleared when the tab closes.
 */

import type { DifficultyLevel } from './difficulty';

export interface SessionEntry {
  round: number;
  seed: number;
  difficulty: string;
  moves: number;
  timeMs: number;
  nextDifficulty: string;
  reason: string;
  ts: string;
}

const SESSION_KEY = 'memory_match_sessions';

export function loadSessions(): SessionEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(params: {
  seed: number;
  difficultyLevel: DifficultyLevel;
  difficultyName: string;
  moves: number;
  timeMs: number;
  nextDifficultyName: string;
  reason: string;
}): SessionEntry {
  const sessions = loadSessions();
  const entry: SessionEntry = {
    round: sessions.length + 1,
    seed: params.seed,
    difficulty: params.difficultyName,
    moves: params.moves,
    timeMs: params.timeMs,
    nextDifficulty: params.nextDifficultyName,
    reason: params.reason,
    ts: new Date().toISOString(),
  };
  sessions.push(entry);
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  } catch {
    // sessionStorage might be unavailable in some environments; fail silently.
  }
  return entry;
}

export function clearSessions(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
