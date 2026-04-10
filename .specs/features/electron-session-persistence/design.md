# Design Notes

## Strategy

Introduce a renderer-side session repository abstraction that can operate in two modes:

- Electron session store
- browser `localStorage` fallback

The renderer should always talk to this abstraction, never directly to Electron store or
`localStorage` from random components.

## Storage Model

Reuse the current logical structure:

- saved session metadata index
- full session payload by title

Recommended Electron store keys:

- `sessions.index`
- `sessions.items`

Possible structure:

- `sessions.index: SavedSessionMetadata[]`
- `sessions.items: Record<string, SessionObject>`

This avoids scattering one key per session in Electron store and makes migration simpler.

## Electron Bridge

Extend the preload API with explicit session methods such as:

- `getSessionsIndex()`
- `getSession(title)`
- `saveSession(session)`
- `deleteSession(title)`
- `migrateLegacySessions(payload)`

These methods should mirror the current renderer needs instead of exposing raw store
primitives.

## Migration Flow

Desktop startup flow:

1. renderer asks Electron for the current session index
2. renderer reads legacy browser sessions through the existing compatibility helper
3. if Electron store is empty and legacy browser data exists, migrate by copying all
   normalized sessions into Electron
4. keep legacy browser data untouched during the first pass
5. from then on, read sessions from Electron in desktop mode

This gives a safe copy-first migration and avoids destructive cleanup too early.

## Abstraction Boundary

Refactor `sessionStorage.ts` into:

- pure normalization and metadata helpers
- repository functions that select Electron or browser persistence depending on runtime

Possible shape:

- `listSavedSessions()`
- `loadSavedSession(title)`
- `saveSessionRecord(session)`
- `deleteSessionRecord(title)`
- `importSessionRecord(session)`
- `migrateLegacySessionsIfNeeded()`

## Risks

- migration can duplicate data if key comparison is not stable
- Electron and browser implementations can drift if helper logic is duplicated
- UI may briefly show empty state before async Electron reads resolve unless loading is
  handled deliberately

## Verification Approach

Automated:

- repository behavior in browser mode
- repository behavior in Electron mode with mocked bridge
- migration logic from legacy data

Manual:

- create legacy sessions in browser storage
- open Electron app
- confirm sessions appear
- restart Electron
- confirm sessions persist and are not duplicated
