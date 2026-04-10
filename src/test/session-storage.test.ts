import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  importSessionRecord,
  listSavedSessions,
  loadSavedSession,
  migrateLegacySessionsToElectron,
  saveSessionRecord,
} from "../lib/sessionStorage";
import type { SavedSessionMetadata, SessionObject } from "../types/pomo";

const createSession = (title: string): SessionObject => ({
  title,
  intervals: [{ name: "Foco", duration: 25, type: "pomo" }],
});

describe("sessionStorage repository", () => {
  beforeEach(() => {
    localStorage.clear();
    window.electron = {
      getSettings: vi.fn().mockResolvedValue({}),
      setSettings: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps browser fallback behavior when Electron session APIs are unavailable", async () => {
    const session = createSession("Sessao local");

    await saveSessionRecord(session);

    const saved = await listSavedSessions();
    const loaded = await loadSavedSession("Sessao local");

    expect(saved).toHaveLength(1);
    expect(saved[0]?.title).toBe("Sessao local");
    expect(loaded).toEqual(session);
  });

  it("uses Electron session APIs when available", async () => {
    const metadata: SavedSessionMetadata = {
      title: "Sessao electron",
      intervalCount: 1,
      totalDuration: 25,
      updatedAt: new Date().toISOString(),
    };
    const session = createSession("Sessao electron");
    const getSavedSessions = vi.fn().mockResolvedValue([metadata]);
    const getSavedSession = vi.fn().mockResolvedValue(session);
    const saveSavedSession = vi.fn().mockResolvedValue(undefined);

    window.electron = {
      ...window.electron,
      getSettings: vi.fn().mockResolvedValue({}),
      setSettings: vi.fn().mockResolvedValue(undefined),
      getSavedSessions,
      getSavedSession,
      saveSavedSession,
      deleteSavedSession: vi.fn().mockResolvedValue(undefined),
      replaceSavedSessions: vi.fn().mockResolvedValue(undefined),
    };

    await saveSessionRecord(session);
    const saved = await listSavedSessions();
    const loaded = await loadSavedSession("Sessao electron");

    expect(saveSavedSession).toHaveBeenCalled();
    expect(getSavedSessions).toHaveBeenCalled();
    expect(getSavedSession).toHaveBeenCalledWith("Sessao electron");
    expect(saved[0]?.title).toBe("Sessao electron");
    expect(loaded).toEqual(session);
  });

  it("migrates legacy sessions to Electron when Electron store is empty", async () => {
    const replaceSavedSessions = vi.fn().mockResolvedValue(undefined);

    localStorage.setItem(
      "savedPomoSessions",
      JSON.stringify([
        {
          title: "Migrar",
          intervalCount: 1,
          totalDuration: 25,
          updatedAt: new Date().toISOString(),
        },
      ])
    );
    localStorage.setItem("pomoSession:Migrar", JSON.stringify(createSession("Migrar")));

    window.electron = {
      ...window.electron,
      getSettings: vi.fn().mockResolvedValue({}),
      setSettings: vi.fn().mockResolvedValue(undefined),
      getSavedSessions: vi.fn().mockResolvedValue([]),
      getSavedSession: vi.fn().mockResolvedValue(null),
      saveSavedSession: vi.fn().mockResolvedValue(undefined),
      deleteSavedSession: vi.fn().mockResolvedValue(undefined),
      replaceSavedSessions,
    };

    const migrated = await migrateLegacySessionsToElectron();

    expect(migrated).toBe(true);
    expect(replaceSavedSessions).toHaveBeenCalledWith({
      index: expect.arrayContaining([
        expect.objectContaining({ title: "Migrar" }),
      ]),
      items: expect.objectContaining({
        Migrar: expect.objectContaining({ title: "Migrar" }),
      }),
    });
  });

  it("adds suffixes on import conflicts through the shared repository API", async () => {
    await saveSessionRecord(createSession("Duplicada"));
    const imported = await importSessionRecord(createSession("Duplicada"));

    expect(imported.title).toBe("Duplicada (2)");
  });
});
